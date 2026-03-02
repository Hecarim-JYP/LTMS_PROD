# 서버 코드 수정 사항 요약

## 📅 수정 일자
2026-02-10

---

## 🎯 수정 목적
새로운 메뉴/권한 체계에 맞춰 서버 auth 모듈 개선:
- **메뉴 접근 권한**과 **동작 권한** 분리
- **parent_menu_id** 기반 depth 3 계층 구조 지원
- **permission_type** 필드 활용 ('menu' | 'action')

---

## 📝 수정 파일 목록

### 1. `server/src/repository/sql/ltms/auth/authQuery.js`

#### 1-1. `selectUserPermissionsByUserId` - 권한 조회 쿼리 개선

**변경 전:**
- role_permission 테이블에서만 권한 조회
- 단일 쿼리로 모든 권한 조회

**변경 후:**
```sql
-- UNION ALL로 두 가지 권한 타입 모두 조회

/* 1) 동작 권한 조회 (role_permission) */
SELECT ... FROM role_permission rp
INNER JOIN permission p 
  ON ... AND p.permission_type = 'action'

UNION ALL

/* 2) 메뉴 접근 권한 조회 (menu_permission) */
SELECT ... FROM role_permission rp
INNER JOIN menu_permission mp ON ...
INNER JOIN permission p 
  ON ... AND p.permission_type = 'menu'
```

**추가된 필드:**
- `is_system_permission`: 시스템 권한 여부
- `sort_order`: 정렬 순서

**효과:**
- 메뉴 접근 권한(`permission_type='menu'`)과 동작 권한(`permission_type='action'`)을 모두 조회
- 클라이언트에서 `hasMenuAccess()`와 `canPerformAction()`을 정확히 구분 가능

---

#### 1-2. `selectAccessibleMenusByRoles` - 메뉴 조회 쿼리 개선

**변경 전:**
- depth 2까지만 지원
- permission_type = 'menu_access' 사용
- first_category, second_category만 반환

**변경 후:**
```sql
WITH accessible_depth3_menus AS (
  -- depth 3 메뉴 조회 (permission_type='menu')
  SELECT ... parent_menu_id, third_category ...
),
accessible_depth2_menus AS (
  -- depth 3의 부모인 depth 2 메뉴
  SELECT ... FROM accessible_depth3_menus d3
  WHERE m.menu_id = d3.parent_menu_id
),
accessible_depth1_menus AS (
  -- depth 2의 부모인 depth 1 메뉴
  SELECT ... FROM accessible_depth2_menus d2
  WHERE m.menu_id = d2.parent_menu_id
)
-- 통합
SELECT * FROM accessible_depth1_menus
UNION ALL
SELECT * FROM accessible_depth2_menus
UNION ALL
SELECT * FROM accessible_depth3_menus
```

**추가된 필드:**
- `parent_menu_id`: 부모 메뉴 ID (계층 구조용)
- `third_category`: 세 번째 카테고리

**변경된 사항:**
- `permission_type = 'menu_access'` → `permission_type = 'menu'`
- CTE(Common Table Expression) 사용으로 depth 3까지 지원
- parent_menu_id 기반 계층 구조 자동 포함

**효과:**
- depth 3 메뉴를 가진 사용자에게 자동으로 부모 메뉴(depth 2, depth 1) 포함
- 클라이언트의 `buildTreeRecursive()` 함수가 parent_menu_id로 트리 구축 가능

---

#### 1-3. `selectMenuList` - 메뉴 목록 조회 쿼리 개선

**변경 전:**
```sql
LEFT JOIN permission p
  ON ... AND p.permission_type = 'menu_access'
  AND p.action = 'access'
```

**변경 후:**
```sql
LEFT JOIN menu_permission mp 
  ON ... AND mp.is_active = 1 AND mp.deleted_at IS NULL
LEFT JOIN permission p
  ON ... AND p.permission_type = 'menu'
  AND p.is_active = 1 AND p.deleted_at IS NULL
WHERE ... AND m.deleted_at IS NULL
```

**추가된 필드:**
- `third_category`: 세 번째 카테고리

**변경된 사항:**
- `permission_type = 'menu_access'` → `permission_type = 'menu'`
- `p.action = 'access'` 조건 제거 (permission_type으로 충분)
- deleted_at 체크 추가 (소프트 삭제 지원)

**효과:**
- 설정 화면에서 메뉴 관리 시 정확한 권한 정보 표시

---

### 2. `server/src/service/ltms/auth/authService.js`

#### 2-1. `parseRolesAndPermissions` - 권한 파싱 함수 개선

**변경 전:**
```javascript
permissionsSet.add(JSON.stringify({
  ...
  permission_type: row.permission_type,
}));
```

**변경 후:**
```javascript
permissionsSet.add(JSON.stringify({
  ...
  permission_type: row.permission_type,        // 'menu' 또는 'action'
  is_system_permission: row.is_system_permission,
  sort_order: row.sort_order
}));
```

