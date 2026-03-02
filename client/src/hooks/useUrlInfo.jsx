/**
 * 파일명 : useUrlInfo.jsx
 * 용도 : url 관리 통합 컴포넌트
 * 최초등록 : 2025-12-12 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useLocation } from "react-router-dom";

export default function useUrlInfo() {

  // React Router가 제공하는 location 객체를 통해 URL 관련 정보(path, search, hash)를 실시간으로 획득
  const location = useLocation();

  // URLSearchParams를 이용해 location.search 파싱 객체 생성
  const searchParams = new URLSearchParams(location.search);

  const query = {};
  
  // searchParams의 key/value 를 순회하며 JSON 객체로 변환
  searchParams.forEach((v, k) => (query[k] = v));

  return {
    fullUrl: window.location.href,  // 현재 전체 URL 반환 (location.href 대신 window.location 사용해야 전체 주소 접근 가능)
    path: location.pathname,        // path 부분만 추출 예) /ct/request/read
    search: location.search,        // ? 뒤의 원본 쿼리 문자열 그대로 반환 (?action=read&id=10)
    query,                          // key-value 형태로 변환된 query 객체 반환 ({ action: "read", id: "10" })
    hash: location.hash,            // URL 해시(#something) 반환
  };

}