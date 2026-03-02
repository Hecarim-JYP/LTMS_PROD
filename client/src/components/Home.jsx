    /**
 * 파일명 : Home.jsx
 * 용도 : 메인 화면
 * 최초등록 : 2025-12-16 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


export default function Home() {

    return (
        <>
            {/* ↓ 홈 메인 ↓ */}
            <div className="home-main">
                <div className="page-content doc-status-container">
                    <div className="doc-status-dashboard">
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2>의뢰 현황</h2>
                            </div>
                            <div className="dashboard-cards">
                                <div className="progress-card">
                                    <div className="card-title">
                                        <div className="stat-card-header">
                                            <h3>의뢰 진행률</h3>
                                        </div>
                                        <span className="card-subtitle">총 12건 중 3건 완료</span>
                                    </div>
                                    <div className="progress-chart-container">
                                        <div className="progress-chart-center">
                                            <div className="progress-rate">25.0%</div>
                                            <div className="progress-label">완료율</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="status-card">
                                    <Link to="/cosmeccaWeb/doc/list?status=01" className="stat-card-box">
                                        <div className="stat-card-header">
                                            <h3>대기중</h3>
                                        </div>
                                        <div className="stat-card-value yellow">
                                            <div className="stat-card-value-box">
                                                <div className="stat-card-icon-wrapper yellow">
                                                    <span className="material-symbols-outlined stat-card-icon">schedule</span>
                                                </div>
                                                <span className="stat-card-value-tit">서류 신청 대기 중</span>
                                            </div>
                                            <div className="stat-card-value-text">
                                                <span>0건</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link to="/cosmeccaWeb/doc/list?status=04" className="stat-card-box">
                                        <div className="stat-card-header">
                                            <h3>보완요청</h3>
                                        </div>
                                        <div className="stat-card-value yellow">
                                            <div className="stat-card-value-box">
                                                <div className="stat-card-icon-wrapper yellow">
                                                    <span className="material-symbols-outlined stat-card-icon">edit_note</span>
                                                </div>
                                                <span className="stat-card-value-tit">서류 보완 요청</span>
                                            </div>
                                            <div className="stat-card-value-text">
                                                <span>0건</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link to="/cosmeccaWeb/doc/list?status=02" className="stat-card-box">
                                        <div className="stat-card-header">
                                            <h3>진행중</h3>
                                        </div>
                                        <div className="stat-card-value skyblue">
                                            <div className="stat-card-value-box">
                                                <div className="stat-card-icon-wrapper skyblue">
                                                    <span className="material-symbols-outlined stat-card-icon">sync</span>
                                                </div>
                                                <span className="stat-card-value-tit">서류 신청 처리 진행 중</span>
                                            </div>
                                            <div className="stat-card-value-text">
                                                <span>9건</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link to="/cosmeccaWeb/doc/list?status=03" className="stat-card-box">
                                        <div className="stat-card-header">
                                            <h3>완료</h3>
                                        </div>
                                        <div className="stat-card-value green">
                                            <div className="stat-card-value-box">
                                                <div className="stat-card-icon-wrapper green">
                                                    <span className="material-symbols-outlined stat-card-icon">task_alt</span>
                                                </div>
                                                <span className="stat-card-value-tit">서류 신청 처리 완료</span>
                                            </div>
                                            <div className="stat-card-value-text">
                                                <span>3건</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="section-header section-header-flex">
                                <h2>신청서류</h2>
                                <Link to="/cosmeccaWeb/doc/list" className="btn btn-secondary">전체보기</Link>
                            </div>

                            <div className="project-list">
                                <div className="project-head">
                                    <span>순번</span>
                                    <span>신청완료일</span>
                                    <span>신청자</span>
                                    <span>담당자</span>
                                    <span>등록번호</span>
                                    <span>서류 항목</span>
                                    <span>진행률</span>
                                    <span>상태</span>
                                </div>

                            <Link to="/cosmeccaWeb/doc/detail?id=38" className="project-item project-item-link">
                                <span>5</span>
                                <span>2026-02-10</span>
                                <span>(주)에이블씨엔씨</span>
                                <span>영업담당자1</span>
                                <span>DOC-2026-0024</span>
                                <span className="project-name document-items">제조판매증명서(CFS)</span>
                                <span className="document-count">
                                    <span>0</span>
                                    <span>/</span>
                                    <span>1</span>
                                </span>
                                <span className="project-status">
                                    <span className="status-pill  status-pill progress">진행중</span>
                                </span>
                            </Link>
                            <Link to="/cosmeccaWeb/doc/detail?id=34" className="project-item project-item-link">
                                <span>4</span>
                                <span>2026-02-09</span>
                                <span>(주)에이블씨엔씨</span>
                                <span>영업담당자1</span>
                                <span>DOC-2026-0020</span>
                                <span className="project-name document-items">완제품 SDS, SHELF LIFE (PAO)</span>
                                <span className="document-count">
                                    <span>0</span>
                                    <span>/</span>
                                    <span>2</span>
                                </span>
                                <span className="project-status">
                                    <span className="status-pill  status-pill progress">진행중</span>
                                </span>
                            </Link>
                            <Link to="/cosmeccaWeb/doc/detail?id=33" className="project-item project-item-link">
                                <span>3</span>
                                <span>2026-02-06</span>
                                <span>(주)에이블씨엔씨</span>
                                <span>영업담당자1</span>
                                <span>DOC-2026-0019</span>
                                <span className="project-name document-items">완제품 MSDS, Claim Support, 완제품 성적서, 벌크 성적서</span>
                                <span className="document-count">
                                    <span>0</span>
                                    <span>/</span>
                                    <span>4</span>
                                </span>
                                <span className="project-status">
                                    <span className="status-pill  status-pill progress">진행중</span>
                                </span>
                            </Link>
                            <Link to="/cosmeccaWeb/doc/detail?id=32" className="project-item project-item-link">
                                <span>2</span>
                                <span>2026-02-06</span>
                                <span>(주)에이블씨엔씨</span>
                                <span>영업담당자1</span>
                                <span>DOC-2026-0018</span>
                                <span className="project-name document-items">완제품 COA, 완제품 SPEC, Undesirable Health Effect, 제품표준서, Heavymetals test report(중금속 보고서), 충포장기록서, Statement of Microbiological Purity</span>
                                <span className="document-count">
                                    <span>0</span>
                                    <span>/</span>
                                    <span>7</span>
                                </span>
                                <span className="project-status">
                                    <span className="status-pill  status-pill progress">진행중</span>
                                </span>
                            </Link>
                            <Link to="/cosmeccaWeb/doc/detail?id=31" className="project-item project-item-link">
                                <span>1</span>
                                <span>2026-02-06</span>
                                <span>(주)에이블씨엔씨</span>
                                <span>영업담당자1</span>
                                <span>DOC-2026-0017</span>
                                <span className="project-name document-items">원료 COMPOSITION, VEGAN (메카 핸들링), (구)복합 성분표</span>
                                <span className="document-count">
                                    <span>0</span>
                                    <span>/</span>
                                    <span>3</span>
                                </span>
                                <span className="project-status">
                                    <span className="status-pill  status-pill progress">진행중</span>
                                </span>
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ↑ 홈 메인 ↑ */}
        </>
    );
};