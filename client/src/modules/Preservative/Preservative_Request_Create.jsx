/**
 * 파일명 : CT_Request_Create.jsx
 * 용도 : CT 의뢰 등록
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect, useMemo, useContext } from "react";
import axios from "axios";

import Preservative_SubNav from "/src/modules/Preservative/Preservative_SubNav";
import Preservative_SheetPages from "/src/modules/Preservative/Preservative_SheetTabs";
import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";

export default function Preservative_Request_Create() {


  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY; // 오늘 날짜
  const G_STARTDAY = Common.G_STARTDAY; // 오늘로부터 7일

  // ■ 유저정보 조회
  const { user } = useContext(AuthContext);
  const companyId = user.company_id;
  const userId = user.user_id;
  const userName = user.user_full_name;

  // ■ 쿼리스트링 조회
  const url = useUrlInfo(); // 커스텀 훅 - URL 정보 관리
  const preRequestId = url?.query?.request_id ?? "";
  const queryMode = url?.query?.mode ?? "";
  const mode = queryMode ? "update" : "create";
  console.log("📌 Full URL : ", url);
  console.log("📌 Request ID : ", preRequestId);

  
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
   * CT 등록 폼 객체
   */
  // const [ctForm, setCTForm] = useState({
  //   "ct_request_date" : G_TODAY,
  //   "ct_code" : "",
  //   "ct_test_seq" : "",
  //   "client_id" : "",
  //   "sample_id" : "",
  //   "ct_lab_no" : "",
  //   "sales_manager_id" : "",
  //   "labs_manager_id" : "",
  //   "labs_manage_department_id" : "",
  //   "ct_manager_id" : "",
  //   "is_ct_suspend" : "",
  //   "ct_suspend_reason" : "",
  //   "ct_type" : "",
  //   "material_supplier_id" : "",
  //   "material_large_category_id" : "",
  //   "material_sub_category" : [],
  //   "material_description" : "",
  //   "material_quantity" : "",
  //   "sample_quantity" : "",
  //   "desired_volume" : "",
  //   "desired_volume_unit" : "ml",
  //   "sleeve_length" : "",
  //   "is_emergency" : "",
  //   "is_cpnp" : "",
  //   "is_eng" : "",
  //   "request_content" : "",
  //   "request_remark" : "",
  //   "material_request_date" : G_TODAY,
  //   "sample_type" : "lv1",
  //   "required_bulk_volume" : "",
  //   "request_bulk_volume" : "",
  //   "request_bulk_volume_unit" : "ml",
  //   "bulk_volume" : "",
  //   "bulk_volume_ratio_type" : "",
  //   "sample_viscosity" : "",
  //   "sample_hardness" : "",
  //   "sample_sg" : "",
  //   "sample_ratio" : "",
  //   "sample_ratio_type" : "vol",
  //   "sample_significant" : "",
  //   "sample_etc" : "",
  //   "sample_remark" : ""
  // });


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
   * 자재유형 대분류 Mock 데이터
   */
  const materialLargeCategory = [
    {"id" : 0, "label" : "대분류", "value" : ""},
    {"id" : 1, "label" : "JAR(패드)", "value" : "JAR(패드)"},
    {"id" : 2, "label" : "그라인딩", "value" : "그라인딩"},
    {"id" : 3, "label" : "딥튜브펌프", "value" : "딥튜브펌프"},
    {"id" : 4, "label" : "에어리스", "value" : "에어리스"},
    {"id" : 5, "label" : "에어로졸", "value" : "에어로졸"},
    {"id" : 6, "label" : "쿠션", "value" : "쿠션"},
    {"id" : 7, "label" : "파우더", "value" : "파우더"},
    {"id" : 8, "label" : "파우치", "value" : "파우치"},
    {"id" : 9, "label" : "스포이드", "value" : "스포이드"}
  ];
  

  /**
   * 자재유형 중분류 Mock 데이터
   */
  const materialMediumCategory = [
    {"id" : 0, "label" : "튜브", "value" : "튜브"},
    {"id" : 1, "label" : "용기", "value" : "용기"},
    {"id" : 2, "label" : "뚜껑", "value" : "뚜껑"},
    {"id" : 3, "label" : "라벨", "value" : "라벨"},
    {"id" : 4, "label" : "박스", "value" : "박스"},
    {"id" : 5, "label" : "기타", "value" : "기타"},
    {"id" : 6, "label" : "직접입력", "value" : "직접입력"}
  ];


  /**
   * CT 유형
   */
  const ctTypeOptions = [
    {"id" : 0, "label" : "전체", "value" : "ALL"},
    {"id" : 1, "label" : "고객사", "value" : "CLIENT"},
    {"id" : 2, "label" : "부분", "value" : "PART"},
  ];


  /**
   * 제형 담당 부서 Mock 데이터
   */
  const sampleManageDepartment = [
    {"id" : 0, "label" : "전체", "value" : ""},
    {"id" : 1, "label" : "CCM1팀", "value" : "CCM1"},
    {"id" : 2, "label" : "CCM2팀", "value" : "CCM2"},
    {"id" : 3, "label" : "CCM3팀", "value" : "CCM3"},
    {"id" : 4, "label" : "CCB1팀", "value" : "CCB1"},
    {"id" : 5, "label" : "CCB2팀", "value" : "CCB2"},
    {"id" : 6, "label" : "CCS1팀", "value" : "CCS1"},
    {"id" : 7, "label" : "CCS2팀", "value" : "CCS2"},
    {"id" : 8, "label" : "CCS3팀", "value" : "CCS3"},
    {"id" : 9, "label" : "CCS4팀", "value" : "CCS4"},
    {"id" : 10, "label" : "향료팀", "value" : "FRAG"}
  ];


  /**
   * 벌크 용량 단위
   */
  const bulkUnit = [
    {"id" : 0, "label" : "ml", "value" : "ml"},
    {"id" : 1, "label" : "g", "value" : "g"}
  ];


  /**
   * 제형유형
   */
  const sampleType = [
    {"id" : 0, "label" : "일반", "value" : "lv1"},
    {"id" : 1, "label" : "2층상", "value" : "lv2"}
  ];


  /**
   * 부피비, 무게비 구분
   */
  const ratioType = [
    {"id" : 0, "label" : "부피비", "value" : "vol"},
    {"id" : 1, "label" : "무게비", "value" : "wgt"}
  ];
  
  /**
   * findData_ERP : 필터 조건에 따른 ERP 기본 데이터를 조회
   * 
   * @param e : 이벤트 호출 컴포넌트
   * @param {String} type : 필터 조건
   */
  const findData_ERP = (e, type) => {
    // 구현
    console.log("type : " + type);
  };


  /**
   * 유효성 검즘 state - 조회 조건 입력 시 날짜 검증 등에 사용.
   */
  const [isValidated, setIsValidated] = useState(true);


  /**
   * CT 폼 초기화 함수
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
   * 제형(의뢰) 제형 정보 입력 행
   */
  const [rows, setRows] = useState([{
    "id" : 0,
    "name" : "pre_rm_0_name",
    "amount" : "pre_rm_0_amount",
    "nameValue" : "",
    "amountValue" : ""
  }]);
  // const [rows, setRows] = useState([{
  //   "id":0
  //   ,"name":""
  //   ,"amount":""
  //   ,"nameValue":""
  //   ,"amountValue":""
  // }]);

  /**
   * addRow : 제형(의뢰) 기타 특이사항 입력 행 추가 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const addRow = (e) => {
    e.preventDefault();
    console.log("---addRow---")

    const newValue = rows.length + 1;
    console.log("newValue : ", newValue);
    
    const newRow = {
      "id" : newValue,
      "name" : `pre_rm_${newValue}_name`,
      "amount" : `pre_rm_${newValue}_amount`,
      "nameValue" : "",
      "amountValue" : ""
    };

    setRows(prev => [...prev, newRow]);
  }

  /**
   * ■ 추가된 동적 원료 행 삭제
   * @param {*} e : 
   * @param {*} id 
   */
  const delRow = (e, id) => {
    e.preventDefault();
    console.log("📌 e Status 확인 : ", e);
    console.log("📌 delRow Activated");

    setRows(prev => {
      if (prev.length == 1) return prev;
      return prev.filter(row => row.id !== id)
      }
    );
    setRmForm(prev => {
      return prev.filter(row => row.id !== id);
    });
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

  /*  ################################################
  #   ______                __           __
  #  / ____/_______  ____ _/ /____  ____/ /
  # / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #/ /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #\____/_/   \___/\__,_/\__/\___/\__,_/   
  # Created : 2025.01.23
  # Author : Choi Yeon Woong
  # Description : 방부력테스트 [등록] 로직
  # Modified : 
  ################################################ */

  /**
  * goToPage : 페이지 이동 함수
  */
  const goToPage = useUrlNavigation();

  /**
 * handleClassification, handleSampleInfo
 * @description 샘플정보 선택시 state 및 프론트 변경
 */
  const [classification, setClassification] = useState(0);
  const [sampleInfo, setSampleInfo] = useState(0);
  const handleClassification = (e) => {
    const { name, value } = e.target;
    console.log("[Preservative] classification clicked : ", value);
    setClassification(value);
    setPreForm((prev) => ({ ...prev, [name]: value}));
    // handleLotNo(e);
  }

  const handleSampleInfo = (e) => {
    const { name, value } = e.target;
    setSampleInfo(value);
    setPreForm((prev) => ({ ...prev, [name]: value, ['pre_must_value']: rule.mustValue }));
  }

  /**
   * Classification / sampleInfo
   * Description : 구분값, 샘플정보에 따른 로직 변경
   */
  const lotNoClassName = "preservative-create-lotNoClass";
  const labNoClassName = "preservative-create-labNoClass";
  const lotNoMust = "preservative-create-lotNoMust";
  const labNoMust = "preservative-create-labNoMust";
  const enableMust = "preservative-create-enableMust";

  const DEFAULT_RULE = {
    lotNoDisabled: true,
    labNoDisabled: true,
    lotNoClass: lotNoClassName,
    labNoClass: labNoClassName,
    lotNoMust: lotNoMust,
    labNoMust: labNoMust,
    enableMust: enableMust
  };

  const RULE_MAP = {
    "0": {  // 코스메카코리아
      "0": {    // 연구소샘플
        lotNoDisabled: true,
        labNoDisabled: false,
        lotNoClass: lotNoClassName,
        labNoClass: "",
        lotNoMust: "",
        labNoMust: enableMust,
        mustValue: "lab"
      },
      "1": {    // 벌크, 완제품
        lotNoDisabled: false,
        labNoDisabled: false,
        lotNoClass: "",
        labNoClass: "",
        lotNoMust: enableMust,
        labNoMust: enableMust,
        mustValue: "both"
      },
    },
    "1": {  // 코스메카차이나 / 잉글우드랩 / 기타
      "0": {    // 연구소샘플
        lotNoDisabled: true,
        labNoDisabled: false,
        lotNoClass: lotNoClassName,
        labNoClass: "",
        lotNoMust: "",
        labNoMust: enableMust,
        mustValue: "lab"
      },
      "1": {    // 벌크, 완제품
        lotNoDisabled: false,
        labNoDisabled: true,
        lotNoClass: "",
        labNoClass: labNoClassName,
        lotNoMust: enableMust,
        labNoMust: "",
        mustValue: "lot"
      },
    },
    "2": {  // 안정도 대응
      "0": {    // 연구소샘플
        lotNoDisabled: true,
        labNoDisabled: false,
        lotNoClass: lotNoClassName,
        labNoClass: "",
        lotNoMust: "",
        labNoMust: enableMust,
        mustValue: "lab"
      },
      "1": {    // 벌크, 완제품
        lotNoDisabled: false,
        labNoDisabled: true,
        lotNoClass: "",
        labNoClass: labNoClassName,
        lotNoMust: enableMust,
        labNoMust: "",
        mustValue: "lot"
      },
    },
  };
  
  const rule = useMemo (() => {
    console.log(RULE_MAP?.[classification]?.[sampleInfo] ?? DEFAULT_RULE);

    return RULE_MAP?.[classification]?.[sampleInfo] ?? DEFAULT_RULE;
  }, [classification, sampleInfo]);

  // const date = new Date();
  // const year = date.getFullYear();
  // const month = String(date.getMonth()+1).padStart(2,'0');
  // const day = date.getDate();
  // const today = `${year}-${month}-${day}`;

  /**
   * @name : sheetPagesRef
   * @description : [방부력테스트-등록] submit시 시트탭 컴포넌트 참조용
   */
  const sheetPagesRef = useRef(null);

  /**
   * @name : [방부력테스트-등록] preForm
   * @description : [방부력테스트-등록] 폼 등록시 State 정의
   */
  const [preForm, setPreForm] = useState({
    "pre_class" : 0                                 // 클래스구분값
    ,"pre_doc_no" : ""                              // [기본정보]문서번호
    ,"pre_reg_date" : G_TODAY                       // [기본정보]의뢰등록일
    ,"pre_reg_user" : userName                      // [기본정보]의뢰등록자
    ,"pre_cust_name" : ""                           // [기본정보]고객사명
    ,"pre_sample_info" : 0                          // [기본정보]샘플정보
    ,"pre_source" : "I"                             // [기본정보]시험기관
    ,"pre_item_name" : ""                           // [기본정보]품명
    ,"pre_lot_no" : ""                              // [기본정보]LotNo.
    ,"pre_lab_no" : ""                              // [기본정보]LabNo.
    ,"pre_lab_ver" : ""                             // [기본정보]LabNo 차수
    ,"pre_remark_duple" : ""                        // [기본정보]중복사유
    ,"pre_remark_reason" : ""                       // [기본정보]사유

    ,"pre_stability_time_point" : ""                // [안정도대응]Time Point
    ,"pre_stability_conditions" : ""                 // [안정도대응]Condition        
    ,"pre_stability_type" : ""                      // [안정도대응]Packaging Type
    ,"pre_stability_remark" : ""                    // [안정도대응]비고
    ,"pre_stability_volume" : ""                    // [안정도대응]Volume 
    ,"pre_stability_volume_unit" : ""               // [안정도대응]Volume Unit

    ,"pre_sample_item_type" : 5                     // [샘플정보]제품유형(W/O)
    ,"pre_sample_pack_type" : ""                    // [샘플정보]용기유형
    ,"pre_sample_pack_material" : ""                // [샘플정보]용기재질
    ,"pre_sample_volume" : ""                       // [샘플정보]용기용량
    ,"pre_sample_volume_unit" : ""                  // [샘플정보]용기용량(단위)
    ,"pre_sample_manual" : ""                       // [샘플정보]제품사용법
    ,"pre_remark_sample" : ""                       // [샘플정보]비고
    ,"pre_content_water" : 0                        // [샘플정보]water
    ,"pre_content_chelating_agent" : 0              // [샘플정보]chelating agent
    ,"pre_content_surfactant" : 0                   // [샘플정보]surfactant
    ,"pre_content_ethanol" : 0                      // [샘플정보]ethanol
    ,"pre_content_lipid" : 0                        // [샘플정보]lipid
    ,"pre_content_silicone" : 0                     // [샘플정보]silicone
    ,"pre_content_powder" : 0                       // [샘플정보]powder
    ,"pre_content_polyol_sum" : 0                   // [샘플정보]polyol(합계)
    ,"pre_content_glycerine" : 0                    // [샘플정보]glycerine
    ,"pre_content_propanediol" : 0                  // [샘플정보]propanediol
    ,"pre_content_dpg" : 0                          // [샘플정보]dpg
    ,"pre_content_pg" : 0                           // [샘플정보]pg
    ,"pre_content_bg" : 0                           // [샘플정보]bg
    ,"pre_content_ph" : 0                           // [샘플정보]ph
    ,"pre_content_etc" : 0                          // [샘플정보]기타

    ,"pre_test_date_start" : null                   // [시험결과판정]시험시작일
    ,"pre_test_date_expect" : null                  // [시험결과판정]시험완료예정일
    ,"pre_test_date_end" : null                     // [시험결과판정]시험완료일
    ,"pre_test_user" : ""                           // [시험결과판정]시험담당자
    ,"pre_test_result_interm" : null                // [시험결과판정]중간결과
    ,"pre_test_result_final" : null                 // [시험결과판정]최종결과
    ,"pre_test_remark" : ""                         // [시험결과판정]비고
    ,"pre_status" : 0                               // [시험결과판정]상태값(숫자)
    ,"pre_status_kr" : ""                           // [시험결과판정]상태값(국문)
    // ,"pre_is_start": ""                             // [시험결과판정]시험중
    // ,"pre_is_fin": ""                               // [시험결과판정]시험완료

    ,"pre_last_date" : ""                           // 마지막저장일
    ,"pre_last_user" : ""                           // 마지막저장인원

    // ,"pre_test_status" : ""                         // 상태값저장

    ,"pre_must_value": rule.mustValue               // 필수값체크
  });

  
  const [sheetData, setSheetData] = useState({
      // ↓↓↓↓↓ sheetData state 예시 ↓↓↓↓↓
      // ["sheet1"] : {
      //     1|dateStart : {
      //         row: e.target.id
      //         ,name: e.target.name
      //         ,value: e.target.value
      //     },
      //     2|dateStart : {
      //         row: e.target.id
      //         ,name: e.target.name
      //         ,value: e.target.value
      //     }
      // },
      // ["sheet2"] : {
      //     1|dateStart : {
      //         row: e.target.id
      //         ,name: e.target.name
      //         ,value: e.target.value
      //     }
      // }
      // .
      // .
      // .
      // ↑↑↑↑↑ sheetData state 예시 ↑↑↑↑↑
  })
  
  // 첨부파일 State 영역
  const [files, setFiles] = useState([]);

  const updateSheetData = (sheetId, partialData) => {
      // setSheetData(prev => ({
      //     ...prev,
      //     [sheetId] : {
      //         ...prev[sheetId],
      //         ...partialData
      //     }
      // }));

      const { row, id, name, value, mode } = partialData;
      // const key = `${row}|${name}`;
      const key = `${id}`;
      const normalized = {
        ...partialData,
        id: key,
        name: `pre_${key}`
      };

      setSheetData(prev => ({
        // console.log(`prev : ${JSON.stringify(prev)}`);
        
          ...prev,
          [sheetId] : {
              ...(prev[sheetId] ?? {}),
              [key] : {
                  ...(prev[sheetId]?.[key] ?? {}),
                  ...normalized,
              }
          }
      }));
  }


  /**
   * ■ 방부력테스트 모드 선택 useEffect
   * @name : 
   */
  useEffect(() => {
    if(mode === "update") {getPreDetail();}
    else {}
  }, []);


  /**
   * ■ 방부력테스트 필수값 체크용 state 변경
   * @name : [방부력테스트-등록] pre_must_value 변경을 위한 useEffect
   * @description pre_must_value 값 변경을 통해 에러메시지 구분
   */
  useEffect(() => {
    setPreForm((prev) => ({ ...prev, ['pre_must_value']: rule.mustValue }))

  }, [classification, sampleInfo]);

  /**
   * @name : [방부력테스트-등록] rowForm
   * @description : [방부력테스트-등록] 동적 생성 input 제어용 state 정의
   */
  const [rmForm, setRmForm] = useState([{
    "id" : 0
    ,"name" : ""
    ,"value" : ""
  }]);
  
  /**
   * handleInput : input 값 변경 시 form 객체에 데이터 바인딩
   * 
   * @param e : 이벤트 호출 컴포넌트
   * @param {string || null} option : 체크박스 선택값
   */
  const handleInput = (e, option = null) => {

    const { name, type, value, checked } = e.target;
      if (type === "checkbox") {
          setPreForm((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
          console.log(preForm);
          return;
      } else if (type === "radio") {
          setClassification(value);
          setPreForm((prev) => ({ ...prev, [name]: value }));
          return;
      } else {
          setPreForm((prev) => ({ ...prev, [name]: value }));
          console.log(preForm);
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
   */
  const handleStatus = (e) => {
    const { name, value, dataset } = e.target;
    const status = dataset.status;
    const sValue = dataset.value;

    switch(sValue) {
      case "1" :
        setPreForm((prev) => ({ ...prev, [name]: value, [status]: sValue}));
        break;

      case "2" :
        if (preForm?.pre_status != "2"){
          setPreForm((prev) => ({ ...prev, [name]: value, [status]: sValue, ["pre_test_date_end"]: G_TODAY }));
          alert(`🆗 시험이 완료 처리 되었습니다.`);
        } 
          else {
            setPreForm((prev) => ({ ...prev, [name]: value, [status]: "1", ["pre_test_date_end"]: "" }));
            alert(`❌ 시험 완료 취소 처리 되었습니다.`);
        }
        // preForm?.pre_status != "2"
        //   ? setPreForm((prev) => ({ ...prev, [name]: value, [status]: sValue, ["pre_test_date_end"]: G_TODAY }))
        //   : setPreForm((prev) => ({ ...prev, [name]: value, [status]: "1", ["pre_test_date_end"]: "" }))
        break;
    }
    console.log(`\n-- Form : ${JSON.stringify(preForm)}`);

    return;
  }

  /**
   * @name : saveRequest
   * @function : 버튼 클릭 시 body 내용 API 전송
   * @body : handleInput 이벤트를 통해 누적된 state 값
   *        1) 기본정보 : preForm
   *        2) 원료정보 : rmForm
   *        3) 
   */
  const saveRequest = async (e) => {
    e.preventDefault();

    const formState = preForm;
    const rmState = rmForm;
    // const sheetState = sheetPagesRef.current?.getSheetData?.() ?? {};
    // const fileState = sheetPagesRef.current?.getFiles?.() ?? {};
    const sheetState = sheetData;
    const fileState = files;
    console.log("[formState] : ", formState);
    console.log("[rmState] : ", rmState);
    console.log("[sheetState] : ", sheetState);
    console.log("[fileState] : ", fileState);
    
    const fileMeta = fileState.map(f => ({
      name: f.name
      ,size: f.size
      ,type: f.type
      ,lastModified: f.lastModified
      ,lastModifiedDate: f.lastModifiedDate
    }));

    const baseUrl = "/api/v2/ltms/preservative/request";
    let targetUrl = "";

    switch(mode) {
      case "create" : targetUrl = baseUrl + "/create"; break;
      case "update" : targetUrl = `${baseUrl}/create?mode=update&request_id=${url.query.request_id}`; break;
      case "" : alert("잘못된 요청입니다."); return;
      default : alert("잘못된 요청입니다."); return;
    }

    console.log("📌 targetUrl : ", targetUrl);

    // ■ 파일 폼데이터화
    const fd = new FormData();

    
    // ■ 파일정리 1) 기존 파일 JSON 으로 폼데이터화
    const keepFiles = fileState
      .filter(x => !(x instanceof File))
      .map(x => ({
        request_id: x.request_id
        ,file_id: x.file_id
        ,name: x.name
        ,serl: x.serl
        ,type: x.type
        ,dir: x.dir
    }));

    fd.append("keepFiles", JSON.stringify(keepFiles));
    console.log(`📌 keepFiles : ${keepFiles}`);

    // ■ 파일정리 2) 새로운 파일 파일 객체로 폼데이터화
    fileState
      .filter(x => x instanceof File)
      .forEach(f => fd.append("files", f));

    // fileState.forEach((file) => {
    //   fd.append("files", file);
    // });

    fd.append("sampleInfo", JSON.stringify(preForm));
    fd.append("rmInfo", JSON.stringify(rmForm));
    fd.append("testInfo", JSON.stringify(sheetState));
    fd.append("fileInfo", JSON.stringify(fileState));

    console.log("FD 데이터 : ", fd.getAll("files"));

    // const params = {
    //   sampleInfo: preForm,
    //   rmInfo: rmState,
    //   testInfo: sheetState,
    //   fileInfo: fileState
    // }

    try {
      const request = await axios.post(targetUrl, fd);
      console.log("[Preservative] saveRequest response : ", request);
      alert("저장되었습니다.");
      // goToPage("/preservative/request/read");
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

  const savePhysInfo = async (e) => {
    const targetUrl = "/api/ltms/preservative/request/update";
    const data = preForm;
    try {
      const getId = await axios.get()
      const request = await axios.post(targetUrl, data);
    } catch (err) {
      console.error(err.message);
    }
  }

  /**
   * Error 상태 만들기
   * @name : errorField
   */
  const [errorField, setErrorField] = useState(null);
  const refs = {
    "pre_lot_no": useRef(),
    "pre_lab_no": useRef(),
    "pre_remark_reason": useRef(),
    "pre_rm_0_name": useRef(),
    "pre_class": useRef(),
    "pre_stability_time_point": useRef(),
    "pre_stability_conditions": useRef()

  }

  const getStatus = (e) => {
    const { name, value } = e.target;
    const field = errorField == name ? "preservative-create-error" : "preservative-create-input";
    // const rule = rule.labNoClass;

    return field;
  }

  /**
   * Polyol 합산 결과 State
   * STATE : sumResult, setSumResult 
   * CALLBACK : handleSum
   * USEMEMO : totalPolyol
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

  // const totalPolyol = useMemo(() => {
  //   return sumResult.glycerine + sumResult.propanediol + sumResult.dpg + sumResult.pg + sumResult.bg + sumResult.etc;
  // }, [sumResult])

  const totalPolyol = useMemo(() => {
    return (Number(preForm?.pre_content_glycerine ?? "") + Number(preForm?.pre_content_propanediol ?? "") + Number(preForm?.pre_content_dpg ?? "") + Number(preForm?.pre_content_pg ?? "") + Number(preForm?.pre_content_bg ?? "") + Number(preForm?.pre_content_etc ?? "")).toFixed(3);
  }, [preForm])

  /**
   * handleTestStartDate
   * Description : 시험시작일 onChange 기능
   * Function : 시험시작일 변동에 따른 7일/14일/28일 계산 후 자동 적용
   */
  const [testStartDate, setTestStartDate] = useState("");
  const handleTestStartDate = (e) => {
    const date = e.target.value;
    console.log("[Preservative] test start date : ", date);
    setTestStartDate(date);
    setTestExpectDate(date);
  }

  const [testExpectDate, setTestExpectDate] = useState("");
  const handleTestExpectDate = (e) => {
    const date = e.target.value;
    console.log("[Preservative] TEST EXPECT END DATE : ", date);
    setTestExpectDate(date);
  }

  /**
   * ■ 방부력테스트 상세 정보 조회
   * @name : getPreDetail
   * @description 상세 정보 조회 후 점프 화면 내 상세 정보 표기
   */
  const getPreDetail = async () => {
    const params = {
      request_id : preRequestId
      // ,company_id: companyId
    };

    const response = await axios.get("/api/v2/ltms/preservative/request/read/detail", { params });
    // console.log(response);
    const data = response.data.data;
    const rmData = response.data.rmData;
    const sheetData = response.data.sheetData;
    const fileData = response.data.fileData;
    console.log("📌 response TEST : ", response);
    console.log("📌 rmData TEST : ", rmData);
    console.log("📌 sheetData TEST : ", sheetData);
    console.log("📌 fileData TEST : ", fileData);

    setPreForm(prev => ({
      ...prev
      ,...data
    }));

    rmData.map((item, idx) => {
      // setRmForm(prev => [
      //   ...prev
      //   ,{
      //     id: idx
      //     ,name: item.itemNo
      //     ,value: item.itemRate
      //   }
      // ]);
      setRmForm(prev => {
        const exists = prev.some(r => r.id == item.idx);
        console.log("is exists : ", exists);
        console.log("기존 rmForm ID : ", prev.id);
        console.log("쿼리 반환된 ID : ", item.id);

        if (exists) {
          return prev.map(v =>
            v.id === idx
              ? {...v, name: item.itemNo, value: item.itemRate}
              : v
          );
        } else {
          return [
            ...prev
            ,{
              id: idx
              ,name: item.itemNo
              ,value: item.itemRate
            }
          ];
        };
      });

      setRows(prev => {
        const next = {
          id: idx,
          name: `pre_rm_${idx}_name`,
          amount: `pre_rm_${idx}_amount`,
          nameValue: item.itemNo,
          amountValue: item.itemRate,
        };

        const exists = prev.some(r => r.id === idx);

        return exists
          ? prev.map(r => (r.id === idx ? { ...r, ...next } : r))
          : [...prev, next];
      });

      // setRows((prev) => ([
      //   ...prev,
      //   {
      //     id: idx
      //     ,name: `pre_rm_${idx}_name`
      //     ,amount: `pre_rm_${idx}_amount`
      //     ,nameValue: item.itemNo
      //     ,amountValue: item.itemRate
      // }]))
    });

    setSheetData(sheetData);

    setFiles(fileData);



    console.log("📌 preForm TEST : ", preForm);
    console.log("📌 rmForm TEST : ", rmForm);
    console.log("📌 sheetData TEST : ", sheetData);
    console.log(`📌 fileData : ${fileData}`);


  }


  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      {/* <CT_SubNav/> */}
      <Preservative_SubNav />
      {/* ↑ 상단 네비게이션 바 ↑ */}

      {/* ↓ 등록 메인 뷰 ↓ */}
      <div className="container">

        {/* ↓ [방부력테스트] 등록 폼 ↓ */}
        <div>
          {/* ↓ [방부력테스트] 폼 타이틀 ↓ */}
          <div className="page-top">
            {/* <h1 className="page-title">{catName} {actName}</h1> */}
          </div>
          {/* ↑ [방부력테스트] 폼 타이틀 ↑ */}
          
          {/* 폼 영역 */}
          <form id="preservative-search-information" className="" onSubmit={(e) => saveRequest(e)}>

            {/* ↓ [방부력테스트] 법인구분 폼 ↓ */}
            <div id="" className="preservative-search-information">

              {/* ↓ [방부력테스트] 법인구분-1번라인 ↓ */}
              <div className="preservative-create-grid-title">◎ 구  분</div>
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="button-field">
                    <input 
                      ref={refs.pre_class}
                      type="radio" 
                      name="pre_class" 
                      id="class_cmk"
                      value="0"
                      checked={preForm?.pre_class == 0 ? 1 : 0}
                      onChange={handleClassification}
                    />
                    <label 
                      for="class_cmk"      
                      className="preservative-create-grid-check-label"
                    >코스메카코리아</label>
                  </div>
                  <div className="button-field">
                    <input 
                      type="radio" 
                      name="pre_class" 
                      id="class_ewlk"
                      value="1"
                      checked={preForm?.pre_class == 1 ? 1 : 0}
                      onChange={handleClassification}
                    />
                    <label for="class_ewlk" className="preservative-create-grid-check-label">코스메카차이나 / 잉글우드랩 / 기타</label>
                  </div>
                  <div className="button-field" style={{paddingLeft: '100px'}}>
                    <input 
                      type="radio" 
                      name="pre_class" 
                      id="class_safety"
                      value="2"
                      checked={preForm?.pre_class == 2 ? 1 : 0}
                      onChange={handleClassification}
                    />
                    <label for="class_safety" className="preservative-create-grid-check-label">안정도 대응</label>
                  </div>
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                  <div className="field" />
                </div>
            </div>
            {/* ↑ [방부력테스트] 법인구분 폼 ↑ */}

            {/* ↓ [방부력테스트] 기본정보 폼 ↓ */}
            {/* <div id="preservative-baseInformation-form" className="search-information"> */}
            <div className="preservative-search-information">

              <div className="preservative-create-grid-title">◎ 기본정보</div>
              {/* ↓ [방부력테스트] 기본정보-1번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <label className="preservative-create-grid-label">문서번호</label>
                    <input 
                      type="text" 
                      readOnly 
                      disabled="true"
                      placeHolder="" 
                      className={lotNoClassName}
                      name="pre_doc_no"
                      onChange={handleInput}
                      value={preForm?.pre_doc_no ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <label className="preservative-create-grid-label">의뢰일</label>
                    <input 
                      type="date" 
                      name="pre_reg_date"
                      value={preForm?.pre_reg_date ?? ""}
                      onChange={handleInput}
                    ></input>
                  </div>
                  <div className="field">
                    <label className="preservative-create-grid-label">샘플의뢰자</label>
                    <input 
                      type="text" 
                      id="" 
                      name="pre_reg_user"
                      onChange={handleInput}
                      value={preForm?.pre_reg_user ?? ""}
                    ></input>
                  </div>
                  <div className="field-Cust">
                    <div className="preservative-create-grid-label">업체명</div>
                    <input 
                      type="text" 
                      id="test" 
                      name="pre_cust_name"
                      onChange={handleInput}
                      value={preForm?.pre_cust_name ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                      <div className="preservative-create-grid-label">샘플정보</div>
                      <select 
                        onChange={handleSampleInfo} 
                        // onChange={handleInput}
                        name="pre_sample_info"
                        value={preForm?.pre_sample_info ?? 0}
                      >
                        <option 
                          value="0"
                        >연구소 샘플</option>
                        <option 
                          value="1"
                        >생산벌크,완제품</option>
                      </select>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">시험기관</div>
                    <select 
                      name="pre_source"
                      onChange={handleInput}
                      value={preForm?.pre_source ?? "I"}
                    >
                      <option value="I">내부</option>
                      <option value="O">외부</option>
                    </select>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                {/* ↑ [방부력테스트] 기본정보-1번라인 ↑ */}
                {/* ↓ [방부력테스트] 기본정보-2번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="double-field">
                      <div className="preservative-create-grid-label">품 명</div>
                      <input 
                        type="text" 
                        name="pre_item_name"
                        onChange={handleInput}
                        value={preForm?.pre_item_name ?? ""}
                      ></input>
                  </div>
                  <div className="field">
                      <div className="preservative-create-grid-label">
                        <span
                          className={rule.lotNoMust}
                        >
                            Lot No.
                        </span>
                      </div>
                      <input 
                        type="text" 
                        id=""
                        name="pre_lot_no"
                        disabled={rule.lotNoDisabled}
                        className={`${rule.lotNoClass} ${errorField == "pre_lot_no" ? "error-background" : "error-to-input"}`}
                        onChange={handleInput}
                        ref={refs.pre_lot_no}
                        value={preForm?.pre_lot_no ?? ""}
                      />
                  </div>
                  <div className="field-LabNo">
                      <div 
                        className="preservative-create-grid-label">
                          <span
                            className={rule.labNoMust}
                            >Lab No.
                          </span>
                      </div>
                      <input 
                        type="text" 
                        id="" 
                        name="pre_lab_no"
                        placeHolder="SDA0278A-260108B"
                        disabled={rule.labNoDisabled}
                        className={`${rule.labNoClass} ${errorField == "pre_lab_no" ? "error-background" : "error-to-input"}`}
                        //   let err = errorField == "pre_lab_no" ? "preservative-create-error" : "preservative-create-input";
                        //   let class_name = rule.labNoClass;

                        //   return err, class_name
                        // }}
                        // className={rule.labNoClass}
                        onChange={handleInput}
                        ref={refs.pre_lab_no}
                        value={preForm?.pre_lab_no ?? ""}
                      />
                      <div className="preservative-create-grid-label-left">ver</div>
                      <input 
                        type="text" 
                        readOnly 
                        placeHolder="01" 
                        name="pre_lab_ver"
                        value={preForm?.pre_lab_ver ?? ""}
                        // onChange={handleInput}
                      ></input>
                  </div>
                  <div className="double-field">
                      <div className="preservative-create-grid-label">중복사유</div>
                      <input 
                        type="text" 
                        id="" 
                        name="pre_remark_duple"
                        onChange={handleInput}
                        value={preForm?.pre_remark_duple ?? ""}
                      ></input>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
              <div className="preservative-create-grid preservative-create-grid-line">
                <div className="double-field">
                  <div className="preservative-create-grid-label preservative-create-must">사 유</div>
                  <input
                    ref={refs.pre_remark_reason}
                    type="text"
                    name="pre_remark_reason"
                    className={errorField == "pre_remark_reason" ? "error-background" : "error-to-input"}
                    onChange={handleInput}
                    value={preForm?.pre_remark_reason ?? ""}
                  ></input>
                </div>
                <div className="field"></div>
                <div className="field"></div>
              </div>
                {/* ↑ [방부력테스트] 기본정보-2번라인 ↑ */}

            </div>
            {/* ↑ [방부력테스트] 기본정보 폼 ↑ */}

            {/* ↓ [방부력테스트] 안정도조건 폼 ↓ */}
            {/* <div id="lab" className="ct-create-information"> */}
            {preForm?.pre_class==2 ? (
              <div className="preservative-search-information">
                <div className="preservative-create-grid-title">◎ 안정도 조건</div>
                  {/* ↓ [방부력테스트] 안정도조건-1번라인 ↓ */}
                  <div className="preservative-create-grid preservative-create-grid-line">
                    <div className="field">
                      <div 
                        className="preservative-create-grid-label"
                      >
                        <span
                          className="preservative-create-must">
                            Time Point
                        </span>
                      </div>
                      <input 
                        ref={refs.pre_stability_time_point}
                        className={errorField=="pre_stability_time_point" ? "error-background" : "error-to-input"} 
                        type="text" 
                        placeHolder="T48M" 
                        name="pre_stability_time_point"
                        onChange={handleInput}
                        value={preForm?.pre_stability_time_point ?? ""}
                      ></input>
                    </div>
                    <div className="field">
                      <div className="preservative-create-grid-label">
                        <span
                          className="preservative-create-must">
                            Conditions
                        </span>
                      </div>
                      <input 
                        ref={refs.pre_stability_conditions}
                        className={errorField=="pre_stability_conditions" ? "error-background" : "error-to-input"} 
                        type="text" 
                        placeHolder="40˚C/75%RH" name="pre_stability_conditions"
                        onChange={handleInput}
                        value={preForm?.pre_stability_conditions ?? ""}
                      ></input>
                    </div>
                    <div className="field">
                      <div className="preservative-create-grid-label">Packaging Type</div>
                      <select 
                        name="pre_stability_type"
                        onChange={handleInput}
                        value={preForm?.pre_stability_type ?? 0}
                      >
                        <option value="0">JAR</option>
                        <option value="1">Tube</option>
                        <option value="2">Pump</option>
                        <option value="3">sheet</option>
                        <option value="4">sachet</option>
                        <option value="99">기타</option>
                      </select>
                    </div>
                    <div className="empty-field">
                      <input 
                        className="" 
                        type="text" 
                        placeHolder="기타체크 시 필수 기재" name="pre_stability_remark"
                        onChange={handleInput}
                        value={preForm?.pre_stability_remark ?? ""}
                      ></input>
                    </div>
                    <div className="select-field">
                      <div className="preservative-create-grid-label">Volume</div>
                      <div></div>
                      <input 
                        className="" 
                        type="text" 
                        placeHolder="000.00" 
                        name="pre_stability_volume"
                        onChange={handleInput}
                        value={preForm?.pre_stability_volume ?? ""}
                      ></input>
                      <select 
                        name="pre_stability_volume_unit"
                        onChange={handleInput}
                        value={preForm?.pre_stability_volume_unit ?? 0}
                      >
                        <option value="0">g</option>
                        <option value="1">kg</option>
                        <option value="2">ml</option>
                        <option value="3">l</option>
                      </select>
                    </div>
                    <div className="field"></div>
                    <div className="field"></div>
                    <div className="field"></div>
                  </div>
                  {/* ↑ [방부력테스트] 안정도조건-1번라인 ↑ */}
                  {/* ↑ [방부력테스트] 안정도조건 폼 ↑ */}
              </div>
              
            ) : ""}

            {/* ↓ [방부력테스트] 샘플정보 폼 ↓ */}
            {/* <div id="lab" className="ct-create-information"> */}
            <div className="preservative-search-information">
              <div className="preservative-create-grid-title">◎ 샘플 정보</div>
                {/* ↓ [방부력테스트] 샘플정보-1번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">제품 유형</div>
                    <select 
                      name="pre_sample_item_type"
                      onChange={handleInput}
                      value={preForm?.pre_sample_item_type ?? 0}
                    >
                      <option value="0">W/O</option>
                      <option value="1">O/W</option>
                      <option value="2">O/W/O</option>
                      <option value="3">W/O/W</option>
                      <option value="4">W/S</option>
                      <option value="5" selected>무수</option>
                      <option value="99">기타</option>
                    </select>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">pH</div>
                    <input 
                      type="text" 
                      placeHolder="14.00" 
                      name="pre_content_ph"
                      onChange={handleInput}
                      value={preForm?.pre_content_ph ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">용기 유형</div>
                    <input 
                      type="text" 
                      placeHolder="JAR" 
                      name="pre_sample_pack_type"
                      onChange={handleInput}
                      value={preForm?.pre_sample_pack_type ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">용기 재질</div>
                    <input 
                      type="text" 
                      placeHolder="00.00" 
                      name="pre_sample_pack_material"
                      onChange={handleInput}
                      value={preForm?.pre_sample_pack_material ?? ""}
                    ></input>
                  </div>
                  <div className="select-field">
                    <div className="preservative-create-grid-label">제품 용량</div>
                    <div></div>
                    <input 
                      type="text" 
                      placeHolder="14.00" 
                      name="pre_sample_volume"
                      onChange={handleInput}
                      value={preForm?.pre_sample_volume ?? ""}
                    ></input>
                    <select 
                      name="pre_sample_volume_unit"
                      onChange={handleInput}
                      value={preForm?.pre_sample_volume_unit ?? 0}
                    >
                      <option value="0">g</option>
                      <option value="1">kg</option>
                      <option value="2">ml</option>
                      <option value="3">l</option>
                    </select>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                {/* ↑ [방부력테스트] 샘플정보-1번라인 ↑ */}
                {/* ↓ [방부력테스트] 샘플정보-2번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">제품 사용법</div>
                    <input 
                      type="text" 
                      placeHolder="내용 기재" 
                      name="pre_sample_manual"
                      onChange={handleInput}
                      value={preForm?.pre_sample_manual ?? ""}
                    ></input>
                  </div>
                  <div className="field"></div>
                </div>
                {/* ↑ [방부력테스트] 샘플정보-2번라인 ↑ */}
                {/* ↓ [방부력테스트] 샘플정보-3번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">비 고</div>
                    <input 
                      type="text" 
                      placeHolder="내용 기재" 
                      name="pre_remark_sample"
                      onChange={handleInput}
                      value={preForm?.pre_remark_sample ?? ""}
                    ></input>
                  </div>
                  <div classNam="field"></div>
                </div>
                {/* ↑ [방부력테스트] 샘플정보-3번라인 ↑ */}
                {/* ↓ [방부력테스트] 샘플정보-4번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">Water</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_water"
                      onChange={handleInput}
                      value={preForm?.pre_content_water ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Chelating
                     agent</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_chelating_agent"
                      onChange={handleInput}
                      value={preForm?.pre_content_chelating_agent ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Surfactant</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_surfactant"
                      onChange={handleInput}
                      value={preForm?.pre_content_surfactant?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Ethanol</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_ethanol"
                      onChange={handleInput}
                      value={preForm?.pre_content_ethanol?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Lipid</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_lipid"
                      onChange={handleInput}
                      value={preForm?.pre_content_lipid ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Silicone</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_silicone"
                      onChange={handleInput}
                      value={preForm?.pre_content_silicone ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Powder</div>
                    <input 
                      type="number" 
                      placeHolder="00.00" 
                      name="pre_content_powder"
                      onChange={handleInput}
                      value={preForm?.pre_content_powder ?? ""}
                    ></input>
                  </div>
                  <div className="field"></div>
                </div>
                {/* ↑ [방부력테스트] 샘플정보-4번라인 ↑ */}
                {/* ↓ [방부력테스트] 샘플정보-5번라인 ↓ */}
                {/* <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">Lipid</div>
                    <input type="text" placeHolder="00.00"></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Silicone</div>
                    <input type="text" placeHolder="00.00"></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Powder</div>
                    <input type="text" placeHolder="00.00"></input>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div> */}
                {/* ↑ [방부력테스트] 샘플정보-5번라인 ↑ */}
                {/* ↓ [방부력테스트] 샘플정보-6번라인 ↓ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">Polyol</div>
                    <input 
                        name="pre_content_polyol_sum"
                        type="text" 
                        placeHolder="00.00" 
                        readOnly
                        value={totalPolyol}
                        style={{ background: 'gainsboro'}}
                        onChange={handleInput}
                    ></input>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                {/* ↑ [방부력테스트] 샘플정보-6번라인 ↑ */}
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">Glycerine</div>
                    <input
                        type="number" 
                        placeHolder="00.00"
                        name="pre_content_glycerine"
                        onChange={handleInput}
                        value={preForm?.pre_content_glycerine ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">Propanediol</div>
                    <input 
                        type="number" 
                        placeHolder="00.00"
                        name="pre_content_propanediol"
                        onChange={handleInput}
                        value={preForm?.pre_content_propanediol ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">DPG</div>
                    <input 
                        type="number" 
                        placeHolder="00.00"
                        name="pre_content_dpg"
                        onChange={handleInput}
                        value={preForm?.pre_content_dpg ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">PG</div>
                    <input 
                        type="number" 
                        placeHolder="00.00"
                        name="pre_content_pg"
                        onChange={handleInput}
                        value={preForm?.pre_content_pg ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">BG</div>
                    <input 
                        type="number" 
                        placeHolder="00.00"
                        name="pre_content_bg"
                        onChange={handleInput}
                        value={preForm?.pre_content_bg ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">기타</div>
                    <input 
                        type="number" 
                        placeHolder="00.00"
                        name="pre_content_etc"
                        onChange={handleInput}
                        value={preForm?.pre_content_etc ?? ""}
                    ></input>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
            </div>
            </div>
            {/* ↓ [방부력테스트] 방부제 성분 정보 폼 ↓ */}
            <div className="preservative-search-information">
              <div className="preservative-create-grid-title">◎ 방부제 성분 정보</div>
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="button-field">
                    <div></div>
                    <div className="preservative-create-grid-label-center preservative-create-must">원료명</div>
                    <div className="preservative-create-grid-label-center">함 량</div>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                {rows.map(row => (
                  <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="button-field">
                    <button 
                      className="preservative-create-add-button" 
                      onClick={(e) => {addRow(e)}}>
                        +
                    </button>
                    <input 
                      ref={refs.pre_rm_0_name}
                      id={row.id} 
                      name={row.name} 
                      value={rmForm.find(item => item.id === row.id)?.name || ""}
                      type="text"
                      onChange={(e) => handleRmInput(row.id, row.name, e)}
                      className={errorField == row.name ? "error-background" : "error-to-input"}
                    ></input>
                    <input 
                      id={row.id} 
                      name={row.amount} 
                      value={rmForm.find(item => item.id === row.id)?.value || ""}  
                      type="text"
                      onChange={(e) => handleRmInput(row.id, row.name, e)}
                    ></input>
                    <button 
                      className="preservative-create-del-button" 
                      onClick={(e) => {delRow(e, row.id)}}>
                        -
                    </button>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                ))}
            </div>
            {/* ↑ [방부력테스트] 방부제 성분 정보 폼 ↑ */}
            {/* ↓ [방부력테스트] 시험 결과 판정 폼 ↓ */}
            <div className="preservative-search-information">
              <div className="preservative-create-grid-title">◎ 시험 결과 판정</div>
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">시험 시작일</div>
                    <input 
                      className={preForm?.pre_status == "2" ? "preservative-create-labNoClass" : ""}
                      disabled={preForm?.pre_status == "2" ? true : false} 
                      type="date"
                      id="preservative-testStartDate"
                      name="pre_test_date_start"
                      // value={preForm?.pre_test_date_start ?? today}
                      onChange={handleStatus}
                      data-status="pre_status"
                      data-value="1"
                      value={preForm?.pre_test_date_start ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">시험 완료 예정일</div>
                    <input 
                      className={
                        preForm?.pre_status == "2" 
                        ? "preservative-create-labNoClass" 
                        : ""}
                      disabled={preForm?.pre_status == "2" 
                        ? true 
                        : false} 
                      type="date"
                      name="pre_test_date_expect"
                      // value={testExpectDate ? testExpectDate : testStartDate}
                      onChange={handleInput}
                      value={preForm?.pre_test_date_expect ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">시험 완료일</div>
                    <input 
                      className={preForm?.pre_status == "2" ? "preservative-create-labNoClass" : ""}
                      disabled={preForm?.pre_status == "2" ? true : false} 
                      type="date"
                      name="pre_test_date_end"
                      onChange={handleInput}
                      value={preForm?.pre_test_date_end ?? ""}
                    ></input>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">시험담당자</div>
                    <input 
                      className={preForm?.pre_status == "2" ? "preservative-create-labNoClass" : ""}
                      disabled={preForm?.pre_status == "2" ? true : false} 
                      type="text" 
                      name="pre_test_user"
                      onChange={handleInput}
                      value={preForm?.pre_test_user ?? ""}
                    ></input>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">중간 결과</div>
                    <select 
                      className={preForm?.pre_status == "2" ? "preservative-create-labNoClass" : ""}
                      disabled={preForm?.pre_status == "2" ? true : false} 
                      name="pre_test_result_interm"
                      onChange={handleInput}
                      value={preForm?.pre_test_result_interm ?? ""}
                    >
                      <option value=""></option>
                      <option value="1">적합</option>
                      <option value="0">부적합</option>
                    </select>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label">최종 결과</div>
                    <select 
                      className={preForm?.pre_status == "2" ? "preservative-create-labNoClass" : ""}
                      disabled={preForm?.pre_status == "2" ? true : false} 
                      name="pre_test_result_final"
                      onChange={handleInput}
                      value={preForm?.pre_test_result_final ?? ""}
                    >
                      <option value=""></option>
                      <option value="1">적합</option>
                      <option value="0">부적합</option>
                    </select>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label"></div>
                    <button
                      type="button"
                      onClick={handleStatus}
                      data-status="pre_status"
                      data-value="2"
                    >시험완료/취소</button>
                  </div>
                  <div className="field">
                    <div className="preservative-create-grid-label"></div>
                    <button>서류 작성</button>
                  </div>
                  <div className="field"></div>
                  <div className="field"></div>
                  <div className="field"></div>
                </div>
                <div className="preservative-create-grid preservative-create-grid-line">
                  <div className="field">
                    <div className="preservative-create-grid-label">비 고</div>
                    <textarea 
                      className={preForm?.pre_status == "2" ? "preservative-create-labNoClass" : ""}
                      disabled={preForm?.pre_status == "2" ? true : false} 
                      type="text" 
                      name="pre_test_remark"
                      onChange={handleInput}
                      value={preForm?.pre_test_remark ?? ""}
                    ></textarea>
                  </div>
                </div>
            {/* </div> */}
            {/* ↑ [방부력테스트] 시험 결과 판정 폼 ↑ */}
            {/* ↓ [방부력테스트] 시험 결과 판정 폼 ↓ */}
            {/* <div className="preservative-create-form"> */}
              {/* <div className="preservative-create-grid-title">◎ 시험 결과 판정</div> */}
                {/* <div className="preservative-create-grid preservative-create-grid-line"> */}
                  <Preservative_SheetPages 
                    date={preForm?.pre_test_date_start ?? G_TODAY}
                    ref={sheetPagesRef}
                    mode={mode}
                    sheetData={sheetData}
                    updateSheetData={updateSheetData}
                    files={files}
                    setFiles={setFiles}
                  />
                  {/* <div className="preservative-create-grid preservative-create-grid-line">
                    <div 
                      className="empty-field" 
                      style={{paddingLeft:'20px'}}>
                      <div>📌 가이드라인 : <span style={{color: 'red'}}>ISO 11930</span> </div>
                      <div>📌 판정기준</div>
                      <div style={{paddingLeft:'20px'}}>
                        <span style={{color:'red'}}>① Bacteria(박테리아): 99.9% 이상 사멸(7일차)</span>
                      </div>
                      <div style={{paddingLeft:'20px'}}>
                        <span style={{color:'red'}}>② Yeast(효모): 90.0% 이상 사멸(7일차)</span>
                      </div>
                      <div style={{paddingLeft:'20px'}}>
                        <span style={{color:'red'}}>③ Mold(곰팡이): 90.0% 이상 사멸(28일차)</span>
                      </div>
                    </div>
                  </div> */}

                {/* </div> */}
                {/* <div className="page">
                  <h1 className="h1">엑셀 시트 탭 UI</h1>
                  <div className="wrapper">
                    <div className="tab-row">
                      <button></button>
                    </div>
                  </div>
                </div> */}
            </div>
            <div className="">
              <button onClick={(e) => saveRequest(e)}>저장</button>
            </div>


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