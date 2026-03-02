/**
 * 파일명 : useActionPermission.jsx
 * 용도 : 화면에서 동작 권한(CRUD)을 체크하기 위한 커스텀 훅
 * 최초등록 : 2026-02-10 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 * 
 * 사용 예시:
 *   const { canCreate, canUpdate, canDelete } = useActionPermission('ct_request');
 *   
 *   <button disabled={!canCreate} onClick={handleCreate}>등록</button>
 *   <button disabled={!canUpdate} onClick={handleUpdate}>수정</button>
 *   <button disabled={!canDelete} onClick={handleDelete}>삭제</button>
 */

import { useContext, useMemo } from "react";
import { AuthContext } from "/src/contexts/AuthContext";

/**
 * 동작 권한 체크 훅
 * ================================================================
 * @param {string} module - 모듈명 (예: 'ct_request', 'internal_testReport')
 * @returns {Object} - 각 동작에 대한 권한 여부
 *   - canRead: 조회 권한
 *   - canCreate: 등록 권한
 *   - canUpdate: 수정 권한
 *   - canDelete: 삭제 권한
 *   - canApprove: 결재 권한
 *   - canExport: 내보내기 권한 (추가 가능)
 * 
 * 권한 체크 로직:
 *   - AuthContext의 hasActionPermission 함수 사용
 *   - permission_type='action'인 권한만 체크
 *   - role_permission 테이블 기반
 */
export default function useActionPermission(module) {
    
    const { hasActionPermission } = useContext(AuthContext);

    // 메모이제이션: module이 변경될 때만 재계산
    const permissions = useMemo(() => {
        
        if (!module) {
            return {
                canRead: false,
                canCreate: false,
                canUpdate: false,
                canDelete: false,
                canApproval: false,
                canExport: false
            };
        }

        return {
            canRead: hasActionPermission(module, 'read'),
            canCreate: hasActionPermission(module, 'create'),
            canUpdate: hasActionPermission(module, 'update'),
            canDelete: hasActionPermission(module, 'delete'),
            canApproval: hasActionPermission(module, 'approval'),
            canExport: hasActionPermission(module, 'export')
        };
        
    }, [module, hasActionPermission]);

    return permissions;
}
