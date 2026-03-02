/**
 * 파일명 : authQuery.js
 * 용도 : 인증/인가 및 사용자 정보 쿼리 처리
 * 최초등록 : 2026-02-04 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

// import bcrypt from 'bcrypt';


/* ============================== 로그인 ============================== */
/**
 * selectUserInfoByUsername : 사용자명으로 사용자 기본 정보 조회 (등급, 부서 포함)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { user_name, company_id }
 * @returns : 사용자 정보 객체
 */
export const selectUserInfoByUsername = async (conn, queryParams) => {

  const query = `
    /* 사용자 기본 정보 조회 */
    SELECT 
      u.user_id                 AS user_id,
      u.company_id              AS company_id,
      u.user_name               AS user_name,
      u.email                   AS email,
      u.user_full_name          AS user_full_name,
      u.user_full_name_en       AS user_full_name_en,
      u.phone                   AS phone,
      u.mobile                  AS mobile,
      u.employee_number         AS employee_number,
      u.password                AS password,
      u.position                AS position,
      u.job_title               AS job_title,
      u.status                  AS status,
      u.is_locked               AS is_locked,
      u.locked_at               AS locked_at,
      u.locked_reason           AS locked_reason,
      u.failed_login_attempts   AS failed_login_attempts,
      u.last_failed_login_at    AS last_failed_login_at,
      u.last_login_at           AS last_login_at,
      u.deleted_at              AS deleted_at,
      u.is_active               AS is_active,
      d.department_id           AS department_id,
      d.team_name               AS team_name,
      d.team_code               AS team_code,
      ug.user_grade_id          AS user_grade_id,
      ug.grade_code             AS grade_code,
      ug.grade_name             AS grade_name,
      r.role_id                 AS role_id,
      r.role_code               AS role_code,
      r.role_name               AS role_name,
      r.role_name_en            AS role_name_en,
      r.description             AS role_description,
      r.level                   AS role_level
    FROM 
      \`user\` u
    LEFT JOIN 
      \`department\` d 
      ON u.company_id = d.company_id
      AND u.department_id = d.department_id
    LEFT JOIN 
      \`user_grade\` ug 
      ON u.company_id = ug.company_id
      AND u.user_grade_id = ug.user_grade_id
    LEFT JOIN
      \`role\` r
      ON u.company_id = r.company_id
      AND u.role_id = r.role_id
    WHERE 
      u.company_id = :company_id
      AND (u.user_name = :user_name OR u.email = :user_name OR u.employee_number = :user_name OR u.user_full_name = :user_name)
  `;

  const result = await conn.query(query, queryParams);
  return result.length > 0 ? result[0] : null;
};


/**
 * verifyPassword : 비밀번호 검증
 * --------------------------------------------
 * @param {string} queryParams : 로그인 파라미터 (password 포함)
 * @param {string} storedPassword : 저장된 비밀번호 (현재는 평문, 추후 해시)
 * @returns {Promise<boolean>} : 일치 여부
 */
export const verifyPassword = async (queryParams, storedPassword) => {

  const { password } = queryParams;

  try {
    // 현재는 평문 비교 (해시 미적용)
    return password === storedPassword;
    // TODO: 비밀번호 해시 적용 시 아래 코드로 변경
    // return await bcrypt.compare(plainPassword, storedPassword);
    
  } catch (err) {
    throw err;
  }
};


/**
 * incrementLoginFailCount : 로그인 실패 횟수 증가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : { company_id, user_id }
 * @returns : 업데이트 결과
 */
