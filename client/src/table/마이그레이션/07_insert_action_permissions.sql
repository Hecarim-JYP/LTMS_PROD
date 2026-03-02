-- ========================================
-- 7단계: 동작 권한 데이터 삽입 (permission_type = 'action')
-- ========================================
-- 페이지 내에서 실행할 수 있는 동작에 대한 권한

INSERT INTO `permission` (
  company_id, permission_code, permission_name, permission_name_en,
  description, module, action, resource, permission_type,
  is_system_permission, is_active, sort_order
) VALUES
-- ========================================
-- CT 모듈 - 동작 권한
-- ========================================
-- CT 의뢰 관련 동작
(1, 'action.ct_request.read', 'CT 의뢰 데이터 조회', 'CT Request Data Read', 
 'CT 의뢰 데이터를 조회할 수 있는 권한', 'ct_request', 'read', '/api/ct/request', 'action', 1, 1, 100),
 
(1, 'action.ct_request.create', 'CT 의뢰 생성', 'CT Request Create', 
 'CT 의뢰를 생성할 수 있는 권한', 'ct_request', 'create', '/api/ct/request', 'action', 1, 1, 101),
 
(1, 'action.ct_request.update', 'CT 의뢰 수정', 'CT Request Update', 
 'CT 의뢰를 수정할 수 있는 권한', 'ct_request', 'update', '/api/ct/request', 'action', 1, 1, 102),
 
(1, 'action.ct_request.delete', 'CT 의뢰 삭제', 'CT Request Delete', 
 'CT 의뢰를 삭제할 수 있는 권한', 'ct_request', 'delete', '/api/ct/request', 'action', 1, 1, 103),
 
(1, 'action.ct_request.approve', 'CT 의뢰 결재 승인', 'CT Request Approve', 
 'CT 의뢰를 결재(승인/반려)할 수 있는 권한', 'ct_request', 'approve', '/api/ct/request/approve', 'action', 1, 1, 104),
 
(1, 'action.ct_request.export', 'CT 의뢰 내보내기', 'CT Request Export', 
 'CT 의뢰 데이터를 엑셀 등으로 내보낼 수 있는 권한', 'ct_request', 'export', '/api/ct/request/export', 'action', 1, 1, 105),

-- CT 시험성적서 관련 동작
(1, 'action.ct_testReport.read', 'CT 성적서 데이터 조회', 'CT Test Report Data Read', 
 'CT 성적서 데이터를 조회할 수 있는 권한', 'ct_testReport', 'read', '/api/ct/testReport', 'action', 1, 1, 106),
 
(1, 'action.ct_testReport.create', 'CT 성적서 생성', 'CT Test Report Create', 
 'CT 성적서를 생성할 수 있는 권한', 'ct_testReport', 'create', '/api/ct/testReport', 'action', 1, 1, 107),
 
(1, 'action.ct_testReport.update', 'CT 성적서 수정', 'CT Test Report Update', 
 'CT 성적서를 수정할 수 있는 권한', 'ct_testReport', 'update', '/api/ct/testReport', 'action', 1, 1, 108),
 
(1, 'action.ct_testReport.delete', 'CT 성적서 삭제', 'CT Test Report Delete', 
 'CT 성적서를 삭제할 수 있는 권한', 'ct_testReport', 'delete', '/api/ct/testReport', 'action', 1, 1, 109),
 
(1, 'action.ct_testReport.print', 'CT 성적서 인쇄', 'CT Test Report Print', 
 'CT 성적서를 PDF로 인쇄할 수 있는 권한', 'ct_testReport', 'print', '/api/ct/testReport/print', 'action', 1, 1, 110),
 
(1, 'action.ct_testReport.export', 'CT 성적서 내보내기', 'CT Test Report Export', 
 'CT 성적서를 엑셀 등으로 내보낼 수 있는 권한', 'ct_testReport', 'export', '/api/ct/testReport/export', 'action', 1, 1, 111),

-- CT 일정 관련 동작
(1, 'action.ct_schedule.read', 'CT 일정 조회', 'CT Schedule Read', 
 'CT 일정 데이터를 조회할 수 있는 권한', 'ct_schedule', 'read', '/api/ct/schedule', 'action', 1, 1, 112),
 
(1, 'action.ct_schedule.update', 'CT 일정 수정', 'CT Schedule Update', 
 'CT 일정을 수정할 수 있는 권한', 'ct_schedule', 'update', '/api/ct/schedule', 'action', 1, 1, 113),

-- ========================================
-- 내부 성분 분석 - 동작 권한
-- ========================================
(1, 'action.internal_request.read', '내부 의뢰 데이터 조회', 'Internal Request Data Read', 
 '내부 의뢰 데이터를 조회할 수 있는 권한', 'internal_request', 'read', '/api/internal/request', 'action', 1, 1, 114),
 
