/**
 * 파일명 : EXAMPLE_ActionPermissionUsage.jsx
 * 용도 : useActionPermission 훅 사용 예시
 * 작성일 : 2026-02-10
 * 
 * 이 파일은 예시용 파일입니다.
 * 실제 컴포넌트에서 이 패턴을 따라 권한 체크를 구현하세요.
 */

import React from 'react';
import useActionPermission from '/src/hooks/useActionPermission';

/**
 * 예시 1: CT 의뢰 화면
 * ================================================================
 * 메뉴 접근: ProtectedRoute에서 자동 체크 (ct_request)
 * 동작 권한: useActionPermission 훅으로 버튼 제어
 */
function CT_Request_Example() {
    
    // 동작 권한 가져오기
    const { canCreate, canUpdate, canDelete, canApproval } = useActionPermission('ct_request');

    const handleCreate = () => {
        // 등록 로직
        console.log('의뢰 등록');
    };

    const handleUpdate = (id) => {
        // 수정 로직
        console.log('의뢰 수정:', id);
    };

    const handleDelete = (id) => {
        // 삭제 로직
        console.log('의뢰 삭제:', id);
    };

    const handleApproval = (id) => {
        // 결재 로직
        console.log('의뢰 결재:', id);
    };

    return (
        <div>
            <h1>CT 의뢰 관리</h1>
            
            {/* 등록 버튼 - create 권한 필요 */}
            <button 
                disabled={!canCreate}
                onClick={handleCreate}
                title={!canCreate ? '등록 권한이 없습니다' : ''}
            >
                의뢰 등록
            </button>

            {/* 수정 버튼 - update 권한 필요 */}
            <button 
                disabled={!canUpdate}
                onClick={() => handleUpdate(1)}
                title={!canUpdate ? '수정 권한이 없습니다' : ''}
            >
                수정
            </button>

            {/* 삭제 버튼 - delete 권한 필요 */}
            <button 
                disabled={!canDelete}
                onClick={() => handleDelete(1)}
                title={!canDelete ? '삭제 권한이 없습니다' : ''}
            >
                삭제
            </button>

            {/* 결재 버튼 - approval 권한 필요 */}
            <button 
                disabled={!canApproval}
                onClick={() => handleApproval(1)}
                title={!canApproval ? '결재 권한이 없습니다' : ''}
            >
                결재
            </button>

            {/* 조건부 렌더링 - 버튼 아예 숨기기 */}
            {canDelete && (
                <button onClick={() => handleDelete(1)}>
                    삭제 (권한 있을 때만 표시)
                </button>
            )}
        </div>
    );
}


/**
 * 예시 2: 환경설정 - 사용자 관리 화면
 * ================================================================
 */
function Setting_User_Example() {
    
    const { canCreate, canUpdate, canDelete } = useActionPermission('setting_user');

    return (
        <div>
            <h1>사용자 관리</h1>
            
            <table>
                <thead>
                    <tr>
                        <th>사용자명</th>
                        <th>이메일</th>
                        <th>동작</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>홍길동</td>
                        <td>hong@example.com</td>
                        <td>
                            {canUpdate && <button>수정</button>}
                            {canDelete && <button>삭제</button>}
                        </td>
                    </tr>
                </tbody>
            </table>

            {canCreate && (
                <button>신규 사용자 등록</button>
            )}
        </div>
    );
}


/**
 * 예시 3: 복잡한 권한 조합
 * ================================================================
 */
function Complex_Permission_Example() {
    
    const ctRequest = useActionPermission('ct_request');
    const ctTestReport = useActionPermission('ct_testReport');

    // 둘 다 권한이 있을 때만 특정 기능 활성화
    const canGenerateReport = ctRequest.canRead && ctTestReport.canCreate;

    return (
        <div>
            <h1>통합 보고서</h1>
            
            <button disabled={!canGenerateReport}>
                {canGenerateReport 
                    ? '보고서 생성' 
                    : '보고서 생성 권한이 없습니다 (CT 조회 + 성적서 작성 권한 필요)'}
            </button>
        </div>
    );
}


/**
 * 예시 4: 권한 체크 후 API 호출
 * ================================================================
 */
function API_Call_Example() {
    
    const { canDelete } = useActionPermission('ct_request');

    const handleDelete = async (id) => {
        // 1차: 클라이언트 권한 체크
        if (!canDelete) {
            alert('삭제 권한이 없습니다.');
            return;
        }

        // 2차: 서버 요청 (서버에서도 권한 체크 필수)
        try {
            const response = await fetch(`/api/ct/request/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('삭제 실패');
            }
            
            alert('삭제되었습니다.');
        } catch (error) {
            console.error(error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <button onClick={() => handleDelete(1)}>삭제</button>
    );
}


export default CT_Request_Example;
