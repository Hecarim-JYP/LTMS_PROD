 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 10.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Preservative Query List
  #     @modified : 
  ########################################################## */

import { getPool } from '../../../connection.js';

// 법인 전역 코드 설정
const companyId = "1";

/**
 * getPreservativeId
 * @description 전체 데이터 중 MAX id 값 조회 후 반환
 * @returns MAX(request_id), MAX(request_no)
 */
export const getPreservativeId = async (conn) => {
  const query = `
    SELECT  MAX(request_id) as maxID
            ,MAX(request_no) as maxNO
    FROM    preservative_test;
  `;

  try {
    const result = await conn.query(query);
    console.log("Query Result : ", result);
    return {
      query: result[0],
      maxID: result[0].maxID,
      maxNO: result[0].maxNO
    }
  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
};

/**
 * ■ 방부력테스트 내 LabNo Serl 조회
 * @description 방부력테스트 테이블 조회 후 존재여부 카운팅 개수 반환
 */
export const getPreservativeLabCount = async (conn, data) => {
  const query = `
      SELECT  
              COUNT(*)    as  count
              ,lab_no     as  labno
      FROM    preservative_test
      WHERE   lab_no = '${String(data)}';
    `;
  console.log("Query : ", query);

  try {
    const result = await conn.query(query);
    console.log("Query Result : ", result);

    return {
      query: result[0],
      labno: result[0].labno,
      serl: result[0].count
    };

  } catch (err) {
    throw new Error(`🔴 Database Query Failed: ${err.message}`);
  }
}

/**
 * ■ 방부력테스트 내 파일 Id Count 조회
 * @param {*} filters 
 * @returns 
 */
export const getPreservativeFileCount = async (conn) => {
  const query = `
  SELECT  COUNT(*) as count
  FROM    preservative_test_files;
  `
  console.log("Get Preservative File Count Query : ", query);

  try {
    const result = await conn.query(query);
    console.log("Get Preservative File Count Query Result : ", result);

    return {
      query: result[0],
      count: result[0].count
    }
  } catch (err) {
    throw new Error(`🔴 Database Query Failed: ${err.message}`);
  }
}

export const getPreservativeData = async (conn, filters) => {
  const query = `
  SELECT  company_id          as company_id           
          ,case class
            when 0 then '코스메카코리아'
            when 1 then '코스메카차이나/잉글우드랩/기타'
            when 2 then '안정도대응'
          end                 as class     
          ,request_id          as request_id           
          ,request_no          as request_no           
          ,date_format(request_date, '%Y-%m-%d')
                               as request_date             
          ,request_user       as request_user               
          ,cust_id             as cust_id       
          ,cust_name           as cust_name         
          ,lab_no              as lab_no       
          ,lab_serl            as lab_serl         
          ,lot_no              as lot_no       
          ,case source_type
            when 'I' then '내부'
            when 'E' then '외부'
          end                  as source_type           
          ,remark_duple        as remark_duple             
          ,remark_reason       as remark_reason             
          ,water               as water     
          ,ethanol             as ethanol       
          ,lipid               as lipid     
          ,silicone            as silicone         
          ,surfactant          as surfactant           
          ,edta_2na            as edta_2na         
          ,polyol              as polyol       
          ,powder              as powder       
          ,item_type           as item_type         
          ,ph                  as ph   
          ,glycerine           as glycerine         
          ,propanediol         as propanediol           
          ,dpg                 as dpg   
          ,pg                  as pg   
          ,bg                  as bg   
          ,etc                 as etc   
          ,polyol_sum          as polyol_sum           
          ,issue               as issue     
          ,date_format(test_start_date, '%Y-%m-%d')
                               as test_start_date               
          ,date_format(test_end_date, '%Y-%m-%d')
                               as test_end_date             
          ,case result_interm
            when 0 then '부적합'
            when 1 then '적합'
          end                  as result_interm             
          ,case result_final
            when 0 then '부적합'
            when 1 then '적합'
          end                 as result_final             
          ,date_format(test_expect_date, '%Y-%m-%d')
                               as test_expect_date                 
          ,remark_test         as remark_test           
          ,last_user           as last_user         
          ,last_date           as last_date         
          ,item_desc           as item_desc         
          ,content_material    as content_material                 
          ,content_type        as content_type             
          ,content_qty         as content_qty           
          ,content_unit        as content_unit             
          ,remark_manual       as remark_manual             
          ,test_user          as test_user             
          ,test_end_user       as test_end_user     
          ,case status
            when 0 then '대기중'
            when 1 then '시험중'
            when 2 then '시험완료'
          end                   as status_kr
          ,status               as status
  FROM    preservative_test;
  `
  try {
    const result = await conn.query(query);
    return result;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed: ${err.message}`);
  }
};

/**
 * ■ 모든 원료 아이템 구하기
 * @name : getPreservativeRMData
 * @description 조건없이 조회하여 모든 Request의 원료 아이템 반환
 */
export const getPreservativeRMData = async (conn, filters) => {
  const query = `
  SELECT  company_id
          ,request_id
          ,item_id
          ,item_no
          ,item_rate
  FROM    preservative_test_item;
  `;

  try {
    const result = await conn.query(query);
    return result;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}

/**
 * ■ ID별 원료 아이템 구하기
 * @name : getPreservativeRMDataById
 * @description ID를 조건으로 해당하는 Request의 원료 아이템만 반환
 */
export const getPreservativeRMDataById = async (conn, id) => {
  const query = `
  SELECT  company_id
          ,request_id
          ,item_id
          ,item_no
          ,item_rate
  FROM    preservative_test_item
  WHERE   request_id = ${id};
  `

  try {
    const result = await conn.query(query);
    return result;
  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  } 
}

/**
 * ■ 방부력테스트 ID 조건으로 데이터 조회
 * @name : getPreservativeDataById
 * @description 방부력테스트 ID로 DB 조회 후 값 반환
 */
export const getPreservativeDataById = async (conn, id) => {
  const query = `
  SELECT  
          company_id               as company_id           
          ,class                    as class       
          ,request_id               as request_id           
          ,request_no               as request_no           
          ,date_format(request_date, '%Y-%m-%d')             
                                    as request_date             
          ,request_user          as request_user                 
          ,cust_id                  as cust_id         
          ,cust_name                as cust_name           
          ,sample_info              as sample_info             
          ,lab_no                   as lab_no       
          ,lab_serl                 as lab_serl         
          ,lot_no                   as lot_no       
          ,source_type              as source_type             
          ,remark_duple             as remark_duple             
          ,remark_reason            as remark_reason               
          ,stability_time_point     
                                    as stability_time_point
          ,stability_conditions     
                                    as stability_conditions
          ,stability_type           as stability_type               
          ,remark_stability         as remark_stability                 
          ,stability_volume         as stability_volume                 
          ,stability_unit           as stability_unit               
          ,water                    as water       
          ,ethanol                  as ethanol         
          ,lipid                    as lipid       
          ,silicone                 as silicone         
          ,surfactant               as surfactant           
          ,edta_2na                 as edta_2na         
          ,polyol                   as polyol       
          ,powder                   as powder       
          ,item_type                as item_type           
          ,ph                       as ph   
          ,glycerine                as glycerine           
          ,propanediol              as propanediol             
          ,dpg                      as dpg     
          ,pg                       as pg   
          ,bg                       as bg   
          ,etc                      as etc     
          ,polyol_sum               as polyol_sum           
          ,issue                    as issue       
          ,item_desc                as item_desc           
          ,content_material         as content_material                 
          ,content_type             as content_type             
          ,content_qty              as content_qty             
          ,content_unit             as content_unit             
          ,remark_manual            as remark_manual               
          ,remark_sample            as remark_sample               
          ,date_format(test_start_date, '%Y-%m-%d')
                                    as test_start_date                 
          ,date_format(test_expect_date, '%Y-%m-%d')
                                    as test_expect_date                 
          ,date_format(test_end_date, '%Y-%m-%d')
                                    as test_end_date               
          ,test_user                as test_user             
          ,test_end_user            as test_end_user               
          ,case status
            when 0 then '대기중'
            when 1 then '시험중'
            when 2 then '시험완료'
          end                      as status_kr
          ,status                   as status
          ,result_interm            as result_interm               
          ,result_final             as result_final             
          ,remark_test              as remark_test             
          ,last_user                as last_user           
          ,date_format(last_date, '%Y-%m-%d')
                                    as last_date           
  FROM    preservative_test
  WHERE   request_id = ${id}
  `
  
  try {
    const result = await conn.query(query);
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    throw new Error(`🔴 Database Query Failed: ${err.message}`);
  } 
};

/**
 * ■ 방부력테스트 ID 조건으로 시험결과 데이터 조회
 * @name : getPreservativeResultDataById
 * @description 방부력테스트 ID로 DB 조회 후 시험결과 데이터 반환
 */
export const getPreservativeResultDataById = async (conn, id) => {
  const query = `
    SELECT  
            company_id         as   'company_id'             
            ,request_id         as   'request_id'             
            ,row_id             as   'row_id'         
            ,day_start          as   'day_start'           
            ,day7               as   'day7'       
            ,day14              as   'day14'       
            ,day28              as   'day28'       
            ,death7             as   'death7'         
            ,death14            as   'death14'         
            ,death28            as   'death28'         
            ,mode_start         as   'mode_start'             
            ,mode_day7          as   'mode_day7'           
            ,mode_day14         as   'mode_day14'             
            ,mode_day28         as   'mode_day28'             
            ,mode_death7        as   'mode_death7'             
            ,mode_death14       as   'mode_death14'               
            ,mode_death28       as   'mode_death28'               
            ,last_user_id       as   'last_user_id'               
            ,last_datetime      as   'last_datetime'                 
    FROM    preservative_test_result
    WHERE   request_id = ${id}
  `;

  try {
    const rows = await conn.query(query);
    return rows;
  } catch (err) {
    throw new Error(`🔴 Database Query Failed: ${err.message}`);
  }
};

/**
 * ■ 방부력테스트 ID 조건별 파일 데이터 조회
 * @name : getPreservativeFileDataById
 * @description 방부력테스트 ID로 DB 조회 후 파일 데이터 반환
 */
export const getPreservativeFileDataById = async (conn, id) => {
  const query = `
  SELECT  
      company_id         as   'company_id'           
      ,file_id            as   'file_id'       
      ,request_id         as   'request_id'           
      ,file_name          as   'file_name'         
      ,file_type          as   'file_type'         
      ,file_size          as   'file_size'         
      ,file_dir           as   'file_dir'         
      ,last_user_id       as   'last_user_id'             
      ,last_datetime      as   'last_datetime'             
  FROM    preservative_test_files
  WHERE   request_id = ${id}
  `;

  try {
    const rows = await conn.query(query);
    return rows;
  } catch (err) {
    throw new Error(`🔴 Database Query Failed: ${err.message}`);
  }
}

/**
 * ■ 방부력테스트 파일ID 조건별 파일 데이터 조회
 * @name : getPreservativeFileDataByFileId
 * @description 방부력테스트 파일ID 조건으로 조회 후 파일데이터 반환
 */
export const getPreservativeFileDataByFileId = async (conn, fileId) => {
  const query = `
  SELECT  
      company_id         as   'company_id'           
      ,file_id            as   'file_id'       
      ,request_id         as   'request_id'           
      ,file_name          as   'file_name'         
      ,file_type          as   'file_type'         
      ,file_size          as   'file_size'         
      ,file_dir           as   'file_dir'         
      ,last_user_id       as   'last_user_id'             
      ,last_datetime      as   'last_datetime'             
  FROM    preservative_test_files
  WHERE   request_id = ${id}
    AND   file_id in (${fileId})
  `
}


/**
 * ■ preservative_request 테이블 데이터 생성(방부력테스트 기본정보)
 * @name : insertPreservativeRequest
 * @param {*} data 
 * @returns {Promise<Number>} insertId
 */
export const insertPreservativeRequest = async (conn, data, max) => {
  const maxId = Number(max.maxID);
  const maxNo = Number(max.maxNO);
  const query = `
INSERT INTO preservative_test (
    company_id                          
    ,class                              
    ,request_id                         
    ,request_no                         
    ,request_date                       
    ,request_user                    
    ,cust_id    
    ,cust_name  
    ,sample_info                      
    ,lab_no                             
    ,lab_serl                           
    ,lot_no         
    ,source_type                    
    ,remark_duple
    ,remark_reason 

    ,stability_time_point
    ,stability_conditions
    ,stability_type
    ,remark_stability
    ,stability_volume
    ,stability_unit

    ,water                              
    ,ethanol                            
    ,lipid                              
    ,silicone                           
    ,surfactant                         
    ,edta_2na                           
    ,powder     

    ,item_type 
                             
    ,ph                                 
    ,glycerine                          
    ,propanediol                        
    ,dpg                                
    ,pg                                 
    ,bg                                 
    ,polyol_sum                         
    ,etc                                
    ,issue   

    ,content_material                   
    ,content_type                       
    ,content_qty                        
    ,content_unit                       
    ,remark_manual   

    ,test_start_date
    ,test_expect_date                    
    ,test_end_date 
    ,test_user  

    ,status
    ,result_interm                      
    ,result_final                       
    ,remark_test     

    ,last_user                          
    ,last_date   
)                                
  
    VALUES(
      ${companyId}                                 
      ,:pre_class                       
      ,${maxId}                             
      ,${maxNo}                             
      ,:pre_reg_date                    
      ,'231004'          
      ,11015734                      
      ,:pre_cust_name   
      ,:pre_sample_info                             
      ,:pre_lab_no
      ,:pre_lab_ver                                
      ,:pre_lot_no   
      ,:pre_source                 
      ,:pre_remark_duple
      ,:pre_remark_reason

      ,:pre_stability_time_point
      ,:pre_stability_conditions
      ,:pre_stability_type
      ,:pre_stability_remark
      ,:pre_stability_volume
      ,:pre_stability_volume_unit

      ,:pre_content_water               
      ,:pre_content_ethanol             
      ,:pre_content_lipid               
      ,:pre_content_silicone            
      ,:pre_content_surfactant          
      ,:pre_content_chelating_agent     
      ,:pre_content_powder    

      ,:pre_sample_item_type  

      ,:pre_content_ph                   
      ,:pre_content_glycerine           
      ,:pre_content_propanediol         
      ,:pre_content_dpg                 
      ,:pre_content_pg                  
      ,:pre_content_bg                  
      ,:pre_content_polyol_sum         
      ,:pre_content_etc     
      ,:pre_remark_sample               
    
      ,:pre_sample_pack_material        
      ,:pre_sample_pack_type            
      ,:pre_sample_volume               
      ,:pre_sample_volume_unit          
      ,:pre_sample_manual  

      ,:pre_test_date_start 
      ,:pre_test_date_expect            
      ,:pre_test_date_end               
      ,:pre_test_user 

      ,:pre_status
      ,:pre_test_result_interm          
      ,:pre_test_result_final           
      ,:pre_test_remark   

      ,:pre_last_user                   
      ,:pre_last_date   
    )`;

    console.log('🟢 방부력테스트 의뢰 정보 쿼리 저장 완료');

    try {
      const result = await conn.query(query, data);
      const preservativeId = result.insertId.toString();
      return preservativeId;

    } catch (err) {
      console.log("무엇인가 실패했어요", err.message);
      throw new Error(`🔴 Database Query Failed : ${err.message }`);
    } 

}

/**
 * ■ preservative_test_item 테이블 데이터 생성(방부력테스트 아이템 정보)
 * @name : insertPreservativeItem
 * @param {*} conn 
 * @param {*} data 
 */
export const insertPreservativeItems = async (conn, data) => {
  const query = `INSERT INTO preservative_test_item (
    company_id
    ,request_id
    ,item_id
    ,item_no
    ,item_rate
    ,last_user_id
    ,last_datetime
    ,is_standard_item
  )
  VALUES(
    :company_id
    ,:request_id
    ,:item_id
    ,:item_no
    ,:item_rate
    ,:last_user_id
    ,:last_datetime
    ,:is_standard_item  
  )`

  console.log("방부력아이템 쿼리 준비 완료.");

  try {
    const insertPromises = data.map(item => conn.query(query, item));
    console.log("insertPromises 준비 완료");
    const results = await Promise.all(insertPromises);
    console.log("results 준비 완료");
    const insertIds = results.map((result) => result.insertId.toString());
    console.log("insertIds 준비 완료");
  
    return {
      affectedRows : results.length,
      insertedIds : insertIds
    };

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }

};

/**
 * ■ preservative_test_result 테이블 데이터 생성(방부력테스트 시험정보)
 * @name : insertPreservativeResults
 * @param {*} data 
 * @returns 
 */
export const insertPreservativeResults = async (conn, data) => {
  if (!data) {return}
  const COLS = [
    "company_id"
    ,"request_id"
    ,"row_id"
    ,"day_start"
    ,"day7"
    ,"day14"
    ,"day28"
    ,"death7"
    ,"death14"
    ,"death28"
    ,"mode_start"
    ,"mode_day7"
    ,"mode_day14"
    ,"mode_day28"
    ,"mode_death7"
    ,"mode_death14"
    ,"mode_death28"
    ,"last_user_id"
    ,"last_datetime"
  ];

  console.log("📌 data test : ", data);
  console.log("📌 data length test : ", data.length);
  const rows = data.map(r => ([
    r.company_id ?? companyId
    ,r.request_id ?? null
    ,r.row_id ?? null
    ,r.day_start ?? r.dateStart ?? null
    ,r.day7 ?? r.date7 ?? null
    ,r.day14 ?? r.date14 ?? null
    ,r.day28 ?? r.date28 ?? null
    ,r.death7 ?? r.deathIn7 ?? null
    ,r.death14 ?? r.deathIn14 ?? null
    ,r.death28 ?? r.deathIn28 ?? null
    ,r.mode_start ?? r.dateStartmode ?? null
    ,r.mode_day7 ?? r.date7mode ?? null
    ,r.mode_day14 ?? r.date14mode ?? null
    ,r.mode_day28 ?? r.date28mode ?? null
    ,r.mode_death7 ?? r.deathIn7mode ?? null
    ,r.mode_death14 ?? r.deathIn14mode ?? null
    ,r.mode_death28 ?? r.deathIn28mode ?? null
    ,"231004"
    ,r.last_datetime ?? null
  ]));

  const placeholderPerRow = `(${COLS.map(() => "?").join(",")})`;

  const query = `
  INSERT INTO preservative_test_result (${COLS.join(",")})
  VALUES ${rows.map(() => placeholderPerRow).join(",")}
  `;

  console.log("🟠 TEST FOR COLUMNS : ", COLS.join(","));
  console.log("🟠 TEST FOR VALUES : ", rows.map(() => placeholderPerRow).join(","));
  console.log("🟠 TEST FOR ROWS.flat() : ", rows.flat());
  console.log('🟢 방부력테스트 시험결과 정보 쿼리 저장 완료');

  console.log("QUERY TEST: ", query);
  console.log("VALUE TEST: ", data);

  try {
    const params = rows.flat();
    const result = await conn.query(query, params);
    console.log("insertPreservativeResults : ", result);
    return {
      query: query,
      request_id: result
    }

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message }`);
  } 
}

