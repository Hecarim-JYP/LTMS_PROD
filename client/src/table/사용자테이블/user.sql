-- 사용자 관리 테이블
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK',
  `company_id` int(11) NOT NULL DEFAULT 1 COMMENT '회사 ID (외래키)',
  `user_name` varchar(50) NOT NULL COMMENT '사용자명 (로그인용, 고유)',
  `email` varchar(100) NOT NULL COMMENT '이메일 (로그인/알림용, 고유)',
  `email_verified` tinyint(1) DEFAULT 0 COMMENT '이메일 인증 여부 (1: 인증됨, 0: 미인증)',
  `email_verified_at` datetime DEFAULT NULL COMMENT '이메일 인증 일시',
  `password` varchar(255) NOT NULL COMMENT '비밀번호 해시 (bcrypt/argon2)',
  `password_changed_at` datetime DEFAULT NULL COMMENT '마지막 비밀번호 변경일시',
  `password_expires_at` datetime DEFAULT NULL COMMENT '비밀번호 만료일 (정책에 따라)',
  `must_change_password` tinyint(1) DEFAULT 0 COMMENT '비밀번호 변경 강제 여부 (1: 필수, 0: 선택)',
  `reset_password_token` varchar(255) DEFAULT NULL COMMENT '비밀번호 재설정 토큰',
  `reset_password_token_expires_at` datetime DEFAULT NULL COMMENT '재설정 토큰 만료일시',
  `user_full_name` varchar(100) NOT NULL COMMENT '사용자 전체 이름 (한글명)',
  `user_full_name_en` varchar(100) DEFAULT NULL COMMENT '사용자 영문명',
  `phone` varchar(20) DEFAULT NULL COMMENT '전화번호 (010-1234-5678)',
  `mobile` varchar(20) DEFAULT NULL COMMENT '휴대폰 번호',
  `department_id` int(11) DEFAULT NULL COMMENT '부서 ID (외래키)',
  `position` varchar(50) DEFAULT NULL COMMENT '직위 (대리, 과장, 차장, 부장 등)',
  `job_title` varchar(100) DEFAULT NULL COMMENT '직책 (팀장, 실장 등)',
  `employee_number` varchar(50) DEFAULT NULL COMMENT '사번',
  `user_grade_id` int(11) DEFAULT NULL COMMENT '사용자 등급 ID (외래키)',
  `role_id` int(11) DEFAULT NULL COMMENT '역할 pk(외래키)',
  `status` varchar(20) DEFAULT 'active' COMMENT '계정 상태 (active, inactive, locked, suspended, pending)',
  `is_locked` tinyint(1) DEFAULT 0 COMMENT '계정 잠금 여부 (1: 잠금, 0: 정상)',
  `locked_at` datetime DEFAULT NULL COMMENT '계정 잠금 일시',
  `locked_reason` varchar(200) DEFAULT NULL COMMENT '계정 잠금 사유',
  `failed_login_attempts` int(11) DEFAULT 0 COMMENT '로그인 실패 횟수',
  `last_failed_login_at` datetime DEFAULT NULL COMMENT '마지막 로그인 실패 일시',
  `last_login_at` datetime DEFAULT NULL COMMENT '마지막 로그인 일시',
  `last_login_ip` varchar(45) DEFAULT NULL COMMENT '마지막 로그인 IP (IPv6 고려)',
  `last_login_device` varchar(200) DEFAULT NULL COMMENT '마지막 로그인 디바이스 (User-Agent)',
  `mfa_enabled` tinyint(1) DEFAULT 0 COMMENT 'MFA 활성화 여부 (1: 활성, 0: 비활성)',
  `mfa_secret` varchar(255) DEFAULT NULL COMMENT 'MFA 비밀키 (암호화 저장)',
  `mfa_backup_codes` text DEFAULT NULL COMMENT 'MFA 백업 코드 (JSON 배열)',
  `current_token` varchar(500) DEFAULT NULL COMMENT '현재 활성 토큰 (JWT 등)',
  `token_expires_at` datetime DEFAULT NULL COMMENT '토큰 만료 일시',
  `refresh_token` varchar(500) DEFAULT NULL COMMENT 'Refresh Token',
  `refresh_token_expires_at` datetime DEFAULT NULL COMMENT 'Refresh Token 만료 일시',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `sort_order` int(11) DEFAULT 1 COMMENT '정렬 순서',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '생성일시',
  `created_by` int(11) DEFAULT NULL COMMENT '생성자 ID (외래키)',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `updated_by` int(11) DEFAULT NULL COMMENT '수정자 ID (외래키)',
  `deleted_at` datetime DEFAULT NULL COMMENT '삭제일시 (Soft Delete)',
  `deleted_by` int(11) DEFAULT NULL COMMENT '삭제자 ID (외래키)',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_company_user_name` (`company_id`,`user_name`,`is_active`),
  UNIQUE KEY `uk_company_email` (`company_id`,`email`,`is_active`),
  UNIQUE KEY `uk_employee_number` (`company_id`,`employee_number`,`is_active`),
  KEY `idx_email` (`email`) COMMENT '이메일 인덱스',
  KEY `idx_user_name` (`user_name`) COMMENT '사용자명 인덱스',
  KEY `idx_status` (`status`) COMMENT '계정 상태 인덱스',
  KEY `idx_is_locked` (`is_locked`) COMMENT '잠금 상태 인덱스',
  KEY `idx_company_id` (`company_id`) COMMENT '회사별 인덱스',
  KEY `idx_department_id` (`department_id`) COMMENT '부서별 인덱스',
  KEY `idx_role` (`role_id`) COMMENT '권한별 인덱스',
  KEY `idx_user_grade_id` (`user_grade_id`) COMMENT '사용자 등급별 인덱스',
  KEY `idx_created_at` (`created_at`) COMMENT '생성일시 인덱스',
  KEY `idx_last_login_at` (`last_login_at`) COMMENT '마지막 로그인 일시 인덱스',
  KEY `idx_company_active_status` (`company_id`,`is_active`,`status`,`deleted_at`) COMMENT '회사별 활성 사용자 조회',
  KEY `idx_department_active` (`department_id`,`is_active`,`deleted_at`) COMMENT '부서별 활성 사용자 조회',
  KEY `idx_loginable` (`status`,`is_locked`,`is_active`,`deleted_at`) COMMENT '로그인 가능한 사용자 조회',
  KEY `idx_user_full_name` (`user_full_name`(20)) COMMENT '사용자 이름 검색 (prefix 인덱스)',
  KEY `idx_company_active_sort` (`company_id`,`is_active`,`sort_order`) COMMENT '회사, 활성 여부 및 정렬 순번 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 정보 테이블 - 보안 강화 버전';

-- 기본 사용자 데이터 삽입
-- 초기 비밀번호는 모두 'cosmecca' 로 설정되며, 첫 로그인 시 변경 필요
INSERT INTO `user` (
  `company_id`, `department_id`, `user_name`, `user_full_name`, `user_grade_id`, 
  `role_id`, `employee_number`, `email`, `mobile`, `phone`, 
  `password`, `must_change_password`, `status`, `is_active`
) VALUES
(1, 4, 'jehong', '홍정의', 1, 1, '200302', 'jehong@cosmecca.com', '010-8841-3687', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'hjkim', '김현준', 2, 1, '251007', 'hjkim@cosmecca.com', '010-9666-2113', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'jin.h', '황경진', 2, 1, '200205', 'jin.h@cosmecca.com', '010-3500-6182', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'kskim', '김경석', 3, 1, '231204', 'kskim@cosmecca.com', '010-5515-3745', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'mh-song', '송민희', 3, 1, '221202', 'mh-song@cosmecca.com', '010-7748-4500', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'jaeho.choi', '최재호', 3, 1, '260107', 'jaeho.choi@cosmecca.com', '010-7229-0842', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'jypark931', '박진영', 4, 1, '250910', 'jypark931@cosmecca.com', '010-9240-1535', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'sbjeon', '전성배', 4, 1, '250118', 'sbjeon@cosmecca.com', '010-5459-9371', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'choiyw', '최연웅', 4, 1, '231004', 'choiyw@cosmecca.com', '010-6256-3295', NULL, 'cosmecca', 1, 'active', 1),
(1, 4, 'righeimdal', '남창기', 4, 1, 'A260102', 'righeimdal@cosmecca.com', '010-4130-8739', NULL, 'cosmecca', 1, 'active', 1),
(1, 5, 'sjyb612', '서재용', 1, 2, '110907', 'sjyb612@cosmecca.com', '010-6410-8612', '031-784-6522', 'cosmecca', 1, 'active', 1),
(1, 3, 'chemi_sk', '심민석', 2, 3, '220803', 'chemi_sk@cosmecca.com', '010-5498-0841', NULL, 'cosmecca', 1, 'active', 1),
(1, 3, 'hyungab', '양현갑', 2, 3, '130901', 'hyungab@cosmecca.com', '010-9053-1704', '031-784-6529', 'cosmecca', 1, 'active', 1),
(1, 3, 'wnrud5033', '이주경', 3, 3, '210102', 'wnrud5033@cosmecca.com', '010-5033-3703', NULL, 'cosmecca', 1, 'active', 1),
(1, 3, 'mysolbee', '백솔비', 3, 3, '210604', 'mysolbee@cosmecca.com', '010-5030-8530', NULL, 'cosmecca', 1, 'active', 1),
(1, 2, 'leeyj49', '이예지', 2, 3, '151220', 'leeyj49@cosmecca.com', '010-2932-2734', NULL, 'cosmecca', 1, 'active', 1),
(1, 2, 'bhkang', '강병훈', 3, 3, '250507', 'bhkang@cosmecca.com', '010-2718-6713', NULL, 'cosmecca', 1, 'active', 1),
(1, 1, 'kky0304', '강권용', 2, 3, '140508', 'kky0304@cosmecca.com', '010-7444-1274', NULL, 'cosmecca', 1, 'active', 1),
(1, 1, 'gostayout', '이재은', 2, 3, '150215', 'gostayout@cosmecca.com', '010-7136-5488', NULL, 'cosmecca', 1, 'active', 1),
(1, 1, 'ajh0328', '안종혁', 2, 3, '190908', 'ajh0328@cosmecca.com', '010-9968-3328', NULL, 'cosmecca', 1, 'active', 1),
(1, 1, 'wlsrhksdyd', '진관용', 2, 3, '081005', 'wlsrhksdyd@cosmecca.com', '010-8828-5183', '042-527-3515', 'cosmecca', 1, 'active', 1),
(1, 1, 'rangchoi', '최랑', 3, 3, '200101', 'rangchoi@cosmecca.com', '010-3313-8801', NULL, 'cosmecca', 1, 'active', 1);




-- 삽입된 사용자 데이터 확인
user_id	company_id	user_name	email	email_verified	email_verified_at	password	password_changed_at	password_expires_at	must_change_password	reset_password_token	reset_password_token_expires_at	user_full_name	user_full_name_en	phone	mobile	department_id	position	job_title	employee_number	user_grade_id	role_id	status	is_locked	locked_at	locked_reason	failed_login_attempts	last_failed_login_at	last_login_at	last_login_ip	last_login_device	mfa_enabled	mfa_secret	mfa_backup_codes	current_token	token_expires_at	refresh_token	refresh_token_expires_at	is_active	sort_order	created_at	created_by	updated_at	updated_by	deleted_at	deleted_by
1	1	jehong	jehong@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	홍정의	[NULL]	[NULL]	010-8841-3687	4	팀장	[NULL]	200302	1	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 05:17:00.000	[NULL]	[NULL]	[NULL]
2	1	hjkim	hjkim@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	김현준	[NULL]	[NULL]	010-9666-2113	4	[NULL]	[NULL]	251007	2	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
3	1	jin.h	jin.h@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	황경진	[NULL]	[NULL]	010-3500-6182	4	파트장	[NULL]	200205	2	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 05:17:00.000	[NULL]	[NULL]	[NULL]
4	1	kskim	kskim@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	김경석	[NULL]	[NULL]	010-5515-3745	4	[NULL]	[NULL]	231204	3	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
5	1	mh-song	mh-song@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	송민희	[NULL]	[NULL]	010-7748-4500	4	[NULL]	[NULL]	221202	3	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
6	1	jaeho.choi	jaeho.choi@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	최재호	[NULL]	[NULL]	010-7229-0842	4	[NULL]	[NULL]	260107	3	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
7	1	jypark931	jypark931@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	박진영	[NULL]	[NULL]	010-9240-1535	4	[NULL]	[NULL]	250910	4	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
8	1	sbjeon	sbjeon@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	전성배	[NULL]	[NULL]	010-5459-9371	4	[NULL]	[NULL]	250118	4	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
9	1	choiyw	choiyw@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	최연웅	[NULL]	[NULL]	010-6256-3295	4	[NULL]	[NULL]	231004	4	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
10	1	righeimdal	righeimdal@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	남창기	[NULL]	[NULL]	010-4130-8739	4	[NULL]	[NULL]	A260102	4	1	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
11	1	sjyb612	sjyb612@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	서재용	[NULL]	031-784-6522	010-6410-8612	5	팀장	[NULL]	110907	1	2	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 05:17:00.000	[NULL]	[NULL]	[NULL]
12	1	chemi_sk	chemi_sk@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	심민석	[NULL]	[NULL]	010-5498-0841	3	[NULL]	[NULL]	220803	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
13	1	hyungab	hyungab@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	양현갑	[NULL]	031-784-6529	010-9053-1704	3	[NULL]	[NULL]	130901	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
14	1	wnrud5033	wnrud5033@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	이주경	[NULL]	[NULL]	010-5033-3703	3	[NULL]	[NULL]	210102	3	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
15	1	mysolbee	mysolbee@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	백솔비	[NULL]	[NULL]	010-5030-8530	3	[NULL]	[NULL]	210604	3	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
16	1	leeyj49	leeyj49@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	이예지	[NULL]	[NULL]	010-2932-2734	2	[NULL]	[NULL]	151220	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
17	1	bhkang	bhkang@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	강병훈	[NULL]	[NULL]	010-2718-6713	2	[NULL]	[NULL]	250507	3	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
18	1	kky0304	kky0304@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	강권용	[NULL]	[NULL]	010-7444-1274	1	[NULL]	[NULL]	140508	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
19	1	gostayout	gostayout@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	이재은	[NULL]	[NULL]	010-7136-5488	1	[NULL]	[NULL]	150215	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
20	1	ajh0328	ajh0328@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	안종혁	[NULL]	[NULL]	010-9968-3328	1	[NULL]	[NULL]	190908	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
21	1	wlsrhksdyd	wlsrhksdyd@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	진관용	[NULL]	042-527-3515	010-8828-5183	1	[NULL]	[NULL]	081005	2	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]
22	1	rangchoi	rangchoi@cosmecca.com	0	[NULL]	cosmecca	[NULL]	[NULL]	1	[NULL]	[NULL]	최랑	[NULL]	[NULL]	010-3313-8801	1	[NULL]	[NULL]	200101	3	3	active	0	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	0	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	[NULL]	1	1	2026-02-04 00:41:20.000	[NULL]	2026-02-04 00:41:20.000	[NULL]	[NULL]	[NULL]