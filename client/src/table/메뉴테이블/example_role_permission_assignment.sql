/**
 * 파일명: example_role_permission_assignment.sql
 * 용도: 역할별 권한 배정 예시
 * 설명: 메뉴 접근 권한(.access)과 기능 권한(.read, .create 등)을 조합한 실제 배정 예시
 * 최초등록: 2026-02-09
 */

-- ============================================
-- 역할 예시 (role 테이블)
-- ============================================
-- GUEST: 조회만 가능한 역할
-- USER: 일반 사용자 (조회, 등록 가능)
-- MANAGER: 관리자 (조회, 등록, 수정, 삭제 가능)
-- ADMIN: 최고 관리자 (모든 권한)


-- ============================================
-- 예시 1: VIEWER 역할 (조회만 가능)
-- ============================================
-- CT 의뢰 메뉴: 접근 가능, 조회만 가능
DELETE FROM role_permission WHERE role_id = (SELECT role_id FROM role WHERE role_code = 'GUEST' LIMIT 1);

INSERT INTO role_permission (company_id, role_id, permission_id, assigned_by, created_by)
SELECT 
    1,
    (SELECT role_id FROM role WHERE role_code = 'GUEST' LIMIT 1),
    permission_id,
    1,
    1
FROM permission
WHERE company_id = 1
  AND permission_code IN (
    -- CT 의뢰: 메뉴 접근 + 조회만
    'ct_request.access',
    'ct_request.read',
    
    -- CT 시험성적서: 메뉴 접근 + 조회만
    'ct_testReport.access',
    'ct_testReport.read',
    
    -- 개인 설정: 메뉴 접근 + 조회/수정
    'setting_default.access',
    'setting_default.read',
    'setting_default.update'
  );


-- ============================================
-- 예시 2: USER 역할 (조회, 등록 가능)
-- ============================================
-- CT 의뢰 메뉴: 접근 가능, 조회/등록 가능, 수정/삭제 불가
DELETE FROM role_permission WHERE role_id = (SELECT role_id FROM role WHERE role_code = 'USER' LIMIT 1);

INSERT INTO role_permission (company_id, role_id, permission_id, assigned_by, created_by)
SELECT 
    1,
    (SELECT role_id FROM role WHERE role_code = 'USER' LIMIT 1),
    permission_id,
    1,
    1
FROM permission
WHERE company_id = 1
  AND permission_code IN (
    -- CT 의뢰: 메뉴 접근 + 조회/등록
    'ct_request.access',
    'ct_request.read',
    'ct_request.create',
    
    -- CT 시험성적서: 메뉴 접근 + 조회/작성
    'ct_testReport.access',
    'ct_testReport.read',
    'ct_testReport.create',
    
    -- CT 일정: 메뉴 접근 + 조회만
    'ct_schedule.access',
    'ct_schedule.read',
    
    -- 개인 설정: 메뉴 접근 + 조회/수정
    'setting_default.access',
    'setting_default.read',
    'setting_default.update'
  );


-- ============================================
-- 예시 3: MANAGER 역할 (조회, 등록, 수정, 삭제 가능)
-- ============================================
-- CT 모듈 전체 관리 가능, 결재 제외
DELETE FROM role_permission WHERE role_id = (SELECT role_id FROM role WHERE role_code = 'MANAGER' LIMIT 1);

INSERT INTO role_permission (company_id, role_id, permission_id, assigned_by, created_by)
SELECT 
    1,
    (SELECT role_id FROM role WHERE role_code = 'MANAGER' LIMIT 1),
    permission_id,
    1,
    1
