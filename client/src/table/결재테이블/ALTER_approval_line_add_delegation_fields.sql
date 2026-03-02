-- =====================================================
-- ALTER TABLE: approval_line
-- 용도: 결재 위임 기능 지원을 위한 필드 추가
-- 설명: 실제 결재한 사람과 원래 결재자를 구분하기 위한 필드 추가
-- 최초등록: 2026-02-11 [박진영]
-- =====================================================

-- 1. 위임 관련 필드 추가
ALTER TABLE `approval_line`
ADD COLUMN `delegated_from_user_id` int(11) DEFAULT NULL COMMENT '원래 결재자 (위임된 경우)' AFTER `approver_id`,
ADD COLUMN `delegation_start_date` datetime DEFAULT NULL COMMENT '위임 시작일시' AFTER `delegated_from_user_id`,
ADD COLUMN `delegation_end_date` datetime DEFAULT NULL COMMENT '위임 종료일시' AFTER `delegation_start_date`,
ADD COLUMN `delegation_reason` text DEFAULT NULL COMMENT '위임 사유' AFTER `delegation_end_date`;

-- 2. 인덱스 추가
ALTER TABLE `approval_line`
ADD KEY `idx_delegated_from` (`delegated_from_user_id`) COMMENT '원래 결재자별 위임 결재 조회';

-- =====================================================
-- 사용 예시
-- =====================================================

-- 예시 1: 일반 결재 (위임 없음)
INSERT INTO `approval_line` 
  (`approval_document_id`, `step`, `approver_id`, `approval_status`, `company_id`, `created_by`) 
VALUES 
  (1, 1, 10, 'PENDING', 1, 5);

-- 예시 2: 위임된 결재
INSERT INTO `approval_line` 
  (`approval_document_id`, `step`, `approver_id`, `delegated_from_user_id`, `delegation_start_date`, `delegation_end_date`, `delegation_reason`, `approval_status`, `company_id`, `created_by`) 
VALUES 
  (1, 2, 15, 10, '2026-02-15 00:00:00', '2026-02-28 23:59:59', '휴가로 인한 위임', 'PENDING', 1, 5);
-- approver_id = 15 (대리로 결재하는 사람)
-- delegated_from_user_id = 10 (원래 결재자)

-- =====================================================
-- 위임 결재 조회 쿼리
-- =====================================================

-- 1. 위임된 결재선 조회
SELECT 
  al.*,
  u1.user_name AS actual_approver_name,
  u2.user_name AS original_approver_name,
  CASE 
    WHEN al.delegated_from_user_id IS NOT NULL THEN CONCAT(u2.user_name, ' → ', u1.user_name, ' (위임)')
    ELSE u1.user_name
  END AS approver_display_name
FROM approval_line al
LEFT JOIN user u1 ON al.approver_id = u1.user_id
LEFT JOIN user u2 ON al.delegated_from_user_id = u2.user_id
WHERE al.approval_document_id = 1
ORDER BY al.step ASC;

-- 2. 특정 사용자가 위임받은 결재 목록
SELECT 
  al.*,
  ad.document_no,
  ad.document_title,
  u.user_name AS original_approver_name
FROM approval_line al
INNER JOIN approval_document ad ON al.approval_document_id = ad.approval_document_id
LEFT JOIN user u ON al.delegated_from_user_id = u.user_id
WHERE al.approver_id = 15  -- 대리 결재자
  AND al.delegated_from_user_id IS NOT NULL
  AND al.approval_status = 'PENDING'
  AND al.is_active = 1
ORDER BY al.created_at DESC;

-- 3. 특정 사용자의 원래 결재가 위임된 목록
SELECT 
  al.*,
  ad.document_no,
  ad.document_title,
  u.user_name AS delegate_approver_name,
  al.delegation_reason
FROM approval_line al
INNER JOIN approval_document ad ON al.approval_document_id = ad.approval_document_id
LEFT JOIN user u ON al.approver_id = u.user_id
WHERE al.delegated_from_user_id = 10  -- 원래 결재자
  AND al.is_active = 1
ORDER BY al.created_at DESC;

-- =====================================================
-- 권장 사용 로직
-- =====================================================

/*
// 결재선 생성 시 위임 자동 반영
async function createApprovalLineWithDelegation(data) {
  // 1. 위임 설정 확인
  const delegation = await db.query(`
    SELECT 
      delegate_user_id,
      delegation_start_date,
      delegation_end_date,
      delegation_reason
    FROM approval_delegation
    WHERE delegator_user_id = ?
      AND company_id = ?
      AND is_active = 1
      AND delegation_start_date <= NOW()
      AND delegation_end_date >= NOW()
      AND (
        delegation_scope = 'ALL'
        OR (delegation_scope = 'SPECIFIC_MODULE' 
            AND JSON_CONTAINS(target_document_types, JSON_QUOTE(?)))
      )
    LIMIT 1
  `, [data.approver_id, data.company_id, data.document_type]);
  
  // 2. 위임이 있으면 대리 결재자로 설정
  if (delegation.length > 0) {
    const delegationInfo = delegation[0];
    return await db.query(`
      INSERT INTO approval_line
        (approval_document_id, step, approver_id, delegated_from_user_id,
         delegation_start_date, delegation_end_date, delegation_reason,
         approval_status, company_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `, [
      data.approval_document_id,
      data.step,
      delegationInfo.delegate_user_id,      // 대리 결재자
      data.approver_id,                      // 원래 결재자
      delegationInfo.delegation_start_date,
      delegationInfo.delegation_end_date,
      delegationInfo.delegation_reason,
      data.company_id,
      data.created_by
    ]);
  }
  
  // 3. 위임이 없으면 일반 결재선 생성
  return await db.query(`
    INSERT INTO approval_line
      (approval_document_id, step, approver_id, approval_status, company_id, created_by)
    VALUES (?, ?, ?, 'PENDING', ?, ?)
  `, [
    data.approval_document_id,
    data.step,
    data.approver_id,
    data.company_id,
    data.created_by
  ]);
}

// 결재 처리 시 위임 정보 표시
async function getApprovalLineWithDelegation(approvalLineId) {
  const result = await db.query(`
    SELECT 
      al.*,
      u1.user_name AS approver_name,
      u1.user_grade_name AS approver_grade,
      u2.user_name AS delegated_from_name,
      u2.user_grade_name AS delegated_from_grade,
      CASE 
        WHEN al.delegated_from_user_id IS NOT NULL 
        THEN CONCAT(u2.user_name, '(', u2.user_grade_name, ') → ', 
                    u1.user_name, '(', u1.user_grade_name, ') [위임]')
        ELSE CONCAT(u1.user_name, '(', u1.user_grade_name, ')')
      END AS display_name
    FROM approval_line al
    LEFT JOIN user u1 ON al.approver_id = u1.user_id
    LEFT JOIN user u2 ON al.delegated_from_user_id = u2.user_id
    WHERE al.approval_line_id = ?
  `, [approvalLineId]);
  
  return result[0];
}
*/

-- =====================================================
-- 롤백 스크립트 (필요 시)
-- =====================================================

/*
-- 위임 관련 필드 제거
ALTER TABLE `approval_line`
DROP COLUMN `delegated_from_user_id`,
DROP COLUMN `delegation_start_date`,
DROP COLUMN `delegation_end_date`,
DROP COLUMN `delegation_reason`,
DROP KEY `idx_delegated_from`;
*/
