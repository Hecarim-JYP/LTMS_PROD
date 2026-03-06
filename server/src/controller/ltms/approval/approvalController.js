/**
 * 파일명 : approvalController.js
 * 용도 : 결재선 컨트롤러 (API 엔드포인트)
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import * as approvalService from '../../../service/ltms/approval/approvalService.js';

const router = express.Router();

/**
 * 🔎 결재선 목록 조회
 * 
 * 엔드포인트: GET /approval/lines
 * 
 * 동작:
 *   1. DB approval_line 테이블에서 결재선 목록 조회
 * 
 * 응답 예시:
 *   { "success": true, "data": [...], "message": "결재선 목록 조회 성공" }
 */
router.get('/lines', async (req, res) => {
  try {
    const params = {
      company_id: req.query.company_id || req.body.company_id,
      approval_document_id: req.query.approval_document_id,
      approver_id: req.query.approver_id,
      approval_status: req.query.approval_status,
    };

    const result = await approvalService.getApprovalLines(params);
    
    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 목록 조회 성공'
    });
  } catch (err) {
    console.error('결재선 목록 조회 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 목록 조회 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🔎 결재선 상세 조회
 * 
 * 엔드포인트: GET /approval/lines/:id
 * 
 * 동작:
 *   1. 특정 결재선 상세 정보 조회
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 상세 조회 성공" }
 */
router.get('/lines/:id', async (req, res) => {
  try {
    const params = {
      company_id: req.query.company_id || req.body.company_id,
      approval_line_id: req.params.id,
    };

    const result = await approvalService.getApprovalLineById(params);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '결재선을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 상세 조회 성공'
    });
  } catch (err) {
    console.error('결재선 상세 조회 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 상세 조회 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * ✏️ 결재선 생성
 * 
 * 엔드포인트: POST /approval/lines
 * 
 * 동작:
 *   1. 새로운 결재선 등록
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 생성 성공" }
 */
router.post('/lines', async (req, res) => {
  try {
    const params = {
      company_id: req.body.company_id,
      approval_document_id: req.body.approval_document_id,
      step: req.body.step,
      role_id: req.body.role_id,
      approver_id: req.body.approver_id,
      approval_status: req.body.approval_status,
      approval_date: req.body.approval_date,
      approval_comment: req.body.approval_comment,
      is_active: req.body.is_active,
      sort_order: req.body.sort_order,
      created_by: req.body.created_by || req.user?.user_id,
    };

    const result = await approvalService.createApprovalLine(params);
    
    res.status(201).json({
      success: true,
      data: result,
      message: '결재선 생성 성공'
    });
  } catch (err) {
    console.error('결재선 생성 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 생성 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🔧 결재선 수정
 * 
 * 엔드포인트: PUT /approval/lines/:id
 * 
 * 동작:
 *   1. 기존 결재선 정보 수정
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 수정 성공" }
 */
router.put('/lines/:id', async (req, res) => {
  try {
    const params = {
      company_id: req.body.company_id,
      approval_line_id: req.params.id,
      step: req.body.step,
      role_id: req.body.role_id,
      approver_id: req.body.approver_id,
      approval_status: req.body.approval_status,
      approval_date: req.body.approval_date,
      approval_comment: req.body.approval_comment,
      sort_order: req.body.sort_order,
      updated_by: req.body.updated_by || req.user?.user_id,
    };

    const result = await approvalService.updateApprovalLine(params);
    
    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 수정 성공'
    });
  } catch (err) {
    console.error('결재선 수정 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 수정 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🗑️ 결재선 삭제 (Soft Delete)
 * 
 * 엔드포인트: DELETE /approval/lines/:id
 * 
 * 동작:
 *   1. 결재선 미사용 처리 (is_active = 0)
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 삭제 성공" }
 */
router.delete('/lines/:id', async (req, res) => {
  try {
    const params = {
      company_id: req.body.company_id || req.query.company_id,
      approval_line_id: req.params.id,
      deleted_by: req.body.deleted_by || req.user?.user_id,
    };

    const result = await approvalService.deleteApprovalLine(params);
    
    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 삭제 성공'
    });
  } catch (err) {
    console.error('결재선 삭제 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 삭제 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🔎 결재선 템플릿 목록 조회
 * 
 * 엔드포인트: GET /approval/templates
 * 
 * 동작:
 *   1. DB approval_line_template 테이블에서 템플릿 목록 조회
 * 
 * 응답 예시:
 *   { "success": true, "data": [...], "message": "결재선 템플릿 목록 조회 성공" }
 */
router.get('/templates', async (req, res) => {
  try {
    const params = {
      company_id: req.query.company_id || req.body.company_id,
      document_type: req.query.document_type,
    };

    const result = await approvalService.getApprovalLineTemplates(params);
    
    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 템플릿 목록 조회 성공'
    });
  } catch (err) {
    console.error('결재선 템플릿 목록 조회 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 템플릿 목록 조회 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🔎 결재선 템플릿 상세 조회
 * 
 * 엔드포인트: GET /approval/templates/:id
 * 
 * 동작:
 *   1. 특정 결재선 템플릿 상세 정보 조회
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 템플릿 상세 조회 성공" }
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const params = {
      company_id: req.query.company_id || req.body.company_id,
      approval_line_template_id: req.params.id,
    };

    const result = await approvalService.getApprovalLineTemplateById(params);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '결재선 템플릿을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 템플릿 상세 조회 성공'
    });
  } catch (err) {
    console.error('결재선 템플릿 상세 조회 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 템플릿 상세 조회 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * ✏️ 결재선 템플릿 생성
 * 
 * 엔드포인트: POST /approval/templates
 * 
 * 동작:
 *   1. 새로운 결재선 템플릿 등록
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 템플릿 생성 성공" }
 */
router.post('/templates', async (req, res) => {
  try {
    const params = {
      company_id: req.body.company_id,
      document_type: req.body.document_type,
      step: req.body.step,
      role_id: req.body.role_id,
      approver_id: req.body.approver_id,
      is_active: req.body.is_active,
      sort_order: req.body.sort_order,
      created_by: req.body.created_by || req.user?.user_id,
    };

    const result = await approvalService.createApprovalLineTemplate(params);
    
    res.status(201).json({
      success: true,
      data: result,
      message: '결재선 템플릿 생성 성공'
    });
  } catch (err) {
    console.error('결재선 템플릿 생성 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 템플릿 생성 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 💾 결재선 템플릿 일괄 저장
 * 
 * 엔드포인트: POST /approval/templates/batch
 * 
 * 동작:
 *   1. 여러 결재선 템플릿을 한 번에 저장 (트랜잭션)
 * 
 * 응답 예시:
 *   { "success": true, "data": {...}, "message": "결재선 템플릿 일괄 저장 성공" }
 */
router.post('/templates/batch', async (req, res) => {
  try {
    const params = {
      company_id: req.body.company_id,
      document_type: req.body.document_type,
      templates: req.body.templates,
      user_id: req.body.user_id || req.user?.user_id,
    };

    const result = await approvalService.saveApprovalLineTemplates(params);
    
    res.status(200).json({
      success: true,
      data: result,
      message: '결재선 템플릿 일괄 저장 성공'
    });
  } catch (err) {
    console.error('결재선 템플릿 일괄 저장 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재선 템플릿 일괄 저장 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🔧 결재요청 (결재 문서 생성)
 */
router.post('/request', async (req, res) => {
  try {
    const params = {
      company_id: req.body.company_id,
      requester_id: req.body.requester_id,
      document_id: req.body.document_id,
      document_number: req.body.document_number,
      document_type: req.body.document_type
    };
    
    const result = await approvalService.createApproval(params);
    
    res.status(200).json({
      success: true,
      data: result,
      message: '결재 요청 생성 성공'
    });
  } catch (err) {
    console.error('결재 요청 생성 오류:', err);
    res.status(500).json({
      success: false,
      message: '결재 요청 생성 중 오류가 발생했습니다.',
      error: err.message
    });
  }
});


/**
 * 🔍 결재 데이터 목록 조회
 */
router.get('/approvals', async (req, res) => {
  try {
    const result = await approvalService.getApprovals(req.query);
    res.json({ 
      success: true, 
      data: result 
    });

  } catch (err) {
    console.error("❌ 결재 데이터 조회 실패:", err.message);
    res.status(500).json({ 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sql: err.sql
      },
      message: err.message,
    });
  }
});


/**
 * 결재 상세 보기
 */
router.get('/approval/detail', async (req, res) => {
  try {
    const result = await approvalService.getApprovalById(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ 결재 데이터 조회 실패:", err.message);
    res.status(500).json({ 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sql: err.sql
      },
      message: err.message,
    });
  }
});


export default router;