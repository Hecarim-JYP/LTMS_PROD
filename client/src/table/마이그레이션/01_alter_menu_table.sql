-- ========================================
-- 1단계: menu 테이블 구조 변경
-- ========================================
-- available_actions 컬럼 제거 및 third_category 추가

-- 1. third_category 컬럼 추가 (depth 3 지원)
ALTER TABLE `menu` 
ADD COLUMN `third_category` VARCHAR(50) DEFAULT NULL COMMENT '3depth 카테고리명' 
AFTER `second_category`;

-- 2. available_actions 컬럼 제거 (권한은 permission 테이블로 분리)
ALTER TABLE `menu` 
DROP COLUMN `available_actions`;

-- 3. 인덱스 수정
ALTER TABLE `menu` 
DROP INDEX `uk_category_name`;

ALTER TABLE `menu` 
ADD UNIQUE KEY `uk_category_name` (
  `first_category`, 
  `second_category`, 
  `third_category`, 
  `menu_name`
) COMMENT '카테고리별 메뉴명 중복 방지';

-- 4. depth 제약 확인용 주석 업데이트
ALTER TABLE `menu` 
MODIFY COLUMN `depth` TINYINT(1) NOT NULL COMMENT '메뉴 깊이 (1: 1depth, 2: 2depth, 3: 3depth, 4: 4depth)';

-- ========================================
-- 변경 사항 확인
-- ========================================
-- DESCRIBE `menu`;
