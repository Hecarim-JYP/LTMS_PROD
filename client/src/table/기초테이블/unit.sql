-- 단위 관리 테이블
CREATE TABLE `unit` (
  `unit_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `unit_type` varchar(20) DEFAULT NULL COMMENT '단위 사용 구분(부피비, 중량비 혹은 무게, 용량)',
  `unit_code` varchar(30) NOT NULL COMMENT '단위코드',
  `unit_name` varchar(100) NOT NULL COMMENT '단위명',
  `unit_name_en` varchar(100) DEFAULT NULL COMMENT '단위명(영문)',
  `unit_description` varchar(255) DEFAULT NULL COMMENT '단위 설명 (선택)',
  `umunit_code` varchar(100) DEFAULT NULL COMMENT 'ERP 테이블 기준 사용자 정의 코드 PK(마이그레이션 용도)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `unit_code` (`unit_code`),
  UNIQUE KEY `unit_name` (`unit_name`),
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='단위 관리 테이블';


-- 단위 초기 데이터 삽입 쿼리
INSERT INTO unit
(company_id
, unit_type
, unit_code
, unit_name
, unit_name_en
, unit_description
, umunit_code
, sort_order
, created_at)
SELECT
1 AS company_id
,'MEASURE'  AS unit_type
,'ml' AS unit_code
,'ml' AS unit_name
,'milli-liter' AS unit_name_en
,'단위 밀리리터' AS unit_description
,'1020417001' AS umunit_code
,1 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'MEASURE' AS unit_type
,'g' AS unit_code
,'g' AS unit_name
,'gram' AS unit_name_en
,'단위 그램' AS unit_description
,'1020417002' AS umunit_code
,2 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'MEASURE' AS unit_type
,'oz' unit_code
,'oz' AS unit_name
,'Ounce' AS unit_name_en
,'단위 온즈' AS  unit_description
,'1020417003' AS umunit_code
,3 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'RATIO' AS unit_type
,'wgt' unit_code
,'무게비' AS unit_name
,'weight' AS unit_name_en
,'비율 무게비' AS  unit_description
,NULL AS umunit_code
,3 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'RATIO' AS unit_type
,'vol' unit_code
,'부피비' AS unit_name
,'volume' AS unit_name_en
,'비율 부피비' AS  unit_description
,NULL AS umunit_code
,4 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'LEVEL' AS unit_type
,'lv1' unit_code
,'1층상' AS unit_name
,'level-1' AS unit_name_en
,'샘플 유형 층상 1' AS  unit_description
,NULL AS umunit_code
,6 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'LEVEL' AS unit_type
,'lv2' unit_code
,'2층상' AS unit_name
,'level-2' AS unit_name_en
,'샘플 유형 층상 2' AS  unit_description
,NULL AS umunit_code
,7 AS sort_order
,CURRENT_TIMESTAMP() AS created_at;