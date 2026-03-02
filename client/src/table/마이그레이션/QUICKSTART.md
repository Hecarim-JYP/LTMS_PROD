# 권한 시스템 재설계 - 빠른 시작 가이드

## 📋 개요
메뉴 접근 권한과 동작 권한을 분리하여 더 세밀한 권한 관리를 가능하게 합니다.

## 🎯 핵심 변경사항
1. **메뉴 접근 권한** (Menu Permission): 특정 페이지에 접근 가능한지
2. **동작 권한** (Action Permission): 페이지 내에서 특정 작업(생성, 수정, 삭제 등) 수행 가능한지

## 🚀 실행 방법

### 방법 1: 전체 마이그레이션 한 번에 실행 (개발 환경 권장)
```bash
cd /path/to/LTMS/bak_20260210/client/src/table/마이그레이션

# MySQL 실행
mysql -u root -p ltms_db < 00_run_all_migrations.sql
```

### 방법 2: 단계별 실행 (프로덕션 권장)
```bash
# 1. 백업
mysql -u root -p ltms_db < 03_backup_old_data.sql

# 2. 테이블 구조 변경
mysql -u root -p ltms_db < 01_alter_menu_table.sql
mysql -u root -p ltms_db < 02_alter_permission_table.sql

# 3. 기존 데이터 정리
mysql -u root -p ltms_db < 04_clear_old_data.sql

# 4. 새로운 데이터 삽입
mysql -u root -p ltms_db < 05_insert_new_menu_data.sql
mysql -u root -p ltms_db < 06_insert_menu_permissions.sql
mysql -u root -p ltms_db < 07_insert_action_permissions.sql

# 5. 매핑 데이터 생성
mysql -u root -p ltms_db < 08_insert_menu_permission_mapping.sql
mysql -u root -p ltms_db < 09_insert_role_permission_mapping.sql

# 6. 검증
mysql -u root -p ltms_db < 10_migration_verification.sql
```

## 📁 파일 구조
```
마이그레이션/
├── 00_run_all_migrations.sql         # 전체 실행 스크립트
├── 01_alter_menu_table.sql           # menu 테이블 구조 변경
├── 02_alter_permission_table.sql     # permission 테이블 구조 변경
├── 03_backup_old_data.sql            # 기존 데이터 백업
├── 04_clear_old_data.sql             # 기존 데이터 정리
├── 05_insert_new_menu_data.sql       # 새 메뉴 데이터 삽입
├── 06_insert_menu_permissions.sql    # 메뉴 접근 권한 삽입
├── 07_insert_action_permissions.sql  # 동작 권한 삽입
├── 08_insert_menu_permission_mapping.sql  # 메뉴-권한 매핑
├── 09_insert_role_permission_mapping.sql  # 역할-권한 매핑
├── 10_migration_verification.sql     # 검증 쿼리
├── 11_user_permissions_query.sql     # 사용자 권한 조회 쿼리
├── README.md                         # 상세 가이드
└── QUICKSTART.md                     # 이 파일
```

## ✅ 마이그레이션 후 확인사항

### 1. 데이터 확인
```sql
-- 메뉴 개수 확인
SELECT depth, COUNT(*) as count FROM menu GROUP BY depth;

-- 권한 타입별 개수
SELECT permission_type, COUNT(*) as count FROM permission GROUP BY permission_type;

-- 역할별 권한 개수
SELECT r.role_name, p.permission_type, COUNT(*) as count
FROM role_permission rp
JOIN role r ON rp.role_id = r.role_id
JOIN permission p ON rp.permission_id = p.permission_id
GROUP BY r.role_name, p.permission_type;
```

### 2. 테스트 사용자 권한 확인
```sql
-- 사용자 ID 7번의 메뉴 권한 확인
SELECT DISTINCT m.menu_name, m.menu_path
FROM user u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role_permission rp ON ur.role_id = rp.role_id
JOIN permission p ON rp.permission_id = p.permission_id AND p.permission_type = 'menu'
JOIN menu_permission mp ON p.permission_id = mp.permission_id
JOIN menu m ON mp.menu_id = m.menu_id
WHERE u.user_id = 7;

-- 사용자 ID 7번의 동작 권한 확인
SELECT DISTINCT p.permission_code, p.module, p.action
FROM user u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role_permission rp ON ur.role_id = rp.role_id
JOIN permission p ON rp.permission_id = p.permission_id AND p.permission_type = 'action'
WHERE u.user_id = 7;
```

