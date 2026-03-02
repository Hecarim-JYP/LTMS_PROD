/**
 * 파일명 : UserCustomOption.jsx
 * 용도 : 사용자 기초 설정 화면
 * 최초등록 : 2026-02-04 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "/src/contexts/AuthContext";

export default function UserCustomOption() {

    const { user } = useContext(AuthContext);
    const companyId = user.company_id; // 회사 ID
    const userId = user.user_id;     // 사용자 ID

    /**
     * 셀렉트박스 옵션 배열 정의
     */
    // CT 모듈
    const ctRequestOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' },
        { idx: 3, label: '결재', value: 'approval' }
    ];
    
    const ctTestReportOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '기준등록', value: 'standard' }
    ];
    
    const ctScheduleOptions = [
        { idx: 1, label: 'CT', value: 'ct' },
        { idx: 2, label: '시험', value: 'report' }
    ];

    // 내부 분석 모듈
    const internalRequestOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' }
    ];

    const internalTestReportOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' }
    ];

    const internalScheduleOptions = [
        { idx: 1, label: '내부 분석', value: 'internal' }
    ];

    // 외부 분석 모듈
    const externalRequestOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' }
    ];

    const externalTestReportOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' }
    ];

    const externalScheduleOptions = [
        { idx: 1, label: '외부 분석', value: 'external' }
    ];

    // 방부력 테스트 모듈
    const preservativeRequestOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' }
    ];

    const preservativeTestReportOptions = [
        { idx: 1, label: '조회', value: 'read' },
        { idx: 2, label: '등록', value: 'create' }
    ];

    const preservativeScheduleOptions = [
        { idx: 1, label: '방부력 테스트', value: 'preservative' }
    ];

    /**
     * 기본값 상수
     */
    const DEFAULT_SETTINGS = {
        default_menu_code: 'ct_request',
        default_page_path: '/ct/request/read',
        module_default_settings: {
            ct: {
                request: { action: "read" },
                testReport: { action: "read" },
                schedule: { action: "ct" }
            },
            internal: {
                request: { action: "create" },
                testReport: { action: "read" },
                schedule: { action: "internal" }
            },
            external: {
                request: { action: "read" },
                testReport: { action: "read" },
                schedule: { action: "external" }
            },
            preservative: {
                request: { action: "read" },
                testReport: { action: "read" },
                schedule: { action: "preservative" }
            }
        },
        theme_mode: 'light',
        sidebar_collapsed: 0,
        items_per_page: 15,
        date_format: 'YYYY-MM-DD',
        time_format: 'HH:mm:ss',
        language: 'ko',
        notification_enabled: 1,
        notification_email: 1,
        notification_sms: 0
    };

    /**
     * 설정 상태
     */
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [touched, setTouched] = useState({
        default_menu_code: false,
        default_page_path: false
    });

    /**
     * 컴포넌트 마운트 시 사용자 설정 조회 및 메뉴 리스트 조회
     */
    useEffect(() => {
        fetchUserSettings();
        fetchMenuList();
    }, []);

    /**
     * 메뉴 리스트 조회 (sessionStorage에서만)
     */
    const fetchMenuList = () => {
        try {
            const cachedData = sessionStorage.getItem('menuList');
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                setMenuList(parsedData);
            }
        } catch (error) {
            console.error('메뉴 조회 실패:', error);
            setMenuList([]);
        }
    };

    /**
     * 메뉴 코드 유효성 검증
     */
    const isValidMenuCode = (menuCode) => {
        if (!menuCode || !menuList.length) return true;
        return menuList.some(menu => menu.menu_code === menuCode);
    };

    /**
     * 페이지 경로 유효성 검증
     * 입력된 경로가 menuList의 menu_path로 시작하는지 확인
     */
    const isValidPagePath = (pagePath) => {
        if (!pagePath || !menuList.length) return true;
        return menuList.some(menu => menu.menu_path && pagePath.startsWith(menu.menu_path));
    };

    /**
     * 사용자 설정 조회
     */
    const fetchUserSettings = async () => {

        try {
            setIsLoading(true);

            const params = {
                company_id: companyId,
                user_id: userId
            };

            const response = await axios.get("/api/ltms/setting/user-custom", { params });

            if (response.data.data) {
                const userData = response.data.data.result;
                
                // module_default_settings 파싱 및 기본값 처리
                let parsedModuleSettings;
                if (userData.module_default_settings) {
                    parsedModuleSettings = typeof userData.module_default_settings === 'string'
                        ? JSON.parse(userData.module_default_settings)
                        : userData.module_default_settings;
                } else {
                    parsedModuleSettings = DEFAULT_SETTINGS.module_default_settings;
                }
                
                const newSettings = {
                    ...userData,
                    module_default_settings: parsedModuleSettings,
                    // 숫자 타입 필드 명시적 변환
                    items_per_page: Number(userData.items_per_page || DEFAULT_SETTINGS.items_per_page),
                    sidebar_collapsed: Number(userData.sidebar_collapsed ?? DEFAULT_SETTINGS.sidebar_collapsed),
                    notification_enabled: Number(userData.notification_enabled ?? DEFAULT_SETTINGS.notification_enabled),
                    notification_email: Number(userData.notification_email ?? DEFAULT_SETTINGS.notification_email),
                    notification_sms: Number(userData.notification_sms ?? DEFAULT_SETTINGS.notification_sms)
                };

                setSettings(newSettings);
            }
        } catch (error) {
            console.error('설정 조회 실패:', error);
            alert('설정을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 설정값 변경 핸들러
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // 체크박스는 checked 값을 0 또는 1로 변환
        // items_per_page는 숫자로 변환
        let targetValue = value;
        if (type === 'checkbox') {
            targetValue = checked ? 1 : 0;
        } else if (name === 'items_per_page') {
            targetValue = Number(value);
        }
        
        setSettings(prev => ({
            ...prev,
            [name]: targetValue
        }));
    };

    /**
     * 필드 포커스 아웃 핸들러
     */
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    /**
     * 모듈별 설정 변경 핸들러
     */
    const handleModuleChange = (module, menu, action) => {
        
        setSettings(prev => {            
            const newSettings = {
                ...prev,
                module_default_settings: {
                    ...(prev.module_default_settings || {}),
                    [module]: {
                        ...(prev.module_default_settings?.[module] || {}),
                        [menu]: { action }
                    }
                }
            };

            return newSettings;
        });
    };

    /**
     * 설정 저장
     */
    const handleSave = async () => {

        if(!confirm('설정을 저장하시겠습니까?')) return;

        try {
            setIsSaving(true);

            const params = {
                ...settings,
                company_id: companyId,
                user_id: userId
            };

            await axios.patch("/api/ltms/setting/user-custom", params);
            alert('설정이 저장되었습니다.\n변경된 설정은 로그아웃, 브라우저 재시작 후 적용됩니다.');
        } catch (error) {
            console.error('설정 저장 실패:', error);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * 기본값 복원
     */
    const handleRestore = () => {
        if (confirm('기본값으로 복원하시겠습니까?\n저장하지 않은 변경사항은 사라집니다.')) {
            setSettings(DEFAULT_SETTINGS);
        }
    };

    if (isLoading) {
        return (
            <div className="user-custom-option-loading">
                <p>설정을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="user-custom-option-container">
            <div className="page-top">
                <h1 className="user-custom-option-title">사용자 기초 설정</h1>
            </div>
            
            {/* 초기 화면 설정 */}
            {/* <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '15px' }}>초기 화면 설정</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        초기 메뉴 코드
                    </label>
                    <input
                        type="text"
                        id="defaultMenuCode"
                        name="default_menu_code"
                        value={settings.default_menu_code}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            border: touched.default_menu_code && !isValidMenuCode(settings.default_menu_code) ? '1px solid #dc3545' : '1px solid #ddd'
                        }}
                    />
                    {touched.default_menu_code && !isValidMenuCode(settings.default_menu_code) && (
                        <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                            ⚠ 올바르지 않은 메뉴 코드입니다.
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        초기 페이지 경로
                    </label>
                    <input
                        type="text"
                        id="defaultPagePath"
                        name="default_page_path"
                        value={settings.default_page_path}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            border: touched.default_page_path && !isValidPagePath(settings.default_page_path) ? '1px solid #dc3545' : '1px solid #ddd'
                        }}
                    />
                    {touched.default_page_path && !isValidPagePath(settings.default_page_path) && (
                        <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                            ⚠ 올바르지 않은 경로입니다.
                        </div>
                    )}
                </div>
            </section> */}

            {/* UI 설정 */}
            <section className="settings-section">
                <h3>UI 설정</h3>
                
                {/* <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        테마 모드
                    </label>
                    <select
                        id="themeMode"
                        name="theme_mode"
                        value={settings.theme_mode}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="light">라이트 모드</option>
                        <option value="dark">다크 모드</option>
                    </select>
                </div> */}

                <div className="settings-field settings-field-checkbox">
                    <label>
                        <input
                            type="checkbox"
                            id="sidebarCollapsed"
                            name="sidebar_collapsed"
                            checked={settings.sidebar_collapsed === 1}
                            onChange={handleChange}
                        />
                        <span>사이드바 기본 접힘</span>
                    </label>
                </div>

                <div className="settings-field">
                    <label>
                        게시글 페이지당 표시 개수
                    </label>
                    <select
                        id="itemsPerPage"
                        name="items_per_page"
                        value={settings.items_per_page}
                        onChange={handleChange}
                    >
                        <option value={15}>15개</option>
                        <option value={30}>30개</option>
                        <option value={50}>50개</option>
                        <option value={100}>100개</option>
                    </select>
                </div>
            </section>

            {/* 데이터 표시 설정 */}
            {/* <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '15px' }}>데이터 표시 설정</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        날짜 형식
                    </label>
                    <select
                        id="dateFormat"
                        name="date_format"
                        value={settings.date_format}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        시간 형식
                    </label>
                    <select
                        id="timeFormat"
                        name="time_format"
                        value={settings.time_format}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="HH:mm:ss">24시간 (HH:mm:ss)</option>
                        <option value="hh:mm:ss A">12시간 (hh:mm:ss A)</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        언어
                    </label>
                    <select
                        id="language"
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </section> */}

            {/* 알림 설정 */}
            <section className="settings-section">
                <h3>알림 설정</h3>
                
                <div className="settings-field settings-field-checkbox">
                    <label>
                        <input
                            type="checkbox"
                            id="notificationEnabled"
                            name="notification_enabled"
                            checked={settings.notification_enabled === 1}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleChange(e);
                                } else {
                                    setSettings(prev => ({
                                        ...prev,
                                        notification_enabled: 0,
                                        notification_email: 0,
                                        notification_sms: 0
                                    }));
                                }
                            }}
                        />
                        <span>알림 활성화</span>
                    </label>
                </div>

                <div className="settings-field settings-field-checkbox">
                    <label>
                        <input
                            type="checkbox"
                            id="notificationEmail"
                            name="notification_email"
                            checked={settings.notification_email === 1}
                            onChange={handleChange}
                            disabled={settings.notification_enabled !== 1}
                        />
                        <span>이메일 알림</span>
                    </label>
                </div>

                <div className="settings-field settings-field-checkbox">
                    <label>
                        <input
                            type="checkbox"
                            id="notificationSms"
                            name="notification_sms"
                            checked={settings.notification_sms === 1}
                            onChange={handleChange}
                            disabled={settings.notification_enabled !== 1}
                        />
                        <span>SMS 알림</span>
                    </label>
                </div>
            </section>

            {/* 모듈별 초기 화면 설정 */}
            {/* <section className="settings-section">
                <h3>모듈별 초기 화면 설정</h3>
                
                <div className="module-settings-group">
                    <h4>CT</h4>
                    <div className="module-settings-grid">
                        <div>
                            <label>의뢰</label>
                            <select
                                id="ctRequestAction"
                                name="ct_request_action"
                                value={settings.module_default_settings?.ct?.request?.action || 'read'}
                                onChange={(e) => handleModuleChange('ct', 'request', e.target.value)}
                            >
                                {ctRequestOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>시험성적서</label>
                            <select
                                id="ctTestReportAction"
                                name="ct_test_report_action"
                                value={settings.module_default_settings?.ct?.testReport?.action || 'read'}
                                onChange={(e) => handleModuleChange('ct', 'testReport', e.target.value)}
                            >
                                {ctTestReportOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>일정 현황</label>
                            <select
                                id="ctScheduleAction"
                                name="ct_schedule_action"
                                value={settings.module_default_settings?.ct?.schedule?.action || 'ct'}
                                onChange={(e) => handleModuleChange('ct', 'schedule', e.target.value)}
                            >
                                {ctScheduleOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="module-settings-group">
                    <h4>내부 분석</h4>
                    <div className="module-settings-grid">
                        <div>
                            <label>의뢰</label>
                            <select
                                id="internalRequestAction"
                                name="internal_request_action"
                                value={settings.module_default_settings?.internal?.request?.action || 'read'}
                                onChange={(e) => handleModuleChange('internal', 'request', e.target.value)}
                            >
                                {internalRequestOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>시험성적서</label>
                            <select
                                id="internalTestReportAction"
                                name="internal_test_report_action"
                                value={settings.module_default_settings?.internal?.testReport?.action || 'read'}
                                onChange={(e) => handleModuleChange('internal', 'testReport', e.target.value)}
                            >
                                {internalTestReportOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>일정 현황</label>
                            <select
                                id="internalScheduleAction"
                                name="internal_schedule_action"
                                value={settings.module_default_settings?.internal?.schedule?.action || 'internal'}
                                onChange={(e) => handleModuleChange('internal', 'schedule', e.target.value)}
                            >
                                {internalScheduleOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="module-settings-group">
                    <h4>외부 분석</h4>
                    <div className="module-settings-grid">
                        <div>
                            <label>의뢰</label>
                            <select
                                id="externalRequestAction"
                                name="external_request_action"
                                value={settings.module_default_settings?.external?.request?.action || 'read'}
                                onChange={(e) => handleModuleChange('external', 'request', e.target.value)}
                            >
                                {externalRequestOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>시험성적서</label>
                            <select
                                id="externalTestReportAction"
                                name="external_test_report_action"
                                value={settings.module_default_settings?.external?.testReport?.action || 'read'}
                                onChange={(e) => handleModuleChange('external', 'testReport', e.target.value)}
                            >
                                {externalTestReportOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>일정 현황</label>
                            <select
                                id="externalScheduleAction"
                                name="external_schedule_action"
                                value={settings.module_default_settings?.external?.schedule?.action || 'external'}
                                onChange={(e) => handleModuleChange('external', 'schedule', e.target.value)}
                            >
                                {externalScheduleOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="module-settings-group">
                    <h4>방부력 테스트</h4>
                    <div className="module-settings-grid">
                        <div>
                            <label>의뢰</label>
                            <select
                                id="preservativeRequestAction"
                                name="preservative_request_action"
                                value={settings.module_default_settings?.preservative?.request?.action || 'read'}
                                onChange={(e) => handleModuleChange('preservative', 'request', e.target.value)}
                            >
                                {preservativeRequestOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>시험성적서</label>
                            <select
                                id="preservativeTestReportAction"
                                name="preservative_test_report_action"
                                value={settings.module_default_settings?.preservative?.testReport?.action || 'read'}
                                onChange={(e) => handleModuleChange('preservative', 'testReport', e.target.value)}
                            >
                                {preservativeTestReportOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>일정 현황</label>
                            <select
                                id="preservativeScheduleAction"
                                name="preservative_schedule_action"
                                value={settings.module_default_settings?.preservative?.schedule?.action || 'preservative'}
                                onChange={(e) => handleModuleChange('preservative', 'schedule', e.target.value)}
                            >
                                {preservativeScheduleOptions.map(option => (
                                    <option key={option.idx} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* 버튼 영역 */}
            <div className="settings-button-area">
                <button
                    className="settings-btn-restore btn-secondary"
                    onClick={handleRestore}
                    disabled={isSaving}
                >
                    기본값 복원
                </button>
                <button
                    className="settings-btn-save btn-success"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '저장'}
                </button>
            </div>
        </div>
    );
}
