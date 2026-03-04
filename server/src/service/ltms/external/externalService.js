 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 03. 01.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - External Service
  #     @modified : 
  ########################################################## */

import { getPool } from '../../../repository/connection.js';

import * as externalQuery from '../../../repository/sql/ltms/external/externalQuery.js';
import * as utils from '../../../common/utils.js';

// ■ 서비스 이용시 현재 시각 구하기
const date = new Date();
const year = String(date.getFullYear());
const month = String(Number(date.getMonth())+1).padStart(2,'0');
const day = String(date.getDate()).padStart(2,'0');
const hour = String(date.getHours()).padStart(2,'0');
const min = String(date.getMinutes()).padStart(2,'0');
const sec = String(date.getSeconds()).padStart(2,'0');

const now = `${year}-${month}-${day} ${hour}:${min}:${sec}`;
console.log(`-- Time : ${now}`);
const today = `${year}-${month}-${day}`;


/* ----------------------------------------------------------------
                              GET 영역
----------------------------------------------------------------*/
/**
 * ✨ 조회시 필요한 Request_id 데이터 조회
 * --------------------------------------
 * @name getExternalNextID
 * @description 상세 화면 진입시 해당 서비스로 ID 확인 필요
 */
export const getExternalNextID = async () => {
  const conn = await getPool().getConnection();
  const date = new Date();
  const year = String(date.getFullYear()).substring(2, 4);

  try {
    const response = await externalQuery.getExternalMaxValue(conn);

    let internalId = response.maxID;
    let internalNo = response.maxNO;
    if (!internalNo) { internalNo = Number(String(Number(year)).padEnd(6,0)) };

    let presentYear = String(internalNo).substring(0,2);

    if (!presentYear) { presentYear = year };

    if (year > presentYear) {
      console.log("Interrupt by condition : ", year);
      internalNo = Number(String(Number(year)).padEnd(6, 0));
    }

    let resultID = Number(internalId) + 1;
    let resultNO = Number(internalNo) + 1;

    return {
      raw: response,
      maxID: resultID,
      maxNO: resultNO
    };

  } catch (err) {
    throw new Error(`🔴 Service Error : ${err.message}`);

  } finally {
    if(conn) conn.release();
  }
};


/**
 * ✨ 최초 조회 화면 진입시 모든 데이터 조회
 * --------------------------------------
 * @name getExternalDataList
 * @description DB 내 외부성분분석 모든 데이터 조회 및 반환
 */
export const getExternalDataList = async (filters) => {
  const conn = await getPool().getConnection();
  
  try {
    const result = await externalQuery.getExternalData(conn, filters);
    console.log(`🟠 전체 데이터 쿼리 조회 성공.`);
    return {
      result
      ,count: result.length
    };
  } catch (err) {
    console.error(`🔴 Service Failed : ${err.message}`);
    throw new Error(`⛓️‍💥 Service Failed, check the logs on Backend: ${err.message}`);
  } finally {
    if(conn) conn.release();
  }
};



/**
 * ✨ 조회 → 등록화면 점프시 상세 데이터 조회
 * --------------------------------------
 * @name getExternalDataDetail
 * @description 조회화면 → 등록화면 점프 이동시 내부 상세 정보 리스트 조회
 * @param { Number } id
 */
export const getExternalDataListDetail = async (id) => {
  const conn = await getPool().getConnection();

  try {
    const data = await externalQuery.getExternalDataById(conn, id);

    console.log(`--data : ${JSON.stringify(data)}`);

    // ■ 최종 데이터 정리
    const dataResult = {
      "company_id" : data.company_id
      ,"external_class" : data.class
      ,"external_request_id" : data.request_id
      ,"external_request_no" : data.request_no
      ,"external_request_date" : data.request_date
      ,"external_request_user" : data.request_user

      ,"external_cust_name" : data.cust_name
      ,"external_item_name_en" : data.item_name_en
      ,"external_item_name_kr" : data.item_name_kr
      ,"external_lab_no" : data.lab_no
      ,"external_lab_ver" : data.lab_serl
      ,"external_lot_no" : data.lot_no
      ,"external_remark_duple" : data.remark_duple
      ,"external_remark_reason" : data.remark_reason
      ,"external_remark_class_etc" : data.remark_class_etc

      ,"external_item_type" : data.item_type
      ,"external_issue_class" : data.issue_class
      ,"external_cost_from" : data.cost_from
      ,"external_is_photo" : data.is_photo
      ,"external_remark_doc" : data.remark_doc

      ,"external_test_microbe_class" : data.test_microbe_class

      ,"external_test_anti_class" : data.test_anti_class
      ,"external_test_remark_anti_etc" : data.test_remark_anti_etc
      ,"external_test_contact_time" : data.test_contact_time

      ,"external_test_etc_is_content" : data.test_etc_is_content
      ,"external_test_etc_content" : data.test_etc_content
      ,"external_test_etc_content_unit" : data.test_etc_content_unit
      ,"external_test_etc_is_ph" : data.test_etc_is_ph
      ,"external_test_etc_ph" : data.test_etc_ph_content
      ,"external_test_etc_is_safety" : data.test_etc_is_safety
      ,"external_test_is_etc" : data.test_is_etc
      ,"external_test_remark_etc" : data.test_remark_etc

      ,"external_test_pre_class" : data.test_pre_class
      ,"external_test_remark_pre" : data.test_remark_pre

      ,"external_test_deodorant_class" : data.test_deodorant_class

      ,"external_test_start_date" : data.test_start_date
      ,"external_test_end_date" : data.test_end_date
      ,"external_test_user" : data.test_user
      ,"external_test_confirm_user" : data.test_confirm_user
      ,"external_test_remark_test" : data.remark_test

      ,"external_test_status" : data.test_status

    };

    console.log(`dataResult : ${JSON.stringify(dataResult)}`);

    return {
      data: dataResult
    }

  } catch (err) {
    throw new Error(`🔴 Service Failed : ${err.message}`);

  } finally {
    if(conn) conn.release();
  }
};




