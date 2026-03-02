# approval_history 테이블 개선 가이드

## 문제점 및 개선 방안

### 문제 1: previous_status가 NULL 허용

**현재 문제:**
```sql
`previous_status` varchar(20) DEFAULT NULL
```
- 최초 REQUEST 시에도 `previous_status`가 NULL이면 추적이 어려움
- "이전 상태가 무엇이었는지" 명확하지 않음

**개선 방안:**
```sql
`previous_status` varchar(20) NOT NULL DEFAULT 'NONE' COMMENT '이전 상태'
```

**사용 예시:**
```javascript
// 최초 요청 시
{
  action_type: 'REQUEST',
  previous_status: 'NONE',
  new_status: 'PENDING'
}

// 승인 시
{
  action_type: 'APPROVED',
  previous_status: 'PENDING',
  new_status: 'APPROVED'
}

// 반려 시
{
  action_type: 'REJECTED',
  previous_status: 'PENDING',
  new_status: 'REJECTED'
}
```

### 문제 2: actor_role_id의 시점 문제

**현재 문제:**
```sql
`actor_role_id` int(11) DEFAULT NULL COMMENT '행동 수행자 역할 pk'
```
- 사용자가 "대리"에서 결재 → 나중에 "과장"으로 승진
- 이력에는 role_id만 저장 → 나중에 조회하면 "과장이 결재"로 보임
- 실제는 "대리 시절에 결재"했는데 추적 불가

**개선 방안 A: 역할명 스냅샷 저장** (추천)
```sql
`actor_user_grade_id` int(11) DEFAULT NULL COMMENT '행동 수행 시점의 직급 pk',
`actor_user_grade_name` varchar(50) DEFAULT NULL COMMENT '행동 수행 시점의 직급명 (스냅샷)',
`actor_department_id` int(11) DEFAULT NULL COMMENT '행동 수행 시점의 부서 pk',
`actor_department_name` varchar(100) DEFAULT NULL COMMENT '행동 수행 시점의 부서명 (스냅샷)'
```

**사용 예시:**
```javascript
// 결재 시점의 정보를 스냅샷으로 저장
const actor = await getUser(actorId);
await insertHistory({
  actor_id: actorId,
  actor_user_grade_id: actor.user_grade_id,
  actor_user_grade_name: actor.user_grade_name,  // "대리"
  actor_department_id: actor.department_id,
  actor_department_name: actor.department_name,  // "연구개발팀"
  // ... 나중에 승진해도 이력은 "대리"로 남음
});
```

**개선 방안 B: JSON 필드 활용**
```sql
`actor_snapshot` JSON DEFAULT NULL COMMENT '행동 수행 시점의 사용자 정보 스냅샷'
```

```javascript
actor_snapshot: {
  user_id: 123,
  user_name: "홍길동",
  user_grade: "대리",
  department: "연구개발팀",
  position: "연구원",
  email: "hong@example.com"
}
```

### 문제 3: action_type vs new_status 중복

**현재:**
- `action_type`: 'APPROVED'
- `new_status`: 'APPROVED'
- → 거의 동일한 정보

**개선 방안:** 명확한 구분
- `action_type`: 행동의 종류 (APPROVE_REQUEST, REJECT_REQUEST, CANCEL_REQUEST, REASSIGN)
- `new_status`: 결과 상태 (PENDING, APPROVED, REJECTED, CANCELED)

```sql
COMMENT '행동 유형 (APPROVE_REQUEST: 승인처리, REJECT_REQUEST: 반려처리, CANCEL_REQUEST: 취소, REASSIGN: 재배정, DELEGATE: 위임)'
```

## 개선된 테이블 정의

