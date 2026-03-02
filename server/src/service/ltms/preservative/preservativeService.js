 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 10.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Preservative Service
  #     @modified : 
  ########################################################## */

import * as preservativeQuery from '../../../repository/sql/ltms/preservative/preservativeQuery.js';
import { updateLabsDepartmentOptions } from '../../../repository/sql/ltms/setting/settingQuery.js';
import { getPool } from '../../../repository/connection.js';
import * as preQuery from '../../../repository/sql/ltms/preservative/preservativeQuery.js';
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

/**
 * ■ DB 삽입시 이전 Max Seq 구하기
 * @returns maxID, maxNO
 */
export const getPreservativeId = async () => {
  const conn = await getPool().getConnection();
  try {
    const queryRequest = await preservativeQuery.getPreservativeId(conn);
  
    const date = new Date();
    const year = String(date.getFullYear()).substring(2,4);
    // const year = '27';
  
    // let maxNO = String(maxValue.maxNO).substring(0,2);
    let presentId = queryRequest.maxID;
    let presentNo = queryRequest.maxNO;
    if (!presentNo) {presentNo = Number(String(Number(year)).padEnd(6,0))};
  
    let presentYear = String(presentNo).substring(0,2);
    
    if (!presentYear) {presentYear = year;};
    console.log("PRESENT year : ", presentYear);
    console.log("PRESENT no : ", presentNo);
  
    if (year > presentYear) {
      console.log("Interrupt by condition : ", year);
      presentNo = Number(String(Number(year)).padEnd(6, 0));
      // maxValue.maxNO = String(Number(year) + 1).padEnd(6, 0);
      // maxValue.maxNO = Number(maxValue.maxNO) + 1;
    }
  
    let resultId = Number(presentId) + 1;
    let resultNo = Number(presentNo) + 1;
    console.log("resultId : ", resultId);
    console.log("presentNo : ", presentNo);
    console.log("resultNo : ", resultNo);
  
    return {
      raw: queryRequest,
      maxID: resultId,
      maxNO: resultNo
    };
  } catch (err) {
    console.error("🔴 Service Error : ", err.message);
    throw new Error("🤷‍♂️ Something went Wrong : ", err);
  } finally {
    if(conn) conn.release();
  }
}

/**
 * ■ DB 삽입시 LabNo Serl 구하기
 * @description 기존에 LabNo 가 존재한다면 차수 증가
 */
export const getPreservativeLabSerl = async (data) => {
  const conn = await getPool().getConnection();
  // const labNo = utils.toStringOrEmpty(data.pre_lab_no);
  const labNo = data;
  console.log("LABNO : ", labNo);
  
  // if (!labNo) { return new Error("EMPTY LABNO"); }
  
  try {
    const result = await preservativeQuery.getPreservativeLabCount(conn, labNo);
    console.log(result);
    
    return {
      labno: result.labno,
      serl: result.serl
    }
  } catch (err) {
    throw new Error("🤷‍♂️ Something went Wrong : ", err);
  } finally {
    if(conn) conn.release();
  }
}

/**
 * ■ 방부력테스트 최초 조회 화면 전체 리스트 조회
 * @name : getPreservativeDataList
 * @description 전체 데이터 DB 조회 후 반환
 */
export const getPreservativeDataList = async (filters) => {
  const conn = await getPool().getConnection();
  console.log("📌 READ SERVICE TEST : ", filters);
  try {
    const data = await preservativeQuery.getPreservativeData(conn, filters);
    const rmData = await preservativeQuery.getPreservativeRMData(conn, filters);
    return { 
      data, 
      rmData,
      count: data.length 
    };
  } catch (err) {
    throw new Error(`🔴 Service Error : ${err.message}`);
  } finally {
    if(conn) conn.release();
  }
};

/**
 * ■ 방부력테스트 상세 내용 조회
 * @name : getPreservativeDataListDetail
 * @description id 기반 데이터 조회 후 반환
 */
