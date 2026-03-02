-- 결재 양식 마스터 테이블
CREATE TABLE `approval_template` (
  `approval_template_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `template_name` varchar(100) NOT NULL COMMENT '템플릿 이름 (예: 일반 CT 결재, 긴급 CT 결재)',
  `document_type` varchar(20) NOT NULL COMMENT '문서 유형 (Ex. CT_REQ: CT의뢰, CT_TEST: 시험성적서)',
  `description` text DEFAULT NULL COMMENT '템플릿 설명',
  `is_default` tinyint(1) DEFAULT 0 COMMENT '기본 템플릿 여부 (1: 기본, 0: 일반)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`approval_template_id`),
  UNIQUE KEY `idx_unique_template_name` (`company_id`, `document_type`, `template_name`) COMMENT '회사-문서유형-템플릿명 유니크 인덱스',
  KEY `idx_company_doctype_active` (`company_id`, `document_type`, `is_active`) COMMENT '회사, 문서유형, 활성여부 인덱스',
  KEY `idx_document_type` (`document_type`, `is_default`) COMMENT '문서유형별 기본템플릿 조회'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='결재 양식 마스터 테이블';
