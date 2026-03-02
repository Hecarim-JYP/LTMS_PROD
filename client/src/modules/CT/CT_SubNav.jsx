/**
 * 파일명 : CT_SubNav.jsx
 * 용도 : CT 페이지 상단 네비게이션 바
 * 최초등록 : 2025-11-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React from "react";

import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

export default function CT_SubNav() {

  /**
   * 현재 화면 url 정보 객체
   */
  const url = useUrlInfo().path; // 현재 페이지 경로
  const query = useUrlInfo().query; // 쿼리스트링 객체


  /**
   * goToPage : 페이지 이동 함수
   * ----------------------------------------------------
   * HOW : 
   *   goToPage("/ct/request/read", { requestId: 123, mode: "edit" }); // 파라미터 포함 이동
   *   goToPage("/ct/request/create"); // 파라미터 없이 이동
   */
  const goToPage = useUrlNavigation();


  /**
   * handleNavigation : 네비게이션 바 클릭 시 페이지 이동 처리
   * ----------------------------------------------------
   * @param {*} e : 이벤트 객체
   * @param {*} path : 이동할 경로
   * @param {*} param : 이동할 때 전달할 파라미터 객체
   * @returns 
   */
  const handleNavigation = (e, path, param) => {
    const className = e.target.className;
    if(className.includes("active")) return; // 이미 활성화된 탭이면 무시
    goToPage(path, param);
  };


  return (
    <>
        {url.includes("request") && (
          <div className="navigation-bar">
            <button className={`${url === "/ct/request/read" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/request/read", {})}}>조회</button>
            <button className={`${url.includes("/ct/request/create") ? "active" : ""}`} 
                    onClick={(e) => {handleNavigation(e, "/ct/request/create", {})}}>
              {`${url.includes("/ct/request/create") && query.mode === "update" ? "수정" : "등록"}`}
            </button>
            <button className={`${url === "/ct/request/approval" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/request/approval", {})}}>결재</button>
          </div>
        )}

        {url.includes("testReport") && (
          <div className="navigation-bar">
            <button className={`${url == "/ct/testReport/read" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/testReport/read", {})}}>조회</button>
            <button className={`${url == "/ct/testReport/report" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/testReport/report", {})}}>성적서</button>
            <button className={`${url == "/ct/testReport/standard" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/testReport/standard", {})}}>기준 등록</button>
          </div>
        )}

        {url.includes("schedule") && (
          <div className="navigation-bar">
            <button className={`${url == "/ct/schedule/ct" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/schedule/ct", {})}}>CT</button>
            <button className={`${url == "/ct/schedule/report" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/ct/schedule/report", {})}}>시험</button>
          </div>
        )}
    </>
  );
}