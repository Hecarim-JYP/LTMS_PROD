-- ========================================
-- 전체 마이그레이션 실행 스크립트
-- ========================================
-- 이 파일은 모든 마이그레이션을 순서대로 실행합니다.
-- 프로덕션에서는 각 단계를 개별적으로 실행하고 검증하는 것을 권장합니다.

-- ========================================
-- 사용법:
-- mysql -u [username] -p [database_name] < 00_run_all_migrations.sql
-- ========================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+09:00";

-- ========================================
-- 1단계: 백업
-- ========================================
SELECT '========================================' as '';
SELECT '1단계: 데이터 백업 시작...' as '';
SELECT '========================================' as '';

SOURCE 03_backup_old_data.sql;

SELECT '백업 완료!' as '';
SELECT '' as '';

-- ========================================
-- 2단계: 테이블 구조 변경
-- ========================================
SELECT '========================================' as '';
SELECT '2단계: 테이블 구조 변경 시작...' as '';
SELECT '========================================' as '';

SOURCE 01_alter_menu_table.sql;
SELECT 'menu 테이블 구조 변경 완료' as '';

SOURCE 02_alter_permission_table.sql;
SELECT 'permission 테이블 구조 변경 완료' as '';

SELECT '' as '';

-- ========================================
-- 3단계: 기존 데이터 정리
-- ========================================
SELECT '========================================' as '';
SELECT '3단계: 기존 데이터 정리 시작...' as '';
SELECT '========================================' as '';

SOURCE 04_clear_old_data.sql;

SELECT '기존 데이터 정리 완료' as '';
SELECT '' as '';

-- ========================================
-- 4단계: 새로운 데이터 삽입
-- ========================================
SELECT '========================================' as '';
SELECT '4단계: 새로운 데이터 삽입 시작...' as '';
SELECT '========================================' as '';

SOURCE 05_insert_new_menu_data.sql;
SELECT '메뉴 데이터 삽입 완료' as '';

SOURCE 06_insert_menu_permissions.sql;
SELECT '메뉴 접근 권한 데이터 삽입 완료' as '';

SOURCE 07_insert_action_permissions.sql;
SELECT '동작 권한 데이터 삽입 완료' as '';

SELECT '' as '';

-- ========================================
-- 5단계: 매핑 데이터 생성
-- ========================================
SELECT '========================================' as '';
SELECT '5단계: 매핑 데이터 생성 시작...' as '';
SELECT '========================================' as '';

SOURCE 08_insert_menu_permission_mapping.sql;
SELECT 'menu_permission 매핑 완료' as '';

SOURCE 09_insert_role_permission_mapping.sql;
SELECT 'role_permission 매핑 완료' as '';

SELECT '' as '';

-- ========================================
-- 6단계: 검증
-- ========================================
SELECT '========================================' as '';
SELECT '6단계: 데이터 검증 시작...' as '';
SELECT '========================================' as '';

-- 메뉴 개수 확인
SELECT '## 메뉴 개수 확인' as '';
SELECT 
  '총 메뉴:' as type,
  COUNT(*) as count 
FROM menu 
WHERE deleted_at IS NULL;

SELECT 
  CONCAT('depth ', depth) as type,
  COUNT(*) as count 
FROM menu 
WHERE deleted_at IS NULL
GROUP BY depth
ORDER BY depth;

SELECT '' as '';

-- 권한 타입별 개수 확인
SELECT '## 권한 타입별 개수 확인' as '';
SELECT 
  permission_type,
  COUNT(*) as count
FROM permission
WHERE deleted_at IS NULL
GROUP BY permission_type;

SELECT '' as '';

-- 매핑 개수 확인
SELECT '## 매핑 테이블 개수 확인' as '';
SELECT 
  'menu_permission' as table_name,
  COUNT(*) as count
FROM menu_permission
WHERE deleted_at IS NULL;

SELECT 
  'role_permission' as table_name,
  COUNT(*) as count
FROM role_permission
WHERE deleted_at IS NULL;

SELECT '' as '';

-- 역할별 권한 개수 확인
SELECT '## 역할별 권한 개수 확인' as '';
SELECT 
  r.role_name,
  p.permission_type,
  COUNT(*) as permission_count
FROM role_permission rp
INNER JOIN role r ON rp.role_id = r.role_id
INNER JOIN permission p ON rp.permission_id = p.permission_id
WHERE rp.deleted_at IS NULL
  AND r.deleted_at IS NULL
  AND p.deleted_at IS NULL
GROUP BY r.role_name, p.permission_type
ORDER BY r.role_id, p.permission_type;

SELECT '' as '';

-- ========================================
-- 완료
-- ========================================
SELECT '========================================' as '';
SELECT '마이그레이션 완료!' as '';
SELECT '========================================' as '';
SELECT '' as '';
SELECT '다음 단계:' as '';
SELECT '1. 10_migration_verification.sql 파일을 실행하여 상세 검증' as '';
SELECT '2. 서버 API 코드 수정 (README.md 참고)' as '';
SELECT '3. 프론트엔드 코드 수정 (README.md 참고)' as '';
SELECT '4. 테스트 사용자로 로그인하여 권한 확인' as '';
SELECT '' as '';

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
