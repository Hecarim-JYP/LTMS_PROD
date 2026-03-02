/**
 * 파일명 : ApprovalSettingSubNav.jsx
 * 용도 : 결재선 관리 페이지 상단 네비게이션 바
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React from "react";

import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

export default function ApprovalSettingSubNav() {

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
    <div className="navigation-bar">
      <button className={`${url === "/setting/approval/read" ? "active" : ""}`} onClick={(e) => {handleNavigation(e, "/setting/approval/read", {})}}>조회</button>
      <button className={`${url.includes("/setting/approval/create") ? "active" : ""}`} 
              onClick={(e) => {handleNavigation(e, "/setting/approval/create", {})}}>
        {url.includes("/setting/approval/create") && query.mode === "update" ? "수정" : "등록"}
      </button>
    </div>
  );
}