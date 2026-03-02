 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 23.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Internal Controller
  #     @modified : 
  ########################################################## */

import express from 'express';

import * as internalService from '../../../service/ltms/internal/internalService.js';
import { upload } from '../../../middleware/upload.mw.js';

const router = express.Router();

/**
 * ✨ 성분분석[내부] 전체 데이터 목록 조회
 * @description 조회 화면 내 전체 데이터 조회 후 프론트 표기
 */
router.get('/request/read', async (req, res) => {
  try {
    console.log('☎️ Internal 데이터 조회 요청');
    console.log(`👁️ Request Body 확인 : ${req.body}`);
    const result = await internalService.getInternalDataList(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("❌ Internal 데이터 조회 실패:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✨ 성분분석[내부] 상세 데이터 목록 조회
 * @description 조회 → 등록 화면 점프시 필요 데이터 조회 후 프론트 표기
 */
router.get('/request/read/detail', async (req, res) => {
  console.log(`☎️ 성분분석[내부] 상세 데이터 목록 조회 요청`);
  
  const reqId = req.query.request_id;
  console.log(`👁️ Request ID 확인 : ${reqId}`);

  try {
    const result = await internalService.getInternalDataListDetail(reqId);

    res.json({ success: true, ...result });

  } catch (err) {
    console.error(`❌ 성분분석[내부] 상세 데이터 조회 실패. ${err.message}`);
    
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✨ 성분분석[내부] 데이터 등록
 * @description 등록화면 내 저장 버튼 클릭시 라우트 이동
 */
router.post(
  '/request/create', 
  upload.array('files', 20),
  async (req, res) => {
  console.log(`☎️ 성분분석[내부] 등록 요청`);
  try {
    const data = await internalService.createInternalData(req);

    res.status(201).json({
      success: true,
      message: "데이터 생성을 성공하였습니다.",
      data: data
    });
  } catch (err) {
    console.error(err);
    console.error(`❌ [Controller] 성분분석 데이터 생성 실패. ${err.message}`);
    res.status(400).json({
      success: false,
      error: err.message,
      field: err.field
    });
  };
});








/**
 * 📄 Internal 단일 데이터 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const data = await internalService.getInternalDataDetail(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

/**
 * ✏️ Internal 데이터 생성
 */
router.post('/', async (req, res) => {
  try {
    const data = await internalService.createInternalData(req.body);
    res.status(201).json({ success: true, message: "데이터가 생성되었습니다", data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 🔄 Internal 데이터 수정
 */
router.put('/:id', async (req, res) => {
  try {
    const data = await internalService.updateInternalData(req.params.id, req.body);
    res.json({ success: true, message: "데이터가 수정되었습니다", data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 🗑️ Internal 데이터 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    await internalService.deleteInternalData(req.params.id);
    res.json({ success: true, message: "데이터가 삭제되었습니다" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
