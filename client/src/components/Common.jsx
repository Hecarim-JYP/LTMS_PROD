/**
 * 파일명 : Common.jsx
 * 용도 : 공통 변수 및 전역 변수 관리
 * 최초등록 : 2025-10-30 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import * as Utils from "/src/components/Utils";

export const Common = {
    /* ============================== 전역 변수 ============================== */
    /**
     * 페이징 바 그룹당 페이지 갯수
     */
    "pageGroupCount" : 10,
    "G_TODAY" : Utils.formatDateISO(new Date()), // 현재 날짜 "YYYY-MM-DD" 형식
    "G_STARTDAY" : Utils.addDay(Utils.formatDateISO(new Date()), -6), // 현재 날짜를 포함한 7일간 (Ex. 2025-12-15 ~ 2025-12-21)
};

/**
 * 개발용 MockData 객체
 */
export const MockData = {
   "ct_list" : Utils.generateMockCTData(500),
   "approve_list" : Utils.generateMockCTApproveData(500),
   "employeeList" : [
    {"id" : 1, "name" : "박진영"},
    {"id" : 2, "name" : "황경진"},
    {"id" : 3, "name" : "최연웅"},
    {"id" : 4, "name" : "김경석"},
    {"id" : 5, "name" : "전성배"},
    {"id" : 6, "name" : "홍정의"},
    {"id" : 7, "name" : "송민희"},
    {"id" : 8, "name" : "남창기"},
    {"id" : 9, "name" : "김현준"}
   ]
};