/**
 * ■ preservative_test_files 테이블 데이터 생성(방부력테스트 파일정보)
 * @name : insertPreservativeFiles
 * @param {*} data 
 * @returns 
 */
export const insertPreservativeFiles = async (conn, id, data, now) => {
  if(!data) {return};

  console.log(`🟠 [Query] data.length : ${data.length}`);
  console.log(`🟠 [Query] conn : ${conn}`);
  console.log(`🟠 [Query] id : ${id}`);
  console.log(`🟠 [Query] data : ${data}`);
  console.log(`🟠 [Query] now : ${now}`);
  const COLS = [
    "company_id"
    ,"request_id"
    ,"file_name"
    ,"file_type"
    ,"file_size"
    ,"file_dir"
    ,"last_user_id"
    ,"last_datetime"
  ];

  const placeholderPerRow = `(${COLS.map(() => "?").join(",")})`;

  const rows = data.map((v, idx) => ([
    companyId
    ,id
    // ,idx + 1
    ,v.filename ?? null
    ,v.mimetype ?? null
    ,v.size ?? null
    ,v.destination ?? null
    ,"231004"
    ,now
  ]));

  const query = `
  INSERT INTO preservative_test_files (${COLS.join(",")})
  VALUES ${rows.map(() => placeholderPerRow).join(",")}
  `;
  const params = rows.flat();

  console.log(`📌 [Query] Rows : ${rows}`);
  console.log(`📌 [Query] Query : ${query}`);
  console.log(`📌 [Query] params : ${params}`);

  try {
    const result = await conn.query(query, params);
    console.log("insertPreservativeFiles : ", result);
    return {
      query: query,
      request_id: result
    }

  } catch (err) {
    console.log(`🤷‍♂️ DB Query Failed: ${err.message}`);
    throw new Error("🔴 DB Insert Query Failed: ",err.message);
  }
}

