-- approval_line 테이블에 document_type 컬럼 추가 (선택 사항)
-- 목적: approval_document JOIN 없이 문서 유형별 결재선 조회 가능

ALTER TABLE `approval_line`
ADD COLUMN `document_type` varchar(20) DEFAULT NULL COMMENT '문서 유형 (CT_REQ, CT_TEST 등)' AFTER `approval_document_id`;

-- 문서 유형별 조회 인덱스 추가
ALTER TABLE `approval_line`
ADD KEY `idx_document_type` (`document_type`) COMMENT '문서 유형별 조회';

-- 문서 유형 + 결재 상태 복합 인덱스
ALTER TABLE `approval_line`
ADD KEY `idx_document_type_status` (`document_type`, `approval_status`) COMMENT '문서 유형-상태 복합 조회';
