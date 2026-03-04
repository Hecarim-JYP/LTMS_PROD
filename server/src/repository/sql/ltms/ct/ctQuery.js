/**
 * 파일명 : ctQuery.js
 * 용도 : CT 데이터베이스 쿼리 처리
 * 최초등록 : 2026-01-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import * as utils from '../../../../common/utils.js';


/* ============================== 의뢰 ============================== */
/**
 * findCtRequests : CT 의뢰 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : 조회 파라미터(CT_Request_Read.jsx 화면의 searchForm 객체)
 * @returns {Promise<Array<Object>>} : CT 의뢰 목록 조회 결과
 */
export const findCtRequests = async (conn, params) => {

  const queryParams = {
    search_type: params.search_type,
    company_id: params.company_id
  };

  let dateColumn = 'cr.ct_request_date'; // 기본값: REQ이며, CT의뢰일자로 조회.
  
  let query = `
    /* findCtRequests : CT 데이터 조회 */
    SELECT
      cr.ct_request_id                                  AS ct_request_id
      , cr.ct_no                                        AS ct_no
      , cr.ct_test_seq                                  AS ct_test_seq
      , DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')     AS ct_request_date
      , cr.ct_lab_no                                    AS ct_lab_no
      , cr.sample_id                                    AS sample_id
      , ''                                              AS sample_name
      , cr.client_id                                    AS client_id
      , ''                                              AS client_name
      , cr.material_description                         AS material_description
      , cr.material_supplier_id                         AS material_supplier_id
      , ''                                              AS material_supplier_name
      , DATE_FORMAT(cr.ct_due_date, '%Y-%m-%d')         AS ct_due_date
      , ctr.final_judgment_id                           AS judgment_id
      , j.judgment_name                                 AS judgment_name
      , cr.labs_manager_id                              AS labs_manager_id
      , ''                                              AS labs_manager_name
      , cr.sales_manager_id                             AS sales_manager_id
      , ''                                              AS sales_manager_name
      , cr.ct_manage_summary                            AS ct_manage_summary
      , cr.request_content                              AS request_content
      , CONCAT(
          TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.desired_volume))
          , (SELECT 
                u.unit_code 
              FROM 
                unit u 
              WHERE 
                u.company_id = 1
                AND u.is_active = 1
                AND u.unit_id = cr.desired_volume_unit_id)
      )                                                 AS desired_volume
    FROM
      ct_request AS cr
    LEFT JOIN ct_test_report ctr
      ON cr.company_id = ctr.company_id
      AND cr.ct_request_id = ctr.ct_request_id
    LEFT JOIN 
      judgment j 
      ON cr.company_id = j.company_id
      AND ctr.final_judgment_id = j.judgment_id
    WHERE
      cr.company_id = :company_id
      AND cr.is_active = 1
  `;
  
  if (params.search_type === 'REC') {
    dateColumn = 'cr.ct_receipt_date';
  } else if (params.search_type === 'LAB') {
    dateColumn = 'cr.material_request_date';
  } else if (params.search_type === 'COMP') {
    dateColumn = 'cr.ct_due_date';
  }

  // 날짜 조건 처리
  if (params.date_from && params.date_to) {
    query += ` AND ${dateColumn} BETWEEN :date_from AND :date_to`;
    queryParams.date_from = params.date_from;
    queryParams.date_to = params.date_to;
  }

  // manager_type 조건 처리
  if (params.manager_type) {
    let managerColumn = '';
    if (params.manager_type === 'LAB_MGR') {
      managerColumn = 'cr.labs_manager_id';
    } else if (params.manager_type === 'LAB_DEPT') {
      managerColumn = 'cr.labs_manage_department_id';
    } else if (params.manager_type === 'SALES_MGR') {
      managerColumn = 'cr.sales_manager_id';
    } else if (params.manager_type === 'CT_MGR') {
      managerColumn = 'cr.ct_manager_id';
    }
    if (managerColumn && params.manager) {
      query += ` AND ${managerColumn} = :manager`;
      queryParams.manager = params.manager;
    }
  }

  if (params.ct_no) {
    query += ` AND cr.ct_no = :ct_no`;
    queryParams.ct_no = params.ct_no;
  }

  if (params.ct_status) {
    query += ` AND cr.ct_status = :ct_status`;
    queryParams.ct_status = params.ct_status;
  }

  if (params.client_id) {
    query += ` AND cr.client_id = :client_id`;
    queryParams.client_id = params.client_id;
  }

  if (params.sample_id) {
    query += ` AND cr.sample_id = :sample_id`;
    queryParams.sample_id = params.sample_id;
  }
  if (params.ct_type) {
    query += ` AND cr.ct_type = :ct_type`;
    queryParams.ct_type = params.ct_type;
  }

  if (params.material_type) {
    query += ` AND cr.material_description = :material_type`;
    queryParams.material_type = params.material_type;
  }

  if (params.material_supplier_id) {
    query += ` AND cr.material_supplier_id = :material_supplier_id`;
    queryParams.material_supplier_id = params.material_supplier_id;
  }

  if (params.ct_lab_no) {
    query += ` AND cr.ct_lab_no = :ct_lab_no`;
    queryParams.ct_lab_no = params.ct_lab_no;
  }

  if (params.judgment_id) {
    query += ` AND ctr.final_judgment_id = :judgment_id`;
    queryParams.judgment_id = params.judgment_id;
  }

  // 긴급건 조건 처리
  // Y만: 완료된 건만(1) | N만: 미완료된 건만(0) | 둘 다: 전체 건 조회(조건 제거)
  if (params.is_emergency_y !== undefined || params.is_emergency_n !== undefined) {
    const hasY = params.is_emergency_y !== undefined;
    const hasN = params.is_emergency_n !== undefined;
    
    if (hasY && !hasN) {
      // Y만 있음: 완료된 건만
      query += ` AND cr.is_emergency = 1`;
      } else if (!hasY && hasN) {
        // N만 있음: 미완료된 건만
        query += ` AND cr.is_emergency = 0`;
      }
      // 둘 다 있으면: 조건 제거 (전체 건 조회)
    }

    // CPNP 조건 처리
    // Y만: 완료된 건만(1) | N만: 미완료된 건만(0) | 둘 다: 전체 건 조회(조건 제거)
    if (params.is_cpnp_y !== undefined || params.is_cpnp_n !== undefined) {
      const hasY = params.is_cpnp_y !== undefined;
      const hasN = params.is_cpnp_n !== undefined;
      
      if (hasY && !hasN) {
        // Y만 있음: 완료된 건만
        query += ` AND cr.is_cpnp = 1`;
      } else if (!hasY && hasN) {
        // N만 있음: 미완료된 건만
        query += ` AND cr.is_cpnp = 0`;
      }
      // 둘 다 있으면: 조건 제거 (전체 건 조회)
    }

    // ENG 조건 처리
    // Y만: 완료된 건만(1) | N만: 미완료된 건만(0) | 둘 다: 전체 건 조회(조건 제거)
    if (params.is_eng_y !== undefined || params.is_eng_n !== undefined) {
      const hasY = params.is_eng_y !== undefined;
      const hasN = params.is_eng_n !== undefined;
      
      if (hasY && !hasN) {
        // Y만 있음: 완료된 건만
        query += ` AND cr.is_eng = 1`;
      } else if (!hasY && hasN) {
        // N만 있음: 미완료된 건만
        query += ` AND cr.is_eng = 0`;
      }
      // 둘 다 있으면: 조건 제거 (전체 건 조회)
    }

    if (params.request_content) {
      query += ` AND (
                    cr.material_description LIKE :request_content 
                    OR cr.request_content LIKE :request_content
                    OR cr.request_remark LIKE :request_content
                    OR cr.sample_etc LIKE :request_content
                    OR cr.sample_remark LIKE :request_content
                    OR cr.ct_manage_summary LIKE :request_content
                    OR cr.ct_manage_remark LIKE :request_content
                    OR cr.ct_suspend_reason LIKE :request_content
                )`;
      queryParams.request_content = utils.sanitizeSearchPattern(params.request_content);
    }

    query += ` 
      ORDER BY 
        cr.created_at DESC;
    `;

    const result = await conn.query(query, queryParams);
    return result;
};