export const createPreservativeData = async (conn, data) => {
  try {
    const result = await conn.query("INSERT INTO preservative_data SET ?", [data]);
    return { id: result.insertId, ...data };
  } catch (err) {
    throw new Error(`Database insert failed: ${err.message}`);
  } 
};

/**
 * ■ [업데이트 쿼리] 의뢰 마스터 데이터 업데이트
 * @description 의뢰 마스터 정보 업데이트 쿼리 수행
 */
export const updatePreservativeRequest = async (conn, data, id) => {
  console.log("update 쿼리 진입 성공.");
  console.log("📌 ID 확인 : ", id);
  const query = `
  UPDATE  preservative_test 
  SET     
    company_id                   =    ${companyId}                                                                          
    ,class                       =    :pre_class                                                                
    ,request_id                  =    ${id}                                                                      
    ,request_no                  =    :pre_doc_no                                                                      
    ,request_date                =    :pre_reg_date                                                             
    ,request_user               =     :pre_reg_user                                                   
    ,cust_id                     =    11015734                                       
    ,cust_name                   =    :pre_cust_name                    
    ,sample_info                 =    :pre_sample_info                                                                    
    ,lab_no                      =    :pre_lab_no                                         
    ,lab_serl                    =    :pre_lab_ver                                                                         
    ,lot_no                      =    :pre_lot_no                        
    ,source_type                 =    :pre_source                                                      
    ,remark_duple                =    :pre_remark_duple                 
    ,remark_reason               =    :pre_remark_reason                   
                                 
    ,stability_time_point        =    :pre_stability_time_point                         
    ,stability_conditions        =    :pre_stability_conditions                         
    ,stability_type              =    :pre_stability_type                   
    ,remark_stability            =    :pre_stability_remark                     
    ,stability_volume            =    :pre_stability_volume                     
    ,stability_unit              =    :pre_stability_volume_unit                   
                                 
    ,water                       =    :pre_content_water                                                        
    ,ethanol                     =    :pre_content_ethanol                                                      
    ,lipid                       =    :pre_content_lipid                                                        
    ,silicone                    =    :pre_content_silicone                                                     
    ,surfactant                  =    :pre_content_surfactant                                                   
    ,edta_2na                    =    :pre_content_chelating_agent                                              
    ,powder                      =    :pre_content_powder                     
                                 
    ,item_type                   =    :pre_sample_item_type                 
                                 
    ,ph                          =    :pre_content_ph                                                            
    ,glycerine                   =    :pre_content_glycerine                                                    
    ,propanediol                 =    :pre_content_propanediol                                                  
    ,dpg                         =    :pre_content_dpg                                                          
    ,pg                          =    :pre_content_pg                                                           
    ,bg                          =    :pre_content_bg                                                           
    ,polyol_sum                  =    :pre_content_polyol_sum                                                   
    ,etc                         =    :pre_content_etc                                              
    ,issue                       =    :pre_remark_sample                            
                                 
    ,content_material            =    :pre_sample_pack_material                                                 
    ,content_type                =    :pre_sample_pack_type                                                     
    ,content_qty                 =    :pre_sample_volume                                                        
    ,content_unit                =    :pre_sample_volume_unit                                                   
    ,remark_manual               =    :pre_sample_manual                       
                                 
    ,test_start_date             =    :pre_test_date_start                      
    ,test_expect_date            =    :pre_test_date_expect                                                     
    ,test_end_date               =    :pre_test_date_end                                  
    ,test_user                   =    :pre_test_user                    

    ,status                      =    :pre_status
                                 
    ,result_interm               =    :pre_test_result_interm                                                   
    ,result_final                =    :pre_test_result_final                                                    
    ,remark_test                 =    :pre_test_remark                        
                                
    ,last_user                   =    :pre_last_user                                                            
    ,last_date                   =    :pre_last_date                    
  WHERE   request_id = ${id}`;    
  
  try {
    console.log("query 시도중...")
    const rows = await conn.query(query, data);
    // const preservativeId = rows.insertId.toString();
    console.log("📌 rows 결과 데이터 : ", rows);
    console.log("query 완료!");

    return id;

  } catch (err) {
    throw new Error(`Database update failed: ${err.message}`);
  } 
};