export const incrementLoginFailCount = async (conn, queryParams) => {

  const query = `
    /* 로그인 실패 횟수 증가 */
    UPDATE
      \`user\`
    SET
      failed_login_attempts = failed_login_attempts + 1,
      last_failed_login_at = NOW()
    WHERE
      company_id = :company_id
      AND user_id = :user_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * lockUserAccount : 계정 잠금 처리 (로그인 실패 횟수 초과 시)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : { company_id, user_id, locked_reason }
 * @returns : 업데이트 결과
 */
export const lockUserAccount = async (conn, queryParams) => {

  const query = `
    /* 계정 잠금 처리 */
    UPDATE
      \`user\`
    SET
      is_locked = 1,
      locked_at = NOW(),
      locked_reason = :locked_reason,
      status = 'LOCKED'
    WHERE
      company_id = :company_id
      AND user_id = :user_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * resetLoginFailCount : 로그인 실패 횟수 초기화 (로그인 성공 시)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : { company_id, user_id }
 * @returns : 업데이트 결과
 */
export const resetLoginFailCount = async (conn, queryParams) => {

  const query = `
    /* 로그인 실패 횟수 초기화 */
    UPDATE
      \`user\`
    SET
      failed_login_attempts = 0,
      last_failed_login_at = NULL,
      last_login_at = NOW()
    WHERE
      company_id = :company_id
      AND user_id = :user_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * selectUserPermissionsByUserId : 사용자 ID로 권한 정보 조회 (메뉴 접근 권한 + 동작 권한)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { user_id, company_id }
 * @returns : 권한 정보 배열 (permission_type='menu' + permission_type='action')
 * 
 * 권한 분리:
 *   - permission_type='menu': 메뉴 접근 권한 (menu_permission 테이블 사용)
 *   - permission_type='action': 동작 권한 (role_permission 테이블 사용)
 */
export const selectUserPermissionsByUserId = async (conn, queryParams) => {

  const query = `
    /* 동작 권한 조회 (role_permission → permission_type='action') */
    SELECT DISTINCT
      r.role_id               AS role_id,
      r.role_code             AS role_code,
      r.role_name             AS role_name,
      r.role_name_en          AS role_name_en,
      r.description           AS role_description,
      r.level                 AS role_level,
      p.permission_id         AS permission_id,
      p.permission_code       AS permission_code,
      p.permission_name       AS permission_name,
      p.permission_name_en    AS permission_name_en,
      p.description           AS permission_description,
      p.resource              AS resource,
      p.permission_type       AS permission_type,
      p.is_system_permission  AS is_system_permission,
      p.sort_order            AS sort_order
    FROM 
      \`user\` u
    INNER JOIN 
      \`role\` r 
      ON u.company_id = r.company_id
      AND u.role_id = r.role_id
      AND r.is_active = 1
      AND r.deleted_at IS NULL
    INNER JOIN 
      \`role_permission\` rp 
      ON r.company_id = rp.company_id
      AND r.role_id = rp.role_id
      AND rp.is_active = 1
      AND rp.deleted_at IS NULL
    INNER JOIN 
      \`permission\` p 
      ON rp.company_id = p.company_id
      AND rp.permission_id = p.permission_id
      AND p.permission_type = 'action'
      AND p.is_active = 1
      AND p.deleted_at IS NULL
    WHERE 
      u.company_id = :company_id
      AND u.user_id = :user_id
      AND u.is_active = 1
      AND u.deleted_at IS NULL
    
    UNION ALL
    
    /* 메뉴 접근 권한 조회 (menu_permission → permission_type='menu') */
    SELECT DISTINCT
      r.role_id               AS role_id,
      r.role_code             AS role_code,
      r.role_name             AS role_name,
      r.role_name_en          AS role_name_en,
      r.description           AS role_description,
      r.level                 AS role_level,
      p.permission_id         AS permission_id,
      p.permission_code       AS permission_code,
      p.permission_name       AS permission_name,
      p.permission_name_en    AS permission_name_en,
      p.description           AS permission_description,
      p.resource              AS resource,
      p.permission_type       AS permission_type,
      p.is_system_permission  AS is_system_permission,
      p.sort_order            AS sort_order
    FROM 
      \`user\` u
    INNER JOIN 
      \`role\` r 
      ON u.company_id = r.company_id
      AND u.role_id = r.role_id
      AND r.is_active = 1
      AND r.deleted_at IS NULL
    INNER JOIN 
      \`role_permission\` rp 
      ON r.company_id = rp.company_id
      AND r.role_id = rp.role_id
      AND rp.is_active = 1
      AND rp.deleted_at IS NULL
    INNER JOIN 
      \`menu_permission\` mp
      ON rp.company_id = mp.company_id
      AND rp.permission_id = mp.permission_id
      AND mp.is_active = 1
      AND mp.deleted_at IS NULL
    INNER JOIN 
      \`permission\` p 
      ON mp.company_id = p.company_id
      AND mp.permission_id = p.permission_id
      AND p.permission_type = 'menu'
      AND p.is_active = 1
      AND p.deleted_at IS NULL
    WHERE 
      u.company_id = :company_id
      AND u.user_id = :user_id
      AND u.is_active = 1
      AND u.deleted_at IS NULL
    
    ORDER BY permission_type, sort_order;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/* ============================== 사용자 ============================== */
/**
 * selectUserCustomSettings : 사용자 커스텀 설정 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { user_id, company_id }
 * @returns : 커스텀 설정 객체
 */
export const selectUserCustomSettings = async (conn, queryParams) => {

  const query = `
    /* 사용자 커스텀 설정 조회 */
    SELECT 
      ucs.setting_id               AS setting_id,
      ucs.user_id                  AS user_id,
      ucs.company_id               AS company_id,
      ucs.default_menu_code        AS default_menu_code,
      ucs.default_page_path        AS default_page_path,
      ucs.module_default_settings  AS module_default_settings,
      ucs.theme_mode               AS theme_mode,
      ucs.sidebar_collapsed        AS sidebar_collapsed,
      ucs.items_per_page           AS items_per_page,
      ucs.date_format              AS date_format,
      ucs.time_format              AS time_format,
      ucs.language                 AS language,
      ucs.notification_enabled     AS notification_enabled,
      ucs.notification_email       AS notification_email,
      ucs.notification_sms         AS notification_sms,
      ucs.custom_settings          AS custom_settings
    FROM 
      \`user_custom_setting\` ucs
    WHERE 
      ucs.company_id = :company_id
      AND ucs.is_active = 1
      AND ucs.user_id = :user_id
      AND ucs.deleted_at IS NULL
  `;

  const result = await conn.query(query, queryParams);
  return result.length > 0 ? result[0] : null;
};


