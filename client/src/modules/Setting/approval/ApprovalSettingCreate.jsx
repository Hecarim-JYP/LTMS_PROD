/**
 * 파일명 : ApprovalSettingCreate.jsx
 * 용도 : 결재선 템플릿 등록/수정 (고급 기능 포함)
 * 최초등록 : 2026-02-03 [박진영]
 * 수정일자 : 2026-02-11 [박진영]
 * 수정사항 : 고급 결재 기능 추가 (병렬결재, 합의/참조, 조건부 결재)
 */

import { useState, useEffect, useContext } from "react";
import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";
import axios from "axios";

import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils.jsx";

import ApprovalSettingSubNav from "/src/modules/Setting/approval/ApprovalSettingSubNav";

export default function ApprovalSettingCreate() {

    const urlQuery = useUrlInfo().query; // 커스텀 훅 - URL 정보 관리
    const approvalTemplateId = urlQuery.approval_template_id || ""; // CT 의뢰 ID (수정 모드일 경우 URL 파라미터로 전달됨)
    const isEditMode = urlQuery.mode === "update" ? "update" : "create"; // 화면 모드 (create / update)
    const goToPage = useUrlNavigation();
    const documentTypeFromUrl = urlQuery.document_type || "CT_REQ"; // URL 파라미터로 전달된 문서 유형 (등록 모드일 경우 기본값: CT_REQ)

    /**
     * 사용자 정보 컨텍스트
     */
    const { user } = useContext(AuthContext);
    const companyId = user.company_id; // 회사 ID

    /* ============================== 상태 관리 ============================== */
    // 결재 템플릿 정보 (객체로 관리)
    const [templateInfo, setTemplateInfo] = useState({
        template_name: "",
        description: "",
        is_default: false
    });

    // 결재선 목록 (배열로 관리)
    const [approvalLines, setApprovalLines] = useState([]);

    // 사용자 직급 데이터
    const [userGrades, setUserGrades] = useState([{
        idx: "", // 10진수 정수로 변환
        user_grade_id: "",
        grade_name: "",
        grade_level: "",
        is_active: "",
        sort_order: "",
        from_db: ""
    }]);


    // 부서 데이터
    const [departments, setDepartments] = useState([{
        idx: "", // 10진수 정수로 변환
        department_id: "",
        company_code: "",
        company_name: "",
        division_code: "",
        division_name: "",
        team_code: "",
        team_name: "",
        part_code: "",
        part_name: "",
        is_active: "",
        sort_order: "",
        from_db: "N"
    }]);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState(documentTypeFromUrl); // 선택한 문서 유형
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false); // 고급 설정 표시 여부
    const [showGuide, setShowGuide] = useState(false); // 사용 가이드 표시 여부

    // 문서 유형 목록 (DB에서 조회)
    const [documentTypes, setDocumentTypes] = useState([
        {
            idx: 999,
            approval_document_type_id: "",
            document_type_code: "",
            document_type_name: "전체",
            module_name: "",
            is_active: "",
            sort_order: "",
            from_db: ""
        },
    ]);


    /* ============================== API 호출 ============================== */
    /**
     * fetchDocumentTypes : 문서 유형 목록 조회 (approval_document_type 테이블)
     */
    const fetchDocumentTypes = async () => {
        try {
            const params = { 
                company_id: companyId,
                is_setting: 1
            };
            
            const response = await axios.get("/api/ltms/setting/approval/document-type", { params });
            const documentTypes = response.data.data.result || [];
            setDocumentTypes(documentTypes);
        } catch (err) {
            console.error("문서 유형 조회 실패:", err);
            
            const defaultDocumentTypes = [
                {
                    idx: 999,
                    approval_document_type_id: "",
                    document_type_code: "",
                    document_type_name: "전체",
                    module_name: "",
                    is_active: "",
                    sort_order: "",
                    from_db: ""
                },
            ];

            // 실패 시 기본값 사용
            setDocumentTypes(defaultDocumentTypes);
        }
    };


    /**
     * getApprovalTemplatesWithLines : 결재선 템플릿 및 결재선 목록 조회
     */
    const getApprovalTemplatesWithLines = async (templateId) => {
        try {
            setLoading(true);
            const params = { 
                company_id: companyId,
                approval_template_id: templateId
            };
            
            const response = await axios.get("/api/ltms/setting/approval/template-with-lines", { params });
            const result = response.data.data.result;
            
            // 데이터 구조: { template: {...}, lines: [...] }
            if (!result || !result.template) {
                alert("템플릿 정보를 찾을 수 없습니다.");
                return;
            }
            
            const template = result.template;
            const lines = result.lines || [];
            
            // 템플릿 정보 설정 (객체로 한번에 설정)
            setSelectedDocType(template.document_type);
            setTemplateInfo({
                template_name: template.template_name || "",
                description: template.description || "",
                is_default: template.is_default === 1
            });
            
            // 결재선 목록 설정 (step 기준 정렬)
            const sortedLines = lines.sort((a, b) => a.step - b.step);
            setApprovalLines(sortedLines);
            
            // 고급 설정 표시 여부 결정 (병렬 결재가 하나라도 있으면 true)
            for(let i = 0; i < sortedLines.length; i++) {
                const line = sortedLines[i];
                if(line.is_parallel === 1) {
                    setShowAdvancedSettings(true);
                    break;
                }
            }

        } catch (err) {
            console.error("결재선 템플릿 조회 실패:", err);
            const errMsg = err.response?.data?.message || "결재선 템플릿 조회에 실패했습니다.";
            alert(errMsg);
        } finally {
            setLoading(false);
        }
    };


    /**
     * getUserGrades : 직급 목록 조회
     */
    const getUserGrades = async () => {
        try {

            const params = {
                company_id: companyId
            };

            const response = await axios.get("/api/ltms/setting/options/user-grade", { params });
            const result = response.data.data.result || [];
            const userGrades = result;
            setUserGrades(userGrades);
        } catch (err) {
            console.error("직급 목록 조회 실패:", err);
            const errMsg = err.response?.data?.message || "직급 목록 조회에 실패했습니다.";
            alert(errMsg);
            setUserGrades([]);
        }
    };


    /**
     * getDepartments : 부서 목록 조회
     */
    const getDepartments = async () => {
        try {

            const params = {
                company_id: companyId,
                is_setting: 0
            };

            const response = await axios.get("/api/ltms/setting/options/department", { params });
            const result = response.data.data.result || [];

            // team_code 기준 중복 제거 (part_code가 null인 팀 레벨 데이터 우선 선택)
            const uniqueDepartments = Array.from(
                result.reduce((map, dept) => {
                    const teamCode = dept.team_code;
                    if (!map.has(teamCode)) {
                        // 처음 나온 team_code면 추가
                        map.set(teamCode, dept);
                    } 
                    return map;
                }, new Map()).values()
            );

            const researchDepartments = uniqueDepartments.filter(dept => dept.team_name.includes("연구"));

            setDepartments(researchDepartments);
            setApprovalLines(prevLines => prevLines.map(line => ({
                ...line,
                team_code: line.team_code || (researchDepartments[0]?.team_code || null)
            })));
        } catch (err) {
            console.error("부서 목록 조회 실패:", err);
            const errMsg = err.response?.data?.message || "부서 목록 조회에 실패했습니다.";
            alert(errMsg);
            setDepartments([]);
        }
    };


    /**
     * getUsers : 사용자 목록 조회
     */
    const getUsers = async () => {
        try {

            const params = { company_id: companyId };
            const response = await axios.get("/api/ltms/auth/users", { params });
            const result = response.data.data.result || [];
            const users = result;
            setUsers(users);
        } catch (err) {
            console.error("사용자 목록 조회 실패:", err);
            const errMsg = err.response?.data?.message || "사용자 목록 조회에 실패했습니다.";
            alert(errMsg);
            setUsers([]);
        }
    };


    useEffect(() => {
        fetchDocumentTypes();
        getUserGrades();
        getDepartments();
        getUsers();
    }, []);


    useEffect(() => {
        if (isEditMode === "update") {
            // 수정 모드: 기존 템플릿 로드
            if (approvalTemplateId) {
                getApprovalTemplatesWithLines(approvalTemplateId);
            }
        } else {
            // 등록 모드: 첫 번째 단계를 자동으로 추가
            const initialTemplate = {
                approval_line_template_id: null,
                company_id: companyId,
                document_type: selectedDocType || "CT_REQ",
                step: 1,
                user_grade_id: 1,
                department_id: null,
                team_code: departments[0]?.team_code || null,
                approver_id: null,
                approval_type: "APPROVE",
                is_parallel: 0,
                parallel_group_id: null,
                parallel_approval_rule: "ALL",
                condition_type: null,
                condition_value: null,
                is_active: 1,
                sort_order: 1,
                isNew: true
            };
            setApprovalLines([initialTemplate]);
        }
    }, [isEditMode, approvalTemplateId, selectedDocType, departments]);


    /* ============================== 이벤트 핸들러 ============================== */
    /**
     * handleTemplateInfoChange : 템플릿 정보 필드 변경
     */
    const handleTemplateInfoChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === "checkbox" ? checked : value;
        setTemplateInfo({...templateInfo, [name]: fieldValue});
    };

    /**
     * handleIsDefaultChange : 기본 템플릿 설정 변경
     * - 기본 템플릿으로 설정 시, 같은 문서 유형의 다른 템플릿들은 기본 해제
     */
    const handleIsDefaultChange = async (e) => {

        const { checked } = e.target;

        if (checked) {
            // 기본 템플릿으로 설정
            let confirmMsg = `이 템플릿을 기본 템플릿으로 설정하시겠습니까?\n`
            confirmMsg += `문서 유형(${selectedDocType})의 다른 기본 템플릿은 해제됩니다.`;
            
            if (confirm(confirmMsg)) {
                try {
                    // API 호출: 같은 문서 유형의 다른 템플릿들 기본 해제
                    const params = {
                        company_id: companyId,
                        document_type: selectedDocType,
                        approval_template_id: approvalTemplateId,
                        user_id: user.user_id
                    };
                    
                    const response = await axios.post("/api/ltms/setting/approval/template/set-default", params);

                    // 상태 업데이트
                    if (response.data.success) {
                        const msg = "기본 템플릿으로 설정되었습니다.";
                        alert(msg);
                        setTemplateInfo({...templateInfo, is_default: true});
                    };
                    
                } catch (err) {
                    console.error("기본 템플릿 설정 실패:", err);
                    const errMsg = err.response?.data?.message || "기본 템플릿 설정에 실패했습니다.";
                    alert(`기본 템플릿 설정 실패\n${errMsg}`);
                }
            }
        } else {
            // 기본 템플릿 해제
            setTemplateInfo({...templateInfo, is_default: false});
        }
    };

    /**
     * handleDocTypeChange : 문서 유형 변경
     */
    const handleDocTypeChange = (e) => {
        if (confirm("문서 유형을 변경하시겠습니까? 입력한 내용이 초기화됩니다.")) {
            setSelectedDocType(e.target.value);
            setApprovalLines([]);
            // 템플릿 정보 초기화
            setTemplateInfo({
                template_name: "",
                description: "",
                is_default: false
            });
        }
    };


    /**
     * handleAddRow : 결재선 행 추가
     */
    const handleAddRow = () => {
        const newStep = approvalLines.length > 0 
            ? Math.max(...approvalLines.map(t => t.step)) + 1 
            : 1;
        
        const newTemplate = {
            approval_line_template_id: null, // 신규는 null
            company_id: companyId,
            document_type: selectedDocType,
            step: newStep,
            user_grade_id: 1,
            department_id: null,
            team_code: departments[0]?.team_code || null,
            approver_id: null,
            approval_type: "APPROVE", // 기본값: 결재
            is_parallel: 0, // 기본값: 순차
            parallel_group_id: null,
            parallel_approval_rule: "ALL", // 기본값: 전원 승인
            condition_type: null,
            condition_value: null,
            is_active: 1,
            sort_order: newStep,
            isNew: true // 신규 행 표시
        };
        
        setApprovalLines([...approvalLines, newTemplate]);
    };


    /**
     * handleAddParallelRow : 병렬 결재선 추가 (같은 단계에 여러 명)
     */
    const handleAddParallelRow = (step, lineIndex) => {
        const sameStepLines = approvalLines.filter(t => t.step === step);
        
        // 같은 단계의 첫 번째 결재선에서 설정 상속
        const firstLineInStep = sameStepLines[0];
        
        // 이미 병렬 그룹이 있으면 같은 그룹 ID 사용, 없으면 새로 생성
        let parallelGroupId = sameStepLines.find(t => t.parallel_group_id)?.parallel_group_id;
        const parallelRule = firstLineInStep.parallel_approval_rule || "ALL";
        const conditionType = firstLineInStep.condition_type || null;
        const conditionValue = firstLineInStep.condition_value || null;
        
        if (!parallelGroupId) {
            parallelGroupId = `parallel_${selectedDocType}_step${step}_${lineIndex}`;
            // 기존 행들도 병렬로 변경
            const updated = approvalLines.map(t => {
                if (t.step === step) {
                    return {
                        ...t,
                        is_parallel: 1,
                        parallel_group_id: parallelGroupId,
                        parallel_approval_rule: parallelRule,
                        isModified: true
                    };
                }
                return t;
            });
            setApprovalLines(updated);
        }
        
        const newTemplate = {
            approval_line_template_id: null,
            company_id: companyId,
            document_type: selectedDocType,
            step: step,
            user_grade_id: 1,
            department_id: null,
            team_code: departments[0]?.team_code || null,
            approver_id: null,
            approval_type: "APPROVE",
            is_parallel: 1,
            parallel_group_id: parallelGroupId,
            parallel_approval_rule: parallelRule,  // 같은 단계의 규칙 상속
            condition_type: conditionType,          // 같은 단계의 조건 타입 상속
            condition_value: conditionValue,        // 같은 단계의 조건 값 상속
            is_active: 1,
            sort_order: step,
            isNew: true
        };
        
        setApprovalLines([...approvalLines, newTemplate]);
    };


    /**
     * handleDeleteRow : 결재선 행 삭제
     */
    const handleDeleteRow = (index) => {
        if (confirm("해당 결재 단계를 삭제하시겠습니까?")) {
            const newTemplates = approvalLines.filter((_, i) => i !== index);
            // step 재정렬
            const reordered = newTemplates.map((t, i) => ({
                ...t,
                step: i + 1,
                sort_order: i + 1
            }));
            setApprovalLines(reordered);
        }
    };


    /**
     * handleRowChange : 결재선 행 값 변경
     * @param {number} index - 변경할 행의 인덱스
     * @param {string|object} field - 변경할 필드명 또는 필드 객체
     * @param {*} value - 변경할 값 (field가 문자열일 때만 사용)
     */
    const handleRowChange = (index, field, value) => {
        const newTemplates = [...approvalLines];
        
        // field가 객체인 경우: 여러 필드 동시 업데이트
        if (typeof field === 'object' && field !== null) {
            newTemplates[index] = {
                ...newTemplates[index],
                ...field,
                isModified: true
            };
        } else {
            // field가 문자열인 경우: 단일 필드 업데이트
            newTemplates[index] = {
                ...newTemplates[index],
                [field]: value,
                isModified: true
            };
        }
        
        setApprovalLines(newTemplates);
    };


    /**
     * checkGradeMismatch : 결재자 지정 시 직급 불일치 여부 확인
     * @param {*} e : 결재자 select 요소의 change 이벤트 객체
     * @param {number} rowIndex : 결재선 행 인덱스
     * @param {*} selectedUserGradeId : 필요 직급의 user_grade_id
     */
    const checkGradeMismatch = (e, rowIndex, selectedUserGradeId) => {
        // 필요 직급 정보를 userGrades 배열에서 찾기
        const requiredGrade = userGrades.find(g => g.user_grade_id == selectedUserGradeId);
        const requiredGradeLevel = Utils.toNumberOrNull(requiredGrade?.grade_level);
        
        // 선택한 결재자의 직급 레벨 (option의 data-grade_level)
        const selectedOption = e.target.selectedOptions[0];
        const selectedGradeLevel = Utils.toNumberOrNull(selectedOption?.dataset?.grade_level);
        
        // 필요 직급 레벨이 선택한 결재자 직급 레벨보다 높으면 (숫자가 작으면) 경고
        if (requiredGradeLevel > selectedGradeLevel) {
            let msg = `선택한 결재자의 직급이 해당 단계의 필요 직급보다 낮습니다.\n결재자를 다시 선택해주세요.`;
            msg += `\n[필요 직급]: ${requiredGrade?.grade_name}`;
            msg += `\n[현재 결재자]: ${selectedOption?.label}`;
            alert(msg);
            // 결재자 선택 초기화            
            handleRowChange(rowIndex, "approver_id", null);
        }
    };


    /**
     * handleMoveUp : 결재선 행 위로 이동
     */
    const handleMoveUp = (index) => {
        if (index === 0) return;
        
        const newTemplates = [...approvalLines];
        [newTemplates[index], newTemplates[index - 1]] = 
        [newTemplates[index - 1], newTemplates[index]];
        
        // step 재정렬
        const reordered = newTemplates.map((t, i) => ({
            ...t,
            step: i + 1,
            sort_order: i + 1,
            isModified: true
        }));
        
        setApprovalLines(reordered);
    };


    /**
     * handleMoveDown : 결재선 행 아래로 이동
     */
    const handleMoveDown = (index) => {
        if (index === approvalLines.length - 1) return;
        
        const newTemplates = [...approvalLines];
        [newTemplates[index], newTemplates[index + 1]] = 
        [newTemplates[index + 1], newTemplates[index]];
        
        // step 재정렬
        const reordered = newTemplates.map((t, i) => ({
            ...t,
            step: i + 1,
            sort_order: i + 1,
            isModified: true
        }));
        
        setApprovalLines(reordered);
    };


    /**
     * handleToggleParallel : 병렬 결재 여부 토글 (같은 단계 전체 적용)
     * @param {boolean} checked - 체크박스 체크 여부
     * @param {number} currentStep - 현재 단계
     * @param {string} currentGroupId - 현재 병렬 그룹 ID
     * @param {number} rowIndex - 현재 행의 인덱스
     */
    const handleToggleParallel = (checked, currentStep, currentGroupId, rowIndex) => {
        if (checked) {
            // 병렬 켜기: 같은 단계의 모든 결재선에 적용
            const groupId = currentGroupId || `parallel_${selectedDocType}_step${currentStep}_${rowIndex}`;
            const updatedLines = approvalLines.map(line => {
                if (line.step === currentStep) {
                    return {
                        ...line,
                        is_parallel: 1,
                        parallel_group_id: groupId,
                        parallel_approval_rule: line.parallel_approval_rule || "ALL",
                        isModified: true
                    };
                }
                return line;
            });
            setApprovalLines(updatedLines);
        } else {
            // 병렬 끄기: 같은 단계의 결재선 처리
            const sameStepLines = approvalLines.filter(line => line.step === currentStep);
            
            if (sameStepLines.length > 1) {
                // 같은 단계에 여러 결재선이 있는 경우
                const confirmMsg = 
                    `이 결재선은 병렬 결재로 설정되어 있습니다.\n` +
                    `[확인]: 이 결재선을 제거하고 나머지 결재선은 유지합니다.\n` +
                    `[취소]: 병렬 결재 상태를 유지합니다.\n` +
                    `계속하시겠습니까?`;
                
                if (confirm(confirmMsg)) {
                    // 확인: 해당 결재선 제거
                    const updatedLines = approvalLines.filter((_, index) => index !== rowIndex);
                    
                    // 제거 후 같은 단계에 1개만 남으면 병렬 해제
                    const remainingSameStepLines = updatedLines.filter(line => line.step === currentStep);
                    if (remainingSameStepLines.length === 1) {
                        const finalLines = updatedLines.map(line => {
                            if (line.step === currentStep) {
                                return {
                                    ...line,
                                    is_parallel: 0,
                                    parallel_group_id: null,
                                    isModified: true
                                };
                            }
                            return line;
                        });
                        setApprovalLines(finalLines);
                    } else {
                        setApprovalLines(updatedLines);
                    }
                }
                // 취소: 아무 작업 안함 (return)
            } else {
                // 같은 단계에 1개만 있는 경우: 그냥 병렬 해제
                const updatedLines = approvalLines.map(line => {
                    if (line.step === currentStep) {
                        return {
                            ...line,
                            is_parallel: 0,
                            parallel_group_id: null,
                            isModified: true
                        };
                    }
                    return line;
                });
                setApprovalLines(updatedLines);
            }
        }
    };


    /**
     * handleParallelRuleChange : 병렬 규칙 변경 (같은 단계 전체 적용)
     * @param {string} newRule - 새로운 병렬 규칙 (ALL/ANY/MAJORITY)
     * @param {number} currentStep - 현재 단계
     */
    const handleParallelRuleChange = (newRule, currentStep) => {
        const updatedLines = approvalLines.map(line => {
            if (line.step === currentStep && line.is_parallel === 1) {
                return { ...line, parallel_approval_rule: newRule, isModified: true };
            }
            return line;
        });
        setApprovalLines(updatedLines);
    };


    /**
     * handleConditionTypeChange : 조건부 결재 타입 변경 (같은 단계 전체 적용)
     * @param {string} newConditionType - 새로운 조건 타입 (AMOUNT/PRIORITY/CUSTOM 또는 null)
     * @param {number} currentStep - 현재 단계
     */
    const handleConditionTypeChange = (newConditionType, currentStep) => {
        const updatedLines = approvalLines.map(line => {
            if (line.step === currentStep) {
                return {
                    ...line,
                    condition_type: newConditionType,
                    // 조건 타입이 없어지면 조건 값도 초기화
                    condition_value: newConditionType ? line.condition_value : null,
                    isModified: true
                };
            }
            return line;
        });
        setApprovalLines(updatedLines);
    };


    /**
     * handleConditionValueChange : 조건 값 변경 (같은 단계 전체 적용)
     * @param {string} newConditionValue - 새로운 조건 값
     * @param {number} currentStep - 현재 단계
     */
    const handleConditionValueChange = (newConditionValue, currentStep) => {
        const updatedLines = approvalLines.map(line => {
            if (line.step === currentStep) {
                return { ...line, condition_value: newConditionValue, isModified: true };
            }
            return line;
        });
        setApprovalLines(updatedLines);
    };


    /**
     * save : 결재선 템플릿 저장
     */
    const save = async () => {

        if(Utils.toStringOrEmpty(templateInfo.template_name) === "") {
            alert("템플릿 이름을 입력해주세요.");
            return;
        }

        // 유효성 검증
        if (approvalLines.length === 0) {
            alert("결재 단계를 하나 이상 추가해주세요.");
            return;
        }

        for (let i = 0; i < approvalLines.length; i++) {
            const t = approvalLines[i];
            if (!t.user_grade_id) {
                alert(`${i + 1}번째 결재 단계의 직급을 선택해주세요.`);
                return;
            }
            
            if (!t.team_code) {
                alert(`${i + 1}번째 결재 단계의 부서를 선택해주세요.`);
                return;
            }

            // 병렬 결재 유효성 검증
            if (t.is_parallel === 1) {
                const sameStepLines = approvalLines.filter(line => line.step === t.step);
                if (sameStepLines.length < 2) {
                    alert(`${t.step}단계는 병렬 결재로 설정되어 있으나 결재자가 1명입니다.\n병렬 결재는 2명 이상이어야 합니다.`);
                    return;
                }
                
                // 같은 단계의 병렬 규칙이 모두 동일한지 확인
                const rules = sameStepLines.map(line => line.parallel_approval_rule);
                const uniqueRules = [...new Set(rules)];
                if (uniqueRules.length > 1) {
                    alert(`${t.step}단계의 병렬 결재 규칙이 일치하지 않습니다.\n같은 단계의 모든 결재선은 동일한 병렬 규칙을 따라야 합니다.\n현재 규칙: ${uniqueRules.join(', ')}`);
                    return;
                }
            }

            // 조건부 결재 유효성 검증
            if (t.condition_type && !t.condition_value) {
                alert(`${i + 1}번째 결재 단계의 조건 값을 입력해주세요.`);
                return;
            }
        }
        
        // 같은 단계의 조건부 결재가 모두 동일한지 확인
        const stepsWithCondition = [...new Set(approvalLines.filter(t => t.condition_type).map(t => t.step))];
        for (const step of stepsWithCondition) {
            const sameStepLines = approvalLines.filter(line => line.step === step);
            const conditionTypes = [...new Set(sameStepLines.map(line => line.condition_type))];
            const conditionValues = [...new Set(sameStepLines.map(line => line.condition_value))];
            
            if (conditionTypes.length > 1 || conditionValues.length > 1) {
                alert(`${step}단계의 조건부 결재 설정이 일치하지 않습니다.\n같은 단계의 모든 결재선은 동일한 조건을 가져야 합니다.`);
                return;
            }
        }

        if (confirm("저장하시겠습니까?")) {
            try {
                // 템플릿 및 결재선 통합 저장 (UPSERT)
                const saveParams = {
                    company_id: Utils.toNumberOrNull(companyId),
                    approval_template_id: isEditMode === "update" ? Utils.toNumberOrNull(approvalTemplateId) : null,
                    template_name: Utils.toStringOrEmpty(templateInfo.template_name),
                    document_type: Utils.toStringOrEmpty(selectedDocType),
                    description: Utils.toStringOrEmpty(templateInfo.description),
                    is_default: Utils.toBooleanInt(templateInfo.is_default),
                    is_active: 1,
                    user_id: Utils.toNumberOrNull(user.user_id),
                    templateList: approvalLines.map(t => ({
                        step: Utils.toNumberOrNull(t.step),
                        user_grade_id: Utils.toNumberOrNull(t.user_grade_id),
                        department_id: Utils.toNumberOrNull(t.department_id),
                        team_code: Utils.toStringOrEmpty(t.team_code),
                        approver_id: Utils.toNumberOrNull(t.approver_id),
                        approval_type: Utils.toStringOrEmpty(t.approval_type) || "APPROVE",
                        is_parallel: Utils.toBooleanInt(t.is_parallel),
                        parallel_group_id: Utils.toNumberOrNull(t.parallel_group_id),
                        parallel_approval_rule: Utils.toStringOrEmpty(t.parallel_approval_rule) || "ALL",
                        condition_type: Utils.toStringOrEmpty(t.condition_type),
                        condition_value: Utils.toStringOrEmpty(t.condition_value),
                        is_active: Utils.toBooleanInt(t.is_active),
                        sort_order: Utils.toNumberOrNull(t.sort_order)
                    }))
                };
                
                // 결재 템플릿 및 결재선 일괄 저장
                await axios.post("/api/ltms/setting/approval/template/lines", saveParams);
                alert("저장되었습니다.");
                goToPage("/setting/approval/read", {});
            } catch (err) {
                console.error(err);
                const errMsg = err.response?.data?.message || "저장 중 오류가 발생했습니다.";
                alert(`저장에 실패했습니다.\n${errMsg}`);
            }
        }
    };

    /**
     * cancel : 취소
     */
    const cancel = () => {
        if (confirm("작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.")) {
            goToPage("/setting/approval/read", {});
        }
    };
    
    /**
     * 단계별 그룹화 (병렬 결재 표시용)
     * 
     * 목적: approvalLines 배열을 step(단계) 기준으로 그룹화
     * 
     * 예시 입력:
     *   approvalLines = [
     *     { step: 1, user_grade_id: 4, department_id: 2, team_code: "A1", ... },  // 1단계
     *     { step: 2, user_grade_id: 1, department_id: 3, team_code: "B2", ... },  // 2단계
     *     { step: 2, user_grade_id: 5, department_id: 3, team_code: "B2", ... },  // 2단계 (병렬)
     *     { step: 3, user_grade_id: 11, department_id: 4, team_code: "C3", ... }  // 3단계
     *   ]
     * 
     * 출력 결과:
     *   groupedByStep = {
     *     "1": [{ step: 1, user_grade_id: 4, ... }],
     *     "2": [
     *       { step: 2, user_grade_id: 1, ... },
     *       { step: 2, user_grade_id: 5, ... }
     *     ],
     *     "3": [{ step: 3, user_grade_id: 11, ... }]
     *   }
     * 
     * reduce 동작 설명:
     *   - acc (accumulator): 누적 객체, 처음엔 빈 객체 {}로 시작
     *   - template: 배열의 각 요소 (결재선 1개)
     *   
     *   반복마다 실행:
     *     1. if (!acc[template.step]): 해당 단계가 처음 나온 경우
     *        → acc[template.step] = [] 로 빈 배열 생성
     *     2. acc[template.step].push(template): 해당 단계 배열에 현재 결재선 추가
     *     3. return acc: 업데이트된 누적 객체 반환
     * 
     * 활용: 같은 단계에 여러 결재선이 있으면 병렬 결재로 표시
     */
    const groupedByStep = approvalLines.reduce((acc, template) => {
        // 해당 단계(step)가 처음 등장하면 빈 배열 생성
        if (!acc[template.step]) {
            acc[template.step] = [];
        }
        // 해당 단계 배열에 현재 결재선 추가
        acc[template.step].push(template);
        // 업데이트된 누적 객체 반환 (다음 반복에서 사용됨)
        return acc;
    }, {}); // 초기값: 빈 객체


    /* ============================== 렌더링 ============================== */

    return (
        <div className="setting-box">
            <div className="page-top">
                <h1 className="user-custom-option-title">
                    결재선 템플릿 {isEditMode === "update" ? "수정" : "등록"}
                </h1>
            </div>

            <ApprovalSettingSubNav />

            <div className="setting-section">
                <div className="auth-setting-split-layout">
                    <div className="settings-section auth-setting-section-flex">
                        
                        {/* 결재 템플릿 정보 입력 */}
                        <div className="approval-template-info-section">
                            <h3 className="approval-section-title">📋 결재 템플릿 정보</h3>
                            
                            <div className="approval-template-info-form">
                                {/* 문서 유형 */}
                                <div className="approval-form-row">
                                    <label className="approval-form-label">📄 문서 유형 <span className="required-mark">*</span></label>
                                    <select 
                                        value={selectedDocType} 
                                        onChange={handleDocTypeChange}
                                        className="approval-form-input"
                                        disabled={isEditMode === "update"} // 수정 모드에서는 문서 유형 변경 불가
                                    >
                                        {documentTypes.map((dt) => (
                                            <option key={dt.idx} value={dt.document_type_code}>
                                                {dt.document_type_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* 템플릿명 */}
                                <div className="approval-form-row">
                                    <label className="approval-form-label">📝 템플릿명 <span className="required-mark">*</span></label>
                                    <input
                                        type="text"
                                        name="template_name"
                                        value={templateInfo.template_name}
                                        onChange={handleTemplateInfoChange}
                                        placeholder="예: CT 의뢰 기본 결재선"
                                        className="approval-form-input"
                                        maxLength={100}
                                    />
                                </div>
                                
                                {/* 설명 */}
                                <div className="approval-form-row">
                                    <label className="approval-form-label">📄 설명</label>
                                    <textarea
                                        name="description"
                                        value={templateInfo.description}
                                        onChange={handleTemplateInfoChange}
                                        placeholder="Ex...) CT 의뢰 문서의 기본 결재 양식입니다. (작성자 → 수석 → 이사)"
                                        className="approval-form-textarea"
                                        rows={3}
                                        maxLength={500}
                                    />
                                </div>
                                
                                {/* 기본 템플릿 설정 - 수정하는 경우에만 보이도록*/}
                                {isEditMode === "update" && (
                                <div className="approval-form-row approval-form-row-checkbox">
                                    <label className="approval-form-label-checkbox">
                                        <input
                                            type="checkbox"
                                            name="is_default"
                                            checked={templateInfo.is_default}
                                            onChange={handleIsDefaultChange}
                                            className="approval-form-checkbox"
                                        />
                                        <span className="approval-checkbox-text">⭐ 기본 템플릿으로 설정</span>
                                    </label>
                                    <span className="approval-form-hint">
                                        ( * 기본 템플릿은 해당 문서 작성 시 자동으로 적용됩니다. )
                                    </span>
                                </div>
                                )}

                                <div className="approval-form-row">
                                    <button 
                                        onClick={() => setShowGuide(!showGuide)}
                                        className="btn-toggle-guide btn-info"
                                        style={{ width : "100px" }}
                                        title={showGuide ? "가이드 숨기기" : "가이드 보기"}
                                    >
                                        {showGuide ? "📖 가이드 숨기기" : "📖 가이드 보기"}
                                    </button>
                                </div>

                                {/* 안내 문구 */}
                                {showGuide && (
                                <div className="approval-info-box">
                                    <p className="approval-info-box-title">
                                        <strong>📌 사용 가이드:</strong>
                                    </p>
                                    
                                    <div className="approval-info-box-highlight">
                                        <strong>💡 시작 방법:</strong>
                                        <ul>
                                            <li>등록 모드에서는 <strong>1단계가 자동으로 추가</strong>됩니다</li>
                                            <li><strong>"➕ 다음 단계 추가"</strong> 버튼으로 2단계, 3단계... 추가</li>
                                            <li>고급 기능이 필요하면 <strong>"⚙️ 고급 설정"</strong> 버튼 클릭</li>
                                        </ul>
                                    </div>

                                    <div className="approval-info-box-section">
                                        <strong>🔹 기본 설정</strong>
                                        <ul>
                                            <li><strong>결재 유형:</strong> 결재(필수), 합의(의견만), 참조(알림만) 중 선택</li>
                                            <li><strong>필요 직급:</strong> 해당 단계를 처리할 직급 선택 (필수)</li>
                                            <li><strong>결재자:</strong> 특정인을 미리 지정 가능 (선택사항)</li>
                                            <li><strong>활성 여부:</strong> 체크 해제 시 해당 단계 비활성화</li>
                                        </ul>
                                    </div>

                                    {showAdvancedSettings && (
                                        <div className="approval-info-box-section">
                                            <strong>🔹 고급 설정</strong>
                                            <ul>
                                                <li><strong>병렬 결재:</strong> 같은 단계에 여러 명이 동시 결재
                                                    <ul>
                                                        <li>전원 승인: 모두 승인해야 다음 단계</li>
                                                        <li>1명만 승인: 한 명만 승인하면 통과</li>
                                                        <li>과반수 승인: 과반수가 승인하면 통과</li>
                                                    </ul>
                                                </li>
                                                <li><strong>조건부 결재:</strong> 금액, 우선순위 등 조건에 따라 결재선 변경
                                                    <ul>
                                                        <li>금액별: {"{ \"min\": 0, \"max\": 1000000 }"}</li>
                                                        <li>우선순위별: {"{ \"priority\": \"HIGH\" }"}</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                )}

                            </div>
                        </div>
                        
                        {/* 구분선 */}
                        <div className="approval-section-divider"></div>

                        {/* 버튼 영역 */}
                        <div className="approval-create-button-group">
                            <div className="form-buttons jcl">
                                <button 
                                    onClick={handleAddRow} 
                                    className="btn-add-step btn-success"
                                >
                                    ➕ 다음 단계 추가
                                </button>
                                <button 
                                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                    className="btn-advanced-settings btn-primary"
                                >
                                    ⚙️ {showAdvancedSettings ? "기본 설정" : "고급 설정"}
                                </button>
                            </div>
                            <div className="form-buttons jcr">
                                <button onClick={save} className="btn-primary">
                                    💾 저장
                                </button>
                                <button onClick={cancel} className="btn-secondary">
                                    ✖️ 취소
                                </button>
                            </div>
                        </div>

                        {/* 결재선 테이블 */}
                        <div className="table-scroll border auth-setting-table-scroll approval-table-wrapper">
                            {loading ? (
                                <div className="tac approval-loading-message">로딩 중...</div>
                            ) : (
                                <table className="list-table">
                                    <colgroup>
                                        <col width="5%" />
                                        <col width="9%" />
                                        <col width="11%" />
                                        <col width="11%" />
                                        {showAdvancedSettings && (
                                            <>
                                                <col width="10%" />
                                                <col width="12%" />
                                                <col width="12%" />
                                            </>
                                        )}
                                        {isEditMode === "update" && <col width="7%" />}
                                        <col width="" />
                                    </colgroup>
                                    <thead className="approval-table-header">
                                        <tr>
                                            <th>단계</th>
                                            <th>결재 유형 *</th>
                                            <th>필요 직급 *</th>
                                            <th>결재 부서 *</th>
                                            <th>결재자 (선택)</th>
                                            {showAdvancedSettings && (
                                                <>
                                                    <th>병렬여부</th>
                                                    <th>병렬규칙</th>
                                                    <th>조건부결재</th>
                                                </>
                                            )}
                                            {isEditMode === "update" && <th>활성</th>}
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvalLines.length === 0 ? (
                                            <tr>
                                                <td colSpan={
                                                    showAdvancedSettings 
                                                        ? (isEditMode === "update" ? "10" : "9") 
                                                        : (isEditMode === "update" ? "7" : "6")
                                                } className="tac approval-empty-state">
                                                    <div className="approval-empty-state-icon">
                                                        📋 결재선이 비어있습니다
                                                    </div>
                                                    <div className="approval-empty-state-hint">
                                                        상단의 <strong>'➕ 다음 단계 추가'</strong> 버튼을 클릭하여 결재 단계를 추가하세요.
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            Object.entries(groupedByStep).map(([step, lines]) => {
                                                const isParallel = lines.length > 1 || lines[0].is_parallel === 1;
                                                return lines.map((template, lineIndex) => {
                                                    const rowIndex = approvalLines.indexOf(template);
                                                    const isFirstInStep = lineIndex === 0;
                                                    const stepRowSpan = lines.length;
                                                    
                                                    return (
                                                        <tr 
                                                            key={rowIndex} 
                                                            className={`${template.isNew ? 'approval-row-new' : ''} ${isParallel ? 'approval-row-parallel' : ''}`}
                                                        >
                                                            {/* 단계 (병렬인 경우 rowspan) */}
                                                            {isFirstInStep && (
                                                                <td 
                                                                    className={`tac approval-step-cell ${isParallel ? 'approval-step-cell-parallel' : ''}`}
                                                                    rowSpan={stepRowSpan}
                                                                >
                                                                    {template.step}단계
                                                                    {isParallel && <div className="approval-step-parallel-badge">⚡병렬</div>}
                                                                </td>
                                                            )}
                                                            
                                                            {/* 결재 유형 */}
                                                            <td className="approval-table-cell">
                                                                <select
                                                                    value={template.approval_type || "APPROVE"}
                                                                    onChange={(e) => handleRowChange(rowIndex, "approval_type", e.target.value)}
                                                                    className="approval-table-select"
                                                                >
                                                                    <option value="APPROVE">✅ 결재 (필수)</option>
                                                                    <option value="AGREE">🤝 합의 (의견)</option>
                                                                    <option value="REFERENCE">📌 참조 (알림)</option>
                                                                </select>
                                                            </td>
                                                            
                                                            {/* 필요 직급 */}
                                                            <td className="approval-table-cell">
                                                                <select
                                                                    value={template.user_grade_id}
                                                                    onChange={(e) => handleRowChange(rowIndex, "user_grade_id", e.target.value)}
                                                                    className="approval-table-select"
                                                                >
                                                                    {userGrades.map((grade, idx) => (
                                                                        <option key={idx} value={grade.user_grade_id}>
                                                                            {grade.grade_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            
                                                            {/* 결재 부서 */}
                                                            <td className="approval-table-cell">
                                                                <select
                                                                    value={template.team_code || ""}
                                                                    onChange={(e) => handleRowChange(rowIndex, "team_code", e.target.value || null)}
                                                                    className="approval-table-select"
                                                                >
                                                                    {departments.map((dept, idx) => (
                                                                        <option key={idx} value={dept.team_code}>
                                                                            {dept.team_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            
                                                            {/* 결재자 */}
                                                            <td className="approval-table-cell">
                                                                <select
                                                                    value={template.approver_id || ""}
                                                                    onChange={
                                                                        (e) => {
                                                                            handleRowChange(rowIndex, "approver_id", e.target.value || null);
                                                                            checkGradeMismatch(e, rowIndex, template.user_grade_id);
                                                                        }

                                                                    }
                                                                    className="approval-table-select"
                                                                >
                                                                    <option value="">결재자 미지정</option>
                                                                    {users.map((user, idx) => (
                                                                        <option key={idx} value={user.user_id} 
                                                                                data-user_grade_id={user.user_grade_id}
                                                                                data-grade_level={user.grade_level}>
                                                                            {user.user_full_name} {user.grade_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            
                                                            {/* 고급 설정 */}
                                                            {showAdvancedSettings && (
                                                                <>
                                                                    {/* 병렬 여부 */}
                                                                    <td className="tac approval-table-cell">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={template.is_parallel === 1}
                                                                            onChange={(e) => handleToggleParallel(
                                                                                e.target.checked, 
                                                                                template.step, 
                                                                                template.parallel_group_id,
                                                                                rowIndex
                                                                            )}
                                                                            className="approval-table-checkbox"
                                                                        />
                                                                    </td>
                                                                    
                                                                    {/* 병렬 규칙 */}
                                                                    <td className="approval-table-cell">
                                                                        <select
                                                                            value={template.parallel_approval_rule || "ALL"}
                                                                            onChange={(e) => handleParallelRuleChange(e.target.value, template.step)}
                                                                            disabled={template.is_parallel !== 1}
                                                                            className="approval-table-select"
                                                                            style={{ opacity: template.is_parallel === 1 ? 1 : 0.5 }}
                                                                        >
                                                                            <option value="ALL">전원 승인</option>
                                                                            <option value="ANY">1명만 승인</option>
                                                                            <option value="MAJORITY">과반수 승인</option>
                                                                        </select>
                                                                    </td>
                                                                    
                                                                    {/* 조건부 결재 */}
                                                                    <td className="approval-table-cell">
                                                                        <select
                                                                            value={template.condition_type || ""}
                                                                            onChange={(e) => handleConditionTypeChange(e.target.value || null, template.step)}
                                                                            className="approval-table-select"
                                                                        >
                                                                            <option value="">조건 없음</option>
                                                                            <option value="AMOUNT">💰 금액별</option>
                                                                            <option value="PRIORITY">⚡ 우선순위별</option>
                                                                            <option value="CUSTOM">🎯 사용자정의</option>
                                                                        </select>
                                                                        {template.condition_type && (
                                                                            <input
                                                                                type="text"
                                                                                placeholder="조건 값 (JSON)"
                                                                                value={template.condition_value || ""}
                                                                                onChange={(e) => handleConditionValueChange(e.target.value, template.step)}
                                                                                className="approval-condition-input"
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </>
                                                            )}
                                                            
                                                            {/* 활성 여부 */}
                                                            {isEditMode === "update" && (
                                                                <td className="tac approval-table-cell">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={template.is_active === 1}
                                                                        onChange={(e) => handleRowChange(rowIndex, "is_active", e.target.checked ? 1 : 0)}
                                                                        className="approval-table-checkbox"
                                                                    />
                                                                </td>
                                                            )}
                                                            
                                                            {/* 관리 버튼 */}
                                                            <td className="tac approval-table-cell">
                                                                <div className="approval-manage-buttons">
                                                                    {isParallel && (
                                                                        <button 
                                                                            onClick={() => handleAddParallelRow(template.step, lineIndex)}
                                                                            className="approval-btn-parallel-add btn-success"
                                                                            title="같은 단계에 병렬 결재자 추가"
                                                                        >
                                                                            ➕
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleMoveUp(rowIndex)}
                                                                        disabled={rowIndex === 0}
                                                                        className="approval-btn-move btn-move"
                                                                        title="위로 이동"
                                                                    >
                                                                        ▲
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleMoveDown(rowIndex)}
                                                                        disabled={rowIndex === approvalLines.length - 1}
                                                                        className="approval-btn-move btn-move"
                                                                        title="아래로 이동"
                                                                    >
                                                                        ▼
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteRow(rowIndex)}
                                                                        className="approval-btn-delete btn-danger"
                                                                        title="삭제"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
