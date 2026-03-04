-- =============================================
-- 결과입력 방식 옵션 및 시험 기준 샘플 데이터
-- 생성일: 2026-03-03
-- =============================================

-- =============================================
-- 1. result_type_option 테이블 데이터
-- =============================================

-- 기존 데이터 초기화 (선택사항)
-- DELETE FROM result_type_option WHERE company_id = 1;

INSERT INTO `result_type_option` 
(`company_id`, `unit_id`, `result_type_code`, `result_type_name`, `result_type_description`, 
 `requires_limits`, `requires_target`, `requires_tolerance`, `input_type`, 
 `is_active`, `sort_order`, `created_by`) 
VALUES
-- 1. 범위형 (상하한 규격 체크)
(1, NULL, 'NUMBER_RANGE', '숫자 범위 입력', '상한/하한 규격 내 숫자 입력', 1, 0, 0, 'number', 1, 1, 1),

-- 2. 정확값형 (목표값 ± 허용오차)
(1, NULL, 'NUMBER_EXACT', '정확값 입력', '목표값 대비 허용오차 체크', 0, 1, 1, 'number', 1, 2, 1),

-- 3. 적부판정형
(1, NULL, 'PASS_FAIL', '적합/부적합 판정', '합격/불합격 선택 입력', 0, 0, 0, 'select', 1, 3, 1),

-- 4. 선택형 (드롭다운)
(1, NULL, 'SELECT_OPTION', '선택 입력', '미리 정의된 옵션 중 선택', 0, 0, 0, 'select', 1, 4, 1),

-- 5. 텍스트형
(1, NULL, 'TEXT_SHORT', '텍스트 입력', '짧은 텍스트 자유 입력', 0, 0, 0, 'text', 1, 5, 1),

-- 6. 장문형
(1, NULL, 'TEXT_LONG', '긴 텍스트 입력', '긴 텍스트 자유 입력 (관찰내용 등)', 0, 0, 0, 'textarea', 1, 6, 1),

-- 7. 이미지형
(1, NULL, 'IMAGE_UPLOAD', '이미지 업로드', '시험 결과 이미지 첨부', 0, 0, 0, 'image', 1, 7, 1),

-- 8. 측정값+판정형 (범위형 + 적부판정)
(1, NULL, 'NUMBER_WITH_JUDGE', '측정값+판정', '숫자 입력 후 자동 적부판정', 1, 0, 0, 'number', 1, 8, 1);


-- =============================================
-- 2. test_standard 테이블 데이터
-- =============================================

-- 기존 데이터 초기화 (선택사항)
-- DELETE FROM test_standard WHERE company_id = 1;

-- 2-1. 원자재 시험 항목 (material_large_category_id = 1 가정)
INSERT INTO `test_standard` 
(`company_id`, `material_large_category_id`, `result_type_option_id`, `unit_id`, 
 `test_standard_code`, `test_standard_name`, `test_guide`, 
 `upper_limit`, `lower_limit`, `target_value`, `tolerance_percent`, 
 `is_active`, `sort_order`, `created_by`) 
VALUES
-- 범위형 시험 항목들
(1, 1, 1, 1, 'TS-001', '수분함량', 'KS M ISO 287 방법에 따라 측정', 14.0, 6.0, NULL, NULL, 1, 1, 1),
(1, 1, 1, 2, 'TS-002', 'pH', 'pH미터로 25℃에서 측정', 8.5, 6.5, NULL, NULL, 1, 2, 1),
(1, 1, 1, 3, 'TS-003', '점도', '브룩필드 점도계 사용, 25℃', 5000, 3000, NULL, NULL, 1, 3, 1),
(1, 1, 1, 4, 'TS-004', '밀도', 'KS M ISO 1183-1 방법', 1.05, 0.95, NULL, NULL, 1, 4, 1),
(1, 1, 1, 5, 'TS-005', '인장강도', 'KS M 3054 방법', 450, 350, NULL, NULL, 1, 5, 1),

-- 정확값형 시험 항목들
(1, 1, 2, NULL, 'TS-006', '특정성분 함량', '정량분석, HPLC', NULL, NULL, 50.0, 2.0, 1, 6, 1),
(1, 1, 2, 6, 'TS-007', '기준물질 농도', '적정법', NULL, NULL, 10.0, 1.0, 1, 7, 1),

-- 적부판정형 시험 항목들
(1, 1, 3, NULL, 'TS-008', '외관검사', '육안 확인, 이물 및 변색 없을 것', NULL, NULL, NULL, NULL, 1, 8, 1),
(1, 1, 3, NULL, 'TS-009', '냄새 시험', '이취 없을 것', NULL, NULL, NULL, NULL, 1, 9, 1),
(1, 1, 3, NULL, 'TS-010', '용해성 시험', '완전 용해 확인', NULL, NULL, NULL, NULL, 1, 10, 1),

-- 선택형 시험 항목들
(1, 1, 4, NULL, 'TS-011', '색상', '표준 색상표 비교', NULL, NULL, NULL, NULL, 1, 11, 1),
(1, 1, 4, NULL, 'TS-012', '입도분포', '체 분석법', NULL, NULL, NULL, NULL, 1, 12, 1),

