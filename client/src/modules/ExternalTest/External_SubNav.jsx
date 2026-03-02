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

export default function External_SubNav() {

  /**
   * 현재 화면 url 정보 객체
   */
  const url = useUrlInfo().path; // 현재 페이지 경로
  const urlSplit = url.split("/");

  /**
   * goToPage : 페이지 이동 함수
   * ----------------------------------------------------
   * HOW : 
   *   goToPage("/ct/request/read", { requestId: 123, mode: "edit" }); // 파라미터 포함 이동
   *   goToPage("/ct/request/create"); // 파라미터 없이 이동
   */
  const goToPage = useUrlNavigation();

  return (
    <>
        {/* 외부성분분석 페이지 구분 */}
        {urlSplit[1] == "external" &&
          urlSplit[2] == "request" && (
            <div className="navigation-bar">
              <button className={`${url == "/external/request/read" ? "active" : ""}`} onClick={() => {goToPage("/external/request/read", {})}}>조회</button>
              <button className={`${url == "/external/request/create" ? "active" : ""}`} onClick={() => {goToPage("/external/request/create", {})}}>등록</button>
            </div>
          )}
        {/* 외부성분분석 페이지 구분 */}
    </>
  );
}