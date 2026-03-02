/**
 * 파일명 : CT_Request_Read.jsx
 * 용도 : CT 의뢰 목록 조회
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import axios from "axios";

import Search from "/src/components/Search";
import Internal_SubNav from "/src/modules/InternalTest/Internal_SubNav";
// import PRE_SubNav from "/src/components/SubNav";

import { AuthContext } from "/src/contexts/AuthContext";

import { MockData } from "/src/components/Common";
import { Common } from "/src/components/Common";
import * as Utils from "/src/components/Utils";
import { Link, useNavigate } from "react-router-dom";

export default function Internal_Request_Read() {


  /* ============================== 페이지 변수 ============================== */
  const navigate = useNavigate();
  const G_TODAY = Common.G_TODAY; // 오늘 날짜
  const G_STARTDAY = Common.G_STARTDAY; // 오늘로부터 7일

  // ■ 유저정보 조회
  const { user } = useContext(AuthContext);
  const companyId = user.company_id;
  const userId = user.user_id;
  const userName = user.user_full_name;


  /**
   * 페이지 그룹 전역 변수
   */
  const G_PAGEGROUPCOUNT = Common.pageGroupCount;

  /** -----------------------------
   * 초기 컬럼 정의 (헤더/바디 동기화)
   * "key" : 데이터 키, "label" : 표시 라벨, "sortable" : 정렬 가능 여부
   * ------------------------------ */
  const initialColumns = [
    {"key" : "request_no", "label" : "의뢰번호", "sortable" : true}
    ,{"key" : "request_date", "label" : "등록일", "sortable" : true}
    ,{"key" : "test_start_date", "label" : "시험시작일", "sortable" : true}
    ,{"key" : "test_end_date", "label" : "시험완료일", "sortable" : true}
    ,{"key" : "request_user", "label" : "의뢰자", "sortable" : true}
    ,{"key" : "class", "label" : "구분", "sortable": true}
    ,{"key" : "item_name", "label" : "제품명", "sortable" : true}
    ,{"key" : "lab_no", "label" : "Lab No.", "sortable" : true}
    ,{"key" : "lot_no", "label" : "Lot No.", "sortable" : true}
    ,{"key" : "remark_sample_info", "label" : "제형정보", "sortable" : true}
    ,{"key" : "ingCode", "label" : "성분명", "sortable" : true}
    ,{"key" : "testResult", "label" : "결과", "sortable" : true}


    // {"key" : "docNo", "label" : "문서번호", "sortable" : true}
    // ,{"key" : "isFin", "label" : "시험완료여부", "sortable" : true}
    // ,{"key" : "isReg", "label" : "보고서등록", "sortable" : true}
    // ,{"key" : "classification", "label" : "구분", "sortable" : true}
    // ,{"key" : "reqFrom", "label" : "의뢰일", "sortable" : true}
    // ,{"key" : "testDate", "label" : "시험일", "sortable" : true}
    // ,{"key" : "midTermResultDate", "label" : "중간결과예정일", "sortable" : true}
    // ,{"key" : "resultDate", "label" : "시험완료예정일", "sortable" : true}
    // ,{"key" : "reqUser", "label" : "의뢰자", "sortable" : true}
    // ,{"key" : "testUser", "label" : "시험담당자", "sortable" : true}
    // ,{"key" : "custName", "label" : "업체명", "sortable" : true}
    // ,{"key" : "itemName", "label" : "품명", "sortable" : true}
    // ,{"key" : "labNo", "label" : "Lab No.", "sortable" : true}
    // ,{"key" : "lotNo", "label" : "Lot No.", "sortable" : true}
    // ,{"key" : "preservativeJudge", "label" : "판정", "sortable" : true}
    // ,{"key" : "rmName", "label" : "원료명", "sortable" : true}
    // ,{"key" : "numerator", "label" : "함량(%)", "sortable" : true}
    // ,{"key" : "guideNo", "label" : "가이드라인", "sortable" : true}
    // ,{"key" : "itemType", "label" : "제품유형", "sortable" : true}
    // ,{"key" : "water", "label" : "Water", "sortable" : true}
    // ,{"key" : "chelating", "label" : "Chelating Agent", "sortable" : true}
    // ,{"key" : "surfactant", "label" : "Surfactant", "sortable" : true}
    // ,{"key" : "ethanol", "label" : "Ethanol", "sortable" : true}
    // ,{"key" : "lipid", "label" : "Lipid", "sortable" : true}
    // ,{"key" : "silicone", "label" : "Silicone", "sortable" : true}
    // ,{"key" : "powder", "label" : "Powder", "sortable" : true}
    // ,{"key" : "polyol", "label" : "Polyol", "sortable" : true}
    // ,{"key" : "glycerine", "label" : "Glycerine", "sortable" : true}
    // ,{"key" : "propanediol", "label" : "Propanediol", "sortable" : true}
    // ,{"key" : "dpg", "label" : "DPG", "sortable" : true}
    // ,{"key" : "pg", "label" : "PG", "sortable" : true}
    // ,{"key" : "bg", "label" : "BG", "sortable" : true}
    // ,{"key" : "ph", "label" : "pH", "sortable" : true}
  ];


  /**
   * CT 의뢰 목록 mock 데이터
   */
  const initialPosts = MockData.ct_list;


  /**
   * 직원목록 Mock 데이터
   */
  const employeeList = MockData.employeeList;

  /**
   * 문서번호 Mock 데이터
   */
  const docNo = MockData.docNo;

  /**
   * 업체명 Mock 데이터
   */
  const custName = MockData.custName;

  /**
   * 품명 Mock 데이터
   */
  const itemName = MockData.itemName;

  /**
   * labNo Mock 데이터
   */
  const labNo = MockData.labNo;

  /**
   * lotNo Mock 데이터
   */
  const lotNo = MockData.lotNo;

  /**
   * 방부력테스트 Mock 데이터
   */
  const preList = MockData.pre_list;

  /**
   * 내부성분분석 Mock 데이터
   */
  const internalList = MockData.internal_list;


  /**
   * 접수 현황 mock 데이터
   */
  const statusOptions = [
    {"id" : 0, "label" : "전체", "value" : ""},
    {"id" : 1, "label" : "영업의뢰", "value" : "S"},
    {"id" : 2, "label" : "제형의뢰", "value" : "L"},
    {"id" : 3, "label" : "CT접수", "value" : "C_REC"},
    {"id" : 4, "label" : "CT진행", "value" : "C_PRG"},
    {"id" : 5, "label" : "CT보류", "value" : "C_SUS"},
    {"id" : 6, "label" : "CT취소", "value" : "C_CAN"},
    {"id" : 7, "label" : "완료(당일)", "value" : "COMP_OTD"},
    {"id" : 8, "label" : "완료(1주)", "value" : "COMP_OTW"},
    {"id" : 9, "label" : "완료(최종)", "value" : "COMP_FIN"},
  ];


  /**
   * 담당자 유형 mock 데이터
   */
  const managerOptions = [
    {"id" : 0, "label" : "담당자유형", "value" : ""},
    {"id" : 1, "label" : "제형담당자", "value" : "M"},
    {"id" : 2, "label" : "제형담당부서", "value" : "D"},
    {"id" : 3, "label" : "영업담당자", "value" : "S"},
    {"id" : 4, "label" : "CT담당자", "value" : "C"},
  ];


  /**
   * CT 유형 mock 데이터
   */
  const ctOptions = [
    {"id" : 0, "label" : "전체 CT", "value" : ""},
    {"id" : 1, "label" : "고객사 CT", "value" : "C"},
    {"id" : 2, "label" : "부분 CT", "value" : "P"},
  ];


  /**
   * 판정 mock 데이터
   */
  const judgementOptions = [
    {"id" : 0, "label" : "판정여부", "value" : ""},
    {"id" : 1, "label" : "적합", "value" : "G"},
    {"id" : 2, "label" : "부적합", "value" : "NG"},
    {"id" : 3, "label" : "고객사 협의 필요", "value" : "C_NG"},
    {"id" : 4, "label" : "고객사 협의 적합", "value" : "C_G"},
    {"id" : 5, "label" : "시험 중", "value" : "T_ING"},
    {"id" : 6, "label" : "시험 중단", "value" : "T_CAN"},
    {"id" : 7, "label" : "접수 보류", "value" : "R_SUS"},
    {"id" : 8, "label" : "판정불가", "value" : "N/A"},
  ];

  const classificationList = [
    {"id" : 0, "label" : "코스메카코리아", "value" : ""}
    ,{"id" : 1, "label" : "코스메카차이나 / 잉글우드랩 / 기타", "value" : ""}
    ,{"id" : 2, "label" : "안정도 대응", "value" : ""}
  ]

  const categories = ["", "공지", "제품", "마케팅", "기술"];

  /* ============================== 훅 관리 ============================== */
  /**
   * --- API 통신에 사용될 state 객체 ---
   * result, setResult : 결과값
   * loading, setLoading : request 요청 응답 여부
   * error, setError : 응답 오류 여부
   */
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);


  /**
   * 조회 조건 입력 폼 객체
   */
  const [searchForm, setSearchForm] = useState({
    "search_type" : "C_REQ",        // 조회조건 (최초에는 CT 의뢰일자로 지정)
    "date_from" : G_STARTDAY,       // 조회기간 시작
    "date_to" : G_TODAY,            // 조회기간 끝
    "ct_code" : "",                 // CT 의뢰번호
    "ct_status" : "",               // 접수 현황
    "manager_type" : "",            // 담당자유형
    "manager" : "",                 // 담당자
    "client_id" : "",               // 고객사
    "sample_id" : "",               // 샘플
    "ct_type" : "",                 // CT 유형
    "material_type" : "",           // 자재사양
    "material_supplier_id" : "",    // 자재업체
    "lab_no" : "",                  // 랩넘버
    "judgement" : "",               // 판정
    "is_emergency_y" : "",          // 긴급 완료
    "is_emergency_n" : "",          // 긴급 미완료
    "is_cpnp_y" : "",               // cpnp 완료
    "is_cpnp_n" : "",               // cpnp 미완료
    "is_eng_y" : "",                // 영문 완료
    "is_eng_n" : "",                // 영문 미완료
    "report_content" : ""           // 성적서 내용
    ,"classification" : ""
    ,"ph" : ""
  });


  /* 컬럼 순서/정의 상태 (Drag & Drop 대상) */ 
  const [columns, setColumns] = useState(initialColumns);


  /* 데이터/상태 */
  const [posts, setPosts] = useState(initialPosts);

  /* 방부력테스트 데이터/상태 */
  const [prePosts, setPrePosts] = useState(preList);

  const [internalPosts, setInternalPosts] = useState(internalList);

  /* 정렬 상태 */
  const [sortKey, setSortKey] = useState(null); // ex) "title" | "labNo" | ...
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"


  /**
   * 의뢰 목록 필터 상태
   * query : 필터 검색어
   * from : 작성일 From
   * to : 작성일 To
   * type : 글 유형 (Ex. 전체, 고객사CT, 부분CT)
   */
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");


  /**
   * 유효성 검증 state - 조회 조건 입력 시 날짜 검증 등에 사용.
   */
  const [isValidated, setIsValidated] = useState(true);

  /**
   * 행 클릭 상태
   */
  const [selectedRow, setSelectedRow] = useState({
    "rowId" : ""
    ,"value" : false
  });

  // const handleSelectedRow = () => {
  //   setSelectedRow(true);
  // };

  /**
   * 긴급, CPNP, 영문(엑셀) 체크박스 제어 state
   */
  const [isEmergencyOpen, setIsEmergencyOpen] = useState({
    "isEmergency_Y" : true,
    "isEmergency_N" : true
  });

  const [isCpnpOpen, setIsCpnpOpen] = useState({
    "isCpnp_Y" : true,
    "isCpnp_N" : true
  });

  const [isEngOpen, setIsEngOpen] = useState({
    "isEng_Y" : true,
    "isEng_N" : true
  });


  /**
   * 검색 디바운스
   */
  const [debouncedQuery, setDebouncedQuery] = useState("");


  /** --------------------------------------------
   * Drag & Drop 상태 관리
   * WHY : 렌더링을 유발하면 드래그가 끊기기 때문에 
   *       드래그한 index, 드래그 중인지 여부 등을 ref로 관리
   * -------------------------------------------- */
  const dragIndexRef = useRef(null);
  const draggingFlagRef = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);


  /**
   * ----- 경고 모달 관리 -----
   * isOpenModalAlert, setIsOpenModalAlert : 경고 모달 활성화 여부
   * refModalAlert : 경고 모달 컴포넌트 참조
   * dateToRef, dateFromRef : 날짜 검증 시 포커스 할당을 위한 ref
   */
  const [isOpenModalAlert, setIsOpenModalAlert] = useState({
    "open" : false,
    "position" : { 
      "top" : 0,
      "left" : 0 
    },
  });
  const refModalAlert = useRef(null);
  const dateToRef = useRef(null);
  const dateFromRef = useRef(null);


  /** --------------------------------------------
   * 검색 디바운스
   * WHY : 타이핑할 때 마다 필터링이 매번 실행되면 성능 저하 → 300ms 지연
   * -------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);


  /**
   * 유효성 검증 모달 닫기
   */
  useEffect(() => {

    const closeModalAlert = (e) => {
      if (refModalAlert.current && !refModalAlert.current.contains(e.target)) {
        setIsOpenModalAlert({
          "open" : false,
          "position" : {
            top: "",
            left: ""
          },
        });
      }
    }

    document.addEventListener("mousedown", closeModalAlert);

    return () => {
      document.removeEventListener("mousedown", closeModalAlert);
    }

  }, []);


  /** --------------------------------------------
   * 컬럼 클릭 시 정렬
   * 
   * @param key : 테이블 헤더의 정렬 키값
   * -------------------------------------------- */
  const handleSort = (key) => {

    // 드래그 중에 클릭 이벤트가 섞이는 것을 방지하기 위해 draggingFlagRef로 클릭 무시 처리함
    if (draggingFlagRef.current) return;

    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };


  /**
   * filteredSorted : 검색 + 필터 + 정렬 결과를 메모이제이션한 목록
   * ----------------------------------------------------
   * HOW : useMemo를 사용하여 posts, 검색어(debouncedQuery), 날짜범위(from/to),
   *       정렬 기준(sortKey, sortDir)이 변경될 때만 재계산한다.
   *       1) 검색어 전처리(소문자 + trim)
   *       2) posts 리스트에서 검색어, 카테고리, 기간 조건을 모두 충족하는 데이터만 필터링
   *       3) 정렬 기준이 있으면 Utils.compareValues()를 이용해 정렬(asc/desc)
   *       4) 정렬 기준이 없으면 필터링된 리스트 그대로 반환
   *
   * WHY : 검색/필터/정렬이 복합적으로 적용된 리스트는 계산 비용이 크므로
   *       불필요한 재렌더링을 방지하고 성능을 최적화하기 위해 useMemo로 캐싱한다.
   *       입력 값 변화가 없을 때는 기존 계산값을 재사용하여 렌더링 부담을 낮춘다.
   */
  const filteredSorted = useMemo(() => {

    // 검색어 최소화(대소문자 무시)
    const q = debouncedQuery.trim().toLowerCase();
    const filtered = result.filter((item) => {

       // ID, idx 를 기준으로 간단 검색 수행
      const okQuery =
        !q ||
        String(item.id ?? "").toLowerCase().includes(q) ||
        String(item.idx ?? "").toLowerCase().includes(q);

      // 카테고리 선택 필터
      const okCat = !type || item.category === type;

      // createdAt 기준 기간 필터 (요청한 날짜키와 별개로 유지)
      const d = item.createdAt ? new Date(item.createdAt) : null;
      const okFrom = !from || (d && d >= new Date(from));
      const okTo = !to || (d && d <= new Date(to));

      return okQuery && okCat && okFrom && okTo;

    });

    if (!sortKey) return filtered;
    const sign = sortDir === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => Utils.compareValues(sortKey, a, b) * sign);
  }, [result, debouncedQuery, type, from, to, sortKey, sortDir]);

  
  /** ------------------------------------------------
   * onDragStart : Drag & Drop 핸들러
   * ----------------------------------------------------
   * HOW : 컬럼 순서 변경 기능
   *       index 기반으로 이동 처리
   * WHY : Firefox 호환 위해 dataTransfer.setData 필요
   * 
   * @param e : 이벤트 호출 컴포넌트
   * ------------------------------------------------ */
  const onDragStart = (index) => (e) => {
    dragIndexRef.current = index;
    draggingFlagRef.current = true;
    setDraggingIndex(index);
    setDragOverIndex(null);

    e.dataTransfer.effectAllowed = "move";
    // Firefox 호환을 위해 data 설정
    e.dataTransfer.setData("text/plain", columns[index].key);
  };


  /**
   * onDragOver : 드래그 중인 항목이 다른 항목 위로 이동할 때 실행되는 이벤트
   * ----------------------------------------------------
   * HOW : drop을 허용하기 위해 반드시 e.preventDefault() 필요
   *       dragOverIndex(현재 마우스가 올라간 index)를 업데이트하여 UI 하이라이트 처리
   * WHY : dropEffect는 브라우저 Drag UI 표시 목적
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const onDragOver = (index) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) setDragOverIndex(index);
  };


  /**
   * onDragEnter : drag 요소가 항목 영역에 처음 진입했을 때 실행
   * ----------------------------------------------------
   * WHAT : onDragOver와 역할은 비슷하지만, Enter 시점에 로직을 다르게 하고 싶을 때 분리해서 사용
   *        dragOverIndex 업데이트만 수행
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const onDragEnter = (index) => (e) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };


  /**
   * onDrop : 드롭 시 실행되는 이벤트
   * ----------------------------------------------------
   * HOW : dragStart에서 저장한 시작 index(from)
   *       drop된 index(to)
   *       동일 위치 드롭이면 아무 작업 없이 종료
   *       배열 요소를 splice로 이동시키는 방식으로 실제 재배치
   * 
   * @param index : 컬럼 인덱스
   * @param e : 이벤트 호출 컴포넌트
   */
  const onDrop = (index) => (e) => {
    e.preventDefault();
    const from = dragIndexRef.current;  // 드래그 시작 index
    const to = index;                   // 드롭 대상 index

    // 예외 처리: drag가 제대로 시작되지 않았거나 동일 위치라면 무시
    if (from == null || to == null || from === to) {
      cleanupDragState();
      return;
    }

    // 실제 배열 재배치
    setColumns((cols) => {
      const next = [...cols];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

    // 드래그 관련 상태 초기화
    cleanupDragState();
    
  };


  /**
   * onDragEnd : 드래그 종료 시 호출되는 이벤트
   * ----------------------------------------------------
   * HOW : 마우스가 리스트 밖에서 종료되거나
   *       정상적으로 드롭된 후에도 호출됨
   *       최종적으로 drag 상태를 정리하는 역할
   */
  const onDragEnd = () => cleanupDragState();


  /**
   * cleanupDragState : drag & drop 관련 내부 상태를 모두 초기화하는 공용 함수
   * ----------------------------------------------------
   * HOW : dragIndexRef : 드래그 시작 index
   *       draggingIndex : UI에서 드래그 중 표시용
   *       dragOverIndex : 하이라이트 표시 index
   *       draggingFlagRef : 클릭으로 인한 정렬(헤더 정렬)과 드래그 이벤트 충돌 방지 위한 플래그
   *
   * WHY : : 드래그 종료 직후 click 이벤트가 이어서 발생하는 브라우저 기본 동작 때문에
   *         클릭 정렬이 바로 실행되지 않도록 이벤트 한 턴 뒤에 플래그를 해제함
   *         따라서, setTimeout(0)을 사용
   */
  const cleanupDragState = () => {
    dragIndexRef.current = null;  // 드래그 시작 index 초기화
    setDraggingIndex(null);       // 드래그 중 강조 UI 제거
    setDragOverIndex(null);       // 드롭 대상 강조 UI 제거

    // 클릭정렬이 바로 튀지 않도록 드래그 플래그 해제 지연
    setTimeout(() => (draggingFlagRef.current = false), 0);
  };


  /**
   * handleInputValue : input 값 변경 시 form 객체에 데이터 바인딩
   * ----------------------------------------------------
   * @param e : 이벤트 호출 컴포넌트
   */
  const handleInputValue = (e) => {
    const { name, type, value, checked } = e.target;
    
    if (type === "checkbox") {
      setSearchForm((prev) => ({ ...prev, [name]: checked ? "Y" : ""}));
      return;
    } else {
      setSearchForm((prev) => ({ ...prev, [name]: value }));
      return;
    }

  };


  /**
   * handleCheckBox : [긴급], [CPNP], [영문(엑셀)] 체크박스 선택 시 [완료], [미완료] 활성화 여부 제어
   * ----------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const handleCheckBox = (e) => {
    
    const { name, checked } = e.target;
  
    switch(name) {

      case "is_emergency" : 
        (() => {
            setIsEmergencyOpen((prev) => ({...prev,
              "isEmergency_Y" : !prev.isEmergency_Y,
              "isEmergency_N" : !prev.isEmergency_N
            }));

            if(checked === false) {
              setSearchForm((prev) => ({ ...prev, ["is_emergency_y"]: "" }));
              setSearchForm((prev) => ({ ...prev, ["is_emergency_n"]: "" }));
            }
        })();
        break;

      case "is_cpnp" : 
        (() => {
          setIsCpnpOpen((prev) => ({...prev,
            "isCpnp_Y" : !prev.isCpnp_Y,
            "isCpnp_N" : !prev.isCpnp_N
          }));

          if(checked === false) {
            setSearchForm((prev) => ({ ...prev, ["is_cpnp_y"]: "" }));
            setSearchForm((prev) => ({ ...prev, ["is_cpnp_n"]: "" }));
          }
        })();
        break;

      case "is_eng" : 
        (() => {
          setIsEngOpen((prev) => ({...prev,
            "isEng_Y" : !prev.isEng_Y,
            "isEng_N" : !prev.isEng_N
          }));

          if(checked === false) {
            setSearchForm((prev) => ({ ...prev, ["is_eng_y"]: "" }));
            setSearchForm((prev) => ({ ...prev, ["is_eng_n"]: "" }));
          }
        })();
        break;

    }

  };


  /**
   * changeManagerType : 담당자 유형 변경 처리 함수
   * ----------------------------------------------------
   * WHY : 
   *   - 담당자로 선택 시 직원 목록을 표시
   *   - 담당부서 선택 시 부서 목록을 표시
   * 
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const changeManagerType = (e) => {

    const { value } = e.target;

    // 샘플 코드
    if(value == "담당자부서") {
      // 목록을 부서 목록으로 변경
    } else if(value == "담당자") {
      // 목록을 직원 목록으로 변경
    }
  };


  /**
   * checkValid : 날짜 유효성 체크 함수
   * ----------------------------------------------------
   * WHY : date_from 날짜가 date_to 날짜보다 미래일 수 없음.
   * 
   * @returns : 검증 여부에 따라 Boolean 반환
   */
  const checkValid = async () => {

    const isDateFrom = Utils.isValidDate(new Date(searchForm.date_from))
    const isDateTo = Utils.isValidDate(new Date(searchForm.date_to))
    
    // 시작일자가 종료일자보다 미래일 수 없음.
    if(searchForm.date_from > searchForm.date_to || !isDateFrom || !isDateTo) {
      setIsValidated(false);
      if (!isDateFrom) {
        controllAlertModal(true, dateFromRef);
        dateFromRef.current.focus();
      } else if(!isDateTo) {
        controllAlertModal(true, dateToRef);
        dateToRef.current.focus();
      } else {
        dateToRef.current.focus();
        controllAlertModal(true);
      }
      return false;
    } else {
      setIsValidated(true);
      controllAlertModal(false);
      return true;
    }

  };


  /**
   * controllAlertModal : 유효성 검증 후 여부에 따라 경고창 표시
   * ----------------------------------------------------
   */
  const controllAlertModal = (isOpen = "", ref = dateToRef) => {

    if(isOpen) {
      const rect = ref.current.getBoundingClientRect();

      setIsOpenModalAlert({
        "open" : true,
        "position" : {
          top: rect.bottom + window.scrollY + 5,
          left: rect.left + window.scrollX
        },
      });
    } else {
      setIsOpenModalAlert({
        "open" : false,
        "position" : {
          top: "",
          left: ""
        },
      });
    }

  };


  /**
   * resetSearchForm : form 객체 초기화 함수
   */
  const resetSearchForm = () => {
    setSearchForm({
      "search_type" : "C_REQ", // 기본값은 CT 의뢰일자로 할당
      "date_from" : G_STARTDAY,
      "date_to" : G_TODAY,
      "ct_code" : "",
      "ct_status" : "",
      "manager_type" : "",
      "manager" : "",
      "client_id" : "",
      "sample_id" : "",
      "ct_type" : "",
      "material_type" : "",
      "material_supplier_id" : "",
      "lab_no" : "",
      "judgement" : "",
      "is_emergency_y" : "",
      "is_emergency_n" : "",
      "is_cpnp_y" : "",
      "is_cpnp_n" : "",
      "is_eng_y" : "",
      "is_eng_n" : "",
      "report_content" : ""
    })
  };


  /** ----------------------------------
   * pageSize : 페이지당 표시할 항목 수
   * 초기값은 15, 클라이언트 단에서 변경 가능.
   * ---------------------------------- */
  const [pageSize, setPageSize] = useState(15);


  /** ----------------------------------
   * currentPage : 현재 페이지
   * pageSize 변경 시 현재 페이지를 1로 초기화
   * ---------------------------------- */
  const [currentPage, setCurrentPage] = useState(1);


  /**
   * handlePageSizeChange : 페이지 사이즈 조정 함수
   * ----------------------------------------------------
   * HOW : pageSize가 변경되면 기존 currentPage 범위가 깨지므로 항상 1페이지로 이동
   *       Number()로 문자열 → 숫자 변환
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };


  /**
   * 전체 페이지 수 (filteredSorted : 검색/정렬 적용된 최종 결과)
   * ----------------------------------------------------
   * HOW : 총 데이터 수 / pageSize 로 총 페이지 개수를 계산
   * WHY : 실시간으로 리스트 개수가 변할 때마다 페이지 수가 자동으로 갱신됨
   */
  const totalPages = Math.ceil(filteredSorted.length / pageSize);


  /**
   * paginatedPosts
   * ----------------------------------------------------
   * HOW : 현재 페이지에 해당하는 데이터만 slice해서 렌더링용 배열 생성
   */
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, pageSize, currentPage]);


  /**
   * 페이지 번호 배열
   * ----------------------------------------------------
   * HOW : 현재 페이지를 기준으로 10개 단위 페이지 그룹 계산
   * 
   * Ex : currentPage = 7  → 1~10
   *      currentPage = 15 → 11~20
   */
  const compactPages = useMemo(() => {
    const groupStart = Math.floor((currentPage - 1) / G_PAGEGROUPCOUNT) * G_PAGEGROUPCOUNT + 1;  // 그룹 시작 페이지
    const groupEnd = Math.min(groupStart + 9, totalPages);           // 그룹 마지막 페이지

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



  /*  ################################################
  #   ______                __           __
  #  / ____/_______  ____ _/ /____  ____/ /
  # / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #/ /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #\____/_/   \___/\__,_/\__/\___/\__,_/   
  # Created : 2025.01.23
  # Author : Choi Yeon Woong
  # Description : 성분분석-내부 [조회] 로직
  # Modified : 
  ################################################ */

  //================== ⭐ 페이지 useEffect 관리 ⭐ ==================
  /**
   * ■ 최초 페이지 조회시 모드 확인
   */
  useEffect(() => {
    initialSearch();
  }, [])

  const initialSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // 요청 파라미터 객체 (초기 searchForm 값 사용)
      const params = {
        search_type: "REQ",
        company_id: companyId,
      };
      
      // 응답 객체
      const res = await axios.get("/api/ltms/internal/request/read", { params });
      const resultData = res.data.result;
      const rmData = res.data.rmResult;
      console.log(`--[Read] resultData : ${resultData.map(i => {return console.log(i)})}`);
      console.log(`--[Read] rmData : ${rmData.map(i => { return console.log(i) })}`);
      // setResult(resultData);
      setResult(() => {
        const rmGrouped = rmData.reduce((acc, item) => {
          (acc[item.request_id] ??= []).push(item);
          return acc;
        }, {});
        
        return resultData.map(req => ({
          ...req
          ,items: rmGrouped[req.request_id] ?? []
        }));

      });

    } catch (err) {
      if (err.response) {
        // 서버가 4xx, 5xx 에러를 반환한 경우
        console.error("API Error:", err.response);
        const errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
        alert(errMsg);
        setError(errMsg);
        
      } else if (err.request) {
        // 요청은 갔지만 응답이 없는 경우
        console.error("No Response:", err.request);
        setError("서버 응답이 없습니다. 네트워크 상태를 확인하세요.");
      } else {
        // 기타 에러
        console.error("Request Error:", err.message);
        setError("요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  /**
   * search : CT 목록 조회 함수
   * ----------------------------------------------------
   * HOW : 검색 조건을 매개변수로 삼아 조건에 해당하는 CT 목록을 조회
   * 
   * @param e : 이벤트 호출 컴포넌트
   */
  const search = async (e) => {

    e.preventDefault();

    if(!await checkValid()) return;

    setLoading(true);
    setError(null);

    try{
      // 요청 파라미터 객체
      const params = Utils.cleanParams(searchForm);
      console.log(params);
      // return;
      // 응답 객체
      const res = await axios.get("/api/ltms/internal/read", { params });

      setResult(res.result);

    } catch (err) {

      if (err.response) {

        // 서버가 4xx, 5xx 에러를 반환한 경우
        console.error("API Error:", err.response);
        setError(err.response.data?.message || "서버 응답 오류가 발생했습니다.");

      } else if (err.request) {

        // 요청은 갔지만 응답이 없는 경우
        console.error("No Response:", err.request);
        setError("서버 응답이 없습니다. 네트워크 상태를 확인하세요.");

      } else {
        // 기타 에러
        console.error("Request Error:", err.message);
        setError("요청 처리 중 오류가 발생했습니다.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <Internal_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}
      
      {/* ↓ 조회 메인 뷰 ↓ */}
      <div className="container">

        {/* ↓ 검색 폼 ↓ */}
        <div>

          {/* ↓ 의뢰 조회 검색폼 타이틀 ↓ */}
          <div className="page-top">
            {/* <h1 className="page-title">CT 의뢰 조회</h1> */}
          </div>
          {/* ↑ 의뢰 조회 검색폼 타이틀 ↑ */}

          <div className="search-information">
            <form id="internal-search-form" className="" onSubmit={search}>

              {/* ↓ 검색 조건폼 1번 라인 ↓ */}
              <div className="internal-search-grid-title">◎ 조회조건</div>
              <div className="internal-search-grid internal-search-grid-line">
              {/* <div className="preservative-search-grid-inline"> */}
                <div className="date-field">
                  <div className="internal-search-grid-label">등록일</div>
                    {/* <select className="" id="searchForm_searchType" name="search_type" value={searchForm.search_type ?? ""} onChange={handleInputValue} required>
                      <option value="C_REQ">CT 의뢰일자</option>
                      <option value="C_REC">CT 접수일자</option>
                      <option value="C_TST">CT 시험일자</option>
                      <option value="S">영업 의뢰일자</option>
                      <option value="L">제형 의뢰일자</option>
                    </select> */}
                    <div></div>
                    <div className="dateRange">
                      <input type="date" className="" id="searchForm_dateFrom" name="date_from" value={searchForm.date_from ?? ""} ref={dateFromRef}
                              onChange={handleInputValue} required/>~
                      <input type="date" className="" id="searchForm_dateTo" name="date_to" value={searchForm.date_to ?? ""} ref={dateToRef}
                              onChange={handleInputValue} required/>
                    </div>
                </div>
                <div className="temp-field">
                  <div className="internal-search-grid-label">의뢰번호</div>
                  <div></div>
                      <Search
                        listData={docNo}
                        labelKey={"name"}
                        inputId={"docNo"}
                        inputName={"docNo"}
                        placeholder={"2500001"}
                        onSelect={(docNo) => setSearchForm((prev) => ({ ...prev, "docNo": docNo.id }))}/>
                </div>
                <div className="field">
                  <div className="internal-search-grid-label">의뢰자</div>
                      <Search
                        listData={employeeList}
                        labelKey={"name"}
                        inputId={"searchForm_manager"}
                        inputName={"manager"}
                        placeholder={"담당자 검색"}
                        onSelect={(manager) => setSearchForm((prev) => ({ ...prev, "manager": manager.id }))}/>
                </div>
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
              </div>
              {/* ↑ 검색 조건폼 1번 라인 ↑ */}

              {/* ↓ 검색 조건폼 2번 라인 ↓ */}
              <div className="internal-search-grid internal-search-grid-line">
              {/* <div className="internal-search-grid-inline"> */}
                <div className="field">
                  <div className="internal-search-grid-label">품명</div>
                      <Search
                        listData={itemName}
                        labelKey={"name"}
                        inputId={"itemName"}
                        inputName={"itemName"}
                        placeholder={"Cetaphil BHR Body Lotion"}
                        onSelect={(itemName) => setSearchForm((prev) => ({...prev, "itemName": itemName.id}))}/>
                </div>
                <div className="field">
                  <div className="internal-search-grid-label">Lab No.</div>
                      <Search
                        listData={labNo}
                        labelKey={"name"}
                        inputId={"labNo"}
                        inputName={"labNo"}
                        placeholder={"NGA0139A-191025A"}
                        onSelect={(labNo) => setSearchForm((prev) => ({...prev, "labNo": labNo.id}))}/>

                </div>
                <div className="field">
                  <div className="internal-search-grid-label">Lot No.</div>
                      <Search
                        listData={lotNo}
                        labelKey={"name"}
                        inputId={"lotNo"}
                        inputName={"lotNo"}
                        placeholder={"H31V002H31"}
                        onSelect={(lotNo) => setSearchForm((prev) => ({...prev, "lotNo": lotNo.id}))}/>
                </div>
                <div className="field">
                  <div className="internal-search-grid-label">성분명</div>
                      <Search
                        listData={lotNo}
                        labelKey={"name"}
                        inputId={"lotNo"}
                        inputName={"lotNo"}
                        placeholder={"H31V002H31"}
                        onSelect={(lotNo) => setSearchForm((prev) => ({...prev, "lotNo": lotNo.id}))}/>
                </div>
                {/* <div className="field"></div> */}
                <div className="field"></div>
                <div className="field"></div>
                <div className="field"></div>
                        
                {/* </div> */}
              </div>
              {/* ↑ 검색 조건폼 2번 라인 ↑ */}

              </form>
          </div>

          {/* ↓ 검색 조건폼 제어 버튼 영역 ↓ */}
          <div className="form-buttons">
            <button type="button" disabled={loading} onClick={(e) => search(e)}>
                {loading ? "검색 중" : "검색"}</button>
            <button type="button" onClick={resetSearchForm}>초기화</button>
          </div>
          {/* ↑ 검색 조건폼 제어 버튼 영역 ↑ */}

        </div>
        {/* ↑ 검색 폼 ↑ */}

        {/* ↓ 결과 영역 ↓ */}
        {/* ↓ 필터/검색 툴바 ↓ */}
        <div className="approve-toolbar" aria-label="필터 및 검색">
        <div className="internal-search-grid internal-search-grid-line">

          <div className="search-double-field">
            <label 
              htmlFor="search"
              className="internal-search-grid-label"
            >검색</label>
            <input
              id="search"
              type="search"
              placeholder="예: CT2025-0001, LAB-001, 제품명, 업체명"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label 
              htmlFor="category"
              className="internal-search-grid-label"
            >카테고리</label>
            <select id="category" value={type} onChange={(e) => setType(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c || "전체"}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label 
              htmlFor="from"
              className="internal-search-grid-label"
            >작성일 From</label>
            <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className="search-field">
            <label 
              htmlFor="to"
              className="internal-search-grid-label"
            >작성일 To</label>
            <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="search-field">
            <label 
              htmlFor="rowCountByPage"
              className="internal-search-grid-label"
            >목록갯수</label>
            <select id="rowCountByPage" value={pageSize} onChange={handlePageSizeChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        </div>
        {/* ↑ 필터/검색 툴바 ↑ */}

        {/* ↓ 목록 테이블 ↓ */}
        <div className="pre-table-wrap" role="region" tabIndex={0}>
          <table className="pre-list-table tal">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <Th
                    key={col.key}
                    label={col.label}
                    columnKey={col.key}
                    sortable={!!col.sortable}
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    // DnD
                    draggable
                    onDragStart={onDragStart(index)}
                    onDragOver={onDragOver(index)}
                    onDragEnter={onDragEnter(index)}
                    onDrop={onDrop(index)}
                    onDragEnd={onDragEnd}
                    isDragging={draggingIndex === index}
                    isDropTarget={dragOverIndex === index}
                  />
                ))}
              </tr>
            </thead>

            {/* <tbody>
              {paginatedPosts.length === 0 ? (
                <tr>
                  <td className="empty" colSpan={columns.length}>
                    조건에 맞는 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((item) => (
                  <tr key={item.id}>
                    {columns.map((col) => (
                      <td key={`${item.id}-${col.key}`} data-label={col.label}>
                        {col.render ? col.render(item) : (item?.[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody> */}
            <Tr
              data={paginatedPosts}
              columns={columns}
              onRowClick={(row) => {
                console.log("row clicked:", row);
                // handleSelectedRow(row.id);
                setSelectedRow({
                  "rowId": row.id
                  ,"value": true
                });
              }}
              onUserClick={(id) => {
                console.log(`id Clicked : ${id}`);
                navigate(`/internal/request/create?mode=update&request_id=${id}`);
              }}
              selectedRowId={selectedRow}
              // setSelectedRowId={(row) => {
              //   handleSelectedRow(row)
              // }}
            />
          </table>
        </div>
        {/* ↑ 목록 테이블 ↑ */}
        {/* ↑ 결과 영역 ↑ */}
        
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
          <button disabled={currentPage === totalPages} onClick={moveNext}>▶</button>
          <button disabled={currentPage === totalPages} onClick={moveLast}>⏭</button>
        </div>
        {/* ↑ 페이징 바 ↑ */}
        
      </div>
      {/* ↑ 조회 메인 뷰 ↑ */}

      {/* ↓ 모달 영역 ↓ */}
      <div className="modal-alert" tabIndex={-1} ref={refModalAlert}
            style={{
                    top: isOpenModalAlert.position.top,
                    left: isOpenModalAlert.position.left,
                    display: isOpenModalAlert.open ? "block" : "none"
                }}>
        {Utils.noticeValidation("날짜가")}
      </div>
      {/* ↑ 모달 영역 ↑ */}

    </>
  );
}

/** 정렬 + 드래그 가능한 헤더 셀 */
const Th = ({
  label,
  columnKey,
  sortable,
  activeKey,
  sortDir,
  onSort,
  // DnD
  draggable,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  onDragEnd,
  isDragging,
  isDropTarget,
}) => {
  const isActive = activeKey === columnKey;
  const ariaSort = isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none";
  const indicator = sortable ? (isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕") : "";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`${isDropTarget ? "th-drop-target" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <button
        type="button"
        className={`th-btn ${isActive ? "active" : ""} ${isDragging ? "th-dragging" : ""}`}
        onClick={sortable ? () => onSort(columnKey) : undefined}
        aria-label={
          sortable
            ? `${label}로 ${isActive && sortDir === "asc" ? "내림차순" : "오름차순"} 정렬`
            : `${label}`
        }
      >
        {label}
        {sortable && (
          <span className="sort-indicator" aria-hidden="true">
            {indicator}
          </span>
        )}
        <span className="visually-hidden" aria-live="polite">
          {isDragging ? "드래그 중" : ""}
        </span>
      </button>
    </th>
  );
}


/* 테이블 데이터 리스트 컴포넌트 */
const Tr = ({
  data = [],
  columns = [],
  getRowKey = (item) => item.request_id, 
  onRowClick,
  selectedRowId,
  onUserClick,
  // setSelectedRowId,
}) => {
  if (!data || data.length === 0) {
    return (
      <tbody>
        <tr>
          <td className="empty" colSpan={columns.length}>
            조건에 맞는 게시글이 없습니다.
          </td>
        </tr>
      </tbody>
    );
  }
  return (
    <tbody>
      {Object.values(data).map((item) => {
        const rowKey = getRowKey(item);
        const isSelected = rowKey === selectedRowId.rowId;
        const rms = item.items?.length ? item.items : [null];
        const span = rms.length;

        // const checkboxKeys = ["isReg", "isFin"];
        console.log(item);

        return rms.map((rm, rowIdx) => (
          <tr
            key={`${item.request_id}-${rowIdx}`}
            // key={rowKey}
            // onClick={onRowClick ? () => {
            //   onRowClick(item)
            //   setSelectedRowId(item)
            // } 
            // : undefined}
            onClick={() => onUserClick(item.request_id)}
            className={
              `pre-row-clickable ${isSelected ? "pre-row-selected" : ""}`
            }
          >
            {/* <Link
                to={`/preservative/request/create?mode=update&request_id=${item.request_id}`}> */}
              {columns.map((col, idx) => {
                if(col.key === "ingCode"){
                  return (
                    <td 
                      key={`${item.request_id}-${rowIdx}-rmName`}>
                      {rm?.ing_no ?? ""}
                    </td>
                  );
                };

                // if(col.key === "numerator"){
                //   return (
                //     <td
                //       key={`${item.request_id}-${rowIdx}-numerator`}>
                //       {rm?.ing_rate ?? ""}
                //     </td>
                //   );
                // };

                if (rowIdx === 0){
                  if(col.key === "isReg") {
                    return (
                      <td
                        rowSpan={span}
                        key={`${item.request_id}-${col.key}`}>
                          <input
                            type="checkbox"
                            checked={item?.[col.key]==1 ? true : false}/>
                      </td>
                    )
                  }

                  return (
                    <td
                      key={`${item.request_id}-${col.key}`}
                      rowSpan={span}>
                        {item?.[col.key] ?? ""}
                    </td>
                  );
                }

                return null;
                // ↓ 이전코드 : 상황에 따라 대체해야할 수 있음 ↓
                // <td
                //   key={`${rowKey}-${col.key}`}
                //   data-label={col.label}>
                //     {checkboxKeys.includes(col.key) ?(
                //       <input
                //         type="checkbox"
                //         checked={item?.[col.key]==1 ? true : false}
                //         />
                //     )
                //     : col.key == "preservativeJudge" ? (
                //       <span className={`pre-judge-${item?.preservativeJudge == 1 ? "true" : "false"}`}>
                //         {item?.preservativeJudge == 1 ? "적합" : "부적합"}
                //       </span>
                //     )
                //     : col.key == "rmName" ? (
                //       item.items.map((i) => {
                //         <tr>
                //           <td>
                //             {console.log(i.item_no)}
                //                 {i.item_no}
                                
                //           </td>
                //         </tr>
                //       })
                //     )
                //     : col.render
                //       ? (col.render(item))
                //       : (item?.[col.key] ?? "")}
                // </td>
                // ↑ 이전코드 : 상황에 따라 대체해야할 수 있음 ↑
              })}
          {/* </Link> */}
          </tr>
        ))
      })}
    </tbody>
  )
}