(1, 'action.internal_request.create', '내부 의뢰 생성', 'Internal Request Create', 
 '내부 의뢰를 생성할 수 있는 권한', 'internal_request', 'create', '/api/internal/request', 'action', 1, 1, 115),
 
(1, 'action.internal_request.update', '내부 의뢰 수정', 'Internal Request Update', 
 '내부 의뢰를 수정할 수 있는 권한', 'internal_request', 'update', '/api/internal/request', 'action', 1, 1, 116),
 
(1, 'action.internal_request.delete', '내부 의뢰 삭제', 'Internal Request Delete', 
 '내부 의뢰를 삭제할 수 있는 권한', 'internal_request', 'delete', '/api/internal/request', 'action', 1, 1, 117),
 
(1, 'action.internal_request.approve', '내부 의뢰 결재 승인', 'Internal Request Approve', 
 '내부 의뢰를 결재(승인/반려)할 수 있는 권한', 'internal_request', 'approve', '/api/internal/request/approve', 'action', 1, 1, 118),

(1, 'action.internal_testReport.read', '내부 성적서 데이터 조회', 'Internal Test Report Data Read', 
 '내부 성적서 데이터를 조회할 수 있는 권한', 'internal_testReport', 'read', '/api/internal/testReport', 'action', 1, 1, 119),
 
(1, 'action.internal_testReport.create', '내부 성적서 생성', 'Internal Test Report Create', 
 '내부 성적서를 생성할 수 있는 권한', 'internal_testReport', 'create', '/api/internal/testReport', 'action', 1, 1, 120),
 
(1, 'action.internal_testReport.update', '내부 성적서 수정', 'Internal Test Report Update', 
 '내부 성적서를 수정할 수 있는 권한', 'internal_testReport', 'update', '/api/internal/testReport', 'action', 1, 1, 121),

(1, 'action.internal_schedule.read', '내부 일정 조회', 'Internal Schedule Read', 
 '내부 일정 데이터를 조회할 수 있는 권한', 'internal_schedule', 'read', '/api/internal/schedule', 'action', 1, 1, 122),

-- ========================================
-- 외부 성분 분석 - 동작 권한
-- ========================================
(1, 'action.external_request.read', '외부 의뢰 데이터 조회', 'External Request Data Read', 
 '외부 의뢰 데이터를 조회할 수 있는 권한', 'external_request', 'read', '/api/external/request', 'action', 1, 1, 123),
 
(1, 'action.external_request.create', '외부 의뢰 생성', 'External Request Create', 
 '외부 의뢰를 생성할 수 있는 권한', 'external_request', 'create', '/api/external/request', 'action', 1, 1, 124),
 
(1, 'action.external_request.update', '외부 의뢰 수정', 'External Request Update', 
 '외부 의뢰를 수정할 수 있는 권한', 'external_request', 'update', '/api/external/request', 'action', 1, 1, 125),
 
(1, 'action.external_request.delete', '외부 의뢰 삭제', 'External Request Delete', 
 '외부 의뢰를 삭제할 수 있는 권한', 'external_request', 'delete', '/api/external/request', 'action', 1, 1, 126),
 
(1, 'action.external_request.approve', '외부 의뢰 결재 승인', 'External Request Approve', 
 '외부 의뢰를 결재(승인/반려)할 수 있는 권한', 'external_request', 'approve', '/api/external/request/approve', 'action', 1, 1, 127),

(1, 'action.external_testReport.read', '외부 성적서 데이터 조회', 'External Test Report Data Read', 
 '외부 성적서 데이터를 조회할 수 있는 권한', 'external_testReport', 'read', '/api/external/testReport', 'action', 1, 1, 128),

(1, 'action.external_schedule.read', '외부 일정 조회', 'External Schedule Read', 
 '외부 일정 데이터를 조회할 수 있는 권한', 'external_schedule', 'read', '/api/external/schedule', 'action', 1, 1, 129),

-- ========================================
-- 방부력 테스트 - 동작 권한
-- ========================================
(1, 'action.preservative_request.read', '방부력 의뢰 데이터 조회', 'Preservative Request Data Read', 
 '방부력 의뢰 데이터를 조회할 수 있는 권한', 'preservative_request', 'read', '/api/preservative/request', 'action', 1, 1, 130),
 
(1, 'action.preservative_request.create', '방부력 의뢰 생성', 'Preservative Request Create', 
 '방부력 의뢰를 생성할 수 있는 권한', 'preservative_request', 'create', '/api/preservative/request', 'action', 1, 1, 131),
 
