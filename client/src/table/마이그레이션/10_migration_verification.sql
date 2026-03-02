-- ========================================
-- 10단계: 마이그레이션 실행 순서 및 확인 쿼리
-- ========================================

/*
******************************************
마이그레이션 실행 순서
******************************************

1. 백업 (03_backup_old_data.sql)
   - 기존 데이터를 안전하게 백업

2. 테이블 구조 변경 (01, 02)
   - 01_alter_menu_table.sql
   - 02_alter_permission_table.sql

3. 기존 데이터 정리 (04_clear_old_data.sql)
   - 새로운 구조에 맞게 기존 데이터 삭제
   - AUTO_INCREMENT 초기화

4. 새로운 데이터 삽입 (05, 06, 07)
   - 05_insert_new_menu_data.sql
   - 06_insert_menu_permissions.sql
   - 07_insert_action_permissions.sql

5. 매핑 데이터 생성 (08, 09)
   - 08_insert_menu_permission_mapping.sql
   - 09_insert_role_permission_mapping.sql

******************************************
*/

-- ========================================
-- 마이그레이션 완료 후 확인 쿼리
-- ========================================

-- 1. 메뉴 구조 확인
SELECT 
  menu_id,
  menu_code,
  menu_name,
  menu_path,
  depth,
  parent_menu_id,
  first_category,
  second_category,
  third_category
FROM menu
WHERE deleted_at IS NULL
ORDER BY 
  COALESCE(parent_menu_id, menu_id),
  sort_order,
  menu_id;

-- 2. 권한 타입별 개수 확인
SELECT 
  permission_type,
  COUNT(*) as count
FROM permission
WHERE deleted_at IS NULL
GROUP BY permission_type;

-- 3. 메뉴별 권한 매핑 확인
SELECT 
  m.menu_code,
  m.menu_name,
  m.menu_path,
  p.permission_code,
  p.permission_type
FROM menu m
INNER JOIN menu_permission mp ON m.menu_id = mp.menu_id
INNER JOIN permission p ON mp.permission_id = p.permission_id
WHERE m.deleted_at IS NULL
  AND p.deleted_at IS NULL
ORDER BY m.menu_id;

-- 4. 역할별 권한 개수 확인
SELECT 
  r.role_name,
  p.permission_type,
  COUNT(*) as permission_count
FROM role_permission rp
INNER JOIN role r ON rp.role_id = r.role_id
INNER JOIN permission p ON rp.permission_id = p.permission_id
WHERE rp.deleted_at IS NULL
GROUP BY r.role_name, p.permission_type
ORDER BY r.role_id, p.permission_type;

-- 5. 특정 사용자의 권한 확인 (예: user_id = 7)
SELECT DISTINCT
  p.permission_type,
  p.permission_code,
  p.permission_name,
  p.module,
  p.action
FROM user u
INNER JOIN user_role ur ON u.user_id = ur.user_id
INNER JOIN role r ON ur.role_id = r.role_id
INNER JOIN role_permission rp ON r.role_id = rp.role_id
INNER JOIN permission p ON rp.permission_id = p.permission_id
WHERE u.user_id = 7
  AND ur.is_active = 1
  AND ur.deleted_at IS NULL
  AND rp.is_active = 1
  AND rp.deleted_at IS NULL
  AND p.deleted_at IS NULL
ORDER BY p.permission_type, p.module, p.sort_order;

-- 6. 특정 사용자가 접근 가능한 메뉴 목록 확인 (예: user_id = 7)
SELECT DISTINCT
  m.menu_id,
  m.menu_code,
  m.menu_name,
  m.menu_path,
  m.depth,
  m.parent_menu_id
FROM user u
INNER JOIN user_role ur ON u.user_id = ur.user_id
INNER JOIN role r ON ur.role_id = r.role_id
INNER JOIN role_permission rp ON r.role_id = rp.role_id
INNER JOIN permission p ON rp.permission_id = p.permission_id
INNER JOIN menu_permission mp ON p.permission_id = mp.permission_id
INNER JOIN menu m ON mp.menu_id = m.menu_id
WHERE u.user_id = 7
  AND ur.is_active = 1
  AND ur.deleted_at IS NULL
  AND rp.is_active = 1
  AND rp.deleted_at IS NULL
  AND p.permission_type = 'menu'
  AND p.deleted_at IS NULL
  AND m.deleted_at IS NULL
ORDER BY m.sort_order, m.menu_id;

-- 7. 데이터 정합성 체크
-- 모든 depth 3 메뉴가 menu_permission에 매핑되었는지 확인
SELECT 
  m.menu_id,
  m.menu_code,
  m.menu_name,
  m.menu_path,
  CASE 
    WHEN mp.menu_permission_id IS NULL THEN '매핑 안됨'
    ELSE '매핑됨'
  END as mapping_status
FROM menu m
LEFT JOIN menu_permission mp ON m.menu_id = mp.menu_id
WHERE m.depth = 3
  AND m.requires_permission = 1
  AND m.deleted_at IS NULL
ORDER BY m.menu_id;

-- 8. 백업 데이터와 비교
SELECT 
  'menu' as table_name,
  (SELECT COUNT(*) FROM menu_backup_20260210) as backup_count,
  (SELECT COUNT(*) FROM menu) as current_count;

SELECT 
  'permission' as table_name,
  (SELECT COUNT(*) FROM permission_backup_20260210) as backup_count,
  (SELECT COUNT(*) FROM permission) as current_count;
