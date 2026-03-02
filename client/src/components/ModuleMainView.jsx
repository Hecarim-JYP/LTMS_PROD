/**
 * 파일명 : ModuleMainView.jsx
 * 용도 : 화면 최상위 컴포넌트
 * 최초등록 : 2025-11-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { HeaderProvider } from "/src/contexts/HeaderProvider";
import { SidebarProvider } from "/src/contexts/SidebarProvider";

import useUrlInfo from "/src/hooks/useUrlInfo";

import ProtectedRoute from "/src/components/ProtectedRoute";
import Sidebar from "/src/components/Sidebar";
import ModuleViewRouter from "/src/components/ModuleViewRouter";
import SettingViewRouter from "/src/components/SettingViewRouter";
import Header from '/src/components/Header';
import MaterialReceipt from "/src/components/MaterialReceipt";

export default function ModuleMainView() {

    /**
     * 현재 화면 url 정보 객체
     */
    const url = useUrlInfo().path; // 현재 페이지 경로

    /**
     * targetUrl : 현재 url에서 처음 경로명을 추출하여 이동할 url 생성
     * ----------------------------------------------------
     * WHY : 경로가 setting일 경우 환경 설정 전용 레이아웃을 적용하기 위함
     */
    const targetUrl = url.toString().split("/").find((item) => item !== "");

    return (
        <ProtectedRoute>
            <div className="app">
                {targetUrl === "material-receipt" 
                ? 
                <MaterialReceipt/>
                :
                <>
                    <HeaderProvider>
                        <Header/>
                    </HeaderProvider>
                    <div className="layout">
                        <SidebarProvider>
                            <Sidebar/>
                            <div className="main">
                                {targetUrl === "setting" ? <SettingViewRouter/> : <ModuleViewRouter/>}
                            </div>
                        </SidebarProvider>
                    </div>
                </>
                }
            </div>
        </ProtectedRoute>
    );
}