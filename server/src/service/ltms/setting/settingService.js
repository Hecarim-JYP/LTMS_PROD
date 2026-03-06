/**
 * 파일명 : settingService.js
 * 용도 : Setting 비즈니스 로직 처리
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { getPool } from '../../../repository/connection.js';
import * as utils from '../../../common/utils.js';
import * as settingQuery from '../../../repository/sql/ltms/setting/settingQuery.js';
import * as authQuery from '../../../repository/sql/ltms/auth/authQuery.js';

/* ============================== 옵션 ============================== */
/**
 * CT 담당자 유형 옵션 조회 : getManagerTypeOptions
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns : 담당자 유형 목록 배열
 */
export const getManagerTypeOptions = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting) // 설정 화면용 데이터 조회 플래그
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findManagerTypeOptions(conn, queryParams);

    const managerOptions = result.map(opt => ({
      module_category: opt.module_category,
      manager_type_id: opt.manager_type_id,
      manager_type_code: opt.manager_type_code,
      manager_type_name: opt.manager_type_name,
      is_active: opt.is_active,
      sort_order: opt.sort_order,
      from_db: opt.from_db
    }));

    return {
      result: managerOptions
    };
    
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * saveManagerTypeOptions : CT 담당자 유형 옵션 저장
 * --------------------------------------------
 * @param {*} params : 저장할 담당자 유형 옵션 데이터
 */
export const saveManagerTypeOptions = async (params) => {
  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'manager_types']);

  const companyId = utils.toNumberOrNull(params.company_id);
  const managerTypes = params.manager_types;

  let conn;

  try {
    conn = await getPool().getConnection();
    
    // 트랜잭션 시작
    await conn.beginTransaction();

    // 병렬 처리를 위한 Promise 배열 생성
    const promises = managerTypes.map(async (type) => {

      const typeParams = {
        company_id: companyId,
        manager_type_id: type.manager_type_id,
        module_category: type.module_category,
        manager_type_code: type.manager_type_code,
        manager_type_name: type.manager_type_name,
        is_active: utils.toNumberOrNull(type.is_active),
        sort_order: utils.toNumberOrNull(type.sort_order),
        from_db: type.from_db
      };

      // from_db 값에 따라 UPDATE 또는 INSERT 실행
      if (type.from_db === 'Y') {
        // 기존 데이터: UPDATE
        await settingQuery.updateManagerTypeOptions(conn, typeParams);
        return {
          type: 'updated',
          data: {
            manager_type_id: type.manager_type_id,
            manager_type_code: type.manager_type_code,
            manager_type_name: type.manager_type_name,
            status: 'success'
          }
        };
      } else if (type.from_db === 'N') {
        // 새로운 데이터: INSERT (공백이 아닌 경우만)
        if (type.manager_type_name && type.manager_type_code) {
          await settingQuery.insertManagerTypeOptions(conn, typeParams);
          return {
            type: 'inserted',
            data: {
              manager_type_code: type.manager_type_code,
              manager_type_name: type.manager_type_name,
              status: 'success'
            }
          };
        }
        return null;
      }
    });

    // 모든 Promise를 병렬로 실행
    const allResults = await Promise.all(promises);

    // 결과를 분류
    const results = {
      inserted: [],
      updated: [],
      errors: []
    };

    allResults.forEach(result => {
      if (result) {
        if (result.type === 'inserted') {
          results.inserted.push(result.data);
        } else if (result.type === 'updated') {
          results.updated.push(result.data);
        }
      }
    });

    // 트랜잭션 커밋
    await conn.commit();

    return {
      result: results
    }

  } catch (err) {
    // 트랜잭션 롤백
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }

};


/**
 * CT 판정 결과 옵션 조회 : getJudgmentOptions
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns : 판정 결과 목록 배열
 */
