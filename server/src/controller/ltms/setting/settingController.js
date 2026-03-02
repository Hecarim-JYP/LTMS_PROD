/**
 * 파일명 : settingController.js
 * 용도 : Setting 화면 컨트롤러
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import * as settingService from '../../../service/ltms/setting/settingService.js';

const router = express.Router();

/* ============================== 옵션 ============================== */
/**
 * 🔎 단위 셀렉트박스 옵션 목록 조회
 * 
 * 엔드포인트: GET /setting/options/unitoptions
 * 
 * 동작:
 *   1. DB unit 테이블에서 단위 옵션 목록 조회
 * 
 * 응답 예시:
 *   { "success": true, "result": [...] }
 */
router.get('/options/unitoptions', async (req, res) => {
  try {
    const unitOptions = await settingService.getUnitOptions(req.query);
    res.json({ 
      success: true,
      data: unitOptions
    });

  } catch (err) {
    console.error('❌ CT 단위 셀렉트박스 옵션 조회 실패:', err.message);
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
 * 🔎 제형담당부서목록 조회
 * 
 * 엔드포인트: GET /setting/options/labdepartment
 * 
 * 동작:
 *   1. DB lab_department 테이블에서 제형담당부서 옵션 목록 조회
 * 
 * 응답 예시:
 *   { "success": true, "result": [...] }
 */
router.get('/options/labdepartment', async (req, res) => {
  try {
    const deptOptions = await settingService.getLabsDepartmentOptions(req.query);
    res.json({ 
      success: true,
      data: deptOptions
    });
    
  } catch (err) {
    console.error('❌ 제형 부서 옵션 조회 실패:', err.message);
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
 * ✏️ 제형담당부서 옵션 저장
 * 
 * 엔드포인트: POST /setting/options/labdepartment/save
 * 
 * 동작:
 *   1. 전달받은 제형담당부서 옵션 데이터를 DB lab_department 테이블에 저장
 *   2. 기존에 있던 데이터는 UPDATE, 새로운 데이터는 INSERT 처리
 */
router.post('/options/labdepartment/save', async (req, res) => {
  try {
    const result = await settingService.saveLabsDepartmentOptions(req.body);
    res.json({
      success: true,
      message: '데이터가 저장되었습니다',
      data: result
    });

  } catch (err) {
    console.error('❌ CT 제형담당부서 옵션 저장 실패:', err.message);
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
  } finally {
    
  }
});


/**
 * 🔎 CT 매니저 타입 옵션 조회
 * 
 * 엔드포인트: GET /setting/options/manager-type
 * 
 * 동작:
 *   1. DB manager_type 테이블에서 매니저 타입 옵션 목록 조회
 * 
 * 응답 예시:
 *   { "success": true, "message": "데이터가 삭제되었습니다" }
 *   { "success": false, "error": "해당 데이터를 찾을 수 없습니다" }
 */
router.get('/options/manager-type', async (req, res) => {
  try {
    const options = await settingService.getManagerTypeOptions(req.query);
    res.json({
      success: true, 
      data: options
    });

  } catch (err) {
    console.error("❌ CT 매니저 타입 옵션 조회 실패:", err.message);
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
 * 🔎 CT 판정 결과 옵션 조회
 * 
 * 엔드포인트: GET /setting/options/judgment
 * 
 * 동작:
 *   1. repository/sql/ltms/setting/settingQuery.js의 selectJudgmentOptions()로 판정 결과 옵션 조회
 * 
 * 응답 예시:
 *   { "success": true, "message": "데이터가 삭제되었습니다" }
 *   { "success": false, "error": "해당 데이터를 찾을 수 없습니다" }
 */
router.get('/options/judgment', async (req, res) => {
  try {
    const options = await settingService.getJudgmentOptions(req.query);
    res.json({ 
      success: true, 
      data: options
    });

  } catch (err) {
    console.error("❌ CT 판정 결과 옵션 조회 실패:", err.message);
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
 * 🔎 사용자 직급 목록 조회
 */
router.get('/options/user-grade', async(req, res) => {
  try {
    const result = await settingService.getUserGrades(req.query);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 사용자 직급 목록 조회 실패:', err.message);
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
 * 🔎 부서 목록 조회
 * 
 * 엔드포인트: GET /setting/options/department
 * 
 * 동작:
 *   1. DB department 테이블에서 부서 옵션 목록 조회
 * 
 * 응답 예시:
 *   { "success": true, "result": [...] }
 */
router.get('/options/department', async (req, res) => {
  try {
    const deptOptions = await settingService.getDepartmentOptions(req.query);
    res.json({ 
      success: true,
      data: deptOptions
    });
    
  } catch (err) {
    console.error('❌ 부서 옵션 조회 실패:', err.message);
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


/* ============================== 설정 ============================== */
/**
 * 🔎 사용자별 커스텀 설정 조회
 * 
 * 엔드포인트: GET /setting/user-custom
 * 
 * 동작:
 *   1. DB에서 사용자별 커스텀 설정 조회
 *   2. 조회된 설정 반환
 * 
 * 응답 예시:
 *   { "success": true, "data": { ... } }
 *   { "success": false, "error": "해당 데이터를 찾을 수 없습니다" }
 */
router.get('/user-custom', async (req, res) => {
  try {
    const result = await settingService.getUserCustomSetting(req.query);
    res.json({ 
      success: true, 
      data: result
    });

  } catch (err) {
    console.error("❌ 사용자 설정 조회 실패:", err.message);
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
 * 🔎 사용자별 커스텀 설정 수정
 * 
 * 엔드포인트: GET /setting/user-custom
 * 
 * 동작:
 *   1. DB에서 사용자별 커스텀 설정 수정
 */
router.patch('/user-custom', async (req, res) => {
  try {
    const result = await settingService.updateUserCustomSetting(req.body);
    res.json({ 
      success: true,
      data: result
    });

  } catch (err) {
    console.error("❌ 사용자 설정 조회 실패:", err.message);
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


/* ============================== 결재선 관리 ============================== */
/**
 * 🔎 CT 결재 문서 유형 조회
 */
router.get('/approval/documentType', async (req, res) => {
  try {
    const documentTypes = await settingService.getApprovalDocumentTypes(req.query);
    res.json({
      success: true,
      data: documentTypes
    });

  } catch (err) {
    console.error('❌ CT 결재 문서 유형 조회 실패:', err.message);
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
 * 🔎 CT 결재선 템플릿 목록 조회
 */
router.get('/approval/template', async (req, res) => {
  try {
    const templates = await settingService.getApprovalTemplates(req.query);
    res.json({
      success: true,
      data: templates
    });

  } catch (err) {
    console.error('❌ CT 결재선 템플릿 목록 조회 실패:', err.message);
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
 * 🔎 CT 결재선 템플릿 상세 조회 (결재선 목록 포함)
 */
router.get('/approval/templateWithLines', async (req, res) => {
  try {
    const result = await settingService.getApprovalTemplateWithLines(req.query);
    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('❌ CT 결재선 템플릿 상세 조회 실패:', err.message);
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
 * 🔄 결재 템플릿 활성/비활성 토글
 */
router.patch('/approval/template/toggle-active', async (req, res) => {
  try {
    const result = await settingService.toggleApprovalTemplateIsActive(req.body);
    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('❌ 결재 템플릿 활성/비활성 토글 실패:', err.message);
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
 * 💾 결재선 템플릿 일괄 저장
 */
router.post('/approval/template/lines', async (req, res) => {
  try {
    const result = await settingService.saveApprovalLineTemplates(req.body);
    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('❌ 결재선 템플릿 일괄 저장 실패:', err.message);
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
 * ⭐ 결재 템플릿 기본값 설정
 * 
 * 엔드포인트: POST /approval/template/setDefault
 * 
 * 동작:
 *   1. 같은 문서 유형의 다른 템플릿들의 is_default를 0으로 변경
 *   2. 현재 템플릿의 is_default를 1로 변경
 */
router.post('/approval/template/setDefault', async (req, res) => {
  try {
    const result = await settingService.setDefaultApprovalTemplate(req.body);
    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('❌ 기본 템플릿 설정 실패:', err.message);
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