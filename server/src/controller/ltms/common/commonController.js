/**
 * 파일명 : commonController.js
 * 용도 : 공통 화면 컨트롤러
 * 최초등록 : 2026-02-25 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import * as commonService from '../../../service/ltms/common/commonService.js';
import { upload } from '../../../middleware/ltms/file/multer.js';

const router = express.Router();

router.get('/requests', async (req, res) => {
  try {
    const result = await commonService.getRequestsAwaitingMaterialReceipt(req.query);
    res.json({ 
      success: true, 
      data: result 
    });

  } catch (err) {
    console.error("❌ 의뢰 목록 조회 실패:", err.message);
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
 * 자재 접수 처리
 */
router.post('/material/receipt', async (req, res) => {
  try {
    const result = await commonService.receiveMaterial(req.body);
    res.status(201).json({ 
      success: true,
      message: "자재 접수 처리 완료",
      data: result
    });
  } catch (err) {
    console.error("❌ 자재 접수 처리 실패:", err.message);
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