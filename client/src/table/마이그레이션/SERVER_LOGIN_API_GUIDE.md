# 서버 로그인 API 수정 가이드

## 📋 개요
새로운 권한 시스템(메뉴 접근 권한 / 동작 권한 분리)에 맞춰 로그인 API 응답 구조를 수정합니다.

---

## 🔄 변경사항 요약

### 1. **permissions 응답 변경**
- `permission_type` 필드 추가 ('menu' 또는 'action')
- 메뉴 접근 권한과 동작 권한을 모두 포함

### 2. **accessibleMenus 응답 변경**
- `parent_menu_id` 필드 추가 (계층 구조용)
- `second_category` 필드 추가
- depth 3까지 지원

---

## 📝 새로운 응답 구조

```javascript
{
  success: true,
  data: {
    result: {
      // 사용자 기본 정보
      userInfo: {
        user_id: 7,
        company_id: 1,
        user_name: "test",
        email: "test@example.com",
        // ... 기타 사용자 정보
      },
      
      // 역할 정보 (단일 역할)
      role: {
        role_id: 3,
        role_code: "USER",
        role_name: "사용자",
        role_level: 10
      },
      
      // 권한 정보 (메뉴 접근 + 동작 권한)
      permissions: [
        // 메뉴 접근 권한 (permission_type='menu')
        {
          permission_id: 1,
          permission_code: "menu.ct_request_read",
          permission_name: "CT 의뢰 조회 메뉴 접근",
          permission_name_en: "CT Request Read Menu Access",
          module: "ct_request",
          action: "read",
          resource: "/ct/request/read",
          permission_type: "menu",        // ★ 추가
          is_system_permission: 1,
          is_active: 1,
          sort_order: 1
        },
        
        // 동작 권한 (permission_type='action')
        {
          permission_id: 100,
          permission_code: "action.ct_request.read",
          permission_name: "CT 의뢰 데이터 조회",
          permission_name_en: "CT Request Data Read",
          module: "ct_request",
          action: "read",
          resource: "/api/ct/request",
          permission_type: "action",      // ★ 추가
          is_system_permission: 1,
          is_active: 1,
          sort_order: 100
        },
        {
          permission_id: 101,
          permission_code: "action.ct_request.create",
          permission_name: "CT 의뢰 생성",
          permission_name_en: "CT Request Create",
          module: "ct_request",
          action: "create",
          resource: "/api/ct/request",
          permission_type: "action",
          is_system_permission: 1,
          is_active: 1,
          sort_order: 101
        }
      ],
      
      // 접근 가능한 메뉴 목록 (parent_menu_id 기반 계층 구조)
      accessibleMenus: [
        // depth 1 (카테고리)
        {
          menu_id: 1,
          menu_code: "ct",
          menu_name: "CT",
          menu_path: null,
          depth: 1,
          parent_menu_id: null,           // ★ 추가
          sort_order: 1,
          first_category: null,
          second_category: null,
          third_category: null
        },
        
        // depth 2 (서브카테고리)
        {
          menu_id: 2,
          menu_code: "ct_request_category",
          menu_name: "의뢰",
          menu_path: null,
          depth: 2,
          parent_menu_id: 1,              // ★ 추가 (부모: ct)
          sort_order: 1,
          first_category: "ct",
          second_category: null,
          third_category: null
        },
        
        // depth 3 (실제 페이지)
        {
          menu_id: 5,
          menu_code: "ct_request_read",
          menu_name: "의뢰 조회",
          menu_path: "/ct/request/read",
          depth: 3,
          parent_menu_id: 2,              // ★ 추가 (부모: ct_request_category)
          sort_order: 1,
          first_category: "ct",
          second_category: "request",     // ★ 추가
          third_category: null
        },
        {
          menu_id: 6,
          menu_code: "ct_request_create",
          menu_name: "의뢰 등록",
          menu_path: "/ct/request/create",
          depth: 3,
          parent_menu_id: 2,
          sort_order: 2,
          first_category: "ct",
          second_category: "request",
          third_category: null
        }
      ],
      
      // 커스텀 설정
      customSettings: {
        setting_id: 7,
        default_menu_code: "ct_request_read",
        default_page_path: "/ct/request/read",
        module_default_settings: {
          ct: {
            request: { action: "read" },
            testReport: { action: "read" }
          }
        },
        theme_mode: "light",
        items_per_page: 20,
        // ... 기타 설정
      }
    }
  }
}
```

