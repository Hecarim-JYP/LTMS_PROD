-- ============================================================
-- 결재 양식 샘플 데이터 INSERT (직급 기반)
-- ============================================================
-- 실행 전 확인사항:
-- 1. user_grade 테이블에 직급이 등록되어 있어야 합니다
-- 2. company_id는 실제 환경에 맞게 수정하세요 (기본값: 1)
-- ============================================================

-- 1. CT 의뢰 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, 'CT 의뢰 기본 결재선', 'CT_REQ', 'CT 의뢰 문서의 기본 결재 양식입니다. (작성자 → 수석 → 이사)', 1, 1, 1);

SET @ct_req_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@ct_req_template_id, 1, 'CT_REQ', 1, 1, 1, 1, 1),  -- 1단계: G4 수석
(@ct_req_template_id, 1, 'CT_REQ', 2, 11, 1, 2, 1);  -- 2단계: E1 이사

-- 2. CT 시험성적서 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, 'CT 성적서 기본 결재선', 'CT_TEST', 'CT 시험성적서의 기본 결재 양식입니다. (담당자 → 수석 → 이사)', 1, 1, 1);

SET @ct_test_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@ct_test_template_id, 1, 'CT_TEST', 1, 4, 1, 1, 1),  -- 1단계: G1 사원
(@ct_test_template_id, 1, 'CT_TEST', 2, 1, 1, 2, 1),  -- 2단계: G4 수석
(@ct_test_template_id, 1, 'CT_TEST', 3, 11, 1, 3, 1);  -- 3단계: E1 이사

-- 3. 내부시험 의뢰 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, '내부시험 의뢰 기본 결재선', 'INTERNAL_REQ', '내부시험 의뢰 문서의 기본 결재 양식입니다. (작성자 → 수석 → 이사)', 1, 1, 1);

SET @internal_req_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@internal_req_template_id, 1, 'INTERNAL_REQ', 1, 1, 1, 1, 1),  -- 1단계: G4 수석
(@internal_req_template_id, 1, 'INTERNAL_REQ', 2, 11, 1, 2, 1);  -- 2단계: E1 이사

-- 4. 내부시험 시험성적서 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, '내부시험 성적서 기본 결재선', 'INTERNAL_TEST', '내부시험 시험성적서의 기본 결재 양식입니다. (담당자 → 수석 → 이사)', 1, 1, 1);

SET @internal_test_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@internal_test_template_id, 1, 'INTERNAL_TEST', 1, 4, 1, 1, 1),  -- 1단계: G1 사원
(@internal_test_template_id, 1, 'INTERNAL_TEST', 2, 1, 1, 2, 1),  -- 2단계: G4 수석
(@internal_test_template_id, 1, 'INTERNAL_TEST', 3, 11, 1, 3, 1);  -- 3단계: E1 이사

-- 5. 외부시험 의뢰 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, '외부시험 의뢰 기본 결재선', 'EXTERNAL_REQ', '외부시험 의뢰 문서의 기본 결재 양식입니다. (작성자 → 수석 → 이사)', 1, 1, 1);

SET @external_req_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@external_req_template_id, 1, 'EXTERNAL_REQ', 1, 1, 1, 1, 1),  -- 1단계: G4 수석
(@external_req_template_id, 1, 'EXTERNAL_REQ', 2, 11, 1, 2, 1);  -- 2단계: E1 이사

-- 6. 외부시험 시험성적서 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, '외부시험 성적서 기본 결재선', 'EXTERNAL_TEST', '외부시험 시험성적서의 기본 결재 양식입니다. (담당자 → 수석 → 이사)', 1, 1, 1);

SET @external_test_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@external_test_template_id, 1, 'EXTERNAL_TEST', 1, 4, 1, 1, 1),  -- 1단계: G1 사원
(@external_test_template_id, 1, 'EXTERNAL_TEST', 2, 1, 1, 2, 1),  -- 2단계: G4 수석
(@external_test_template_id, 1, 'EXTERNAL_TEST', 3, 11, 1, 3, 1);  -- 3단계: E1 이사

-- 7. 방부력 의뢰 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, '방부력 의뢰 기본 결재선', 'PRESERVATIVE_REQ', '방부력 의뢰 문서의 기본 결재 양식입니다. (작성자 → 수석 → 이사)', 1, 1, 1);

SET @preservative_req_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@preservative_req_template_id, 1, 'PRESERVATIVE_REQ', 1, 1, 1, 1, 1),  -- 1단계: G4 수석
(@preservative_req_template_id, 1, 'PRESERVATIVE_REQ', 2, 11, 1, 2, 1);  -- 2단계: E1 이사

-- 8. 방부력 시험성적서 결재 양식
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, '방부력 성적서 기본 결재선', 'PRESERVATIVE_TEST', '방부력 시험성적서의 기본 결재 양식입니다. (담당자 → 수석 → 이사)', 1, 1, 1);

SET @preservative_test_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@preservative_test_template_id, 1, 'PRESERVATIVE_TEST', 1, 4, 1, 1, 1),  -- 1단계: G1 사원
(@preservative_test_template_id, 1, 'PRESERVATIVE_TEST', 2, 1, 1, 2, 1),  -- 2단계: G4 수석
(@preservative_test_template_id, 1, 'PRESERVATIVE_TEST', 3, 11, 1, 3, 1);  -- 3단계: E1 이사

-- ============================================================
-- 추가 양식 예시 (선택 사항)
-- ============================================================

-- 긴급 결재선 예시 (CT 의뢰용 - 수석만 거침)
INSERT INTO approval_template 
(company_id, template_name, document_type, description, is_default, is_active, created_by) 
VALUES 
(1, 'CT 의뢰 긴급 결재선', 'CT_REQ', 'CT 의뢰 긴급 승인용 결재선입니다. (수석 승인만)', 0, 1, 1);

SET @ct_req_urgent_template_id = LAST_INSERT_ID();

INSERT INTO approval_line_template 
(approval_template_id, company_id, document_type, step, user_grade_id, is_active, sort_order, created_by) 
VALUES 
(@ct_req_urgent_template_id, 1, 'CT_REQ', 1, 1, 1, 1, 1);  -- 1단계: G4 수석만

-- ============================================================
-- 결과 확인 쿼리
-- ============================================================
-- SELECT * FROM approval_template ORDER BY document_type, template_name;
-- SELECT * FROM approval_line_template ORDER BY approval_template_id, step;

-- ============================================================
-- 직급(user_grade_id) 참고
-- ============================================================
-- 실제 사용 시 user_grade 테이블의 실제 user_grade_id 값으로 수정 필요
-- 예시:
--   user_grade_id = 1: G4 수석 (sort_order=8)
--   user_grade_id = 2: G3 책임 (sort_order=9)
--   user_grade_id = 3: G2 선임 (sort_order=10)
--   user_grade_id = 4: G1 사원 (sort_order=11)
--   user_grade_id = 11: E1 이사 (sort_order=7)
--   user_grade_id = 10: E2 상무이사 (sort_order=6)
-- ============================================================
