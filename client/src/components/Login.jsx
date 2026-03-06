/**
 * 파일명 : Login.jsx
 * 용도 : 로그인 화면 뷰
 * 최초등록 : 2025-12-16 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";

import useUrlNavigation from "/src/hooks/useUrlNavigation";
import { AuthContext } from "/src/contexts/AuthContext";

export default function Login() {

    /**
     * 법인 구분 옵션 목록
     */
    const companyOptions = [
        {
            idx: 1,
            label: "코스메카코리아",
            value: 1,
            company_id: 1,
            company_name: "cosmecca_korea",
        },
        {
            idx: 2,
            label: "코스메카차이나",
            value: 2,
            company_id: 2,
            company_name: "cosmecca_china",
        },
        {
            idx: 3,
            label: "잉글우드랩USA",
            value: 3,
            company_id: 3,
            company_name: "englewoodlab_usa",
        },
        {
            idx: 4,
            label: "잉글우드랩코리아",
            value: 4,
            company_id: 4,
            company_name: "englewoodlab_korea",
        },
        {
            idx: 999,
            label: "개발서버",
            value: 999,
            company_id: 999,
            company_name: "dev",
        },
    ];
    
    /**
     * 인증 컨텍스트
     */
    const { login, isAuthenticated } = useContext(AuthContext);


    /**
     * 페이지 이동 함수
     */
    const goToPage = useUrlNavigation();


    /**
     * 로그인 폼 상태
     */
    const [loginForm, setLoginForm] = useState({
        company_id: 1,
        loginId: "",
        password: "",
        rememberId: false,
        keepLogin: false,
        isLoading: false
    });


    /**
     * 폼 입력값 변경 핸들러
     */
    const handleInputChange = (field, value) => {
        setLoginForm(prev => ({
            ...prev,
            [field]: value
        }));
    };


    /**
     * 컴포넌트 마운트 시 저장된 아이디 및 로그인 유지 상태 불러오기
     */
    useEffect(() => {
        const savedId = localStorage.getItem("savedId");
        const savedKeepLogin = localStorage.getItem("keepLogin");
        
        const updates = {};
        
        if (savedId) {
            updates.loginId = savedId;
            updates.rememberId = true;
        }
        
        if (savedKeepLogin === "true") {
            updates.keepLogin = true;
        }
        
        if (Object.keys(updates).length > 0) {
            setLoginForm(prev => ({ ...prev, ...updates }));
        }
    }, []);


    /**
     * 이미 로그인된 경우 메인 페이지로 리다이렉트
     */
    useEffect(() => {
        if (isAuthenticated) goToPage("/main", {});
    }, [isAuthenticated]);


    /**
     * 입력 필드 참조
     * WHY : 포커스 제어 용도
     * companySelectRef : 법인 선택 드롭다운
     * idInputRef : 아이디 입력 필드
     * passwordInputRef : 비밀번호 입력 필드
     */
    const companySelectRef = useRef(null);
    const idInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    
    /**
     * 로그인 처리
     */
    const handleLogin = async () => {

        const params = loginForm;

        if (!loginForm.company_id) {
            alert("법인을 선택하세요.");
            companySelectRef.current.focus();
            return;
        }

        if (!loginForm.loginId.trim()) {
            alert("아이디(사번)을 입력하세요.");
            idInputRef.current.focus();
            return;
        }

        if (!loginForm.password.trim()) {
            alert("비밀번호를 입력하세요.");
            passwordInputRef.current.focus();
            return;
        }

        handleInputChange("isLoading", true);
        // goToPage("/main");

        const result = await login(params);

        if (result.status === 200) {
            // 로그인 성공 시 메인 페이지로 이동
            goToPage("/main");
        } else {
            let errMsg = `로그인에 실패했습니다.`;
            errMsg += `\n${result.response?.data?.message}`;

            const field = result.response?.data?.error?.fieldName;
            if(field === "user_info") {
                const companyName = companyOptions.filter(company => company.company_id === loginForm.company_id)[0]?.label;
                errMsg += companyName ? `\n[${companyName}] 법인에 대한 사용자 정보가 존재하지 않습니다.` : "";
            }

            // 로그인 실패 시 에러 메시지 표시
            alert(errMsg);
        }

        handleInputChange("isLoading", false);

    };

    /**
     * Enter 키 입력 시 로그인 처리
     */
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !loginForm.isLoading) handleLogin();
    };

    return (
        <div className="login-main">
            <div className="login-wrapper">
                <div className="login-box">
                    <h1 className="login-box-title">
                        <img src="/src/img/ltms_logo.png" className="login-box-img" alt="회사 로고 이미지"/><br/>
                        <span className="login-box-subtitle">Laboratory Test Management System</span>
                    </h1>

                    <select
                        className="login-box-input"
                        id="companyId"
                        name="company_id"
                        value={loginForm.company_id}
                        ref={companySelectRef}
                        onChange={(e) => handleInputChange("company_id", Number(e.target.value))}
                        style={{ padding: "10px"}}
                        disabled={loginForm.isLoading}>
                        {companyOptions.map(option => (
                            <option key={option.idx} value={option.company_id}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <input 
                        type="text"
                        placeholder="아이디(사번)을 입력하세요"
                        className="login-box-input"
                        id="loginId"
                        name="loginId"
                        value={loginForm.loginId}
                        ref={idInputRef}
                        onChange={(e) => handleInputChange("loginId", e.target.value)}
                        onKeyUp={handleKeyPress}
                        disabled={loginForm.isLoading}/>

                    <input 
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        className="login-box-input"
                        id="password"
                        name="password"
                        value={loginForm.password}
                        ref={passwordInputRef}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onKeyUp={handleKeyPress}
                        disabled={loginForm.isLoading}/>

                    <div className="flex">
                        <div className="input checkbox">
                            <input 
                                type="checkbox" 
                                name="rememberId" 
                                id="rememberId"
                                checked={loginForm.rememberId}
                                onChange={(e) => handleInputChange("rememberId", e.target.checked)}
                                disabled={loginForm.isLoading}/>
                            <span className="login-checkbox-label"><label htmlFor="rememberId">아이디 저장</label></span>
                        </div>
                        <div className="input checkbox">
                            <input 
                                type="checkbox" 
                                name="keepLogin" 
                                id="keepLogin"
                                checked={loginForm.keepLogin}
                                onChange={(e) => handleInputChange("keepLogin", e.target.checked)}
                                disabled={loginForm.isLoading}/>
                            <span className="login-checkbox-label"><label htmlFor="keepLogin">로그인 유지</label></span>
                        </div>
                    </div>

                    <button 
                        type="button"
                        className="login-btn"
                        id="login"
                        onClick={handleLogin}
                        disabled={loginForm.isLoading}>
                        {loginForm.isLoading ? "로그인 중..." : "로그인"}
                    </button>

                </div>
            </div>
        </div>
    );
};