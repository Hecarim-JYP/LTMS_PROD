-- ============================================================
-- 결재 문서 유형 샘플 데이터 INSERT
-- ============================================================
-- 실행 전 확인사항:
-- 1. company_id는 실제 환경에 맞게 수정하세요 (기본값: 1)
-- 2. default_template_id는 approval_template 테이블에 템플릿 생성 후 설정
-- ============================================================

-- CT 모듈 문서 유형
INSERT INTO approval_document_type 
(document_type_code, company_id, module_name, document_type_name, document_category, description, requires_approval, icon, color, is_active, sort_order, created_by) 
VALUES 
('CT_REQ', 1, 'CT', 'CT 의뢰', 'REQUEST', 'CT(Compatibility Test) 시험 의뢰 문서', 1, 'icon-ct-request', '#4A90E2', 1, 1, 1),
('CT_TEST', 1, 'CT', 'CT 시험성적서', 'TEST', 'CT 시험 완료 후 발행하는 시험성적서', 1, 'icon-ct-report', '#50C878', 1, 2, 1),

-- 내부시험 모듈 문서 유형
('INTERNAL_REQ', 1, 'InternalTest', '내부시험 의뢰', 'REQUEST', '내부 시험 의뢰 문서', 1, 'icon-internal-request', '#9B59B6', 1, 3, 1),
('INTERNAL_TEST', 1, 'InternalTest', '내부시험 시험성적서', 'TEST', '내부 시험 완료 후 발행하는 시험성적서', 1, 'icon-internal-report', '#8E44AD', 1, 4, 1),

-- 외부시험 모듈 문서 유형
('EXTERNAL_REQ', 1, 'ExternalTest', '외부시험 의뢰', 'REQUEST', '외부 시험기관 의뢰 문서', 1, 'icon-external-request', '#E67E22', 1, 5, 1),
('EXTERNAL_TEST', 1, 'ExternalTest', '외부시험 시험성적서', 'TEST', '외부 시험 완료 후 발행하는 시험성적서', 1, 'icon-external-report', '#D35400', 1, 6, 1),

-- 방부력 모듈 문서 유형
('PRESERVATIVE_REQ', 1, 'Preservative', '방부력 시험 의뢰', 'REQUEST', '방부력 시험 의뢰 문서', 1, 'icon-preservative-request', '#16A085', 1, 7, 1),
('PRESERVATIVE_TEST', 1, 'Preservative', '방부력 시험성적서', 'TEST', '방부력 시험 완료 후 발행하는 시험성적서', 1, 'icon-preservative-report', '#27AE60', 1, 8, 1);

-- ============================================================
-- 추가 문서 유형 예시 (필요 시 활성화)
-- ============================================================

-- 기타 보고서 문서 유형
-- INSERT INTO approval_document_type 
-- (document_type_code, company_id, module_name, document_type_name, document_category, description, requires_approval, icon, color, is_active, sort_order, created_by) 
-- VALUES 
-- ('CT_SCHEDULE', 1, 'CT', 'CT 일정 보고서', 'REPORT', 'CT 시험 일정 보고서', 0, 'icon-schedule', '#95A5A6', 1, 9, 1),
-- ('CT_ANALYSIS', 1, 'CT', 'CT 분석 보고서', 'REPORT', 'CT 시험 결과 분석 보고서', 1, 'icon-analysis', '#34495E', 1, 10, 1);

-- 긴급 문서 유형
-- INSERT INTO approval_document_type 
-- (document_type_code, company_id, module_name, document_type_name, document_category, description, requires_approval, icon, color, is_active, sort_order, created_by) 
-- VALUES 
-- ('CT_REQ_URGENT', 1, 'CT', 'CT 긴급 의뢰', 'REQUEST', '긴급 CT 시험 의뢰 문서 (간소화 결재)', 1, 'icon-urgent', '#E74C3C', 1, 11, 1);

