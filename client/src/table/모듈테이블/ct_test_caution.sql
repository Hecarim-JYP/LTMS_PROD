-- CT 시험 주의사항 테이블
CREATE TABLE `ct_test_caution` (
  `ct_test_caution_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `caution_type` varchar(20) NOT NULL COMMENT '주의사항 유형 (volume: 용량, packaging: 포장, compatibility: 상용성)',
  `section_title` varchar(200) DEFAULT NULL COMMENT '섹션 제목',
  `section_content` text DEFAULT NULL COMMENT '섹션 내용',
  `ct_test_report_id` int(11) NOT NULL COMMENT 'CT 시험 성적서 pk(외래키)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순번',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`ct_test_caution_id`),
  KEY `idx_ct_test_report_id` (`ct_test_report_id`) COMMENT '성적서 ID별 조회',
  KEY `idx_caution_type` (`caution_type`) COMMENT '주의사항 유형별 조회',
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CT 시험 주의사항 테이블';