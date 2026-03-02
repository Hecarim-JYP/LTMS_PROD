 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 23.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Internal Service
  #     @modified : 
  ########################################################## */

  
import { getPool } from '../../../repository/connection.js';

import * as internalQuery from '../../../repository/sql/ltms/internal/internalQuery.js';
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

/**
 * ✨ 조회시 필요한 Request_id 데이터 조회
 * --------------------------------------
 * @name getInternalNextID
 * @description 상세 화면 진입시 해당 서비스로 ID 확인 필요
 */
export const getInternalNextID = async () => {
  const conn = await getPool().getConnection();

  try {
    const result = await internalQuery.getInternalID(conn)
  } catch (err) {

  }


};

/**
 * ✨ 최초 조회 화면 진입시 전체 데이터 조회
 * --------------------------------------
 * @name getInternalDataList
 * @description 조건 없이 테이블 조회 후 전체 데이터 반환
 */
export const getInternalDataList = async (filters) => {
  const conn = await getPool().getConnection();
  
  try {
    const result = await internalQuery.getInternalData(conn, filters);
    const rmResult = await internalQuery.getInternalRMData(conn, filters);
    console.log(`🟠 전체 데이터 쿼리 조회 성공.`);
    return {
      result
      ,rmResult
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
 * @name getInternalDataDetail
 * @description 조회화면 → 등록화면 점프 이동시 내부 상세 정보 리스트 조회
 * @param { Number } id
 */
export const getInternalDataListDetail = async (id) => {
  const conn = await getPool().getConnection();

  try {
    const data = await internalQuery.getInternalDataById(conn, id);
    const rmData = await internalQuery.getInternalRMDataById(conn, id);
    const fileData = await internalQuery.getInternalFileDataById(conn, id);

    console.log(`--data : ${JSON.stringify(data)}`);
    // console.log(`--data : ${data[0].lab_no}`);
    console.log(`--rmData : ${JSON.stringify(rmData)}`);
    console.log(`--fileData : ${JSON.stringify(fileData)}`);

    // ■ 원료(성분) 데이터 배열화
    const rmArray = rmData.map((item, idx) => ({
      "idx" : idx
      ,"request_id" : item.request_id
      ,"ing_no" : item.ing_no
      ,"ing_name" : item.ing_name
      ,"ing_rate" : item.ing_rate
    }));

    // ■ 파일 데이터 배열화
    const fileArray = fileData.map((item, idx) => ({
      "idx" : idx
      ,"request_id" : item.request_id
      ,"file_id" : item.file_id
      ,"name" : item.file_name
      ,"size" : item.file_size
      ,"type" : item.file_type
      ,"dir" : item.file_dir
    }));

    // ■ 최종 데이터 정리
    const dataResult = {
      "company_id" : data.company_id
      ,"internal_request_id" : data.request_id
      ,"internal_request_no" : data.request_no
      ,"internal_request_date" : data.request_date
      ,"internal_request_user" : data.request_user
      ,"internal_class" : data.class
      ,"internal_item_no" : data.item_no
      ,"internal_item_name" : data.item_name
      ,"internal_lab_no" : data.lab_no
      ,"internal_lab_serl" : data.lab_serl
      ,"internal_lot_no" : data.lot_no
      ,"internal_is_duple" : data.is_duple
      ,"internal_remark_duple" : data.remark_duple
      ,"internal_remark_reason" : data.remark_reason
      ,"internal_remark_sample_info" : data.remark_sample_info
      ,"internal_remark" : data.remark

      ,"internal_ph_std" : data.ph_std
      ,"internal_ph1_1" : data.ph1_1
      ,"internal_ph1_2" : data.ph1_2
      ,"internal_ph1_3" : data.ph1_3
      ,"internal_ph2_1" : data.ph2_1
      ,"internal_ph2_2" : data.ph2_2
      ,"internal_ph2_3" : data.ph2_3
      ,"internal_ph3_1" : data.ph3_1
      ,"internal_ph3_2" : data.ph3_2
      ,"internal_ph3_3" : data.ph3_3

      ,"internal_test_start_date" : data.test_start_date
      ,"internal_test_end_date" : data.test_end_date
      ,"internal_test_user" : data.test_user
      ,"internal_test_status" : data.test_status
      // ,"internal_is_start" : 0
      // ,"internal_is_fin" : 0
      ,"internal_remark_test" : data.remark_test
      ,"internal_last_user" : data.last_user
      ,"internal_last_date" : data.last_date

      ,"internal_must_value" : ""
    };

    const rmResult = rmArray.map((item, idx) => ({
      "request_id" : item.request_id
      ,"idx" : idx
      ,"ing_no" : item.ing_no
      ,"ing_name" : item.ing_name
      ,"ing_rate" : item.ing_rate
    }));

    const fileResult = fileArray.map((item, idx) => ({
      "request_id" : item.request_id
      ,"file_id" : item.file_id
      ,"serl" : idx + 1
      ,"name" : item.name
      ,"type" : item.type
      ,"dir" : item.dir
    }));

    console.log(`dataResult : ${JSON.stringify(dataResult)}`);

    return {
      data: dataResult
      ,rmData : rmResult
      ,fileData : fileResult
    }

  } catch (err) {
    throw new Error(`🔴 Service Failed : ${err.message}`);

  } finally {
    if(conn) conn.release();
  }
};


/**
 * ✨ 등록화면 내 버튼 클릭시 데이터 저장 시도
 * --------------------------------------
 * @name createInternalData
 * @description 등록 클릭시 모드 구분 및 Insert 혹은 Update 진행
 */
export const createInternalData = async (data) => {
  const mode = data.query.mode;
  const reqId = data.query.request_id;
  console.log(`[Mode / ID 감지] : ${mode}, ${reqId}`);
  console.log(`[Data] : ${JSON.parse(data.body.sampleInfo)}`);

  const sampleInfo = JSON.parse(data.body.sampleInfo);
  const rmInfo = JSON.parse(data.body.rmInfo);
  const fileData = data.files;

  console.log(`\n--fileData : ${JSON.stringify(fileData)}`);

  const rmArray = Object.values(rmInfo);
  const rmTemp = rmArray.map(item => ({
    ing_no : item.ing_no
  }));
  console.log(`\n-- rmArray : ${rmArray}`);
  console.log(`\n-- rmTemp : ${JSON.stringify(rmTemp)}`);
  
  const keepFiles = JSON.parse(data.body.keepFiles || "[]");

  let maxValue;
  let labSerl;
  let isStart, isFin = 0;
  let internalID;

  console.log(`❓ 필수목록 검증 : ${sampleInfo.internal_must_value}`);

  // 🙌 필수목록검증
  switch(sampleInfo.internal_must_value) {
    case "lab" : 
      console.log(`-- Must Value : LABNO`);
      utils.checkInternalRequiredValue(sampleInfo.internal_lab_no, "internal_lab_no", "Lab No"); break;

    case "lot" : 
      console.log(`-- Must Value : LOTNO`);
      utils.checkInternalRequiredValue(sampleInfo.internal_lot_no, "internal_lot_no", "Lot No"); break;

    case "item" :
      console.log(`-- Must Value : ITEM`);
      utils.checkInternalRequiredValue(sampleInfo.internal_item_name, "internal_item_name", "품명"); break;

    case "duple" :
      console.log(`-- Must Value : Remark_DUPLE`);
      utils.checkInternalRequiredValue(sampleInfo.internal_remark_duple, "internal_remark_duple", "중복사유"); break;
      
  };
  // ■ 성분코드 기입 필수 (무조건)
  console.log(`\n-- Must Value : Ingredient Code`);
  utils.checkInternalRequiredValue(rmTemp.ing_no, "int_rm_0_code", "성분코드"); 

  const labNo = utils.toStringOrEmpty(sampleInfo.internal_lab_no);
  
  let conn;

  try {
    conn = await getPool().getConnection();

    await conn.beginTransaction();

    labSerl = await internalQuery.getInternalLabSerl(conn, labNo);
    labSerl = Number(labSerl.result);

    // ⭐ DB 기입 진행할 Seq, LabVer 구하기
    if (!mode) {
      console.log(`🛜 Create 모드 진입`);
      console.log(`\n-- labSerl ver.1 : ${labSerl}`);
      maxValue = await internalQuery.getInternalMaxValue(conn);
      labSerl += 1;
      console.log(`\n-- labSerl ver.2 : ${labSerl}`);

      // await conn.rollback();
    } else {
      console.log(`🛜 Update 모드 진입`);


    }

    console.log(`\n-- Req Date : ${sampleInfo.internal_request_date}`);

    // ⭐ 내부성분분석 데이터 타입 정리
    const preparedRequestInfo = {
      company_id : sampleInfo.company_id ?? ""
      ,internal_request_id : utils.toNumberOrNull(sampleInfo.internal_request_id)
      ,internal_request_no : utils.toStringOrEmpty(sampleInfo.internal_request_no)
      ,internal_request_date : today
      ,internal_request_user : sampleInfo.request_user ?? ""
      ,internal_class : utils.toNumberOrNull(sampleInfo.internal_class)
      ,internal_item_no : utils.toStringOrEmpty(sampleInfo.item_no)
      ,internal_item_name : utils.toStringOrEmpty(sampleInfo.internal_item_name)
      ,internal_lab_no : sampleInfo.internal_lab_no ?? ""
      ,internal_lab_serl : labSerl
      ,internal_lot_no : sampleInfo.internal_lot_no ?? ""
      ,internal_is_duple : sampleInfo.internal_is_duple ?? ""
      ,internal_remark_duple : sampleInfo.internal_remark_duple ?? ""
      ,internal_remark_reason : sampleInfo.internal_remark_reason ?? ""
      ,internal_remark_sample_info : sampleInfo.internal_remark_sample_info ?? ""
      ,internal_remark : sampleInfo.internal_remark ?? ""
      ,internal_ph_std : sampleInfo.internal_ph_std ?? ""
      ,internal_ph1_1 : sampleInfo.internal_ph1_1 ?? ""
      ,internal_ph1_2 : sampleInfo.internal_ph1_2 ?? ""
      ,internal_ph1_3 : sampleInfo.internal_ph1_3 ?? ""
      ,internal_ph2_1 : sampleInfo.internal_ph2_1 ?? ""
      ,internal_ph2_2 : sampleInfo.internal_ph2_2 ?? ""
      ,internal_ph2_3 : sampleInfo.internal_ph2_3 ?? ""
      ,internal_ph3_1 : sampleInfo.internal_ph3_1 ?? ""
      ,internal_ph3_2 : sampleInfo.internal_ph3_2 ?? ""
      ,internal_ph3_3 : sampleInfo.internal_ph3_3 ?? ""
      ,internal_test_start_date : sampleInfo.internal_test_start_date ?? null
      ,internal_test_end_date : sampleInfo.internal_test_end_date ?? null
      ,internal_test_status : sampleInfo.internal_test_status ?? null
      ,internal_test_user : sampleInfo.internal_test_user ?? ""
      // ,internal_is_start : sampleInfo.internal_is_start ?? ""
      // ,internal_is_fin : sampleInfo.internal_is_fin ?? ""
      ,internal_remark_test : sampleInfo.internal_remark_test ?? ""
      ,internal_last_user : sampleInfo.internal_last_user ?? ""
      ,internal_last_date : now
    }

    console.log(`✅ 내부성분분석 데이터 준비 완료.`);

    // ⭐ 모드 기준 Update, Insert 구문 분리
    if (mode) {
      internalID = await internalQuery.updateInternalRequest(conn, preparedRequestInfo, reqId);
    } else {
      internalID = await internalQuery.insertInternalRequest(conn, preparedRequestInfo, maxValue);
    }

    console.log(`\n-- internalID : ${typeof(internalID)}`);
    if(!internalID) throw new Error("내부성분분석 데이터 정보 저장에 실패했습니다.");

    console.log(`🆗 내부성분분석 의뢰 정보 저장 완료 : ${internalID}`);

    // ⭐ 내부성분분석 성분 아이템 데이터 정리
    const internalItems = rmArray.map(item => (
      console.log(item), 
      {
      company_id : sampleInfo.company_id
      ,request_id : Number(internalID)
      ,ing_no : String(item.code) ?? null
      ,ing_name : String(item.name) ?? null
      ,ing_rate : Number(item.value) ?? null
      ,last_user : sampleInfo.internal_last_user
      ,last_date : now
    }));


    // ⭐ 내부성분분석 파일 아이템 데이터 정리
    const checkFile = await internalQuery.checkInternalFileData(conn, internalID);
    const checkFileCount = Number(checkFile.count);
    console.log(`✅ 보유 File 개수 확인 : ${checkFileCount} `);

    // ■ 프론트에 기존에 있던 파일
    const fileID = keepFiles.map(i => ([
          i.file_id
    ]));
    // const newFiles = fileData.map(i => ([
    //   i.
    // ]))

    let itemResult ;
    let fileResult ;

    // ⭐ Insert / Update 분리 및 실행
    // 🔽 INSERT 구문 실행 🔽
    if(!mode) {
      if(internalItems.length > 0){
        itemResult = await internalQuery.insertInternalItems(conn, internalItems);
        console.log(`🆗 내부성분분석 아이템 데이터 생성 완료.`);

      }
      if(fileData.length > 0) {
        fileResult = await internalQuery.insertInternalFiles(conn, internalID, fileData, preparedRequestInfo);
        console.log(`🆗 내부성분분석 파일 데이터 생성 완료.`);
      }


    } 
    // 🔽 UPDATE 구문 실행 🔽
    else {
      // ■ 성분이 하나라도 들어있을 때
      if(internalItems.length > 0) {
        console.log(`\n-- rmInfo : ${JSON.stringify(rmInfo)}`);

        // 기존 데이터 조회
        const getIDs = await internalQuery.getInternalItemsID(conn, internalID);
        const itemNOs = getIDs.map((i) => i.ing_no);
        console.log(`❓ itemNOs : ${itemNOs}`);

        // 요청 데이터 중 기존 데이터 제외
        const newRm = rmArray.filter(x => x.id === undefined);
        console.log(`❓ newRm : ${JSON.stringify(newRm)}`);

        // ■ 신규 성분 데이터가 1개 이상 기입되었을 때
        if (newRm.length > 0) {
          const newRmList = newRm.map(item => ({
            company_id : sampleInfo.company_id
            ,request_id : Number(internalID)
            ,ing_no : String(item.code) ?? null
            ,ing_name : String(item.name) ?? null
            ,ing_rate : Number(item.value) ?? null
            ,last_user : sampleInfo.internal_last_user
            ,last_date : now
          }));
          console.log(`❓ newRmList : ${newRmList}`);
  
          // 신규 원료(성분) 데이터 INSERT 시도
          itemResult = await internalQuery.insertInternalItems(conn, newRmList);
        }

        // ■ 성분 데이터가 하나 이상 들어있고 기존 성분 데이터를 삭제했을 때
        else {
          console.log(`\n✅ 성분데이터 삭제 로직 진입`);
          const getIngs = await internalQuery.getInternalRMDataById(conn, internalID);
          const response = getIngs.map((i) => ({
            company_id : i.company_id
            ,request_id : i.request_id
            ,ing_id : i.ing_id
            ,ing_no : i.ing_no
            ,ing_name : i.ing_name
            ,ing_rate : i.ing_rate
            ,last_user : i.last_user
            ,last_date : i.last_date
          }));
          console.log(`\n--response : ${JSON.stringify(response)}`);

          /**
           * ✨ 실제 프론트에 남아있는 성분 데이터
           * @name arrFilter
           * @description 성분 데이터에 삭제가 발생했을시 프론트에 남은 데이터만 DB에 남긴다
           * @return { Object } rmArray.filter
           */
          const arrFilter = rmArray.filter(x => {
            const result = response.map((i) => {
              if (x.code == i.ing_no) return x.code;
            });

            return result;
          });

          const internalCode = arrFilter.map(i => (i.code));
          const condition = internalCode.map(i => i);

          const execute = await internalQuery.deleteNotInternalItemsByID(conn, internalID, condition);

          console.log(`\n🆗 성분 데이터 삭제 쿼리 진행 완료.`);

        }

      }

      // ■ 성분 데이터가 하나라도 없을때
      else {
        // 기존 원료 데이터 개수 조회
        const getIDs = await internalQuery.getInternalItemsID(conn, internalID);
        const itemLength = getIDs.length;

        // 원료가 삭제된 경우
        if (internalItems.length < itemLength){
          const delRm = await internalQuery.deleteNotInternalItemsByID(conn, internalItems.ing_no);
          console.log(`\n 🆗 기존 데이터 중 미포함 데이터 삭제 완료.`);

        } 
      };

      // ■ 파일이 신규 추가 되었을 때
      if(fileData.length > checkFileCount) {
        console.log(`\n--fileData.length : ${fileData.length}`);
        // 기존 보유중인 파일 데이터 조회 후 file_id 분류

        const internalFile = await internalQuery.updateInternalFiles(conn, internalID, fileID, now);

        console.log(`🆗 내부성분분석 파일 데이터 업데이트 완료`);
      }
      // 추가 업로드 한 파일이 있을 때 추가 시도하는 파일만 Insert 시도
      else if (fileData.length > 0) {
        const internalFile = await internalQuery.insertInternalFiles(conn, internalID, fileData, sampleInfo);

        console.log(`🆗 내부성분분석 파일 데이터 생성 완료`);
      }
      
    };

    await conn.commit();

    return {
      success : true,
      message : `내부성분분석 의뢰/아이템 등록에 성공하였습니다.`,
      result : {
        internalID : internalID,
        item_result : itemResult
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