export const getJudgmentOptions = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting) // 설정 화면용 데이터 조회 플래그
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findJudgmentOptions(conn, queryParams);

    const judgmentOptions = result.map(opt => ({
      judgment_id: opt.judgment_id,
      judgment_code: opt.judgment_code,
      judgment_name: opt.judgment_name,
      judgment_name_en: opt.judgment_name_en,
      judgment_description: opt.judgment_description,
      result_code: opt.result_code,
      is_active: opt.is_active,
      sort_order: opt.sort_order,
      from_db: opt.from_db
    }));

    return {
      result: judgmentOptions
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * saveJudgmentOptions : 판정 옵션 저장
 * --------------------------------------------
 * @param {*} params : 저장할 판정 옵션 데이터
 */
export const saveJudgmentOptions = async (params) => {
  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'judgments']);

  const companyId = utils.toNumberOrNull(params.company_id);
  const judgments = params.judgments;

  let conn;

  try {
    conn = await getPool().getConnection();
    
    // 트랜잭션 시작
    await conn.beginTransaction();

    // 병렬 처리를 위한 Promise 배열 생성
    const promises = judgments.map(async (judgment) => {

      const judgmentParams = {
        company_id: companyId,
        judgment_id: judgment.judgment_id,
        judgment_code: judgment.judgment_code,
        judgment_name: judgment.judgment_name,
        judgment_name_en: judgment.judgment_name_en,
        judgment_description: judgment.judgment_description,
        result_code: judgment.result_code,
        is_active: utils.toNumberOrNull(judgment.is_active),
        sort_order: utils.toNumberOrNull(judgment.sort_order),
        from_db: judgment.from_db
      };

      // from_db 값에 따라 UPDATE 또는 INSERT 실행
      if (judgment.from_db === 'Y') {
        // 기존 데이터: UPDATE
        await settingQuery.updateJudgmentOptions(conn, judgmentParams);
        return {
          type: 'updated',
          data: {
            judgment_id: judgment.judgment_id,
            judgment_code: judgment.judgment_code,
            judgment_name: judgment.judgment_name,
            judgment_name_en: judgment.judgment_name_en,
            judgment_description: judgment.judgment_description,
            result_code: judgment.result_code,
            is_active: utils.toNumberOrNull(judgment.is_active),
            sort_order: utils.toNumberOrNull(judgment.sort_order),
            from_db: judgment.from_db,
            status: 'success'
          }
        };
      } else if (judgment.from_db === 'N') {
        // 새로운 데이터: INSERT (공백이 아닌 경우만)
        if (judgment.judgment_name && judgment.judgment_code) {
          await settingQuery.insertJudgmentOptions(conn, judgmentParams);
          return {
            type: 'inserted',
            data: {
              judgment_code: judgment.judgment_code,
              judgment_name: judgment.judgment_name,
              judgment_name_en: judgment.judgment_name_en,
              judgment_description: judgment.judgment_description,
              result_code: judgment.result_code,
              is_active: utils.toNumberOrNull(judgment.is_active),
              sort_order: utils.toNumberOrNull(judgment.sort_order),
              from_db: judgment.from_db,
              status: 'success'
            }
          };
        }
        return null;
      }
    });

    // 모든 Promise를 병렬로 실행
    const allResults = await Promise.all(promises);

    // 결과를 분류
    const results = {
      inserted: [],
      updated: [],
      errors: []
    };

    allResults.forEach(result => {
      if (result) {
        if (result.type === 'inserted') {
          results.inserted.push(result.data);
        } else if (result.type === 'updated') {
          results.updated.push(result.data);
        }
      }
    });

    // 트랜잭션 커밋
    await conn.commit();

    return {
      result: results
    }

  } catch (err) {
    // 트랜잭션 롤백
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }

};


/**
 * getUnitOptions : 단위 옵션 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns : 단위 목록 배열
 */
export const getUnitOptions = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting) // 설정 화면용 데이터 조회 플래그
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findUnitOptions(conn, queryParams);

    const unitOptions = result.map(opt => ({
      idx: parseInt(opt.idx, 10), // 10진수 정수로 변환
      unit_id: opt.unit_id,
      unit_type: opt.unit_type,
      unit_code: opt.unit_code,
      unit_name: opt.unit_name,
      unit_name_en: opt.unit_name_en,
      unit_description: opt.unit_description,
      umunit_id: opt.umunit_code,
      is_active: opt.is_active,
      sort_order: opt.sort_order,
      from_db: opt.from_db
    }));

    return {
      result: unitOptions
    }

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * saveUnitOptions : 단위 옵션 저장
 * --------------------------------------------
 * @param {*} params : 저장할 단위 옵션 데이터
 */
