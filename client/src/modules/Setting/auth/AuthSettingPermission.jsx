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
    const [permissionList, setPermissionList] = useState([]);
    
    // 모달 상태
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    
    const [permissionFormData, setPermissionFormData] = useState({
        permission_id: "",
        permission_code: "",
        permission_name: "",
        permission_name_en: "",
        description: "",
        resource: "",
        permission_type: "menu",
        is_system_permission: 0,
        is_active: 1,
        sort_order: 0,
        is_setting: 1
    });


    /**
     * 권한 목록 조회
     */
    const fetchRolePermissions = async () => {

        setIsLoading(true);
        
        try {
            const params = { company_id: companyId, is_setting: 1 };
            const response = await axios.get("/api/ltms/auth/permissions", { params });
            const permissions = response.data.data.result || [];
            setPermissionList(permissions);
        } catch (error) {
            console.error("역할 권한 조회 실패:", error);
            alert("역할 권한을 불러오는 중 오류가 발생했습니다.");
            setPermissionList([]);
        } finally {
            setIsLoading(false);
            setQuery("");
            setModule("");
            setPermissionType("");
        }
    };
  
    /**
     * 컴포넌트 마운트 시 권한 목록 조회
     */
    useEffect(() => {
        fetchRolePermissions();
    }, []);


    /**
     * 권한 추가 모달 열기
     */
    const openPermissionModal = () => {
        
        setPermissionFormData({
            permission_id: "",
            permission_code: "",
            permission_name: "",
            permission_name_en: "",
            description: "",
            resource: "",
            permission_type: "menu",
            is_system_permission: 0,
            is_active: 1,
            sort_order: permissionList.length + 1,
            is_setting: 1
        });
        setIsPermissionModalOpen(true);
    };


    /**
     * 권한 수정 모달 열기
     */
    const openPermissionEditModal = (permission) => {

        setPermissionFormData({
            permission_id: permission.permission_id,
            permission_code: permission.permission_code || "",
            permission_name: permission.permission_name || "",
            permission_name_en: permission.permission_name_en || "",
            description: permission.description || "",
            resource: permission.resource || "",
            permission_type: permission.permission_type || "menu",
            is_system_permission: permission.is_system_permission || 0,
            is_active: permission.is_active == 1 ? 1 : 0,
            sort_order: permission.sort_order || 0,
            is_setting: 1
        });
        setIsPermissionModalOpen(true);
    };


    /**
     * 권한 모달에서 저장 (추가 또는 수정)
     */
    const savePermissionFromModal = async () => {

        if (Utils.toStringOrEmpty(permissionFormData.permission_code) === ''
            || Utils.toStringOrEmpty(permissionFormData.permission_name) === ''
            || Utils.toStringOrEmpty(permissionFormData.resource) === '') {
            alert("권한 코드, 권한 이름, 모듈, 리소스는 필수입니다.");
            return;
        }

        try {
            const params = {
                company_id: companyId,
                created_by: user.user_id,
                ...permissionFormData,
            };
            
            const url = permissionFormData.permission_id
                ? "/api/ltms/auth/permission/update" 
                : "/api/ltms/auth/permission/create";
            
            const response = await axios.post(url, params);
            
            if (response.status == 200) {
                alert(permissionFormData.permission_id ? "권한이 수정되었습니다." : "권한이 추가되었습니다.");
                setIsPermissionModalOpen(false);
                fetchRolePermissions();
            }
        } catch (error) {
            console.error("권한 저장 실패:", error);
            alert(`권한 저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };


    /**
     * 권한 코드로부터 경로 자동 생성
     * Ex.) menu.setting_auth_menu -> /setting/auth/menu
     */
    const generateResourceFromPermissionCode = (permissionCode) => {
        if (!permissionCode || !permissionCode.includes('.')) {
            return '';
        }
        
        // 첫 번째 . 이후의 내용을 가져옴 (Ex. setting_auth_menu)
        const parts = permissionCode.split('.');
        if (parts.length < 2) {
            return '';
        }
        
        const pathPart = parts[1];
        // _ 를 / 로 변환하고 앞에 / 추가
        const resource = '/' + pathPart.replace(/_/g, '/');
        
        return resource;
    };


    /**
     * 권한 폼 데이터 변경 핸들러
     */
    const handlePermissionFormChange = (e) => {
        const { name, type, value, checked } = e.target;
        const fieldValue = type == 'checkbox' ? (checked ? 1 : 0) : value;
        
        // permission_code가 변경될 때 resource도 자동 생성
        if (name === 'permission_code') {
            const autoResource = generateResourceFromPermissionCode(value);
            setPermissionFormData(prev => ({ 
                ...prev, 
                [name]: fieldValue,
                resource: autoResource // 자동 생성된 경로 설정
            }));
        } else {
            setPermissionFormData(prev => ({ ...prev, [name]: fieldValue }));
        }
    };


    /**
     * 의뢰 목록 필터 상태
     * query : 필터 검색어
     * module : 글 유형 (Ex. 전체, 고객사CT, 부분CT)
     * permissionType : 권한 타입 (Ex. 전체, 메뉴, 동작)
     * debouncedQuery : 디바운스된 필터 검색어
     */
    const [query, setQuery] = useState("");
    const [module, setModule] = useState("");
    const [permissionType, setPermissionType] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    /** --------------------------------------------
     * 검색 디바운스
     * WHY : 타이핑할 때 마다 필터링이 매번 실행되면 성능 저하 → 300ms 지연
     * -------------------------------------------- */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    /**
     * filteredSorted : 검색 + 필터 + 정렬 결과를 메모이제이션한 목록
     * ----------------------------------------------------
     * HOW : useMemo를 사용하여 result, 검색어(debouncedQuery), 날짜범위(from/to),
     *       정렬 기준(sortKey, sortDir)이 변경될 때만 재계산한다.
     *       1) 검색어 전처리(소문자 + trim)
     *       2) result 리스트에서 검색어, 카테고리, 기간 조건을 모두 충족하는 데이터만 필터링
     *       3) 정렬 기준이 있으면 Utils.compareValues()를 이용해 정렬(asc/desc)
     *       4) 정렬 기준이 없으면 필터링된 리스트 그대로 반환
     *
     * WHY : 검색/필터/정렬이 복합적으로 적용된 리스트는 계산 비용이 크므로
     *       불필요한 재렌더링을 방지하고 성능을 최적화하기 위해 useMemo로 캐싱한다.
     *       입력 값 변화가 없을 때는 기존 계산값을 재사용하여 렌더링 부담을 낮춘다.
     */
    const filteredPermissionList = useMemo(() => {

        // 검색어 최소화(대소문자 무시)
        const q = debouncedQuery.trim().toLowerCase();
        const filtered = permissionList.filter((item) => {

            // ID, idx 를 기준으로 간단 검색 수행
            const okQuery =
                !q 
                || String(item.permission_code ?? "").toLowerCase().includes(q)
                || String(item.permission_name ?? "").toLowerCase().includes(q);

            // 카테고리 선택 필터
            const itemModule = item.resource.replaceAll('/api','').split('/')[1] || "";
            const okMod = !module || itemModule === module;

            // 권한 타입 필터
            const okType = !permissionType || item.permission_type === permissionType;

            return okQuery && okMod && okType;

        });

        return filtered;
    }, [permissionList, debouncedQuery, module, permissionType]);


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
                    <div className="settings-section auth-setting-section-flex">
                        <h3>권한 목록</h3>
                        <div className="form-buttons jcl" style={{marginBottom: "10px"}}>
                            <button className="btn-success" onClick={openPermissionModal}>권한 추가</button>
                            <button className="btn-secondary" onClick={fetchRolePermissions}>초기화</button>
                        </div>
                        {/* ↓ 필터/검색 툴바 ↓ */}
                        <div className="approval-toolbar" 
                                style={{gridTemplateColumns: "150px 150px 1fr"}}
                                aria-label="필터 및 검색">

                            <div className="field">
                                <label htmlFor="modules">모듈</label>
                                <select id="modules"
                                        value={module}
                                        onChange={(e) => setModule(e.target.value)}>
                                    {modules.map((m, idx) => (
                                        <option key={idx} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="permTypes">권한 타입</label>
                                <select id="permTypes"
                                        value={permissionType}
                                        onChange={(e) => setPermissionType(e.target.value)}>
                                    {permissionTypes.map((pt, idx) => (
                                        <option key={idx} value={pt.value}>
                                            {pt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="searchFilter">검색 (권한 코드/권한 이름/모듈)</label>
                                <input
                                    id="searchFilter"
                                    type="search"
                                    placeholder="Ex...) 	ct_request.read, CT 의뢰 조회"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                        </div>
                        {/* ↑ 필터/검색 툴바 ↑ */}
                        <div className="table-scroll border auth-setting-table-scroll">
                            <table className="list-table">
                                <colgroup>
                                    <col style={{ width: "7%" }} />
                                    <col style={{ width: "25%" }} />
                                    <col style={{ width: "25%" }} />
                                    <col style={{ width: "" }} />
                                    <col style={{ width: "8%" }} />
                                    <col style={{ width: "7%" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>권한 코드</th>
                                        <th>권한 이름</th>
                                        <th>설명</th>
                                        <th>활성화</th>
                                        <th>수정</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPermissionList.length == 0 ? (
                                        <tr>
                                            <td colSpan="6" className="tac">
                                                권한이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPermissionList.map((perm, idx) => (
                                            <tr key={perm.permission_id}>
                                                <td className="tac">{idx + 1}</td>
                                                <td className="tal">{perm.permission_code || ""}</td>
                                                <td className="tal">{perm.permission_name || ""}</td>
                                                <td className="tal">{perm.description || ""}</td>
                                                <td className="tac">{perm.is_active == 1 ? "🟢" : "🔴"}</td>
                                                <td className="tac">
                                                    <button className="btn-none" onClick={() => openPermissionEditModal(perm)}>
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
            </div>

            {/* 권한 추가/수정 모달 */}
            {isPermissionModalOpen && (
                <div className="modal-overlay" onClick={() => setIsPermissionModalOpen(false)}>
                    <div className="setting-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="setting-modal-header">
                            <h2>권한</h2>
                            <button className="setting-modal-close" onClick={() => setIsPermissionModalOpen(false)}>×</button>
                        </div>
                        <div className="setting-modal-body">
                            <div className="setting-form-grid">
                                <div className="setting-modal-form-group">
                                    <label>권한 코드 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="permission_code"
                                        value={permissionFormData.permission_code}
                                        onChange={handlePermissionFormChange}
                                        placeholder="Ex..) menu.ct_request_read"
                                        required
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>권한 타입</label>
                                    <select name="permission_type" value={permissionFormData.permission_type} 
                                            onChange={handlePermissionFormChange}>
                                        <option value="menu">메뉴</option>
                                        <option value="action">동작</option>
                                    </select>
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>권한 이름 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="permission_name"
                                        value={permissionFormData.permission_name}
                                        onChange={handlePermissionFormChange}
                                        placeholder="Ex..) CT 의뢰 조회 메뉴"
                                        required
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>권한 이름(영문)</label>
                                    <input 
                                        type="text" 
                                        name="permission_name_en"
                                        value={permissionFormData.permission_name_en}
                                        onChange={handlePermissionFormChange}
                                        placeholder="Ex..) CT Request Read Menu Access"
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>리소스 <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="resource"
                                        value={permissionFormData.resource}
                                        onChange={handlePermissionFormChange}
                                        placeholder="Ex..) /ct/request/read"
                                        required
                                    />
                                </div>
                                <div className="setting-modal-form-group">
                                    <label>정렬순서</label>
                                    <input 
                                        type="number" 
                                        name="sort_order"
                                        value={permissionFormData.sort_order}
                                        onChange={handlePermissionFormChange}
                                    />
                                </div>
                                <div className="setting-modal-form-group full-width">
                                    <label>설명</label>
                                    <textarea 
                                        name="description"
                                        value={permissionFormData.description}
                                        onChange={handlePermissionFormChange}
                                        placeholder="Ex..) CT 의뢰 조회 페이지에 접근할 수 있는 권한"
                                        rows="3"
                                    />
                                </div>
                                <div className="setting-modal-form-group full-width">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_system_permission"
                                            checked={permissionFormData.is_system_permission == 1}
                                            onChange={handlePermissionFormChange}
                                        />
                                        <span>시스템 권한</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="is_active"
                                            checked={permissionFormData.is_active == 1}
                                            onChange={handlePermissionFormChange}
                                        />
                                        <span>활성화</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="setting-modal-footer jcr">
                            <div className="form-buttons">
                                <button className="btn-success" onClick={savePermissionFromModal}>저장</button>
                                <button className="btn-secondary" onClick={() => setIsPermissionModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}