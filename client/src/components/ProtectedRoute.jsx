/**
 * 파일명 : ProtectedRoute.jsx
 * 용도 : 권한이나 로그인 여부를 체크 후 각 화면으로 라우팅하기 위한 보호 컴포넌트
 * 최초등록 : 2025-12-16 [박진영]
 * 수정일자 : 2026-02-10 [박진영] - 메뉴 접근 권한과 동작 권한 분리
 * 수정사항 : 
 *   - ProtectedRoute는 메뉴 접근 권한(access)만 체크
 *   - 동작 권한(create, update, delete)은 화면에서 useActionPermission 훅 사용
 */

import { useContext, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "/src/contexts/AuthContext";

/**
 * 권한 체크 제외 경로 목록
 * --------------------------------------------------------
 * 로그인한 사용자라면 누구나 접근 가능한 경로
 */
const PUBLIC_PATHS = ['/', '/main', '/login', '/material-receipt'];

/**
 * URL 경로를 파싱하여 module 추출
 * --------------------------------------------------------
 * @param {string} pathname - 현재 URL 경로
 * @returns {{ module: string, isValid: boolean }}
 * 
 * EXAMPLE:
 *   /ct/request/read          → ct_request_read
 *   /ct/request/create        → ct_request_create
 *   /setting/default          → setting_default
 *   /setting/selectOptions/labsDept → setting_selectOptions_labsDept
 */
const parseUrlPath = (pathname) => {
    const pathParts = pathname.split('/').filter(part => part);
    
    // 경로가 너무 짧으면 파싱 불가
    if (pathParts.length < 2) {
        return { module: '', isValid: false };
    }
    
    let module = '';
    
    // Case 1: setting/selectOptions/** (4개 세그먼트)
    if (pathParts[0] === 'setting' && pathParts[1] === 'selectOptions' && pathParts.length >= 3) {
        const thirdPart = pathParts[2];  // labsDept, managerType, judgment, unit
        module = `setting_selectOptions_${thirdPart}`;
    }
    // Case 2: 3개 이상의 세그먼트 (모듈/카테고리/액션)
    else if (pathParts.length >= 3) {
        const firstPart = pathParts[0];  // ct, internal, external, preservative, setting
        const secondPart = pathParts[1]; // request, testReport, schedule
        const thirdPart = pathParts[2];  // read, create, approve, report, standard, ct
        module = `${firstPart}_${secondPart}_${thirdPart}`;
    }
    // Case 3: 2개 세그먼트 (setting 하위 직접 메뉴)
    else if (pathParts.length === 2) {
        const firstPart = pathParts[0];  // setting
        const secondPart = pathParts[1]; // default, auth, user
        module = `${firstPart}_${secondPart}`;
    }
    
    return {
        module,
        isValid: !!module
    };
}

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * ================================================================
 * 역할:
 *   - 로그인 여부 확인
 *   - 메뉴 접근 권한 체크 (permission_type='menu')
 * 
 * 동작 권한 체크는 하지 않음:
 *   - create, update, delete 등의 동작 권한은 각 화면에서
 *     useActionPermission 훅을 사용하여 체크
 * 
 * @param {ReactNode} children : 보호할 컴포넌트
 * @param {string} requiredRole : 필요한 역할 (선택, 거의 사용 안함)
 * @param {string} requiredPermission : 필요한 권한 코드 (선택, 거의 사용 안함)
 */
export default function ProtectedRoute({ children, requiredRole, requiredPermission }) {
    
    const location = useLocation();

    const { 
        isAuthenticated,
        loading,
        hasRole,
        hasPermission,
        hasMenuAccess
    } = useContext(AuthContext);

    // URL 파싱은 한 번만 수행 (메모이제이션)
    const { module, isValid } = useMemo(
        () => parseUrlPath(location.pathname),
        [location.pathname]
    );

    // 인증 확인 중일 때 로딩 표시
    if (loading) {
        return (
            <div className="jcc" style={{ display: "flex", alignItems: "center", height: "100vh" }}>
                <p>로딩 중...</p>
            </div>
        );
    }

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Props로 전달된 특정 역할 체크 (선택사항)
    if (requiredRole && !hasRole(requiredRole)) {
        console.warn(`역할 권한 없음: ${location.pathname} (필요 역할: ${requiredRole})`);
        alert("접근 권한이 없습니다.");
        return <Navigate to="/main" replace />;
    }

    // Props로 전달된 특정 권한 체크 (선택사항)
    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.warn(`권한 없음: ${location.pathname} (필요 권한: ${requiredPermission})`);
        alert("해당 기능을 사용할 권한이 없습니다.");
        return <Navigate to="/main" replace />;
    }

    // 공개 경로는 권한 체크 제외
    if (PUBLIC_PATHS.includes(location.pathname)) {
        return children;
    }
    
    // URL 파싱 실패 시 (개발 중인 페이지 등)
    if (!isValid) {
        console.warn(`권한 체크 건너뜀: URL 파싱 실패 (경로: ${location.pathname})`);
        return children;
    }
    
    /**
     * 메뉴 접근 권한 체크 (URL 기반)
     * ========================================
     * 체크 항목:
     *   - 해당 메뉴(module)에 접근할 수 있는가?
     *   - permission_type='menu'인 권한만 체크
     * 
     * 동작 권한(create, update, delete)은 체크하지 않음:
     *   - 각 화면에서 useActionPermission 훅 사용
     *   - 버튼/동작 실행 시점에 체크
     * 
     * EXAMPLE:
     *   URL: /ct/request/create
     *   → module: "ct_request"
     *   → hasMenuAccess("ct_request") 확인
     *   → 접근 가능하면 페이지 렌더링
     *   → 화면에서 canCreate 체크하여 등록 버튼 활성화 여부 결정
     */
    
    // 메뉴 접근 권한 체크
    if (!hasMenuAccess(module)) {
        console.warn(`메뉴 접근 권한 없음: ${location.pathname} (module: ${module})`);
        alert(`해당 메뉴에 접근할 권한이 없습니다.`);
        return <Navigate to="/main" replace />;
    }

    // 권한 체크 통과 - 페이지 렌더링
    return children;
}