/**
 * 파일명 : ModuleViewRouter.jsx
 * 용도 : 모듈별 화면 뷰
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import { Routes, Route, Navigate } from "react-router-dom";

// ========== [메인] 페이지 라우팅 메인 정보 ==========
import Home from "/src/components/Home";

// ========== [자재 접수] 페이지 라우팅 메인 정보 ==========
import MaterialReceipt from "/src/components/MaterialReceipt";

// ========== [CT 의뢰] 페이지 라우팅 메인 정보 ==========
import CT_Request_Read from "/src/modules/CT/CT_Request_Read";
import CT_Request_Create from "/src/modules/CT/CT_Request_Create";
import CT_Request_Approval from "/src/modules/CT/CT_Request_Approval";

// ========== [CT 시험성적서] 페이지 라우팅 메인 정보 ==========
import CT_TestReport_Read from "/src/modules/CT/CT_TestReport_Read";
import CT_TestReport_Report from "/src/modules/CT/CT_TestReport_Report";
import CT_TestReport_PDF from "/src/modules/CT/CT_TestReport_PDF";
import CT_TestReport_Standard from "/src/modules/CT/CT_TestReport_Standard";

// ========== [CT 일정현황] 페이지 라우팅 메인 정보 ==========
import CT_Schedule_CT from "/src/modules/CT/CT_Schedule_CT";
import CT_Schedule_Report from "/src/modules/CT/CT_Schedule_Report";

// ========== [내부성분분석] 페이지 라우팅 메인 정보 ==========
import Internal_Request_Read from "/src/modules/InternalTest/Internal_Request_Read";
import Internal_Request_Create from "/src/modules/InternalTest/Internal_Request_Create";

// ========== [외부성분분석] 페이지 라우팅 메인 정보 ==========
import External_Request_Read from "/src/modules/ExternalTest/External_Request_Read";
import External_Request_Create from "/src/modules/ExternalTest/External_Request_Create";

// ========== [방부력테스트] 페이지 라우팅 메인 정보 ==========
import Preservative_Request_Read from "/src/modules/Preservative/Preservative_Request_Read";
import Preservative_Request_Create from "/src/modules/Preservative/Preservative_Request_Create";
import Preservative_Request_Approve from "/src/modules/Preservative/Preservative_Request_Approve";

export default function ModuleViewRouter() { 

  return (
    <>
      <div className="pages">
        <Routes>

          { /* ↓ 메인화면 ↓ */}
          <Route path="/main" element={<Home/>}/>

          { /* ↓ 자재 접수 화면 ↓ */ }
          <Route path="/material-receipt" element={<MaterialReceipt/>}/>

          {/* ↓ CT ↓ */}
          <Route path="/ct/request/read" element={<CT_Request_Read/>}/>                     {/* CT 의뢰 조회 */}
          <Route path="/ct/request/create" element={<CT_Request_Create/>}/>                 {/* CT 의뢰 등록 */}
          <Route path="/ct/request/approval" element={<CT_Request_Approval/>}/>             {/* CT 의뢰 결재 */}

          <Route path="/ct/testReport/read" element={<CT_TestReport_Read/>}/>         {/* CT 시험성적서 조회 */}
          <Route path="/ct/testReport/report" element={<CT_TestReport_Report/>}/>     {/* CT 시험성적서 작성 */}
          <Route path="/ct/testReport/report-pdf" element={<CT_TestReport_PDF/>}/>    {/* CT 시험성적서 PDF */}
          <Route path="/ct/testReport/standard" element={<CT_TestReport_Standard/>}/> {/* CT 시험성적서 기준서 */}

          <Route path="/ct/schedule/ct" element={<CT_Schedule_CT/>}/>         {/* CT 일정 관리 */}
          <Route path="/ct/schedule/report" element={<CT_Schedule_Report/>}/> {/* 보고서 일정 관리 */}
          {/* ↑ CT ↑ */}

          {/* ↓ 내부 분석 ↓ */}
          <Route path="internal/request/read" element={<Internal_Request_Read/>}/>
          <Route path="internal/request/create" element={<Internal_Request_Create/>}/>
          {/* ↑ 내부 분석 ↑ */}

          {/* ↓ 외부 분석 ↓ */}
          <Route path="external/request/read" element={<External_Request_Read/>}/>
          <Route path="external/request/create" element={<External_Request_Create/>}/>
          {/* ↑ 외부 분석 ↑ */}

          {/* ↓ 방부력 테스트 ↓ */}
          <Route path="preservative/request/read" element={<Preservative_Request_Read/>}/>
          <Route path="preservative/request/create" element={<Preservative_Request_Create/>}/>
          <Route path="preservative/request/approve" element={<Preservative_Request_Approve/>}/>
          {/* ↑ 방부력 테스트 ↑ */}
          
          {/* 잘못된 접근일 경우 보낼 위치 */}
          <Route path="*" element={<Navigate to="/main" replace/>} />
          <Route path="/" element={<Navigate to="/main" replace/>} />

        </Routes>
      </div>
    </>
  );
}