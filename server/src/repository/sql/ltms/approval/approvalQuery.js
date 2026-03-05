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


/**
 * findApprovalTemplates : 결재 템플릿 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 {company_id, document_type}
 * @returns {Promise<Array<Object>>} : 결재 템플릿 목록
 */
export const findApprovalTemplates = async (conn, queryParams) => {

  const query = `
    /* findApprovalTemplates : 결재 템플릿 조회 */
    SELECT
      at.approval_template_id                               AS approval_template_id,
      at.template_name                                      AS template_name,
      at.template_title                                     AS template_title
    FROM
      approval_template AS at
    WHERE
      at.company_id = :company_id
      AND at.document_type = :document_type
      AND at.is_active = 1
      AND at.is_default = 1
    ORDER BY
      at.approval_template_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * saveApprovalDocument : 결재 문서 생성
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 생성할 결재 문서 데이터
 * @returns {Promise<number>} : 생성된 결재 문서 ID
 */
export const saveApprovalDocument = async (conn, queryParams) => {
  
  const query = `
    /* saveApprovalDocument : 결재 문서 생성 */
    INSERT INTO approval_document (
      company_id,
      approval_template_id,
      document_type,
      document_id,
      document_title,
      requester_id,
      request_date,
      current_step,
      approval_status,
      created_by
    ) VALUES (
      :company_id,
      :approval_template_id,
      :document_type,
      :document_id,
      :document_title,
      :requester_id,
      NOW(),
      :current_step,
      :approval_status,
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  const approvalDocumentId = result.insertId ? result.insertId.toString() : null;
  return approvalDocumentId;
};


/**
 * findApprovalLineTemplates : 결재선 템플릿 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 {company_id, document_type}
 * @returns {Promise<Array<Object>>} : 결재선 템플릿 목록
 */
export const findApprovalLineTemplates = async (conn, queryParams) => {
  const query = `
    /* findApprovalLineTemplates : 결재선 템플릿 목록 조회 */
    SELECT
      alt.approval_line_template_id                        AS approval_line_template_id,
      alt.approval_template_id                             AS approval_template_id,
      alt.company_id                                       AS company_id,
      alt.document_type                                    AS document_type,
      alt.step                                             AS step,
      alt.user_grade_id                                    AS user_grade_id,
      alt.approver_id                                      AS approver_id,
      alt.department_id                                    AS department_id,
      alt.team_code                                        AS team_code,
      alt.approval_type                                    AS approval_type,
      alt.is_parallel                                      AS is_parallel,
      alt.parallel_group_id                                AS parallel_group_id,
      alt.parallel_approval_rule                           AS parallel_approval_rule,
      alt.delegated_from_user_id                           AS delegated_from_user_id,
      alt.delegation_start_date                            AS delegation_start_date,
      alt.delegation_end_date                              AS delegation_end_date,
      alt.delegation_reason                                AS delegation_reason,
      alt.condition_type                                   AS condition_type,
      alt.condition_value                                  AS condition_value,
      alt.is_active                                        AS is_active,
      alt.sort_order                                       AS sort_order
    FROM
      approval_line_template AS alt
    WHERE
      alt.company_id = :company_id
      AND alt.is_active = 1
      AND alt.approval_template_id = :approval_template_id
    ORDER BY
      alt.step,
      alt.sort_order;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * saveApprovalLines : 결재선 저장
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} approvalLinesData : 저장할 결재선 데이터 배열
 * @returns {Promise<Object>} : 저장 결과
 */
export const saveApprovalLines = async (conn, approvalLinesData) => {

  // 빈 배열 체크는 Service에서 이미 했지만, 방어 코드로 한 번 더 체크
  if (!approvalLinesData || approvalLinesData.length === 0) {
    return {
      affectedRows: 0,
      insertedIds: []
    };
  }
  
  const query = `
    /* saveApprovalLines : 결재선 저장 */
    INSERT INTO approval_line (
      company_id,
      approval_document_id,
      document_type,
      step,
      user_grade_id,
      approver_id,
      department_id,
      team_code,
      approval_type,
      is_parallel,
      parallel_group_id,
      parallel_approval_rule,
      delegated_from_user_id,
      delegation_start_date,
      delegation_end_date,
      delegation_reason,
      condition_type,
      condition_value,
      approval_status,
      sort_order,
      created_by
    ) VALUES (
      :company_id,
      :approval_document_id,
      :document_type,
      :step,
      :user_grade_id,
      :approver_id,
      :department_id,
      :team_code,
      :approval_type,
      :is_parallel,
      :parallel_group_id,
      :parallel_approval_rule,
      :delegated_from_user_id,
      :delegation_start_date,
      :delegation_end_date,
      :delegation_reason,
      :condition_type,
      :condition_value,
      :approval_status,
      :sort_order,
      :created_by
    );
  `;

  // 각 결재선 데이터를 개별적으로 INSERT
  const insertPromises = approvalLinesData.map(lineParams => 
    conn.query(query, lineParams)
  );

  // 모든 INSERT를 병렬로 실행
  const results = await Promise.all(insertPromises);

  // 생성된 결재선 ID들 반환
  const insertedIds = results.map((result) => result.insertId.toString());
  
  return {
    affectedRows: results.length,
    insertedIds: insertedIds
  };
};


/**
 * findApprovals : CT 결재 문서 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : 조회 파라미터 {company_id, search_type, date_from, date_to, ct_no, ct_content, approval_status}
 * @returns {Promise<Object[]>} : CT 결재 문서 목록
 */
export const findApprovals = async (conn, params) => {

  const queryParams = {
    company_id: params.company_id
  };

  let dateColumn = ''; // 기본값: CT 의뢰일자

  // search_type에 따른 날짜 컬럼 선택
  if (params.search_type === 'C_REC') {
    dateColumn = 'cr.ct_receipt_date';
  } else if (params.search_type === 'C_REQ') {
    dateColumn = 'cr.ct_request_date';
  } else if (params.search_type === 'M_REQ') {
    dateColumn = 'cr.material_request_date';
  }

  let query = `
    /* findApprovals : CT 결재 문서 목록 조회 */
    SELECT
      ROW_NUMBER() OVER (ORDER BY ad.created_at DESC)   AS idx,
      ad.approval_document_id                           AS approval_document_id,
      ad.approval_status                                AS approval_status,
      ad.current_step                                   AS current_step,
      ad.request_date                                   AS request_date,
      adt.module_name                                   AS module_name,
      cr.ct_request_id                                  AS ct_request_id,
      cr.ct_no                                          AS ct_no,
      cr.ct_lab_no                                      AS ct_lab_no,
      cr.ct_type                                        AS ct_type,
      cr.sample_id                                      AS sample_id,
      cr.client_id                                      AS client_id,
      cr.material_supplier_id                           AS material_supplier_id,
      DATE_FORMAT(cr.material_request_date, '%Y-%m-%d') AS material_request_date,
      DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')       AS ct_request_date,
      DATE_FORMAT(cr.ct_receipt_date, '%Y-%m-%d')       AS ct_receipt_date,
      DATE_FORMAT(cr.ct_due_date, '%Y-%m-%d')           AS ct_due_date,
      cr.judgment_id                                    AS judgment_id,
      cr.sales_manager_id                               AS sales_manager_id,
      cr.labs_manager_id                                AS labs_manager_id,
      cr.ct_manager_id                                  AS ct_manager_id,
      cr.is_emergency                                   AS is_emergency,
      cr.is_cpnp                                        AS is_cpnp,
      cr.is_eng                                         AS is_eng
    FROM
      approval_document ad
    LEFT JOIN
      approval_document_type adt
      ON ad.company_id = adt.company_id
      AND ad.document_type = adt.document_type_code
    INNER JOIN
      ct_request cr
      ON ad.company_id = cr.company_id
      AND ad.document_id = cr.ct_request_id
    WHERE
      ad.company_id = :company_id
      AND ad.is_active = 1
      AND cr.is_active = 1
      AND cr.ct_status != 'REQUESTED'
      AND ad.document_type IN ('CT_REQ', 'CT_TEST')
  `;

  // 날짜 조건 처리
  if (params.date_from && params.date_to) {
    query += ` AND ${dateColumn} BETWEEN :date_from AND :date_to`;
    queryParams.date_from = params.date_from;
    queryParams.date_to = params.date_to;
  }

  // CT 번호 검색
  if (params.ct_no) {
    query += ` AND cr.ct_no LIKE :ct_no`;
    queryParams.ct_no = utils.sanitizeSearchPattern(params.ct_no);
  }

  // 검색어 (CT 번호, 랩넘버, 의뢰내용 등)
  if (params.ct_content) {
    query += ` AND (
      cr.ct_no LIKE :ct_content 
      OR cr.ct_lab_no LIKE :ct_content
      OR cr.request_content LIKE :ct_content
      OR cr.ct_manage_summary LIKE :ct_content
    )`;
    queryParams.ct_content = utils.sanitizeSearchPattern(params.ct_content);
  }

  // 결재 상태 필터 (배열)
  if (params.approval_status && params.approval_status.length > 0) {
    // 1. 먼저 queryParams에 실제 값 할당
    params.approval_status.forEach((status, idx) => {
      queryParams[`approval_status_${idx}`] = status;
    });
    
    // 2. 그 다음 placeholders 생성 및 쿼리 문자열 구성
    const statusPlaceholders = params.approval_status.map((_, idx) => `:approval_status_${idx}`).join(', ');
    query += ` AND ad.approval_status IN (${statusPlaceholders})`;
  }

  query += `
    ORDER BY
      ad.created_at DESC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findApprovalById : CT 결재 문서 상세 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 {company_id, approval_document_id}
 * @returns 
 */
export const findApprovalById = async (conn, queryParams) => {

  const query = `
    /* findApprovalById : CT 결재 문서 상세 조회 */
    SELECT
      ad.approval_document_id                           AS approval_document_id,
      ad.approval_status                                AS approval_status,
      ad.current_step                                   AS current_step,
      ad.request_date                                   AS request_date,
      cr.ct_request_id                                  AS ct_request_id,
      cr.ct_no                                          AS ct_no,
      cr.ct_type                                        AS ct_type,
      cr.ct_lab_no                                      AS ct_lab_no,
      cr.sample_id                                      AS sample_id,
      cr.client_id                                      AS client_id,
      cr.material_supplier_id                           AS material_supplier_id,
      DATE_FORMAT(cr.material_request_date, '%Y-%m-%d') AS material_request_date,
      DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')       AS ct_request_date,
      DATE_FORMAT(cr.ct_receipt_date, '%Y-%m-%d')       AS ct_receipt_date,
      DATE_FORMAT(cr.ct_due_date, '%Y-%m-%d')           AS ct_due_date,
      cr.judgment_id                                    AS judgment_id,
      cr.sales_manager_id                               AS sales_manager_id,
      cr.labs_manager_id                                AS labs_manager_id,
      cr.ct_manager_id                                  AS ct_manager_id,
      cr.is_emergency                                   AS is_emergency,
      cr.is_cpnp                                        AS is_cpnp,
      cr.is_eng                                         AS is_eng,
      cr.request_content                                AS request_content,
      cr.request_remark                                 AS request_remark,
      TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.desired_volume))               AS desired_volume
    FROM
      approval_document ad
    INNER JOIN
      ct_request cr
      ON ad.company_id = cr.company_id
      AND ad.document_id = cr.ct_request_id
    WHERE
      ad.company_id = :company_id
      AND ad.approval_document_id = :approval_document_id
      AND ad.is_active = 1
      AND cr.is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};