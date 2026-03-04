 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 23.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Internal Query
  #     @modified : 
  ########################################################## */

import { getPool } from '../../../connection.js';


/* ----------------------------------------------------------------
                              GET 영역
----------------------------------------------------------------*/

/**
 * ✨ 내부성분분석 시퀀스 구하기
 * --------------------------------------
 * @name getInternalMaxValue
 * @description 현재 DB 내 최대 시퀀스 조회 및 반환(서비스에서 증가)
 */
export const getInternalMaxValue = async (conn) => {
  console.log(`\n⚡ 최대 시퀀스 조회 쿼리 진입 성공.`);

  const query = `
    SELECT  MAX(request_id) as maxID
            ,MAX(request_no) as maxNO
    FROM    ingredient_internal_test;
  `;

  try {
    const rows = await conn.query(query);
    console.log(`🙌 최대 시퀀스 조회 결과 : ${rows}`);

    return {
      maxNO : rows[0].maxNO,
      maxID : rows[0].maxID
    }
  } catch (err) {
    throw new Error(`❓ Database Query Failed : ${err.message}`);
  }
}

/**
 * ✨ 내부성분분석 
 * @param {*} conn 
 * @param {*} filters 
 * @returns 
 */

/**
 * ✨ 조회 화면 진입시 전체 데이터 조회 쿼리
 * --------------------------------------
 * @name getInternalData
 * @description 최초 조회 화면 전체 데이터 조회 및 반환
 */
export const getInternalData = async (conn, filters) => {
  console.log(`\n⚡ 전체 데이터 쿼리 진입 성공.`);

  const query = `
    SELECT  
            company_id                   as 'company_id'           
            ,request_id                   as 'request_id'           
            ,request_no                   as 'request_no'           
            ,date_format(request_date, '%Y-%m-%d')                 as 'request_date'             
            ,request_user                 as 'request_user'             
            ,case class
                when 0 then '연구참고/고객사요청/기타'
                when 1 then '기능성화장품신규허가'
                when 2 then '의약외품신규허가'
                when 3 then '변경심사'
                when 4 then '타겟제품'
            end                           as 'class'     
            ,item_no                      as 'item_no'       
            ,item_name                    as 'item_name'         
            ,lab_no                       as 'lab_no'       
            ,lab_serl                     as 'lab_serl'         
            ,lot_no                       as 'lot_no'       
            ,is_duple                     as 'is_duple'         
            ,remark_duple                 as 'remark_duple'             
            ,remark_reason                as 'remark_reason'             
            ,remark_sample_info           as 'remark_sample_info'                   
            ,remark                       as 'remark'       
            ,ph_std                       as 'ph_std'       
            ,ph1_1                        as 'ph1_1'     
            ,ph1_2                        as 'ph1_2'     
            ,ph1_3                        as 'ph1_3'     
            ,ph2_1                        as 'ph2_1'     
            ,ph2_2                        as 'ph2_2'     
            ,ph2_3                        as 'ph2_3'     
            ,ph3_1                        as 'ph3_1'     
            ,ph3_2                        as 'ph3_2'     
            ,ph3_3                        as 'ph3_3'     
            ,date_format(test_start_date, '%Y-%m-%d')              as 'test_start_date'               
            ,date_format(test_end_date, '%Y-%m-%d')                as 'test_end_date'             
            ,test_status                  as 'test_status'           
            ,test_user                    as 'test_user'         
            ,remark_test                  as 'remark_test'           
            ,last_user                    as 'last_user'         
            ,date_format(last_date, '%Y-%m-%d')                    as 'last_date'         
    FROM    ingredient_internal_test;
  `;

  try {
    const rows = await conn.query(query);
    console.log(`🙌 전체 아이템 조회 쿼리 결과 : ${rows}`);
    return rows;
  } catch (err) {
    throw new Error(`❓ Database Query Failed: ${err.message}`);
  }
};


/**
 * ✨ 등록화면 점프시 상세 데이터 리스트 조회 쿼리
 * --------------------------------------
 * @name getInternalDataById
 * @description 조회 → 등록 화면 점프시 해당 쿼리 조회
 */
