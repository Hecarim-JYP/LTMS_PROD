-- ========================================
-- 개선된 메뉴 테이블 (권한 시스템 재설계)
-- ========================================
-- 변경사항:
-- 1. available_actions 컬럼 제거 (권한은 permission 테이블로 분리)
-- 2. third_category 컬럼 추가 (depth 3~4 구조 지원)
-- 3. 메뉴 접근 권한과 동작 권한 분리
-- ========================================

-- //DROP TABLE IF EXISTS `menu`;

CREATE TABLE `menu` (
  `menu_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` INT(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `menu_code` VARCHAR(50) NOT NULL COMMENT '메뉴 고유 코드 (권한 관리용)',
  `first_category` VARCHAR(50) DEFAULT NULL COMMENT '1depth 카테고리명',
  `second_category` VARCHAR(50) DEFAULT NULL COMMENT '2depth 카테고리명',
  `third_category` VARCHAR(50) DEFAULT NULL COMMENT '3depth 카테고리명',
  `menu_name` VARCHAR(100) NOT NULL COMMENT '메뉴명',
  `menu_path` VARCHAR(300) DEFAULT NULL COMMENT 'URL 경로',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '아이콘 클래스명',
  `depth` TINYINT(1) NOT NULL COMMENT '메뉴 깊이 (1: 1depth, 2: 2depth, 3: 3depth, 4: 4depth)',
  `requires_permission` TINYINT(1) DEFAULT 1 COMMENT '권한 체크 필요 여부 (1: 필요, 0: 불필요)',
  `parent_menu_id` INT(11) DEFAULT NULL COMMENT '부모 메뉴 ID (계층 구조 명확화)',
  `sort_order` INT(11) DEFAULT 1 COMMENT '정렬 순서',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT '생성일',
  `created_by` INT(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP() COMMENT '수정일',
  `updated_by` INT(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '삭제일',
  `deleted_by` INT(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `uk_code` (`menu_code`) COMMENT '메뉴 코드 고유 제약',
  UNIQUE KEY `uk_category_name` (`first_category`, `second_category`, `third_category`, `menu_name`) COMMENT '카테고리별 메뉴명 중복 방지',
  KEY `idx_company_first_category` (`company_id`, `first_category`, `is_active`, `sort_order`) COMMENT '1depth 카테고리별 활성 메뉴 조회',
  KEY `idx_depth_active` (`depth`, `is_active`, `sort_order`) COMMENT 'depth별 활성 메뉴 정렬 조회',
  KEY `idx_path` (`menu_path`) COMMENT 'URL 경로로 메뉴 검색',
  KEY `idx_parent_menu_id` (`parent_menu_id`) COMMENT '부모 메뉴 조회',
  KEY `idx_company_active` (`company_id`, `is_active`, `deleted_at`) COMMENT '회사별 활성 메뉴 조회'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메뉴 테이블 - 권한 시스템 분리';


-- ========================================
-- 메뉴 데이터 삽입 (depth 3 구조)
-- ========================================

INSERT INTO `menu` (
  company_id, menu_code, first_category, second_category, third_category,
  menu_name, menu_path, icon, depth, parent_menu_id, requires_permission,
  sort_order, is_active
) VALUES
-- ========================================
-- CT 모듈
-- ========================================
-- 1depth: CT
(1, 'ct', NULL, NULL, NULL, 'CT', NULL, NULL, 1, NULL, 0, 1, 1),

-- 2depth: CT 하위 카테고리
(1, 'ct_request_category', 'ct', NULL, NULL, '의뢰', NULL, NULL, 2, 1, 0, 1, 1),
(1, 'ct_testReport_category', 'ct', NULL, NULL, '시험성적서', NULL, NULL, 2, 1, 0, 2, 1),
(1, 'ct_schedule_category', 'ct', NULL, NULL, '일정 현황', NULL, NULL, 2, 1, 0, 3, 1),

-- 3depth: CT > 의뢰 하위 메뉴 (실제 페이지)
(1, 'ct_request_read', 'ct', 'request', NULL, '의뢰 조회', '/ct/request/read', NULL, 3, 2, 1, 1, 1),
(1, 'ct_request_create', 'ct', 'request', NULL, '의뢰 등록', '/ct/request/create', NULL, 3, 2, 1, 2, 1),
(1, 'ct_request_approval', 'ct', 'request', NULL, '의뢰 결재', '/ct/request/approval', NULL, 3, 2, 1, 3, 1),

-- 3depth: CT > 시험성적서 하위 메뉴
(1, 'ct_testReport_read', 'ct', 'testReport', NULL, '성적서 조회', '/ct/testReport/read', NULL, 3, 3, 1, 1, 1),
(1, 'ct_testReport_report', 'ct', 'testReport', NULL, '성적서 작성', '/ct/testReport/report', NULL, 3, 3, 1, 2, 1),
(1, 'ct_testReport_standard', 'ct', 'testReport', NULL, '규격 관리', '/ct/testReport/standard', NULL, 3, 3, 1, 3, 1),

-- 3depth: CT > 일정 현황 하위 메뉴
(1, 'ct_schedule_ct', 'ct', 'schedule', NULL, 'CT 일정', '/ct/schedule/ct', NULL, 3, 4, 1, 1, 1),
(1, 'ct_schedule_report', 'ct', 'schedule', NULL, '성적서 일정', '/ct/schedule/report', NULL, 3, 4, 1, 2, 1),

-- ========================================
-- 내부 성분 분석 모듈
-- ========================================
-- 1depth: 내부 성분 분석
(1, 'internal', NULL, NULL, NULL, '내부 성분 분석', NULL, NULL, 1, NULL, 0, 2, 1),

-- 2depth: 내부 성분 분석 하위 카테고리
(1, 'internal_request_category', 'internal', NULL, NULL, '의뢰', NULL, NULL, 2, 13, 0, 1, 1),
(1, 'internal_testReport_category', 'internal', NULL, NULL, '시험성적서', NULL, NULL, 2, 13, 0, 2, 1),
(1, 'internal_schedule_category', 'internal', NULL, NULL, '일정 현황', NULL, NULL, 2, 13, 0, 3, 1),

-- 3depth: 내부 성분 분석 > 의뢰 하위 메뉴
(1, 'internal_request_read', 'internal', 'request', NULL, '의뢰 조회', '/internal/request/read', NULL, 3, 14, 1, 1, 1),
(1, 'internal_request_create', 'internal', 'request', NULL, '의뢰 등록', '/internal/request/create', NULL, 3, 14, 1, 2, 1),
(1, 'internal_request_approve', 'internal', 'request', NULL, '의뢰 결재', '/internal/request/approve', NULL, 3, 14, 1, 3, 1),

-- 3depth: 내부 성분 분석 > 시험성적서 하위 메뉴
(1, 'internal_testReport_read', 'internal', 'testReport', NULL, '성적서 조회', '/internal/testReport/read', NULL, 3, 15, 1, 1, 1),

-- 3depth: 내부 성분 분석 > 일정 현황 하위 메뉴
(1, 'internal_schedule_read', 'internal', 'schedule', NULL, '일정 조회', '/internal/schedule/read', NULL, 3, 16, 1, 1, 1),

-- ========================================
-- 외부 성분 분석 모듈
-- ========================================
-- 1depth: 외부 성분 분석
(1, 'external', NULL, NULL, NULL, '외부 성분 분석', NULL, NULL, 1, NULL, 0, 3, 1),

-- 2depth: 외부 성분 분석 하위 카테고리
(1, 'external_request_category', 'external', NULL, NULL, '의뢰', NULL, NULL, 2, 23, 0, 1, 1),
(1, 'external_testReport_category', 'external', NULL, NULL, '시험성적서', NULL, NULL, 2, 23, 0, 2, 1),
(1, 'external_schedule_category', 'external', NULL, NULL, '일정 현황', NULL, NULL, 2, 23, 0, 3, 1),

-- 3depth: 외부 성분 분석 > 의뢰 하위 메뉴
(1, 'external_request_read', 'external', 'request', NULL, '의뢰 조회', '/external/request/read', NULL, 3, 24, 1, 1, 1),
(1, 'external_request_create', 'external', 'request', NULL, '의뢰 등록', '/external/request/create', NULL, 3, 24, 1, 2, 1),
(1, 'external_request_approve', 'external', 'request', NULL, '의뢰 결재', '/external/request/approve', NULL, 3, 24, 1, 3, 1),

-- 3depth: 외부 성분 분석 > 시험성적서 하위 메뉴
(1, 'external_testReport_read', 'external', 'testReport', NULL, '성적서 조회', '/external/testReport/read', NULL, 3, 25, 1, 1, 1),

-- 3depth: 외부 성분 분석 > 일정 현황 하위 메뉴
(1, 'external_schedule_read', 'external', 'schedule', NULL, '일정 조회', '/external/schedule/read', NULL, 3, 26, 1, 1, 1),

-- ========================================
-- 방부력 테스트 모듈
-- ========================================
-- 1depth: 방부력 테스트
(1, 'preservative', NULL, NULL, NULL, '방부력 테스트', NULL, NULL, 1, NULL, 0, 4, 1),

-- 2depth: 방부력 테스트 하위 카테고리
(1, 'preservative_request_category', 'preservative', NULL, NULL, '의뢰', NULL, NULL, 2, 33, 0, 1, 1),
(1, 'preservative_testReport_category', 'preservative', NULL, NULL, '시험성적서', NULL, NULL, 2, 33, 0, 2, 1),
(1, 'preservative_schedule_category', 'preservative', NULL, NULL, '일정 현황', NULL, NULL, 2, 33, 0, 3, 1),

-- 3depth: 방부력 테스트 > 의뢰 하위 메뉴
(1, 'preservative_request_read', 'preservative', 'request', NULL, '의뢰 조회', '/preservative/request/read', NULL, 3, 34, 1, 1, 1),
(1, 'preservative_request_create', 'preservative', 'request', NULL, '의뢰 등록', '/preservative/request/create', NULL, 3, 34, 1, 2, 1),
(1, 'preservative_request_approve', 'preservative', 'request', NULL, '의뢰 결재', '/preservative/request/approve', NULL, 3, 34, 1, 3, 1),

-- 3depth: 방부력 테스트 > 시험성적서 하위 메뉴
(1, 'preservative_testReport_read', 'preservative', 'testReport', NULL, '성적서 조회', '/preservative/testReport/read', NULL, 3, 35, 1, 1, 1),

-- 3depth: 방부력 테스트 > 일정 현황 하위 메뉴
(1, 'preservative_schedule_read', 'preservative', 'schedule', NULL, '일정 조회', '/preservative/schedule/read', NULL, 3, 36, 1, 1, 1),

-- ========================================
-- 환경 설정 모듈
-- ========================================
-- 1depth: 환경 설정
(1, 'setting', NULL, NULL, NULL, '환경 설정', NULL, NULL, 1, NULL, 0, 5, 1),

-- 2depth: 환경 설정 하위 카테고리
(1, 'setting_default', 'setting', NULL, NULL, '개인 설정', '/setting/default', NULL, 2, 43, 1, 1, 1),
(1, 'setting_auth', 'setting', NULL, NULL, '권한 설정', '/setting/auth', NULL, 2, 43, 1, 2, 1),
(1, 'setting_user', 'setting', NULL, NULL, '사용자 관리', '/setting/user', NULL, 2, 43, 1, 3, 1),
(1, 'setting_selectOptions_category', 'setting', NULL, NULL, '선택 항목 관리', NULL, NULL, 2, 43, 0, 4, 1),

-- 3depth: 환경 설정 > 선택 항목 관리 하위 메뉴
(1, 'setting_selectOptions_labsDept', 'setting', 'selectOptions', NULL, '제형담당부서', '/setting/selectOptions/labsDept', NULL, 3, 47, 1, 1, 1),
(1, 'setting_selectOptions_managerType', 'setting', 'selectOptions', NULL, '담당자유형', '/setting/selectOptions/managerType', NULL, 3, 47, 1, 2, 1),
(1, 'setting_selectOptions_judgment', 'setting', 'selectOptions', NULL, '판정관리', '/setting/selectOptions/judgment', NULL, 3, 47, 1, 3, 1),
(1, 'setting_selectOptions_unit', 'setting', 'selectOptions', NULL, '단위관리', '/setting/selectOptions/unit', NULL, 3, 47, 1, 4, 1);

-- ========================================
-- 데이터 확인 쿼리
-- ========================================
-- SELECT menu_id, menu_code, menu_name, depth, parent_menu_id, menu_path 
-- FROM menu 
-- ORDER BY sort_order, depth, menu_id;
