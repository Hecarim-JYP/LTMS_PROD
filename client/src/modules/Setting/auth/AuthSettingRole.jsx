/**
 * 파일명 : AuthSettingRole.jsx
 * 용도 : 역할 관리 화면
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

export default function AuthSettingRole() {

    const { user } = useContext(AuthContext);
    const companyId = user.company_id;
    const goToPage = useUrlNavigation();
    const { path } = useUrlInfo();

    // 모듈 목록
    const modules = [
        { idx: 1, label: "전체", value: "" },
        { idx: 2, label: "CT", value: "ct" },
        { idx: 3, label: "내부 분석", value: "internal" },
        { idx: 4, label: "외부 분석", value: "external" },
        { idx: 5, label: "방부력", value: "preservative" },
        { idx: 6, label: "환경 설정", value: "setting" }
    ];

    // 권한 타입 목록
    const permissionTypes = [
        { idx: 1, label: "전체", value: "" },
        { idx: 2, label: "메뉴", value: "menu" },
        { idx: 3, label: "동작", value: "action" }
    ];

    // 현재 경로의 마지막 값 추출
    const currentPage = path.split("/").filter(Boolean).at(-1);

    const [isLoading, setIsLoading] = useState(true);
    const [roleList, setRoleList] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissionList, setRolePermissionList] = useState([]);
    
    // 모달 상태
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    
    // 권한 배정 모달용
    const [allPermissionList, setAllPermissionList] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    
    // 오른쪽 권한 목록 필터 상태
    const [rolePermissionQuery, setRolePermissionQuery] = useState("");
    const [rolePermissionModule, setRolePermissionModule] = useState("");
    const [rolePermissionType, setRolePermissionType] = useState("");
    const [debouncedRolePermissionQuery, setDebouncedRolePermissionQuery] = useState("");
    
    // 모달 권한 목록 필터 상태
    const [modalQuery, setModalQuery] = useState("");
    const [modalModule, setModalModule] = useState("");
    const [modalPermissionType, setModalPermissionType] = useState("");
    const [debouncedModalQuery, setDebouncedModalQuery] = useState("");
    
    // 모달 입력 데이터
    const [roleFormData, setRoleFormData] = useState({
        role_id: "",
        role_code: "",
        role_name: "",
        role_name_en: "",
        description: "",
        level: "",
        is_system_role: 0,
        is_active: 1,
        sort_order: 0,
        is_setting: 1
    });

    useEffect(() => {
        fetchRoleList();
    }, []);


    /**
     * 오른쪽 권한 목록 검색 디바운스
     */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedRolePermissionQuery(rolePermissionQuery), 300);
        return () => clearTimeout(t);
    }, [rolePermissionQuery]);


    /**
     * 모달 권한 목록 검색 디바운스
     */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedModalQuery(modalQuery), 300);
        return () => clearTimeout(t);
    }, [modalQuery]);


    /**
     * 역할 목록 조회
     */
    const fetchRoleList = async () => {
        try {
            setIsLoading(true);

            const params = { 
                company_id: companyId,
                is_setting: 1
            };

            const response = await axios.get("/api/ltms/auth/roles", { params });
            const roles = response.data.data.result || [];
            setRoleList(roles);
        } catch (error) {
            console.error("역할 목록 조회 실패:", error);
            alert("역할 목록을 불러오는 중 오류가 발생했습니다.");
            setRoleList([]);
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * 특정 역할의 권한 목록 조회
     */
    const fetchRolePermissions = async (roleId) => {
        try {
            setIsLoading(true);
            const params = { 
                company_id: companyId, 
                role_id: roleId,
                is_setting: 1
            };

            const response = await axios.get("/api/ltms/auth/permissions/role", { params });
            const permissions = response.data.data.result || [];
            setRolePermissionList(permissions);
        } catch (error) {
            console.error("역할 권한 조회 실패:", error);
            alert("역할 권한을 불러오는 중 오류가 발생했습니다.");
            setRolePermissionList([]);
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * 역할 선택 핸들러
     */
    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        
        // DB에 저장된 역할만 권한 조회
        if (role.from_db == "Y") {
            fetchRolePermissions(role.role_id);
        } else {
            setRolePermissionList([]);
        }
    };


    /**
     * 역할 추가 모달 열기
     */
    const openRoleModal = () => {
        setRoleFormData({
            role_id: null,
            role_code: "",
            role_name: "",
            role_name_en: "",
            description: "",
            level: "",
            is_system_role: 0,
            is_active: 1,
            sort_order: roleList.length + 1,
            is_setting: 1
        });
        setIsRoleModalOpen(true);
    };


    /**
     * 역할 수정 모달 열기
     */
    const openRoleEditModal = (role) => {
        setRoleFormData({
            role_id: role.role_id,
            role_code: role.role_code || "",
            role_name: role.role_name || "",
            role_name_en: role.role_name_en || "",
            description: role.description || "",
            level: role.level || "",
            is_system_role: role.is_system_role || 0,
            is_active: role.is_active == 1 ? 1 : 0,
            sort_order: role.sort_order || 0,
            is_setting: 1
        });
        setIsRoleModalOpen(true);
    };


    /**
     * 역할 모달에서 저장 (추가 또는 수정)
     */
    const saveRoleFromModal = async () => {
        if (Utils.toStringOrEmpty(roleFormData.role_code) === '' 
            || Utils.toStringOrEmpty(roleFormData.role_name) === '') {
            alert("역할 코드와 역할 이름은 필수입니다.");
            return;
        }

        try {
            const params = {
                company_id: companyId,
                created_by: user.user_id,
                ...roleFormData,
            };
            
            const url = roleFormData.role_id 
                ? "/api/ltms/auth/role/update" 
                : "/api/ltms/auth/role/create";
            
            const response = await axios.post(url, params);
            
            if (response.status == 200) {
                alert(roleFormData.role_id ? "역할이 수정되었습니다." : "역할이 추가되었습니다.");
                setIsRoleModalOpen(false);
                fetchRoleList();
            }
        } catch (error) {
            console.error("역할 저장 실패:", error);
            alert(`역할 저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };


    /**
     * 역할 폼 데이터 변경 핸들러
     */
    const handleRoleFormChange = (e) => {
        const { name, type, value, checked } = e.target;
        const fieldValue = type == 'checkbox' ? (checked ? 1 : 0) : value;
        setRoleFormData(prev => ({ ...prev, [name]: fieldValue }));
    };


    /**
     * 권한 추가 모달 열기 (모든 권한 목록 조회)
     */
    const openPermissionModal = async () => {

        if (!selectedRole) {
            alert("역할을 먼저 선택해주세요.");
            return;
        }
        
        try {
            // 모든 권한 목록 조회
            const params = { 
                company_id: companyId,
                is_setting: 1
            };

            const response = await axios.get("/api/ltms/auth/permissions", { params });
            const allPermissions = response.data.data.result || [];
            
            setAllPermissionList(allPermissions);
            
            // 현재 역할에 이미 배정된 권한 ID 추출
            const assignedPermissionIds = rolePermissionList.map(p => p.permission_id);
            setSelectedPermissions(assignedPermissionIds);
            
            setIsPermissionModalOpen(true);
        } catch (error) {
            console.error("권한 목록 조회 실패:", error);
            alert("권한 목록을 불러오는 중 오류가 발생했습니다.");
        }
    };


    /**
     * 체크박스 토글 핸들러
     */
    const handlePermissionCheckboxChange = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };
    
    /**
     * 전체 선택/해제 핸들러
     */
    const handleSelectAllPermissions = (checked) => {
        if (checked) {
            setSelectedPermissions(allPermissionList.map(p => p.permission_id));
        } else {
            setSelectedPermissions([]);
        }
    };

    /**
     * 오른쪽 권한 목록 필터링
     */
    const filteredRolePermissionList = useMemo(() => {
        const q = debouncedRolePermissionQuery.trim().toLowerCase();
        const filtered = rolePermissionList.filter((item) => {
            const okQuery = !q 
                || String(item.permission_code ?? "").toLowerCase().includes(q)
                || String(item.permission_name ?? "").toLowerCase().includes(q);
            const itemModule = item.resource.replaceAll('/api','').split('/')[1] || "";
            const okMod = !rolePermissionModule || itemModule === rolePermissionModule;
            const okType = !rolePermissionType || item.permission_type === rolePermissionType;
            return okQuery && okMod && okType;
        });
        return filtered;
    }, [rolePermissionList, debouncedRolePermissionQuery, rolePermissionModule, rolePermissionType]);


    /**
     * 모달 권한 목록 필터링
     */
    const filteredModalPermissionList = useMemo(() => {
        const q = debouncedModalQuery.trim().toLowerCase();
        const filtered = allPermissionList.filter((item) => {
            const okQuery = !q 
                || String(item.permission_code ?? "").toLowerCase().includes(q)
                || String(item.permission_name ?? "").toLowerCase().includes(q);
            const itemModule = item.resource.replaceAll('/api','').split('/')[1] || "";
            const okMod = !modalModule || itemModule === modalModule;
            const okType = !modalPermissionType || item.permission_type === modalPermissionType;
            return okQuery && okMod && okType;
        });
        return filtered;
    }, [allPermissionList, debouncedModalQuery, modalModule, modalPermissionType]);


    /**
     * 선택된 권한을 역할에 배정
     */
    const assignPermissionsToRole = async () => {

        if (selectedPermissions.length === 0) {
            alert("배정할 권한을 하나 이상 선택해주세요.");
            return;
        }

        if (!confirm(`선택한 ${selectedPermissions.length}개의 권한을 역할에 배정하시겠습니까?\n기존 권한은 모두 제거됩니다.`)) {
            return;
        }

        try {
            const params = {
                company_id: companyId,
                role_id: selectedRole.role_id,
                permission_ids: selectedPermissions,
                updated_by: user.user_id,
                deleted_by: user.user_id
            };
            
            const response = await axios.post("/api/ltms/auth/role/assign-permissions", params);
            
            if (response.status == 200) {
                alert("권한이 배정되었습니다.");
                setIsPermissionModalOpen(false);
                fetchRolePermissions(selectedRole.role_id);
            }
        } catch (error) {
            console.error("권한 배정 실패:", error);
            alert(`권한 배정에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };

    /**
     * 로딩 중 표시
     */
    // if (isLoading) {
    //     return (
    //         <div className="auth-setting-loading">
    //             로딩 중...
    //         </div>
    //     );
    // }

    /**
     * 로딩 중 커서 변경
     */
    useEffect(() => {
        if (isLoading) {
            document.body.style.cursor = 'progress'; // 또는 'progress'
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
                    className={`${currentPage == "role" || path == "/setting/auth" ? "active" : ""}`} 
                    onClick={() => goToPage("/setting/auth/role", {})}
                >
                    역할 관리
                </button>
                <button 
                    className={`${currentPage == "permission" ? "active" : ""}`} 
                    onClick={() => goToPage("/setting/auth/permission", {})}
                >
                    권한 관리
                </button>
                <button 
                    className={`${currentPage == "menu" ? "active" : ""}`} 
                    onClick={() => goToPage("/setting/auth/menu", {})}
                >
                    메뉴 관리
                </button>
            </div>

            <div className="setting-section">
                <div className="auth-setting-split-layout">
                    {/* 왼쪽: 역할 목록 */}
                    <div className="settings-section auth-setting-section-flex">
                        <h3>역할 목록</h3>
                        <div className="form-buttons jcl" style={{marginBottom: "10px"}}>
                            <button className="btn-success" onClick={openRoleModal}>
                                역할 추가
                            </button>
                            {/* <button onClick={fetchRoleList}>초기화</button> */}
                        </div>
                        <div className="table-scroll border auth-setting-table-scroll">
                            <table className="list-table auth-setting-table">
                            <colgroup>
                                <col style={{ width: "7%" }} />
                                <col style={{ width: "13%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "" }} />
                                <col style={{ width: "9%" }} />
                                <col style={{ width: "7%" }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>역할 코드</th>
                                    <th>역할 이름</th>
                                    <th>설명</th>
                                    <th>활성화</th>
                                    <th>수정</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roleList.length == 0 ? (
                                    <tr>
                                        <td colSpan="6" className="tac">
                                            조회된 역할이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    roleList.map((role, idx) => (
                                        <tr key={role.role_id} 
                                            onClick={() => handleRoleSelect(role)} 
                                            className={`auth-setting-clickable-row ${selectedRole?.role_id === role.role_id ? "tr-selected" : ""}`}>
                                            <td className="tac">{idx + 1}</td>
                                            <td className="tac">{role.role_code || ""}</td>
                                            <td className="tac">{role.role_name || ""}</td>
                                            <td className="tal">{role.description || ""}</td>
                                            <td className="tac">{role.is_active == 1 ? "🟢" : "🔴"}</td>
                                            <td className="tac">
                                                <button className="btn-none" onClick={(e) => {
                                                    e.stopPropagation();
                                                    openRoleEditModal(role);
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

                    {/* 오른쪽: 선택된 역할의 권한 목록 */}
                    <div className="settings-section auth-setting-section-flex">
                        <h3>{selectedRole ? `${selectedRole.role_name} 권한 목록` : "권한 목록"}</h3>
                        <div className="form-buttons jcl" style={{marginBottom: "10px"}}>
                            <button className="btn-primary" onClick={openPermissionModal} disabled={!selectedRole}>권한 설정</button>
                            <button className="btn-secondary" onClick={() => {
                                setRolePermissionQuery("");
                                setRolePermissionModule("");
                                setRolePermissionType("");
                            }} disabled={!selectedRole}>초기화</button>
                        </div>
                        {/* 필터/검색 툴바 */}
                        <div className="approval-toolbar" 
                                style={{gridTemplateColumns: "150px 150px 1fr"}}
                                aria-label="필터 및 검색">

                            <div className="field">
                                <label htmlFor="rolePermModules">모듈</label>
                                <select id="rolePermModules"
                                        value={rolePermissionModule}
                                        onChange={(e) => setRolePermissionModule(e.target.value)}
                                        disabled={!selectedRole}>
                                    {modules.map((m, idx) => (
                                        <option key={idx} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="rolePermTypes">권한 타입</label>
                                <select id="rolePermTypes"
                                        value={rolePermissionType}
                                        onChange={(e) => setRolePermissionType(e.target.value)}
                                        disabled={!selectedRole}>
                                    {permissionTypes.map((pt, idx) => (
                                        <option key={idx} value={pt.value}>
                                            {pt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="rolePermSearchFilter">검색 (권한 코드/권한 이름)</label>
                                <input
                                    id="rolePermSearchFilter"
                                    type="search"
                                    placeholder="Ex...) ct_request.read, CT 의뢰 조회"
                                    value={rolePermissionQuery}
                                    onChange={(e) => setRolePermissionQuery(e.target.value)}
                                    disabled={!selectedRole}
                                />
                            </div>

                        </div>
                        <div className="table-scroll border auth-setting-table-scroll">
                            <table className="list-table">
                                <colgroup>
                                    <col style={{ width: "7%" }} />
                                    <col style={{ width: "" }} />
                                    <col style={{ width: "25%" }} />
                                    <col style={{ width: "30%" }} />
                                    {/* <col style={{ width: "8%" }} /> */}
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>권한 코드</th>
                                        <th>권한 이름</th>
                                        <th>설명</th>
                                        {/* <th>활성화</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!selectedRole ? (
                                        <tr>
                                            <td colSpan="4" className="tac">
                                                역할을 선택해주세요.
                                            </td>
                                        </tr>
                                    ) : filteredRolePermissionList.length == 0 ? (
                                        <tr>
                                            <td colSpan="4" className="tac">
                                                {rolePermissionList.length == 0 ? "할당된 권한이 없습니다." : "검색 결과가 없습니다."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRolePermissionList.map((perm, idx) => (
                                            <tr key={perm.permission_id}>
                                                <td className="tac">{idx + 1}</td>
                                                <td className="tal">{perm.permission_code || ""}</td>
                                                <td className="tal">{perm.permission_name || ""}</td>
                                                <td className="tal">{perm.description || ""}</td>
                                                {/* <td className="tac">{perm.is_active == 1 ? "🟢" : "🔴"}</td> */}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 역할 추가 모달 */}
            {isRoleModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRoleModalOpen(false)}>
                    <div className="setting-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="setting-modal-header">
                            <h2>{roleFormData.role_id ? "역할 수정" : "역할 추가"}</h2>
                            <button className="setting-modal-close" onClick={() => setIsRoleModalOpen(false)}>×</button>
                        </div>
                        <div className="setting-modal-body">
                            <div className="setting-modal-form-grid">
                                <div className="setting-modal-form-group">
                                    <label>역할 코드 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="role_code"
                                        value={roleFormData.role_code}
                                        onChange={handleRoleFormChange}
                                        placeholder="Ex..) USER"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>역할 이름 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="role_name"
                                        value={roleFormData.role_name}
                                        onChange={handleRoleFormChange}
                                        placeholder="Ex..) 사용자"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>역할 이름(영문)</label>
                                    <input 
                                        type="text" 
                                        name="role_name_en"
                                        value={roleFormData.role_name_en}
                                        onChange={handleRoleFormChange}
                                        placeholder="Ex..) User"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>레벨</label>
                                    <input 
                                        type="number" 
                                        name="level"
                                        value={roleFormData.level}
                                        onChange={handleRoleFormChange}
                                        placeholder="Ex..) 0 ~ 100"
                                    />
                                </div>
                                <div className="setting-modal-form-group full-width">
                                    <label>설명</label>
                                    <textarea 
                                        name="description"
                                        value={roleFormData.description}
                                        onChange={handleRoleFormChange}
                                        placeholder="Ex..) 시스템의 기본 기능을 사용할 수 있는 일반 사용자 역할"
                                        rows="3"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>정렬순서</label>
                                    <input 
                                        type="number" 
                                        name="sort_order"
                                        value={roleFormData.sort_order}
                                        onChange={handleRoleFormChange}
                                    />
                                </div>
                                <div className="setting-modal-form-group full-width">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_system_role"
                                            checked={roleFormData.is_system_role == 1}
                                            onChange={handleRoleFormChange}
                                        />
                                        <span>시스템 역할</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            checked={roleFormData.is_active == 1}
                                            onChange={handleRoleFormChange}
                                        />
                                        <span>활성화</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="setting-modal-footer jcr">
                            <div className="form-buttons">
                                <button className="btn-success" onClick={saveRoleFromModal}>저장</button>
                                <button className="btn-secondary" onClick={() => setIsRoleModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 권한 배정 모달 */}
            {isPermissionModalOpen && (
                <div className="modal-overlay" onClick={() => setIsPermissionModalOpen(false)}>
                    <div className="setting-modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="setting-modal-header">
                            <h2>[{selectedRole?.role_name}] 권한 설정</h2>
                            <button className="setting-modal-close" onClick={() => setIsPermissionModalOpen(false)}>×</button>
                        </div>
                        <div className="setting-modal-body">
                            <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox"
                                        checked={selectedPermissions.length === filteredModalPermissionList.length && filteredModalPermissionList.length > 0}
                                        onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                                    />
                                    <span style={{ fontWeight: "bold" }}>전체 선택/해제</span>
                                </label>
                                <span style={{ color: "#666" }}>선택된 권한: {selectedPermissions.length}개 / 전체: {allPermissionList.length}개</span>
                            </div>
                            {/* 필터/검색 툴바 */}
                            <div className="approval-toolbar" 
                                    style={{gridTemplateColumns: "150px 150px 1fr", marginBottom: "10px"}}
                                    aria-label="필터 및 검색">

                                <div className="field">
                                    <label htmlFor="modalModules">모듈</label>
                                    <select id="modalModules"
                                            value={modalModule}
                                            onChange={(e) => setModalModule(e.target.value)}>
                                        {modules.map((m, idx) => (
                                            <option key={idx} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label htmlFor="modalPermTypes">권한 타입</label>
                                    <select id="modalPermTypes"
                                            value={modalPermissionType}
                                            onChange={(e) => setModalPermissionType(e.target.value)}>
                                        {permissionTypes.map((pt, idx) => (
                                            <option key={idx} value={pt.value}>
                                                {pt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label htmlFor="modalSearchFilter">검색 (권한 코드/권한 이름)</label>
                                    <input
                                        id="modalSearchFilter"
                                        type="search"
                                        placeholder="Ex...) ct_request.read, CT 의뢰 조회"
                                        value={modalQuery}
                                        onChange={(e) => setModalQuery(e.target.value)}
                                    />
                                </div>

                            </div>
                            <div className="table-scroll border" style={{ maxHeight: "500px" }}>
                                <table className="list-table">
                                    <colgroup>
                                        <col style={{ width: "3%" }} />
                                        <col style={{ width: "25%" }} />
                                        <col style={{ width: "15%" }} />
                                        <col style={{ width: "25%" }} />
                                        <col style={{ width: "6%" }} />
                                        <col style={{ width: "" }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>선택</th>
                                            <th>권한 코드</th>
                                            <th>권한 이름</th>
                                            <th>모듈</th>
                                            <th>액션</th>
                                            <th>설명</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredModalPermissionList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="tac">
                                                    {allPermissionList.length === 0 ? "조회된 권한이 없습니다." : "검색 결과가 없습니다."}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredModalPermissionList.map((permission) => (
                                                <tr 
                                                    key={permission.permission_id}
                                                    onClick={() => handlePermissionCheckboxChange(permission.permission_id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="tac" onClick={(e) => e.stopPropagation()}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(permission.permission_id)}
                                                            onChange={() => handlePermissionCheckboxChange(permission.permission_id)}
                                                        />
                                                    </td>
                                                    <td className="tal">{permission.permission_code || ""}</td>
                                                    <td className="tal">{permission.permission_name || ""}</td>
                                                    <td className="tal">{permission.module || ""}</td>
                                                    <td className="tac">{permission.action || ""}</td>
                                                    <td className="tal">{permission.description || ""}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="setting-modal-footer jcr">
                            <div className="form-buttons">
                                <button className="btn-success" onClick={assignPermissionsToRole}>배정</button>
                                <button className="btn-secondary" onClick={() => setIsPermissionModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}