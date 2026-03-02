-- 자재 유형 중분류 관리 테이블
CREATE TABLE `material_sub_category` (
  `material_sub_category_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `material_large_category_id` int(11) DEFAULT NULL COMMENT '자재 유형 대분류 pk(외래키)',
  `material_sub_category_code` varchar(30) NOT NULL COMMENT '유형코드',
  `material_sub_category_name` varchar(100) NOT NULL COMMENT '유형 중분류명',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`material_sub_category_id`),
  KEY `idx_company_active_sort` (`company_id`,`is_active`,`sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스',
  KEY `idx_material_large_category_id` (`material_large_category_id`) COMMENT '대분류 ID 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='자재 유형 중분류 관리 테이블';