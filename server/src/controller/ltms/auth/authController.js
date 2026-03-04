/**
 * 파일명 : authController.js
 * 용도 : 사용자 인증 및 권한 관련 화면 컨트롤러
 * 최초등록 : 2026-02-04 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import * as authService from '../../../service/ltms/auth/authService.js';

const router = express.Router();


/* ============================== 로그인 ============================== */
/**
 * 🔐 로그인
 */
router.post('/login', async (req, res) => {
  try {
    const result = await authService.authenticateUser(req.body);
    res.json({ 
      success: true,
      message: '로그인 성공',
      data: result 
    });

  } catch (err) {
    console.error('❌ 로그인 실패:', err.message);
    res.status(500).json({ 
      success: false, 
      error: {
        message: err.message,
        code: err.code,
        fieldName: err.fieldName,
        errno: err.errno,
        sqlState: err.sqlState,
        sql: err.sql
      },
      message: err.message,
    });
  }
});


/**
 * 🔒 로그아웃
 */
router.post('/logout', async (req, res) => {
  res.json({ success: true, message: '로그아웃되었습니다' });
});


/* ============================== 메뉴 ============================== */
/**
 * 🔎 사이드 바 메뉴리스트 조회
 *
 */
router.get('/menus', async (req, res) => {
  try {
    const roles = await authService.getMenus(req.query);
    res.json({
      success: true,
      data: roles
    });
    
  } catch (err) {
    console.error('❌ 메뉴 목록 조회 실패:', err.message);
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
 * 🔄 1차 메뉴 등록
 */
router.post('/menu/parent/create', async (req, res) => {
  try {
    const result = await authService.createParentMenu(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 1차 메뉴 등록 실패:', err.message);
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
 * 🔄 1차 메뉴 수정
 */
router.post('/menu/parent/update', async (req, res) => {
  try { 
    const result = await authService.updateParentMenu(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 1차 메뉴 수정 실패:', err.message);
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
 * 🔄 2차 메뉴 등록
 */
router.post('/menu/sub/create', async (req, res) => {
  try {
    const result = await authService.createSubMenu(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 2차 메뉴 등록 실패:', err.message);
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
 * 🔄 2차 메뉴 수정
 */
router.post('/menu/sub/update', async (req, res) => {
  try { 
    const result = await authService.updateSubMenu(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 2차 메뉴 수정 실패:', err.message);
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
 * 🔄 3차 메뉴 등록
 */
router.post('/menu/third/create', async (req, res) => {
  try {
    const result = await authService.createThirdMenu(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 3차 메뉴 등록 실패:', err.message);
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
 * 🔄 3차 메뉴 수정
 */
router.post('/menu/third/update', async (req, res) => {
  try { 
    const result = await authService.updateThirdMenu(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 3차 메뉴 수정 실패:', err.message);
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


/* ============================== 사용자 ============================== */
/**
 * 🔎 사용자 목록 조회
 */
router.get('/users', async (req, res) => {
  try {
    const result = await authService.getUsers(req.query);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 사용자 목록 조회 실패:', err.message);
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
 * 🔄 사용자 목록 저장 (일괄)
 */
router.patch('/user/save', async (req, res) => {
  try {
    const result = await authService.saveUserInformation(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 사용자 목록 저장 실패:', err.message);
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


/* ============================== 권한 ============================== */
/**
 * 🔎 역할 목록 조회
 * 
 * 엔드포인트: GET /role
 * 
 * 동작:
 *   1. DB에서 역할 목록 조회
 *   2. 조회된 역할 반환
 * 
 * 응답 예시:
 *   { "success": true, "data": { ... } }
 *   { "success": false, "error": "해당 데이터를 찾을 수 없습니다" }
 */
router.get('/roles', async (req, res) => {
  try {
    const result = await authService.getRoles(req.query);
    res.json({ 
      success: true, 
      data: result
    });

  } catch (err) {
    console.error("❌ 역할 목록 조회 실패:", err.message);
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
 * 🔎 역할별 권한 조회
 */
router.get('/permissions/role', async (req, res) => {
  try {
    const result = await authService.getPermissionByRoleId(req.query);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 역할별 권한 조회 실패:', err.message);
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
 * 🔄 역할 등록
 */
router.post('/role/create', async(req, res) => {
  try {
    const result = await authService.createRole(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 역할 등록 실패:', err.message);
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
 * 🔄 역할 수정
 */
router.post('/role/update', async(req, res) => {
  try {
    const result = await authService.updateRole(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 역할 수정 실패:', err.message);
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
 * 🔄 역할에 권한 할당
 */
router.post('/role/assign-permissions', async(req, res) => {
  try {
    const result = await authService.assignPermissionsToRole(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 역할 권한 할당 실패:', err.message);
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
 * 🔎 권한 목록 조회
 */
router.get('/permissions', async(req, res) => {
  try {
    const result = await authService.getPermissions(req.query);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 권한 목록 조회 실패:', err.message);
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
 * 🔄 권한 등록
 */
router.post('/permission/create', async(req, res) => {
  try {
    const result = await authService.createPermission(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 권한 등록 실패:', err.message);
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
 * 🔄 권한 수정
 */
router.post('/permission/update', async(req, res) => {
  try {
    const result = await authService.updatePermission(req.body);
    res.json({ 
      success: true,
      data: result
    });
    
  } catch (err) {
    console.error('❌ 권한 수정 실패:', err.message);
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