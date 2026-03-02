-- 역할(Role) 테이블
CREATE TABLE `role` (
  `role_id` INT AUTO_INCREMENT COMMENT 'PK',
  `company_id` INT(11) NOT NULL DEFAULT 1 COMMENT '회사 ID (외래키)',
  `role_code` VARCHAR(50) NOT NULL COMMENT '역할 코드 (admin, manager, user, guest 등)',
  `role_name` VARCHAR(100) NOT NULL COMMENT '역할명 (관리자, 매니저, 사용자, 게스트)',
  `role_name_en` VARCHAR(100) DEFAULT NULL COMMENT '역할 영문명',
  `description` TEXT DEFAULT NULL COMMENT '역할 설명',
  `level` INT DEFAULT 0 COMMENT '역할 레벨 (숫자가 높을수록 높은 권한)',
  `is_system_role` TINYINT(1) DEFAULT 0 COMMENT '시스템 기본 역할 여부 (1: 시스템 역할, 0: 사용자 정의)',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` INT(11) DEFAULT 1 COMMENT '정렬 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT '생성일시',
  `created_by` INT(11) DEFAULT NULL COMMENT '생성자 ID (외래키)',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP() COMMENT '수정일시',
  `updated_by` INT(11) DEFAULT NULL COMMENT '수정자 ID (외래키)',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '삭제일시 (Soft Delete)',
  `deleted_by` INT(11) DEFAULT NULL COMMENT '삭제자 ID (외래키)',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uk_company_role_code` (`company_id`, `role_code`, `deleted_at`) COMMENT '회사별 역할 코드 고유 제약',
  KEY `idx_company_id` (`company_id`) COMMENT '회사별 인덱스',
  KEY `idx_role_code` (`role_code`) COMMENT '역할 코드 인덱스',
  KEY `idx_is_system_role` (`is_system_role`) COMMENT '시스템 역할 인덱스',
  KEY `idx_is_active` (`is_active`) COMMENT '활성 여부 인덱스',
  KEY `idx_level` (`level`) COMMENT '역할 레벨 인덱스',
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`, `deleted_at`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='역할(Role) 테이블 - RBAC 패턴';

-- 역할 데이터 삽입
INSERT INTO `role` (
  `company_id`,
  `role_code`,
  `role_name`,
  `role_name_en`,
  `description`,
  `level`,
  `is_system_role`,
  `is_active`,
  `sort_order`,
  `created_by`
) VALUES
-- 관리자 역할
(1, 'ADMIN', '관리자', 'Administrator', '시스템의 모든 기능과 설정에 접근할 수 있는 최고 권한 역할', 100, 1, 1, 1, NULL),
-- 매니저 역할
(1, 'MANAGER', '매니저', 'Manager', '부서 또는 팀을 관리하며, 담당 영역의 데이터 관리 및 승인 권한을 가진 역할', 50, 1, 1, 2, NULL),
-- 일반 사용자 역할
(1, 'USER', '사용자', 'User', '시스템의 기본 기능을 사용할 수 있는 일반 사용자 역할', 10, 1, 1, 3, NULL),
-- 게스트 역할
(1, 'GUEST', '게스트', 'Guest', '제한적인 조회 권한만 가진 게스트 역할', 1, 1, 1, 4, NULL);


-- 사용자 정보 테이블 - 보안 강화 버전
role_id	company_id	role_code	role_name	role_name_en	description	level	is_system_role	is_active	sort_order	created_at	created_by	updated_at	updated_by	deleted_at	deleted_by
1	1	ADMIN	관리자	Administrator	시스템의 모든 기능과 설정에 접근할 수 있는 최고 권한 역할	100	1	1	1	2026-02-03 11:33:37.000	[NULL]	2026-02-03 11:33:37.000	[NULL]	[NULL]	[NULL]
2	1	MANAGER	매니저	Manager	부서 또는 팀을 관리하며, 담당 영역의 데이터 관리 및 승인 권한을 가진 역할	50	1	1	2	2026-02-03 11:33:37.000	[NULL]	2026-02-03 11:33:37.000	[NULL]	[NULL]	[NULL]
3	1	USER	사용자	User	시스템의 기본 기능을 사용할 수 있는 일반 사용자 역할	10	1	1	3	2026-02-03 11:33:37.000	[NULL]	2026-02-03 11:33:37.000	[NULL]	[NULL]	[NULL]
4	1	GUEST	게스트	Guest	제한적인 조회 권한만 가진 게스트 역할	1	1	1	4	2026-02-03 11:33:37.000	[NULL]	2026-02-03 11:33:37.000	[NULL]	[NULL]	[NULL]