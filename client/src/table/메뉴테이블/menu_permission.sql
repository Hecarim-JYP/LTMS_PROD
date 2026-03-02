-- 옵션 2: Menu-Permission 매핑 테이블 (명시적 관계)
CREATE TABLE `menu_permission` (
  `menu_permission_id` INT AUTO_INCREMENT COMMENT 'PK',
  `company_id` INT(11) NOT NULL DEFAULT 1 COMMENT '회사 ID',
  `menu_id` INT(11) NOT NULL COMMENT '메뉴 ID (외래키)',
  `permission_id` INT(11) NOT NULL COMMENT '권한 ID (외래키)',
  `is_required` TINYINT(1) DEFAULT 1 COMMENT '필수 권한 여부 (1: 필수, 0: 선택)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`menu_permission_id`),
  UNIQUE KEY `uk_menu_permission` (`menu_id`, `permission_id`) COMMENT '메뉴-권한 중복 방지',
  KEY `idx_menu_id` (`menu_id`) COMMENT '메뉴별 권한 조회',
  KEY `idx_permission_id` (`permission_id`) COMMENT '권한별 메뉴 조회',
  KEY `idx_company_id` (`company_id`) COMMENT '회사별 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메뉴-권한 매핑 테이블';

-- 매핑 데이터 자동 생성 (menu_code = permission.module 기준)
INSERT INTO menu_permission (company_id, menu_id, permission_id, is_required, sort_order)
SELECT 
  m.company_id,
  m.menu_id,
  p.permission_id,
  1 as is_required,
  p.sort_order
FROM menu m
INNER JOIN permission p ON m.menu_code = p.module
WHERE m.depth IN (2, 3) -- 1depth는 카테고리이므로 제외
  AND m.deleted_at IS NULL
  AND p.deleted_at IS NULL;