**추가된 주석:**
```javascript
/**
 * 권한 체계:
 *   - permission_type='menu': 메뉴 접근 권한 (menu_permission 테이블 사용)
 *   - permission_type='action': 동작 권한 (role_permission 테이블 사용)
 *   - 하나의 배열에 두 타입 모두 포함하여 반환
 */
```

**효과:**
- 클라이언트가 `is_system_permission`으로 시스템 권한 구분 가능
- `sort_order`로 권한 정렬 가능

---

#### 2-2. `authenticateUser` - 로그인 함수 문서화

**추가된 JSDoc:**
```javascript
/**
 * 새로운 권한 체계:
 *   - permissions: 메뉴 접근 권한(permission_type='menu') + 동작 권한(permission_type='action')
 *   - accessibleMenus: parent_menu_id 기반 계층 구조 (depth 1 → 2 → 3)
 *   
 * 반환 데이터:
 *   - userInfo: 사용자 기본 정보
 *   - role: 단일 역할 객체
 *   - permissions: 권한 배열 (permission_type 포함)
 *     * permission_type='menu': 메뉴 접근 권한 (페이지 접근 제어)
 *     * permission_type='action': 동작 권한 (버튼/기능 제어)
 *   - customSettings: 사용자 설정
 *   - accessibleMenus: 접근 가능한 메뉴 목록 (parent_menu_id, second_category, third_category 포함)
 */
```

**효과:**
- 개발자가 로그인 응답 구조를 명확히 이해 가능
- 프론트엔드와 백엔드의 계약(contract) 명확화

---

## 🔄 데이터 흐름 비교

### 변경 전
```
로그인 요청
  ↓
selectUserPermissionsByUserId (role_permission만)
  ↓
permissions: [
  { permission_type: 'feature', action: 'read', ... },
  { permission_type: 'feature', action: 'create', ... }
]
  ↓
selectAccessibleMenusByRoles (depth 2, first/second_category)
  ↓
accessibleMenus: [
  { depth: 1, first_category: null, ... },
  { depth: 2, first_category: 'ct', second_category: 'request', ... }
]
```

### 변경 후
```
로그인 요청
  ↓
selectUserPermissionsByUserId (UNION ALL)
  → role_permission (permission_type='action')
  → menu_permission (permission_type='menu')
  ↓
permissions: [
  { permission_type: 'menu', module: 'ct_request', action: 'read', ... },
  { permission_type: 'action', module: 'ct_request', action: 'read', ... },
  { permission_type: 'action', module: 'ct_request', action: 'create', ... }
]
  ↓
selectAccessibleMenusByRoles (WITH CTE, depth 3)
  → depth 3 메뉴 조회 (menu_permission 기반)
  → depth 2 부모 자동 포함
  → depth 1 부모 자동 포함
  ↓
accessibleMenus: [
  { depth: 1, parent_menu_id: null, ... },
  { depth: 2, parent_menu_id: 1, second_category: null, ... },
  { depth: 3, parent_menu_id: 2, second_category: 'request', third_category: null, ... }
]
```

---

## ✅ 테스트 체크리스트

### 1. 로그인 API 테스트
```bash
POST /api/auth/login
{
  "company_id": 1,
  "loginId": "test",
  "password": "test123"
}
```

**확인 항목:**
- [ ] `permissions` 배열에 `permission_type='menu'` 항목 존재
- [ ] `permissions` 배열에 `permission_type='action'` 항목 존재
- [ ] 각 permission에 `is_system_permission`, `sort_order` 필드 존재
- [ ] `accessibleMenus` 배열에 `parent_menu_id` 필드 존재
- [ ] `accessibleMenus` 배열에 `third_category` 필드 존재
- [ ] depth 3 메뉴가 있으면 부모 depth 2, depth 1도 함께 반환

### 2. 권한 타입별 확인
```javascript
// 메뉴 접근 권한
const menuPermissions = permissions.filter(p => p.permission_type === 'menu');
console.log('메뉴 접근 권한:', menuPermissions.length);

// 동작 권한
const actionPermissions = permissions.filter(p => p.permission_type === 'action');
console.log('동작 권한:', actionPermissions.length);
```

### 3. 메뉴 계층 구조 확인
```javascript
// parent_menu_id로 트리 구축 테스트
const depth1 = accessibleMenus.filter(m => m.depth === 1 && m.parent_menu_id === null);
const depth2 = accessibleMenus.filter(m => m.depth === 2);
const depth3 = accessibleMenus.filter(m => m.depth === 3);

console.log('depth 1:', depth1.length);
console.log('depth 2:', depth2.length);
console.log('depth 3:', depth3.length);

// 부모-자식 관계 확인
depth3.forEach(menu => {
  const parent = accessibleMenus.find(m => m.menu_id === menu.parent_menu_id);
  console.log(`${menu.menu_name} → 부모: ${parent?.menu_name}`);
});
```

---

## 🚨 주의사항

### 1. 데이터베이스 마이그레이션 선행 필수