export const saveUnitOptions = async (params) => {
  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'units']);

  const companyId = utils.toNumberOrNull(params.company_id);
  const units = params.units;

  let conn;

  try {
    conn = await getPool().getConnection();
    
    // 트랜잭션 시작
    await conn.beginTransaction();

    // 병렬 처리를 위한 Promise 배열 생성
    const promises = units.map(async (unit) => {

      const unitParams = {
        company_id: companyId,
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        unit_code: unit.unit_code,
        unit_name: unit.unit_name,
        unit_name_en: unit.unit_name_en,
        unit_description: unit.unit_description,
        is_active: utils.toNumberOrNull(unit.is_active),
        sort_order: utils.toNumberOrNull(unit.sort_order),
        from_db: unit.from_db
      };

      // from_db 값에 따라 UPDATE 또는 INSERT 실행
      if (unit.from_db === 'Y') {
        // 기존 데이터: UPDATE
        await settingQuery.updateUnitOptions(conn, unitParams);
        return {
          type: 'updated',
          data: {
            unit_id: unit.unit_id,
            unit_type: unit.unit_type,
            unit_code: unit.unit_code,
            unit_name: unit.unit_name,
            unit_name_en: unit.unit_name_en,
            unit_description: unit.unit_description,
            is_active: utils.toNumberOrNull(unit.is_active),
            sort_order: utils.toNumberOrNull(unit.sort_order),
            from_db: unit.from_db,
            status: 'success'
          }
        };
      } else if (unit.from_db === 'N') {
        // 새로운 데이터: INSERT (공백이 아닌 경우만)
        if (unit.unit_name && unit.unit_code) {
          await settingQuery.insertUnitOptions(conn, unitParams);
          return {
            type: 'inserted',
            data: {
              unit_type: unit.unit_type,
              unit_code: unit.unit_code,
              unit_name: unit.unit_name,
              unit_name_en: unit.unit_name_en,
              unit_description: unit.unit_description,
              is_active: utils.toNumberOrNull(unit.is_active),
              sort_order: utils.toNumberOrNull(unit.sort_order),
              from_db: unit.from_db,
              status: 'success'
            }
          };
        }
        return null;
      }
    });

    // 모든 Promise를 병렬로 실행
    const allResults = await Promise.all(promises);

    // 결과를 분류
    const results = {
      inserted: [],
      updated: [],
      errors: []
    };

    allResults.forEach(result => {
      if (result) {
        if (result.type === 'inserted') {
          results.inserted.push(result.data);
        } else if (result.type === 'updated') {
          results.updated.push(result.data);
        }
      }
    });

    // 트랜잭션 커밋
    await conn.commit();

    return {
      result: results
    }

  } catch (err) {
    // 트랜잭션 롤백
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }

};


/**
 * getLabsDepartmentOptions : 제형담당부서 옵션 조회
 * --------------------------------------------
 * @params : 조회 파라미터 (company_id, is_setting)
 * @returns : 제형담당부서 목록 배열
 */