(1, 'action.preservative_request.update', '방부력 의뢰 수정', 'Preservative Request Update', 
 '방부력 의뢰를 수정할 수 있는 권한', 'preservative_request', 'update', '/api/preservative/request', 'action', 1, 1, 132),
 
(1, 'action.preservative_request.delete', '방부력 의뢰 삭제', 'Preservative Request Delete', 
 '방부력 의뢰를 삭제할 수 있는 권한', 'preservative_request', 'delete', '/api/preservative/request', 'action', 1, 1, 133),
 
(1, 'action.preservative_request.approve', '방부력 의뢰 결재 승인', 'Preservative Request Approve', 
 '방부력 의뢰를 결재(승인/반려)할 수 있는 권한', 'preservative_request', 'approve', '/api/preservative/request/approve', 'action', 1, 1, 134),

(1, 'action.preservative_testReport.read', '방부력 성적서 데이터 조회', 'Preservative Test Report Data Read', 
 '방부력 성적서 데이터를 조회할 수 있는 권한', 'preservative_testReport', 'read', '/api/preservative/testReport', 'action', 1, 1, 135),

(1, 'action.preservative_schedule.read', '방부력 일정 조회', 'Preservative Schedule Read', 
 '방부력 일정 데이터를 조회할 수 있는 권한', 'preservative_schedule', 'read', '/api/preservative/schedule', 'action', 1, 1, 136),

-- ========================================
-- 환경 설정 - 동작 권한
-- ========================================
(1, 'action.setting.read', '설정 조회', 'Setting Read', 
 '설정 데이터를 조회할 수 있는 권한', 'setting', 'read', '/api/setting', 'action', 1, 1, 137),
 
(1, 'action.setting.update', '설정 수정', 'Setting Update', 
 '설정 데이터를 수정할 수 있는 권한', 'setting', 'update', '/api/setting', 'action', 1, 1, 138),

(1, 'action.auth.manage_role', '역할 관리', 'Role Management', 
 '역할을 생성/수정/삭제할 수 있는 권한', 'auth', 'manage_role', '/api/auth/role', 'action', 1, 1, 139),
 
(1, 'action.auth.manage_permission', '권한 관리', 'Permission Management', 
 '권한을 생성/수정/삭제할 수 있는 권한', 'auth', 'manage_permission', '/api/auth/permission', 'action', 1, 1, 140),
 
(1, 'action.auth.assign_permission', '권한 할당', 'Assign Permission', 
 '역할에 권한을 할당할 수 있는 권한', 'auth', 'assign_permission', '/api/auth/role-permission', 'action', 1, 1, 141),

(1, 'action.user.read', '사용자 조회', 'User Read', 
 '사용자 정보를 조회할 수 있는 권한', 'user', 'read', '/api/user', 'action', 1, 1, 142),
 
(1, 'action.user.create', '사용자 생성', 'User Create', 
 '사용자를 생성할 수 있는 권한', 'user', 'create', '/api/user', 'action', 1, 1, 143),
 
(1, 'action.user.update', '사용자 수정', 'User Update', 
 '사용자 정보를 수정할 수 있는 권한', 'user', 'update', '/api/user', 'action', 1, 1, 144),
 
(1, 'action.user.delete', '사용자 삭제', 'User Delete', 
 '사용자를 삭제할 수 있는 권한', 'user', 'delete', '/api/user', 'action', 1, 1, 145),

(1, 'action.selectOptions.read', '선택 항목 조회', 'Select Options Read', 
 '선택 항목을 조회할 수 있는 권한', 'selectOptions', 'read', '/api/setting/selectOptions', 'action', 1, 1, 146),
 
(1, 'action.selectOptions.create', '선택 항목 생성', 'Select Options Create', 
 '선택 항목을 생성할 수 있는 권한', 'selectOptions', 'create', '/api/setting/selectOptions', 'action', 1, 1, 147),
 
(1, 'action.selectOptions.update', '선택 항목 수정', 'Select Options Update', 
 '선택 항목을 수정할 수 있는 권한', 'selectOptions', 'update', '/api/setting/selectOptions', 'action', 1, 1, 148),
 
(1, 'action.selectOptions.delete', '선택 항목 삭제', 'Select Options Delete', 
 '선택 항목을 삭제할 수 있는 권한', 'selectOptions', 'delete', '/api/setting/selectOptions', 'action', 1, 1, 149);

-- ========================================
-- 확인
-- ========================================
-- SELECT permission_id, permission_code, permission_name, permission_type, module, action 
-- FROM permission 
-- WHERE permission_type = 'action'
-- ORDER BY sort_order;
