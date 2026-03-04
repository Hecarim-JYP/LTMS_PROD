/**
 * 파일명 : AuthSettingMenu.jsx
 * 용도 : 메뉴 관리 화면
 * 최초등록 : 2026-02-06 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "/src/contexts/AuthContext";
import useUrlNavigation from "/src/hooks/useUrlNavigation";
import useUrlInfo from "/src/hooks/useUrlInfo";

import * as Utils from "/src/components/Utils";

export default function AuthSettingMenu() {
    const { user } = useContext(AuthContext);
    const companyId = user.company_id;
    const goToPage = useUrlNavigation();
    const { path } = useUrlInfo();

    // 현재 경로의 마지막 값 추출
    const currentPage = path.split("/").filter(Boolean).at(-1);

    const [isLoading, setIsLoading] = useState(true);
    
    // 전체 메뉴 목록
    const [allMenuList, setAllMenuList] = useState([]);
    const [selectedParentMenu, setSelectedParentMenu] = useState(null);
    const [selectedSubMenu, setSelectedSubMenu] = useState(null);
    
    // 필터 상태 (2차 메뉴 목록용)
    const [subMenuQuery, setSubMenuQuery] = useState("");
    const [debouncedSubMenuQuery, setDebouncedSubMenuQuery] = useState("");
    
    // 필터 상태 (3차 메뉴 목록용)
    const [thirdMenuQuery, setThirdMenuQuery] = useState("");
    const [debouncedThirdMenuQuery, setDebouncedThirdMenuQuery] = useState("");
    
    // 필터 상태 (모달 권한 목록용)
    const [modalPermQuery, setModalPermQuery] = useState("");
    const [debouncedModalPermQuery, setDebouncedModalPermQuery] = useState("");
    
    // 모달 상태
    const [isParentMenuModalOpen, setIsParentMenuModalOpen] = useState(false);
    const [isSubMenuModalOpen, setIsSubMenuModalOpen] = useState(false);
    const [isThirdMenuModalOpen, setIsThirdMenuModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    
    // 권한 관련 상태
    const [allPermissionList, setAllPermissionList] = useState([]);
    const [selectedSubMenuPermission, setSelectedSubMenuPermission] = useState(null); // 2차/3차 메뉴용 (메뉴 접근 권한 단일 선택)
    
    // 메뉴 폼 데이터
    const [menuFormData, setMenuFormData] = useState({
        company_id: companyId,
        menu_id: null,
        menu_code: "",
        menu_name: "",
        menu_path: "",
        first_category: "",
        second_category: "",
        depth: 1,
        parent_menu_id: null,
        sort_order: 0,
        is_active: 1
    });

    useEffect(() => {
        fetchAllMenuList();
        fetchAllPermissions();
    }, []);

    /**
     * 2차 메뉴 검색 디바운스
     */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSubMenuQuery(subMenuQuery), 300);
        return () => clearTimeout(t);
    }, [subMenuQuery]);

    /**
     * 3차 메뉴 검색 디바운스
     */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedThirdMenuQuery(thirdMenuQuery), 300);
        return () => clearTimeout(t);
    }, [thirdMenuQuery]);

    /**
     * 모달 권한 검색 디바운스
     */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedModalPermQuery(modalPermQuery), 300);
        return () => clearTimeout(t);
    }, [modalPermQuery]);

    /**
     * 전체 메뉴 목록 조회 (권한 정보 포함)
     */
    const fetchAllMenuList = async () => {
        try {
            setIsLoading(true);
            const params = { 
                company_id: companyId,
                is_setting: 1 // 설정용 메뉴 목록 조회 플래그
            };
            const response = await axios.get("/api/ltms/auth/menus", { params });
            const menus = response.data.data.result || [];
            setAllMenuList(menus);
        } catch (error) {
            console.error("메뉴 목록 조회 실패:", error);
            alert("메뉴 목록을 불러오는 중 오류가 발생했습니다.");
            setAllMenuList([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 전체 권한 목록 조회
     */
    const fetchAllPermissions = async () => {
        try {
            const params = { company_id: companyId };
            const response = await axios.get("/api/ltms/auth/permissions", { params });
            const result = response.data.data.result || [];
            const permissionList = result.filter(perm => perm.permission_type === 'menu')
                                         .map(perm => (
                                            {
                                                idx: perm.idx,
                                                permission_id: perm.permission_id,
                                                permission_code: perm.permission_code,
                                                permission_name: perm.permission_name,
                                                permission_name_en: perm.permission_name_en,
                                                description: perm.description,
                                                resource: perm.resource,
                                                permission_type: perm.permission_type,
                                                is_active: perm.is_active,
                                                is_system_permission: perm.is_system_permission,
                                                sort_order: perm.sort_order
                                            }
                                        ));
            setAllPermissionList(permissionList);
        } catch (error) {
            console.error("권한 목록 조회 실패:", error);
            setAllPermissionList([]);
        }
    };

    /**
     * 1차 메뉴 목록 (depth = 1)
     */
    const parentMenuList = useMemo(() => {
        return allMenuList.filter(menu => menu.depth === 1);
    }, [allMenuList]);

    /**
     * 2차 메뉴 목록 (선택된 1차 메뉴의 하위)
     */
    const subMenuList = useMemo(() => {
        if (!selectedParentMenu) return [];
        return allMenuList.filter(menu => menu.parent_menu_id === selectedParentMenu.menu_id);
    }, [allMenuList, selectedParentMenu]);

    /**
     * 3차 메뉴 목록 (선택된 2차 메뉴의 하위)
     */
    const thirdMenuList = useMemo(() => {
        if (!selectedSubMenu) return [];
        return allMenuList.filter(menu => menu.parent_menu_id === selectedSubMenu.menu_id);
    }, [allMenuList, selectedSubMenu]);

    /**
     * 1차 메뉴 선택 핸들러
     */
    const handleParentMenuSelect = (menu) => {
        setSelectedParentMenu(menu);
        setSelectedSubMenu(null); // 1차 메뉴 변경 시 2차/3차 메뉴 초기화
    };

    /**
     * 2차 메뉴 클릭 시 선택 상태로 만들기
     */
    const handleSubMenuClick = (menu) => {
        setSelectedSubMenu(menu);
    };

    /**
     * 3차 메뉴 클릭 시 상세 모달 열기
     */
    const handleThirdMenuClick = (menu) => {
        setSelectedMenu(menu);
        setMenuFormData({
            company_id: companyId,
            menu_id: menu.menu_id,
            menu_code: menu.menu_code || "",
            menu_name: menu.menu_name || "",
            menu_path: menu.menu_path || "",
            first_category: menu.first_category || "",
            second_category: menu.second_category || "",
            depth: menu.depth || 3,
            parent_menu_id: menu.parent_menu_id || null,
            sort_order: menu.sort_order || 0,
            is_active: menu.is_active === 1 ? 1 : 0
        });
        
        // 3차 메뉴에 할당된 메뉴 접근 권한 (하나만)
        const menuPermission = menu.permission_id;
        setSelectedSubMenuPermission(menuPermission);
        
        setIsThirdMenuModalOpen(true);
    };

    /**
     * 1차 메뉴 추가 모달 열기
     */
    const openParentMenuAddModal = () => {
        setSelectedMenu(null);
        setMenuFormData({
            company_id: companyId,
            menu_id: null,
            menu_code: "",
            menu_name: "",
            is_active: 1
        });
        setIsParentMenuModalOpen(true);
    };

    /**
     * 1차 메뉴 수정 모달 열기
     */
    const openParentMenuEditModal = (menu) => {
        setSelectedMenu(menu);
        setMenuFormData({
            company_id: companyId,
            menu_id: menu.menu_id,
            menu_code: menu.menu_code || "",
            menu_name: menu.menu_name || "",
            is_active: menu.is_active === 1 ? 1 : 0
        });
        setIsParentMenuModalOpen(true);
    };

    /**
     * 2차 메뉴 추가 모달 열기
     */
    const openSubMenuAddModal = () => {
        if (!selectedParentMenu) {
            alert("1차 메뉴를 먼저 선택해주세요.");
            return;
        }

        setSelectedMenu(null);
        setMenuFormData({
            company_id: companyId,
            menu_id: null,
            menu_code: selectedParentMenu.menu_code || "",
            menu_name: "",
            menu_path: "",
            first_category: selectedParentMenu.menu_code || "",
            second_category: "",
            depth: 2,
            parent_menu_id: selectedParentMenu.menu_id,
            sort_order: subMenuList.length + 1,
            is_active: 1
        });
        setSelectedSubMenuPermission(null);
        setIsSubMenuModalOpen(true);
    };

    /**
     * 2차 메뉴 수정 모달 열기
     */
    const openSubMenuEditModal = (menu) => {
        setSelectedMenu(menu);
        setMenuFormData({
            company_id: companyId,
            menu_id: menu.menu_id,
            menu_code: menu.menu_code || "",
            menu_name: menu.menu_name || "",
            menu_path: menu.menu_path || "",
            first_category: menu.first_category || "",
            second_category: menu.second_category || "",
            depth: menu.depth || 2,
            parent_menu_id: menu.parent_menu_id || null,
            sort_order: menu.sort_order || 0,
            is_active: menu.is_active === 1 ? 1 : 0
        });
        
        // 2차 메뉴에 할당된 메뉴 권한 (하나만)
        const menuPermission = menu.permission_id;
        setSelectedSubMenuPermission(menuPermission);
        setIsSubMenuModalOpen(true);
    };

    /**
     * 3차 메뉴 추가 모달 열기
     */
    const openThirdMenuAddModal = () => {
        if (!selectedSubMenu) {
            alert("2차 메뉴를 먼저 선택해주세요.");
            return;
        }

        if (selectedSubMenu.permission_id) {
            alert(`[${selectedSubMenu.menu_name}] 메뉴는 분류상 2차 메뉴가 아닌 실제 메뉴로 활용되고 있어 3차 메뉴 등록이 불가능합니다.`);
            return;
        }
        
        // 2차 메뉴의 menu_code를 split하여 second_category 자동 설정
        const menuCodeParts = (selectedSubMenu.menu_code || "").split('_');
        const secondCategory = menuCodeParts[1] || "";
        
        setSelectedMenu(null);
        setMenuFormData({
            company_id: companyId,
            menu_id: null,
            menu_code: selectedSubMenu.menu_code || "",
            menu_name: "",
            menu_path: "",
            first_category: selectedSubMenu.first_category || menuCodeParts[0] || "",
            second_category: secondCategory,
            depth: 3,
            parent_menu_id: selectedSubMenu.menu_id,
            sort_order: thirdMenuList.length + 1,
            is_active: 1
        });
        setSelectedSubMenuPermission(null);
        setIsThirdMenuModalOpen(true);
    };

    /**
     * 1차 메뉴 모달에서 저장 (추가 또는 수정)
     */
    const saveParentMenuFromModal = async () => {
        if (Utils.toStringOrEmpty(menuFormData.menu_code) === '' 
            || Utils.toStringOrEmpty(menuFormData.menu_name) === '') {
            alert("메뉴 코드와 메뉴 이름은 필수입니다.");
            return;
        }

        if (!confirm("1차 메뉴를 저장하시겠습니까?")) return;

        try {
            const params = {
                company_id: companyId,
                menu_id: menuFormData.menu_id,
                menu_code: menuFormData.menu_code,
                menu_name: menuFormData.menu_name,
                is_active: menuFormData.is_active,
                assigned_by: user.user_id
            };
            
            const url = menuFormData.menu_id 
                ? "/api/ltms/auth/menu/parent/update" 
                : "/api/ltms/auth/menu/parent/create";
            
            const response = await axios.post(url, params);
            
            if (response.status === 200) {
                alert(menuFormData.menu_id ? "1차 메뉴가 수정되었습니다." : "1차 메뉴가 추가되었습니다.");
                setIsParentMenuModalOpen(false);
                fetchAllMenuList();
            }
        } catch (error) {
            console.error("1차 메뉴 저장 실패:", error);
            alert(`1차 메뉴 저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };

    /**
     * 2차 메뉴 모달에서 저장 (추가 또는 수정)
     */
    const saveSubMenuFromModal = async () => {
        if (Utils.toStringOrEmpty(menuFormData.menu_code) === '' 
            || Utils.toStringOrEmpty(menuFormData.menu_name) === '') {
            alert("메뉴 코드와 메뉴 이름은 필수입니다.");
            return;
        }

        if (!confirm("2차 메뉴를 저장하시겠습니까?")) return;

        try {
            const params = {
                company_id: companyId,
                ...menuFormData,
                menu_permission_id: selectedSubMenuPermission,
                assigned_by: user.user_id
            };

            const url = menuFormData.menu_id 
                ? "/api/ltms/auth/menu/sub/update" 
                : "/api/ltms/auth/menu/sub/create";
            
            const response = await axios.post(url, params);
            
            if (response.status === 200) {
                alert(menuFormData.menu_id ? "2차 메뉴가 수정되었습니다." : "2차 메뉴가 추가되었습니다.");
                setIsSubMenuModalOpen(false);
                fetchAllMenuList();
            }
        } catch (error) {
            console.error("2차 메뉴 저장 실패:", error);
            alert(`2차 메뉴 저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };

    /**
     * 3차 메뉴 모달에서 저장 (추가 또는 수정)
     */
    const saveThirdMenuFromModal = async () => {
        if (Utils.toStringOrEmpty(menuFormData.menu_code) === '' 
            || Utils.toStringOrEmpty(menuFormData.menu_name) === '') {
            alert("메뉴 코드와 메뉴 이름은 필수입니다.");
            return;
        }

        if (!confirm("3차 메뉴를 저장하시겠습니까?")) return;

        try {
            const params = {
                company_id: companyId,
                ...menuFormData,
                menu_permission_id: selectedSubMenuPermission,
                assigned_by: user.user_id
            };
            
            const url = menuFormData.menu_id 
                ? "/api/ltms/auth/menu/third/update" 
                : "/api/ltms/auth/menu/third/create";
            
            const response = await axios.post(url, params);
            
            if (response.status === 200) {
                alert(menuFormData.menu_id ? "3차 메뉴가 수정되었습니다." : "3차 메뉴가 추가되었습니다.");
                setIsThirdMenuModalOpen(false);
                fetchAllMenuList();
            }
        } catch (error) {
            console.error("3차 메뉴 저장 실패:", error);
            alert(`3차 메뉴 저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };

    /**
     * 메뉴 폼 데이터 변경 핸들러
     */
    const handleMenuFormChange = (e) => {
        const { name, type, value, checked } = e.target;
        const fieldValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
        
        // menu_code 변경 시 자동으로 다른 필드 계산 (2차/3차 메뉴 모달에서)
        if (name === 'menu_code' && (isSubMenuModalOpen || isThirdMenuModalOpen)) {
            const parts = value.split('_');
            const firstCategory = parts[0] || '';
            
            // second_category 계산
            let secondCategory;
            if (isSubMenuModalOpen) {
                // 2차 메뉴: category가 포함되면 parts[1] (3차 메뉴를 위한 카테고리)
                //           category가 없으면 '' (이 메뉴가 최종 페이지)
                secondCategory = value.toLowerCase().includes('category') 
                    ? (parts.length >= 2 ? (parts[1] || '') : '')
                    : '';
            } else {
                // 3차 메뉴: 항상 parts[1]
                secondCategory = parts.length >= 2 ? (parts[1] || '') : '';
            }

            // category가 포함되면 경로 없음 (3차 메뉴가 생김)
            const menuPath = value.toLowerCase().includes('category')
                ? ''
                : value ? '/' + parts.join('/') : '';

            const depth = isThirdMenuModalOpen ? 3 : 2; // 모달 종류에 따라 고정
            
            setMenuFormData(prev => ({ 
                ...prev, 
                menu_code: value,
                first_category: firstCategory,
                second_category: secondCategory,
                menu_path: menuPath,
                depth: depth
            }));
        } else {
            setMenuFormData(prev => ({ ...prev, [name]: fieldValue }));
        }
    };

    /**
     * 메뉴 접근 권한 체크박스 핸들러 (단일 선택, 토글 가능)
     */
    const handleSubMenuPermissionChange = (permissionId) => {
        // 같은 권한을 다시 클릭하면 선택 해제, 다른 권한을 클릭하면 교체
        setSelectedSubMenuPermission(prev => prev === permissionId ? null : permissionId);
    };
    
    /**
     * 2차 메뉴 목록 필터링
     */
    const filteredSubMenuList = useMemo(() => {
        const q = debouncedSubMenuQuery.trim().toLowerCase();
        const filtered = subMenuList.filter((item) => {
            const okQuery = !q 
                || String(item.menu_code ?? "").toLowerCase().includes(q)
                || String(item.menu_name ?? "").toLowerCase().includes(q)
                || String(item.menu_path ?? "").toLowerCase().includes(q);
            return okQuery;
        });
        return filtered;
    }, [subMenuList, debouncedSubMenuQuery]);

    /**
     * 3차 메뉴 목록 필터링
     */
    const filteredThirdMenuList = useMemo(() => {
        const q = debouncedThirdMenuQuery.trim().toLowerCase();
        const filtered = thirdMenuList.filter((item) => {
            const okQuery = !q 
                || String(item.menu_code ?? "").toLowerCase().includes(q)
                || String(item.menu_name ?? "").toLowerCase().includes(q)
                || String(item.menu_path ?? "").toLowerCase().includes(q);
            return okQuery;
        });
        return filtered;
    }, [thirdMenuList, debouncedThirdMenuQuery]);

    /**
     * 2차 메뉴 모달 권한 목록 필터링 (permission_type = 'menu'만)
     */
    const filteredSubMenuModalPermList = useMemo(() => {
        const q = debouncedModalPermQuery.trim().toLowerCase();
        const filtered = allPermissionList.filter((item) => {
            const isMenuType = item.permission_type === 'menu';
            const okQuery = !q 
                || String(item.permission_code ?? "").toLowerCase().includes(q)
                || String(item.permission_name ?? "").toLowerCase().includes(q);
            return isMenuType && okQuery;
        });
        return filtered;
    }, [allPermissionList, debouncedModalPermQuery]);

    /**
     * 3차 메뉴 모달 메뉴 접근 권한 목록 필터링 (permission_type = 'menu'만)
     */
    const filteredThirdMenuModalPermList = useMemo(() => {
        const q = debouncedModalPermQuery.trim().toLowerCase();
        const filtered = allPermissionList.filter((item) => {
            const isMenuType = item.permission_type === 'menu';
            const okQuery = !q 
                || String(item.permission_code ?? "").toLowerCase().includes(q)
                || String(item.permission_name ?? "").toLowerCase().includes(q);
            return isMenuType && okQuery;
        });
        return filtered;
    }, [allPermissionList, debouncedModalPermQuery]);



    /**
     * 로딩 중 커서 변경
     */
    useEffect(() => {
        if (isLoading) {
            document.body.style.cursor = 'progress';
        } else {
            document.body.style.cursor = 'default';
        }
        
        // cleanup: 컴포넌트 언마운트 시 원래대로
        return () => {
            document.body.style.cursor = 'default';
        };
    }, [isLoading]);

    return (
        <div className="setting-box">
            <div className="page-top">
                <h1 className="user-custom-option-title">역할-권한 관리</h1>
            </div>

            <div className="navigation-bar" style={{ border: "none" }}>
                <button 
                    className={`${currentPage === "role" || path === "/setting/auth" ? "active" : ""}`} 
                    onClick={() => goToPage("/setting/auth/role", {})}
                >
                    역할 관리
                </button>
                <button 
                    className={`${currentPage === "permission" ? "active" : ""}`} 
                    onClick={() => goToPage("/setting/auth/permission", {})}
                >
                    권한 관리
                </button>
                <button 
                    className={`${currentPage === "menu" ? "active" : ""}`} 
                    onClick={() => goToPage("/setting/auth/menu", {})}
                >
                    메뉴 관리
                </button>
            </div>

            <div className="setting-section">
                <div className="auth-setting-split-layout"
                        style={{ height: "400px" }}>
                    {/* 왼쪽: 1차 메뉴 목록 (depth = 1) */}
                    <div className="settings-section auth-setting-section-flex"
                            style={{ height: "400px" }}>
                        <h3>1차 메뉴</h3>
                        <div className="form-buttons jcl" style={{marginBottom: "10px"}}>
                            <button className="btn-success" onClick={openParentMenuAddModal}>1차 메뉴 추가</button>
                        </div>
                        
                        <div className="table-scroll border auth-setting-table-scroll">
                            <table className="list-table auth-setting-table">
                                <colgroup>
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "20%" }} />
                                    <col style={{ width: "35%" }} />
                                    <col style={{ width: "15%" }} />
                                    <col style={{ width: "10%" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>메뉴 코드</th>
                                        <th>메뉴 이름</th>
                                        <th>활성화</th>
                                        <th>수정</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parentMenuList.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="tac">
                                                조회된 1차 메뉴가 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        parentMenuList.map((menu, index) => (
                                            <tr key={menu.menu_id} 
                                                onClick={() => handleParentMenuSelect(menu)} 
                                                className={`auth-setting-clickable-row ${selectedParentMenu?.menu_id === menu.menu_id ? "tr-selected" : ""}`}>
                                                <td className="tac">{index + 1}</td>
                                                <td className="tac">{menu.menu_code || "-"}</td>
                                                <td className="tal">{menu.menu_name || "-"}</td>
                                                <td className="tac">{menu.is_active === 1 ? "🟢" : "🔴"}</td>
                                                <td className="tac">
                                                    <button className="btn-none" onClick={(e) => {
                                                        e.stopPropagation();
                                                        openParentMenuEditModal(menu);
                                                    }}>
                                                        ⚙️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 오른쪽: 2차 메뉴 목록 (depth >= 2) */}
                    <div className="settings-section auth-setting-section-flex"
                            style={{ height: "400px" }}>
                        <h3>{selectedParentMenu ? `[${selectedParentMenu.menu_name}] ▶️ 2차 메뉴` : "2차 메뉴"}</h3>
                        <div className="form-buttons jcl" style={{marginBottom: "10px"}}>
                            <button className="btn-success" onClick={openSubMenuAddModal} disabled={!selectedParentMenu}>2차 메뉴 추가</button>
                            <button className="btn-secondary" onClick={() => setSubMenuQuery("")} disabled={!selectedParentMenu}>초기화</button>
                        </div>
                        
                        {/* 필터/검색 툴바 */}
                        <div className="approval-toolbar" 
                                style={{gridTemplateColumns: "1fr", marginBottom: "10px"}}
                                aria-label="필터 및 검색">
                            <div className="field">
                                <label htmlFor="subMenuSearchFilter">검색 (메뉴 코드/메뉴 이름/경로)</label>
                                <input
                                    id="subMenuSearchFilter"
                                    type="search"
                                    placeholder="Ex...) setting, 사용자 관리, /setting/user"
                                    value={subMenuQuery}
                                    onChange={(e) => setSubMenuQuery(e.target.value)}
                                    disabled={!selectedParentMenu}
                                />
                            </div>
                        </div>
                        
                        <div className="table-scroll border auth-setting-table-scroll">
                            <table className="list-table">
                                <colgroup>
                                    <col style={{ width: "5%" }} />
                                    <col style={{ width: "" }} />
                                    <col style={{ width: "18%" }} />
                                    <col style={{ width: "23%" }} />
                                    <col style={{ width: "7%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "7%" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>코드</th>
                                        <th>이름</th>
                                        <th>경로</th>
                                        <th>활성화</th>
                                        <th>권한매핑</th>
                                        <th>수정</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!selectedParentMenu ? (
                                        <tr>
                                            <td colSpan="7" className="tac">
                                                1차 메뉴를 선택해주세요.
                                            </td>
                                        </tr>
                                    ) : filteredSubMenuList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="tac">
                                                {subMenuList.length === 0 ? "2차 메뉴가 없습니다." : "검색 결과가 없습니다."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubMenuList.map((menu, index) => (
                                            <tr key={menu.menu_id} 
                                                onClick={() => handleSubMenuClick(menu)} 
                                                className={`auth-setting-clickable-row ${selectedSubMenu?.menu_id === menu.menu_id ? "tr-selected" : ""}`}>
                                                <td className="tac">{index + 1}</td>
                                                <td className="tal">{menu.menu_code || "-"}</td>
                                                <td className="tal">{menu.menu_name || "-"}</td>
                                                <td className="tal">{menu.menu_path || "-"}</td>
                                                <td className="tac">{menu.is_active === 1 ? "🟢" : "🔴"}</td>
                                                <td className="tac" 
                                                    title={menu.permission_id ? "" : "경로가 없는 경우 3차 메뉴가 존재하기 때문에 권한 매핑이 필요하지 않습니다."}>
                                                        {menu.permission_id ? "🟢" : "🔴"}
                                                </td>
                                                <td className="tac">
                                                    <button className="btn-none" onClick={(e) => {
                                                        e.stopPropagation();
                                                        openSubMenuEditModal(menu);
                                                    }}>
                                                        ⚙️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 아래: 3차 메뉴 목록 (전체 폭) */}
                <div className="settings-section auth-setting-section-flex"
                        style={{ height: "400px", marginTop: "20px" }}>
                    <h3>
                        {selectedParentMenu ? `[${selectedParentMenu.menu_name}] ▶️ ` : ""}
                        {selectedSubMenu ? `[${selectedSubMenu.menu_name}] ▶️ 3차 메뉴` : "3차 메뉴"}
                    </h3>
                    <div className="form-buttons jcl" style={{marginBottom: "10px"}}>
                        <button className="btn-success" onClick={openThirdMenuAddModal} disabled={!selectedSubMenu || selectedSubMenu.permission_id}>3차 메뉴 추가</button>
                        <button className="btn-secondary" onClick={() => setThirdMenuQuery("")} disabled={!selectedSubMenu}>초기화</button>
                    </div>
                    
                    {/* 필터/검색 툴바 */}
                    <div className="approval-toolbar" 
                            style={{gridTemplateColumns: "1fr", marginBottom: "10px"}}
                            aria-label="필터 및 검색">
                        <div className="field">
                            <label htmlFor="thirdMenuSearchFilter">검색 (메뉴 코드/메뉴 이름/경로)</label>
                            <input
                                id="thirdMenuSearchFilter"
                                type="search"
                                placeholder="Ex...) setting_auth_role, 역할 관리, /setting/auth/role"
                                value={thirdMenuQuery}
                                onChange={(e) => setThirdMenuQuery(e.target.value)}
                                disabled={!selectedSubMenu}
                            />
                        </div>
                    </div>
                    
                    <div className="table-scroll border auth-setting-table-scroll">
                        <table className="list-table">
                            <colgroup>
                                <col style={{ width: "5%" }} />
                                <col style={{ width: "" }} />
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "25%" }} />
                                <col style={{ width: "7%" }} />
                                <col style={{ width: "7%" }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>코드</th>
                                    <th>이름</th>
                                    <th>경로</th>
                                    <th>활성화</th>
                                    <th>권한매핑</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!selectedSubMenu ? (
                                    <tr>
                                        <td colSpan="6" className="tac">
                                            2차 메뉴를 선택해주세요.
                                        </td>
                                    </tr>
                                ) : selectedSubMenu.permission_id ? (
                                    <tr>
                                        <td colSpan="6" className="tac">
                                            {`[${selectedSubMenu.menu_name}] 메뉴는 분류상 2차 메뉴가 아닌 실제 메뉴로 활용되고 있어 3차 메뉴 등록이 불가능합니다.`}
                                        </td>
                                    </tr>
                                ) : filteredThirdMenuList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="tac">
                                            {thirdMenuList.length === 0 ? "3차 메뉴가 없습니다." : "검색 결과가 없습니다."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredThirdMenuList.map((menu, index) => (
                                        <tr key={menu.menu_id} onClick={() => handleThirdMenuClick(menu)} className="auth-setting-clickable-row">
                                            <td className="tac">{index + 1}</td>
                                            <td className="tal">{menu.menu_code || "-"}</td>
                                            <td className="tal">{menu.menu_name || "-"}</td>
                                            <td className="tal">{menu.menu_path || "-"}</td>
                                            <td className="tac">{menu.is_active === 1 ? "🟢" : "🔴"}</td>
                                            <td className="tac">{menu.permission_id ? "🟢" : "🔴"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3차 메뉴 추가/수정 모달 */}
            {isThirdMenuModalOpen && (
                <div className="modal-overlay" onClick={() => setIsThirdMenuModalOpen(false)}>
                    <div className="setting-modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="setting-modal-header">
                            <h2>{menuFormData.menu_id ? "3차 메뉴 수정" : "3차 메뉴 추가"}</h2>
                            <button className="setting-modal-close" onClick={() => setIsThirdMenuModalOpen(false)}>×</button>
                        </div>
                        <div className="setting-modal-body">
                            {/* 메뉴 기본 정보 */}
                            <div className="setting-modal-form-grid" style={{ marginBottom: "20px" }}>
                                <div className="setting-modal-form-group">
                                    <label>메뉴 코드 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="menu_code"
                                        value={menuFormData.menu_code}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) setting_auth_role"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>메뉴 이름 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="menu_name"
                                        value={menuFormData.menu_name}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) 역할 관리"
                                    />
                                </div>
                                <div className="setting-modal-form-group full-width">
                                    <label>메뉴 경로</label>
                                    <input 
                                        type="text" 
                                        name="menu_path"
                                        value={menuFormData.menu_path}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) /setting/auth/role"
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>1차 카테고리</label>
                                    <input 
                                        type="text" 
                                        name="first_category"
                                        value={menuFormData.first_category}
                                        onChange={handleMenuFormChange}
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>2차 카테고리</label>
                                    <input 
                                        type="text" 
                                        name="second_category"
                                        value={menuFormData.second_category}
                                        onChange={handleMenuFormChange}
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>깊이</label>
                                    <input 
                                        type="number" 
                                        name="depth"
                                        value={menuFormData.depth}
                                        onChange={handleMenuFormChange}
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>정렬순서</label>
                                    <input 
                                        type="number" 
                                        name="sort_order"
                                        value={menuFormData.sort_order}
                                        onChange={handleMenuFormChange}
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            checked={menuFormData.is_active === 1}
                                            onChange={handleMenuFormChange}
                                        />
                                        <span>활성화</span>
                                    </label>
                                </div>
                            </div>

                            {/* 메뉴 접근 권한 매핑 (수정 모드에서만 표시) */}
                            {menuFormData.menu_id && (
                                <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px", marginBottom: "20px" }}>
                                    <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3>메뉴 접근 권한</h3>
                                        <span style={{ color: "#666" }}>
                                            {selectedSubMenuPermission 
                                                ? `선택됨: ${allPermissionList.find(p => p.permission_id === selectedSubMenuPermission)?.permission_name || ''}` 
                                                : '미선택'}
                                        </span>
                                    </div>
                                    
                                    {/* 필터/검색 툴바 */}
                                    <div className="approval-toolbar" 
                                            style={{gridTemplateColumns: "1fr", marginBottom: "10px"}}
                                            aria-label="필터 및 검색">
                                        <div className="field">
                                            <label htmlFor="thirdMenuPermSearchFilter">검색 (권한 코드/권한 이름)</label>
                                            <input
                                                id="thirdMenuPermSearchFilter"
                                                type="search"
                                                placeholder="Ex...) menu.setting_auth_role, 역할 관리 메뉴"
                                                value={modalPermQuery}
                                                onChange={(e) => setModalPermQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="table-scroll border" style={{ maxHeight: "250px" }}>
                                        <table className="list-table">
                                            <colgroup>
                                                <col style={{ width: "5%" }} />
                                                <col style={{ width: "30%" }} />
                                                <col style={{ width: "20%" }} />
                                                <col style={{ width: "15%" }} />
                                                <col style={{ width: "30%" }} />
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th>선택</th>
                                                    <th>권한 코드</th>
                                                    <th>권한 이름</th>
                                                    <th>모듈</th>
                                                    <th>설명</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredThirdMenuModalPermList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="tac">
                                                            {allPermissionList.filter(p => p.permission_type === 'menu').length === 0 
                                                                ? "메뉴 권한이 없습니다." 
                                                                : "검색 결과가 없습니다."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredThirdMenuModalPermList.map((permission) => (
                                                        <tr 
                                                            key={permission.permission_id}
                                                            onClick={() => handleSubMenuPermissionChange(permission.permission_id)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <td className="tac" onClick={(e) => e.stopPropagation()}>
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={selectedSubMenuPermission === permission.permission_id}
                                                                    onChange={() => handleSubMenuPermissionChange(permission.permission_id)}
                                                                />
                                                            </td>
                                                            <td className="tal">{permission.permission_code || ""}</td>
                                                            <td className="tal">{permission.permission_name || ""}</td>
                                                            <td className="tal">{permission.module || ""}</td>
                                                            <td className="tal">{permission.description || ""}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer jcr">
                            <div className="form-buttons">
                                <button className="btn-success" onClick={saveThirdMenuFromModal}>저장</button>
                                <button className="btn-secondary" onClick={() => setIsThirdMenuModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* 1차 메뉴 추가/수정 모달 */}
            {isParentMenuModalOpen && (
                <div className="modal-overlay" onClick={() => setIsParentMenuModalOpen(false)}>
                    <div className="setting-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="setting-modal-header">
                            <h2>{menuFormData.menu_id ? "1차 메뉴 수정" : "1차 메뉴 추가"}</h2>
                            <button className="setting-modal-close" onClick={() => setIsParentMenuModalOpen(false)}>×</button>
                        </div>
                        <div className="setting-modal-body">
                            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                                <div className="setting-modal-form-group">
                                    <label>메뉴 코드 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="menu_code"
                                        value={menuFormData.menu_code}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) ct or preservative"
                                        autoFocus
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>메뉴 이름 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="menu_name"
                                        value={menuFormData.menu_name}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) CT or 방부력 테스트"
                                    />
                                </div>
                                {menuFormData.menu_id && (
                                <div className="setting-modal-form-group">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            checked={menuFormData.is_active === 1}
                                            onChange={handleMenuFormChange}
                                        />
                                        <span>활성화</span>
                                    </label>
                                </div>
                                )}
                            </div>
                        </div>
                        <div className="setting-modal-footer jcr">
                            <div className="form-buttons">
                                <button className="btn-success" onClick={saveParentMenuFromModal}>저장</button>
                                <button className="btn-secondary" onClick={() => setIsParentMenuModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2차 메뉴 추가/수정 모달 */}
            {isSubMenuModalOpen && (
                <div className="modal-overlay" onClick={() => setIsSubMenuModalOpen(false)}>
                    <div className="setting-modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="setting-modal-header">
                            <h2>{menuFormData.menu_id ? "2차 메뉴 수정" : "2차 메뉴 추가"}</h2>
                            <button className="setting-modal-close" onClick={() => setIsSubMenuModalOpen(false)}>×</button>
                        </div>
                        <div className="setting-modal-body">
                            {/* 메뉴 기본 정보 */}
                            <div className="setting-modal-form-grid" style={{ marginBottom: "20px" }}>
                                <div className="setting-modal-form-group">
                                    <label>메뉴 코드 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="menu_code"
                                        value={menuFormData.menu_code}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) setting_user"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>메뉴 이름 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="menu_name"
                                        value={menuFormData.menu_name}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) 사용자 관리"
                                    />
                                </div>
                                <div className="setting-modal-form-group full-width">
                                    <label>메뉴 경로</label>
                                    <input 
                                        type="text" 
                                        name="menu_path"
                                        value={menuFormData.menu_path}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) /setting/user"
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>1차 카테고리</label>
                                    <input 
                                        type="text" 
                                        name="first_category"
                                        value={menuFormData.first_category}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) 설정"
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>2차 카테고리</label>
                                    <input 
                                        type="text" 
                                        name="second_category"
                                        value={menuFormData.second_category}
                                        onChange={handleMenuFormChange}
                                        placeholder="Ex...) 사용자 관리"
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>깊이</label>
                                    <input 
                                        type="number" 
                                        name="depth"
                                        value={menuFormData.depth}
                                        onChange={handleMenuFormChange}
                                        placeholder="2, 3..."
                                        disabled
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>정렬순서</label>
                                    <input 
                                        type="number" 
                                        name="sort_order"
                                        value={menuFormData.sort_order}
                                        onChange={handleMenuFormChange}
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            checked={menuFormData.is_active === 1}
                                            onChange={handleMenuFormChange}
                                        />
                                        <span>활성화</span>
                                    </label>
                                </div>
                            </div>

                            {/* 메뉴 접근 권한 매핑 (수정 모드에서만 표시) */}
                            {menuFormData.menu_id && (
                                <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px" }}>
                                    <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3>메뉴 접근 권한</h3>
                                        <span style={{ color: "#666" }}>
                                            {selectedSubMenuPermission 
                                                ? `선택됨: ${allPermissionList.find(p => p.permission_id === selectedSubMenuPermission)?.permission_name || ''}` 
                                                : '미선택'}
                                        </span>
                                    </div>
                                    
                                    {/* 필터/검색 툴바 */}
                                    <div className="approval-toolbar" 
                                            style={{gridTemplateColumns: "1fr", marginBottom: "10px"}}
                                            aria-label="필터 및 검색">
                                        <div className="field">
                                            <label htmlFor="subMenuPermSearchFilter">검색 (권한 코드/권한 이름)</label>
                                            <input
                                                id="subMenuPermSearchFilter"
                                                type="search"
                                                placeholder="Ex...) menu.setting_user, 사용자 관리 메뉴"
                                                value={modalPermQuery}
                                                onChange={(e) => setModalPermQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="table-scroll border" style={{ maxHeight: "300px" }}>
                                        <table className="list-table">
                                            <colgroup>
                                                <col style={{ width: "5%" }} />
                                                <col style={{ width: "30%" }} />
                                                <col style={{ width: "20%" }} />
                                                <col style={{ width: "15%" }} />
                                                <col style={{ width: "30%" }} />
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th>선택</th>
                                                    <th>권한 코드</th>
                                                    <th>권한 이름</th>
                                                    <th>모듈</th>
                                                    <th>설명</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSubMenuModalPermList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="tac">
                                                            {allPermissionList.filter(p => p.permission_type === 'menu').length === 0 
                                                                ? "메뉴 권한이 없습니다." 
                                                                : "검색 결과가 없습니다."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredSubMenuModalPermList.map((permission) => (
                                                        <tr 
                                                            key={permission.permission_id}
                                                            onClick={() => handleSubMenuPermissionChange(permission.permission_id)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <td className="tac" onClick={(e) => e.stopPropagation()}>
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={selectedSubMenuPermission === permission.permission_id}
                                                                    onChange={() => handleSubMenuPermissionChange(permission.permission_id)}
                                                                />
                                                            </td>
                                                            <td className="tal">{permission.permission_code || ""}</td>
                                                            <td className="tal">{permission.permission_name || ""}</td>
                                                            <td className="tal">{permission.module || ""}</td>
                                                            <td className="tal">{permission.description || ""}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="setting-modal-footer jcr">
                            <div className="form-buttons">
                                <button className="btn-success" onClick={saveSubMenuFromModal}>저장</button>
                                <button className="btn-secondary" onClick={() => setIsSubMenuModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
