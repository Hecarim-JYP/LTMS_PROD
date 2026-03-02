-- ========================================
-- 권한(Permission) 테이블 - 권한 시스템 재설계
-- ========================================
-- permission_type 구분:
-- - 'menu': 메뉴 접근 권한 (특정 페이지에 접근 가능 여부)
-- - 'action': 동작 권한 (페이지 내에서 특정 작업 수행 가능 여부)
-- ========================================

CREATE TABLE `permission` (
  `permission_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 ID (외래키)',
  `permission_code` varchar(100) NOT NULL COMMENT '권한 코드 (module.action 형식, 예: user.create, report.view)',
  `permission_name` varchar(100) NOT NULL COMMENT '권한명',
  `permission_name_en` varchar(100) DEFAULT NULL COMMENT '권한 영문명',
  `description` text DEFAULT NULL COMMENT '권한 설명',
  `module` varchar(50) DEFAULT NULL COMMENT '모듈명 (user, report, setting 등)',
  `action` varchar(50) DEFAULT NULL COMMENT '액션명 (create, read, update, delete, view, export 등)',
  `resource` varchar(100) DEFAULT NULL COMMENT '리소스명 (API 엔드포인트나 기능 식별자)',
  `permission_type` VARCHAR(20) DEFAULT 'action' COMMENT '권한 타입 (menu: 메뉴 접근 권한, action: 동작 권한)',
  `is_system_permission` tinyint(1) DEFAULT 0 COMMENT '시스템 기본 권한 여부 (1: 시스템 권한, 0: 사용자 정의)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자 ID (외래키)',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자 ID (외래키)',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일시 (Soft Delete)',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자 ID (외래키)',
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `uk_company_permission_code` (`company_id`,`permission_code`,`deleted_at`) COMMENT '회사별 권한 코드 고유 제약',
  KEY `idx_company_id` (`company_id`) COMMENT '회사별 인덱스',
  KEY `idx_permission_code` (`permission_code`) COMMENT '권한 코드 인덱스',
  KEY `idx_module` (`module`) COMMENT '모듈별 인덱스',
  KEY `idx_action` (`action`) COMMENT '액션별 인덱스',
  KEY `idx_permission_type` (`permission_type`, `is_active`) COMMENT '권한 타입별 활성 권한 조회 (menu/action 구분)',
  KEY `idx_is_system_permission` (`is_system_permission`) COMMENT '시스템 권한 인덱스',
  KEY `idx_is_active` (`is_active`) COMMENT '활성 여부 인덱스',
  KEY `idx_module_action` (`module`,`action`) COMMENT '모듈-액션 복합 인덱스',
  KEY `idx_company_active_sort` (`company_id`,`is_active`,`sort_order`,`deleted_at`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='권한(Permission) 테이블 - 메뉴 접근 권한과 동작 권한 통합 관리';

-- 권한 데이터 삽입
INSERT INTO `permission` (
  `company_id`,
  `permission_code`,
  `permission_name`,
  `permission_name_en`,
  `description`,
  `module`,
  `action`,
  `resource`,
  `permission_type`,
  `is_system_permission`,
  `is_active`,
  `sort_order`,
  `created_by`
) VALUES
-- ========================================
-- CT 모듈 - 의뢰 (menu_code: ct_request)
-- ========================================
(1, 'ct_request.read', 'CT 의뢰 조회', 'CT Request Read', 'CT 의뢰 정보를 조회할 수 있는 권한', 'ct_request', 'read', '/ct/request', 'feature', 1, 1, 1, NULL),
(1, 'ct_request.create', 'CT 의뢰 등록', 'CT Request Create', 'CT 의뢰를 등록할 수 있는 권한', 'ct_request', 'create', '/ct/request', 'feature', 1, 1, 2, NULL),
(1, 'ct_request.update', 'CT 의뢰 수정', 'CT Request Update', 'CT 의뢰를 수정할 수 있는 권한', 'ct_request', 'update', '/ct/request', 'feature', 1, 1, 3, NULL),
(1, 'ct_request.delete', 'CT 의뢰 삭제', 'CT Request Delete', 'CT 의뢰를 삭제할 수 있는 권한', 'ct_request', 'delete', '/ct/request', 'feature', 1, 1, 4, NULL),
(1, 'ct_request.approval', 'CT 의뢰 결재', 'CT Request Approval', 'CT 의뢰를 결재할 수 있는 권한', 'ct_request', 'approval', '/ct/request', 'feature', 1, 1, 5, NULL),

-- ========================================
-- CT 모듈 - 시험성적서 (menu_code: ct_testReport)
-- ========================================
(1, 'ct_testReport.read', 'CT 시험성적서 조회', 'CT Test Report Read', 'CT 시험성적서를 조회할 수 있는 권한', 'ct_testReport', 'read', '/ct/testReport', 'feature', 1, 1, 6, NULL),
(1, 'ct_testReport.create', 'CT 시험성적서 작성', 'CT Test Report Create', 'CT 시험성적서를 작성할 수 있는 권한', 'ct_testReport', 'create', '/ct/testReport', 'feature', 1, 1, 7, NULL),
(1, 'ct_testReport.update', 'CT 시험성적서 수정', 'CT Test Report Update', 'CT 시험성적서를 수정할 수 있는 권한', 'ct_testReport', 'update', '/ct/testReport', 'feature', 1, 1, 8, NULL),
(1, 'ct_testReport.delete', 'CT 시험성적서 삭제', 'CT Test Report Delete', 'CT 시험성적서를 삭제할 수 있는 권한', 'ct_testReport', 'delete', '/ct/testReport', 'feature', 1, 1, 9, NULL),

-- ========================================
-- CT 모듈 - 일정 현황 (menu_code: ct_schedule)
-- ========================================
(1, 'ct_schedule.read', 'CT 일정 조회', 'CT Schedule Read', 'CT 일정을 조회할 수 있는 권한', 'ct_schedule', 'read', '/ct/schedule', 'feature', 1, 1, 10, NULL),
(1, 'ct_schedule.update', 'CT 일정 수정', 'CT Schedule Update', 'CT 일정을 수정할 수 있는 권한', 'ct_schedule', 'update', '/ct/schedule', 'feature', 1, 1, 11, NULL),

-- ========================================
-- 내부 성분 분석 - 의뢰 (menu_code: internal_request)
-- ========================================
(1, 'internal_request.read', '내부 분석 의뢰 조회', 'Internal Request Read', '내부 분석 의뢰를 조회할 수 있는 권한', 'internal_request', 'read', '/internal/request', 'feature', 1, 1, 12, NULL),
(1, 'internal_request.create', '내부 분석 의뢰 등록', 'Internal Request Create', '내부 분석 의뢰를 등록할 수 있는 권한', 'internal_request', 'create', '/internal/request', 'feature', 1, 1, 13, NULL),
(1, 'internal_request.update', '내부 분석 의뢰 수정', 'Internal Request Update', '내부 분석 의뢰를 수정할 수 있는 권한', 'internal_request', 'update', '/internal/request', 'feature', 1, 1, 14, NULL),
(1, 'internal_request.delete', '내부 분석 의뢰 삭제', 'Internal Request Delete', '내부 분석 의뢰를 삭제할 수 있는 권한', 'internal_request', 'delete', '/internal/request', 'feature', 1, 1, 15, NULL),
(1, 'internal_request.approval', '내부 분석 의뢰 결재', 'Internal Request Approval', '내부 분석 의뢰를 결재할 수 있는 권한', 'internal_request', 'approval', '/internal/request', 'feature', 1, 1, 16, NULL),

-- ========================================
-- 내부 성분 분석 - 시험성적서 (menu_code: internal_testReport)
-- ========================================
(1, 'internal_testReport.read', '내부 분석 시험성적서 조회', 'Internal Test Report Read', '내부 분석 시험성적서를 조회할 수 있는 권한', 'internal_testReport', 'read', '/internal/testReport', 'feature', 1, 1, 17, NULL),
(1, 'internal_testReport.create', '내부 분석 시험성적서 작성', 'Internal Test Report Create', '내부 분석 시험성적서를 작성할 수 있는 권한', 'internal_testReport', 'create', '/internal/testReport', 'feature', 1, 1, 18, NULL),
(1, 'internal_testReport.update', '내부 분석 시험성적서 수정', 'Internal Test Report Update', '내부 분석 시험성적서를 수정할 수 있는 권한', 'internal_testReport', 'update', '/internal/testReport', 'feature', 1, 1, 19, NULL),
(1, 'internal_testReport.delete', '내부 분석 시험성적서 삭제', 'Internal Test Report Delete', '내부 분석 시험성적서를 삭제할 수 있는 권한', 'internal_testReport', 'delete', '/internal/testReport', 'feature', 1, 1, 20, NULL),

-- ========================================
-- 내부 성분 분석 - 일정 현황 (menu_code: internal_schedule)
-- ========================================
(1, 'internal_schedule.read', '내부 분석 일정 조회', 'Internal Schedule Read', '내부 분석 일정을 조회할 수 있는 권한', 'internal_schedule', 'read', '/internal/schedule', 'feature', 1, 1, 21, NULL),
(1, 'internal_schedule.update', '내부 분석 일정 수정', 'Internal Schedule Update', '내부 분석 일정을 수정할 수 있는 권한', 'internal_schedule', 'update', '/internal/schedule', 'feature', 1, 1, 22, NULL),

-- ========================================
-- 외부 성분 분석 - 의뢰 (menu_code: external_request)
-- ========================================
(1, 'external_request.read', '외부 분석 의뢰 조회', 'External Request Read', '외부 분석 의뢰를 조회할 수 있는 권한', 'external_request', 'read', '/external/request', 'feature', 1, 1, 23, NULL),
(1, 'external_request.create', '외부 분석 의뢰 등록', 'External Request Create', '외부 분석 의뢰를 등록할 수 있는 권한', 'external_request', 'create', '/external/request', 'feature', 1, 1, 24, NULL),
(1, 'external_request.update', '외부 분석 의뢰 수정', 'External Request Update', '외부 분석 의뢰를 수정할 수 있는 권한', 'external_request', 'update', '/external/request', 'feature', 1, 1, 25, NULL),
(1, 'external_request.delete', '외부 분석 의뢰 삭제', 'External Request Delete', '외부 분석 의뢰를 삭제할 수 있는 권한', 'external_request', 'delete', '/external/request', 'feature', 1, 1, 26, NULL),
(1, 'external_request.approval', '외부 분석 의뢰 결재', 'External Request Approval', '외부 분석 의뢰를 결재할 수 있는 권한', 'external_request', 'approval', '/external/request', 'feature', 1, 1, 27, NULL),

-- ========================================
-- 외부 성분 분석 - 시험성적서 (menu_code: external_testReport)
-- ========================================
(1, 'external_testReport.read', '외부 분석 시험성적서 조회', 'External Test Report Read', '외부 분석 시험성적서를 조회할 수 있는 권한', 'external_testReport', 'read', '/external/testReport', 'feature', 1, 1, 28, NULL),
(1, 'external_testReport.create', '외부 분석 시험성적서 작성', 'External Test Report Create', '외부 분석 시험성적서를 작성할 수 있는 권한', 'external_testReport', 'create', '/external/testReport', 'feature', 1, 1, 29, NULL),
(1, 'external_testReport.update', '외부 분석 시험성적서 수정', 'External Test Report Update', '외부 분석 시험성적서를 수정할 수 있는 권한', 'external_testReport', 'update', '/external/testReport', 'feature', 1, 1, 30, NULL),
(1, 'external_testReport.delete', '외부 분석 시험성적서 삭제', 'External Test Report Delete', '외부 분석 시험성적서를 삭제할 수 있는 권한', 'external_testReport', 'delete', '/external/testReport', 'feature', 1, 1, 31, NULL),

-- ========================================
-- 외부 성분 분석 - 일정 현황 (menu_code: external_schedule)
-- ========================================
(1, 'external_schedule.read', '외부 분석 일정 조회', 'External Schedule Read', '외부 분석 일정을 조회할 수 있는 권한', 'external_schedule', 'read', '/external/schedule', 'feature', 1, 1, 32, NULL),
(1, 'external_schedule.update', '외부 분석 일정 수정', 'External Schedule Update', '외부 분석 일정을 수정할 수 있는 권한', 'external_schedule', 'update', '/external/schedule', 'feature', 1, 1, 33, NULL),

-- ========================================
-- 방부력 테스트 - 의뢰 (menu_code: preservative_request)
-- ========================================
(1, 'preservative_request.read', '방부력 테스트 의뢰 조회', 'Preservative Request Read', '방부력 테스트 의뢰를 조회할 수 있는 권한', 'preservative_request', 'read', '/preservative/request', 'feature', 1, 1, 34, NULL),
(1, 'preservative_request.create', '방부력 테스트 의뢰 등록', 'Preservative Request Create', '방부력 테스트 의뢰를 등록할 수 있는 권한', 'preservative_request', 'create', '/preservative/request', 'feature', 1, 1, 35, NULL),
(1, 'preservative_request.update', '방부력 테스트 의뢰 수정', 'Preservative Request Update', '방부력 테스트 의뢰를 수정할 수 있는 권한', 'preservative_request', 'update', '/preservative/request', 'feature', 1, 1, 36, NULL),
(1, 'preservative_request.delete', '방부력 테스트 의뢰 삭제', 'Preservative Request Delete', '방부력 테스트 의뢰를 삭제할 수 있는 권한', 'preservative_request', 'delete', '/preservative/request', 'feature', 1, 1, 37, NULL),
(1, 'preservative_request.approval', '방부력 테스트 의뢰 결재', 'Preservative Request Approval', '방부력 테스트 의뢰를 결재할 수 있는 권한', 'preservative_request', 'approval', '/preservative/request', 'feature', 1, 1, 38, NULL),

-- ========================================
-- 방부력 테스트 - 시험성적서 (menu_code: preservative_testReport)
-- ========================================
(1, 'preservative_testReport.read', '방부력 테스트 시험성적서 조회', 'Preservative Test Report Read', '방부력 테스트 시험성적서를 조회할 수 있는 권한', 'preservative_testReport', 'read', '/preservative/testReport', 'feature', 1, 1, 39, NULL),
(1, 'preservative_testReport.create', '방부력 테스트 시험성적서 작성', 'Preservative Test Report Create', '방부력 테스트 시험성적서를 작성할 수 있는 권한', 'preservative_testReport', 'create', '/preservative/testReport', 'feature', 1, 1, 40, NULL),
(1, 'preservative_testReport.update', '방부력 테스트 시험성적서 수정', 'Preservative Test Report Update', '방부력 테스트 시험성적서를 수정할 수 있는 권한', 'preservative_testReport', 'update', '/preservative/testReport', 'feature', 1, 1, 41, NULL),
(1, 'preservative_testReport.delete', '방부력 테스트 시험성적서 삭제', 'Preservative Test Report Delete', '방부력 테스트 시험성적서를 삭제할 수 있는 권한', 'preservative_testReport', 'delete', '/preservative/testReport', 'feature', 1, 1, 42, NULL),

-- ========================================
-- 방부력 테스트 - 일정 현황 (menu_code: preservative_schedule)
-- ========================================
(1, 'preservative_schedule.read', '방부력 테스트 일정 조회', 'Preservative Schedule Read', '방부력 테스트 일정을 조회할 수 있는 권한', 'preservative_schedule', 'read', '/preservative/schedule', 'feature', 1, 1, 43, NULL),
(1, 'preservative_schedule.update', '방부력 테스트 일정 수정', 'Preservative Schedule Update', '방부력 테스트 일정을 수정할 수 있는 권한', 'preservative_schedule', 'update', '/preservative/schedule', 'feature', 1, 1, 44, NULL),

-- ========================================
-- 환경 설정 - 사용자 기초 설정 (menu_code: setting_default)
-- ========================================
(1, 'setting_default.read', '사용자 기초 설정 조회', 'User Default Setting Read', '사용자 기초 설정을 조회할 수 있는 권한', 'setting_default', 'read', '/setting/default', 'feature', 1, 1, 45, NULL),
(1, 'setting_default.update', '사용자 기초 설정 수정', 'User Default Setting Update', '사용자 기초 설정을 수정할 수 있는 권한', 'setting_default', 'update', '/setting/default', 'feature', 1, 1, 46, NULL),

-- ========================================
-- 환경 설정 - 사용자 관리 (menu_code: setting_auth)
-- ========================================
(1, 'setting_auth.read', '사용자 관리 조회', 'User Management Read', '사용자 관리 정보를 조회할 수 있는 권한', 'setting_auth', 'read', '/setting/auth', 'feature', 1, 1, 47, NULL),
(1, 'setting_auth.create', '사용자 관리 등록', 'User Management Create', '사용자를 등록할 수 있는 권한', 'setting_auth', 'create', '/setting/auth', 'feature', 1, 1, 48, NULL),
(1, 'setting_auth.update', '사용자 관리 수정', 'User Management Update', '사용자 정보를 수정할 수 있는 권한', 'setting_auth', 'update', '/setting/auth', 'feature', 1, 1, 49, NULL),
(1, 'setting_auth.delete', '사용자 관리 삭제', 'User Management Delete', '사용자를 삭제할 수 있는 권한', 'setting_auth', 'delete', '/setting/auth', 'feature', 1, 1, 50, NULL),

-- ========================================
-- 환경 설정 - 결재선 관리 (menu_code: setting_approval)
-- ========================================
(1, 'setting_approval.read', '결재선 관리 조회', 'Approval Line Read', '결재선을 조회할 수 있는 권한', 'setting_approval', 'read', '/setting/approval', 'feature', 1, 1, 51, NULL),
(1, 'setting_approval.create', '결재선 관리 등록', 'Approval Line Create', '결재선을 등록할 수 있는 권한', 'setting_approval', 'create', '/setting/approval', 'feature', 1, 1, 52, NULL),
(1, 'setting_approval.update', '결재선 관리 수정', 'Approval Line Update', '결재선을 수정할 수 있는 권한', 'setting_approval', 'update', '/setting/approval', 'feature', 1, 1, 53, NULL),
(1, 'setting_approval.delete', '결재선 관리 삭제', 'Approval Line Delete', '결재선을 삭제할 수 있는 권한', 'setting_approval', 'delete', '/setting/approval', 'feature', 1, 1, 54, NULL),

-- ========================================
-- 환경 설정 - 선택 항목 관리 (menu_code: setting_selectOptions)
-- ========================================
(1, 'setting_selectOptions.read', '선택 항목 관리 조회', 'Select Options Read', '선택 항목을 조회할 수 있는 권한', 'setting_selectOptions', 'read', '/setting/selectOptions', 'feature', 1, 1, 55, NULL),

-- ========================================
-- 환경 설정 - 제형담당부서 (menu_code: setting_selectOptions_manageLabsDept)
-- ========================================
(1, 'setting_selectOptions_manageLabsDept.read', '제형담당부서 조회', 'Labs Dept Read', '제형담당부서를 조회할 수 있는 권한', 'setting_selectOptions_manageLabsDept', 'read', '/setting/selectOptions/manageLabsDept', 'feature', 1, 1, 56, NULL),
(1, 'setting_selectOptions_manageLabsDept.create', '제형담당부서 등록', 'Labs Dept Create', '제형담당부서를 등록할 수 있는 권한', 'setting_selectOptions_manageLabsDept', 'create', '/setting/selectOptions/manageLabsDept', 'feature', 1, 1, 57, NULL),
(1, 'setting_selectOptions_manageLabsDept.update', '제형담당부서 수정', 'Labs Dept Update', '제형담당부서를 수정할 수 있는 권한', 'setting_selectOptions_manageLabsDept', 'update', '/setting/selectOptions/manageLabsDept', 'feature', 1, 1, 58, NULL),
(1, 'setting_selectOptions_manageLabsDept.delete', '제형담당부서 삭제', 'Labs Dept Delete', '제형담당부서를 삭제할 수 있는 권한', 'setting_selectOptions_manageLabsDept', 'delete', '/setting/selectOptions/manageLabsDept', 'feature', 1, 1, 59, NULL),

-- ========================================
-- 환경 설정 - 담당자유형 (menu_code: setting_selectOptions_managerType)
-- ========================================
(1, 'setting_selectOptions_managerType.read', '담당자유형 조회', 'Manager Type Read', '담당자유형을 조회할 수 있는 권한', 'setting_selectOptions_managerType', 'read', '/setting/selectOptions/managerType', 'feature', 1, 1, 60, NULL),
(1, 'setting_selectOptions_managerType.create', '담당자유형 등록', 'Manager Type Create', '담당자유형을 등록할 수 있는 권한', 'setting_selectOptions_managerType', 'create', '/setting/selectOptions/managerType', 'feature', 1, 1, 61, NULL),
(1, 'setting_selectOptions_managerType.update', '담당자유형 수정', 'Manager Type Update', '담당자유형을 수정할 수 있는 권한', 'setting_selectOptions_managerType', 'update', '/setting/selectOptions/managerType', 'feature', 1, 1, 62, NULL),
(1, 'setting_selectOptions_managerType.delete', '담당자유형 삭제', 'Manager Type Delete', '담당자유형을 삭제할 수 있는 권한', 'setting_selectOptions_managerType', 'delete', '/setting/selectOptions/managerType', 'feature', 1, 1, 63, NULL),

-- ========================================
-- 환경 설정 - 판정관리 (menu_code: setting_selectOptions_judgment)
-- ========================================
(1, 'setting_selectOptions_judgment.read', '판정관리 조회', 'Judgment Read', '판정을 조회할 수 있는 권한', 'setting_selectOptions_judgment', 'read', '/setting/selectOptions/judgment', 'feature', 1, 1, 64, NULL),
(1, 'setting_selectOptions_judgment.create', '판정관리 등록', 'Judgment Create', '판정을 등록할 수 있는 권한', 'setting_selectOptions_judgment', 'create', '/setting/selectOptions/judgment', 'feature', 1, 1, 65, NULL),
(1, 'setting_selectOptions_judgment.update', '판정관리 수정', 'Judgment Update', '판정을 수정할 수 있는 권한', 'setting_selectOptions_judgment', 'update', '/setting/selectOptions/judgment', 'feature', 1, 1, 66, NULL),
(1, 'setting_selectOptions_judgment.delete', '판정관리 삭제', 'Judgment Delete', '판정을 삭제할 수 있는 권한', 'setting_selectOptions_judgment', 'delete', '/setting/selectOptions/judgment', 'feature', 1, 1, 67, NULL),

-- ========================================
-- 환경 설정 - 단위관리 (menu_code: setting_selectOptions_unit)
-- ========================================
(1, 'setting_selectOptions_unit.read', '단위관리 조회', 'Unit Read', '단위를 조회할 수 있는 권한', 'setting_selectOptions_unit', 'read', '/setting/selectOptions/unit', 'feature', 1, 1, 68, NULL),
(1, 'setting_selectOptions_unit.create', '단위관리 등록', 'Unit Create', '단위를 등록할 수 있는 권한', 'setting_selectOptions_unit', 'create', '/setting/selectOptions/unit', 'feature', 1, 1, 69, NULL),
(1, 'setting_selectOptions_unit.update', '단위관리 수정', 'Unit Update', '단위를 수정할 수 있는 권한', 'setting_selectOptions_unit', 'update', '/setting/selectOptions/unit', 'feature', 1, 1, 70, NULL),
(1, 'setting_selectOptions_unit.delete', '단위관리 삭제', 'Unit Delete', '단위를 삭제할 수 있는 권한', 'setting_selectOptions_unit', 'delete', '/setting/selectOptions/unit', 'feature', 1, 1, 71, NULL);



-- 삽입된 권한 데이터 확인
permission_id	company_id	permission_code	permission_name	permission_name_en	description	module	action	resource	permission_type	is_system_permission	is_active	sort_order	created_at	created_by	updated_at	updated_by	deleted_at	deleted_by
1	1	ct_request.read	CT 의뢰 조회	CT Request Read	CT 의뢰 정보를 조회할 수 있는 권한	ct_request	read	/ct/request	feature	1	1	1	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
2	1	ct_request.create	CT 의뢰 등록	CT Request Create	CT 의뢰를 등록할 수 있는 권한	ct_request	create	/ct/request	feature	1	1	2	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
3	1	ct_request.update	CT 의뢰 수정	CT Request Update	CT 의뢰를 수정할 수 있는 권한	ct_request	update	/ct/request	feature	1	1	3	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
4	1	ct_request.delete	CT 의뢰 삭제	CT Request Delete	CT 의뢰를 삭제할 수 있는 권한	ct_request	delete	/ct/request	feature	1	1	4	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
5	1	ct_request.approval	CT 의뢰 결재	CT Request Approval	CT 의뢰를 결재할 수 있는 권한	ct_request	approval	/ct/request	feature	1	1	5	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
6	1	ct_testReport.read	CT 시험성적서 조회	CT Test Report Read	CT 시험성적서를 조회할 수 있는 권한	ct_testReport	read	/ct/testReport	feature	1	1	6	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
7	1	ct_testReport.create	CT 시험성적서 작성	CT Test Report Create	CT 시험성적서를 작성할 수 있는 권한	ct_testReport	create	/ct/testReport	feature	1	1	7	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
8	1	ct_testReport.update	CT 시험성적서 수정	CT Test Report Update	CT 시험성적서를 수정할 수 있는 권한	ct_testReport	update	/ct/testReport	feature	1	1	8	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
9	1	ct_testReport.delete	CT 시험성적서 삭제	CT Test Report Delete	CT 시험성적서를 삭제할 수 있는 권한	ct_testReport	delete	/ct/testReport	feature	1	1	9	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
10	1	ct_schedule.read	CT 일정 조회	CT Schedule Read	CT 일정을 조회할 수 있는 권한	ct_schedule	read	/ct/schedule	feature	1	1	10	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
11	1	ct_schedule.update	CT 일정 수정	CT Schedule Update	CT 일정을 수정할 수 있는 권한	ct_schedule	update	/ct/schedule	feature	1	1	11	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
12	1	internal_request.read	내부 분석 의뢰 조회	Internal Request Read	내부 분석 의뢰를 조회할 수 있는 권한	internal_request	read	/internal/request	feature	1	1	12	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
13	1	internal_request.create	내부 분석 의뢰 등록	Internal Request Create	내부 분석 의뢰를 등록할 수 있는 권한	internal_request	create	/internal/request	feature	1	1	13	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
14	1	internal_request.update	내부 분석 의뢰 수정	Internal Request Update	내부 분석 의뢰를 수정할 수 있는 권한	internal_request	update	/internal/request	feature	1	1	14	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
15	1	internal_request.delete	내부 분석 의뢰 삭제	Internal Request Delete	내부 분석 의뢰를 삭제할 수 있는 권한	internal_request	delete	/internal/request	feature	1	1	15	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
16	1	internal_request.approval	내부 분석 의뢰 결재	Internal Request Approval	내부 분석 의뢰를 결재할 수 있는 권한	internal_request	approval	/internal/request	feature	1	1	16	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
17	1	internal_testReport.read	내부 분석 시험성적서 조회	Internal Test Report Read	내부 분석 시험성적서를 조회할 수 있는 권한	internal_testReport	read	/internal/testReport	feature	1	1	17	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
18	1	internal_testReport.create	내부 분석 시험성적서 작성	Internal Test Report Create	내부 분석 시험성적서를 작성할 수 있는 권한	internal_testReport	create	/internal/testReport	feature	1	1	18	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
19	1	internal_testReport.update	내부 분석 시험성적서 수정	Internal Test Report Update	내부 분석 시험성적서를 수정할 수 있는 권한	internal_testReport	update	/internal/testReport	feature	1	1	19	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
20	1	internal_testReport.delete	내부 분석 시험성적서 삭제	Internal Test Report Delete	내부 분석 시험성적서를 삭제할 수 있는 권한	internal_testReport	delete	/internal/testReport	feature	1	1	20	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
21	1	internal_schedule.read	내부 분석 일정 조회	Internal Schedule Read	내부 분석 일정을 조회할 수 있는 권한	internal_schedule	read	/internal/schedule	feature	1	1	21	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
22	1	internal_schedule.update	내부 분석 일정 수정	Internal Schedule Update	내부 분석 일정을 수정할 수 있는 권한	internal_schedule	update	/internal/schedule	feature	1	1	22	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
23	1	external_request.read	외부 분석 의뢰 조회	External Request Read	외부 분석 의뢰를 조회할 수 있는 권한	external_request	read	/external/request	feature	1	1	23	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
24	1	external_request.create	외부 분석 의뢰 등록	External Request Create	외부 분석 의뢰를 등록할 수 있는 권한	external_request	create	/external/request	feature	1	1	24	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
25	1	external_request.update	외부 분석 의뢰 수정	External Request Update	외부 분석 의뢰를 수정할 수 있는 권한	external_request	update	/external/request	feature	1	1	25	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
26	1	external_request.delete	외부 분석 의뢰 삭제	External Request Delete	외부 분석 의뢰를 삭제할 수 있는 권한	external_request	delete	/external/request	feature	1	1	26	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
27	1	external_request.approval	외부 분석 의뢰 결재	External Request Approval	외부 분석 의뢰를 결재할 수 있는 권한	external_request	approval	/external/request	feature	1	1	27	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
28	1	external_testReport.read	외부 분석 시험성적서 조회	External Test Report Read	외부 분석 시험성적서를 조회할 수 있는 권한	external_testReport	read	/external/testReport	feature	1	1	28	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
29	1	external_testReport.create	외부 분석 시험성적서 작성	External Test Report Create	외부 분석 시험성적서를 작성할 수 있는 권한	external_testReport	create	/external/testReport	feature	1	1	29	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
30	1	external_testReport.update	외부 분석 시험성적서 수정	External Test Report Update	외부 분석 시험성적서를 수정할 수 있는 권한	external_testReport	update	/external/testReport	feature	1	1	30	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
31	1	external_testReport.delete	외부 분석 시험성적서 삭제	External Test Report Delete	외부 분석 시험성적서를 삭제할 수 있는 권한	external_testReport	delete	/external/testReport	feature	1	1	31	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
32	1	external_schedule.read	외부 분석 일정 조회	External Schedule Read	외부 분석 일정을 조회할 수 있는 권한	external_schedule	read	/external/schedule	feature	1	1	32	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
33	1	external_schedule.update	외부 분석 일정 수정	External Schedule Update	외부 분석 일정을 수정할 수 있는 권한	external_schedule	update	/external/schedule	feature	1	1	33	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
34	1	preservative_request.read	방부력 테스트 의뢰 조회	Preservative Request Read	방부력 테스트 의뢰를 조회할 수 있는 권한	preservative_request	read	/preservative/request	feature	1	1	34	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
35	1	preservative_request.create	방부력 테스트 의뢰 등록	Preservative Request Create	방부력 테스트 의뢰를 등록할 수 있는 권한	preservative_request	create	/preservative/request	feature	1	1	35	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
36	1	preservative_request.update	방부력 테스트 의뢰 수정	Preservative Request Update	방부력 테스트 의뢰를 수정할 수 있는 권한	preservative_request	update	/preservative/request	feature	1	1	36	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
37	1	preservative_request.delete	방부력 테스트 의뢰 삭제	Preservative Request Delete	방부력 테스트 의뢰를 삭제할 수 있는 권한	preservative_request	delete	/preservative/request	feature	1	1	37	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
38	1	preservative_request.approval	방부력 테스트 의뢰 결재	Preservative Request Approval	방부력 테스트 의뢰를 결재할 수 있는 권한	preservative_request	approval	/preservative/request	feature	1	1	38	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
39	1	preservative_testReport.read	방부력 테스트 시험성적서 조회	Preservative Test Report Read	방부력 테스트 시험성적서를 조회할 수 있는 권한	preservative_testReport	read	/preservative/testReport	feature	1	1	39	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
40	1	preservative_testReport.create	방부력 테스트 시험성적서 작성	Preservative Test Report Create	방부력 테스트 시험성적서를 작성할 수 있는 권한	preservative_testReport	create	/preservative/testReport	feature	1	1	40	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
41	1	preservative_testReport.update	방부력 테스트 시험성적서 수정	Preservative Test Report Update	방부력 테스트 시험성적서를 수정할 수 있는 권한	preservative_testReport	update	/preservative/testReport	feature	1	1	41	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
42	1	preservative_testReport.delete	방부력 테스트 시험성적서 삭제	Preservative Test Report Delete	방부력 테스트 시험성적서를 삭제할 수 있는 권한	preservative_testReport	delete	/preservative/testReport	feature	1	1	42	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
43	1	preservative_schedule.read	방부력 테스트 일정 조회	Preservative Schedule Read	방부력 테스트 일정을 조회할 수 있는 권한	preservative_schedule	read	/preservative/schedule	feature	1	1	43	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
44	1	preservative_schedule.update	방부력 테스트 일정 수정	Preservative Schedule Update	방부력 테스트 일정을 수정할 수 있는 권한	preservative_schedule	update	/preservative/schedule	feature	1	1	44	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
45	1	setting_default.read	사용자 기초 설정 조회	User Default Setting Read	사용자 기초 설정을 조회할 수 있는 권한	setting_default	read	/setting/default	feature	1	1	45	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
46	1	setting_default.update	사용자 기초 설정 수정	User Default Setting Update	사용자 기초 설정을 수정할 수 있는 권한	setting_default	update	/setting/default	feature	1	1	46	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
47	1	setting_auth.read	사용자 관리 조회	User Management Read	사용자 관리 정보를 조회할 수 있는 권한	setting_auth	read	/setting/auth	feature	1	1	47	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
48	1	setting_auth.create	사용자 관리 등록	User Management Create	사용자를 등록할 수 있는 권한	setting_auth	create	/setting/auth	feature	1	1	48	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
49	1	setting_auth.update	사용자 관리 수정	User Management Update	사용자 정보를 수정할 수 있는 권한	setting_auth	update	/setting/auth	feature	1	1	49	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
50	1	setting_auth.delete	사용자 관리 삭제	User Management Delete	사용자를 삭제할 수 있는 권한	setting_auth	delete	/setting/auth	feature	1	1	50	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
51	1	setting_approval.read	결재선 관리 조회	Approval Line Read	결재선을 조회할 수 있는 권한	setting_approval	read	/setting/approval	feature	1	1	51	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
52	1	setting_approval.create	결재선 관리 등록	Approval Line Create	결재선을 등록할 수 있는 권한	setting_approval	create	/setting/approval	feature	1	1	52	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
53	1	setting_approval.update	결재선 관리 수정	Approval Line Update	결재선을 수정할 수 있는 권한	setting_approval	update	/setting/approval	feature	1	1	53	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
54	1	setting_approval.delete	결재선 관리 삭제	Approval Line Delete	결재선을 삭제할 수 있는 권한	setting_approval	delete	/setting/approval	feature	1	1	54	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
55	1	setting_selectOptions.read	선택 항목 관리 조회	Select Options Read	선택 항목을 조회할 수 있는 권한	setting_selectOptions	read	/setting/selectOptions	feature	1	1	55	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
56	1	setting_selectOptions_manageLabsDept.read	제형담당부서 조회	Labs Dept Read	제형담당부서를 조회할 수 있는 권한	setting_selectOptions_manageLabsDept	read	/setting/selectOptions/manageLabsDept	feature	1	1	56	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
57	1	setting_selectOptions_manageLabsDept.create	제형담당부서 등록	Labs Dept Create	제형담당부서를 등록할 수 있는 권한	setting_selectOptions_manageLabsDept	create	/setting/selectOptions/manageLabsDept	feature	1	1	57	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
58	1	setting_selectOptions_manageLabsDept.update	제형담당부서 수정	Labs Dept Update	제형담당부서를 수정할 수 있는 권한	setting_selectOptions_manageLabsDept	update	/setting/selectOptions/manageLabsDept	feature	1	1	58	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
59	1	setting_selectOptions_manageLabsDept.delete	제형담당부서 삭제	Labs Dept Delete	제형담당부서를 삭제할 수 있는 권한	setting_selectOptions_manageLabsDept	delete	/setting/selectOptions/manageLabsDept	feature	1	1	59	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
60	1	setting_selectOptions_managerType.read	담당자유형 조회	Manager Type Read	담당자유형을 조회할 수 있는 권한	setting_selectOptions_managerType	read	/setting/selectOptions/managerType	feature	1	1	60	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
61	1	setting_selectOptions_managerType.create	담당자유형 등록	Manager Type Create	담당자유형을 등록할 수 있는 권한	setting_selectOptions_managerType	create	/setting/selectOptions/managerType	feature	1	1	61	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
62	1	setting_selectOptions_managerType.update	담당자유형 수정	Manager Type Update	담당자유형을 수정할 수 있는 권한	setting_selectOptions_managerType	update	/setting/selectOptions/managerType	feature	1	1	62	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
63	1	setting_selectOptions_managerType.delete	담당자유형 삭제	Manager Type Delete	담당자유형을 삭제할 수 있는 권한	setting_selectOptions_managerType	delete	/setting/selectOptions/managerType	feature	1	1	63	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
64	1	setting_selectOptions_judgment.read	판정관리 조회	Judgment Read	판정을 조회할 수 있는 권한	setting_selectOptions_judgment	read	/setting/selectOptions/judgment	feature	1	1	64	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
65	1	setting_selectOptions_judgment.create	판정관리 등록	Judgment Create	판정을 등록할 수 있는 권한	setting_selectOptions_judgment	create	/setting/selectOptions/judgment	feature	1	1	65	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
66	1	setting_selectOptions_judgment.update	판정관리 수정	Judgment Update	판정을 수정할 수 있는 권한	setting_selectOptions_judgment	update	/setting/selectOptions/judgment	feature	1	1	66	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
67	1	setting_selectOptions_judgment.delete	판정관리 삭제	Judgment Delete	판정을 삭제할 수 있는 권한	setting_selectOptions_judgment	delete	/setting/selectOptions/judgment	feature	1	1	67	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
68	1	setting_selectOptions_unit.read	단위관리 조회	Unit Read	단위를 조회할 수 있는 권한	setting_selectOptions_unit	read	/setting/selectOptions/unit	feature	1	1	68	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
69	1	setting_selectOptions_unit.create	단위관리 등록	Unit Create	단위를 등록할 수 있는 권한	setting_selectOptions_unit	create	/setting/selectOptions/unit	feature	1	1	69	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
70	1	setting_selectOptions_unit.update	단위관리 수정	Unit Update	단위를 수정할 수 있는 권한	setting_selectOptions_unit	update	/setting/selectOptions/unit	feature	1	1	70	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]
71	1	setting_selectOptions_unit.delete	단위관리 삭제	Unit Delete	단위를 삭제할 수 있는 권한	setting_selectOptions_unit	delete	/setting/selectOptions/unit	feature	1	1	71	2026-02-04 06:10:11.000	[NULL]	2026-02-04 06:10:11.000	[NULL]	[NULL]	[NULL]





-- ========================================
-- 사용자 로그인 시 필요한 데이터 조회 쿼리
-- ========================================

-- 1. 사용자 기본 정보 조회 (등급, 부서 포함)
-- 사용법: WHERE u.user_name = ? AND u.company_id = ? AND u.is_active = 1
SELECT 
    u.user_id,
    u.company_id,
    u.user_name,
    u.email,
    u.user_full_name,
    u.user_full_name_en,
    u.phone,
    u.mobile,
    u.employee_number,
    u.position,
    u.job_title,
    u.status,
    u.is_locked,
    u.last_login_at,
    -- 부서 정보
    d.department_id,
    d.department_name,
    d.department_code,
    -- 등급 정보
    ug.user_grade_id,
    ug.grade_code,
    ug.grade_name
FROM 
    `user` u
    LEFT JOIN `department` d ON u.department_id = d.department_id
    LEFT JOIN `user_grade` ug ON u.user_grade_id = ug.user_grade_id
WHERE 
    u.user_name = 'jehong'  -- 로그인 시 입력된 사용자명
    AND u.company_id = 1     -- 회사 ID
    AND u.is_active = 1      -- 활성 사용자만
    AND u.deleted_at IS NULL -- 삭제되지 않은 사용자만
    AND u.status = 'active'  -- 활성 상태
    AND u.is_locked = 0;     -- 잠금되지 않은 사용자만


-- 2. 사용자 권한 정보 조회 (역할 및 권한 포함)
-- 사용법: WHERE u.user_id = ? AND u.company_id = ?
SELECT 
    -- 역할 정보
    r.role_id,
    r.role_code,
    r.role_name,
    r.role_name_en,
    r.description AS role_description,
    r.level AS role_level,
    ur.is_primary,
    -- 권한 정보
    p.permission_id,
    p.permission_code,
    p.permission_name,
    p.permission_name_en,
    p.description AS permission_description,
    p.module,
    p.action,
    p.resource,
    p.permission_type
FROM 
    `user` u
    INNER JOIN `user_role` ur ON u.user_id = ur.user_id
    INNER JOIN `role` r ON ur.role_id = r.role_id
    INNER JOIN `role_permission` rp ON r.role_id = rp.role_id
    INNER JOIN `permission` p ON rp.permission_id = p.permission_id
WHERE 
    u.user_id = 1            -- 위 쿼리에서 조회한 user_id
    AND u.company_id = 1     -- 회사 ID
    AND ur.is_active = 1     -- 활성 역할만
    AND ur.deleted_at IS NULL
    AND r.is_active = 1      -- 활성 역할만
    AND r.deleted_at IS NULL
    AND rp.is_active = 1     -- 활성 권한 매핑만
    AND rp.deleted_at IS NULL
    AND p.is_active = 1      -- 활성 권한만
    AND p.deleted_at IS NULL
ORDER BY 
    ur.is_primary DESC,      -- 주 역할 우선
    r.level DESC,            -- 역할 레벨 높은 순
    p.module ASC,            -- 모듈별 정렬
    p.sort_order ASC;        -- 정렬 순서


-- 3. 사용자 커스텀 설정 조회
-- 사용법: WHERE ucs.user_id = ? AND ucs.company_id = ?
SELECT 
    ucs.setting_id,
    ucs.user_id,
    ucs.company_id,
    ucs.default_menu_code,
    ucs.default_page_path,
    ucs.module_default_settings,
    ucs.theme_mode,
    ucs.sidebar_collapsed,
    ucs.items_per_page,
    ucs.date_format,
    ucs.time_format,
    ucs.language,
    ucs.notification_enabled,
    ucs.notification_email,
    ucs.notification_sms,
    ucs.custom_settings
FROM 
    `user_custom_setting` ucs
WHERE 
    ucs.user_id = 1          -- 위 쿼리에서 조회한 user_id
    AND ucs.company_id = 1   -- 회사 ID
    AND ucs.is_active = 1    -- 활성 설정만
    AND ucs.deleted_at IS NULL;


-- ========================================
-- 통합 쿼리 (한 번에 모든 정보 조회 - 선택사항)
-- ========================================
-- 주의: 권한이 많을 경우 중복 행이 발생하므로, 애플리케이션에서 그룹핑 필요
SELECT 
    -- 사용자 정보
    u.user_id,
    u.company_id,
    u.user_name,
    u.email,
    u.user_full_name,
    u.user_full_name_en,
    u.phone,
    u.mobile,
    u.employee_number,
    u.position,
    u.job_title,
    u.status,
    u.is_locked,
    u.last_login_at,
    -- 부서 정보
    d.department_id,
    d.department_name,
    d.department_code,
    -- 등급 정보
    ug.user_grade_id,
    ug.grade_code,
    ug.grade_name,
    -- 역할 정보
    r.role_id,
    r.role_code,
    r.role_name,
    ur.is_primary,
    -- 권한 정보
    p.permission_id,
    p.permission_code,
    p.module,
    p.action,
    -- 커스텀 설정 (JSON 필드는 별도 쿼리 권장)
    ucs.default_menu_code,
    ucs.default_page_path,
    ucs.module_default_settings,
    ucs.theme_mode,
    ucs.sidebar_collapsed,
    ucs.items_per_page,
    ucs.language
FROM 
    `user` u
    LEFT JOIN `department` d ON u.department_id = d.department_id
    LEFT JOIN `user_grade` ug ON u.user_grade_id = ug.user_grade_id
    LEFT JOIN `user_role` ur ON u.user_id = ur.user_id AND ur.is_active = 1 AND ur.deleted_at IS NULL
    LEFT JOIN `role` r ON ur.role_id = r.role_id AND r.is_active = 1 AND r.deleted_at IS NULL
    LEFT JOIN `role_permission` rp ON r.role_id = rp.role_id AND rp.is_active = 1 AND rp.deleted_at IS NULL
    LEFT JOIN `permission` p ON rp.permission_id = p.permission_id AND p.is_active = 1 AND p.deleted_at IS NULL
    LEFT JOIN `user_custom_setting` ucs ON u.user_id = ucs.user_id AND ucs.is_active = 1 AND ucs.deleted_at IS NULL
WHERE 
    u.user_name = 'jehong'
    AND u.company_id = 1
    AND u.is_active = 1
    AND u.deleted_at IS NULL
    AND u.status = 'active'
    AND u.is_locked = 0
ORDER BY 
    ur.is_primary DESC,
    r.level DESC,
    p.module ASC,
    p.sort_order ASC;