export const getPreservativeDataListDetail = async (id) => {
  const conn = await getPool().getConnection();
  console.log("📌 SERVICE TEST[detail]: ", id);

  try {
    const data = await preservativeQuery.getPreservativeDataById(conn, id);
    const rmData = await preservativeQuery.getPreservativeRMDataById(conn, id);
    const sheetData = await preservativeQuery.getPreservativeResultDataById(conn, id);
    const fileData = await preservativeQuery.getPreservativeFileDataById(conn, id);

    console.log(`📌 fileData : ${fileData}`);
    // console.log("📌 rmData TEST : ", rmData);
    const rmArray = rmData.map((item, idx) => ({
      "idx" : idx
      ,"request_id" : item.request_id
      ,"item_no" : item.item_no
      ,"item_rate" : item.item_rate
    }));

    const sheetResult = getSheetDataFromDB(sheetData, "sheet1");

    const fileArray = fileData.map((item, idx) => ({
      "request_id" : item.request_id
      ,"file_id" : item.file_id
      ,"name" : item.file_name
      ,"size" : item.file_size
      ,"type" : item.file_type
      ,"dir" : item.file_dir
    }))

    console.log(`📌 fileArray : ${fileArray}`);

    // const VALUE_MAP = {
    //   day_start: "dateStart",
    //   day7: "date7",
    //   day14: "date14",
    //   day28: "date28",
    //   death7: "deathIn7",
    //   death14: "deathIn14",
    //   death28: "deathIn28",
    // };
    
    // const MODE_MAP = {
    //   // mode 계열도 필요하면 주석 해제해서 사용
    //   mode_start: "dateStartmode",
    //   mode_day7: "date7mode",
    //   mode_day14: "date14mode",
    //   mode_day28: "date28mode",
    //   mode_death7: "deathIn7mode",
    //   mode_death14: "deathIn14mode",
    //   mode_death28: "deathIn28mode",
    // }
    
    // const sheetArray = () => sheetData.reduce((acc, r) => {
    //   const rowId = r.row_id;
    //   const sheet = (acc["sheet1"] ??= {});

    //   Object.entries(MAP).forEach(([dbCol, suffix]) => {
    //     const key = `${rowId}_test_sheet_${suffix}`;
    //     sheet[key] = {
    //       id: key,
    //       name: `pre_${key}`,
    //       value: r[dbCol] ?? "",
    //       mode: "NORMAL"
    //     };
    //   });

    //   return acc;
    // }, {});

    // console.log("📌 rmArray TEST : ", rmArray);
    // console.log(rmArray.map((item, idx) => {
    //   console.log(`원료명 : ${item.item_no}, 순서 : ${idx}`);
    // }));
    const dataResult = {
      // 구분 정보
      "pre_class" : data.class                          

      // 기본정보
      ,"pre_doc_no" : data.request_no                            
      ,"pre_reg_date" : data.request_date                        
      ,"pre_reg_user" : data.request_user_id                          
      ,"pre_cust_name" : data.cust_name                         
      ,"pre_sample_info" : data.sample_info                       
      ,"pre_source" : data.source_type                            
      ,"pre_item_name" : ""                         
      ,"pre_lot_no" : data.lot_no                            
      ,"pre_lab_no" : data.lab_no                            
      ,"pre_lab_ver" : data.lab_serl                           
      ,"pre_remark_duple" : data.remark_duple                      
      ,"pre_remark_reason" : data.remark_reason                     

      // 안정도조건 정보
      ,"pre_stability_time_point" : data.stability_time_point           
      ,"pre_stability_conditions" : data.stability_conditions                
      ,"pre_stability_type" : data.stability_type                     
      ,"pre_stability_remark" : data.remark_stability
      ,"pre_stability_volume" : data.stability_volume                  
      ,"pre_stability_volume_unit" : data.stability_unit             

      // 샘플조건 정보
      ,"pre_sample_item_type" : data.item_type                   
      ,"pre_sample_pack_type" : data.content_type                  
      ,"pre_sample_pack_material" : data.content_material              
      ,"pre_sample_volume" : data.content_qty                     
      ,"pre_sample_volume_unit" : data.content_unit                
      ,"pre_sample_manual" : data.remark_manual      
      ,"pre_remark_sample" : data.issue  
      
      ,"pre_content_ph" : data.ph                         
      ,"pre_content_water" : data.water                      
      ,"pre_content_chelating_agent" : data.edta_2na             
      ,"pre_content_surfactant" : data.surfactant                 
      ,"pre_content_ethanol" : data.ethanol                    
      ,"pre_content_lipid" : data.lipid                      
      ,"pre_content_silicone" : data.silicone                   
      ,"pre_content_powder" : data.powder                     
      ,"pre_content_polyol_sum" : data.polyol_sum                 
      ,"pre_content_glycerine" : data.glycerine                  
      ,"pre_content_propanediol" : data.propanediol                
      ,"pre_content_dpg" : data.dpg                        
      ,"pre_content_pg" : data.pg                         
      ,"pre_content_bg" : data.bg                         
      ,"pre_content_etc" : data.etc                        

      // 시험결과판정 정보
      ,"pre_test_date_start" : data.test_start_date                 
      ,"pre_test_date_expect" : data.test_expect_date                 
      ,"pre_test_date_end" : data.test_end_date                   
      ,"pre_test_user" : data.test_user_id                         
      ,"pre_test_result_interm" : data.result_interm              
      ,"pre_test_result_final" : data.result_final               
      ,"pre_test_remark" : data.remark_test                       
      ,"pre_is_start": data.is_start                           
      ,"pre_is_fin": data.is_fin                             

      // 방부제성분(아이템) 정보

      ,"pre_last_date" : data.last_date                         
      ,"pre_last_user" : data.last_user                         

      ,"pre_must_value": ""             
        ,count: data.length
    };

    const rmResult = rmArray.map((item, idx) => ({
      "request_id" : item.request_id
      ,"idx" : idx
      ,"itemNo" : item.item_no
      ,"itemRate" : item.item_rate
    }));
    console.log(rmResult);

    const fileResult = fileArray.map((item, idx) => ({
      "request_id" : item.request_id
      ,"file_id" : item.file_id
      ,"serl" : idx + 1
      ,"name" : item.name
      ,"type" : item.type
      ,"dir" : item.dir
    }));

    return {
      data: dataResult
      ,rmData: rmResult
      ,sheetData: sheetResult
      ,fileData : fileResult
    }

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "⛓️‍💥Error Occured!", detail: err.message });
  } finally {
    if(conn) conn.release();
  }
}

