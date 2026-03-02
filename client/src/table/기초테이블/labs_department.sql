-- 제형담당부서 관리 테이블
CREATE TABLE labs_department (
  `labs_department_id` INT AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `parent_department_code` VARCHAR(10) NULL COMMENT '상위부서코드',
  `labs_department_code` VARCHAR(30) UNIQUE NULL COMMENT '부서유형코드',
  `labs_department_name` VARCHAR(100) UNIQUE NULL COMMENT '부서명',
  `labs_department_description` VARCHAR(255) DEFAULT NULL COMMENT '부서 설명',
  `labs_department_email` VARCHAR(100) DEFAULT NULL COMMENT '부서 이메일 주소',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`labs_department_id`),
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='제형담당부서 관리 테이블';


-- 제형담당부서 데이터 INSERT
INSERT INTO labs_department (
  company_id,
  parent_department_code,
  labs_department_code,
  labs_department_name,
  labs_department_description,
  labs_department_email,
  is_active,
  sort_order
) VALUES
  (1, 'CCM', 'CCM1', 'CCM1팀', 'CCM1팀 담당 부서', '', 1, 1),
  (1, 'CCM', 'CCM2', 'CCM2팀', 'CCM2팀 담당 부서', '', 1, 2),
  (1, 'CCM', 'CCM3', 'CCM3팀', 'CCM3팀 담당 부서', '', 1, 3),
  (1, 'CCB', 'CCB1', 'CCB1팀', 'CCB1팀 담당 부서', '', 1, 4),
  (1, 'CCB', 'CCB2', 'CCB2팀', 'CCB2팀 담당 부서', '', 1, 5),
  (1, 'CCS', 'CCS1', 'CCS1팀', 'CCS1팀 담당 부서', '', 1, 6),
  (1, 'CCS', 'CCS2', 'CCS2팀', 'CCS2팀 담당 부서', '', 1, 7),
  (1, 'CCS', 'CCS3', 'CCS3팀', 'CCS3팀 담당 부서', '', 1, 8),
  (1, 'CCS', 'CCS4', 'CCS4팀', 'CCS4팀 담당 부서', '', 1, 9),
  (1, NULL, 'FRAGRANCE', '향료팀', '향료팀 담당 부서', '', 1, 10);