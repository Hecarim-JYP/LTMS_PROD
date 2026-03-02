# 결재 테이블 구조 개선 완료 보고서

## 📅 작업 일자: 2026년 2월 11일

## ✅ 적용된 개선 사항

### 1. approval_document.sql 개선
- ❌ **제거**: `approval_step` 컬럼 제거
  - 이유: `approval_line` 테이블에서 `MAX(step)`으로 동적 계산 가능, 데이터 중복 방지
  
- ❌ **제거**: `approval_comment`, `reject_reason` 컬럼 제거
  - 이유: 각 단계별 의견은 `approval_line.approval_comment`, 상세 이력은 `approval_history.comment`에서 조회 가능
  - 데이터 일관성 향상

### 2. approval_line_template.sql 개선
- ❌ **제거**: `approver_id` 컬럼 제거
  - 이유: 템플릿은 직급 기반(`user_grade_id`)으로 관리, 특정인 지정은 문서 생성 시 `approval_line`에서 처리
  - 템플릿의 재사용성 및 유연성 향상

### 3. approval_line.sql 고급 기능 추가 ⭐
- ✅ **추가**: `approval_type` - 결재/합의/참조 구분
- ✅ **추가**: `is_parallel` - 병렬 결재 지원
- ✅ **추가**: `parallel_group_id` - 병렬 그룹 관리
- ✅ **추가**: `parallel_approval_rule` - 병렬 결재 규칙 (ALL/ANY/MAJORITY)
- ✅ **추가**: `delegated_from_user_id` - 결재 위임 기능
- ✅ **추가**: `delegation_start_date`, `delegation_end_date`, `delegation_reason` - 위임 정보
- ✅ **추가**: `condition_type`, `condition_value` - 조건부 결재
- ✅ **추가**: 복합 인덱스 5개 추가 (성능 최적화)

**지원 기능:**
- 🔄 병렬 결재 (같은 단계 여러 명 동시 결재)
- 🤝 합의/참조 결재 (의견만 제시, 거부해도 진행)
- 👥 결재 위임 (휴가/출장 시 대리 결재)
- 🎯 조건부 결재 (금액/우선순위별 결재선 변경)

### 4. approval_history.sql 개선
- ✅ **변경**: `previous_status` NOT NULL DEFAULT 'NONE' (추적 명확화)
- ✅ **변경**: `action_type` COMMENT 개선 (행동 유형 명확화)
- ✅ **추가**: `actor_name` - 행동 수행자명 스냅샷
- ✅ **추가**: `actor_user_grade_id`, `actor_user_grade_name` - 시점 직급 스냅샷
- ✅ **추가**: `actor_department_id`, `actor_department_name` - 시점 부서 스냅샷
- ✅ **추가**: `delegated_from_user_id`, `delegated_from_user_name` - 위임 정보
- ❌ **제거**: `actor_role_id` (시점 문제 해결)

**개선 효과:**
- 승진/부서 이동 후에도 결재 당시 직급/부서 정보 보존
- 이력 조회 시 외부 조인 없이 당시 정보 확인 가능

### 5. approval_notification.sql 신규 생성 ⭐
- 📧 결재 알림 테이블 생성
- 지원 기능:
  - 결재 요청/승인/반려/취소 알림
  - 읽음/안읽음 상태 관리
  - 이메일/푸시 발송 이력 관리
  - 우선순위 설정
  - 액션 URL (직접 이동)
  - 만료일자 (자동 삭제)

### 6. INSERT_approval_template_sample.sql 수정
- 🔧 모든 INSERT 구문에서 `approver_id` 제거 (9개 템플릿 모두 수정)

---

## 📚 생성된 가이드 문서

### 1. GUIDE_approval_notification_usage.md
- 알림 발생 시점 및 로직
- 알림 읽음 처리
- 이메일/푸시 발송 로직
- 알림 자동 삭제 배치 작업
- 사용자 알림 설정 테이블

### 2. GUIDE_approval_history_improvements.md
- approval_history 개선 사항 상세 설명
- previous_status 개선
- actor 스냅샷 기능
- action_type vs new_status 구분
- 사용 예시 및 쿼리

### 3. GUIDE_advanced_approval_features.md ⭐⭐⭐
- 고급 결재 기능 전체 가이드
- **순차 결재** 사용법
- **병렬 결재** 사용법 (ALL/ANY/MAJORITY)
- **합의/참조 결재** 사용법
- **결재 위임** 사용법
- **조건부 결재** 사용법 (금액별)
- 복합 시나리오 예시
- 쿼리 예시 및 UI 표현 가이드
- 마이그레이션 스크립트