/**
 * ■ [업데이트 쿼리] 의뢰 아이템 데이터 업데이트
 * @description 의뢰 아이템 정보 업데이트 쿼리 수행
 */
export const updatePreservativeItems = async (conn, data, id) => {
  // const query = `
  // UPDATE  preservative_test_item
  // SET     
  //   company_id           =     :company_id      
  //   ,request_id          =     :request_id      
  //   ,item_id             =     :item_id    
  //   ,item_no             =     :item_no    
  //   ,item_rate           =     :item_rate      
  //   ,last_user_id        =     :last_user_id        
  //   ,last_datetime       =     :last_datetime          
  //   ,is_standard_item    =     :is_standard_item             
  // WHERE   request_id = ${id}
  // `
  const query = `
    DELETE FROM   preservative_test_item
    WHERE         request_id = ${id}
  `
  try {
    const delRows = await conn.query(query);

    const newRows = await insertPreservativeItems(conn, data);

    // const rows = data.map(item => conn.query(query, item));
    // const result = await Promise.all(rows);
    // const insertIds = result.map((result) => result.insertId.toString());
    // const insertIds = newRows.map((result) => result.insertId.toString());
    return {
      // affectedRows : result.length,
      affectedRows : newRows.length,
      // insertedIds : insertIds
    };
  } catch (err) {
    console.error(`💥 Database Update Failed : ${err.message}`);
    throw new Error(`💥 Database Update Failed : ${err.message}`);
  }
}

