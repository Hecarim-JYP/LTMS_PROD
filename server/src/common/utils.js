/**
 * 파일명 : utils.js
 * 용도 : 기본 유틸 함수 모음
 * 최초등록 : 2026-01-28 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */


/**
 * isNullOrEmpty : 문자열이 null, undefined, 빈 문자열인지 확인
 * --------------------------------------------
 * @param {string} str - 확인할 문자열
 * @returns {boolean} - null, undefined, 빈 문자열이면 true 반환
 */
export const isNullOrEmpty = (str) => {
    return str === null || str === undefined || str.trim() === '';
};

/**
 * formatDate : 날짜 객체를 'YYYY-MM-DD' 형식의 문자열로 변환
 * --------------------------------------------
 * @param {Date} d - 변환할 날짜 객체
 * @returns {string} - 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


/**
 * toNumberOrNull : 값을 숫자로 변환하되, 변환이 불가능하면 null 반환
 * --------------------------------------------
 * @param {*} v : 변환할 값
 * @returns {number|null} - 숫자로 변환된 값 또는 변환이 불가능할 경우 null
 */
export const toNumberOrNull = (v) => {
    if (v === '' || v === undefined || v === null) return null;
    const num = Number(v);
    return Number.isNaN(num) ? null : num;
};

/**
 * toDateOrNull : 날짜: falsy → null / 문자열, Date 모두 Date 객체로 변환
 * --------------------------------------------
 * @param {*} v : 변환할 값
 * @returns {Date|null} - Date 객체 또는 변환이 불가능할 경우 null
 */
export const toDateOrNull = (v) => {
    if (!v) return null;
    const date = new Date(v);
    return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * toStringOrEmpty : 문자열: undefined/null → '' / 그 외는 문자열
 * --------------------------------------------
 * @param {*} v : 변환할 값
 * @returns {string} - 문자열 또는 빈 문자열
 */
export const toStringOrEmpty = (v) => {
    if (v === undefined || v === null) return '';
    return String(v);
};


/**
 * toBooleanInt : boolean 값 v를 숫자형으로 변환 (true/1/'1' → 1, 그 외 → 0)
 * --------------------------------------------
 * @param {*} v : 변환할 값
 * @returns {number} - 1 또는 0
 */
export const toBooleanInt = (v) => {
    return v === true || v === 1 || v === '1' ? 1 : 0;
};


/**
 * formatDateOrNull : 날짜 값을 'YYYY-MM-DD' 형식으로 포맷하거나 null 반환
 * HOW : 빈값 → null / 정상 날짜 → 'YYYY-MM-DD' / 잘못된 날짜 → null
 * --------------------------------------------
 * @param {*} v : 포맷할 날짜 값 (Date 객체 또는 문자열)
 * @returns {string|null} - 'YYYY-MM-DD' 형식의 문자열 또는 null
 * 
 * @example
 * formatDateOrNull('2026-02-02') → '2026-02-02'
 * formatDateOrNull(new Date('2026-02-02')) → '2026-02-02'
 * formatDateOrNull('') → null
 * formatDateOrNull(null) → null
 * formatDateOrNull('invalid-date') → null
 */
export const formatDateOrNull = (v) => {
    // 빈값 체크
    if (!v) return null;
    
    // Date 객체로 변환
    const dateObj = new Date(v);
    
    // 유효한 날짜 확인
    if (Number.isNaN(dateObj.getTime())) return null;
    
    // 'YYYY-MM-DD' 형식으로 포맷
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


/**
 * checkRequiredParams : 필수 파라미터 누락 여부 확인
 * --------------------------------------------
 * @param {*} params : 파라미터 객체
 * @param {*} requiredKeys : 필수 키 배열
 * @throws {Error} : 필수 값이 누락된 경우 에러 발생
 * 
 * @example
 * checkRequiredParams({ name: 'John' }, ['name']) // 통과
 * checkRequiredParams({ items: [] }, ['items']) // 에러: 빈 배열
 * checkRequiredParams({ data: {} }, ['data']) // 에러: 빈 객체
 */
export const checkRequiredParams = (params, requiredKeys) => {

    for (const key of requiredKeys) {

        const value = params[key];
        
        // null, undefined, 빈 문자열 체크
        if (value === undefined || value === null || value === '') {
            throw {
                message: `필수 값이 누락되었습니다. (${key})`,
                fieldName: key,
                code: 500
            };
        }
        
        // 배열인 경우 빈 배열 체크
        if (Array.isArray(value) && value.length === 0) {
            throw {
                message: `필수 값이 누락되었습니다. (${key})`,
                fieldName: key,
                code: 500
            };
        }
        
        // 객체인 경우 빈 객체 체크 (Date 객체 등은 제외)
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && Object.keys(value).length === 0) {
            throw {
                message: `필수 값이 누락되었습니다. (${key})`,
                fieldName: key,
                code: 500
            };
        }
    }
};


/**
 * checkRequiredValue : 단일 값의 유효성 검증
 * --------------------------------------------
 * @param {*} value : 검증할 값
 * @param {string} fieldName : 필드명 (에러 메시지에 사용)
 * @throws {Error} : 값이 유효하지 않은 경우 에러 발생
 * 
 * @example
 * checkRequiredValue('John', 'name') // 통과
 * checkRequiredValue(null, 'userId') // 에러: 필수 값 누락
 * checkRequiredValue([], 'items') // 에러: 빈 배열
 * checkRequiredValue({}, 'data') // 에러: 빈 객체
 */
export const checkRequiredValue = (value, fieldName) => {
    
    // null, undefined, 빈 문자열 체크
    if (value === undefined || value === null || value === '') {
        throw {
            message: `필수 값이 누락되었습니다. (${fieldName})`,
            fieldName: fieldName,
            code: 500
        };
    }
    
    // 배열인 경우 빈 배열 체크
    if (Array.isArray(value) && value.length === 0) {
        throw {
            message: `필수 값이 누락되었습니다. (${fieldName})`,
            fieldName: fieldName,
            code: 500
        };
    }
    
    // 객체인 경우 빈 객체 체크 (Date 객체 등은 제외)
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && Object.keys(value).length === 0) {
        throw {
            message: `필수 값이 누락되었습니다. (${fieldName})`,
            fieldName: fieldName,
            code: 500
        };
    }
};