---

## 🔍 보류/추가 검토 사항

### 1. 외래키 제약조건
- **현재 상태**: 미적용 (COMMENT로만 표시)
- **이유**: 유연한 결합 유지를 위해 의도적으로 제외
- **권장**: 현재 정책 유지

### 2. Soft Delete 정책
- **현재 상태**: `is_active` + `deleted_at` 혼용
- **이유**: 의도적 구분 (임시 비활성화 vs 영구 삭제)
- **권장**: 현재 정책 유지

### 3. 문서 유형 관리
- **현재 상태**: VARCHAR로 하드코딩
- **개선 방안**:
  - 옵션 A: 현재 방식 유지 + 애플리케이션 레벨 상수 관리
  - 옵션 B: `approval_document_type` 마스터 테이블 생성 (확장성 향상)
- **권장**: 문서 유형이 자주 추가되면 옵션 B, 고정이면 옵션 A

### 4. 복합 인덱스 추가
- **보류**: 사용자 요청에 따라 보류
- **필요 시 추가 가능**

### 5. approval_document에 IP/User Agent 추가
- **권장**: 불필요 (approval_history에 이미 있음)
- **선택사항**: 문서 최초 요청 추적 필요 시 `approval_document`에만 추가

---

## 🎯 핵심 개선 효과

### 1. 데이터 무결성 향상
- 중복 필드 제거로 데이터 일관성 확보
- 스냅샷 기능으로 시점 정보 보존

### 2. 확장성 대폭 향상
- 병렬 결재, 합의, 참조, 위임 등 다양한 결재 방식 지원
- 조건부 결재로 동적 결재선 구성 가능

### 3. 추적성 강화
- 알림 테이블로 모든 결재 액션 추적
- 이력 스냅샷으로 당시 상황 정확히 재현 가능

### 4. 성능 최적화
- 불필요한 컬럼 제거로 테이블 크기 감소
- 복합 인덱스 추가로 조회 성능 향상

### 5. 유지보수성 향상
- 명확한 역할 분담 (template → document → line → history)
- 상세한 가이드 문서로 구현 난이도 감소

---

## 📊 변경 요약 통계

| 항목 | 변경 전 | 변경 후 | 비고 |
|------|---------|---------|------|
| 테이블 수 | 5개 | 6개 | approval_notification 추가 |
| approval_document 컬럼 | 21개 | 18개 | 3개 제거 |
| approval_line 컬럼 | 15개 | 24개 | 9개 추가 |
| approval_line_template 컬럼 | 15개 | 14개 | 1개 제거 |
| approval_history 컬럼 | 22개 | 28개 | 7개 추가, 1개 제거 |
| 가이드 문서 | 0개 | 3개 | 총 700+ 라인 |
| 인덱스 (approval_line) | 6개 | 11개 | 5개 추가 |

---

## 🚀 다음 단계 (권장)

### 1. 즉시 적용 가능
- [x] 테이블 DDL 수정 완료
- [x] INSERT 샘플 데이터 수정 완료
- [ ] 기존 데이터 마이그레이션 (필요 시)
- [ ] 백엔드 API 구현
- [ ] 프론트엔드 UI 구현

### 2. 단계별 구현 순서
1. **1단계**: 기본 결재 기능 (순차 결재) - 기존과 동일
2. **2단계**: 알림 기능 구현
3. **3단계**: 병렬 결재 구현
4. **4단계**: 합의/참조 결재 구현
5. **5단계**: 결재 위임 구현
6. **6단계**: 조건부 결재 구현

### 3. 테스트 시나리오
- [ ] 기본 순차 결재 (3단계)
- [ ] 병렬 결재 (전원 승인)
- [ ] 병렬 결재 (과반수 승인)
- [ ] 합의 결재 (거부해도 진행)
- [ ] 참조 (자동 통과)
- [ ] 결재 위임 (휴가 중)
- [ ] 조건부 결재 (금액별)
- [ ] 복합 시나리오

---

## 📞 문의 사항

추가 개선이 필요하거나 구현 중 문제가 발생하면 가이드 문서를 참조하거나 문의 주세요.

**생성된 가이드 문서:**
- `GUIDE_approval_notification_usage.md`
- `GUIDE_approval_history_improvements.md`
- `GUIDE_advanced_approval_features.md`
