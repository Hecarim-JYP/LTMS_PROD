-- =====================================================
-- 테이블명: approval_delegation
-- 용도: 결재 위임 설정 테이블
-- 설명: 결재자가 휴가, 출장 등의 사유로 다른 사용자에게 결재 권한을 위임
-- 최초등록: 2026-02-11 [박진영]
-- =====================================================

CREATE TABLE `approval_delegation` (
  `approval_delegation_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 ID',
  `delegator_user_id` int(11) NOT NULL COMMENT '위임자 (원래 결재자)',
  `delegate_user_id` int(11) NOT NULL COMMENT '피위임자 (대신 결재할 사람)',
  `delegation_start_date` datetime NOT NULL COMMENT '위임 시작일시',
  `delegation_end_date` datetime NOT NULL COMMENT '위임 종료일시',
  `delegation_scope` varchar(20) DEFAULT 'ALL' COMMENT '위임 범위 (ALL: 전체, SPECIFIC_MODULE: 특정 모듈만)',
  `target_module_codes` text DEFAULT NULL COMMENT '특정 모듈만 위임 시 모듈 코드 (JSON 배열 형식, 예: ["CT","INTERNAL"])',
  `target_document_types` text DEFAULT NULL COMMENT '특정 문서 유형만 위임 시 문서 유형 코드 (JSON 배열 형식, 예: ["CT_REQ","CT_TEST"])',
  `delegation_reason` text DEFAULT NULL COMMENT '위임 사유 (예: 휴가, 출장, 병가 등)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`approval_delegation_id`),
  KEY `idx_delegator_active` (`delegator_user_id`, `is_active`) COMMENT '위임자별 활성 위임 조회',
  KEY `idx_delegate_active` (`delegate_user_id`, `is_active`) COMMENT '피위임자별 활성 위임 조회',
  KEY `idx_date_range` (`delegation_start_date`, `delegation_end_date`) COMMENT '기간별 조회',
  KEY `idx_company_delegator` (`company_id`, `delegator_user_id`, `delegation_start_date`, `delegation_end_date`) COMMENT '회사별 위임자 기간 조회'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='결재 위임 설정 테이블';

-- =====================================================
-- 샘플 데이터
-- =====================================================

-- 예시 1: 팀장이 2주간 휴가로 전체 결재 위임
INSERT INTO `approval_delegation` 
  (`company_id`, `delegator_user_id`, `delegate_user_id`, `delegation_start_date`, `delegation_end_date`, `delegation_scope`, `delegation_reason`, `created_by`) 
VALUES 
  (1, 10, 15, '2026-02-15 00:00:00', '2026-02-28 23:59:59', 'ALL', '휴가로 인한 결재 위임', 10);

-- 예시 2: 부서장이 출장 기간 동안 CT 모듈만 위임
INSERT INTO `approval_delegation` 
  (`company_id`, `delegator_user_id`, `delegate_user_id`, `delegation_start_date`, `delegation_end_date`, `delegation_scope`, `target_module_codes`, `delegation_reason`, `created_by`) 
VALUES 
  (1, 20, 22, '2026-03-01 00:00:00', '2026-03-07 23:59:59', 'SPECIFIC_MODULE', '["CT"]', '해외 출장으로 인한 CT 결재 위임', 20);

-- 예시 3: 이사가 병가 기간 동안 CT 의뢰 문서만 위임
INSERT INTO `approval_delegation` 
  (`company_id`, `delegator_user_id`, `delegate_user_id`, `delegation_start_date`, `delegation_end_date`, `delegation_scope`, `target_document_types`, `delegation_reason`, `created_by`) 
VALUES 
  (1, 30, 32, '2026-03-10 00:00:00', '2026-03-15 23:59:59', 'SPECIFIC_MODULE', '["CT_REQ"]', '병가로 인한 긴급 결재만 위임', 30);

-- =====================================================
-- 위임 확인 쿼리 예시
-- =====================================================

-- 1. 특정 사용자의 현재 활성 위임 조회
SELECT * FROM approval_delegation
WHERE delegator_user_id = 10
  AND is_active = 1
  AND delegation_start_date <= NOW()
  AND delegation_end_date >= NOW();

-- 2. 특정 모듈에 대한 위임 확인
SELECT * FROM approval_delegation
WHERE delegator_user_id = 10
  AND is_active = 1
  AND delegation_start_date <= NOW()
  AND delegation_end_date >= NOW()
  AND (
    delegation_scope = 'ALL'
    OR (delegation_scope = 'SPECIFIC_MODULE' AND JSON_CONTAINS(target_module_codes, '"CT"'))
  );

-- 3. 기간 만료된 위임 비활성화 (배치 작업용)
UPDATE approval_delegation
SET is_active = 0,
    updated_at = NOW(),
    updated_by = 0
WHERE delegation_end_date < NOW()
  AND is_active = 1;

-- =====================================================
-- 권장 사용 로직 (애플리케이션 레벨)
-- =====================================================

/*
// 결재선 생성 시 위임 확인 함수
async function getActualApprover(originalApproverId, documentType, companyId) {
  const query = `
    SELECT 
      delegate_user_id,
      delegation_reason,
      delegation_start_date,
      delegation_end_date
    FROM approval_delegation
    WHERE company_id = ?
      AND delegator_user_id = ?
      AND is_active = 1
      AND delegation_start_date <= NOW()
      AND delegation_end_date >= NOW()
      AND (
        delegation_scope = 'ALL'
        OR (delegation_scope = 'SPECIFIC_MODULE' 
            AND (
              JSON_CONTAINS(target_module_codes, JSON_QUOTE(?))
              OR JSON_CONTAINS(target_document_types, JSON_QUOTE(?))
            )
        )
      )
    LIMIT 1
  `;
  
  const result = await db.query(query, [
    companyId, 
    originalApproverId, 
    extractModuleCode(documentType),  // 예: "CT"
    documentType                       // 예: "CT_REQ"
  ]);
  
  if (result.length > 0) {
    return {
      actualApproverId: result[0].delegate_user_id,
      isDelegated: true,
      delegatedFrom: originalApproverId,
      delegationReason: result[0].delegation_reason,
      delegationPeriod: {
        start: result[0].delegation_start_date,
        end: result[0].delegation_end_date
      }
    };
  }
  
  return {
    actualApproverId: originalApproverId,
    isDelegated: false
  };
}

// 위임 설정 함수
async function createDelegation(data) {
  // 기존 활성 위임이 있는지 확인
  const existing = await db.query(`
    SELECT delegation_id 
    FROM approval_delegation
    WHERE delegator_user_id = ?
      AND is_active = 1
      AND delegation_start_date <= ?
      AND delegation_end_date >= ?
  `, [data.delegator_user_id, data.delegation_end_date, data.delegation_start_date]);
  
  if (existing.length > 0) {
    throw new Error('해당 기간에 이미 위임이 설정되어 있습니다.');
  }
  
  // 새 위임 생성
  return await db.query(`
    INSERT INTO approval_delegation
      (company_id, delegator_user_id, delegate_user_id, 
       delegation_start_date, delegation_end_date, delegation_scope,
       target_module_codes, target_document_types, delegation_reason, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.company_id,
    data.delegator_user_id,
    data.delegate_user_id,
    data.delegation_start_date,
    data.delegation_end_date,
    data.delegation_scope || 'ALL',
    JSON.stringify(data.target_module_codes || []),
    JSON.stringify(data.target_document_types || []),
    data.delegation_reason,
    data.created_by
  ]);
}

// 배치 작업: 만료된 위임 자동 비활성화
async function deactivateExpiredDelegations() {
  return await db.query(`
    UPDATE approval_delegation
    SET is_active = 0,
        updated_at = NOW(),
        updated_by = 0
    WHERE delegation_end_date < NOW()
      AND is_active = 1
  `);
}
*/
