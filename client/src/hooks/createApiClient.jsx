/**
 * 파일명 : createApiClient.jsx
 * 용도 : 인증 Context를 사용하기 위한 커스텀 훅
 * 최초등록 : 2025-12-16 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import axios from "axios";


export default function createApiClient() {

    /**
     * 기본 Axios 인스턴스 생성
     * - baseURL: API 서버 주소
     * - timeout: 요청 타임아웃 시간
     * - withCredentials: 쿠키 포함 여부 (Refresh Token용)
     */

    const apiClient = axios.create({
        baseURL: import.meta.env.VITE_API_URL || "http://192.168.115.203:4444/",
        timeout: 10000,
        withCredentials: true,  // httpOnly 쿠키 전송을 위해 필요
        headers: {
            "Content-Type": "application/json"
        }
    });

    /**
     * 요청 인터셉터
     * - 모든 요청에 Access Token 자동 추가
     * - CSRF 토큰 자동 추가
     */
    apiClient.interceptors.request.use(

        (config) => {
            // Access Token 추가
            const accessToken = sessionStorage.getItem("accessToken");
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            // CSRF 토큰 추가 (POST, PUT, DELETE 요청에만)
            if (["post", "put", "delete"].includes(config.method.toLowerCase())) {
                const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;
                if (csrfToken) {
                    config.headers["X-CSRF-TOKEN"] = csrfToken;
                }
            }

            // 요청 로깅 (개발 환경에서만)
            if (import.meta.env.DEV) {
                console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
            }

            return config;
        },

        (error) => {
            console.error("[API Request Error]", error);
            return Promise.reject(error);
        }
    );

    /**
     * 응답 인터셉터
     * - 401 오류 시 토큰 갱신 시도
     * - 토큰 갱신 실패 시 로그아웃 처리
     */
    let isRefreshing = false;  // 토큰 갱신 중 플래그
    let failedQueue = [];      // 갱신 대기 중인 요청 큐

    /**
     * 갱신 대기 큐 처리
     * @param {Error|null} error - 에러 객체 (실패 시)
     * @param {string|null} token - 새로운 Access Token (성공 시)
     */
    const processQueue = (error, token = null) => {

        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        
        failedQueue = [];
    };

    apiClient.interceptors.response.use(

        (response) => {
            // 정상 응답 로깅 (개발 환경에서만)
            if (import.meta.env.DEV) {
                console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
            }
            return response;
        },

        async (error) => {

            const originalRequest = error.config;

            // 401 Unauthorized 오류 처리
            if (error.response?.status === 401 && !originalRequest._retry) {
                // 이미 토큰 갱신 중인 경우
                if (isRefreshing) {
                    // 갱신 완료 후 재시도하도록 큐에 추가
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;

                isRefreshing = true;

                try {
                    // Refresh Token으로 Access Token 갱신 시도
                    const response = await axios.post(
                        `${apiClient.defaults.baseURL}/api/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    if (response.data.success) {

                        const { accessToken } = response.data;
                        
                        // 새로운 Access Token 저장
                        sessionStorage.setItem("accessToken", accessToken);
                        
                        // 대기 중인 요청들 처리
                        processQueue(null, accessToken);
                        
                        // 원래 요청 재시도
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return apiClient(originalRequest);
                    } else {
                        throw new Error("토큰 갱신 실패");
                    }
                } catch (refreshError) {
                    // 토큰 갱신 실패 시 로그아웃 처리
                    processQueue(refreshError, null);
                    sessionStorage.removeItem("accessToken");
                    
                    // 로그인 페이지로 리다이렉트
                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login";
                    }
                    
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // 403 Forbidden - 권한 없음
            if (error.response?.status === 403) {
                console.error("[API Error] 접근 권한이 없습니다.");
                alert("해당 기능에 대한 권한이 없습니다.");
            }

            // 500 Server Error
            if (error.response?.status >= 500) {
                console.error("[API Error] 서버 오류:", error);
                alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }

            // 네트워크 오류
            if (!error.response) {
                console.error("[API Error] 네트워크 오류:", error);
                alert("네트워크 연결을 확인해주세요.");
            }

            return Promise.reject(error);
        }
    );

    return apiClient;
};