/**
 * ■ [업데이트 쿼리] 의뢰 시험결과 데이터 업데이트
 * @description 의뢰 시험결과 정보 업데이트 쿼리 수행
 */
export const updatePreservativeResults = async (conn, data, id) => {
  if (!data) {return}
  // const query = `
  // UPDATE  preservative_test_result
  // SET
  //   request_id          =   :request_id
  //   ,row_id              =   :row_id              
  //   ,day_start          =   :dateStart        
  //   ,day7               =   :date7  
  //   ,day14              =   :date14    
  //   ,day28              =   :date28    
  //   ,death7             =   :deathIn7    
  //   ,death14            =   :deathIn14      
  //   ,death28            =   :deathIn28      
  //   ,mode_start         =   :dateStartmode        
  //   ,mode_day7          =   :date7mode        
  //   ,mode_day14         =   :date14mode        
  //   ,mode_day28         =   :date28mode        
  //   ,mode_death7        =   :deathIn7mode          
  //   ,mode_death14       =   :deathIn14mode          
  //   ,mode_death28       =   :deathIn28mode          
  //   ,last_user_id       =   :last_user_id         
  //   ,last_datetime      =   :last_datetime      
  // WHERE   request_id = :request_id
  // `;

  const query = `
    DELETE FROM   preservative_test_result
    WHERE         request_id = ${id}
  `

  const normalization = data.map(r => ({
    request_id        :     r.request_id ?? null
    ,row_id           :     r.row_id ?? null                   
    ,dateStart        :     r.day_start ?? r.dateStart ?? null
    ,date7            :     r.day7 ?? r.date7 ?? null    
    ,date14           :     r.day14 ?? r.date14 ?? null    
    ,date28           :     r.day28 ?? r.date28 ?? null      
    ,deathIn7         :     r.death7 ?? r.deathIn7 ?? null        
    ,deathIn14        :     r.death14 ?? r.deathIn14 ?? null        
    ,deathIn28        :     r.death28 ?? r.deathIn28 ?? null              
    ,dateStartmode    :     r.mode_start ?? r.dateStartmode ?? null          
    ,date7mode        :     r.mode_day7 ?? r.date7mode ?? null           
    ,date14mode       :     r.mode_day14 ?? r.date14mode ?? null           
    ,date28mode       :     r.mode_day28 ?? r.date28mode ?? null               
    ,deathIn7mode     :     r.mode_death7 ?? r.deathIn7mode ?? null                
    ,deathIn14mode    :     r.mode_death14 ?? r.deathIn14mode ?? null                
    ,deathIn28mode    :     r.mode_death28 ?? r.deathIn28mode ?? null
    ,last_user_id     :     "231004"          
    ,last_datetime    :     r.last_datetime ?? null            
  }));

  console.log(`📌 Normalization TEST : ${normalization}`);

  try {
    // const rows = normalization.map(item => conn.query(query, item));
    // const result = await Promise.all(rows);
    
    const delRows = await conn.query(query, id);
    const newRows = await insertPreservativeResults(conn, data);
    // const insertIds = result.map((result) => result.insertId.toString());

    console.log("👍 Database Query Succeed");
    return {
      affectedRows: newRows.length
      // ,insertedIds: insertIds
    }
  } catch (err) {
    console.error(`💥 Database Update Failed : ${err.message}`);
    throw new Error(`💥 Database Update Failed : ${err.message}`);
  }
}

