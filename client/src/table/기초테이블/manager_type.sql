-- 담당자 유형 관리 테이블
CREATE TABLE manager_type (
  `manager_type_id` INT AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `module_category` VARCHAR(10) NULL COMMENT '모듈 구분 코드',
  `manager_type_code` VARCHAR(30) UNIQUE NULL COMMENT '유형코드',
  `manager_type_name` VARCHAR(100) UNIQUE NULL COMMENT '담당자 유형명',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`manager_type_id`),
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='담당자 유형 관리 테이블';


-- 담당자 유형 초기 데이터 삽입 쿼리
INSERT INTO manager_type
(company_id
,module_category
,manager_type_code
,manager_type_name
,sort_order)
SELECT
1 AS company_id
,'CT' AS module_category
,'LAB_MGR' AS manager_type_code
,'제형담당자' AS manager_type_name
,1 AS sort_order
UNION ALL
SELECT
1 AS company_id
,'CT' AS module_category
,'LAB_DEPT' AS manager_type_code
,'제형담당부서' AS manager_type_name
,2 AS sort_order
UNION ALL
SELECT
1 AS company_id
,'CT' AS module_category
,'SALES_MGR' AS manager_type_code
,'영업담당자' AS manager_type_name
,3 AS sort_order
UNION ALL
SELECT
1 AS company_id
,'CT' AS module_category
,'CT_MGR' AS manager_type_code
,'CT담당자' AS manager_type_name
,4 AS sort_order;