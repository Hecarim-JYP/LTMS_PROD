-- ========================================
-- 5단계: 새로운 메뉴 데이터 삽입 (depth 3 구조)
-- ========================================

-- ========================================
-- CT 모듈
-- ========================================
-- 1depth: CT
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'ct', NULL, NULL, NULL, 'CT', NULL, NULL, 1, NULL, 0, 1, 1);

-- 2depth: CT 하위 카테고리
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'ct_request_category', 'ct', NULL, NULL, '의뢰', NULL, NULL, 2, 1, 0, 1, 1),
(1, 'ct_testReport_category', 'ct', NULL, NULL, '시험성적서', NULL, NULL, 2, 1, 0, 2, 1),
(1, 'ct_schedule_category', 'ct', NULL, NULL, '일정 현황', NULL, NULL, 2, 1, 0, 3, 1);

-- 3depth: CT > 의뢰 하위 메뉴 (실제 페이지)
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'ct_request_read', 'ct', 'request', NULL, '의뢰 조회', '/ct/request/read', NULL, 3, 2, 1, 1, 1),
(1, 'ct_request_create', 'ct', 'request', NULL, '의뢰 등록', '/ct/request/create', NULL, 3, 2, 1, 2, 1),
(1, 'ct_request_approval', 'ct', 'request', NULL, '의뢰 결재', '/ct/request/approval', NULL, 3, 2, 1, 3, 1);

-- 3depth: CT > 시험성적서 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'ct_testReport_read', 'ct', 'testReport', NULL, '성적서 조회', '/ct/testReport/read', NULL, 3, 3, 1, 1, 1),
(1, 'ct_testReport_report', 'ct', 'testReport', NULL, '성적서 작성', '/ct/testReport/report', NULL, 3, 3, 1, 2, 1),
(1, 'ct_testReport_standard', 'ct', 'testReport', NULL, '규격 관리', '/ct/testReport/standard', NULL, 3, 3, 1, 3, 1);

-- 3depth: CT > 일정 현황 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'ct_schedule_ct', 'ct', 'schedule', NULL, 'CT 일정', '/ct/schedule/ct', NULL, 3, 4, 1, 1, 1),
(1, 'ct_schedule_report', 'ct', 'schedule', NULL, '성적서 일정', '/ct/schedule/report', NULL, 3, 4, 1, 2, 1);

-- ========================================
-- 내부 성분 분석 모듈
-- ========================================
-- 1depth: 내부 성분 분석
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'internal', NULL, NULL, NULL, '내부 성분 분석', NULL, NULL, 1, NULL, 0, 2, 1);

-- 2depth: 내부 성분 분석 하위 카테고리
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'internal_request_category', 'internal', NULL, NULL, '의뢰', NULL, NULL, 2, 11, 0, 1, 1),
(1, 'internal_testReport_category', 'internal', NULL, NULL, '시험성적서', NULL, NULL, 2, 11, 0, 2, 1),
(1, 'internal_schedule_category', 'internal', NULL, NULL, '일정 현황', NULL, NULL, 2, 11, 0, 3, 1);

-- 3depth: 내부 성분 분석 > 의뢰 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'internal_request_read', 'internal', 'request', NULL, '의뢰 조회', '/internal/request/read', NULL, 3, 12, 1, 1, 1),
(1, 'internal_request_create', 'internal', 'request', NULL, '의뢰 등록', '/internal/request/create', NULL, 3, 12, 1, 2, 1),
(1, 'internal_request_approve', 'internal', 'request', NULL, '의뢰 결재', '/internal/request/approve', NULL, 3, 12, 1, 3, 1);

-- 3depth: 내부 성분 분석 > 시험성적서 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'internal_testReport_read', 'internal', 'testReport', NULL, '성적서 조회', '/internal/testReport/read', NULL, 3, 13, 1, 1, 1);

-- 3depth: 내부 성분 분석 > 일정 현황 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'internal_schedule_read', 'internal', 'schedule', NULL, '일정 조회', '/internal/schedule/read', NULL, 3, 14, 1, 1, 1);

-- ========================================
-- 외부 성분 분석 모듈
-- ========================================
-- 1depth: 외부 성분 분석
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'external', NULL, NULL, NULL, '외부 성분 분석', NULL, NULL, 1, NULL, 0, 3, 1);

-- 2depth: 외부 성분 분석 하위 카테고리
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'external_request_category', 'external', NULL, NULL, '의뢰', NULL, NULL, 2, 21, 0, 1, 1),
(1, 'external_testReport_category', 'external', NULL, NULL, '시험성적서', NULL, NULL, 2, 21, 0, 2, 1),
(1, 'external_schedule_category', 'external', NULL, NULL, '일정 현황', NULL, NULL, 2, 21, 0, 3, 1);

