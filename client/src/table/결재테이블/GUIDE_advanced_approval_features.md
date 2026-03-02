# 고급 결재 기능 사용 가이드

## 🎯 추가된 고급 기능

### 1. 결재 유형 (approval_type)
- **APPROVE**: 일반 결재 (필수, 승인되어야 다음 단계)
- **AGREE**: 합의 (의견 제시, 거부해도 진행 가능)
- **REFERENCE**: 참조 (알림만, 승인 불필요)

### 2. 병렬 결재 (Parallel Approval)
같은 단계의 여러 결재자가 동시에 결재

### 3. 결재 위임 (Delegation)
휴가, 출장 시 다른 사람에게 결재 권한 위임

### 4. 조건부 결재
금액, 우선순위 등 조건에 따라 결재선 변경

---

## 📌 기능별 사용법

### 1. 기본 순차 결재 (현재와 동일)

```javascript
// 1단계: 팀장
await createApprovalLine({
  approval_document_id: docId,
  step: 1,
  approver_id: teamLeaderId,
  approval_type: 'APPROVE',
  is_parallel: 0
});

// 2단계: 부서장
await createApprovalLine({
  approval_document_id: docId,
  step: 2,
  approver_id: deptManagerId,
  approval_type: 'APPROVE',
  is_parallel: 0
});

// 3단계: 이사
await createApprovalLine({
  approval_document_id: docId,
  step: 3,
  approver_id: directorId,
  approval_type: 'APPROVE',
  is_parallel: 0
});
```

**결재 흐름:**
```
요청자 → 팀장(승인) → 부서장(승인) → 이사(승인) → 완료
```

---

### 2. 병렬 결재 (같은 단계, 여러 명 동시 결재)

```javascript
// 2단계에 3명의 수석이 병렬로 결재 (전원 승인 필요)
const parallelGroupId = `parallel_${docId}_step2`;

await createApprovalLine({
  approval_document_id: docId,
  step: 2,
  approver_id: seniorEngineer1,
  approval_type: 'APPROVE',
  is_parallel: 1,
  parallel_group_id: parallelGroupId,
  parallel_approval_rule: 'ALL',  // 전원 승인
  sort_order: 1
});

await createApprovalLine({
  approval_document_id: docId,
  step: 2,
  approver_id: seniorEngineer2,
  approval_type: 'APPROVE',
  is_parallel: 1,
  parallel_group_id: parallelGroupId,
  parallel_approval_rule: 'ALL',
  sort_order: 2
});

await createApprovalLine({
  approval_document_id: docId,
  step: 2,
  approver_id: seniorEngineer3,
  approval_type: 'APPROVE',
  is_parallel: 1,
  parallel_group_id: parallelGroupId,
  parallel_approval_rule: 'ALL',
  sort_order: 3
});
```

**결재 흐름:**
```
요청자 → 팀장 → [수석1, 수석2, 수석3 동시 결재] → 이사 → 완료
                  └─ 3명 모두 승인해야 다음 단계
```

**병렬 결재 규칙:**
- `ALL`: 전원 승인 필요 (기본값)
- `ANY`: 1명만 승인하면 통과
- `MAJORITY`: 과반수 승인 (3명 중 2명)

**로직 예시:**
```javascript
async function checkParallelApprovalComplete(parallelGroupId) {
  const lines = await db.query(`
    SELECT * FROM approval_line 
    WHERE parallel_group_id = ? AND is_active = 1
  `, [parallelGroupId]);
  
  const approved = lines.filter(l => l.approval_status === 'APPROVED').length;
  const total = lines.length;
  const rule = lines[0].parallel_approval_rule;
  
  if (rule === 'ALL') {
    return approved === total;
  } else if (rule === 'ANY') {
    return approved >= 1;
  } else if (rule === 'MAJORITY') {
    return approved > total / 2;
  }
}
```

---

### 3. 합의/참조 결재

```javascript
// 1단계: 팀장 (필수 결재)
await createApprovalLine({
  step: 1,
  approver_id: teamLeaderId,
  approval_type: 'APPROVE'
});

// 2단계: 기술팀장 (합의 - 의견만, 거부해도 진행)
await createApprovalLine({
  step: 2,
  approver_id: techLeaderId,
  approval_type: 'AGREE'
});

// 3단계: 품질팀장 (참조 - 알림만, 승인 불필요)
await createApprovalLine({
  step: 3,
  approver_id: qcLeaderId,
  approval_type: 'REFERENCE'
});

// 4단계: 이사 (최종 결재)
await createApprovalLine({
  step: 4,
  approver_id: directorId,
  approval_type: 'APPROVE'
});
```

