/**
 * 파일명 : AuthProvider.jsx
 * 용도 : 권한 관리 Context API
 * 최초등록 : 2025-12-16 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "/src/contexts/AuthContext";
import createApiClient from "/src/hooks/createApiClient";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

/**
 * 인증 상태를 전역으로 관리하는 Provider
 * - 로그인/로그아웃 처리
 * - 토큰 관리 (Access Token, Refresh Token)
 * - 권한 확인
 */
export const AuthProvider = ({ children }) => {
    

    // 사용자 정보 상태
    const [user, setUser] = useState(null);


    // 인증 확인 중 로딩 상태
    const [loading, setLoading] = useState(true);


    /**
     * goToPage : 페이지 이동 함수
     * ----------------------------------------------------
     * HOW : 
     *   goToPage("/ct/request/read", { requestId: 123, mode: "edit" }); // 파라미터 포함 이동
     *   goToPage("/ct/request/create"); // 파라미터 없이 이동
     */
    const goToPage = useUrlNavigation();


    /**
     * 컴포넌트 마운트 시 저장된 사용자 정보 복원
     */
    useEffect(() => {
        restoreUserSession();
    }, []);

    /**
     * restoreUserSession : 저장된 사용자 정보 복원
     * ---------------------------------------------------------
     * HOW : sessionStorage 우선, 없으면 localStorage 확인하여 복원
     * WHY : 페이지 새로고침 시에도 로그인 상태 유지
     */
    const restoreUserSession = () => {
        try {
            // 1순위: sessionStorage (현재 세션)
            let savedUser = sessionStorage.getItem('user');
            
            // 2순위: localStorage (로그인 유지 설정 시)
            if (!savedUser) {
                savedUser = localStorage.getItem('user');
                
                // localStorage에서 가져온 경우 sessionStorage에도 복사
                if (savedUser) {
                    sessionStorage.setItem('user', savedUser);
                }
            }
            
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('사용자 세션 복원 실패:', error);
            // 파싱 실패 시 storage 정리
            sessionStorage.removeItem('user');
            localStorage.removeItem('user');
        } finally {
            // 복원 시도 후 반드시 loading을 false로
            setLoading(false);
        }
    };


    /**
     * 다른 탭에서의 로그인/로그아웃 감지
     * -------------------------------------------
     * HOW : storage 이벤트를 통해 localStorage 변경 감지
     * WHY : 한 탭에서 로그인/로그아웃하면 다른 모든 탭도 동기화되어야 함
     * 
     * NOTE : storage 이벤트는 같은 탭에서는 발생하지 않고, 다른 탭에서만 발생
     */
    useEffect(() => {
        const handleStorageChange = (e) => {
            // user 데이터 변경 감지
            if (e.key === 'user') {
                // localStorage에서 user가 삭제되면 로그아웃 처리
                if (e.newValue === null) {
                    console.log('다른 탭에서 로그아웃 감지');
                    setUser(null);
                    sessionStorage.removeItem('user');
                    goToPage("/login", {});
                }
                // localStorage에 새로운 user가 설정되면 로그인 상태 갱신
                else if (e.newValue && !user) {
                    console.log('다른 탭에서 로그인 감지');
                    try {
                        const newUser = JSON.parse(e.newValue);
                        setUser(newUser);
                        sessionStorage.setItem('user', e.newValue);
                    } catch (error) {
                        console.error('사용자 정보 파싱 실패:', error);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [user, goToPage]);


    // const apiClient = createApiClient();


    /**
     * validateToken : 저장된 Access Token 검증 및 사용자 정보 복원
     * ---------------------------------------------------------
     * WHAT : Access Token이 만료된 경우 Refresh Token으로 갱신 시도
     */
    // const validateToken = async () => {

    //     // try {

    //     //     const accessToken = sessionStorage.getItem("accessToken");
            
    //     //     if (!accessToken) {
    //     //         setLoading(false);
    //     //         return;
    //     //     }

    //     //     // 서버에 토큰 검증 요청
    //     //     const response = await apiClient.get("/api/auth/validate");
            

    //     //     if (response.data.success) {
    //     //         setUser(response.data.user);
    //     //     } else {
    //     //         // Access Token 만료 시 Refresh Token으로 갱신 시도
    //     //         await refreshAccessToken();
    //     //     }
    //     // } catch (error) {
    //     //     console.error("토큰 검증 실패:", error);
    //     //     // 토큰 갱신 실패 시 로그아웃 처리
    //     //     handleLogout();
    //     // } finally {
    //     //     setLoading(false);
    //     // }

    //     try {
    //         // 1순위: sessionStorage에서 토큰 확인 (현재 탭)
    //         let accessToken = sessionStorage.getItem("accessToken");
    //         let savedUser = sessionStorage.getItem("user");
            
    //         // 2순위: sessionStorage에 없으면 localStorage에서 확인 (다른 탭 또는 로그인 유지)
    //         if (!accessToken) {
    //             accessToken = localStorage.getItem("accessToken");
    //             savedUser = localStorage.getItem("user");
                
    //             // localStorage에서 가져온 경우 sessionStorage에도 저장 (현재 탭에서 사용)
    //             if (accessToken) {
    //                 sessionStorage.setItem("accessToken", accessToken);
    //             }
    //             if (savedUser) {
    //                 sessionStorage.setItem("user", savedUser);
    //             }
    //         }
            
    //         // 토큰이 없으면 로그인 필요
    //         if (!accessToken) {
    //             setLoading(false);
    //             return;
    //         }
    
    //         // 사용자 정보 복원
    //         if (savedUser) {
    //             setUser(JSON.parse(savedUser));
    //         }
    //     } catch (error) {
    //         console.error("토큰 검증 중 오류:", error);
    //     } finally {
    //         setLoading(false);
    //     }

    // };


    /**
     * refreshAccessToken : Refresh Token을 사용하여 Access Token 갱신
     * ---------------------------------------------------------
     * WHAT : Refresh Token도 만료된 경우 로그아웃 처리
     */
    // const refreshAccessToken = async () => {

    //     try {
    //         // httpOnly 쿠키의 Refresh Token은 자동으로 전송됨
    //         const response = await axios.post("/api/auth/refresh");
            
    //         if (response.data.success) { 

    //             const { accessToken, user } = response.data;
                
    //             // 새로운 Access Token 저장
    //             sessionStorage.setItem("accessToken", accessToken);
    //             setUser(user);
                
    //             return true;
    //         }
            
    //         return false;
    //     } catch (error) {
    //         console.error("토큰 갱신 실패:", error);
    //         return false;
    //     }
    // };


    /**
     * login : 로그인 처리
     * ---------------------------------------------------------
     * @param {Object} params - 로그인 파라미터 객체 ({ loginId, password, rememberId, keepLogin })
     * @param {string} loginId - 사용자 아이디(사번)
     * @param {string} password - 비밀번호
     * @param {boolean} rememberId - 아이디 저장 여부
     * @param {boolean} keepLogin - 로그인 유지 여부
     * @returns {Object} { success: boolean, message?: string }
     * 
     * SERVER_RESPONSE_FORMAT:
     * {
     *   userInfo: { user_id, user_name, email, department_id, role_id, role_code, role_name, ... },
     *   role: { role_id, role_code, role_name, role_level, ... },
     *   permissions: [
     *     { permission_id, permission_code, permission_name, module, action, permission_type, ... }
     *     // permission_type: 'menu' (메뉴 접근 권한) 또는 'action' (동작 권한)
     *   ],
     *   customSettings: { theme_mode, items_per_page, module_default_settings, ... },
     *   accessibleMenus: [
     *     { 
     *       menu_id, menu_code, menu_name, menu_path, 
     *       depth, parent_menu_id, sort_order,
     *       first_category, second_category, third_category
     *     }
     *     // parent_menu_id를 통한 계층 구조 (depth 1~3)
     *     // depth 1: parent_menu_id = NULL
     *     // depth 2: parent_menu_id = depth 1의 menu_id
     *     // depth 3: parent_menu_id = depth 2의 menu_id
     *   ]
     * }
     * 
     * 권한 시스템 구조:
     * 1. 메뉴 접근 권한 (permission_type='menu')
     *    - 특정 페이지에 접근 가능한지 판단 (hasMenuAccess)
     *    - menu_permission 테이블 기반
     * 
     * 2. 동작 권한 (permission_type='action')
     *    - 페이지 내에서 특정 동작 수행 가능한지 판단 (hasModulePermission)
     *    - role_permission 테이블 기반
     */
    const login = async (params) => {

        try {
            const { loginId, rememberId, keepLogin } = params;

            // 서버에 로그인 요청
            const response = await axios.post('/api/ltms/auth/login', params);

            const { userInfo, role, permissions, customSettings, accessibleMenus } = response.data.data.result;

            // ========================================
            // 서버 응답 데이터를 가공하여 사용자 객체 생성
            // ========================================
            
            // 권한 정보 가공 (빠른 검색을 위한 편의 데이터 구조)
            const permissionCodes = permissions.map(p => p.permission_code);
            const permissionMap = {};
            permissions.forEach(p => {
                if (p.permission_type === 'action') {
                    // "action.ct_request.read" -> "ct_request.read": true
                    const code = p.permission_code.replace('action.', '');
                    permissionMap[code] = true;
                }
            });
            
            // 메뉴 접근 정보 가공 (빠른 검색을 위한 편의 데이터 구조)
            const menuCodes = accessibleMenus?.map(m => m.menu_code) || [];
            
            // 사용자 데이터 구조화 (단일 역할 기반)
            const userData = {
                // 기본 정보
                user_id: userInfo.user_id,
                company_id: userInfo.company_id,
                user_name: userInfo.user_name,
                email: userInfo.email,
                user_full_name: userInfo.user_full_name,
                user_full_name_en: userInfo.user_full_name_en,
                phone: userInfo.phone,
                mobile: userInfo.mobile,
                employee_number: userInfo.employee_number,
                position: userInfo.position,
                job_title: userInfo.job_title,
                status: userInfo.status,
                
                // 부서 정보
                department_id: userInfo.department_id,
                team_name: userInfo.team_name,
                team_code: userInfo.team_code,
                
                // 등급 정보
                user_grade_id: userInfo.user_grade_id,
                grade_code: userInfo.grade_code,
                grade_name: userInfo.grade_name,
                
                // 역할 정보 (단일 역할)
                role: role,                              // 역할 객체
                role_code: role?.role_code,              // 역할 코드 (빠른 접근용)
                role_name: role?.role_name,              // 역할 이름
                role_level: role?.role_level || 0,       // 역할 레벨
                
                // 권한 정보 (원본 + 가공된 편의 데이터)
                permissions: permissions,                // 원본 권한 배열
                permission_codes: permissionCodes,       // 빠른 검색용 권한 코드 배열
                permission_map: permissionMap,           // 빠른 검색용 액션 권한 맵 { "ct_request.read": true }
                
                // 메뉴 접근 정보 (원본 + 가공된 편의 데이터)
                accessibleMenus: accessibleMenus || [],  // 원본 메뉴 배열
                menu_codes: menuCodes,                   // 빠른 검색용 메뉴 코드 배열
                
                // 커스텀 설정
                customSettings: {
                    setting_id: customSettings.setting_id,
                    default_menu_code: customSettings.default_menu_code,
                    default_page_path: customSettings.default_page_path,
                    module_default_settings: customSettings.module_default_settings,
                    theme_mode: customSettings.theme_mode,
                    sidebar_collapsed: customSettings.sidebar_collapsed,
                    items_per_page: customSettings.items_per_page,
                    date_format: customSettings.date_format,
                    time_format: customSettings.time_format,
                    language: customSettings.language,
                    notification_enabled: customSettings.notification_enabled,
                    notification_email: customSettings.notification_email,
                    notification_sms: customSettings.notification_sms,
                    custom_settings: customSettings.custom_settings
                }
            };

            // 사용자 정보를 sessionStorage와 localStorage에 항상 저장
            // - sessionStorage: 현재 탭용
            // - localStorage: 새 탭 열기, 탭 간 동기화용 (모든 탭이 공유)
            sessionStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("user", JSON.stringify(userData));
            
            // keepLogin: 브라우저 종료 후에도 로그인 유지 여부
            if (keepLogin) {
                localStorage.setItem("keepLogin", "true");
            } else {
                localStorage.setItem("keepLogin", "false");
            }

            // 아이디 저장 처리
            if (rememberId) {
                localStorage.setItem("savedId", loginId);
            } else {
                localStorage.removeItem("savedId");
            }

            // 상태 업데이트
            setUser(userData);
            setLoading(false);

            return response;

        } catch (err) {
            // 서버 응답 에러 메시지 추출
            if(err.status === 500) {
                if(err.response?.data?.error?.fieldName === "user_info") {
                    console.log('사용자 정보 관련 오류 발생');
                }
            }
            
            setLoading(false);
            
            return err;
        }
    };


    /**
     * logout : 로그아웃 처리
     * ---------------------------------------------------------
     * WHAT : 
     *    Access Token : 삭제
     *    Refresh Token : 무효화 요청
     *    사용자 정보 초기화
     */
    const logout = async () => {
        try {
            // 서버에 로그아웃 요청 (Refresh Token 무효화)
            await axios.post("/api/ltms/auth/logout");
        } catch (error) {
            console.error("로그아웃 요청 실패:", error);
        } finally {
            handleLogout();
        }
    };


    /**
     * handleLogout : 클라이언트 측 로그아웃 처리
     * ---------------------------------------------------------
     * WHAT : 토큰 삭제 및 상태 초기화
     * NOTE : localStorage에서 토큰 삭제 시 다른 탭에 storage 이벤트 전파됨
     */
    const handleLogout = () => {
        // sessionStorage 정리 (항상)
        // sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        
        // localStorage 정리 (항상 삭제하여 다른 탭에 로그아웃 이벤트 전파)
        // localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("keepLogin");
        
        setUser(null);
        goToPage("/login", {});
    };


    /**
     * hasPermission : 특정 권한 코드 보유 여부 확인
     * ---------------------------------------------------------
     * @param {string} permissionCode - 권한 코드 (예: 'user.create', 'CompatibilityTest.read')
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   hasPermission('user.create')  // 사용자 등록 권한 확인
     *   hasPermission('CompatibilityTest.read')  // CT 조회 권한 확인
     */
    const hasPermission = (permissionCode) => {
        if (!user?.permission_codes) return false;
        return user.permission_codes.includes(permissionCode);
    };


    /**
     * hasModulePermission : 모듈별 특정 액션 권한 보유 여부 확인
     * ---------------------------------------------------------
     * @param {string} module - 모듈명 (예: 'user', 'CompatibilityTest', 'setting')
     * @param {string} action - 액션명 (예: 'create', 'read', 'update', 'delete')
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   hasModulePermission('CompatibilityTest', 'create')  // CT 등록 권한 확인
     *   hasModulePermission('user', 'delete')  // 사용자 삭제 권한 확인
     */
    const hasModulePermission = (module, action) => {
        if (!user?.permission_map) return false;
        const key = `${module}.${action}`;
        return user.permission_map[key] === true;
    };


    /**
     * hasAnyPermission : 여러 권한 중 하나라도 보유 여부 확인
     * ---------------------------------------------------------
     * @param {Array<string>} permissionCodes - 권한 코드 배열
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   hasAnyPermission(['user.create', 'user.update'])  // 사용자 등록 또는 수정 권한 확인
     */
    const hasAnyPermission = (permissionCodes) => {
        if (!user?.permission_codes) return false;
        return permissionCodes.some(code => user.permission_codes.includes(code));
    };


    /**
     * hasAllPermissions : 모든 권한 보유 여부 확인
     * ---------------------------------------------------------
     * @param {Array<string>} permissionCodes - 권한 코드 배열
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   hasAllPermissions(['user.create', 'user.update', 'user.delete'])
     */
    const hasAllPermissions = (permissionCodes) => {
        if (!user?.permission_codes) return false;
        return permissionCodes.every(code => user.permission_codes.includes(code));
    };


    /**
     * hasRole : 특정 역할 보유 여부 확인 (단일 역할)
     * ---------------------------------------------------------
     * @param {string} roleCode - 역할 코드 (예: 'ADMIN', 'MANAGER', 'USER')
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   hasRole('ADMIN')  // 관리자 역할 확인
     */
    const hasRole = (roleCode) => {
        if (!user?.role_code) return false;
        return user.role_code === roleCode;
    };


    /**
     * hasAnyRole : 여러 역할 중 하나라도 보유 여부 확인 (단일 역할)
     * ---------------------------------------------------------
     * @param {Array<string>} roleCodes - 역할 코드 배열
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   hasAnyRole(['ADMIN', 'MANAGER'])  // 관리자 또는 매니저 역할 확인
     */
    const hasAnyRole = (roleCodes) => {
        if (!user?.role_code) return false;
        return roleCodes.includes(user.role_code);
    };


    /**
     * isRoleLevel : 특정 레벨 이상의 역할 보유 여부 확인
     * ---------------------------------------------------------
     * @param {number} level - 최소 요구 레벨
     * @returns {boolean}
     * 
     * EXAMPLE:
     *   isRoleLevel(50)  // 레벨 50 이상 (MANAGER 이상)
     */
    const isRoleLevel = (level) => {
        if (!user?.role_level) return false;
        return user.role_level >= level;
    };


    /**
     * getCustomSetting : 사용자 커스텀 설정 조회
     * ---------------------------------------------------------
     * @param {string} key - 설정 키 (예: 'theme_mode', 'items_per_page')
     * @param {any} defaultValue - 기본값
     * @returns {any} 설정값
     * 
     * EXAMPLE:
     *   getCustomSetting('theme_mode', 'light')  // 'light' 또는 'dark'
     *   getCustomSetting('items_per_page', 20)   // 20, 50, 100 등
     */
    const getCustomSetting = (key, defaultValue = null) => {
        return user?.customSettings?.[key] ?? defaultValue;
    };


    /**
     * getModuleDefaultAction : 모듈별 메뉴 기본 액션 조회
     * ---------------------------------------------------------
     * @param {string} moduleCode - 모듈 코드 (예: 'ct', 'internal')
     * @param {string} menuCode - 메뉴 코드 (예: 'request', 'testReport')
     * @param {string} defaultAction - 기본 액션 (예: 'read')
     * @returns {string} 액션값
     * 
     * EXAMPLE:
     *   getModuleDefaultAction('ct', 'request', 'read')  // 'read' 또는 사용자 설정값
     */
    const getModuleDefaultAction = (moduleCode, menuCode, defaultAction = 'read') => {
        return user?.customSettings?.module_default_settings?.[moduleCode]?.[menuCode]?.action ?? defaultAction;
    };


    /**
     * getAllCustomSettings : 전체 커스텀 설정 조회
     * ---------------------------------------------------------
     * @returns {Object} 전체 설정 객체
     */
    const getAllCustomSettings = () => {
        return user?.customSettings || {};
    };


    /**
     * hasMenuAccess : 메뉴 접근 권한 확인
     * ---------------------------------------------------------
     * @param {string} menuCode - 메뉴 코드 (예: 'ct_request_read', 'setting_selectOptions_unit')
     * @returns {boolean} 메뉴 접근 가능 여부
     * 
     * HOW:
     *   서버에서 받은 accessibleMenus 리스트 기반으로 체크
     *   - 로그인 시 role_permission과 menu_permission(type='menu')을 조인하여
     *     접근 가능한 메뉴 리스트를 서버에서 계산하여 전달받음
     *   - 해당 메뉴가 리스트에 있으면 접근 가능
     * 
     * WHY:
     *   - permission_type='menu'인 권한으로 메뉴 접근 권한 분리 관리
     *   - depth 1 메뉴는 자동 포함 (카테고리 헤더)
     *   - 서버에서 계산하므로 클라이언트 로직 단순화
     * 
     * SERVER_QUERY_LOGIC:
     *   1. 사용자의 role_id로 role_permission 조회
     *   2. permission(type='menu')과 INNER JOIN
     *   3. menu_permission과 INNER JOIN하여 접궼 가능한 depth 2, 3 메뉴 조회
     *   4. UNION으로 depth 1 메뉴 자동 포함
     *   5. parent_menu_id를 통해 계층 구조 유지
     * 
     * NEW_MENU_STRUCTURE:
     *   - depth 1: 'ct' (parent_menu_id=NULL) - 카테고리
     *   - depth 2: 'ct_request_category' (parent_menu_id=1) - 서브카테고리
     *   - depth 3: 'ct_request_read' (parent_menu_id=2) - 실제 페이지
     * 
     * EXAMPLE:
     *   hasMenuAccess('ct_request_read')  // CT 의뢰 조회 메뉴 접근 가능 여부
     *   hasMenuAccess('ct')  // CT 메뉴(depth 1) 접근 가능 여부
     */
    const hasMenuAccess = (menuCode) => {
        if (!user?.menu_codes) return false;
        return user.menu_codes.includes(menuCode);
    };


    /**
     * canPerformAction : 메뉴에서 특정 액션 수행 가능 여부 확인
     * ---------------------------------------------------------
     * @param {string} menuCode - 메뉴 코드 (예: 'ct_request')
     * @param {string} action - 액션 (create, update, delete, approval)
     * @returns {boolean} 액션 수행 가능 여부
     * 
     * HOW:
     *   실제 보유한 permission_type='action' 권한을 체크
     *   - hasModulePermission을 통해 module.action 형태로 체크
     *   - role_permission 테이블에 해당 permission_id가 있는지 확인
     * 
     * WHY:
     *   - 메뉴 접근(permission_type='menu')과 달리 기능 실행은 정확한 권한 필요
     *   - 같은 메뉴를 보더라도 역할에 따라 다른 기능 사용
     * 
     * PERMISSION_SEPARATION:
     *   1. 메뉴 접근 (permission_type='menu'):
     *      - menu_permission 테이블로 관리
     *      - 특정 페이지에 접근 가능한지 판단
     *      - 예: hasMenuAccess('ct_request_read')
     * 
     *   2. 동작 권한 (permission_type='action'):
     *      - role_permission 테이블로 관리
     *      - 페이지 내에서 특정 동작 수행 가능한지 판단
     *      - 예: canPerformAction('ct_request', 'create')
     * 
     * EXAMPLE:
     *   // CT 의뢰 화면에서 버튼 표시 제어
     *   {canPerformAction('ct_request', 'create') && <button>등록</button>}
     *   {canPerformAction('ct_request', 'delete') && <button>삭제</button>}
     *   
     *   // 결과:
     *   // USER 역할 (read, create만 보유)
     *   //   - 등록 버튼: 표시 ✅
     *   //   - 삭제 버튼: 숨김 ❌
     */
    const canPerformAction = (menuCode, action) => {
        return hasModulePermission(menuCode, action);
    };

    /**
     * hasActionPermission : 동작 권한 확인 (canPerformAction의 alias)
     * ---------------------------------------------------------
     * @param {string} module - 모듈 코드 (예: 'ct_request')
     * @param {string} action - 액션 (create, update, delete, approval)
     * @returns {boolean} 동작 권한 보유 여부
     * 
     * NOTE:
     *   - canPerformAction과 동일한 기능
     *   - useActionPermission 훅에서 사용하기 위한 명확한 이름
     *   - permission_type='action'인 권한만 체크
     */
    const hasActionPermission = (module, action) => {
        return hasModulePermission(module, action);
    };


    /************************************************************************************
    WHY : AuthContext.Provider의 value가 변경되면 해당 Context를 사용하는 모든 컴포넌트가 리렌더링됨.
          따라서, value 객체를 useMemo로 메모이제이션하여
          실제 상태(user, loading)가 바뀔 때만 새 객체 생성되도록 함.

          dependency 배열에 포함된 값이 변경될 때만 memo 객체 재생성됨.(불필요한 리렌더링을 방지)
    ************************************************************************************/
    const memo = useMemo(() => ({
        // 사용자 정보
        user,                               // 현재 로그인한 사용자 전체 정보
        loading,                            // 인증 확인 중 여부
        isAuthenticated: !!user,            // 로그인 여부
        
        // 인증 관련 함수
        login,                              // 로그인 함수
        logout,                             // 로그아웃 함수
        
        // 권한 확인 함수 (기능 실행: AND 조건)
        hasPermission,                      // 특정 권한 코드 보유 확인
        hasModulePermission,                // 모듈별 액션 권한 확인
        hasAnyPermission,                   // 여러 권한 중 하나 보유 확인
        hasAllPermissions,                  // 모든 권한 보유 확인
        
        // 역할 확인 함수 (단일 역할)
        hasRole,                            // 특정 역할 보유 확인
        hasAnyRole,                         // 여러 역할 중 하나 보유 확인
        isRoleLevel,                        // 레벨 기반 역할 확인
        
        // 메뉴 권한 확인 함수 (메뉴 접근: OR 조건)
        hasMenuAccess,                      // 메뉴 접근 권한 확인
        canPerformAction,                   // 메뉴 액션 수행 가능 확인 (레거시)
        hasActionPermission,                // 동작 권한 확인 (권장)
        
        // 커스텀 설정 함수
        getCustomSetting,                   // 특정 커스텀 설정 조회
        getModuleDefaultAction,             // 모듈별 기본 액션 조회
        getAllCustomSettings                // 전체 커스텀 설정 조회
    }), [user, loading]);


    /************************************************************************************
    Provider로 상태 공급
    AuthContext.Provider에 memo를 넣어 하위 컴포넌트에 공유.
    이 Provider로 감싸진 모든 컴포넌트는 AuthContext 훅으로 상태 접근 가능.
    ************************************************************************************/
    return (
        <AuthContext.Provider value={memo}>
            {children}
        </AuthContext.Provider>
    );
};