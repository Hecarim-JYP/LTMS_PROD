-- ========================================
-- 9단계: role_permission 매핑 데이터 삽입
-- ========================================
-- role 테이블과 permission (type='action' 또는 'menu') 테이블 매핑

-- ========================================
-- ADMIN (role_id=1) - 모든 권한 부여
-- ========================================
-- 메뉴 접근 권한 + 동작 권한 모두 부여
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  1 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type IN ('menu', 'action');

-- ========================================
-- MANAGER (role_id=2) - 관리자 권한
-- ========================================
-- 모든 메뉴 접근 권한 부여
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  2 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type = 'menu';

-- 동작 권한: 삭제 제외한 모든 권한 부여
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  2 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type = 'action'
  AND p.action <> 'delete';  -- 삭제 권한 제외

-- ========================================
-- USER (role_id=3) - 일반 사용자 권한
-- ========================================
-- 조회/등록 메뉴 접근 권한만 부여 (결재, 관리 메뉴 제외)
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  3 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type = 'menu'
  AND p.action IN ('read', 'create', 'ct', 'report', 'default');  -- 조회, 등록, 일정, 개인설정만

-- 동작 권한: 조회, 생성만 부여
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  3 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type = 'action'
  AND p.action IN ('read', 'create');

-- ========================================
-- GUEST (role_id=4) - 게스트 권한
-- ========================================
-- 조회 메뉴 접근 권한만 부여
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  4 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type = 'menu'
  AND p.action IN ('read', 'ct', 'report', 'default');  -- 조회, 일정만

-- 동작 권한: 조회만 부여
INSERT INTO `role_permission` (company_id, role_id, permission_id, is_active, sort_order)
SELECT 
  1 as company_id,
  4 as role_id,
  p.permission_id,
  1 as is_active,
  p.sort_order
FROM `permission` p
WHERE p.company_id = 1 
  AND p.deleted_at IS NULL
  AND p.permission_type = 'action'
  AND p.action = 'read';

-- ========================================
-- 확인
-- ========================================
-- ADMIN 권한 확인
-- SELECT COUNT(*) as total_permissions
-- FROM role_permission rp
-- WHERE rp.role_id = 1;

-- 역할별 권한 타입 통계
-- SELECT 
--   r.role_name,
--   p.permission_type,
--   COUNT(*) as permission_count
-- FROM role_permission rp
-- INNER JOIN role r ON rp.role_id = r.role_id
-- INNER JOIN permission p ON rp.permission_id = p.permission_id
-- WHERE rp.deleted_at IS NULL
-- GROUP BY r.role_name, p.permission_type
-- ORDER BY r.role_id, p.permission_type;

-- 역할별 동작 권한 통계
-- SELECT 
--   r.role_name,
--   p.action,
--   COUNT(*) as permission_count
-- FROM role_permission rp
-- INNER JOIN role r ON rp.role_id = r.role_id
-- INNER JOIN permission p ON rp.permission_id = p.permission_id
-- WHERE rp.deleted_at IS NULL
--   AND p.permission_type = 'action'
-- GROUP BY r.role_name, p.action
-- ORDER BY r.role_id, p.action;
