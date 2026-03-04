 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 26.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - External Controller
  #     @modified : 
  ########################################################## */

import express from 'express';
import { upload } from '../../../middleware/upload.mw.js';
import * as externalService from '../../../service/ltms/external/externalService.js';

const router = express.Router();

router.get('/read', async (req, res) => {
  try {
    const result = await externalService.getExternalDataList(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/**
 * ✨ 조회 화면 진입시 전체 데이터 조회
 * -----------------------------------------------
 * @description "조회" 화면 최초 진입시 전체 DB 데이터 조회
 * @return { res }
 */
router.get('/request/read', async (req, res) => {
  try {
    const data = await externalService.getExternalDataList();
    res.json({ success: true, ...data });

  } catch (err) {
    res.status(400).json({ err: err.mesaage, success: false });
  }
})


/**
 * ✨ 화면 점프시 상세 데이터 조회
 * @description 조회 → 등록 화면 점프시 request_id 에 따른 상세 데이터 조회
 * @return { res }
 */
router.get('/request/read/detail', async (req, res) => {
  try {
    // console.log(`\n--[controller]request : ${JSON.stringify(req)}`);
    const data = await externalService.getExternalDataListDetail(req.query.request_id);
    res.json({ success: true, ...data });

  } catch (err) {
    res.status(400).json({ err: err.messgae, success: false });
  }
})


/**
 * ■ 최초 등록시 DB 데이터 삽입
 * -----------------------------------------------
 * @description "등록" 화면 내 저장시 DB 데이터 삽입(파일 첨부 없음)
 * @param {*}
 */
router.post('/request/create', async (req, res) => {
  try {
    const data = await externalService.createExternalData(req);
    res.json({ success: true, ...data });

  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message, 
      field: err.field
    });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const data = await externalService.getExternalDataDetail(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await externalService.createExternalData(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await externalService.updateExternalData(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await externalService.deleteExternalData(req.params.id);
    res.json({ success: true, message: '삭제되었습니다' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
