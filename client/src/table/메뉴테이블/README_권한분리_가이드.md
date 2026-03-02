# 메뉴 접근 권한과 기능 실행 권한 분리 가이드

## 📌 개요

메뉴 접근 권한(.access)과 기능 실행 권한(.read, .create, .update, .delete, .approval)을 명확히 분리하여 세밀한 권한 제어를 가능하게 합니다.

### 목적
- ✅ 메뉴는 보이지만 조회만 가능하도록 제어
- ✅ 메뉴는 보이고 조회/등록만 가능하도록 제어
- ✅ 역할별로 다른 기능 접근 권한 부여

---

## 🎯 권한 체계

### 1. 메뉴 접근 권한 (`menu_access`)
```
permission_type = 'menu_access'
action = 'access'
예: ct_request.access, ct_testReport.access
```

**용도:** 해당 메뉴에 접근할 수 있는지 여부만 제어
- 메뉴 접근 권한이 없으면 사이드바에 메뉴가 표시되지 않음
- 메뉴 접근 권한이 있어도 기능 권한이 없으면 화면에서 아무것도 못함

### 2. 기능 실행 권한 (`feature`)
```
permission_type = 'feature'
action = 'read' | 'create' | 'update' | 'delete' | 'approval'
예: ct_request.read, ct_request.create, ct_request.update
```

**용도:** 메뉴 내에서 특정 기능을 실행할 수 있는지 제어
- read: 데이터 조회
- create: 데이터 등록
- update: 데이터 수정
- delete: 데이터 삭제
- approval: 결재 처리

---

## 📊 테이블 구조

### permission 테이블
```sql
-- 메뉴 접근 권한
permission_id: 76
permission_code: 'ct_request.access'
permission_type: 'menu_access'
action: 'access'

-- 기능 실행 권한들
permission_id: 1
permission_code: 'ct_request.read'
permission_type: 'feature'
action: 'read'

permission_id: 2
permission_code: 'ct_request.create'
permission_type: 'feature'
action: 'create'
```

### menu_permission 테이블
```sql
-- 각 메뉴별로 .access 권한만 등록 (1개)
menu_id: (ct_request 메뉴)
permission_id: 76  -- ct_request.access
```

### role_permission 테이블
```sql
-- 역할별로 필요한 권한 배정
role_id: (ROLE_USER)
permission_ids: [
  76,  -- ct_request.access (메뉴 접근)
  1,   -- ct_request.read (조회)
  2    -- ct_request.create (등록)
]
```

---

## 🔧 구현 순서

### 1단계: 메뉴 접근 권한 추가
```bash
mysql -u root -p lims_db < add_menu_access_permissions.sql
```

**결과:**
- permission 테이블에 .access 권한 추가
- 모든 2depth, 3depth 메뉴별로 1개씩

### 2단계: menu_permission 재구성
```bash
mysql -u root -p lims_db < update_menu_permission.sql
```

**결과:**
- 기존 menu_permission 데이터 삭제
- 각 메뉴별로 .access 권한만 등록

### 3단계: 역할별 권한 배정
```bash
# 예시 확인
mysql -u root -p lims_db < example_role_permission_assignment.sql

# 또는 수동으로 권한 관리 화면에서 배정
```

**결과:**
- 각 역할에 메뉴 접근 + 기능 권한 조합 배정

### 4단계: 서버 재시작
```bash
# 쿼리 변경사항 반영을 위해 서버 재시작
```

---

## 💡 권한 배정 시나리오

### 시나리오 1: 조회 전용 사용자
```sql
-- ROLE_VIEWER에게 배정할 권한
ct_request.access    -- 메뉴 접근 O
ct_request.read      -- 조회 O
-- create, update, delete 없음
```

**결과:**
- ✅ CT 의뢰 메뉴 보임
- ✅ 데이터 조회 가능
- ❌ 등록 버튼 숨김
- ❌ 수정 버튼 숨김
- ❌ 삭제 버튼 숨김

### 시나리오 2: 일반 사용자
```sql
-- ROLE_USER에게 배정할 권한
ct_request.access    -- 메뉴 접근 O
ct_request.read      -- 조회 O
ct_request.create    -- 등록 O
-- update, delete 없음
```