-- ============================================================
-- 기본 템플릿 연결 (approval_template 생성 후 실행)
-- ============================================================
-- UPDATE 문을 사용하여 default_template_id 설정
-- 
-- UPDATE approval_document_type 
-- SET default_template_id = (
--   SELECT approval_template_id 
--   FROM approval_template 
--   WHERE document_type = 'CT_REQ' AND is_default = 1 
--   LIMIT 1
-- )
-- WHERE document_type_code = 'CT_REQ' AND company_id = 1;
-- 
-- UPDATE approval_document_type 
-- SET default_template_id = (
--   SELECT approval_template_id 
--   FROM approval_template 
--   WHERE document_type = 'CT_TEST' AND is_default = 1 
--   LIMIT 1
-- )
-- WHERE document_type_code = 'CT_TEST' AND company_id = 1;
-- 
-- UPDATE approval_document_type 
-- SET default_template_id = (
--   SELECT approval_template_id 
--   FROM approval_template 
--   WHERE document_type = 'INTERNAL_REQ' AND is_default = 1 
--   LIMIT 1
-- )
-- WHERE document_type_code = 'INTERNAL_REQ' AND company_id = 1;
-- approval_document_type_id,
--   document_type_code,
--   module_name,
--   document_type_name,
--   document_category,
--   requires_approval,
--   is_active
-- FROM approval_document_type
-- WHERE company_id = 1 AND is_active = 1
-- ORDER BY sort_order;

-- 2. 모듈별 문서 유형 조회
-- SELECT * FROM approval_document_type
-- WHERE company_id = 1 
--   AND module_name = 'CT' 
--   AND is_active = 1
-- ORDER BY sort_order;

-- 3. 결재 필요한 문서 유형만 조회
-- SELECT * FROM approval_document_type
-- WHERE company_id = 1 
--   AND requires_approval = 1 
--   AND is_active = 1
-- ORDER BY module_name, sort_order;

-- 4. 문서 분류별 개수
-- SELECT 
--   document_category,
--   COUNT(*) as count
-- FROM approval_document_type
-- WHERE company_id = 1 AND is_active = 1
-- GROUP BY document_category;

-- 5. 기본 템플릿 연결 확인
-- SELECT 
--   dt.approval_document_type_id, 1
-- )
-- WHERE document_type_code = 'PRESERVATIVE_REQ' AND company_id = 1;
-- 
-- UPDATE approval_document_type 
-- SET default_template_id = (
--   SELECT approval_template_id 
--   FROM approval_template 
--   WHERE document_type = 'PRESERVATIVE_TEST' AND is_default = 1 
--   LIMIT 1
-- )
-- WHERE document_type_code = 'PRESERVATIVE_TEST' AND company_id = 1;

-- ============================================================
-- 조회 쿼리 예시
-- ============================================================

-- 1. 모든 활성 문서 유형 조회 (정렬 순서대로)
-- SELECT 
--   document_type_code,
--   module_name,
--   document_type_name,
--   document_category,
--   requires_approval,
--   is_active
-- FROM approval_document_type
-- WHERE company_id = 1 AND is_active = 1
-- ORDER BY sort_order;

-- 2. 모듈별 문서 유형 조회
-- SELECT * FROM approval_document_type
-- WHERE company_id = 1 
--   AND module_name = 'CT' 
--   AND is_active = 1
-- ORDER BY sort_order;

-- 3. 결재 필요한 문서 유형만 조회
-- SELECT * FROM approval_document_type
-- WHERE company_id = 1 
--   AND requires_approval = 1 
--   AND is_active = 1
-- ORDER BY module_name, sort_order;

-- 4. 문서 분류별 개수
-- SELECT 
--   document_category,
--   COUNT(*) as count
-- FROM approval_document_type
-- WHERE company_id = 1 AND is_active = 1
-- GROUP BY document_category;

-- 5. 기본 템플릿 연결 확인
-- SELECT 
--   dt.document_type_code,
--   dt.document_type_name,
--   dt.default_template_id,
--   t.template_name as default_template_name
-- FROM approval_document_type dt
-- LEFT JOIN approval_template t ON dt.default_template_id = t.approval_template_id
-- WHERE dt.company_id = 1 AND dt.is_active = 1
-- ORDER BY dt.sort_order;

-- ============================================================
-- 애플리케이션 코드 샘플 (JavaScript/Node.js)
-- ============================================================

-- // 1. 활성 문서 유형 목록 조회
-- async function getActiveDocumentTypes(companyId) {
--   consapproval_document_type_id,
--       t query = `
--     SELECT 
--       document_type_code,
--       module_name,
--       document_type_name,
--       document_category,
--       description,
--       requires_approval,
--       default_template_id,
--       icon,
--       color,
--       sort_order
--     FROM approval_document_type
--     WHERE company_id = ? AND is_active = 1
--     ORDER BY sort_order
--   `;
--   return await db.query(query, [companyId]);
-- }