/* ----------------------------------------------------------------
                            INSERT 영역
----------------------------------------------------------------*/

/**
 * ✨ 등록화면 내 버튼 클릭시 데이터 저장 시도
 * --------------------------------------
 * @name createInternalData
 * @description 등록 클릭시 모드 구분 및 Insert 혹은 Update 진행
 */
export const createExternalData = async (data) => {
  const mode = data.query.mode;
  const reqId = data.query.request_id;
  console.log(`[Mode / ID 감지] : ${mode}, ${reqId}`);
  console.log(`[Data] : ${data.body.sampleInfo}`);

  const sampleInfo = data.body.sampleInfo;
  console.log(`\n--sampleInfo : ${sampleInfo.external_item_name_kr}`);

  let maxValue;
  let labSerl;
  let isStart, isFin = 0;
  let externalID;

  console.log(`❓ 필수목록 검증 : ${sampleInfo.external_must_value}`);

  // 🙌 필수목록검증
  if (sampleInfo.external_must_value=="external_etc") {
    utils.checkExternalRequiredValue(sampleInfo.external_remark_etc, "external_remark_etc", "기타 사유");
  }

  // ■ 성분코드 기입 필수 (무조건)
  console.log(`\n-- Must Value : Ingredient Code`);
  utils.checkExternalRequiredValue(sampleInfo.external_item_name_kr, "external_item_name_kr", "품명(국문)"); 
  utils.checkExternalRequiredValue(sampleInfo.external_remark_reason, "external_remark_reason", "사유"); 

  utils.checkExternalRequiredValue(sampleInfo.external_item_name_en, "external_item_name_en", "품명(영문)"); 
  utils.checkExternalRequiredValue(sampleInfo.external_item_type, "external_item_type", "제품 유형"); 
  utils.checkExternalRequiredValue(sampleInfo.external_issue_class, "external_issue_class", "발급 구분"); 
  utils.checkExternalRequiredValue(sampleInfo.external_cost_from, "external_cost_from", "비용 처리"); 
  utils.checkExternalRequiredValue(sampleInfo.external_is_photo, "external_is_photo", "완제품 사진 등록 여부"); 

  const labNo = utils.toStringOrEmpty(sampleInfo.external_lab_no);
  
  let conn;

  try {
    conn = await getPool().getConnection();

    await conn.beginTransaction();
    
    
    let getLabSerl = await externalQuery.getExternalLabSerl(conn, labNo);

    labSerl = Number(getLabSerl.result);

    // ⭐ DB 기입 진행할 Seq, LabVer 구하기
    if (!mode) {
      console.log(`🛜 Create 모드 진입`);
      console.log(`\n-- labSerl ver.1 : ${labSerl}`);
      let getMaxValue = await getExternalNextID();
      maxValue = getMaxValue.maxNO;
      labSerl += 1;
      console.log(`\n-- labSerl ver.2 : ${labSerl}`);

      // await conn.rollback();
    } else {
      console.log(`🛜 Update 모드 진입`);
      


    }

    // ⭐ 외부성분분석 데이터 타입 정리
    const preparedRequestInfo = {
      company_id : utils.toStringOrEmpty(sampleInfo.company_id) ?? ""
      ,external_class : utils.toStringOrEmpty(sampleInfo.external_class) ?? ""
      // ,external_request_id : sampleInfo.external_request_id ?? ""
      ,external_request_no : utils.toStringOrEmpty(sampleInfo.external_request_no) ?? ""
      ,external_request_date : utils.formatDateOrNull(sampleInfo.external_request_date) ?? ""
      ,external_request_user : utils.toStringOrEmpty(sampleInfo.external_request_user) ?? ""
      
      ,external_cust_name : utils.toStringOrEmpty(sampleInfo.external_cust_name) ?? ""
      ,external_item_name_en : utils.toStringOrEmpty(sampleInfo.external_item_name_en) ?? ""
      ,external_item_name_kr : utils.toStringOrEmpty(sampleInfo.external_item_name_kr) ?? ""
      ,external_lab_no : utils.toStringOrEmpty(sampleInfo.external_lab_no) ?? ""
      ,external_lab_serl : labSerl
      ,external_lot_no : utils.toStringOrEmpty(sampleInfo.external_lot_no) ?? ""
      ,external_remark_duple : utils.toStringOrEmpty(sampleInfo.external_remark_duple) ?? ""
      ,external_remark_reason : utils.toStringOrEmpty(sampleInfo.external_remark_reason) ?? ""
      ,external_remark_etc : utils.toStringOrEmpty(sampleInfo.external_remark_etc) ?? ""

      ,external_item_type : sampleInfo.external_item_type ?? ""
      ,external_issue_class : sampleInfo.external_issue_class ?? ""
      ,external_cost_from : sampleInfo.external_cost_from ?? ""
      ,external_is_photo : sampleInfo.external_is_photo ?? ""
      ,external_remark_doc : sampleInfo.external_remark_doc ?? ""

      ,external_test_microbe_class : Number(sampleInfo.external_test_microbe_class) ?? null
      ,external_test_anti_class : Number(sampleInfo.external_test_anti_class) ?? null
      ,external_test_remark_anti_etc : sampleInfo.external_test_remark_anti_etc ?? ""
      ,external_test_contact_time : sampleInfo.external_test_contact_time ?? ""
      
      ,external_test_etc_is_content : sampleInfo.external_test_etc_is_content ?? ""
      ,external_test_etc_content : sampleInfo.external_test_etc_content ?? ""
      ,external_test_etc_content_unit : sampleInfo.external_test_etc_content_unit ?? ""
      ,external_test_etc_is_ph : sampleInfo.external_test_etc_is_ph ?? ""
      ,external_test_etc_ph_content : sampleInfo.external_test_etc_ph ?? ""
      ,external_test_etc_is_safety : sampleInfo.external_test_etc_is_safety ?? ""
      ,external_test_is_etc : sampleInfo.external_test_is_etc ?? ""
      ,external_test_remark_etc : sampleInfo.external_test_remark_etc ?? ""
      
      ,external_test_pre_class : Number(sampleInfo.external_test_pre_class) ?? null
      ,external_test_remark_pre : utils.toStringOrEmpty(sampleInfo.external_test_remark_pre) ?? null
      
      ,external_test_deodorant_class : Number(sampleInfo.external_test_deodorant_class) ?? null
      
      ,external_test_start_date : utils.formatDateOrNull(sampleInfo.external_test_start_date) ?? null
      ,external_test_end_date : utils.formatDateOrNull(sampleInfo.external_test_end_date) ?? null
      ,external_test_user : sampleInfo.external_test_user ?? ""
      ,external_test_confirm_user : sampleInfo.external_test_confirm_user ?? ""
      ,external_test_remark_test : sampleInfo.external_test_remark_test ?? ""
      
      ,external_test_status : sampleInfo.external_test_status ?? ""
      
      ,external_must_value : sampleInfo.external_must_value ?? ""

      ,external_last_user : sampleInfo.internal_last_user ?? ""
      ,external_last_date : now
    }

    console.log(`✅ 외부성분분석 데이터 준비 완료.`);

    // ⭐ 모드 기준 Update, Insert 구문 분리
    if (mode) {
      externalID = await externalQuery.updateExternalRequest(conn, preparedRequestInfo, reqId);
    } else {
      externalID = await externalQuery.insertExternalRequest(conn, preparedRequestInfo, maxValue);
    }

    console.log(`\n-- internalID : ${typeof(externalID)}`);
    if(!externalID) throw new Error("외부성분분석 데이터 정보 저장에 실패했습니다.");

    console.log(`🆗 외부성분분석 의뢰 정보 저장 완료 : ${externalID}`);

    // ⭐ Insert / Update 분리 및 실행
    // 🔽 INSERT 구문 실행 🔽
    if(!mode) {

    } 
    // 🔽 UPDATE 구문 실행 🔽
    else {
      
    };

    // ■ 마무리 단계 진입
    console.log(`\n🆗 마무리단계 진입.`);

    await conn.commit();

    return {
      success : true,
      message : `내부성분분석 의뢰/아이템 등록에 성공하였습니다.`,
      result : {
        externalID : externalID,
        time: now
      }

    };

  } catch (err) {
    await conn.rollback();
    throw new Error(`🔴 Service Failed : ${err.message}`);

  } finally {
    conn.release();
  }
  return;
}



/* ----------------------------------------------------------------
                            UPDATE 영역
----------------------------------------------------------------*/


/* ----------------------------------------------------------------
                            CHECK 영역
----------------------------------------------------------------*/


/* ----------------------------------------------------------------
                          DELETE 영역
----------------------------------------------------------------*/