---

## 🗄️ 서버 쿼리 수정

### 1. **권한 조회 쿼리 (permissions)**

```sql
-- 사용자의 전체 권한 조회 (메뉴 접근 + 동작 권한)
SELECT DISTINCT
  p.permission_id,
  p.permission_code,
  p.permission_name,
  p.permission_name_en,
  p.description,
  p.module,
  p.action,
  p.resource,
  p.permission_type,          -- ★ 추가: 'menu' 또는 'action'
  p.is_system_permission,
  p.is_active,
  p.sort_order
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
ORDER BY p.permission_type, p.sort_order;
```

### 2. **접근 가능한 메뉴 조회 쿼리 (accessibleMenus)**

```sql
-- 사용자가 접근 가능한 메뉴 목록 조회 (depth 1~3, parent_menu_id 포함)
WITH user_menu_permissions AS (
  -- 사용자가 가진 메뉴 접근 권한
  SELECT DISTINCT p.permission_id, p.module
  FROM user u
  INNER JOIN user_role ur ON u.user_id = ur.user_id AND ur.is_active = 1 AND ur.deleted_at IS NULL
  INNER JOIN role r ON ur.role_id = r.role_id AND r.is_active = 1 AND r.deleted_at IS NULL
  INNER JOIN role_permission rp ON r.role_id = rp.role_id AND rp.is_active = 1 AND rp.deleted_at IS NULL
  INNER JOIN permission p ON rp.permission_id = p.permission_id 
    AND p.permission_type = 'menu'    -- ★ 메뉴 접근 권한만
    AND p.is_active = 1 
    AND p.deleted_at IS NULL
  WHERE u.user_id = ?
    AND u.is_active = 1
    AND u.deleted_at IS NULL
),
accessible_depth3_menus AS (
  -- depth 3 메뉴 (실제 페이지)
  SELECT DISTINCT
    m.menu_id,
    m.menu_code,
    m.menu_name,
    m.menu_path,
    m.depth,
    m.parent_menu_id,         -- ★ 추가
    m.first_category,
    m.second_category,        -- ★ 추가
    m.third_category,
    m.sort_order
  FROM menu m
  INNER JOIN menu_permission mp ON m.menu_id = mp.menu_id AND mp.is_active = 1 AND mp.deleted_at IS NULL
  INNER JOIN user_menu_permissions ump ON mp.permission_id = ump.permission_id
  WHERE m.depth = 3
    AND m.is_active = 1
    AND m.deleted_at IS NULL
),
accessible_depth2_menus AS (
  -- depth 2 메뉴 (서브카테고리) - depth 3의 부모
  SELECT DISTINCT
    m.menu_id,
    m.menu_code,
    m.menu_name,
    m.menu_path,
    m.depth,
    m.parent_menu_id,
    m.first_category,
    m.second_category,
    m.third_category,
    m.sort_order
  FROM menu m
  INNER JOIN accessible_depth3_menus d3 ON m.menu_id = d3.parent_menu_id
  WHERE m.depth = 2
    AND m.is_active = 1
    AND m.deleted_at IS NULL
),
accessible_depth1_menus AS (
  -- depth 1 메뉴 (카테고리) - depth 2의 부모
  SELECT DISTINCT
    m.menu_id,
    m.menu_code,
    m.menu_name,
    m.menu_path,
    m.depth,
    m.parent_menu_id,
    m.first_category,
    m.second_category,
    m.third_category,
    m.sort_order
  FROM menu m
  INNER JOIN accessible_depth2_menus d2 ON m.menu_id = d2.parent_menu_id
  WHERE m.depth = 1
    AND m.is_active = 1
    AND m.deleted_at IS NULL
)
-- 전체 메뉴 통합 (depth 1 + depth 2 + depth 3)
SELECT * FROM accessible_depth1_menus
UNION ALL
SELECT * FROM accessible_depth2_menus
UNION ALL
SELECT * FROM accessible_depth3_menus
ORDER BY sort_order, depth, menu_id;
```

---

## 🔧 서버 코드 수정 예시

### Node.js + Express 예시

**파일: `server/src/service/ltms/authService.js`**

