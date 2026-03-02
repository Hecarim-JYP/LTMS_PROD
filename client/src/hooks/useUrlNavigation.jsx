/**
 * 파일명 : useUrlNavigation.jsx
 * 용도 : url 이동 제어 컴포넌트
 * 최초등록 : 2025-12-12 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useNavigate } from "react-router-dom";

export default function useUrlNavigation() {

  const navigate = useNavigate();

  /**
   * buildQueryString : 쿼리스트링 생성 함수
   * ----------------------------------------------------
   * WHY:
   * - params 객체를 매번 '?key=value&...' 로 직접 조립하면 실수 가능
   * - URLSearchParams를 사용하면 표준적이고 안전하게 쿼리 생성 가능
   * @param {*} params : 쿼리스트링 원본
   * @returns 
   */
  const buildQueryString = (params = {}) => {
    const p = new URLSearchParams();

    // params 객체의 key/value 를 순회하며 쿼리셋 구성
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return; // 빈값 제외
      p.set(k, String(v)); // 모든 값을 문자열로 변환하여 set
    });

    // 최종적으로 "?action=read&id=10" 처럼 반환
    const s = p.toString();
    return s ? `?${s}` : "";
  };


  /**
   * goToPage : 페이지 이동 함수
   * ----------------------------------------------------
   * WHY :
   * - "/ct/request/read?action=read" 같은 URL을 매번 문자열로 만들면 중복 및 실수 증가
   * - path와 params를 분리하여 navigate를 재사용 가능한 구조로 만들기 위함
   * @param {*} path : 이동할 url
   * @param {*} params : 쿼리스트링 파라미터
   */
  const goToPage = (path = "/", params = {}) => {
    const qs = buildQueryString(params);
    navigate(`${path}${qs}`); // navigate를 호출할 때 path + querystring 을 합쳐서 이동
  };

  return goToPage;
}