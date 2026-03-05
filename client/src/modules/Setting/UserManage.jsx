/**
 * 파일명 : UserManage.jsx
 * 용도 : 사용자 관리 화면
 * 최초등록 : 2026-02-05 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "/src/contexts/AuthContext";
import { Common } from "/src/components/Common";

export default function UserManage() {

    const { user } = useContext(AuthContext);
    const companyId = user.company_id;

    const G_PAGEGROUPCOUNT = Common.pageGroupCount;

    /**
     * 사용자 목록 데이터
     */
    const [users, setUsers] = useState([]);
    // 예시 데이터 구조
    // users = [
    //     {
    //         user_id : 사용자 ID (PK)
    //         user_name : 사용자 이름 (이메일주소에서 도메인 제외한 부분)
    //         user_full_name : 사용자 전체 이름(Ex. 홍길동)
    //         email : 이메일
    //         employee_number : 사번
    //         status : 활성화 여부 (1: 활성화, 0: 비활성화)
    //         phone : 전화번호
    //         position : 직책
    //         status : 상태
    //         last_login_at : 마지막 로그인 시간
    //         role_id : 역할 ID
    //         role_code : 역할 코드
    //         role_name : 역할 이름
    //         role_description : 역할 설명
    //         department_name : 부서
    //         grade_name : 직급
    //     },
    // ];  

    /**
     * 역할 목록 데이터 (셀렉트박스용)
     */
    const [roles, setRoles] = useState([]);
    // 예시 데이터 구조
    // roles = [
    //     {
    //         idx : 인덱스 
    //         role_id : 역할 ID (PK)
    //         role_code : 역할 코드
    //         role_name : 역할 이름
    //         description : 역할 설명
    //         is_active : 활성화 여부 (1: 활성화, 0: 비활성화)
    //         sort_order : 정렬순서
    //         from_db : DB에서 조회된 데이터 여부
    //     },
    // ];

    // 로딩 상태
    const [isLoading, setIsLoading] = useState(true);

    // 검색/필터 상태
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // 검색 디바운스
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    // 컴포넌트 마운트 시 데이터 조회
    useEffect(() => {
        fetchRoleList();
        fetchUserList();
    }, []);

    // 필터링된 사용자 목록
    const filteredUserGroups = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        
        return users.filter((user) => {
            // 검색어 필터
            const matchQuery = !q 
                || String(user.user_name || "").toLowerCase().includes(q)
                || String(user.user_full_name || "").toLowerCase().includes(q)
                || String(user.email || "").toLowerCase().includes(q)
                || String(user.employee_number || "").toLowerCase().includes(q)
                || String(user.department_name || "").toLowerCase().includes(q)
                || String(user.grade_name || "").toLowerCase().includes(q);
            
            return matchQuery;
        });
    }, [users, debouncedQuery]);

    // 사용자 목록 조회
    const fetchUserList = async () => {
        try {
            setIsLoading(true);
            const params = { 
                company_id: companyId,
                is_setting: 1, // 설정용 사용자 목록 조회 플래그
                department_id: user.department_id // 사용자 소속 부서 ID
            };
            const response = await axios.get("/api/ltms/auth/users", { params });
            const resultUsers = response.data.data.result || [];
            
            setUsers(resultUsers);
            console.log(resultUsers);
        } catch (error) {
            console.error("사용자 목록 조회 실패:", error);
            alert("사용자 목록을 불러오는 중 오류가 발생했습니다.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 역할 목록 조회
    const fetchRoleList = async () => {
        try {
            const params = { company_id: companyId };
            const response = await axios.get("/api/ltms/auth/roles", { params });
            const roleList = response.data.data.result || [];
            setRoles(roleList);
        } catch (error) {
            console.error("역할 목록 조회 실패:", error);
            setRoles([]);
        }
    };

    // 입력 필드 변경 핸들러
    const handleInputChange = (userId, field, e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        
        setUsers(prev => prev.map(user => 
            user.user_id === userId ? { ...user, [field]: value } : user
        ));
    };

    // 저장
    const save = async () => {

        if (!confirm("변경사항을 저장하시겠습니까?")) return;

        try {
            const modifiedUsers = users.map((user) => ({
                    company_id: companyId,
                    user_id: user.user_id,
                    role_id: user.role_id,
                    status: user.status
                })
            );

            const params = { 
                company_id: companyId, 
                userList: modifiedUsers 
            };
            const response = await axios.patch("/api/ltms/auth/user/save", params);
            
            if (response.status === 200) {
                alert("저장이 완료되었습니다.");
                fetchUserList(); // 저장 후 목록 새로고침
            }
        } catch (error) {
            console.error("저장 실패:", error);
            alert(`저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };

    // 초기화
    const reset = () => {
        if (confirm("변경사항을 초기화하시겠습니까?")) {
            fetchUserList();
        }
    };

    // 페이지네이션 관련 상태
    const [pageSize, setPageSize] = useState(20);

    // currentPage : 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);

    // 전체 페이지 수 (filteredUserGroups : 검색/정렬 적용된 최종 결과)
    const totalPages = Math.ceil(filteredUserGroups.length / pageSize);

    // paginatedResult 현재 페이지에 해당하는 데이터만 slice해서 렌더링용 배열 생성
    const paginatedResult = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUserGroups.slice(start, start + pageSize);
    }, [filteredUserGroups, pageSize, currentPage]);

    // 페이지 번호 배열 : 현재 페이지를 기준으로 10개 단위 페이지 그룹 계산
    const compactPages = useMemo(() => {
        const groupStart = Math.floor((currentPage - 1) / G_PAGEGROUPCOUNT) * G_PAGEGROUPCOUNT + 1;  // 그룹 시작 페이지
        const groupEnd = Math.min(groupStart + 9, totalPages);           // 그룹 마지막 페이지

        const pages = [];
        for (let i = groupStart; i <= groupEnd; i++) {
        pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);


    // movePage : 특정 페이지로 이동
    const movePage = (p) => setCurrentPage(p);


    // movePrev : 이전 페이지 그룹으로 이동
    const movePrev = () => {
        const prevPage = currentPage - G_PAGEGROUPCOUNT;
        setCurrentPage(prevPage < 1 ? 1 : prevPage);
    };


    // moveNext : 다음 페이지 그룹으로 이동
    const moveNext = () => {
        const nextPage = currentPage + G_PAGEGROUPCOUNT;
        setCurrentPage(nextPage > totalPages ? totalPages : nextPage);
    };


    // moveFirst : 맨 처음 페이지로 이동
    const moveFirst = () => setCurrentPage(1);


    // moveLast : 맨 마지막 페이지로 이동
    const moveLast = () => setCurrentPage(totalPages);

    if (isLoading) {
        return (
            <div className="setting-box">
                <div className="page-top">
                    <h1 className="user-custom-option-title">사용자 관리</h1>
                </div>
                <div style={{ textAlign: "center", padding: "50px" }}>
                    로딩 중...
                </div>
            </div>
        );
    }

    return (
        <div className="setting-box">
            <div className="page-top">
                <h1 className="user-custom-option-title">사용자 관리</h1>
            </div>

            <div className="form-buttons jcl" style={{ margin: "15px 0px" }}>
                <button className="btn-success" onClick={save}>저장</button>
                <button className="btn-secondary" onClick={reset}>초기화</button>
            </div>

            {/* 필터/검색 툴바 */}
            <div className="approval-toolbar-setting" 
                    style={{gridTemplateColumns: "1fr"}}
                    aria-label="필터 및 검색">
                
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
            </div>

            <div className="settings-section">
                <div className="table-scroll border" style={{height : "100%"}}>
                    <table className="list-table">
                        <colgroup>
                            <col style={{ width: "4%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "26%" }} />
                            <col style={{ width: "26%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "4%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>사번</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>부서</th>
                                <th>직급</th>
                                <th>직책</th>
                                <th>역할</th>
                                <th>활성화</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResult.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="tac">
                                        조회된 사용자가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                paginatedResult.map((userData, index) => (
                                    <tr key={userData.user_id}>
                                        <td className="tac">{index + 1}</td>
                                        <td className="tac">{userData.employee_number || "-"}</td>
                                        <td className="tac">{userData.user_full_name || "-"}</td>
                                        <td className="tac">{userData.email || "-"}</td>
                                        <td className="tac">{userData.department_name || "-"}</td>
                                        <td className="tac">{userData.grade_name || "-"}</td>
                                        <td className="tac">{userData.position || "-"}</td>
                                        <td className="tac">
                                            <select 
                                                value={userData.role_id || ""}
                                                style={{ width: "100%" }}
                                                onChange={(e) => handleInputChange(userData.user_id, 'role_id', e)}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.idx} value={role.role_id}>
                                                        {role.role_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="tac">
                                            <input 
                                                type="checkbox" 
                                                checked={userData.status === 1}
                                                onChange={(e) => handleInputChange(userData.user_id, 'status', e)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ↓ 페이징 바 ↓ */}
            <div className="pagination">
            <button disabled={currentPage === 1} onClick={moveFirst}>⏮</button>
            <button disabled={currentPage === 1} onClick={movePrev}>◀</button>
            {compactPages.map((p) => (
                <button key={p} className={p === currentPage ? "active" : ""}
                onClick={() => movePage(p)} >
                {p}
                </button>
            ))}
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={moveNext}>▶</button>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={moveLast}>⏭</button>
            </div>
            {/* ↑ 페이징 바 ↑ */}

        </div>
    );
}