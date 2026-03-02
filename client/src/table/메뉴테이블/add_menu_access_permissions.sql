/**
 * 파일명: add_menu_access_permissions.sql
 * 용도: 메뉴 접근 권한 추가
 * 설명: 기존 기능 권한(read, create 등)과 별도로 메뉴 접근 권한(.access) 추가
 *       - permission_type: 'menu_access' (메뉴 접근)
 *       - permission_type: 'feature' (기능 실행)
 * 최초등록: 2026-02-09
 */

-- ============================================
-- CT 모듈 메뉴 접근 권한
-- ============================================
INSERT INTO `permission` (
    company_id, permission_code, permission_name, permission_name_en, 
    description, module, action, resource, permission_type, 
    is_system_permission, is_active, sort_order, created_at, created_by
) VALUES
-- CT 의뢰
(1, 'ct_request.access', 'CT 의뢰 메뉴 접근', 'CT Request Menu Access',
 'CT 의뢰 메뉴에 접근할 수 있는 권한', 'ct_request', 'access', '/ct/request',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- CT 시험성적서
(1, 'ct_testReport.access', 'CT 시험성적서 메뉴 접근', 'CT Test Report Menu Access',
 'CT 시험성적서 메뉴에 접근할 수 있는 권한', 'ct_testReport', 'access', '/ct/testReport',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- CT 일정
(1, 'ct_schedule.access', 'CT 일정 메뉴 접근', 'CT Schedule Menu Access',
 'CT 일정 메뉴에 접근할 수 있는 권한', 'ct_schedule', 'access', '/ct/schedule',
 'menu_access', 1, 1, 0, NOW(), NULL),


-- ============================================
-- 내부 분석 모듈 메뉴 접근 권한
-- ============================================
-- 내부 분석 의뢰
(1, 'internal_request.access', '내부 분석 의뢰 메뉴 접근', 'Internal Request Menu Access',
 '내부 분석 의뢰 메뉴에 접근할 수 있는 권한', 'internal_request', 'access', '/internal/request',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 내부 분석 시험성적서
(1, 'internal_testReport.access', '내부 분석 시험성적서 메뉴 접근', 'Internal Test Report Menu Access',
 '내부 분석 시험성적서 메뉴에 접근할 수 있는 권한', 'internal_testReport', 'access', '/internal/testReport',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 내부 분석 일정
(1, 'internal_schedule.access', '내부 분석 일정 메뉴 접근', 'Internal Schedule Menu Access',
 '내부 분석 일정 메뉴에 접근할 수 있는 권한', 'internal_schedule', 'access', '/internal/schedule',
 'menu_access', 1, 1, 0, NOW(), NULL),


-- ============================================
-- 외부 분석 모듈 메뉴 접근 권한
-- ============================================
-- 외부 분석 의뢰
(1, 'external_request.access', '외부 분석 의뢰 메뉴 접근', 'External Request Menu Access',
 '외부 분석 의뢰 메뉴에 접근할 수 있는 권한', 'external_request', 'access', '/external/request',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 외부 분석 시험성적서
(1, 'external_testReport.access', '외부 분석 시험성적서 메뉴 접근', 'External Test Report Menu Access',
 '외부 분석 시험성적서 메뉴에 접근할 수 있는 권한', 'external_testReport', 'access', '/external/testReport',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 외부 분석 일정
(1, 'external_schedule.access', '외부 분석 일정 메뉴 접근', 'External Schedule Menu Access',
 '외부 분석 일정 메뉴에 접근할 수 있는 권한', 'external_schedule', 'access', '/external/schedule',
 'menu_access', 1, 1, 0, NOW(), NULL),


-- ============================================
-- 방부력 테스트 모듈 메뉴 접근 권한
-- ============================================
-- 방부력 테스트 의뢰
(1, 'preservative_request.access', '방부력 테스트 의뢰 메뉴 접근', 'Preservative Request Menu Access',
 '방부력 테스트 의뢰 메뉴에 접근할 수 있는 권한', 'preservative_request', 'access', '/preservative/request',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 방부력 테스트 시험성적서
(1, 'preservative_testReport.access', '방부력 테스트 시험성적서 메뉴 접근', 'Preservative Test Report Menu Access',
 '방부력 테스트 시험성적서 메뉴에 접근할 수 있는 권한', 'preservative_testReport', 'access', '/preservative/testReport',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 방부력 테스트 일정
(1, 'preservative_schedule.access', '방부력 테스트 일정 메뉴 접근', 'Preservative Schedule Menu Access',
 '방부력 테스트 일정 메뉴에 접근할 수 있는 권한', 'preservative_schedule', 'access', '/preservative/schedule',
 'menu_access', 1, 1, 0, NOW(), NULL),


-- ============================================
-- 설정 메뉴 접근 권한
-- ============================================
-- 개인 설정
(1, 'setting_default.access', '개인 설정 메뉴 접근', 'User Default Setting Menu Access',
 '개인 설정 메뉴에 접근할 수 있는 권한', 'setting_default', 'access', '/setting/default',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 권한 관리
(1, 'setting_auth.access', '권한 관리 메뉴 접근', 'Auth Management Menu Access',
 '권한 관리 메뉴에 접근할 수 있는 권한', 'setting_auth', 'access', '/setting/auth',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 결재선 관리
(1, 'setting_approval.access', '결재선 관리 메뉴 접근', 'Approval Line Menu Access',
 '결재선 관리 메뉴에 접근할 수 있는 권한', 'setting_approval', 'access', '/setting/approval',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 선택 항목 관리
(1, 'setting_selectOptions.access', '선택 항목 관리 메뉴 접근', 'Select Options Menu Access',
 '선택 항목 관리 메뉴에 접근할 수 있는 권한', 'setting_selectOptions', 'access', '/setting/selectOptions',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 선택 항목 - 제형담당부서
(1, 'setting_selectOptions_manageLabsDept.access', '제형담당부서 메뉴 접근', 'Labs Dept Menu Access',
 '제형담당부서 메뉴에 접근할 수 있는 권한', 'setting_selectOptions_manageLabsDept', 'access', '/setting/selectOptions/manageLabsDept',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 선택 항목 - 담당자유형
(1, 'setting_selectOptions_managerType.access', '담당자유형 메뉴 접근', 'Manager Type Menu Access',
 '담당자유형 메뉴에 접근할 수 있는 권한', 'setting_selectOptions_managerType', 'access', '/setting/selectOptions/managerType',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 선택 항목 - 판정관리
(1, 'setting_selectOptions_judgment.access', '판정관리 메뉴 접근', 'Judgment Menu Access',
 '판정관리 메뉴에 접근할 수 있는 권한', 'setting_selectOptions_judgment', 'access', '/setting/selectOptions/judgment',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 선택 항목 - 단위관리
(1, 'setting_selectOptions_unit.access', '단위관리 메뉴 접근', 'Unit Menu Access',
 '단위관리 메뉴에 접근할 수 있는 권한', 'setting_selectOptions_unit', 'access', '/setting/selectOptions/unit',
 'menu_access', 1, 1, 0, NOW(), NULL),

-- 사용자 관리
(1, 'setting_user.access', '사용자 관리 메뉴 접근', 'User Management Menu Access',
 '사용자 관리 메뉴에 접근할 수 있는 권한', 'setting_user', 'access', '/setting/user',
 'menu_access', 1, 1, 0, NOW(), NULL);


-- ============================================
-- 확인 쿼리
-- ============================================
-- 추가된 메뉴 접근 권한 확인
SELECT 
    permission_id,
    permission_code,
    permission_name,
    module,
    action,
    permission_type
FROM permission
WHERE permission_type = 'menu_access'
ORDER BY permission_id;

-- 전체 권한 통계
SELECT 
    permission_type,
    COUNT(*) as count
FROM permission
GROUP BY permission_type;