export const getPreservativeDataDetail = async (id) => {
  const conn = await getPool().getConnection();
  const data = await preservativeQuery.getPreservativeDataById(conn, id);
  if (!data) throw new Error('해당 데이터를 찾을 수 없습니다');
  return data;
};

/**
 * ■ 방부력테스트 데이터 생성
 * @description 필수 사항 검증 후 Insert 구문 진행
 */
export const createPreservativeData = async (data) => {
  // const { sampleInfo, rmInfo, testInfo, fileInfo } = data;
  const mode = data.query.mode;
  const requestId = data.query.request_id;
  console.log("📌 Requested ID : ",requestId);

  console.log("📌 MODE TEST : ",mode);
  const sampleInfo = JSON.parse(data.body.sampleInfo);
  const rmInfo = JSON.parse(data.body.rmInfo);
  const testInfo = JSON.parse(data.body.testInfo);
  const fileInfo = JSON.parse(data.body.fileInfo);
  const keepFileData = JSON.parse(data.body.keepFiles || "[]");
  const fileData = data.files;
  console.log("📌 DATA[sampleInfo] TEST : ", sampleInfo);
  console.log("📌 DATA[rmInfo] TEST : ", rmInfo);
  console.log("📌 DATA[testInfo] TEST : ", testInfo);
  console.log("📌 DATA[fileInfo] TEST : ", fileInfo);
  console.log("📌 DATA[fileData] TEST : ", fileData);
  console.log(`📌 DATA[keepFiles] : ${keepFileData}`);

  // console.log("📌 DATA TEST : ", fileInfo[0] instanceof Blob);
  // console.log("📌 DATA TEST : ", data[0].sampleInfo);
  // console.log("📌 DATA TEST : ", sampleInfo);
  // console.log("📌 DATA TEST : ", rmInfo);
  
  /**
   * 필수사항검증
   * @description 구분값에 따른 sampleInfo, 원료여부에 따른 rmInfo 필수 사항 검증
   */
  utils.checkPreRequiredValue(sampleInfo.pre_class, "pre_class", "구분값");
  switch (sampleInfo.pre_must_value) {
    case "lab" :
      console.log("case LAB");
      utils.checkPreRequiredValue(sampleInfo.pre_lab_no, 'pre_lab_no', "Lab No.");
      break;
      
    case "lot" :
      console.log("case LOT");
      utils.checkPreRequiredValue(sampleInfo.pre_lot_no, "pre_lot_no", "Lot No.");
      break;
      
    case "both" :
      console.log("case BOTH");
      utils.checkPreRequiredValue(sampleInfo.pre_lot_no, "pre_lot_no", "Lot No.");
      utils.checkPreRequiredValue(sampleInfo.pre_lab_no, "pre_lab_no", "Lab No.");
      break;
  }
  utils.checkPreRequiredValue(sampleInfo.pre_remark_reason, "pre_remark_reason", '사유');

  if(sampleInfo.pre_class == 2) {
    utils.checkPreRequiredValue(sampleInfo.pre_stability_time_point, "pre_stability_time_point", "[안정도] Time Point");
    utils.checkPreRequiredValue(sampleInfo.pre_stability_conditions, "pre_stability_conditions", "[안정도] Conditions");
  }

  console.log("■ rmInfo CHECK : ", rmInfo[0].name);
  utils.checkPreRequiredValue(rmInfo[0].name, "pre_rm_1_name", '원료명');
  
  // console.log('📝 방부력테스트 데이터 생성 요청 정보:', data);
  console.log('📆 FROM date : ', now);
  
  // polyol sum 값 별도 계산
  const sum = (Number(sampleInfo.pre_content_glycerine ?? 0) + Number(sampleInfo.pre_content_propanediol ?? 0) + Number(sampleInfo.pre_content_dpg ?? 0) + Number(sampleInfo.pre_content_pg ?? 0) + Number(sampleInfo.pre_content_bg ?? 0) + Number(sampleInfo.pre_content_etc ?? 0)).toFixed(3);


  let maxValue = null;
  let labSerl = await getPreservativeLabSerl(utils.toStringOrEmpty(sampleInfo.pre_lab_no));
  console.log("Original labSerl : ", Number(labSerl.serl));
  labSerl = Number(labSerl.serl);
  
  if (!mode) {
    maxValue = await getPreservativeId();
    labSerl = labSerl + 1;
  }
  console.log("maxValue TEST : ", maxValue);
  console.log("labSerl ver1. : ", labSerl);
  console.log("labSerl ver2. : ", labSerl);

  let status = 0;
  let isFin = 0;

  if(sampleInfo.pre_test_date_start) {
    status = 1;
  }

  let conn;
  
  try {

    conn = await getPool().getConnection();

    await conn.beginTransaction();

    // ■ 샘플정보 타입 정리
    const preparedRequestInfo = {
      pre_class: utils.toNumberOrNull(sampleInfo.pre_class)
      ,pre_doc_no: utils.toStringOrEmpty(sampleInfo.pre_doc_no)
      ,pre_reg_date: now
      ,pre_reg_user: utils.toStringOrEmpty(sampleInfo.pre_reg_user)
      ,pre_cust_name: utils.toStringOrEmpty(sampleInfo.pre_cust_name)
      ,pre_sample_info: utils.toNumberOrNull(sampleInfo.pre_sample_info)
      ,pre_item_name: utils.toStringOrEmpty(sampleInfo.pre_item_name)
      ,pre_lot_no: utils.toStringOrEmpty(sampleInfo.pre_lot_no)
      ,pre_lab_no: utils.toStringOrEmpty(sampleInfo.pre_lab_no)
      ,pre_lab_ver: labSerl
      ,pre_source: utils.toStringOrEmpty(sampleInfo.pre_source)
      ,pre_remark_duple: utils.toStringOrEmpty(sampleInfo.pre_remark_duple)
      ,pre_remark_reason: utils.toStringOrEmpty(sampleInfo.pre_remark_reason)

      ,pre_stability_time_point: utils.toStringOrEmpty(sampleInfo.pre_stability_time_point)
      ,pre_stability_conditions: utils.toStringOrEmpty(sampleInfo.pre_stability_conditions)
      ,pre_stability_type: utils.toNumberOrNull(sampleInfo.pre_stability_type)
      ,pre_stability_remark: utils.toStringOrEmpty(sampleInfo.pre_stability_remark)
      ,pre_stability_volume: utils.toNumberOrNull(sampleInfo.pre_stability_volume)
      ,pre_stability_volume_unit: utils.toNumberOrNull(sampleInfo.pre_stability_volume_unit)

      ,pre_sample_item_type: utils.toStringOrEmpty(sampleInfo.pre_sample_item_type)
      ,pre_sample_ph: utils.toNumberOrNull(sampleInfo.pre_sample_ph)
      ,pre_sample_pack_type: utils.toStringOrEmpty(sampleInfo.pre_sample_pack_type)
      ,pre_sample_pack_material: utils.toStringOrEmpty(sampleInfo.pre_sample_pack_material)
      ,pre_sample_volume: utils.toNumberOrNull(sampleInfo.pre_sample_volume)
      ,pre_sample_volume_unit: utils.toStringOrEmpty(sampleInfo.pre_sample_volume_unit)
      ,pre_sample_manual: utils.toStringOrEmpty(sampleInfo.pre_sample_manual)
      ,pre_remark_sample: utils.toStringOrEmpty(sampleInfo.pre_remark_sample)

      ,pre_content_ph: utils.toNumberOrNull(sampleInfo.pre_content_ph)
      ,pre_content_water: utils.toNumberOrNull(sampleInfo.pre_content_water)
      ,pre_content_chelating_agent: utils.toNumberOrNull(sampleInfo.pre_content_chelating_agent)
      ,pre_content_surfactant: utils.toNumberOrNull(sampleInfo.pre_content_surfactant)
      ,pre_content_ethanol: utils.toNumberOrNull(sampleInfo.pre_content_ethanol)
      ,pre_content_lipid: utils.toNumberOrNull(sampleInfo.pre_content_lipid)
      ,pre_content_silicone: utils.toNumberOrNull(sampleInfo.pre_content_silicone)
      ,pre_content_powder: utils.toNumberOrNull(sampleInfo.pre_content_powder)
      // ,pre_content_polyol_sum: utils.toNumberOrNull(sampleInfo.pre_content_polyol_sum)
      ,pre_content_polyol_sum: sum
      ,pre_content_glycerine: utils.toNumberOrNull(sampleInfo.pre_content_glycerine)
      ,pre_content_propanediol: utils.toNumberOrNull(sampleInfo.pre_content_propanediol)
      ,pre_content_dpg: utils.toNumberOrNull(sampleInfo.pre_content_dpg)
      ,pre_content_pg: utils.toNumberOrNull(sampleInfo.pre_content_pg)
      ,pre_content_bg: utils.toNumberOrNull(sampleInfo.pre_content_bg)
      ,pre_content_etc: utils.toNumberOrNull(sampleInfo.pre_content_etc)

      ,pre_test_date_start: utils.toDateOrNull(sampleInfo.pre_test_date_start)
      ,pre_test_date_expect: utils.toDateOrNull(sampleInfo.pre_test_date_expect)
      ,pre_test_date_end: utils.toDateOrNull(sampleInfo.pre_test_date_end)
      ,pre_test_user: utils.toNumberOrNull(sampleInfo.pre_test_user)
      ,pre_test_result_interm: utils.toNumberOrNull(sampleInfo.pre_test_result_interm)
      ,pre_test_result_final: utils.toNumberOrNull(sampleInfo.pre_test_result_final)
      ,pre_test_remark: utils.toStringOrEmpty(sampleInfo.pre_test_remark)

      ,pre_last_user: utils.toNumberOrNull(sampleInfo.pre_last_user)
      ,pre_last_date: now

      // pre_is_testing
      // pre_is_fin
      // ,pre_is_start: isStart
      // ,pre_is_fin: isFin
      ,pre_test_status: utils.toStringOrEmpty(sampleInfo.pre_test_status)
    };

    console.log('🛠️ 방부력테스트 의뢰 정보 준비 완료.');

    let preservativeId = null;

    if (mode) {
      console.log("update 모드 진입");
      console.log("📌 requestId 확인 : ", requestId);
      preservativeId = await preQuery.updatePreservativeRequest(conn, preparedRequestInfo, requestId);
    } else {
      console.log("create 모드 진입");
      preservativeId = await preQuery.insertPreservativeRequest(conn, preparedRequestInfo, maxValue);
    }

    if(!preservativeId) throw new Error("방부력테스트 데이터 정보 저장에 실패했습니다");

    console.log('🆗 방부력테스트 의뢰 정보 저장 완료. preservativeId:', preservativeId);

    // ■ 방부력테스트 아이템정보 데이터 정리
    const preservativeItems = rmInfo.map(item => ({
      company_id : 1
      ,request_id : preservativeId
      ,item_id : 1234
      ,item_no : utils.toStringOrEmpty(item.name)
      ,item_rate : utils.toNumberOrNull(item.value)
      ,last_user_id : 231004
      ,last_datetime : now
      ,is_standard_item : 1
    }));
    console.log("📌 방부력테스트 [아이템정보] 확인 : ", preservativeItems);

    // ■ 방부력테스트 시험정보 데이터 정리
    const preservativeResults = Object.values(testInfo.sheet1 ?? {});
    console.log("testInfo.sheet1 데이터확인 : ", preservativeResults);
    // const parseData = 

    const preservativeRows = preservativeResults.reduce((acc, item) => {
      const parts = item.id.split("_");
      const row_id = parts[0];
      const field = parts[3];
      const value = item.value;
      const mode = item.mode;

      if (!acc[row_id]) {
        acc[row_id] = {
          company_id : "1"
          ,request_id : preservativeId
          ,row_id
          ,last_datetime : now
          // ,mode : mode
        }
      }

      acc[row_id][field] = value;
      acc[row_id][`${field}mode`] = mode;
      return acc;
    }, {});

    const preservativeResultItems = Object.values(preservativeRows);

    console.log("sheet Item TEST : ",preservativeResultItems);

    // const preservativeResultItems = preservativeResults.map((item) => {
    //   const standard = item.id.split("_");
    //   const name = standard[3];

    //   return {
    //     company_id : 1
    //     ,request_id : preservativeId
    //     ,row_id : item.id[0]
    //     ,row_name : name
    //     ,date_start : name == "dateStart" ? name : ""
    //     ,date_7 : name == "date7" ? name : ??
    //     ,date_14
    //     ,date_28
    //     ,death_in_7
    //     ,death_in_14
    //     ,death_in_28
    //     ,last_user_id
    //     ,last_datetime
    //   }
    // });

    const checkResultData = await preQuery.checkPreResultData(conn, preservativeId);
    const checkFileData = await preQuery.checkPreFileData(conn, preservativeId);
    const checkResultDataCount = Number(checkResultData.count);
    const checkFileDataCount = Number(checkFileData.count);
    console.log("📌 COUNT [checkResultData] : ", checkResultDataCount);
    console.log("📌 COUNT [checkFileData] : ", checkFileDataCount);

    let itemResult ;
    // mode 가 없을경우(create 일 경우)
    if(!mode) {
      // ■ 방부력테스트 원료 정보 데이터 삽입
      itemResult = await preQuery.insertPreservativeItems(conn, preservativeItems);
      console.log('🆗 방부력테스트 아이템 정보 저장 완료. itemResult:', itemResult);

      // ■ 방부력테스트 시험결과 데이터 삽입
      if(preservativeResultItems.length > 0) {
        console.log("📌 checkResultData : ", checkResultDataCount);
        console.log("❓ Is PreservativeResultItems list exist? ", preservativeResultItems);
        const preservativeResult = await preQuery.insertPreservativeResults(preservativeResultItems);
  
        console.log("🆗 방부력테스트 시험결과 데이터 생성완료.", preservativeResult);
      } 

      // ■ 방부력테스트 첨부파일 데이터 삽입
      if(fileData.length > 0) {
        console.log("📌 checkFileData : ", checkFileDataCount);
        // const preservativeFileCount = await preQuery.getPreservativeFileCount();
        // const count = Number(preservativeFileCount.count) + 1;
        const preservativeFile = await preQuery.insertPreservativeFiles(conn, preservativeId, fileData, now);

        console.log("🆗 방부력테스트 파일 데이터 DB 삽입 완료.", preservativeFile);
      }
    } 
    // mode 가 있을경우(update일 경우)
    else {
      // ■ 방부력테스트 원료 정보 데이터 업데이트
      itemResult = await preQuery.updatePreservativeItems(conn, preservativeItems, preservativeId);
      console.log('🆗 방부력테스트 아이템 정보 업데이트 완료. itemResult:', itemResult);

      // ■ 방부력테스트 시험결과 데이터 업데이트
      if(checkResultDataCount > 0) {
        console.log("📌 checkResultData : ", checkResultDataCount);
        console.log("❓ Is PreservativeResultItems list exist? ", preservativeResultItems);
        const preservativeResult = await preQuery.updatePreservativeResults(conn, preservativeResultItems, preservativeId);
  
        console.log("📌 PreservativeId : ", preservativeId);
        console.log("🟢 [기존데이터 있음] 방부력테스트 시험결과 데이터 업데이트 완료.", preservativeResult);
      } 
      else if (preservativeResultItems.length > 0){
        console.log("📌 checkResultData : ", checkResultDataCount);
        console.log("❓ Is PreservativeResultItems list exist? ", preservativeResultItems);
        const preservativeResult = await preQuery.insertPreservativeResults(conn, preservativeResultItems);
        console.log("🟢 [기존데이터 없음] 방부력테스트 시험결과 데이터 삽입 완료.", preservativeResult);
      }
      
      // ■ 방부력테스트 첨부파일 데이터 업데이트
      if(checkFileDataCount > 0) {
        // if(fileData.length > 0){
          console.log("📌 checkFileData : ", checkFileDataCount);
          // const preservativeFileCount = await preQuery.getPreservativeFileCount();
          // const count = Number(preservativeFileCount.count) + 1;

  
          // const oldFiles = await preQuery.getPreservativeFileDataById(conn, preservativeId);
          // const oldFileIds = oldFiles.map(item => ([
          //   item.file_id
          // ]));

          const fileIds = keepFileData.map(i => ([
            i.file_id
          ]));
          console.log(`📌 fileIds: ${fileIds}`);

          const preservativeFile = await preQuery.updatePreservativeFiles(conn, preservativeId, fileIds, fileData, now);
  
          console.log("🆗 방부력테스트 파일 데이터 DB 업데이트 완료.", preservativeFile);
        // }
      } 
      else if(fileData.length > 0){
        console.log("📌 checkFileData : ", checkFileDataCount);
        console.log(`📌 fileData : ${fileData}`);
        const preservativeFile = await preQuery.insertPreservativeFiles(conn, preservativeId, fileData, now);

        console.log("🆗 방부력테스트 파일 데이터 DB 삽입 완료.", preservativeFile);
      }
    }

    
    // let fileList ;
    // const fileTest = fileInfo.map((item, idx) => ([
    //   idx
    //   ,item.name
    //   ,item.size
    //   ,item.type
    //   ,item.lastModified
    //   ,item.lastModifiedDate
    // ]));

    // const fileData = fileInfo.map((item, idx) => [
    //   1
    //   ,preservativeId
    //   ,idx
    //   ,item.name
    //   ,item.size
    //   ,item.type
    //   ,item.lastModified
    //   ,item.lastModifiedDate
    // ]);
    // console.log("📌 fileInfo TEST : ", fileData);
    // console.log("📌 fileInfo TEST2 : ", fileTest);
    // console.log("📌 fileInfo.name TEST : ", ...fileInfo);
    // console.log("📌 fileInfo typeof TEST : ", typeof(fileInfo));


    await conn.commit();
    console.log('✅ 방부력테스트 데이터 생성 완료. preservativeId:', preservativeId);

    return {
      success: true,
      message: '방부력테스트 의뢰/아이템 등록이 성공적으로 등록되었습니다.',
      result: {
        preservative_id : preservativeId
        ,item_result : itemResult
      }
    }

  } catch(err) {
    await conn.rollback();
    console.error("💥 방부력테스트 데이터 생성/업데이트 실패.", err);
    throw new Error("💥 방부력테스트 데이터 생성/업데이트 실패.", err.message);
  } finally {
    conn.release();
  }

  return await preservativeQuery.createPreservativeData(data);
};

