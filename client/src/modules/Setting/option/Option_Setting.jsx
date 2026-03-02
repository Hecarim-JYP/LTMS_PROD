/**
 * 파일명 : Option_Setting.jsx
 * 용도 : 선택 항목 설정 페이지
 * 최초등록 : 2025-12-24 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 * 사용되지 않음.
 */

import CTType from "/src/modules/Setting/option/CTType";
import Judgment from "/src/modules/Setting/option/Judgment";
import ManageDept from "/src/modules/Setting/option/ManageDept";

export default function Option_Setting() {
    return (
        <>
            <div className="container">
                <div className="setting-box-wrapper">
                    <ManageDept /> {/* 제형 담당부서 설정 */}
                    <CTType /> {/* CT 유형 설정 */}
                    <Judgment /> {/* 판정 관리 */}
                </div>
                <div className="setting-box-wrapper">
                    {/* <CT_Option_Manager />
                    <CT_Option_Manager />
                    <CT_Option_Manager /> */}
                </div>
            </div>
        </>
    );
}