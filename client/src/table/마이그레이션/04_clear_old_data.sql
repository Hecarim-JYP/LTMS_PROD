-- ========================================
-- 4단계: 기존 데이터 정리
-- ========================================
-- 새로운 구조에 맞게 기존 데이터 삭제

-- 1. 기존 menu_permission 데이터 삭제 (재생성 예정)
DELETE FROM `menu_permission`;

-- 2. 기존 role_permission 데이터 삭제 (재생성 예정)
DELETE FROM `role_permission`;

-- 3. 기존 permission 데이터 삭제 (재생성 예정)
DELETE FROM `permission`;

-- 4. 기존 menu 데이터 삭제 (재생성 예정)
DELETE FROM `menu`;

-- 5. AUTO_INCREMENT 초기화
ALTER TABLE `menu` AUTO_INCREMENT = 1;
ALTER TABLE `permission` AUTO_INCREMENT = 1;
ALTER TABLE `menu_permission` AUTO_INCREMENT = 1;
ALTER TABLE `role_permission` AUTO_INCREMENT = 1;

-- ========================================
-- 정리 확인
-- ========================================
-- SELECT COUNT(*) FROM menu;
-- SELECT COUNT(*) FROM permission;
-- SELECT COUNT(*) FROM menu_permission;
-- SELECT COUNT(*) FROM role_permission;