/**
 * ■ Sheet 데이터 조회 및 State 반환 기능
 * @name : getSheetDataFromDB
 * @description Sheet 데이터 DB 조회 및 State에 맞는 형식으로 변경 후 반환
 */
export function getSheetDataFromDB(rows = [], sheetKey = "sheet1") {
  const FIELDS = [
    { field: "dateStart", valueCol: "day_start", modeCol: "mode_start" }
    ,{ field: "date7",     valueCol: "day7",       modeCol: "mode_day7" }
    ,{ field: "date14",    valueCol: "day14",      modeCol: "mode_day14" }
    ,{ field: "date28",    valueCol: "day28",      modeCol: "mode_day28" }

    ,{ field: "deathIn7",  valueCol: "death7",     modeCol: "mode_death7" }
    ,{ field: "deathIn14", valueCol: "death14",    modeCol: "mode_death14" }
    ,{ field: "deathIn28", valueCol: "death28",    modeCol: "mode_death28" }
  ]

  const TNTC_BG = "preservative-create-labNoClass";

  return rows.reduce((acc,r) => {
    const rowId = r.row_id;
    const sheet = (acc[sheetKey] ??= {});

    for (const { field, valueCol, modeCol } of FIELDS) {
      const id = `${rowId}_test_sheet_${field}`;
      const mode = (r[modeCol] ?? "NORMAL");

      const value = mode === "TNTC" ? "∞" : (r[valueCol] ?? "");
      const name = mode === "TNTC" ? `pre_${id}_tntc` : `pre_${id}`;

      sheet[id] = {
        id
        ,name
        ,value: String(value)
        ,mode,
        ...(mode === "TNTC" ? { disabled: true, background: TNTC_BG } : {}),
      };
    }

    return acc;
  }, {})
}

/**
 * ■ 방부력테스트 시험상태값 업데이트
 * @name : updatePreservativePhysInfo
 * @description 시험완료/취소 버튼을 통한 별도 업데이트 기능 
 */
export const updatePreservativeData = async (id, data) => {
  console.log("📌 방부력테스트 시험상태값 업데이트 서비스 진입 완료.");
  console.log(`-- Request ID : ${id} --`);
  console.log(`-- Request DATA : ${data} --`);
  
  const sampleInfo = JSON.parse(data.body.sampleInfo);
  const rmInfo = JSON.parse(data.body.rmInfo);
  const testInfo = JSON.parse(data.body.testInfo);
  const fileInfo = JSON.parse(data.body.fileInfo);
  const fileData = data.files;
  console.log("📌 DATA TEST : ", sampleInfo);
  // console.log("📌 DATA TEST(pre_class) : ", sampleInfo.pre_class);
  console.log("📌 DATA TEST : ", rmInfo);
  console.log("📌 DATA TEST : ", testInfo);
  console.log("📌 DATA FILE TEST : ", fileInfo);
  console.log("📌 DATA FILE DATA TEST : ", fileData);



}

export const deletePreservativeData = async (id) => {
  return await preservativeQuery.deletePreservativeData(id);
};