**로직:**
```javascript
async function processApproval(lineId, status) {
  const line = await getApprovalLine(lineId);
  
  if (line.approval_type === 'APPROVE') {
    // 필수 결재 - 승인되어야 다음 단계
    if (status === 'APPROVED') {
      await moveToNextStep(line.approval_document_id);
    } else if (status === 'REJECTED') {
      await rejectDocument(line.approval_document_id);
    }
  } else if (line.approval_type === 'AGREE') {
    // 합의 - 의견만 남기고 자동 진행
    await updateApprovalLine(lineId, { approval_status: status });
    await moveToNextStep(line.approval_document_id); // 반려해도 진행
  } else if (line.approval_type === 'REFERENCE') {
    // 참조 - 읽음 처리만
    await updateApprovalLine(lineId, { approval_status: 'APPROVED' });
    await moveToNextStep(line.approval_document_id);
  }
}
```

---

### 4. 결재 위임

```javascript
// 팀장이 휴가로 인해 대리팀장에게 위임
await delegateApproval({
  original_approver_id: teamLeaderId,
  delegate_to_user_id: deputyLeaderId,
  delegation_start_date: '2026-02-15 00:00:00',
  delegation_end_date: '2026-02-20 23:59:59',
  delegation_reason: '휴가로 인한 위임'
});

// 결재선 생성 시 위임 정보 자동 반영
async function createApprovalLineWithDelegation(data) {
  // 위임 확인
  const delegation = await checkDelegation(data.approver_id);
  
  if (delegation) {
    return await createApprovalLine({
      ...data,
      approver_id: delegation.delegate_to_user_id,  // 대리 결재자
      delegated_from_user_id: data.approver_id,     // 원래 결재자
      delegation_start_date: delegation.start_date,
      delegation_end_date: delegation.end_date,
      delegation_reason: delegation.reason
    });
  } else {
    return await createApprovalLine(data);
  }
}
```

**위임 테이블 (선택사항):**
```sql
CREATE TABLE approval_delegation (
  delegation_id INT AUTO_INCREMENT PRIMARY KEY,
  delegator_user_id INT NOT NULL COMMENT '위임자',
  delegate_user_id INT NOT NULL COMMENT '피위임자',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  reason TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='결재 위임 설정';
```

---

### 5. 조건부 결재

```javascript
// 금액별 결재선 변경
async function createConditionalApprovalLine(documentId, amount) {
  if (amount < 1000000) {
    // 100만원 미만: 팀장까지
    await createApprovalLine({
      step: 1, approver_id: teamLeaderId,
      condition_type: 'AMOUNT',
      condition_value: JSON.stringify({ min: 0, max: 1000000 })
    });
  } else if (amount < 10000000) {
    // 1000만원 미만: 팀장 → 부서장
    await createApprovalLine({ step: 1, approver_id: teamLeaderId });
    await createApprovalLine({
      step: 2, approver_id: deptManagerId,
      condition_type: 'AMOUNT',
      condition_value: JSON.stringify({ min: 1000000, max: 10000000 })
    });
  } else {
    // 1000만원 이상: 팀장 → 부서장 → 이사
    await createApprovalLine({ step: 1, approver_id: teamLeaderId });
    await createApprovalLine({ step: 2, approver_id: deptManagerId });
    await createApprovalLine({
      step: 3, approver_id: directorId,
      condition_type: 'AMOUNT',
      condition_value: JSON.stringify({ min: 10000000 })
    });
  }
}
```

---

## 🔄 복합 시나리오 예시

### 시나리오: 긴급 CT 결재 (병렬 + 합의 + 참조)

```javascript
// 1단계: 작성자의 팀장 (필수)
await createApprovalLine({
  step: 1,
  approver_id: authorTeamLeaderId,
  approval_type: 'APPROVE'
});

// 2단계: 3명의 수석이 병렬 결재 (2명 이상 승인)
const parallelGroupId = `parallel_${docId}_step2`;
for (const seniorId of [senior1, senior2, senior3]) {
  await createApprovalLine({
    step: 2,
    approver_id: seniorId,
    approval_type: 'APPROVE',
    is_parallel: 1,
    parallel_group_id: parallelGroupId,
    parallel_approval_rule: 'MAJORITY'
  });
}

// 3단계: 품질팀장 (합의)
await createApprovalLine({
  step: 3,
  approver_id: qcLeaderId,
  approval_type: 'AGREE'
});

// 4단계: 안전팀 (참조)
await createApprovalLine({
  step: 4,
  approver_id: safetyTeamId,
  approval_type: 'REFERENCE'
});

// 5단계: 이사 (최종 결재)
await createApprovalLine({
  step: 5,
  approver_id: directorId,
  approval_type: 'APPROVE'
});
```

