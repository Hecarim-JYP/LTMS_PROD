/**
 * 파일명 : ctController.js
 * 용도 : CT 화면 컨트롤러
 * 최초등록 : 2026-01-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import * as ctService from '../../../service/ltms/ct/ctService.js';
import { upload } from '../../../middleware/ltms/file/multer.js';

const router = express.Router();

/* ============================== 의뢰 ============================== */
/**
 * 🔍 CT 데이터 목록 조회
 * 
 * 엔드포인트: GET /ct/requests
 * 쿼리 파라미터:
 *   - reqNo: 요청 번호 (선택)
 *   - labNo: 랩 번호 (선택)
 *   - dateFrom: 시작 날짜 (선택)
 *   - dateTo: 종료 날짜 (선택)
 * 
 * 동작:
 *   1. 요청에서 쿼리 파라미터 추출
 *   2. 조회 결과를 JSON으로 반환
 * 
 * 응답 예시:
 *   { "success": true, "data": [...], "count": 5 }
 */
router.get('/requests', async (req, res) => {
  try {
    const result = await ctService.getCtRequests(req.query);
    res.json({ 
      success: true, 
      data: result 
    });

  } catch (err) {
    console.error("❌ CT 데이터 조회 실패:", err.message);
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
 * CT 단일 데이터 조회
 * 
 * 엔드포인트: GET /ct/:id
 * URL 파라미터:
 *   - id: 조회할 CT 데이터의 고유 ID
 * 
 * 동작:
 *   1. URL에서 id 추출
 *   2. 없으면 404 에러 반환, 있으면 데이터 반환
 * 
 * 응답 예시:
 *   { "success": true, "data": {...} }
 *   { "success": false, "error": "해당 데이터를 찾을 수 없습니다" }
 */
router.get('/request/detail', async (req, res) => {
  try {
    const result = await ctService.getCtRequestById(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ CT 데이터 조회 실패:", err.message);
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
 * 🔍 CT 최근 번호 조회
 * 
 * 엔드포인트: GET /ct/request/recent-ct-no
 * 
 * 동작:
 *   1. DB에서 가장 최근 CT번호에 1을 더해 최근 CT 번호 조회
 *   2. 조회된 번호 반환
 * 
 * 응답 예시:
 *   { "success": true, "data": "CT20260123001" } 
 */
router.get('/request/recent-ct-no', async (req, res) => {
  try {
    const result = await ctService.getRecentCtNo(req.query);
    res.json({ 
      success: true, 
      data: result 
    });

  } catch (err) {
    console.error("❌ CT 최근 번호 조회 실패:", err.message);
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
 * ✏️ CT 데이터 생성
 * 
 * 엔드포인트: POST /ct/request/create
 * 요청 본문: JSON 형식의 CT 데이터
 * 
 * 동작:
 *   1. 요청 본문에서 CT 데이터 추출 (req.body)
 *   2. repository/sql/ltms/ct/ctQuery.js의 createCtData()로 데이터베이스에 저장
 *   3. 생성된 데이터 반환 (ID 포함)
 *   4. HTTP 상태코드 201(Created) 반환
 * 
 * 요청 예시:
 *   POST /ct/request/create
 *   {
 *     "req_no": "REQ001",
 *     "lab_no": "LAB001",
 *     "test_data": "..."
 *   }
 * 
 * 응답 예시:
 *   { "success": true, "message": "데이터가 생성되었습니다", "data": {...} }
 */
router.post('/request/create', async (req, res) => {
  try {
    const result = await ctService.createCtRequest(req.body);
    res.status(201).json({ 
      success: true,
      message: "데이터가 생성되었습니다",
      data: result
    });

  } catch (err) {
    console.error("❌ CT 의뢰 생성 실패:", err.message);
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
 * 🔄 CT 데이터 수정
 * 
 * 엔드포인트: POST /ct/request/update
 * URL 파라미터: 
 *   - id: 수정할 CT 데이터의 고유 ID
 * 요청 본문: 수정할 필드들을 JSON으로 제공
 * 
 * 동작:
 *   1. URL에서 id, 요청 본문에서 수정 데이터 추출
 *   2. repository/sql/ltms/ct/ctQuery.js의 updateCtData()로 데이터베이스 업데이트
 *   3. 수정된 데이터 반환
 * 
 * 요청 예시:
 *   POST /ct/request/update
 *   {
 *     "test_data": "새로운 값",
 *     "status": "completed"
 *   }
 * 
 * 응답 예시:
 *   { "success": true, "message": "데이터가 수정되었습니다", "data": {...} }
 */
router.post('/request/update', async (req, res) => {
  try {
    const result = await ctService.updateCtRequest(req.body);
    res.json({ 
      success: true, 
      message: "데이터가 수정되었습니다", 
      data: result 
    });

  } catch (err) {
    console.error("❌ CT 의뢰 수정 실패:", err.message);
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

/* ============================== 시험성적서 ============================== */
/**
 * 🔍 CT 시험 성적서 목록 조회
 */
router.get('/test-reports', async (req, res) => {
  try {
    const result = await ctService.getCtTestReports(req.query);
    res.json({ 
      success: true, 
      data: result 
    });

  } catch (err) {
    console.error("❌ CT 시험 성적서 조회 실패:", err.message);
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
 * CT 시험 성적서 상세 보기
 */
router.get('/test-report/detail', async (req, res) => {
  try {
    const result = await ctService.getCtTestReportById(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ CT 시험 성적서 조회 실패:", err.message);
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
 * ✏️ CT 시험 성적서 생성
 */
router.post('/test-report/create', upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    const result = await ctService.createCtTestReport(req.body, files);
    res.status(201).json({ 
      success: true,
      message: "시험 성적서가 생성되었습니다",
      data: result
    });

  } catch (err) {
    console.error("❌ CT 시험 성적서 생성 실패:", err.message);
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
 * ✏️ CT 시험 성적서 수정
 */
router.post('/test-report/update', upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    const result = await ctService.updateCtTestReport(req.body, files);
    res.json({ 
      success: true, 
      message: "시험 성적서가 수정되었습니다", 
      data: result 
    });

  } catch (err) {
    console.error("❌ CT 시험 성적서 수정 실패:", err.message);
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
 * 이전 성적서 목록 조회
 * 
 * 엔드포인트: GET /ct/test-report/historys
 * 쿼리 파라미터:
 *   - company_id: 회사 ID (필수)
 *   - search_type: 조회 기준 (REQ: 의뢰일, REC: 접수일)
 *   - search_from: 시작 날짜
 *   - search_to: 종료 날짜
 *   - ct_no: CT 번호 (선택)
 *   - search_content: 검색어 (선택)
 */
router.get('/test-report/historys', async (req, res) => {
  try {
    const result = await ctService.getTestReportHistorys(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ 이전 성적서 조회 실패:", err.message);
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
 * 특정 성적서의 시험 항목 조회
 * 
 * 엔드포인트: GET /ct/test-report/test-items
 * 쿼리 파라미터:
 *   - reportId: 성적서 ID (필수)
 */
router.get('/test-report/test-items', async (req, res) => {
  try {
    const result = await ctService.getTestReportTestItems(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ 시험 항목 조회 실패:", err.message);
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
 * 시험 종합 의견 이력 조회
 * 
 * 엔드포인트: GET /ct/test-report/remark-historys
 * 쿼리 파라미터:
 *   - company_id: 회사 ID (필수)
 *   - search_type: 조회 기준 (REQ: 의뢰일, REC: 접수일)
 *   - search_from: 시작 날짜
 *   - search_to: 종료 날짜
 *   - material_type: 자재유형 (선택)
 *   - search_content: 검색어 (선택)
 */
router.get('/test-report/remark-historys', async (req, res) => {
  try {
    const result = await ctService.getRemarkHistorys(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ 시험 종합 의견 조회 실패:", err.message);
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


/* ============================== 결재 ============================== */
/**
 * 🔍 CT 결재 데이터 목록 조회
 */
router.get('/approvals', async (req, res) => {
  try {
    const result = await ctService.getCtApprovals(req.query);
    res.json({ 
      success: true, 
      data: result 
    });

  } catch (err) {
    console.error("❌ CT 결재 데이터 조회 실패:", err.message);
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
 * CT 결재 상세 보기
 */
router.get('/approval/detail', async (req, res) => {
  try {
    const result = await ctService.getCtApprovalById(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ CT 결재 데이터 조회 실패:", err.message);
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

/* ============================== 시험 기준 ============================== */
/**
 * 시험 기준 결과 유형 옵션 조회
 * 
 * 엔드포인트: GET /ct/test-standards/result-type-options
 * 쿼리 파라미터:
 *   - company_id: 회사 ID (필수)
 */
router.get('/result-type-options', async (req, res) => {
  try {
    const result = await ctService.getResultTypeOptions(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ 시험 기준 결과 유형 옵션 조회 실패:", err.message);
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
 * 시험 기준 목록 조회 (전체)
 * 
 * 엔드포인트: GET /ct/test-standards
 * 쿼리 파라미터:
 *   - company_id: 회사 ID (필수)
 *   - search_keyword: 검색어 (선택)
 */
router.get('/test-standards', async (req, res) => {
  try {
    const result = await ctService.getTestStandards(req.query);
    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (err) {
    console.error("❌ 시험 기준 조회 실패:", err.message);
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

/* ============================== 일정현황 ============================== */


export default router;