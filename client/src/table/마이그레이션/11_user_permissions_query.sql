-- ========================================
-- 로그인 시 사용자 권한 정보 조회 SQL
-- ========================================

/*
로그인 성공 후 사용자에게 반환되어야 할 2가지 권한 정보:
1. 메뉴 접근 권한 (menu permissions) - 어떤 메뉴에 접근할 수 있는지
2. 동작 권한 (action permissions) - 페이지 내에서 어떤 동작을 할 수 있는지
*/

-- ========================================
-- 1. 사용자의 메뉴 접근 권한 조회
-- ========================================
-- 반환 데이터: 접근 가능한 메뉴 목록 (계층 구조)
SELECT DISTINCT
  m.menu_id,
  m.menu_code,
  m.menu_name,
  m.menu_path,
  m.icon,
  m.depth,
  m.parent_menu_id,
  m.first_category,
  m.second_category,
  m.third_category,
  m.sort_order,
  p.permission_code as menu_permission_code
FROM user u
INNER JOIN user_role ur 
  ON u.user_id = ur.user_id
  AND ur.is_active = 1
  AND ur.deleted_at IS NULL
INNER JOIN role r 
  ON ur.role_id = r.role_id
  AND r.is_active = 1
  AND r.deleted_at IS NULL
INNER JOIN role_permission rp 
  ON r.role_id = rp.role_id
  AND rp.is_active = 1
  AND rp.deleted_at IS NULL
INNER JOIN permission p 
  ON rp.permission_id = p.permission_id
  AND p.permission_type = 'menu'
  AND p.is_active = 1
  AND p.deleted_at IS NULL
INNER JOIN menu_permission mp 
  ON p.permission_id = mp.permission_id
  AND mp.is_active = 1
  AND mp.deleted_at IS NULL
INNER JOIN menu m 
  ON mp.menu_id = m.menu_id
  AND m.is_active = 1
  AND m.deleted_at IS NULL
WHERE u.user_id = ? -- 로그인한 사용자 ID
  AND u.is_active = 1
  AND u.deleted_at IS NULL
ORDER BY m.sort_order, m.depth, m.menu_id;

-- ========================================
-- 2. 사용자의 동작 권한 조회
-- ========================================
-- 반환 데이터: 실행 가능한 동작 목록 (module.action 형태)
SELECT DISTINCT
  p.permission_id,
  p.permission_code,
  p.permission_name,
  p.module,
  p.action,
  p.resource
FROM user u
INNER JOIN user_role ur 
  ON u.user_id = ur.user_id
  AND ur.is_active = 1
  AND ur.deleted_at IS NULL
INNER JOIN role r 
  ON ur.role_id = r.role_id
  AND r.is_active = 1
  AND r.deleted_at IS NULL
INNER JOIN role_permission rp 
  ON r.role_id = rp.role_id
  AND rp.is_active = 1
  AND rp.deleted_at IS NULL
INNER JOIN permission p 
  ON rp.permission_id = p.permission_id
  AND p.permission_type = 'action'
  AND p.is_active = 1
  AND p.deleted_at IS NULL
WHERE u.user_id = ? -- 로그인한 사용자 ID
  AND u.is_active = 1
  AND u.deleted_at IS NULL
ORDER BY p.module, p.action;

-- ========================================
-- 3. 사용자 권한 정보 통합 조회 (최적화 버전)
-- ========================================
-- 메뉴 권한과 동작 권한을 한 번에 조회
WITH user_permissions AS (
  SELECT DISTINCT
    p.permission_id,
    p.permission_code,
    p.permission_type,
    p.module,
    p.action,
    p.resource
  FROM user u
  INNER JOIN user_role ur 
    ON u.user_id = ur.user_id
    AND ur.is_active = 1
    AND ur.deleted_at IS NULL
  INNER JOIN role r 
    ON ur.role_id = r.role_id
    AND r.is_active = 1
    AND r.deleted_at IS NULL
  INNER JOIN role_permission rp 
    ON r.role_id = rp.role_id
    AND rp.is_active = 1
    AND rp.deleted_at IS NULL
  INNER JOIN permission p 
    ON rp.permission_id = p.permission_id
    AND p.is_active = 1
    AND p.deleted_at IS NULL
  WHERE u.user_id = ?
    AND u.is_active = 1
    AND u.deleted_at IS NULL
)
SELECT 
  -- 메뉴 권한
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'menu_id', m.menu_id,
        'menu_code', m.menu_code,
        'menu_name', m.menu_name,
        'menu_path', m.menu_path,
        'icon', m.icon,
        'depth', m.depth,
        'parent_menu_id', m.parent_menu_id,
        'first_category', m.first_category,
        'second_category', m.second_category,
        'third_category', m.third_category,
        'sort_order', m.sort_order
      )
    )
    FROM menu m
    INNER JOIN menu_permission mp ON m.menu_id = mp.menu_id
    INNER JOIN user_permissions up ON mp.permission_id = up.permission_id
    WHERE up.permission_type = 'menu'
      AND m.is_active = 1
      AND m.deleted_at IS NULL
      AND mp.is_active = 1
      AND mp.deleted_at IS NULL
  ) as menu_permissions,
  -- 동작 권한
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'permission_code', up.permission_code,
        'module', up.module,
        'action', up.action,
        'resource', up.resource
      )
    )
    FROM user_permissions up
    WHERE up.permission_type = 'action'
  ) as action_permissions;

-- ========================================
-- 4. 부모 메뉴 포함 전체 메뉴 트리 조회
-- ========================================
-- depth 1, 2 메뉴도 포함하여 전체 메뉴 트리 구성
WITH RECURSIVE menu_tree AS (
  -- 사용자가 접근 가능한 depth 3 메뉴
  SELECT DISTINCT
    m.menu_id,
    m.menu_code,
    m.menu_name,
    m.menu_path,
    m.icon,
    m.depth,
    m.parent_menu_id,
    m.first_category,
    m.second_category,
    m.third_category,
    m.sort_order
  FROM user u
  INNER JOIN user_role ur ON u.user_id = ur.user_id AND ur.is_active = 1 AND ur.deleted_at IS NULL
  INNER JOIN role r ON ur.role_id = r.role_id AND r.is_active = 1 AND r.deleted_at IS NULL
  INNER JOIN role_permission rp ON r.role_id = rp.role_id AND rp.is_active = 1 AND rp.deleted_at IS NULL
  INNER JOIN permission p ON rp.permission_id = p.permission_id AND p.permission_type = 'menu' AND p.is_active = 1 AND p.deleted_at IS NULL
  INNER JOIN menu_permission mp ON p.permission_id = mp.permission_id AND mp.is_active = 1 AND mp.deleted_at IS NULL
  INNER JOIN menu m ON mp.menu_id = m.menu_id AND m.is_active = 1 AND m.deleted_at IS NULL
  WHERE u.user_id = ?
    AND u.is_active = 1
    AND u.deleted_at IS NULL
  
  UNION ALL
  
  -- 부모 메뉴 재귀 조회
  SELECT 
    m.menu_id,
    m.menu_code,
    m.menu_name,
    m.menu_path,
    m.icon,
    m.depth,
    m.parent_menu_id,
    m.first_category,
    m.second_category,
    m.third_category,
    m.sort_order
  FROM menu m
  INNER JOIN menu_tree mt ON m.menu_id = mt.parent_menu_id
  WHERE m.is_active = 1
    AND m.deleted_at IS NULL
)
SELECT DISTINCT * FROM menu_tree
ORDER BY sort_order, depth, menu_id;
