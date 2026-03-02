-- 부서 관리 테이블
CREATE TABLE department (
  `department_id` INT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `company_code` VARCHAR(50) COMMENT '회사코드',
  `company_name` VARCHAR(50) COMMENT '회사명',
  `division_code` VARCHAR(50) COMMENT '사업부코드',
  `division_name` VARCHAR(50) COMMENT '사업부명',
  `team_code` VARCHAR(50) COMMENT '팀코드',
  `team_name` VARCHAR(50) COMMENT '팀명',
  `part_code` VARCHAR(50) COMMENT '파트코드',
  `part_name` VARCHAR(50) COMMENT '파트명',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`department_id`),
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='부서 관리 테이블';

-- 부서 데이터 삽입
INSERT INTO `department` (
  `company_id`,
  `company_code`,
  `company_name`,
  `division_code`,
  `division_name`,
  `team_code`,
  `team_name`,
  `part_code`,
  `part_name`,
  `is_active`,
  `sort_order`,
  `created_by`
) VALUES
-- 기반연구팀 - 포장재상용성연구파트
(1, NULL, '코스메카코리아', NULL, NULL, NULL, '기반연구팀', 'CompatibilityTest', '포장재상용성연구파트', 1, 1, NULL),
-- 기반연구팀 - 분석&안정성평가파트
(1, NULL, '코스메카코리아', NULL, NULL, NULL, '기반연구팀', 'StabilityAnalysis', '분석&안정성평가파트', 1, 2, NULL),
-- 기반연구팀 - 미생물연구파트
(1, NULL, '코스메카코리아', NULL, NULL, NULL, '기반연구팀', 'Microorganism', '미생물연구파트', 1, 3, NULL),
-- IT전략팀
(1, NULL, '코스메카코리아', NULL, NULL, NULL, 'IT전략팀', 'ITS', 'IT전략팀', 1, 4, NULL);