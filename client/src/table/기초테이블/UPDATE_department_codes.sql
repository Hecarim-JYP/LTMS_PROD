-- ============================================
-- 부서 테이블 코드 자동 생성 UPDATE 쿼리 (영문 약자 방식)
-- 작성일: 2026-03-06
-- 설명: 각 name 값을 영어로 번역한 약자로 code 매핑
-- ============================================

-- 1. company_code 업데이트 (회사명)
UPDATE department SET company_code = 'ALL' WHERE company_name = '전사';
UPDATE department SET company_code = 'CK' WHERE company_name = '(주)코스메카코리아';
UPDATE department SET company_code = 'CNSU' WHERE company_name = '중국소주법인';
UPDATE department SET company_code = 'CNGZ' WHERE company_name = '중국광주법인';
UPDATE department SET company_code = 'CNPH' WHERE company_name = '중국평호법인';
UPDATE department SET company_code = 'USA' WHERE company_name = '잉글우드 USA';
UPDATE department SET company_code = 'CN' WHERE company_name = '중국법인';
UPDATE department SET company_code = 'CNSF' WHERE company_name = '중국소주공장';

-- 2. division_code 업데이트 (사업부)
UPDATE department SET division_code = 'ALL' WHERE division_name = '전사';
UPDATE department SET division_code = 'EXEC' WHERE division_name = '임원';
UPDATE department SET division_code = 'CNSU' WHERE division_name = '중국소주법인';
UPDATE department SET division_code = 'CNGZ' WHERE division_name = '중국광주법인';
UPDATE department SET division_code = 'PD' WHERE division_name = '생산사업부';
UPDATE department SET division_code = 'QHQ' WHERE division_name = '품질본부';
UPDATE department SET division_code = 'PTID' WHERE division_name = '생산기술혁신사업부';
UPDATE department SET division_code = 'MS' WHERE division_name = '경영지원사업부';
UPDATE department SET division_code = 'TRI' WHERE division_name = '기술연구원';
UPDATE department SET division_code = 'GS' WHERE division_name = '글로벌영업사업부';
UPDATE department SET division_code = 'DXI' WHERE division_name = 'DX Innovation사업부';
UPDATE department SET division_code = 'MP' WHERE division_name = '경영기획사업부';
UPDATE department SET division_code = 'CNPH' WHERE division_name = '중국평호법인';
UPDATE department SET division_code = 'CN' WHERE division_name = '중국법인';
UPDATE department SET division_code = 'CK' WHERE division_name = '(주)코스메카코리아';
UPDATE department SET division_code = 'CHAIR' WHERE division_name = '대표이사 회장';
UPDATE department SET division_code = 'VCHAIR' WHERE division_name = '대표이사 부회장';
UPDATE department SET division_code = 'PRES' WHERE division_name = '사장';
UPDATE department SET division_code = 'AUD' WHERE division_name = '감사';
UPDATE department SET division_code = 'VCHAIR2' WHERE division_name = '부회장';

-- 3. department_code 업데이트 (부서)
UPDATE department SET department_code = 'ALL' WHERE department_name = '전사';
UPDATE department SET department_code = 'EXEC' WHERE department_name = '임원';
UPDATE department SET department_code = 'CNSU' WHERE department_name = '중국소주법인';
UPDATE department SET department_code = 'CNGZ' WHERE department_name = '중국광주법인';
UPDATE department SET department_code = 'PD' WHERE department_name = '생산사업부';
UPDATE department SET department_code = 'QHQ' WHERE department_name = '품질본부';
UPDATE department SET department_code = 'MHQ' WHERE department_name = '제조본부';
UPDATE department SET department_code = 'MS' WHERE department_name = '경영지원사업부';
UPDATE department SET department_code = 'TRI' WHERE department_name = '기술연구원';
UPDATE department SET department_code = 'DS' WHERE department_name = '국내영업본부';
UPDATE department SET department_code = 'DXI' WHERE department_name = 'DX Innovation사업부';
UPDATE department SET department_code = 'MP' WHERE department_name = '경영기획사업부';
UPDATE department SET department_code = 'CHAIR' WHERE department_name = '대표이사 회장';
UPDATE department SET department_code = 'VCHAIR' WHERE department_name = '대표이사 부회장';
UPDATE department SET department_code = 'PRES' WHERE department_name = '사장';
UPDATE department SET department_code = 'AUD' WHERE department_name = '감사';
UPDATE department SET department_code = 'CK' WHERE department_name = '(주)코스메카코리아';
UPDATE department SET department_code = 'CNSF' WHERE department_name = '중국소주공장';
UPDATE department SET department_code = 'CNPH' WHERE department_name = '중국평호법인';
UPDATE department SET department_code = 'CCM' WHERE department_name = 'CCM';
UPDATE department SET department_code = 'CCS' WHERE department_name = 'CCS';
UPDATE department SET department_code = 'CCB' WHERE department_name = 'CCB';
UPDATE department SET department_code = 'ES' WHERE department_name = 'EK영업본부';
UPDATE department SET department_code = 'OS' WHERE department_name = '해외영업본부';
UPDATE department SET department_code = 'PTID' WHERE department_name = '생산기술혁신사업부';
UPDATE department SET department_code = 'MS' WHERE department_name = '마케팅전략본부';
UPDATE department SET department_code = 'VCHAIR2' WHERE department_name = '부회장';

