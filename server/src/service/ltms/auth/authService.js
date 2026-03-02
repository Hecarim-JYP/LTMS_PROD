/**
 * 파일명 : authService.js
 * 용도 : 사용자 인증 비즈니스 로직 처리
 * 최초등록 : 2026-02-04 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import jwt from 'jsonwebtoken';
import { getPool } from '../../../repository/connection.js';
import * as utils from '../../../common/utils.js';
import * as authQuery from '../../../repository/sql/ltms/auth/authQuery.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';

/* ============================== 헬퍼 함수 ============================== */
/**
 * validateUserStatus : 사용자 상태 검증
 * --------------------------------------------
 * @param {*} userInfo : 사용자 정보 객체
 * @throws {Error} : 상태 검증 실패 시 에러
 */
const validateUserStatus = (userInfo) => {
  // 삭제된 사용자 체크
  if (userInfo.deleted_at !== null) {
    throw new Error('삭제된 사용자입니다. 관리자에게 문의하세요.');
  }

  // 비활성화된 사용자 체크
  if (userInfo.is_active !== 1) {
    throw new Error('비활성화된 사용자입니다. 관리자에게 문의하세요.');
  }

  // 사용자 상태 체크
  if (userInfo.status !== 'ACTIVE') {
    const statusMessage = {
      'INACTIVE': '비활성 상태',
      'LOCKED': '정지 상태',
      'PENDING': '승인 대기 중'
    }[userInfo.status] || '알 수 없는 상태';
    throw new Error(`${statusMessage}인 사용자입니다. 관리자에게 문의하세요.`);
  }

  // 계정 잠금 체크
  if (userInfo.is_locked === 1) {
    const reason = userInfo.locked_reason || '계정이 잠겨있습니다';
    let errMsg = `잠금일시 : ${userInfo.locked_at}\n`;
        errMsg += `잠금 사유 : ${reason}\n`;
        errMsg += `관리자에게 문의하세요.`;
    throw new Error(errMsg);
  }
};


/**
 * handlePasswordValidation : 비밀번호 검증 및 실패 처리
 * --------------------------------------------
 * @param {*} conn : DB 연결 객체
 * @param {*} queryParams : 비밀번호 검증용 파라미터
 * @param {*} userQueryParams : 사용자 업데이트용 파라미터
 * @param {*} storedPassword : 저장된 비밀번호
 * @throws {Error} : 비밀번호 불일치 시 에러
 */
const handlePasswordValidation = async (conn, queryParams, userQueryParams, storedPassword) => {
  const isValidPassword = await authQuery.verifyPassword(queryParams, storedPassword);

  if (!isValidPassword) {
    // 로그인 실패 횟수 증가
    await authQuery.incrementLoginFailCount(conn, userQueryParams);

    // 현재 실패 횟수 조회를 위해 사용자 정보 다시 조회
    const updatedUserInfo = await authQuery.selectUserInfoByUsername(conn, queryParams);
    const failCount = updatedUserInfo.failed_login_attempts || 0;
    const maxFailCount = 5; // 최대 허용 실패 횟수

    // 최대 실패 횟수 초과 시 계정 잠금
    if (failCount >= maxFailCount) {
      await authQuery.lockUserAccount(conn, {
        ...userQueryParams,
        locked_reason: `${maxFailCount}회 로그인 실패로 인한 자동 잠금`
      });
      throw new Error(`로그인 ${maxFailCount}회 실패로 계정이 잠금되었습니다.\n관리자에게 문의하세요.`);
    }

    throw new Error(`잘못된 비밀번호입니다.\n(실패횟수 : ${failCount} / ${maxFailCount})`);
  }
};


/**
 * parseRolesAndPermissions : 권한 데이터 파싱 (단일 역할 전용)
 * --------------------------------------------
 * @param {*} permissionsData : DB에서 조회한 권한 데이터 배열
 * @param {*} userInfo : 사용자 정보 (role_id 포함)
 * @returns : { role, permissions }
 * 
 * 권한 체계:
 *   - permission_type='menu': 메뉴 접근 권한 (menu_permission 테이블 사용)
 *   - permission_type='action': 동작 권한 (role_permission 테이블 사용)
 *   - 하나의 배열에 두 타입 모두 포함하여 반환
 */