/**
 * findCtRequestById : CT 의뢰 단일 데이터 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터  
 * @returns {Promise<Array<Object>>} : CT 의뢰 정보와 샘플 제형 정보
 */
export const findCtRequestById = async (conn, queryParams) => {

  let sqlCtInfo = `
    /* findCtRequestById : CT 의뢰 단일 데이터 조회 */
    SELECT
      cr.ct_request_id                                                                  AS ct_request_id
      , DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')                                     AS ct_request_date
      , cr.ct_no                                                                        AS ct_no
      , cr.ct_test_seq                                                                  AS ct_test_seq
      , cr.client_id                                                                    AS client_id
      , cr.sample_id                                                                    AS sample_id
      , cr.ct_lab_no                                                                    AS ct_lab_no
      , cr.sales_manager_id                                                             AS sales_manager_id
      , cr.labs_manage_department_id                                                    AS labs_manage_department_id
      , cr.labs_manager_id                                                              AS labs_manager_id
      , cr.ct_type                                                                      AS ct_type
      , cr.material_supplier_id                                                         AS material_supplier_id
      , cr.material_large_category_id                                                   AS material_large_category_id
      , cr.material_sub_category                                                        AS material_sub_category
      , cr.material_description                                                         AS material_description
      , cr.material_quantity                                                            AS material_quantity
      , cr.sample_quantity                                                              AS sample_quantity
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.desired_volume))               AS desired_volume
      , cr.desired_volume_unit_id                                                       AS desired_volume_unit_id
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.sleeve_length))                AS sleeve_length
      , cr.is_emergency                                                                 AS is_emergency
      , cr.is_cpnp                                                                      AS is_cpnp
      , cr.is_eng                                                                       AS is_eng
      , cr.request_content                                                              AS request_content
      , cr.request_remark                                                               AS request_remark
      , DATE_FORMAT(cr.material_request_date, '%Y-%m-%d')                               AS material_request_date
      , cr.sample_type_id                                                               AS sample_type_id
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.required_bulk_volume))         AS required_bulk_volume
      , cr.required_bulk_volume_unit_id                                                 AS required_bulk_volume_unit_id
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.request_bulk_volume))          AS request_bulk_volume
      , cr.request_bulk_volume_unit_id                                                  AS request_bulk_volume_unit_id
      , ROUND(cr.net_capacity, 1)                                                       AS net_capacity
      , cr.net_capacity_unit_id                                                         AS net_capacity_unit_id
      , cr.sample_etc                                                                   AS sample_etc
      , cr.sample_remark                                                                AS sample_remark
      , DATE_FORMAT(cr.ct_receipt_date, '%Y-%m-%d')                                     AS ct_receipt_date
      , DATE_FORMAT(cr.ct_due_date, '%Y-%m-%d')                                         AS ct_due_date
      , cr.judgment_id                                                                  AS judgment_id
      , cr.ct_manager_id                                                                AS ct_manager_id
      , cr.is_ct_suspend                                                                AS is_ct_suspend
      , cr.ct_suspend_reason                                                            AS ct_suspend_reason
      , cr.ct_manage_summary                                                            AS ct_manage_summary
      , cr.ct_manage_remark                                                             AS ct_manage_remark
    FROM
      ct_request AS cr
    WHERE
      cr.company_id = :company_id
      AND cr.is_active = 1
      AND cr.ct_request_id = :ct_request_id;
  `;

  let sqlCtSampleInfo = `
    /* selectCtSampleInfo : CT 샘플 정보 조회 */
    SELECT
      ROW_NUMBER() OVER (ORDER BY crs.ct_request_sample_id)                   AS idx
      , crs.company_id                                                        AS company_id
      , crs.ct_request_id                                                     AS ct_request_id
      , crs.ct_request_sample_id                                              AS ct_request_sample_id
      , crs.sample_lab_no                                                     AS sample_lab_no
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM crs.bulk_volume))       AS bulk_volume
      , crs.bulk_volume_unit_id                                               AS bulk_volume_unit_id
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM crs.viscosity))         AS viscosity
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM crs.hardness))          AS hardness
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM crs.specific_gravity))  AS specific_gravity
      , TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM crs.ratio))             AS ratio
      , crs.ratio_type_id                                                     AS ratio_type_id
      , crs.significant                                                       AS significant
    FROM
      ct_request_sample AS crs
    WHERE
      crs.company_id = :company_id
      AND crs.is_active = 1
      AND crs.ct_request_id = :ct_request_id
    ORDER BY
      crs.ct_request_sample_id ASC;
  `;

    /**
     * 두 쿼리를 병렬로 실행
     * WHY: Promise.all()을 사용하면 순차 실행보다 빠름
     *      쿼리1 완료 대기 → 쿼리2 실행 (X)
     *      쿼리1, 쿼리2 동시 실행 (O)
     */
    const [resultCtInfo, resultSampleInfo] = await Promise.all([
      conn.query(sqlCtInfo, queryParams),
      conn.query(sqlCtSampleInfo, queryParams)
    ]);

    const result = {
      ctInfo : resultCtInfo[0],
      sampleInfo : resultSampleInfo
    };

    return result;
};


/**
 * findRecentCtNo : 최신 CT 번호 조회
 * --------------------------------------------
 * HOW : CT + 연도(4자리) + 4자리 일련번호
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터
 * @returns {Promise<Object>} : 최신 CT 번호
 */