**결과:**
- ✅ CT 의뢰 메뉴 보임
- ✅ 데이터 조회 가능
- ✅ 등록 버튼 보임
- ❌ 수정 버튼 숨김
- ❌ 삭제 버튼 숨김

### 시나리오 3: 관리자
```sql
-- ROLE_MANAGER에게 배정할 권한
ct_request.access    -- 메뉴 접근 O
ct_request.read      -- 조회 O
ct_request.create    -- 등록 O
ct_request.update    -- 수정 O
ct_request.delete    -- 삭제 O
ct_request.approval  -- 결재 O
```

**결과:**
- ✅ CT 의뢰 메뉴 보임
- ✅ 모든 기능 사용 가능

### 시나리오 4: 메뉴 접근 권한 없음
```sql
-- .access 권한이 없음
-- ct_request.read, ct_request.create만 있음
```

**결과:**
- ❌ CT 의뢰 메뉴가 사이드바에 표시되지 않음
- ❌ URL로 직접 접근해도 차단됨

---

## 🔍 권한 체크 로직

### 서버 (로그인 시)
```javascript
// selectAccessibleMenusByRoles
// menu_permission과 role_permission 조인
// .access 권한 보유한 메뉴만 반환
accessibleMenus = [
  { menu_code: 'ct_request', menu_name: 'CT 의뢰', ... }
]
```

### 클라이언트 (AuthProvider)
```javascript
// 메뉴 접근 체크 (사이드바)
hasMenuAccess('ct_request')
// → user.menu_codes에 포함 여부 확인

// 기능 실행 체크 (버튼 표시)
canPerformAction('ct_request', 'create')
// → user.permission_map['ct_request.create'] 확인
```

---

## 📋 체크리스트

### SQL 실행
- [ ] add_menu_access_permissions.sql 실행
- [ ] update_menu_permission.sql 실행
- [ ] example_role_permission_assignment.sql 확인
- [ ] 각 역할별 권한 실제 배정

### 확인 사항
- [ ] permission 테이블에 .access 권한 추가 확인
- [ ] menu_permission에 각 메뉴당 1개씩만 등록 확인
- [ ] role_permission에 역할별 권한 배정 확인
- [ ] 서버 재시작
- [ ] 로그인하여 메뉴 표시 확인
- [ ] 각 화면에서 버튼 표시 확인

### 테스트 시나리오
- [ ] 조회 전용 사용자로 로그인 → 조회만 가능 확인
- [ ] 일반 사용자로 로그인 → 조회/등록만 가능 확인
- [ ] 관리자로 로그인 → 모든 기능 가능 확인
- [ ] 메뉴 접근 권한 없는 사용자 → 메뉴 안 보임 확인

---

## 🚨 주의사항

1. **순서 준수**
   - 반드시 add_menu_access_permissions.sql → update_menu_permission.sql 순서로 실행

2. **백업**
   - 프로덕션 환경에서는 먼저 백업 후 실행
   ```sql
   CREATE TABLE permission_backup AS SELECT * FROM permission;
   CREATE TABLE menu_permission_backup AS SELECT * FROM menu_permission;
   CREATE TABLE role_permission_backup AS SELECT * FROM role_permission;
   ```

3. **권한 배정**
   - .access 권한 없이 기능 권한만 있으면 메뉴가 안 보임
   - 메뉴 접근 시 항상 .access 권한 먼저 배정

4. **기존 사용자**
   - 기존 사용자들의 권한이 초기화될 수 있음
   - 역할별로 다시 권한 배정 필요

---

## 📞 문제 해결

### 메뉴가 안 보이는 경우
1. .access 권한 배정 확인
2. role_permission 테이블 확인
3. menu_permission 테이블 확인

### 버튼이 안 보이는 경우
1. 해당 기능 권한(.read, .create 등) 배정 확인
2. canPerformAction 함수 로직 확인

### SQL 에러 발생 시
1. permission 테이블에 중복 데이터 확인
2. menu_permission 외래키 제약 확인

---

## 📚 참고

- permission_type: 'menu_access' vs 'feature'
- action: 'access' vs 'read', 'create', 'update', 'delete', 'approval'
- menu_permission: 메뉴당 1개 (.access만)
- role_permission: 역할당 N개 (.access + 기능 권한들)