```javascript
const getUserPermissionsAndMenus = async (userId) => {
  try {
    // 1. 전체 권한 조회 (메뉴 접근 + 동작 권한)
    const permissions = await db.query(`
      SELECT DISTINCT
        p.permission_id,
        p.permission_code,
        p.permission_name,
        p.permission_name_en,
        p.description,
        p.module,
        p.action,
        p.resource,
        p.permission_type,          -- 'menu' 또는 'action'
        p.is_system_permission,
        p.is_active,
        p.sort_order
      FROM user u
      INNER JOIN user_role ur ON u.user_id = ur.user_id AND ur.is_active = 1 AND ur.deleted_at IS NULL
      INNER JOIN role r ON ur.role_id = r.role_id AND r.is_active = 1 AND r.deleted_at IS NULL
      INNER JOIN role_permission rp ON r.role_id = rp.role_id AND rp.is_active = 1 AND rp.deleted_at IS NULL
      INNER JOIN permission p ON rp.permission_id = p.permission_id AND p.is_active = 1 AND p.deleted_at IS NULL
      WHERE u.user_id = ?
        AND u.is_active = 1
        AND u.deleted_at IS NULL
      ORDER BY p.permission_type, p.sort_order
    `, [userId]);

    // 2. 접근 가능한 메뉴 조회 (위의 SQL 쿼리 사용)
    const accessibleMenus = await db.query(menuQuery, [userId]);

    return {
      permissions,
      accessibleMenus
    };
  } catch (error) {
    console.error('권한/메뉴 조회 실패:', error);
    throw error;
  }
};

// 로그인 응답
const login = async (loginId, password) => {
  // ... 인증 로직 ...
  
  const { permissions, accessibleMenus } = await getUserPermissionsAndMenus(userId);
  
  return {
    success: true,
    data: {
      result: {
        userInfo: { /* ... */ },
        role: { /* ... */ },
        permissions,           // permission_type 포함
        accessibleMenus,       // parent_menu_id, second_category 포함
        customSettings: { /* ... */ }
      }
    }
  };
};
```

---

## ✅ 테스트 체크리스트

### 1. **응답 데이터 확인**
```javascript
// 로그인 후 응답 확인
console.log('Permissions:', response.data.result.permissions);
console.log('Menu Permissions:', 
  response.data.result.permissions.filter(p => p.permission_type === 'menu')
);
console.log('Action Permissions:', 
  response.data.result.permissions.filter(p => p.permission_type === 'action')
);
console.log('Accessible Menus:', response.data.result.accessibleMenus);
```

### 2. **메뉴 계층 구조 확인**
```javascript
// depth별 메뉴 확인
const depth1 = accessibleMenus.filter(m => m.depth === 1);
const depth2 = accessibleMenus.filter(m => m.depth === 2);
const depth3 = accessibleMenus.filter(m => m.depth === 3);

console.log('Depth 1 (카테고리):', depth1);
console.log('Depth 2 (서브카테고리):', depth2);
console.log('Depth 3 (페이지):', depth3);

// parent_menu_id 관계 확인
depth3.forEach(menu => {
  const parent = accessibleMenus.find(m => m.menu_id === menu.parent_menu_id);
  console.log(`${menu.menu_name} → 부모: ${parent?.menu_name}`);
});
```

### 3. **권한 타입별 확인**
```javascript
// 메뉴 접근 권한 확인
const menuPermissions = permissions.filter(p => p.permission_type === 'menu');
console.log('메뉴 접근 권한 개수:', menuPermissions.length);

// 동작 권한 확인
const actionPermissions = permissions.filter(p => p.permission_type === 'action');
console.log('동작 권한 개수:', actionPermissions.length);
```

---

## 🚨 주의사항

1. **permission_type 필드 필수**
   - 모든 permission에 `permission_type` 포함 ('menu' 또는 'action')

2. **parent_menu_id 필드 필수**
   - 모든 menu에 `parent_menu_id` 포함 (depth 1은 NULL)

3. **second_category 필드 필수**
   - depth 3 메뉴에 `second_category` 포함

4. **정렬 순서 유지**
   - permissions: `permission_type`, `sort_order` 순으로 정렬
   - accessibleMenus: `sort_order`, `depth`, `menu_id` 순으로 정렬

5. **빈 배열 처리**
   - permissions, accessibleMenus가 빈 배열인 경우도 처리

---

## 📚 참고 문서

- [마이그레이션 가이드](./README.md)
- [권한 조회 쿼리](./11_user_permissions_query.sql)
- [빠른 시작 가이드](./QUICKSTART.md)
