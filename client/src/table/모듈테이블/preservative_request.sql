CREATE TABLE `preservative_request` (
  `preservative_request_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `preservative_request_no` VARCHAR(20) NOT NULL COMMENT '요청 번호',
  `preservative_request_date` DATETIME NOT NULL COMMENT '요청일자 (기존: nchar(8) YYYYMMDD 형식)',
  `emp_id` INT(11) NOT NULL COMMENT '담당자 시퀀스 (외래키)',
  `test_emp_id` INT(11) DEFAULT NULL COMMENT '시험 담당자 시퀀스 (외래키)',
  `test_end_emp_id` INT(11) DEFAULT NULL COMMENT '시험 완료 담당자 시퀀스 (외래키)',
  `lab_no` VARCHAR(100) NOT NULL COMMENT '랩 번호 (시험 식별번호)',
  `um_item_type` INT(11) NOT NULL COMMENT '아이템 유형 코드',
  `item_desc` VARCHAR(100) DEFAULT NULL COMMENT '아이템 설명',
  `water` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '물 함량 (%)',
  `ethanol` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '에탄올 함량 (%)',
  `liquid` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '액체유 함량 (%) - 원 컬럼명 Liqid 오타 수정',
  `silicone` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '실리콘 함량 (%)',
  `surfactant` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '계면활성제 함량 (%)',
  `edta_2na` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT 'EDTA-2Na 함량 (%) - 킬레이트제',
  `polyol` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '폴리올 함량 (%)',
  `glycerine` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '글리세린 함량 (%)',
  `propanediol` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '프로판디올 함량 (%)',
  `dpg` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '디프로필렌글리콜 함량 (%)',
  `pg` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '프로필렌글리콜 함량 (%)',
  `bg` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '부틸렌글리콜 함량 (%)',
  `powder` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT '분말 함량 (%)',
  `ph_value` DECIMAL(19,5) NOT NULL DEFAULT 0 COMMENT 'pH 값',
  `um_result` INT(11) NOT NULL DEFAULT 0 COMMENT '결과 코드 (결과 상태를 나타내는 코드)',
  `um_final_result` INT(11) NOT NULL DEFAULT 0 COMMENT '최종 결과 코드',
  `test_start_date` DATETIME DEFAULT NULL COMMENT '시험 시작일자 (기존: TestSrtDate)',
  `test_end_date` DATETIME DEFAULT NULL COMMENT '시험 종료일자',
  `test_confirm_date` DATETIME DEFAULT NULL COMMENT '시험 확정일자 (기존: TestCfmDate)',
  `is_test_end` TINYINT(1) DEFAULT 0 COMMENT '시험 종료 여부 (1: 종료, 0: 진행중)',
  `remark_1` VARCHAR(500) DEFAULT NULL COMMENT '비고 1',
  `remark_2` VARCHAR(500) DEFAULT NULL COMMENT '비고 2',
  `remark_3` VARCHAR(500) DEFAULT NULL COMMENT '비고 3',
  `etc_remark` VARCHAR(200) DEFAULT NULL COMMENT '기타 비고',
  `test_remark` VARCHAR(200) DEFAULT NULL COMMENT '시험 비고',
  `content_desc_1` VARCHAR(100) DEFAULT NULL COMMENT '내용 설명 1',
  `content_desc_2` VARCHAR(100) DEFAULT NULL COMMENT '내용 설명 2',
  `content_desc_3` VARCHAR(100) DEFAULT NULL COMMENT '내용 설명 3',
  `pgm_seq` INT(11) DEFAULT NULL COMMENT '프로그램 시퀀스',
  `file_seq` INT(11) DEFAULT NULL COMMENT '파일 시퀀스 (첨부파일 참조)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`preservative_request_id`),  
  -- 기간별 조회 (가장 빈번한 쿼리)
  KEY `idx_request_date` (`preservative_request_date`),
  -- 담당자별 업무 조회
  KEY `idx_emp_id` (`emp_id`),
  KEY `idx_test_emp_id` (`test_emp_id`),
  -- 날짜 범위 검색
  KEY `idx_test_dates` (`test_start_date`, `test_end_date`),
  -- 아이템 유형별 통계
  KEY `idx_um_item_type` (`um_item_type`),
  -- 회사별 데이터 조회
  KEY `idx_company_id` (`company_id`),
  -- 담당자별 활성 시험 기간 조회
  KEY `idx_emp_active_date` (`emp_id`, `is_active`, `preservative_request_date`)
    COMMENT '담당자별 활성 시험 기간 조회',
  -- 진행중인 시험 조회
  KEY `idx_test_status` (`is_test_end`, `is_active`, `test_start_date`)
    COMMENT '진행중인 시험 조회',
  -- 결과 상태별 조회 (복합 인덱스로 통합)
  KEY `idx_result_status` (`um_result`, `um_final_result`, `is_test_end`)
    COMMENT '결과 상태별 조회 최적화',
  KEY `idx_company_active_sort` (`company_id`, `is_active`, `sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='방부력 시험 테이블';