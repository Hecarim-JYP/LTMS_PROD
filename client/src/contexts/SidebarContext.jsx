/**
 * 파일명 : SidebarContext.jsx
 * 용도 : 전역 상태관리 SidebarContext
 * 최초등록 : 2025-10-30 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { createContext } from "react";

/**
 * Context는 전역 싱글톤 개념으로 전역 상태 관리 역할을 하기 때문에 
 * 렌더링 시 최초 한 번만 생성되도록 별도 파일에서 생성 후 import하는 것이 원칙.
 */
export const SidebarContext = createContext(null);