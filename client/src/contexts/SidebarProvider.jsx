/**
 * 파일명 : SidebarProvider.jsx
 * 용도 : 사이드바 상태관리 Context API
 * 최초등록 : 2025-11-25 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useMemo, useState, useEffect } from "react";
import { SidebarContext } from "/src/contexts/SidebarContext";

export const SidebarProvider = ({children}) => {
    
    /* ================================== 세션 스토리지 사용 ================================== */
    // sessionStorage, localStorage는 문자열만 저장할 수 있으므로 JSON 객체를 문자열로 직렬화하여 저장.
    // 사이드 바 활성화 여부
    const [isSideBarOpen, setIsSideBarOpen] = useState(() => {
        // 먼저 sessionStorage 확인
        const storedValue = sessionStorage.getItem("isSideBarOpen");
        if (storedValue !== null) {
            return JSON.parse(storedValue);
        }
        
        // sessionStorage에 없으면 사용자 설정 확인
        try {
            const userData = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user"));
            if (userData?.customSettings?.sidebar_collapsed !== undefined) {
                // sidebar_collapsed: 1(접힘), 0(펼침) → isSideBarOpen: false(접힘), true(펼침)
                return userData.customSettings.sidebar_collapsed === 0;
            }
        } catch (error) {
            console.error('사용자 설정 로드 실패:', error);
        }
        
        // 기본값: 펼침
        return true;
    });

    // 트리 펼침 상태
    const [expandedKeys, setExpandedKeys] = useState(() => {
        return new Set(JSON.parse(sessionStorage.getItem("expandedKeys")) || []);
      });

    // 저장 - sessionStorage 사용하여 새로고침이나 페이지 이동 시에도 값을 유지하도록 함.
    useEffect(() => {
        sessionStorage.setItem("isSideBarOpen", JSON.stringify(isSideBarOpen));
    }, [isSideBarOpen]);

    useEffect(() => {
        sessionStorage.setItem("expandedKeys", JSON.stringify([...expandedKeys]));
    }, [expandedKeys]);


    /************************************************************************************
    Why : SidebarContext.Provider의 value가 변경되면 해당 Context를 사용하는 모든 컴포넌트가 리렌더링됨.
          따라서, value 객체를 useMemo로 메모이제이션하여
          실제 상태(isSideBarOpen, expandedKeys etc.)가 바뀔 때만 새 객체 생성되도록 함.

          dependency 배열에 포함된 값이 변경될 때만 memo 객체 재생성됨.(불필요한 리렌더링을 방지)
    ************************************************************************************/
    const memo = useMemo(() => ({
        isSideBarOpen, setIsSideBarOpen,
        expandedKeys, setExpandedKeys
    }), [isSideBarOpen, expandedKeys]);

    /************************************************************************************
    Provider로 상태 공급
    SidebarContext.Provider에 memo를 넣어 하위 컴포넌트에 공유.
    이 Provider로 감싸진 모든 컴포넌트는 useContext(Context)로 상태 접근 가능.
    ************************************************************************************/
    return (
        <>
            <SidebarContext.Provider value={memo}>
                {children}
            </SidebarContext.Provider>
        </>
    );
}