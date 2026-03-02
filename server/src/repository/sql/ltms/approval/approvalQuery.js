/**
 * 파일명 : approvalQuery.js
 * 용도 : 결재 데이터베이스 쿼리 처리
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 2026-02-11 [박진영]
 * 수정사항 : 고급 결재 기능 필드 추가 (approval_type, is_parallel, parallel_group_id, parallel_approval_rule, condition_type, condition_value, user_grade_id)
 */

/**
 * selectApprovalLines : 결재선 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 결재선 목록 배열
 */
export const selectApprovalLines = async (conn, queryParams) => {
  const query = `
    /* selectApprovalLines : 결재선 목록 조회 */
    SELECT
      al.approval_line_id,
      al.company_id,
      al.approval_document_id,
      al.step,
      al.role_id,
      al.approver_id,
      al.approval_status,
      al.approval_date,
      al.approval_comment,
      al.is_active,
      al.sort_order,
      al.created_at,
      al.created_by,
      al.updated_at,
      al.updated_by
    FROM
      approval_line AS al
    WHERE
      al.company_id = :company_id
      AND al.is_active = 1
      ${queryParams.approval_document_id ? 'AND al.approval_document_id = :approval_document_id' : ''}
      ${queryParams.approver_id ? 'AND al.approver_id = :approver_id' : ''}
      ${queryParams.approval_status ? 'AND al.approval_status = :approval_status' : ''}
    ORDER BY
      al.step ASC, al.sort_order ASC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * selectApprovalLineById : 결재선 상세 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Object>} : 결재선 상세 정보
 */
export const selectApprovalLineById = async (conn, queryParams) => {
  const query = `
    /* selectApprovalLineById : 결재선 상세 조회 */
    SELECT
      al.approval_line_id,
      al.company_id,
      al.approval_document_id,
      al.step,
      al.role_id,
      al.approver_id,
      al.approval_status,
      al.approval_date,
      al.approval_comment,
      al.is_active,
      al.sort_order,
      al.created_at,
      al.created_by,
      al.updated_at,
      al.updated_by
    FROM
      approval_line AS al
    WHERE
      al.approval_line_id = :approval_line_id
      AND al.company_id = :company_id
      AND al.is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result[0];
};


/**
 * insertApprovalLine : 결재선 생성
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 생성 파라미터
 * @returns {Promise<Object>} : 생성 결과
 */
