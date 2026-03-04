/**  ##########################################################
#        ______                __           __
#       / ____/_______  ____ _/ /____  ____/ /
#      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
#     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
#     \____/_/   \___/\__,_/\__/\___/\__,_/   
# 
#     @since : 2026. 03. 01.
#     @author : Choi Yeon Woong (231004)
#     @description : LTMS - External Query
#     @modified : 
########################################################## */


/* ----------------------------------------------------------------
                              GET 영역
----------------------------------------------------------------*/


/**
 * ✨ 외부성분분석 시퀀스 구하기
 * --------------------------------------
 * @name getExternalMaxValue
 * @description 현재 DB 내 최대 시퀀스 조회 및 반환(서비스에서 증가)
 */
export const getExternalMaxValue = async (conn) => {
  console.log(`\n⚡ 최대 시퀀스 조회 쿼리 진입 성공.`);

  const query = `
    SELECT  MAX(request_id) as maxID
            ,MAX(request_no) as maxNO
    FROM    ingredient_external_test;
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
 * ✨ 랩넘버 차수 조회 쿼리
 * --------------------------------------
 * @name getExternalLabSerl
 * @desciprion 내부성분분석 테이블 내 랩넘버 카운트 후 최종 차수 반환
 */
export const getExternalLabSerl = async (conn, labNo) => {
  console.log(`\n⚡ 랩넘버 차수 조회 쿼리 진입 성공.`);
  console.log(`Query Data : ${labNo}`);

  const query = `
    SELECT  COUNT(*) as count
    FROM    ingredient_external_test
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


/**
 * ✨ 조회 화면 진입시 전체 데이터 조회 쿼리
 * --------------------------------------
 * @name getExternalData
 * @description 최초 조회 화면 전체 데이터 조회 및 반환
 */
export const getExternalData = async (conn, filters) => {
  console.log(`\n⚡ 전체 데이터 쿼리 진입 성공.`);

  const query = `
    SELECT  
            company_id                    as  'company_id'            
            ,request_id                   as  'request_id'            
            ,request_no                   as  'request_no'            
            ,date_format(request_date, '%Y-%m-%d')                 as  'request_date'              
            ,request_user                 as  'request_user'    
            ,cust_name                    as  'cust_name'          
            ,class                        as  'class'        
            ,item_no                      as  'item_no'          
            ,item_name_kr                 as  'item_name_kr'              
            ,item_name_en                 as  'item_name_en'              
            ,lab_no                       as  'lab_no'        
            ,lab_serl                     as  'lab_serl'          
            ,lot_no                       as  'lot_no'        
            ,is_duple                     as  'is_duple'          
            ,remark_duple                 as  'remark_duple'      
            ,remark_reason                as  'remark_reason'
            ,remark_class_etc             as  'remark_class_etc'        
            ,item_type                    as  'item_type'            
            ,issue_class                  as  'issue_class'              
            ,cost_from                    as  'cost_from'            
            ,is_photo                     as  'is_photo'          
            ,remark_doc                   as  'remark_doc'            
            ,test_microbe_class           as  'test_microbe_class'                    
            ,test_anti_class              as  'test_anti_class'                  
            ,test_remark_anti_etc         as  'test_remark_anti_etc'                          
            ,test_contact_time            as  'test_contact_time'                    
            ,test_etc_is_content          as  'test_etc_is_content'                      
            ,test_etc_content             as  'test_etc_content'                  
            ,test_etc_content_unit        as  'test_etc_content_unit'                        
            ,test_etc_is_ph               as  'test_etc_is_ph'                
            ,test_etc_is_safety           as  'test_etc_is_safety'                    
            ,test_is_etc                  as  'test_is_etc'              
            ,test_remark_etc              as  'test_remark_etc'                  
            ,test_pre_class               as  'test_pre_class'                
            ,test_remark_pre              as  'test_remark_pre'                  
            ,test_deodorant_class         as  'test_deodorant_class'                      
            ,date_format(test_start_date, '%Y-%m-%d')              as  'test_start_date'                  
            ,date_format(test_end_date, '%Y-%m-%d')                as  'test_end_date'                
            ,test_status                  as  'test_status'              
            ,test_user                    as  'test_user'            
            ,remark_test                  as  'remark_test'              
            ,last_user                    as  'last_user'            
            ,last_date                    as  'last_date'                
    FROM    ingredient_external_test;
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
 * @name getExternalDataById
 * @description 조회 → 등록 화면 점프시 해당 쿼리 조회
 */
export const getExternalDataById = async (conn, id) => {
  console.log(`\n⚡ 등록 화면 조회 쿼리 진입 성공.`);
  console.log(`-- id : ${id}`);

  const query = `
    SELECT  
            company_id                           as   'company_id'       
            ,request_id                          as   'request_id'       
            ,request_no                          as   'request_no'       
            ,request_date                        as   'request_date'         
            ,request_user                        as   'request_user'     
            ,cust_name                           as   'cust_name'    
            ,class                               as   'class'   
            ,item_no                             as   'item_no'     
            ,item_name_kr                        as   'item_name_kr'         
            ,item_name_en                        as   'item_name_en'         
            ,lab_no                              as   'lab_no'   
            ,lab_serl                            as   'lab_serl'     
            ,lot_no                              as   'lot_no'   
            ,is_duple                            as   'is_duple'     
            ,remark_duple                        as   'remark_duple'       
            ,remark_reason                       as   'remark_reason'
            ,remark_class_etc                    as   'remark_class_etc'  
            ,item_type                           as   'item_type'       
            ,issue_class                         as   'issue_class'         
            ,cost_from                           as   'cost_from'       
            ,is_photo                            as   'is_photo'     
            ,remark_doc                          as   'remark_doc'       
            ,test_microbe_class                  as   'test_microbe_class'               
            ,test_anti_class                     as   'test_anti_class'      
            ,test_remark_anti_etc                as   'test_remark_anti_etc'       
            ,test_contact_time                   as   'test_contact_time'               
            ,test_etc_is_content                 as   'test_etc_is_content'                 
            ,test_etc_content                    as   'test_etc_content'             
            ,test_etc_content_unit               as   'test_etc_content_unit'                   
            ,test_etc_is_ph                      as   'test_etc_is_ph'        
            ,test_etc_ph_content                 as   'test_etc_ph_content'   
            ,test_etc_is_safety                  as   'test_etc_is_safety'               
            ,test_is_etc                         as   'test_is_etc'         
            ,test_remark_etc                     as   'test_remark_etc'             
            ,test_pre_class                      as   'test_pre_class'           
            ,test_remark_pre                     as   'test_remark_pre'             
            ,test_deodorant_class                as   'test_deodorant_class'                 
            ,test_start_date                     as   'test_start_date'             
            ,test_end_date                       as   'test_end_date'           
            ,test_status                         as   'test_status'         
            ,test_user                           as   'test_user'       
            ,remark_test                         as   'remark_test'         
            ,last_user                           as   'last_user'       
            ,last_date                           as   'last_date'       
    FROM    ingredient_external_test
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





/* ----------------------------------------------------------------
                            INSERT 영역
----------------------------------------------------------------*/

/**
 * ✨ 외부성분분석 Request 데이터 생성
 * --------------------------------------
 * @name insertExternalRequest
 * @description Service에서 정리 후 받은 데이터를 통해 request 테이블 삽입
 * @param { Promise } Connection
 * @param { object } Data
 * @param { String } docNo
 * @returns {*}
 */
export const insertExternalRequest = async (conn, data, docNo) => {
  console.log(`\n⚡ Request 데이터 삽입 쿼리 진입 성공.`);
  console.log(`\n--data : ${JSON.stringify(data)}`);

  const query = `
    INSERT INTO   ingredient_external_test
    (
      company_id
      ,request_no
      ,request_date
      ,request_user
      ,cust_name
      ,class
      ,item_name_kr
      ,item_name_en
      ,lab_no
      ,lab_serl
      ,lot_no
      ,remark_duple
      ,remark_reason
      ,item_type
      ,issue_class
      ,cost_from
      ,is_photo
      ,remark_doc
      ,test_microbe_class
      ,test_anti_class
      ,test_remark_anti_etc
      ,test_contact_time
      ,test_etc_is_content
      ,test_etc_content
      ,test_etc_content_unit
      ,test_etc_is_ph
      ,test_etc_ph_content
      ,test_etc_is_safety
      ,test_is_etc
      ,test_remark_etc
      ,test_pre_class
      ,test_remark_pre
      ,test_deodorant_class
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
      ,${docNo}
      ,:external_request_date
      ,:external_request_user
      ,:external_cust_name
      ,:external_class
      ,:external_item_name_kr
      ,:external_item_name_en
      ,:external_lab_no
      ,:external_lab_serl
      ,:external_lot_no
      ,:external_remark_duple
      ,:external_remark_reason
      ,:external_item_type
      ,:external_issue_class
      ,:external_cost_from
      ,:external_is_photo
      ,:external_remark_doc
      ,:external_test_microbe_class
      ,:external_test_anti_class
      ,:external_test_remark_anti_etc
      ,:external_test_contact_time
      ,:external_test_etc_is_content
      ,:external_test_etc_content
      ,:external_test_etc_content_unit
      ,:external_test_etc_is_ph
      ,:external_test_etc_ph_content
      ,:external_test_etc_is_safety
      ,:external_test_is_etc
      ,:external_test_remark_etc
      ,:external_test_pre_class
      ,:external_test_remark_pre
      ,:external_test_deodorant_class
      ,:external_test_start_date
      ,:external_test_end_date
      ,:external_test_status
      ,:external_test_user
      ,:external_test_remark_result
      ,:external_last_user
      ,:external_last_date
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



/* ----------------------------------------------------------------
                            UPDATE 영역
----------------------------------------------------------------*/

/**
 * ✨ 외부성분분석 업데이트 진행 쿼리
 * --------------------------------------
 * @name updateExternalRequest
 * @param { Promise } conn
 * @param { Object } data
 * @param { Number } id
 */
export const updateExternalRequest = async (conn, data, id) => {
  // const getNoQuery = `
  //   SELECT  request_no as 'request_no'
  //   FROM    ingredient_external_test
  //   WHERE   request_id = ${id}  ;
  // `;
  // const query = `
  //   DELETE FROM   ingredient_external_test
  //   WHERE         request_id = ${id};
  // `;

  const query = `
    UPDATE  ingredient_external_test
    SET   company_id                  = :company_id
          ,request_date               = :external_request_date
          ,request_user               = :external_request_user
          ,cust_name                  = :external_cust_name
          ,class                      = :external_class
          ,item_name_kr               = :external_item_name_kr
          ,item_name_en               = :external_item_name_en
          ,lab_no                     = :external_lab_no
          ,lab_serl                   = :external_lab_serl
          ,lot_no                     = :external_lot_no
          ,remark_duple               = :external_remark_duple
          ,remark_reason              = :external_remark_reason
          ,item_type                  = :external_item_type
          ,issue_class                = :external_issue_class
          ,cost_from                  = :external_cost_from
          ,is_photo                   = :external_is_photo
          ,remark_doc                 = :external_remark_doc
          ,test_microbe_class         = :external_test_microbe_class
          ,test_anti_class            = :external_test_anti_class
          ,test_remark_anti_etc       = :external_test_remark_anti_etc
          ,test_contact_time          = :external_test_contact_time
          ,test_etc_is_content        = :external_test_etc_is_content
          ,test_etc_content           = :external_test_etc_content
          ,test_etc_content_unit      = :external_test_etc_content_unit
          ,test_etc_is_ph             = :external_test_etc_is_ph
          ,test_etc_ph_content        = :external_test_etc_ph_content
          ,test_etc_is_safety         = :external_test_etc_is_safety
          ,test_is_etc                = :external_test_is_etc
          ,test_remark_etc            = :external_test_remark_etc
          ,test_pre_class             = :external_test_pre_class
          ,test_remark_pre            = :external_test_remark_pre
          ,test_deodorant_class       = :external_test_deodorant_class
          ,test_start_date            = :external_test_start_date
          ,test_end_date              = :external_test_end_date
          ,test_status                = :external_test_status
          ,test_user                  = :external_test_user
          ,remark_test                = :external_test_remark_test
          ,last_user                  = :external_last_user
          ,last_date                  = :external_last_date
    WHERE request_id = ${id};

  `

  try {
    // const getNo = await conn.query(getNoQuery);
    // const delRow = await conn.query(query);
    // console.log(`\n✅ [UPDATE] DELETE Query Succeed.`);
    // console.log(`\n--getNo : ${getNo[0].request_no}`);

    // const newRow = await insertExternalRequest(conn, data, getNo[0].request_no);

    const newRow = await conn.query(query, data);

    return id;

  } catch (err) {
    console.error(err.message);
    throw new Error(`🔴 Database Query Failed : ${err.message}`);
  }
}

export const updateExternalData = async (id, data) => {
  const conn = await getPool().getConnection();
  try {
    await conn.query("UPDATE external_data SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
  } catch (err) {
    throw new Error(`Database update failed: ${err.message}`);
  } finally {
    conn.release();
  }
};

export const deleteExternalData = async (id) => {
  const conn = await getPool().getConnection();
  try {
    const result = await conn.query("DELETE FROM external_data WHERE id = ?", [id]);
    return { success: result.affectedRows > 0 };
  } catch (err) {
    throw new Error(`Database delete failed: ${err.message}`);
  } finally {
    conn.release();
  }
};




/* ----------------------------------------------------------------
                            CHECK 영역
----------------------------------------------------------------*/




/* ----------------------------------------------------------------
                          DELETE 영역
----------------------------------------------------------------*/