## 🔧 서버 코드 수정

### 1. 로그인 API 응답 수정
**파일: `server/src/service/ltms/authService.js`**

로그인 시 `menuPermissions`와 `actionPermissions` 두 가지를 반환하도록 수정
(상세 코드는 README.md 참고)

### 2. 권한 체크 미들웨어 수정
**파일: `server/src/middleware/ltms/authMiddleware.js`**

- `checkMenuAccess(menuCode)`: 메뉴 접근 권한 체크
- `checkActionPermission(module, action)`: 동작 권한 체크

## 🎨 프론트엔드 코드 수정

### 1. AuthContext 수정
**파일: `client/src/contexts/AuthContext.jsx`**

```jsx
// menuPermissions와 actionPermissions 분리 저장
const [menuPermissions, setMenuPermissions] = useState([]);
const [actionPermissions, setActionPermissions] = useState([]);

// 권한 체크 함수
const hasMenuAccess = (menuCode) => { ... };
const hasActionPermission = (module, action) => { ... };
```

### 2. Sidebar 메뉴 렌더링 수정
**파일: `client/src/components/Sidebar.jsx`**

계층 구조(depth 1 > depth 2 > depth 3)로 메뉴 렌더링

### 3. 페이지 컴포넌트 수정
**파일: `client/src/modules/CT/CT_Request_Read.jsx`**

```jsx
const canCreate = hasActionPermission('ct_request', 'create');
const canUpdate = hasActionPermission('ct_request', 'update');
const canDelete = hasActionPermission('ct_request', 'delete');

// 권한에 따라 버튼 표시/숨김
{canCreate && <button>등록</button>}
{canUpdate && <button>수정</button>}
```

## 🔐 권한 구조 예시

### 메뉴 구조 (CT 모듈)
```
CT (depth 1)
└── 의뢰 (depth 2)
    ├── 의뢰 조회 (depth 3, menu_code: ct_request_read)
    ├── 의뢰 등록 (depth 3, menu_code: ct_request_create)
    └── 의뢰 결재 (depth 3, menu_code: ct_request_approval)
```

### 권한 예시
**메뉴 접근 권한:**
- `menu.ct_request_read`: CT 의뢰 조회 페이지 접근
- `menu.ct_request_create`: CT 의뢰 등록 페이지 접근

**동작 권한:**
- `action.ct_request.read`: CT 의뢰 데이터 조회
- `action.ct_request.create`: CT 의뢰 생성
- `action.ct_request.update`: CT 의뢰 수정
- `action.ct_request.delete`: CT 의뢰 삭제
- `action.ct_request.approve`: CT 의뢰 결재

## 🆘 문제 해결

### 1. 마이그레이션 실패 시
```sql
-- 백업에서 복원
DROP TABLE IF EXISTS menu;
CREATE TABLE menu LIKE menu_backup_20260210;
INSERT INTO menu SELECT * FROM menu_backup_20260210;

-- permission 테이블도 동일하게 복원
```

### 2. 권한이 제대로 안 보일 때
```sql
-- 캐시 문제일 수 있으므로 재로그인 필요
-- 또는 다음 쿼리로 권한 확인
SELECT * FROM role_permission WHERE role_id = [사용자의 role_id];
```

### 3. 메뉴가 안 보일 때
```sql
-- menu_permission 매핑 확인
SELECT m.menu_name, p.permission_code
FROM menu m
JOIN menu_permission mp ON m.menu_id = mp.menu_id
JOIN permission p ON mp.permission_id = p.permission_id
WHERE m.menu_code = 'ct_request_read';
```

## 📚 추가 문서
- **상세 가이드**: `README.md`
- **권한 조회 쿼리**: `11_user_permissions_query.sql`
- **검증 쿼리**: `10_migration_verification.sql`

## 🎉 완료!
마이그레이션이 성공적으로 완료되었다면, 서버와 프론트엔드 코드를 수정하고 테스트를 진행하세요.
