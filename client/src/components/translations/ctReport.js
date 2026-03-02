/**
 * 파일명 : ctReport.js
 * 용도 : CT 성적서 다국어 번역 객체
 * 최초등록 : 2026-02-20
 * 수정일자 : 
 * 수정사항 : 
 */

export const ctTranslations = {
  KOR: {
    // ========== 페이지 제목 및 기본 버튼 ==========
    pageTitle: "자재 상용성 시험 성적서",
    save: "저장",
    preview: "미리보기",
    close: "닫기",
    print: "인쇄",
    downloadPDF: "PDF 다운로드",
    
    // ========== 기본 정보 ==========
    ctNo: "CT No.",
    client: "시험 의뢰자",
    specific: "비중",
    productName: "제품명",
    formulationManager: "제형 담당자",
    viscosity: "점도/경도",
    desiredVolume: "희망 용량",
    labNo: "랩넘버",
    testStartDate: "시험 시작일",
    requestOrder: "의뢰 차수",
    formulationNotes: "제형 특이사항",
    testEndDate: "시험 종료일",
    requestQuantity: "의뢰 수량",
    
    // ========== 의뢰 정보 ==========
    materialSupplier: "자재 업체",
    materialImage: "의뢰 자재 사진",
    materialInfo: "의뢰 자재 정보",
    
    // ========== 시험 항목 ==========
    addTest: "시험 추가",
    deleteTest: "시험 삭제",
    loadPreviousTest: "이전 시험 불러오기",
    testNo: "시험법 번호",
    testName: "시험 항목",
    testStandard: "시험 기준",
    testResult: "시험 성적",
    testSummary: "시험 종합 의견",
    remark: "비고",
    attachedImage: "첨부 이미지",
    attach: "첨부",
    
    // ========== 주의사항 ==========
    caution: "주의사항",
    volume: "용량 섹션",
    packaging: "포장재 섹션",
    compatibility: "상용성 섹션",
    
    // ========== 판정 ==========
    judgmentDate: "판정일자",
    dailyJudgment: "당일판정",
    finalJudgment: "최종판정",
    tester: "시험자",
    approver: "승인자",
    
    // ========== 플레이스홀더 ==========
    placeholders: {
      ctNo: "CT 번호를 입력해주세요",
      client: "의뢰자 이름 입력",
      productName: "제품명 입력",
      formulationManager: "담당자 이름 입력",
      viscosity: "점도 / 경도 입력",
      labNo: "랩넘버 입력",
      requestOrder: "차수 입력",
      materialSupplier: "업체명 입력",
      dragImage: "이미지를 드래그하여 추가하세요.",
      volumeContent: "용량 관련 내용을 입력하세요.",
      packagingContent: "포장재 관련 내용을 입력하세요.",
      compatibilityContent: "상용성 관련 내용을 입력하세요.",
      tester: "시험자 입력",
      approver: "승인자 입력"
    },
    
    // ========== 하단 주의사항 (성적서 하단) ==========
    notices: {
      qualityDisclaimer: "※ 이 성적서는 의뢰자가 제시한 시료로 기재된 기간 동안 시험한 결과로서,\n전체 제품에 대한 장기적인 품질이나 시료(재질, 사용, 내용물) 변경에 따른 품질은 보증하지 않음.",
      environmentDisclaimer: "※ 한국 내 환경에 맞추어 시험한 결과이므로, 국외에서는 해당 환경 및 조건에 따라 시험 결과가 다를 수 있음."
    }
  },
  
  EN: {
    // ========== Page Title & Basic Buttons ==========
    pageTitle: "Material Compatibility Test Report",
    save: "Save",
    preview: "Preview",
    close: "Close",
    print: "Print",
    downloadPDF: "Download PDF",
    
    // ========== Basic Information ==========
    ctNo: "CT No.",
    client: "Client",
    specific: "Specific Gravity",
    productName: "Product Name",
    formulationManager: "Formulation Manager",
    viscosity: "Viscosity/Hardness",
    desiredVolume: "Desired Volume",
    labNo: "Lab No.",
    testStartDate: "Test Start Date",
    requestOrder: "Request Order",
    formulationNotes: "Formulation Notes",
    testEndDate: "Test End Date",
    requestQuantity: "Request Quantity",
    
    // ========== Request Information ==========
    materialSupplier: "Material Supplier",
    materialImage: "Material Image",
    materialInfo: "Material Information",
    
    // ========== Test Items ==========
    addTest: "Add Test",
    deleteTest: "Delete Test",
    loadPreviousTest: "Load Previous Test",
    testNo: "Test No.",
    testName: "Test Item",
    testStandard: "Test Standard",
    testResult: "Test Result",
    testSummary: "Test Summary",
    remark: "Remark",
    attachedImage: "Attached Image",
    attach: "Attach",
    
    // ========== Cautions ==========
    caution: "Caution",
    volume: "Volume Section",
    packaging: "Packaging Section",
    compatibility: "Compatibility Section",
    
    // ========== Judgment ==========
    judgmentDate: "Judgment Date",
    dailyJudgment: "Daily Judgment",
    finalJudgment: "Final Judgment",
    tester: "Tester",
    approver: "Approver",
    
    // ========== Placeholders ==========
    placeholders: {
      ctNo: "Enter CT Number",
      client: "Enter Client Name",
      productName: "Enter Product Name",
      formulationManager: "Enter Manager Name",
      viscosity: "Enter Viscosity/Hardness",
      labNo: "Enter Lab Number",
      requestOrder: "Enter Order",
      materialSupplier: "Enter Supplier Name",
      dragImage: "Drag images here to add.",
      volumeContent: "Enter volume-related content.",
      packagingContent: "Enter packaging-related content.",
      compatibilityContent: "Enter compatibility-related content.",
      tester: "Enter Tester",
      approver: "Enter Approver"
    },
    
    // ========== Bottom Notices (Report Footer) ==========
    notices: {
      qualityDisclaimer: "※ This report is based on the test results of the sample provided by the client for the specified period.\nIt does not guarantee long-term quality of the entire product or quality changes due to alterations in the sample (material, use, contents).",
      environmentDisclaimer: "※ These test results are based on conditions suitable for the Korean environment.\nResults may vary in other countries depending on their specific environmental conditions."
    }
  }
};
