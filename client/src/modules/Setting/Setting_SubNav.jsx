/**
 * 파일명 : Setting_SubNav.jsx
 * 용도 : 설정 페이지 상단 네비게이션 바
 * 최초등록 : 2025-12-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 * 사용되지 않음.
 */

import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

export default function Setting_SubNav() {

  /**
   * 현재 화면 url 정보 객체
   */
  const { path } = useUrlInfo(); // 현재 페이지 경로


  /**
   * 현재 경로의 마지막 값 추출 (예: /setting/selectOptions/ct → ct)
   */
  const tab =  path.split("/").filter(Boolean).at(-1);


  /**
   * 현재 경로에서 마지막 / 이후의 값 제거 (예: /setting/selectOptions/ct → /setting/selectOptions)
   */
  const targetUrl = path.toString().substr(0, path.lastIndexOf("/"));


  /**
   * goToPage : 페이지 이동 함수
   * ----------------------------------------------------
   * HOW : 
   *   goToPage("/ct/request/read", { requestId: 123, mode: "edit" }); // 파라미터 포함 이동
   *   goToPage("/ct/request/create"); // 파라미터 없이 이동
   */
  const goToPage = useUrlNavigation();

  // Setting_SubNav 컴포넌트 렌더링
  return (
    <>
      <div className="setting-navigation-bar">
        <button className={`${tab === "ct" ? "active" : ""}`} onClick={() => {goToPage(targetUrl + "/ct", {})}}>CT</button>
        <button className={`${tab === "external" ? "active" : ""}`} onClick={() => {goToPage(targetUrl + "/external", {})}}>외부 분석</button>
        <button className={`${tab === "internal" ? "active" : ""}`} onClick={() => {goToPage(targetUrl + "/internal", {})}}>내부 분석</button>
        <button className={`${tab === "preservative" ? "active" : ""}`} onClick={() => {goToPage(targetUrl + "/preservative", {})}}>방부 테스트</button>
      </div>
    </>
  );
}