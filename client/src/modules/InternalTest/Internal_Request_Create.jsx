/**
 * 파일명 : CT_Request_Create.jsx
 * 용도 : CT 의뢰 등록
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect, useMemo, useContext } from "react";
import axios from "axios";

import Internal_SubNav from "/src/modules/InternalTest/Internal_SubNav";
import Internal_SheetPages from "/src/modules/InternalTest/Internal_SheetTabs";
import userUrlInfo from "/src/hooks/useUrlInfo";

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";

export default function Internal_Request_Create() {


  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY; // 오늘 날짜
  const G_STARTDAY = Common.G_STARTDAY; // 오늘로부터 7일

  // ■ 유저정보 조회
  const { user } = useContext(AuthContext);
  const companyId = user.company_id;
  const userId = user.user_id;
  const userName = user.user_full_name;

  // ■ 쿼리스트링 조회
  const url = userUrlInfo();
  const modeQuery = url?.query?.mode ?? "";
  const reqIdQuery = url?.query?.request_id ?? "";
  const mode = modeQuery ? "update" : "create";

  console.log(`🟠 페이지 모드 확인 : ${mode}`);
  console.log(`🟠 페이지 ID 확인 : ${reqIdQuery}`);
  console.log(`🟠 G_TODAY : ${G_TODAY}`);

  
  /**
   * --- API 통신에 사용될 state 객체 ---
   * loading, setLoading : request 요청 응답 여부
   * error, setError : 응답 오류 여부
   */
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);


  /**
   * ----- 자재유형 중분류 커스텀 셀렉트박스 -----
   * isDropdownOpen, setIsDropdownOpen : 커스텀 셀렉트박스 활성화 여부
   * dropdownPosition, setDropdownPosition : 커스텀 셀렉트박스 위치 관리
   * refCustomSelectBox : 커스텀 셀렉트 박스 컴포넌트 참조
   */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const refCustomSelectBox = useRef(null);


  /**
   * ----- 차수 조회 모달 관리 -----
   * isModalOpenCtSeq, setIsModalOpenCtSeq : 차수 조회 모달 활성화 여부
   * refModalSearchCtSeq : 차수 조회 모달 컴포넌트 참조
   * dateToRef, dateFromRef : 날짜 검증 시 포커스 할당을 위한 ref
   */
  const [isModalOpenCtSeq, setIsModalOpenCtSeq] = useState({
    open: false,
    targetId: "",
    position: { top: 0, left: 0 },
  });

  const refModalSearchCtSeq = useRef(null);
  const dateToRef = useRef(null);
  const dateFromRef = useRef(null);


  /**
   * ----- 제형(의뢰) 특이사항 입력 모달 관리 -----
   * isOpenModalRemark, setIsOpenModalRemark : 제형(의회) 특이사항 입력 모달 활성화 여부
   * refModalSetRemark : 제형(의뢰) 특이사항 입력 모달 컴포넌트 참조
   */
  const [isOpenModalRemark, setIsOpenModalRemark] = useState({
    open: false,
    targetId: "",
    position: { top: 0, left: 0 },
  });

  const refModalSetRemark = useRef(null);


  /**
   * 제형(의회) 특이사항 입력 객체
   */
  const [specialData, setSpecialData] = useState({
    capsule: "",
    color: "",
    ingredient: "",
    stability: "",
    cooling: "",
    etc: "",
  });



  /**
   * createRequest : CT 의뢰 생성
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const createRequest = async (e) => {

    e.preventDefault();

    const params = Utils.cleanParams(ctForm);
    // console.log(ctForm);
    console.log(params);

    try {

    } catch(err) {

    } finally {

    }
  };

  /* ================= Document에 이벤트 추가 ================= */
  
  /**
   * useEffect - remark 입력 모달 자동 오픈 기능
   * ---------------------------------------------------------
   * HOW :
   *  1. 컴포넌트 마운트 시 document에 "click" 이벤트를 등록한다.
   * 
   *  2. openModalRemark(e) 함수에서 다음 로직을 수행한다:
   *     - 사용자가 클릭한 요소(e.target)가 INPUT 태그인지 확인한다.
   *     - INPUT의 id 값이 "ctForm_sampleSignificant_" 로 시작하는지 검사한다.
   *       → remark 입력을 위한 input 박스만 감지하기 위함.
   *     - 조건이 맞으면 getBoundingClientRect()로 클릭된 INPUT의 위치를 가져온다.
   *     - rect.bottom + window.scrollY 를 기준으로 화면 스크롤을 고려한 모달의 top 위치를 계산하고,
   *       rect.left + window.scrollX 로 left 위치를 계산한다.
   *     - setIsOpenModalRemark()을 호출하여
   *         { open: true, targetId, position: {top, left} }
   *       형태로 모달 상태를 업데이트한다.
   * 
   *  3. useEffect clean-up 단계에서 removeEventListener() 를 사용하여
   *     등록된 click 이벤트를 반드시 제거한다.
   *     → 컴포넌트가 언마운트된 후 불필요한 이벤트 실행이나 메모리 누수를 방지.
   *
   * WHY :
   *  - remark 입력을 위한 INPUT은 여러 개 존재할 수 있으며,
   *    각 INPUT을 클릭할 때마다 해당 위치에 맞춰 모달을 정확하게 띄워야 한다.
   *  - 개별 input마다 onClick 핸들러를 직접 넣는 방식은 비효율적이며
   *    동적으로 생성되는 렌더링 구조에도 취약하다.
   *    → document 전역 클릭 이벤트를 사용하는 이유.
   *  - 모달 위치를 입력 필드 바로 아래에 표시함으로써
   *    사용성이 향상되고 remark 입력 흐름이 자연스러워진다.
   *  - clean-up 을 통해 이벤트 누적을 방지하고 React 방식에 맞는 안정적인 이벤트 제어를 유지한다.
   */
  useEffect(() => {
    
    const openModalRemark = (e) => {
      if (e.target.tagName === "INPUT" && e.target.id.startsWith("ctForm_sampleSignificant_")) {
        const rect = e.target.getBoundingClientRect();
        setIsOpenModalRemark({
          open: true,
          targetId: e.target.id,
          position: { top: rect.bottom + window.scrollY + 10, left: rect.left + window.scrollX },
        });
      }
    };

  document.addEventListener("click", openModalRemark);

    // clean-up 단계
    return () => {
      document.removeEventListener("click", openModalRemark);
    }
  }, []);

  
  /**
   * 특이사항 입력 모달 닫기
   */
  useEffect(() => {
    
    const closeModalRemark = (e) => {
      if (refModalSetRemark.current && !refModalSetRemark.current.contains(e.target)) {
        setIsOpenModalRemark({
          open: false,
          targetId: "",
          position: { top: 0, left: 0 }
        });
      }
    };

  document.addEventListener("mousedown", closeModalRemark);

    return () => {
      document.removeEventListener("mousedown", closeModalRemark);
    }
  }, []);


  /**
   * 차수 검색 모달 열기
   */
  useEffect(() => {

    const openModalSearchCtSeq = (e) => {
      if (e.target.id == "searchCtSeq") {
        const rect = e.target.getBoundingClientRect();
        setIsModalOpenCtSeq({
          open: true,
          targetId: e.target.id,
          position: { top: rect.bottom + window.scrollY + 10, left: rect.left + window.scrollX },
        });
      }
    }

    document.addEventListener("click", openModalSearchCtSeq);

    return () => {
      document.removeEventListener("click", openModalSearchCtSeq);
    }

  }, []);


  /**
   * 차수 검색 모달 닫기
   */
  useEffect(() => {

    const closeModalSearchCtSeq = (e) => {
      if (refModalSearchCtSeq.current && !refModalSearchCtSeq.current.contains(e.target)) {
        setIsModalOpenCtSeq({
          open: false,
          targetId: "",
          position: { top: 0, left: 0 }
        });

        setHistoryForm({
          "search_type" : "REQ",
          "search_from" : G_TODAY,
          "search_to" : G_TODAY,
          "search_client" : "",
          "search_sample" : "",
          "search_labNo" : "",
          "search_keyword" : ""
        });

        setIsValidated(true);
      }
    }

    document.addEventListener("mousedown", closeModalSearchCtSeq);

    return () => {
      document.removeEventListener("mousedown", closeModalSearchCtSeq);
    }

  }, []);
  

  /**
   * handleSpecialChange : 제형(의뢰) 제형 정보 특이사항 모달 입력값 제어 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const handleSpecialChange = (e) => {
    const { name, value } = e.target;
    setSpecialData((prev) => ({ ...prev, [name]: value }));
  };

  
  /**
   * handleSpecialSubmit : 제형(의뢰) 제형 정보 특이사항 모달 입력값 전송 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const handleSpecialSubmit = (e) => {

    e.preventDefault();

    // 특이사항 입력 모달에서 입력받은 값
    const combinedValue = Object.values(specialData)
                                .filter(Boolean)
                                .join(", ");

    // 입력이 끝났으므로 모달 닫기 처리
    setIsOpenModalRemark({ 
      open: false,
      targetId: "",
      position: { top: 0, left: 0 } 
    });

    // 모달에서 입력받은 값을 객체에 할당
    setSpecialData({
      capsule: "",
      color: "",
      ingredient: "",
      stability: "",
      cooling: "",
      etc: "",
    });
  };


  /**
   * searchCtSeqHistory : 차수 조회 함수
   * ---------------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const searchCtSeqHistory = async (e) => {

    if(!await checkValid(e)) return;

    const params = Utils.cleanParams(historyForm);
    console.log(params);
    try {
      
    } catch (error) {
      
    } finally {

    }
  };


  /**
   * handleSearchInput : 차수 조회 폼 값 바인딩
   * ---------------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const handleSearchInput = (e) => {
    const { name, value } = e.target;
    setHistoryForm((prev) => ({...prev, [name] : value}));
  };


  /**
   * checkValid : 날짜 유효성 체크 함수
   * ----------------------------------------------------
   * WHY : date_from 날짜가 date_to 날짜보다 미래일 수 없음.
   * 
   * @returns : 검증 여부에 따라 Boolean 반환
   */
  const checkValid = async () => {

    const isDateFrom = Utils.isValidDate(new Date(historyForm.search_from))
    const isDateTo = Utils.isValidDate(new Date(historyForm.search_to))
    
    // 시작일자가 종료일자보다 미래일 수 없음.
    if(historyForm.search_from > historyForm.search_to || !isDateFrom || !isDateTo) {
      setIsValidated(false);
      if (!isDateFrom) {
        dateFromRef.current.focus();
      } else if(!isDateTo) {
        dateToRef.current.focus();
      } else {
        dateToRef.current.focus();
      }
      return false;
    } else {
      setIsValidated(true);
      return true;
    }

  };

  /**
   * 시험시작일 변동시 시험결과판정의 시작일 연동
   */
  const validDate = () => {
    
  }

  /**
   * Polyol 합산 결과 State
   */
  const [sumResult, setSumResult] = useState({
    glycerine : 0,
    propanediol : 0,
    dpg : 0,
    pg : 0,
    bg : 0,
    etc : 0
  });

  const handleSum = (e) => {
    const {name, value} = e.target;
    setSumResult((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  }

  const totalPolyol = useMemo(() => {
    return sumResult.glycerine + sumResult.propanediol + sumResult.dpg + sumResult.pg + sumResult.bg + sumResult.etc;
  }, [sumResult])



  /**
   * 구분별 input disabled 결정
   */
  const [itemNameDisabled, setItemNameDisabled] = useState(false);
  const [labNoDisabled, setLabNoDisabled] = useState(false);
  const [lotNoDisabled, setLotNoDisabled] = useState(false);
  const [dupliDisabled, setDupliDisabled] = useState(false);
  const [itemNameClass, setItemNameClass] = useState("");
  const [labNoClass, setLabNoClass] = useState("");
  const [lotNoClass, setLotNoClass] = useState("");
  const [dupliClass, setDupliClass] = useState("");

  /**
   * 날짜 변동 체크
   */
  const [requestDate, setRequestDate] = useState("");
  const [testStartDate, setTestStartDate] = useState("");
  const handleRequestDate = (e) => {
    const date = e.target.value;
    setRequestDate(date);
  }

  const handleTestStartDate = (e) => {
    const date = e.target.value;
    setTestStartDate(date);

    setInternalForm(prev => ({
      ...prev
      ,internal_test_start_date : date
    }))
  }

  /*  ################################################
  #   ______                __           __
  #  / ____/_______  ____ _/ /____  ____/ /
  # / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #/ /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #\____/_/   \___/\__,_/\__/\___/\__,_/   
  # Created : 2025.01.23
  # Author : Choi Yeon Woong
  # Description : 성분분석-내부 [등록] 로직
  # Modified : 
  ################################################ */

  
  //================== ⭐ 페이지 useEffect 관리 ⭐ ==================
  /**
   * ■ 최초 페이지 조회시 모드 확인
   */
  useEffect(() => {
    if (mode == "update") { getInternalDataDetail() };
  }, []);



  //================== ⭐ 페이지 State 관리 ⭐ ==================
  /**
   * ✨ 내부성분분석 구분별 시트 변경
   */
  const [classification, setClassification] = useState(0);
  const disabledClass = "internal-create-disabled"
  const DEFAULT_RULE = {
    labNoDisabled : false,
    lotNoDisabled : true,
    itemNameDisabled : true,
    dupliDisabled : false,
    labNoClass : "",
    lotNoClass : disabledClass,
    itemNameClass : disabledClass,
    dupliClass : ""
  };
  const RULE_MAP = {
    "0" : {
      labNoDisabled : false,
      lotNoDisabled : true,
      itemNameDisabled : true,
      dupliDisabled : false,
      labNoClass : "",
      lotNoClass : disabledClass,
      itemNameClass : disabledClass,
      dupliClass : "",
      mustValue: "lab"
    },
    "1" : {
      labNoDisabled : false,
      lotNoDisabled : true,
      itemNameDisabled : false,
      dupliDisabled : false,
      labNoClass : "",
      lotNoClass : disabledClass,
      itemNameClass : "",
      dupliClass : "",
      mustValue: "lab"
    },
    "2" : {
      labNoDisabled : false,
      lotNoDisabled : true,
      itemNameDisabled : false,
      dupliDisabled : false,
      labNoClass : "",
      lotNoClass : disabledClass,
      itemNameClass : "",
      dupliClass : "",
      mustValue: "lab"
    },
    "3" : {
      labNoDisabled : true,
      lotNoDisabled : false,
      itemNameDisabled : false,
      dupliDisabled : false,
      labNoClass : disabledClass,
      lotNoClass : "",
      itemNameClass : "",
      dupliClass : "",
      mustValue: "lot"
    },
    "4" : {
      labNoDisabled : true,
      lotNoDisabled : true,
      itemNameDisabled : false,
      dupliDisabled : true,
      labNoClass : disabledClass,
      lotNoClass : disabledClass,
      itemNameClass : "",
      dupliClass : disabledClass,
      mustValue: "item"
    }
  }

  /**
   * ✨ [성분분석]-내부 Form 정의
   * @description [성분분석]-내부 폼 등록시 State 정의
   */
  const [internalForm, setInternalForm] = useState({
    "company_id" : companyId
    ,"internal_request_id" : ""
    ,"internal_request_no" : ""
    ,"internal_request_date" : G_TODAY
    ,"internal_request_user" : userName
    ,"internal_class" : 0
    ,"internal_item_no" : ""
    ,"internal_item_name" : ""
    ,"internal_lab_no" : ""
    ,"internal_lab_serl" : ""
    ,"internal_lot_no" : ""
    ,"internal_is_duple" : ""
    ,"internal_remark_duple" : ""
    ,"internal_remark_reason" : ""
    ,"internal_remark_sample_info" : ""
    ,"internal_remark" : ""

    ,"internal_ph_std" : 0
    ,"internal_ph1_1" : 0
    ,"internal_ph1_2" : 0
    ,"internal_ph1_3" : 0
    ,"internal_ph2_1" : 0
    ,"internal_ph2_2" : 0
    ,"internal_ph2_3" : 0
    ,"internal_ph3_1" : 0
    ,"internal_ph3_2" : 0
    ,"internal_ph3_3" : 0

    ,"internal_test_start_date" : null
    ,"internal_test_end_date" : null
    ,"internal_test_user" : null
    ,"internal_test_status" : 0
    // ,"internal_is_start" : 0
    // ,"internal_is_fin" : 0
    ,"internal_remark_test" : ""
    ,"internal_last_user" : userName
    ,"internal_last_date" : null

    ,"internal_must_value" : "lab"
  });

  const rule = useMemo(() => {
    console.log(`RULE_MAP : ${RULE_MAP?.[classification].mustValue}`);

    return RULE_MAP?.[classification] ?? DEFAULT_RULE
  }, [classification]);

  const [rows, setRows] = useState([{
    "id" : 0,
    "code" : "int_rm_0_code",
    "name" : "int_rm_0_name",
    "amount" : "int_rm_0_amount",
    "codeValue" : "",
    "nameValue" : "",
    "amountValue" : ""
  }]);

  const [internalRmForm, setInternalRmForm] = useState([{
    "id" : 0
    ,"code" : ""
    ,"name" : ""
    ,"value" : ""
  }]);

  const [sheetData, setSheetData] = useState({
          // sheet1 : { row : "", name : "", value: "" },
          // sheet1 : { row : "", name : "", value: "" }
      })
      
      // 첨부파일 State 영역
  const [files, setFiles] = useState([]);

  /**
   * Error 상태 만들기
   * @name : errorField
   */
  const [errorField, setErrorField] = useState(null);
  const refs = {
    "internal_lab_no": useRef(),
    "internal_lot_no": useRef(),
    "internal_remark_duple": useRef(),
    "internal_item_name": useRef(),
    "int_rm_0_code": useRef(),
    // "internal_rm_0_code": useRef(),
    // "internal_ing_code": useRef(),
  }

  // ■ 중복여부에 따른 textarea display 결정
  const [displayDuplicate, setDisplayDuplicate] = useState("none");
  const handleDuplicate = (e) => {
    console.log(e);
    const checked = e.target.checked;
    if (checked==true) {
      setDisplayDuplicate("flex");
      setInternalForm(prev => ({
        ...prev
        ,internal_is_duple : checked
        ,internal_must_value : "duple"
      }))
    } 
    else {
      setDisplayDuplicate("none");
      setInternalForm(prev => ({
        ...prev
        ,internal_is_duple : false
        ,internal_must_value : ""
      }))
    };
  };

  // ■ 중복 여부에 따른 display 조정
  useEffect(() => {
    internalForm?.internal_is_duple == true 
      ? setDisplayDuplicate("flex")
      : setDisplayDuplicate("none");
  }, [internalForm]);

  const selectClass = (e) => {
    const value = e.target.value;
    console.log(value);
    setClassification(e.target.value);
    setInternalForm(prev => ({
      ...prev
      ,internal_class : e.target.value
      ,internal_must_value : rule.mustValue
    }));
    // console.log(classification);
    console.log(internalForm);
  }

  /**
   * ✨ Input 태그 내 값 변경
   * @name handleInput 
   * @description input 값 변경 시 form 객체에 데이터 바인딩
   */
  const handleInput = (e, option = null) => {
    const { name, type, value, checked } = e.target;
    console.log(`TYPE : ${type}`);

      if (type === "checkbox") {
          setInternalForm((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
          console.log(internalForm);
          return;
      } else if (type === "radio") {
          setClassification(value);

          const next = RULE_MAP?.[value]?.mustValue;
          console.log(`NEXT : ${next}`);

          setInternalForm((prev) => ({ ...prev, [name]: value, ['internal_must_value']: next }));

          return;
      } else {
          setInternalForm((prev) => ({ ...prev, [name]: value }));
          console.log(internalForm);
          return;
      }
  };

  
  /**
   * ✨ SheetPages 내 원료 추가시 동적 rmForm State 관리
   * @name handleRmInput
   * @description 원료 이름 동적생성시 input 값에 따른 state 변경
   */
  const handleRmInput = (id, field, e) => {
    const value = e.target.value;

    setInternalRmForm(prev => ({
      ...prev,
      [id]: {
        code: prev[id]?.code ?? "",
        name: prev[id]?.name ?? "",
        value: prev[id]?.value ?? "",
        [field] : value
      }
    }))
  };


   /**
   * ✨ 시험완료/취소 버튼 클릭시 status 관리
   * @name : handleStatus
   * @description 시험시작일 기입시 status 자동 시험중으로 변경
   */
  const handleStatus = (e) => {
    const { name, value, dataset } = e.target;
    const status = dataset.status;
    const sValue = dataset.value;

    switch(sValue) {
      case "1" :
        setInternalForm((prev) => ({ ...prev, [name]: value, [status]: sValue }));
        break;

      case "2" :
        internalForm?.internal_test_status != "2"
          ? setInternalForm((prev) => ({ ...prev, [name]: value, [status]: sValue, ["internal_test_end_date"]: G_TODAY }))
          : setInternalForm((prev) => ({ ...prev, [name]: value, [status]: "1", ["internal_test_end_date"]: "" }))
        break;
    }
    console.log(`\n-- Form : ${JSON.stringify(internalForm)}`);

    return;
  }

  const updateSheetData = (sheetId, partialData) => {
        // setSheetData(prev => ({
        //     ...prev,
        //     [sheetId] : {
        //         ...prev[sheetId],
        //         ...partialData
        //     }
        // }));

        const { row, name, value } = partialData;
        const key = `${row}|${name}`;

        setSheetData(prev => ({
            ...prev,
            [sheetId] : {
                ...(prev[sheetId] ?? {}),
                [key] : {
                    ...(prev[sheetId]?.[key] ?? {}),
                    ...partialData
                }
            }
        }));
    }

  
  /**
   * addRow : 제형(의뢰) 기타 특이사항 입력 행 추가 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const addRow = (e) => {
    e.preventDefault();

    const newValue = rows.length;
    
    const newRow = {
      "id" : newValue,
      "code" : `int_rm_${newValue}_code`,
      "name" : `int_rm_${newValue}_name`,
      "amount" : `int_rm_${newValue}_amount`,
      "codeValue" : "",
      "nameValue" : "",
      "amountValue" : ""
    };

    setRows(prev => [...prev, newRow]);
  };

  /**
   * ✨ 원료(성분) 행 삭제 기능
   * @name delRow
   * @param { Event } e 
   * @param { Number } id 
   */
  const delRow = (e, id) => {
    e.preventDefault();

    console.log(`\n --internalRmForm : ${JSON.stringify(internalRmForm)}`);

    setRows(prev => {
      if (prev.length == 1) return prev;
      return prev.filter(row => row.id !== id);
    });

    setInternalRmForm(prev => {
      return prev.filter(row => row.id !== id);
    });
  };


  /**
   * ✨ 성분분석[내부] 등록 화면 저장 프로세스 관리
   * @name saveRequest
   * @description "저장" 버튼 클릭시 프로세스
   */
  const saveRequest = async (e) => {
    e.preventDefault();

    const formState = internalForm;
    const rmState = internalRmForm;
    const fileState = files;
    console.log(`👁️ FormState : ${formState}`);
    console.log(`👁️ rmState : ${rmState}`);
    console.log(`👁️ fileState : ${fileState}`);

    const baseUrl = "/api/v2/ltms/internal/request";

    let targetUrl = "";

    switch(mode) {
      case "create" : targetUrl = baseUrl + "/create"; break;
      case "update" : targetUrl = `${baseUrl}/create?mode=update&request_id=${reqIdQuery}`; break;
      default : alert("❌ 잘못된 요청입니다."); return;
    }

    console.log(`👁️ tagetUrl : ${targetUrl}`);

    const fd = new FormData();

    // ■ 기존 데이터 분리(File 객체가 아닌 데이터)
    const keepFiles = fileState
      .filter(x => !(x instanceof File))
      .map(x => ({
        company_id : companyId
        ,request_id : x.request_id
        ,file_id : x.file_id
        ,name: x.name
        ,serl: x.serl
        ,type: x.type
        ,dir: x.dir
    }));


    // ■ 데이터 전송 전 FormData 설정
    fd.append("keepFiles", JSON.stringify(keepFiles));

    fileState
      .filter(x => x instanceof File)
      .forEach(f => fd.append("files", f));

    fd.append("sampleInfo", JSON.stringify(internalForm));
    fd.append("rmInfo", JSON.stringify(internalRmForm));


    try {
      const request = await axios.post(targetUrl, fd);
      alert("저장되었습니다.");
    } catch (err) {
      console.error(err);

      const field = err?.response?.data?.field;
      console.error(field);
      if(field) {
        refs[field].current.focus();
        setErrorField(field);

        setTimeout(() => {
          setErrorField(null);
        }, 2000);
      }

      alert(err.response.data.error);
    };

  }


  /**
   * ✨ 성분분석[내부] 조회 → 등록 화면 진입시 상세 정보 조회
   * -------------------------------------------------------
   * @name getInternalDataDetail
   * @description 쿼리스트링 내 request_id 기준 데이터 조회 후 State 반환
   * @return { State } internalForm, internalRmForm
   */
  const getInternalDataDetail = async () => {
    const params = {
      request_id : reqIdQuery
    };

    console.log(`🙌 params : ${params}`);

    const response = await axios.get("/api/v2/ltms/internal/request/read/detail", { params });

    const data = response.data.data;
    const rmData = response.data.rmData;
    const fileData = response.data.fileData;

    console.log(`--data : ${JSON.stringify(data)}`);
    console.log(`--rmData : ${JSON.stringify(rmData)}`);
    console.log(`--fileData : ${JSON.stringify(fileData)}`);

    // ■ 내부성분분석 메인 폼 데이터 배치
    setInternalForm(prev => ({
      ...prev,
      ...data
    }));

    // ■ 내부성분분석 아이템 데이터 폼 배치
    rmData.map((item, idx) => {
      // setRmForm(prev => [
      //   ...prev
      //   ,{
      //     id: idx
      //     ,name: item.itemNo
      //     ,value: item.itemRate
      //   }
      // ]);
      setInternalRmForm(prev => {
        const exists = prev.some(r => r.id == item.idx);
        console.log("is exists : ", exists);
        console.log("기존 rmForm ID : ", prev.id);
        console.log("쿼리 반환된 ID : ", item.id);

        if (exists) {
          return prev.map(v =>
            v.id === idx
              ? {...v, code: item.ing_no, name: item.ing_name, value: item.ing_rate}
              : v
          );
        } else {
          return [
            ...prev
            ,{
              id: idx
              ,code: item.ing_no
              ,name: item.ing_name
              ,value: item.ing_rate
            }
          ];
        };
      });

      setRows(prev => {
        const next = {
          id: idx,
          name: `int_rm_${idx}_name`,
          amount: `int_rm_${idx}_amount`,
          nameValue: item.ing_name,
          amountValue: item.ing_rate,
        };

        const exists = prev.some(r => r.id === idx);

        return exists
          ? prev.map(r => (r.id === idx ? { ...r, ...next } : r))
          : [...prev, next];
      });
    });

    // ■ 내부성분분석 파일 데이터 폼 배치
    setFiles(fileData);

  }




  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      {/* <CT_SubNav/> */}
      <Internal_SubNav />
      {/* ↑ 상단 네비게이션 바 ↑ */}

      {/* ↓ 등록 메인 뷰 ↓ */}
      <div className="container">

        {/* ↓ [내부성분분석] 등록 폼 ↓ */}
        <div>
          {/* ↓ [내부성분분석] 폼 타이틀 ↓ */}
          <div className="page-top">
            {/* <h1 className="page-title">{catName} {actName}</h1> */}
          </div>
          {/* ↑ [내부성분분석] 폼 타이틀 ↑ */}
          
          {/* 폼 영역 */}
          <form id="internal-create-form" className="" onSubmit={saveRequest}>

            {/* ↓ [내부성분분석] 성분분석등록 폼 ↓ */}
            <div id="" className="internal-create-form">

              {/* ↓ [내부성분분석] 성분분석등록-1번라인 ↓ */}
              <div className="internal-create-grid-title">◎ 성분 분석 등록</div>
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <label className="internal-create-grid-label">성분 분석</label>
                    <input 
                        className="field" 
                        readOnly 
                        value="내부" 
                        style={{ background: 'gainsboro'}}
                    ></input>
                  </div>
                  <div className="field">
                    <label className="internal-create-grid-label">의뢰번호</label>
                    <input 
                        className="field"
                        style={{background: 'gainsboro'}}
                        name="internal_request_no"
                        value={internalForm?.internal_request_no ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <label className="internal-create-grid-label">등록일</label>
                    <input 
                        className="field-date"
                        type="date"
                        name="internal_request_date"
                        onChange={handleInput}
                        value={internalForm?.internal_request_date ?? G_TODAY}
                    ></input>
                  </div>
                  <div className="field">
                    <label className="internal-create-grid-label">의뢰자</label>
                    <input 
                      type="text"
                      className="field"
                      name="internal_request_user"
                      onChange={handleInput}
                      value={internalForm?.internal_request_user ?? userName}
                    ></input>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                {/* ↑ [내부성분분석] 성분분석등록-1번라인 ↑ */}
                {/* ↓ [내부성분분석] 성분분석등록-2번라인 ↓ */}
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <div className="internal-create-grid-label">구 분</div>
                  </div>
                  <div className="classification-field">
                    <input 
                      type="radio"
                      id="internal-classification-01"
                      name="internal_class"
                      checked={internalForm?.internal_class==0 ? true : false}
                      // onClick={selectClass}
                      onChange={handleInput}
                      value="0"
                    ></input>
                    <label for="internal-classification-01">연구참고/고객사요청/기타</label>
                    <input 
                      type="radio"
                      id="internal-classification-02"
                      name="internal_class"
                      checked={internalForm?.internal_class==1 ? true : false}
                      // onClick={selectClass}
                      onChange={handleInput}
                      value="1"
                    ></input>
                    <label for="internal-classification-02">기능성 화장품 신규허가</label>
                    <input 
                      type="radio"
                      id="internal-classification-03"
                      name="internal_class"
                      checked={internalForm?.internal_class==2 ? true : false}
                      // onClick={selectClass}
                      onChange={handleInput}
                      value="2"
                    ></input>
                    <label for="internal-classification-03">의약외품 신규허가</label>
                    <div className="classification-inner-field">
                      <input 
                        type="radio"
                        id="internal-classification-04"
                        name="internal_class"
                        checked={internalForm?.internal_class==3 ? true : false}
                        // onClick={selectClass}
                        onChange={handleInput}
                        value="3"
                      ></input>
                      <label for="internal-classification-04">변경심사</label>
                      <input 
                        type="radio"
                        id="internal-classification-05"
                        style={{paddingRight:'80px'}}
                        name="internal_class"
                        checked={internalForm?.internal_class==4 ? true : false}
                        // onClick={selectClass}
                        onChange={handleInput}
                        value="4"
                      ></input>
                      <label for="internal-classification-05">타겟 제품</label>
                    </div>
                  </div>
                  {/* <div className="button-field">
                    <input 
                        type="radio" 
                        id="class_01" 
                        name="class_check" 
                        value="0"
                        checked={classification==0 ? true : false}
                        onClick={selectClass}
                    ></input>
                    <label for="class_01" className="internal-create-grid-check-label">연구참고/고객사요청/기타</label>
                  </div>
                  <div className="check-field">
                    <input 
                        type="radio" 
                        id="class_02" 
                        name="class_check" 
                        value="1"
                        onClick={selectClass}
                    ></input>
                    <label for="class_02" className="internal-create-grid-check-label">기능성 화장품 신규허가</label>
                  </div>
                  <div className="check-field">
                    <input 
                        type="radio" 
                        id="class_03" 
                        name="class_check" 
                        value="2"
                        onClick={selectClass}
                    ></input>
                    <label for="class_03" className="internal-create-grid-check-label">의약외품 신규허가</label>
                  </div>
                  <div className="check-field">
                    <input 
                        type="radio" 
                        id="class_04" 
                        name="class_check" 
                        value="3"
                        onClick={selectClass}
                    ></input>
                    <label for="class_04" className="internal-create-grid-check-label">변경심사</label>
                  </div>
                  <div className="check-field">
                    <input 
                        type="radio" 
                        id="class_05" 
                        name="class_check" 
                        value="4"
                        onClick={selectClass}
                    ></input>
                    <label for="class_05" className="internal-create-grid-check-label">타겟 제품</label>
                  </div> */}
                </div>
                {/* ↑ [내부성분분석] 성분분석등록-2번라인 ↑ */}
                {/* ↓ [내부성분분석] 성분분석등록-3번라인 ↓ */}
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="double-field">
                    <div className="internal-create-grid-label">품명</div>
                    <input 
                      type="text"
                      className={`${rule.itemNameClass} ${errorField == "internal_item_name" ? "error-background" : "error-to-input"}`}
                      ref={refs.internal_item_name}
                      disabled={rule.itemNameDisabled}
                      name="internal_item_name"
                      onChange={handleInput}
                      value={internalForm?.internal_item_name ?? ""}
                    />
                  </div>
                  <div className="field-LabNo">
                    <div className="internal-create-grid-label">
                      <label
                        className={rule.mustValue == "lab" ? "internal-create-must-value" : ""}
                      >Lab No.</label>
                    </div>
                    <input 
                      type="text"
                      className={
                        `${rule.labNoClass} 
                        ${errorField == "internal_lab_no" ? "error-background" : "error-to-input"}`
                      }
                      ref={refs.internal_lab_no}
                      disabled={rule.labNoDisabled}
                      name="internal_lab_no"
                      onChange={handleInput}
                      value={internalForm?.internal_lab_no ?? ""}
                    />
                    <div className="internal-create-grid-label">ver.</div>
                    <input 
                      type="text"
                      className={`${rule.labNoClass}`}
                      disabled={rule.labNoDisabled}
                      name="internal_lab_serl"
                      onChange={handleInput}
                      value={internalForm?.internal_lab_serl ?? ""}
                    />
                  </div>
                  <div className="field">
                    <div className="internal-create-grid-label">
                      <label
                        className={rule.mustValue == "lot" ? "internal-create-must-value" : ""}
                      >Lot No.</label>
                    </div>
                    <input 
                      type="text"
                      className={`${rule.lotNoClass} ${errorField == "internal_lot_no" ? "error-background" : "error-to-input"}`}
                      ref={refs.internal_lot_no}
                      disabled={rule.lotNoDisabled}
                      name="internal_lot_no"
                      onChange={handleInput}
                      value={internalForm?.internal_lot_no ?? ""}
                    />
                  </div>
                  <div className="check-write-field">
                  {internalForm?.internal_class != 4 
                  ? <>
                        <input 
                          type="checkbox" 
                          id="isDuplicate"
                          onClick={handleDuplicate}
                          name="internal_is_duple"
                          checked={internalForm?.internal_is_duple ?? ""}
                          // value={internalForm?.internal_is_duple ?? ""}
                        ></input>
                        <label 
                          for="isDuplicate"
                          className={
                            internalForm?.internal_is_duple == true
                              ? "internal-create-must-value"
                              : ""
                          }
                        >중복</label>
                        <input 
                          type="text" 
                          placeHolder="중복 사유 기재"
                          style={{display: displayDuplicate}}
                          className={
                            `${rule.dupliClass} 
                            ${errorField == "internal_remark_duple" ? "error-background" : "error-to-input"}`
                          }
                          disabled={rule.dupliDisabled}
                          name="internal_remark_duple"
                          value={internalForm?.internal_remark_duple ?? ""}
                          ref={refs.internal_remark_duple}
                          onChange={handleInput}
                        />
                    </>
                    : ""
                  }
                  </div>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                </div>
                {/* ↑ [내부성분분석] 성분분석등록-3번라인 ↑ */}
                {/* ↓ [내부성분분석] 성분분석등록-3번라인 ↓ */}
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <div className="internal-create-grid-label">의뢰 사유</div>
                    <textarea 
                      type="text" 
                      className="internal-create-textarea"
                      name="internal_remark_reason"
                      value={internalForm?.internal_remark_reason ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field"></div>
                </div>
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <div className="internal-create-grid-label">제형 정보</div>
                    <textarea 
                      type="text" 
                      className="internal-create-textarea"
                      name="internal_remark_sample_info"
                      value={internalForm?.internal_remark_sample_info ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field"></div>
                </div>
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <div className="internal-create-grid-label">비 고</div>
                    <textarea 
                      type="text" 
                      className="internal-create-textarea"
                      name="internal_remark"
                      value={internalForm?.internal_remark ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field"></div>
                </div>
                {internalForm?.internal_class == 1 || internalForm?.internal_class == 2 ? 
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <div className="internal-create-grid-label">기준pH</div>
                    <input 
                      type="text"
                      name="internal_ph_std"
                      value={internalForm?.internal_ph_std ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="empty-field">
                    <div className="internal-create-grid-label">실측값</div>
                  </div>
                  <div className="ph-field">
                    <div className="internal-create-grid-label">1</div>
                    <input 
                      type="text"
                      name="internal_ph1_1"
                      value={internalForm?.internal_ph1_1 ?? ""}
                      onChange={handleInput}
                    />
                    <input 
                      type="text"
                      name="internal_ph1_2"
                      value={internalForm?.internal_ph1_2 ?? ""}
                      onChange={handleInput}
                    />
                    <input 
                      type="text"
                      name="internal_ph1_3"
                      value={internalForm?.internal_ph1_3 ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="ph-field">
                    <div className="internal-create-grid-label">/2</div>
                    <input 
                      type="text"
                      name="internal_ph2_1"
                      value={internalForm?.internal_ph2_1 ?? ""}
                      onChange={handleInput}
                    />
                    <input 
                      type="text"
                      name="internal_ph2_2"
                      value={internalForm?.internal_ph2_2 ?? ""}
                      onChange={handleInput}
                    />
                    <input 
                      type="text"
                      name="internal_ph2_3"
                      value={internalForm?.internal_ph2_3 ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="ph-field">
                    <div className="internal-create-grid-label">/3</div>
                    <input 
                      type="text"
                      name="internal_ph3_1"
                      value={internalForm?.internal_ph3_1 ?? ""}
                      onChange={handleInput}
                    />
                    <input 
                      type="text"
                      name="internal_ph3_2"
                      value={internalForm?.internal_ph3_2 ?? ""}
                      onChange={handleInput}
                    />
                    <input 
                      type="text"
                      name="internal_ph3_3"
                      value={internalForm?.internal_ph3_3 ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                </div>
                 : ""   
                }
            
            {/* ↑ [내부성분분석] 법인구분 폼 ↑ */}

            {/* ↓ [내부성분분석] 기본정보 폼 ↓ */}
            {/* <div id="internal-baseInformation-form" className="search-information"> */}
            </div>
            {/* ↑ [내부성분분석] 기본정보 폼 ↑ */}
            <div className="internal-create-form">
              <div className="internal-create-grid-title">◎ 시험 승인</div>
                {/* ↓ [내부성분분석] 시험승인-1번라인 ↓ */}
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="field">
                    <div className="internal-create-grid-label">시험시작일</div>
                    <input
                      type="date"
                      name="internal_test_start_date"
                      value={internalForm?.internal_test_start_date ?? ""}
                      onChange={handleInput}
                      className={
                        internalForm?.internal_test_status==2
                        ? "unactivate-disable"
                        : ""
                      }
                      disabled={
                        internalForm?.internal_test_status==2
                        ? true
                        : false
                      }
                      
                    />
                  </div>
                  <div className="field">
                    <div className="internal-create-grid-label">담당자</div>
                    <input
                      type="text"
                      name="internal_test_user"
                      onChange={handleInput}
                      value={internalForm?.internal_test_user ?? ""}
                      className={
                        internalForm?.internal_test_status==2
                        ? "unactivate-disable"
                        : ""
                      }
                      disabled={
                        internalForm?.internal_test_status==2
                        ? true
                        : false
                      }
                    />
                  </div>
                  {/* <div className="field">
                    <div className="internal-create-grid-label">의뢰부서 팀장</div>
                    <input type="text"/>
                  </div> */}
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                </div>
                {/* ↑ [내부성분분석] 시험승인-1번라인 ↑ */}
                {/* ↓ [내부성분분석] 시험승인-2번라인 ↓ */}
                <div className="internal-create-grid internal-create-grid-line">
                  <div className="empty-field">
                    <div className="internal-create-grid-label">
                      <button 
                        className="internal-create-approve-button"
                        type="button"
                        onClick={handleStatus}
                        data-status="internal_test_status"
                        data-value="2"
                      >시험 완료/취소</button>
                    </div>
                  </div>
                  <div className="field">
                    <div className="internal-create-grid-label">시험완료일</div>
                    <input 
                      type="date"
                      name="internal_test_end_date"
                      value={internalForm?.internal_test_end_date ?? ""}
                      onChange={handleInput}
                      className={
                        internalForm?.internal_test_status==2
                        ? "unactivate-disable"
                        : ""
                      }
                      disabled={
                        internalForm?.internal_test_status==2
                        ? true
                        : false
                      }
                    />
                  </div>
                  <div className="double-field">
                    <div className="internal-create-grid-label">의견</div>
                    <textarea 
                      type="text"
                      name="internal_remark_test"
                      class="internal-create-textarea"
                      value={internalForm?.internal_remark_test ?? ""}
                      onChange={handleInput}
                      className={
                        internalForm?.internal_test_status==2
                        ? "unactivate-disable"
                        : ""
                      }
                      disabled={
                        internalForm?.internal_test_status==2
                        ? true
                        : false
                      }
                    />
                  </div>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                </div>
            </div>
            {/* ↓ [내부성분분석] 성분코드 및 함량 기입 폼 ↓ */}
            <div className="internal-create-form">
              <Internal_SheetPages 
                rows={rows}
                setRows={setRows}
                addRow={addRow}
                delRow={delRow}
                rmForm={internalRmForm}
                setRmForm={handleRmInput}
                files={files}
                setFiles={setFiles}
                refs={refs}
                errorField={errorField}
                // sheetData={sheetData}
                // setSheetData={updateSheetData}
              />
            </div>
            {/* ↑ [내부성분분석] 성분코드 및 함량 기입 폼 ↑ */}
            <button>저장</button>

          </form>
          {/* 폼 영역 */}

        </div>
        {/* ↑ 등록 폼 ↑ */}

        {/* ↓ 모달 영역 ↓ */}
        {isModalOpenCtSeq.open && (
          <div className="modal-overlay">
            <div className="modal-content border" style={{width:"470px"}} ref={refModalSearchCtSeq}>
              <div className="modal-title tac">차수 조회</div>

              {/* ↓ 차수 조회 폼 ↓ */}
              <form id="ctSeqHistory">
                <table className="modal-table">
                  <colgroup>
                    <col style={{width:"20%"}}></col>
                    <col style={{width:""}}></col>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="tac">조회기준</th>
                      <td>
                        <div className="radio-group">
                          <label htmlFor="searchType_1">
                            <input type="radio" id="searchType_1" name="search_type" value={"REQ"}
                                    checked={historyForm.search_type === "REQ" ? true : false}
                                    onChange={(e) => {handleSearchInput(e)}}/>의뢰일
                          </label>
                          <label htmlFor="searchType_2">
                            <input type="radio" id="searchType_2" name="search_type" value={"REC"}
                                    checked={historyForm.search_type === "REC" ? true : false}
                                    onChange={(e) => {handleSearchInput(e)}}/>접수일
                          </label>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">일자</th>
                      <td>
                        <div className="date-group">
                          <input type="date" id="searchFrom" name="search_from" ref={dateFromRef}
                                  value={historyForm.search_from ?? ""} onChange={(e) => handleSearchInput(e)}/>
                          ~
                          <input type="date" id="searchTo" name="search_to" ref={dateToRef}
                                  value={historyForm.search_to ?? ""} onChange={(e) => handleSearchInput(e)}/>
                          {!isValidated && (
                            Utils.noticeValidation("날짜가")
                          )}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">고객사</th>
                      <td>
                        <input type="search" id="searchClient" name="search_client" value={historyForm.search_client ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="고객사명을 입력해주세요."/>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">샘플명</th>
                      <td>
                        <input type="search" id="searchSample" name="search_sample" value={historyForm.search_sample ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="샘플명을 입력해주세요."/>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">랩넘버</th>
                      <td>
                        <input type="search" id="searchLabNo" name="search_labNo" value={historyForm.search_labNo ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="랩넘버를 입력해주세요."/>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">검색어</th>
                      <td>
                        <input type="search" id="searchKeyword" name="search_keyword" value={historyForm.search_keyword ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="검색어를 입력해주세요."/>
                        </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="modal-buttons">
                <button className="button" onClick={(e) => {searchCtSeqHistory(e)}}>검색</button>
              </div>
              {/* ↑ 차수 조회 폼 ↑ */}

              {/* ↓ 조회 결과 목록 ↓ */}
              <div className="modal-list">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>CT번호</th>
                      <th>고객사명</th>
                      <th>샘플명</th>
                      <th>Nab No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 예시 데이터 */}
                    <tr>
                      <td><input type="radio" name="ct"/></td>
                      <td>CT2024-0123</td>
                      <td>토니모리</td>
                      <td>수분크림</td>
                      <td>LAB-2025-001</td>
                    </tr>
                    <tr>
                    <td><input type="radio" name="ct"/></td>
                      <td>CT2024-3000</td>
                      <td>코스메카</td>
                      <td>선크림</td>
                      <td>LAB-2025-001</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* ↑ 조회 결과 목록 ↑ */}

              {/* ↓ 건수 및 차수 표시 ↓ */}
              <div className="jcc" style={{display:"flex", gap:"40px", margin:"10px 0px -10px 0px"}}>
                <div className="modal-title">이전 시험 건수 : 2</div>
                <div className="modal-title">이번 시험 차수 : 3</div>
              </div>
              {/* ↑ 건수 및 차수 표시 ↑ */}

              {/* ↓ 완료 버튼 ↓ */}
              <div className="modal-buttons">
                <button className="button" onClick={(e) => {}}>선택</button>
              </div>
              {/* ↑ 완료 버튼 ↑ */}

            </div>
          </div>
        )}
        {/* ↑ 모달 영역 ↑ */}

      </div>
      {/* ↑ 등록 메인 뷰 ↑ */}
    </>
  )
}