export const getInternalDataById = async (conn, id) => {
  console.log(`\n⚡ 등록 화면 조회 쿼리 진입 성공.`);

  const query = `
    SELECT  
            company_id                  as  'company_id'                  
            ,request_id                  as  'request_id'                  
            ,request_no                  as  'request_no'                  
            ,date_format(request_date, '%Y-%m-%d')                as  'request_date'                    
            ,request_user                as  'request_user'                    
            ,class                       as  'class'            
            ,item_no                     as  'item_no'              
            ,item_name                   as  'item_name'                
            ,lab_no                      as  'lab_no'              
            ,lab_serl                    as  'lab_serl'                
            ,lot_no                      as  'lot_no'              
            ,is_duple                    as  'is_duple'                
            ,remark_duple                as  'remark_duple'                    
            ,remark_reason               as  'remark_reason'                    
            ,remark_sample_info          as  'remark_sample_info'                          
            ,remark                      as  'remark'              
            ,ph_std                      as  'ph_std'              
            ,ph1_1                       as  'ph1_1'            
            ,ph1_2                       as  'ph1_2'            
            ,ph1_3                       as  'ph1_3'            
            ,ph2_1                       as  'ph2_1'            
            ,ph2_2                       as  'ph2_2'            
            ,ph2_3                       as  'ph2_3'            
            ,ph3_1                       as  'ph3_1'            
            ,ph3_2                       as  'ph3_2'            
            ,ph3_3                       as  'ph3_3'            
            ,date_format(test_start_date, '%Y-%m-%d')             as  'test_start_date'                      
            ,date_format(test_end_date, '%Y-%m-%d')               as  'test_end_date'                    
            ,test_status                 as  'test_status'                  
            ,test_user                   as  'test_user'                
            ,remark_test                 as  'remark_test'                  
            ,last_user                   as  'last_user'                
            ,date_format(last_date, '%Y-%m-%d')                   as  'last_date'                
    FROM    ingredient_internal_test
    WHERE   request_id = ${id};
  `;

  try {
    const rows = await conn.query(query);
    console.log(`🙌 점프 조회 쿼리 결과 : ${rows}`);

    return rows.length > 0 ? rows[0] : null;

  } catch (err) {
    throw new Error(`❓ Database Query Failed : ${err.message}`);
  }
};


/**
 * ✨ 조회 화면 진입시 등록된 전체 아이템 데이터 조회 쿼리
 * --------------------------------------
 * @name getInternalRMData
 * @description 조회 화면 내 전체 원료 데이터 조회 및 반환
 */
export const getInternalRMData = async (conn, filters) => {
  console.log(`\n⚡ 전체 아이템 조회 쿼리 진입 성공.`);

  const query = `
    SELECT  *
    FROM    ingredient_internal_test_item;
  `;

  try {
    const rows = await conn.query(query);
    console.log(`🙌 전체 아이템 조회 쿼리 결과 : ${rows}`);
    return rows;
  } catch (err) {
    throw new Error(`❓ Database Query Failed : ${err.message}`);
  }
};


/**
 * ✨ 등록화면 점프시 상세 원료(성분) 데이터 리스트 조회 쿼리
 * --------------------------------------
 * @name getInternalRMDataById
 * @description 조회 → 등록 화면 점프시 상세 원료(성분) 데이터 조회 및 반환
 * @param { Promise } conn
 * @param { Number } id
 */
