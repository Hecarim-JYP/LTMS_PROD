/**
 * 파일명 : CT_Request_Create.jsx
 * 용도 : CT 의뢰 등록
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect, useMemo, useContext } from "react";

import axios from "axios";

import CT_SubNav from "/src/modules/CT/CT_SubNav";
import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";

export default function CT_Request_Create() {


  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY; // 오늘 날짜
  const G_STARTDAY = Common.G_STARTDAY; // 오늘로부터 7일
  const url = useUrlInfo(); // 커스텀 훅 - URL 정보 관리
  const ctRequestId = url.query.ct_request_id || ""; // CT 의뢰 ID (수정 모드일 경우 URL 파라미터로 전달됨)
  const mode = url.query.mode ? url.query.mode : "create"; // 화면 모드 (create / update)

  /**
   * 사용자 정보 컨텍스트
   */
  const { user } = useContext(AuthContext);
  const companyId = user.company_id; // 회사 ID
  const userId = user.user_id; // 사용자 ID

  /**
   * goToPage : 페이지 이동 함수
   */
  const goToPage = useUrlNavigation();


  /**
   * 페이지 그룹 전역 변수
   * 화면 사이즈가 작아 5로 수정 (기존 10)
   * 값 수정 시 compactPages useMemo 내부 로직도 함께 수정 필요
   */
  const G_PAGEGROUPCOUNT = 5;

  // 접수 현황 데이터
  const statusOptions = [
    {"label" : "요청", "value" : "REQUESTED"},
    {"label" : "진행 중", "value" : "IN_PROGRESS"},
    {"label" : "완료", "value" : "COMPLETED"},
    {"label" : "보류", "value" : "SUSPENDED"},
    {"label" : "취소", "value" : "CANCELLED"},
  ];
  

  /**
   * --- API 통신에 사용될 state 객체 ---
   * loading, setLoading : request 요청 응답 여부
   * ctRequests, setCtRequests : CT 의뢰 목록 데이터 (차수 조회 모달에서 사용)
   */
  const [loading, setLoading] = useState(null);
  const [ctRequests, setCtRequests] = useState([]);

  /* ============================== 훅 관리 ============================== */
  /**
   * ----- 자재유형 중분류 커스텀 셀렉트박스 -----
   * isDropdownOpen, setIsDropdownOpen : 커스텀 셀렉트박스 활성화 여부
   * dropdownPosition, setDropdownPosition : 커스텀 셀렉트박스 위치 관리
   * refCustomSelectBox : 커스텀 셀렉트 박스 컴포넌트 참조
   */
  /* 미사용 처리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const refCustomSelectBox = useRef(null);
  */


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
  const [ctForm, setCtForm] = useState({
    "ct_request_id" : "",                 // 의뢰 ID (PK)
    "ct_request_date" : G_TODAY,          // 의뢰일
    "ct_no" : "",                         // CT 번호
    "ct_test_seq" : "",                   // CT 차수
    "client_id" : "",                     // 고객사 ID
    "client_name" : "",                   // 고객사명
    "sample_id" : "",                     // 샘플 ID
    "sample_name" : "",                   // 샘플명
    "ct_lab_no" : "",                     // CT 랩넘버
    "sales_manager_id" : "",              // 영업담당자 ID
    "sales_manager_name" : "",            // 영업담당자명
    "labs_manage_department_id" : "",     // 제형관리부서 ID
    "labs_manage_department_name" : "",   // 제형관리부서명
    "labs_manager_id" : "",               // 제형담당자 ID
    "labs_manager_name" : "",             // 제형담당자명
    "ct_type" : "",                       // CT 유형 (고객사/부분)
    "material_supplier_id" : "",          // 자재 업체 ID
    "material_supplier_name" : "",        // 자재 업체명
    "material_large_category_id" : "",    // 자재 유형 대분류 ID
    "material_sub_category" : "",        // 자재 유형 중분류
    "material_description" : "",          // 자재 재질 정보
    "material_quantity" : 0,              // 자재 수량
    "sample_quantity" : 0,                // 샘플 수량
    "desired_volume" : 0,                 // 희망 용량
    "desired_volume_unit_id" : 1,         // 희망 용량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
    "sleeve_length" : "",                 // 튜브 고객사 요청 길이
    "is_cutting" : 0,                     // 컷팅 여부
    "is_include_tube" : 0,                // 튜브 포함 여부
    "is_emergency" : 0,                   // 긴급여부
    "is_cpnp" : 0,                        // CPNP여부
    "is_eng" : 0,                         // 영문여부
    "request_content" : "",               // 의뢰내용
    "request_remark" : "",                // 의뢰 비고
    "material_request_date" : "",         // 자재 요청일
    "sample_type_id" : 6,                 // 샘플 층상 유형 ID (기본값 "lv1") [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
    "required_bulk_volume" : 0,           // 필요 벌크 용량
    "required_bulk_volume_unit_id" : 1,   // 필요 벌크 용량 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
    "request_bulk_volume" : 0,            // 의뢰 벌크 용량
    "request_bulk_volume_unit_id" : 1,    // 의뢰 벌크 용량 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
    "sample_etc" : "",                    // 샘플 기타 특이사항
    "sample_remark" : "",                 // 샘플 비고
    "ct_receipt_date" : "",               // CT 접수일
    "ct_due_date" : "",                   // CT 완료예정일
    "ct_manager_id" : "",                 // CT 담당자 ID
    "ct_manager_name" : "",               // CT 담당자명
    "is_ct_suspend" : 0,                  // CT 보류 여부
    "ct_suspend_reason" : "",             // CT 보류 사유
    "ct_status" : "REQUESTED",            // CT 진행상태
    "net_capacity" : "",                  // 순용량(적정표시용량)
    "net_capacity_unit_id" : 1,           // 순용량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
    "ct_manage_summary" : "",             // CT 관리사항 요약
    "ct_manage_remark" : "",              // CT 관리사항 비고
    "company_id" : companyId,             // 회사 ID (1 : 코스메카코리아)
    "user_id" : userId                    // 사용자 ID
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
   * 제형담당연구소 관리사항 제형 정보 입력 폼 객체
   */
  const [sampleRows, setSampleRows] = useState([
    {
      "idx" : 1,                    // 행 고유 키값 (화면단에서만 사용)
      "company_id"  : companyId,   // 회사 ID (1 : 코스메카코리아)
      "ct_request_id" : "",         // 의뢰 ID (PK) 외래키
      "ct_request_sample_id" : "",  // 의뢰 샘플 ID (PK)
      "sample_lab_no" : "",         // 랩넘버
      "bulk_volume" : 0,            // 벌크량
      "bulk_volume_unit_id" : 1,    // 벌크량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "viscosity" : 0,              // 점도
      "hardness" : 0,               // 경도
      "specific_gravity" : 0,       // 비중
      "ratio" : 0,                  // 배합비
      "ratio_type_id" : 4,          // 배합비 유형 (기본값 %) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "significant" : {             // 제형 특이사항
        "sample_remark_1" : "",
        "sample_remark_2" : "",
        "sample_remark_3" : "",
        "sample_remark_4" : "",
        "sample_remark_5" : "",
        "sample_remark_6" : ""
      },
    }
  ]);


  /**
   * 샘플 제형 특이사항 모달 입력 시 현재 선택한 행의 인덱스 훅
   */
  const [currentSampleRowIdx, setCurrentSampleRowIdx] = useState(0);


  /**
   * ============================================================
   * 동적 옵션 데이터 state
   * ------------------------------------------------------------
   * HOW : 각 셀렉트 박스별로 옵션 데이터를 관리하는 state
   *       초기값은 "전체" 또는 기본 옵션만 포함
   * WHY : DB에서 조회한 데이터를 저장하고 렌더링에 사용하기 위함
   * ============================================================
   */
  const [sampleManageDepartment, setSampleManageDepartment] = useState([
    {
      idx : 999,
      labs_department_id: "",
      parent_department_code: "",
      labs_department_code: "",
      labs_department_name: "제형담당부서",
      labs_department_email: "",
      is_active: "",
      sort_order: ""
    }
  ]);

  const [bulkUnit, setBulkUnit] = useState([
    {
      idx: 999,
      unit_id: "",
      unit_type: "",
      unit_code: "",
      unit_name: "용량단위",
      umunit_id: "",
      is_active: "",
      sort_order: ""
    }
  ]);

  const [ratioType, setRatioType] = useState([
    {
      idx: 999,
      unit_id: "",
      unit_type: "",
      unit_code: "",
      unit_name: "비율단위",
      umunit_id: "",
      is_active: "",
      sort_order: ""
    }
  ]);

  const [sampleType, setSampleType] = useState([
    {
      idx: 999,
      unit_id: "",
      unit_type: "",
      unit_code: "",
      unit_name: "제형층상유형",
      umunit_id: "",
      is_active: "",
      sort_order: ""
    }
  ]);

  /**
   * 텍스트 박스 자동 높이 조절 textarea ref
   * [의뢰자 관리사항]
   * reqTextRef : 의뢰내용
   * reqRmkTextRef : 비고
   * 
   * [제형담당연구소 관리사항]
   * sampleTextRef : 의뢰내용
   * sampleRmkTextRef : 비고
   * 
   * [CT 관리사항]
   * ctManageTextRef : 의뢰내용
   * ctManageRmkTextRef : 비고
   */
  const reqTextRef = useRef(null);
  const reqRmkTextRef = useRef(null);
  const sampleTextRef = useRef(null);
  const sampleRmkTextRef = useRef(null);
  const ctManageTextRef = useRef(null);
  const ctManageRmkTextRef = useRef(null);


  /**
   * textarea 자동 높이 조절
   */
  const resizeConfigs = useMemo(() => [
    [reqTextRef, ctForm.request_content],
    [reqRmkTextRef, ctForm.request_remark],
    [sampleTextRef, ctForm.sample_etc],
    [sampleRmkTextRef, ctForm.sample_remark],
    [ctManageTextRef, ctForm.ct_manage_summary],
    [ctManageRmkTextRef, ctForm.ct_manage_remark],
  ], [ctForm.request_content, ctForm.request_remark,
      ctForm.sample_etc, ctForm.sample_remark,
      ctForm.ct_manage_summary, ctForm.ct_manage_remark]);

  /**
   * 의뢰 벌크량 유효성 체크 훅
   */
  const [isFailReqVolValid, setIsFailReqVolValid] = useState(false);


  /* ============================== useEffect 실행 순서 관리 ============================== */
  /**
   * 🔥 1순위: 옵션 데이터 초기화 (최우선 실행)
   * ---------------------------------------------------------
   * HOW :
   *  1. 컴포넌트 마운트 시 가장 먼저 실행되어 셀렉트박스 옵션 데이터를 로드한다.
   *  2. getUnitOptions() : 단위 옵션 조회 (용량단위, 비율단위 등)
   *  3. getLabDepartment() : 제형담당연구소 관리부서 정보 조회
   *  4. Promise.all()을 사용하여 두 API를 병렬로 호출하고 완료를 기다린다.
   * 
   * WHY :
   *  - 셀렉트박스 옵션이 먼저 준비되어야 이후 CT 데이터를 바인딩할 때 정상적으로 표시됨
   *  - 실행 순서가 중요하므로 모든 useEffect보다 먼저 배치
   */
  useEffect(() => {
    Promise.all([
      getUnitOptions(),
      getLabDepartment()
    ]);
  }, []);


  /**
   * 🔥 2순위: CT 요청 상세 정보 조회
   * ---------------------------------------------------------
   * HOW :
   *  1. 컴포넌트 마운트 시 쿼리 파라미터에 ct_request_id 값이 존재하는지 확인한다.
   *  2. mode가 "update"이면 getCtDetail() 비동기 함수를 호출한다.
   *  3. mode가 "create"이면 getRecentCtNo() 함수를 호출하여 최근 CT 번호를 조회한다.
   *  4. 서버로부터 응답이 오면 response.data 객체에서 CT 요청 상세 정보를 추출한다.
   *  5. 추출한 데이터를 setCtForm()과 setSampleRows() 함수를 사용하여
   *     각각 ctForm과 sampleRows 상태 변수에 저장한다.
   * 
   * WHY :
   *  - 옵션 데이터가 먼저 로드된 후에 실행되어야 셀렉트박스 값이 올바르게 표시됨
   *  - 옵션 초기화 useEffect 바로 다음에 배치하여 순서 보장
   */
  useEffect(() => {
    if(mode === "update") {
      getCtDetail();
    } else {
      getRecentCtNo();
    }
  }, []);


  /**
   * textarea 자동 높이 조절
   * ---------------------------------------------------------
   * WHY : ctForm의 textarea 필드 값이 변경될 때마다 높이를 자동으로 조절
   */
  useEffect(() => {
    resizeConfigs.forEach(([ref]) => {
      if (!ref.current) return;
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    });
  }, [resizeConfigs]);


  /**
   * 의뢰 벌크량 인풋박스 ref(의뢰 벌크량이 필요 벌크량 보다 적을 경우 경고 표시 용도)
   */
  const reqVolRef = useRef(null);


  /**
   * 자재유형 대분류 Mock 데이터
   */
  const materialLargeCategory = [
    {"idx" : 1, "label" : "대분류", "value" : ""},
    {"idx" : 2, "label" : "JAR(패드)", "value" : "JAR(패드)"},
    {"idx" : 3, "label" : "그라인딩", "value" : "그라인딩"},
    {"idx" : 4, "label" : "딥튜브펌프", "value" : "딥튜브펌프"},
    {"idx" : 5, "label" : "에어리스", "value" : "에어리스"},
    {"idx" : 6, "label" : "에어로졸", "value" : "에어로졸"},
    {"idx" : 7, "label" : "쿠션", "value" : "쿠션"},
    {"idx" : 8, "label" : "파우더", "value" : "파우더"},
    {"idx" : 9, "label" : "파우치", "value" : "파우치"},
    {"idx" : 10, "label" : "스포이드", "value" : "스포이드"}
  ];
  

  /**
   * 자재유형 중분류 Mock 데이터
   */
  const materialMediumCategory = [
    {"idx" : 1, "label" : "중분류", "value" : ""},
    {"idx" : 2, "label" : "튜브", "value" : "튜브"},
    {"idx" : 3, "label" : "용기", "value" : "용기"},
    {"idx" : 4, "label" : "뚜껑", "value" : "뚜껑"},
    {"idx" : 5, "label" : "라벨", "value" : "라벨"},
    {"idx" : 6, "label" : "박스", "value" : "박스"},
    {"idx" : 7, "label" : "기타", "value" : "기타"}
  ];


  /**
   * CT 유형
   */
  const ctTypeOptions = [
    {"idx" : 1, "label" : "전체", "value" : "ALL"},
    {"idx" : 2, "label" : "고객사", "value" : "CLIENT"},
    {"idx" : 3, "label" : "부분", "value" : "PART"},
  ];


  /**
   * handleInput : input 값 변경 시 form 객체에 데이터 바인딩
   * 
   * @param e : 이벤트 호출 컴포넌트
   * @param {string || null} option : 체크박스 선택값
   */
  const handleInput = (e, option = null) => {

    e.preventDefault();
    
    const { name, type, value, checked, inputMode } = e.target;

      // -----------------------------
      // 1) 배열 기반 체크박스 그룹
      // -----------------------------      
      if (type === "checkbox") {
        /*
        if (name === "material_sub_category") {
          setCtForm(prev => ({
            ...prev,
            material_sub_category: prev.material_sub_category.includes(option)
              ? prev.material_sub_category.filter(item => item !== option)
              : [...prev.material_sub_category, option]
          }));
          return;
        } else {
          setCtForm((prev) => ({ ...prev, [name]: checked ? 1 : 0}));
          return;
        }
        */
        setCtForm((prev) => ({ ...prev, [name]: checked ? 1 : 0}));
        return;
      } else {
        if(inputMode === "decimal") { // 양의 정수(소수 포함)만 입력하도록 제어(Ex. 용량)
          const numValue = Utils.checkDecimal(value);
          setCtForm((prev) => ({ ...prev, [name]: numValue }));
          return;
        } else if(inputMode === "numeric") { // 양의 정수만 입력하도록 제어(Ex. 수량)
          const numValue = Utils.checkPositiveNumber(value);
          setCtForm((prev) => ({ ...prev, [name]: numValue }));
          return;
        } else {
          setCtForm((prev) => ({ ...prev, [name]: value }));
          return;
        }
      }

  };


  /**
   * handleInputSample : 제형담당연구소 관리사항 제형 정보 입력폼 인풋 데이터 바인딩
   * ---------------------------------------------------------
   * @param e : 이벤트 호출 컴포넌트
   * @param {*} id : 선택한 행 키값
   * @param {*} field : 필드명 (type, method, item 등)
   * @param {*} value : 필드값
   */
  const handleInputSample = (e, id, field, value) => {

    e.preventDefault();

    const { inputMode } = e.target;

    if(inputMode === "decimal") { // 양의 정수(소수 포함)만 입력하도록 제어(Ex. 용량)
      const numValue = Utils.checkDecimal(value);
      setSampleRows(prev =>
        prev.map(row =>
          row.idx === id
          ? { ...row, [field]: numValue }
          : row
        )
      );
      return;
    } /*
      else if(inputMode === "numeric") { // 양의 정수만 입력하도록 제어(Ex. 수량)
      const numValue = Utils.checkPositiveNumber(value);
      setSampleRows(prev =>
        prev.map(row =>
          row.idx === id
          ? { ...row, [field]: numValue }
          : row
        )
      );
      return;
    } 
      */
      else {
      setSampleRows(prev =>
        prev.map(row =>
          row.idx === id
          ? { ...row, [field]: value }
          : row
        )
      );
      return;
    }

  };

  // 차수 선택 시 해당 차수의 CT 데이터로 폼에 바인딩하는 함수
  const handleCtData = (e, ct) => {
    setCtData(prev => ({
      ...prev,
      ct_request_id: ct.ct_request_id,
      ct_no: ct.ct_no,
      ct_test_seq: ct.ct_test_seq
    }))
  };


  /**
   * bindDueDate : CT 접수일자 입력 시 완료 예정일자 자동 계산하여 바인딩
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const bindDueDate = (e) => {
    const { name, value } = e.target;
    if(name === "ct_receipt_date") {
      const dueDate = Utils.addDay(value, 6); // 접수일로부터 6일 후 날짜 계산
      setCtForm(prev => ({
        ...prev,
        ct_due_date: dueDate,
        ct_status: "ACCEPTED" // 접수일이 입력되면 진행상태를 "ACCEPTED"로 변경
      }));
    };
  }


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
   * resetForm : CT 폼 초기화 함수
   * ---------------------------------------------------------
   * WHAT : 쿼리 파라미터에 ct_request_id가 있을 경우 페이지 리로딩 처리
   *        파라미터가 없을 경우 파라미터 폼 초기화
   */
  const resetForm = () => {

    if(mode === "update") goToPage("/ct/request/create");
      
    setCtForm({
      "ct_request_id" : "",                 // 의뢰 ID (PK)
      "ct_request_date" : G_TODAY,          // 의뢰일
      "ct_no" : "",                         // CT 번호
      "ct_test_seq" : "",                   // CT 차수
      "client_id" : "",                     // 고객사 ID
      "client_name" : "",                   // 고객사명
      "sample_id" : "",                     // 샘플 ID
      "sample_name" : "",                   // 샘플명
      "ct_lab_no" : "",                     // CT 랩넘버
      "sales_manager_id" : "",              // 영업담당자 ID
      "sales_manager_name" : "",            // 영업담당자명
      "labs_manage_department_id" : "",     // 제형관리부서 ID
      "labs_manage_department_name" : "",   // 제형관리부서명
      "labs_manager_id" : "",               // 제형담당자 ID
      "labs_manager_name" : "",             // 제형담당자명
      "ct_type" : "",                       // CT 유형 (고객사/부분)
      "material_supplier_id" : "",          // 자재 업체 ID
      "material_supplier_name" : "",        // 자재 업체명
      "material_large_category_id" : "",    // 자재 유형 대분류 ID
      "material_sub_category" : "",        // 자재 유형 중분류
      "material_description" : "",          // 자재 재질 정보
      "material_quantity" : 0,              // 자재 수량
      "sample_quantity" : 0,                // 샘플 수량
      "desired_volume" : 0,                 // 희망 용량
      "desired_volume_unit_id" : 1,         // 희망 용량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "sleeve_length" : "",                 // 튜브 고객사 요청 길이
      "is_cutting" : 0,                     // 컷팅 여부
      "is_include_tube" : 0,                // 튜브 포함 여부
      "is_emergency" : 0,                   // 긴급여부
      "is_cpnp" : 0,                        // CPNP여부
      "is_eng" : 0,                         // 영문여부
      "request_content" : "",               // 의뢰내용
      "request_remark" : "",                // 의뢰 비고
      "material_request_date" : "",         // 자재 요청일
      "sample_type_id" : 6,                 // 샘플 층상 유형 ID (기본값 "lv1") [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "required_bulk_volume" : 0,           // 필요 벌크 용량
      "required_bulk_volume_unit_id" : 1,   // 필요 벌크 용량 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "request_bulk_volume" : 0,            // 의뢰 벌크 용량
      "request_bulk_volume_unit_id" : 1,    // 의뢰 벌크 용량 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "sample_etc" : "",                    // 샘플 기타 특이사항
      "sample_remark" : "",                 // 샘플 비고
      "ct_receipt_date" : "",               // CT 접수일
      "ct_due_date" : "",                   // CT 완료예정일
      "ct_manager_id" : "",                 // CT 담당자 ID
      "ct_manager_name" : "",               // CT 담당자명
      "is_ct_suspend" : 0,                  // CT 보류 여부
      "ct_suspend_reason" : "",             // CT 보류 사유
      "ct_status" : "REQUESTED",            // CT 진행상태
      "net_capacity" : "",                  // 순용량(적정표시용량)
      "net_capacity_unit_id" : 1,           // 순용량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
      "ct_manage_summary" : "",             // CT 관리사항 요약
      "ct_manage_remark" : "",              // CT 관리사항 비고
      "company_id" : companyId,             // 회사 ID (1 : 코스메카코리아)
      "user_id" : userId                    // 사용자 ID
    });
    
    getRecentCtNo();
 
  };


  /**
   * saveRequest : CT 의뢰 생성
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const saveRequest = async (e) => {

    e.preventDefault();

    let targetUrl = "";

    if(Utils.toStringOrEmpty(ctForm.ct_no) === "") {
      alert("CT 번호를 입력해주세요.");
      return;
    }

    if(Utils.toStringOrEmpty(ctForm.ct_test_seq) === "") {
      alert("차수를 선택해주세요.");
      return;
    }

    if(Utils.toStringOrEmpty(ctForm.labs_manage_department_id) === "") {
      alert("제형관리부서를 선택해주세요.");
      return;
    }

    // if(Utils.toStringOrEmpty(ctForm.client_id) === "") {
    //   alert("고객사를 선택해주세요.");
    //   return;
    // }

    // if(Utils.toStringOrEmpty(ctForm.sample_id) === "") {
    //   alert("샘플을 선택해주세요.");
    //   return;
    // }

    // if(Utils.toStringOrEmpty(ctForm.ct_lab_no) === "") {
    //   alert("CT 랩넘버를 입력해주세요.");
    //   return;
    // }

    // if(Utils.toStringOrEmpty(ctForm.sales_manager_id) === "") {
    //   alert("영업담당자를 선택해주세요.");
    //   return;
    // }

    // if(Utils.toStringOrEmpty(ctForm.labs_manager_id) === "") {
    //   alert("제형담당자를 선택해주세요.");
    //   return;
    // }

    // if(Utils.toStringOrEmpty(ctForm.material_supplier_id) === "") {
    //   alert("자재 업체를 선택해주세요.");
    //   return;
    // }

    // if(Utils.toStringOrEmpty(ctForm.material_large_category_id) === "") {
    //   alert("자재 유형 대분류를 선택해주세요.");
    //   return;
    // }

    if(mode === "create") targetUrl = "/api/ltms/ct/request/create";
    if(mode === "update") targetUrl = "/api/ltms/ct/request/update";

    if(mode === "") {
      alert("잘못된 요청입니다.");
      return;
    }

    if (mode === "create") {

      const params = {
        requestInfo: ctForm,
        sampleInfo: sampleRows
      };

      try {
        const response = await axios.post(targetUrl, params);
        alert("CT 의뢰가 등록되었습니다.");
        goToPage("/ct/request/read");
      } catch(err) {
        console.log(err);
        const errMsg = err.response?.data?.message;
        alert(`등록에 실패했습니다. \n${errMsg}`);
      } finally {

      }
    }

    if(mode === "update") {

      try {
        const response = await axios.post(targetUrl, {
          requestInfo: ctForm,
          sampleInfo: sampleRows
        });
        alert("CT 의뢰 정보가 수정되었습니다.");
        goToPage("/ct/request/read");
      } catch(err) {
        console.log(err);
        const errMsg = err.response?.data?.message;
        alert(`수정에 실패했습니다. \n${errMsg}`);
      } finally {

      }
    }

  };


  /**
   * toggleDropdown : 커스텀 셀렉트 박스 활성화 함수
   */
  /* 미사용 처리
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
  */


  /**
   * outFocusModal : 커스텀 셀렉트박스 자동 닫기 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  /* 미사용 처리
  const outFocusModal = (e) => {
    const nextFocused = e.relatedTarget;
    if (refCustomSelectBox.current && !refCustomSelectBox.current.contains(nextFocused)) {
      setIsDropdownOpen(prev => !prev);
    }
  }
  */


  /**
   * getLvNumber : 제형 등급에서 숫자만 추출 함수
   * 
   * @param {*} lv 
   * @returns 
   */
  const getLvNumber = (lv) => {
    // "lv1"에서 "1" 추출
    const n = Number(lv.replace("lv", ""));
    // n이 숫자가 맞고 양의 정수라면 그대로 반환, 그 외 1 반환
    return Number.isInteger(n) && n > 0 ? n : 1;
  };


  /**
   * syncRowsByLevel : 제형 등급에 따라 행 수 동기화 함수
   * 
   * @param {*} lv : 제형 층상
   */
  const syncRowsByLevel = (e) => {

    const lv = e.target.selectedOptions[0].dataset.extra;
    const targetCount = getLvNumber(lv);

    if (isNaN(targetCount) || targetCount < 1) return;

    setSampleRows(prev => {

      const currentCount = prev.length;

      // ✅ 개수가 같은 경우
      if (currentCount === targetCount) {
        return prev;
      }

      // ✅ 줄여야 하는 경우 (삭제)
      if (currentCount > targetCount) {
        return prev.slice(0, targetCount);
      }

      // ✅ 늘려야 하는 경우 (추가)
      const newRows = [...prev];

      for (let i = currentCount; i < targetCount; i++) {
        newRows.push({
          "idx" : sampleRows.length + i,  // 행 고유 키값 (화면단에서만 사용)
          "company_id"  : companyId,     // 회사 ID (1 : 코스메카코리아)
          "ct_request_id" : "",           // 의뢰 ID (PK) 외래키
          "ct_request_sample_id" : "",    // 의뢰 샘플 ID (PK)
          "sample_lab_no" : "",           // 랩넘버
          "bulk_volume" : 0,              // 벌크량
          "bulk_volume_unit_id" : 1,      // 벌크량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "viscosity" : 0,                // 점도
          "hardness" : 0,                 // 경도
          "specific_gravity" : 0,         // 비중
          "ratio" : 0,                    // 배합비
          "ratio_type_id" : 4,            // 배합비 유형 (기본값 %) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "significant" : {               // 제형 특이사항
            "sample_remark_1" : "",
            "sample_remark_2" : "",
            "sample_remark_3" : "",
            "sample_remark_4" : "",
            "sample_remark_5" : "",
            "sample_remark_6" : ""
          },
        });
      }

      return newRows;
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
      const { name } = e.target;

      if (e.target.tagName === "INPUT" && e.target.id.startsWith("sampleRows_significant_")) {
        const rect = e.target.getBoundingClientRect();
        const targetIdx = Number(name.substr(-1, name.lastIndexOf("_")))-1; // 배열 인덱스는 0부터 시작한다.
        setIsOpenModalRemark({
          open: true,
          targetId: e.target.id,
          position: { top: rect.bottom + window.scrollY + 10, left: rect.left + window.scrollX },
        });

        setCurrentSampleRowIdx(targetIdx);
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
      if (refModalSearchCtSeq.current && !refModalSearchCtSeq.current.contains(e.target)) resetHistoryModal();
    }

    document.addEventListener("mousedown", closeModalSearchCtSeq);

    return () => {
      document.removeEventListener("mousedown", closeModalSearchCtSeq);
    }

  }, []);


  /**
   * useEffect - 필요 벌크 용량 자동 계산 기능
   * HOW : 필요 벌크량 = 희망용량 * (6.5 + 샘플수량)
   */
  useEffect(() => {
    const desiredVolume = parseFloat(ctForm.desired_volume) || 0; // 희망용량
    const sampleQuantity = parseFloat(ctForm.sample_quantity) || 0; // 샘플갯수

    if(sampleQuantity == 0) return;

    setCtForm((prev) => ({
      ...prev,
      required_bulk_volume: desiredVolume * (6.5 + sampleQuantity)
    }));
  }, [ctForm.desired_volume, ctForm.sample_quantity]);



  useEffect(() => {
    const requiredvolume = parseFloat(ctForm.required_bulk_volume) || 0; // 필요 벌크량
    const requestVolume = parseFloat(ctForm.request_bulk_volume) || 0; // 의뢰 벌크량

    if(requiredvolume > requestVolume) {
      setIsFailReqVolValid(true);
    } else {
      setIsFailReqVolValid(false);
    }
  },[ctForm.required_bulk_volume, ctForm.request_bulk_volume]);

  
  /**
   * handleSpecialChange : 제형(의뢰) 제형 정보 특이사항 모달 입력값 제어 함수
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const handleSpecialChange = (e) => {
    const { id, value } = e.target;

    setSampleRows(prev =>
        prev.map((row, idx) =>
          idx === currentSampleRowIdx
          ? {
              ...row,
              significant: {
                ...row.significant,
                [id]: value
              }
            }
          : row
        )
      );
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

    e.preventDefault();
    if(!await checkValid(e)) return;

    const query = {
      search_type : historyForm.search_type,
      date_from : historyForm.search_from,
      date_to : historyForm.search_to,
      client_id : historyForm.search_client,
      sample_id : historyForm.search_sample,
      request_content : historyForm.search_keyword,
      company_id : companyId
    };

    const params = Utils.cleanParams(query);
    
    try {
      const res = await axios.get("/api/ltms/ct/requests", { params });
      const resultData = res.data.data.result;
      setCtRequests(resultData);
    } catch (err) {
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
   * handledCtSuspendChange : CT 중단여부 체크박스 변경 시 처리 함수
   * 
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const handledCtSuspendChange = (e) => {
    if (!e.target.checked) {
      setCtForm((prev) => ({
        ...prev,
        ct_suspend_reason: ""
      }));
    }
  };

  // CT 차수 조회 시 선택된 CT 데이터 state
  const [ctData, setCtData] = useState({
    ct_request_id: "",
    ct_no: "",
    ct_test_seq: ""
  }); 


  /** ----------------------------------
   * pageSize : 페이지당 표시할 항목 수
   * 초기값은 15, 클라이언트 단에서 변경 가능.
   * ---------------------------------- */
  const [pageSize, setPageSize] = useState(5);


  /** ----------------------------------
   * currentPage : 현재 페이지
   * pageSize 변경 시 현재 페이지를 1로 초기화
   * ---------------------------------- */
  const [currentPage, setCurrentPage] = useState(1);


  /**
   * 전체 페이지 수 (filteredSorted : 검색/정렬 적용된 최종 결과)
   * ----------------------------------------------------
   * HOW : 총 데이터 수 / pageSize 로 총 페이지 개수를 계산
   * WHY : 실시간으로 리스트 개수가 변할 때마다 페이지 수가 자동으로 갱신됨
   */
  const totalPages = Math.ceil(ctRequests.length / pageSize);


  /**
   * paginatedResult
   * ----------------------------------------------------
   * HOW : 현재 페이지에 해당하는 데이터만 slice해서 렌더링용 배열 생성
   */
  const paginatedResult = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return ctRequests.slice(start, start + pageSize);
  }, [ctRequests, pageSize, currentPage]);


  /**
   * 페이지 번호 배열
   * ----------------------------------------------------
   * HOW : 현재 페이지를 기준으로 5개 단위 페이지 그룹 계산
   * 
   * Ex : currentPage = 7  → 1~5
   *      currentPage = 15 → 11~15
   */
  const compactPages = useMemo(() => {
    const groupStart = Math.floor((currentPage - 1) / G_PAGEGROUPCOUNT) * G_PAGEGROUPCOUNT + 1;  // 그룹 시작 페이지
    const groupEnd = Math.min(groupStart + 4, totalPages);           // 그룹 마지막 페이지

    const pages = [];
    for (let i = groupStart; i <= groupEnd; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);


  /**
   * movePage : 특정 페이지로 이동
   * 
   * @param p : 이동할 페이지 번호
   */
  const movePage = (p) => setCurrentPage(p);


  /**
   * movePrev : 이전 페이지 그룹으로 이동
   */
  const movePrev = () => {
    const prevPage = currentPage - G_PAGEGROUPCOUNT;
    setCurrentPage(prevPage < 1 ? 1 : prevPage);
  };


  /**
   * moveNext : 다음 페이지 그룹으로 이동
   */
  const moveNext = () => {
    const nextPage = currentPage + G_PAGEGROUPCOUNT;
    setCurrentPage(nextPage > totalPages ? totalPages : nextPage);
  };


  /**
   * moveFirst : 맨 처음 페이지로 이동
   */
  const moveFirst = () => setCurrentPage(1);


  /**
   * moveLast : 맨 마지막 페이지로 이동
   */
  const moveLast = () => setCurrentPage(totalPages);


  /**
   * searchEnter : Enter 키로 검색 실행 함수
   * ----------------------------------------------------
   * WHY : textarea 내에서 Enter 키 입력 시 검색이 실행되지 않도록 방지
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const searchEnter = (e) => {
    if(e.key === "Enter") searchCtSeqHistory(e);
  };


  /**
   * resetHistoryModal : 차수 검색 모달 초기화 함수
   * ---------------------------------------------------------
   */
  const resetHistoryModal = () => {
    setIsModalOpenCtSeq({
      open: false,
      targetId: "",
      position: { top: 0, left: 0 }
    });

    setHistoryForm({
      "search_type" : "REQ",
      "search_from" : G_STARTDAY,
      "search_to" : G_TODAY,
      "search_client" : "",
      "search_sample" : "",
      "search_labNo" : "",
      "search_keyword" : ""
    });

    setIsValidated(true);

    setCtRequests([]);  // 차수 조회 결과 초기화
    setCtData({});      // 선택된 CT 데이터 초기화
  };


  /**
   * initializeCtData : CT 데이터 초기화 함수
   * ---------------------------------------------------------
   * WHAT : 차수 조회 후 CT 항목 선택 시 CT의뢰번호와 차수를 CT등록폼에 바인딩 
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const initializeCtData = async(e) => {

    try {

      const params = {
        ct_request_id: ctData.ct_request_id,
        company_id: companyId
      };

      const testSeq = Number(ctData.ct_test_seq) + 1;
      const response = await axios.get("/api/ltms/ct/request/detail", { params });
      const resultData = response.data.data.result;

      if(resultData.ctInfo) {
        setCtForm(prev => ({
          ...prev,
          "ct_test_seq" : testSeq,                                                          // CT 차수 (기존 차수 + 1)
          "client_id" : resultData.ctInfo.client_id,                                        // 고객사 ID
          "client_name" : resultData.ctInfo.client_name,                                    // 고객사명
          "sample_id" : resultData.ctInfo.sample_id,                                        // 샘플 ID
          "sample_name" : resultData.ctInfo.sample_name,                                    // 샘플명
          "ct_lab_no" : resultData.ctInfo.ct_lab_no,                                        // CT 랩넘버
          "sales_manager_id" : resultData.ctInfo.sales_manager_id,                          // 영업담당자 ID
          "sales_manager_name" : resultData.ctInfo.sales_manager_name,                      // 영업담당자명
          "labs_manage_department_id" : resultData.ctInfo.labs_manage_department_id,        // 제형관리부서 ID
          "labs_manage_department_name" : resultData.ctInfo.labs_manage_department_name,    // 제형관리부서명
          "labs_manager_id" : resultData.ctInfo.labs_manager_id,                            // 제형담당자 ID
          "labs_manager_name" : resultData.ctInfo.labs_manager_name,                        // 제형담당자명
          "ct_type" : resultData.ctInfo.ct_type,                                            // CT 유형 (고객사/부분)
          "material_supplier_id" : resultData.ctInfo.material_supplier_id,                  // 자재 업체 ID
          "material_supplier_name" : resultData.ctInfo.material_supplier_name,              // 자재 업체명
          "material_large_category_id" : resultData.ctInfo.material_large_category_id,      // 자재 유형 대분류 ID
          "material_sub_category" : resultData.ctInfo.material_sub_category,                // 자재 유형 중분류
          "material_description" : resultData.ctInfo.material_description,                  // 자재 재질 정보
          "material_quantity" : resultData.ctInfo.material_quantity,                        // 자재 수량
          "sample_quantity" : resultData.ctInfo.sample_quantity,                            // 샘플 수량
          "desired_volume" : resultData.ctInfo.desired_volume,                              // 희망 용량
          "desired_volume_unit_id" : resultData.ctInfo.desired_volume_unit_id,              // 희망 용량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "sleeve_length" : resultData.ctInfo.sleeve_length,                                // 튜브 고객사 요청 길이
          "is_cutting" : resultData.ctInfo.is_cutting,                                      // 컷팅 여부
          "is_include_tube" : resultData.ctInfo.is_include_tube,                            // 튜브 포함 여부
          "is_emergency" : resultData.ctInfo.is_emergency,                                  // 긴급여부
          "is_cpnp" : resultData.ctInfo.is_cpnp,                                            // CPNP여부
          "is_eng" : resultData.ctInfo.is_eng,                                              // 영문여부
          "request_content" : resultData.ctInfo.request_content,                            // 의뢰내용
          "request_remark" : resultData.ctInfo.request_remark,                              // 의뢰 비고
          "sample_type_id" : resultData.ctInfo.sample_type_id,                              // 샘플 층상 유형 ID (기본값 "lv1") [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "required_bulk_volume" : resultData.ctInfo.required_bulk_volume,                  // 필요 벌크 용량
          "required_bulk_volume_unit_id" : resultData.ctInfo.required_bulk_volume_unit_id,  // 필요 벌크 용량 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "request_bulk_volume" : resultData.ctInfo.request_bulk_volume,                    // 의뢰 벌크 용량
          "request_bulk_volume_unit_id" : resultData.ctInfo.request_bulk_volume_unit_id,    // 의뢰 벌크 용량 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "sample_etc" : resultData.ctInfo.sample_etc,                                      // 샘플 기타 특이사항
          "sample_remark" : resultData.ctInfo.sample_remark,                                // 샘플 비고
          "ct_manager_id" : resultData.ctInfo.ct_manager_id,                                // CT 담당자 ID
          "ct_manager_name" : resultData.ctInfo.ct_manager_name,                            // CT 담당자명
          "ct_status" : resultData.ctInfo.ct_status,                                        // CT 진행상태
          "net_capacity" : resultData.ctInfo.net_capacity,                                  // 순용량(적정표시용량)
          "net_capacity_unit_id" : resultData.ctInfo.net_capacity_unit_id,                  // 순용량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
          "ct_manage_summary" : resultData.ctInfo.ct_manage_summary,                        // CT 관리사항 요약
          "ct_manage_remark" : resultData.ctInfo.ct_manage_remark,                          // CT 관리사항 비고
          "company_id" : companyId,                                                         // 회사 ID (1 : 코스메카코리아)
          "user_id" : userId                                                                // 사용자 ID
        }));
      } else {
        resetForm();
      }

      if(resultData.sampleInfo.length > 0) {
        setCtForm((prev)  => ({
          ...prev,
          sample_type_id: resultData.sampleInfo.length > 1 ? "7" : "6" // 샘플 층상 유형 자동 설정 (1층 : lv1 : 6, 2층 : lv2 : 7)
        }));
        setSampleRows(resultData.sampleInfo);
      } else {
        setSampleRows([
          {
            "idx" : 1,                    // 행 고유 키값 (화면단에서만 사용)
            "company_id"  : companyId,   // 회사 ID (1 : 코스메카코리아)
            "ct_request_id" : "",         // 의뢰 ID (PK) 외래키
            "ct_request_sample_id" : "",  // 의뢰 샘플 ID (PK)
            "sample_lab_no" : "",         // 랩넘버
            "bulk_volume" : 0,            // 벌크량
            "bulk_volume_unit_id" : 1,    // 벌크량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
            "viscosity" : 0,              // 점도
            "hardness" : 0,               // 경도
            "specific_gravity" : 0,       // 비중
            "ratio" : 0,                  // 배합비
            "ratio_type_id" : 4,          // 배합비 유형 (기본값 %) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
            "significant" : {             // 제형 특이사항
              "sample_remark_1" : "",
              "sample_remark_2" : "",
              "sample_remark_3" : "",
              "sample_remark_4" : "",
              "sample_remark_5" : "",
              "sample_remark_6" : ""
            },
          }
        ]);
      }
      
    } catch (err) {
      console.error(err);
      alert("CT 요청 상세 정보 조회 중 오류가 발생했습니다.");
    } finally {
      resetHistoryModal();
    }
  }

  /**
   * getRecentCtNo : 최근 CT 번호 조회 함수
   * ---------------------------------------------------------
   * WHAT : 신규 CT 등록 시 최근 CT 번호를 조회하여 CT등록폼에 바인딩
   */
  const getRecentCtNo = async () => {
    
    try {
      const params = { company_id: companyId };
      const response = await axios.get("/api/ltms/ct/request/recent-ct-no", { params });
      const recentCtNo = response.data.data.result || "";

      // 최근 CT 번호를 ctForm 상태에 반영 차수는 1로 초기화
      setCtForm((prev) => ({
        ...prev,
        ct_no: recentCtNo,
        ct_test_seq: 1
      }));

    } catch (err) {
      console.error(err);
    }
  };


  /**
   * getCtDetail : CT 요청 상세 정보 조회 함수
   * ---------------------------------------------------------
   * WHAT : CT 요청 수정 시 기존 CT 요청 상세 정보를 조회하여 폼에 바인딩
   */
  const getCtDetail = async () => {
    try {

      const params = {
        ct_request_id: ctRequestId,
        company_id: companyId
      };

      const response = await axios.get("/api/ltms/ct/request/detail", { params });
      const resultData = response.data.data.result;

      if(resultData.ctInfo) {
        setCtForm((prev) => ({
          ...prev,
          ...resultData.ctInfo
        }));
      } else {
        resetForm();
      }

      if(resultData.sampleInfo.length > 0) {
        setCtForm((prev)  => ({
          ...prev,
          sample_type_id: resultData.sampleInfo.length > 1 ? "7" : "6" // 샘플 층상 유형 자동 설정 (1층 : lv1 : 6, 2층 : lv2 : 7)
        }));
        setSampleRows(resultData.sampleInfo);
      } else {
        setSampleRows([
          {
            "idx" : 1,                    // 행 고유 키값 (화면단에서만 사용)
            "company_id"  : companyId,   // 회사 ID (1 : 코스메카코리아)
            "ct_request_id" : "",         // 의뢰 ID (PK) 외래키
            "ct_request_sample_id" : "",  // 의뢰 샘플 ID (PK)
            "sample_lab_no" : "",         // 랩넘버
            "bulk_volume" : 0,            // 벌크량
            "bulk_volume_unit_id" : 1,    // 벌크량 단위 (기본값 mL) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
            "viscosity" : 0,              // 점도
            "hardness" : 0,               // 경도
            "specific_gravity" : 0,       // 비중
            "ratio" : 0,                  // 배합비
            "ratio_type_id" : 4,          // 배합비 유형 (기본값 %) [1 : mL | 2 : g | 3 : oz | 4 : wgt | 5 : vol | 6 : lv1 | 7 : lv2]
            "significant" : {             // 제형 특이사항
              "sample_remark_1" : "",
              "sample_remark_2" : "",
              "sample_remark_3" : "",
              "sample_remark_4" : "",
              "sample_remark_5" : "",
              "sample_remark_6" : ""
            },
          }
        ]);
      }
      
    } catch (err) {
      console.error(err);
      alert("CT 요청 상세 정보 조회 중 오류가 발생했습니다.");
    } finally {
    }
  };


  /**
   * getUnitOptions : 단위 옵션 조회 함수
   * ---------------------------------------------------------
   * HOW : sessionStorage에 캐시된 데이터가 있으면 사용하고,
   *       없으면 API 호출 후 sessionStorage에 저장
   * WHY : 페이지 진입할 때마다 불필요한 API 호출을 방지하여 성능 최적화
   */
  const getUnitOptions = async () => {
    try {
      // sessionStorage에서 캐시된 데이터 확인
      const cachedData = sessionStorage.getItem('unitOptions');
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 파싱해서 사용
        const unitOptions = JSON.parse(cachedData);
        
        const bulkUnitOpt = unitOptions.filter(unit => unit.unit_type === "MEASURE"); // 벌크 단위
        const ratioTypeOpt = unitOptions.filter(unit => unit.unit_type === "RATIO");  // 비율 단위
        const levelUnitOpt = unitOptions.filter(unit => unit.unit_type === "LEVEL");  // 제형 층상 단위

        setBulkUnit([...bulkUnitOpt]);
        setRatioType([...ratioTypeOpt]);
        setSampleType([...levelUnitOpt]);
        return;
      }

      // 캐시된 데이터가 없으면 API 호출
      const params = { company_id: companyId };
      const response = await axios.get("/api/ltms/setting/options/unit", { params });
      const unitOptions = response.data.data.result || [];

      const bulkUnitOpt = unitOptions.filter(unit => unit.unit_type === "MEASURE"); // 벌크 단위
      const ratioTypeOpt = unitOptions.filter(unit => unit.unit_type === "RATIO");  // 비율 단위
      const levelUnitOpt = unitOptions.filter(unit => unit.unit_type === "LEVEL");  // 제형 층상 단위

      setBulkUnit([...bulkUnitOpt]);
      setRatioType([...ratioTypeOpt]);
      setSampleType([...levelUnitOpt]);
      
      // sessionStorage에 저장
      sessionStorage.setItem('unitOptions', JSON.stringify(unitOptions));
      
    } catch (err) {
      console.error(err);
    }
  };


  /**
   * getLabDepartment : 제형담당연구소 관리부서 정보 조회 함수
   * ---------------------------------------------------------
   * HOW : sessionStorage에 캐시된 데이터가 있으면 사용하고,
   *       없으면 API 호출 후 sessionStorage에 저장
   * WHY : 페이지 진입할 때마다 불필요한 API 호출을 방지하여 성능 최적화
   */
  const getLabDepartment = async () => {
    try {
      // sessionStorage에서 캐시된 데이터 확인
      const cachedData = sessionStorage.getItem('labDepartment');
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 파싱해서 사용
        const deptOptions = JSON.parse(cachedData);
        setSampleManageDepartment([...deptOptions]);
        setCtForm((prev) => ({
          ...prev,
          labs_manage_department_id: deptOptions.length > 0 ? deptOptions[0].labs_department_id : ""
        }));
        return;
      }

      // 캐시된 데이터가 없으면 API 호출
      const params = { company_id: companyId };
      const response = await axios.get("/api/ltms/setting/options/labdepartment", { params });
      const deptOptions = response.data.data.result || [];
      
      setSampleManageDepartment([...deptOptions]);
      setCtForm((prev) => ({
        ...prev,
        labs_manage_department_id: deptOptions.length > 0 ? deptOptions[0].labs_department_id : ""
      }));
      // sessionStorage에 저장
      sessionStorage.setItem('labDepartment', JSON.stringify(deptOptions));
    } catch (err) {
      console.error(err);
    }
  };


  /**
   * 메인 렌더링
   */
  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <CT_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}

      {/* ↓ 등록 메인 뷰 ↓ */}
      <div className="container">

        {/* ↓ 등록 폼 ↓ */}
        <div>
          {/* ↓ CT 폼 타이틀 ↓ */}
          <div className="page-top">
            {/* <h1 className="page-title">{catName} {actName}</h1> */}
          </div>
          {/* ↑ CT 폼 타이틀 ↑ */}

          {/* 폼 영역 */}
          <form id="create-form" className="" onSubmit={(e) => { e.preventDefault(); }}>

            {/* ↓ CT 폼 ↓ */}
            <div id="ct" className="ct-create-information">

              {/* ↓ CT 의뢰 정보 타이틀 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-top">
                <div className="ct-create-grid-label grid-title tal">◎ 의뢰 정보</div>
              </div>
              {/* ↑ CT 의뢰 정보 타이틀 ↑ */}

              {/* ↓ CT 입력값 1번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-1">
                <div className="ct-create-grid-label">의뢰일</div>
                <input className="" type="date" id="ctForm_ctRequestDate" name="ct_request_date" 
                        value={ctForm.ct_request_date ?? ""} 
                        onChange={handleInput}/>

                <div className="ct-create-grid-label">CT 의뢰번호</div>
                <input className="" type="search" id="ctForm_ctCode" name="ct_no" 
                        value={ctForm.ct_no ?? ""}
                        disabled={true}
                        onChange={handleInput}/>

                <div className="ct-create-grid-label">차수</div>
                <div className="searchContainer">
                  <input className="" type="text" inputMode="numeric" id="ctForm_ctTestSeq" name="ct_test_seq" 
                          value={ctForm.ct_test_seq ?? ""} 
                          onChange={handleInput} 
                          style={{width:"80px"}}
                          disabled={mode === "update" ? true : false}
                          title={`${mode === "update" ? "이미 등록된 의뢰는 차수 수정이 불가합니다." : ""}`}
                          />
                  <button id="searchCtSeq" 
                          className="search" 
                          type="button" 
                          disabled={mode === "update" ? true : false}
                          title={`${mode === "update" ? "이미 등록된 의뢰는 차수 수정이 불가합니다." : ""}`}
                          >🔍</button>
                </div>

                <div className="ct-create-grid-label">고객사</div>
                <input className="" type="search" id="ctForm_clientIdText" name="" 
                        onChange={(e) => findData_ERP(e, "client")} />
                <input className="" type="hidden" id="ctForm_clientId" name="client_id" 
                        value={ctForm.client_id ?? ""} onChange={handleInput}/>

                <div className="ct-create-grid-label">샘플명</div>
                <input className="" type="search" id="ctForm_sampleIdText" name="" 
                        onChange={(e) => findData_ERP(e, "sample")} />
                <input className="" type="hidden" id="ctForm_sampleId" name="sample_id" 
                        value={ctForm.sample_id ?? ""} onChange={handleInput}/>

                <div className="ct-create-grid-label">랩넘버</div>
                <input className="" type="search" id="ctForm_ctLabNoText" name="" 
                        onChange={(e) => findData_ERP(e, "labNo")} />
                <input className="" type="hidden" id="ctForm_ctLabNo" name="ct_lab_no" 
                        value={ctForm.ct_lab_no ?? ""} onChange={handleInput}/>
              </div>
              {/* ↑ CT 입력값 1번 라인 ↑ */}

              {/* ↓ CT 입력값 2번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-2">
                <div className="ct-create-grid-label">영업담당자</div>
                <input className="" type="search" id="ctForm_salesManagerIdText" name="" 
                        onChange={(e) => findData_ERP(e, "saleManager")} />
                <input className="" type="hidden" id="ctForm_salesManagerId" name="sales_manager_id" 
                        value={ctForm.sales_manager_id ?? ""} 
                        onChange={handleInput}/>

                <div className="ct-create-grid-label">제형담당부서</div>
                <select className="" id="ctForm_labsManageDepartmentId" name="labs_manage_department_id" 
                        value={ctForm.labs_manage_department_id ?? ""} 
                        onChange={handleInput}>
                  {sampleManageDepartment.map(e => (
                    <option key={e.idx} value={e.labs_department_id}>{e.labs_department_name}</option>
                  ))}
                </select>

                <div className="ct-create-grid-label">제형담당자</div>
                <input className="" type="search" id="ctForm_labsManagerIdText" name="" 
                        onChange={(e) => findData_ERP(e, "sampleManager")} />
                <input className="" type="hidden" id="ctForm_labsManagerId" name="labs_manager_id" 
                        value={ctForm.labs_manager_id ?? ""} onChange={handleInput}/>

                {/* <div className="ct-create-grid-label">CT 담당자</div>
                <input className="" type="search" id="ctForm_ctManagerIdText" name="" onChange={(e) => findData_ERP(e, "ctManager")} />
                <input className="" type="hidden" id="ctForm_ctManagerId" name="ct_manager_id" value={ctForm.ct_manager_id ?? ""} onChange={handleInput}/>

                <div className="ct-create-grid-label"><label htmlFor="ctForm_isCtSuspend">CT 보류</label></div>
                <input className="" type="checkbox" id="ctForm_isCtSuspend" checked={ctForm.is_ct_suspend} name="is_ct_suspend" onChange={handleInput}/>
                <input className="" type="search"  id="ctForm_ctSuspendReason" name="ct_suspend_reason" value={ctForm.ct_suspend_reason ?? ""} onChange={handleInput} placeholder="보류 사유 입력"/>
                */}
              </div>
              {/* ↑ CT 입력값 2번 라인 ↑ */}

            </div>
            {/* ↑ CT 폼 ↑ */}

            {/* ↓ 의뢰자 관리사항 폼 ↓ */}
            <div id="sales" className="ct-create-information">

              {/* ↓ 의뢰자 관리사항 타이틀 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-top">
                <div className="ct-create-grid-label grid-title tal">◎ 의뢰자 관리사항</div>
              </div>
              {/* ↑ 의뢰자 관리사항 타이틀 ↑ */}

              {/* ↓ 의뢰자 관리사항 입력값 1번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-3">
                <div className="ct-create-grid-label">CT 유형</div>
                <select className="" id="ctForm_ctType" name="ct_type" 
                        value={ctForm.ct_type ?? ""} onChange={handleInput}>
                  {ctTypeOptions.map(e => (
                    <option key={e.idx} value={e.value}>{e.label}</option>
                  ))}
                </select>

                <div className="ct-create-grid-label">자재업체명</div>
                <div className="searchContainer">
                  <input className="" type="search" id="ctForm_materialSupplierIdText" name="" 
                          style={{width:"180px"}} 
                          onChange={(e) => findData_ERP(e, "materialSupplier")} />
                  <input className="" type="hidden" id="ctForm_materialSupplierId" name="material_supplier_id" 
                          value={ctForm.material_supplier_id ?? ""} onChange={handleInput}/>
                  {/* <button className="search">🔍</button> */}
                </div>

                <div className="ct-create-grid-label">자재재질정보</div>
                <input className="" type="search" id="ctForm_materialDescription" name="material_description" 
                        value={ctForm.material_description ?? ""} 
                        onChange={handleInput}
                        />
              </div>
              {/* ↑ 의뢰자 관리사항 입력값 1번 라인 ↑ */}

              {/* ↓ 의뢰자 관리사항 입력값 2번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-4">
                <div className="ct-create-grid-label">자재수량</div>
                <input className="" type="text" inputMode="numeric" id="ctForm_materialQuantity" name="material_quantity" 
                        value={ctForm.material_quantity ?? ""} onChange={handleInput} placeholder="최소 13개 이상"
                        />

                <div className="ct-create-grid-label">샘플수량</div>
                <input className="" type="text" inputMode="numeric" id="ctForm_sampleQuantity" name="sample_quantity" 
                        value={ctForm.sample_quantity ?? ""} 
                        onChange={handleInput} 
                        />

                <div className="ct-create-grid-label">희망용량</div>
                <input className="" type="text" inputMode="decimal" id="ctForm_desiredVolume" name="desired_volume" 
                        value={ctForm.desired_volume ?? ""} 
                        onChange={handleInput}
                        />
                <select className="" id="ctForm_desiredVolumeUnitId" name="desired_volume_unit_id"
                        style={{marginLeft:"-10px", width:"40px"}}
                        value={ctForm.desired_volume_unit_id ?? ""} onChange={handleInput}>
                    {bulkUnit.map(e => (
                      <option key={e.idx} value={e.unit_id}>{e.unit_code}</option>
                    ))}
                </select>

                <div className="ct-create-grid-label">고객사 요청길이</div>

                <span style={{
                              textDecoration:"underline",
                              fontWeight:"bold",
                              color: "red",
                              marginLeft: "-5px"
                            }}>
                  ※ 튜브
                </span>
                <select id="ctForm_tubeInclusion" name="is_include_tube"
                        value={ctForm.is_include_tube} onChange={handleInput}
                        style={{marginLeft: "-20px"}}>
                  <option value={0}>미포함</option>
                  <option value={1}>포함</option>
                </select>
                <select id="ctForm_tubeCutting" name="is_cutting"
                        value={ctForm.is_cutting} onChange={handleInput}
                        style={{marginLeft: "-10px"}}>
                  <option value={0}>컷팅전</option>
                  <option value={1}>컷팅후</option>
                </select>

                <input className=""
                        type="text" 
                        inputMode="decimal"
                        id="ctForm_sleeveLength" name="sleeve_length"
                        style={{marginLeft: "-10px", marginRight: "-10px"}}
                        value={ctForm.sleeve_length ?? ""} onChange={handleInput}/>(mm)
              </div>
              {/* ↑ 의뢰자 관리사항 입력값 2번 라인 ↑ */}

              {/* ↓ 의뢰자 관리사항 입력값 3번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-5">
                <div className="ct-create-grid-label"><label htmlFor="ctForm_isEmergency">긴급</label></div>
                <input className="" type="checkbox" id="ctForm_isEmergency" checked={ctForm.is_emergency} name="is_emergency" 
                        style={{marginLeft:"-3px", height:"16px"}} onChange={handleInput}/>

                <div className="ct-create-grid-label"><label htmlFor="ctForm_isCpnp">CPNP</label></div>
                <input className="" type="checkbox" id="ctForm_isCpnp" checked={ctForm.is_cpnp} name="is_cpnp" 
                        style={{marginLeft:"-9px", height:"16px"}} onChange={handleInput}/>

                <div className="ct-create-grid-label"><label htmlFor="ctForm_isEng">영문(엑셀)</label></div>
                <input className="" type="checkbox" id="ctForm_isEng" checked={ctForm.is_eng} name="is_eng" 
                        style={{marginLeft:"1px", height:"16px"}} onChange={handleInput}/>
              </div>
              {/* ↑ 의뢰자 관리사항 입력값 3번 라인 ↑ */}

              {/* ↓ 의뢰자 관리사항 입력값 4번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-6">
                <div className="ct-create-grid-label">의뢰내용</div>
                <textarea className="" id="ctForm_requestContent" name="request_content" rows="3" ref={reqTextRef}
                          
                          value={ctForm.request_content ?? ""} onChange={handleInput}></textarea>

                <div className="ct-create-grid-label">비고</div>
                <textarea className="" id="ctForm_requestRemark" name="request_remark" ref={reqRmkTextRef}
                          value={ctForm.request_remark ?? ""} onChange={handleInput}></textarea>
              </div>
              {/* ↑ 의뢰자 관리사항 입력값 4번 라인 ↑ */}

            </div>
            {/* ↑ 의뢰자 관리사항 폼 ↑ */}

            {/* ↓ 제형 폼 ↓ */}
            <div id="lab" className="ct-create-information">

              {/* ↓ 제형담당연구소 관리사항 타이틀 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-top">
                <div className="ct-create-grid-label grid-title tal">◎ 제형담당연구소 관리사항</div>
              </div>
              {/* ↑ 제형담당연구소 관리사항 타이틀 ↑ */}

              {/* ↓ 제형 입력값 1번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-7">
                
                <div className="ct-create-grid-label">자재 의뢰일자</div>
                <input className="" type="date" id="ctForm_materialRequestDate" name="material_request_date" 
                        value={ctForm.material_request_date ?? ""} onChange={handleInput}/>

                <div className="ct-create-grid-label">제형 유형</div>
                <select className="" id="ctForm_sampleTypeId" name="sample_type_id" 
                        value={ctForm.sample_type_id ?? ""} 
                        onChange={(e) => {handleInput(e);
                                          syncRowsByLevel(e);}}>
                  {sampleType.map(e => (
                    <option key={e.idx} value={e.unit_id} data-extra={e.unit_code}>{e.unit_name}</option>
                  ))}
                </select>

                <div className="ct-create-grid-label">필요 벌크량</div>
                <input className="" type="text" inputMode="decimal" id="ctForm_requiredBulkVolume" name="required_bulk_volume"
                        readOnly={true}
                        value={ctForm.required_bulk_volume ?? ""} onChange={handleInput}/>

                <select className="" id="ctForm_requiredBulkVolumeUnitId" name="required_bulk_volume_unit_id"
                        style={{marginLeft:"-10px", width:"40px"}}
                        value={ctForm.required_bulk_volume_unit_id ?? ""} onChange={handleInput}>
                  {bulkUnit.map(e => (
                    <option key={e.idx} value={e.unit_id}>{e.unit_code}</option>
                  ))}
                </select>

                <div className="ct-create-grid-label">의뢰 벌크량</div>
                <input className="" type="text" inputMode="decimal" id="ctForm_requestBulkVolume" name="request_bulk_volume" ref={reqVolRef}
                        value={ctForm.request_bulk_volume ?? ""} onChange={handleInput}/>

                <select className="" id="ctForm_requestBulkVolumeUnitId" name="request_bulk_volume_unit_id"
                        style={{marginLeft:"-10px", width:"40px"}}
                        value={ctForm.request_bulk_volume_unit_id ?? ""} onChange={handleInput}>
                  {bulkUnit.map(e => (
                    <option key={e.idx} value={e.unit_id}>{e.unit_code}</option>
                  ))}
                </select>
                {isFailReqVolValid && (<span className="error-message">의뢰 벌크량이 필요 벌크량보다 적습니다.</span>)}
              </div>
              {/* ↑ 제형 입력값 1번 라인 ↑ */}

              {/* ↓ 제형 입력값 2번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-8" style={{margin:"10px 0px 10px 0px"}}>
                <div className="field">랩넘버</div>

                <div className="field">벌크량</div>

                <div className="field">점도</div>

                <div className="field">경도</div>

                <div className="field">비중</div>

                <div className="field">비율</div>

                <div className="field">특이사항</div>
              </div>
              {/* ↑ 제형 입력값 2번 라인 ↑ */}

              {/* ↓ 제형 입력값 3번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-8" style={{margin:"10px 0px 10px 0px"}}>
                {sampleRows.map((row, idx) => (
                  <React.Fragment key={idx}>
                    <div className="field">
                        <div className="ct-create-grid-label">
                        <span style={{margin:"0px 10px 0px 0px"}}>{row.idx}. 제형</span>
                        <div className="searchContainer">
                            <input className="" type="search" id={`sampleRows_sampleLabNo_${row.idx}`} name={`sample_lab_no_${row.idx}`} 
                                    value={row.sample_lab_no ?? ""} 
                                    onChange={(e) => handleInputSample(e, row.idx, "sample_lab_no", e.target.value)}
                                    />
                            {/* <button id="searchCtSeq" className="search" type="button">🔍</button> */}
                        </div>
                        </div>
                    </div>

                    <div className="field">
                        <div className="ct-create-grid-label">
                        <input type="text" inputMode="decimal" id={`sampleRows_bulkVolume_${row.idx}`} name={`bulk_volume_${row.idx}`} 
                                value={row.bulk_volume ?? ""} 
                                onChange={(e) => handleInputSample(e, row.idx, "bulk_volume", e.target.value)}/>
                                
                        <select id={`sampleRows_bulkVolumeUnitId_${row.idx}`} name={`bulk_volume_unit_id_${row.idx}`} 
                                value={row.bulk_volume_unit_id ?? ""}
                                onChange={(e) => handleInputSample(e, row.idx, "bulk_volume_unit_id", e.target.value)}>
                            {bulkUnit.map(e => (
                              <option key={e.idx} value={e.unit_id}>{e.unit_code}</option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div className="field">
                        <input type="text" inputMode="decimal" id={`sampleRows_sampleViscosity_${row.idx}`} name={`viscosity_${row.idx}`} 
                                value={row.viscosity ?? ""} 
                                onChange={(e) => handleInputSample(e, row.idx, "viscosity", e.target.value)}/>
                    </div>

                    <div className="field">
                        <input type="text" inputMode="decimal" id={`sampleRows_sampleHardness_${row.idx}`} name={`hardness_${row.idx}`} 
                                value={row.hardness ?? ""} 
                                onChange={(e) => handleInputSample(e, row.idx, "hardness", e.target.value)}/>
                    </div>

                    <div className="field">
                        <input type="text" inputMode="decimal" id={`sampleRows_sampleSg_${row.idx}`} name={`specific_gravity_${row.idx}`} 
                                value={row.specific_gravity ?? ""} 
                                onChange={(e) => handleInputSample(e, row.idx, "specific_gravity", e.target.value)}/>
                    </div>

                    <div className="field">
                        <div className="ct-create-grid-label">
                        <input type="text" inputMode="decimal" id={`sampleRows_sampleRatio_${row.idx}`} name={`sample_ratio_${row.idx}`} 
                                value={row.ratio ?? ""} 
                                onChange={(e) => handleInputSample(e, row.idx, "ratio", e.target.value)}/>

                        <select id={`sampleRows_sampleRatioTypeId_${row.idx}`} name={`sample_ratio_type_id_${row.idx}`} 
                                value={row.ratio_type_id ?? ""} 
                                onChange={(e) => handleInputSample(e, row.idx, "ratio_type_id", e.target.value)}>
                            {ratioType.map(e => (
                              <option key={e.idx} value={e.unit_id}>{e.unit_name}</option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div className="field">
                        <input type="text" id={`sampleRows_significant_${row.idx}`} name={`significant_${row.idx}`} readOnly
                                value={
                                        [
                                          row.significant?.sample_remark_1 &&
                                            `[캡슐, 원물 여부 : ${row.significant.sample_remark_1}]`,

                                          row.significant?.sample_remark_2 &&
                                            `[색소 여부 : ${row.significant.sample_remark_2}]`,

                                          row.significant?.sample_remark_3 &&
                                            `[특이 원료 여부 : ${row.significant.sample_remark_3}]`,

                                          row.significant?.sample_remark_4 &&
                                            `[안정도 : ${row.significant.sample_remark_4}]`,

                                          row.significant?.sample_remark_5 &&
                                            `[충전, 냉각 조건 : ${row.significant.sample_remark_5}]`,

                                          row.significant?.sample_remark_6 &&
                                            `[기타 : ${row.significant.sample_remark_6}]`,
                                        ].filter(Boolean)
                                         .join(" ")
                                } 
                                onChange={(e) => handleInputSample(e, row.idx, "significant", e.target.value)}/>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {/* ↑ 제형 입력값 3번 라인 ↑ */}
              
              {/* ↓ 제형 입력값 4번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-9">
                <div className="ct-create-grid-label">기타 특이사항</div>
                <textarea className="" id="ctForm_sampleEtc" name="sample_etc" rows="3" ref={sampleTextRef}
                        value={ctForm.sample_etc ?? ""} onChange={handleInput}></textarea>

                <div className="ct-create-grid-label">비고</div>
                <textarea className="" id="ctForm_sampleRemark" name="sample_remark" ref={sampleRmkTextRef}
                          value={ctForm.sample_remark ?? ""} onChange={handleInput}></textarea>
              </div>
              {/* ↑ 제형 입력값 4번 라인 ↑ */}

            </div> 
            {/* ↑ 제형 폼 ↑ */}

            {/* ↓ CT 관리 폼 ↓ */}
            <div id="manage" className="ct-create-information">

              {/* ↓ CT 관리사항 타이틀 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-top">
                <div className="ct-create-grid-label grid-title tal">◎ CT 관리사항</div>
              </div>
              {/* ↑ CT 관리사항 타이틀 ↑ */}

              {/* ↓ CT 관리 1번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-10">
                <div className="ct-create-grid-label">CT 접수일자</div>
                <input className="" type="date" id="" name="ct_receipt_date" 
                        value={ctForm.ct_receipt_date ?? ""} onChange={(e) => {
                          handleInput(e);
                          bindDueDate(e);
                        }}/>

                <div className="ct-create-grid-label">완료 예정일</div>
                <input className="" type="date" id="" name="ct_due_date" 
                        value={ctForm.ct_due_date ?? ""} onChange={handleInput}/>

                <div className="ct-create-grid-label">자재유형</div>
                <select className="" id="ctForm_materialLargeCategoryId" name="material_large_category_id" 
                        value={ctForm.material_large_category_id ?? ""} onChange={handleInput}>
                  {materialLargeCategory.map(e => (
                    <option key={e.idx} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <select className="" id="ctForm_materialSubCategory" name="material_sub_category"
                        style={{marginLeft:"-10px"}}
                        value={ctForm.material_sub_category ?? ""} onChange={handleInput}>
                  {materialMediumCategory.map(e => (
                    <option key={e.idx} value={e.value}>{e.label}</option>
                  ))}
                </select>
                {/* 
                <input className="" type="hidden" id="ctForm_materialSubCategoryId" name="material_sub_category" value={ctForm.material_sub_category ?? ""} onChange={handleInput}/>
                <div className="customSelectBox" ref={refCustomSelectBox} tabIndex={-1} onBlur={(e) => {outFocusModal(e)}}>
                  <pre className="toggleDropDown" onClick={toggleDropdown} style={{marginLeft:"-10px"}}>
                    {ctForm.material_sub_category.length > 0 ? ctForm.material_sub_category.join(",") : "중분류                                              ▼"}
                  </pre>
                  {isDropdownOpen ? (
                  <div className="dropDownOpen" style={{top: dropdownPosition.top, left: dropdownPosition.left, marginLeft:"-10px"}}>
                    {materialMediumCategory.map(k => (
                      <label key={k.id}>
                        <input type="checkbox" checked={ctForm.material_sub_category.includes(k.value)} name="material_sub_category" onChange={(e) => handleInput(e, k.value)}/>{" "}
                        {k.label}
                      </label>
                    ))}
                  </div>) : null}
                </div>
                */}

                <div className="ct-create-grid-label">CT 담당자</div>
                <input className="" type="search" id="ctForm_ctManagerIdText" name="" onChange={(e) => findData_ERP(e, "ctManager")} />
                <input className="" type="hidden" id="ctForm_ctManagerId" name="ct_manager_id" 
                        value={ctForm.ct_manager_id ?? ""} onChange={handleInput}/>

                <div className="ct-create-grid-label">진행상태</div>
                <select className="" id="ctForm_ctStatus" name="ct_status"
                        value={ctForm.ct_status ?? ""} onChange={handleInput}>
                  {statusOptions.map((e, idx) => (
                    <option key={idx} value={e.value}>{e.label}</option>
                  ))}
                </select>

                <div className="ct-create-grid-label"><label htmlFor="ctForm_isCtSuspend">보류</label></div>
                <input className="" type="checkbox" id="ctForm_isCtSuspend" checked={ctForm.is_ct_suspend} name="is_ct_suspend" 
                        onChange={(e)=> {
                                          handleInput(e);
                                          handledCtSuspendChange(e);
                                        }}
                        style={{marginLeft:"-24px", height:"16px"}}/>
                <input className="" type="search"  id="ctForm_ctSuspendReason" name="ct_suspend_reason" disabled={!ctForm.is_ct_suspend}
                        value={ctForm.ct_suspend_reason ?? ""} onChange={handleInput} placeholder="사유를 입력해주세요."
                        style={{ marginLeft:"-25px"}}/>
              </div>
              {/* ↑ CT 관리 1번 라인 ↑ */}
              
              {/* ↓ CT 관리 2번 라인 ↓ */}
              <div className="ct-create-grid ct-create-grid-line-11">
                <div className="ct-create-grid-label">종합 의견</div>
                <textarea className="" id="" name="ct_manage_summary" rows="3" ref={ctManageTextRef}
                          value={ctForm.ct_manage_summary ?? ""} onChange={handleInput}></textarea>

                <div className="ct-create-grid-label">비고</div>
                <textarea className="" id="" name="ct_manage_remark" ref={ctManageRmkTextRef}
                          value={ctForm.ct_manage_remark ?? ""} onChange={handleInput}></textarea>
              </div>
              {/* ↑ CT 관리 2번 라인 ↑ */}

            </div> 
            {/* ↑ CT 관리 폼 ↑ */}

            {/* ↓ 등록 폼 제어 버튼 영역 ↓ */}
            {mode === "update" ? (
              <div className="form-buttons">
                <button type="button" className="btn-primary" disabled={loading} onClick={(e) => saveRequest(e)}>
                    {loading ? "수정 중" : "수정"}</button>
                <button type="button" className="btn-primary" onClick={resetForm}>신규등록</button>
              </div>
            ) : (
              <div className="form-buttons">
                <button type="button" className="btn-primary" disabled={loading} onClick={(e) => saveRequest(e)}>
                    {loading ? "등록 중" : "등록"}</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>초기화</button>
              </div>
            )
            }

            {/* ↑ 등록 폼 제어 버튼 영역 ↑ */}

            {/* ↓ 특이사항 입력 모달 ↓ */}
            {isOpenModalRemark.open && (
              <div className="modal-overlay">
                <div className="modal-content" style={{width:"600px"}} ref={refModalSetRemark}>
                  <table className="modal-table">
                    <tbody>
                      <tr>
                        <th className="tac">캡슐 또는 원물 함유 여부</th>
                        <td><input id="sample_remark_1" name="sample_remark_1" type="search" 
                                    value={sampleRows[currentSampleRowIdx]?.significant?.sample_remark_1} 
                                    onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">색소 함유 여부</th>
                        <td><input id="sample_remark_2" name="sample_remark_2" type="search" 
                                    value={sampleRows[currentSampleRowIdx]?.significant?.sample_remark_2} 
                                    onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">특이 원료 함유 여부</th>
                        <td><input id="sample_remark_3" name="sample_remark_3" type="search" 
                                    value={sampleRows[currentSampleRowIdx]?.significant?.sample_remark_3} 
                                    onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">안정도 특이사항</th>
                        <td><input id="sample_remark_4" name="sample_remark_4" type="search" 
                                    value={sampleRows[currentSampleRowIdx]?.significant?.sample_remark_4} 
                                    onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">충전 및 냉각 조건</th>
                        <td><input id="sample_remark_5" name="sample_remark_5" type="search" 
                                    value={sampleRows[currentSampleRowIdx]?.significant?.sample_remark_5} 
                                    onChange={handleSpecialChange} /></td>
                      </tr>
                      <tr>
                        <th className="tac">기타 특이사항</th>
                        <td><input id="sample_remark_6" name="sample_remark_6" type="search" 
                                    value={sampleRows[currentSampleRowIdx]?.significant?.sample_remark_6} 
                                    onChange={handleSpecialChange} /></td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="modal-buttons">
                    <button onClick={handleSpecialSubmit} className="btn-primary">입력완료</button>
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
            <div className="modal-content border" style={{width:"490px"}} ref={refModalSearchCtSeq}>
              <div className="modal-title tac">차수 조회</div>

              {/* ↓ 차수 조회 폼 ↓ */}
              <form id="ctSeqHistory" onKeyDown={searchEnter}>
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
                        <input type="search" id="searchClient" name="search_client" 
                                value={historyForm.search_client ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="Ex.. 고객사"/>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">샘플명</th>
                      <td>
                        <input type="search" id="searchSample" name="search_sample" 
                                value={historyForm.search_sample ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="Ex.. 샘플명"/>
                      </td>
                    </tr>

                    <tr>
                      <th className="tac">검색어</th>
                      <td>
                        <input type="search" id="searchKeyword" name="search_keyword" 
                                value={historyForm.search_keyword ?? ""} onChange={(e) => handleSearchInput(e)} 
                          placeholder="Ex.. 랩넘버 / Ct No / 의뢰 내용"/>
                        </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="modal-buttons">
                <button className="btn-primary" onClick={(e) => {searchCtSeqHistory(e)}}>검색</button>
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
                      <th>Lab No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResult.length > 0 ? (
                      paginatedResult.map((ct, index) => (
                        <tr key={index}>
                          <td>
                            <input type="radio" id={`selectCt_${ct.ct_request_id}`} name="select_ct" 
                                    value={ct.ct_request_id}
                                    // checked={selectedCtId === ct.ct_request_id}
                                    onChange={(e) => handleCtData(e, ct)}
                                    />
                          </td>
                          <td>
                            <label htmlFor={`selectCt_${ct.ct_request_id}`}>{ct.ct_no}</label>
                          </td>
                          <td>
                            <label htmlFor={`selectCt_${ct.ct_request_id}`}>{ct.client_name}</label>
                          </td>
                          <td>
                            <label htmlFor={`selectCt_${ct.ct_request_id}`}>{ct.sample_name}</label>
                          </td>
                          <td>
                            <label htmlFor={`selectCt_${ct.ct_request_id}`}>{ct.ct_lab_no}</label>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="tac">조회된 결과가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* ↑ 조회 결과 목록 ↑ */}

              {/* ↓ 페이징 바 ↓ */}
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={moveFirst}>⏮</button>
                <button disabled={currentPage === 1} onClick={movePrev}>◀</button>
                {compactPages.map((p) => (
                  <button key={p} className={p === currentPage ? "active" : ""}
                    onClick={() => movePage(p)} >
                    {p}
                  </button>
                ))}
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={moveNext}>▶</button>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={moveLast}>⏭</button>
              </div>
              {/* ↑ 페이징 바 ↑ */}

              {/* ↓ 건수 및 차수 표시 ↓ */}
              <div className="jcc" style={{display:"flex", gap:"40px", margin:"10px 0px -10px 0px"}}>
                <div className="modal-title">
                  {ctData.ct_no 
                  ? `[${ctData.ct_no}] 현재 차수 : ${ctData.ct_test_seq}차 / 다음 차수 : ${(ctData.ct_test_seq)+1}차`
                  : "선택된 CT번호가 없습니다."}
                </div>
              </div>
              {/* ↑ 건수 및 차수 표시 ↑ */}

              {/* ↓ 완료 버튼 ↓ */}
              <div className="modal-buttons">
                <button className="btn-primary" onClick={initializeCtData}>선택</button>
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