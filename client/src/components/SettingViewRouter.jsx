/**
 * 파일명 : SettingViewRouter.jsx
 * 용도 : 환경 설정 화면 뷰 라우터
 * 최초등록 : 2025-12-23 [박진영] - 환경 설정 화면이 많아서 별도 라우터 컴포넌트로 분리
 * 수정일자 : 
 * 수정사항 : 
 */

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "/src/components/Home";
import LabsDept from "/src/modules/Setting/option/LabsDept";
import UserCustomOption from "/src/modules/Setting/UserCustomOption";
import UserManage from "/src/modules/Setting/UserManage";
import AuthSettingRole from "/src/modules/Setting/auth/AuthSettingRole";
import AuthSettingPermission from "/src/modules/Setting/auth/AuthSettingPermission";
import AuthSettingMenu from "/src/modules/Setting/auth/AuthSettingMenu";
import ApprovalSettingRead from "/src/modules/Setting/approval/ApprovalSettingRead";
import ApprovalSettingCreate from "/src/modules/Setting/approval/ApprovalSettingCreate";

export default function SettingViewRouter() {

    return (
        <>
            <div className="pages">
                <div className="container">
                    <Routes>
                        {/* 기본 메인 화면 */}
                        <Route path="/main" element={<Home/>}/>

                        {/* ↓ 개인 설정 ↓ */}
                        <Route path="/setting/default" element={<UserCustomOption/>}/>

                        {/* ↓ 사용자 관리 ↓ */}
                        <Route path="/setting/user" element={<UserManage/>}/>

                        {/* ↓ 권한 설정 ↓ */}
                        <Route path="/setting/auth" element={<AuthSettingRole/>}/>
                        <Route path="/setting/auth/role" element={<AuthSettingRole/>}/>
                        <Route path="/setting/auth/permission" element={<AuthSettingPermission/>}/>
                        <Route path="/setting/auth/menu" element={<AuthSettingMenu/>}/>

                        {/* ↓ 결재선 관리 ↓ */}
                        <Route path="/setting/approval/read" element={<ApprovalSettingRead />} />  
                        <Route path="/setting/approval/create" element={<ApprovalSettingCreate />} />

                        {/* ↓ 선택 항목 관리 ↓ */}
                        <Route path="/setting/selectOptions/labsDept" element={<LabsDept/>}/> {/* 제형 담당 부서 설정 */}
                        
                        {/* 잘못된 접근일 경우 보낼 위치 */}
                        <Route path="*" element={<Navigate to="/main" replace/>} />
                        <Route path="/" element={<Navigate to="/main" replace/>} />
                    </Routes>
                </div>
            </div>
        </>
    );
}