export const getInternalRMDataById = async (conn, id) => {
  console.log(`\n⚡ 조건별 원료(성분) 조회 쿼리 진입 성공.`);
  const query = `
    SELECT  
            company_id  as  company_id
            ,request_id  as  request_id
            ,ing_id     as  ing_id
            ,ing_no     as  ing_no
            ,ing_name   as  ing_name
            ,ing_rate   as  ing_rate
            ,last_user  as  last_user
            ,last_date  as  last_date
    FROM    ingredient_internal_test_item
    WHERE   request_id = ${id};
  `

  try {
    const rows = await conn.query(query);

    return rows;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}

/**
 * ✨ 등록화면 점프시 상세 파일 데이터 리스트 조회 쿼리
 * --------------------------------------
 * @name getInternalFileDataById
 * @description 조회 → 등록 화면 점프시 상세 파일 데이터 조회 및 반환
 * @param { Promise } conn
 * @param { Number } id
 */
export const getInternalFileDataById = async (conn, id) => {
  console.log(`\n⚡ 조건별 파일 데이터 조회 쿼리 진입 성공.`);
  const query = `
    SELECT
          *
    FROM    ingredient_internal_test_files
    WHERE   request_id = ${id};
  `;

  try {
    const rows = await conn.query(query);

    return rows ;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}


/**
 * ✨ 원료(성분) 기존 보유 데이터 조회 쿼리
 * --------------------------------------
 * @name getInternalItemsID
 * @description Update 요청시 기존 데이터 유지 목적
 * @param { Promise } conn
 * @param { Number } id
 */
export const getInternalItemsID = async (conn, id) => {
  console.log(`\n⚡ 조건별 아이템 조회 쿼리 진입 성공.`);
  const query = `
    SELECT  ing_no  as  ing_no
    FROM    ingredient_internal_test_item
    WHERE   request_id = ${id};
  `

  try {
    const rows = await conn.query(query);

    return rows;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}


/**
 * ✨ 랩넘버 차수 조회 쿼리
 * --------------------------------------
 * @name getInternalLabSerl
 * @desciprion 내부성분분석 테이블 내 랩넘버 카운트 후 최종 차수 반환
 */
export const getInternalLabSerl = async (conn, labNo) => {
  console.log(`\n⚡ 랩넘버 차수 조회 쿼리 진입 성공.`);
  console.log(`Query Data : ${labNo}`);

  const query = `
    SELECT  COUNT(*) as count
    FROM    ingredient_internal_test
    WHERE   lab_no = '${String(labNo)}';
  `;

  console.log(`Query : ${query}`);

  try {
    const rows = await conn.query(query);
    console.log(`🙌 랩넘버 조회 쿼리 결과 : ${rows[0].count}`);

    if(rows.length > 0) {
      return {
        result : rows[0].count
      }

    } else {
      return {
        result : 0
      }
    }
  } catch (err) {
    throw new Error(`❓ Database Query Failed : ${err.message}`);
  }
}


/* ----------------------------------------------------------------
                            INSERT 영역
----------------------------------------------------------------*/

/**
 * ✨ 내부성분분석 Request 데이터 생성
 * --------------------------------------
 * @name insertInternalRequest
 * @description Service에서 정리 후 받은 데이터를 통해 request 테이블 삽입
 * @param { Promise } Connection
 * @param { object } Data
 * @param { String } docNo
 * @returns {*}
 */
export const insertInternalRequest = async (conn, data, docNo) => {
  console.log(`\n⚡ Request 데이터 삽입 쿼리 진입 성공.`);

  const query = `
    INSERT INTO   ingredient_internal_test
    (
      company_id                        
      ,request_id                         
      ,request_no                         
      ,request_date                         
      ,request_user                         
      ,class                          
      ,item_no 
      ,item_name                         
      ,lab_no                         
      ,lab_serl                         
      ,lot_no                         
      ,is_duple                         
      ,remark_duple                         
      ,remark_reason                          
      ,remark_sample_info                         
      ,remark                         
      ,ph_std                         
      ,ph1_1                          
      ,ph1_2                          
      ,ph1_3                          
      ,ph2_1                          
      ,ph2_2                          
      ,ph2_3                          
      ,ph3_1                          
      ,ph3_2                          
      ,ph3_3                          
      ,test_start_date                          
      ,test_end_date                          
      ,test_status                
      ,test_user        
      ,remark_test                          
      ,last_user                          
      ,last_date                          
    )
  VALUES (
      :company_id
      ,:internal_request_id
      ,${docNo}
      ,:internal_request_date
      ,:internal_request_user
      ,:internal_class
      ,:internal_item_no
      ,:internal_item_name
      ,:internal_lab_no
      ,:internal_lab_serl
      ,:internal_lot_no
      ,:internal_is_duple
      ,:internal_remark_duple
      ,:internal_remark_reason
      ,:internal_remark_sample_info
      ,:internal_remark
      ,:internal_ph_std
      ,:internal_ph1_1
      ,:internal_ph1_2
      ,:internal_ph1_3
      ,:internal_ph2_1
      ,:internal_ph2_2
      ,:internal_ph2_3
      ,:internal_ph3_1
      ,:internal_ph3_2
      ,:internal_ph3_3
      ,:internal_test_start_date
      ,:internal_test_end_date
      ,:internal_test_status
      ,:internal_test_user
      ,:internal_remark_test
      ,:internal_last_user
      ,:internal_last_date
  );
  `;

  try {
    const rows = await conn.query(query, data);
    const internalId = rows.insertId.toString();

    console.log(`🙌 insertId : ${internalId}`);

    return internalId;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}


/**
 * ✨ 내부성분분석 아이템 정보 저장
 * --------------------------------------
 * @name insertInternalItems
 * @description Service 에서 정리 후 받은 성분아이템 정보 테이블 저장
 * @param { Promise } conn
 * @param { Object } data
 * @returns 
 */
export const insertInternalItems = async (conn, data) => {
  console.log(`\n⚡ 성분 아이템 삽입 쿼리 진입 성공.`);
  if(!data) return;

  const COLS = [
    "company_id"
    ,"request_id"
    ,"ing_no"
    ,"ing_name"
    ,"ing_rate"
    ,"last_user"
    ,"last_date"
  ];

  const placeholderPerRow = `(${COLS.map(() => "?").join(",")})`;
  const values = data.map((item, idx) => ([
    item.company_id
    ,item.request_id
    ,item.ing_no
    ,item.ing_name
    ,item.ing_rate
    ,item.last_user
    ,item.last_date
  ]));

  const query = `
    INSERT INTO   ingredient_internal_test_item (${COLS.join(",")})
    VALUES        ${values.map(() => placeholderPerRow).join(",")}
  `
  const params = values.flat();

  try {
    const rows = await conn.query(query, params);
    console.log(`--rows : ${rows}`);

    return {
      query: query,
      // result: rows
    }
  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }

};

/**
 * ✨ 내부성분분석 파일 정보 저장
 * --------------------------------------
 * @name insertInternalFiles
 * @description Service 에서 정리 후 받은 파일아이템 정보 테이블 저장
 * @param { Promise } conn
 * @param { File } fd
 * @param { Object } sample
 * 
 */
export const insertInternalFiles = async (conn, id, fd, sample, now) => {
  console.log(`\n⚡ 파일 데이터 삽입 쿼리 진입 성공.`);
  if(!fd) return;

  console.log(`\n-- fd : ${fd}`);

  const COLS = [
    "company_id"
    ,"request_id"
    ,"file_name"
    ,"file_type"
    ,"file_size"
    ,"file_dir"
    ,"last_user"
    ,"last_datetime"
  ];

  const placeholderPerRow = `(${COLS.map(() => "?").join(",")})`;

  const rows = fd.map((item, idx) => ([
    sample.company_id                           // sample 데이터 company ID
    ,id ?? null                                 // sample 데이터 request ID
    ,item.filename ?? null                      // File 객체 filename
    ,item.mimetype ?? null                      // File 객체 type
    ,item.size ?? null                          // File 객체 size
    ,item.destination ?? null                   // File 객체 destination
    ,sample.internal_last_user ?? null          // sample 데이터 last_user
    ,now
    // ,sample.internal_last_date ?? null          // sample 데이터 last_date
  ]))

  const query = `
    INSERT INTO   ingredient_internal_test_files (${COLS.join(",")})
    VALUES        ${rows.map(() => placeholderPerRow).join(",")}
  `;
  const params = rows.flat();
  console.log(`\n--params : ${params}`);

  try {
    const rows = await conn.query(query, params);
    console.log(`\n-- rows : ${rows}`);

    return {
      query: query,
      request_id : rows
    }
  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
};



/* ----------------------------------------------------------------
                            UPDATE 영역
----------------------------------------------------------------*/
/**
 * ✨ 내부성분분석 의뢰 정보 업데이트
 * --------------------------------------
 * @name updateInternalRequest
 * @description Update 요청시 의뢰 정보 업데이트
 * @param { Promise } conn
 * @param { Object } data
 * @param { Number } reqId
 * @return reqId
 */
export const updateInternalRequest = async (conn, data, reqId) => {
  console.log(`\n⚡ 의뢰 정보 업데이트 쿼리 진입 성공.`);
  const query = `
    UPDATE  ingredient_internal_test
    SET     company_id                  = :company_id
            ,request_id                 = :internal_request_id
            ,request_no                 = :internal_request_no
            ,request_date               = :internal_request_date
            ,request_user               = :internal_request_user
            ,class                      = :internal_class
            ,item_no                    = :internal_item_no
            ,item_name                  = :internal_item_name
            ,lab_no                     = :internal_lab_no
            ,lab_serl                   = :internal_lab_serl
            ,lot_no                     = :internal_lot_no
            ,is_duple                   = :internal_is_duple
            ,remark_duple               = :internal_remark_duple
            ,remark_reason              = :internal_remark_reason
            ,remark_sample_info         = :internal_remark_sample_info
            ,remark                     = :internal_remark
            ,ph_std                     = :internal_ph_std
            ,ph1_1                      = :internal_ph1_1
            ,ph1_2                      = :internal_ph1_2
            ,ph1_3                      = :internal_ph1_3
            ,ph2_1                      = :internal_ph2_1
            ,ph2_2                      = :internal_ph2_2
            ,ph2_3                      = :internal_ph2_3
            ,ph3_1                      = :internal_ph3_1
            ,ph3_2                      = :internal_ph3_2
            ,ph3_3                      = :internal_ph3_3
            ,test_start_date            = :internal_test_start_date
            ,test_end_date              = :internal_test_end_date
            ,test_status                = :internal_test_status
            ,test_user                  = :internal_test_user
            ,remark_test                = :internal_remark_test
            ,last_user                  = :internal_last_user
            ,last_date                  = :internal_last_date
    WHERE   request_id = ${reqId};
  `;

  try {
    
    // ------------------------------
    // 중간 과정에 로그 데이터 삽입 필요
    // ------------------------------
    const newRows = await conn.query(query, data);

    return reqId;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
};

/**
 * ✨ 내부성분분석 아이템 정보 업데이트
 * --------------------------------------
 * @name updateInternalItems
 * @description Update 요청시 아이템 정보 업데이트
 * @param { Promise } conn
 * @param { Object } data
 * @param { Number } id
 */
export const updateInternalItems = async (conn, data, id) => {
  const query = `
    DELETE FROM   ingredient_internal_test_item
    WHERE         request_id = ${id};
  `;


}

/**
 * ✨ 내부성분분석 파일 데이터 업데이트
 * --------------------------------------
 * @name updateInternalFiles
 * @description Update 요청시 파일 데이터 업데이트
 * @param { Promise } conn
 * @param { Number } id
 * @param { Date } now
 * 
 */
export const updateInternalFiles = async (conn, id, oldData, newData, sample, now) => {
  console.log(`\n ⚡ 파일 정보 업데이트 쿼리 진입 성공.`);
  console.log("📌 Old File Data : ", oldData);
  console.log("📌 New File Data : ", newData);
  // console.log(`📌 File Data Length : ${data.length}`);
  const query = `
    DELETE FROM   ingredient_internal_test_files
    WHERE         request_id = ${id}
      AND         file_id NOT IN (${oldData});
  `;

  try {
    const delRow = await conn.query(query);
    if (newData.length > 0) {
      const insertRow = await insertInternalFiles(conn, id, newData, sample, now);
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





/* ----------------------------------------------------------------
                            CHECK 영역
----------------------------------------------------------------*/
/**
 * ✨ 내부성분분석 기존 파일 데이터 확인
 * --------------------------------------
 * @name checkInternalFileData
 * @description 파일 업로드 시 기존 파일과 비교하여 신규 데이터만 업데이트
 * @param { Promise } conn
 * @param { Number } id
 * @return COUNT(id)
 */
export const checkInternalFileData = async (conn, id) => {
  console.log(`\n⚡ 파일 데이터 개수 조회 쿼리 진입 성공.`);
  const query = `
    SELECT  COUNT(*)  as  count
    FROM    ingredient_internal_test_files
    WHERE   request_id = ${id};
  `;

  try {
    const rows = await conn.query(query);
    
    return { count: rows[0].count };
  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}





/* ----------------------------------------------------------------
                          DELETE 영역
----------------------------------------------------------------*/

/**
 * ✨ 내부성분분석 기존 데이터 비교 및 미포함 데이터 삭제
 * --------------------------------------
 * @name deleteNotInternalItemsByID
 * @description 인자로 받은 아이템 넘버 제외 DELETE
 * @param { Promise } conn
 * @param { Number } id
 * @param { Array } no
 */
export const deleteNotInternalItemsByID = async (conn, id, no) => {
  console.log(`\n⚡ 조건별 성분 아이템 삭제 쿼리 진입 성공.`);
  const query = `
    DELETE FROM   ingredient_internal_test_item
    WHERE         request_id = ${id}
      AND         ing_no NOT IN (${no.map(i => `'${i}'`)})
  `;

  console.log(query);

  try {
    // return;
    const rows = await conn.query(query);

    return rows.length;

  } catch (err) {
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }

}