const parseRolesAndPermissions = (permissionsData, userInfo) => {
  const permissionsSet = new Set();

  // 단일 역할 정보는 userInfo에서 직접 가져옴
  const role = {
    role_id: userInfo.role_id,
    role_code: userInfo.role_code,
    role_name: userInfo.role_name,
    role_name_en: userInfo.role_name_en,
    role_description: userInfo.role_description,
    role_level: userInfo.role_level
  };

  // 권한 정보 수집 (중복 제거)
  // permission_type='menu' + permission_type='action' 모두 포함
  permissionsData.forEach(row => {
    permissionsSet.add(JSON.stringify({
      permission_id: row.permission_id,
      permission_code: row.permission_code,
      permission_name: row.permission_name,
      permission_name_en: row.permission_name_en,
      permission_description: row.permission_description,
      resource: row.resource,
      permission_type: row.permission_type,        // 'menu' 또는 'action'
      is_system_permission: row.is_system_permission,
      sort_order: row.sort_order
    }));
  });

  return {
    role,
    permissions: Array.from(permissionsSet).map(p => JSON.parse(p))
  };
};

/* ============================== 로그인 ============================== */
/**
 * authenticateUser : 사용자 인증 및 로그인 정보 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라مي터 { loginId, password, company_id }
 * @returns : { userInfo, role, permissions, customSettings, accessibleMenus } * 
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
 *   - accessibleMenus: 접근 가능한 메뉴 목록 (parent_menu_id, second_category, third_category 포함) */
export const authenticateUser = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'loginId', 'password']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    user_name: utils.toStringOrEmpty(params.loginId),
    password: utils.toStringOrEmpty(params.password),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    // ========================================
    // 1단계: 사용자 정보 조회 및 검증
    // ========================================
    const userInfo = await authQuery.selectUserInfoByUsername(conn, queryParams);

    // 사용자 존재 여부 검증
    utils.checkRequiredValue(userInfo, 'user_info');

    const userQueryParams = {
      user_id: utils.toStringOrEmpty(userInfo.user_id),
      company_id: utils.toNumberOrNull(userInfo.company_id),
    };

    // 사용자 상태 검증 (헬퍼 함수 사용)
    validateUserStatus(userInfo);

    // ========================================
    // 2단계: 비밀번호 검증 및 로그인 실패 처리
    // ========================================
    await handlePasswordValidation(conn, queryParams, userQueryParams, userInfo.password);

    // 로그인 성공 시 실패 횟수 초기화
    await authQuery.resetLoginFailCount(conn, userQueryParams);

    // ========================================
    // 3단계: 로그인 성공 - 관련 데이터 병렬 조회
    // ========================================
    const [permissionsData, customSettings, accessibleMenus] = await Promise.all([
      // 사용자 역할 및 권한 조회
      authQuery.selectUserPermissionsByUserId(conn, userQueryParams),
      // 사용자 커스텀 설정 조회
      authQuery.selectUserCustomSettings(conn, userQueryParams),
      // 접근 가능한 메뉴 조회 (단일 역할 기반)
      authQuery.selectAccessibleMenusByRole(conn, {
        company_id: userQueryParams.company_id,
        role_id: userInfo.role_id
      })
    ]);

    // ========================================
    // 4단계: 데이터 파싱 (단일 역할 전용)
    // ========================================
    const { role, permissions } = parseRolesAndPermissions(permissionsData, userInfo);

    // ========================================
    // 5단계: 최종 결과 반환
    // ========================================
    return {
      result: {
        userInfo,
        role,                                    // 단일 역할 객체
        permissions,                             // 권한 배열
        customSettings: customSettings || {},
        accessibleMenus: accessibleMenus || []   // 메뉴 접근: OR 조건
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }

};


/* ============================== 메뉴 ============================== */
/**
 * getMenuList : 메뉴 목록 조회
 * --------------------------------------------
 * @param {*} params : { company_id }
 * @returns : 메뉴 목록 배열
 */
