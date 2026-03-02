/**
 * 파일명 : commonService.js
 * 용도 : 공통 비즈니스 로직 처리
 * 최초등록 : 2026-02-25 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { getPool } from '../../../repository/connection.js';
import * as commonQuery from '../../../repository/sql/ltms/common/commonQuery.js';
import * as utils from '../../../common/utils.js';


/**
 * getRequests : 자재 접수가 되지 않은 의뢰 목록 조회 서비스 함수
 * --------------------------------------------------------
 * 검색조건을 기준으로 자재 접수가 되지 않은 의뢰 목록을 조회하는 서비스 함수입니다.
 * @param {*} params : 조회에 필요한 파라미터 객체 {company_id, query(검색어)}
 * @returns {Promise<object>} - 조회 결과 객체
 */
export const getRequestsAwaitingMaterialReceipt = async (params) => {

  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id)
  };

  // 검색어
  const searchQuery = utils.toStringOrEmpty(params.query).trim();

  /**
   * 검색 조건 생성 (예: 검색어가 있을 경우 제목 또는 내용에서 검색)
   * 현재 의뢰번호, 랩넘버로만 구현되어 있으나 추후 담당자 이름 및 의뢰자 이름으로도 검색할 수 있도록 확장 예정
   */
  const searchCondition = utils.getSearchCondition(searchQuery);

  queryParams.searchQuery = searchQuery;
  queryParams.searchCondition = searchCondition;

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await commonQuery.findRequestsAwaitingMaterialReceipt(conn, queryParams);

    const requests = result.map(row => ({
      request_type: row.request_type,
      request_id: row.request_id,
      request_date: row.request_date,
      request_no: row.request_no,
      lab_no: row.lab_no,
      sample_id: row.sample_id,
      sample_name: "샘플명",
      client_id: row.client_id,
      client_name: "의뢰자명"
    }));

    return {
      result: requests
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * receiveMaterial : 자재 접수 서비스 함수
 * --------------------------------------------------------
 * 자재 접수 정보를 데이터베이스에 저장하는 서비스 함수입니다.
 * @param {*} params : 자재 접수에 필요한 파라미터 객체 {company_id, request_type, request_id, receipt_date, received_by}
 * @returns {Promise<object>} - 처리 결과 객체
 */
export const receiveMaterial = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'request_type', 'request_id', 'receipt_date', 'received_by']);

  // 의뢰 유형 검증을 위해 지원하는 의뢰 유형 목록 정의
  const requestTypes = ['CT', 'INTERNAL', 'EXTERNAL', 'PRESERVATIVE'];

  // 날짜 형식 검증
  if (params.receipt_date === null) {
    throw new Error("유효하지 않은 날짜 형식입니다. 자재 접수일자는 'YYYY-MM-DD' 형식이어야 합니다.");
  }

  // 의뢰 유형 검증
  if (!requestTypes.includes(params.request_type)) {
    throw new Error(`지원하지 않는 요청 유형 : ${params.request_type}`);
  }

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await commonQuery.receiveMaterial(conn, params);

    return {
      result: result
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};