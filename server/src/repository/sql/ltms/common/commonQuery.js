/**
 * 파일명 : commonQuery.js
 * 용도 : 공통 데이터베이스 쿼리 처리
 * 최초등록 : 2026-02-25 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import * as utils from '../../../../common/utils.js';


/**
 * findRequestsAwaitingMaterialReceipt : 자재 접수가 되지 않은 의뢰 목록 조회
 * --------------------------------------------------------
 * WHAT : 회사 ID를 기준으로 의뢰 목록을 조회하는 SQL 쿼리를 실행하는 함수입니다.
 * @param {*} conn - 데이터베이스 연결 객체
 * @param {*} params - 쿼리 실행에 필요한 파라미터 객체 (company_id 포함)
 * @returns {Promise<Array>} - 조회된 의뢰 목록 결과 배열
 * 추후 타 모듈과 통합하여 사용할 경우 UNION ALL 형태로 사용할 수 있도록 쿼리를 작성할 예정입니다.
 * 예시)
 * SELECT ... FROM ct_request WHERE company_id = :company_id AND is_active = 1
 * UNION ALL
 * SELECT ... FROM internal_request WHERE company_id = :company_id AND is_active = 1
 * ORDER BY created_at DESC
 */
export const findRequestsAwaitingMaterialReceipt = async (conn, params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id)
  };

  /**
   * 검색 조건 생성 (예: 검색어가 있을 경우 제목 또는 내용에서 검색)
   */
  let ctWhere = ''; // CT 의뢰 검색 조건 초기화

  if (params.searchCondition === 'requestNo') {
    ctWhere += 'AND cr.ct_no LIKE :searchQuery';
    queryParams.searchQuery = utils.sanitizeSearchPattern(params.searchQuery);
  }

  if (params.searchCondition === 'labNo') {
    ctWhere += 'AND cr.ct_lab_no LIKE :searchQuery';
    queryParams.searchQuery = utils.sanitizeSearchPattern(params.searchQuery);
  }

  if (params.searchCondition === 'name') {
    ctWhere += '';
  }

  if (params.searchCondition === 'general') {
    ctWhere += '';
  }

  // 추후 모듈 통합 검색 기능 필요 시 구현
  // let internalWhere = ''; // 내부 의뢰 검색 조건 초기화
  // let externalWhere = ''; // 외부 의뢰 검색 조건 초기화
  // let preservativeWhere = ''; // 방부제 의뢰 검색 조건 초기화

  const query = `
    /* findRequestsAwaitingMaterialReceipt : 자재 접수가 되지 않은 의뢰 목록 조회 */
    SELECT 
      request_type,
      request_id,
      request_date,
      request_no,
      lab_no,
      sample_id,
      sample_name,
      client_id,
      client_name
    FROM 
      (
        SELECT 
          'CT'                                          AS request_type,
          cr.ct_request_id                              AS request_id,
          DATE_FORMAT(cr.ct_request_date, '%Y-%m-%d')   AS request_date,
          cr.ct_no                                      AS request_no,
          cr.ct_lab_no                                  AS lab_no,
          cr.sample_id                                  AS sample_id,
          ''                                            AS sample_name,
          cr.client_id                                  AS client_id,
          ''                                            AS client_name
        FROM 
          ct_request cr
        WHERE 
          cr.company_id = :company_id
          AND cr.is_active = 1
          ${ctWhere}
      ) requests
    ORDER BY
    requests.request_date DESC
  `;

  const result = await conn.query(query, queryParams);
  return result;
};


/**
 * receiveMaterial : 자재 접수 처리
 * --------------------------------------------------------
 * 자재 접수 정보를 데이터베이스에 저장하는 SQL 쿼리를 실행하는 함수입니다.
 * @param {*} conn - 데이터베이스 연결 객체
 * @param {*} params - 쿼리 실행에 필요한 파라미터 객체 {company_id, request_type, request_id, receipt_date, received_by}
 * @returns {Promise<object>} - 처리 결과 객체
 */
export const receiveMaterial = async (conn, params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    request_type: utils.toStringOrEmpty(params.request_type),
    request_id: utils.toNumberOrNull(params.request_id),
    receipt_date: utils.formatDateOrNull(params.receipt_date),
    received_by: utils.toNumberOrNull(params.received_by)
  };

  let query;

  if (params.request_type === 'CT') {
    query = `
      /* receiveMaterial : CT 자재 접수 처리 */
      UPDATE 
        ct_request
      SET
        material_request_date = :receipt_date,
        updated_by = :received_by
      WHERE 
        company_id = :company_id
        AND ct_request_id = :request_id
    `;
  } else if (params.request_type === 'INTERNAL') {
  } else if (params.request_type === 'EXTERNAL') {
  } else if (params.request_type === 'PRESERVATIVE') {
  }

  const result = await conn.query(query, queryParams);
  return result.affectedRows.toString();
};