-- 4. team_code 업데이트 (팀)
UPDATE department SET team_code = 'ALL' WHERE team_name = '전사';
UPDATE department SET team_code = 'EXEC' WHERE team_name = '임원';
UPDATE department SET team_code = 'CNSU' WHERE team_name = '중국소주법인';
UPDATE department SET team_code = 'CNGZ' WHERE team_name = '중국광주법인';
UPDATE department SET team_code = 'PD' WHERE team_name = '생산사업부';
UPDATE department SET team_code = 'QC' WHERE team_name = '품질관리팀';
UPDATE department SET team_code = 'QA' WHERE team_name = '품질보증팀';
UPDATE department SET team_code = 'MFG' WHERE team_name = '제조팀';
UPDATE department SET team_code = 'SCM' WHERE team_name = 'SCM팀';
UPDATE department SET team_code = 'MS' WHERE team_name = '경영지원사업부';
UPDATE department SET team_code = 'FSM' WHERE team_name = '시설안전관리팀';
UPDATE department SET team_code = 'TRI' WHERE team_name = '기술연구원';
UPDATE department SET team_code = 'SM' WHERE team_name = '영업관리파트';
UPDATE department SET team_code = 'INNO' WHERE team_name = '혁신팀';
UPDATE department SET team_code = 'MPT' WHERE team_name = '경영기획팀';
UPDATE department SET team_code = 'CHAIR' WHERE team_name = '대표이사 회장';
UPDATE department SET team_code = 'VCHAIR' WHERE team_name = '대표이사 부회장';
UPDATE department SET team_code = 'PRES' WHERE team_name = '사장';
UPDATE department SET team_code = 'AUD' WHERE team_name = '감사';
UPDATE department SET team_code = 'CK' WHERE team_name = '(주)코스메카코리아';
UPDATE department SET team_code = 'CNSF' WHERE team_name = '중국소주공장';
UPDATE department SET team_code = 'CNPH' WHERE team_name = '중국평호법인';
UPDATE department SET team_code = 'FA' WHERE team_name = '재무회계팀';
UPDATE department SET team_code = 'RA' WHERE team_name = '규제연구팀';
UPDATE department SET team_code = 'CCM' WHERE team_name = 'CCM';
UPDATE department SET team_code = 'CCS' WHERE team_name = 'CCS';
UPDATE department SET team_code = 'HR' WHERE team_name = '인사총무팀';
UPDATE department SET team_code = 'USA' WHERE team_name = '잉글우드 USA';
UPDATE department SET team_code = 'CN' WHERE team_name = '중국법인';
UPDATE department SET team_code = 'DXI' WHERE team_name = 'DX Innovation사업부';
UPDATE department SET team_code = 'IT' WHERE team_name = 'IT전략팀';
UPDATE department SET team_code = 'PI' WHERE team_name = '공정개선팀';
UPDATE department SET team_code = 'CCB' WHERE team_name = 'CCB';
UPDATE department SET team_code = 'BR' WHERE team_name = '기반연구팀';
UPDATE department SET team_code = 'CP' WHERE team_name = '커뮤니케이션파트';
UPDATE department SET team_code = 'COMP' WHERE team_name = '준법감사팀';
UPDATE department SET team_code = 'QHQ' WHERE team_name = '품질본부';
UPDATE department SET team_code = 'MP' WHERE team_name = '경영기획사업부';
UPDATE department SET team_code = 'PKG' WHERE team_name = '패키징비즈니스팀';
UPDATE department SET team_code = 'CCM1' WHERE team_name = 'CCM1팀';
UPDATE department SET team_code = 'CCM2' WHERE team_name = 'CCM2팀';
UPDATE department SET team_code = 'CCM3' WHERE team_name = 'CCM3팀';
UPDATE department SET team_code = 'CCB1' WHERE team_name = 'CCB1팀';
UPDATE department SET team_code = 'CCB2' WHERE team_name = 'CCB2팀';
UPDATE department SET team_code = 'CCS1' WHERE team_name = 'CCS1팀';
UPDATE department SET team_code = 'CCS2' WHERE team_name = 'CCS2팀';
UPDATE department SET team_code = 'CCS3' WHERE team_name = 'CCS3팀';
UPDATE department SET team_code = 'CCS4' WHERE team_name = 'CCS4팀';
UPDATE department SET team_code = 'FRAG' WHERE team_name = '향료팀';
UPDATE department SET team_code = 'MAT' WHERE team_name = '소재연구팀';
UPDATE department SET team_code = 'IPR' WHERE team_name = '지식재산권팀';
UPDATE department SET team_code = 'S1' WHERE team_name = '1팀';
UPDATE department SET team_code = 'S2' WHERE team_name = '2팀';
UPDATE department SET team_code = 'S3' WHERE team_name = '3팀';
UPDATE department SET team_code = 'S4' WHERE team_name = '4팀';
UPDATE department SET team_code = 'S5' WHERE team_name = '5팀';
UPDATE department SET team_code = 'EK' WHERE team_name = 'EK영업본부';
UPDATE department SET team_code = 'EKO' WHERE team_name = 'EK해외영업팀';
UPDATE department SET team_code = 'DS' WHERE team_name = '국내영업본부';
UPDATE department SET team_code = 'GS' WHERE team_name = '글로벌영업사업부';
UPDATE department SET team_code = 'OS' WHERE team_name = '해외영업본부';
UPDATE department SET team_code = 'OST' WHERE team_name = '해외영업팀';
UPDATE department SET team_code = 'P1' WHERE team_name = '생산1팀';
UPDATE department SET team_code = 'P2' WHERE team_name = '생산2팀';
UPDATE department SET team_code = 'VCHAIR2' WHERE team_name = '부회장';
UPDATE department SET team_code = 'MHQ' WHERE team_name = '제조본부';
UPDATE department SET team_code = 'MST1' WHERE team_name = '마케팅전략1팀';
UPDATE department SET team_code = 'MST2' WHERE team_name = '마케팅전략2팀';
UPDATE department SET team_code = 'PTID' WHERE team_name = '생산기술혁신사업부';
UPDATE department SET team_code = 'SHE' WHERE team_name = '산업안전보건팀';
UPDATE department SET team_code = 'OM' WHERE team_name = '외주관리팀';
UPDATE department SET team_code = 'MSB' WHERE team_name = '마케팅전략본부';

