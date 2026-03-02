/**
 * 파일명 : CT_TestReport_Standard.jsx
 * 용도 : 시험 기준 등록
 * 최초등록 : 2025-11-10 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";

import { AuthContext } from "/src/contexts/AuthContext";

import CT_SubNav from "/src/modules/CT/CT_SubNav";

import * as Utils from "/src/components/Utils";

export default function CT_TestReport_Standard() {

  /**
   * 사용자 정보 컨텍스트
   */
  const { user } = useContext(AuthContext);
  const companyId = user.company_id; // 회사 ID


  /* ============================== 훅 관리 ============================== */
  /**
   * 조회 조건 입력 폼 객체
   */
  const [searchForm, setSearchForm] = useState({
    "material_type" : "",
    "test_name" : "",
    "ct_no" : "",
    "ct_content" : ""
  });


  /**
   * --- API 통신에 사용될 state 객체 ---
   * result, setResult : 결과값
   * loading, setLoading : request 요청 응답 여부
   * error, setError : 응답 오류 여부
   */
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState([]);


  // 테이블 행 리스트 데이터가 여기에 바인딩되어야 함.
  const [rows, setRows] = useState([
    { 
      id: 1, 
      fields: { 
        type: "", 
        method: "", 
        item: "", 
        standard: "", 
        inputType: "", 
        low: "", 
        high: "" 
      }, 
      isChecked: false,
      sortOrder: 1  // 드래그 앤 드롭 정렬을 위한 순서 필드 추가
    }
  ]);


  /**
   * dragIndex: 현재 드래그 중인 행의 인덱스
   * ----------------------------------------------------
   * WHY: 어떤 행을 드래그하고 있는지 추적하여 드롭 시 정렬에 사용
   * HOW: 드래그 시작 시 설정되고, 드롭 완료 시 null로 초기화
   */
  const [dragIndex, setDragIndex] = useState(null);


  /**
   * hoverIndex: 마우스가 현재 위치한 행의 인덱스
   * ----------------------------------------------------
   * WHY: 드래그 중 어느 위치에 드롭될지 시각적 피드백을 제공
   * HOW: 드래그 오버 시 해당 행의 배경색을 변경하여 표시
   */
  const [hoverIndex, setHoverIndex] = useState(null);


  /**
   * isSavingSort: 정렬 저장 중 상태 표시
   * ----------------------------------------------------
   * WHY: 사용자에게 정렬 저장 작업이 진행 중임을 알리기 위해
   * HOW: API 호출 전 true로 설정하고, 완료/실패 후 false로 변경
   */
  const [isSavingSort, setIsSavingSort] = useState(false);


  /**
   * scrollRef: 테이블 스크롤 컨테이너에 대한 참조
   * WHY: 드래그 중 자동 스크롤 기능 구현을 위해 필요
   * HOW: 마우스 위치에 따라 해당 요소의 scrollTop을 조작
   */
  const scrollRef = useRef(null);


  /**
   * initialOrderRef: 저장 시점의 행 순서를 기록
   * ----------------------------------------------------
   * WHY: API 실패 시 이전 상태로 롤백하기 위해 사용
   * HOW: 정렬 저장 성공 시 현재 순서를 저장하고, 
   *      실패 시 이 값을 기준으로 복원
   */
  const initialOrderRef = useRef([]);


  /**
   * SCROLL_THRESHOLD: 자동 스크롤이 시작되는 영역 크기
   * ----------------------------------------------------
   * WHY: 테이블 상하단 일정 영역에서만 스크롤이 작동하도록 제한
   * HOW: 마우스가 상단/하단 40px 이내에 위치할 때 스크롤 활성화
   */
  const SCROLL_THRESHOLD = 40;


  /**
   * SCROLL_SPEED: 자동 스크롤 속도
   * ----------------------------------------------------
   * WHY: 스크롤이 너무 빠르거나 느리지 않도록 조절
   * HOW: 각 이벤트마다 10px씩 스크롤 이동
   */
  const SCROLL_SPEED = 10;


  /**
   * useEffect: 컴포넌트 마운트 시 초기 정렬 상태 저장
   * ----------------------------------------------------
   * WHY: 정렬 변경 실패 시 원래 상태로 복구하기 위한 기준점 설정
   * HOW: 컴포넌트가 처음 렌더링될 때 rows의 id 배열을 저장
   * 주의: 빈 의존성 배열([])로 인해 최초 1회만 실행됨
   */
  useEffect(() => {
    initialOrderRef.current = rows.map(r => r.id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  /**
   * handleAutoScroll: 드래그 중 자동 스크롤 처리
   * ----------------------------------------------------
   * WHY: 긴 목록에서 드래그할 때 화면 끝까지 자동으로 스크롤되도록 지원
   * HOW: 
   * 1. 스크롤 컨테이너의 위치(rect)를 가져옴
   * 2. 마우스 Y 좌표가 상단 임계값 내에 있으면 위로 스크롤
   * 3. 마우스 Y 좌표가 하단 임계값 내에 있으면 아래로 스크롤
   * 
   * @param {DragEvent} e : 드래그 이벤트 객체 (clientY 좌표 사용)
   */
  const handleAutoScroll = (e) => {
    const container = scrollRef.current;
    if (!container) return; // 컨테이너가 없으면 종료

    // 스크롤 컨테이너의 화면상 위치 정보 획득
    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY; // 마우스의 Y 좌표

    // 상단 영역에서 드래그 중이면 위로 스크롤
    if (mouseY < rect.top + SCROLL_THRESHOLD) {
      container.scrollTop -= SCROLL_SPEED;
    } 
    // 하단 영역에서 드래그 중이면 아래로 스크롤
    else if (mouseY > rect.bottom - SCROLL_THRESHOLD) {
      container.scrollTop += SCROLL_SPEED;
    }
  };


  /**
   * saveSortOrder: 정렬 변경사항을 서버에 저장
   * ----------------------------------------------------
   * WHY: 사용자가 드래그로 순서를 변경하면 서버에 반영하기 위해
   * HOW:
   * 1. 로딩 상태를 true로 설정 (UI에 저장 중 표시)
   * 2. 새로운 정렬 순서를 기반으로 payload 생성 (sortOrder를 인덱스+1로 설정)
   * 3. API 호출 시도
   * 4. 성공 시: 기준 정렬(initialOrderRef) 갱신 및 state 업데이트
   * 5. 실패 시: 이전 정렬 상태로 롤백
   * 6. 완료 후: 로딩 상태를 false로 설정
   * 
   * 패턴: 낙관적 업데이트(Optimistic Update) + 롤백
   * 
   * @param {Array} newRows - 새로운 정렬 순서의 행 배열
   */
  const saveSortOrder = async (newRows) => {
    setIsSavingSort(true); // 저장 중 상태 활성화

    // API 전송용 payload 생성
    // WHY: 인덱스 기반으로 sortOrder를 재설정하여 서버와 동기화
    const payload = newRows.map((r, idx) => ({
      id: r.id,
      fields: r.fields,
      isChecked: r.isChecked,
      sortOrder: idx + 1 // 1부터 시작하는 순서 번호
    }));

    try {
      console.log("정렬 저장 payload", payload);

      // 실제 API 호출 위치
      // WHY: 서버에 변경된 정렬 순서를 저장
      // TODO: 실제 환경에서는 아래 주석을 해제하고 fakeApiCall 제거
      // await axios.post("/api/ct/save-sort-order", payload);
      await fakeApiCall(); // 임시 API (실서버 연결 시 제거)

      // 성공 시: 새로운 정렬을 기준점으로 저장
      // WHY: 다음 정렬 변경 시 롤백 기준이 됨
      initialOrderRef.current = newRows.map(r => r.id);
      setRows(payload); // state 업데이트하여 UI 반영

    } catch (e) {
      // 실패 시: 사용자에게 알림
      alert("정렬 저장에 실패했습니다. 이전 상태로 복구합니다.");

      // 롤백 처리
      // WHY: 서버 저장 실패 시 UI를 마지막 성공 상태로 복원
      // HOW: initialOrderRef에 저장된 id 순서대로 행을 재정렬
      const rollbackRows = initialOrderRef.current
        .map(id => newRows.find(r => r.id === id)) // id로 원본 행 찾기
        .filter(Boolean); // undefined 제거

      setRows(rollbackRows); // 복구된 상태로 업데이트
      
      console.error("정렬 저장 오류:", e);
    } finally {
      // 성공/실패 여부와 관계없이 로딩 상태 해제
      setIsSavingSort(false);
    }
  };

  /**
   * fakeApiCall: 실제 API를 대체하는 임시 함수
   * ----------------------------------------------------
   * WHY: 개발 단계에서 서버 없이 저장 로직을 테스트하기 위해
   * HOW: 
   * - 800ms 지연 후 80% 확률로 성공, 20% 확률로 실패
   * - 실서버 연결 시 실제 axios나 fetch 호출로 교체 필요
   * 
   * @returns {Promise} - 성공 또는 실패를 반환하는 Promise
   */
  const fakeApiCall = () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        // 80% 성공, 20% 실패 시뮬레이션
        Math.random() > 0.2 ? resolve() : reject();
      }, 800);
    });

  /**
   * onDragStart: 드래그 시작 시 호출
   * ----------------------------------------------------
   * WHY: 어떤 행을 드래그하고 있는지 기록하기 위해
   * HOW: 드래그 시작한 행의 인덱스를 dragIndex state에 저장
   * 
   * @param {number} index - 드래그를 시작한 행의 인덱스
   */
  const onDragStart = (index) => {
    setDragIndex(index); // 드래그 중인 행 인덱스 기록
  };

  /**
   * onDragOver: 드래그 중 다른 행 위로 이동할 때 호출
   * ----------------------------------------------------
   * WHY: 드롭 위치를 시각적으로 표시하고 자동 스크롤을 처리하기 위해
   * HOW:
   * 1. e.preventDefault()로 기본 동작 취소 (드롭 허용)
   * 2. 현재 호버 중인 행의 인덱스를 hoverIndex에 저장 (배경색 변경용)
   * 3. handleAutoScroll 호출하여 화면 끝에서 자동 스크롤
   * 
   * @param {DragEvent} e - 드래그 이벤트 객체
   * @param {number} index - 현재 마우스가 위치한 행의 인덱스
   */
  const onDragOver = (e, index) => {
    e.preventDefault(); // 기본 동작 취소 (필수)
    setHoverIndex(index); // 현재 호버 중인 행 표시
    handleAutoScroll(e); // 자동 스크롤 처리
  };

  /**
   * onDrop: 드롭(놓기) 시 호출 - 실제 정렬 변경 및 서버 저장
   * ----------------------------------------------------
   * WHY: 드래그한 행을 새 위치로 이동시키고 서버에 저장하기 위해
   * HOW:
   * 1. dragIndex와 dropIndex가 같으면 종료 (위치 변경 없음)
   * 2. 배열 복사 후 splice로 행 이동 처리
   *    - splice(dragIndex, 1): 드래그한 행을 배열에서 제거 및 반환
   *    - splice(index, 0, moved): 드롭 위치에 행 삽입
   * 3. sortOrder를 인덱스 기반으로 재설정 (1부터 시작)
   * 4. state 업데이트하여 UI에 즉시 반영 (낙관적 업데이트)
   * 5. 드래그 관련 state 초기화
   * 6. saveSortOrder 호출하여 서버에 저장 (비동기)
   * 
   * @param {number} index - 드롭한 위치의 인덱스
   */
  const onDrop = async (index) => {
    // 같은 위치에 드롭하거나 dragIndex가 없으면 무시
    if (dragIndex === null || dragIndex === index) return;

    // 배열 불변성 유지를 위해 복사
    const newRows = [...rows];
    
    // 1. 드래그한 행을 배열에서 제거하고 해당 요소 반환
    const [moved] = newRows.splice(dragIndex, 1);
    
    // 2. 드롭 위치에 제거한 행 삽입
    newRows.splice(index, 0, moved);

    // 3. sortOrder를 새로운 순서에 맞게 재설정
    // WHY: 정렬 순서를 명시적으로 관리하여 서버 저장 시 활용
    const reorderedRows = newRows.map((row, idx) => ({
      ...row,
      sortOrder: idx + 1  // 1부터 시작하는 순서 번호
    }));

    // 4. UI에 즉시 반영 (낙관적 업데이트)
    setRows(reorderedRows);
    
    // 5. 드래그 관련 state 초기화
    setDragIndex(null);
    setHoverIndex(null);

    // 6. 서버에 정렬 저장 (비동기)
    // WHY: 정렬 변경이 완료되면 서버에 저장하여 데이터 일관성 유지
    await saveSortOrder(reorderedRows);
  };


  /* ============================== 페이지 함수 ============================== */
  /**
   * resetSearchForm : 검색조건폼 초기화
   */
  const resetSearchForm = () => {
    setSearchForm({
      "material_type" : "",
      "test_name" : "",
      "ct_no" : "",
      "ct_content" : ""
    });
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
   * search : 시험 기준 목록 조회
   * ----------------------------------------------------
   * @param {*} e 이벤트 호출 컴포넌트
   */
  const search = async (e) => {
    e.preventDefault();
    const params = Utils.cleanParams(searchForm);
    console.log(params);
    setLoading(true);
    setError(null);

    try{
        const res = await axios.get("/api/ct/read", {params});
      // 조회 목록을 보여주는 로직이 작성되어야 함.
      setResult(res.data);
    } catch(err) {
      setError("데이터 조회 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  /**
   * create : 시험 기준 저장
   * ----------------------------------------------------
   * @param {*} e 
   */
  const create = async (e) => {
    e.preventDefault();

    if(confirm("저장하시겠습니까?")) {
      console.log("저장 기능 호출");
      console.log(rows);
    }

  }


  /**
   * addRow : 기준 등록 항목 추가
   * ----------------------------------------------------
   * WHY: 사용자가 새로운 시험 기준을 등록할 수 있도록 지원
   * HOW:
   * 1. 현재 rows 배열에서 가장 큰 id를 찾아 +1 (중복 방지)
   * 2. 기본값으로 빈 fields, isChecked=false 설정
   * 3. sortOrder는 새로운 id와 동일하게 설정 (맨 끝에 추가)
   * 4. setRows로 state 업데이트하여 테이블에 새 행 표시
   * 
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const addRow = (e) => {
    e.preventDefault();
    
    // 새로운 id 생성: 기존 최대 id + 1
    // WHY: 고유한 id를 보장하여 key prop 충돌 방지
    const newId = rows.length === 0 ? 1 : Math.max(...rows.map(r => r.id)) + 1;

    const newRow = {
      id: newId,
      isChecked: false,
      fields: { 
        type: "", 
        method: "", 
        item: "", 
        standard: "", 
        inputType: "", 
        low: "", 
        high: "" 
      },
      sortOrder: newId  // 맨 끝에 추가되므로 id와 동일하게 설정
    };
  
    // 배열 끝에 새 행 추가
    // WHY: 함수형 업데이트를 사용하여 최신 state 기반으로 업데이트
    setRows(prev => [...prev, newRow]);
  }


  /**
   * deleteRow : 기준 등록 항목 삭제
   * ----------------------------------------------------
   * WHY: 사용자가 체크박스로 선택한 항목들을 일괄 삭제하기 위해
   * HOW:
   * 1. rows 배열을 filter하여 isChecked가 true인 행들을 찾음
   * 2. 삭제할 항목의 시험방법 코드를 모아서 확인 메시지에 표시
   * 3. 확인 후 isChecked가 false인 행들만 남김
   * 4. sortOrder 재정렬 (연속된 순서 번호 유지)
   */
  const deleteRow = () => {

    const selected = rows.filter(row => row.isChecked);

    let targets = "";

    if(selected.length > 0) {
      // 삭제할 항목들의 시험방법 코드를 문자열로 연결
      selected.forEach(e => {
        targets += e.fields.method + " ";
      });

      if(confirm("[ " + targets + "] 항목을 삭제합니다.")) {
        // isChecked가 false인 행들만 남김 (= 체크된 행 삭제)
        const remainingRows = rows.filter(row => !row.isChecked);
        
        // sortOrder 재정렬
        // WHY: 행 삭제 후에도 연속된 순서 번호 유지
        const reorderedRows = remainingRows.map((row, idx) => ({
          ...row,
          sortOrder: idx + 1
        }));
        
        setRows(reorderedRows);
      }
    }
  
  };


  /**
   * updateField : 각 입력 필드값 바인딩
   * ----------------------------------------------------
   * WHY: 사용자가 각 행의 필드를 수정할 수 있도록 지원
   * HOW: id로 해당 행을 찾아 특정 field만 업데이트
   * 
   * @param {*} id : 선택한 행 키값
   * @param {*} field : 필드명 (type, method, item 등)
   * @param {*} value : 필드값
   */
  const updateField = (id, field, value) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id
          ? { ...row, fields: { ...row.fields, [field]: value } }
          : row
      )
    );
  };


  /**
   * toggleAll : 체크 박스 전체 제어
   * ----------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const toggleAll = (e) => {
    const checked = e.target.checked;
    setRows(prev =>
      prev.map(row => ({ ...row, isChecked: checked }))
    );
  };


  /**
   * toggleCheck : 체크박스 체크/해제 처리
   * ----------------------------------------------------
   * @param {*} id : 선택한 행 키값
   */
  const toggleCheck = (id) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, isChecked: !row.isChecked } : row
      )
    );
  };
  

  return (
    <>

      {/* ↓ 상단 네비게이션 바 ↓ */}
      <CT_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}
      
      {/* ↓ 시험 기준 등록 메인 뷰 ↓ */}
      <div className="container">

        <div>

          {/* ↓ 시험 기준 등록폼 타이틀 ↓ */}
          <div className="page-top"></div>
          {/* ↑ 시험 기준 등록폼 타이틀 ↑ */}

          {/* ↓ 시험 기준 조회 폼 ↓ */}
          <div className="search-information">
            <form id="searchForm">

              {/* ↓ 시험 성적서 조회 조건값 ↓ */}
              <div className="test-standard-search-grid test-standard-search-grid-line-1">
                <div className="test-standard-search-grid-label">자재유형</div>
                <input type="search" className="" id="materialType" name="material_type" value={searchForm.material_type} onChange={handleInputValue}/>

                <div className="test-standard-search-grid-label">시험법 코드</div>
                <input type="search" className="" id="ctCode" name="ct_no" value={searchForm.ct_no} onChange={handleInputValue}/>

                <div className="test-standard-search-grid-label">시험항목</div>
                <input type="search" className="" id="testName" name="test_name" value={searchForm.test_name} onChange={handleInputValue}/>

                <div className="test-standard-search-grid-label">검색어</div>
                <input type="search" className="" id="ctContent" name="ct_content" value={searchForm.ct_content} onChange={handleInputValue}/>
              </div>
              {/* ↑ 시험 성적서 조회 조건값 ↑ */}

            </form>
          </div>
          {/* ↑ 시험 기준 조회 폼 ↑ */}

          {/* ↓ 검색 조건폼 제어 버튼 영역 ↓ */}
          <div className="form-buttons">
            <button type="button" className="btn-primary" onClick={(e) => search(e)} disabled={loading}>
                {loading ? "검색 중" : "검색"}</button>
            <button type="button" className="btn-secondary" onClick={resetSearchForm}>초기화</button>
          </div>
          {/* ↑ 검색 조건폼 제어 버튼 영역 ↑ */}

          {/* ↓ 시험 기준 등록폼 ↓ */}
          <div>
            <form id="standardForm" className="">

              <div id="standard">

                {/* ↓ 시험 기준 등록폼 제어 버튼 영역 ↓ */}
                <div className="form-buttons jcl" style={{marginBottom:"10px"}}>
                  <button type="button" className="btn-success" onClick={(e) => addRow(e)}>추가</button>
                  <button type="button" className="btn-danger" onClick={deleteRow}>삭제</button>
                  <button type="button" className="btn-primary" onClick={(e) => create(e)} disabled={loading}>
                    {loading ? "저장 중" : "저장"}
                  </button>

                  {/* 정렬 저장 중 로딩 표시 */}
                  {/* WHY: 사용자에게 정렬 저장 작업이 진행 중임을 알림 */}
                  {isSavingSort && <span className="setting-loading">🔄 정렬 저장 중...</span>}

                </div>
                {/* ↑ 시험 기준 등록폼 제어 버튼 영역 ↑ */}

                {/* ↓ 시험 기준 등록폼 입력값 ↓ */}
                <div className="table-wrap border" ref={scrollRef}>
                  <table className="list-table">
                    <colgroup>
                      <col style={{width:"2%"}}></col>

                      <col style={{width:"3%"}}></col>

                      <col style={{width:"10%"}}></col>

                      <col style={{width:"10%"}}></col>

                      <col style={{width:"16%"}}></col>

                      <col style={{width:""}}></col>

                      <col style={{width:"15%"}}></col>

                      <col style={{width:"8%"}}></col>

                      <col style={{width:"8%"}}></col>
                    </colgroup>
                    <thead>
                      <tr className="">
                        <th><input type="checkbox" onChange={toggleAll} /></th>
                        <th className="" title="드래그하여 정렬을 변경할 수 있습니다.">번호</th>
                        <th className="">자재유형</th>
                        <th className="">시험방법 코드</th>
                        <th className="">시험항목</th>
                        <th className="">시험기준</th>
                        <th className="">결과입력방식</th>
                        <th className="">하한규격</th>
                        <th className="">상한규격</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* <tr>
                        <td className="tac" data-label="선택">
                          <input type="checkbox"></input>
                        </td>
                        <td className="tac" data-label="자재유형">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>
                        <td className="tac" data-label="시험방법 코드">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>

                        <td className="tac" data-label="시험항목">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>

                        <td className="tac" data-label="시험기준">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>

                        <td className="tac" data-label="결과입력방식">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>
                        
                        <td className="tac" data-label="하한규격">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>

                        <td className="tac" data-label="상한규격">
                          <input type="text" id="" className="" name="" onChange={handleChange} style={{width:"100%"}} required/>
                        </td>
                      </tr> */}

                      {/* ↓ 탭 추가 시 동적으로 생성되는 행 ↓ */}
                      {rows.map((row, index) => (
                          <tr key={row.id} style={{background: hoverIndex === index ? "#e6f2ff" : "transparent"}}
                              onDragOver={(e) => onDragOver(e, index)}
                              onDrop={() => onDrop(index)}>
                            <td className="tac" data-label="선택" style={{backgroundColor:"#f8fafc"}}>
                              <input
                                type="checkbox"
                                checked={row.isChecked}
                                onChange={() => toggleCheck(row.id)}/>
                            </td>

                            <td className="tac" data-label="번호" draggable="true"
                              onDragStart={() => onDragStart(index)}
                              style={{
                                cursor: "grab",
                                backgroundColor: "#f8fafc",
                                fontWeight: "bold",
                                userSelect: "none"  // 드래그 시 텍스트 선택 방지
                              }}>
                              {row.sortOrder}
                            </td>

                            <td className="tac" data-label="자재유형">
                              <input
                                type="text"
                                value={row.fields.type}
                                onChange={(e) => updateField(row.id, "type", e.target.value)}
                                style={{width:"100%"}}/>
                            </td>

                            <td className="tac" data-label="시험방법 코드">
                              <input
                                type="text"
                                value={row.fields.method}
                                onChange={(e) => updateField(row.id, "method", e.target.value)}
                                style={{width:"100%"}}/>
                            </td>

                            <td className="tac" data-label="시험항목">
                              <input
                                type="text"
                                value={row.fields.item}
                                onChange={(e) => updateField(row.id, "item", e.target.value)}
                                style={{width:"100%"}}/>
                            </td>

                            <td className="tac" data-label="시험기준">
                              <input
                                type="text"
                                value={row.fields.standard}
                                onChange={(e) => updateField(row.id, "standard", e.target.value)}
                                style={{width:"100%"}}/>
                            </td>

                            <td className="tac" data-label="결과입력방식">
                              <input className="" type="text" id="" name="" required></input>
                              <select className="">
                                <option>적부</option>
                                <option>수치범위</option>
                                <option>직접입력</option>
                              </select>
                            </td>

                            <td className="tac" data-label="하한규격">
                              <input
                                type="text"
                                value={row.fields.low}
                                onChange={(e) => updateField(row.id, "low", e.target.value)}
                                style={{width:"100%"}}/>
                            </td>

                            <td className="tac" data-label="상한규격">
                              <input
                                type="text"
                                value={row.fields.high}
                                onChange={(e) => updateField(row.id, "high", e.target.value)}
                                style={{width:"100%"}}/>
                            </td>
                          </tr>
                      ))}
                      {/* ↑ 탭 추가 시 동적으로 생성되는 행 ↑ */}

                    </tbody>
                  </table>
                </div>
                {/* ↑ 시험 기준 등록폼 입력값 ↑ */}

              </div>
            </form>
          </div>
          {/* ↑ 시험 기준 등록폼 ↑ */}
          
        </div>

      </div>
      {/* ↑ 시험 기준 등록 메인 뷰 ↑ */}
    </>
  )
}