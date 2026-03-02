-- 메뉴 테이블
CREATE TABLE `menu` (
  `menu_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 pk(외래키)',
  `menu_code` varchar(50) NOT NULL COMMENT '메뉴 고유 코드 (권한 관리용)',
  `first_category` varchar(50) DEFAULT NULL COMMENT '1depth 카테고리명',
  `second_category` varchar(50) DEFAULT NULL COMMENT '2depth 카테고리명',
  `menu_name` varchar(100) NOT NULL COMMENT '메뉴명',
  `menu_path` varchar(300) DEFAULT NULL COMMENT 'URL 경로',
  `icon` varchar(50) DEFAULT NULL COMMENT '아이콘 클래스명',
  `depth` tinyint(1) NOT NULL COMMENT '메뉴 깊이 (1: 1depth, 2: 2depth, 3: 3depth)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자',
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `uk_code` (`menu_code`) COMMENT '메뉴 코드 고유 제약',
  UNIQUE KEY `uk_category_name` (`first_category`,`second_category`,`menu_name`) COMMENT '카테고리별 메뉴명 중복 방지',
  KEY `idx_first_category` (`company_id`, `first_category`,`is_active`,`sort_order`) COMMENT '1depth 카테고리별 활성 메뉴 조회',
  KEY `idx_depth_active` (`depth`,`is_active`,`sort_order`) COMMENT 'depth별 활성 메뉴 정렬 조회',
  KEY `idx_path` (`menu_path`) COMMENT 'URL 경로로 메뉴 검색'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메뉴 테이블';


-- 메뉴 데이터 삽입 쿼리
INSERT INTO `menu` (
  company_id,
  menu_code,
  first_category,
  second_category,
  menu_name,
  menu_path,
  icon,
  depth,
  sort_order,
  is_active,
  created_by
) VALUES
-- ========================================
-- 1Depth : CT
-- ========================================
(1, 'ct', NULL, NULL, 'CT', NULL, NULL, 1, 1, 1, NULL),

-- 2Depth : CT
(1, 'ct_request', 'ct', NULL, '의뢰', '/ct/request', NULL, 2, 1, 1, NULL),
(1, 'ct_testReport', 'ct', NULL, '시험성적서', '/ct/testReport', NULL, 2, 2, 1, NULL),
(1, 'ct_schedule', 'ct', NULL, '일정 현황', '/ct/schedule', NULL, 2, 3, 1, NULL),

-- ========================================
-- 1Depth : 내부 성분 분석
-- ========================================
(1, 'internal', NULL, NULL, '내부 성분 분석', NULL, NULL, 1, 2, 1, NULL),

-- 2Depth : 내부 성분 분석
(1, 'internal_request', 'internal', NULL, '의뢰', '/internal/request', NULL, 2, 1, 1, NULL),
(1, 'internal_testReport', 'internal', NULL, '시험성적서', '/internal/testReport', NULL, 2, 2, 1, NULL),
(1, 'internal_schedule', 'internal', NULL, '일정 현황', '/internal/schedule', NULL, 2, 3, 1, NULL),

-- ========================================
-- 1Depth : 외부 성분 분석
-- ========================================
(1, 'external', NULL, NULL, '외부 성분 분석', NULL, NULL, 1, 3, 1, NULL),

-- 2Depth : 외부 성분 분석
(1, 'external_request', 'external', NULL, '의뢰', '/external/request', NULL, 2, 1, 1, NULL),
(1, 'external_testReport', 'external', NULL, '시험성적서', '/external/testReport', NULL, 2, 2, 1, NULL),
(1, 'external_schedule', 'external', NULL, '일정 현황', '/external/schedule', NULL, 2, 3, 1, NULL),

-- ========================================
-- 1Depth : 방부력 테스트
-- ========================================
(1, 'preservative', NULL, NULL, '방부력 테스트', NULL, NULL, 1, 4, 1, NULL),

-- 2Depth : 방부력 테스트
(1, 'preservative_request', 'preservative', NULL, '의뢰', '/preservative/request', NULL, 2, 1, 1, NULL),
(1, 'preservative_testReport', 'preservative', NULL, '시험성적서', '/preservative/testReport', NULL, 2, 2, 1, NULL),
(1, 'preservative_schedule', 'preservative', NULL, '일정 현황', '/preservative/schedule', NULL, 2, 3, 1, NULL),


-- ========================================
-- 1Depth : 기초 설정
-- ========================================
(1, 'setting', NULL, NULL, '환경 설정', NULL, NULL, 1, 5, 1, NULL),

-- 2Depth : 기초 설정
(1, 'setting_default', 'setting', NULL, '사용자 기초 설정', '/setting/default', NULL, 2, 1, 1, NULL),
(1, 'setting_auth', 'setting', NULL, '사용자 관리', '/setting/auth', NULL, 2, 2, 1, NULL),
(1, 'setting_approval', 'setting', NULL, '결재선 관리', '/setting/approval', NULL, 2, 3, 1, NULL),
(1, 'setting_selectOptions', 'setting', NULL, '선택 항목 관리', '/setting/selectOptions', NULL, 2, 4, 1, NULL),


-- 3Depth : 기초 설정 > 선택 항목 관리
(1, 'setting_selectOptions_manageLabsDept', 'setting', 'selectOptions', '제형담당부서', '/setting/selectOptions/manageLabsDept', NULL, 3, 1, 1, NULL),
(1, 'setting_selectOptions_managerType', 'setting', 'selectOptions', '담당자유형', '/setting/selectOptions/managerType', NULL, 3, 2, 1, NULL),
(1, 'setting_selectOptions_judgment', 'setting', 'selectOptions', '판정관리', '/setting/selectOptions/judgment', NULL, 3, 3, 1, NULL),
(1, 'setting_selectOptions_unit', 'setting', 'selectOptions', '단위관리', '/setting/selectOptions/unit', NULL, 3, 4, 1, NULL);






-- 삽입된 메뉴 데이터 확인
menu_id	company_id	menu_code	first_category	second_category	menu_name	menu_path	icon	depth	sort_order	is_active	created_at	created_by	updated_at	updated_by	deleted_at	deleted_by
1	1	ct	[NULL]	[NULL]	CT	[NULL]	[NULL]	1	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
2	1	ct_request	ct	[NULL]	의뢰	/ct/request	[NULL]	2	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
3	1	ct_testReport	ct	[NULL]	시험성적서	/ct/testReport	[NULL]	2	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
4	1	ct_schedule	ct	[NULL]	일정 현황	/ct/schedule	[NULL]	2	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
5	1	internal	[NULL]	[NULL]	내부 성분 분석	[NULL]	[NULL]	1	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
6	1	internal_request	internal	[NULL]	의뢰	/internal/request	[NULL]	2	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
7	1	internal_testReport	internal	[NULL]	시험성적서	/internal/testReport	[NULL]	2	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
8	1	internal_schedule	internal	[NULL]	일정 현황	/internal/schedule	[NULL]	2	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
9	1	external	[NULL]	[NULL]	외부 성분 분석	[NULL]	[NULL]	1	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
10	1	external_request	external	[NULL]	의뢰	/external/request	[NULL]	2	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
11	1	external_testReport	external	[NULL]	시험성적서	/external/testReport	[NULL]	2	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
12	1	external_schedule	external	[NULL]	일정 현황	/external/schedule	[NULL]	2	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
13	1	preservative	[NULL]	[NULL]	방부력 테스트	[NULL]	[NULL]	1	4	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
14	1	preservative_request	preservative	[NULL]	의뢰	/preservative/request	[NULL]	2	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
15	1	preservative_testReport	preservative	[NULL]	시험성적서	/preservative/testReport	[NULL]	2	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
16	1	preservative_schedule	preservative	[NULL]	일정 현황	/preservative/schedule	[NULL]	2	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
17	1	setting	[NULL]	[NULL]	환경 설정	[NULL]	[NULL]	1	5	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
18	1	setting_default	setting	[NULL]	사용자 기초 설정	/setting/default	[NULL]	2	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
19	1	setting_auth	setting	[NULL]	사용자 관리	/setting/auth	[NULL]	2	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
20	1	setting_approval	setting	[NULL]	결재선 관리	/setting/approval	[NULL]	2	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
21	1	setting_selectOptions	setting	[NULL]	선택 항목 관리	/setting/selectOptions	[NULL]	2	4	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
22	1	setting_selectOptions_manageLabsDept	setting	selectOptions	제형담당부서	/setting/selectOptions/manageLabsDept	[NULL]	3	1	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
23	1	setting_selectOptions_managerType	setting	selectOptions	담당자유형	/setting/selectOptions/managerType	[NULL]	3	2	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
24	1	setting_selectOptions_judgment	setting	selectOptions	판정관리	/setting/selectOptions/judgment	[NULL]	3	3	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]
25	1	setting_selectOptions_unit	setting	selectOptions	단위관리	/setting/selectOptions/unit	[NULL]	3	4	1	2026-02-03 08:58:41.000	[NULL]	2026-02-03 08:58:41.000	[NULL]	[NULL]	[NULL]