export const getMenuList = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting)
  }

  let conn;

  try {
    conn = await getPool().getConnection();
    const menuList = await authQuery.selectMenuList(conn, queryParams);

    return {
      result: menuList
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
  
};


/**
 * createParentMenu : 최상위 메뉴 등록
 * --------------------------------------------
 * @param {*} params : 등록 파라미터
 * @returns 
 */
export const createParentMenu = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'menu_code', 'menu_name', 'assigned_by']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    menu_code: utils.toStringOrEmpty(params.menu_code),
    menu_name: utils.toStringOrEmpty(params.menu_name),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await authQuery.insertParentMenu(conn, queryParams);

    return {
      result: {
        menu_id: result.insertId.toString(),
        ...queryParams
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * updateParentMenu : 최상위 메뉴 수정
 * @param {*} params : 수정 파라미터
 * @returns 
 */
export const updateParentMenu = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'menu_id', 'menu_code', 'menu_name', 'is_active', 'updated_by']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    menu_id: utils.toNumberOrNull(params.menu_id),
    menu_name: utils.toStringOrEmpty(params.menu_name),
    menu_code: utils.toStringOrEmpty(params.menu_code),
    is_active: utils.toNumberOrNull(params.is_active),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    await authQuery.updateParentMenu(conn, queryParams);

    return {
      result: {
        ...queryParams
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * createSubMenu : 하위 메뉴 등록
 * --------------------------------------------
 * @param {*} params : 등록 파라미터
 * @returns 
 */
export const createSubMenu = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'menu_name', 'menu_code']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    parent_menu_id: utils.toNumberOrNull(params.parent_menu_id),
    first_category: utils.toStringOrEmpty(params.first_category),
    second_category: utils.toStringOrEmpty(params.second_category),
    menu_code: utils.toStringOrEmpty(params.menu_code),
    menu_name: utils.toStringOrEmpty(params.menu_name),
    menu_path: utils.toStringOrEmpty(params.menu_path),
    depth: utils.toNumberOrNull(params.depth),
    sort_order: utils.toNumberOrNull(params.sort_order),
    is_active: utils.toNumberOrNull(params.is_active),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // 1. 메뉴 등록
    const result = await authQuery.insertSubMenu(conn, queryParams);
    const menuId = result.insertId;

    // 2. 메뉴 접근 권한 매핑 (menu_permission_id가 있는 경우)
    const menuPermissionId = utils.toNumberOrNull(params.menu_permission_id);
    if (menuPermissionId) {
      const permissionParams = {
        company_id: queryParams.company_id,
        menu_id: menuId,
        permission_id: menuPermissionId,
        assigned_by: queryParams.assigned_by
      };
      await authQuery.insertMenuPermission(conn, permissionParams);
    }

    await conn.commit();

    return {
      result: {
        menu_id: menuId.toString(),
        ...queryParams
      }
    };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * updateSubMenu : 하위 메뉴 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns 
 */
export const updateSubMenu = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'menu_id', 'menu_name', 'menu_code']);
  
  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    menu_id: utils.toNumberOrNull(params.menu_id),
    menu_code: utils.toStringOrEmpty(params.menu_code),
    menu_name: utils.toStringOrEmpty(params.menu_name),
    menu_path: utils.toStringOrEmpty(params.menu_path),
    first_category: utils.toStringOrEmpty(params.first_category),
    second_category: utils.toStringOrEmpty(params.second_category),
    depth: utils.toNumberOrNull(params.depth),
    sort_order: utils.toNumberOrNull(params.sort_order),
    description: utils.toStringOrEmpty(params.description),
    is_active: utils.toNumberOrNull(params.is_active),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // 1. 메뉴 정보 수정
    await authQuery.updateSubMenu(conn, queryParams);

    // 2. 기존 메뉴 권한 매핑 비활성화
    const deactivateParams = {
      company_id: queryParams.company_id,
      menu_id: queryParams.menu_id,
      assigned_by: queryParams.assigned_by
    };
    await authQuery.deactivateMenuPermissions(conn, deactivateParams);

    // 3. 새로운 메뉴 접근 권한 매핑 (menu_permission_id가 있는 경우)
    const menuPermissionId = utils.toNumberOrNull(params.menu_permission_id);
    if (menuPermissionId) {
      const permissionParams = {
        company_id: queryParams.company_id,
        menu_id: queryParams.menu_id,
        permission_id: menuPermissionId,
        assigned_by: queryParams.assigned_by
      };
      await authQuery.insertMenuPermission(conn, permissionParams);
    }

    await conn.commit();

    return {
      result: {
        ...queryParams
      }
    };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * createThirdMenu : 3차 메뉴 등록
 * --------------------------------------------
 * @param {*} params : 등록 파라미터
 * @returns 
 */
