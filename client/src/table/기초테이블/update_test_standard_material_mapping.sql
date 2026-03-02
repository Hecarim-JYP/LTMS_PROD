-- ============================================================
-- 시험 기준에 자재 유형 대분류 매핑 UPDATE 쿼리
-- ============================================================
-- 시험 항목의 특성에 따라 주로 사용되는 자재 유형을 매핑
-- 대부분의 시험은 범용적이므로 특정 자재에만 적용되는 시험만 매핑

-- 1. 토출량, 토출압 → 펌프 타입 (딥튜브펌프)
UPDATE test_standard 
SET material_large_category_id = 4, -- 딥튜브펌프
    updated_by = 1,
    updated_at = NOW()
WHERE company_id = 1 
  AND test_standard_code IN ('TS-011', 'TS-012'); -- 토출량, 토출압

-- 2. JAR 관련 시험 (순용량, 표시용량 등은 JAR에 주로 사용)
-- 하지만 이것들도 다른 용기에 적용 가능하므로 NULL로 유지

-- 3. 튜브 관련 시험들도 여러 튜브 타입이 있으므로 NULL로 유지

-- 4. 롤온 특화 시험이 있다면 롤온에 매핑할 수 있지만, 
--    현재 시험 목록에는 롤온 전용 시험이 명확하지 않으므로 NULL로 유지

-- 5. 에어로졸 관련 (개폐력은 에어로졸의 캡에도 적용)
-- 하지만 개폐력은 다른 용기에도 적용되므로 NULL로 유지

-- 6. 쿠션 관련 (메쉬팩트, 사라팩트 등 팩트류에 특화된 시험)
-- 현재 시험 목록에 팩트 전용 시험이 명확하지 않으므로 NULL로 유지

-- 참고: 대부분의 시험 기준은 여러 자재 유형에 공통으로 적용되므로
--      material_large_category_id를 NULL로 유지하는 것이 적절합니다.
--      필요시 아래와 같은 형태로 추가 매핑 가능:

/*
-- 예시: 특정 시험을 여러 자재 유형에 매핑해야 하는 경우
-- (단, test_standard의 material_large_category_id는 단일 값만 가질 수 있으므로
--  다대다 관계가 필요하다면 별도의 매핑 테이블이 필요합니다)

-- 펌프 토출 관련 → 튜브(펌프)에도 적용
UPDATE test_standard 
SET material_large_category_id = 22, -- 튜브(펌프)
    updated_by = 1
WHERE company_id = 1 
  AND test_standard_code IN ('TS-011', 'TS-012');
*/

-- 매핑 결과 확인 쿼리
SELECT 
  ts.test_standard_id,
  ts.test_standard_code,
  ts.test_standard_name,
  ts.material_large_category_id,
  mlc.material_large_category_name
FROM 
  test_standard ts
LEFT JOIN 
  material_large_category mlc 
  ON ts.material_large_category_id = mlc.material_large_category_id
WHERE 
  ts.company_id = 1
ORDER BY 
  ts.sort_order;
