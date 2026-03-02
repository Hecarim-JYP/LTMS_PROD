-- ========================================
-- 6단계: 새로운 권한 데이터 삽입
-- ========================================
-- permission_type을 'menu'와 'action'으로 구분

-- ========================================
-- 메뉴 접근 권한 (permission_type = 'menu')
-- ========================================
-- depth 3 메뉴(실제 페이지)에 대한 접근 권한만 생성

INSERT INTO `permission` (
  company_id, permission_code, permission_name, permission_name_en,
  description, module, action, resource, permission_type,
  is_system_permission, is_active, sort_order
) VALUES
-- ========================================
-- CT 모듈 - 메뉴 접근 권한
-- ========================================
(1, 'menu.ct_request_read', 'CT 의뢰 조회 메뉴 접근', 'CT Request Read Menu Access', 
 'CT 의뢰 조회 페이지에 접근할 수 있는 권한', 'ct_request', 'read', '/ct/request/read', 'menu', 1, 1, 1),
 
(1, 'menu.ct_request_create', 'CT 의뢰 등록 메뉴 접근', 'CT Request Create Menu Access', 
 'CT 의뢰 등록 페이지에 접근할 수 있는 권한', 'ct_request', 'create', '/ct/request/create', 'menu', 1, 1, 2),
 
(1, 'menu.ct_request_approval', 'CT 의뢰 결재 메뉴 접근', 'CT Request Approval Menu Access', 
 'CT 의뢰 결재 페이지에 접근할 수 있는 권한', 'ct_request', 'approval', '/ct/request/approval', 'menu', 1, 1, 3),

(1, 'menu.ct_testReport_read', 'CT 성적서 조회 메뉴 접근', 'CT Test Report Read Menu Access', 
 'CT 성적서 조회 페이지에 접근할 수 있는 권한', 'ct_testReport', 'read', '/ct/testReport/read', 'menu', 1, 1, 4),
 
(1, 'menu.ct_testReport_report', 'CT 성적서 작성 메뉴 접근', 'CT Test Report Write Menu Access', 
 'CT 성적서 작성 페이지에 접근할 수 있는 권한', 'ct_testReport', 'report', '/ct/testReport/report', 'menu', 1, 1, 5),
 
(1, 'menu.ct_testReport_standard', 'CT 규격 관리 메뉴 접근', 'CT Standard Menu Access', 
 'CT 규격 관리 페이지에 접근할 수 있는 권한', 'ct_testReport', 'standard', '/ct/testReport/standard', 'menu', 1, 1, 6),

(1, 'menu.ct_schedule_ct', 'CT 일정 메뉴 접근', 'CT Schedule Menu Access', 
 'CT 일정 페이지에 접근할 수 있는 권한', 'ct_schedule', 'ct', '/ct/schedule/ct', 'menu', 1, 1, 7),
 
(1, 'menu.ct_schedule_report', 'CT 성적서 일정 메뉴 접근', 'CT Report Schedule Menu Access', 
 'CT 성적서 일정 페이지에 접근할 수 있는 권한', 'ct_schedule', 'report', '/ct/schedule/report', 'menu', 1, 1, 8),

-- ========================================
-- 내부 성분 분석 - 메뉴 접근 권한
-- ========================================
(1, 'menu.internal_request_read', '내부 의뢰 조회 메뉴 접근', 'Internal Request Read Menu Access', 
 '내부 의뢰 조회 페이지에 접근할 수 있는 권한', 'internal_request', 'read', '/internal/request/read', 'menu', 1, 1, 9),
 
(1, 'menu.internal_request_create', '내부 의뢰 등록 메뉴 접근', 'Internal Request Create Menu Access', 
 '내부 의뢰 등록 페이지에 접근할 수 있는 권한', 'internal_request', 'create', '/internal/request/create', 'menu', 1, 1, 10),
 
(1, 'menu.internal_request_approve', '내부 의뢰 결재 메뉴 접근', 'Internal Request Approve Menu Access', 
 '내부 의뢰 결재 페이지에 접근할 수 있는 권한', 'internal_request', 'approve', '/internal/request/approve', 'menu', 1, 1, 11),

(1, 'menu.internal_testReport_read', '내부 성적서 조회 메뉴 접근', 'Internal Test Report Read Menu Access', 
 '내부 성적서 조회 페이지에 접근할 수 있는 권한', 'internal_testReport', 'read', '/internal/testReport/read', 'menu', 1, 1, 12),

(1, 'menu.internal_schedule_read', '내부 일정 조회 메뉴 접근', 'Internal Schedule Read Menu Access', 
 '내부 일정 조회 페이지에 접근할 수 있는 권한', 'internal_schedule', 'read', '/internal/schedule/read', 'menu', 1, 1, 13),

-- ========================================
-- 외부 성분 분석 - 메뉴 접근 권한
-- ========================================
(1, 'menu.external_request_read', '외부 의뢰 조회 메뉴 접근', 'External Request Read Menu Access', 
 '외부 의뢰 조회 페이지에 접근할 수 있는 권한', 'external_request', 'read', '/external/request/read', 'menu', 1, 1, 14),
 