/**
 * parseJsonField : JSON 필드 파싱 (문자열 → 객체)
 * --------------------------------------------
 * @param {*} field : 파싱할 JSON 필드 (문자열 또는 객체)
 * @param {*} defaultValue : 파싱 실패 시 반환할 기본값 (기본값: null)
 * @returns {*} : 파싱된 객체 또는 기본값
 * 
 * @description
 * - null/undefined → 기본값 반환
 * - 이미 객체인 경우 → 그대로 반환
 * - JSON 문자열인 경우 → 파싱 후 반환
 * - 파싱 실패 시 → 기본값 반환
 * 
 * @example
 * parseJsonField('{"a":1}') // { a: 1 }
 * parseJsonField({ a: 1 }) // { a: 1 }
 * parseJsonField(null) // null
 * parseJsonField('invalid', {}) // {}
 * parseJsonField(null, []) // []
 */
export const parseJsonField = (field, defaultValue = null) => {
    // null, undefined 체크
    if (field === null || field === undefined) {
        return defaultValue;
    }
    
    // 이미 객체나 배열인 경우 그대로 반환
    if (typeof field === 'object') {
        return field;
    }
    
    // 문자열인 경우 JSON 파싱 시도
    if (typeof field === 'string') {
        // 빈 문자열 체크
        if (field.trim() === '') {
            return defaultValue;
        }
        
        try {
            return JSON.parse(field);
        } catch (e) {
            console.warn(`JSON 파싱 실패:`, field, e.message);
            return defaultValue;
        }
    }
    
    // 그 외의 타입은 기본값 반환
    return defaultValue;
};


/**
 * 디버깅용: 네임드 파라미터를 실제 값으로 치환하여 쿼리 출력
 * @param {string} query - SQL 쿼리 문자열
 * @param {object} params - 파라미터 객체
 * @returns {string} - 파라미터가 바인딩된 쿼리 문자열
 */