/**
 * selectUserList : 사용자 목록 조회 (역할 정보 포함)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { company_id }
 * @returns 
 */
export const selectUserList = async (conn, queryParams) => {
  
  let query = `
    /* 사용자 목록 조회 (역할 정보 포함) */
    SELECT
      u.user_id                                             AS user_id,
      u.employee_number                                     AS employee_number,
      u.user_name                                           AS user_name,
      u.user_full_name                                      AS user_full_name,
      u.email                                               AS email,
      u.phone                                               AS phone,
      u.position                                            AS position,
      CASE WHEN u.status = 'active' THEN 1 ELSE 0 END       AS status,
      DATE_FORMAT(u.last_login_at, '%Y-%m-%d')              AS last_login_at,
      r.role_id                                             AS role_id,
      r.role_code                                           AS role_code,
      r.role_name                                           AS role_name,
      r.description                                         AS role_description,
      CASE 
        WHEN d.part_code IS NULL OR d.part_code = '' 
              OR d.part_name IS NULL OR d.part_name = ''
        THEN d.team_name
        ELSE CONCAT(d.team_name, ' - ', d.part_name) 
      END                                                   AS department_name,
      ug.user_grade_id                                      AS user_grade_id,
      CONCAT('(', ug.grade_code, ') ', ug.grade_name)       AS grade_name,
      ug.grade_level                                        AS grade_level,
      'Y'                                                   AS from_db
    FROM
      \`user\` u
    LEFT JOIN 
      role r 
      ON u.role_id = r.role_id 
      AND u.company_id = r.company_id
      AND r.is_active = 1
    LEFT JOIN
      department d
      ON u.department_id = d.department_id
      AND u.company_id = d.company_id
    LEFT JOIN
      user_grade ug 
      ON u.user_grade_id = ug.user_grade_id
      AND u.company_id = ug.company_id
    WHERE
      u.company_id = :company_id
    `;

    if(queryParams.is_setting != 1) {
      query += ` AND u.is_active = 1`;
    }

    if(queryParams.team_code != "ITS") {
      query += ` AND d.department_id != 4`; // ITS 부서 제외
    }
    
    query += ` ORDER BY
      d.team_name,
      u.user_grade_id,
      u.user_full_name;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateUserInformation : 사용자 정보 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns 
 */
export const updateUserInformation = async (conn, queryParams) => {
  
  const queryUser = `
    /* 사용자 정보 수정 */
    UPDATE
      user
    SET
      role_id = :role_id,
      status = :status
    WHERE
      company_id = :company_id
      AND user_id = :user_id;
  `;

  const resultUser = await conn.query(queryUser, queryParams);
  return resultUser;
};


/* ============================== 메뉴 ============================== */
/**
 * selectMenuList : 메뉴 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { company_id }
 * @returns : 메뉴 목록 배열
 */
export const selectMenuList = async (conn, queryParams) => {

  let query = `
    /* 메뉴 목록 조회 */
    SELECT
      m.menu_id             AS menu_id
      , m.parent_menu_id    AS parent_menu_id
      , m.menu_code         AS menu_code
      , m.first_category    AS first_category
      , m.second_category   AS second_category
      , m.third_category    AS third_category
      , m.menu_name         AS menu_name
      , m.menu_path         AS menu_path
      , m.depth             AS depth
      , m.sort_order        AS sort_order
      , m.is_active         AS is_active
      , p.permission_id     AS permission_id
      , p.permission_code   AS permission_code
      , p.permission_name   AS permission_name
    FROM
      menu m
    LEFT JOIN
      menu_permission mp 
      ON m.company_id = mp.company_id
      AND m.menu_id = mp.menu_id
      AND mp.is_active = 1
      AND mp.deleted_at IS NULL
    LEFT JOIN
      permission p
      ON mp.company_id = p.company_id
      AND mp.permission_id = p.permission_id
      AND p.permission_type = 'menu'
      AND p.is_active = 1
      AND p.deleted_at IS NULL
    WHERE
      m.company_id = :company_id
      AND m.deleted_at IS NULL
  `;

  // 설정 화면이 아닐 때만 활성화된 항목만 조회
  if (!queryParams.is_setting) {
    query += ` AND m.is_active = 1`;
  }
  
  query += `
    ORDER BY
      m.menu_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertParentMenu : 최상위 메뉴 등록
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 등록 파라미터
 * @returns 
 */
export const insertParentMenu = async (conn, queryParams) => {

  const query = `
    /* 최상위 메뉴 등록 */
    INSERT INTO menu (
      company_id,
      menu_code,
      menu_name,
      depth,
      requires_permission,
      sort_order,
      is_active,
      created_by
    ) 
    SELECT
      :company_id,
      :menu_code,
      :menu_name,
      1,
      0,
      IFNULL(MAX(CASE WHEN parent_menu_id IS NULL THEN sort_order END), 0) + 1,
      1,
      :assigned_by
    FROM
      menu
    WHERE
      company_id = :company_id;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateParentMenu : 최상위 메뉴 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns 
 */
export const updateParentMenu = async (conn, queryParams) => {

  const query = `
    /* 최상위 메뉴 수정 */
    UPDATE 
      menu
    SET
      menu_code   = :menu_code,
      menu_name   = :menu_name,
      is_active   = :is_active,
      updated_by  = :assigned_by
    WHERE
      company_id = :company_id
      AND menu_id = :menu_id;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};



export const insertSubMenu = async (conn, queryParams) => {

  const query = `
    /* 서브 메뉴 등록 */
    INSERT INTO menu (
      company_id,
      parent_menu_id,
      menu_code,
      menu_name,
      menu_path,
      first_category,
      second_category,
      depth,
      sort_order,
      is_active,
      created_by
    ) VALUES (
      :company_id,
      :parent_menu_id,
      :menu_code,
      :menu_name,
      :menu_path,
      :first_category,
      :second_category,
      :depth,
      :sort_order,
      :is_active,
      :assigned_by
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateSubMenu : 2차/3차 메뉴 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns 
 */
export const updateSubMenu = async (conn, queryParams) => {

  const query = `
    /* 서브 메뉴 수정 */
    UPDATE 
      menu
    SET
      menu_code         = :menu_code,
      menu_name         = :menu_name,
      menu_path         = :menu_path,
      first_category    = :first_category,
      second_category   = :second_category,
      depth             = :depth,
      sort_order        = :sort_order,
      is_active         = :is_active,
      updated_by        = :assigned_by,
      updated_at        = NOW()
    WHERE
      company_id = :company_id
      AND menu_id = :menu_id;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * deactivateMenuPermissions : 메뉴 권한 매핑 비활성화
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 비활성화 파라미터 { company_id, menu_id, assigned_by }
 * @returns 
 */
export const deactivateMenuPermissions = async (conn, queryParams) => {

  const query = `
    /* 메뉴 권한 매핑 비활성화 */
    UPDATE 
      menu_permission
    SET
      is_active = 0,
      deleted_by = :assigned_by,
      deleted_at = NOW()
    WHERE
      company_id = :company_id
      AND menu_id = :menu_id;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertMenuPermission : 메뉴 권한 매핑 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 추가 파라미터 { company_id, menu_id, permission_id, assigned_by }
 * @returns 
 */
export const insertMenuPermission = async (conn, queryParams) => {

  const query = `
    /* 메뉴 권한 매핑 추가 */
    INSERT INTO menu_permission (
      company_id,
      menu_id,
      permission_id,
      is_active,
      created_by
    ) VALUES (
      :company_id,
      :menu_id,
      :permission_id,
      1,
      :assigned_by
    );
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/* ============================== 권한 ============================== */
/**
 * selectRoleList : 역할 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns 
 */
export const selectRoleList = async (conn, queryParams) => {

  let query = `
    /* selectRoleList : 역할 목록 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY r.role_id) AS idx,
      r.role_id                             AS role_id,
      r.role_code                           AS role_code,
      r.role_name                           AS role_name,
      r.role_name_en                        AS role_name_en,
      r.level                               AS level,
      r.description                         AS description,
      r.is_active                           AS is_active,
      r.sort_order                          AS sort_order,
      r.is_system_role                      AS is_system_role,
      'Y'                                   AS from_db
    FROM
      role AS r
    WHERE
      r.company_id = :company_id
  `;

  // 설정 화면이 아닐 때만 활성화된 항목만 조회
  if (!queryParams.is_setting) {
    query += ` AND r.is_active = 1`;
  }
  
  query += `
    ORDER BY
      r.sort_order ASC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * selectPermissionByRoleId : 역할별 권한 조회
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns 
 */
export const selectPermissionByRoleId = async (conn, queryParams) => {

  let query = `
    /* 역할별 권한 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY p.permission_id) AS idx,
      p.permission_id                             AS permission_id,
      p.permission_code                           AS permission_code,
      p.permission_name                           AS permission_name,
      p.permission_name_en                        AS permission_name_en,
      p.description                               AS permission_description,
      p.resource                                  AS resource,
      p.permission_type                           AS permission_type,
      'Y'                                         AS from_db,
      p.sort_order                                AS sort_order,
      rp.is_active                                AS is_active
    FROM
      role_permission rp
    INNER JOIN
      permission p 
      ON rp.permission_id = p.permission_id
      AND rp.company_id = p.company_id
    WHERE
      rp.company_id = :company_id
      AND rp.role_id = :role_id
      AND rp.is_active = 1
      AND p.is_active = 1
  `;

  // // 설정 화면이 아닐 때만 활성화된 항목만 조회
  // if (!queryParams.is_setting) {
  //   query += `
  //     AND rp.is_active = 1
  //     AND p.is_active = 1
  //   `;
  // }
  
  query += `
    ORDER BY
      p.permission_id,
      rp.sort_order;
  `;
console.error(`query=`, query);
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertRole : 역할 등록
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 등록 파라미터
 * @returns 
 */
export const insertRole = async (conn, queryParams) => {

  const query = `
    /* 역할 등록 */
    INSERT INTO role (
      company_id,
      role_code,
      role_name,
      role_name_en,
      level,
      description,
      is_active,
      sort_order,
      is_system_role,
      created_by
    ) VALUES (
      :company_id,
      :role_code,
      :role_name,
      :role_name_en,
      :level,
      :description,
      :is_active,
      :sort_order,
      :is_system_role,
      :created_by
    );
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateRole : 역할 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns 
 */
export const updateRole = async (conn, queryParams) => {

  const query = `
    /* 역할 수정 */
    UPDATE 
      role
    SET
      role_name       = :role_name,
      role_name_en    = :role_name_en,
      level           = :level,
      description     = :description,
      is_active       = :is_active,
      sort_order      = :sort_order,
      is_system_role  = :is_system_role,
      updated_by      = :updated_by
    WHERE
      company_id = :company_id
      AND role_id = :role_id;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * deleteRolePermissions : 역할별 권한 삭제 (기존 권한은 비활성화로 삭제 처리)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 삭제 파라미터 { company_id, role_id, assigned_by }
 * @returns 
 */
export const deleteRolePermissions = async (conn, queryParams) => {

  const query = `
    /* 역할별 권한 삭제 (기존 권한은 비활성화로 삭제 처리) */
    UPDATE 
      role_permission 
    SET 
      is_active = 0,
      deleted_at = NOW(), 
      deleted_by = :assigned_by,
      updated_by = :assigned_by
    WHERE 
      company_id = :company_id
      AND role_id = :role_id
      AND deleted_at IS NULL;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertRolePermissionsBulk : 역할별 권한 일괄 등록
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 등록 파라미터 { company_id, role_id, assigned_by, valuesClause (문자열), permission_id_0, permission_id_1, ... }
 * @returns 
 */
export const insertRolePermissionsBulk = async (conn, queryParams) => {

  const { valuesClause } = queryParams;

  const query = `
    /* 역할별 권한 일괄 등록 */
    INSERT INTO role_permission (
      company_id,
      role_id,
      permission_id,
      assigned_by,
      created_by
    ) VALUES ${valuesClause};
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * selectPermissionList : 권한 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns 
 */
export const selectPermissionList = async (conn, queryParams) => {

  let query = `
    /* 권한 목록 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY p.permission_id) AS idx,
      p.permission_id                             AS permission_id,
      p.permission_code                           AS permission_code,
      p.permission_name                           AS permission_name,
      p.permission_name_en                        AS permission_name_en,
      p.description                               AS permission_description,
      p.resource                                  AS resource,
      p.permission_type                           AS permission_type,
      p.sort_order                                AS sort_order,
      p.is_system_permission                      AS is_system_permission,
      p.is_active                                 AS is_active
    FROM
      permission AS p
    WHERE
      p.company_id = :company_id
  `;

  // 설정 화면이 아닐 때만 활성화된 항목만 조회
  if (!queryParams.is_setting) {
    query += ` AND p.is_active = 1`;
  }
  
  query += `
    ORDER BY
      p.sort_order ASC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertPermission : 권한 등록
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 등록 파라미터
 * @returns 
 */
export const insertPermission = async (conn, queryParams) => {

  const query = `
    /* 권한 등록 */
    INSERT INTO permission (
      company_id,
      permission_code,
      permission_name,
      permission_name_en,
      description,
      resource,
      permission_type,
      sort_order,
      is_active,
      is_system_permission,
      created_by
    ) VALUES (
      :company_id,
      :permission_code,
      :permission_name,
      :permission_name_en,
      :description,
      :resource,
      :permission_type,
      :sort_order,
      :is_active,
      :is_system_permission,
      :created_by
    );
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updatePermission : 권한 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns 
 */
export const updatePermission = async (conn, queryParams) => {

  const query = `
    /* 권한 수정 */
    UPDATE 
      permission
    SET
      permission_code       = :permission_code,
      permission_name       = :permission_name,
      permission_name_en    = :permission_name_en,
      description           = :description,
      resource              = :resource,
      permission_type       = :permission_type,
      sort_order            = :sort_order,
      is_active             = :is_active,
      is_system_permission  = :is_system_permission,
      updated_by            = :updated_by
    WHERE
      company_id = :company_id
      AND permission_id = :permission_id;
  `;
  
  const result = await conn.query(query, queryParams);
  return result;
};


/* ============================== 메뉴 접근 권한 ============================== */
/**
 * selectAccessibleMenusByRole : 역할별 접근 가능한 메뉴 조회 (depth 3 계층 구조)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { company_id, role_id }
 * @returns : 접근 가능한 메뉴 목록 배열 (depth 1 + depth 2 + depth 3)
 * 
 * 새로운 권한 체계:
 *   - permission_type='menu': 메뉴 접근 권한 (menu_permission 사용)
 *   - permission_type='action': 동작 권한 (role_permission 사용)
 *   - 메뉴 구조: depth 1 (카테고리) → depth 2 (서브카테고리) → depth 3 (실제 페이지)
 *   - parent_menu_id로 계층 관계 관리
 * 
 * 조회 로직:
 *   1. depth 2, 3 메뉴 중 사용자 역할이 접근 가능한 메뉴 조회 (menu_permission 기반)
 *   2. requires_permission = 0인 depth 2 메뉴는 하위 메뉴가 있으면 자동 포함
 *   3. 접근 가능한 메뉴들의 부모인 depth 1 메뉴 자동 포함
 */
export const selectAccessibleMenusByRole = async (conn, queryParams) => {

  const query = `
    WITH accessible_depth3_menus AS (
      /* depth 3 메뉴 중 접근 가능한 메뉴 조회 (permission_type='menu') */
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
      FROM
        menu m
      INNER JOIN
        menu_permission mp 
        ON m.company_id = mp.company_id
        AND m.menu_id = mp.menu_id
        AND mp.is_active = 1
        AND mp.deleted_at IS NULL
      INNER JOIN
        permission p
        ON mp.company_id = p.company_id
        AND mp.permission_id = p.permission_id
        AND p.permission_type = 'menu'
        AND p.is_active = 1
        AND p.deleted_at IS NULL
      INNER JOIN
        role_permission rp 
        ON mp.company_id = rp.company_id
        AND mp.permission_id = rp.permission_id
        AND rp.role_id = :role_id
        AND rp.is_active = 1
        AND rp.deleted_at IS NULL
      WHERE
        m.company_id = :company_id
        AND m.depth = 3
        AND m.is_active = 1
        AND m.deleted_at IS NULL
    ),
    accessible_depth2_with_permission AS (
      /* depth 2 메뉴 중 권한이 필요하고 접근 가능한 메뉴 조회 (requires_permission = 1) */
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
      FROM
        menu m
      INNER JOIN
        menu_permission mp 
        ON m.company_id = mp.company_id
        AND m.menu_id = mp.menu_id
        AND mp.is_active = 1
        AND mp.deleted_at IS NULL
      INNER JOIN
        permission p
        ON mp.company_id = p.company_id
        AND mp.permission_id = p.permission_id
        AND p.permission_type = 'menu'
        AND p.is_active = 1
        AND p.deleted_at IS NULL
      INNER JOIN
        role_permission rp 
        ON mp.company_id = rp.company_id
        AND mp.permission_id = rp.permission_id
        AND rp.role_id = :role_id
        AND rp.is_active = 1
        AND rp.deleted_at IS NULL
      WHERE
        m.company_id = :company_id
        AND m.depth = 2
        AND m.requires_permission = 1
        AND m.is_active = 1
        AND m.deleted_at IS NULL
    ),
    accessible_depth2_categories AS (
      /* depth 2 카테고리 메뉴 (requires_permission = 0) - depth 3의 부모 메뉴 자동 포함 */
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
      FROM
        menu m
      INNER JOIN
        accessible_depth3_menus d3
        ON m.menu_id = d3.parent_menu_id
      WHERE
        m.company_id = :company_id
        AND m.depth = 2
        AND m.is_active = 1
        AND m.deleted_at IS NULL
    ),
    accessible_depth2_menus AS (
      /* depth 2 전체 (권한 필요 + 카테고리) */
      SELECT * FROM accessible_depth2_with_permission
      UNION
      SELECT * FROM accessible_depth2_categories
    ),
    accessible_depth1_menus AS (
      /* depth 1 메뉴 (카테고리) - depth 2의 부모 메뉴 */
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
      FROM
        menu m
      INNER JOIN
        accessible_depth2_menus d2
        ON m.menu_id = d2.parent_menu_id
      WHERE
        m.company_id = :company_id
        AND m.depth = 1
        AND m.is_active = 1
        AND m.deleted_at IS NULL
    )
    /* 전체 메뉴 통합 (depth 1 + depth 2 + depth 3) */
    SELECT * FROM accessible_depth1_menus
    UNION ALL
    SELECT * FROM accessible_depth2_menus
    UNION ALL
    SELECT * FROM accessible_depth3_menus
    ORDER BY sort_order, depth, menu_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};