**결재 흐름:**
```
요청자 
  → 팀장 승인 (APPROVE)
  → [수석1, 수석2, 수석3 병렬] 중 2명 승인 (MAJORITY)
  → 품질팀장 의견 (AGREE, 반려해도 진행)
  → 안전팀 참조 (REFERENCE, 자동 통과)
  → 이사 최종 승인 (APPROVE)
  → 완료
```

---

## 📊 쿼리 예시

### 내 결재 대기 문서 조회
```sql
SELECT 
  d.approval_document_id,
  d.document_title,
  d.document_type,
  l.step,
  l.approval_type,
  l.is_parallel,
  CASE 
    WHEN l.delegated_from_user_id IS NOT NULL 
    THEN CONCAT(u2.user_name, '님으로부터 위임받음')
    ELSE NULL 
  END as delegation_info
FROM approval_document d
JOIN approval_line l ON d.approval_document_id = l.approval_document_id
LEFT JOIN user u2 ON l.delegated_from_user_id = u2.user_id
WHERE l.approver_id = ?  -- 내 user_id
  AND l.approval_status = 'PENDING'
  AND d.approval_status = 'PENDING'
  AND d.current_step = l.step
ORDER BY d.request_date DESC;
```

### 병렬 결재 진행 상황 조회
```sql
SELECT 
  parallel_group_id,
  parallel_approval_rule,
  COUNT(*) as total_approvers,
  SUM(CASE WHEN approval_status = 'APPROVED' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN approval_status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN approval_status = 'PENDING' THEN 1 ELSE 0 END) as pending_count
FROM approval_line
WHERE approval_document_id = ?
  AND is_parallel = 1
GROUP BY parallel_group_id, parallel_approval_rule;
```

---

## 🎨 UI 표현 예시

```javascript
// 결재선 표시
function renderApprovalLine(lines) {
  const groupedByStep = groupBy(lines, 'step');
  
  return Object.entries(groupedByStep).map(([step, stepLines]) => {
    const isParallel = stepLines[0].is_parallel;
    
    if (isParallel) {
      // 병렬 표시
      return (
        <div className="approval-step parallel">
          <div className="step-number">{step}단계 (병렬)</div>
          <div className="parallel-approvers">
            {stepLines.map(line => (
              <ApproverCard 
                key={line.approval_line_id}
                approver={line.approver}
                status={line.approval_status}
                type={line.approval_type}
              />
            ))}
          </div>
          <div className="parallel-rule">
            {getRuleText(stepLines[0].parallel_approval_rule)}
          </div>
        </div>
      );
    } else {
      // 순차 표시
      return stepLines.map(line => (
        <div className="approval-step sequential">
          <div className="step-number">{step}단계</div>
          <ApproverCard 
            approver={line.approver}
            status={line.approval_status}
            type={line.approval_type}
            delegation={line.delegated_from_user}
          />
        </div>
      ));
    }
  });
}
```

---

## 마이그레이션

```sql
-- 기존 approval_line 테이블에 컬럼 추가
ALTER TABLE approval_line
  ADD COLUMN `approval_type` varchar(20) DEFAULT 'APPROVE' AFTER `approver_id`,
  ADD COLUMN `is_parallel` tinyint(1) DEFAULT 0 AFTER `approval_type`,
  ADD COLUMN `parallel_group_id` varchar(50) DEFAULT NULL AFTER `is_parallel`,
  ADD COLUMN `parallel_approval_rule` varchar(20) DEFAULT 'ALL' AFTER `parallel_group_id`,
  ADD COLUMN `delegated_from_user_id` int(11) DEFAULT NULL AFTER `parallel_approval_rule`,
  ADD COLUMN `delegation_start_date` datetime DEFAULT NULL AFTER `delegated_from_user_id`,
  ADD COLUMN `delegation_end_date` datetime DEFAULT NULL AFTER `delegation_start_date`,
  ADD COLUMN `delegation_reason` text DEFAULT NULL AFTER `delegation_end_date`,
  ADD COLUMN `condition_type` varchar(20) DEFAULT NULL AFTER `delegation_reason`,
  ADD COLUMN `condition_value` varchar(100) DEFAULT NULL AFTER `condition_type`;

-- 인덱스 추가
ALTER TABLE approval_line
  ADD KEY `idx_parallel_group` (`parallel_group_id`),
  ADD KEY `idx_delegated_from` (`delegated_from_user_id`),
  ADD KEY `idx_approval_type` (`approval_type`);
```
