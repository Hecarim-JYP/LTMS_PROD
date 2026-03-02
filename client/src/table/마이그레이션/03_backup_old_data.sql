-- ========================================
-- 3단계: 기존 데이터 백업
-- ========================================
-- 마이그레이션 전 안전을 위한 백업

-- 1. 기존 menu 데이터 백업
CREATE TABLE IF NOT EXISTS `menu_backup_20260210` LIKE `menu`;
INSERT INTO `menu_backup_20260210` SELECT * FROM `menu`;

-- 2. 기존 permission 데이터 백업
CREATE TABLE IF NOT EXISTS `permission_backup_20260210` LIKE `permission`;
INSERT INTO `permission_backup_20260210` SELECT * FROM `permission`;

-- 3. 기존 menu_permission 데이터 백업
CREATE TABLE IF NOT EXISTS `menu_permission_backup_20260210` LIKE `menu_permission`;
INSERT INTO `menu_permission_backup_20260210` SELECT * FROM `menu_permission`;

-- 4. 기존 role_permission 데이터 백업
CREATE TABLE IF NOT EXISTS `role_permission_backup_20260210` LIKE `role_permission`;
INSERT INTO `role_permission_backup_20260210` SELECT * FROM `role_permission`;

-- ========================================
-- 백업 확인
-- ========================================
-- SELECT COUNT(*) FROM menu_backup_20260210;
-- SELECT COUNT(*) FROM permission_backup_20260210;
-- SELECT COUNT(*) FROM menu_permission_backup_20260210;
-- SELECT COUNT(*) FROM role_permission_backup_20260210;
