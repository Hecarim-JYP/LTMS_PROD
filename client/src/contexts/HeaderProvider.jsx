/**
 * 파일명 : HeaderProvider.jsx
 * 용도 : 헤더 상태관리 Context API
 * 최초등록 : 2025-11-25 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useMemo, useState } from "react";
import { HeaderContext } from "/src/contexts/HeaderContext";

export const HeaderProvider = ({children}) => {
    
    /********************************** Context 선언 **********************************/
    // 다크모드 여부
    const [dark, setDark] = useState(false);


    /************************************************************************************
    Why : HeaderContext.Provider의 value가 변경되면 해당 Context를 사용하는 모든 컴포넌트가 리렌더링됨.
          따라서, value 객체를 useMemo로 메모이제이션하여
          실제 상태(dark)가 바뀔 때만 새 객체 생성되도록 함.

          dependency 배열에 포함된 값이 변경될 때만 memo 객체 재생성됨.(불필요한 리렌더링을 방지)
    ************************************************************************************/
    const memo = useMemo(() => ({
        dark, setDark,
    }), [dark]);

    /************************************************************************************
    Provider로 상태 공급
    HeaderContext.Provider에 memo를 넣어 하위 컴포넌트에 공유.
    이 Provider로 감싸진 모든 컴포넌트는 useContext(Context)로 상태 접근 가능.
    ************************************************************************************/
    return (
        <>
            <HeaderContext.Provider value={memo}>
                {children}
            </HeaderContext.Provider>
        </>
    );
}