export const getLabsDepartmentOptions = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting) || null // 설정 화면용 데이터 조회 플래그
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findLabsDepartmentOptions(conn, queryParams);
    
    const deptOptions = result.map(opt => ({
      idx: parseInt(opt.idx, 10), // 10진수 정수로 변환
      labs_department_id: opt.labs_department_id,
      parent_department_code: opt.parent_department_code,
      labs_department_code: opt.labs_department_code,
      labs_department_name: opt.labs_department_name,
      labs_department_email: opt.labs_department_email,
      is_active: opt.is_active,
      sort_order: opt.sort_order,
      from_db: opt.from_db
    }));

    return {
      result: deptOptions
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * saveLabsDepartmentOptions : 제형담당부서 옵션 저장
 * --------------------------------------------
 * @param {*} params : 저장 파라미터 (company_id, lab_departments 배열)
 * @returns : 저장 결과
 */
export const saveLabsDepartmentOptions = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'lab_departments']);

  const companyId = utils.toNumberOrNull(params.company_id);
  const labDepartments = params.lab_departments;

  let conn;

  try {
    conn = await getPool().getConnection();
    
    // 트랜잭션 시작
    await conn.beginTransaction();

    // 병렬 처리를 위한 Promise 배열 생성
    const promises = labDepartments.map(async (dept) => {

      const deptParams = {
        company_id: companyId,
        labs_department_id: dept.labs_department_id,
        parent_department_code: dept.parent_department_code,
        labs_department_code: dept.labs_department_code,
        labs_department_name: dept.labs_department_name,
        labs_department_email: dept.labs_department_email,
        is_active: utils.toNumberOrNull(dept.is_active),
        sort_order: utils.toNumberOrNull(dept.sort_order),
        from_db: dept.from_db
      };

      // from_db 값에 따라 UPDATE 또는 INSERT 실행
      if (dept.from_db === 'Y') {
        // 기존 데이터: UPDATE
        await settingQuery.updateLabsDepartmentOptions(conn, deptParams);
        return {
          type: 'updated',
          data: {
            labs_department_id: dept.labs_department_id,
            labs_department_name: dept.labs_department_name,
            status: 'success'
          }
        };
      } else if (dept.from_db === 'N') {
        // 새로운 데이터: INSERT (공백이 아닌 경우만)
        if (dept.labs_department_name && dept.labs_department_code) {
          await settingQuery.insertLabsDepartmentOptions(conn, deptParams);
          return {
            type: 'inserted',
            data: {
              labs_department_name: dept.labs_department_name,
              labs_department_code: dept.labs_department_code,
              status: 'success'
            }
          };
        }
        return null;
      }
    });

    // 모든 Promise를 병렬로 실행
    const allResults = await Promise.all(promises);

    // 결과를 분류
    const results = {
      inserted: [],
      updated: [],
      errors: []
    };

    allResults.forEach(result => {
      if (result) {
        if (result.type === 'inserted') {
          results.inserted.push(result.data);
        } else if (result.type === 'updated') {
          results.updated.push(result.data);
        }
      }
    });

    // 트랜잭션 커밋
    await conn.commit();

    return {
      result: results
    }

  } catch (err) {
    // 트랜잭션 롤백
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getUserGrades : 사용자 직급 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns 
 */
export const getUserGrades = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting)
  }

  let conn;
  
  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findUserGrades(conn, queryParams);

    const gradeList = result.map(grade => ({
      idx: parseInt(grade.idx, 10), // 10진수 정수로 변환
      user_grade_id: grade.user_grade_id,
      grade_name: grade.grade_name,
      grade_level: grade.grade_level,
      is_active: grade.is_active,
      sort_order: grade.sort_order,
      from_db: grade.from_db
    }));

    return {
      result: gradeList
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
  
};


/**
 * getDepartmentOptions : 부서 목록 조회
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns 
 */
export const getDepartmentOptions = async (params) => {
  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting)
  }

  let conn;
  
  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findDepartmentOptions(conn, queryParams);

    const deptList = result.map(dept => ({
      idx: parseInt(dept.idx, 10), // 10진수 정수로 변환
      department_id: dept.department_id,
      company_code: dept.company_code,
      company_name: dept.company_name,
      division_code: dept.division_code,
      division_name: dept.division_name,
      team_code: dept.team_code,
      team_name: dept.team_name,
      part_code: dept.part_code,
      part_name: dept.part_name,
      is_active: dept.is_active,
      sort_order: dept.sort_order,
      from_db: dept.from_db
    }));

    return {
      result: deptList
    };

  } catch (err) {
    throw err;

  } finally {
    if (conn) conn.release();
  }
};



/* ============================== 설정 ============================== */
/**
 * getUserCustomSettings : 사용자별 커스텀 설정 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (user_id)
 * @returns 
 */ 
