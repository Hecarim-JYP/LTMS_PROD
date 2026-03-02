 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 10.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Preservative Controller
  #     @modified : 
  ########################################################## */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { upload } from '../../../middleware/upload.mw.js'
import * as preservativeService from '../../../service/ltms/preservative/preservativeService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log("✅ 방부제 데이터 리스트 조회 요청 받음");
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ■ 조회화면 초기화 데이터 조회
 * @description "조회" 화면 진입시 최초 초기화 데이터 조회 및 반환
 */
router.get('/request/read', async (req, res) => {
  try {
    console.log("📌 CONTROLLER TEST[body] : ", req.body);
    console.log("📌 CONTROLLER TEST[query] : ", req.query);
    const result = await preservativeService.getPreservativeDataList(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/**
 * ■ 조회화면 검색시 데이터 조회
 * @description "조회" 화면 내 검색 버튼을 통한 데이터 조회 및 반환
 */
router.get('/request/read/search', async (req, res) => {

});


/**
 * ■ DB 내 특정 조건 조회 및 반환
 * @description QueryString 을 통해 request_id 조건으로 DB 조회 및 반환
 */
router.get('/request/read/detail', async (req, res) => {
  try {
    const preRequestId = req.query.request_id;
    console.log("📌 CONTROLLER TEST[detail]: ", req.body);
    console.log("📌 CONTROLLER TEST[query] : ", req.query);
    console.log("📌 CONTROLLER TEST[ID] : ", preRequestId);
    const result = await preservativeService.getPreservativeDataListDetail(preRequestId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
})


/**
 * ■ 클라이언트 파일 접근 및 반환
 * @description 클라이언트가 특정 파일 클릭시 해당 파일이 위치한 경로 반환
 */
router.get('/request/read/files/:filename', async (req, res) => {
  const { module, filename } = req.params;

  const filePath = path.join('/uploads/preservative', filename);
  console.log(`📌 filePath : ${filePath}`);

  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "not found" });

  res.setHeader("Content-Disposition", "inline");

  return res.sendFile(filePath);

});


/**
 * ■ 최초 등록시 DB 데이터 삽입
 * @description "등록" 화면 내 저장시 파일 업로드 및 DB 데이터 삽입
 */
router.post(
  '/request/create', 
  upload.array('files', 20),
  async (req, res) => {
  try {

    console.log("🙌 Controller 영역(body) : ", JSON.parse(req.body.sampleInfo));
    console.log("🙌 Controller 영역(body) : ", JSON.parse(req.body.rmInfo));
    console.log("🙌 Controller 영역(body) : ", JSON.parse(req.body.testInfo));
    console.log("🙌 Controller 영역(body) : ", JSON.parse(req.body.fileInfo));
    console.log("🙌 Controller 영역(files) : ", req.files);
    const data = await preservativeService.createPreservativeData(req);
    // const data = await preservativeService.createPreservativeData(req.files);
    res.status(201).json({
      success: true,
      message: "데이터가 생성되었습니다",
      data: data
    });

  } catch(err) {
    console.error(err);
    console.error("🪦 [컨트롤러] 방부력테스트 데이터 생성 실패:", err.message);
    res.status(400).json ({
      success: false,
      error: err.message,
      field: err.field
    });
    // res.status(400).json({
    //   success: false,
    //   error: err.message
    // });
    // res.status(500).json({
    //   success: false,
    //   error: {
    //     message: err.message,
    //     code: err.code,
    //     errno: err.errno,
    //     sqlState: err.sqlState,
    //     sql: err.sql
    //   },
    //   err
    // });
  }
});

router.post(
  '/request/update', 
  upload.array('files', 20),
  async (req, res) => {
    console.log("📌 Entered update URL");
    try {
      const requestId = req.query.request_id;
      const data = await preservativeService.updatePreservativeData(requestId,  req);
      // const data = await preservativeService.createPreservativeData(req.files);
      res.status(201).json({
        success: true,
        message: "데이터가 생성되었습니다",
        data: data
      });

    } catch(err) {
      console.error(err);
      console.error("🪦 방부력테스트 데이터 생성 실패:", err.message);
      res.status(400).json ({
        success: false,
        error: err.message,
        field: err.field
      });
      // res.status(400).json({
      //   success: false,
      //   error: err.message
      // });
      // res.status(500).json({
      //   success: false,
      //   error: {
      //     message: err.message,
      //     code: err.code,
      //     errno: err.errno,
      //     sqlState: err.sqlState,
      //     sql: err.sql
      //   },
      //   err
      // });
    }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await preservativeService.getPreservativeDataDetail(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await preservativeService.createPreservativeData(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await preservativeService.updatePreservativeData(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await preservativeService.deletePreservativeData(req.params.id);
    res.json({ success: true, message: '삭제되었습니다' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
