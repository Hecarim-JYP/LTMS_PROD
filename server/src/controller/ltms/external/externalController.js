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
