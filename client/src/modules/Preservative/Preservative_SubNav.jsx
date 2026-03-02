/**
 * 파일명 : Preservative_SubNav.jsx
 * 용도 : Preservative 페이지 상단 네비게이션 바
 * 최초등록 : 2025-11-03 [박진영]
 * 수정일자 : 2025-12-30 [최연웅]
 * 수정사항 :
 */

import React from "react";

import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

export default function Preservative_SubNav() {

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
        {/* 방부력테스트 페이지 구분 */}
        {urlSplit[1] == "preservative" &&
          urlSplit[2] == "request" && (
            <div className="navigation-bar">
              <button className={`${url == "/preservative/request/read" ? "active" : ""}`} onClick={() => {goToPage("/preservative/request/read", {})}}>조회</button>
              <button className={`${url == "/preservative/request/create" ? "active" : ""}`} onClick={() => {goToPage("/preservative/request/create", {})}}>등록</button>
              <button className={`${url == "/preservative/request/approve" ? "active" : ""}`} onClick={() => {goToPage("/preservative/request/approve", {})}}>결재</button>
            </div>
        )}

    </>
  );
}