-- // 2. 모듈별 문서 유형 조회
-- async function getDocumentTypesByModule(companyId, moduleName) {
--   const query = `
--     SELECT * FROM approval_document_type
--     WHERE company_id = ? 
--       AND module_name = ? 
--       AND is_active = 1
--     ORDER BY sort_order
--   `;
--   return await db.qu (PK로 조회)
-- async function getDocumentTypeById(documentTypeId) {
--   const query = `
--     SELECT 
--       dt.*,
--       t.template_name as default_template_name,
--       t.description as template_description
--     FROM approval_document_type dt
--     LEFT JOIN approval_template t ON dt.default_template_id = t.approval_template_id
--     WHERE dt.approval_document_type_id = ?
--   `;
--   const results = await db.query(query, [documentTypeId]);
--   return results[0];
-- }
--
-- // 문서 유형 상세 정보 조회 (코드로 조회)
-- async function getDocumentTypeByCode

-- // 3. 문서 유형 상세 정보 조회
-- async function getDocumentTypeDetail(documentTypeCode, companyId) {
--   const query = `
--     SELECT 
--       dt.*,
--       t.template_name as default_template_name,
--       t.description as template_description
--     FROM approval_document_type dt
--     LEFT JOIN approval_template t ON dt.default_template_id = t.approval_template_id
--     WHERE dt.document_type_code = ? AND dt.company_id = ?
--   `;
--   const results = await db.query(query, [documentTypeCode, companyId]);
--   return results[0];
-- }

-- // 4. 문서 유형 검증
-- async approval_document_type_id as id,
--       function validateDocumentType(documentTypeCode, companyId) {
--   const query = `
--     SELECT document_type_code, requires_approval 
--     FROM approval_document_type
--     WHERE document_type_code = ? 
--       AND company_id = ? 
--       AND is_active = 1
--   `;
--   const results = await db.query(query, [documentTypeCode, companyId]);
--   return results.length > 0 ? results[0] : null;
-- }

-- // 5. UI용 문서 유형 목록 (아이콘, 색상 포함)
-- async function getDocumentTypesForUI(companyId, moduleName = null) {
--   let query = `
--     SELECT 
--       document_type_code as value,
--       document_type_name as label,
--       module_name,
--       document_category,
--       icon,
--       color,
--       requires_approval
--     FROM approval_document_type
--     WHERE company_id = ? AND is_active = 1
--   `;
--   const params = [companyId];
--   
--   if (moduleName) {
--     query += ` AND module_name = ?`;
--     params.push(moduleName);
--   }
--   
--   query += ` ORDER BY sort_order`;
--   return await db.query(query, params);
-- }

-- ============================================================
-- 프론트엔드 사용 예시 (React)
-- ============================================================

-- // DocumentTypeSelector.jsx
-- import React, { useEffect, useState } from 'react';
-- 
-- function DocumentTypeSelector({ moduleName, onChange }) {
--   const [documentTypes, setDocumentTypes] = useState([]);
--   
--   useEffect(() => {
--     async function fetchTypes() {
--       const response = await api.get('/approval/document-types', {
--         params: { module: moduleName }
--       });
--       setDocumentTypes(response.data);
--     }
--     fetchTypes();
--   }, [moduleName]);
--   
--   return (
--     <select onChange={(e) => onChange(e.target.value)}>
--       <option value="">문서 유형 선택</option>
--       {d (company_id, document_type_code는 UNIQUE)
-- SELECT 
--   approval_document_type_id,
--   document_type_code, 
--   company_id, 
--  
--           key={type.value} 
--           value={type.value}
--           style={{ color: type.color }}
--         >
--           {type.label} {type.requires_approval ? '🔒' : ''}
--         </option>
--       ))}
--     </select>
--   );
-- }

-- ============================================================
-- 데이터 검증용 쿼리
-- ============================================================

-- -- 중복 확인
-- SELECT document_type_code, company_id, COUNT(*) as cnt
-- FROM approval_document_type
-- GROUP BY document_type_code, company_id
-- HAVING cnt > 1;

-- -- 모듈별 문서 유형 분포
-- SELECT 
--   module_name,
--   document_category,
--   COUNT(*) as type_count,
--   SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
-- FROM approval_document_type
-- WHERE company_id = 1
-- GROUP BY module_name, document_category
-- ORDER BY module_name, document_category;

-- ============================================================
-- 정리
-- ============================================================
-- 이 테이블을 사용하면:
-- 1. 문서 유형을 중앙에서 관리 가능
-- 2. UI에서 동적으로 문서 유형 목록 표시
-- 3. 모듈별 문서 유형 필터링
-- 4. 결재 필요 여부 체크
-- 5. 기본 결재 템플릿 자동 연결
-- 6. 아이콘, 색상 등 UI 요소 통합 관리
-- ============================================================
