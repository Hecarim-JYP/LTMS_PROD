-- ========================================
-- 2단계: permission 테이블 permission_type 변경
-- ========================================
-- permission_type을 'menu'와 'action'으로 구분

-- 1. permission_type 컬럼 수정 (ENUM 타입으로 명확하게)
ALTER TABLE `permission` 
MODIFY COLUMN `permission_type` VARCHAR(20) DEFAULT 'action' 
COMMENT '권한 타입 (menu: 메뉴 접근 권한, action: 동작 권한)';

-- 2. permission_type 인덱스 재생성
ALTER TABLE `permission` 
DROP INDEX `idx_permission_type`;

ALTER TABLE `permission` 
ADD KEY `idx_permission_type` (`permission_type`, `is_active`) 
COMMENT '권한 타입별 활성 권한 조회';

-- ========================================
-- 변경 사항 확인
-- ========================================
-- DESCRIBE `permission`;
-- SELECT DISTINCT permission_type FROM `permission`;