export const getUserCustomSettings = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['user_id', 'company_id']);

  let conn;

  try {
    conn = await getPool().getConnection();

    const queryParams = {
      user_id: utils.toNumberOrNull(params.user_id),
      company_id: utils.toNumberOrNull(params.company_id),
      is_setting: utils.toNumberOrNull(params.is_setting)
    };

    const settings = await authQuery.findUserCustomSettings(conn, queryParams);

    if (settings === null) {
      return null; // 사용자 설정이 없는 경우 null 반환
    }

    return {
      result: {
        setting_id: settings.setting_id,
        company_id: settings.company_id,
        user_id: settings.user_id,
        default_menu_code: settings.default_menu_code,
        default_page_path: settings.default_page_path,
        module_default_settings: utils.parseJsonField(settings.module_default_settings),
        theme_mode: settings.theme_mode,
        sidebar_collapsed: settings.sidebar_collapsed,
        items_per_page: settings.items_per_page,
        date_format: settings.date_format,
        time_format: settings.time_format,
        language: settings.language,
        notification_enabled: settings.notification_enabled,
        notification_email: settings.notification_email,
        notification_sms: settings.notification_sms,
        custom_settings: utils.parseJsonField(settings.custom_settings),
        is_active: settings.is_active,
        sort_order: settings.sort_order,
        created_at: settings.created_at,
        created_by: settings.created_by,
        updated_at: settings.updated_at,
        updated_by: settings.updated_by,
        deleted_at: settings.deleted_at,
        deleted_by: settings.deleted_by
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * updateUserCustomSetting : 사용자별 커스텀 설정 수정
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns 
 */
export const updateUserCustomSetting = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['user_id', 'company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    user_id: utils.toNumberOrNull(params.user_id),
    default_menu_code: params.default_menu_code || null,
    default_page_path: params.default_page_path || null,
    module_default_settings: params.module_default_settings ? JSON.stringify(params.module_default_settings) : null,
    theme_mode: params.theme_mode || 'light',
    sidebar_collapsed: utils.toNumberOrNull(params.sidebar_collapsed) || 0,
    items_per_page: utils.toNumberOrNull(params.items_per_page) || 15,
    date_format: params.date_format || 'YYYY-MM-DD',
    time_format: params.time_format || 'HH:mm:ss',
    language: params.language || 'ko',
    notification_enabled: utils.toNumberOrNull(params.notification_enabled) ?? 0,
    notification_email: utils.toNumberOrNull(params.notification_email) ?? 0,
    notification_sms: utils.toNumberOrNull(params.notification_sms) ?? 0,
    custom_settings: params.custom_settings ? JSON.stringify(params.custom_settings) : null,
    is_active: utils.toNumberOrNull(params.is_active) ?? 1,
    sort_order: utils.toNumberOrNull(params.sort_order) || 1
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.updateUserCustomSettings(conn, queryParams);

    return {
      result: {
        affectedRows: result.affectedRows
      }
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};



/* ============================== 결재선 관리 ============================== */
/** * getApprovalDocumentTypes : CT 결재 문서 유형 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id)
 * @returns 
 */
export const getApprovalDocumentTypes = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    is_setting: utils.toNumberOrNull(params.is_setting) // 설정 화면용 데이터 조회 플래그
  };

  let conn;

  try {
    conn = await getPool().getConnection();

    const result = await settingQuery.findApprovalDocumentTypes(conn, queryParams);

    const documentTypes = result.map(docType => ({
      idx: parseInt(docType.idx, 10), // 10진수 정수로 변환
      approval_document_type_id: docType.approval_document_type_id,
      document_type_code: docType.document_type_code,
      document_type_name: docType.document_type_name,
      module_name: docType.module_name,
      is_active: docType.is_active,
      sort_order: docType.sort_order,
      from_db: docType.from_db
    }));

    return {
      result: documentTypes
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getApprovalTemplates : 결재 템플릿 목록 조회 (결재선 개수 포함)
 * --------------------------------------------
 * @param {*} params : 조회 파라미터
 * @returns : 템플릿 목록 (line_count 포함)
 * 
 * 설명:
 *   - approval_template과 approval_line_template을 LEFT JOIN 후 COUNT
 *   - 결재선 개수(line_count)만 포함하여 반환
 *   - 프론트엔드에서 그룹화 불필요
 */
export const getApprovalTemplates = async (params) => {

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    approval_template_id: utils.toNumberOrNull(params.approval_template_id),
    document_type: utils.toStringOrEmpty(params.document_type),
    is_setting: utils.toNumberOrNull(params.is_setting) // 설정 화면용 데이터 조회 플래그
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await settingQuery.findApprovalTemplates(conn, queryParams);
    
    // 쿼리 결과를 그대로 반환 (이미 템플릿별로 1행씩, line_count 포함)
    const templates = result.map(row => ({
      idx: parseInt(row.idx, 10), // 10진수 정수로 변환
      approval_template_id: row.approval_template_id,
      company_id: row.company_id,
      template_name: row.template_name,
      document_type: row.document_type,
      description: row.description,
      is_default: row.is_default,
      is_active: row.is_active,
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      line_count: parseInt(row.line_count, 10)  // 결재선 개수
    }));
    
    return {
      result: templates
    };
    
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * getApprovalTemplateWithLines : 결재 템플릿 상세 정보 및 결재선 목록 조회
 * --------------------------------------------
 * @param {*} params : 조회 파라미터 (company_id, approval_template_id)
 * @returns : 템플릿 정보와 결재선 목록
 */
export const getApprovalTemplateWithLines = async (params) => {

  // 필수 파라미터 검증
  utils.checkRequiredParams(params, ['company_id', 'approval_template_id']);

  const queryParams = {
    company_id: utils.toNumberOrNull(params.company_id),
    approval_template_id: utils.toNumberOrNull(params.approval_template_id)
  };

  let conn;

  try {
    conn = await getPool().getConnection();
    const result = await settingQuery.findApprovalTemplateWithLines(conn, queryParams);

    // 템플릿이 존재하지 않는 경우
    if (!result.template) {
      return {
        result: null
      };
    }

    // 결재선 목록 가공
    const lines = result.lines.map(line => ({
      idx: parseInt(line.idx, 10),
      approval_line_template_id: line.approval_line_template_id,
      company_id: line.company_id,
      approval_template_id: line.approval_template_id,
      document_type: line.document_type,
      step: line.step,
      user_grade_id: line.user_grade_id,
      department_id: line.department_id,
      team_code: line.team_code,
      approver_id: line.approver_id,
      approval_type: line.approval_type,
      is_parallel: line.is_parallel,
      parallel_group_id: line.parallel_group_id,
      parallel_approval_rule: line.parallel_approval_rule,
      condition_type: line.condition_type,
      condition_value: line.condition_value,
      is_active: line.is_active,
      sort_order: line.sort_order,
      grade_name: line.grade_name,
      from_db: line.from_db
    }));

    return {
      result: {
        template: result.template,
        lines: lines
      }
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * toggleApprovalTemplateIsActive : 결재 템플릿 활성/비활성 토글
 * --------------------------------------------
 * @param {*} params : 수정 파라미터
 * @returns {Promise<Object>} : 수정 결과
 */
export const toggleApprovalTemplateIsActive = async (params) => {

  let conn;
  
  try {

    conn = await getPool().getConnection();

    const queryParams = {
      company_id: utils.toNumberOrNull(params.company_id),
      approval_template_id: utils.toNumberOrNull(params.approval_template_id),
      is_active: utils.toBooleanInt(params.is_active),
      updated_by: utils.toNumberOrNull(params.user_id)
    };

    await settingQuery.updateApprovalTemplateIsActive(conn, queryParams);

    return {
      message: params.is_active === 1 ? "결재 템플릿이 활성화되었습니다." : "결재 템플릿이 비활성화되었습니다."
    };

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * saveApprovalLineTemplates : 결재 템플릿 및 결재선 템플릿 일괄 저장
 * --------------------------------------------
 * @param {*} params : 저장 파라미터
 *   - company_id: 회사 ID
 *   - approval_template_id: 결재 템플릿 ID (수정 시), null (신규 시)
 *   - template_name: 템플릿명
 *   - document_type: 문서 유형
 *   - description: 설명
 *   - is_default: 기본 템플릿 여부
 *   - is_active: 활성 여부
 *   - user_id: 사용자 ID (작성자/수정자)
 *   - templateList: 결재선 목록 배열
 * @returns {Promise<Object>} : 저장 결과
 */
export const saveApprovalLineTemplates = async (params) => {

  let conn;
  
  try {

    conn = await getPool().getConnection();

    await conn.beginTransaction();

    utils.checkRequiredParams(params, [
      'company_id',
      'template_name',
      'document_type',
      'user_id',
      'templateList'
    ]);

    const companyId = utils.toNumberOrNull(params.company_id);
    let approvalTemplateId = utils.toNumberOrNull(params.approval_template_id);
    const documentType = utils.toStringOrEmpty(params.document_type);
    const templateList = params.templateList || [];
    const userId = utils.toNumberOrNull(params.user_id);

    // 1. 결재 템플릿 UPSERT (UPDATE or INSERT)
    if (approvalTemplateId) {
      // 수정 모드: UPDATE
      const templateUpdateParams = {
        company_id: companyId,
        approval_template_id: approvalTemplateId,
        template_name: utils.toStringOrEmpty(params.template_name),
        description: utils.toStringOrEmpty(params.description),
        is_default: utils.toBooleanInt(params.is_default) || 0,
        is_active: utils.toBooleanInt(params.is_active) || 1,
        updated_by: userId
      };
      
      await settingQuery.updateApprovalTemplate(conn, templateUpdateParams);
      
    } else {
      // 등록 모드: INSERT
      const templateInsertParams = {
        company_id: companyId,
        template_name: utils.toStringOrEmpty(params.template_name),
        document_type: documentType,
        description: utils.toStringOrEmpty(params.description),
        is_default: utils.toBooleanInt(params.is_default) || 0,
        is_active: utils.toBooleanInt(params.is_active) || 1,
        created_by: userId
      };
      
      const insertResult = await settingQuery.insertApprovalTemplate(conn, templateInsertParams);
      approvalTemplateId = insertResult.insertId.toString();
    }

    // 2. 기존 결재선 비활성화 (is_active = 0)
    await settingQuery.deactivateApprovalLineTemplatesByTemplateId(conn, {
      company_id: companyId,
      deleted_by: userId,
      approval_template_id: approvalTemplateId
    });

    // 3. 새로운 결재선 추가 (INSERT)
    if (templateList.length > 0) {
      for (const template of templateList) {
        const lineParams = {
          company_id: companyId,
          approval_template_id: approvalTemplateId,
          document_type: documentType,
          step: utils.toNumberOrNull(template.step),
          user_grade_id: utils.toNumberOrNull(template.user_grade_id),
          department_id: utils.toNumberOrNull(template.department_id),
          team_code: utils.toStringOrEmpty(template.team_code),
          approver_id: utils.toNumberOrNull(template.approver_id),
          approval_type: utils.toStringOrEmpty(template.approval_type) || 'APPROVE',
          is_parallel: utils.toBooleanInt(template.is_parallel),
          parallel_group_id: utils.toNumberOrNull(template.parallel_group_id),
          parallel_approval_rule: utils.toStringOrEmpty(template.parallel_approval_rule) || 'ALL',
          condition_type: utils.toStringOrEmpty(template.condition_type),
          condition_value: utils.toStringOrEmpty(template.condition_value),
          is_active: utils.toBooleanInt(template.is_active) ?? 1,
          sort_order: utils.toNumberOrNull(template.sort_order) || utils.toNumberOrNull(template.step)
        };

        await settingQuery.insertApprovalLineTemplate(conn, lineParams);
      }
    }
    
    await conn.commit();

    return {
      result: {
        approval_template_id: approvalTemplateId,
        message: "결재 템플릿 및 결재선이 저장되었습니다."
      }
    };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};


/**
 * setDefaultApprovalTemplate : 결재 템플릿 기본값 설정
 * --------------------------------------------
 * @param {*} params : 설정 파라미터
 *   - company_id: 회사 ID
 *   - document_type: 문서 유형
 *   - approval_template_id: 기본으로 설정할 템플릿 ID
 *   - user_id: 사용자 ID
 * @returns {Promise<Object>} : 설정 결과
 */
export const setDefaultApprovalTemplate = async (params) => {

  let conn;

  utils.checkRequiredParams(params, [
    'company_id',
    'document_type',
    'approval_template_id',
    'user_id'
  ]);
  
  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    const companyId = utils.toNumberOrNull(params.company_id);
    const documentType = utils.toStringOrEmpty(params.document_type);
    const approvalTemplateId = utils.toNumberOrNull(params.approval_template_id);
    const userId = utils.toNumberOrNull(params.user_id);

    const unsetParams = {
      company_id: companyId,
      document_type: documentType,
      updated_by: userId
    };

    const setParams = {
      company_id: companyId,
      approval_template_id: approvalTemplateId,
      updated_by: userId
    };

    // 1. 같은 문서 유형의 모든 템플릿 is_default를 0으로 변경
    await settingQuery.unsetDefaultApprovalTemplates(conn, unsetParams);

    // 2. 현재 템플릿을 기본 템플릿으로 설정
    await settingQuery.setDefaultApprovalTemplate(conn, setParams);

    await conn.commit();

    return {
      result: {
        message: "기본 템플릿으로 설정되었습니다."
      }
    };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};