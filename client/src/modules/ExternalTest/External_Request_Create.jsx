/**
 * 파일명 : CT_Request_Create.jsx
 * 용도 : external 의뢰 등록
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";

import External_SubNav from "/src/modules/ExternalTest/External_SubNav";
import userUrlInfo from "/src/hooks/useUrlInfo";

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";

export default function External_Request_Create() {


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
   * 제형(의뢰) 제형 정보 입력 행
   */
  const [rows, setRows] = useState([]);


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
   * external 등록 폼 객체
   */
  const [ctForm, setCTForm] = useState({
    "ct_request_date" : G_TODAY,
    "ct_code" : "",
    "ct_test_seq" : "",
    "client_id" : "",
    "sample_id" : "",
    "ct_lab_no" : "",
    "sales_manager_id" : "",
    "labs_manager_id" : "",
    "labs_manage_department_id" : "",
    "ct_manager_id" : "",
    "is_ct_suspend" : "",
    "ct_suspend_reason" : "",
    "ct_type" : "",
    "material_supplier_id" : "",
    "material_large_category_id" : "",
    "material_sub_category" : [],
    "material_description" : "",
    "material_quantity" : "",
    "sample_quantity" : "",
    "desired_volume" : "",
    "desired_volume_unit" : "ml",
    "sleeve_length" : "",
    "is_emergency" : "",
    "is_cpnp" : "",
    "is_eng" : "",
    "request_content" : "",
    "request_remark" : "",
    "material_request_date" : G_TODAY,
    "sample_type" : "lv1",
    "required_bulk_volume" : "",
    "request_bulk_volume" : "",
    "request_bulk_volume_unit" : "ml",
    "bulk_volume" : "",
    "bulk_volume_ratio_type" : "",
    "sample_viscosity" : "",
    "sample_hardness" : "",
    "sample_sg" : "",
    "sample_ratio" : "",
    "sample_ratio_type" : "vol",
    "sample_significant" : "",
    "sample_etc" : "",
    "sample_remark" : ""
  });


  /**
   * 차수 조회 폼 객체
   */
  const [historyForm, setHistoryForm] = useState({
    "search_type" : "REQ",
    "search_from" : G_STARTDAY,
    "search_to" : G_TODAY,
    "search_client" : "",
    "search_sample" : "",
    "search_labNo" : "",
    "search_keyword" : ""
  });
  

  /**
   * 유효성 검즘 state - 조회 조건 입력 시 날짜 검증 등에 사용.
   */
  const [isValidated, setIsValidated] = useState(true);


  /**
   * external 폼 초기화 함수
   */
  const resetForm = () => {
    setCTForm({
      "ct_request_date" : G_TODAY,
      "ct_code" : "",
      "ct_test_seq" : "",
      "client_id" : "",
      "sample_id" : "",
      "ct_lab_no" : "",
      "sales_manager_id" : "",
      "labs_manager_id" : "",
      "labs_manage_department_id" : "",
      "ct_manager_id" : "",
      "is_ct_suspend" : "",
      "ct_suspend_reason" : "",
      "ct_type" : "",
      "material_supplier_id" : "",
      "material_large_category_id" : "",
      "material_sub_category" : [],
      "material_description" : "",
      "material_quantity" : "",
      "sample_quantity" : "",
      "desired_volume" : "",
      "desired_volume_unit" : "ml",
      "sleeve_length" : "",
      "is_emergency" : "",
      "is_cpnp" : "",
      "is_eng" : "",
      "request_content" : "",
      "request_remark" : "",
      "material_request_date" : G_TODAY,
      "sample_type" : "lv1",
      "required_bulk_volume" : "",
      "request_bulk_volume" : "",
      "request_bulk_volume_unit" : "ml",
      "bulk_volume" : "",
      "bulk_volume_ratio_type" : "",
      "sample_viscosity" : "",
      "sample_hardness" : "",
      "sample_sg" : "",
      "sample_ratio" : "",
      "sample_ratio_type" : "vol",
      "sample_significant" : "",
      "sample_etc" : "",
      "sample_remark" : ""
    });
  };


  /**
   * createRequest : external 의뢰 생성
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


  /**
   * toggleDropdown : 커스텀 셀렉트 박스 활성화 함수
   */
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  
    if (!isDropdownOpen) {
      const rect = refCustomSelectBox.current.getBoundingClientRect();
  
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
    }
  };


  /**
   * outFocusModal : 커스텀 셀렉트박스 자동 닫기 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const outFocusModal = (e) => {
    const nextFocused = e.relatedTarget;
    if (refCustomSelectBox.current && !refCustomSelectBox.current.contains(nextFocused)) {
      setIsDropdownOpen(prev => !prev);
    }
  }


  /**
   * addRow : 제형(의뢰) 기타 특이사항 입력 행 추가 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const addRow = (e) => {
    e.preventDefault();
    
    const newRow = {
      "id" : rows.length + 1,
      "name" : `항목 ${rows.length + 1}`,
      "value" : `값 ${rows.length + 1}`
    };

    setRows(prev => [...prev, newRow]);
  }


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

  /*  ################################################
  #   ______                __           __
  #  / ____/_______  ____ _/ /____  ____/ /
  # / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #/ /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #\____/_/   \___/\__,_/\__/\___/\__,_/   
  # Created : 2025.01.23
  # Author : Choi Yeon Woong 
  # Description : 성분분석-외부 [등록] 로직
  # Modified : 
  ################################################ */

  //================== ⭐ 페이지 useEffect 관리 ⭐ ==================
  /**
   * ■ 최초 페이지 조회시 모드 확인
   */
  useEffect(() => {
    if (mode == "update") { getExternalDataDetail() };
  }, []);


  //================== ⭐ 페이지 State 관리 ⭐ ==================
  /**
   * ✨ 내부성분분석 구분별 시트 변경
   */
  const [classification, setClassification] = useState(0);
  
  /**
   * ✨ Error 상태 만들기
   * @name : errorField
   */
  const [errorField, setErrorField] = useState(null);
  const refs = {
    "external_remark_reason": useRef(),
    "external_item_name_en": useRef(),
    "external_item_name_kr": useRef(),
    "external_item_type": useRef(),
    "external_issue_class": useRef(),
    "external_cost_from": useRef(),
    "external_is_photo": useRef(),
    "external_remark_class_etc": useRef(),
  }

  const disabledClass = "external-create-disabled"
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

  const [externalForm, setExternalForm] = useState({
    "company_id" : companyId
    ,"external_class" : 0
    ,"external_request_id" : ""
    ,"external_request_no" : ""
    ,"external_request_date" : G_TODAY
    ,"external_request_user" : userName

    ,"external_cust_name" : ""
    ,"external_item_name_en" : ""
    ,"external_item_name_kr" : ""
    ,"external_lab_no" : ""
    ,"external_lab_ver" : ""
    ,"external_lot_no" : ""
    ,"external_remark_duple" : ""
    ,"external_remark_reason" : ""
    ,"external_remark_class_etc" : ""

    ,"external_item_type" : ""
    ,"external_issue_class" : ""
    ,"external_cost_from" : ""
    ,"external_is_photo" : ""
    ,"external_remark_doc" : ""

    ,"external_test_microbe_class" : ""

    ,"external_test_anti_class" : ""
    ,"external_test_remark_anti_etc" : ""
    ,"external_test_contact_time" : 5

    ,"external_test_etc_is_content" : ""
    ,"external_test_etc_content" : ""
    ,"external_test_etc_content_unit" : "g"
    ,"external_test_etc_is_ph" : ""
    ,"external_test_etc_ph" : ""
    ,"external_test_etc_is_safety" : ""
    ,"external_test_is_etc" : ""
    ,"external_test_remark_etc" : ""

    ,"external_test_pre_class" : ""
    ,"external_test_remark_pre" : ""

    ,"external_test_deodorant_class" : ""

    ,"external_test_start_date" : ""
    ,"external_test_end_date" : ""
    ,"external_test_user" : ""
    ,"external_test_confirm_user" : ""
    ,"external_test_remark_test" : ""

    ,"external_test_status" : ""

    ,"external_must_value" : ""


  });

  
  /**
   * input 값 변경 시 form 객체에 데이터 바인딩
   * -----------------------------------------------------------
   * @name handleInput
   * @param { Event } e : 이벤트 호출 컴포넌트
   * @param {string || null} option : 체크박스 선택값
   */
  const handleInput = (e, option = null) => {

    const { id, name, type, value, checked } = e.target;
      if (type === "checkbox") {
          setExternalForm((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
          console.log(externalForm);
          return;
      } 
        else if (type === "radio") {
          setClassification(value);

          if (id=="classification_must_value") {
            setExternalForm((prev) => ({ ...prev, [name]: value, ["external_must_value"]:"class_etc" }));

          } else { setExternalForm((prev) => ({ ...prev, [name]: value, ["external_must_value"]: "" }));}

          console.log(`✅ --externalForm : ${JSON.stringify(externalForm)}`);
          return;
      } 
        else {
          setExternalForm((prev) => ({ ...prev, [name]: value }));
          console.log(externalForm);
          return;
      }
  };

  /**
   * @name : handleRmInput
   * @function : 원료 이름 동적생성시 input 값에 따른 state 변경
   */
  const handleRmInput = (id, name, newData) => {
    const value = newData.target.value;
    const tName = newData.target.name;
    console.log(newData);

    setRmForm(prev => {
      const exists = prev.some(row => row.id === id);

      if (exists) {
        if(tName.includes("name")) {
          return prev.map(row =>
            row.id == id ? { ...row, name: value } : row
          );
        } else if (tName.includes("amount")) {
          return prev.map(row =>
            row.id == id ? { ...row, value: value } : row
          );
        }
      }

      return [...prev, {id, name: value }];
    });
    console.log("📌 rmForm TEST : ", rmForm);
  };

  /**
   * handleStatus
   * @name : handleStatus
   * @description 시험시작일 기입시 status 자동 시험중으로 변경
   * @return { Number } 0:대기중 / 1:시험중 / 2:시험완료
   */
  const handleStatus = (e) => {
    const { name, value, dataset } = e.target;
    const status = dataset.status;
    const sValue = dataset.value;

    switch(sValue) {
      case "1" :
        setExternalForm((prev) => ({ ...prev, [name]: value, [status]: sValue}));
        break;

      case "2" :
        externalForm?.external_test_status != "2"
          ? setExternalForm((prev) => ({ ...prev, [name]: value, [status]: sValue}))
          : setExternalForm((prev) => ({ ...prev, [name]: value, [status]: "1"}))
        break;
    }
    console.log(`\n-- Form : ${JSON.stringify(preForm)}`);

    return;
  }

  /**
   * ✨ 성분분석[외부] 등록 화면 저장 프로세스 관리
   * @name saveRequest
   * @description "저장" 버튼 클릭시 프로세스
   */
  const saveRequest = async (e) => {
    e.preventDefault();

    const formState = externalForm;
    // const rmState = rmForm;
    // const sheetState = sheetPagesRef.current?.getSheetData?.() ?? {};
    // const fileState = sheetPagesRef.current?.getFiles?.() ?? {};
    // const sheetState = sheetData;
    // const fileState = files;
    console.log("[formState] : ", formState);
    // console.log("[rmState] : ", rmState);
    // console.log("[sheetState] : ", sheetState);
    // console.log("[fileState] : ", fileState);
    
    // const fileMeta = fileState.map(f => ({
    //   name: f.name
    //   ,size: f.size
    //   ,type: f.type
    //   ,lastModified: f.lastModified
    //   ,lastModifiedDate: f.lastModifiedDate
    // }));

    const baseUrl = "/api/v2/ltms/external/request";
    let targetUrl = "";

    switch(mode) {
      case "create" : targetUrl = baseUrl + "/create"; break;
      case "update" : targetUrl = `${baseUrl}/create?mode=update&request_id=${url.query.request_id}`; break;
      case "" : alert("잘못된 요청입니다."); return;
      default : alert("잘못된 요청입니다."); return;
    }

    console.log("📌 targetUrl : ", targetUrl);

    // ■ 파일 폼데이터화
    // const fd = new FormData();

    
    // ■ 파일정리 1) 기존 파일 JSON 으로 폼데이터화
    // const keepFiles = fileState
    //   .filter(x => !(x instanceof File))
    //   .map(x => ({
    //     request_id: x.request_id
    //     ,file_id: x.file_id
    //     ,name: x.name
    //     ,serl: x.serl
    //     ,type: x.type
    //     ,dir: x.dir
    // }));

    // fd.append("keepFiles", JSON.stringify(keepFiles));
    // console.log(`📌 keepFiles : ${keepFiles}`);

    // ■ 파일정리 2) 새로운 파일 파일 객체로 폼데이터화
    // fileState
    //   .filter(x => x instanceof File)
    //   .forEach(f => fd.append("files", f));

    // fileState.forEach((file) => {
    //   fd.append("files", file);
    // });

    // fd.append("sampleInfo", JSON.stringify(preForm));
    // fd.append("rmInfo", JSON.stringify(rmForm));
    // fd.append("testInfo", JSON.stringify(sheetState));
    // fd.append("fileInfo", JSON.stringify(fileState));

    // console.log("FD 데이터 : ", fd.getAll("files"));

    // ■ 파일정리 3) 기본 정보 State 객체화
    const params = {
      sampleInfo: formState
      // rmInfo: rmState,
      // testInfo: sheetState,
      // fileInfo: fileState
    }

    // ■ 내부 데이터 전송 및 post 요청
    try {
      const request = await axios.post(targetUrl, params);
      console.log("[External] saveRequest response : ", request);
      alert("저장되었습니다.");
      // goToPage("/external/request/read");

    } catch(err) {
      console.error(err);
      
      // 오류필드 포커싱
      const field = err?.response?.data?.field;
      if(field){
        refs[field].current.focus();
        setErrorField(field);

        setTimeout(() => {
          setErrorField(null);
        }, 2000);
      }

      alert(err.response.data.error);
    }
  }

  
  /**
   * ✨ 성분분석[내부] 조회 → 등록 화면 진입시 상세 정보 조회
   * -------------------------------------------------------
   * @name getExternalDataDetail
   * @description 쿼리스트링 내 request_id 기준 데이터 조회 후 State 반환
   * @return { State } internalForm, internalRmForm
   */
  const getExternalDataDetail = async () => {
    const params = {
      request_id : reqIdQuery
    };

    console.log(`🙌 params : ${params}`);

    const response = await axios.get("/api/v2/ltms/external/request/read/detail", { params });

    const data = response.data.data;

    // ■ 내부성분분석 메인 폼 데이터 배치
    setExternalForm(prev => ({
      ...prev,
      ...data
    }));

  }



  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <External_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}

      {/* ↓ 등록 메인 뷰 ↓ */}
      <div className="container">

        {/* ↓ 등록 폼 ↓ */}
        <div>
          {/* ↓ external 폼 타이틀 ↓ */}
          <div className="page-top">
            {/* <h1 className="page-title">{catName} {actName}</h1> */}
          </div>
          {/* ↑ external 폼 타이틀 ↑ */}
          
          {/* 폼 영역 */}
          <form id="external-create-form" className="" onSubmit={createRequest}>

            {/* ↓ external 폼 ↓ */}
            <div id="external" className="external-create-information">

              {/* ↓ external 입력값 1번 라인 ↓ */}
                <div className="external-create-grid-title">◎ 의뢰 정보</div>
                <div className="external-create-grid external-create-grid-line">
                    <div className="field">
                      <div className="external-create-grid-label">성분분석</div>
                      <input 
                        type="text" 
                        placeholder="외부"
                        disabled="true"
                        className="unactivate-disable"
                      />
                    </div>
                    <div className="field">
                      <div className="external-create-grid-label">의뢰번호</div>
                      <input 
                        type="text" 
                        placeholder="260001"
                        disabled={true}
                        className="unactivate-disable"
                        value={externalForm?.external_request_no ?? ""}
                      />
                    </div>
                    <div className="field">
                      <div className="external-create-grid-label">등록일</div>
                      <input 
                        type="date" 
                        // placeholder={G_TODAY} 
                        name="external_request_date"
                        value={externalForm?.external_request_date ?? ""}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="field">
                      <div className="external-create-grid-label">의뢰자</div>
                      <input 
                        type="text" 
                        placeholder="홍길동"
                        name="external_request_user"
                        value={externalForm?.external_request_user ?? ""}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="field"/>
                    <div className="field"/>
                    <div className="field"/>
                    <div className="field"/>
                    <div className="field"/>

                </div>
                <div className="external-create-grid external-create-grid-line">
                  <div className="field">
                    <div className="external-create-grid-label">업체명</div>
                    <input 
                      type="text" 
                      placeholder="코스메카코리아"
                      name="external_cust_name"
                      value={externalForm?.external_cust_name ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="item-name-field">
                    <div className="external-create-grid-label must-value">품 명</div>
                    <input 
                      type="text" 
                      placeholder="코스메카코리아손소독제,,,150,ML"
                      name="external_item_name_kr"
                      value={externalForm?.external_item_name_kr ?? ""}
                      onChange={handleInput}
                      ref={refs.external_item_name_kr}
                      className={`${errorField == "external_item_name_kr" ? "error-background" : "error-to-input"}`}
                    />
                  </div>
                  <div className="field-LabNo">
                    <div className="external-create-grid-label">Lab No.</div>
                    <input 
                      type="text" 
                      placeholder="NGA0139A-260120A"
                      name="external_lab_no"
                      value={externalForm?.external_lab_no ?? ""}
                      onChange={handleInput}
                    />
                    <div className="external-create-grid-label">Ver.</div>
                    <input 
                      type="text" 
                      placeholder="01"
                      name="external_lab_ver"
                      disabled={true}
                      value={externalForm?.external_lab_ver}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="lotNo-field">
                    <div className="external-create-grid-label">Lot No.</div>
                    <input 
                      type="text" 
                      placeholder="26X0020A"
                      name="external_lot_no"
                      value={externalForm?.external_lot_no ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="duple-field">
                    <div className="external-create-grid-label">중복사유</div>
                    <textarea 
                      type="text" 
                      style={{lineHeight: '7px'}}
                      placeholder="동일 항목 진행시 Ver 증가"
                      name="external_remark_duple"
                      value={externalForm?.external_remark_duple}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field"/>
                </div>
                <div className="external-create-grid external-create-grid-line">
                  <div className="class-field">
                    <div className="external-create-grid-label">구 분</div>
                    {/* <div /> */}
                  </div>
                  <div className="button-field">
                    <input 
                      id="classification_01" 
                      type="radio"
                      name="external_class"
                      value="0"
                      checked={externalForm?.external_class==0 ? true : false}
                      onChange={handleInput}
                    />
                    <label for="classification_01">연구참고용</label>
                  </div>
                  <div className="button-field">
                    <input 
                      id="classification_02" 
                      type="radio"
                      name="external_class"
                      value="1"
                      checked={externalForm?.external_class==1 ? true : false}
                      onChange={handleInput}
                    />
                    <label for="classification_02">고객사 제출용</label>
                  </div>
                  <div className="button-field">
                    <input 
                      id="classification_03" 
                      type="radio"
                      name="external_class"
                      value="2"
                      checked={externalForm?.external_class==2 ? true : false}
                      onChange={handleInput}
                    />
                    <label for="classification_03">홈쇼핑 제출용</label>
                  </div>
                  <div className="button-field">
                    <input 
                      id="classification_04" 
                      type="radio"
                      name="external_class"
                      value="3"
                      checked={externalForm?.external_class==3 ? true : false}
                      onChange={handleInput}
                    />
                    <label for="classification_04">식약처 허가용</label>
                  </div>
                  <div className="triple-field">
                    <input 
                      id="classification_must_value" 
                      type="radio"
                      name="external_class"
                      value="4"
                      checked={externalForm?.external_class==4 ? true : false}
                      onChange={handleInput}
                    />
                    <label 
                      for="classification_must_value"
                      className={
                        externalForm?.external_class==4
                          ? "must-value"
                          : ""
                      }
                    >기타</label>
                  {/* </div> */}
                  {/* <div className="empty-field"> */}
                  {externalForm?.external_class==4 
                    ? <textarea 
                        style={{lineHeight: '7px'}}
                        type="text" 
                        placeHolder="내용 기재(기타 체크시 필수사항)"
                        name="external_remark_class_etc"
                        value={externalForm?.external_remark_class_etc}
                        onChange={handleInput}
                        ref={refs.external_remark_class_etc}
                        className={errorField == "external_remark_class_etc" ? "error-background" : "error-to-input"}
                    ></textarea>
                    : ""
                  }
                    
                  </div>
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                </div>
                <div className="external-create-grid external-create-grid-line">
                  <div className="field">
                    <div 
                      className="external-create-grid-label must-value"

                    >사 유</div>
                      <input 
                        type="text" 
                        name="external_remark_reason"
                        value={externalForm?.external_remark_reason ?? ""}
                        onChange={handleInput}
                        ref={refs.external_remark_reason}
                        className={errorField == "external_remark_reason" ? "error-background" : "error-to-input"}
                      />
                  </div>
                  <div className="field"></div>
                </div>
            </div>
            <div id="external" className="external-create-information">
              <div className="external-create-grid-title">◎ 성적서 기재 사항</div>
              <div className="external-create-grid external-create-grid-line">
                <div className="double-field">
                  <div className="external-create-grid-label must-value">품 명(국문)</div>
                  <input 
                    type="text"
                    name="external_item_name_kr"
                    value={externalForm?.external_item_name_kr ?? ""}
                    disabled="true"
                    className="unactivate-disable"
                    // onChange={handleInput}
                  />
                </div>
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="double-field">
                  <div className="external-create-grid-label must-value">품 명(영문)</div>
                  <input 
                    type="text"
                    name="external_item_name_en"
                    value={externalForm?.external_item_name_en ?? ""}
                    onChange={handleInput}
                    ref={refs.external_item_name_en}
                    className={errorField == "external_item_name_en" ? "error-background" : "error-to-input"}
                  />
                </div>
                <div className="field">
                  <div className="external-create-grid-label">Lab No.</div>
                  <input 
                    type="text" 
                    name="external_lab_no"
                    className="unactivate-disable"
                    disabled="true"
                    value={externalForm?.external_lab_no ?? ""}
                    // onChange={handleInput}
                  />
                </div>
                <div className="field">
                  <div className="external-create-grid-label">Lot No.</div>
                  <input 
                    type="text" 
                    name="external_lot_no"
                    className="unactivate-disable"
                    disabled="true"
                    value={externalForm?.external_lot_no ?? ""}
                    // onChange={handleInput}
                  />
                </div>
                <div className="field"/>
                <div className="field"/>
                <div className="field"/>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="field">
                  <div className="external-create-grid-label must-value">제품 유형</div>
                  <input 
                    type="text" 
                    name="external_item_type"
                    value={externalForm?.external_item_type ?? ""}
                    onChange={handleInput}
                    ref={refs.external_item_type}
                    className={errorField == "external_item_type" ? "error-background" : "error-to-input"}
                  />
                </div>
                <div className="field">
                  <div className="external-create-grid-label must-value">발급 구분</div>
                  <select 
                    name="external_issue_class"
                    value={externalForm?.external_issue_class ?? ""}
                    onChange={handleInput}
                    ref={refs.external_issue_class}
                    className={errorField == "external_issue_class" ? "error-background" : "error-to-input"}
                  >
                    <option value=""></option>
                    <option value="0">국문</option>
                    <option value="1">영문</option>
                  </select>
                </div>
                <div className="field">
                  <div className="external-create-grid-label must-value">비용 처리</div>
                  <select 
                    name="external_cost_from"
                    value={externalForm?.external_cost_from ?? ""}
                    onChange={handleInput}
                    ref={refs.external_cost_from}
                    className={errorField == "external_cost_from" ? "error-background" : "error-to-input"}
                  >
                    <option value=""></option>
                    <option value="0">고객사</option>
                    <option value="1">자사</option>
                  </select>
                </div>
                <div className="reverse-field">
                  <div className="external-create-grid-label must-value">완제품 사진 등록 여부</div>
                  <select
                    name="external_is_photo"
                    value={externalForm?.external_is_photo ?? ""}
                    onChange={handleInput}
                    ref={refs.external_is_photo}
                    className={errorField == "external_is_photo" ? "error-background" : "error-to-input"}
                  >
                    <option value=""></option>
                    <option value="1">O</option>
                    <option value="0">X</option>
                  </select>
                </div>
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="field">
                  <div className="external-create-grid-label-text">※ 시험 접수 이후에는 내용 수정이 불가능하므로, 최종 확정된 정보를 정확하게 기재 바랍니다.</div>
                </div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="field">
                  <div className="external-create-grid-label">비 고</div>
                  <textarea 
                    type="text"
                    name="external_remark_doc"
                    value={externalForm?.external_remark_doc ?? ""}
                    onChange={handleInput}
                  />
                </div>
                <div className="field"></div>
              </div>
            </div>
            {/* ↑ 제형 의뢰 등록 폼 ↑ */}
            <div id="external" className="external-create-information">
              <div className="external-create-grid-title">◎ 시험 항목</div>
              <div className="external-create-grid external-create-grid-line">
                <div className="field">
                  <div className="external-create-grid-label">📌 미생물 시험</div>
                </div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="external-create-grid external-create-grid-line-custom">
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_germs"
                      // name="external_test_germs"
                      name="external_test_microbe_class"
                      // checked={externalForm?.external_test_germs ?? ""}
                      checked={externalForm?.external_test_microbe_class==0 ? true : false}
                      value="0"
                      onChange={handleInput}
                    />
                    <label for="external_germs" className="external-create-grid-label">총호기성 세균수(세균,진균)</label>
                  </div>
                  {/* <div className="button-field" style={{paddingLeft: '90px'}}> */}
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_colon_bacillus"
                      // name="external_test_colon_bacillus"
                      name="external_test_microbe_class"
                      // checked={externalForm?.external_test_colon_bacillus ?? ""}
                      checked={externalForm?.external_test_microbe_class==1 ? true : false}
                      value="1"
                      onChange={handleInput}
                    />
                    <label for="external_colon_bacillus" className="external-create-grid-label">대장균</label>
                  </div>
                  {/* <div className="button-field" style={{paddingLeft: '60px'}}> */}
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_pseudomonas"
                      // name="external_test_pseudomonas"
                      name="external_test_microbe_class"
                      // checked={externalForm?.external_test_pseudomonas ?? ""}
                      checked={externalForm?.external_test_microbe_class==2 ? true : false}
                      value="2"
                      onChange={handleInput}
                    />
                    <label for="external_pseudomonas" className="external-create-grid-label">녹농균</label>
                  </div>
                  {/* <div className="button-field" style={{paddingRight:'50px'}}> */}
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_staphylococcus"
                      // name="external_test_staphylococcus"
                      name="external_test_microbe_class"
                      // checked={externalForm?.external_test_staphylococcus ?? ""}
                      checked={externalForm?.external_test_microbe_class==3 ? true : false}
                      value="3"
                      onChange={handleInput}
                    />
                    <label for="external_staphylococcus" className="external-create-grid-label">황색포도상구균</label>
                  </div>
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_etc"
                      // name="external_test_etc"
                      name="external_test_microbe_class"
                      // checked={externalForm?.external_test_etc ?? "" }
                      checked={externalForm?.external_test_microbe_class==4 ? true : false}
                      value="4"
                      onChange={handleInput}
                    />
                    <label for="external_etc" className="external-create-grid-label">기타</label>
                  </div>
                </div>
                <div className="external-create-grid external-create-grid-line"></div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="field">
                  <div className="external-create-grid-label">📌 항균력 시험</div>
                </div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="external-create-grid external-create-grid-line-custom2">
                  <div className="button-field" >
                    <input 
                      type="radio" 
                      id="external_colon_bacillus2"
                      name="external_test_anti_class"
                      checked={externalForm?.external_test_anti_class==0 ? true : false}
                      onChange={handleInput}
                      value="0"
                    />
                    <label for="external_colon_bacillus2" className="external-create-grid-label">대장균</label>
                  </div>
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_pseudomonas2"
                      name="external_test_anti_class"
                      checked={externalForm?.external_test_anti_class==1 ? true : false}
                      onChange={handleInput}
                      value="1"
                    />
                    <label for="external_pseudomonas2" className="external-create-grid-label">녹농균</label>
                  </div>
                  <div className="button-field" >
                    <input 
                      type="radio" 
                      id="external_staphylococcus2"
                      name="external_test_anti_class"
                      checked={externalForm?.external_test_anti_class==2 ? true : false}
                      onChange={handleInput}
                      value="2"
                    />
                    <label for="external_staphylococcus2" className="external-create-grid-label">황색포도상구균</label>
                  </div>
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_candida"
                      name="external_test_anti_class"
                      checked={externalForm?.external_test_anti_class==3 ? true : false}
                      onChange={handleInput}
                      value="3"
                    />
                    <label for="external_candida" className="external-create-grid-label">칸디다균</label>
                  </div>
                  <div className="button-field">
                    <input 
                      type="radio" 
                      id="external_etc2"
                      name="external_test_anti_class"
                      checked={externalForm?.external_test_anti_class==4 ? true : false}
                      onChange={handleInput}
                      value="4"
                    />
                    <label 
                      for="external_etc2" 
                      className={`external-create-grid-label ${externalForm?.external_test_anti_class==4 ? "must-value" : ""}`}>기타</label>
                  </div>
                  <div className="triple-size-field">
                    <input 
                      type="text" 
                      placeHolder="내용 기재(기타체크시 필수)"
                      name="external_test_remark_anti_etc"
                      value={externalForm?.external_test_remark_anti_etc ?? ""}
                      onChange={handleInput}
                      style={{display:`${externalForm?.external_test_anti_class==4 ? 'flex' : 'none'}`}}
                      />
                 </div>
                </div>
                <div className="external-create-grid external-create-grid-line">
                </div>
                
              </div>
              
              <div className="external-create-grid external-create-grid-line">
                  <div className="reverse-field">
                    <div className="external-create-grid-label">🔥 제품과 균의 접촉시간</div>
                    <input 
                      type="text"
                      name="external_test_contact_time"
                      value={externalForm?.external_test_contact_time ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field">
                    <div className="external-create-grid-label-text">※ 제품 사용방법을 고려하여 설정(일반적으로 5분으로 설정)</div>
                    </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="field">
                  <div className="external-create-grid-label">📌 기타 시험 항목</div>
                </div>
                <div className="field"></div>
                <div className="field">
                  <div className="external-create-grid-label">📌 방부력 시험</div>
                </div>
                <div className="field"></div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="empty-field-times3">
                  <div className="external-create-grid external-create-grid-line-custom4">
                    <div className="button-field">
                      <input 
                        type="checkbox" 
                        id="external_content"
                        name="external_test_etc_is_content"
                        checked={externalForm?.external_test_etc_is_content==1 ? true : false}
                        onChange={handleInput}
                      />
                      <label for="external_content" className="external-create-grid-label">내용량 시험</label>
                    </div>
                    <div className="select-content-field" style={{marginRight: '100px'}}>
                      <input 
                        type="text"
                        name="external_test_etc_content"
                        value={externalForm?.external_test_etc_content ?? ""}
                        onChange={handleInput}
                        disabled={externalForm?.external_test_etc_is_content==1 ? false : true}
                        className={externalForm?.external_test_etc_is_content==1 ? "" : "unactivate-disable"}
                      />
                      <div></div>
                      <select
                        name="external_test_etc_content_unit"
                        value={externalForm?.external_test_etc_content_unit ?? ""}
                        onChange={handleInput}
                        disabled={externalForm?.external_test_etc_is_content==1 ? false : true}
                        className={externalForm?.external_test_etc_is_content==1 ? "" : "unactivate-disable"}
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                    <div className="double-field">
                      <div className="external-create-grid-label">※ 단위 구분하여 표기(g 또는 ml)</div>
                    </div>
                  </div>
                </div>
                <div className="empty-field-times3">
                  <div className="external-create-grid external-create-grid-line-custom-preservative">
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_iso"
                        name="external_test_pre_class"
                        checked={externalForm?.external_test_pre_class==0 ? true : false}
                        onChange={handleInput}
                        value="0"
                      />
                      <label for="external_iso" className="external-create-grid-label">ISO11930</label>
                    </div>
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_pcpc"
                        name="external_test_pre_class"
                        checked={externalForm?.external_test_pre_class==1 ? true : false}
                        onChange={handleInput}
                        value="1"
                      />
                      <label for="external_pcpc" className="external-create-grid-label">PCPC</label>
                    </div>
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_usp31"
                        name="external_test_pre_class"
                        checked={externalForm?.external_test_pre_class==2 ? true : false}
                        onChange={handleInput}
                        value="2"
                      />
                      <label for="external_usp31" className="external-create-grid-label">USP31</label>
                    </div>
                    <div className="triple-field">
                      <input 
                        type="radio" 
                        id="external_etc3"
                        name="external_test_pre_class"
                        checked={externalForm?.external_test_pre_class==3 ? true : false}
                        onChange={handleInput}
                        value="3"
                      />
                      <label 
                        for="external_etc3" 
                        className={`external-create-grid-label ${externalForm?.external_test_pre_class==3 ? "must-value" : ""}`}
                      >기타</label>
                      <input 
                        type="text" 
                        placeHolder="내용기재(기타체크시 필수)"
                        name="external_test_remark_pre"
                        checked={externalForm?.external_test_remark_pre ?? ""}
                        style={{display: `${externalForm?.external_test_pre_class==3 ? "flex" : "none"}`}}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="empty-field-times3">
                  <div className="external-create-grid external-create-grid-line-custom2">
                    <div className="button-field">
                      <input 
                        type="checkbox" 
                        id="external_ph"
                        name="external_test_etc_is_ph"
                        checked={externalForm?.external_test_etc_is_ph==1 ? true : false}
                        onChange={handleInput}
                      />
                      <label for="external_ph" className="external-create-grid-label">pH</label>
                    </div>
                    <div className="select-field">
                      <input 
                        type="text" 
                        name="external_test_etc_ph"
                        value={externalForm?.external_test_etc_ph ?? ""}
                        onChange={handleInput}
                        disabled={externalForm?.external_test_etc_is_ph==1 ? false : true}
                        className={externalForm?.external_test_etc_is_ph==1 ? "" : "unactivate-disable"}
                      />
                      <div></div>
                    </div>
                  </div>
                </div>
                <div className="empty-field-times3">
                  <div className="external-create-grid external-create-grid-line"></div>
                </div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="empty-field-times3">
                  <div className="external-create-grid external-create-grid-line">
                    <div className="button-field">
                      <input 
                        type="checkbox" 
                        id="external_safety"
                        name="external_test_etc_is_safety"
                        checked={externalForm?.external_test_etc_is_safety==1 ? true : false}
                        onChange={handleInput}
                      />
                      <label for="external_safety" className="external-create-grid-label">안전확인대상생활화학제품 안전기준적합 확인시험 · 검사</label>
                    </div>
                    <div className="field"></div>
                    <div className="field">
                      <div className="external-create-grid-label">📌 탈취력 시험</div>
                    </div>
                    <div className="field"></div>
                  </div>
                </div>
              </div>
              <div className="external-create-grid external-create-grid-line">
                <div className="empty-field-times3">
                  <div className="triple-field-long-title">
                    <div className="empty-field-times1">
                      <input 
                        type="checkbox" 
                        id="external_etc4"
                        name="external_test_is_etc"
                        checked={externalForm?.external_test_is_etc==1 ? true : false}
                        onChange={handleInput}
                      />
                    </div>
                    <label for="external_etc4" className="external-create-grid-label">이외 분석 항목</label>
                    <div className="empty-field-times1">
                      <input 
                        type="text" 
                        placeHolder="내용 기재(체크시 필수)"
                        name="external_test_remark_etc"
                        value={externalForm?.external_test_remark_etc ?? ""}
                        onChange={handleInput}
                        disabled={externalForm?.external_test_is_etc==1 ? false : true}
                        className={externalForm?.external_test_is_etc==1 ? "" : "unactivate-disable"}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className="empty-field-times2">
                  <input type="text" placeHolder="내용 기재(체크시 필수)"/>
                </div> */}
                <div className="empty-field-times3">
                  <div className="external-create-grid external-create-grid-line-custom-deodorant">
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_metil"
                        name="external_test_deodorant_class"
                        checked={externalForm?.external_test_deodorant_class==0 ? true : false}
                        onChange={handleInput}
                        value="0"
                      />
                      <label for="external_metil" className="external-create-grid-label">메틸머캅탄</label>
                    </div>
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_ammonia"
                        name="external_test_deodorant_class"
                        checked={externalForm?.external_test_deodorant_class==1 ? true : false}
                        onChange={handleInput}
                        value="1"
                      />
                      <label for="external_ammonia" className="external-create-grid-label">암모니아</label>
                    </div>
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_trimetil"
                        name="external_test_deodorant_class"
                        checked={externalForm?.external_test_deodorant_class==2 ? true : false}
                        onChange={handleInput}
                        value="2"
                      />
                      <label for="external_trimetil" className="external-create-grid-label">트리메틸아민</label>
                    </div>
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_sulfide"
                        name="external_test_deodorant_class"
                        checked={externalForm?.external_test_deodorant_class==3 ? true : false}
                        onChange={handleInput}
                        value="3"
                      />
                      <label for="external_sulfide" className="external-create-grid-label">황화수소</label>
                    </div>
                    <div className="button-field">
                      <input 
                        type="radio" 
                        id="external_etc5"
                        name="external_test_deodorant_class"
                        checked={externalForm?.external_test_deodorant_class==4 ? true : false}
                        onChange={handleInput}
                        value="4"
                      />
                      <label for="external_etc5" className="external-create-grid-label">기타</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ↓ [외부성분분석] 시험승인 폼 ↓ */}
            <div className="external-create-information">
              <div className="external-create-grid-title">◎ 시험 승인</div>
                {/* ↓ [내부성분분석] 시험승인-1번라인 ↓ */}
                <div className="external-create-grid external-create-grid-line">
                  <div className="field">
                    <div className="external-create-grid-label">시험시작일</div>
                    <input
                      type="date"
                      value={externalForm?.external_date}
                      data-status="external_test_status"
                      data-value="1"
                      onChange={handleStatus}
                      className={
                        externalForm?.external_test_status==2
                          ? "unactivate-disable"
                          : ""
                      }
                      disabled={
                        externalForm?.external_test_status==2
                          ? true
                          : false
                      }
                    />
                  </div>
                  <div className="field">
                    <div className="external-create-grid-label">담당자</div>
                    <input
                      type="text"
                      className={
                        externalForm?.external_test_status==2
                          ? "unactivate-disable"
                          : ""
                      }
                      disabled={
                        externalForm?.external_test_status==2
                          ? true
                          : false
                      }
                      name="external_test_user"
                      value={externalForm?.external_test_user ?? ""}
                      onChange={handleInput}
                    />
                  </div>
                  <div className="field">
                    <div className="external-create-grid-label">의뢰부서 팀장</div>
                    <input 
                      type="text"
                      onChange={handleInput}
                      className={
                        externalForm?.external_test_status==2
                          ? "unactivate-disable"
                          : ""
                      }
                      disabled={
                        externalForm?.external_test_status==2
                          ? true
                          : false
                      }
                      name="external_test_confirm_user"
                      value={externalForm?.external_test_confirm_user ?? ""}
                    />
                  </div>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                </div>
                {/* ↑ [내부성분분석] 시험승인-1번라인 ↑ */}
                {/* ↓ [내부성분분석] 시험승인-2번라인 ↓ */}
                <div className="external-create-grid external-create-grid-line">
                  <div className="empty-field-times1">
                    {/* <div className="external-create-grid-label"> */}
                      <button 
                        className="external-create-approve-button"
                        type="button"
                        onClick={handleStatus}
                        data-status="external_test_status"
                        data-value="2"
                      >시험 완료/취소</button>
                    {/* </div> */}
                  </div>
                  <div className="field">
                    <div className="external-create-grid-label">시험완료일</div>
                    <input 
                      type="date"
                      onChange={handleInput}
                      className={
                        externalForm?.external_test_status==2
                          ? "unactivate-disable"
                          : ""
                      }
                      disabled={
                        externalForm?.external_test_status==2
                          ? true
                          : false
                      }
                      name="external_test_end_date"
                      value={externalForm?.external_test_end_date ?? ""}
                    />
                  </div>
                  <div className="double-field">
                    <div className="external-create-grid-label">의견</div>
                    <input 
                      type="text"
                      onChange={handleInput}
                      className={
                        externalForm?.external_test_status==2
                          ? "unactivate-disable"
                          : ""
                      }
                      disabled={
                        externalForm?.external_test_status==2
                          ? true
                          : false
                      }
                      name="external_test_remark_test"
                      value={externalForm?.external_test_remark_test ?? ""}
                    />
                  </div>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                  <div className="field"/>
                </div>
            </div>
            {/* ↑ [외부성분분석] 시험승인 폼 ↑ */}


            {/* ↓ 등록 폼 제어 버튼 영역 ↓ */}
            <div className="form-buttons">
              <button type="button" disabled={loading} onClick={saveRequest}>
                  {loading ? "등록 중" : "등록"}</button>
              <button type="button" onClick={resetForm}>초기화</button>
            </div>
            {/* ↑ 등록 폼 제어 버튼 영역 ↑ */}

            {/* ↓ 특이사항 입력 모달 ↓ */}
            {isOpenModalRemark.open && (
              <div className="modal-overlay">
                <div className="modal-content" style={{width:"600px"}} ref={refModalSetRemark}>
                  <table className="modal-table">
                    <tbody>
                      <tr>
                        <th className="tac">캡슐 또는 원물 함유 여부</th>
                        <td><input name="capsule" type="search" value={specialData.capsule} onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">색소 함유 여부</th>
                        <td><input name="color" type="search" value={specialData.color} onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">특이 원료 함유 여부</th>
                        <td><input name="ingredient" type="search" value={specialData.ingredient} onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">안정도 특이사항</th>
                        <td><input name="stability" type="search" value={specialData.stability} onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">충전 및 냉각 조건</th>
                        <td><input name="cooling" type="search" value={specialData.cooling} onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">기타 특이사항</th>
                        <td><input name="etc" type="search" value={specialData.etc} onChange={handleSpecialChange} /></td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="modal-buttons">
                    <button onClick={handleSpecialSubmit} className="submit">입력완료</button>
                  </div>
                </div>
              </div>
              )}
              {/* ↑ 특이사항 입력 모달 ↑ */}

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
                      <td><input type="radio" name="external"/></td>
                      <td>CT2024-0123</td>
                      <td>토니모리</td>
                      <td>수분크림</td>
                      <td>LAB-2025-001</td>
                    </tr>
                    <tr>
                    <td><input type="radio" name="external"/></td>
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