-- 3depth: 외부 성분 분석 > 의뢰 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'external_request_read', 'external', 'request', NULL, '의뢰 조회', '/external/request/read', NULL, 3, 22, 1, 1, 1),
(1, 'external_request_create', 'external', 'request', NULL, '의뢰 등록', '/external/request/create', NULL, 3, 22, 1, 2, 1),
(1, 'external_request_approve', 'external', 'request', NULL, '의뢰 결재', '/external/request/approve', NULL, 3, 22, 1, 3, 1);

-- 3depth: 외부 성분 분석 > 시험성적서 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'external_testReport_read', 'external', 'testReport', NULL, '성적서 조회', '/external/testReport/read', NULL, 3, 23, 1, 1, 1);

-- 3depth: 외부 성분 분석 > 일정 현황 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'external_schedule_read', 'external', 'schedule', NULL, '일정 조회', '/external/schedule/read', NULL, 3, 24, 1, 1, 1);

-- ========================================
-- 방부력 테스트 모듈
-- ========================================
-- 1depth: 방부력 테스트
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'preservative', NULL, NULL, NULL, '방부력 테스트', NULL, NULL, 1, NULL, 0, 4, 1);

-- 2depth: 방부력 테스트 하위 카테고리
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'preservative_request_category', 'preservative', NULL, NULL, '의뢰', NULL, NULL, 2, 31, 0, 1, 1),
(1, 'preservative_testReport_category', 'preservative', NULL, NULL, '시험성적서', NULL, NULL, 2, 31, 0, 2, 1),
(1, 'preservative_schedule_category', 'preservative', NULL, NULL, '일정 현황', NULL, NULL, 2, 31, 0, 3, 1);

-- 3depth: 방부력 테스트 > 의뢰 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'preservative_request_read', 'preservative', 'request', NULL, '의뢰 조회', '/preservative/request/read', NULL, 3, 32, 1, 1, 1),
(1, 'preservative_request_create', 'preservative', 'request', NULL, '의뢰 등록', '/preservative/request/create', NULL, 3, 32, 1, 2, 1),
(1, 'preservative_request_approve', 'preservative', 'request', NULL, '의뢰 결재', '/preservative/request/approve', NULL, 3, 32, 1, 3, 1);

-- 3depth: 방부력 테스트 > 시험성적서 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'preservative_testReport_read', 'preservative', 'testReport', NULL, '성적서 조회', '/preservative/testReport/read', NULL, 3, 33, 1, 1, 1);

-- 3depth: 방부력 테스트 > 일정 현황 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'preservative_schedule_read', 'preservative', 'schedule', NULL, '일정 조회', '/preservative/schedule/read', NULL, 3, 34, 1, 1, 1);

-- ========================================
-- 환경 설정 모듈
-- ========================================
-- 1depth: 환경 설정
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'setting', NULL, NULL, NULL, '환경 설정', NULL, NULL, 1, NULL, 0, 5, 1);

-- 2depth: 환경 설정 하위 카테고리
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'setting_default', 'setting', NULL, NULL, '개인 설정', '/setting/default', NULL, 2, 41, 1, 1, 1),
(1, 'setting_auth', 'setting', NULL, NULL, '권한 설정', '/setting/auth', NULL, 2, 41, 1, 2, 1),
(1, 'setting_user', 'setting', NULL, NULL, '사용자 관리', '/setting/user', NULL, 2, 41, 1, 3, 1),
(1, 'setting_selectOptions_category', 'setting', NULL, NULL, '선택 항목 관리', NULL, NULL, 2, 41, 0, 4, 1);

-- 3depth: 환경 설정 > 선택 항목 관리 하위 메뉴
INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
(1, 'setting_selectOptions_labsDept', 'setting', 'selectOptions', NULL, '제형담당부서', '/setting/selectOptions/labsDept', NULL, 3, 45, 1, 1, 1),
(1, 'setting_selectOptions_managerType', 'setting', 'selectOptions', NULL, '담당자유형', '/setting/selectOptions/managerType', NULL, 3, 45, 1, 2, 1),
(1, 'setting_selectOptions_judgment', 'setting', 'selectOptions', NULL, '판정관리', '/setting/selectOptions/judgment', NULL, 3, 45, 1, 3, 1),
(1, 'setting_selectOptions_unit', 'setting', 'selectOptions', NULL, '단위관리', '/setting/selectOptions/unit', NULL, 3, 45, 1, 4, 1);

-- ========================================
-- 확인
-- ========================================
-- SELECT * FROM menu ORDER BY sort_order, menu_id;
-- SELECT menu_id, menu_code, menu_name, depth, parent_menu_id, menu_path FROM menu ORDER BY menu_id;
