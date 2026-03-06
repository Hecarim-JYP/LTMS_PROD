/**
 * 파일명 : settingQuery.js
 * 용도 : 기본 셋팅 데이터베이스 쿼리 처리
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import * as utils from '../../../../common/utils.js';

/* ============================== 옵션 ============================== */
/**
 * findManagerTypeOptions : CT 매니저 타입 옵션 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 담당자 유형 목록 배열
 */
export const findManagerTypeOptions = async (conn, queryParams) => {

  const query = `
    /* findManagerTypeOptions : CT 매니저 타입 옵션 조회 */
    SELECT
      mt.module_category                              AS module_category,
      mt.manager_type_id                              AS manager_type_id,
      mt.manager_type_code                            AS manager_type_code,
      mt.manager_type_name                            AS manager_type_name,
      mt.is_active                                    AS is_active,
      mt.sort_order                                   AS sort_order,
      'Y'                                             AS from_db
    FROM
      manager_type mt
    WHERE
      mt.company_id = :company_id
      ${queryParams.is_setting === 1 ? '' : ' AND mt.is_active = 1'}
    ORDER BY
      mt.sort_order ASC;
  `;  

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateManagerTypeOptions : CT 매니저 타입 옵션 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateManagerTypeOptions = async (conn, queryParams) => {

  const query = `
    /* updateManagerTypeOptions : CT 매니저 타입 옵션 수정 */
    UPDATE
      manager_type
    SET
      module_category = :module_category,
      manager_type_code = :manager_type_code,
      manager_type_name = :manager_type_name,
      is_active = :is_active,
      sort_order = :sort_order
    WHERE
      company_id = :company_id
      AND manager_type_id = :manager_type_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertManagerTypeOptions : CT 매니저 타입 옵션 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 삽입 파라미터
 * @returns {Promise<Object>} : 삽입 결과
 */
export const insertManagerTypeOptions = async (conn, queryParams) => {

  const query = `
    /* insertManagerTypeOptions : CT 매니저 타입 옵션 추가 */
    INSERT INTO manager_type (
      company_id,
      module_category,
      manager_type_code,
      manager_type_name,
      is_active,
      sort_order
    ) VALUES (
      :company_id,
      :module_category,
      :manager_type_code,
      :manager_type_name,
      :is_active,
      :sort_order
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findJudgmentOptions : CT 판정 옵션 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 판정 옵션 목록 배열
 */
export const findJudgmentOptions = async (conn, queryParams) => {

  const query = `
    /* findJudgmentOptions : CT 판정 옵션 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY j.judgment_id) AS idx,
      j.judgment_id                             AS judgment_id,
      j.judgment_code                           AS judgment_code,
      j.judgment_name                           AS judgment_name,
      j.judgment_name_en                        AS judgment_name_en,
      j.judgment_description                   AS judgment_description,
      j.result_code                             AS result_code,
      j.is_active                               AS is_active,
      j.sort_order                              AS sort_order,
      'Y'                                       AS from_db
    FROM
      judgment AS j
    WHERE
      j.company_id = :company_id
      ${queryParams.is_setting === 1 ? '' : ' AND j.is_active = 1'}
    ORDER BY
      j.sort_order ASC;
  `;


  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateJudgmentOptions : 판정 옵션 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateJudgmentOptions = async (conn, queryParams) => {

  const query = `
    /* updateJudgmentOptions : CT 판정 옵션 수정 */
    UPDATE
      judgment
    SET
      judgment_code = :judgment_code,
      judgment_name = :judgment_name,
      judgment_name_en = :judgment_name_en,
      judgment_description = :judgment_description,
      result_code = :result_code,
      is_active = :is_active,
      sort_order = :sort_order
    WHERE
      company_id = :company_id
      AND judgment_id = :judgment_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertJudgmentOptions : CT 판정 옵션 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 삽입 파라미터
 * @returns {Promise<Object>} : 삽입 결과
 */
export const insertJudgmentOptions = async (conn, queryParams) => {

  const query = `
    /* insertJudgmentOptions : CT 판정 옵션 추가 */
    INSERT INTO judgment (
      company_id,
      judgment_code,
      judgment_name,
      judgment_name_en,
      judgment_description,
      result_code,
      is_active,
      sort_order
    ) VALUES (
      :company_id,
      :judgment_code,
      :judgment_name,
      :judgment_name_en,
      :judgment_description,
      :result_code,
      :is_active,
      :sort_order
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findUnitOptions : 단위 옵션 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 단위 목록 배열
 */
export const findUnitOptions = async (conn, queryParams) => {

  const query = `
    /* findUnitOptions : 단위 옵션 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY u.unit_id) AS idx,
      u.unit_id                             AS unit_id,
      u.unit_type                           AS unit_type,
      u.unit_code                           AS unit_code,
      u.unit_name                           AS unit_name,
      u.unit_name_en                        AS unit_name_en,
      u.unit_description                    AS unit_description,
      u.umunit_code                         AS umunit_code,
      u.is_active                           AS is_active,
      u.sort_order                          AS sort_order,
      'Y'                                   AS from_db
    FROM
      unit AS u
    WHERE
      u.company_id = :company_id
      ${queryParams.is_setting === 1 ? '' : ' AND u.is_active = 1'}
    ORDER BY
      u.sort_order ASC;
  `;


  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateUnitOptions : 단위 옵션 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateUnitOptions = async (conn, queryParams) => {

  const query = `
    /* updateUnitOptions : 단위 옵션 수정 */
    UPDATE
      unit
    SET
      unit_type = :unit_type,
      unit_code = :unit_code,
      unit_name = :unit_name,
      unit_name_en = :unit_name_en,
      unit_description = :unit_description,
      is_active = :is_active,
      sort_order = :sort_order
    WHERE
      company_id = :company_id
      AND unit_id = :unit_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertUnitOptions : 단위 옵션 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 삽입 파라미터
 * @returns {Promise<Object>} : 삽입 결과
 */
export const insertUnitOptions = async (conn, queryParams) => {

  const query = `
    /* insertUnitOptions : 단위 옵션 추가 */
    INSERT INTO unit (
      company_id,
      unit_type,
      unit_code,
      unit_name,
      unit_name_en,
      unit_description,
      is_active,
      sort_order
    ) VALUES (
      :company_id,
      :unit_type,
      :unit_code,
      :unit_name,
      :unit_name_en,
      :unit_description,
      :is_active,
      :sort_order
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findLabsDepartmentOptions : 제형담당부서 옵션 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 부서 목록 배열
 */
export const findLabsDepartmentOptions = async (conn, queryParams) => {

  const query = `
    /* findLabsDepartmentOptions : 제형담당부서 옵션 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY d.labs_department_id)  AS idx,
      d.labs_department_id                              AS labs_department_id,
      d.parent_department_code                          AS parent_department_code,
      d.labs_department_code                            AS labs_department_code,
      d.labs_department_name                            AS labs_department_name,
      d.labs_department_email                           AS labs_department_email,
      d.is_active                                       AS is_active,
      d.sort_order                                      AS sort_order,
      'Y'                                               AS from_db
    FROM
      labs_department AS d
    WHERE
      d.company_id = :company_id
      ${queryParams.is_setting === 1 ? '' : ' AND d.is_active = 1'}
    ORDER BY
      d.sort_order ASC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateLabsDepartmentOptions : 제형담당부서 옵션 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateLabsDepartmentOptions = async (conn, queryParams) => {

  const query = `
    /* updateLabsDepartmentOptions : 제형담당부서 옵션 수정 */
    UPDATE
      labs_department
    SET
      parent_department_code = :parent_department_code,
      labs_department_code = :labs_department_code,
      labs_department_name = :labs_department_name,
      labs_department_email = :labs_department_email,
      is_active = :is_active,
      sort_order = :sort_order
    WHERE
      company_id = :company_id
      AND labs_department_id = :labs_department_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertLabsDepartmentOptions : 제형담당부서 옵션 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 추가 파라미터
 * @returns {Promise<Object>} : 추가 결과
 */
export const insertLabsDepartmentOptions = async (conn, queryParams) => {

  const query = `
    /* insertLabsDepartmentOptions : 제형담당부서 옵션 추가 */
    INSERT INTO labs_department (
      company_id,
      parent_department_code,
      labs_department_code,
      labs_department_name,
      labs_department_email,
      sort_order
    ) VALUES (
      :company_id,
      :parent_department_code,
      :labs_department_code,
      :labs_department_name,
      :labs_department_email,
      :sort_order
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findUserGrades : 사용자 직급 목록 조회
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns 
 */
export const findUserGrades = async (conn, queryParams) => {

  const query = `
    /* findUserGrades : 사용자 직급 목록 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY ug.sort_order)   AS idx,
      ug.user_grade_id                            AS user_grade_id,
      ug.grade_code                               AS grade_code,
      ug.grade_type                               AS grade_type,
      ug.grade_name                               AS grade_name,
      ug.grade_level                              AS grade_level,
      ug.is_active                                AS is_active,
      ug.sort_order                               AS sort_order,
      'Y'                                         AS from_db
    FROM
      user_grade AS ug
    WHERE
      ug.company_id = :company_id
      AND ug.grade_type IN ('E', 'G')  /* E: 임원, G: 사무직 */
      ${queryParams.is_setting === 1 ? '' : ' AND ug.is_active = 1'}
    ORDER BY
      ug.sort_order ASC;
  `;
  
  const result = await conn.query(query, queryParams); 
  return result;

};


/**
 * findDepartmentOptions : 부서 목록 조회
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns 
 */
export const findDepartmentOptions = async (conn, queryParams) => {

  const query = `
    /* findDepartmentOptions : 부서 목록 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY d.sort_order)    AS idx,
      d.department_id                             AS department_id,
      d.company_code                              AS company_code,
      d.company_name                              AS company_name,
      d.division_code                             AS division_code,
      d.division_name                             AS division_name,
      d.team_code                                 AS team_code,
      d.team_name                                 AS team_name,
      d.part_code                                 AS part_code,
      d.part_name                                 AS part_name,
      d.is_active                                 AS is_active,
      d.sort_order                                AS sort_order,
      'Y'                                         AS from_db
    FROM
      department AS d
    WHERE
      d.company_id = :company_id
      ${queryParams.is_setting === 1 ? '' : ' AND d.is_active = 1'}
    ORDER BY
      d.sort_order ASC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/* ============================== 설정 ============================== */
/**
 * updateUserCustomSettings : 사용자 커스텀 설정 저장 (UPSERT)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 저장 파라미터
 * @returns 
 */
export const updateUserCustomSettings = async (conn, queryParams) => {

  const query = `
    /* updateUserCustomSettings : 사용자 커스텀 설정 저장 (UPSERT) */
    INSERT INTO user_custom_setting (
      company_id,
      user_id,
      default_menu_code,
      default_page_path,
      module_default_settings,
      theme_mode,
      sidebar_collapsed,
      items_per_page,
      date_format,
      time_format,
      language,
      notification_enabled,
      notification_email,
      notification_sms,
      custom_settings,
      is_active,
      sort_order
    ) VALUES (
      :company_id,
      :user_id,
      :default_menu_code,
      :default_page_path,
      :module_default_settings,
      :theme_mode,
      :sidebar_collapsed,
      :items_per_page,
      :date_format,
      :time_format,
      :language,
      :notification_enabled,
      :notification_email,
      :notification_sms,
      :custom_settings,
      :is_active,
      :sort_order
    )
    ON DUPLICATE KEY UPDATE
      default_menu_code = :default_menu_code,
      default_page_path = :default_page_path,
      module_default_settings = :module_default_settings,
      theme_mode = :theme_mode,
      sidebar_collapsed = :sidebar_collapsed,
      items_per_page = :items_per_page,
      date_format = :date_format,
      time_format = :time_format,
      language = :language,
      notification_enabled = :notification_enabled,
      notification_email = :notification_email,
      notification_sms = :notification_sms,
      custom_settings = :custom_settings,
      is_active = :is_active,
      sort_order = :sort_order;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};



/* ============================== 결재선 관리 ============================== */
/**
 * findApprovalDocumentTypes : CT 결재 문서 유형 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 결재 문서 유형 목록 배열
 */
export const findApprovalDocumentTypes = async (conn, queryParams) => {

  const query = `
    /* findApprovalDocumentTypes : CT 결재 문서 유형 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY adt.approval_document_type_id) AS idx,
      adt.approval_document_type_id                             AS approval_document_type_id,
      adt.document_type_code                                    AS document_type_code,
      adt.document_type_name                                    AS document_type_name,
      adt.module_name                                           AS module_name,
      adt.is_active                                             AS is_active,
      adt.sort_order                                            AS sort_order,
      'Y'                                                       AS from_db
    FROM
      approval_document_type AS adt
    WHERE
      adt.company_id = :company_id
      ${queryParams.is_setting === 1 ? '' : ' AND adt.is_active = 1'}
    ORDER BY
      adt.sort_order;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findApprovalTemplates : 결재 템플릿 목록 조회 (결재선 개수 포함)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 템플릿 정보 배열 (결재선 개수 포함)
 */
export const findApprovalTemplates = async (conn, queryParams) => {
  const query = `
    /* findApprovalTemplates : 결재 템플릿 목록 조회 (결재선 개수 포함) */
    SELECT
      ROW_NUMBER() OVER(ORDER BY at.approval_template_id)   AS idx,
      at.approval_template_id                               AS approval_template_id,
      at.company_id                                         AS company_id,
      at.template_name                                      AS template_name,
      at.document_type                                      AS document_type,
      at.description                                        AS description,
      at.is_default                                         AS is_default,
      at.is_active                                          AS is_active,
      at.created_at                                         AS created_at,
      at.created_by                                         AS created_by,
      at.updated_at                                         AS updated_at,
      at.updated_by                                         AS updated_by,
      (SELECT 
        COUNT(approval_line_template_id) 
        FROM 
          approval_line_template
        WHERE
          approval_template_id = at.approval_template_id
          AND is_active = 1)                                AS line_count
    FROM
      approval_template AS at
    WHERE
      at.company_id = :company_id
      ${queryParams.document_type !== '' ?  ' AND at.document_type = :document_type' : ''}
      ${queryParams.is_setting === 1 ? '' : ' AND at.is_active = 1'}
    ORDER BY
      at.approval_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertApprovalTemplate : 결재 템플릿 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 추가 파라미터
 * @returns {Promise<Object>} : 추가 결과
 */
export const insertApprovalTemplate = async (conn, queryParams) => {
  const query = `
    /* insertApprovalTemplate : 결재 템플릿 추가 */
    INSERT INTO approval_template (
      company_id,
      template_name,
      document_type,
      description,
      is_default,
      created_by
    ) VALUES (
      :company_id,
      :template_name,
      :document_type,
      :description,
      :is_default,
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateApprovalTemplate : 결재 템플릿 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateApprovalTemplate = async (conn, queryParams) => {
  const query = `
    /* updateApprovalTemplate : 결재 템플릿 수정 */
    UPDATE
      approval_template
    SET
      template_name = :template_name,
      description = :description,
      is_default = :is_default,
      is_active = :is_active,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND approval_template_id = :approval_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateApprovalTemplateIsActive : 결재 템플릿 활성/비활성 토글
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateApprovalTemplateIsActive = async (conn, queryParams) => {
  const query = `
    /* updateApprovalTemplateIsActive : 결재 템플릿 활성/비활성 토글 */
    UPDATE
      approval_template
    SET
      is_active = :is_active,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND approval_template_id = :approval_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * insertApprovalLineTemplate : 결재선 템플릿 추가
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 추가 파라미터
 * @returns {Promise<Object>} : 추가 결과
 */
export const insertApprovalLineTemplate = async (conn, queryParams) => {
  const query = `
    /* insertApprovalLineTemplate : 결재선 템플릿 추가 */
    INSERT INTO approval_line_template (
      company_id,
      approval_template_id,
      document_type,
      step,
      user_grade_id,
      department_id,
      team_code,
      approver_id,
      approval_type,
      is_parallel,
      parallel_group_id,
      parallel_approval_rule,
      condition_type,
      condition_value,
      sort_order
    ) VALUES (
      :company_id,
      :approval_template_id,
      :document_type,
      :step,
      :user_grade_id,
      :department_id,
      :team_code,
      :approver_id,
      :approval_type,
      :is_parallel,
      :parallel_group_id,
      :parallel_approval_rule,
      :condition_type,
      :condition_value,
      :sort_order
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateApprovalLineTemplate : 결재선 템플릿 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateApprovalLineTemplate = async (conn, queryParams) => {
  const query = `
    /* updateApprovalLineTemplate : 결재선 템플릿 수정 */
    UPDATE
      approval_line_template
    SET
      step = :step,
      user_grade_id = :user_grade_id,
      department_id = :department_id,
      team_code = :team_code,
      approver_id = :approver_id,
      approval_type = :approval_type,
      is_parallel = :is_parallel,
      parallel_group_id = :parallel_group_id,
      parallel_approval_rule = :parallel_approval_rule,
      condition_type = :condition_type,
      condition_value = :condition_value,
      is_active = :is_active,
      sort_order = :sort_order
    WHERE
      company_id = :company_id
      AND approval_line_template_id = :approval_line_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * deactivateApprovalLineTemplatesByTemplateId : 결재선 템플릿 일괄 비활성화 (템플릿 ID 기준)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 비활성화 파라미터
 * @returns {Promise<Object>} : 비활성화 결과
 */
export const deactivateApprovalLineTemplatesByTemplateId = async (conn, queryParams) => {
  const query = `
    /* deactivateApprovalLineTemplatesByTemplateId : 결재선 템플릿 일괄 비활성화 (템플릿 ID 기준) */
    UPDATE 
      approval_line_template
    SET
      is_active = 0,
      deleted_by = :deleted_by,
      deleted_at = NOW()
    WHERE
      company_id = :company_id
      AND approval_template_id = :approval_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findApprovalTemplateWithLines : 결재 템플릿 상세 정보 및 결재선 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 (company_id, approval_template_id)
 * @returns {Promise<Object>} : 템플릿 정보와 결재선 목록 객체
 */
export const findApprovalTemplateWithLines = async (conn, queryParams) => {
  // 템플릿 정보 조회
  const templateQuery = `
    /* findApprovalTemplateWithLines : 결재 템플릿 정보 조회 */
    SELECT
      at.approval_template_id         AS approval_template_id,
      at.company_id                   AS company_id,
      at.template_name                AS template_name,
      at.document_type                AS document_type,
      at.description                  AS description,
      at.is_default                   AS is_default,
      at.is_active                    AS is_active,
      at.created_at                   AS created_at,
      at.created_by                   AS created_by,
      at.updated_at                   AS updated_at,
      at.updated_by                   AS updated_by
    FROM
      approval_template AS at
    WHERE
      at.company_id = :company_id
      AND at.approval_template_id = :approval_template_id;
  `;

  // 결재선 목록 조회
  const linesQuery = `
    /* findApprovalTemplateWithLines : 결재선 목록 조회 */
    SELECT
      ROW_NUMBER() OVER(ORDER BY alt.step, alt.sort_order) AS idx,
      alt.approval_line_template_id   AS approval_line_template_id,
      alt.company_id                  AS company_id,
      alt.approval_template_id        AS approval_template_id,
      alt.document_type               AS document_type,
      alt.step                        AS step,
      alt.user_grade_id               AS user_grade_id,
      alt.department_id               AS department_id,
      alt.team_code                   AS team_code,
      alt.approver_id                 AS approver_id,
      alt.approval_type               AS approval_type,
      alt.is_parallel                 AS is_parallel,
      alt.parallel_group_id           AS parallel_group_id,
      alt.parallel_approval_rule      AS parallel_approval_rule,
      alt.condition_type              AS condition_type,
      alt.condition_value             AS condition_value,
      alt.is_active                   AS is_active,
      alt.sort_order                  AS sort_order,
      ug.grade_name                   AS grade_name,
      d.team_name                     AS team_name,
      'Y'                             AS from_db
    FROM
      approval_line_template AS alt
    LEFT JOIN
      user_grade AS ug
      ON alt.user_grade_id = ug.user_grade_id
    LEFT JOIN
      department AS d
      ON alt.department_id = d.department_id
    WHERE
      alt.company_id = :company_id
      AND alt.approval_template_id = :approval_template_id
      AND alt.is_active = 1
    ORDER BY
      alt.step,
      alt.sort_order;
  `;

  const template = await conn.query(templateQuery, queryParams);
  const lines = await conn.query(linesQuery, queryParams);

  return {
    template: template[0] || null,
    lines: lines || []
  };
};


/**
 * unsetDefaultApprovalTemplates : 동일 문서 유형의 기본 템플릿 해제
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 { company_id, document_type }
 * @returns {Promise<Object>} : 업데이트 결과
 */
export const unsetDefaultApprovalTemplates = async (conn, queryParams) => {
  const query = `
    /* unsetDefaultApprovalTemplates : 동일 문서 유형의 기본 템플릿 해제 */
    UPDATE 
      approval_template
    SET 
      is_default = 0,
      updated_by = :updated_by
    WHERE 
      company_id = :company_id 
      AND document_type = :document_type;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * setDefaultApprovalTemplate : 특정 결재 템플릿을 기본으로 설정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 업데이트 파라미터 { company_id, approval_template_id, updated_by }
 * @returns {Promise<Object>} : 업데이트 결과
 */
export const setDefaultApprovalTemplate = async (conn, queryParams) => {
  const query = `
    /* setDefaultApprovalTemplate : 특정 결재 템플릿을 기본으로 설정 */
    UPDATE 
      approval_template
    SET 
      is_default = 1,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND approval_template_id = :approval_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};