 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 20.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - ERP data request Controller
  #     @modified : 
  ########################################################## */

import express from 'express';
import user from './user.js';

import * as erpService from '../../service/erp/erp_service.js';

const app = express();
const router = express.Router();

// app.use('/user', user);

// ■ 라우터 체크 : 현재 시각 ERP DB 조회
router.get('/now', async (req, res) => {
    try {
        console.log("Entered API_SERVER protocol");
        const result = await erpService.getNow();
        // const result = await axios.get(`${API_SERVER}/erp/now`);
        // const data = result.data;
        // res.json(result.data);
        console.log(result);
        res.json({ 
            data: result.data
            ,type: result.type
            ,raw: result.raw
            ,message: "🟢 You have connected to erp/main" 
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ■ 거래처 정보 조회 : Full
router.get('/cust', async (req, res) => {
    try {
        console.log("Entered API_SERVER protocol");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?custseq=${queryString}`);
        const result = await erpService.getCustFull();
        // const data = result.data;

        // console.log(data);

        res.json({
            raw: result.raw
            ,data: result.data
            ,type: result.type
            ,message: "🟢 You have Received DATA from ERP"
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ■ 거래처 정보 조회 : Detail
router.get('/cust/dtl', async (req, res) => {
    const custSeq = req.query.custseq;
    try {
        console.log("Entered API_SERVER protocol");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?custseq=${queryString}`);
        const result = await erpService.getCustDtl(custSeq);
        // const data = result.data;

        // console.log(data);

        res.json({
            raw: result.raw
            ,data: result.data
            ,type: result.type
            ,message: "🟢 You have Received DATA from ERP"
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ■ 유저 정보 조회 : Full
router.get('/user', async (req, res) => {
    try {
        console.log("Entered API_SERVER protocol");
        const result = await erpService.getUserFull();

        res.json({
            raw: result.raw
            ,data: result.data
            ,type: result.type
            ,message: "🟢 You have Received DATA from ERP"
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ■ 거래처 정보 조회 : Detail
router.get('/user/dtl', async (req, res) => {
    const userId = req.query.userid;
    try {
        console.log("Entered API_SERVER protocol");
        const result = await erpService.getUserDtl(userId);

        res.json({
            raw: result.raw
            ,data: result.data
            ,type: result.type
            ,message: "🟢 You have Received DATA from ERP"
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ■ 유저 정보 조회 : Full
router.get('/item', async (req, res) => {
    try {
        console.log("Entered API_SERVER protocol");
        const result = await erpService.getItemFull();

        res.json({
            raw: result.raw
            ,data: result.data
            ,type: result.type
            ,message: "🟢 You have Received DATA from ERP"
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ■ 거래처 정보 조회 : Detail
router.get('/item/dtl', async (req, res) => {
    const itemSeq = req.query.itemseq;
    try {
        console.log("Entered API_SERVER protocol");
        const result = await erpService.getItemDtl(itemSeq);

        res.json({
            raw: result.raw
            ,data: result.data
            ,type: result.type
            ,message: "🟢 You have Received DATA from ERP"
        });
    } catch (err) {
        console.error("🔴 API_SERVER couldn't response : ", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;