export const debugQuery = (query, params) => {

  let debugSql = query;
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    let replacement;
    
    if (value === null || value === undefined) {
      replacement = 'NULL';
    } else if (typeof value === 'string') {
      replacement = `'${value.replace(/'/g, "''")}'`; // SQL 이스케이프
    } else if (typeof value === 'number') {
      replacement = value.toString();
    } else {
      replacement = `'${JSON.stringify(value)}'`;
    }
    
    // :param_name 형식의 네임드 파라미터를 실제 값으로 치환
    const regex = new RegExp(`:${key}\\b`, 'g');
    debugSql = debugSql.replace(regex, replacement);
  });
  
  return debugSql;
};


/**
 * validateColumnName : SQL 컬럼명 화이트리스트 검증 (SQL 인젝션 방어)
 * --------------------------------------------
 * @param {string} columnName - 검증할 컬럼명
 * @param {string[]} allowedColumns - 허용된 컬럼명 배열
 * @param {string} errorMessage - 에러 메시지 (선택)
 * @throws {Error} - 허용되지 않은 컬럼명인 경우 에러 발생
 * 
 * @description
 * 동적으로 컬럼명을 삽입할 때 SQL 인젝션을 방지하기 위한 화이트리스트 검증
 * 
 * @example
 * validateColumnName('cr.ct_request_date', ['cr.ct_request_date', 'cr.ct_receipt_date']);
 * validateColumnName('malicious; DROP TABLE', ['cr.ct_request_date']); // 에러 발생
 */
export const validateColumnName = (columnName, allowedColumns, errorMessage = '허용되지 않은 컬럼명입니다') => {
  if (!allowedColumns.includes(columnName)) {
    throw {
      message: `${errorMessage}: ${columnName}`,
      fieldName: 'columnName',
      code: 400
    };
  }
  return columnName;
};


/**
 * sanitizeSearchPattern : LIKE 검색 패턴 안전화 (와일드카드 이스케이프)
 * --------------------------------------------
 * @param {string} pattern - 검색 패턴
 * @param {object} options - 옵션 { prefix: '%', suffix: '%', escape: true }
 * @returns {string} - 안전화된 검색 패턴
 * 
 * @description
 * LIKE 절에서 사용할 검색 패턴의 특수문자를 이스케이프 처리
 * 
 * @example
 * sanitizeSearchPattern('test_value') → '%test\\_value%'
 * sanitizeSearchPattern('50%', { prefix: '', suffix: '%' }) → '50\\%%'
 */
export const sanitizeSearchPattern = (pattern, options = {}) => {
  const { prefix = '%', suffix = '%', escape = true } = options;
  
  if (!pattern) return pattern;
  
  let sanitized = String(pattern);
  
  // LIKE 와일드카드 이스케이프: _ → \_ , % → \%
  if (escape) {
    sanitized = sanitized
      .replace(/\\/g, '\\\\')  // \ → \\
      .replace(/_/g, '\\_')     // _ → \_
      .replace(/%/g, '\\%');    // % → \%
  }
  
  return `${prefix}${sanitized}${suffix}`;
};


/**
 * checkRequiredValue : 단일 값의 유효성 검증
 * --------------------------------------------
 * @param {*} value : 검증할 값
 * @param {string} fieldName : 필드명 (에러 메시지에 사용)
 * @throws {Error} : 값이 유효하지 않은 경우 에러 발생
 * 
 * @example
 * checkRequiredValue('John', 'name') // 통과
 * checkRequiredValue(null, 'userId') // 에러: 필수 값 누락
 * checkRequiredValue([], 'items') // 에러: 빈 배열
 * checkRequiredValue({}, 'data') // 에러: 빈 객체
 */
export const checkPreRequiredValue = (value, fieldName, fieldKR) => {
    
    // null, undefined, 빈 문자열 체크
    if (value === undefined || value === null || value === '') {
        // throw new Error(`필수 값이 누락되었습니다.: ${fieldName}`);
        const error = new Error(`필수 값이 누락되었습니다.: ${fieldKR}`);
        error.field = fieldName;
        error.status = 400;
        console.log("▣ ERROR 1: ", error.field);
        throw error;
    }
    
    // 배열인 경우 빈 배열 체크
    if (Array.isArray(value) && value.length === 0) {
        // throw new Error(`필수 값이 누락되었습니다.: ${fieldName} (빈 배열)`);
        const error = new Error(`필수 값이 누락되었습니다.: ${fieldKR}`);
        error.field = fieldName;
        error.status = 400;
        console.log("▣ ERROR 2: ", error.field);
        throw error;
    }
    
    // 객체인 경우 빈 객체 체크 (Date 객체 등은 제외)
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && Object.keys(value).length === 0) {
        // throw new Error(`필수 값이 누락되었습니다.: ${fieldName} (빈 객체)`);
        const error = new Error(`필수 값이 누락되었습니다.: ${fieldKR}`);
        error.field = fieldName;
        error.status = 400;
        console.log("▣ ERROR 3: ", error.field);
        throw error;
    }
};