```sql
CREATE TABLE `approval_history` (
  `approval_history_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `approval_document_id` int(11) NULL COMMENT '결재 문서 pk(외래키)',
  `approval_line_id` int(11) NULL COMMENT '결재선 pk(외래키)',
  `step` int(11) DEFAULT NULL COMMENT '결재 단계',
  
  -- 액션 정보
  `action_type` varchar(20) NOT NULL COMMENT '행동 유형 (REQUEST, APPROVE_REQUEST, REJECT_REQUEST, CANCEL_REQUEST, REASSIGN, DELEGATE)',
  `previous_status` varchar(20) NOT NULL DEFAULT 'NONE' COMMENT '이전 상태',
  `new_status` varchar(20) NOT NULL COMMENT '새 상태',
  
  -- 행동 수행자 정보 (스냅샷)
  `actor_id` int(11) NULL COMMENT '행동 수행자 pk',
  `actor_name` varchar(100) DEFAULT NULL COMMENT '행동 수행자명 (스냅샷)',
  `actor_user_grade_id` int(11) DEFAULT NULL COMMENT '행동 수행 시점의 직급 pk',
  `actor_user_grade_name` varchar(50) DEFAULT NULL COMMENT '행동 수행 시점의 직급명',
  `actor_department_id` int(11) DEFAULT NULL COMMENT '행동 수행 시점의 부서 pk',
  `actor_department_name` varchar(100) DEFAULT NULL COMMENT '행동 수행 시점의 부서명',
  
  -- 위임/대리 정보
  `delegated_from_user_id` int(11) DEFAULT NULL COMMENT '위임자 pk (대리 결재인 경우)',
  `delegated_from_user_name` varchar(100) DEFAULT NULL COMMENT '위임자명',
  
  `action_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT '행동 수행 일시',
  `comment` text DEFAULT NULL COMMENT '의견/사유',
  
  -- 보안 추적
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP 주소',
  `user_agent` varchar(255) DEFAULT NULL COMMENT 'User Agent',
  
  -- 공통 필드
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  
  PRIMARY KEY (`approval_history_id`),
  KEY `idx_company_active_sort` (`company_id`,`is_active`,`sort_order`),
  KEY `idx_approval_document_id` (`approval_document_id`),
  KEY `idx_approval_line_id` (`approval_line_id`),
  KEY `idx_actor_id` (`actor_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_action_date` (`action_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='결재 이력 테이블 - 시점 스냅샷 포함';
```

## 사용 예시

### 이력 생성 시 스냅샷 함수
```javascript
async function createApprovalHistory(data) {
  // 행동 수행자 정보 조회
  const actor = await db.query(`
    SELECT 
      u.user_id, u.user_name,
      ug.user_grade_id, ug.grade_name,
      d.department_id, d.department_name
    FROM user u
    LEFT JOIN user_grade ug ON u.user_grade_id = ug.user_grade_id
    LEFT JOIN department d ON u.department_id = d.department_id
    WHERE u.user_id = ?
  `, [data.actor_id]);
  
  // 스냅샷과 함께 이력 저장
  return await db.query(`
    INSERT INTO approval_history (
      approval_document_id, approval_line_id, step,
      action_type, previous_status, new_status,
      actor_id, actor_name, 
      actor_user_grade_id, actor_user_grade_name,
      actor_department_id, actor_department_name,
      comment, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.approval_document_id,
    data.approval_line_id,
    data.step,
    data.action_type,
    data.previous_status,
    data.new_status,
    actor.user_id,
    actor.user_name,           // 스냅샷
    actor.user_grade_id,
    actor.grade_name,          // 스냅샷
    actor.department_id,
    actor.department_name,     // 스냅샷
    data.comment,
    data.ip_address,
    data.user_agent
  ]);
}
```

### 이력 조회 (변경 전후 비교)
```sql
SELECT 
  h.action_date,
  h.actor_name,
  h.actor_user_grade_name,  -- 당시 직급
  h.actor_department_name,  -- 당시 부서
  h.action_type,
  CONCAT(h.previous_status, ' → ', h.new_status) as status_change,
  h.comment
FROM approval_history h
WHERE h.approval_document_id = ?
ORDER BY h.action_date ASC;
```

## 마이그레이션 스크립트

```sql
-- 기존 테이블에 컬럼 추가
ALTER TABLE approval_history
  ADD COLUMN `actor_name` varchar(100) DEFAULT NULL AFTER `actor_id`,
  ADD COLUMN `actor_user_grade_name` varchar(50) DEFAULT NULL AFTER `actor_user_grade_id`,
  ADD COLUMN `actor_department_id` int(11) DEFAULT NULL,
  ADD COLUMN `actor_department_name` varchar(100) DEFAULT NULL,
  ADD COLUMN `delegated_from_user_id` int(11) DEFAULT NULL,
  ADD COLUMN `delegated_from_user_name` varchar(100) DEFAULT NULL,
  MODIFY COLUMN `previous_status` varchar(20) NOT NULL DEFAULT 'NONE';

-- 기존 데이터 업데이트 (actor_name 채우기)
UPDATE approval_history h
JOIN user u ON h.actor_id = u.user_id
SET h.actor_name = u.user_name
WHERE h.actor_name IS NULL;
```
