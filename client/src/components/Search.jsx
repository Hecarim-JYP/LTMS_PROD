/**
 * 파일명 : Search.jsx
 * 용도 : ERP 데이터 조회 등 조회 공통 컴포넌트
 * 최초등록 : 2025-12-08 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useState, useEffect, useMemo, useRef } from "react";

import * as Utils from "/src/components/Utils";

export default function Search({
  listData = [],      // 검색 대상 데이터 리스트
  fetcher = "",       // 필요 시 API 조회용 fetcher
  labelKey = "",      // 화면에 표시할 필드명 (예: employee_name)
  inputId = "",       // 인풋 태그 ID
  inputName = "",     // 인풋 태그 Name
  valueKey = "",      // 내부적으로 사용되는 PK 키값
  placeholder = "",
  onSelect = () => {} // 부모 CTForm에 선택 데이터를 전달하는 콜백
}) {


  /**
   * 필터링된 데이터 목록 div 높이
   */
  const dataListHeight = "30px";


  /**
   * 컴포넌트 state 객체
   * --------------------------------------------
   * keyword, setKeyword : 검색 키워드 (사용자가 입력하는 즉시 변하는 값)
   * debounced, setDebounced : 입력이 멈춘 후 일정 시간 후 확정된 값
   * isOpen, setIsOpen : 데이터 목록 활성화 여부
   * isSelect, setIsSelect : 데이터 선택 여부
   * dropdownPosition, setDropdownPosition : 필터링 목록 노출 위치
   */
  const [keyword, setKeyword] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSelect, setIsSelect] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });


  /**
   * 필터링 리스트 div ref
   */
  const boxRef = useRef(null);


  /** --------------------------------------------
   * 검색 디바운스
   * WHY : 타이핑할 때 마다 필터링이 매번 실행되면 성능 저하 → 300ms 지연
   * -------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);


  /**
   * closeDataList : 필터링된 데이터리스트 닫기
   */
  useEffect(() => {
    const closeDataList = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setIsOpen(false);
    };

    document.addEventListener("mousedown", closeDataList);

    return () => {
      document.removeEventListener("mousedown", closeDataList);
    }
  }, []);


  const normalizedList = useMemo(() => {
    return listData.map((item) => {
      const label = (item[labelKey] ?? "").toString();
      return {
        ...item,
        _lower: label.toLowerCase(),
        _norm: Utils.normalize(label),     // 초성/특수문자 제거 버전 캐싱
      };
    });
  }, [listData, labelKey]);  
  

  /**
   * filtered : 검색 조건에 해당하는 데이터 목록을 반환하는 함수
   * ----------------------------------------------------------------
   * HOW :
   *   - debounced(디바운싱된 검색어)를 기준으로 listData를 필터링한다.
   *   - 정규화(normalize)를 통해 초성/영문/숫자 검색까지 지원한다.
   *   - 검색 조건:
   *        1) 소문자로 변환한 값(labelLower)에 keywordRaw 포함 여부 검사
   *        2) 정규화한 값(labelNorm)에 keywordNorm 포함 여부 검사
   *   - 둘 중 하나라도 true이면 해당 항목을 결과에 포함한다.
   *
   * WHEN :
   *   - debounced 값이 변경될 때 (사용자가 입력을 멈춘 뒤 300ms 후)
   *   - listData가 API 재조회 또는 props 갱신으로 변경될 때
   *   - labelKey가 변경될 때(다른 필드 기준 검색으로 바뀔 때)
   *
   * WHY :
   *   - 즉시(keyword) 상태로 필터링하면 입력할 때마다 연산이 발생 → 성능 저하
   *   - debounced를 사용해 입력이 멈췄을 때만 필터링하여 성능을 최적화하려는 목적
   *   - 원본 포함 검색 + 정규화 검색을 함께 처리해
   *       ㄱㅎ → "김하늘"
   *       sm → "Samsung"
   *       010 → 전화번호 와 같이 다양한 검색 패턴을 지원하기 위함
   */
  const filtered = useMemo(() => {
    if (!debounced) return normalizedList;
  
    const keywordLower = debounced.toLowerCase();
    const keywordNorm = Utils.normalize(debounced);
  
    const words = debounced.split(/\s+/).filter(Boolean);
  
    return normalizedList.filter((item) => {
      const matchLower = item._lower.includes(keywordLower);
      const matchNorm = item._norm.includes(keywordNorm);
  
      const matchWordLower = words.every(w =>
        item._lower.includes(w.toLowerCase())
      );
  
      const matchWordNorm = words.every(w =>
        item._norm.includes(Utils.normalize(w))
      );
  
      return matchLower || matchNorm || matchWordLower || matchWordNorm;
    });
  
  }, [debounced, normalizedList]);
  
  

  /**
   * openSearchList : 검색창 입력 시 검색 리스트를 열고 위치를 계산
   * ----------------------------------------------------------------
   * WHEN :
   *   - 사용자가 검색 input에 값을 입력할 때마다 호출된다(onChange 이벤트).
   *
   * WHY :
   *   - 입력 즉시 keyword state를 업데이트하여 화면에 반영하기 위함.
   *   - dropdown 리스트를 input 위치 기준으로 정확히 표시하기 위해
   *     DOM의 절대 좌표를 계산해야 한다.
   *   - isOpen / isSelect 상태를 조절해 '선택 중인지, 검색 중인지'를 구분하기 위함.
   * 
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const openSearchList = (e) => {

    setKeyword(e.target.value); // 입력된 값을 keyword에 즉시 반영 → 실시간 입력 UI 업데이트
    setIsOpen(true);    // 검색 리스트를 무조건 열기 (입력 중에는 항상 open 상태)
    setIsSelect(false); // 옵션 선택 상태는 false로 초기화 (입력 중이므로 선택 해제)

    // input 컨테이너의 위치 정보를 DOM에서 가져오기
    const rect = boxRef.current.getBoundingClientRect();

    // dropdown을 input 바로 아래 위치에 정렬되도록 top/left 좌표 설정
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX
    });
  
  };


  /**
   * selectItem : 목록에서 항목을 클릭했을 때 선택 처리를 수행
   * ----------------------------------------------------------------
   * WHEN :
   *   - 사용자가 dropdown 목록에서 특정 항목을 클릭했을 때 실행된다.
   *
   * WHY :
   *   - 선택된 항목의 label을 input에 표시하기 위해 keyword를 수정해야 함.
   *   - 부모 컴포넌트로 선택된 item을 전달해 form 바인딩을 수행해야 함.
   *   - 선택 순간 dropdown을 닫고 '선택 완료 상태'로 전환해야 함.
   * @param {*} item : 상위 컴포넌트 form 객체에 바인딩할 객체
   */
  const selectItem = (item) => {
    setKeyword(item[labelKey]); // 선택한 항목의 labelKey 값을 input에 바로 표시
    onSelect(item);     // 부모 컴포넌트(CTForm 등)로 선택된 객체를 전달하여 바인딩 처리
    setIsOpen(false);   // 리스트 닫기 (선택 후 더 이상 보여줄 필요 없음)
    setIsSelect(true);  // 선택 완료 상태로 설정하여 다시 리스트가 열리지 않도록 제어
  };


  /**
   * 필터링 리스트 렌더링
   */
  return (
    <div>
      {/* 입력칸 */}
      <div className="searchContainer" ref={boxRef}>
        <input className="searchContainer-input" type="search" value={keyword ?? ""} placeholder={placeholder} onChange={(e) => openSearchList(e)} />
        <input type="hidden" id={inputId} name={inputName} required />
        {/* 리스트 */}
        {isOpen && !isSelect ? 
          <div className="searchContainer-data-list" 
              style={{
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      height: filtered.length === 0 ? dataListHeight : "200px",
                      overflowY: filtered.length === 0 ? "" : "auto"
                      }}>
            {filtered.length === 0 ? (
              <div className="searchContainer-no-data">
                데이터를 찾을 수 없습니다.
              </div>
            ) : filtered.map((item) => (
              <div className="searchContainer-data-item" key={item[valueKey]} onClick={() => selectItem(item)}>
                {Utils.highlight(item[labelKey], debounced)}
              </div>
            ))}
          </div>
        : null}
      </div>
    </div>
  );
}