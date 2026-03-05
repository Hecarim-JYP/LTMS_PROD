/**
 * 파일명 : ctService.js
 * 용도 : CT 비즈니스 로직 처리
 * 최초등록 : 2026-01-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { getPool } from '../../../repository/connection.js';
import * as ctQuery from '../../../repository/sql/ltms/ct/ctQuery.js';
import * as approvalQuery from '../../../repository/sql/ltms/approval/approvalQuery.js';
import * as utils from '../../../common/utils.js';

/* ============================== 의뢰 ============================== */
/**
 * CT 의뢰 목록 조회
 */
export const getCtRequests = async (params) => {

  let conn;

  utils.checkRequiredParams(params, ['company_id']);

  const { 
    search_type
    , date_from
    , date_to
    , ct_no
    , ct_status
    , manager_type
    , manager
    , client_id
    , sample_id
    , ct_type
    , material_type
    , material_supplier_id
    , ct_lab_no
    , judgment_id
    , is_emergency_y
    , is_emergency_n
    , is_cpnp_y
    , is_cpnp_n
    , is_eng_y
    , is_eng_n
    , request_content
    , company_id
  } = params;

  // 비즈니스 로직: 날짜 검증
  if (date_from && date_to && new Date(date_from) > new Date(date_to)) {
    throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
  }

  const queryParams = {};
  queryParams.company_id = utils.toNumberOrNull(company_id);

  // 값이 있는 항목들만 queryParams에 추가
  if (search_type) queryParams.search_type = search_type;
  if (date_from) queryParams.date_from = date_from;
  if (date_to) queryParams.date_to = date_to;
  if (ct_no) queryParams.ct_no = ct_no;
  if (ct_status) queryParams.ct_status = ct_status;
  if (manager_type) queryParams.manager_type = manager_type;
  if (manager) queryParams.manager = manager;
  if (client_id) queryParams.client_id = client_id;
  if (sample_id) queryParams.sample_id = sample_id;
  if (ct_type) queryParams.ct_type = ct_type;
  if (material_type) queryParams.material_type = material_type;
  if (material_supplier_id) queryParams.material_supplier_id = material_supplier_id;
  if (ct_lab_no) queryParams.ct_lab_no = ct_lab_no;
  if (judgment_id) queryParams.judgment_id = judgment_id;
  if (is_emergency_y !== undefined) queryParams.is_emergency_y = is_emergency_y;
  if (is_emergency_n !== undefined) queryParams.is_emergency_n = is_emergency_n;
  if (is_cpnp_y !== undefined) queryParams.is_cpnp_y = is_cpnp_y;
  if (is_cpnp_n !== undefined) queryParams.is_cpnp_n = is_cpnp_n;
  if (is_eng_y !== undefined) queryParams.is_eng_y = is_eng_y;
  if (is_eng_n !== undefined) queryParams.is_eng_n = is_eng_n;
  if (request_content) queryParams.request_content = request_content;
  
  try {
    conn = await getPool().getConnection();

    const ctRequests = await ctQuery.findCtRequests(conn, queryParams);

    return {
      result: ctRequests
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
  
};

/**
 * CT 의뢰 상세 정보 조회
 */
export const getCtRequestById = async (params) => {

  utils.checkRequiredParams(params, ['company_id', 'ct_request_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    ct_request_id: utils.toNumberOrNull(params.ct_request_id),
  };
  
  let conn;

  try {
    conn = await getPool().getConnection();
    const { ctInfo, sampleInfo } = await ctQuery.findCtRequestById(conn, queryParams);

    const sampleData = sampleInfo.map(row => ({
      ...row,
      idx: row.idx ? row.idx.toString() : null, // id가 BigInt인 경우 문자열로 변환
    }));

    const result = {
      ctInfo: ctInfo,
      sampleInfo: sampleData
    };

    return {
      result: result
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getRecentCtNo : 최근 CT 번호 조회
 * --------------------------------------------
 * @returns : 최근 CT 번호 문자열
 */
export const getRecentCtNo = async(params) => {

  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
  };

  let conn;

  try {

    conn = await getPool().getConnection();
    const result = await ctQuery.findRecentCtNo(conn, queryParams); // 최근 CT 번호 조회
    const recentCtNo = result[0].recent_ct_no ? result[0].recent_ct_no.toString() : null; // 최근 CT 번호

    return {
      result: recentCtNo
    };
    
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * CT 의뢰 생성
 */
export const createCtRequest = async (params) => {

  // 1차 검증: 최상위 필수 파라미터 (requestInfo, sampleInfo 존재 여부 + 빈 배열/객체 체크)
  utils.checkRequiredParams(params, ['requestInfo', 'sampleInfo']);
  
  const { requestInfo, sampleInfo } = params;
  
  // 2차 검증: requestInfo 내부 필수 값 체크
  utils.checkRequiredParams(requestInfo, ['ct_no', 'ct_request_date', 'company_id']);

  let conn;

  const companyId = utils.toNumberOrNull(requestInfo.company_id);
  const userId = utils.toNumberOrNull(requestInfo.user_id);

  try {
    conn = await getPool().getConnection();

    // 트랜잭션 시작
    await conn.beginTransaction();

    const preparedRequestInfo = {
      ct_request_date: utils.formatDateOrNull(requestInfo.ct_request_date),                             // 의뢰일
      ct_no: utils.toStringOrEmpty(requestInfo.ct_no),                                                  // CT 번호
      ct_test_seq: utils.toNumberOrNull(requestInfo.ct_test_seq) ?? 1,                                  // CT 시험 차수 (기본값 1)
      client_id: utils.toNumberOrNull(requestInfo.client_id),                                           // 고객사 ID
      sample_id: utils.toNumberOrNull(requestInfo.sample_id),                                           // 샘플 ID
      ct_lab_no: utils.toStringOrEmpty(requestInfo.ct_lab_no),                                          // CT 의뢰번호
      sales_manager_id: utils.toNumberOrNull(requestInfo.sales_manager_id),                             // 영업담당자
      labs_manage_department_id: utils.toNumberOrNull(requestInfo.labs_manage_department_id),           // 제형담당부서
      labs_manager_id: utils.toNumberOrNull(requestInfo.labs_manager_id),                               // 제형담당자
      ct_type: utils.toStringOrEmpty(requestInfo.ct_type),                                              // CT 유형
      material_supplier_id: utils.toNumberOrNull(requestInfo.material_supplier_id),                     // 자재 공급사
      material_large_category_id: utils.toNumberOrNull(requestInfo.material_large_category_id),         // 자재 대분류
      material_sub_category: utils.toStringOrEmpty(requestInfo.material_sub_category),                  // 자재 중분류
      material_description: utils.toStringOrEmpty(requestInfo.material_description),                    // 자재 정보
      material_quantity: utils.toNumberOrNull(requestInfo.material_quantity),                           // 자재 수량
      sample_quantity: utils.toNumberOrNull(requestInfo.sample_quantity),                               // 샘플 수량
      desired_volume: utils.toNumberOrNull(requestInfo.desired_volume),                                 // 희망 용량
      desired_volume_unit_id: utils.toNumberOrNull(requestInfo.desired_volume_unit_id),                 // 희망 용량 단위 (기본값 mL)
      sleeve_length: utils.toNumberOrNull(requestInfo.sleeve_length),                                   // 슬리브 길이
      is_cutting: utils.toBooleanInt(requestInfo.is_cutting),                                           // 컷팅 여부
      is_include_tube: utils.toBooleanInt(requestInfo.is_include_tube),                                 // 튜브 포함 여부
      is_emergency: utils.toBooleanInt(requestInfo.is_emergency),                                       // 긴급여부
      is_cpnp: utils.toBooleanInt(requestInfo.is_cpnp),                                                 // CPNP여부
      is_eng: utils.toBooleanInt(requestInfo.is_eng),                                                   // ENG여부
      request_content: utils.toStringOrEmpty(requestInfo.request_content),                              // 의뢰 내용
      request_remark: utils.toStringOrEmpty(requestInfo.request_remark),                                // 의뢰 비고
      material_request_date: utils.formatDateOrNull(requestInfo.material_request_date),                 // 자재 요청일
      sample_type_id: utils.toNumberOrNull(requestInfo.sample_type_id),                                 // 샘플 층상 유형
      required_bulk_volume: utils.toNumberOrNull(requestInfo.required_bulk_volume),                     // 필요 벌크 용량
      required_bulk_volume_unit_id: utils.toNumberOrNull(requestInfo.required_bulk_volume_unit_id),     // 필요 벌크 용량 단위 (기본값 mL)
      request_bulk_volume: utils.toNumberOrNull(requestInfo.request_bulk_volume),                       // 의뢰 벌크 용량
      request_bulk_volume_unit_id: utils.toNumberOrNull(requestInfo.request_bulk_volume_unit_id),       // 의뢰 벌크 용량 단위 (기본값 mL)
      sample_etc: utils.toStringOrEmpty(requestInfo.sample_etc),                                        // 제형 연구소 기타 특이사항
      sample_remark: utils.toStringOrEmpty(requestInfo.sample_remark),                                  // 제형 연구소 비고
      ct_receipt_date: utils.formatDateOrNull(requestInfo.ct_receipt_date),                             // CT 접수일
      ct_due_date: utils.formatDateOrNull(requestInfo.ct_due_date),                                     // CT 완료 희망일
      ct_manager_id: utils.toNumberOrNull(requestInfo.ct_manager_id),                                   // CT 담당자
      is_ct_suspend: utils.toBooleanInt(requestInfo.is_ct_suspend),                                     // CT 보류 여부
      ct_suspend_reason: utils.toStringOrEmpty(requestInfo.ct_suspend_reason),                          // CT 보류 사유
      ct_status: utils.toStringOrEmpty(requestInfo.ct_status) ?? 'REQUESTED',                           // CT 진행상태 (기본값 REQUESTED)
      net_capacity: utils.toNumberOrNull(requestInfo.net_capacity),                                     // 적정표시용량(순용량)
      net_capacity_unit_id: utils.toNumberOrNull(requestInfo.net_capacity_unit_id),                     // 적정표시용량 단위 (기본값 mL)
      ct_manage_summary: utils.toStringOrEmpty(requestInfo.ct_manage_summary),                          // CT 관리사항 요약
      ct_manage_remark: utils.toStringOrEmpty(requestInfo.ct_manage_remark),                            // CT 관리사항 비고
      company_id: companyId,                                                      // 회사아이디는 1로 고정(코스메카코리아)
      created_by: userId                                                          // 사용자 ID
    };

    // 의뢰 정보 저장
    const ctRequestId = await ctQuery.saveCtRequest(conn, preparedRequestInfo);
    
    if (!ctRequestId) {
      throw new Error('CT 의뢰 정보 저장에 실패했습니다');
    }

    const preparedSamples = sampleInfo.map(sample => ({
      company_id: companyId,
      ct_request_id: ctRequestId,
      sample_lab_no: utils.toStringOrEmpty(sample.sample_lab_no),
      bulk_volume: utils.toNumberOrNull(sample.bulk_volume),
      bulk_volume_unit_id: utils.toNumberOrNull(sample.bulk_volume_unit_id),
      viscosity: utils.toNumberOrNull(sample.viscosity),
      hardness: utils.toNumberOrNull(sample.hardness),
      specific_gravity: utils.toNumberOrNull(sample.specific_gravity),
      ratio: utils.toNumberOrNull(sample.ratio),
      ratio_type_id: utils.toNumberOrNull(sample.ratio_type_id),
      significant: sample.significant ? JSON.stringify(sample.significant) : null,
      created_by: userId // 사용자 ID
    }));

    // 샘플 정보 저장
    const sampleResult = await ctQuery.saveCtSamples(conn, preparedSamples);

    let testReportResult = null;

    // CT 진행상태가 "ACCEPTED"인 경우 시험 성적서 생성 (같은 트랜잭션 내에서 실행)
    if(requestInfo.ct_status === "ACCEPTED") {
      const testReportParams = {
        ct_request_id: ctRequestId,
        company_id: companyId,
        created_by: userId
      };
      
      // 시험 성적서 생성 (conn 전달)
      testReportResult = await saveTestReportIfNotExists(conn, testReportParams);
    }
    
    await conn.commit();

    return {
      success: true,
      message: 'CT 의뢰가 성공적으로 등록되었습니다.',
      result: {
        ct_request_id: ctRequestId,
        test_report: testReportResult,
        sample_count: sampleResult.affectedRows,
        sample_ids: sampleResult.insertedIds
      }
    };

  } catch (err) {
    await conn.rollback();
    console.error('❌ CT 데이터 생성 실패:', err);
    throw err;

  } finally {
    if (conn) conn.release();
  }
  
};


/**
 * updateCtRequest : CT 의뢰 수정
 * --------------------------------------------
 * @param {*} params : 수정할 CT 의뢰 정보
 * @returns : 수정 결과 객체
 */
export const updateCtRequest = async (params) => {

  // 1차 검증: 최상위 필수 파라미터 (requestInfo 존재 여부)
  utils.checkRequiredParams(params, ['requestInfo']);

  const { requestInfo, sampleInfo } = params;
  const companyId = utils.toNumberOrNull(requestInfo.company_id);
  const userId = utils.toNumberOrNull(requestInfo.user_id);

  // 2차 검증: requestInfo 내부 필수 값 체크
  utils.checkRequiredValue(requestInfo.ct_request_id, 'ct_request_id');

  let conn;

  try {
    conn = await getPool().getConnection();

    // 트랜잭션 시작
    await conn.beginTransaction();

    const preparedRequestInfo = {
      ct_request_id: utils.toNumberOrNull(requestInfo.ct_request_id),                                   // CT 의뢰 아이디
      ct_request_date: utils.formatDateOrNull(requestInfo.ct_request_date),                             // 의뢰일
      ct_no: utils.toStringOrEmpty(requestInfo.ct_no),                                                  // CT 번호
      ct_test_seq: utils.toNumberOrNull(requestInfo.ct_test_seq) ?? 1,                                  // CT 시험 차수 (기본값 1)
      client_id: utils.toNumberOrNull(requestInfo.client_id),                                           // 고객사 ID
      sample_id: utils.toNumberOrNull(requestInfo.sample_id),                                           // 샘플 ID
      ct_lab_no: utils.toStringOrEmpty(requestInfo.ct_lab_no),                                          // CT 의뢰번호
      sales_manager_id: utils.toNumberOrNull(requestInfo.sales_manager_id),                             // 영업담당자
      labs_manage_department_id: utils.toNumberOrNull(requestInfo.labs_manage_department_id),           // 제형담당부서
      labs_manager_id: utils.toNumberOrNull(requestInfo.labs_manager_id),                               // 제형담당자
      ct_type: utils.toStringOrEmpty(requestInfo.ct_type),                                              // CT 유형
      material_supplier_id: utils.toNumberOrNull(requestInfo.material_supplier_id),                     // 자재 공급사
      material_large_category_id: utils.toNumberOrNull(requestInfo.material_large_category_id),         // 자재 대분류
      material_sub_category: utils.toStringOrEmpty(requestInfo.material_sub_category),                  // 자재 중분류
      material_description: utils.toStringOrEmpty(requestInfo.material_description),                    // 자재 정보
      material_quantity: utils.toNumberOrNull(requestInfo.material_quantity),                           // 자재 수량
      sample_quantity: utils.toNumberOrNull(requestInfo.sample_quantity),                               // 샘플 수량
      desired_volume: utils.toNumberOrNull(requestInfo.desired_volume),                                 // 희망 용량
      desired_volume_unit_id: utils.toNumberOrNull(requestInfo.desired_volume_unit_id),                 // 희망 용량 단위 (기본값 mL)
      sleeve_length: utils.toNumberOrNull(requestInfo.sleeve_length),                                   // 슬리브 길이
      is_cutting: utils.toBooleanInt(requestInfo.is_cutting),                                           // 컷팅 여부
      is_include_tube: utils.toBooleanInt(requestInfo.is_include_tube),                                 // 튜브 포함 여부
      is_emergency: utils.toBooleanInt(requestInfo.is_emergency),                                       // 긴급여부
      is_cpnp: utils.toBooleanInt(requestInfo.is_cpnp),                                                 // CPNP여부
      is_eng: utils.toBooleanInt(requestInfo.is_eng),                                                   // ENG여부
      request_content: utils.toStringOrEmpty(requestInfo.request_content),                              // 의뢰 내용
      request_remark: utils.toStringOrEmpty(requestInfo.request_remark),                                // 의뢰 비고
      material_request_date: utils.formatDateOrNull(requestInfo.material_request_date),                 // 자재 요청일
      sample_type_id: utils.toNumberOrNull(requestInfo.sample_type_id),                                 // 샘플 층상 유형
      required_bulk_volume: utils.toNumberOrNull(requestInfo.required_bulk_volume),                     // 필요 벌크 용량
      required_bulk_volume_unit_id: utils.toNumberOrNull(requestInfo.required_bulk_volume_unit_id),     // 필요 벌크 용량 단위 (기본값 mL)
      request_bulk_volume: utils.toNumberOrNull(requestInfo.request_bulk_volume),                       // 의뢰 벌크 용량
      request_bulk_volume_unit_id: utils.toNumberOrNull(requestInfo.request_bulk_volume_unit_id),       // 의뢰 벌크 용량 단위 (기본값 mL)
      sample_etc: utils.toStringOrEmpty(requestInfo.sample_etc),                                        // 제형 연구소 기타 특이사항
      sample_remark: utils.toStringOrEmpty(requestInfo.sample_remark),                                  // 제형 연구소 비고
      ct_receipt_date: utils.formatDateOrNull(requestInfo.ct_receipt_date),                             // CT 접수일
      ct_due_date: utils.formatDateOrNull(requestInfo.ct_due_date),                                     // CT 완료 희망일
      ct_manager_id: utils.toNumberOrNull(requestInfo.ct_manager_id),                                   // CT 담당자
      is_ct_suspend: utils.toBooleanInt(requestInfo.is_ct_suspend),                                     // CT 보류 여부
      ct_suspend_reason: utils.toStringOrEmpty(requestInfo.ct_suspend_reason),                          // CT 보류 사유
      ct_status: utils.toStringOrEmpty(requestInfo.ct_status) || 'REQUESTED',                           // CT 진행상태 (기본값 REQUESTED)
      net_capacity: utils.toNumberOrNull(requestInfo.net_capacity),                                     // 적정표시용량(순용량)
      net_capacity_unit_id: utils.toNumberOrNull(requestInfo.net_capacity_unit_id),                     // 적정표시용량 단위 (기본값 mL)
      ct_manage_summary: utils.toStringOrEmpty(requestInfo.ct_manage_summary),                          // CT 관리사항 요약
      ct_manage_remark: utils.toStringOrEmpty(requestInfo.ct_manage_remark),                            // CT 관리사항 비고
      company_id: companyId,                                                                            // 회사아이디는 1로 고정(코스메카코리아)
      updated_by: userId                                                                                // 사용자 ID
    };

    // 의뢰 정보 수정
    const ctRequestId = await ctQuery.updateCtRequest(conn, preparedRequestInfo);
    
    if (!ctRequestId) {
      throw new Error('CT 의뢰 정보 저장에 실패했습니다');
    }

    const deactivateCtParam = {
      company_id: companyId,
      ct_request_id: ctRequestId,
      deleted_by: userId
    };

    // 기존 샘플 정보 비활성화 (ct_request_id로 조회하여 is_active = 0으로 변경)
    await ctQuery.deactivateCtSamples(conn, deactivateCtParam);

    const preparedSamples = sampleInfo.map(sample => ({
      company_id: companyId,
      ct_request_id: ctRequestId,
      created_by: userId,
      sample_lab_no: utils.toStringOrEmpty(sample.sample_lab_no),
      bulk_volume: utils.toNumberOrNull(sample.bulk_volume),
      bulk_volume_unit_id: utils.toNumberOrNull(sample.bulk_volume_unit_id),
      viscosity: utils.toNumberOrNull(sample.viscosity),
      hardness: utils.toNumberOrNull(sample.hardness),
      specific_gravity: utils.toNumberOrNull(sample.specific_gravity),
      ratio: utils.toNumberOrNull(sample.ratio),
      ratio_type_id: utils.toNumberOrNull(sample.ratio_type_id),
      significant: sample.significant || null
    }));

    // 새로운 샘플 정보 저장 (INSERT)
    const sampleResult = await ctQuery.saveCtSamples(conn, preparedSamples);

    let testReportResult = null;
    
    // CT 진행상태가 "ACCEPTED"인 경우 시험 성적서 생성/수정 (같은 트랜잭션 내에서 실행)
    if(requestInfo.ct_status === "ACCEPTED") {
      const testReportParams = {
        ct_request_id: ctRequestId,
        company_id: companyId,
        created_by: userId
      };
      
      // 시험 성적서 생성 (이미 존재하면 skip)
      testReportResult = await saveTestReportIfNotExists(conn, testReportParams);
    }
        
    await conn.commit();

    return {
      success: true,
      message: 'CT 의뢰가 성공적으로 수정되었습니다.',
      result: {
        ct_request_id: ctRequestId,
        sample_count: sampleResult.affectedRows,
        sample_ids: sampleResult.insertedIds,
        test_report: testReportResult
      } 
    };

  } catch (err) {
    await conn.rollback();
    console.error('❌ CT 데이터 수정 실패:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};



/* ============================== 시험성적서 ============================== */
/* ============================== 시험성적서 헬퍼 함수 ============================== */
/**
 * saveTestReportIfNotExists : CT 의뢰가 접수(ACCEPTED)되면 시험 성적서 생성
 * --------------------------------------------
 * HOW : 
 *   1. ct_request_id로 기존 시험 성적서 존재 여부 확인
 *   2. 존재하지 않으면 INSERT만 실행
 *   3. 이미 존재하면 아무것도 하지 않음 (skip)
 * 
 * WHY :
 *   - ct_status가 ACCEPTED일 때만 호출됨
 *   - UPDATE는 별도 화면/API에서 처리해야 함
 *   - 재귀 호출 및 중복 업데이트 방지
 * 
 * @param {*} conn : 데이터베이스 연결 객체 (외부에서 트랜잭션 관리)
 * @param {*} params : {company_id, ct_request_id, created_by}
 * @returns {Promise<Object>} : 생성 결과
 */
const saveTestReportIfNotExists = async (conn, params) => {

  // 1차 검증: 필수 파라미터
  utils.checkRequiredParams(params, ['company_id', 'ct_request_id', 'created_by']);

  const { company_id, ct_request_id, created_by } = params;

  const queryParams = {
    company_id: utils.toNumberOrNull(company_id),
    ct_request_id: utils.toNumberOrNull(ct_request_id),
    created_by: utils.toNumberOrNull(created_by)
  };

  // 1. 기존 시험 성적서 존재 여부 확인 (ct_request_id 기준)
  const existingReport = await ctQuery.findTestReportByCtRequestId(conn, queryParams);

  if (existingReport > 0) {
    // 이미 존재하면 skip (아무것도 하지 않음)
    return {
      result: {
        ct_test_report_id: existingReport.ct_test_report_id,
        action: 'SKIP'
      }
    };
  }

  // 2. 존재하지 않으면 INSERT 실행
  const testReportId = await ctQuery.saveTestReport(conn, queryParams);
  
  return {
    result: {
      ct_test_report_id: testReportId,
      action: 'INSERT'
    }
  };
};


/**
 * parseTestReportParams : 성적서 파라미터 파싱
 * --------------------------------------------
 * @param {*} params : FormData로 전송된 파라미터
 * @returns {Object} : 파싱된 파라미터 객체
 */
const parseTestReportParams = (params) => {
  return {
    basicInfo: typeof params.basicInfo === 'string' ? JSON.parse(params.basicInfo) : params.basicInfo,
    requestInfo: typeof params.requestInfo === 'string' ? JSON.parse(params.requestInfo) : params.requestInfo,
    testItems: typeof params.testItems === 'string' ? JSON.parse(params.testItems) : (params.testItems || []),
    cautions: typeof params.cautions === 'string' ? JSON.parse(params.cautions) : params.cautions,
    judgment: typeof params.judgment === 'string' ? JSON.parse(params.judgment) : params.judgment,
    deletedAttachmentIds: typeof params.deletedAttachmentIds === 'string' 
      ? JSON.parse(params.deletedAttachmentIds) 
      : (params.deletedAttachmentIds || [])
  };
};

/**
 * processTestItemFiles : 시험 항목 파일 첨부 처리
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {Array} files : 업로드된 파일 배열
 * @param {number} testReportId : 성적서 ID
 * @param {number} itemId : 시험 항목 ID
 * @param {number} index : 시험 항목 인덱스
 * @param {Object} basicInfo : 기본 정보 객체
 * @returns {Promise<Array>} : 처리된 파일명 배열
 */
const processTestItemFiles = async (conn, files, testReportId, itemId, index, basicInfo) => {
  const processedFiles = [];
  const matchingFiles = files.filter(f => f.fieldname === `test_item_${index}`);

  if (matchingFiles.length > 0) {
    for (let fIndex = 0; fIndex < matchingFiles.length; fIndex++) {
      const file = matchingFiles[fIndex];

      const attachmentParam = {
        company_id: utils.toNumberOrNull(basicInfo.company_id),
        ct_test_report_id: testReportId,
        reference_id: itemId,
        caution_type: null,
        file_url: `/uploads/ct/${file.fieldname.split('_')[0]}/${file.filename}`,
        file_name: utils.decodeFileName(file.originalname),
        file_size: file.size,
        file_mime_type: file.mimetype,
        file_category: 'test',
        sort_order: fIndex + 1,
        created_by: utils.toNumberOrNull(basicInfo.user_id)
      };

      await ctQuery.saveCtTestReportAttachment(conn, attachmentParam);
      processedFiles.push(file.filename);
    }
  }

  return processedFiles;
};


/**
 * processCautionFiles : 주의사항 파일 첨부 처리
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {Array} files : 업로드된 파일 배열
 * @param {number} testReportId : 성적서 ID
 * @param {number} cautionId : 주의사항 ID
 * @param {number} index : 주의사항 인덱스
 * @param {string} type : 주의사항 타입 (volume, packaging, compatibility)
 * @param {Object} basicInfo : 기본 정보 객체
 * @returns {Promise<Array>} : 처리된 파일명 배열
 */
const processCautionFiles = async (conn, files, testReportId, cautionId, index, type, basicInfo) => {
  const processedFiles = [];
  const matchingFiles = files.filter(f => f.fieldname === `caution_${index}_${type}`);

  if (matchingFiles.length > 0) {
    for (let fIndex = 0; fIndex < matchingFiles.length; fIndex++) {
      const file = matchingFiles[fIndex];

      const attachmentParam = {
        company_id: utils.toNumberOrNull(basicInfo.company_id),
        ct_test_report_id: testReportId,
        reference_id: cautionId,
        caution_type: type,
        file_url: `/uploads/ct/${file.fieldname.split('_')[0]}/${file.filename}`,
        file_name: utils.decodeFileName(file.originalname),
        file_size: file.size,
        file_mime_type: file.mimetype,
        file_category: 'caution',
        sort_order: fIndex + 1,
        created_by: utils.toNumberOrNull(basicInfo.user_id)
      };

      await ctQuery.saveCtTestReportAttachment(conn, attachmentParam);
      processedFiles.push(file.filename);
    }
  }

  return processedFiles;
};


/**
 * processRemainingFiles : 남은 파일들 처리 (material 이미지 등)
 * --------------------------------------------
 * @param {*} conn : 데이터베이스 연결 객체
 * @param {Array} files : 업로드된 파일 배열
 * @param {Set} processedFileNames : 이미 처리된 파일명 Set
 * @param {number} testReportId : 성적서 ID
 * @param {Object} basicInfo : 기본 정보 객체
 * @returns {Promise<void>}
 */
const processRemainingFiles = async (conn, files, processedFileNames, testReportId, basicInfo) => {
  const remainingFiles = files.filter(f => !processedFileNames.has(f.filename));

  if (remainingFiles.length > 0) {
    const attachmentArray = remainingFiles.map((file, index) => ({
      company_id: utils.toNumberOrNull(basicInfo.company_id),
      ct_test_report_id: testReportId,
      reference_id: null,
      caution_type: null,
      file_url: `/uploads/ct/${file.fieldname.split('_')[0]}/${file.filename}`,
      file_name: utils.decodeFileName(file.originalname),
      file_size: file.size,
      file_mime_type: file.mimetype,
      file_category: file.fieldname.split('_')[0],
      sort_order: index + 1,
      created_by: utils.toNumberOrNull(basicInfo.user_id)
    }));

    await ctQuery.saveCtTestReportAttachments(conn, attachmentArray);
  }
};


/* ============================== 시험성적서 메인 함수 ============================== */
/**
 * getCtTestReports : CT 의뢰 시험 성적서 목록 조회
 * @param {*} params : {company_id, search_type, date_from, date_to, ct_no, ct_content}
 * @returns {Promise<Object>} : 시험 성적서 목록
 */
export const getCtTestReports = async (params) => {

  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    search_type: utils.toStringOrEmpty(params.search_type),
    date_from: utils.formatDateOrNull(params.date_from),
    date_to: utils.formatDateOrNull(params.date_to),
    ct_no: utils.toStringOrEmpty(params.ct_no),
    ct_content: utils.toStringOrEmpty(params.ct_content),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const testReportList = await ctQuery.findTestReports(conn, queryParams);

    return {
      result: testReportList
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getCtTestReportById : CT 의뢰 시험 성적서 상세 조회
 * --------------------------------------------
 * @param {*} params : {company_id, ct_request_id, ct_test_report_id}
 * @returns {Promise<Object>} : 시험 성적서 상세 정보
 */
export const getCtTestReportById = async (params) => {
  let conn;

  try {
    // 필수 파라미터 검증
    utils.checkRequiredParams(params, ['company_id', 'ct_request_id', 'ct_test_report_id']);

    // 데이터베이스 연결
    const pool = await getPool();
    conn = await pool.getConnection();

    const queryParams = {
      company_id: utils.toNumberOrNull(params.company_id),
      ct_request_id: utils.toNumberOrNull(params.ct_request_id),
      ct_test_report_id: utils.toNumberOrNull(params.ct_test_report_id)
    };

    // 1. 메인 성적서 정보 조회 (ct_test_report + ct_request 조인)
    const reportInfo = await ctQuery.findCtTestReportByRequestId(conn, queryParams);

    if (!reportInfo) {
      throw new Error('해당 CT 의뢰에 대한 성적서가 존재하지 않습니다.');
    }

    const reportParams = {
      company_id: queryParams.company_id,
      ct_test_report_id: reportInfo.ct_test_report_id
    };

    // 2. 시험 항목 목록 조회
    const testItems = await ctQuery.findCtTestItemsByReportId(conn, reportParams);

    // 3. 주의사항 목록 조회
    const cautions = await ctQuery.findCtTestCautionsByReportId(conn, reportParams);

    // 4. 첨부파일 목록 조회
    const attachments = await ctQuery.findCtTestReportAttachmentsByReportId(conn, reportParams);

    // 5. 주의사항을 타입별로 그룹화하고 첨부파일 매핑
    const cautionsByType = {
      volume: [],
      packaging: [],
      compatibility: []
    };

    cautions.forEach(caution => {
      // 해당 주의사항에 연결된 첨부파일 찾기
      const cautionAttachments = attachments.filter(
        att => att.file_category === 'caution' 
          && att.caution_type === caution.caution_type
          && att.reference_id === caution.ct_test_caution_id
      );

      const cautionData = {
        ct_test_caution_id: caution.ct_test_caution_id,
        section_title: caution.section_title,
        section_content: caution.section_content,
        images: cautionAttachments.map(att => ({
          ct_test_report_attachment_id: att.ct_test_report_attachment_id,
          file_url: att.file_url,
          file_name: att.file_name,
          file_size: att.file_size,
          file_mime_type: att.file_mime_type
        }))
      };

      if (caution.caution_type === 'volume') {
        cautionsByType.volume.push(cautionData);
      } else if (caution.caution_type === 'packaging') {
        cautionsByType.packaging.push(cautionData);
      } else if (caution.caution_type === 'compatibility') {
        cautionsByType.compatibility.push(cautionData);
      }
    });

    // 6. 시험 항목에 첨부파일 매핑
    const testItemsWithAttachments = testItems.map(item => {
      // 해당 시험 항목에 연결된 첨부파일 찾기
      const itemAttachments = attachments.filter(
        att => att.file_category === 'test'
          && att.reference_id === item.ct_test_item_id
      );

      return {
        ...item,
        attachments: itemAttachments.map(att => ({
          id: att.ct_test_report_attachment_id,
          url: att.file_url,
          name: att.file_name,
          size: att.file_size,
          mime_type: att.file_mime_type
        }))
      };
    });

    // 7. 의뢰 자재 이미지 조회 (첨부파일 테이블에서만 조회)
    const materialImages = [];
    
    // 첨부파일 테이블에서 의뢰 자재 이미지 조회
    const materialAttachments = attachments.filter(
      att => att.file_category === 'material'
    );
    
    materialAttachments.forEach(att => {
      materialImages.push({
        id: att.ct_test_report_attachment_id,
        url: att.file_url,
        name: att.file_name,
        size: att.file_size,
        mime_type: att.file_mime_type
      });
    });

    // 8. 응답 데이터 구성 (데이터베이스 컬럼명과 일치)
    return {
      result: {
        basicInfo: {
          ct_test_report_id: reportInfo.ct_test_report_id || "",
          ct_request_id: reportInfo.ct_request_id || "",
          report_status: reportInfo.report_status || "",
          ct_no: reportInfo.ct_no || "",
          client_id: reportInfo.client_id || "",
          client_name: reportInfo.client_name || "",
          sample_id: reportInfo.sample_id || "",
          sample_name: reportInfo.sample_name || "",
          sales_manager_id: reportInfo.sales_manager_id || "",
          sales_manager_name: reportInfo.sales_manager_name || "",
          labs_manager_id: reportInfo.labs_manager_id || "",
          labs_manager_name: reportInfo.labs_manager_name || "",
          desired_volume: reportInfo.desired_volume || "",
          ct_lab_no: reportInfo.ct_lab_no || "",
          ct_receipt_date: reportInfo.ct_receipt_date || "",
          ct_due_date: reportInfo.ct_due_date || "",
          ct_request_date: reportInfo.ct_request_date || "",
          ct_test_seq: reportInfo.ct_test_seq || "",
          sample_quantity: reportInfo.sample_quantity || "",
          sample_etc: reportInfo.sample_etc || "",
          sample_remark: reportInfo.sample_remark || "",
          request_content: reportInfo.request_content || ""
        },
        requestInfo: {
          material_supplier_id: reportInfo.material_supplier_id || "",
          material_supplier_name: reportInfo.material_supplier_name || "",
          material_description: reportInfo.material_description || "",
          material_image: materialImages.map(img => ({
            ct_test_report_attachment_id: img.id,
            file_url: img.url,
            file_name: img.name,
            file_size: img.size
          }))
        },
        testItems: testItemsWithAttachments.map(item => ({
          ct_test_item_id: item.ct_test_item_id,
          ct_test_report_id: item.ct_test_report_id,
          test_id: item.test_id || "",
          test_standard_code: item.test_standard_code || "",
          test_standard_name: item.test_standard_name || "",
          test_guide: item.test_guide || "",
          result_type: item.result_type || "",
          test_result: item.test_result || "",
          remark: item.remark || "",
          note: item.note || "",
          attached_image_url: item.attached_image_url || "",
          sort_order: item.sort_order || 0,
          attachments: item.attachments || []
        })),
        cautions: {
          volume: {
            sections: cautionsByType.volume.map(section => ({
              ct_test_caution_id: section.ct_test_caution_id,
              caution_type: 'volume',
              section_title: section.section_title || "",
              section_content: section.section_content || "",
              images: section.images.map(img => ({
                ct_test_report_attachment_id: img.ct_test_report_attachment_id,
                file_url: img.file_url,
                file_name: img.file_name,
                file_size: img.file_size
              }))
            }))
          },
          packaging: {
            sections: cautionsByType.packaging.map(section => ({
              ct_test_caution_id: section.ct_test_caution_id,
              caution_type: 'packaging',
              section_title: section.section_title || "",
              section_content: section.section_content || "",
              images: section.images.map(img => ({
                ct_test_report_attachment_id: img.ct_test_report_attachment_id,
                file_url: img.file_url,
                file_name: img.file_name,
                file_size: img.file_size
              }))
            }))
          },
          compatibility: {
            sections: cautionsByType.compatibility.map(section => ({
              ct_test_caution_id: section.ct_test_caution_id,
              caution_type: 'compatibility',
              section_title: section.section_title || "",
              section_content: section.section_content || "",
              images: section.images.map(img => ({
                ct_test_report_attachment_id: img.ct_test_report_attachment_id,
                file_url: img.file_url,
                file_name: img.file_name,
                file_size: img.file_size
              }))
            }))
          }
        },
        judgment: {
          judgment_date: reportInfo.judgment_date || "",
          daily_judgment_id: reportInfo.daily_judgment_id || "",
          daily_judgment_name: reportInfo.daily_judgment_name || "",
          final_judgment_id: reportInfo.final_judgment_id || "",
          final_judgment_name: reportInfo.final_judgment_name || "",
          tester_id: reportInfo.tester_id || "",
          tester_name: reportInfo.tester_name || "",
          approver_id: reportInfo.approver_id || "",
          approver_name: reportInfo.approver_name || ""
        }
      }
    };

  } catch (err) {
    console.error('getCtTestReportDetail 오류:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * createCtTestReport : 시험 성적서 생성
 * --------------------------------------------
 * HOW :
 *   1. ct_test_report INSERT (성적서 고유 데이터)
 *   2. ct_test_item 개별 INSERT (시험 항목 - PK 반환받아 파일 매핑)
 *   3. ct_test_caution 개별 INSERT (주의사항 - PK 반환받아 파일 매핑)
 *   4. ct_test_report_attachment INSERT (개별 항목에 연결된 파일)
 * 
 * WHY :
 *   - 개별 INSERT로 PK 반환받아 파일 매핑 정확성 보장
 *   - 헬퍼 함수로 공통 로직 재사용
 *   - 파일 첨부 시 정확한 reference_id 사용
 * 
 * @param {*} params : {basicInfo, requestInfo, testItems, cautions, judgment}
 * @param {*} files : multer에서 업로드된 파일 배열
 * @returns {Promise<Object>} : 생성 결과
 */
export const createCtTestReport = async (params, files = []) => {

  // FormData로 전송된 JSON 문자열 파싱 (헬퍼 함수 사용)
  const parsedParams = parseTestReportParams(params);

  // 1차 검증: 최상위 필수 파라미터
  utils.checkRequiredParams(parsedParams, ['basicInfo', 'requestInfo', 'judgment']);

  const { basicInfo, requestInfo, testItems = [], cautions, judgment } = parsedParams;

  // 2차 검증: basicInfo 내부 필수 값
  utils.checkRequiredParams(basicInfo, ['ct_request_id', 'company_id']);

  let conn;

  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // 이미 처리한 파일명을 저장하는 Set (중복 방지)
    const processedFileNames = new Set();

    // 1. ct_test_report INSERT (성적서 고유 데이터)
    const testReportParams = {
      company_id: utils.toNumberOrNull(basicInfo.company_id),
      ct_request_id: utils.toNumberOrNull(basicInfo.ct_request_id),
      report_status: utils.toStringOrEmpty(basicInfo.report_status),
      material_image: utils.toStringOrEmpty(requestInfo.material_image),
      judgment_date: utils.formatDateOrNull(judgment.judgment_date),
      daily_judgment_id: utils.toNumberOrNull(judgment.daily_judgment_id),
      final_judgment_id: utils.toNumberOrNull(judgment.final_judgment_id),
      tester_id: utils.toNumberOrNull(judgment.tester_id),
      approver_id: utils.toNumberOrNull(judgment.approver_id),
      created_by: utils.toNumberOrNull(basicInfo.user_id)
    };

    const testReportId = await ctQuery.saveTestReport(conn, testReportParams);

    // 2. ct_test_item 개별 INSERT 및 파일 첨부 처리
    if (testItems && testItems.length > 0) {
      for (let i = 0; i < testItems.length; i++) {
        const item = testItems[i];

        // 시험 항목 INSERT
        const insertData = {
          company_id: utils.toNumberOrNull(basicInfo.company_id),
          ct_test_report_id: utils.toNumberOrNull(testReportId),
          test_id: utils.toNumberOrNull(item.test_id),
          test_standard: utils.toStringOrEmpty(item.test_standard),
          test_result: utils.toStringOrEmpty(item.test_result),
          remark: utils.toStringOrEmpty(item.remark),
          note: utils.toStringOrEmpty(item.note),
          attached_image_url: utils.toStringOrEmpty(item.attached_image_url),
          sort_order: item.sort_order !== undefined ? item.sort_order : i + 1,
          created_by: utils.toNumberOrNull(basicInfo.user_id)
        };

        const itemId = await ctQuery.saveCtTestItem(conn, insertData);

        // 파일 첨부 처리 (헬퍼 함수 사용)
        const itemProcessedFiles = await processTestItemFiles(
          conn, files, testReportId, itemId, i, basicInfo
        );
        itemProcessedFiles.forEach(filename => processedFileNames.add(filename));
      }
    }

    // 3. ct_test_caution 개별 INSERT 및 파일 첨부 처리
    if (cautions) {
      const cautionTypes = ['volume', 'packaging', 'compatibility'];

      for (const type of cautionTypes) {
        if (cautions[type] && cautions[type].sections) {
          for (let i = 0; i < cautions[type].sections.length; i++) {
            const section = cautions[type].sections[i];

            // 주의사항 INSERT
            const insertData = {
              company_id: utils.toNumberOrNull(basicInfo.company_id),
              ct_test_report_id: utils.toNumberOrNull(testReportId),
              caution_type: type,
              section_title: utils.toStringOrEmpty(section.section_title),
              section_content: utils.toStringOrEmpty(section.section_content),
              sort_order: section.sort_order !== undefined ? section.sort_order : i + 1,
              created_by: utils.toNumberOrNull(basicInfo.user_id)
            };

            const cautionId = await ctQuery.saveCtTestCaution(conn, insertData);

            // 파일 첨부 처리 (헬퍼 함수 사용)
            const cautionProcessedFiles = await processCautionFiles(
              conn, files, testReportId, cautionId, i, type, basicInfo
            );
            cautionProcessedFiles.forEach(filename => processedFileNames.add(filename));
          }
        }
      }
    }

    // 4. 남은 기타 파일들 처리 (헬퍼 함수 사용)
    await processRemainingFiles(conn, files, processedFileNames, testReportId, basicInfo);

    await conn.commit();

    return {
      result: {
        ct_test_report_id: testReportId,
        message: '시험 성적서가 생성되었습니다.'
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
 * updateCtTestReport : 시험 성적서 수정
 * --------------------------------------------
 * HOW :
 *   1. ct_request UPDATE (기본 정보)
 *   2. ct_test_report UPDATE (성적서 고유 데이터)
 *   3. 기존 시험 항목 조회 후 비교:
 *      - 기존 ID 있음: UPDATE
 *      - 기존 ID 없음: INSERT (새 항목, PK 반환)
 *      - 화면에 없는 기존 ID: is_active = 0 (비활성화)
 *   4. 기존 주의사항 조회 후 비교:
 *      - 기존 ID 있음: UPDATE
 *      - 기존 ID 없음: INSERT (새 항목, PK 반환)
 *      - 화면에 없는 기존 ID: is_active = 0 (비활성화)
 *   5. 첨부파일은 새로 INSERT된 항목의 PK를 reference_id로 사용
 * 
 * WHY :
 *   - 삭제된 항목만 비활성화하여 파일 테이블 매핑 유지
 *   - 기존 항목 UPDATE로 데이터 일관성 및 이력 관리 개선
 *   - 개별 INSERT로 PK 반환받아 파일 매핑 정확성 보장
 * 
 * @param {*} params : {basicInfo, requestInfo, testItems, cautions, judgment}
 * @param {*} files : multer에서 업로드된 파일 배열
 * @returns {Promise<Object>} : 수정 결과
 */
export const updateCtTestReport = async (params, files = []) => {

  // FormData로 전송된 JSON 문자열 파싱 (헬퍼 함수 사용)
  const parsedParams = parseTestReportParams(params);
  
  // deletedAttachmentIds는 별도 처리
  const deletedAttachmentIds = typeof params.deletedAttachmentIds === 'string' 
                                ? JSON.parse(params.deletedAttachmentIds) 
                                : (params.deletedAttachmentIds || []);

  // 1차 검증: 최상위 필수 파라미터
  utils.checkRequiredParams(parsedParams, ['basicInfo', 'requestInfo', 'judgment']);

  const { basicInfo, requestInfo, testItems = [], cautions, judgment } = parsedParams;

  // 2차 검증: basicInfo 내부 필수 값
  utils.checkRequiredParams(basicInfo, ['ct_request_id', 'company_id']);

  let conn;

  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    // 1. ct_request UPDATE (기본 정보)
    const ctRequestParams = {
      company_id: utils.toNumberOrNull(basicInfo.company_id),
      ct_request_id: utils.toNumberOrNull(basicInfo.ct_request_id),
      ct_request_date: utils.formatDateOrNull(basicInfo.ct_request_date),
      ct_no: utils.toStringOrEmpty(basicInfo.ct_no),
      ct_test_seq: utils.toNumberOrNull(basicInfo.ct_test_seq),
      client_id: utils.toNumberOrNull(basicInfo.client_id),
      sample_id: utils.toNumberOrNull(basicInfo.sample_id),
      ct_lab_no: utils.toStringOrEmpty(basicInfo.ct_lab_no),
      sales_manager_id: utils.toNumberOrNull(basicInfo.sales_manager_id),
      labs_manager_id: utils.toNumberOrNull(basicInfo.formulation_manager_id),
      labs_manage_department_id: utils.toNumberOrNull(basicInfo.labs_manage_department_id),
      ct_type: utils.toStringOrEmpty(basicInfo.ct_type),
      material_supplier_id: utils.toNumberOrNull(requestInfo.supplier_id),
      material_large_category_id: utils.toNumberOrNull(basicInfo.material_large_category_id),
      material_sub_category: utils.toStringOrEmpty(basicInfo.material_sub_category),
      material_description: utils.toStringOrEmpty(requestInfo.material_info),
      material_quality: utils.toStringOrEmpty(basicInfo.material_quality),
      material_quantity: utils.toNumberOrNull(basicInfo.material_quantity),
      sample_quantity: utils.toNumberOrNull(basicInfo.sample_quantity),
      desired_volume: utils.toNumberOrNull(basicInfo.desired_volume),
      desired_volume_unit_id: utils.toNumberOrNull(basicInfo.desired_volume_unit_id),
      sleeve_length: utils.toNumberOrNull(basicInfo.sleeve_length),
      is_emergency: utils.toBooleanInt(basicInfo.is_emergency),
      is_cpnp: utils.toBooleanInt(basicInfo.is_cpnp),
      is_eng: utils.toBooleanInt(basicInfo.is_eng),
      request_content: utils.toStringOrEmpty(basicInfo.request_content),
      request_remark: utils.toStringOrEmpty(basicInfo.request_remark),
      material_request_date: utils.formatDateOrNull(basicInfo.material_request_date),
      sample_type_id: utils.toNumberOrNull(basicInfo.sample_type_id),
      required_bulk_volume: utils.toNumberOrNull(basicInfo.required_bulk_volume),
      required_bulk_volume_unit_id: utils.toNumberOrNull(basicInfo.required_bulk_volume_unit_id),
      request_bulk_volume: utils.toNumberOrNull(basicInfo.request_bulk_volume),
      request_bulk_volume_unit_id: utils.toNumberOrNull(basicInfo.request_bulk_volume_unit_id),
      net_capacity: utils.toNumberOrNull(basicInfo.net_capacity),
      net_capacity_unit_id: utils.toNumberOrNull(basicInfo.net_capacity_unit_id),
      sample_etc: utils.toStringOrEmpty(basicInfo.sample_etc),
      sample_remark: utils.toStringOrEmpty(basicInfo.formulation_notes),
      ct_receipt_date: utils.formatDateOrNull(basicInfo.ct_receipt_date),
      ct_due_date: utils.formatDateOrNull(basicInfo.ct_due_date),
      ct_manager_id: utils.toNumberOrNull(basicInfo.ct_manager_id),
      is_ct_suspend: utils.toBooleanInt(basicInfo.is_ct_suspend),
      ct_suspend_reason: utils.toStringOrEmpty(basicInfo.ct_suspend_reason),
      ct_status: utils.toStringOrEmpty(basicInfo.ct_status),
      ct_manage_summary: utils.toStringOrEmpty(basicInfo.ct_manage_summary),
      ct_manage_remark: utils.toStringOrEmpty(basicInfo.ct_manage_remark),
      updated_by: utils.toNumberOrNull(basicInfo.user_id)
    };

    //await ctQuery.updateCtRequest(conn, ctRequestParams);

    // 2. ct_test_report UPDATE (성적서 고유 데이터)
    const testReportParams = {
      company_id: utils.toNumberOrNull(basicInfo.company_id),
      ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id),
      report_status: utils.toStringOrEmpty(basicInfo.report_status),
      material_image: utils.toStringOrEmpty(requestInfo.material_image),
      judgment_date: utils.formatDateOrNull(judgment.judgment_date),
      daily_judgment_id: utils.toNumberOrNull(judgment.daily_judgment_id),
      final_judgment_id: utils.toNumberOrNull(judgment.final_judgment_id),
      tester_id: utils.toNumberOrNull(judgment.tester_id),
      approver_id: utils.toNumberOrNull(judgment.approver_id),
      updated_by: utils.toNumberOrNull(basicInfo.user_id)
    };

    await ctQuery.updateTestReport(conn, testReportParams);

    // 3. 기존 첨부파일 비활성화
    if (deletedAttachmentIds && deletedAttachmentIds.length > 0) {
      for(let i = 0; i < deletedAttachmentIds.length; i++) {
        const attachment = deletedAttachmentIds[i];

        const deleteParam = {
          company_id: utils.toNumberOrNull(basicInfo.company_id),
          ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id),
          ct_test_report_attachment_id: utils.toNumberOrNull(attachment.ct_test_report_attachment_id),
          deleted_by: utils.toNumberOrNull(basicInfo.user_id)
        };

        await ctQuery.deactivateCtTestReportAttachment(conn, deleteParam);
      }
    }

    // 이미 처리한 파일명을 저장하는 Set (중복 방지)
    const processedFileNames = new Set(); 

    // 4. 시험 항목 처리: 기존 데이터 조회 후 비교하여 UPDATE/INSERT/DELETE
    
    // 4-1. 기존 시험 항목 조회
    const testItemParams = {
      company_id: utils.toNumberOrNull(basicInfo.company_id),
      ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id)
    };
    const existingTestItems = await ctQuery.findCtTestItemsByReportId(conn, testItemParams);

    // 기존 항목 ID 목록
    const existingTestItemIds = existingTestItems.map(item => item.ct_test_item_id);
    
    // 화면에서 받은 항목의 ID 목록
    const receivedTestItemIds = testItems
      .filter(item => item.ct_test_item_id)
      .map(item => utils.toNumberOrNull(item.ct_test_item_id));

    // 4-2. 화면에 없는 기존 항목은 비활성화
    const deletedTestItemIds = existingTestItemIds.filter(id => !receivedTestItemIds.includes(id));
    for (const itemId of deletedTestItemIds) {
      await ctQuery.deactivateCtTestItem(conn, {
        company_id: utils.toNumberOrNull(basicInfo.company_id),
        ct_test_item_id: itemId,
        deleted_by: utils.toNumberOrNull(basicInfo.user_id)
      });
    }

    // 4-3. 시험 항목 UPDATE/INSERT 및 파일 업로드
    if (testItems && testItems.length > 0) {
      for (let i = 0; i < testItems.length; i++) {
        const item = testItems[i];
        let itemId;

        // ct_test_item_id가 있고 유효한 숫자이면 UPDATE, 없으면(null/undefined) INSERT
        if (item.ct_test_item_id && utils.toNumberOrNull(item.ct_test_item_id)) {
          // 기존 항목 UPDATE
          const updateData = {
            company_id: utils.toNumberOrNull(basicInfo.company_id),
            ct_test_item_id: utils.toNumberOrNull(item.ct_test_item_id),
            test_id: utils.toNumberOrNull(item.test_id),
            test_standard: utils.toStringOrEmpty(item.test_standard),
            test_result: utils.toStringOrEmpty(item.test_result),
            remark: utils.toStringOrEmpty(item.remark),
            note: utils.toStringOrEmpty(item.note),
            attached_image_url: utils.toStringOrEmpty(item.attached_image_url),
            sort_order: item.sort_order !== undefined ? item.sort_order : i + 1,
            updated_by: utils.toNumberOrNull(basicInfo.user_id)
          };

          await ctQuery.updateCtTestItem(conn, updateData);
          itemId = item.ct_test_item_id;
        } else {
          // 새 항목 INSERT
          const insertData = {
            company_id: utils.toNumberOrNull(basicInfo.company_id),
            ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id),
            test_id: utils.toNumberOrNull(item.test_id),
            test_standard: utils.toStringOrEmpty(item.test_standard),
            test_result: utils.toStringOrEmpty(item.test_result),
            remark: utils.toStringOrEmpty(item.remark),
            note: utils.toStringOrEmpty(item.note),
            attached_image_url: utils.toStringOrEmpty(item.attached_image_url),
            sort_order: item.sort_order !== undefined ? item.sort_order : i + 1,
            created_by: utils.toNumberOrNull(basicInfo.user_id)
          };

          itemId = await ctQuery.saveCtTestItem(conn, insertData);
        }

        // 파일 첨부 처리 (헬퍼 함수 사용)
        const itemProcessedFiles = await processTestItemFiles(
          conn, files, basicInfo.ct_test_report_id, itemId, i, basicInfo
        );
        itemProcessedFiles.forEach(filename => processedFileNames.add(filename));
      }
    }

    // 5. 주의사항 처리: 기존 데이터 조회 후 비교하여 UPDATE/INSERT/DELETE
    
    // 5-1. 기존 주의사항 조회
    const existingCautions = await ctQuery.findCtTestCautionsByReportId(conn, {
      company_id: utils.toNumberOrNull(basicInfo.company_id),
      ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id)
    });

    // 기존 주의사항 ID 목록
    const existingCautionIds = existingCautions.map(caution => caution.ct_test_caution_id);

    // 화면에서 받은 주의사항 ID 목록
    const receivedCautionIds = [];
    if (cautions) {
      const cautionTypes = ['volume', 'packaging', 'compatibility'];
      for (const type of cautionTypes) {
        if (cautions[type] && cautions[type].sections) {
          cautions[type].sections.forEach(section => {
            if (section.ct_test_caution_id) {
              receivedCautionIds.push(utils.toNumberOrNull(section.ct_test_caution_id));
            }
          });
        }
      }
    }

    // 5-2. 화면에 없는 기존 주의사항은 비활성화
    const deletedCautionIds = existingCautionIds.filter(id => !receivedCautionIds.includes(id));
    for (const cautionId of deletedCautionIds) {
      await ctQuery.deactivateCtTestCaution(conn, {
        company_id: utils.toNumberOrNull(basicInfo.company_id),
        ct_test_caution_id: cautionId,
        deleted_by: utils.toNumberOrNull(basicInfo.user_id)
      });
    }

    // 5-3. 주의사항 UPDATE/INSERT 및 파일 업로드
    if (cautions) {
      const cautionTypes = ['volume', 'packaging', 'compatibility'];

      for (const type of cautionTypes) {
        if (cautions[type] && cautions[type].sections) {
          for (let i = 0; i < cautions[type].sections.length; i++) {
            const section = cautions[type].sections[i];
            let cautionId;

            if (section.ct_test_caution_id) {
              // 기존 주의사항 UPDATE
              const updateData = {
                company_id: utils.toNumberOrNull(basicInfo.company_id),
                ct_test_caution_id: utils.toNumberOrNull(section.ct_test_caution_id),
                caution_type: type,
                section_title: utils.toStringOrEmpty(section.section_title),
                section_content: utils.toStringOrEmpty(section.section_content),
                sort_order: section.sort_order !== undefined ? section.sort_order : i + 1,
                updated_by: utils.toNumberOrNull(basicInfo.user_id)
              };

              await ctQuery.updateCtTestCaution(conn, updateData);
              cautionId = section.ct_test_caution_id;
            } else {
              // 새 주의사항 INSERT
              const insertData = {
                company_id: utils.toNumberOrNull(basicInfo.company_id),
                ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id),
                caution_type: type,
                section_title: utils.toStringOrEmpty(section.section_title),
                section_content: utils.toStringOrEmpty(section.section_content),
                sort_order: section.sort_order !== undefined ? section.sort_order : i + 1,
                created_by: utils.toNumberOrNull(basicInfo.user_id)
              };

              cautionId = await ctQuery.saveCtTestCaution(conn, insertData);
            }

            // 파일 첨부 처리 (헬퍼 함수 사용)
            const cautionProcessedFiles = await processCautionFiles(
              conn, files, basicInfo.ct_test_report_id, cautionId, i, type, basicInfo
            );
            cautionProcessedFiles.forEach(filename => processedFileNames.add(filename));
          }
        }
      }
    }

    // 6. 남은 기타 파일들 처리 (원료 이미지 material_image 등)
    const remainingFiles = files.filter(f => !processedFileNames.has(f.filename));

    if (remainingFiles.length > 0) {
      const attachmentArray = remainingFiles.map((file, index) => ({
        company_id: utils.toNumberOrNull(basicInfo.company_id),
        ct_test_report_id: utils.toNumberOrNull(basicInfo.ct_test_report_id),
        reference_id: utils.toNumberOrNull(file.fieldname.split('_')[1]) || null,
        caution_type: null,
        file_url: `/uploads/ct/${file.fieldname.split('_')[0]}/${file.filename}`,
        file_name: utils.decodeFileName(file.originalname),
        file_size: file.size,
        file_mime_type: file.mimetype,
        file_category: file.fieldname.split('_')[0], 
        sort_order: index + 1,
        created_by: utils.toNumberOrNull(basicInfo.user_id)
      }));
      await ctQuery.saveCtTestReportAttachments(conn, attachmentArray);
    }

    await conn.commit();

    return {
      result: {
        ct_test_report_id: basicInfo.ct_test_report_id,
        message: '시험 성적서가 수정되었습니다.'
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
 * getTestReportHistorys : 이전 성적서 목록 조회
 * --------------------------------------------
 * @param {*} params : {company_id, search_type, search_from, search_to, ct_no, search_content}
 * @returns {Promise<Object>} : 성적서 목록
 */
export const getTestReportHistorys = async (params) => {
  
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    search_type: utils.toStringOrEmpty(params.search_type),
    search_from: utils.formatDateOrNull(params.search_from),
    search_to: utils.formatDateOrNull(params.search_to),
    ct_no: utils.toStringOrEmpty(params.ct_no),
    search_content: utils.toStringOrEmpty(params.search_content)
  };
  
  // 비즈니스 로직: 날짜 검증 => 화면단에서 수행되나 재검증
  if (queryParams.search_from && queryParams.search_to 
      && new Date(queryParams.search_from) > new Date(queryParams.search_to)) {
    throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
  }

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await ctQuery.findTestReportHistorys(conn, queryParams);

    return {
      result: result
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getTestReportTestItems : 특정 성적서의 시험 항목 조회
 * --------------------------------------------
 * @param {*} params : {company_id, ct_test_report_id}
 * @returns {Promise<Object>} : 시험 항목 목록
 */
export const getTestReportTestItems = async (params) => {
  
  utils.checkRequiredParams(params, ['company_id', 'ct_test_report_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    ct_test_report_id: utils.toNumberOrNull(params.ct_test_report_id)
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await ctQuery.findTestReportTestItems(conn, queryParams);

    return {
      result: result
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getRemarkHistorys : 시험 종합 의견 이력 조회
 * --------------------------------------------
 * @param {*} params : {company_id, search_type, search_from, search_to, material_large_category_id, search_content}
 * @returns {Promise<Object>} : 종합 의견 목록
 */
export const getRemarkHistorys = async (params) => {
  
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    search_type: utils.toStringOrEmpty(params.search_type),
    search_from: utils.formatDateOrNull(params.search_from),
    search_to: utils.formatDateOrNull(params.search_to),
    material_large_category_id: utils.toStringOrEmpty(params.material_large_category_id),
    search_content: utils.toStringOrEmpty(params.search_content)
  };  

  // 비즈니스 로직: 날짜 검증
  if (queryParams.search_from && queryParams.search_to 
      && new Date(queryParams.search_from) > new Date(queryParams.search_to)) {
    throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
  }

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await ctQuery.findRemarkHistorys(conn, queryParams);

    return {
      result: result
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/* ============================== 시험 기준 ============================== */
/**
 * getResultTypeOptions : 시험 기준 결과 유형 옵션 조회
 * --------------------------------------------
 * @param {*} params : {company_id}
 * @returns {Promise<Object>} : 시험 기준 결과 유형 옵션
 */
export const getResultTypeOptions = async (params) => {
  
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id)
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const resultTypeOptions = await ctQuery.findResultTypeOptions(conn, queryParams);

    return {
      result: resultTypeOptions
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getTestStandards : 시험 기준 목록 조회 (전체)
 * --------------------------------------------
 * @param {*} params : {company_id, search_keyword}
 * @returns {Promise<Object>} : 시험 기준 목록
 */
export const getTestStandards = async (params) => {
  
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    material_large_category_name: utils.toStringOrEmpty(params.material_large_category_name),
    test_standard_code: utils.toStringOrEmpty(params.test_standard_code),
    test_standard_name: utils.toStringOrEmpty(params.test_standard_name),
    search_keyword: utils.toStringOrEmpty(params.search_keyword)
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await ctQuery.findTestStandards(conn, queryParams);

    const testStandards = result.map(row => ({
      test_standard_id : row.test_standard_id ? row.test_standard_id.toString() : null,
      test_standard_code: row.test_standard_code,
      test_standard_name: row.test_standard_name,
      test_guide: row.test_guide,
      result_type_option_id: row.result_type_option_id,
      material_large_category_id: row.material_large_category_id,
      material_large_category_name: row.material_large_category_name,
      upper_limit: row.upper_limit,
      lower_limit: row.lower_limit,
      sort_order: row.sort_order
    }));

    return {
      result: testStandards
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/* ============================== 일정 현황 ============================== */