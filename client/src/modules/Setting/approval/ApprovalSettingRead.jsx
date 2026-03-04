/**
 * 파일명 : ApprovalSettingRead.jsx
 * 용도 : 결재선 템플릿 목록 조회
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 2026-02-11 [박진영] - 권한 관리 화면과 유사한 구조로 개선
 * 수정사항 : 
 */

import { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";

import { AuthContext } from "/src/contexts/AuthContext";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

import ApprovalSettingSubNav from "/src/modules/Setting/approval/ApprovalSettingSubNav";

export default function ApprovalSettingRead() {

    /**
     * 사용자 정보 컨텍스트
     */
    const { user } = useContext(AuthContext);
    const companyId = user.company_id; // 회사 ID
    const goToPage = useUrlNavigation();

    /* ============================== 상태 관리 ============================== */
    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]); // 템플릿 그룹 (approval_template 기준)
    const [selectedDocType, setSelectedDocType] = useState(""); // 전체 보기가 기본

    // 문서 유형 목록 (DB에서 조회)
    const [documentTypes, setDocumentTypes] = useState([
        {
            idx: 999,
            approval_document_type_id: "",
            document_type_code: "",
            document_type_name: "전체",
            module_name: "",
            is_active: "",
            sort_order: "",
            from_db: ""
        },
    ]);
    
    // 검색/필터 상태
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showActiveOnly, setShowActiveOnly] = useState(false); // 활성 템플릿만 보기
    const [showGuide, setShowGuide] = useState(false); // Tips 표시 여부

    /* ============================== API 호출 ============================== */
    
    /**
     * fetchDocumentTypes : 문서 유형 목록 조회 (approval_document_type 테이블)
     */
    const fetchDocumentTypes = async () => {
        try {
            const params = { 
                company_id: companyId,
                is_setting: 1
            };
            
            const response = await axios.get("/api/ltms/setting/approval/document-type", { params });
            const documentTypesResult = response.data.data.result || [];
            
            // 기존 "전체" 항목 + API 결과 병합
            setDocumentTypes([
                {
                    idx: 999,
                    approval_document_type_id: "",
                    document_type_code: "",
                    document_type_name: "전체",
                    module_name: "",
                    is_active: "",
                    sort_order: "",
                    from_db: ""
                },
                ...documentTypesResult
            ]);
            
            setSelectedDocType(""); // "전체" 선택 (빈 문자열)
        } catch (err) {
            console.error("문서 유형 조회 실패:", err);
            const errMsg = err.response?.data?.message || "문서 유형 조회 중 오류가 발생했습니다.";
            alert(errMsg);
            // 실패 시에도 초기 상태의 "전체" 항목은 유지됨
        }
    };

    /**
     * getApprovalTemplates : 결재선 템플릿 목록 조회
     * approval_template과 approval_line_template을 JOIN하여 조회
     * 결재선 개수(line_count)만 포함하여 반환
     */
    const getApprovalTemplates = async () => {
        setIsLoading(true);
        try {
            const params = { 
                company_id: companyId,
                document_type: selectedDocType,
                is_setting: 1 // 관리 화면용 파라미터
            };
            
            // 백엔드에서 JOIN으로 템플릿과 결재선을 한 번에 조회
            const response = await axios.get("/api/ltms/setting/approval/template", { params });
            const templatesWithLines = response.data.data.result || [];
            setTemplates(templatesWithLines);
        } catch (err) {
            console.error("결재선 템플릿 조회 실패:", err);
            alert("결재선 템플릿을 불러오는 중 오류가 발생했습니다.");
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 컴포넌트 마운트 시 데이터 조회
     */
    useEffect(() => {
        fetchDocumentTypes();
        getApprovalTemplates();
    }, []);

    /**
     * 검색 디바운스
     */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    /* ============================== 이벤트 핸들러 ============================== */
    
    /**
     * handleRefresh : 목록 새로고침
     */
    const handleRefresh = () => {
        setQuery("");
        setSelectedDocType(""); // "전체" 선택 (빈 문자열)
        setShowActiveOnly(true);
        getApprovalTemplates();
    };

    /**
     * handleDelete : 결재선 템플릿 삭제
     * 삭제 기능은 미지원
     */
    // const handleDelete = async (templateId, templateName) => {
    //     if (confirm(`"${templateName}" 템플릿을 삭제하시겠습니까?\n해당 템플릿의 모든 결재선이 삭제됩니다.`)) {
    //         try {
    //             await axios.delete("/api/ltms/setting/approval/template", {
    //                 data: { 
    //                     company_id: companyId, 
    //                     approval_template_id: templateId,
    //                     user_id: user.user_id 
    //                 }
    //             });
    //             alert("삭제되었습니다.");
    //             getApprovalTemplates();
    //         } catch (err) {
    //             console.error(err);
    //             const errMsg = err.response?.data?.message || "삭제 중 오류가 발생했습니다.";
    //             alert(`삭제에 실패했습니다.\n${errMsg}`);
    //         }
    //     }
    // };

    /**
     * handleToggleActive : 활성/비활성 토글
     */
    const handleToggleActive = async (templateId, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await axios.patch("/api/ltms/setting/approval/template/toggle-active", {
                company_id: companyId,
                approval_template_id: templateId,
                is_active: newStatus,
                user_id: user.user_id
            });
            alert(newStatus === 1 ? "활성화되었습니다." : "비활성화되었습니다.");
            getApprovalTemplates();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || "상태 변경 중 오류가 발생했습니다.";
            alert(`상태 변경에 실패했습니다.\n${errMsg}`);
        }
    };

    /**
     * handleRowClick : 행 클릭 시 등록/수정 화면으로 이동
     */
    const handleRowClick = (template) => {
        goToPage('/setting/approval/create', {
            approval_template_id: template.approval_template_id,
            mode: 'update'
        });
    };

    /**
     * 필터링된 템플릿 목록
     */
    const filteredTemplateGroups = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        
        return templates.filter((template) => {
            // 검색어 필터
            const matchQuery = !q 
                || String(template.template_name || "").toLowerCase().includes(q)
                || String(template.document_type || "").toLowerCase().includes(q)
                || String(template.description || "").toLowerCase().includes(q);
            
            // 문서 유형 필터
            const matchDocType = !selectedDocType || template.document_type === selectedDocType;
            
            // 활성 여부 필터
            const matchActive = !showActiveOnly || template.is_active === 1;
            
            return matchQuery && matchDocType && matchActive;
        });
    }, [templates, debouncedQuery, selectedDocType, showActiveOnly]);

    /* ============================== 렌더링 ============================== */
    return (
        <div className="setting-box">
            <div className="page-top">
                <h1 className="user-custom-option-title">결재선 템플릿 관리</h1>
            </div>

            <ApprovalSettingSubNav />

            <div className="setting-section">
                <div className="auth-setting-split-layout">
                    <div className="settings-section auth-setting-section-flex">
                        <h3>결재선 템플릿 목록</h3>
                        
                        {/* 상단 버튼 영역 */}
                        <div className="form-buttons jcl">
                            {/* <button onClick={() => goToPage("/setting/approval/create", {})}>
                                + 템플릿 추가
                            </button> */}
                            <button className="btn-secondary" onClick={handleRefresh}>초기화</button>
                            <button 
                                onClick={() => setShowGuide(!showGuide)}
                                className="btn-toggle-guide btn-info"
                                title={showGuide ? "가이드 숨기기" : "가이드 보기"}
                                style={{ width: "100px" }}
                            >
                                {showGuide ? "📖 가이드 숨기기" : "📖 가이드 보기"}
                            </button>
                        </div>

                        {/* 안내 문구 */}
                        {showGuide && (
                        <div className="approval-info-box" 
                                style={{ margin: "0px 0px 15px 0px" }}>
                            <p>
                                <strong>📌 Tips:</strong>
                            </p>
                            <ul>
                                <li>행 클릭: 템플릿 상세/수정 화면으로 이동</li>
                                <li>🔒/🔓 버튼: 활성/비활성 토글</li>
                                <li>🗑️ 버튼: 템플릿 삭제 (하위 결재선 모두 삭제)</li>
                                <li>⭐ 표시: 해당 문서 유형의 기본 템플릿</li>
                                <li>문서 작성 시 기본 템플릿이 자동으로 적용됩니다.</li>
                            </ul>
                        </div>
                        )}

                        {/* 필터/검색 툴바 */}
                        <div className="approval-toolbar-setting" 
                             aria-label="필터 및 검색">
                            
                            <div className="field">
                                <label htmlFor="docTypeFilter">문서 유형</label>
                                <select 
                                    id="docTypeFilter"
                                    value={selectedDocType}
                                    onChange={(e) => setSelectedDocType(e.target.value)}>
                                    {documentTypes.map((dt, idx) => (
                                        <option key={idx} value={dt.document_type_code}>
                                            {dt.document_type_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="searchFilter">검색 (템플릿명/문서유형/설명)</label>
                                <input
                                    id="searchFilter"
                                    type="search"
                                    placeholder="Ex...) CT 의뢰, 기본 결재선"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            <div className="field approval-toolbar-checkbox-field">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox"
                                        checked={showActiveOnly}
                                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                                    />
                                    <span>활성만 표시</span>
                                </label>
                            </div>
                        </div>

                        {/* 결과 개수 */}
                        <div className="approval-result-count">
                            총 {filteredTemplateGroups.length}개의 템플릿
                        </div>

                        {/* 템플릿 목록 테이블 */}
                        <div className="table-scroll border auth-setting-table-scroll">
                            <table className="list-table">
                                <colgroup>
                                    <col width="4%" />
                                    <col width="15%" />
                                    <col width="20%" />
                                    <col width=""/>
                                    <col width="5%" />
                                    <col width="4%" />
                                    <col width="4%" />
                                    <col width="5%" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>문서 유형</th>
                                        <th>템플릿명</th>
                                        <th>설명</th>
                                        <th>단계 수</th>
                                        <th>기본</th>
                                        <th>활성</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="8" className="tac approval-loading-message">
                                                로딩 중...
                                            </td>
                                        </tr>
                                    ) : filteredTemplateGroups.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="tac approval-empty-message">
                                                등록된 결재선 템플릿이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTemplateGroups.map((template, idx) => (
                                            <tr 
                                                key={idx}
                                                onClick={() => handleRowClick(template)}
                                                style={{ cursor: 'pointer' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                            >
                                                <td className="tac">{idx + 1}</td>
                                                <td className="tac">
                                                    {documentTypes.find(dt => dt.document_type_code === template.document_type)?.document_type_name || template.document_type}
                                                </td>
                                                <td className="tal">
                                                    <strong>{template.template_name}</strong>
                                                </td>
                                                <td className="tal">{template.description || "-"}</td>
                                                <td className="tac">
                                                    <span className="approval-step-badge">
                                                        {template.line_count || 0}단계
                                                    </span>
                                                </td>
                                                <td className="tac"
                                                    title={template.is_default === 1 ? "기본 템플릿" : ""}>
                                                    {template.is_default === 1 ? "⭐" : "-"}
                                                </td>
                                                <td className="tac"
                                                    title={template.is_active === 1 ? "활성화 상태" : "비활성화 상태"}>
                                                    {template.is_active === 1 ? "🟢" : "🔴"}
                                                </td>
                                                <td className="tac">
                                                    <button 
                                                        className="approval-action-btn"
                                                        title="비활성화 - 활성화 토글"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleActive(template.approval_template_id, template.is_active);
                                                        }}>
                                                        {template.is_active === 1 ? "🔒" : "🔓"}
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
        </div>
    );
}
