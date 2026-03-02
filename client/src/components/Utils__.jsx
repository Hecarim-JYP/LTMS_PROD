/**
 * 파일명 : Utils.jsx
 * 용도 : 기본 유틸 함수 상태관리가 필요하지 않은 함수 목록
 * 최초등록 : 2025-12-10 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */


export const Utils = {


    /**
     * isValidDate : 날짜 형식 유효성 검증
     * 
     * @param {string} dateString - 검증할 날짜 문자열 (예: "2025-12-12")
     * @returns {boolean} - 유효한 날짜 형식이면 true, 아니면 false
     * 
     * HOW: Date 객체로 변환 후 유효성 체크
     * WHY: 문자열만으로는 "2025-13-32" 같은 잘못된 날짜를 걸러낼 수 없음
     */
    "isValidDate" : (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime()); 
    },


    /**
     * formatDateISO(date) : 날짜 전환 함수
     * -------------------------------------------
     * HOW : Date 객체에서 연/월/일을 추출해 'YYYY-MM-DD' 형식의 문자열로 반환
     *       month, day는 padStart(2, "0") 를 통해 항상 2자리로 맞춘다
     * 
     * WHY : 날짜 데이터를 백엔드 API나 DB 조회 파라미터에 전달할 때 표준 ISO 포맷 형태로 일관되게 변환하기 위함
     * 
     * @param date : 전환 대상 날짜
     */
    "formatDateISO" : (date) => {
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    },


    /**
     * addDay(dateStr, n) : 날짜 추가 함수
     * -------------------------------------------
     * HOW : 'YYYY-MM-DD' 날짜 문자열을 Date 객체로 변환 후
     *       d.getDate() + n 값을 setDate로 적용해 날짜 계산을 수행
     *
     * WHY : 기준 날짜에서 특정 일수(n)를 더하거나 빼기 위한 유틸 함수
     * 
     * @param dateStr : 날짜를 추가할 기준 날짜
     * @param n : 추가할 일 수
     */
    "addDay" : (dateStr, n) => {
        const d = new Date(dateStr + "T00:00:00");
        d.setDate(d.getDate() + n); // 기준은 일요일부터 시작
        return Utils.formatDateISO(d);
    },


    /**
     * addDayCalendar(dateStr, n) : 날짜 추가 함수 - 캘린더 전용
     * -------------------------------------------
     * HOW : 'YYYY-MM-DD' 날짜 문자열을 Date 객체로 변환 후
     *       (d.getDate() - 1) + n 값을 setDate로 적용해 날짜 계산을 수행
     *       기존 코드 특성상 일요일 기준 0으로 맞추려는 목적이 있어
     *       -1 보정이 들어가 있음
     *
     * WHY : 기준 날짜에서 특정 일수(n)를 더하거나 빼기 위한 유틸 함수
     * 
     * @param dateStr : 날짜를 추가할 기준 날짜
     * @param n : 추가할 일 수
     */
    "addDayCalendar" : (dateStr, n) => {
        const d = new Date(dateStr + "T00:00:00");
        d.setDate((d.getDate()-1) + n); // 기준은 일요일부터 시작
        return Utils.formatDateISO(d);
    },


    /**
     * startOfWeek(date) : 특정 주의 시작일 반환 함수
     * -------------------------------------------
     * HOW : 현재 날짜의 요일(d.getDay())을 기반으로
     *       월요일(Monday)을 주 시작(0)으로 보기 위해 diff = (day + 6) % 7을 계산
     *       해당 diff 만큼 날짜를 되돌려 해당 주의 월요일 날짜를 반환한다.
     *
     * WHY : 주간 조회 기능에서 주 시작일을 구할 때 사용
     * 
     * @param date : 주의 시작일을 구할 날짜
     */
    "startOfWeek" : (date) => {
        const d = new Date(date);
        const diff = (d.getDay() + 6) % 7; // Monday = 0
        d.setDate(d.getDate() - diff);
        return Utils.formatDateISO(d);
    },


    /**
     * cleanParams(obj) : 객체 빈값 제거 함수
     * -------------------------------------------
     * HOW : Object.entries(obj)를 통해 [key, value] 배열로 변환
     *       값이 ("", null, undefined) 인 항목을 필터링하여 제거하고, Object.fromEntries로 다시 객체로 재조립
     *
     * WHY : API 요청 파라미터에서 불필요한 빈 값 제거
     * 
     * @param obj : 빈값 제거 대상 form 객체
     */
    "cleanParams" : (obj) =>
        Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        ),


    /**
     * cleanParamsArray : cleanParams 기반 배열 처리
     * @param {*} arr : 빈값을 제거할 배열
     * @returns 
     */
    "cleanParamsArray" : (arr) => arr.map(Utils.cleanParams)
                                     .filter(obj => Object.keys(obj).length > 0),


    /**
     * compareValues(key, a, b) : 정렬 시 단일 필드 값을 비교하는 유틸 함수
     * -------------------------------------------
     * HOW : key에 해당하는 값(va, vb)을 각각 추출한 뒤 다음 규칙에 따라 비교한다.
     *
     *       1) **null / undefined 처리**
     *          - 둘 다 null → 동일(0)
     *          - 하나만 null → null을 더 작다고 판단(-1 또는 1)
     *  
     *       2) **날짜 필드 자동 감지**
     *          - key 이름에 "date"가 포함되면 날짜로 간주
     *          - new Date()로 변환 후 시간 값을 비교
     *  
     *       3) **숫자 비교**
     *          - 두 값이 모두 number면 단순 산술 비교(va - vb)
     *  
     *       4) **문자열 비교**
     *          - localeCompare("ko")로 한국어 정렬규칙 기반 비교
     *          - sensitivity: "base" → 대소문자 구분 없이 비교
     *
     * WHY : 정렬 기준(sortKey)이 바뀌어도 일관된 방식으로 값을 비교하기 위한 공통 정렬 함수.
     * 
     * @param key : 비교 대상 키값
     * @param a : 값 a
     * @param b : 값 b
     */
    "compareValues" : (key, a, b) => {
        const va = a?.[key];
        const vb = b?.[key];
        if (va == null && vb == null) return 0;
        if (va == null) return -1;
        if (vb == null) return 1;
    
        // 날짜 키 추정: "Date" 포함 또는 ISO 형태
        const isDateKey = /date/i.test(key);
        if (isDateKey) {
            const da = new Date(va);
            const db = new Date(vb);
            return da - db;
        }
    
        if (typeof va === "number" && typeof vb === "number") {
            return va - vb;
        }
    
        return String(va).localeCompare(String(vb), "ko", { sensitivity: "base" });
    },


    /**
     * noticeValidation : 유효성 검증 후 에러 발생 시 안내 문구를 보여주는 함수
     * -------------------------------------------
     * @param {*} message : 화면에 보여줄 안내 메세지
     * @returns 
     */
    "noticeValidation" : (message) => (
        <>
            <span className="error-message">
                {`${message} 올바르지 않습니다.`}
            </span>
        </>
    ),


    /* ============================== 개발용 mock 데이터 생성 코드 ============================== */
    /**
     * randomPick : 표본 배열에서 무작위로 1개 데이터를 추출
     * -------------------------------------------
     * @param  arr : 무작위로 데이터를 추출할 표본 배열
     * @returns 무작위로 추출된 배열 요소
     */
    "randomPick" : (arr) => arr[Math.floor(Math.random() * arr.length)],


    /**
     * randomDate : 날짜 생성 함수 (기준년: 2025)
     * -------------------------------------------
     * @param {*} month : 월
     * @returns 
     */
    "randomDate" : (month) => {
        const day = Math.floor(Math.random() * 25) + 1;
        return `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    },


    /**
     * checkDecimal : 양의 정수(소수 포함)만 입력하도록 제어
     * -------------------------------------------
     * @param {*} e : 이벤트 호출 컴포넌트
     * @returns 
     */
    "checkDecimal" : (value) => {
        return value.replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1");
    },


    /**
     * checkPositiveNumber : 양의 정수만 입력하도록 제어
     * -------------------------------------------
     * @param {*} e : 이벤트 호출 컴포넌트
     * @returns 
     */
    "checkPositiveNumber" : (value) => {
        return value.replace(/[^0-9]/g, "");
    },


    /**
     * generateMockCTData : 무작위로 CT Mock 데이터를 배열로 만든다.
     * -------------------------------------------
     * @param count : CT Mock 데이터를 만들 갯수
     * @returns CT Mock 데이터 객체 배열
     */
    "generateMockCTData" : (count) => {

        const idxValues = ["1차", "2차", "3차"]; // 차수
        const korValues = ["V", "X"]; // 국문 여부
        const cpnpValues = ["", "진행 중", "완료"]; // cpnp 여부
        const engValues = ["V", "X"]; // 영문 여부
        const todayJudgeValues = ["대기 중", "시험 중", "완료"]; // 당일판정
        const weekJudgeValues = ["해당 없음", "적합", "부적합"]; // 1주판정
        const lastJudgeValues = ["적합", "부적합"]; // 최종판정
        const officeDocumentValues = ["보기", "없음"]; // 공문 여부
        const remarkValues = ["정상", "검토 필요", "재검토 필요", "영문 수정 필요", "문서 확인 요망", "추가 시험 필요", "정상 처리"]; // 기타비고
        const categories = ["공지", "기술", "마케팅", "제품"];

        const data = [];

        for (let i = 0; i < count; i++) {
            const number = (i + 1).toString().padStart(4, "0"); 

            data.push({
                id: `CT2025-${number}`,
                idx: Utils.randomPick(idxValues),
                kor: Utils.randomPick(korValues),
                cpnp: Utils.randomPick(cpnpValues),
                eng: Utils.randomPick(engValues),
                todayJudge: Utils.randomPick(todayJudgeValues),
                weekJudge: Utils.randomPick(weekJudgeValues),
                lastJudge: Utils.randomPick(lastJudgeValues),
                officeDocument: Utils.randomPick(officeDocumentValues),
                remark: Utils.randomPick(remarkValues),
                category: Utils.randomPick(categories),
            });
        }

        return data;
    },


    /**
     * generateMockCTApproveData : 무작위로 결재 Mock 데이터를 배열로 만든다.
     * -------------------------------------------
     * @param count : 결재 데이터를 만들 갯수
     * @returns 결재 데이터 객체 배열
     */
    "generateMockCTApproveData" : (count) => {

        const typeValues = ["전체CT", "부분CT"];
        const compNames = ["코스메카", "아모레", "LG생활건강", "더페이스샵", "잇츠한불", "에이블씨엔씨", "토니모리", "더마코스", "네이처리퍼블릭", "더샘"];
        const mateNames = ["튜브", "펌프", "스패츌러", "스포이드", "스틱"];
        const mateCompNames = ["코스텍", "코코스", "뷰티텍", "에이팩", "뷰코스", "에코팩"];
        const ctStatusValues = ["CT접수", "CT진행중", "CT완료", "CT보류"];
        const judgementValues = ["적합", "부적합", "검토중", "보류"];
        const managerNames = ["박진영", "김지훈", "최유리", "정샘물", "이CT", "윤CT", "장CT", "박CT", "서CT", "정CT"];
        const statusValues = {
          emer: ["미완료", "완료"],
          cpnp: ["해당없음", "진행중", "완료"],
          eng: ["해당없음", "진행중", "완료"],
        };
      
        const categoryValues = ["공지", "제품", "기술", "마케팅"];
      
        const data = [];
      
        for (let i = 0; i < count; i++) {
          const number = (i + 1).toString().padStart(4, "0");

          data.push({
            id: i + 1,
            title: `CT2025-${number}`,
            labNo: `LAB-${number}`,
            type: Utils.randomPick(typeValues),
            name: `제품${i + 1}`,
            compName: Utils.randomPick(compNames),
            mateName: Utils.randomPick(mateNames),
            mateCompName: Utils.randomPick(mateCompNames),
      
            saleReqDate: Utils.randomDate(1 + (i % 10)),
            sampleReqDate: Utils.randomDate(1 + (i % 10)),
            ctReqDate: Utils.randomDate(1 + (i % 10)),
            ctRecptDate: Utils.randomDate(1 + (i % 10)),
            ctTestDate: Utils.randomDate(1 + (i % 10)),
      
            ctStatus: Utils.randomPick(ctStatusValues),
            judgement: Utils.randomPick(judgementValues),
      
            salesManager: Utils.randomPick(managerNames),
            sampleManager: Utils.randomPick(managerNames),
            ctManager: Utils.randomPick(managerNames),
      
            emerStatus: Utils.randomPick(statusValues.emer),
            cpnpStatus: Utils.randomPick(statusValues.cpnp),
            engStatus: Utils.randomPick(statusValues.eng),
      
            category: Utils.randomPick(categoryValues),
            createdAt: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}T${String(Math.floor(Math.random() * 23)).padStart(2,"0")}:00:00Z`,
            views: Math.floor(Math.random() * 2000) + 100,
          });
        }
      
        return data;
    
    },



    /* =================== 개발용 임시 함수로 추후 개발 시 서버 사이드에서 동작하도록 개선 필요 =================== */
    /**
     * normalizeChar : 단일 문자를 정규화하여 검색용으로 변환하는 함수
     * ----------------------------------------------------------------
     * WHEN :
     *   - 문자열 전체를 normalize할 때, 각 문자(char)를 순회하며 호출된다.
     *   - 검색어 또는 label 값을 초성/영문/숫자 기반으로 비교해야 할 때 실행된다.
     *
     * WHY :
     *   - 검색 정확도 향상을 위해 영문은 소문자로 통일하고,
     *     한글은 초성 단위로 변환함으로써 초성검색(ㅎㄱ → 홍길동)을 지원하기 위함.
     *   - 숫자는 그대로 유지해야 전화번호/코드 검색 등이 가능해진다.
     * @param {*} char : 처리할 원본 문자
     * @returns 
     */
    "normalizeChar" : (char = "") => {

        const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

        const code = char.charCodeAt(0); // 입력된 문자를 Unicode 코드포인트로 변환

        // 영어인 경우 (A-Z, a-z) → 모두 소문자로 통일
        if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return char.toLowerCase();
    
        // 숫자인 경우 (0-9) → 그대로 반환 (정규화 불필요)
        if (code >= 48 && code <= 57) return char;
    
        /**
         * 한글 음절(가~힣)인 경우 → 초성 인덱스를 계산하여 CHO 배열에서 추출
         * 한글 Unicode: 44032('가') ~ 55203('힣')
         * 초성 추출 공식: (문자코드 - 44032) / 588 의 몫
         */
        const hangul = code - 44032;
        if (hangul >= 0 && hangul <= 11171) return CHO[Math.floor(hangul / 588)];
    
        // 그 외 문자(특수문자 등)는 변환 없이 그대로 반환
        return char;
    },


    /**
     * normalize : 문자열 전체를 검색용으로 정규화하는 함수
     * ----------------------------------------------------------------
     * WHEN :
     *   - 검색어(debounced) 또는 label(text)을 비교 가능한 형태로 변환할 때 호출된다.
     *   - 초성 검색, 영문 대소문자 무시 검색, 숫자 기반 검색 등을 지원해야 할 때 사용된다.
     *
     * WHY :
     *   - normalizeChar를 문자열 전체에 적용하여
     *     '홍길동' → 'ㅎㄱㄷ', 'Samsung' → 'samsung', '0101234' → '0101234'
     *     이런 정규화된 문자열을 미리 만들어두면 다양한 패턴의 검색을 통일된 방식으로 처리할 수 있기 때문.
     *   - 로직을 분리함으로써 가독성과 재사용성을 높이기 위함.
     * 
     * HOW : 
     *   - 문자열을 한 글자씩 배열로 분리
     *   - 각 문자에 normalizeChar 적용 (영문 → 소문자, 한글 → 초성 변환 등)
     *   - 다시 문자열로 결합하여 정규화된 최종 문자열 생성
     * 
     * @param {string} str : 정규화할 문자열
     * @returns 
     */
    "normalize" : (str = "") => {
        return str.replace(/[^0-9a-zA-Z가-힣]/g, "") // 특수문자 제거
                  .replace(/\s+/g, "")               // 공백 제거
                  .split("")
                  .map(Utils.normalizeChar)
                  .join("");
    },


    /**
     * findMatchRanges : 정규화된 문자열 기준으로 keyword가 text에서 등장하는 모든 구간을 찾는 함수
     * ----------------------------------------------------------------
     * WHEN :
     *   - highlight(text, keyword)를 수행하기 위해
     *     검색어가 어디서 시작해서 어디까지를 강조해야 하는지 찾을 때 사용된다.
     *   - 사용자가 검색한 debounced 값이 존재하고,
     *     highlight 처리해야 할 label 값이 있을 때 실행된다.
     *
     * WHY :
     *   - 초성/대소문자/영문/숫자 정규화 기반 검색을 사용할 때,
     *     원본 text와 keyword는 눈에 보이는 형태가 다르기 때문에
     *     실제 강조(하이라이팅) 범위를 계산하기 위해서는
     *     정규화된 기준으로 인덱스를 찾아야 한다.
     *   - 여러 번 등장하는 경우(예: 'abcabc'에서 'abc') 모든 범위를 찾아야 하므로
     *     반복적으로 indexOf를 수행하는 구조로 되어 있다.
     * 
     * @param {*} text : 원본 텍스트
     * @param {*} keyword : 검색 키워드
     * @returns 
     */
    "findMatchRanges" : (text = "", keyword = "") => {

        if (!text || !keyword) return []; // keyword가 비어 있으면 매칭 범위가 없으므로 즉시 빈 배열 반환

        const source = Utils.normalize(text); // text와 keyword를 동일한 규칙으로 정규화
        const key = Utils.normalize(keyword); // 초성/영문 소문자/숫자 기반으로 비교 가능하게 통일

        if (!key) return [];
    
        const ranges = []; // 결과로 반환할 구간(index start, index end) 저장 배열

        let index = source.indexOf(key); // 첫 번째 매칭 위치(index)를 정규화된 문자열에서 검색
    
        // index가 -1이 아닐 동안(즉, 계속 매칭될 동안) 반복
        while (index !== -1) {

            // 매칭 구간을 [시작 인덱스, 끝 인덱스] 형태로 저장
            ranges.push([index, index + key.length]);
            // end 인덱스는 key.length만큼 더한 위치
            index = source.indexOf(key, index + 1);
        }

        // 단어 단위 검색 처리
        const words = keyword.split(/\s+/).filter(Boolean);
        words.forEach((w) => {
            const wNorm = Utils.normalize(w);
            let i = source.indexOf(wNorm);

            while(i !== -1) {
                ranges.push([i, i + wNorm.length]);
                i = source.indexOf(wNorm, i + 1);
            }
        });

        // 겹치는 범위를 정렬 + 중복 제거
        ranges.sort((a, b) => a[0] - b[0]);
        const merged = [];

        for(const [s, e] of ranges) {
            if (merged.length === 0 || merged[merged.length - 1][1] < s) {
                merged.push([s, e]);
            } else {
                merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
            }
        }

        return merged; // 모든 매칭 구간을 반환 → highlight 함수에서 사용됨

    },


    /**
     * highlight : 텍스트 내에서 검색된 키워드를 하이라이트 처리하여 JSX 형태로 반환하는 함수
     * ----------------------------------------------------------------
     * WHEN : 
     *   - 검색어(keyword)가 입력되었고, 리스트 렌더링 시 매칭된 문구를 사용자에게 명확하게 보여줘야 할 때 호출됨  
     * WHY : 
     *   - 검색 결과를 더 직관적으로 보여주기 위해, 일치 구간만 시각적으로 강조하여 UX를 개선하기 위함  
     *
     * @param {string} text      - 전체 원본 문자열 (리스트에서 렌더링되는 label 값)
     * @param {string} keyword   - 강조 처리할 검색어
     * @returns {string|array}   - 하이라이트가 적용된 JSX 배열 또는 하이라이트가 없는 경우 원본 문자열 그대로 반환
     */
    "highlight" : (text = "", keyword = "") => {

        // 입력값이 숫자일 경우를 고려하여 문자열로 형변환
        const targetText = text.toString();
        const targetKeyword = keyword.toString();

        // 텍스트(text) 내에서 keyword가 등장하는 모든 구간을 (start, end) 형태로 배열로 가져온다.
        const ranges = Utils.findMatchRanges(targetText, targetKeyword);

        // 검색어가 하나도 매칭되지 않으면 원본 문자열을 그대로 반환한다.
        if (ranges.length === 0) return targetText;
    
        const result = [];  // 문자열 조각과 <span> 조각을 순서대로 담아서 최종 출력 형태를 구성하는 배열
        let last = 0;       // 직전까지 분리된 문자열의 마지막 index를 저장하여 다음 조각을 판단하는 기준으로 사용
    
        // 매칭된 구간(ranges)을 순회하며 일반 문자열과 강조 문자열(<span>)을 분리하여 result 배열에 넣는다.
        ranges.forEach(([start, end], idx) => {

            // 매칭된 구간 이전의 일반 문자열을 먼저 추가한다. (last~start)
            if (last < start) result.push(targetText.slice(last, start));
    
            // 매칭된 문자열을 <span>으로 감싸 강조 처리 후 result에 추가한다.
            result.push(
                <span key={idx} style={{ background: "yellow" }}>
                    {targetText.slice(start, end)}
                </span>
        );
            // 현재 매칭 구간의 끝 위치를 last로 갱신해 다음 문자열 분리에 사용한다.
            last = end;
        });
    
        // 마지막 매칭 구간 이후에 남은 일반 문자열(start~끝)을 추가한다.
        if(last < targetText.length) result.push(targetText.slice(last));
    
        // 하이라이트가 적용된 문자열 조각들을 조합하여 JSX 배열 형태로 반환한다.
        return result;
    },
    /* =================== 개발용 임시 함수로 추후 개발 시 서버 사이드에서 동작하도록 개선 필요 =================== */


};