export const createThirdMenu = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'menu_name', 'menu_code']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    parent_menu_id: utils.toNumberOrNull(params.parent_menu_id),
    first_category: utils.toStringOrEmpty(params.first_category),
    second_category: utils.toStringOrEmpty(params.second_category),
    menu_code: utils.toStringOrEmpty(params.menu_code),
    menu_name: utils.toStringOrEmpty(params.menu_name),
    menu_path: utils.toStringOrEmpty(params.menu_path),
    depth: utils.toNumberOrNull(params.depth),
    sort_order: utils.toNumberOrNull(params.sort_order),
    is_active: utils.toNumberOrNull(params.is_active),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // 1. 메뉴 등록
    const result = await authQuery.insertSubMenu(conn, queryParams);
    const menuId = result.insertId;

    // 2. 메뉴 접근 권한 매핑 (menu_permission_id가 있는 경우)
    const menuPermissionId = utils.toNumberOrNull(params.menu_permission_id);
    if (menuPermissionId) {
      const permissionParams = {
        company_id: queryParams.company_id,
        menu_id: menuId,
        permission_id: menuPermissionId,
        assigned_by: queryParams.assigned_by
      };
      await authQuery.insertMenuPermission(conn, permissionParams);
    }

    await conn.commit();

    return {
      result: {
        menu_id: menuId.toString(),
        ...queryParams
      }
    };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * updateThirdMenu : 3차 메뉴 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns 
 */
export const updateThirdMenu = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'menu_id']);
  
  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    menu_id: utils.toNumberOrNull(params.menu_id),
    menu_code: utils.toStringOrEmpty(params.menu_code),
    menu_name: utils.toStringOrEmpty(params.menu_name),
    menu_path: utils.toStringOrEmpty(params.menu_path),
    first_category: utils.toStringOrEmpty(params.first_category),
    second_category: utils.toStringOrEmpty(params.second_category),
    depth: utils.toNumberOrNull(params.depth),
    sort_order: utils.toNumberOrNull(params.sort_order),
    description: utils.toStringOrEmpty(params.description),
    is_active: utils.toNumberOrNull(params.is_active),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // 1. 메뉴 정보 수정
    await authQuery.updateSubMenu(conn, queryParams);

    // 2. 기존 메뉴 권한 매핑 비활성화
    const deactivateParams = {
      company_id: queryParams.company_id,
      menu_id: queryParams.menu_id,
      assigned_by: queryParams.assigned_by
    };
    await authQuery.deactivateMenuPermissions(conn, deactivateParams);

    // 3. 새로운 메뉴 접근 권한 매핑 (menu_permission_id가 있는 경우)
    const menuPermissionId = utils.toNumberOrNull(params.menu_permission_id);
    if (menuPermissionId) {
      const permissionParams = {
        company_id: queryParams.company_id,
        menu_id: queryParams.menu_id,
        permission_id: menuPermissionId,
        assigned_by: queryParams.assigned_by
      };
      await authQuery.insertMenuPermission(conn, permissionParams);
    }

    await conn.commit();

    return {
      result: {
        ...queryParams
      }
    };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

/* ============================== 사용자 ============================== */
/**
 * getUsers : 사용자 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 { company_id }
 * @returns 
 */
export const getUsers = async (params) => {
  
  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting),
    team_code: utils.toStringOrEmpty(params.team_code),
  }

  let conn;
  
  try {
    conn = await getPool().getConnection();
    const userList = await authQuery.selectUserList(conn, queryParams);
    
    return { 
      result: userList
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
};


/**
 * saveUserInformation : 사용자 정보 저장 (일괄)
 * --------------------------------------------
 * @param {*} params : 저장할 사용자 목록 배열
 * @returns 
 */
export const saveUserInformation = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'userList']);
  
  const userList = params.userList;

  userList.forEach(userData => {
    utils.checkRequiredParams(userData, ['user_id', 'role_id', 'status']);
  });

  let conn;

  try {
    conn = await getPool().getConnection();

    await conn.beginTransaction();

    for (const userData of params.userList) {
      const queryParams = {
        company_id: utils.toNumberOrNull(params.company_id),
        user_id: utils.toNumberOrNull(userData.user_id),
        role_id: utils.toNumberOrNull(userData.role_id),
        status: userData.status === 1 ? 'ACTIVE' : 'INACTIVE'
      };

      await authQuery.updateUserInformation(conn, queryParams);
    }

    await conn.commit();

    return { 
      result: '사용자 목록이 성공적으로 저장되었습니다.'
    };

  } catch (err) {
    await conn.rollback();
    throw err;

  } finally {
    if (conn) conn.release();
  }
};


