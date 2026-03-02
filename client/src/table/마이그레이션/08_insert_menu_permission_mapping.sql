-- ========================================
-- 8단계: menu_permission 매핑 데이터 삽입
-- ========================================
-- menu 테이블과 permission (type='menu') 테이블 매핑

-- menu_code와 permission.module 기준으로 매핑
INSERT INTO `menu_permission` (company_id, menu_id, permission_id, is_required, sort_order)
SELECT 
  m.company_id,
  m.menu_id,
  p.permission_id,
  1 as is_required,
  p.sort_order
FROM `menu` m
INNER JOIN `permission` p 
  ON CONCAT('menu.', m.menu_code) = p.permission_code
WHERE m.depth = 3  -- depth 3 메뉴(실제 페이지)만 매핑
  AND p.permission_type = 'menu'
  AND m.deleted_at IS NULL
  AND p.deleted_at IS NULL;

-- depth 2 메뉴 중 직접 path가 있는 경우도 매핑 (setting_auth, setting_user 등)
INSERT INTO `menu_permission` (company_id, menu_id, permission_id, is_required, sort_order)
SELECT 
  m.company_id,
  m.menu_id,
  p.permission_id,
  1 as is_required,
  p.sort_order
FROM `menu` m
INNER JOIN `permission` p 
  ON CONCAT('menu.', m.menu_code) = p.permission_code
WHERE m.depth = 2
  AND m.menu_path IS NOT NULL  -- path가 있는 경우만
  AND p.permission_type = 'menu'
  AND m.deleted_at IS NULL
  AND p.deleted_at IS NULL;

-- ========================================
-- 확인
-- ========================================
-- SELECT 
--   mp.menu_permission_id,
--   m.menu_code,
--   m.menu_name,
--   m.menu_path,
--   p.permission_code,
--   p.permission_name
-- FROM menu_permission mp
-- INNER JOIN menu m ON mp.menu_id = m.menu_id
-- INNER JOIN permission p ON mp.permission_id = p.permission_id
-- ORDER BY mp.menu_permission_id;