export const findRecentCtNo = async(conn, queryParams) => {
  const query = `
    /* findRecentCtNo : 최신 CT 번호 조회 */
    SELECT
      CONCAT(
        'CT',
        CASE 
          WHEN MAX(CONVERT(REPLACE(ct_no, 'CT', ''), INT)) IS NULL THEN CONCAT(DATE_FORMAT(CURDATE(), '%Y'), LPAD(1, 4, 0))
          WHEN MAX(CONVERT(REPLACE(ct_no, 'CT', ''), INT)) IS NOT NULL THEN MAX(CONVERT(REPLACE(ct_no, 'CT', ''), INT)) + 1
          ELSE CONCAT(DATE_FORMAT(CURDATE(), '%Y'), LPAD(1, 4, 0))
        END 
      ) AS recent_ct_no
    FROM
      ct_request AS cr
    WHERE
      cr.company_id = :company_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * saveCtRequest : CT 데이터 생성
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 생성할 데이터
 * @returns {Promise<Object>} : 생성된 데이터
 */
export const saveCtRequest = async (conn, queryParams) => {
  
  const query = `
    /* saveCtRequest : CT 데이터 생성 */
    INSERT INTO ct_request (
      ct_request_date,
      ct_no,
      ct_test_seq,
      client_id,
      sample_id,
      ct_lab_no,
      sales_manager_id,
      labs_manage_department_id,
      labs_manager_id,
      ct_type,
      material_supplier_id,
      material_large_category_id,
      material_sub_category,
      material_description,
      material_quantity,
      sample_quantity,
      desired_volume,
      desired_volume_unit_id,
      sleeve_length,
      is_emergency,
      is_cpnp,
      is_eng,
      request_content,
      request_remark,
      material_request_date,
      sample_type_id,
      required_bulk_volume,
      required_bulk_volume_unit_id,
      request_bulk_volume,
      request_bulk_volume_unit_id,
      sample_etc,
      sample_remark,
      net_capacity,
      net_capacity_unit_id,
      ct_receipt_date,
      ct_due_date,
      ct_manager_id,
      is_ct_suspend,
      ct_suspend_reason,
      ct_status,
      ct_manage_summary,
      ct_manage_remark,
      company_id,
      created_by
    ) VALUES (
      :ct_request_date,
      :ct_no,
      :ct_test_seq,
      :client_id,
      :sample_id,
      :ct_lab_no,
      :sales_manager_id,
      :labs_manage_department_id,
      :labs_manager_id,
      :ct_type,
      :material_supplier_id,
      :material_large_category_id,
      :material_sub_category,
      :material_description,
      :material_quantity,
      :sample_quantity,
      :desired_volume,
      :desired_volume_unit_id,
      :sleeve_length,
      :is_emergency,
      :is_cpnp,
      :is_eng,
      :request_content,
      :request_remark,
      :material_request_date,
      :sample_type_id,
      :required_bulk_volume,
      :required_bulk_volume_unit_id,
      :request_bulk_volume,
      :request_bulk_volume_unit_id,
      :sample_etc,
      :sample_remark,
      :net_capacity,
      :net_capacity_unit_id,
      :ct_receipt_date,
      :ct_due_date,
      :ct_manager_id,
      :is_ct_suspend,
      :ct_suspend_reason,
      :ct_status,
      :ct_manage_summary,
      :ct_manage_remark,
      :company_id,
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  const ctRequestId = result.insertId.toString();
  return ctRequestId;
};


/**
 * saveCtSamples : CT 샘플 저장
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} samplesData : 저장할 샘플 데이터 배열 (서비스 레이어에서 정제된 파라미터)
 * @returns {Promise<Object>} : 저장 결과
 */
export const saveCtSamples = async (conn, samplesData) => {

  // 빈 배열 체크는 Service에서 이미 했지만, 방어 코드로 한 번 더 체크
  if (!samplesData || samplesData.length === 0) {
    return {
      affectedRows: 0,
      insertedIds: []
    };
  }
  
  const query = `
    /* saveCtSamples : CT 샘플 저장 */
    INSERT INTO ct_request_sample (
      company_id,
      ct_request_id,
      sample_lab_no,
      bulk_volume,
      bulk_volume_unit_id,
      viscosity,
      hardness,
      specific_gravity,
      ratio,
      ratio_type_id,
      significant,
      created_by
    ) VALUES (
      :company_id,
      :ct_request_id,
      :sample_lab_no,
      :bulk_volume,
      :bulk_volume_unit_id,
      :viscosity,
      :hardness,
      :specific_gravity,
      :ratio,
      :ratio_type_id,
      :significant,
      :created_by
    );
  `;

  // 각 샘플 데이터를 개별적으로 INSERT (서비스에서 이미 정제된 파라미터 그대로 사용)
  const insertPromises = samplesData.map(sample => 
    conn.query(query, sample)
  );

  // 모든 INSERT를 병렬로 실행
  const results = await Promise.all(insertPromises);
  
  // 생성된 샘플 ID들 반환
  const insertedIds = results.map((result) => result.insertId.toString());
  
  return {
    affectedRows: results.length,
    insertedIds: insertedIds
  };
    
};


/**
 * updateCtRequest : CT 데이터 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정할 데이터 파라미터
 * @returns {Promise<Object>} : 수정된 데이터
 */
export const updateCtRequest = async (conn, queryParams) => {
  
  const query = `
    /* updateCtRequest : CT 데이터 수정 */
    UPDATE
      ct_request 
    SET
      ct_request_date = :ct_request_date,
      ct_no = :ct_no,
      ct_test_seq = :ct_test_seq,
      client_id = :client_id,
      sample_id = :sample_id,
      ct_lab_no = :ct_lab_no,
      sales_manager_id = :sales_manager_id,
      labs_manage_department_id = :labs_manage_department_id,
      labs_manager_id = :labs_manager_id,
      ct_type = :ct_type,
      material_supplier_id = :material_supplier_id,
      material_large_category_id = :material_large_category_id,
      material_sub_category = :material_sub_category,
      material_description = :material_description,
      material_quantity = :material_quantity,
      sample_quantity = :sample_quantity,
      desired_volume = :desired_volume,
      desired_volume_unit_id = :desired_volume_unit_id,
      sleeve_length = :sleeve_length,
      is_emergency = :is_emergency,
      is_cpnp = :is_cpnp,
      is_eng = :is_eng,
      request_content = :request_content,
      request_remark = :request_remark,
      material_request_date = :material_request_date,
      sample_type_id = :sample_type_id,
      required_bulk_volume = :required_bulk_volume,
      required_bulk_volume_unit_id = :required_bulk_volume_unit_id,
      request_bulk_volume = :request_bulk_volume,
      request_bulk_volume_unit_id = :request_bulk_volume_unit_id,
      sample_etc = :sample_etc,
      sample_remark = :sample_remark,
      net_capacity = :net_capacity,
      net_capacity_unit_id = :net_capacity_unit_id,
      ct_receipt_date = :ct_receipt_date,
      ct_due_date = :ct_due_date,
      ct_manager_id = :ct_manager_id,
      is_ct_suspend = :is_ct_suspend,
      ct_suspend_reason = :ct_suspend_reason,
      ct_status = :ct_status,
      ct_manage_summary = :ct_manage_summary,
      ct_manage_remark = :ct_manage_remark,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND ct_request_id = :ct_request_id;
  `;

  await conn.query(query, queryParams);
  const ctRequestId = queryParams.ct_request_id.toString();
  return ctRequestId;
};


/**
 * deactivateCtSamples : CT 샘플 비활성화
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 비활성화할 샘플 파라미터 {company_id, ct_request_id}
 * @returns {Promise<Object>} : 비활성화 결과
 */
export const deactivateCtSamples = async (conn, queryParams) => {
  
  const query = `
    /* deactivateCtSamples : CT 샘플 비활성화 */
    UPDATE 
      ct_request_sample
    SET
      is_active = 0,
      deleted_at = NOW(),
      deleted_by = :deleted_by
    WHERE
      company_id = :company_id
      AND is_active = 1
      AND ct_request_id = :ct_request_id;
  `;

  const result = await conn.query(query, queryParams);
  
  return {
    affectedRows: result.affectedRows || 0
  };
};


/* ============================== 시험성적서 ============================== */
/**
 * findTestReports : CT 의뢰 ID로 시험 성적서 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 {company_id ..}
 * @returns {Promise<Array>} : 시험 성적서 데이터 배열
 */
export const findTestReports = async (conn, params) => {

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
    /* findTestReports : CT 의뢰 ID로 시험 성적서 조회 */
    SELECT
      ctr.ct_test_report_id                           AS ct_test_report_id,
      ctr.ct_request_id                               AS ct_request_id,
      cr.ct_no                                        AS ct_no,
      cr.ct_test_seq                                  AS ct_test_seq,
      CASE 
        WHEN cr.is_emergency = 1 THEN '해당' 
        ELSE '미해당' 
      END                                             AS is_emergency,
      CASE 
        WHEN cr.is_cpnp = 1 THEN '해당' 
        ELSE '미해당' 
      END                                             AS is_cpnp,
      CASE 
        WHEN cr.is_eng = 1 THEN '해당' 
        ELSE '미해당' 
      END                                             AS is_eng,
      DATE_FORMAT(ctr.judgment_date, '%Y-%m-%d')      AS judgment_date,
      (SELECT 
        j.judgment_name 
        FROM 
          judgment j 
        WHERE 
          j.company_id = ctr.company_id 
          AND j.judgment_id = ctr.daily_judgment_id)  AS daily_judgment,
      (SELECT 
        j.judgment_name 
        FROM 
          judgment j 
        WHERE 
          j.company_id = ctr.company_id 
          AND j.judgment_id = ctr.final_judgment_id)  AS final_judgment,
      ctr.tester_id                                   AS tester_id,
      ctr.approver_id                                 AS approver_id
    FROM
      ct_test_report AS ctr
      INNER JOIN ct_request AS cr
    ON 
      ctr.company_id = cr.company_id
      AND ctr.ct_request_id = cr.ct_request_id
    WHERE
      ctr.company_id = :company_id
      AND ctr.is_active = 1
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

  query += `
    ORDER BY
      ctr.created_at DESC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findTestReportByCtRequestId : ct_request_id로 시험 성적서 존재 여부 확인
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 {company_id, ct_request_id}
 * @returns {Promise<Object|null>} : 시험 성적서 데이터 또는 null
 */
export const findTestReportByCtRequestId = async (conn, queryParams) => {

  const query = `
    /* findTestReportByCtRequestId : ct_request_id로 시험 성적서 조회 */
    SELECT
      COUNT(1) AS REPORT_COUNT
    FROM
      ct_test_report ctr
    WHERE
      ctr.company_id = :company_id
      AND ctr.is_active = 1
      AND ctr.ct_request_id = :ct_request_id
    LIMIT 1;
  `;

  const result = await conn.query(query, queryParams);
  return result[0].REPORT_COUNT.toString();
};


/**
 * saveTestReport : 시험 성적서 생성
 * --------------------------------------------
 * HOW : ct_request에 존재하는 중복 컴럼을 제외하고, 시험 성적서 고유 데이터만 저장
 * WHY : 데이터 정규화, 중복 방지, 일관성 유지 (ct_request_id로 JOIN 하여 조회)
 * 
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 생성할 시험 성적서 데이터
 * @returns {Promise<string>} : 생성된 시험 성적서 ID (문자열)
 */
export const saveTestReport = async (conn, queryParams) => {

  const query = `
    /* saveTestReport : 시험 성적서 생성 */
    INSERT INTO ct_test_report (
      company_id,
      ct_request_id,
      created_by
    ) VALUES (
      :company_id,
      :ct_request_id,
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  return result.insertId.toString();
};


/**
 * updateTestReport : 시험 성적서 수정
 * --------------------------------------------
 * HOW : 시험 성적서 고유 데이터만 수정, ct_request 데이터는 ct_request 테이블에서 직접 수정
 * WHY : 데이터 일관성 유지, 중복 업데이트 방지
 * 
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정할 시험 성적서 데이터 (ct_test_report_id 포함)
 * @returns {Promise<number>} : 수정된 행 수
 */
export const updateTestReport = async (conn, queryParams) => {

  const query = `
    /* updateTestReport : 시험 성적서 수정 */
    UPDATE 
      ct_test_report
    SET
      material_image = :material_image,
      judgment_date = :judgment_date,
      daily_judgment_id = :daily_judgment_id,
      final_judgment_id = :final_judgment_id,
      tester_id = :tester_id,
      approver_id = :approver_id,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND ct_test_report_id = :ct_test_report_id;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/**
 * updateCtRequestFromTestReport : 시험 성적서에서 CT 의뢰 데이터 수정
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 수정할 CT 의뢰 데이터 (ct_request_id 포함)
 * @returns {Promise<number>} : 수정된 행 수
 * 추후 필요 시 개발 예정. 
 * => 시험 성적서 화면에서 의뢰 정보 변경이 가능해야 하는지 확인 필요. 
 *    (예: 판단 결과에 따라 CT 의뢰의 판단 결과, 담당자 등이 변경되어야 하는 경우)
 */
export const updateCtRequestFromTestReport = async (conn, queryParams) => {

  const query = `
    /* updateCtRequestFromTestReport : 시험 성적서에서 CT 의뢰 데이터 수정 */
    UPDATE 
      ct_request cr
    SET
      cr.updated_by = :updated_by
      ${queryParams.judgment_id ? ', cr.sale_manager_id = :sale_manager_id' : ''}
      ${queryParams.judgment_id ? ', cr.sale_manager_id = :sale_manager_id' : ''}
      ${queryParams.judgment_id ? ', cr.sale_manager_id = :sale_manager_id' : ''}
      ${queryParams.judgment_id ? ', cr.sale_manager_id = :sale_manager_id' : ''}
      ${queryParams.judgment_id ? ', cr.sale_manager_id = :sale_manager_id' : ''}
      ${queryParams.judgment_id ? ', cr.sale_manager_id = :sale_manager_id' : ''}
    WHERE
      cr.company_id = :company_id
      AND cr.ct_request_id = :ct_request_id;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/* ============================== 결재 ============================== */
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
      at.template_name                                      AS template_name
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
      approval_status
    ) VALUES (
      :company_id,
      :approval_template_id,
      :document_type,
      :document_id,
      :document_title,
      :requester_id,
      :request_date,
      :current_step,
      :approval_status
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
      step,
      user_grade_id,
      approver_id,
      department_id,
      team_code,
      approval_type,
      is_parallel,
      parallel_group_id,
      parallel_approval_rule,
      condition_type,
      condition_value,
      approval_status,
      sort_order
    ) VALUES (
      :company_id,
      :approval_document_id,
      :step,
      :user_grade_id,
      :approver_id,
      :department_id,
      :team_code,
      :approval_type,
      :is_parallel,
      :parallel_group_id,
      :parallel_approval_rule,
      :condition_type,
      :condition_value,
      :approval_status,
      :sort_order
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
 * findCtApprovals : CT 결재 문서 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : 조회 파라미터 {company_id, search_type, date_from, date_to, ct_no, ct_content, approval_status}
 * @returns {Promise<Object[]>} : CT 결재 문서 목록
 */
export const findCtApprovals = async (conn, params) => {

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
    /* findCtApprovals : CT 결재 문서 목록 조회 */
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
 * findCtApprovalById : CT 결재 문서 상세 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 조회 파라미터 {company_id, approval_document_id}
 * @returns 
 */
export const findCtApprovalById = async (conn, queryParams) => {

  const query = `
    /* findCtApprovalById : CT 결재 문서 상세 조회 */
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

/* ============================== 시험 성적서 시험 항목 ============================== */
/**
 * saveCtTestItem : 시험 항목 INSERT
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 시험 항목 객체
 * @returns {Promise<number>} : 생성된 행 수
 */
export const saveCtTestItem = async (conn, queryParams) => {

  const query = `
    /* saveCtTestItem : 시험 항목 배열 INSERT */
    INSERT INTO ct_test_item (
      company_id,
      ct_test_report_id,
      test_id,
      test_standard,
      test_result,
      remark,
      note,
      attached_image_url,
      sort_order,
      created_by
    ) VALUES (
      :company_id,
      :ct_test_report_id,
      :test_id,
      :test_standard,
      :test_result,
      :remark,
      :note,
      :attached_image_url,
      :sort_order,
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  return result.insertId.toString();
};


/**
 * updateCtTestItem : 시험 항목 UPDATE
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 시험 항목 객체 (ct_test_item_id 포함)
 * @returns {Promise<number>} : 수정된 행 수
 */
export const updateCtTestItem = async (conn, queryParams) => {

  const query = `
    /* updateCtTestItem : 시험 항목 UPDATE */
    UPDATE
      ct_test_item
    SET
      test_id = :test_id,
      test_standard = :test_standard,
      test_result = :test_result,
      remark = :remark,
      note = :note,
      attached_image_url = :attached_image_url,
      sort_order = :sort_order,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND ct_test_item_id = :ct_test_item_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/**
 * deactivateCtTestItem : 시험 항목 단일 비활성화
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : {company_id, ct_test_item_id, deleted_by}
 * @returns {Promise<number>} : 수정된 행 수
 */
export const deactivateCtTestItem = async (conn, queryParams) => {
  const query = `
    /* deactivateCtTestItem : 시험 항목 단일 비활성화 */
    UPDATE
      ct_test_item
    SET
      is_active = 0,
      deleted_at = NOW(),
      deleted_by = :deleted_by
    WHERE
      company_id = :company_id
      AND ct_test_item_id = :ct_test_item_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/* ============================== 시험 성적서 주의사항 ============================== */
/**
 * saveCtTestCaution : 주의사항 배열 INSERT
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 주의사항 객체
 * @returns {Promise<number>} : 생성된 행 수
 */
export const saveCtTestCaution = async (conn, queryParams) => {

  const query = `
    /* saveCtTestCaution : 주의사항 배열 INSERT */
    INSERT INTO ct_test_caution (
      company_id,
      ct_test_report_id,
      caution_type,
      section_title,
      section_content,
      sort_order,
      created_by
    ) VALUES (
      :company_id,
      :ct_test_report_id,
      :caution_type,
      :section_title,
      :section_content,
      :sort_order,
      :created_by
     );
  `;

  const result = await conn.query(query, queryParams);
  return result.insertId.toString();
};


/**
 * updateCtTestCaution : 주의사항 UPDATE
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 주의사항 객체 (ct_test_caution_id 포함)
 * @returns {Promise<number>} : 수정된 행 수
 */
export const updateCtTestCaution = async (conn, queryParams) => {

  const query = `
    /* updateCtTestCaution : 주의사항 UPDATE */
    UPDATE
      ct_test_caution
    SET
      caution_type = :caution_type,
      section_title = :section_title,
      section_content = :section_content,
      sort_order = :sort_order,
      updated_by = :updated_by
    WHERE
      company_id = :company_id
      AND ct_test_caution_id = :ct_test_caution_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/**
 * deactivateCtTestCaution : 주의사항 단일 비활성화
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : {company_id, ct_test_caution_id, deleted_by}
 * @returns {Promise<number>} : 수정된 행 수
 */
export const deactivateCtTestCaution = async (conn, queryParams) => {
  const query = `
    /* deactivateCtTestCaution : 주의사항 단일 비활성화 */
    UPDATE ct_test_caution
    SET
      is_active = 0,
      deleted_at = NOW(),
      deleted_by = :deleted_by
    WHERE
      company_id = :company_id
      AND ct_test_caution_id = :ct_test_caution_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/* ============================== 성적서 조회 ============================== */
/**
 * findCtTestReportByRequestId : CT 성적서 메인 정보 조회 (ct_test_report + ct_request 조인)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : {company_id, ct_request_id}
 * @returns {Promise<Object>} : 성적서 메인 정보
 */
export const findCtTestReportByRequestId = async (conn, params) => {
  const query = `
    /* findCtTestReportByRequestId : CT 성적서 메인 정보 조회 */
    SELECT

      /* CT 의뢰 정보 */
      ctr.ct_test_report_id                         AS ct_test_report_id,
      cr.ct_request_id                              AS ct_request_id,

      cr.ct_no                                      AS ct_no,
      cr.sample_id                                  AS sample_id,
      ''                                            AS sample_name,
      DATE_FORMAT(cr.ct_receipt_date, '%Y-%m-%d')   AS ct_receipt_date,
      DATE_FORMAT(cr.ct_due_date, '%Y-%m-%d')       AS ct_due_date,

      cr.sales_manager_id                           AS sales_manager_id,
      requester.user_name                           AS sales_manager_name,
      cr.labs_manager_id                            AS labs_manager_id,
      formulation_mgr.user_name                     AS labs_manager_name,
      CONCAT(
        TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM cr.desired_volume)),
        ' ',
        (SELECT u.unit_name 
           FROM unit AS u 
          WHERE u.company_id = cr.company_id 
            AND u.unit_id = cr.desired_volume_unit_id
            AND u.is_active = 1
        )
      )                                             AS desired_volume,
      cr.ct_test_seq                                AS ct_test_seq,
      cr.sample_quantity                            AS sample_quantity,

      cr.ct_lab_no                                  AS ct_lab_no,
      cr.sample_etc                                 AS sample_etc,
      cr.sample_remark                              AS sample_remark,

      cr.material_supplier_id                       AS material_supplier_id,
      ''                                            AS material_supplier_name,
      cr.material_description                       AS material_description,

      cr.request_content                            AS request_content,
      DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')   AS ct_request_date,
      cr.client_id                                  AS client_id,
      ''                                            AS client_name,

      /* 판정 정보 (일일, 최종) */
      DATE_FORMAT(ctr.judgment_date, '%Y-%m-%d')    AS judgment_date,
      ctr.daily_judgment_id                         AS daily_judgment_id,
      daily_judge.judgment_name                     AS daily_judgment_name,
      ctr.final_judgment_id                         AS final_judgment_id,
      final_judge.judgment_name                     AS final_judgment_name,
      
      /* 시험자, 승인자 정보 */
      ctr.tester_id                                 AS tester_id,
      tester.user_name                              AS tester_name,
      ctr.approver_id                               AS approver_id,
      approver.user_name                            AS approver_name
      
    FROM
      ct_test_report AS ctr
      INNER JOIN 
        ct_request AS cr 
        ON ctr.ct_request_id = cr.ct_request_id 
        AND ctr.company_id = cr.company_id
      LEFT JOIN 
        \`user\` AS requester 
        ON cr.sales_manager_id = requester.user_id 
        AND cr.company_id = requester.company_id
      LEFT JOIN 
        \`user\` AS formulation_mgr 
        ON cr.labs_manager_id = formulation_mgr.user_id 
        AND cr.company_id = formulation_mgr.company_id
      LEFT JOIN 
        judgment AS daily_judge 
        ON ctr.daily_judgment_id = daily_judge.judgment_id 
        AND ctr.company_id = daily_judge.company_id
      LEFT JOIN 
        judgment AS final_judge 
        ON ctr.final_judgment_id = final_judge.judgment_id 
        AND ctr.company_id = final_judge.company_id
      LEFT JOIN 
        \`user\` AS tester 
        ON ctr.tester_id = tester.user_id 
        AND ctr.company_id = tester.company_id
      LEFT JOIN 
        \`user\` AS approver 
        ON ctr.approver_id = approver.user_id 
        AND ctr.company_id = approver.company_id
    WHERE
      ctr.company_id = :company_id
      AND ctr.ct_request_id = :ct_request_id
      AND ctr.ct_test_report_id = :ct_test_report_id
      AND cr.is_active = 1
      AND ctr.is_active = 1
    LIMIT 1;
  `;

  const result = await conn.query(query, params);
  return result.length > 0 ? result[0] : null;
};


/**
 * findCtTestItemsByReportId : CT 시험 항목 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : {company_id, ct_test_report_id}
 * @returns {Promise<Array<Object>>} : 시험 항목 목록
 */
export const findCtTestItemsByReportId = async (conn, params) => {
  const query = `
    /* findCtTestItemsByReportId : CT 시험 항목 목록 조회 */
    SELECT
      cti.ct_test_item_id         AS ct_test_item_id,
      cti.ct_test_report_id       AS ct_test_report_id,
      cti.test_id                 AS test_id,
      ts.test_standard_code       AS test_standard_code,
      ts.test_standard_name       AS test_standard_name,
      ts.test_guide               AS test_guide,
      rto.result_type_option_id   AS result_type_option_id,
      cti.test_result             AS test_result,
      cti.remark                  AS remark,
      cti.note                    AS note,
      cti.attached_image_url      AS attached_image_url,
      cti.sort_order              AS sort_order
    FROM
      ct_test_item AS cti
    LEFT JOIN
      test_standard AS ts
      ON cti.test_id = ts.test_standard_id
      AND cti.company_id = ts.company_id
    LEFT JOIN
      result_type_option AS rto
      ON ts.result_type_option_id = rto.result_type_option_id
      AND ts.company_id = rto.company_id
    WHERE
      cti.company_id = :company_id
      AND cti.ct_test_report_id = :ct_test_report_id
      AND cti.is_active = 1
    ORDER BY
      cti.sort_order
      , cti.ct_test_item_id;
  `;

  const result = await conn.query(query, params);
  return result;
};


/**
 * findCtTestCautionsByReportId : CT 주의사항 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : {company_id, ct_test_report_id}
 * @returns {Promise<Array<Object>>} : 주의사항 목록
 */
export const findCtTestCautionsByReportId = async (conn, params) => {
  const query = `
    /* findCtTestCautionsByReportId : CT 주의사항 목록 조회 */
    SELECT
      ctc.ct_test_caution_id  AS ct_test_caution_id,
      ctc.ct_test_report_id   AS ct_test_report_id,
      ctc.caution_type        AS caution_type,
      ctc.section_title       AS section_title,
      ctc.section_content     AS section_content,
      ctc.sort_order          AS sort_order
    FROM
      ct_test_caution AS ctc
    WHERE
      ctc.company_id = :company_id
      AND ctc.ct_test_report_id = :ct_test_report_id
      AND ctc.is_active = 1
    ORDER BY
      ctc.caution_type
      , ctc.sort_order
      , ctc.ct_test_caution_id;
  `;

  const result = await conn.query(query, params);
  return result;
};


/**
 * findCtTestReportAttachmentsByReportId : CT 성적서 첨부파일 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : {company_id, ct_test_report_id}
 * @returns {Promise<Array<Object>>} : 첨부파일 목록
 */
export const findCtTestReportAttachmentsByReportId = async (conn, params) => {
  const query = `
    /* findCtTestReportAttachmentsByReportId : CT 성적서 첨부파일 목록 조회 */
    SELECT
      ctra.ct_test_report_attachment_id  AS ct_test_report_attachment_id,
      ctra.ct_test_report_id             AS ct_test_report_id,
      ctra.reference_id                  AS reference_id,
      ctra.caution_type                  AS caution_type,
      ctra.file_url                      AS file_url,
      ctra.file_name                     AS file_name,
      ctra.file_size                     AS file_size,
      ctra.file_mime_type                AS file_mime_type,
      ctra.file_category                 AS file_category,
      ctra.sort_order                    AS sort_order
    FROM
      ct_test_report_attachment AS ctra
    WHERE
      ctra.company_id = :company_id
      AND ctra.ct_test_report_id = :ct_test_report_id
      AND ctra.is_active = 1
    ORDER BY
      ctra.file_category,
      ctra.reference_id,
      ctra.sort_order;
  `;

  const result = await conn.query(query, params);
  return result;
};


/**
 * findTestReportHistorys : 이전 성적서 목록 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : {company_id, search_type, search_from, search_to, ct_no, search_content}
 * @returns {Promise<Array>} : 성적서 목록
 */
export const findTestReportHistorys = async (conn, params) => {

  let dateColumn = ''; // 기본값: REQ이며, CT의뢰일자로 조회.
  
  params.search_type === 'REC' 
  ? dateColumn = 'cr.ct_receipt_date' 
  : dateColumn = 'cr.ct_request_date';

  const queryParams = {
    company_id: params.company_id
  };

  let query = `
    /* findTestReportHistorys : 이전 성적서 목록 조회 */
    SELECT
      tr.ct_test_report_id                          AS ct_test_report_id,
      cr.ct_no                                      AS ct_no,
      cr.client_id                                  AS client_id,
      cr.sample_id                                  AS sample_id,
      cr.ct_lab_no                                  AS ct_lab_no,
      DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')   AS ct_request_date,
      DATE_FORMAT(cr.ct_receipt_date, '%Y-%m-%d')   AS ct_receipt_date,
      DATE_FORMAT(cr.ct_due_date, '%Y-%m-%d')       AS ct_due_date,
      tr.judgment_date                              AS judgment_date,
      tr.daily_judgment_id                          AS daily_judgment_id,
      tr.final_judgment_id                          AS final_judgment_id,
      tr.tester_id                                  AS tester_id,
      tester.user_name                              AS tester,
      tr.approver_id                                AS approver_id,
      approver.user_name                            AS approver
    FROM
      ct_test_report AS tr
    INNER JOIN
      ct_request AS cr
      ON tr.company_id = cr.company_id
      AND tr.ct_request_id = cr.ct_request_id
    LEFT JOIN
      user AS tester
      ON tr.tester_id = tester.user_id
      AND tr.company_id = tester.company_id
    LEFT JOIN
      user AS approver
      ON tr.approver_id = approver.user_id
      AND tr.company_id = approver.company_id
    WHERE
      tr.company_id = :company_id
      AND tr.is_active = 1
      AND cr.is_active = 1
      /*AND cr.ct_status IN ('IN_PROGRESS', 'COMPLETED')*/
  `;
  
  // 날짜 조건 처리
  if (params.date_from && params.date_to) {
    query += ` AND ${dateColumn} BETWEEN :date_from AND :date_to`;
    queryParams.date_from = params.date_from;
    queryParams.date_to = params.date_to;
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

  query += `
    ORDER BY
      cr.ct_request_date DESC,
      tr.ct_test_report_id DESC;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findTestReportTestItems : 특정 성적서의 시험 항목 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : { company_id, ct_test_report_id }
 * @returns {Promise<Array>} : 시험 항목 목록
 */
export const findTestReportTestItems = async (conn, queryParams) => {

  const query = `
    /* findTestReportTestItems : 특정 성적서의 시험 항목 조회 */
    SELECT
      ti.ct_test_item_id,
      ti.ct_test_report_id,
      ti.test_id,
      ts.test_standard_code,
      ts.test_standard_name,
      ts.test_guide,
      ts.result_type_option_id
    FROM
      ct_test_item AS ti
    LEFT JOIN
      test_standard AS ts
      ON ti.company_id = ts.company_id
      AND ti.test_id = ts.test_standard_id
    WHERE
      ti.company_id = :company_id
      AND ti.ct_test_report_id = :ct_test_report_id
      AND ti.is_active = 1
    ORDER BY
      ti.sort_order,
      ti.ct_test_item_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findRemarkHistorys : 시험 종합 의견 이력 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : {company_id, search_type, search_from, search_to, material_large_category_id, search_content}
 * @returns {Promise<Array>} : 종합 의견 목록
 */
export const findRemarkHistorys = async (conn, params) => {

  let dateColumn = ''; // 기본값: REQ이며, CT의뢰일자로 조회.
  
  params.search_type === 'REC' 
  ? dateColumn = 'cr.ct_receipt_date' 
  : dateColumn = 'cr.ct_request_date';

  const queryParams = {
    company_id: params.company_id
  };

  let query = `
    /* findRemarkHistorys : 시험 종합 의견 이력 조회 */
    SELECT
      ti.ct_test_item_id,
      ti.ct_test_report_id,
      cr.ct_no,
      ti.remark,
      mlc.material_large_category_name AS material_type,
      DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d') AS ct_request_date,
      DATE_FORMAT(cr.ct_receipt_date, '%Y-%m-%d') AS ct_receipt_date
    FROM
      ct_test_item AS ti
    INNER JOIN
      ct_test_report AS tr
      ON ti.ct_test_report_id = tr.ct_test_report_id
      AND ti.company_id = tr.company_id
    INNER JOIN
      ct_request AS cr
      ON tr.ct_request_id = cr.ct_request_id
      AND tr.company_id = cr.company_id
    LEFT JOIN
      test_standard AS ts
      ON ti.test_id = ts.test_standard_id
      AND ti.company_id = ts.company_id
    LEFT JOIN
      material_large_category AS mlc
      ON ts.material_large_category_id = mlc.material_large_category_id
      AND ts.company_id = mlc.company_id
    WHERE
      ti.company_id = :company_id
      AND ti.is_active = 1
      AND ti.remark IS NOT NULL
      AND ti.remark != ''
  `;

  // 날짜 조건 처리
  if (params.search_from && params.search_to) {
    query += ` AND ${dateColumn} BETWEEN :search_from AND :search_to`;
    queryParams.search_from = params.search_from;
    queryParams.search_to = params.search_to;
  }

  // 자재유형 조건 처리
  if (params.material_large_category_id) {
    query += ` AND mlc.material_large_category_id = :material_large_category_id`;
    queryParams.material_large_category_id = params.material_large_category_id;
  }

  // 검색어 조건 처리 (종합 의견 내용로 검색)
  if (params.search_content) {
    query += ` AND ti.remark LIKE :search_content `;
    queryParams.search_content = utils.sanitizeSearchPattern(params.search_content);
  }

  query += `
    ORDER BY 
      cr.ct_request_date DESC,
      ti.ct_test_item_id DESC
    `;

  const result = await conn.query(query, queryParams);
  return result;
};


/* ============================== 시험 기준 ============================== */
/**
 * findResultTypeOptions : 결과 유형 옵션 조회
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : {company_id}
 * @returns {Promise<Array>} : 결과 유형 옵션 목록
 */
export const findResultTypeOptions = async (conn, queryParams) => {

  const query = `
    /* findResultTypeOptions : 결과 유형 옵션 조회 */
    SELECT
      rto.result_type_option_id     AS result_type_option_id,
      rto.result_type_code          AS result_type_code,
      rto.result_type_name          AS result_type_name,
      rto.result_type_description   AS result_type_description,
      rto.requires_limits           AS requires_limits,
      rto.requires_target           AS requires_target,
      rto.requires_tolerance        AS requires_tolerance,
      rto.input_type                AS input_type,
      rto.sort_order                AS sort_order
    FROM
      result_type_option AS rto
    WHERE
      company_id = :company_id
      AND is_active = 1
    ORDER BY
      sort_order,
      result_type_option_id;
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * findTestStandards : 시험 기준 목록 조회 (전체)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} params : {company_id, search_keyword}
 * @returns {Promise<Array>} : 시험 기준 목록
 */
export const findTestStandards = async (conn, queryParams) => {

  let query= '';

  // 전체 목록 조회 쿼리
  query += `
    /* findTestStandards : 시험 기준 목록 조회 */
    SELECT
      ts.test_standard_id               AS test_standard_id,
      ts.test_standard_code             AS test_standard_code,
      ts.test_standard_name             AS test_standard_name,
      ts.test_guide                     AS test_guide,
      ts.material_large_category_id     AS material_large_category_id,
      mlc.material_large_category_name  AS material_large_category_name,
      TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM ts.upper_limit)) AS upper_limit,
      TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM ts.lower_limit)) AS lower_limit,
      ts.tolerance_percent              AS tolerance_percent,
      rto.result_type_option_id         AS result_type_option_id,
      ts.sort_order                     AS sort_order
    FROM
      test_standard AS ts
    LEFT JOIN
      material_large_category AS mlc
      ON ts.company_id = mlc.company_id
      AND ts.material_large_category_id = mlc.material_large_category_id
    LEFT JOIN
      result_type_option AS rto
      ON ts.company_id = rto.company_id
      AND ts.result_type_option_id = rto.result_type_option_id
    WHERE
      ts.company_id = :company_id
      AND ts.is_active = 1
  `;

  if (queryParams.material_large_category_name) {
    query += ` AND mlc.material_large_category_name LIKE :material_large_category_name`;
    queryParams.material_large_category_name = utils.sanitizeSearchPattern(queryParams.material_large_category_name);
  }

  if (queryParams.test_standard_code) {
    query += ` AND ts.test_standard_code LIKE :test_standard_code`;
    queryParams.test_standard_code = utils.sanitizeSearchPattern(queryParams.test_standard_code);
  }

  if (queryParams.test_standard_name) {
    query += ` AND ts.test_standard_name LIKE :test_standard_name`;
    queryParams.test_standard_name = utils.sanitizeSearchPattern(queryParams.test_standard_name);
  }

  if (queryParams.search_keyword) {
    query += ` AND (ts.test_standard_name LIKE :search_keyword
                OR ts.test_standard_code LIKE :search_keyword
                OR ts.test_guide LIKE :search_keyword)`;
    queryParams.search_keyword = utils.sanitizeSearchPattern(queryParams.search_keyword);
  }

  query += `
    ORDER BY
      ts.sort_order,
      ts.test_standard_id;
  `;
console.error(utils.debugQuery(query, queryParams));
  const result = await conn.query(query, queryParams);
  return result;
};


/* ============================== 파일 첨부 ============================== */
/**
 * saveCtTestReportAttachment : 성적서 첨부파일 INSERT
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : 첨부파일 객체
 * @returns {Promise<number>} : 생성된 행 수
 */
export const saveCtTestReportAttachment = async (conn, queryParams) => {

  const query = `
    /* saveCtTestReportAttachment : 성적서 첨부파일 INSERT */
    INSERT INTO ct_test_report_attachment (
      company_id,
      ct_test_report_id,
      reference_id,
      caution_type,
      file_url,
      file_name,
      file_size,
      file_mime_type,
      file_category,
      sort_order,
      created_by
    ) VALUES (
      :company_id,
      :ct_test_report_id,
      :reference_id,
      :caution_type,
      :file_url,
      :file_name,
      :file_size,
      :file_mime_type,
      :file_category,
      :sort_order,
      :created_by
    );
  `;

  const result = await conn.query(query, queryParams);
  return result.insertId.toString();
};


/**
 * saveCtTestReportAttachments : 성적서 첨부파일 배열 INSERT
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} attachmentsParam : 첨부파일 배열
 * @returns {Promise<number>} : 생성된 행 수
 */
export const saveCtTestReportAttachments = async (conn, attachmentsParam) => {

  if (!attachmentsParam || attachmentsParam.length === 0) {
    return 0;
  }

  const queryParams = {};
  const valuePlaceholders = attachmentsParam.map((item, idx) => {
    queryParams[`company_id_${idx}`] = item.company_id;
    queryParams[`ct_test_report_id_${idx}`] = item.ct_test_report_id;
    queryParams[`reference_id_${idx}`] = item.reference_id || null;
    queryParams[`caution_type_${idx}`] = item.caution_type || null;
    queryParams[`file_url_${idx}`] = item.file_url;
    queryParams[`file_name_${idx}`] = item.file_name;
    queryParams[`file_size_${idx}`] = item.file_size || null;
    queryParams[`file_mime_type_${idx}`] = item.file_mime_type || null;
    queryParams[`file_category_${idx}`] = item.file_category;
    queryParams[`sort_order_${idx}`] = item.sort_order !== undefined ? item.sort_order : idx + 1;
    queryParams[`created_by_${idx}`] = item.created_by;
    
    return `(
      :company_id_${idx},
      :ct_test_report_id_${idx},
      :reference_id_${idx},
      :caution_type_${idx},
      :file_url_${idx},
      :file_name_${idx},
      :file_size_${idx},
      :file_mime_type_${idx},
      :file_category_${idx},
      :sort_order_${idx},
      :created_by_${idx}
    )`;
  }).join(', ');

  const query = `
    /* saveCtTestReportAttachments : 성적서 첨부파일 배열 INSERT */
    INSERT INTO ct_test_report_attachment (
      company_id,
      ct_test_report_id,
      reference_id,
      caution_type,
      file_url,
      file_name,
      file_size,
      file_mime_type,
      file_category,
      sort_order,
      created_by
    ) VALUES ${valuePlaceholders};
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/**
 * deactivateCtTestReportAttachment : 기존 첨부파일 비활성화
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {*} queryParams : {company_id, ct_test_report_id, ct_test_report_attachment_id, deleted_by}
 * @returns {Promise<number>} : 수정된 행 수
 */
export const deactivateCtTestReportAttachment = async (conn, queryParams) => {
  const query = `
    /* deactivateCtTestReportAttachment : 기존 첨부파일 비활성화 */
    UPDATE 
      ct_test_report_attachment
    SET
      is_active = 0,
      deleted_at = NOW(),
      deleted_by = :deleted_by
    WHERE
      company_id = :company_id
      AND ct_test_report_id = :ct_test_report_id
      AND ct_test_report_attachment_id = :ct_test_report_attachment_id
      AND is_active = 1;
  `;

  const result = await conn.query(query, queryParams);
  return result.affectedRows;
};


/* ============================== 일정 현황 ============================== */