-- 텍스트형 시험 항목들
(1, 1, 5, NULL, 'TS-013', 'Lot 번호', '제조사 Lot 번호 기재', NULL, NULL, NULL, NULL, 1, 13, 1),
(1, 1, 6, NULL, 'TS-014', '관찰사항', '시험 중 특이사항 기록', NULL, NULL, NULL, NULL, 1, 14, 1),

-- 이미지형 시험 항목들
(1, 1, 7, NULL, 'TS-015', '외관 사진', '제품 외관 촬영', NULL, NULL, NULL, NULL, 1, 15, 1),

-- 측정값+판정형 시험 항목들
(1, 1, 8, 7, 'TS-016', '불순물 함량', 'GC 분석', 0.5, 0.0, NULL, NULL, 1, 16, 1);


-- 2-2. 반제품 시험 항목 (material_large_category_id = 2 가정)
INSERT INTO `test_standard` 
(`company_id`, `material_large_category_id`, `result_type_option_id`, `unit_id`, 
 `test_standard_code`, `test_standard_name`, `test_guide`, 
 `upper_limit`, `lower_limit`, `target_value`, `tolerance_percent`, 
 `is_active`, `sort_order`, `created_by`) 
VALUES
(2, 2, 1, 8, 'TS-101', '중량', '전자저울 측정, 소수점 둘째자리', 105.0, 95.0, NULL, NULL, 1, 1, 1),
(2, 2, 1, 9, 'TS-102', '두께', '마이크로미터 측정', 2.5, 1.5, NULL, NULL, 1, 2, 1),
(2, 2, 1, 10, 'TS-103', '폭', '버니어캘리퍼스 측정', 52.0, 48.0, NULL, NULL, 1, 3, 1),
(2, 2, 3, NULL, 'TS-104', '표면 결함', '표면 흠집, 기포, 주름 없을 것', NULL, NULL, NULL, NULL, 1, 4, 1),
(2, 2, 8, 11, 'TS-105', '박리강도', 'KS M 6518 방법', 15.0, 10.0, NULL, NULL, 1, 5, 1);


-- 2-3. 완제품 시험 항목 (material_large_category_id = 3 가정)
INSERT INTO `test_standard` 
(`company_id`, `material_large_category_id`, `result_type_option_id`, `unit_id`, 
 `test_standard_code`, `test_standard_name`, `test_guide`, 
 `upper_limit`, `lower_limit`, `target_value`, `tolerance_percent`, 
 `is_active`, `sort_order`, `created_by`) 
VALUES
(3, 3, 1, 12, 'TS-201', '경도', '쇼어 경도계', 85.0, 75.0, NULL, NULL, 1, 1, 1),
(3, 3, 1, 13, 'TS-202', '인열강도', 'KS M ISO 34-1 방법', 60.0, 40.0, NULL, NULL, 1, 2, 1),
(3, 3, 1, 14, 'TS-203', '신장률', 'KS M 3054 방법', 600, 400, NULL, NULL, 1, 3, 1),
(3, 3, 3, NULL, 'TS-204', '포장 상태', '포장 손상, 오염 없을 것', NULL, NULL, NULL, NULL, 1, 4, 1),
(3, 3, 3, NULL, 'TS-205', '라벨링 확인', '제품명, 규격, 제조일자 정확성', NULL, NULL, NULL, NULL, 1, 5, 1),
(3, 3, 7, NULL, 'TS-206', '제품 사진', '최종 제품 외관 촬영', NULL, NULL, NULL, NULL, 1, 6, 1),
(3, 3, 6, NULL, 'TS-207', '종합 평가', '전체 시험 결과 종합 의견', NULL, NULL, NULL, NULL, 1, 7, 1);


-- =============================================
-- 3. 데이터 확인 쿼리
-- =============================================

-- 결과입력 방식 옵션 확인
SELECT 
    result_type_option_id,
    result_type_code,
    result_type_name,
    input_type,
    requires_limits,
    requires_target,
    requires_tolerance
FROM result_type_option
WHERE company_id = 1 AND is_active = 1
ORDER BY sort_order;

-- 시험 기준 확인 (입력방식과 조인)
SELECT 
    ts.test_standard_code,
    ts.test_standard_name,
    rto.result_type_name,
    rto.input_type,
    ts.upper_limit,
    ts.lower_limit,
    ts.target_value,
    ts.tolerance_percent,
    ts.material_large_category_id
FROM test_standard ts
LEFT JOIN result_type_option rto ON ts.result_type_option_id = rto.result_type_option_id
WHERE ts.company_id = 1 AND ts.is_active = 1
ORDER BY ts.material_large_category_id, ts.sort_order;

-- 입력방식별 시험기준 개수
SELECT 
    rto.result_type_name,
    rto.input_type,
    COUNT(ts.test_standard_id) as test_count
FROM result_type_option rto
LEFT JOIN test_standard ts ON rto.result_type_option_id = ts.result_type_option_id
WHERE rto.company_id = 1 AND rto.is_active = 1
GROUP BY rto.result_type_option_id, rto.result_type_name, rto.input_type
ORDER BY rto.sort_order;
