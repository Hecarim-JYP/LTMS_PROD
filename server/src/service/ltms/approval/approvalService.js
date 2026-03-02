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