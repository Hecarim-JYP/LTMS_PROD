/**
 * 파일명 : CT_Request_Read.jsx
 * 용도 : CT 의뢰 목록 조회
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// import Search from "/src/components/Search";
import CT_SubNav from "/src/modules/CT/CT_SubNav";
import useActionPermission from '/src/hooks/useActionPermission';

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";

export default function CT_Request_Read() {

  // 동작 권한 가져오기
  const { canRead } = useActionPermission('ct_request');

  /**
   * 사용자 정보 컨텍스트
   */
  const { user } = useContext(AuthContext);
  const companyId = user.company_id; // 회사 ID


  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY; // 오늘 날짜
  const G_STARTDAY = Common.G_STARTDAY; // 오늘로부터 7일


  /**
   * 페이지 그룹 전역 변수
   */
  const G_PAGEGROUPCOUNT = Common.pageGroupCount;

  /** -----------------------------
   * 초기 컬럼 정의 (헤더/바디 동기화)
   * "key" : 데이터 키, "label" : 표시 라벨, "sortable" : 정렬 가능 여부
   * ------------------------------ */
  const initialColumns = [
    { "key" : "ct_no", "label" : "CT 번호", "sortable" : true, },
    { "key" : "ct_test_seq", "label" : "의뢰 차수", "sortable" : true },
    { "key" : "ct_request_date", "label" : "의뢰일", "sortable" : true },
    { "key" : "ct_lab_no", "label" : "LabNo", "sortable" : true },
    { "key" : "sample_name", "label" : "샘플", "sortable" : true },
    { "key" : "client_name", "label" : "고객사", "sortable" : true },
    { "key" : "material_description", "label" : "자재정보", "sortable" : true },
    { "key" : "material_supplier_name", "label" : "자재업체", "sortable" : true },
    { "key" : "ct_due_date", "label" : "완료일", "sortable" : true },
    { "key" : "judgment_name", "label" : "판정", "sortable" : true },
    { "key" : "labs_manager_name", "label" : "연구원", "sortable" : true },
    { "key" : "sales_manager_name", "label" : "영업담당자", "sortable" : true },
    { "key" : "ct_manage_summary", "label" : "종합의견", "sortable" : true },
    { "key" : "request_content", "label" : "의뢰내용", "sortable" : true },
    { "key" : "desired_volume", "label" : "희망용량", "sortable" : true },
  ];


  /**
   * 접수 현황 데이터
   */
  const statusOptions = [
    {"idx" : 1, "label" : "전체", "value" : ""},
    {"idx" : 2, "label" : "요청", "value" : "REQUESTED"},
    {"idx" : 3, "label" : "진행 중", "value" : "IN_PROGRESS"},
    {"idx" : 4, "label" : "완료", "value" : "COMPLETED"},
    {"idx" : 5, "label" : "보류", "value" : "SUSPENDED"},
    {"idx" : 6, "label" : "취소", "value" : "CANCELLED"},
  ];


  /**
   * CT 유형 데이터
   */
  const ctOptions = [
    {"idx" : 1, "label" : "전체 CT", "value" : ""},
    {"idx" : 2, "label" : "고객사 CT", "value" : "C"},
    {"idx" : 3, "label" : "부분 CT", "value" : "P"},
  ];


  /**
   * 조회조건 데이터
   */
  const searchTypeOptions = [
    {"idx" : 1, "label" : "CT 의뢰일자", "value" : "REQ"},
    {"idx" : 2, "label" : "CT 접수일자", "value" : "REC"},
    {"idx" : 3, "label" : "자재 의뢰일자", "value" : "LAB"},
    {"idx" : 4, "label" : "완료 예정일자", "value" : "COMP"},
  ];


  /* ============================== 훅 관리 ============================== */
  /**
   * ============================================================
   * 동적 옵션 데이터 state
   * ------------------------------------------------------------
   * HOW : 각 셀렉트 박스별로 옵션 데이터를 관리하는 state
   *       초기값은 "전체" 또는 기본 옵션만 포함
   * WHY : DB에서 조회한 데이터를 저장하고 렌더링에 사용하기 위함
   * ============================================================
   */
  const [managerOptions, setManagerOptions] = useState([
    {
      module_category: "",
      manager_type_id: "",
      manager_type_code: "",
      manager_type_name: "담당자유형",
      is_active: "",
      sort_order: ""
    }
  ]);


  const [judgmentOptions, setJudgmentOptions] = useState([
    {
      judgment_id: "",
      judgment_code: "",
      judgment_name: "판정여부",
      is_active: "",
      sort_order: ""
    }
  ]);


  /**
   * 옵션 로딩 상태 관리
   * ------------------------------------------------------------
   * HOW : 각 옵션별 로딩 상태를 boolean으로 관리
   * WHY : 옵션 데이터 로딩 중 UI 피드백을 제공하거나
   *       로딩 완료 여부를 확인하기 위함
   */
  const [optionsLoading, setOptionsLoading] = useState({
    manager: true,
    judgment: true
  });


  /**
   * --- 조회 통신에 사용될 state 객체 ---
   * result, setResult : 결과값
   * loading, setLoading : request 요청 응답 여부
   */
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(null);


  /**
   * 조회 조건 입력 폼 객체
   */
  const [searchForm, setSearchForm] = useState({
    "search_type" : "REQ",          // 조회조건 (최초에는 CT 의뢰일자로 지정)
    "date_from" : G_STARTDAY,       // 조회기간 시작
    "date_to" : G_TODAY,            // 조회기간 끝
    "ct_no" : "",                   // CT 의뢰번호
    "ct_status" : "",               // 접수 현황
    "manager_type" : "",            // 담당자유형
    "manager" : "",                 // 담당자
    "client_id" : "",               // 고객사
    "sample_id" : "",               // 샘플
    "ct_type" : "",                 // CT 유형
    "material_type" : "",           // 자재사양
    "material_supplier_id" : "",    // 자재업체
    "lab_no" : "",                  // 랩넘버
    "judgment_id" : "",             // 판정
    "is_emergency_y" : "",          // 긴급 해당
    "is_emergency_n" : "",          // 긴급 미해당
    "is_cpnp_y" : "",               // cpnp 해당
    "is_cpnp_n" : "",               // cpnp 미해당
    "is_eng_y" : "",                // 영문 해당
    "is_eng_n" : "",                // 영문 미해당
    "request_content" : "",         // 의뢰 내용
    "company_id" : companyId,       // 회사 ID (컨텍스트에서 가져옴)
  });


  /* 컬럼 순서/정의 상태 (Drag & Drop 대상) */ 
  const [columns, setColumns] = useState(initialColumns);

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


  /**
   * ============================================================
   * useEffect - 셀렉트 박스 옵션 데이터 초기 로딩
   * ------------------------------------------------------------
   * HOW : 컴포넌트가 마운트될 때 각 셀렉트 박스에 필요한
   *       옵션 데이터를 DB에서 조회하여 state에 저장
   * 
   * WHY : 사용자가 화면에 진입했을 때 실시간 데이터로
   *       셀렉트 박스를 구성하기 위함
   * 
   * FLOW :
   *   1. 각 옵션별 API 호출 함수 실행
   *   2. 응답 데이터를 해당 state에 저장
   *   3. 로딩 상태 업데이트
   *   4. 에러 발생 시 콘솔 로그 출력 및 기본값 유지
   * ============================================================
   */
  useEffect(() => {
    // 모든 옵션 데이터 병렬 조회
    Promise.all([
      fetchManagerOptions(),
      fetchJudgmentOptions()
    ]);

  }, []);


  /**
   * useEffect - 페이지 로딩 시 자동 검색 실행
   * ----------------------------------------------------
   * WHY : 컴포넌트 마운트 시 initialSearch를 호출하여 초기 데이터 표시
   */
  useEffect(() => {
    initialSearch();
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
   * HOW : useMemo를 사용하여 result, 검색어(debouncedQuery), 날짜범위(from/to),
   *       정렬 기준(sortKey, sortDir)이 변경될 때만 재계산한다.
   *       1) 검색어 전처리(소문자 + trim)
   *       2) result 리스트에서 검색어, 카테고리, 기간 조건을 모두 충족하는 데이터만 필터링
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
        !q 
        || String(item.ct_no ?? "").toLowerCase().includes(q)
        || String(item.ct_lab_no ?? "").toLowerCase().includes(q)
        || String(item.sample_name ?? "").toLowerCase().includes(q)
        || String(item.client_name ?? "").toLowerCase().includes(q)
        || String(item.material_supplier_name ?? "").toLowerCase().includes(q);

      // createdAt 기준 기간 필터 (요청한 날짜키와 별개로 유지)
      const d = item.ct_request_date ? new Date(item.ct_request_date) : null;
      const okFrom = !from || (d && d >= new Date(from));
      const okTo = !to || (d && d <= new Date(to));

      return okQuery && okFrom && okTo;

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
        dateFromRef.current?.focus();
      } else if(!isDateTo) {
        controllAlertModal(true, dateToRef);
        dateToRef.current?.focus();
      } else {
        dateToRef.current?.focus();
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
      "search_type" : "REQ",          // 조회조건 (최초에는 CT 의뢰일자로 지정)
      "date_from" : G_STARTDAY,       // 조회기간 시작
      "date_to" : G_TODAY,            // 조회기간 끝
      "ct_no" : "",                   // CT 의뢰번호
      "ct_status" : "",               // 접수 현황
      "manager_type" : "",            // 담당자유형
      "manager" : "",                 // 담당자
      "client_id" : "",               // 고객사
      "sample_id" : "",               // 샘플
      "ct_type" : "",                 // CT 유형
      "material_type" : "",           // 자재사양
      "material_supplier_id" : "",    // 자재업체
      "lab_no" : "",                  // 랩넘버
      "judgment_id" : "",             // 판정
      "is_emergency_y" : "",          // 긴급 해당
      "is_emergency_n" : "",          // 긴급 미해당
      "is_cpnp_y" : "",               // cpnp 해당
      "is_cpnp_n" : "",               // cpnp 미해당
      "is_eng_y" : "",                // 영문 해당
      "is_eng_n" : "",                // 영문 미해당
      "request_content" : "",         // 의뢰 내용
      "company_id" : companyId        // 회사 ID (컨텍스트에서 가져옴)
    })
  };


  /** ----------------------------------
   * pageSize : 페이지당 표시할 항목 수
   * 기본값은 15, 클라이언트 단에서 변경 가능.
   * ---------------------------------- */
  const itemPerPageOptions = user.customSettings.items_per_page || 15;
  const [pageSize, setPageSize] = useState(itemPerPageOptions);


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
   * paginatedResult
   * ----------------------------------------------------
   * HOW : 현재 페이지에 해당하는 데이터만 slice해서 렌더링용 배열 생성
   */
  const paginatedResult = useMemo(() => {
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

    try{
      const params = Utils.cleanParams(searchForm);
      const res = await axios.get("/api/ltms/ct/requests", { params });
      const resultData = res.data.data.result;
      setResult(resultData);
    } catch (err) {

      if (err.response) {

        // 서버가 4xx, 5xx 에러를 반환한 경우
        console.error("API Error:", err.response);
        const errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
        alert(errMsg);

      } else if (err.request) {

        // 요청은 갔지만 응답이 없는 경우
        console.error("No Response:", err.request);

      } else {
        // 기타 에러
        console.error("Request Error:", err.message);
      }

    } finally {
      setLoading(false);
    }
  };


  /**
   * searchEnter : Enter 키로 검색 실행 함수
   * ----------------------------------------------------
   * WHY : textarea 내에서 Enter 키 입력 시 검색이 실행되지 않도록 방지
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const searchEnter = (e) => {
    if(e.key === "Enter" && e.target.tagName !== "TEXTAREA") search(e);
  };


  /**
   * fetchManagerOptions : 담당자 유형 옵션 조회
   * ----------------------------------------------------
   * HOW : sessionStorage에 캐시된 데이터가 있으면 사용하고,
   *       없으면 API 호출 후 sessionStorage에 저장
   * WHY : 페이지 진입할 때마다 불필요한 API 호출을 방지하여 성능 최적화
   */
  const fetchManagerOptions = async () => {
    try {
      // sessionStorage에서 캐시된 데이터 확인
      const cachedData = sessionStorage.getItem('managerOptions');
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 파싱해서 사용
        const parsedData = JSON.parse(cachedData);
        setManagerOptions(parsedData);
        setOptionsLoading(prev => ({ ...prev, manager: false }));
        return;
      }

      // 캐시된 데이터가 없으면 API 호출
      const params = { company_id: companyId };
      const res = await axios.get("/api/ltms/setting/options/manager-type", { params });
      const resultData = res.data.data.result;
      const options = [
        {
          idx: 999,
          module_category: "",
          manager_type_id: "",
          manager_type_code: "",
          manager_type_name: "담당자유형",
          is_active: "",
          sort_order: ""
        },
        ...resultData
      ];
      
      // state 업데이트
      setManagerOptions(options);
      // sessionStorage에 저장
      sessionStorage.setItem('managerOptions', JSON.stringify(options));
      setOptionsLoading(prev => ({ ...prev, manager: false }));
    } catch (err) {
      console.error("담당자 유형 옵션 조회 실패:", err);
      setOptionsLoading(prev => ({ ...prev, manager: false }));
    }
  };


  /**
   * fetchJudgmentOptions : 판정 옵션 조회
   * ----------------------------------------------------
   * HOW : sessionStorage에 캐시된 데이터가 있으면 사용하고,
   *       없으면 API 호출 후 sessionStorage에 저장
   * WHY : 페이지 진입할 때마다 불필요한 API 호출을 방지하여 성능 최적화
   */
  const fetchJudgmentOptions = async () => {
    try {
      // sessionStorage에서 캐시된 데이터 확인
      const cachedData = sessionStorage.getItem('judgmentOptions');
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 파싱해서 사용
        const parsedData = JSON.parse(cachedData);
        setJudgmentOptions(parsedData);
        setOptionsLoading(prev => ({ ...prev, judgment: false }));
        return;
      }

      // 캐시된 데이터가 없으면 API 호출
      const params = { company_id: companyId };
      const res = await axios.get("/api/ltms/setting/options/judgment", { params });
      const resultData = res.data.data.result;
      const options = [
        {
          idx: 999,
          judgment_id: "",
          judgment_code: "",
          judgment_name: "판정여부",
          is_active: "",
          sort_order: ""
        },
        ...resultData
      ];
      
      // state 업데이트
      setJudgmentOptions(options);
      // sessionStorage에 저장
      sessionStorage.setItem('judgmentOptions', JSON.stringify(options));
      setOptionsLoading(prev => ({ ...prev, judgment: false }));
      
    } catch (err) {
      console.error("판정 옵션 조회 실패:", err);
      setOptionsLoading(prev => ({ ...prev, judgment: false }));
    }
  };


  /**
   * initialSearch : 페이지 로딩 시 자동 검색 실행 함수
   * ----------------------------------------------------
   * HOW : 기본 검색 조건(search_type: "REQ")으로 초기 데이터를 조회
   * WHY : 사용자가 검색 버튼을 클릭하지 않아도 기본 데이터가 표시되어 사용성 향상
   */
  const initialSearch = async () => {
    setLoading(true);

    try {
      // 요청 파라미터 객체 (초기 searchForm 값 사용)
      const params = {
        search_type: "REQ",
        company_id: companyId,
      };
      
      // 응답 객체
      const res = await axios.get("/api/ltms/ct/requests", { params });
      const resultData = res.data.data.result;

      setResult(resultData);

    } catch (err) {
      if (err.response) {
        // 서버가 4xx, 5xx 에러를 반환한 경우
        console.error("API Error:", err.response);
        const errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
        alert(errMsg);
        
      } else if (err.request) {
        // 요청은 갔지만 응답이 없는 경우
        console.error("No Response:", err.request);
      } else {
        // 기타 에러
        console.error("Request Error:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <CT_SubNav/>
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
            <form id="ct-form" className="" onSubmit={search} onKeyDown={searchEnter}>

              {/* ↓ 검색 조건폼 1번 라인 ↓ */}
              <div className="ct-search-grid ct-search-grid-line-1">
                <div className="ct-search-grid-label">조회조건</div>
                <div className="ct-search-grid-inline">
                  <select className="" id="searchForm_searchType" name="search_type" 
                          value={searchForm.search_type ?? ""} onChange={handleInputValue} required>
                    {searchTypeOptions.map(e => (
                      <option key={e.idx} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                  <input type="date" className="" id="searchForm_dateFrom" name="date_from" 
                          value={searchForm.date_from ?? ""} ref={dateFromRef}
                          onChange={handleInputValue} required/>
                  ~ 
                  <input type="date" className="" id="searchForm_dateTo" name="date_to" 
                          value={searchForm.date_to ?? ""} ref={dateToRef}
                          onChange={handleInputValue} required/>

                </div>
              </div>
              {/* ↑ 검색 조건폼 1번 라인 ↑ */}

              {/* ↓ 검색 조건폼 2번 라인 ↓ */}
              <div className="ct-search-grid ct-search-grid-line-2">
                <div className="ct-search-grid-label">CT 번호</div>
                <input type="search" className="" id="searchForm_ctCode" name="ct_no" 
                        value={searchForm.ct_no ?? ""}
                        onChange={handleInputValue} />

                <div className="ct-search-grid-label">접수현황</div>
                <select className="" id="searchForm_ctStatus" name="ct_status" 
                        value={searchForm.ct_status ?? ""} 
                        onChange={handleInputValue}>
                  {statusOptions.map(e => (
                    <option key={e.idx} value={e.value}>{e.label}</option>
                  ))}
                </select>

                <div className="ct-search-grid-label">담당자</div>
                <div className="ct-search-grid-inline">
                  <select className="" id="searchForm_managerType" name="manager_type" disabled={optionsLoading.manager}
                          value={searchForm.manager_type ?? ""} 
                          onChange={(e) => {
                            handleInputValue(e);
                            changeManagerType(e);
                          }}>
                    {managerOptions.map(e => (
                      <option key={e.idx} value={e.manager_type_id} data-extra={e.module_category}>{e.manager_type_name}</option>
                    ))}
                  </select>
                  <input type="search" className="" id="searchForm_manager" name="manager" 
                          style={{marginLeft: "-5px", width: "calc(100% - 30px)"}}
                          value={searchForm.manager} onChange={handleInputValue} placeholder="" />
                  {/* <Search
                    listData={employeeList}
                    labelKey={"name"}
                    inputId={"searchForm_manager"}
                    inputName={"manager"}
                    placeholder={"담당자 검색"}
                    onSelect={(manager) => setSearchForm((prev) => ({ ...prev, "manager": manager.id }))}/> */}

                </div>
                <div className="ct-search-grid-label">고객사</div>
                <input type="search" className="" id="searchForm_clientId" name="client_id" 
                        value={searchForm.client_id ?? ""} onChange={handleInputValue} />

                <div className="ct-search-grid-label">샘플명</div>
                <input type="search" className="" id="searchForm_sampleId" name="sample_id" 
                        value={searchForm.sample_id ?? ""} onChange={handleInputValue} />

              </div>
              {/* ↑ 검색 조건폼 2번 라인 ↑ */}

              {/* ↓ 검색 조건폼 3번 라인 ↓ */}
              <div className="ct-search-grid ct-search-grid-line-3">
                <div className="ct-search-grid-label">CT 유형</div>
                <select className="" id="searchForm_ctType" name="ct_type" 
                        value={searchForm.ct_type ?? ""} onChange={handleInputValue}>
                  {ctOptions.map(e => (
                    <option key={e.idx} value={e.value}>{e.label}</option>
                  ))}
                </select>

                <div className="ct-search-grid-label">판정</div>
                <select className="" id="searchForm_judgmentId" name="judgment_id" disabled={optionsLoading.judgment}
                        value={searchForm.judgment_id ?? ""} onChange={handleInputValue}>
                  {judgmentOptions.map(e => (
                    <option key={e.idx} value={e.judgment_id}>{e.judgment_name}</option>
                  ))}
                </select>

                <div className="ct-search-grid-label">자재사양</div>
                {/* <Search 
                  // listData={initialPosts}
                  labelKey={"id"}
                  inputId={"searchForm_materialType"}
                  inputName={"material_type"}
                  placeholder={"자재 사양 검색"}
                  onSelect={(material_type) => setSearchForm((prev) => ({ ...prev, "material_type": material_type.id }))}/> */}
                <input type="search" className="" id="searchForm_materialType" name="material_type" 
                        value={searchForm.material_type ?? ""} onChange={handleInputValue}/>

                <div className="ct-search-grid-label">자재업체</div>
                <input type="search" className="" id="searchForm_materialSupplierId" name="material_supplier_id" 
                        value={searchForm.material_supplier_id ?? ""} onChange={handleInputValue}/>

                <div className="ct-search-grid-label">랩넘버</div>
                <input type="search" className="" id="searchForm_labNo" name="lab_no" 
                        value={searchForm.lab_no ?? ""} onChange={handleInputValue}/>


              </div>
              {/* ↑ 검색 조건폼 3번 라인 ↑ */}

              {/* ↓ 검색 조건폼 4번 라인 ↓ */}
              <div className="ct-search-grid ct-search-grid-line-4">

                <div className="ct-search-grid-label"><label htmlFor="searchForm_isEmergency">긴급여부</label></div>
                <input className="" type="checkbox" id="searchForm_isEmergency" 
                        name="is_emergency" onChange={(e) => {handleCheckBox(e);}}/>

                <div className="ct-search-grid-inline">
                  <label htmlFor="searchForm_isEmergency_y">⭕</label>
                  <input className="" type="checkbox" id="searchForm_isEmergency_y" name="is_emergency_y"
                          checked={searchForm.is_emergency_y === "Y" ? true : false}
                          disabled={isEmergencyOpen.isEmergency_Y} onChange={handleInputValue} />

                  <label htmlFor="searchForm_isEmergency_n">❌</label>
                  <input className="" type="checkbox" id="searchForm_isEmergency_n" name="is_emergency_n"
                          checked={searchForm.is_emergency_n === "Y" ? true : false}
                          disabled={isEmergencyOpen.isEmergency_N} onChange={handleInputValue} />
                </div>

                <div className="ct-search-grid-label"><label htmlFor="searchForm_isCpnp">CPNP여부</label></div>
                <input className="" type="checkbox" id="searchForm_isCpnp" 
                        name="is_cpnp" onChange={(e) => {handleCheckBox(e);}}/>

                <div className="ct-search-grid-inline">
                  <label htmlFor="searchForm_isCpnp_y">⭕</label>
                  <input className="" type="checkbox" id="searchForm_isCpnp_y" name="is_cpnp_y" 
                          checked={searchForm.is_cpnp_y === "Y" ? true : false}
                          disabled={isCpnpOpen.isCpnp_Y} onChange={handleInputValue} />

                  <label htmlFor="searchForm_isCpnp_n">❌</label>
                  <input className="" type="checkbox" id="searchForm_isCpnp_n" name="is_cpnp_n"
                          checked={searchForm.is_cpnp_n === "Y" ? true : false}
                          disabled={isCpnpOpen.isCpnp_N} onChange={handleInputValue} />
                </div>

                <div className="ct-search-grid-label"><label htmlFor="searchForm_isEng">영문(엑셀)여부</label></div>
                <input className="" type="checkbox" id="searchForm_isEng" 
                        name="is_eng" onChange={(e) => {handleCheckBox(e);}}/>

                <div className="ct-search-grid-inline">
                  <label htmlFor="searchForm_isEng_y">⭕</label>
                  <input className="" type="checkbox" id="searchForm_isEng_y" name="is_eng_y"
                          checked={searchForm.is_eng_y === "Y" ? true : false}
                          disabled={isEngOpen.isEng_Y} onChange={handleInputValue} />

                  <label htmlFor="searchForm_isEng_n">❌</label>
                  <input className="" type="checkbox" id="searchForm_isEng_n" name="is_eng_n"
                          checked={searchForm.is_eng_n === "Y" ? true : false}
                          disabled={isEngOpen.isEng_N} onChange={handleInputValue} />
                </div>

              </div>
              {/* ↑ 검색 조건폼 4번 라인 ↑ */}

              {/* ↓ 검색 조건폼 5번 라인 ↓ */}
              <div className="ct-search-grid ct-search-grid-line-5">
                <div className="ct-search-grid-label">의뢰 내용</div>
                <textarea className="" id="searchForm_reportContent" name="request_content" 
                          value={searchForm.request_content ?? ""} onChange={handleInputValue}></textarea>
              </div>
              {/* ↑ 검색 조건폼 5번 라인 ↑ */}

              </form>
          </div>

          {/* ↓ 검색 조건폼 제어 버튼 영역 ↓ */}
          <div className="form-buttons">
            <button type="button" className="btn-primary" disabled={loading} onClick={(e) => search(e)}>
                {loading ? "검색 중" : "검색"}</button>
            <button type="button" className="btn-secondary" onClick={resetSearchForm}>초기화</button>
          </div>
          {/* ↑ 검색 조건폼 제어 버튼 영역 ↑ */}

        </div>
        {/* ↑ 검색 폼 ↑ */}

        {/* ↓ 결과 영역 ↓ */}
        {/* ↓ 조회된 목록 카운트 ↓ */}
        {/* {result.length > 0 && (
        <div className="list-count jcl">
          {result.length}건
        </div>
        )} */}
        {/* ↑ 조회된 목록 카운트 ↑ */}

        {/* ↓ 필터/검색 툴바 ↓ */}
        <div className="approval-toolbar" 
              style={{gridTemplateColumns: "1fr 180px 180px 80px"}}
              aria-label="필터 및 검색">

          <div className="field">
            <label htmlFor="search">검색 (의뢰번호/랩넘버/제품/업체)</label>
            <input
              id="search"
              type="search"
              placeholder="예: CT2025-0001, LAB-001, 제품명, 업체명"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="from">작성일 From</label>
            <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="to">작성일 To</label>
            <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="rowCountByPage">목록갯수</label>
            <select id="rowCountByPage" value={pageSize} onChange={handlePageSizeChange}>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

        </div>
        {/* ↑ 필터/검색 툴바 ↑ */}

        {/* ↓ 목록 테이블 ↓ */}
        <div className="table-wrap" role="region" tabIndex={0}>
          <table className="list-table tal">
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

            <tbody>
              {paginatedResult.length === 0 ? (
                <tr>
                  <td className="empty" colSpan={columns.length}>
                    조건에 맞는 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedResult.map((item) => (
                  <tr key={item.ct_request_id}>
                    {columns.map((col, index) => (
                      <td key={`${item.ct_request_id}-${index}`} data-label={col.label} id={`${item.ct_request_id}-${index}`}>
                        <Link 
                          to={`/ct/request/create?ct_request_id=${item.ct_request_id}&mode=update`}
                        >
                          {col.render ? col.render(item) : (item?.[col.key] ?? "")}
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
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
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={moveNext}>▶</button>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={moveLast}>⏭</button>
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
        title={
          sortable
            ? `클릭하여 ${label}로 ${isActive && sortDir === "asc" ? "내림차순" : "오름차순"} 정렬`
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