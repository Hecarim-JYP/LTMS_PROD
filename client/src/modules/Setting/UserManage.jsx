/**
 * 파일명 : UserManage.jsx
 * 용도 : 사용자 관리 화면
 * 최초등록 : 2026-02-05 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "/src/contexts/AuthContext";

export default function UserManage() {

    const { user, hasModulePermission } = useContext(AuthContext);
    const companyId = user.company_id;

    /**
     * 사용자 목록 데이터
     */
    const [userList, setUserList] = useState([]);
    // 예시 데이터 구조
    // userList = [
    //     {
    //         user_id : 사용자 ID (PK)
    //         user_name : 사용자 이름 (이메일주소에서 도메인 제외한 부분)
    //         user_full_name : 사용자 전체 이름(Ex. 홍길동)
    //         email : 이메일
    //         employee_number : 사번
    //         status : 활성화 여부 (1: 활성화, 0: 비활성화)
    //         phone : 전화번호
    //         position : 직책
    //         status : 상태
    //         last_login_at : 마지막 로그인 시간
    //         role_id : 역할 ID
    //         role_code : 역할 코드
    //         role_name : 역할 이름
    //         role_description : 역할 설명
    //         department_name : 부서
    //         grade_name : 직급
    //     },
    // ];  

    /**
     * 역할 목록 데이터 (셀렉트박스용)
     */
    const [roleList, setRoleList] = useState([]);
    // 예시 데이터 구조
    // roleList = [
    //     {
    //         idx : 인덱스 
    //         role_id : 역할 ID (PK)
    //         role_code : 역할 코드
    //         role_name : 역할 이름
    //         description : 역할 설명
    //         is_active : 활성화 여부 (1: 활성화, 0: 비활성화)
    //         sort_order : 정렬순서
    //         from_db : DB에서 조회된 데이터 여부
    //     },
    // ];

    /**
     * 로딩 상태
     */
    const [isLoading, setIsLoading] = useState(true);

    /**
     * 컴포넌트 마운트 시 데이터 조회
     */
    useEffect(() => {
        fetchRoleList();
        fetchUserList();
    }, []);

    /**
     * 사용자 목록 조회
     */
    const fetchUserList = async () => {
        try {
            setIsLoading(true);
            const params = { 
                company_id: companyId,
                is_setting: 1, // 설정용 사용자 목록 조회 플래그
                team_code: user.team_code // 사용자 소속 팀 코드
            };
            const response = await axios.get("/api/ltms/auth/users", { params });
            const userList = response.data.data.result || [];
            
            setUserList(userList);

        } catch (error) {
            console.error("사용자 목록 조회 실패:", error);
            alert("사용자 목록을 불러오는 중 오류가 발생했습니다.");
            setUserList([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 역할 목록 조회
     */
    const fetchRoleList = async () => {
        try {
            const params = { company_id: companyId };
            const response = await axios.get("/api/ltms/auth/roles", { params });
            const roleList = response.data.data.result || [];
            setRoleList(roleList);
        } catch (error) {
            console.error("역할 목록 조회 실패:", error);
            setRoleList([]);
        }
    };

    /**
     * 입력 필드 변경 핸들러
     */
    const handleInputChange = (userId, field, e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        
        setUserList(prev => prev.map(user => 
            user.user_id === userId ? { ...user, [field]: value } : user
        ));
    };

    /**
     * 저장
     */
    const save = async () => {

        if (!confirm("변경사항을 저장하시겠습니까?")) return;

        try {
            const modifiedUsers = userList.map((user) => ({
                    company_id: companyId,
                    user_id: user.user_id,
                    role_id: user.role_id,
                    status: user.status
                })
            );

            const params = { 
                company_id: companyId, 
                userList: modifiedUsers 
            };
            const response = await axios.patch("/api/ltms/auth/user/save", params);
            
            if (response.status === 200) {
                alert("저장이 완료되었습니다.");
                fetchUserList(); // 저장 후 목록 새로고침
            }
        } catch (error) {
            console.error("저장 실패:", error);
            alert(`저장에 실패했습니다.\n${error.response?.data?.message || error.message}`);
        }
    };

    /**
     * 초기화
     */
    const reset = () => {
        if (confirm("변경사항을 초기화하시겠습니까?")) {
            fetchUserList();
        }
    };

    if (isLoading) {
        return (
            <div className="setting-box">
                <div className="page-top">
                    <h1 className="user-custom-option-title">사용자 관리</h1>
                </div>
                <div style={{ textAlign: "center", padding: "50px" }}>
                    로딩 중...
                </div>
            </div>
        );
    }

    return (
        <div className="setting-box">
            <div className="page-top">
                <h1 className="user-custom-option-title">사용자 관리</h1>
            </div>

            <div className="form-buttons jcl" style={{ margin: "15px 0px" }}>
                <button className="btn-success" onClick={save}>저장</button>
                <button className="btn-secondary" onClick={reset}>초기화</button>
            </div>

            <div className="settings-section">
                <div className="table-scroll border" style={{height : "100%"}}>
                    <table className="list-table">
                        <colgroup>
                            <col style={{ width: "4%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "26%" }} />
                            <col style={{ width: "26%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "4%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>사번</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>부서</th>
                                <th>직급</th>
                                <th>직책</th>
                                <th>역할</th>
                                <th>활성화</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="tac">
                                        조회된 사용자가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                userList.map((userData, index) => (
                                    <tr key={userData.user_id}>
                                        <td className="tac">{index + 1}</td>
                                        <td className="tac">{userData.employee_number || "-"}</td>
                                        <td className="tac">{userData.user_full_name || "-"}</td>
                                        <td className="tac">{userData.email || "-"}</td>
                                        <td className="tac">{userData.department_name || "-"}</td>
                                        <td className="tac">{userData.grade_name || "-"}</td>
                                        <td className="tac">{userData.position || "-"}</td>
                                        <td className="tac">
                                            <select 
                                                value={userData.role_id || ""}
                                                style={{ width: "100%" }}
                                                onChange={(e) => handleInputChange(userData.user_id, 'role_id', e)}
                                            >
                                                {roleList.map(role => (
                                                    <option key={role.idx} value={role.role_id}>
                                                        {role.role_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="tac">
                                            <input 
                                                type="checkbox" 
                                                checked={userData.status === 1}
                                                onChange={(e) => handleInputChange(userData.user_id, 'status', e)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}