서버 코드 수정 사항을 적용하기 전에 **반드시** 아래 마이그레이션 스크립트를 먼저 실행해야 합니다:

```bash
# 마이그레이션 경로
/client/src/table/마이그레이션/

# 실행 순서
1. 03_backup_old_data.sql       # 기존 데이터 백업
2. 04_clear_old_data.sql         # 기존 데이터 삭제
3. 05_insert_new_menu_data.sql   # 새 메뉴 데이터 (depth 3 구조)
4. 06_insert_menu_permissions.sql # 메뉴 접근 권한
5. 07_insert_action_permissions.sql # 동작 권한
6. 08_insert_menu_permission_mapping.sql
7. 09_insert_role_permission_mapping.sql
8. 10_migration_verification.sql # 검증
```

### 2. permission_type 값 변경

- **OLD:** `'menu_access'`, `'feature'`
- **NEW:** `'menu'`, `'action'`

기존 데이터의 permission_type 값이 다르면 **권한 조회가 되지 않습니다**.

### 3. 프론트엔드 동기화 필수

서버 응답 구조가 변경되므로 프론트엔드도 함께 수정되어야 합니다:

**이미 수정 완료:**
- [Sidebar.jsx](../../components/Sidebar.jsx) - `buildTreeRecursive()` parent_menu_id 기반
- [AuthProvider.jsx](../../contexts/AuthProvider.jsx) - permission_type 문서화

---

## 📚 관련 문서

- [마이그레이션 가이드](./README.md)
- [서버 로그인 API 가이드](./SERVER_LOGIN_API_GUIDE.md)
- [빠른 시작 가이드](./QUICKSTART.md)
- [권한 조회 쿼리](./11_user_permissions_query.sql)

---

## 🔍 트러블슈팅

### 문제 1: 로그인 후 메뉴가 표시되지 않음

**원인:**
- permission_type이 'menu_access'로 되어 있어서 조회 안 됨
- menu_permission 테이블에 데이터가 없음

**해결:**
```sql
-- permission_type 확인
SELECT permission_type, COUNT(*) 
FROM permission 
GROUP BY permission_type;

-- 'menu_access'가 보이면 마이그레이션 필요
-- 06_insert_menu_permissions.sql 실행
```

### 문제 2: 권한이 조회되지 않음

**원인:**
- role_permission과 menu_permission 매핑이 없음

**해결:**
```sql
-- role_permission 확인
SELECT r.role_code, p.permission_type, COUNT(*)
FROM role_permission rp
INNER JOIN role r ON rp.role_id = r.role_id
INNER JOIN permission p ON rp.permission_id = p.permission_id
GROUP BY r.role_code, p.permission_type;

-- 09_insert_role_permission_mapping.sql 실행
```

### 문제 3: depth 3 메뉴가 조회되지 않음

**원인:**
- menu 테이블에 parent_menu_id가 NULL이거나 잘못 설정됨

**해결:**
```sql
-- 메뉴 계층 구조 확인
SELECT depth, parent_menu_id, menu_code, menu_name
FROM menu
WHERE company_id = 1
ORDER BY depth, parent_menu_id, sort_order;

-- 05_insert_new_menu_data.sql 재실행
```

---

## 📊 성능 영향

### UNION ALL 사용
- 두 개의 테이블(role_permission, menu_permission)에서 조회하므로 쿼리 실행 시간 약간 증가
- 하지만 사용자당 권한 수가 많지 않으므로 (보통 10~50개) 성능 영향 미미

### CTE 사용 (WITH 절)
- depth 3까지 조회하기 위해 3번의 조인 수행
- 인덱스가 잘 설정되어 있으면 성능 문제 없음
- 로그인은 자주 발생하지 않으므로 캐싱 활용 권장

### 권장 인덱스
```sql
-- menu 테이블
CREATE INDEX idx_menu_parent ON menu(company_id, parent_menu_id, is_active);
CREATE INDEX idx_menu_depth ON menu(company_id, depth, is_active);

-- permission 테이블
CREATE INDEX idx_permission_type ON permission(company_id, permission_type, is_active);

-- menu_permission 테이블
CREATE INDEX idx_menu_perm_menu ON menu_permission(company_id, menu_id, is_active);
CREATE INDEX idx_menu_perm_perm ON menu_permission(company_id, permission_id, is_active);
```

---

## ✨ 개선 효과

### 1. 권한 관리의 명확성
- 메뉴 접근 권한과 동작 권한을 명확히 분리
- permission_type으로 쉽게 구분 가능

### 2. 유연한 메뉴 구조
- depth 3까지 지원으로 복잡한 메뉴 계층 구현 가능
- parent_menu_id 기반으로 트리 구조 자동 구축

### 3. 유지보수성 향상
- 명확한 주석과 문서화
- 쿼리 가독성 향상 (CTE 사용)

### 4. 확장성
- 새로운 메뉴 추가 시 parent_menu_id만 설정하면 자동 포함
- 권한 추가 시 permission_type만 지정하면 자동 분류
