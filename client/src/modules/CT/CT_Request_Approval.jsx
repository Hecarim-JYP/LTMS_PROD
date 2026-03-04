/**
 * 파일명 : CT_Request_Approval.jsx
 * 용도   : CT 결재 목록
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 :
 * 수정사항 :
 */

import { useState, useMemo, useEffect, useRef, useContext } from "react";
import axios from "axios";

import CT_SubNav from "/src/modules/CT/CT_SubNav";
import CT_Request_ApprovalDetail from "/src/modules/CT/CT_Request_ApprovalDetail";

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";

export default function CT_Request_Approval() {

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
    { "key" : 'idx', "label" : '번호', "sortable" : true},
    { "key" : 'ct_no', "label" : 'CT 의뢰번호', "sortable" : true },
    { "key" : 'ct_lab_no', "label" : '랩넘버', "sortable" : true },
    { "key" : 'ct_type', "label" : 'CT유형', "sortable" : true },
    { "key" : 'sample_id', "label" : '제품', "sortable" : true },
    { "key" : 'client_id', "label" : '고객사', "sortable" : true },
    { "key" : 'material_supplier_id', "label" : '자재업체', "sortable" : true },
    { "key" : 'material_request_date', "label" : '자재요청일', "sortable" : true },
    { "key" : 'ct_request_date', "label" : 'CT요청일', "sortable" : true },
    { "key" : 'ct_receipt_date', "label" : 'CT접수일', "sortable" : true },
    { "key" : 'ct_test_date', "label" : 'CT시험일', "sortable" : true },
    { "key" : 'ct_status', "label" : 'CT상태', "sortable" : true },
    { "key" : 'judgment', "label" : '판정', "sortable" : true },
    { "key" : 'sales_manager_id', "label" : '영업담당자', "sortable" : true },
    { "key" : 'sample_manager_id', "label" : '샘플담당자', "sortable" : true },
    { "key" : 'ct_manager_id', "label" : 'CT담당자', "sortable" : true },
    { "key" : 'is_emergency', "label" : '긴급', "sortable" : true },
    { "key" : 'is_cpnp', "label" : 'CPNP', "sortable" : true },
    { "key" : 'is_eng', "label" : 'ENG', "sortable" : true },
  ];

  
  /**
   * --- API 통신에 사용될 state 객체 ---
   * loading, setLoading : request 요청 응답 여부
   * error, setError : 응답 오류 여부
   */
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(null);

  /**
   * 조회 조건 입력 폼 객체
   */
  const [searchForm, setSearchForm] = useState({
    "company_id" : companyId,     // 회사 ID (컨텍스트에서 가져옴)
    "search_type" : "C_REQ",      // 기본값은 CT 의뢰일자로 할당 (C_REQ : CT 의뢰일자, C_REC : CT 접수일자, C_TST : CT 시험일자, M_REQ : 자재 의뢰일자)
    "date_from" : G_STARTDAY,     // 조회 시작일자 (기본값은 오늘로부터 7일 전)
    "date_to" : G_TODAY,          // 조회 종료일자 (기본값은 오늘)
    "ct_no" : "",                 // CT 번호 검색어  
    "ct_content" : "",            // CT 내용 검색어
    "approval_status" : [],       // 결재 상태 배열 (PENDING, IN_PROGRESS, APPROVED, REJECTED, CANCELED)
    "document_type" : "CT"        // 문서 유형 (기본값 CT)
  });


  /**
   * 결재 상태 옵션 정의
   */
  const approvalStatusOptions = [
    { value: 'PENDING', label: '대기' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'APPROVED', label: '완료' },
    { value: 'REJECTED', label: '반려' },
    { value: 'CANCELED', label: '취소' }
  ];


  /**
   * 유효성 검즘 state - 조회 조건 입력 시 날짜 검증 등에 사용.
   */
  const [isValidated, setIsValidated] = useState(true);


  /**
   * 결재 상세보기 모달 상태
   */
  const [isApprovalDetailOpen, setIsApprovalDetailOpen] = useState(false);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState(null);


  /**
   * 초기 마운트 여부 확인을 위한 ref
   */
  const isInitialMount = useRef(true);


  // 결재 문서 카테고리
  const categories = [
    {
      "key" : "",
      "label" : "전체"
    },
    {
      "key" : "CT",
      "label" : "CT"
    },
    {
      "key" : "InternalTest",
      "label" : "내부 분석"
    },
    {
      "key" : "ExternalTest",
      "label" : "외부 분석"
    },
    {
      "key" : "Preservative",
      "label" : "방부력"
    },
  ];


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


  /** --------------------------------------------
   * 검색 디바운스
   * WHY : 타이핑할 때 마다 필터링이 매번 실행되면 성능 저하 → 300ms 지연
   * -------------------------------------------- */
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);


  /** --------------------------------------------
   * Drag & Drop 상태 관리
   * WHY : 렌더링을 유발하면 드래그가 끊기기 때문에 
   *       드래그한 index, 드래그 중인지 여부 등을 ref로 관리
   * -------------------------------------------- */
  const dragIndexRef = useRef(null);
  const draggingFlagRef = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);


  /** --------------------------------------------
   * 결재 항목 행 클릭 핸들러
   * ----------------------------------------------------
   * HOW : 클릭한 항목 객체를 저장하고 모달을 열 때 필요한 ID만 추출하여 전달
   * WHY : 모달 컴포넌트에서 ID로 데이터를 동적으로 조회하기 위함
   * 
   * @param item : 선택된 결재 항목 데이터
   * -------------------------------------------- */
  const handleRowClick = (item) => {
    setSelectedApprovalItem(item);
    setIsApprovalDetailOpen(true);
  };


  /**
   * 결재 상세보기 모달 닫기
   */
  const handleCloseApprovalDetail = () => {
    setIsApprovalDetailOpen(false);
    setSelectedApprovalItem(null);
  };


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
   * HOW : useMemo를 사용하여 approvals, 검색어(debouncedQuery), 날짜범위(from/to),
   *       정렬 기준(sortKey, sortDir)이 변경될 때만 재계산한다.
   *       1) 검색어 전처리(소문자 + trim)
   *       2) approvals 리스트에서 검색어, 카테고리, 기간 조건을 모두 충족하는 데이터만 필터링
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
    const filtered = approvals.filter((item) => {

       // ID, idx 를 기준으로 간단 검색 수행
      const okQuery =
        !q 
        || String(item.ct_no ?? "").toLowerCase().includes(q) 
        || String(item.ct_lab_no ?? "").toLowerCase().includes(q);

      // 카테고리 선택 필터
      const okCat = !type || item.module_name === type;

      // createdAt 기준 기간 필터 (요청한 날짜키와 별개로 유지)
      const d = item.createdAt ? new Date(item.createdAt) : null;
      const okFrom = !from || (d && d >= new Date(from));
      const okTo = !to || (d && d <= new Date(to));

      return okQuery && okCat && okFrom && okTo;

    });

    if (!sortKey) return filtered;
    const sign = sortDir === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => Utils.compareValues(sortKey, a, b) * sign);
  }, [approvals, debouncedQuery, type, from, to, sortKey, sortDir]);


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
   * handleInputValue : input 값 변경 시 form 객체에 데이터 바인딩
   * ----------------------------------------------------
   * @param e : 이벤트 호출 컴포넌트
   */
  const handleInputValue = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({ ...prev, [name]: value }));
  };


  /**
   * handleApprovalStatusChange : 결재 상태 체크박스 변경 핸들러
   * ----------------------------------------------------
   * @param value : 체크박스 값 (PENDING, IN_PROGRESS 등)
   */
  const handleApprovalStatusChange = (value) => {
    setSearchForm((prev) => {
      const currentStatus = prev.approval_status || [];
      const isChecked = currentStatus.includes(value);
      
      return {
        ...prev,
        approval_status: isChecked
          ? currentStatus.filter(status => status !== value) // 체크 해제
          : [...currentStatus, value] // 체크 추가
      };
    });
  };


  /**
   * resetSearchForm : 조회폼 초기화
   */
  const resetSearchForm = () => {
    setSearchForm({
      "company_id" : companyId,     // 회사 ID (컨텍스트에서 가져옴)
      "search_type" : "C_REQ",      // 기본값은 CT 의뢰일자로 할당 (C_REQ : CT 의뢰일자, C_REC : CT 접수일자, C_TST : CT 시험일자, M_REQ : 자재 의뢰일자)
      "date_from" : G_STARTDAY,     // 조회 시작일자 (기본값은 오늘로부터 7일 전)
      "date_to" : G_TODAY,          // 조회 종료일자 (기본값은 오늘)
      "ct_no" : "",                 // CT 번호 검색어  
      "ct_content" : "",            // CT 내용 검색어
      "approval_status" : [],       // 결재 상태 배열 (PENDING, IN_PROGRESS, APPROVED, REJECTED, CANCELED)
      "document_type" : "CT"        // 문서 유형 (기본값 CT)
    })
  };


  /**
   * searchApprovalList : 결재 목록 조회
   * @param {*} e : 이벤트 호출 컴포넌트 (optional)
   * @returns : 
   */
  const searchApprovalList = async (e) => {
    if (e) e.preventDefault();
    if(!await checkValid()) return;

    try {
      setLoading(true);

      // 요청 파라미터 객체
      const params = Utils.cleanParams(searchForm);
      
      // 응답 객체
      const res = await axios.get("/api/ltms/ct/approvals", { params });
      const resultData = res.data.data.result || [];

      setApprovals(resultData);
    } catch (err) {
      let errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
      if (err.response) {
        // 서버가 4xx, 5xx 에러를 반환한 경우
        console.error("API Error:", err.response);
        alert(errMsg);
        
      } else if (err.request) {
        // 요청은 갔지만 응답이 없는 경우
        console.error("No Response:", err.request);
        errMsg += "\n네트워크 상태를 확인해주세요.";
        alert(errMsg);
      } else {
        // 기타 에러
        console.error("Request Error:", err.message);
        errMsg += "\n요청 처리 중 오류가 발생했습니다.";
        alert(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };


  /**
   * initialSearch : 페이지 로딩 시 자동 검색 실행 함수
   * ----------------------------------------------------
   * HOW : 기본 검색 조건(search_type: "C_REQ")으로 초기 데이터를 조회
   * WHY : 사용자가 검색 버튼을 클릭하지 않아도 기본 데이터가 표시되어 사용성 향상
   */
  const initialSearch = async () => {

    setLoading(true);

    try {
      // 요청 파라미터 객체 (초기 searchForm 값 사용)
      const params = {
        search_type: "C_REQ",
        company_id: companyId,
      };
      
      // 응답 객체
      const res = await axios.get("/api/ltms/ct/approvals", { params });
      const resultData = res.data.data.result || [];

      setApprovals(resultData);

    } catch (err) {
      let errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
      if (err.response) {
        // 서버가 4xx, 5xx 에러를 반환한 경우
        console.error("API Error:", err.response);
        alert(errMsg);
        
      } else if (err.request) {
        // 요청은 갔지만 응답이 없는 경우
        console.error("No Response:", err.request);
        errMsg += "\n네트워크 상태를 확인해주세요.";
        alert(errMsg);
      } else {
        // 기타 에러
        console.error("Request Error:", err.message);
        errMsg += "\n요청 처리 중 오류가 발생했습니다.";
        alert(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };


  /**
   * 유효성 검증 모달 닫기
   */
  useEffect(() => {

    const closeModalAlert = (e) => {
      if (refModalAlert.current && !refModalAlert.current.contains(e.target)) {
        setIsOpenModalAlert({
          "open" : false,
          "targetId" : "",
          "position" : { 
            "top" : 0,
            "left" : 0
          }
        });

        setIsValidated(true);
      }
    }

    document.addEventListener("mousedown", closeModalAlert);

    return () => {
      document.removeEventListener("mousedown", closeModalAlert);
    }

  }, []);


  /**
   * 결재 상태 변경 시 자동 검색 실행
   * ----------------------------------------------------
   * HOW : approval_status 값이 변경될 때마다 검색 실행
   * WHY : 체크박스 클릭 시 즉시 검색 결과 반영
   */
  useEffect(() => {
    // 초기 마운트 시에는 검색 실행하지 않음
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 결재 상태가 변경되면 자동 검색
    searchApprovalList();
  }, [searchForm.approval_status]);


  /**
   * 페이지 초기 로딩 시 기본 검색 실행
   * ----------------------------------------------------
   * HOW : 컴포넌트가 마운트될 때 initialSearch 함수 호출
   * WHY : 사용자가 별도의 검색 조건 입력 없이도 기본 데이터를 즉시 확인할 수 있도록
   */
  useEffect(() => {
    initialSearch();
  }, []);


  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <CT_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}

      {/* ↓ 결재 메인 뷰 ↓ */}
      <div className="container">
        
        {/* ↓ 검색 폼 ↓ */}
        <div>

          {/* ↓ 시험성적 조회 화면 타이틀 ↓ */}
          <div className="page-top">
            {/* <h1 className="page-title">시험성적 조회</h1> */}
          </div>
          {/* ↑ 시험성적 조회 화면 타이틀 ↑ */}

          <div className="search-information">
            <form className="search-form">

              {/* ↓ 시험 성적서 조회 조건값 ↓ */}
              <div className="ct-approval-grid ct-approval-grid-line-1">
                <div className="ct-approval-grid-label">조회조건</div>
                <div className="ct-approval-grid-inline">
                  <select className="" id="searchForm_searchType" name="search_type" value={searchForm.search_type ?? ""} onChange={handleInputValue} required>
                    <option value="C_REQ">CT 의뢰일자</option>
                    <option value="C_REC">CT 접수일자</option>
                    {/* <option value="C_TST">CT 시험일자</option> */}
                    <option value="M_REQ">자재 의뢰일자</option>
                  </select>
                  <input type="date" className="" id="searchForm_dateFrom" name="date_from" value={searchForm.date_from ?? ""} ref={dateFromRef} onChange={handleInputValue} required/>
                  ~ 
                  <input type="date" className="" id="searchForm_dateTo" name="date_to" value={searchForm.date_to ?? ""} ref={dateToRef} onChange={handleInputValue} required/>
                </div>

                <div className="ct-approval-grid-label">CT 번호</div>
                <div className="ct-approval-grid-inline">
                  <input type="search" style={{width:"100%"}} className="" id="searchForm_ctCode" name="ct_no" value={searchForm.ct_no} onChange={handleInputValue}/>
                </div>

                <div className="ct-approval-grid-label">검색어</div>
                <div className="ct-approval-grid-inline">
                  <input type="search" style={{width:"100%"}} className="" id="searchForm_ctContent" name="ct_content" value={searchForm.ct_content} onChange={handleInputValue}/>
                </div>
              </div>

              <div className="ct-approval-grid ct-approval-grid-line-2">
                <div className="ct-approval-grid-label">결재 상태</div>
                <div className="ct-approval-grid-inline">
                  {approvalStatusOptions.map((opt, idx) => (
                    <label key={idx} htmlFor={`approvalStatus_${opt.value}`}
                            style={{ display: 'flex', cursor: 'pointer' }}>
                      <input
                        id={`approvalStatus_${opt.value}`}
                        type="checkbox"
                        value={opt.value}
                        checked={searchForm.approval_status?.includes(opt.value) || false}
                        onChange={() => handleApprovalStatusChange(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* ↑ 시험 성적서 조회 조건값 ↑ */}

            </form>
          </div>

          {/* ↓ 검색 조건폼 제어 버튼 영역 ↓ */}
          <div className="form-buttons">
            <button type="button" className="btn-primary" disabled={loading} onClick={(e) => searchApprovalList(e)}>
                {loading ? "검색 중" : "검색"}
            </button>
            <button type="button" className="btn-secondary" onClick={resetSearchForm}>초기화</button>
          </div>
          {/* ↑ 검색 조건폼 제어 버튼 영역 ↑ */}

        </div>
        {/* ↑ 검색 폼 ↑ */}

        {/* ↓ 필터/검색 툴바 ↓ */}
        <div className="approval-toolbar" 
              style={{gridTemplateColumns: "1fr 180px 180px 180px 80px"}}
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
            <label htmlFor="category">카테고리</label>
            <select id="category" value={type} onChange={(e) => setType(e.target.value)}>
              {categories.map((c, idx) => (
                <option key={idx} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
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

        {/* ↓ 결재 목록 테이블 ↓ */}
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
              {paginatedPosts.length === 0 ? (
                <tr>
                  <td className="empty" colSpan={columns.length}>
                    조건에 맞는 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((item, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => handleRowClick(item)}
                    style={{ cursor: "pointer" }}
                    className="hoverable-row"
                  >
                    {columns.map((col) => (
                      <td key={`${idx}-${col.key}`} data-label={col.label}>
                        {col.render ? col.render(item) : (item?.[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* ↑ 결재 목록 테이블 ↑ */}

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
      {/* ↑ 결재 메인 뷰 ↑ */}

      {/* ↓ 경고 모달 영역 ↓ */}
      <div className="modal-alert" tabIndex={-1} ref={refModalAlert}
            style={{
                    top: isOpenModalAlert.position.top,
                    left: isOpenModalAlert.position.left,
                    display: isOpenModalAlert.open ? "block" : "none"
                  }}>
        {Utils.noticeValidation("날짜가")}
      </div>
      {/* ↑ 경고 모달 영역 ↑ */}

      {/* ↓ 결재 상세보기 모달 ↓ */}
      <CT_Request_ApprovalDetail
        isOpen={isApprovalDetailOpen}
        onClose={handleCloseApprovalDetail}
        ctRequestId={selectedApprovalItem?.ct_request_id}
        approvalDocumentId={selectedApprovalItem?.approval_document_id}
      />
      {/* ↑ 결재 상세보기 모달 ↑ */}

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
    <>
      <th
        scope="col"
        aria-sort={ariaSort}
        className={`${isDropTarget ? "th-drop-target" : ""}`}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        onDragEnd={onDragEnd}>
        <button
          type="button"
          className={`th-btn ${isActive ? "active" : ""} ${isDragging ? "th-dragging" : ""}`}
          onClick={sortable ? () => onSort(columnKey) : undefined}
          aria-label={
            sortable
              ? `${label}로 ${isActive && sortDir === "asc" ? "내림차순" : "오름차순"} 정렬`
              : `${label}`
          }>
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
    </>
  );
}