/**
 * isLabNo : 랩 번호 여부 확인 함수
 * --------------------------------------------
 * WHAT : 문자열의 처음 세 글자가 영어이고 그 뒤에 숫자가 오는지 확인하는 함수 (랩 번호 여부)
 * WHY : 검색어가 랩 번호인지 여부를 판단하여 검색 조건을 다르게 적용하기 위해 별도 함수로 구현
 * HOW : 정규식 /^[A-Za-z]{3}[0-9]/ 사용하여 처음 세 글자가 영어이고 그 뒤에 숫자가 오는지 검증
 * @param {string} str 
 * @returns {boolean}
 */
// export const isLabNo = str => /^[A-Za-z]{3}[0-9]/.test(str);
export const isLabNo = str => /^[A-Za-z]{3}/.test(str);


/**
 * isKorName : 한글 이름 여부 확인 함수
 * --------------------------------------------
 * WHAT : 문자열이 2~5글자의 한글로만 구성되어 있는지 확인하는 함수 (한글 이름 여부)
 * WHY : 고객명 검색 시 한글 이름으로 검색하는 경우가 많아 별도 함수로 구현
 * HOW : 정규식 /^[가-힣]{2,5}$/ 사용하여 2~5글자의 한글로만 구성되어 있는지 검증
 * @param {string} str 
 * @returns {boolean}
 */
export const isKorName = str => /^[가-힣]{2,5}$/.test(str);


/**
 * getSearchCondition : 검색어에 따른 검색 조건 반환 함수
 * --------------------------------------------
 * @param {string} searchQuery - 검색어
 * @returns {string} - 검색 조건 (requestNo, labNo, name 등)
 */
export const getSearchCondition = (searchQuery) => {

    const targetStr = searchQuery;

    if(targetStr.startsWith("CT") || targetStr.length === 7) {
        return "requestNo";
    } else if (isLabNo(targetStr)) {
        return "labNo";
    } else if (isKorName(targetStr)) {
        return "name";
    } else {
        return "general";
    }
};


/**
 * ■ 내부성분분석 필수값 검증
 * ---------------------------------------------
 * @name checkInternalRequiredValue
 * @description 넘겨지는 필드명 별로 빈 값 여부 체크 및 반환
 * @param { String } fieldName : 필드명
 * @param {*} value : 데이터 값
 * @throws { Error } : 값이 유효하지 않은 필드 반환
 */
export const checkInternalRequiredValue = (value, fieldName, fieldKR) => {
    console.log(`⚡ 필수목록 검증 진입 VALUE : ${value}`);
    console.log(`⚡ 필수목록 검증 진입 FIELD : ${fieldName}`);
    if (value === null || value === undefined || value === '') {
        console.log(`value == null : TRUE`);
        const error = new Error(`\n❌ 필수 값이 누락되었습니다. : ${fieldKR}`);
        error.field = fieldName;
        error.status = 400;
        throw error;
    }
}


/**
 * decodeFileName : multer가 latin1로 받은 파일명을 UTF-8로 변환
 * --------------------------------------------
 * multer는 기본적으로 파일명을 latin1 인코딩으로 받으므로
 * 한글 파일명이 깨지는 문제를 해결하기 위해 UTF-8로 재변환
 * @param {string} filename : multer에서 받은 파일명
 * @returns {string} : UTF-8로 변환된 파일명
 */
export const decodeFileName = (filename) => {
  try {
    return Buffer.from(filename, 'latin1').toString('utf8');
  } catch (err) {
    console.error('파일명 디코딩 실패:', err);
    return filename; // 변환 실패 시 원본 반환
  }
};