/**
 * 파일명 : Header.jsx
 * 용도 : 메인 헤더
 * 최초등록 : 2025-11-05 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useContext } from "react";

import { Link } from "react-router-dom";

import { HeaderContext } from "/src/contexts/HeaderContext";
import { AuthContext } from "/src/contexts/AuthContext";

export default function Header() {

  const {
    logout,
    user
  } = useContext(AuthContext);

  /**
   * HeaderProvider 선언된 Context 사용
   */
  const {
    dark, setDark
  } = useContext(HeaderContext);

  /**
   * 다크모드 실행 함수
   */
  const toggleDarkMode = () => {
    setDark(!dark);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to={"/main"} title="메인화면으로 이동">
          <img src="/src/img/company_logo.png" className="header-logo" alt="메인로고" />
        </Link>
      </div>
      {/* <input className="search" type="search" placeholder="메뉴를 입력해주세요..." /> */}
      <div className="icons">
        <div className="profile">
          {user.user_full_name} 님
        </div>
        {/* <button type="button" onClick={toggleDarkMode}>{dark ? "☀️ 라이트" : "🌙 다크"}</button> */}
        <div>
          <button type="button" onClick={(e) => {logout()}} title="로그아웃">🔓</button>
          <button type="button" title="알림">🔔</button>
          <button type="button" title="계정설정">⚙️</button>
        </div>
      </div>
    </header>
  );
}