/**
 * 파일명 : approvalService.js
 * 용도 : 결재선 비즈니스 로직 처리
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { getPool } from '../../../repository/connection.js';
import * as utils from '../../../common/utils.js';
import * as approvalQuery from '../../../repository/sql/ltms/approval/approvalQuery.js';

/**
 * getApprovalLines : 결재선 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터
 * @returns : 결재선 목록 배열
 */
export const getApprovalLines = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_document_id: utils.toNumberOrNull(params.approval_document_id),
    approver_id: utils.toNumberOrNull(params.approver_id),
    approval_status: params.approval_status || null,
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.selectApprovalLines(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * getApprovalLineById : 결재선 상세 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터
 * @returns : 결재선 상세 정보
 */
export const getApprovalLineById = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_line_id: utils.toNumberOrNull(params.approval_line_id),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.selectApprovalLineById(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * createApprovalLine : 결재선 생성
 * --------------------------------------------
 * @param {*} params : 생성 파라미터
 * @returns : 생성 결과
 */
export const createApprovalLine = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_document_id: utils.toNumberOrNull(params.approval_document_id),
    step: utils.toNumberOrNull(params.step) || 1,
    role_id: utils.toNumberOrNull(params.role_id),
    approver_id: utils.toNumberOrNull(params.approver_id),
    approval_status: params.approval_status || 'PENDING',
    approval_date: params.approval_date || null,
    approval_comment: params.approval_comment || null,
    is_active: utils.toNumberOrNull(params.is_active) || 1,
    sort_order: utils.toNumberOrNull(params.sort_order) || 1,
    created_by: utils.toNumberOrNull(params.created_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.insertApprovalLine(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * updateApprovalLine : 결재선 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns : 수정 결과
 */
export const updateApprovalLine = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_line_id: utils.toNumberOrNull(params.approval_line_id),
    step: utils.toNumberOrNull(params.step) || 1,
    role_id: utils.toNumberOrNull(params.role_id),
    approver_id: utils.toNumberOrNull(params.approver_id),
    approval_status: params.approval_status || 'PENDING',
    approval_date: params.approval_date || null,
    approval_comment: params.approval_comment || null,
    sort_order: utils.toNumberOrNull(params.sort_order) || 1,
    updated_by: utils.toNumberOrNull(params.updated_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.updateApprovalLine(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * deleteApprovalLine : 결재선 삭제 (Soft Delete)
 * --------------------------------------------
 * @param {*} params : 삭제 파라미터
 * @returns : 삭제 결과
 */
export const deleteApprovalLine = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_line_id: utils.toNumberOrNull(params.approval_line_id),
    deleted_by: utils.toNumberOrNull(params.deleted_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.deleteApprovalLine(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * getApprovalLineTemplates : 결재선 템플릿 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터
 * @returns : 결재선 템플릿 목록 배열
 */
export const getApprovalLineTemplates = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    document_type: params.document_type || null,
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.selectApprovalLineTemplates(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * getApprovalLineTemplateById : 결재선 템플릿 상세 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터
 * @returns : 결재선 템플릿 상세 정보
 */
export const getApprovalLineTemplateById = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_line_template_id: utils.toNumberOrNull(params.approval_line_template_id),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.selectApprovalLineTemplateById(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * createApprovalLineTemplate : 결재선 템플릿 생성
 * --------------------------------------------
 * @param {*} params : 생성 파라미터
 * @returns : 생성 결과
 */
export const createApprovalLineTemplate = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    document_type: params.document_type,
    step: utils.toNumberOrNull(params.step) || 1,
    role_id: utils.toNumberOrNull(params.role_id),
    approver_id: utils.toNumberOrNull(params.approver_id),
    is_active: utils.toNumberOrNull(params.is_active) || 1,
    sort_order: utils.toNumberOrNull(params.sort_order) || 1,
    created_by: utils.toNumberOrNull(params.created_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.insertApprovalLineTemplate(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * updateApprovalLineTemplate : 결재선 템플릿 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns : 수정 결과
 */
export const updateApprovalLineTemplate = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_line_template_id: utils.toNumberOrNull(params.approval_line_template_id),
    document_type: params.document_type,
    step: utils.toNumberOrNull(params.step) || 1,
    role_id: utils.toNumberOrNull(params.role_id),
    approver_id: utils.toNumberOrNull(params.approver_id),
    sort_order: utils.toNumberOrNull(params.sort_order) || 1,
    updated_by: utils.toNumberOrNull(params.updated_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.updateApprovalLineTemplate(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * deleteApprovalLineTemplate : 결재선 템플릿 삭제 (Soft Delete)
 * --------------------------------------------
 * @param {*} params : 삭제 파라미터
 * @returns : 삭제 결과
 */
export const deleteApprovalLineTemplate = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id) || 1,
    approval_line_template_id: utils.toNumberOrNull(params.approval_line_template_id),
    deleted_by: utils.toNumberOrNull(params.deleted_by),
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.deleteApprovalLineTemplate(conn, queryParams);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/**
 * saveApprovalLineTemplates : 결재선 템플릿 일괄 저장 (배열 처리)
 * --------------------------------------------
 * @param {*} params : 저장 파라미터 (company_id, document_type, templates 배열)
 * @returns : 저장 결과
 */
export const saveApprovalLineTemplates = async (params) => {

  const companyId = utils.toNumberOrNull(params.company_id) || 1;
  const documentType = params.document_type;
  const templates = params.templates || [];
  const userId = utils.toNumberOrNull(params.user_id);

  let conn;

  try {
    conn = await getPool().getConnection();
    
    // 트랜잭션 시작
    await conn.beginTransaction();

    // 병렬 처리를 위한 Promise 배열 생성
    const promises = templates.map(async (template) => {
      const templateParams = {
        company_id: companyId,
        approval_line_template_id: template.approval_line_template_id || null,
        document_type: documentType,
        step: utils.toNumberOrNull(template.step) || 1,
        role_id: utils.toNumberOrNull(template.role_id),
        approver_id: utils.toNumberOrNull(template.approver_id),
        is_active: utils.toNumberOrNull(template.is_active) || 1,
        sort_order: utils.toNumberOrNull(template.sort_order) || 1,
        created_by: userId,
        updated_by: userId
      };

      // approval_line_template_id 존재 여부에 따라 UPDATE 또는 INSERT 실행
      if (template.approval_line_template_id) {
        // 기존 데이터: UPDATE
        await approvalQuery.updateApprovalLineTemplate(conn, templateParams);
        return {
          type: 'updated',
          data: {
            approval_line_template_id: template.approval_line_template_id,
            step: template.step,
            status: 'success'
          }
        };
      } else {
        // 새로운 데이터: INSERT
        await approvalQuery.insertApprovalLineTemplate(conn, templateParams);
        return {
          type: 'inserted',
          data: {
            step: template.step,
            status: 'success'
          }
        };
      }
    });

    // 모든 Promise를 병렬로 실행
    const allResults = await Promise.all(promises);

    // 결과를 분류
    const results = {
      inserted: [],
      updated: []
    };

    allResults.forEach(result => {
      if (result) {
        if (result.type === 'inserted') {
          results.inserted.push(result.data);
        } else if (result.type === 'updated') {
          results.updated.push(result.data);
        }
      }
    });

    // 트랜잭션 커밋
    await conn.commit();

    return results;
  } catch (err) {
    // 트랜잭션 롤백
    if (conn) {
      await conn.rollback();
    }
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


/* ============================== 결재 ============================== */
/**
 * createApproval : 결재 문서 및 결재선 생성 (공통 함수)
 * --------------------------------------------
 * HOW : 
 *   1. documentType에 해당하는 결재 템플릿 조회
 *   2. approval_document 테이블에 결재 문서 생성
 *   3. 템플릿의 결재선 정보를 기반으로 approval_line 생성
 * 
 * WHY :
 *   - CT 의뢰, 시험 성적서 등 모든 문서 유형에서 공통으로 사용
 *   - 결재 템플릿 기반 자동 생성으로 확장성 및 유지보수성 향상
 * 
 * @param {Object} conn - 데이터베이스 커넥션 객체
 * @param {Object} params - 결재 생성 파라미터
 * @param {number} params.company_id - 회사 ID
 * @param {string} params.document_type - 문서 유형 (CT_REQ, CT_TEST 등)
 * @param {number} params.document_id - 문서 ID (ct_request_id, ct_test_report_id 등)
 * @param {string} params.document_number - 문서 번호 (ct_no, test_report_no 등)
 * @param {number} params.requester_id - 요청자 ID (user_id)
 * @param {Date|string} [params.request_date] - 요청 일자 (선택, 기본값: 현재 날짜)
 * @param {number} params.created_by - 생성자 ID
 * 
 * @returns {Promise<Object>} 생성된 결재 문서 정보
 * @returns {boolean} returns.success - 성공 여부
 * @returns {number} returns.approval_document_id - 생성된 결재 문서 ID
 * @returns {number} returns.approval_lines_count - 생성된 결재선 개수
 * @returns {string} returns.document_type - 문서 유형
 * @returns {string} returns.document_title - 생성된 결재 문서 제목
 * 
 * @throws {Error} 필수 파라미터가 누락된 경우
 * @throws {Error} 결재 템플릿이 없는 경우
 * @throws {Error} 결재 문서 생성에 실패한 경우
 * @throws {Error} 결재선 템플릿이 없는 경우
 * @throws {Error} 결재선 생성에 실패한 경우
 * 
 * @example
 * // CT 의뢰 결재 생성
 * await createApproval(conn, {
 *   company_id: requestInfo.company_id,
 *   document_type: 'CT_REQ',
 *   document_id: ctRequestId,
 *   document_number: requestInfo.ct_no,
 *   requester_id: requestInfo.ct_manager_id,
 *   request_date: requestInfo.reg_date,
 *   created_by: userId
 * });
 * 
 * @example
 * // CT 시험 결재 생성
 * await createApproval(conn, {
 *   company_id: testReportInfo.company_id,
 *   document_type: 'CT_TEST',
 *   document_id: ctTestReportId,
 *   document_number: testReportInfo.test_report_no,
 *   requester_id: testReportInfo.test_manager_id,
 *   created_by: userId
 * });
 * 
 */
export const createApproval = async (params) => {

  /**
   * 1차 검증: 필수 파라미터 체크
   */
  utils.checkRequiredParams(params, [
    'company_id',
    'document_type',
    'document_id',
    'document_number',
    'requester_id'
  ]);

  let conn;

  try {

    conn = await getPool().getConnection();

    await conn.beginTransaction();

    const {
        company_id,
        document_type,
        document_id,
        document_number,
        requester_id
      } = params;

      const templateParams = {
        company_id: utils.toNumberOrNull(company_id),
        document_type: utils.toStringOrEmpty(document_type)
      };

      // 1. 결재 템플릿 조회
      const approvalTemplates = await approvalQuery.findApprovalTemplates(conn, templateParams);

      if (!approvalTemplates || approvalTemplates.length === 0) {
        throw new Error(`${document_type} 결재 템플릿이 없습니다. 결재 문서가 생성되지 않습니다.`);
      }

      // 첫 번째 템플릿 사용 (기본 템플릿)
      const template = approvalTemplates[0];
      const approvalTemplateId = template.approval_template_id;
      const templateTitle = template.template_title || '결재';

      // 2. 결재 문서 생성 (approval_document 테이블에 삽입)
      const documentParams = {
        company_id: utils.toNumberOrNull(company_id),
        approval_template_id: utils.toNumberOrNull(approvalTemplateId),
        document_type: utils.toStringOrEmpty(document_type),
        document_id: utils.toNumberOrNull(document_id),
        document_title: `${templateTitle}_${document_number}`,
        requester_id: utils.toNumberOrNull(requester_id),
        current_step: 1,
        approval_status: 'PENDING',
        created_by: utils.toNumberOrNull(requester_id)
      };

      // 결재 문서 생성 후 생성된 approval_document_id 반환
      const approvalDocumentId = await approvalQuery.saveApprovalDocument(conn, documentParams);
      
      if (!approvalDocumentId) {
        throw new Error('결재 문서 생성에 실패했습니다');
      }

      const lineParams = {
        company_id: utils.toNumberOrNull(company_id),
        approval_template_id: utils.toNumberOrNull(approvalTemplateId)
      };

      // 3. 결재선 템플릿 조회
      const lineTemplates = await approvalQuery.findApprovalLineTemplates(conn, lineParams);

      if (!lineTemplates || lineTemplates.length === 0) {
        throw new Error('결재선 템플릿이 없습니다. 결재선이 생성되지 않습니다.');
      }

      // 4. 결재선 생성 (approval_line 테이블에 삽입)
      // WHY: 템플릿의 모든 정보(위임, 병렬, 조건부 결재 등)를 approval_line에 복사
      // HOW: 템플릿에서 document_type, 위임 정보 등을 포함하여 실제 결재선 생성
      const approvalLines = lineTemplates.map(lineTemplate => ({
        company_id: utils.toNumberOrNull(company_id),
        approval_document_id: utils.toNumberOrNull(approvalDocumentId),
        document_type: utils.toStringOrEmpty(document_type),
        step: utils.toNumberOrNull(lineTemplate.step),
        user_grade_id: utils.toNumberOrNull(lineTemplate.user_grade_id),
        approver_id: utils.toNumberOrNull(lineTemplate.approver_id),
        department_id: utils.toNumberOrNull(lineTemplate.department_id),
        team_code: utils.toStringOrEmpty(lineTemplate.team_code),
        approval_type: utils.toStringOrEmpty(lineTemplate.approval_type),
        is_parallel: utils.toBooleanInt(lineTemplate.is_parallel),
        parallel_group_id: lineTemplate.parallel_group_id || null,
        parallel_approval_rule: lineTemplate.parallel_approval_rule || 'ALL',
        delegated_from_user_id: utils.toNumberOrNull(lineTemplate.delegated_from_user_id),
        delegation_start_date: utils.formatDateOrNull(lineTemplate.delegation_start_date),
        delegation_end_date: utils.formatDateOrNull(lineTemplate.delegation_end_date),
        delegation_reason: lineTemplate.delegation_reason || null,
        condition_type: lineTemplate.condition_type || null,
        condition_value: lineTemplate.condition_value || null,
        approval_status: 'PENDING',
        sort_order: utils.toNumberOrNull(lineTemplate.sort_order),
        created_by: utils.toNumberOrNull(requester_id)
      }));

      const approvalLineResult = await approvalQuery.saveApprovalLines(conn, approvalLines);

      if (!approvalLineResult || approvalLineResult.affectedRows === 0) {
        throw new Error('결재선 생성에 실패했습니다');
      }

      await conn.commit();

      return {
        success: true,
        approval_document_id: approvalDocumentId,
        approval_lines_count: approvalLineResult.affectedRows,
        document_type: document_type,
        document_title: documentParams.document_title
      };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }

};


/**
 * getApprovals : 결재 문서 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 필터 (company_id 필수, ct_request_id 선택)
 * @returns {Promise<Object>} : 결재 문서 목록과 관련 정보
 */
export const getApprovals = async (params) => {

  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    ct_request_id: utils.toNumberOrNull(params.ct_request_id),
    search_type: utils.toStringOrEmpty(params.search_type),
    date_from: utils.formatDateOrNull(params.date_from),
    date_to: utils.formatDateOrNull(params.date_to),
    ct_no: utils.toStringOrEmpty(params.ct_no),
    ct_content: utils.toStringOrEmpty(params.ct_content),
    approval_status: params.approval_status || [],
    document_type: utils.toStringOrEmpty(params.document_type)
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.findApprovals(conn, queryParams);
    const approvalList = result.map(row => ({
      ...row,
      idx: row.idx ? row.idx.toString() : null, // id가 BigInt인 경우 문자열로 변환
    }));

    return {
      result: approvalList
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
  
};


/**
 * 결재 상세 보기
 * @param {*} params : 조회 필터 (company_id, approval_document_id 필수)
 * @returns {Promise<Object>} : 결재 상세 데이터
 */
export const getApprovalById = async (params) => {
  
  // 1차 검증: 최상위 필수 파라미터 체크
  utils.checkRequiredParams(params, ['company_id', 'approval_document_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    approval_document_id: utils.toNumberOrNull(params.approval_document_id)
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await approvalQuery.findApprovalById(conn, queryParams);

    return {
      result: result
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};