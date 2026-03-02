-- 판정 관리 테이블
CREATE TABLE `judgment` (
  `judgment_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `judgment_code` varchar(30) NOT NULL COMMENT '판정코드',
  `judgment_name` varchar(100) NOT NULL COMMENT '판정명',
  `judgment_description` varchar(255) DEFAULT NULL COMMENT '판정 설명 (선택)',
  `result_code` varchar(30) DEFAULT NULL COMMENT '결과 코드',
  `umresult_code` varchar(100) DEFAULT NULL COMMENT 'ERP 테이블 기준 사용자 정의 코드 PK(마이그레이션 용도)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`judgment_id`),
  UNIQUE KEY `judgment_code` (`judgment_code`),
  UNIQUE KEY `judgment_name` (`judgment_name`),
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='판정 관리 테이블';


-- 판정 데이터 삽입 쿼리
INSERT INTO judgment
(company_id
, judgment_code
, judgment_name
, result_code
, judgment_description
, umresult_code
, sort_order
, created_at)
SELECT
1 AS company_id
,'IN_PROGRESS' AS judgment_code
,'시험 중' AS  judgment_name
,'PROGRESS' AS  result_code
,'시험 진행 중' AS judgment_description
,'1022696005' AS  umresult_code
,5 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'ON_HOLD' AS judgment_code
,'접수 보류' AS  judgment_name
,'HOLD' AS  result_code
,'접수 보류 상태' AS judgment_description
,'1022696006' AS  umresult_code
,6 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'REVIEW_CUST' AS judgment_code
,'고객사 협의 필요' AS  judgment_name
,'HOLD' AS  result_code
,'고객 협의 필요' AS judgment_description
,'1022696003' AS  umresult_code
,3 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'PASS' AS judgment_code
,'적합' AS  judgment_name
,'PASS' AS  result_code
,'시험 기준 충족' AS judgment_description
,'1022696001' AS  umresult_code
,1 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'PASS_CUST' AS judgment_code
,'고객사 협의 적합' AS  judgment_name
,'PASS' AS  result_code
,'협의 후 적합' AS judgment_description
,'1022696004' AS  umresult_code
,4 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'FAIL' AS judgment_code
,'부적합' AS  judgment_name
,'FAIL' AS  result_code
,'시험 기준 미달' AS judgment_description
,'1022696002' AS  umresult_code
,2 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'STOPPED' AS judgment_code
,'시험 중단' AS  judgment_name
,'FAIL' AS  result_code
,'시험 중단 처리' AS judgment_description
,'1022696007' AS  umresult_code
,7 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
UNION ALL
SELECT
1 AS company_id
,'UNDETERMINED' AS judgment_code
,'판정불가' AS  judgment_name
,'FAIL' AS  result_code
,'판정 불가' AS judgment_description
,'1022696008' AS  umresult_code
,8 AS sort_order
,CURRENT_TIMESTAMP() AS created_at
ORDER BY sort_order;