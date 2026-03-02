-- 사용자 등급 테이블
CREATE TABLE `user_grade` (
  `user_grade_id` INT AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `grade_code` VARCHAR(50) UNIQUE NOT NULL COMMENT '등급코드',
  `grade_name` VARCHAR(50) UNIQUE NOT NULL COMMENT '등급명',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`user_grade_id`),
  KEY `idx_active_sort` (`is_active`, `sort_order`) COMMENT '활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 등급 테이블';

-- 기본 등급 데이터 삽입
INSERT INTO `user_grade` (`company_id`, `grade_code`, `grade_name`, `is_active`, `sort_order`) VALUES
(1, 'G4', '수석', 1, 1),
(1, 'G3', '책임', 1, 2),
(1, 'G2', '선임', 1, 3),
(1, 'G1', '사원', 1, 4);