(1, 'menu.external_request_create', '외부 의뢰 등록 메뉴 접근', 'External Request Create Menu Access', 
 '외부 의뢰 등록 페이지에 접근할 수 있는 권한', 'external_request', 'create', '/external/request/create', 'menu', 1, 1, 15),
 
(1, 'menu.external_request_approve', '외부 의뢰 결재 메뉴 접근', 'External Request Approve Menu Access', 
 '외부 의뢰 결재 페이지에 접근할 수 있는 권한', 'external_request', 'approve', '/external/request/approve', 'menu', 1, 1, 16),

(1, 'menu.external_testReport_read', '외부 성적서 조회 메뉴 접근', 'External Test Report Read Menu Access', 
 '외부 성적서 조회 페이지에 접근할 수 있는 권한', 'external_testReport', 'read', '/external/testReport/read', 'menu', 1, 1, 17),

(1, 'menu.external_schedule_read', '외부 일정 조회 메뉴 접근', 'External Schedule Read Menu Access', 
 '외부 일정 조회 페이지에 접근할 수 있는 권한', 'external_schedule', 'read', '/external/schedule/read', 'menu', 1, 1, 18),

-- ========================================
-- 방부력 테스트 - 메뉴 접근 권한
-- ========================================
(1, 'menu.preservative_request_read', '방부력 의뢰 조회 메뉴 접근', 'Preservative Request Read Menu Access', 
 '방부력 의뢰 조회 페이지에 접근할 수 있는 권한', 'preservative_request', 'read', '/preservative/request/read', 'menu', 1, 1, 19),
 
(1, 'menu.preservative_request_create', '방부력 의뢰 등록 메뉴 접근', 'Preservative Request Create Menu Access', 
 '방부력 의뢰 등록 페이지에 접근할 수 있는 권한', 'preservative_request', 'create', '/preservative/request/create', 'menu', 1, 1, 20),
 
(1, 'menu.preservative_request_approve', '방부력 의뢰 결재 메뉴 접근', 'Preservative Request Approve Menu Access', 
 '방부력 의뢰 결재 페이지에 접근할 수 있는 권한', 'preservative_request', 'approve', '/preservative/request/approve', 'menu', 1, 1, 21),

(1, 'menu.preservative_testReport_read', '방부력 성적서 조회 메뉴 접근', 'Preservative Test Report Read Menu Access', 
 '방부력 성적서 조회 페이지에 접근할 수 있는 권한', 'preservative_testReport', 'read', '/preservative/testReport/read', 'menu', 1, 1, 22),

(1, 'menu.preservative_schedule_read', '방부력 일정 조회 메뉴 접근', 'Preservative Schedule Read Menu Access', 
 '방부력 일정 조회 페이지에 접근할 수 있는 권한', 'preservative_schedule', 'read', '/preservative/schedule/read', 'menu', 1, 1, 23),

-- ========================================
-- 환경 설정 - 메뉴 접근 권한
-- ========================================
(1, 'menu.setting_default', '개인 설정 메뉴 접근', 'Personal Setting Menu Access', 
 '개인 설정 페이지에 접근할 수 있는 권한', 'setting', 'default', '/setting/default', 'menu', 1, 1, 24),

(1, 'menu.setting_auth', '권한 설정 메뉴 접근', 'Auth Setting Menu Access', 
 '권한 설정 페이지에 접근할 수 있는 권한', 'setting', 'auth', '/setting/auth', 'menu', 1, 1, 25),

(1, 'menu.setting_user', '사용자 관리 메뉴 접근', 'User Management Menu Access', 
 '사용자 관리 페이지에 접근할 수 있는 권한', 'setting', 'user', '/setting/user', 'menu', 1, 1, 26),

(1, 'menu.setting_selectOptions_labsDept', '제형담당부서 메뉴 접근', 'Labs Department Menu Access', 
 '제형담당부서 페이지에 접근할 수 있는 권한', 'setting_selectOptions', 'labsDept', '/setting/selectOptions/labsDept', 'menu', 1, 1, 27),

(1, 'menu.setting_selectOptions_managerType', '담당자유형 메뉴 접근', 'Manager Type Menu Access', 
 '담당자유형 페이지에 접근할 수 있는 권한', 'setting_selectOptions', 'managerType', '/setting/selectOptions/managerType', 'menu', 1, 1, 28),

(1, 'menu.setting_selectOptions_judgment', '판정관리 메뉴 접근', 'Judgment Menu Access', 
 '판정관리 페이지에 접근할 수 있는 권한', 'setting_selectOptions', 'judgment', '/setting/selectOptions/judgment', 'menu', 1, 1, 29),

(1, 'menu.setting_selectOptions_unit', '단위관리 메뉴 접근', 'Unit Menu Access', 
 '단위관리 페이지에 접근할 수 있는 권한', 'setting_selectOptions', 'unit', '/setting/selectOptions/unit', 'menu', 1, 1, 30);
