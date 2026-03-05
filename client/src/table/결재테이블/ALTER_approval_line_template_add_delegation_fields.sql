-- approval_line_template 테이블에 위임 관련 컬럼 추가
-- 목적: 사전에 위임 설정을 템플릿에 등록하여 결재선 생성 시 자동 적용

ALTER TABLE `approval_line_template`
ADD COLUMN `delegated_from_user_id` int(11) DEFAULT NULL COMMENT '위임자 pk (외래키) - 원래 결재자' AFTER `parallel_approval_rule`,
ADD COLUMN `delegation_start_date` datetime DEFAULT NULL COMMENT '위임 시작일' AFTER `delegated_from_user_id`,
ADD COLUMN `delegation_end_date` datetime DEFAULT NULL COMMENT '위임 종료일' AFTER `delegation_start_date`,
ADD COLUMN `delegation_reason` text DEFAULT NULL COMMENT '위임 사유' AFTER `delegation_end_date`;

-- 위임자 조회용 인덱스 추가
ALTER TABLE `approval_line_template`
ADD KEY `idx_delegated_from` (`delegated_from_user_id`) COMMENT '위임자 조회';

-- 위임 기간 조회용 복합 인덱스 추가
ALTER TABLE `approval_line_template`
ADD KEY `idx_delegation_period` (`delegation_start_date`, `delegation_end_date`) COMMENT '위임 기간 조회';
