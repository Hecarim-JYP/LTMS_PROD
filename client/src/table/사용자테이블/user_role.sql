-- 사용자-역할 매핑 테이블 (Many-to-Many)
CREATE TABLE `user_role` (
  `user_role_id` INT AUTO_INCREMENT COMMENT 'PK',
  `company_id` INT(11) NOT NULL DEFAULT 1 COMMENT '회사 ID (외래키)',
  `user_id` INT(11) NOT NULL COMMENT '사용자 ID (외래키)',
  `role_id` INT(11) NOT NULL COMMENT '역할 ID (외래키)',
  `assigned_by` INT(11) DEFAULT NULL COMMENT '할당자 ID (외래키)',
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT '할당 일시',
  `expires_at` DATETIME DEFAULT NULL COMMENT '만료 일시 (NULL이면 무기한)',
  `is_primary` TINYINT(1) DEFAULT 0 COMMENT '주 역할 여부 (1: 주 역할, 0: 부 역할)',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT '생성일시',
  `created_by` INT(11) DEFAULT NULL COMMENT '생성자 ID (외래키)',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP() COMMENT '수정일시',
  `updated_by` INT(11) DEFAULT NULL COMMENT '수정자 ID (외래키)',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '삭제일시 (Soft Delete)',
  `deleted_by` INT(11) DEFAULT NULL COMMENT '삭제자 ID (외래키)',
  PRIMARY KEY (`user_role_id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`, `deleted_at`) COMMENT '사용자-역할 고유 제약',
  KEY `idx_user_id` (`user_id`) COMMENT '사용자별 인덱스',
  KEY `idx_role_id` (`role_id`) COMMENT '역할별 인덱스',
  KEY `idx_company_id` (`company_id`) COMMENT '회사별 인덱스',
  KEY `idx_is_primary` (`is_primary`) COMMENT '주 역할 인덱스',
  KEY `idx_is_active` (`is_active`) COMMENT '활성 여부 인덱스',
  KEY `idx_expires_at` (`expires_at`) COMMENT '만료일 인덱스',
  KEY `idx_user_active` (`user_id`, `is_active`, `deleted_at`) COMMENT '사용자의 활성 역할 조회',
  KEY `idx_role_active` (`role_id`, `is_active`, `deleted_at`) COMMENT '역할의 활성 사용자 조회',
  KEY `idx_company_user_role` (`company_id`, `user_id`, `role_id`, `is_active`) COMMENT '회사별 사용자-역할 조회',
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자-역할 매핑 테이블 - RBAC 패턴';

-- 사용자-역할 매핑 데이터 삽입
INSERT INTO `user_role` (`company_id`, `user_id`, `role_id`, `is_primary`, `is_active`) VALUES
-- 관리자 역할 (ADMIN)
(1, 1, 1, 1, 1),   -- 홍정의
(1, 2, 1, 1, 1),   -- 김현준
(1, 3, 1, 1, 1),   -- 황경진
(1, 4, 1, 1, 1),   -- 김경석
(1, 5, 1, 1, 1),   -- 송민희
(1, 6, 1, 1, 1),   -- 최재호
(1, 7, 1, 1, 1),   -- 박진영
(1, 8, 1, 1, 1),   -- 전성배
(1, 9, 1, 1, 1),   -- 최연웅
(1, 10, 1, 1, 1),  -- 남창기

-- 매니저 역할 (MANAGER)
(1, 11, 2, 1, 1),  -- 서재용

-- 일반 사용자 역할 (USER)
(1, 12, 3, 1, 1),  -- 심민석
(1, 13, 3, 1, 1),  -- 양현갑
(1, 14, 3, 1, 1),  -- 이주경
(1, 15, 3, 1, 1),  -- 백솔비
(1, 16, 3, 1, 1),  -- 이예지
(1, 17, 3, 1, 1),  -- 강병훈
(1, 18, 3, 1, 1),  -- 강권용
(1, 19, 3, 1, 1),  -- 이재은
(1, 20, 3, 1, 1),  -- 안종혁
(1, 21, 3, 1, 1),  -- 진관용
(1, 22, 3, 1, 1);  -- 최랑