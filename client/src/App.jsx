/**
 * 파일명 : App.jsx
 * 용도 : 프로젝트 루트
 * 최초등록 : 2025-10-30 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "/src/contexts/AuthProvider";

import ModuleMainView from "/src/components/ModuleMainView";
import Login from "/src/components/Login";

import "/src/css/App.css";

export default function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* <Route path="/" element={<Home/>}></Route> */}
          <Route path="/login" element={<Login/>}></Route>
          {/* 로그인 이후 모든 경로 */}
          <Route path="/*" element={<ModuleMainView/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}