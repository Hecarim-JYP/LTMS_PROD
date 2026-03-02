# 권한 시스템 재설계 가이드

## 목차
1. [개요](#개요)
2. [변경 사항](#변경-사항)
3. [테이블 구조](#테이블-구조)
4. [데이터 구조](#데이터-구조)
5. [마이그레이션 절차](#마이그레이션-절차)
6. [API 수정 가이드](#api-수정-가이드)
7. [프론트엔드 수정 가이드](#프론트엔드-수정-가이드)

---

## 개요

### 문제점
기존 시스템은 메뉴 접근 권한과 페이지 내 동작 권한이 혼재되어 있어 권한 관리가 복잡했습니다.

### 해결 방안
**권한을 2개 계층으로 분리**
1. **메뉴 접근 권한** (Menu Permission): 특정 메뉴/페이지에 접근할 수 있는지
2. **동작 권한** (Action Permission): 페이지 내에서 특정 동작(생성, 수정, 삭제 등)을 수행할 수 있는지

---

## 변경 사항

### 1. menu 테이블
- **제거**: `available_actions` 컬럼 (JSON 타입)
- **추가**: `third_category` 컬럼 (VARCHAR)
- **변경**: depth 3까지 지원 (기존 depth 2)

### 2. permission 테이블
- **변경**: `permission_type` 값
  - 기존: `'feature'`, `'data'`, `'api'`
  - 변경: `'menu'`, `'action'`

### 3. 메뉴 구조
```
depth 1: 카테고리 (예: CT, 내부 성분 분석)
  └ depth 2: 서브카테고리 (예: 의뢰, 시험성적서)
      └ depth 3: 실제 페이지 (예: 의뢰 조회, 의뢰 등록, 의뢰 결재)
```

### 4. 권한 타입 분리
```
permission_type = 'menu'  → 메뉴 접근 권한 (menu_permission 테이블과 연결)
permission_type = 'action' → 동작 권한 (role_permission 테이블로 관리)
```

---

## 테이블 구조

### menu 테이블 (변경 후)
```sql
CREATE TABLE `menu` (
  `menu_id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL DEFAULT 1,
  `menu_code` VARCHAR(50) NOT NULL,
  `first_category` VARCHAR(50) DEFAULT NULL,
  `second_category` VARCHAR(50) DEFAULT NULL,
  `third_category` VARCHAR(50) DEFAULT NULL,  -- 추가
  `menu_name` VARCHAR(100) NOT NULL,
  `menu_path` VARCHAR(300) DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `depth` TINYINT(1) NOT NULL,  -- 1~3
  -- `available_actions` 제거
  `requires_permission` TINYINT(1) DEFAULT 1,
  `parent_menu_id` INT DEFAULT NULL,
  `sort_order` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  -- 공통 필드...
  PRIMARY KEY (`menu_id`)
);
```

### permission 테이블 (변경 후)
```sql
CREATE TABLE `permission` (
  `permission_id` INT AUTO_INCREMENT,
  `company_id` INT NOT NULL DEFAULT 1,
  `permission_code` VARCHAR(100) NOT NULL,
  `permission_name` VARCHAR(100) NOT NULL,
  `permission_name_en` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `module` VARCHAR(50) DEFAULT NULL,
  `action` VARCHAR(50) DEFAULT NULL,
  `resource` VARCHAR(100) DEFAULT NULL,
  `permission_type` VARCHAR(20) DEFAULT 'action'  -- 'menu' 또는 'action'
    COMMENT '권한 타입 (menu: 메뉴 접근 권한, action: 동작 권한)',
  `is_system_permission` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 1,
  -- 공통 필드...
  PRIMARY KEY (`permission_id`)
);
```

### menu_permission 테이블 (기존 유지)
```sql
CREATE TABLE `menu_permission` (
  `menu_permission_id` INT AUTO_INCREMENT,
  `company_id` INT NOT NULL DEFAULT 1,
  `menu_id` INT NOT NULL,          -- menu 테이블 FK
  `permission_id` INT NOT NULL,    -- permission 테이블 FK (type='menu')
  `is_required` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  -- 공통 필드...
  PRIMARY KEY (`menu_permission_id`)
);
```

### role_permission 테이블 (기존 유지)
```sql
CREATE TABLE `role_permission` (
  `role_permission_id` INT AUTO_INCREMENT,
  `company_id` INT NOT NULL DEFAULT 1,
  `role_id` INT NOT NULL,          -- role 테이블 FK
  `permission_id` INT NOT NULL,    -- permission 테이블 FK (type='menu' 또는 'action')
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 1,
  -- 공통 필드...
  PRIMARY KEY (`role_permission_id`)
);
```

---

## 데이터 구조

### 메뉴 예시 (CT 모듈)
```
menu_id | menu_code              | menu_name    | depth | parent_id | menu_path
--------|------------------------|--------------|-------|-----------|-------------------------
1       | ct                     | CT           | 1     | NULL      | NULL
2       | ct_request_category    | 의뢰         | 2     | 1         | NULL
5       | ct_request_read        | 의뢰 조회    | 3     | 2         | /ct/request/read
6       | ct_request_create      | 의뢰 등록    | 3     | 2         | /ct/request/create
7       | ct_request_approval    | 의뢰 결재    | 3     | 2         | /ct/request/approval
```

### 메뉴 접근 권한 예시
```
permission_id | permission_code           | permission_name           | permission_type | module      | action
--------------|---------------------------|---------------------------|-----------------|-------------|--------
1             | menu.ct_request_read      | CT 의뢰 조회 메뉴 접근    | menu            | ct_request  | read
2             | menu.ct_request_create    | CT 의뢰 등록 메뉴 접근    | menu            | ct_request  | create
3             | menu.ct_request_approval  | CT 의뢰 결재 메뉴 접근    | menu            | ct_request  | approval
```

### 동작 권한 예시
```
permission_id | permission_code           | permission_name       | permission_type | module      | action
--------------|---------------------------|-----------------------|-----------------|-------------|--------
100           | action.ct_request.read    | CT 의뢰 데이터 조회   | action          | ct_request  | read
101           | action.ct_request.create  | CT 의뢰 생성          | action          | ct_request  | create
102           | action.ct_request.update  | CT 의뢰 수정          | action          | ct_request  | update
103           | action.ct_request.delete  | CT 의뢰 삭제          | action          | ct_request  | delete
104           | action.ct_request.approve | CT 의뢰 결재 승인     | action          | ct_request  | approve
```

---

## 마이그레이션 절차

### 실행 순서
```bash
# 1. 백업
mysql -u [user] -p [database] < 03_backup_old_data.sql

# 2. 테이블 구조 변경
mysql -u [user] -p [database] < 01_alter_menu_table.sql
mysql -u [user] -p [database] < 02_alter_permission_table.sql

# 3. 기존 데이터 정리
mysql -u [user] -p [database] < 04_clear_old_data.sql

# 4. 새로운 데이터 삽입
mysql -u [user] -p [database] < 05_insert_new_menu_data.sql
mysql -u [user] -p [database] < 06_insert_menu_permissions.sql
mysql -u [user] -p [database] < 07_insert_action_permissions.sql

# 5. 매핑 데이터 생성
mysql -u [user] -p [database] < 08_insert_menu_permission_mapping.sql
mysql -u [user] -p [database] < 09_insert_role_permission_mapping.sql

# 6. 검증
mysql -u [user] -p [database] < 10_migration_verification.sql
```

### 주의사항
1. **프로덕션 환경에서는 반드시 백업 후 진행**
2. 마이그레이션 중 서비스 중단 시간 고려
3. 검증 쿼리로 데이터 정합성 확인

---

## API 수정 가이드

### 1. 로그인 API 응답 변경

**기존 응답 구조:**
```json
{
  "user": { ... },
  "token": "...",
  "permissions": ["ct_request.read", "ct_request.create", ...]
}
```

**새로운 응답 구조:**
```json
{
  "user": { ... },
  "token": "...",
  "menuPermissions": [
    {
      "menu_id": 5,
      "menu_code": "ct_request_read",
      "menu_name": "의뢰 조회",
      "menu_path": "/ct/request/read",
      "depth": 3,
      "parent_menu_id": 2,
      "first_category": "ct",
      "second_category": "request"
    },
    ...
  ],
  "actionPermissions": [
    {
      "permission_code": "action.ct_request.read",
      "module": "ct_request",
      "action": "read",
      "resource": "/api/ct/request"
    },
    ...
  ]
}
```

### 2. 서버 코드 수정 예시

**파일: `server/src/service/ltms/authService.js`**

```javascript
async function getUserPermissions(userId) {
  // 1. 메뉴 접근 권한 조회
  const menuPermissions = await db.query(`
    SELECT DISTINCT
      m.menu_id, m.menu_code, m.menu_name, m.menu_path,
      m.depth, m.parent_menu_id, m.first_category, 
      m.second_category, m.third_category, m.sort_order
    FROM user u
    INNER JOIN user_role ur ON u.user_id = ur.user_id
    INNER JOIN role r ON ur.role_id = r.role_id
    INNER JOIN role_permission rp ON r.role_id = rp.role_id
    INNER JOIN permission p ON rp.permission_id = p.permission_id
    INNER JOIN menu_permission mp ON p.permission_id = mp.permission_id
    INNER JOIN menu m ON mp.menu_id = m.menu_id
    WHERE u.user_id = ?
      AND p.permission_type = 'menu'
      AND ur.is_active = 1 AND r.is_active = 1
      AND rp.is_active = 1 AND p.is_active = 1
      AND m.is_active = 1
      AND ur.deleted_at IS NULL AND r.deleted_at IS NULL
      AND rp.deleted_at IS NULL AND p.deleted_at IS NULL
      AND m.deleted_at IS NULL
    ORDER BY m.sort_order, m.depth, m.menu_id
  `, [userId]);

  // 2. 동작 권한 조회
  const actionPermissions = await db.query(`
    SELECT DISTINCT
      p.permission_code, p.module, p.action, p.resource
    FROM user u
    INNER JOIN user_role ur ON u.user_id = ur.user_id
    INNER JOIN role r ON ur.role_id = r.role_id
    INNER JOIN role_permission rp ON r.role_id = rp.role_id
    INNER JOIN permission p ON rp.permission_id = p.permission_id
    WHERE u.user_id = ?
      AND p.permission_type = 'action'
      AND ur.is_active = 1 AND r.is_active = 1
      AND rp.is_active = 1 AND p.is_active = 1
      AND ur.deleted_at IS NULL AND r.deleted_at IS NULL
      AND rp.deleted_at IS NULL AND p.deleted_at IS NULL
    ORDER BY p.module, p.action
  `, [userId]);

  return {
    menuPermissions,
    actionPermissions
  };
}
```

### 3. 권한 체크 미들웨어 수정

**파일: `server/src/middleware/ltms/authMiddleware.js`**

```javascript
// 메뉴 접근 권한 체크
function checkMenuAccess(menuCode) {
  return (req, res, next) => {
    const { menuPermissions } = req.user; // 토큰에서 추출
    
    const hasAccess = menuPermissions.some(
      menu => menu.menu_code === menuCode
    );
    
    if (!hasAccess) {
      return res.status(403).json({ 
        message: '해당 메뉴에 접근할 권한이 없습니다.' 
      });
    }
    
    next();
  };
}

// 동작 권한 체크
function checkActionPermission(module, action) {
  return (req, res, next) => {
    const { actionPermissions } = req.user; // 토큰에서 추출
    
    const hasPermission = actionPermissions.some(
      perm => perm.module === module && perm.action === action
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        message: '해당 작업을 수행할 권한이 없습니다.' 
      });
    }
    
    next();
  };
}

// 사용 예시
router.get('/ct/request', 
  checkMenuAccess('ct_request_read'),
  checkActionPermission('ct_request', 'read'),
  ctController.getRequests
);

router.post('/ct/request', 
  checkMenuAccess('ct_request_create'),
  checkActionPermission('ct_request', 'create'),
  ctController.createRequest
);
```

---

## 프론트엔드 수정 가이드

### 1. AuthContext 수정

**파일: `client/src/contexts/AuthContext.jsx`**

```jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [menuPermissions, setMenuPermissions] = useState([]);
  const [actionPermissions, setActionPermissions] = useState([]);
  
  // 로그인
  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    setUser(data.user);
    setMenuPermissions(data.menuPermissions);
    setActionPermissions(data.actionPermissions);
    
    // localStorage에 저장
    localStorage.setItem('token', data.token);
    localStorage.setItem('menuPermissions', JSON.stringify(data.menuPermissions));
    localStorage.setItem('actionPermissions', JSON.stringify(data.actionPermissions));
  };
  
  // 메뉴 접근 권한 체크
  const hasMenuAccess = (menuCode) => {
    return menuPermissions.some(menu => menu.menu_code === menuCode);
  };
  
  // 동작 권한 체크
  const hasActionPermission = (module, action) => {
    return actionPermissions.some(
      perm => perm.module === module && perm.action === action
    );
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      menuPermissions,
      actionPermissions,
      login,
      hasMenuAccess,
      hasActionPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2. Sidebar 메뉴 렌더링 수정

**파일: `client/src/components/Sidebar.jsx`**

```jsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function Sidebar() {
  const { menuPermissions } = useContext(AuthContext);
  
  // 메뉴를 계층 구조로 변환
  const buildMenuTree = (menus) => {
    const menuMap = {};
    const rootMenus = [];
    
    // 1. 모든 메뉴를 맵에 저장
    menus.forEach(menu => {
      menuMap[menu.menu_id] = { ...menu, children: [] };
    });
    
    // 2. 부모-자식 관계 설정
    menus.forEach(menu => {
      if (menu.parent_menu_id) {
        const parent = menuMap[menu.parent_menu_id];
        if (parent) {
          parent.children.push(menuMap[menu.menu_id]);
        }
      } else {
        rootMenus.push(menuMap[menu.menu_id]);
      }
    });
    
    return rootMenus;
  };
  
  const menuTree = buildMenuTree(menuPermissions);
  
  return (
    <aside className="sidebar">
      {menuTree.map(menu => (
        <MenuItem key={menu.menu_id} menu={menu} />
      ))}
    </aside>
  );
}

function MenuItem({ menu }) {
  if (menu.children.length > 0) {
    return (
      <div className="menu-group">
        <div className="menu-title">{menu.menu_name}</div>
        <ul className="menu-list">
          {menu.children.map(child => (
            <MenuItem key={child.menu_id} menu={child} />
          ))}
        </ul>
      </div>
    );
  }
  
  return (
    <li className="menu-item">
      <a href={menu.menu_path}>{menu.menu_name}</a>
    </li>
  );
}
```

### 3. 페이지 내 권한 체크

**파일: `client/src/modules/CT/CT_Request_Read.jsx`**

```jsx
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

function CT_Request_Read() {
  const { hasActionPermission } = useContext(AuthContext);
  
  // 권한 체크
  const canCreate = hasActionPermission('ct_request', 'create');
  const canUpdate = hasActionPermission('ct_request', 'update');
  const canDelete = hasActionPermission('ct_request', 'delete');
  const canExport = hasActionPermission('ct_request', 'export');
  
  return (
    <div>
      <h1>CT 의뢰 조회</h1>
      
      <div className="actions">
        {canCreate && (
          <button onClick={handleCreate}>등록</button>
        )}
        {canExport && (
          <button onClick={handleExport}>내보내기</button>
        )}
      </div>
      
      <table>
        {/* 데이터 테이블 */}
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>
                {canUpdate && (
                  <button onClick={() => handleEdit(row.id)}>수정</button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(row.id)}>삭제</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. 라우트 가드 수정

**파일: `client/src/components/ProtectedRoute.jsx`**

```jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function ProtectedRoute({ menuCode, children }) {
  const { user, hasMenuAccess } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (menuCode && !hasMenuAccess(menuCode)) {
    return <Navigate to="/forbidden" />;
  }
  
  return children;
}

// 사용 예시
<Routes>
  <Route path="/ct/request/read" element={
    <ProtectedRoute menuCode="ct_request_read">
      <CT_Request_Read />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 추가 참고 사항

### 1. 부모 메뉴 포함 전체 메뉴 트리 조회
사용자가 접근 가능한 depth 3 메뉴의 부모 메뉴(depth 1, 2)도 함께 조회해야 합니다.
SQL 파일: `11_user_permissions_query.sql` 참고

### 2. 캐싱 전략
- 메뉴 권한은 사용자 세션 동안 캐싱
- 동작 권한은 API 호출마다 체크 (실시간 반영)

### 3. 권한 변경 시 대응
- 관리자가 권한 변경 시 → 해당 사용자 재로그인 필요
- 또는 WebSocket/SSE로 권한 변경 알림 전송

### 4. 성능 최적화
- 권한 조회 쿼리에 적절한 인덱스 설정 완료
- JOIN이 많으므로 쿼리 실행 계획 확인 권장