export const insertApprovalLine = async (conn, queryParams) => {
  const query = `
    /* insertApprovalLine : 결재선 생성 */
    INSERT INTO approval_line (
      company_id,
      approval_document_id,
      step,
      role_id,
      approver_id,
      approval_status,
      approval_date,
      approval_comment,
      is_active,
      sort_order,
      created_at,
      created_by
    ) VALUES (
      :company_id,
      :approval_document_id,
      :step,
      :role_id,
      :approver_id,
      :approval_status,
      :approval_date,
      :approval_comment,
      :is_active,
      :sort_order,
      NOW(),
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * updateApprovalLine : 결재선 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateApprovalLine = async (conn, queryParams) => {
  const query = `
    /* updateApprovalLine : 결재선 수정 */
    UPDATE
      approval_line
    SET
      step = :step,
      role_id = :role_id,
      approver_id = :approver_id,
      approval_status = :approval_status,
      approval_date = :approval_date,
      approval_comment = :approval_comment,
      sort_order = :sort_order,
      updated_at = NOW(),
      updated_by = :updated_by
    WHERE
      approval_line_id = :approval_line_id
      AND company_id = :company_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * deleteApprovalLine : 결재선 삭제 (Soft Delete)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 삭제 파라미터
 * @returns {Promise<Object>} : 삭제 결과
 */
export const deleteApprovalLine = async (conn, queryParams) => {
  const query = `
    /* deleteApprovalLine : 결재선 삭제 (Soft Delete) */
    UPDATE
      approval_line
    SET
      is_active = 0,
      deleted_at = NOW(),
      deleted_by = :deleted_by
    WHERE
      approval_line_id = :approval_line_id
      AND company_id = :company_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * selectApprovalLineTemplates : 결재선 템플릿 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Array<Object>>} : 결재선 템플릿 목록 배열
 */
export const selectApprovalLineTemplates = async (conn, queryParams) => {
  const query = `
    /* selectApprovalLineTemplates : 결재선 템플릿 목록 조회 */
    SELECT
      alt.approval_line_template_id,
      alt.company_id,
      alt.document_type,
      alt.step,
      alt.user_grade_id,
      alt.approver_id,
      alt.approval_type,
      alt.is_parallel,
      alt.parallel_group_id,
      alt.parallel_approval_rule,
      alt.condition_type,
      alt.condition_value,
      alt.is_active,
      alt.sort_order,
      alt.created_at,
      alt.created_by,
      alt.updated_at,
      alt.updated_by
    FROM
      approval_line_template AS alt
    WHERE
      alt.company_id = :company_id
      AND alt.is_active = 1
      ${queryParams.document_type ? 'AND alt.document_type = :document_type' : ''}
    ORDER BY
      alt.step ASC, alt.sort_order ASC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * selectApprovalLineTemplateById : 결재선 템플릿 상세 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Object>} : 결재선 템플릿 상세 정보
 */
export const selectApprovalLineTemplateById = async (conn, queryParams) => {
  const query = `
    /* selectApprovalLineTemplateById : 결재선 템플릿 상세 조회 */
    SELECT
      alt.approval_line_template_id,
      alt.company_id,
      alt.document_type,
      alt.step,
      alt.user_grade_id,
      alt.approver_id,
      alt.approval_type,
      alt.is_parallel,
      alt.parallel_group_id,
      alt.parallel_approval_rule,
      alt.condition_type,
      alt.condition_value,
      alt.is_active,
      alt.sort_order,
      alt.created_at,
      alt.created_by,
      alt.updated_at,
      alt.updated_by
    FROM
      approval_line_template AS alt
    WHERE
      alt.approval_line_template_id = :approval_line_template_id
      AND alt.company_id = :company_id
      AND alt.is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result[0];
};


/**
 * insertApprovalLineTemplate : 결재선 템플릿 생성
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 생성 파라미터
 * @returns {Promise<Object>} : 생성 결과
 */
export const insertApprovalLineTemplate = async (conn, queryParams) => {
  const query = `
    /* insertApprovalLineTemplate : 결재선 템플릿 생성 */
    INSERT INTO approval_line_template (
      company_id,
      document_type,
      step,
      user_grade_id,
      approver_id,
      approval_type,
      is_parallel,
      parallel_group_id,
      parallel_approval_rule,
      condition_type,
      condition_value,
      is_active,
      sort_order,
      created_at,
      created_by
    ) VALUES (
      :company_id,
      :document_type,
      :step,
      :user_grade_id,
      :approver_id,
      :approval_type,
      :is_parallel,
      :parallel_group_id,
      :parallel_approval_rule,
      :condition_type,
      :condition_value,
      :is_active,
      :sort_order,
      NOW(),
      :created_by
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
      document_type = :document_type,
      step = :step,
      user_grade_id = :user_grade_id,
      approver_id = :approver_id,
      approval_type = :approval_type,
      is_parallel = :is_parallel,
      parallel_group_id = :parallel_group_id,
      parallel_approval_rule = :parallel_approval_rule,
      condition_type = :condition_type,
      condition_value = :condition_value,
      sort_order = :sort_order,
      updated_at = NOW(),
      updated_by = :updated_by
    WHERE
      approval_line_template_id = :approval_line_template_id
      AND company_id = :company_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * deleteApprovalLineTemplate : 결재선 템플릿 삭제 (Soft Delete)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 삭제 파라미터
 * @returns {Promise<Object>} : 삭제 결과
 */
export const deleteApprovalLineTemplate = async (conn, queryParams) => {
  const query = `
    /* deleteApprovalLineTemplate : 결재선 템플릿 삭제 (Soft Delete) */
    UPDATE
      approval_line_template
    SET
      is_active = 0,
      deleted_at = NOW(),
      deleted_by = :deleted_by
    WHERE
      approval_line_template_id = :approval_line_template_id
      AND company_id = :company_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};