/**
 * ■ [업데이트 쿼리] 의뢰 파일 데이터 업데이트
 * @description 의뢰 파일 정보 업데이트 쿼리 수행
 */
export const updatePreservativeFiles = async (conn, id, oldData, newData, now) => {
  console.log("📌 Old File Data : ", oldData);
  console.log("📌 New File Data : ", newData);
  // console.log(`📌 File Data Length : ${data.length}`);
  const query = `
  DELETE FROM   preservative_test_files
  WHERE         request_id = ${id}
    AND         file_id NOT IN (${oldData});
  `;

  try {
    const delRow = await conn.query(query);
    if (newData.length > 0) {
      const insertRow = await insertPreservativeFiles(conn, id, newData, now);
      console.log(`📌 insertRow : ${insertRow}`);

      return {
        query : insertRow.query
        ,request_id : insertRow.request_id
      }
    }
    return ;

  } catch (err) {
    throw new Error(`🔴 DB Query Failed: ${err.message}`);
  }
}

export const deletePreservativeData = async (id) => {
  try {
    const result = await conn.query("DELETE FROM preservative_data WHERE id = ?", [id]);
    return { success: result.affectedRows > 0 };
  } catch (err) {
    throw new Error(`Database delete failed: ${err.message}`);
  }
};


/**
 * ■ preservative_test_result 테이블 데이터 존재 확인
 * @description 테이블에 시험결과 데이터 존재여부에 따라 insert, update 결정
 * @returns 
 */
export const checkPreResultData = async (conn, id) => {
  const query = `
  SELECT  COUNT(*)    as count
  FROM    preservative_test_result
  WHERE   request_id = ${id}
  `

  try {
    const row = await conn.query(query);
    console.log("📌 Result Data Count : ", row);
    return {
      count : row[0].count
    }
  } catch (err) {
    throw new Error(`🔴 DB Check Query Failed: ", ${err.message}`);
  }
}

/**
 * ■ preservative_test_files 테이블 데이터 존재 확인
 * @description 테이블에 파일 데이터 존재여부에 따라 insert, update 결정
 * @returns 
 */
export const checkPreFileData = async (conn, id) => {
  const query = `
  SELECT  COUNT(*)    as  count
  FROM    preservative_test_files
  WHERE   request_id = ${id}
  `;

  try {
    const row = await conn.query(query);
    console.log("📌 File Data Count : ", row);
    return {
      count : row[0].count
    }
  } catch (err) {
    throw new Error(`🔴 DB Check Query Failed: ", ${err.message}`);
  }
}