/**
 * 파일명: update_menu_permission.sql
 * 용도: menu_permission 테이블 재구성
 * 설명: 메뉴별로 .access 권한만 등록 (메뉴 접근 = OR 조건)
 *       기능 권한(read, create 등)은 role_permission에만 존재
 * 최초등록: 2026-02-09
 */

-- ============================================
-- 1. 기존 데이터 백업 (선택사항)
-- ============================================
-- CREATE TABLE menu_permission_backup AS SELECT * FROM menu_permission;


-- ============================================
-- 2. 기존 menu_permission 데이터 삭제
-- ============================================
DELETE FROM menu_permission;


-- ============================================
-- 3. 메뉴별 접근 권한(.access) 등록
-- ============================================
-- NOTE: 
--   - menu_permission에는 .access 권한만 등록
--   - 이 권한이 있으면 메뉴 접근 가능 (OR 조건)
--   - 실제 기능(read, create 등)은 role_permission으로 제어

-- menu 테이블과 permission 테이블을 조인하여 자동 매핑
INSERT INTO menu_permission (company_id, menu_id, permission_id, is_active, created_at, created_by)
SELECT 
    m.company_id,
    m.menu_id,
    p.permission_id,
    1 as is_active,
    NOW() as created_at,
    NULL as created_by
FROM 
    menu m
INNER JOIN 
    permission p 
    ON p.module = m.menu_code 
    AND p.action = 'access'
    AND p.permission_type = 'menu_access'
WHERE 
    m.depth IN (2, 3)  -- 실제 메뉴만 (1depth는 카테고리)
    AND m.is_active = 1
    AND p.is_active = 1;


-- ============================================
-- 4. 확인 쿼리
-- ============================================
-- 메뉴별 접근 권한 확인
SELECT 
    m.menu_code,
    m.menu_name,
    m.depth,
    p.permission_code,
    p.permission_name,
    p.permission_type
FROM 
    menu m
INNER JOIN 
    menu_permission mp ON m.menu_id = mp.menu_id
INNER JOIN 
    permission p ON mp.permission_id = p.permission_id
WHERE 
    m.company_id = 1
ORDER BY 
    m.depth, m.sort_order;


-- 메뉴별 접근 권한 개수 확인 (각 메뉴당 1개여야 함)
SELECT 
    m.menu_code,
    m.menu_name,
    COUNT(mp.permission_id) as permission_count
FROM 
    menu m
LEFT JOIN 
    menu_permission mp ON m.menu_id = mp.menu_id
WHERE 
    m.depth IN (2, 3)
    AND m.is_active = 1
GROUP BY 
    m.menu_id, m.menu_code, m.menu_name
ORDER BY 
    m.sort_order;


-- 접근 권한이 없는 메뉴 확인 (있으면 안됨)
SELECT 
    m.menu_code,
    m.menu_name,
    m.depth
FROM 
    menu m
LEFT JOIN 
    menu_permission mp ON m.menu_id = mp.menu_id
WHERE 
    m.depth IN (2, 3)
    AND m.is_active = 1
    AND mp.menu_id IS NULL;