/* ============================== 권한 ============================== */
export const getPermissionByRoleId = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'role_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    role_id: utils.toNumberOrNull(params.role_id),
    is_setting: utils.toNumberOrNull(params.is_setting)
  }

  let conn;
  
  try {
    conn = await getPool().getConnection();
    const result = await authQuery.selectPermissionByRoleId(conn, queryParams);

    const permissionList = result.map(permission => ({
      idx: parseInt(permission.idx, 10), // 10진수 정수로 변환
      permission_id: permission.permission_id,
      permission_code: permission.permission_code,
      permission_name: permission.permission_name,
      permission_name_en: permission.permission_name_en,
      description: permission.permission_description,
      resource: permission.resource,
      permission_type: permission.permission_type,
      is_active: permission.is_active,
      sort_order: permission.sort_order,
      from_db: permission.from_db,
      is_setting: permission.is_setting
    }));
    
    return { 
      result: permissionList
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
};


/**
 * getRoleList : 역할 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns : 역할 목록 배열
 */
export const getRoleList = async (params) => {

  utils.checkRequiredParams(params, ['company_id']);

  let conn;

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting)
  };

  try {
    conn = await getPool().getConnection();

    const result = await authQuery.selectRoleList(conn, queryParams);
    
    const roleList = result.map(role => ({
      idx: parseInt(role.idx, 10), // 10진수 정수로 변환
      role_id: role.role_id,
      role_code: role.role_code,
      role_name: role.role_name,
      role_name_en: role.role_name_en,
      level: role.level,
      description: role.description,
      is_active: role.is_active,
      is_system_role: role.is_system_role,
      sort_order: role.sort_order,
      from_db: role.from_db
    }));

    return {
      result: roleList
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * createRole : 역할 등록
 * --------------------------------------------
 * @param {*} params : 등록 파라미터
 * @returns 
 */
export const createRole = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'role_code', 'role_name']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    role_code: utils.toStringOrEmpty(params.role_code),
    role_name: utils.toStringOrEmpty(params.role_name),
    role_name_en: utils.toStringOrEmpty(params.role_name_en),
    level: utils.toNumberOrNull(params.level),
    description: utils.toStringOrEmpty(params.description),
    is_active: utils.toNumberOrNull(params.is_active),
    sort_order: utils.toNumberOrNull(params.sort_order),
    is_system_role: utils.toNumberOrNull(params.is_system_role),
    created_by: utils.toNumberOrNull(params.created_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await authQuery.insertRole(conn, queryParams);

    return {
      result: {
        role_id: result.insertId.toString(),
        ...queryParams
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * updateRole : 역할 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns 
 */
export const updateRole = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'role_id', 'role_name']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    role_id: utils.toNumberOrNull(params.role_id),
    role_name: utils.toStringOrEmpty(params.role_name),
    role_name_en: utils.toStringOrEmpty(params.role_name_en),
    level: utils.toNumberOrNull(params.level),
    description: utils.toStringOrEmpty(params.description),
    is_active: utils.toNumberOrNull(params.is_active),
    sort_order: utils.toNumberOrNull(params.sort_order),
    is_system_role: utils.toNumberOrNull(params.is_system_role),
    updated_by: utils.toNumberOrNull(params.updated_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    await authQuery.updateRole(conn, queryParams);

    return {
      result: {
        ...queryParams
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * assignPermissionsToRole : 역할에 권한 할당
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns
 */
export const assignPermissionsToRole = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'role_id', 'permission_ids']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    role_id: utils.toNumberOrNull(params.role_id),
    permission_ids: params.permission_ids.map(id => utils.toNumberOrNull(id)),
    assigned_by: utils.toNumberOrNull(params.assigned_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    await conn.beginTransaction();

    // 기존 권한 할당 삭제 (해당 role_id의 모든 권한 비활성화)
    await authQuery.deleteRolePermissions(conn, {
      company_id: queryParams.company_id,
      role_id: queryParams.role_id,
      assigned_by: queryParams.assigned_by
    });

    // 새로운 권한 일괄 할당 (Bulk Insert)
    if (queryParams.permission_ids.length > 0) {
      // VALUES 절 동적 생성: (:company_id, :role_id, :permission_id_0, :assigned_by, :assigned_by, 1), (...)
      const valuesClause = queryParams.permission_ids
        .map((_, idx) => `(:company_id, :role_id, :permission_id_${idx}, :assigned_by, :assigned_by)`)
        .join(', ');
      
      const insertParams = {
        company_id: queryParams.company_id,
        role_id: queryParams.role_id,
        assigned_by: queryParams.assigned_by,
        valuesClause: valuesClause
      };
      
      // 각 permission_id를 개별 파라미터로 추가
      queryParams.permission_ids.forEach((id, idx) => {
        insertParams[`permission_id_${idx}`] = id;
      });
      
      await authQuery.insertRolePermissionsBulk(conn, insertParams);
    }

    await conn.commit();

    return {
      result: '권한이 성공적으로 할당되었습니다.'
    };

  } catch (err) {
    await conn.rollback();
    throw err;

  } finally {
    if (conn) conn.release();
  }
};


/**
 * getPermissionList : 권한 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id, is_setting)
 * @returns 
 */
export const getPermissionList = async (params) => {

  utils.checkRequiredParams(params, ['company_id']);

  let conn;

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting)
  };

  try {
    conn = await getPool().getConnection();

    const result = await authQuery.selectPermissionList(conn, queryParams);
    
    const permissionList = result.map(permission => ({
      idx: parseInt(permission.idx, 10), // 10진수 정수로 변환
      permission_id: permission.permission_id,
      permission_code: permission.permission_code,
      permission_name: permission.permission_name,
      permission_name_en: permission.permission_name_en,
      description: permission.permission_description,
      resource: permission.resource,
      permission_type: permission.permission_type,
      is_active: permission.is_active,
      is_system_permission: permission.is_system_permission,
      sort_order: permission.sort_order,
      from_db: permission.from_db,
      is_setting: permission.is_setting
    }));
    
    return { 
      result: permissionList
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
};


/**
 * createPermission : 권한 등록
 * --------------------------------------------
 * @param {*} params : 등록 파라미터
 * @returns 
 */
export const createPermission = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'permission_code', 'permission_name', 'resource']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    permission_code: utils.toStringOrEmpty(params.permission_code),
    permission_name: utils.toStringOrEmpty(params.permission_name),
    permission_name_en: utils.toStringOrEmpty(params.permission_name_en),
    description: utils.toStringOrEmpty(params.description),
    resource: utils.toStringOrEmpty(params.resource),
    permission_type: utils.toStringOrEmpty(params.permission_type),
    is_system_permission: utils.toNumberOrNull(params.is_system_permission),
    is_active: utils.toNumberOrNull(params.is_active),
    sort_order: utils.toNumberOrNull(params.sort_order),
    created_by: utils.toNumberOrNull(params.created_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await authQuery.insertPermission(conn, queryParams);

    return {
      result: {
        permission_id: result.insertId.toString(),
        ...queryParams
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * updatePermission : 권한 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns 
 */
export const updatePermission = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'permission_id', 'permission_code', 'permission_name', 'resource']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    permission_id: utils.toNumberOrNull(params.permission_id),
    permission_code: utils.toStringOrEmpty(params.permission_code),
    permission_name: utils.toStringOrEmpty(params.permission_name),
    permission_name_en: utils.toStringOrEmpty(params.permission_name_en),
    description: utils.toStringOrEmpty(params.description),
    resource: utils.toStringOrEmpty(params.resource),
    permission_type: utils.toStringOrEmpty(params.permission_type),
    is_active: utils.toNumberOrNull(params.is_active),
    is_system_permission: utils.toNumberOrNull(params.is_system_permission),
    sort_order: utils.toNumberOrNull(params.sort_order),
    updated_by: utils.toNumberOrNull(params.updated_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    await authQuery.updatePermission(conn, queryParams);

    return {
      result: {
        ...queryParams
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};