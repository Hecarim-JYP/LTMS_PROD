/**
 * 파일명 : AuthContext.jsx
 * 용도 : 전역 권한 및 로그인 포함 사용자 인증 관리 AuthContext
 * 최초등록 : 2025-12-16 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { createContext } from "react";

/**
 * Context는 전역 싱글톤 개념으로 전역 상태 관리 역할을 하기 때문에 
 * 렌더링 시 최초 한 번만 생성되도록 별도 파일에서 생성 후 import하는 것이 원칙.
 */
export const AuthContext = createContext(null);