/**  ##########################################################
 #        ______                __           __
#       / ____/_______  ____ _/ /____  ____/ /
#      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
#     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
#     \____/_/   \___/\__,_/\__/\___/\__,_/   
# 
#     @since : 2026. 02. 20.
#     @author : Choi Yeon Woong (231004)
#     @description : LTMS - ERP data request Service
#     @modified : 
########################################################## */

import axios from 'axios';

const API_SERVER = process.env.API_SERVER;

/**
 * ■ Axios Client 생성
 * @description : 기본 URL 및 쿼리스트링 파라미터 제공 목적, 공통 조회 시간 제한 목적
 * @example : erpClient.get('/cust/dtl', { params: {custseq: 6566 }});
 */
const erpClient = axios.create({
    baseURL: `${API_SERVER}/erp`
    ,timeout: 5000
})

/**
 * ■ ERP DB 내 현재 시각 조회
 * @description 라우팅 및 API 서버 통신 체크 목적
 */
export const getNow = async () => {
    try {
        console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZ");
        // const service = await axios.get(`${API_SERVER}/erp/now`);
        const service = await erpClient.get('/now');
        console.log("Service : ", service);
        const response = service.data

        return {
            data: response.result
            ,type: response.type
            ,raw: response.raw
        }
    } catch (err) {
        console.error(err.message);
        return;
    }
}


/**
 * ■ 모든 거래처 정보 조회
 * @description 모든 거래처 정보 조회 및 반환
 */
export const getCustFull = async () => {

    try {
        console.log("🤝 You have entered erpService");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?${custseq}`)
        const response = await erpClient.get('/cust');

        console.log("RESPONSE : ", response);

        return {
            raw: response.data.raw
            ,data: response.data.result
            ,type: response.data.type
        }
    } catch (err) {
        console.error("⚡ Something Wrong in [getCustFull] : ", err.message);
        res.status(500).json({ message: "🤷‍♂️ API 서버와 통신중 오류가 발생했습니다.", detail: err.message });
    }
}


/**
 * ■ 조건별(유일키) 거래처 정보 조회
 * @description 쿼리스트링을 통한 조건별 거래처 정보 조회 및 반환
 */
export const getCustDtl = async (custseq) => {

    try {
        console.log("🤝 You have entered erpService");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?${custseq}`)
        const response = await erpClient.get('/cust/dtl', {
            params: { custseq: custseq }
        });

        console.log("RESPONSE : ", response);

        return {
            raw: response.data.raw
            ,data: response.data.result
            ,type: response.data.type
        }
    } catch (err) {
        console.error("⚡ Something Wrong in [getCustDtl] : ", err.message);
        res.status(500).json({ message: "🤷‍♂️ API 서버와 통신중 오류가 발생했습니다.", detail: err.message });
    }
}


/**
 * ■ 모든 유저 정보 조회
 * @description 모든 유저 정보 조회 및 반환
 */
export const getUserFull = async () => {

    try {
        console.log("🤝 You have entered erpService");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?${custseq}`)
        const response = await erpClient.get('/user');

        console.log("RESPONSE : ", response);

        return {
            raw: response.data.raw
            ,data: response.data.result
            ,type: response.data.type
        }
    } catch (err) {
        console.error("⚡ Something Wrong in [getUserFull] : ", err.message);
        res.status(500).json({ message: "🤷‍♂️ API 서버와 통신중 오류가 발생했습니다.", detail: err.message });
    }
}


/**
 * ■ 조건별(유일키) 유저 정보 조회
 * @description 쿼리스트링을 통한 조건별 유저 정보 조회 및 반환
 */
export const getUserDtl = async (userid) => {

    try {
        console.log("🤝 You have entered erpService");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?${custseq}`)
        const response = await erpClient.get('/user/dtl', {
            params: { userid: userid }
        });

        console.log("RESPONSE : ", response);

        return {
            raw: response.data.raw
            ,data: response.data.result
            ,type: response.data.type
        }
    } catch (err) {
        console.error("⚡ Something Wrong in [getUserDtl] : ", err.message);
        res.status(500).json({ message: "🤷‍♂️ API 서버와 통신중 오류가 발생했습니다.", detail: err.message });
    }
}


/**
 * ■ 모든 아이템 정보 조회
 * @description 모든 아이템 정보 조회 및 반환
 */
export const getItemFull = async () => {

    try {
        console.log("🤝 You have entered erpService");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?${custseq}`)
        const response = await erpClient.get('/item');

        console.log("RESPONSE : ", response);

        return {
            raw: response.data.raw
            ,data: response.data.result
            ,type: response.data.type
        }
    } catch (err) {
        console.error("⚡ Something Wrong in [getItemFull] : ", err.message);
        res.status(500).json({ message: "🤷‍♂️ API 서버와 통신중 오류가 발생했습니다.", detail: err.message });
    }
}


/**
 * ■ 조건별(유일키) 아이템 정보 조회
 * @description 쿼리스트링을 통한 조건별 아이템 정보 조회 및 반환
 */
export const getItemDtl = async (itemseq) => {

    try {
        console.log("🤝 You have entered erpService");
        // const response = await axios.get(`${API_SERVER}/erp/cust/dtl?${custseq}`)
        const response = await erpClient.get('/item/dtl', {
            params: { itemseq: itemseq }
        });

        console.log("RESPONSE : ", response);

        return {
            raw: response.data.raw
            ,data: response.data.result
            ,type: response.data.type
        }
    } catch (err) {
        console.error("⚡ Something Wrong in [getCustDtl] : ", err.message);
        res.status(500).json({ message: "🤷‍♂️ API 서버와 통신중 오류가 발생했습니다.", detail: err.message });
    }
}