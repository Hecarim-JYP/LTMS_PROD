/**
 * 파일명 : MaterialReceipt.jsx
 * 용도 : 자재 접수 화면
 * 최초등록 : 2026-02-25 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect, useMemo, useContext } from "react";

import axios from "axios";

import useUrlNavigation from "/src/hooks/useUrlNavigation";

import { AuthContext } from "/src/contexts/AuthContext";
import { Common } from "/src/components/Common";
import * as Utils from "/src/components/Utils";

export default function MaterialReceipt() {


    // 사용자 정보 컨텍스트
    const { user } = useContext(AuthContext);
    const companyId = user.company_id; // 회사 ID

    // 페이지 그룹 전역 변수
    const G_PAGEGROUPCOUNT = Common.pageGroupCount;

    // 오늘 날짜 (YYYY-MM-DD)
    const G_TODAY = Common.G_TODAY;

    // goToPage : 페이지 이동 함수
    const goToPage = useUrlNavigation();

    // 검색 여부 상태
    const [isSearched, setIsSearched] = useState(false);

    // 검색 폼 state
    const [searchForm, setSearchForm] = useState({
        query: ""
    });

    // 자재 접수 요청 목록 state
    const [requests, setRequests] = useState([]);

    // CT 의뢰 폼 state
    const [ctForm, setCtForm] = useState({});

    // 차수 검색 모달 state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const refModal = useRef(null);

    // 선택된 의뢰 정보 state
    const [selectedRequest, setSelectedRequest] = useState(null);


    /**
     * handleInputChange : 검색 폼 입력값 변경 핸들러
     * --------------------------------------------------------
     * 검색 폼의 각 입력 필드에서 값이 변경될 때 호출되는 함수입니다.
     * 이벤트 객체에서 name과 value를 추출하여 searchForm state를 업데이트합니다.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({ ...prev, [name]: value }));
    };


    /**
     * handleSearch : 검색 버튼 클릭 핸들러
     * --------------------------------------------------------
     * 검색 버튼이 클릭되었을 때 호출되는 함수입니다.
     */
    const search = async (e) => {

        e.preventDefault();

        if(searchForm.query.trim() === "") {
            alert("검색어를 입력해주세요.");
            return;
        }
        
        try {
        // 요청 파라미터 객체 (초기 searchForm 값 사용)
        const params = {
            company_id: companyId,
            query: searchForm.query
        };
        
        // 응답 객체
        const res = await axios.get("/api/ltms/common/requests", { params });
        const resultData = res.data.data.result;

        setRequests(resultData);
        setIsSearched(true);

        } catch (err) {
        if (err.response) {
            // 서버가 4xx, 5xx 에러를 반환한 경우
            console.error("API Error:", err.response);
            const errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
            alert(errMsg);
            
        } else if (err.request) {
            // 요청은 갔지만 응답이 없는 경우
            console.error("No Response:", err.request);
        } else {
            // 기타 에러
            console.error("Request Error:", err.message);
        }
        } finally {
            
        }
    };

    /**
     * searchEnter : Enter 키로 검색 실행 함수
     * ----------------------------------------------------
     * WHY : textarea 내에서 Enter 키 입력 시 검색이 실행되지 않도록 방지
     * @param {*} e : 이벤트 호출 컴포넌트
     */
    const searchEnter = (e) => {
        if(e.key === "Enter" && e.target.tagName !== "TEXTAREA") search(e);
    };


    /** ----------------------------------
     * pageSize : 페이지당 표시할 항목 수
     * 기본값은 15, 클라이언트 단에서 변경 가능.
     * ---------------------------------- */
    const itemPerPageOptions = user.customSettings.items_per_page || 15;
    const [pageSize, setPageSize] = useState(itemPerPageOptions);


    // currentPage : 현재 페이지 번호 state
    const [currentPage, setCurrentPage] = useState(1);


    /**
     * 전체 페이지 수 (filteredSorted : 검색/정렬 적용된 최종 결과)
     * ----------------------------------------------------
     * HOW : 총 데이터 수 / pageSize 로 총 페이지 개수를 계산
     * WHY : 실시간으로 리스트 개수가 변할 때마다 페이지 수가 자동으로 갱신됨
     */
    const totalPages = Math.ceil(requests.length / pageSize);


    /**
     * paginatedResult
     * ----------------------------------------------------
     * HOW : 현재 페이지에 해당하는 데이터만 slice해서 렌더링용 배열 생성
     */
    const paginatedResult = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return requests.slice(start, start + pageSize);
    }, [requests, pageSize, currentPage]);


    /**
     * 페이지 번호 배열
     * ----------------------------------------------------
     * HOW : 현재 페이지를 기준으로 10개 단위 페이지 그룹 계산
     * 
     * Ex : currentPage = 7  → 1~10
     *      currentPage = 15 → 11~20
     */
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

    /**
     * resetModal : 모달 초기화 함수
     * ---------------------------------------------------------
     */
    const resetModal = () => {
        setIsModalOpen(false);
        setCtForm({}); // CT 의뢰 폼 초기화
        setRequests([]); // 차수 조회 결과 초기화
    };

    // handleModal : 모달 열기 함수
    const handleModal = async (e, req) => {
        setIsModalOpen(true);
        setSelectedRequest(req);
    };

    // requestReceipt : 자재 접수 처리 함수
    const requestReceipt = async (e) => {
        e.preventDefault();

        try {

            const params = {
                company_id: companyId,
                request_type: selectedRequest.request_type,
                request_id: selectedRequest.request_id,
                receipt_date: G_TODAY,
                received_by: user.user_id
            };

            const res = await axios.post("/api/ltms/common/material/receipt", params);

            if (res.data.success) {
                alert("자재 접수가 완료되었습니다.");
                search(new Event("submit")); // 접수 후 검색 실행하여 리스트 갱신
            } else {
                alert("자재 접수에 실패했습니다. 다시 시도해주세요.");
            }
            
        } catch (err) {
            if (err.response) {

                // 서버가 4xx, 5xx 에러를 반환한 경우
                console.error("API Error:", err.response);
                const errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
                alert(errMsg);

            } else if (err.request) {

                // 요청은 갔지만 응답이 없는 경우
                console.error("No Response:", err.request);

            } else {
                // 기타 에러
                console.error("Request Error:", err.message);
            }
        } finally {
            resetModal();
        }
    };


    /**
     * 화면 렌더링
     */
    return (
        <div className="layout">
        <div className="main">
        <div className="pages">
        <div className="container">
            <div className="material-receipt-box"
                    style={{ marginTop: "50px" }}
            >
                <div className="page-top">
                    <h1 className="user-custom-option-title tac"
                        style={{ fontSize: "4em" }}>
                        자재 접수
                    </h1>
                </div>
                <div className="auth-setting-split-layout">
                    <div className="settings-section auth-setting-section-flex">
                        <div className="searchContainer"
                            style={{ border: "1px solid #ccc" }}>
                            <form id="materialReceptionSearchForm" className="" onSubmit={search} onKeyDown={searchEnter}>
                                <input className="material-reception-search-input" 
                                        type="search"
                                        placeholder="랩넘버, 의뢰번호 등으로 검색"
                                        onChange={handleInputChange}
                                        name="query"
                                        value={searchForm?.query || ""}
                                />
                                <button type="button" 
                                        className="search"
                                        style={{ 
                                            width: "60px",
                                            fontSize: "20px",
                                            border: "none",
                                        }}
                                        onClick={search}>
                                    🔍
                                </button>
                            </form>
                        </div>
                        {requests.length > 0 
                        ? (
                            <>
                                <div className="table-scroll border auth-setting-table-scroll material-reception-list"
                                    style={{ marginTop: "20px" }}
                                >
                                    <table className="list-table">
                                        <colgroup>
                                            <col style={{ width: "8%" }} />
                                            <col style={{ width: "8%" }} />
                                            <col style={{ width: "8%" }} />
                                            <col style={{ width: "16%" }} />
                                            <col style={{ width: "30%" }} />
                                            <col style={{ width: "30%" }} />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th>유형</th>
                                                <th>의뢰번호</th>
                                                <th>의뢰일자</th>
                                                <th>랩넘버</th>
                                                <th>샘플명</th>
                                                <th>고객사</th>
                                            </tr>
                                        </thead>
                                        <tbody> 
                                            {paginatedResult.length > 0 && (
                                                paginatedResult.map((req, idx) => (
                                                    <tr key={idx}
                                                        className="auth-setting-clickable-row"
                                                        onClick={(e) => {handleModal(e, req);}}>
                                                        <td className="tac">{req.request_type}</td>
                                                        <td className="tac">{req.request_no}</td>
                                                        <td className="tac">{req.request_date}</td>
                                                        <td className="tac">{req.lab_no}</td>
                                                        <td className="tac">{req.sample_name}</td>
                                                        <td className="tac">{req.client_name}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ↓ 페이징 바 ↓ */}
                                <div className="pagination material-reception-page-button">
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
                            </>
                        ) 
                        : (
                            <>
                                <div className="no-data">
                                    {isSearched 
                                    ? <p>검색 결과가 없습니다.</p> 
                                    : <p>검색어를 입력하고 검색 버튼을 눌러주세요.</p>}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" ref={refModal} onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header material-reception-modal-header">
                                <h1>{selectedRequest ? `의뢰 번호 - ${selectedRequest.request_no} | 랩넘버 - ${selectedRequest.lab_no}` : ""}</h1>
                                <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                            </div>
                            <div className="modal-body material-reception-modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>의뢰번호 : {selectedRequest ? selectedRequest.request_no : ""}</label>
                                    </div>
                                    <div className="form-group">
                                        <label>랩넘버 : {selectedRequest ? selectedRequest.lab_no : ""}</label>
                                    </div>
                                    <div className="form-group">
                                        <label>샘플명 : {selectedRequest ? selectedRequest.sample_name : ""}</label>
                                    </div>
                                    <div className="form-group">
                                        <label>고객사 : {selectedRequest ? selectedRequest.client_name : ""}</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer jcc">
                                <div className="form-buttons">
                                    <button className="btn-success btn-large" onClick={(e) => {requestReceipt(e);}}>접수</button>
                                    <button className="btn-secondary btn-large" onClick={() => setIsModalOpen(false)}>취소</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
        </div>
        </div>
    );
}