-- 5. part_code 업데이트 (파트)
UPDATE department SET part_code = 'ALL' WHERE part_name = '전사';
UPDATE department SET part_code = 'EXEC' WHERE part_name = '임원';
UPDATE department SET part_code = 'CNSU' WHERE part_name = '중국소주법인';
UPDATE department SET part_code = 'CNGZ' WHERE part_name = '중국광주법인';
UPDATE department SET part_code = 'PD' WHERE part_name = '생산사업부';
UPDATE department SET part_code = 'QC' WHERE part_name = '품질관리팀';
UPDATE department SET part_code = 'QA' WHERE part_name = '품질보증팀';
UPDATE department SET part_code = 'MFG' WHERE part_name = '제조팀';
UPDATE department SET part_code = 'BMFG' WHERE part_name = '기초제조파트';
UPDATE department SET part_code = 'CMFG' WHERE part_name = '색조제조파트';
UPDATE department SET part_code = 'CNSF' WHERE part_name = '중국소주공장';
UPDATE department SET part_code = 'WGH' WHERE part_name = '칭량파트';
UPDATE department SET part_code = 'ACC' WHERE part_name = '회계파트';
UPDATE department SET part_code = 'RMP' WHERE part_name = '원료구매파트';
UPDATE department SET part_code = 'PLAN' WHERE part_name = '계획관리파트';
UPDATE department SET part_code = 'CNPH' WHERE part_name = '중국평호법인';
UPDATE department SET part_code = 'BULK' WHERE part_name = '벌크파트';
UPDATE department SET part_code = 'TRS' WHERE part_name = '자금파트';
UPDATE department SET part_code = 'INV' WHERE part_name = '자재관리파트';
UPDATE department SET part_code = 'PKP' WHERE part_name = '부자재구매파트';
UPDATE department SET part_code = 'USA' WHERE part_name = '잉글우드 USA';
UPDATE department SET part_code = 'SEC' WHERE part_name = '보안지원파트';
UPDATE department SET part_code = 'RM' WHERE part_name = '원료파트';
UPDATE department SET part_code = 'MAT' WHERE part_name = '자재파트';
UPDATE department SET part_code = 'MICRO' WHERE part_name = '미생물파트';
UPDATE department SET part_code = 'ANAL' WHERE part_name = '분석파트';
UPDATE department SET part_code = 'CN' WHERE part_name = '중국법인';
UPDATE department SET part_code = 'RMMFG' WHERE part_name = '원료파트(제조팀)';
UPDATE department SET part_code = 'HR' WHERE part_name = '인사총무팀';
UPDATE department SET part_code = 'HRP' WHERE part_name = '인사파트';
UPDATE department SET part_code = 'GA' WHERE part_name = '총무파트';
UPDATE department SET part_code = 'LOG' WHERE part_name = '생산물류파트';
UPDATE department SET part_code = 'REG' WHERE part_name = '규제정보파트';
UPDATE department SET part_code = 'CCM' WHERE part_name = 'CCM';
UPDATE department SET part_code = 'CCS' WHERE part_name = 'CCS';
UPDATE department SET part_code = 'BULKMFG' WHERE part_name = '벌크파트(제조)';
UPDATE department SET part_code = 'FGQA' WHERE part_name = '완제품파트(품질보증)';
UPDATE department SET part_code = 'IT' WHERE part_name = 'IT전략팀';
UPDATE department SET part_code = 'OUT' WHERE part_name = '출고관리파트';
UPDATE department SET part_code = 'PI' WHERE part_name = '공정개선팀';
UPDATE department SET part_code = 'CCB' WHERE part_name = 'CCB';
UPDATE department SET part_code = 'MICROBIO' WHERE part_name = '미생물연구파트';
UPDATE department SET part_code = 'GO' WHERE part_name = 'GO Part';
UPDATE department SET part_code = 'RAT' WHERE part_name = '규제연구팀';
UPDATE department SET part_code = 'PKC' WHERE part_name = '포장재상용성연구파트';
UPDATE department SET part_code = 'EFF' WHERE part_name = '효능평가파트';
UPDATE department SET part_code = 'COM' WHERE part_name = '커뮤니케이션파트';
UPDATE department SET part_code = 'FA' WHERE part_name = '재무회계팀';
UPDATE department SET part_code = 'COMP' WHERE part_name = '준법감사팀';
UPDATE department SET part_code = 'QHQ' WHERE part_name = '품질본부';
UPDATE department SET part_code = 'MP' WHERE part_name = '경영기획사업부';
UPDATE department SET part_code = 'PKG' WHERE part_name = '패키징비즈니스팀';
UPDATE department SET part_code = 'DXI' WHERE part_name = 'DX Innovation사업부';
UPDATE department SET part_code = 'CCM1' WHERE part_name = 'CCM1팀';
UPDATE department SET part_code = 'CCM2' WHERE part_name = 'CCM2팀';
UPDATE department SET part_code = 'CCM3' WHERE part_name = 'CCM3팀';
UPDATE department SET part_code = 'DOM' WHERE part_name = '국내규제파트';
UPDATE department SET part_code = 'INT' WHERE part_name = '해외규제파트';
UPDATE department SET part_code = 'RSP' WHERE part_name = '연구지원파트';
UPDATE department SET part_code = 'CCB1' WHERE part_name = 'CCB1팀';
UPDATE department SET part_code = 'CCB2' WHERE part_name = 'CCB2팀';
UPDATE department SET part_code = 'BR' WHERE part_name = '기반연구팀';
UPDATE department SET part_code = 'CCS1' WHERE part_name = 'CCS1팀';
UPDATE department SET part_code = 'CCS2' WHERE part_name = 'CCS2팀';
UPDATE department SET part_code = 'CCS3' WHERE part_name = 'CCS3팀';
UPDATE department SET part_code = 'CCS4' WHERE part_name = 'CCS4팀';
UPDATE department SET part_code = 'FRAG' WHERE part_name = '향료팀';
UPDATE department SET part_code = 'MATR' WHERE part_name = '소재연구팀';
UPDATE department SET part_code = 'MATD' WHERE part_name = '소재개발파트';
UPDATE department SET part_code = 'IPR' WHERE part_name = '지식재산권팀';
UPDATE department SET part_code = 'S1' WHERE part_name = '1팀';
UPDATE department SET part_code = 'S2' WHERE part_name = '2팀';
UPDATE department SET part_code = 'S3' WHERE part_name = '3팀';
UPDATE department SET part_code = 'S4' WHERE part_name = '4팀';
UPDATE department SET part_code = 'EK' WHERE part_name = 'EK영업본부';
UPDATE department SET part_code = 'EKO' WHERE part_name = 'EK해외영업팀';
UPDATE department SET part_code = 'DS' WHERE part_name = '국내영업본부';
UPDATE department SET part_code = 'GS' WHERE part_name = '글로벌영업사업부';
UPDATE department SET part_code = 'OS' WHERE part_name = '해외영업본부';
UPDATE department SET part_code = 'OST' WHERE part_name = '해외영업팀';
UPDATE department SET part_code = 'P1' WHERE part_name = '1 파트';
UPDATE department SET part_code = 'P2' WHERE part_name = '2 파트';
UPDATE department SET part_code = 'P3' WHERE part_name = '3 파트';
UPDATE department SET part_code = 'TS' WHERE part_name = '기술전략파트';
UPDATE department SET part_code = 'CHAIR' WHERE part_name = '대표이사 회장';
UPDATE department SET part_code = 'VCHAIR' WHERE part_name = '대표이사 부회장';
UPDATE department SET part_code = 'PRES' WHERE part_name = '사장';
UPDATE department SET part_code = 'AUD' WHERE part_name = '감사';
UPDATE department SET part_code = 'CK' WHERE part_name = '(주)코스메카코리아';
UPDATE department SET part_code = 'SM' WHERE part_name = '영업관리파트';
UPDATE department SET part_code = 'MS' WHERE part_name = '경영지원사업부';
UPDATE department SET part_code = 'FSM' WHERE part_name = '시설안전관리팀';
UPDATE department SET part_code = 'TRI' WHERE part_name = '기술연구원';
UPDATE department SET part_code = 'SCM' WHERE part_name = 'SCM팀';
UPDATE department SET part_code = 'VCHAIR2' WHERE part_name = '부회장';
UPDATE department SET part_code = 'MHQ' WHERE part_name = '제조본부';
UPDATE department SET part_code = 'INNO' WHERE part_name = '제조혁신파트';
UPDATE department SET part_code = 'S5' WHERE part_name = '5팀';
UPDATE department SET part_code = 'MST1' WHERE part_name = '마케팅전략1팀';
UPDATE department SET part_code = 'MST2' WHERE part_name = '마케팅전략2팀';
UPDATE department SET part_code = 'AS' WHERE part_name = '분석&안정성평가파트';
UPDATE department SET part_code = 'PTID' WHERE part_name = '생산기술혁신사업부';
UPDATE department SET part_code = 'SHE' WHERE part_name = '산업안전보건팀';
UPDATE department SET part_code = 'OM' WHERE part_name = '외주관리팀';
UPDATE department SET part_code = 'MSB' WHERE part_name = '마케팅전략본부';

-- ============================================
-- 업데이트 결과 확인
-- ============================================
SELECT 
    department_id,
    company_code, company_name,
    division_code, division_name,
    department_code, department_name,
    team_code, team_name,
    part_code, part_name
FROM department
ORDER BY department_id
LIMIT 20;

-- 각 레벨별 고유 코드 개수 확인
SELECT 
    COUNT(DISTINCT company_code) as 회사코드수,
    COUNT(DISTINCT division_code) as 사업부코드수,
    COUNT(DISTINCT department_code) as 부서코드수,
    COUNT(DISTINCT team_code) as 팀코드수,
    COUNT(DISTINCT part_code) as 파트코드수
FROM department;