FROM permission
WHERE company_id = 1
  AND permission_code IN (
    -- CT 의뢰: 메뉴 접근 + 조회/등록/수정/삭제 (결재 제외)
    'ct_request.access',
    'ct_request.read',
    'ct_request.create',
    'ct_request.update',
    'ct_request.delete',
    
    -- CT 시험성적서: 메뉴 접근 + 조회/작성/수정/삭제
    'ct_testReport.access',
    'ct_testReport.read',
    'ct_testReport.create',
    'ct_testReport.update',
    'ct_testReport.delete',
    
    -- CT 일정: 메뉴 접근 + 조회/수정
    'ct_schedule.access',
    'ct_schedule.read',
    'ct_schedule.update',
    
    -- 개인 설정: 메뉴 접근 + 조회/수정
    'setting_default.access',
    'setting_default.read',
    'setting_default.update',
    
    -- 선택 항목 관리: 메뉴 접근 + 조회만
    'setting_selectOptions.access',
    'setting_selectOptions.read'
  );


-- ============================================
-- 예시 4: ADMIN 역할 (모든 권한)
-- ============================================
-- 모든 메뉴 접근 + 모든 기능 가능
DELETE FROM role_permission WHERE role_id = (SELECT role_id FROM role WHERE role_code = 'ADMIN' LIMIT 1);

INSERT INTO role_permission (company_id, role_id, permission_id, assigned_by, created_by)
SELECT 
    1,
    (SELECT role_id FROM role WHERE role_code = 'ADMIN' LIMIT 1),
    permission_id,
    1,
    1
FROM permission
WHERE company_id = 1
  AND is_active = 1;


-- ============================================
-- 확인 쿼리
-- ============================================

-- 1. 역할별 권한 개수 확인
SELECT 
    r.role_code,
    r.role_name,
    COUNT(rp.permission_id) as total_permissions,
    SUM(CASE WHEN p.permission_type = 'menu_access' THEN 1 ELSE 0 END) as menu_access_count,
    SUM(CASE WHEN p.permission_type = 'feature' THEN 1 ELSE 0 END) as feature_count
FROM 
    role r
LEFT JOIN 
    role_permission rp ON r.role_id = rp.role_id AND rp.is_active = 1
LEFT JOIN
    permission p ON rp.permission_id = p.permission_id
WHERE 
    r.company_id = 1
    AND r.is_active = 1
GROUP BY 
    r.role_id, r.role_code, r.role_name
ORDER BY 
    r.level DESC;


-- 2. 특정 역할의 메뉴별 권한 상세
SELECT 
    SUBSTRING_INDEX(p.module, '_', 1) as category,
    p.module,
    MAX(CASE WHEN p.action = 'access' THEN 'O' ELSE NULL END) as menu_access,
    MAX(CASE WHEN p.action = 'read' THEN 'O' ELSE NULL END) as can_read,
    MAX(CASE WHEN p.action = 'create' THEN 'O' ELSE NULL END) as can_create,
    MAX(CASE WHEN p.action = 'update' THEN 'O' ELSE NULL END) as can_update,
    MAX(CASE WHEN p.action = 'delete' THEN 'O' ELSE NULL END) as can_delete,
    MAX(CASE WHEN p.action = 'approval' THEN 'O' ELSE NULL END) as can_approve
FROM 
    role_permission rp
INNER JOIN 
    permission p ON rp.permission_id = p.permission_id
WHERE 
    rp.company_id = 1
    AND rp.role_id = (SELECT role_id FROM role WHERE role_code = 'USER' LIMIT 1)
    AND rp.is_active = 1
GROUP BY 
    category, p.module
ORDER BY 
    category, p.module;


-- 3. 접근 가능한 메뉴 목록 (특정 역할)
SELECT DISTINCT
    m.menu_code,
    m.menu_name,
    m.depth,
    p.permission_code as required_permission
FROM 
    menu m
INNER JOIN 
    menu_permission mp ON m.menu_id = mp.menu_id
INNER JOIN 
    permission p ON mp.permission_id = p.permission_id
INNER JOIN 
    role_permission rp ON p.permission_id = rp.permission_id
WHERE 
    rp.role_id = (SELECT role_id FROM role WHERE role_code = 'USER' LIMIT 1)
    AND rp.is_active = 1
    AND m.is_active = 1
    AND m.depth IN (2, 3)
ORDER BY 
    m.depth, m.sort_order;
