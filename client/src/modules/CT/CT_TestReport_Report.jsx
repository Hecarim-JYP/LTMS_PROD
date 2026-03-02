/**
 * 파일명 : CT_TestReport_Report.jsx
 * 용도 : CT 시험성적서 상세보기
 * 최초등록 : 2025-11-13 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import axios from "axios";

import { Common } from "/src/components/Common";
import { AuthContext } from "/src/contexts/AuthContext";
import * as Utils from "/src/components/Utils";
import useUrlInfo from "/src/hooks/useUrlInfo";
import useUrlNavigation from "/src/hooks/useUrlNavigation";

import CT_SubNav from "/src/modules/CT/CT_SubNav";
import CT_TestReport_PDFModal from "/src/modules/CT/CT_TestReport_PDFModal";
import { ctTranslations } from "/src/components/translations/ctReport";

export default function CT_TestReport_Report() {

  /**
   * 사용자 정보 컨텍스트
   */
  const { user } = useContext(AuthContext);
  const companyId = user.company_id;  // 회사 ID
  const userId = user.user_id;        // 사용자 ID

  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY; // 오늘 날짜
  const G_STARTDAY = Common.G_STARTDAY; // 오늘로부터 7일
  const textareaMaxHeight = 150; // 텍스트에어리어 최대 높이
  const url = useUrlInfo(); // 커스텀 훅 - URL 정보 관리
  const ctRequestId = url.query.ct_request_id || ""; // CT 의뢰 ID (수정 모드일 경우 URL 파라미터로 전달됨)
  const reportId = url.query.ct_test_report_id || ""; // CT 성적서 ID (수정 모드일 경우 URL 파라미터로 전달됨)
  const mode = url.query.mode ? url.query.mode : "create"; // 화면 모드 (create / update)
  
  // API 서버 주소 설정
  // 환경 변수가 없으면 상대 경로로 요청 (개발 시 proxy 사용)
  const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;


  /**
   * goToPage : 페이지 이동 함수
   */
  const goToPage = useUrlNavigation();


  /**
   * --- 조회 통신에 사용될 state 객체 ---
   * loading, setLoading : request 요청 응답 여부
   */
  const [loading, setLoading] = useState(null);


  /* =============================== 훅 관리 =============================== */
  /**
   * ============================================================
   * 동적 옵션 데이터 state
   * ------------------------------------------------------------
   * HOW : 각 셀렉트 박스별로 옵션 데이터를 관리하는 state
   *       초기값은 "전체" 또는 기본 옵션만 포함
   * WHY : DB에서 조회한 데이터를 저장하고 렌더링에 사용하기 위함
   * ============================================================
   */
  const [judgmentOptions, setJudgmentOptions] = useState([
    {
      judgment_id: "",
      judgment_code: "",
      judgment_name: "판정여부",
      is_active: "",
      sort_order: ""
    }
  ]);


  /**
   * 옵션 로딩 상태 관리
   * ------------------------------------------------------------
   * HOW : 각 옵션별 로딩 상태를 boolean으로 관리
   * WHY : 옵션 데이터 로딩 중 UI 피드백을 제공하거나
   *       로딩 완료 여부를 확인하기 위함
   */
  const [optionsLoading, setOptionsLoading] = useState({
    judgment: true
  });


  const refModalSearchHistory = useRef(null);
  const dateToSrchRef = useRef(null);
  const dateFromSrchRef = useRef(null);


  // 동적 섹션 textarea ref 추가
  const volumeSectionTextareaRefs = useRef({});
  const packagingSectionTextareaRefs = useRef({});
  const compatibilitySectionTextareaRefs = useRef({});

  // ID 카운터 ref 추가 (순차적 숫자 ID 생성용)
  const testItemIdCounter = useRef(1);
  const volumeSectionIdCounter = useRef(1);
  const packagingSectionIdCounter = useRef(1);
  const compatibilitySectionIdCounter = useRef(1);

  // 이미지 파일 input ref 추가 (시험항목용)
  const testItemImageInputRefs = useRef({});

  // 시험항목 textarea ref 추가
  const testItemTextareaRefs = useRef({});

  // 의뢰 자재 정보 ref 추가
  const materialDescriptionRef = useRef(null);

  /**
   * 제형 특이사항 ref 추가
   */
  const formulationNotesRef = useRef(null);


  /**
   * PDF 모달 오픈 상태
   */
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // 삭제할 첨부파일 ID 목록 (서버에 존재하는 파일 중 삭제할 파일의 ID를 저장)
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]);


  /**
   * 성적서 데이터 통합 관리 state (데이터베이스 컬럼명과 일치)
   * - 화면에서 작성된 모든 데이터를 계층적 구조로 관리
   * - PDF 출력 및 저장 시 사용
   */
  const [reportData, setReportData] = useState({
    basicInfo: {
      ct_test_report_id: "",
      ct_request_id: "",
      ct_no: "",
      client_id: "",
      client_name: "",
      sample_id: "",
      sample_name: "",
      sales_manager_id: "",
      sales_manager_name: "",
      labs_manager_id: "",
      labs_manager_name: "",
      formulation_manager: "",
      formulation_manager_id: "",
      desired_volume: "",
      lab_no: "",
      lab_no_id: "",
      ct_receipt_date: "",
      ct_due_date: "",
      ct_test_seq: "",
      ct_test_seq_id: "",
      sample_quantity: "",
      sample_etc: "",
      sample_remark: "",
      specific: "",
      viscosity_hardness: ""
    },
    requestInfo: {
      material_supplier_id: "",
      material_supplier_name: "",
      material_description: "",
      material_image: []
    },
    testItems: [],
    cautions: {
      volume: {
        sections: []
      },
      packaging: {
        sections: []
      },
      compatibility: {
        sections: []
      }
    },
    judgment: {
      judgment_date: "",
      daily_judgment_id: "",
      daily_judgment_name: "",
      final_judgment_id: "",
      final_judgment_name: "",
      tester_id: "",
      tester_name: "",
      tester: "",
      approver_id: "",
      approver_name: "",
      approver: ""
    }
  });

  /**
   * 이전 성적서 조회 조건 입력 폼 객체
   */
  const [searchHistoryForm, setSearchHistoryForm] = useState({
    "history_search_type" : "REQ",      // 조회기준 기본값은 CT 의뢰일자로 할당
    "history_search_from" : G_STARTDAY, // 조회기간 시작
    "history_search_to" : G_TODAY,      // 조회기간 끝
    "history_ct_no" : "",             // CT 번호
    "history_ct_content" : ""           // 검색어
  });


  /**
   * 종합 의견 조회 조건 입력 폼 객체
   */
  const [searchRemarkForm, setSearchRemarkForm] = useState({
    "remark_search_type" : "REQ",       // 조회기준 기본값은 CT 의뢰일자로 할당
    "remark_search_from" : G_STARTDAY,  // 조회기간 시작
    "remark_search_to" : G_TODAY,       // 조회기간 끝
    "remark_material_type" : "",        // 자재유형
    "remark_ct_content" : ""            // 검색어
  });


  /**
   * 이미지 첨부 관련 state
   */
  const [images, setImages] = useState([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
    

  /**
   * 선택된 시험항목 행의 ID 목록 (체크박스 선택 상태 관리)
   * - 용도: 삭제할 행 식별, 전체 선택/해제 기능
   * - 예: [1, 3, 4] → id가 1, 3, 4인 행이 체크됨
   */
  const [selectedRows, setSelectedRows] = useState([]);


  /**
   * ----- 시험 종합 의견 모달 관리 -----
   * isOpenModalSearchRemark, setIsOpenModalSearchRemark : 시험 종합 의견 모달 활성화 여부
   * refModalSearchRemark : 시험 종합 의견 모달 컴포넌트 참조
   * dateToRmkRef, dateFromRmkRef : 날짜 검증 시 포커스 할당을 위한 ref
   * remarkList, setRemarkList : 종합 의견 조회 결과 목록
   * remarkCurrentPage, setRemarkCurrentPage : 현재 페이지 번호
   * remarkPageSize : 페이지당 항목 수 (15개)
   */
  const [isOpenModalSearchRemark, setIsOpenModalSearchRemark] = useState(false);

  const [remarkList, setRemarkList] = useState([]);
  const [remarkCurrentPage, setRemarkCurrentPage] = useState(1);
  const [remarkPageSize] = useState(15);
  const [copiedRemarkId, setCopiedRemarkId] = useState(null);
  const [copiedTestItemField, setCopiedTestItemField] = useState(null); // 시험항목 필드 복사 상태 { itemId, field }
  const refModalSearchRemark = useRef(null);
  const dateToRmkRef = useRef(null);
  const dateFromRmkRef = useRef(null);
  

  /**
   * ----- 시험 기준 조회 모달 관리 -----
   * isOpenModalSearchTestStandard : 시험 기준 조회 모달 활성화 여부
   * refModalSearchTestStandard : 시험 기준 조회 모달 컴포넌트 참조
   * testStandardList : 시험 기준 조회 결과 목록 (전체 데이터)
   * testStandardQuery : 필터링용 검색어
   * testStandardCurrentPage : 현재 페이지
   * testStandardPageSize : 페이지당 표시 개수
   */
  const [isOpenModalSearchTestStandard, setIsOpenModalSearchTestStandard] = useState(false);
  const [testStandardList, setTestStandardList] = useState([]);
  const [testStandardQuery, setTestStandardQuery] = useState("");
  const [testStandardCurrentPage, setTestStandardCurrentPage] = useState(1);
  const [testStandardPageSize, setTestStandardPageSize] = useState(15);
  const refModalSearchTestStandard = useRef(null);


  /**
   * ----- 이전 성적서 조회 모달 관리 -----
   * isOpenModalSearchHistory, setIsOpenModalSearchHistory : 차수 조회 모달 활성화 여부
   * refModalSearchHistory : 차수 조회 모달 컴포넌트 참조
   * dateToSrchRef, dateFromSrchRef : 날짜 검증 시 포커스 할당을 위한 ref
   * historyList, setHistoryList : 이전 성적서 조회 결과 목록
   * historyCurrentPage, setHistoryCurrentPage : 현재 페이지 번호
   * historyPageSize : 페이지당 항목 수 (15개)
   */
  const [isOpenModalSearchHistory, setIsOpenModalSearchHistory] = useState({
    open: false,
    targetId: "",
    position: { top: 0, left: 0 },
  });

  const [historyList, setHistoryList] = useState([]);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyPageSize] = useState(15);

  /**
   * selectedHistoryId : 이전 성적서 조회에서 선택된 성적서 ID
   */
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);


  /**
   * ----- 다국어 지원 -----
   * language : 현재 선택된 언어 (KOR, CPNP, EN_EXCEL)
   */
  const [language, setLanguage] = useState("KOR");

  // 현재 언어의 번역 객체 (KOR, CPNP, EN_EXCEL 모두 EN 사용)
  const t = language === "KOR" ? ctTranslations.KOR : ctTranslations.EN;

  /**
   * 언어 변경 핸들러
   */
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };


  /**
   * 모든 textarea 자동 높이 조절 (주의사항, 동적 섹션, 의뢰 자재 정보, 제형 특이사항)
   */
  useEffect(() => {
    // textarea 높이 자동 조절 공통 함수
    const adjustTextareaHeight = (textarea) => {
      if (!textarea) return;

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight > textareaMaxHeight) {
        textarea.style.height = `${textareaMaxHeight}px`;
        textarea.style.overflow = "auto";
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflow = "hidden";
      }
    };

    // 기본 textarea들 처리
    const basicTextareas = [
      materialDescriptionRef,
      formulationNotesRef
    ];
    
    basicTextareas.forEach(ref => {
      if (ref.current) {
        adjustTextareaHeight(ref.current);
      }
    });

    // 동적 섹션 textarea들 처리
    const dynamicSections = [
      { sections: reportData.cautions.volume.sections, refs: volumeSectionTextareaRefs },
      { sections: reportData.cautions.packaging.sections, refs: packagingSectionTextareaRefs },
      { sections: reportData.cautions.compatibility.sections, refs: compatibilitySectionTextareaRefs }
    ];

    dynamicSections.forEach(({ sections, refs }) => {
      sections.forEach(section => {
        adjustTextareaHeight(refs.current[section.ct_test_caution_id]);
      });
    });
  }, [
    reportData.requestInfo.material_description,
    reportData.basicInfo.sample_etc,
    reportData.cautions.volume.sections,
    reportData.cautions.packaging.sections,
    reportData.cautions.compatibility.sections
  ]);


  /**
   * 유효성 검즘 state - 조회 조건 입력 시 날짜 검증 등에 사용.
   */
  const [isValidated, setIsValidated] = useState(true);


  /**
   * findData_ERP : 필터 조건에 따른 ERP 기본 데이터를 조회
   * 
   * @param e : 이벤트 호출 컴포넌트
   * @param {String} type : 필터 조건 (client, sample, labNo, test_manager, formulation_manager, tester, approver, request_order)
   */
  const findData_ERP = (e, type) => {
    // TODO: 실제 DB 조회 로직 구현
    console.log("ERP 조회 타입:", type);
    console.log("검색어:", e.target.value);
    
    // 예시: 조회 후 결과를 모달로 보여주고 선택하면 hidden input에 PK 값 저장
    // 실제 구현 시 axios를 통한 API 호출 필요
  };


  /**
   * 공통 이미지 파일 처리 함수
   * @param {FileList|Array} files - 처리할 파일 목록
   * @param {Function} onSuccess - 성공 시 실행할 콜백 (처리된 이미지 배열을 인자로 받음)
   * @returns {void}
   */
  const processImageFiles = (files, onSuccess) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith("image/")
    );

    if(imageFiles.length === 0) {
      alert("이미지 파일만 첨부 가능합니다.");
      return;
    }

    // 용량 초과 파일 체크
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_SIZE);
    const validFiles = oversizedFiles.length > 0 
      ? imageFiles.filter(file => file.size <= MAX_SIZE)
      : imageFiles;
    
    if(oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(", ");
      alert(`다음 파일의 용량이 5MB를 초과합니다:\n${fileNames}\n\n5MB 이하의 파일만 첨부 가능합니다.`);
      
      if(validFiles.length === 0) return;
    }

    // 이미지 객체 생성
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    onSuccess(newImages);
  };

  /**
   * 의뢰 자재 정보 이미지 추가 함수
   */
  const addImageFiles = (files) => {
    processImageFiles(files, (newImages) => {
      setImages(prev => [...prev, ...newImages]);
    });
  };


  /**
   * 파일 선택 input 처리
   */
  const handleImageFileChange = (e) => {
    if(e.target.files.length > 0) {
      addImageFiles(e.target.files);
      e.target.value = ""; // input 초기화
    }
  };


  /**
   * 이미지 드래그 앤 드롭 처리
   */
  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };


  const handleImageDragLeave = () => {
    setIsDraggingImage(false);
  };


  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    addImageFiles(e.dataTransfer.files);
  };


  /**
   * 이미지 삭제
   */
  const handleRemoveImage = (id, e) => {
    e.stopPropagation();
    
    if(confirm("이미지를 삭제하시겠습니까?")) {
      setImages(prev => {
        const removed = prev.find(img => img.ct_test_report_attachment_id === id);
        if(removed) {
          URL.revokeObjectURL(removed.preview);
        }
        return prev.filter(img => img.ct_test_report_attachment_id !== id);
      });
      setDeletedAttachmentIds(prev => [...prev, { ct_test_report_attachment_id: id }]); // 삭제할 첨부파일 ID 저장 (서버 전송용)
    }
  };


  /**
   * 이미지 클릭 시 원본 보기 (통합)
   * @param {Object|File} image - 의뢰 자재 이미지 객체 또는 시험항목 이미지 파일
   */
  const handleImageClick = (image) => {
    if (image instanceof File) {
      // 시험항목 이미지 (File 객체)
      setSelectedImage({
        preview: URL.createObjectURL(image),
        isFile: true,
        name: image.name
      });
    } else if (image.file_url) {
      // 서버에서 불러온 이미지 (file_url 존재)
      setSelectedImage({
        preview: `${API_BASE_URL}/api${image.file_url}`,
        isFile: false,
        name: image.file_name || 'image'
      });
    } else if (image.file) {
      // 동적 섹션 이미지 (file과 preview를 가진 객체)
      setSelectedImage({
        preview: image.preview,
        isFile: false,
        name: image.file?.name || 'image'
      });
    } else {
      // 의뢰 자재 이미지 (기존 객체)
      setSelectedImage({
        preview: image.preview,
        isFile: false
      });
    }
  };


  /**
   * 원본 이미지 모달 닫기
   */
  const handleCloseImageModal = () => {
    // File 객체에서 생성한 URL은 해제
    if (selectedImage?.isFile) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
  };


  /**
   * 컴포넌트 언마운트 시 메모리 정리
   * 주의: 의존성 배열을 비워서 마운트/언마운트 시에만 실행되도록 함
   */
  useEffect(() => {
    return () => {
      // 언마운트 시에만 URL 정리
      images.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      
      reportData.cautions.volume.sections.forEach(section => {
        section.images?.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
      });
      
      reportData.cautions.packaging.sections.forEach(section => {
        section.images?.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
      });
      
      reportData.cautions.compatibility.sections.forEach(section => {
        section.images?.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
      });
    };

  }, []);


  /**
   * ============================= reportData 업데이트 핸들러 함수 =============================
   */

  /**
   * basicInfo 필드 업데이트
   * @param {string} field - 업데이트할 필드명
   * @param {string} value - 새로운 값
   */
  const handleBasicInfoChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };


  /**
   * requestInfo 필드 업데이트
   * @param {string} field - 업데이트할 필드명
   * @param {string} value - 새로운 값
   */
  const handleRequestInfoChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      requestInfo: {
        ...prev.requestInfo,
        [field]: value
      }
    }));
  };


  /**
   * judgment 필드 업데이트
   * @param {string} field - 업데이트할 필드명
   * @param {string} value - 새로운 값
   */
  const handleJudgmentChange = (field, value) => {
    setReportData(prev => ({
      ...prev,
      judgment: {
        ...prev.judgment,
        [field]: value
      }
    }));
  };


  /**
   * checkValid : 날짜 유효성 체크 함수
   * ----------------------------------------------------
   * WHY : date_from 날짜가 date_to 날짜보다 미래일 수 없음.
   * 
   * @param {*} e : 이벤트 호출 컴포넌트
   * @param {*} targetObj : 검증 대상 객체 
   * Ex : "searchFrom" : searchHistoryForm.history_search_from,
   *      "searchTo" : searchHistoryForm.history_search_to,
   *      "fromRef" : dateFromSrchRef,
   *      "toRef" : dateToSrchRef
   * 
   * @returns : 검증 여부에 따라 Boolean 반환
   */
  const checkValid = async (e, targetObj) => {

    const isDateFrom = Utils.isValidDate(new Date(targetObj.searchFrom))
    const isDateTo = Utils.isValidDate(new Date(targetObj.searchTo))
    
    // 시작일자가 종료일자보다 미래일 수 없음.
    if(targetObj.searchFrom > targetObj.searchTo || !isDateFrom || !isDateTo) {
      setIsValidated(false);
      if(!isDateFrom) {
        targetObj.fromRef.current.focus();
      } else if(!isDateTo) {
        targetObj.toRef.current.focus();
      } else {
        targetObj.toRef.current.focus();
      }
      return false;
    } else {
      setIsValidated(true);
      return true;
    }

  };


  /**
   * handleSearchHistoryInput : 차수 조회 폼 값 바인딩
   * ---------------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const handleSearchHistoryInput = (e) => {
    const { name, value } = e.target;
    setSearchHistoryForm((prev) => ({...prev, [name] : value}));
  };


  /**
   * handleSearchRemarkInput : 차수 조회 폼 값 바인딩
   * ---------------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const handleSearchRemarkInput = (e) => {
    const { name, value } = e.target;
    setSearchRemarkForm((prev) => ({...prev, [name] : value}));
  };


  /**
   * searchHistory : 이전 성적서 조회 함수
   * ---------------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const searchHistory = async (e) => {

    const targetObj = {
      "searchFrom" : searchHistoryForm.history_search_from,
      "searchTo" : searchHistoryForm.history_search_to,
      "fromRef" : dateFromSrchRef,
      "toRef" : dateToSrchRef
    };

    if(!await checkValid(e, targetObj)) return;

    const params = Utils.cleanParams(searchHistoryForm);
    params.company_id = companyId;
    
    try {
      const response = await axios.get('/api/ltms/ct/test-report/history', { params });
      
      if (response.data.success) {
        const historyData = response.data.data?.result || [];
        setHistoryList(historyData);
        setHistoryCurrentPage(1); // 검색 후 첫 페이지로 이동
        console.log('조회 결과:', historyData);
      } else {
        alert('조회에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
        setHistoryList([]);
      }
    } catch (error) {
      console.error('조회 실패:', error);
      alert('조회 중 오류가 발생했습니다.\n' + (error.response?.data?.message || error.message));
      setHistoryList([]);
    }
  };


  /**
   * handleSelectHistory : 이전 성적서 행 선택 핸들러
   * ---------------------------------------------------------
   * @param {*} reportId : 선택된 성적서 ID
   */
  const handleSelectHistory = (reportId) => {
    console.log("선택된 성적서 ID:", reportId);
    setSelectedHistoryId(reportId);
  };


  /**
   * 이전 성적서 페이징 처리
   * - historyTotalPages: 전체 페이지 수
   * - paginatedHistoryList: 현재 페이지에 표시할 데이터
   */
  const historyTotalPages = useMemo(() => {
    return Math.ceil(historyList.length / historyPageSize);
  }, [historyList, historyPageSize]);

  const paginatedHistoryList = useMemo(() => {
    const start = (historyCurrentPage - 1) * historyPageSize;
    return historyList.slice(start, start + historyPageSize);
  }, [historyList, historyPageSize, historyCurrentPage]);


  /**
   * 이전 성적서 페이지 번호 배열 (10개 단위 페이지 그룹)
   */
  const compactHistoryPages = useMemo(() => {
    const G_PAGEGROUPCOUNT = 10;
    const startPage = Math.floor((historyCurrentPage - 1) / G_PAGEGROUPCOUNT) * G_PAGEGROUPCOUNT + 1;
    const endPage = Math.min(startPage + G_PAGEGROUPCOUNT - 1, historyTotalPages);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [historyCurrentPage, historyTotalPages]);


  /**
   * 이전 성적서 페이징 함수들
   */
  const moveHistoryPage = (p) => setHistoryCurrentPage(p);
  
  const moveHistoryPrev = () => {
    const G_PAGEGROUPCOUNT = 10;
    const newPage = Math.max(1, historyCurrentPage - G_PAGEGROUPCOUNT);
    setHistoryCurrentPage(newPage);
  };
  
  const moveHistoryNext = () => {
    const G_PAGEGROUPCOUNT = 10;
    const newPage = Math.min(historyTotalPages, historyCurrentPage + G_PAGEGROUPCOUNT);
    setHistoryCurrentPage(newPage);
  };
  
  const moveHistoryFirst = () => setHistoryCurrentPage(1);
  
  const moveHistoryLast = () => setHistoryCurrentPage(historyTotalPages);


  /**
   * handleCloseHistoryModal : 이전 성적서 조회 모달 닫기 및 초기화
   * ---------------------------------------------------------
   * - 모달 닫기
   * - 검색 폼 초기화
   * - 조회 결과 목록 초기화
   * - 선택된 항목 초기화
   * - 페이징 초기화
   */
  const handleCloseHistoryModal = () => {
    // 모달 닫기
    setIsOpenModalSearchHistory({ open: false, targetId: "", position: { top: 0, left: 0 } });
    
    // 검색 폼 초기화
    setSearchHistoryForm({
      "history_search_type": "REQ",
      "history_search_from": G_STARTDAY,
      "history_search_to": G_TODAY,
      "history_ct_no": "",
      "history_ct_content": ""
    });
    
    // 조회 결과 목록 초기화
    setHistoryList([]);
    
    // 선택된 항목 초기화
    setSelectedHistoryId(null);

    // 페이징 초기화
    setHistoryCurrentPage(1);

    // 유효성 초기화
    setIsValidated(true);
  };


  /**
   * handleLoadHistory : 선택된 이전 성적서의 시험 항목만 불러오기
   * ---------------------------------------------------------
   * - 선택된 성적서의 시험 항목만 조회하여 현재 화면에 추가
   */
  const handleLoadHistory = async () => {
    if (!selectedHistoryId) {
      alert('성적서를 선택해주세요.');
      return;
    }

    const selectedHistory = historyList.find(h => h.ct_test_report_id === selectedHistoryId);

    if (!selectedHistory) {
      alert('선택된 성적서를 찾을 수 없습니다.');
      return;
    }

    try {

      const params = {
        company_id: companyId,
        ct_test_report_id: selectedHistoryId
      };

      // 선택된 성적서의 시험 항목 조회
      const response = await axios.get('/api/ltms/ct/test-report/test-items/', { params });
      
      if (response.data.success) {
        const testItems = response.data.data?.result || [];
        
        if (testItems.length === 0) {
          alert('해당 성적서에 시험 항목이 없습니다.');
          return;
        }
        
        // 시험 항목 ID 카운터 초기화
        testItemIdCounter.current = 1;
        
        // 기존 시험 항목 제거 후 새로운 시험 항목으로 교체
        // 임시 ID 생성 (순차적 임시 ID)
        const newTestItems = testItems.map((item, index) => ({
          ...item,
          ct_test_item_id: testItemIdCounter.current++, // 임시 순차 ID
          ct_test_report_id: reportId || "", // 현재 성적서 ID로 변경
          sort_order: index + 1,
          attachedImage: null, // 이미지는 초기화
          attached_image_url: ""
        }));
        
        setReportData(prev => ({
          ...prev,
          testItems: newTestItems // 기존 항목 제거하고 새로운 항목으로 교체
        }));
        
        // 모달 닫기 및 초기화
        handleCloseHistoryModal();
        
        alert(`${testItems.length}개의 시험 항목을 불러왔습니다.`);
      } else {
        alert('시험 항목 조회에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('시험 항목 조회 실패:', error);
      alert('시험 항목 조회 중 오류가 발생했습니다.\n' + (error.response?.data?.message || error.message));
    }
  };


  /**
   * searchRemark : 시험 종합 의견 조회 함수
   * ---------------------------------------------------------
   * @param {*} e : 이벤트 호출 컴포넌트
   */
  const searchRemark = async (e) => {

    const targetObj = {
      "searchFrom" : searchRemarkForm.remark_search_from,
      "searchTo" : searchRemarkForm.remark_search_to,
      "fromRef" : dateFromRmkRef,
      "toRef" : dateToRmkRef
    };

    if(!await checkValid(e, targetObj)) return;

    const params = {
      company_id: companyId,
      search_type: searchRemarkForm.remark_search_type,
      search_from: searchRemarkForm.remark_search_from,
      search_to: searchRemarkForm.remark_search_to,
      material_large_category_id: searchRemarkForm.remark_material_large_category_id,
      search_content: searchRemarkForm.remark_ct_content
    };
    
    try {
      const response = await axios.get('/api/ltms/ct/test-report/remark-history', { 
        params: Utils.cleanParams(params) 
      });
      
      if (response.data.success) {
        const remarkData = response.data.data?.result || [];
        setRemarkList(remarkData);
        setRemarkCurrentPage(1); // 검색 후 첫 페이지로 이동
        console.log('조회 결과:', remarkData);
      } else {
        alert('조회에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
        setRemarkList([]);
      }
    } catch (error) {
      console.error('조회 실패:', error);
      alert('조회 중 오류가 발생했습니다.\n' + (error.response?.data?.message || error.message));
      setRemarkList([]);
    }
  };


  /**
   * 종합 의견 모달 열기 (testSummary th 클릭)
   */
  const handleOpenRemarkModal = (e) => {
    setIsOpenModalSearchRemark(true);
  };

  /**
   * 종합 의견 모달 닫기 및 상태 초기화
   */
  const handleCloseRemarkModal = () => {
    setIsOpenModalSearchRemark(false);
    
    setSearchRemarkForm({
      "remark_search_type": "REQ",
      "remark_search_from": G_STARTDAY,
      "remark_search_to": G_TODAY,
      "remark_material_large_category_id": "",
      "remark_ct_content": ""
    });

    setRemarkList([]);
    setRemarkCurrentPage(1);
    setCopiedRemarkId(null);
    setIsValidated(true);
  };

  /**
   * 종합 의견 텍스트 복사
   * @param {number} remarkId - 복사할 항목의 ID
   * @param {string} content - 복사할 내용
   */
  const handleCopyRemarkContent = async (remarkId, content) => {
    try {
      // Clipboard API 지원 여부 확인
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // 최신 Clipboard API 사용
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback: 구형 브라우저를 위한 execCommand 방식
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      // 복사 완료 표시
      setCopiedRemarkId(remarkId);
      
      // 2초 후 복사 표시 제거
      setTimeout(() => {
        setCopiedRemarkId(null);
      }, 2000);
    } catch (error) {
      console.error("복사 실패:", error);
      alert("복사에 실패했습니다.");
    }
  };

  /**
   * 시험항목 필드 복사
   * @param {number} itemId - 시험항목 ID
   * @param {string} field - 복사할 필드명 (test_no, test_name, test_standard 등)
   * @param {string} content - 복사할 내용
   */
  const handleCopyTestItemField = async (itemId, field, content) => {
    try {
      if (!content || content.trim() === '') {
        return; // 내용이 비어있으면 복사하지 않음
      }

      // Clipboard API 지원 여부 확인
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback: 구형 브라우저를 위한 execCommand 방식
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      // 복사 완료 표시
      setCopiedTestItemField({ itemId, field });
      
      // 2초 후 복사 표시 제거
      setTimeout(() => {
        setCopiedTestItemField(null);
      }, 2000);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  /**
   * 종합 의견 페이징 처리
   * - remarkTotalPages: 전체 페이지 수
   * - paginatedRemarkList: 현재 페이지에 표시할 데이터
   */
  const remarkTotalPages = useMemo(() => {
    return Math.ceil(remarkList.length / remarkPageSize);
  }, [remarkList, remarkPageSize]);

  const paginatedRemarkList = useMemo(() => {
    const start = (remarkCurrentPage - 1) * remarkPageSize;
    return remarkList.slice(start, start + remarkPageSize);
  }, [remarkList, remarkPageSize, remarkCurrentPage]);


  /**
   * 종합 의견 페이지 번호 배열 (10개 단위 페이지 그룹)
   */
  const compactRemarkPages = useMemo(() => {
    const G_PAGEGROUPCOUNT = 10;
    const startPage = Math.floor((remarkCurrentPage - 1) / G_PAGEGROUPCOUNT) * G_PAGEGROUPCOUNT + 1;
    const endPage = Math.min(startPage + G_PAGEGROUPCOUNT - 1, remarkTotalPages);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [remarkCurrentPage, remarkTotalPages]);


  /**
   * 종합 의견 페이징 함수들
   */
  const moveRemarkPage = (p) => setRemarkCurrentPage(p);
  
  const moveRemarkPrev = () => {
    const G_PAGEGROUPCOUNT = 10;
    const newPage = Math.max(1, remarkCurrentPage - G_PAGEGROUPCOUNT);
    setRemarkCurrentPage(newPage);
  };
  
  const moveRemarkNext = () => {
    const G_PAGEGROUPCOUNT = 10;
    const newPage = Math.min(remarkTotalPages, remarkCurrentPage + G_PAGEGROUPCOUNT);
    setRemarkCurrentPage(newPage);
  };
  
  const moveRemarkFirst = () => setRemarkCurrentPage(1);
  
  const moveRemarkLast = () => setRemarkCurrentPage(remarkTotalPages);

  /**
   * 종합 의견 모달 외부 클릭 시 닫기
   */
  useEffect(() => {
    const handleCloseModal = (e) => {
      if (
        isOpenModalSearchRemark &&
        refModalSearchRemark.current &&
        !refModalSearchRemark.current.contains(e.target)
      ) {
        handleCloseRemarkModal();
      }
    };

    if (isOpenModalSearchRemark) {
      document.addEventListener("mousedown", handleCloseModal);
    }

    return () => {
      document.removeEventListener("mousedown", handleCloseModal);
    };
  }, [isOpenModalSearchRemark, G_STARTDAY, G_TODAY]);


  // 이전 성적서 조회 모달 열기
  useEffect(() => {
    const openModalSearch = (e) => {
      if(e.target.tagName === "BUTTON" && e.target.id.startsWith("searchReportHistory")) {
        const rect = e.target.getBoundingClientRect();
        setIsOpenModalSearchHistory({
          open: true,
          targetId: e.target.id,
          position: { top: rect.bottom + window.scrollY + 10, left: rect.left + window.scrollX },
        });
      }
    };

    document.addEventListener("click", openModalSearch);

    return () => {
      document.removeEventListener("click", openModalSearch);
    }
  }, []);


  // 이전 성적서 조회 모달 닫기
  useEffect(() => {
    
    const closeModalSearch = (e) => {
        if(refModalSearchHistory.current && !refModalSearchHistory.current.contains(e.target)) {
          handleCloseHistoryModal();
        }
    };

    document.addEventListener("mousedown", closeModalSearch);

    return () => {
      document.removeEventListener("mousedown", closeModalSearch);
    }
  }, []);
  

  /**
   * Blob URL을 base64로 변환하고 리사이징하는 함수
   * @param {string|File} source - blob URL 또는 File 객체
   * @param {number} maxWidth - 최대 너비 (기본값: 1200)
   * @param {number} maxHeight - 최대 높이 (기본값: 1200)
   * @param {number} quality - JPEG 품질 0-1 (기본값: 0.8)
   * @returns {Promise<string>} - base64 데이터 URL
   */
  const blobUrlToBase64 = async (source, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    try {
      let blob;
      
      // File 객체인 경우 바로 사용
      if (source instanceof File) {
        blob = source;
      } else if (typeof source === 'string') {
        // Blob URL인 경우 fetch
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        blob = await response.blob();
      } else {
        throw new Error('Invalid source type');
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = () => {
            // 원본 이미지 크기
            let width = img.width;
            let height = img.height;
            
            // 비율을 유지하면서 최대 크기로 리사이징
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = width * ratio;
              height = height * ratio;
            }
            
            // Canvas 생성
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Canvas를 base64로 변환
            const base64 = canvas.toDataURL('image/jpeg', quality);
            resolve(base64);
          };
          
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
    });
    } catch (error) {
      console.error('Blob URL 변환 실패:', error);
      // 에러 발생 시 원본 반환 (File 객체인 경우)
      if (source instanceof File) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(source);
        });
      }
      return null;
    }
  };

  /**
   * PDF 모달 열기
   * - 모달 창으로 CT_TestReport_PDFContent를 띄움
   * - sessionStorage를 통해 데이터 전달
   */
  const handlePdfPreview = async () => {
    try {
      // 이미지를 base64로 변환
      const processedImages = await Promise.all(
        images.map(async (img) => {
          const base64 = await blobUrlToBase64(img.file || img.preview);
          return {
            preview: base64,
            id: img.ct_test_report_attachment_id
          };
        })
      );

      // 시험항목 이미지도 처리
      const processedTestItems = await Promise.all(
        reportData.testItems.map(async (item) => {
          let processedImage = null;
          if (item.attachedImage) {
            const base64 = await blobUrlToBase64(item.attachedImage);
            processedImage = {
              name: item.attachedImage.name,
              preview: base64
            };
          }
          return {
            ...item,
            attachedImage: processedImage
          };
        })
      );

      // 주의사항 - 용량 동적 섹션 이미지 처리
      const processedVolumeSections = await Promise.all(
        reportData.cautions.volume.sections.map(async (section) => {
          const processedSectionImages = await Promise.all(
            section.images.map(async (img) => {
              const base64 = await blobUrlToBase64(img.file || img.preview);
              return {
                preview: base64,
                id: img.ct_test_report_attachment_id
              };
            })
          );
          return {
            ...section,
            images: processedSectionImages
          };
        })
      );

      // 주의사항 - 포장재 동적 섹션 이미지 처리
      const processedPackagingSections = await Promise.all(
        reportData.cautions.packaging.sections.map(async (section) => {
          const processedSectionImages = await Promise.all(
            section.images.map(async (img) => {
              const base64 = await blobUrlToBase64(img.file || img.preview);
              return {
                preview: base64,
                id: img.ct_test_report_attachment_id
              };
            })
          );
          return {
            ...section,
            images: processedSectionImages
          };
        })
      );

      // 주의사항 - 상용성 동적 섹션 이미지 처리
      const processedCompatibilitySections = await Promise.all(
        reportData.cautions.compatibility.sections.map(async (section) => {
          const processedSectionImages = await Promise.all(
            section.images.map(async (img) => {
              const base64 = await blobUrlToBase64(img.file || img.preview);
              return {
                preview: base64,
                id: img.ct_test_report_attachment_id
              };
            })
          );
          return {
            ...section,
            images: processedSectionImages
          };
        })
      );

      // 성적서 데이터 구성 및 state 업데이트
      const updatedReportData = {
        // 기본 정보 섹션 - reportData.basicInfo 사용
        basicInfo: {
          ...reportData.basicInfo,
          ct_due_date: reportData.basicInfo.ct_due_date || G_TODAY
        },
        
        // 의뢰 정보 섹션 - 이미지는 처리된 것으로 업데이트
        requestInfo: {
          ...reportData.requestInfo,
          images: processedImages
        },
        
        // 시험항목 데이터
        testItems: processedTestItems,
        
        // 주의사항 섹션
        cautions: {
          volume: {
            sections: processedVolumeSections
          },
          packaging: {
            sections: processedPackagingSections
          },
          compatibility: {
            sections: processedCompatibilitySections
          }
        },
        
        // 판정 및 서명 섹션 - reportData.judgment 사용
        judgment: {
          ...reportData.judgment,
          judgment_date: reportData.judgment.judgment_date || G_TODAY
        }
      };
      
      // reportData state 업데이트
      setReportData(updatedReportData);
      
      // sessionStorage에 데이터 저장 (언어 정보 포함)
      sessionStorage.setItem('pdfModalData', JSON.stringify({
        reportData: updatedReportData,
        language: language
      }));
      
      // 모달 열기
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error('PDF 모달 열기 실패:', error);
      alert('PDF 모달을 여는 중 오류가 발생했습니다.');
    }
  };


  /**
   * ============================= 시험항목 테이블 관련 함수 =============================
   *
   * 시험항목 행 추가 - 시험 기준 조회 모달 열기
   */
  const handleAddTestItem = () => {
    setIsOpenModalSearchTestStandard(true);
  };


  /**
   * 시험 기준 조회 모달 닫기
   */
  const handleCloseTestStandardModal = () => {
    setIsOpenModalSearchTestStandard(false);
    // 상태 초기화
    setTestStandardQuery("");
    setTestStandardCurrentPage(1);
  };


  /**
   * 시험 기준 필터링 처리
   * - testStandardQuery로 시험법 코드, 시험항목명, 자재유형, 시험 기준을 필터링
   */
  const filteredTestStandardList = useMemo(() => {
    if (!testStandardQuery.trim()) {
      return testStandardList;
    }
    
    const searchLower = testStandardQuery.toLowerCase().trim();
    return testStandardList.filter(standard => {
      return (
        standard.test_standard_code?.toLowerCase().includes(searchLower) ||
        standard.test_standard_name?.toLowerCase().includes(searchLower) ||
        standard.material_large_category_name?.toLowerCase().includes(searchLower) ||
        standard.test_guide?.toLowerCase().includes(searchLower)
      );
    });
  }, [testStandardList, testStandardQuery]);


  /**
   * 시험 기준 페이징 처리
   * - totalPages: 전체 페이지 수
   * - paginatedTestStandardList: 현재 페이지에 표시할 데이터
   */
  const testStandardTotalPages = useMemo(() => {
    return Math.ceil(filteredTestStandardList.length / testStandardPageSize);
  }, [filteredTestStandardList, testStandardPageSize]);

  const paginatedTestStandardList = useMemo(() => {
    const start = (testStandardCurrentPage - 1) * testStandardPageSize;
    return filteredTestStandardList.slice(start, start + testStandardPageSize);
  }, [filteredTestStandardList, testStandardPageSize, testStandardCurrentPage]);


  /**
   * 페이지 번호 배열 (10개 단위 페이지 그룹)
   */
  const compactTestStandardPages = useMemo(() => {
    const G_PAGEGROUPCOUNT = 10;
    const startPage = Math.floor((testStandardCurrentPage - 1) / G_PAGEGROUPCOUNT) * G_PAGEGROUPCOUNT + 1;
    const endPage = Math.min(startPage + G_PAGEGROUPCOUNT - 1, testStandardTotalPages);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [testStandardCurrentPage, testStandardTotalPages]);


  /**
   * fetchTestStandardList : 시험 기준 전체 목록 조회
   * ---------------------------------------------------------
   * WHAT : 서버에서 시험 기준 전체 목록을 조회
   * HOW : API 호출하여 결과를 testStandardList에 저장
   * WHY : 모달 열릴 때 자동으로 전체 목록을 가져와서 클라이언트에서 필터링 처리
   */
  const fetchTestStandardList = async () => {

    try {

      const params = {
        company_id: companyId
      };

      const response = await axios.get('/api/ltms/ct/test-standard/list', { params });
      const testStandards = response.data.data.result || [];

      if (response.data.success) {
        setTestStandardList(testStandards);
      }
    } catch (err) {
        let errMsg = err.response?.data?.message || "서버 응답 오류가 발생했습니다.";
        if (err.response) {
          // 서버가 4xx, 5xx 에러를 반환한 경우
          console.error("API Error:", err.response);
          alert(errMsg);
          
        } else if (err.request) {
          // 요청은 갔지만 응답이 없는 경우
          console.error("No Response:", err.request);
          errMsg += "\n네트워크 상태를 확인해주세요.";
          alert(errMsg);
        } else {
          // 기타 에러
          console.error("Request Error:", err.message);
          errMsg += "\n요청 처리 중 오류가 발생했습니다.";
          alert(errMsg);
        }
    } finally {
      // 추가 로직 (예: 로딩 상태 해제) 필요 시 여기에 작성
    }
  };

  /**
   * 시험 기준 모달 열릴 때 전체 목록 조회
   */
  useEffect(() => {
    if (isOpenModalSearchTestStandard) {
      fetchTestStandardList();
    }
  }, [isOpenModalSearchTestStandard]);


  /**
   * 특정 페이지로 이동
   */
  const moveTestStandardPage = (p) => setTestStandardCurrentPage(p);


  /**
   * 이전 페이지 그룹으로 이동
   */
  const moveTestStandardPrev = () => {
    const G_PAGEGROUPCOUNT = 10;
    const newPage = Math.max(1, testStandardCurrentPage - G_PAGEGROUPCOUNT);
    setTestStandardCurrentPage(newPage);
  };


  /**
   * 다음 페이지 그룹으로 이동
   */
  const moveTestStandardNext = () => {
    const G_PAGEGROUPCOUNT = 10;
    const newPage = Math.min(testStandardTotalPages, testStandardCurrentPage + G_PAGEGROUPCOUNT);
    setTestStandardCurrentPage(newPage);
  };


  /**
   * 맨 처음 페이지로 이동
   */
  const moveTestStandardFirst = () => setTestStandardCurrentPage(1);


  /**
   * 맨 마지막 페이지로 이동
   */
  const moveTestStandardLast = () => setTestStandardCurrentPage(testStandardTotalPages);


  /**
   * 시험 기준 선택 및 시험항목 추가
   */
  const handleSelectTestStandard = (standard) => {
    // 새로운 시험항목 추가 (데이터베이스 컬럼명 사용)
    const newItem = {
      ct_test_item_id: testItemIdCounter.current++,  // 임시 ID
      ct_test_report_id: reportId || "",
      test_id: standard.test_standard_id || "",
      test_standard_code: standard.test_standard_code || "",     // 시험법 코드
      test_standard_name: standard.test_standard_name || "",   // 시험항목명
      test_guide: standard.test_guide || "",       // 시험 기준
      result_type: standard.result_type || "",
      test_result: "",
      remark: "",
      note: "",
      attached_image_url: "",
      sort_order: reportData.testItems.length + 1,
      attachments: []
    };
    
    setReportData(prev => ({
      ...prev,
      testItems: [...prev.testItems, newItem]
    }));
    
    // 모달 닫기
    handleCloseTestStandardModal();
  };


  /**
   * 선택된 시험항목 행 삭제
   * - selectedRows에 있는 ID를 가진 행들을 reportData.testItems에서 제거
   */
  const handleDeleteTestItem = () => {
    if (selectedRows.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (confirm(`선택한 ${selectedRows.length}개의 항목을 삭제하시겠습니까?`)) {
      setReportData(prev => ({
        ...prev,
        testItems: prev.testItems.filter(item => !selectedRows.includes(item.ct_test_item_id))
      }));
      setSelectedRows([]); // 삭제 후 선택 초기화
    }
  };


  /**
   * 개별 체크박스 선택/해제
   * - itemId: 선택/해제할 행의 ID
   * - selectedRows에 ID 추가 또는 제거
   */
  const handleRowCheckbox = (itemId) => {
    setSelectedRows(prev => {
      if (prev.includes(itemId)) {
        // 이미 선택되어 있으면 제거
        return prev.filter(id => id !== itemId);
      } else {
        // 선택되어 있지 않으면 추가
        return [...prev, itemId];
      }
    });
  };


  /**
   * 전체 선택/해제
   * - 체크: 모든 reportData.testItems의 ID를 selectedRows에 추가
   * - 해제: selectedRows 비우기
   */
  const handleAllCheckbox = (e) => {
    if (e.target.checked) {
      // 전체 선택: 모든 행의 ID 추가
      setSelectedRows(reportData.testItems.map(item => item.ct_test_item_id));
    } else {
      // 전체 해제: 빈 배열
      setSelectedRows([]);
    }
  };


  /**
   * 시험항목 입력 값 변경
   * @param {number} itemId - 수정할 행의 ID
   * @param {string} field - 수정할 필드명 (test_no, test_name, remark 등)
   * @param {string} value - 변경할 값
   */
  const handleTestItemChange = (itemId, field, value) => {
    // reportData.testItems에서 해당 ID의 행만 찾아서 field 값 변경
    setReportData(prev => ({
      ...prev,
      testItems: prev.testItems.map(item => 
        item.ct_test_item_id === itemId ? { ...item, [field]: value } : item
      )
    }));

    // textarea 높이 자동 조절 (remark 또는 note 필드인 경우)
    if (field === 'remark' || field === 'note') {
      setTimeout(() => {
        const remarkTextarea = testItemTextareaRefs.current[`remark_${itemId}`];
        const noteTextarea = testItemTextareaRefs.current[`note_${itemId}`];
        
        if (remarkTextarea && noteTextarea) {
          // 두 textarea의 높이를 자동으로 계산
          remarkTextarea.style.height = "auto";
          noteTextarea.style.height = "auto";
          
          const remarkScrollHeight = remarkTextarea.scrollHeight;
          const noteScrollHeight = noteTextarea.scrollHeight;
          
          // 더 큰 높이 선택
          const maxHeight = Math.max(remarkScrollHeight, noteScrollHeight);
          
          // 최대 높이 제한 적용
          if (maxHeight > textareaMaxHeight) {
            remarkTextarea.style.height = `${textareaMaxHeight}px`;
            remarkTextarea.style.overflow = "auto";
            noteTextarea.style.height = `${textareaMaxHeight}px`;
            noteTextarea.style.overflow = "auto";
          } else {
            remarkTextarea.style.height = `${maxHeight}px`;
            remarkTextarea.style.overflow = "hidden";
            noteTextarea.style.height = `${maxHeight}px`;
            noteTextarea.style.overflow = "hidden";
          }
        }
      }, 0);
    }
  };


  /**
   * ============================= 시험항목 이미지 첨부 관련 함수 =============================
   *
   * 시험항목별 이미지 첨부
   * @param {number} itemId - 이미지를 첨부할 행의 ID
   * @param {Event} e - 파일 input의 change 이벤트
   */
  const handleTestItemImageAttach = (itemId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // 이미지 파일 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 첨부 가능합니다.");
      e.target.value = "";
      return;
    }

    // 용량 체크
    if (file.size > MAX_SIZE) {
      alert(`파일 용량이 5MB를 초과합니다.\n현재 파일 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = "";
      return;
    }

    // reportData.testItems에서 해당 ID의 행에 이미지 파일 저장
    setReportData(prev => ({
      ...prev,
      testItems: prev.testItems.map(item =>
        item.ct_test_item_id === itemId ? { ...item, attachedImage: file } : item
      )
    }));

    e.target.value = ""; // input 초기화 (같은 파일 재선택 가능하도록)
  };


  /**
   * 시험항목별 이미지 삭제
   * @param {number} itemId - 이미지를 삭제할 행의 ID
   */
  const handleTestItemImageRemove = (itemId) => {
    if (confirm("첨부된 이미지를 삭제하시겠습니까?")) {
      // reportData.testItems에서 해당 ID의 행의 attachedImage를 null로 설정
      setReportData(prev => ({
        ...prev,
        testItems: prev.testItems.map(item =>
          item.ct_test_item_id === itemId ? { ...item, attachedImage: null } : item
        )
      }));
      setDeletedAttachmentIds(prev => [...prev, { ct_test_report_attachment_id: itemId }]); // 삭제할 첨부파일 ID 저장 (서버 전송용)
    }
  };


  /**
   * 시험항목별 이미지 첨부 버튼 클릭 핸들러
   * @param {number} itemId - 파일 input을 열 행의 ID
   * - ref를 통해 숨겨진 파일 input의 click 이벤트 트리거
   */
  const handleTestItemAttachClick = (itemId) => {
    testItemImageInputRefs.current[itemId]?.click();
  };


  /**
   * ============================= 용량 동적 섹션 관리 함수 =============================
   *
   * 용량 섹션 추가
   */
  const handleAddVolumeSection = () => {
    setReportData(prev => {
      const newSection = {
        ct_test_caution_id: volumeSectionIdCounter.current++,  // 임시 ID
        ct_test_report_id: reportId || "",
        caution_type: "volume",
        section_title: t.volume,
        section_content: "",
        sort_order: prev.cautions.volume.sections.length + 1,
        images: [],
        isDragging: false,
        hoveredImageIndex: null
      };
      return {
        ...prev,
        cautions: {
          ...prev.cautions,
          volume: {
            ...prev.cautions.volume,
            sections: [...prev.cautions.volume.sections, newSection]
          }
        }
      };
    });
  };

  /**
   * 용량 섹션 삭제
   */
  const handleRemoveVolumeSection = (sectionId) => {
    if(confirm("이 섹션을 삭제하시겠습니까?")) {
      setReportData(prev => {
        // 이미지 메모리 정리
        const section = prev.cautions.volume.sections.find(s => s.ct_test_caution_id === sectionId);
        if(section) {
          section.images.forEach(img => URL.revokeObjectURL(img.file_url || img.preview));
        }
        return {
          ...prev,
          cautions: {
            ...prev.cautions,
            volume: {
              ...prev.cautions.volume,
              sections: prev.cautions.volume.sections.filter(s => s.ct_test_caution_id !== sectionId)
            }
          }
        };
      });
    }
  };

  /**
   * 용량 섹션 제목 변경
   */
  const handleVolumeSectionLabelChange = (sectionId, section_title) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, section_title } : section
          )
        }
      }
    }));
  };

  /**
   * 용량 섹션 내용 변경
   */
  const handleVolumeSectionTextChange = (sectionId, section_content) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, section_content } : section
          )
        }
      }
    }));
  };

  /**
   * 용량 섹션 이미지 추가 - 공통 함수 사용
   */
  const handleVolumeSectionImageAdd = (sectionId, files) => {
    processImageFiles(files, (newImages) => {
      setReportData(prev => ({
        ...prev,
        cautions: {
          ...prev.cautions,
          volume: {
            ...prev.cautions.volume,
            sections: prev.cautions.volume.sections.map(section =>
              section.ct_test_caution_id === sectionId
                ? { ...section, images: [...section.images, ...newImages] }
                : section
            )
          }
        }
      }));
    });
  };

  /**
   * 용량 섹션 이미지 삭제
   */
  const handleVolumeSectionImageRemove = (sectionId, imageId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? {
                  ...section,
                  images: section.images.filter(img => {
                    if(img.ct_test_report_attachment_id === imageId) {
                      URL.revokeObjectURL(img.preview);
                    }
                    return img.ct_test_report_attachment_id !== imageId;
                  })
                }
              : section
          )
        }
      }
    }));
    setDeletedAttachmentIds(prev => [...prev, { ct_test_report_attachment_id: imageId }]); // 삭제할 첨부파일 ID 저장 (서버 전송용)
  };

  /**
   * 용량 섹션 드래그 상태 변경
   */
  const handleVolumeSectionDragOver = (sectionId, e) => {
    e.preventDefault();
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: true } : section
          )
        }
      }
    }));
  };

  const handleVolumeSectionDragLeave = (sectionId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: false } : section
          )
        }
      }
    }));
  };

  const handleVolumeSectionDrop = (sectionId, e) => {
    e.preventDefault();
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: false } : section
          )
        }
      }
    }));
    handleVolumeSectionImageAdd(sectionId, e.dataTransfer.files);
  };

  /**
   * 용량 섹션 호버 인덱스 변경
   */
  const handleVolumeSectionMouseEnter = (sectionId, index) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? { ...section, hoveredImageIndex: index }
              : section
          )
        }
      }
    }));
  };

  const handleVolumeSectionMouseLeave = (sectionId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        volume: {
          ...prev.cautions.volume,
          sections: prev.cautions.volume.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? { ...section, hoveredImageIndex: null }
              : section
          )
        }
      }
    }));
  };


  /**
   * ============================= 포장재 동적 섹션 관리 함수 =============================
   */
  const handleAddPackagingSection = () => {
    setReportData(prev => {
      const newSection = {
        ct_test_caution_id: packagingSectionIdCounter.current++,
        ct_test_report_id: reportId || "",
        caution_type: "packaging",
        section_title: t.packaging,
        section_content: "",
        sort_order: prev.cautions.packaging.sections.length + 1,
        images: [],
        isDragging: false,
        hoveredImageIndex: null
      };
      return {
        ...prev,
        cautions: {
          ...prev.cautions,
          packaging: {
            ...prev.cautions.packaging,
            sections: [...prev.cautions.packaging.sections, newSection]
          }
        }
      };
    });
  };

  const handleRemovePackagingSection = (sectionId) => {
    if(confirm("이 섹션을 삭제하시겠습니까?")) {
      setReportData(prev => {
        const section = prev.cautions.packaging.sections.find(s => s.ct_test_caution_id === sectionId);
        if(section) {
          section.images.forEach(img => URL.revokeObjectURL(img.file_url || img.preview));
        }
        return {
          ...prev,
          cautions: {
            ...prev.cautions,
            packaging: {
              ...prev.cautions.packaging,
              sections: prev.cautions.packaging.sections.filter(s => s.ct_test_caution_id !== sectionId)
            }
          }
        };
      });
    }
  };

  const handlePackagingSectionLabelChange = (sectionId, section_title) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, section_title } : section
          )
        }
      }
    }));
  };

  const handlePackagingSectionTextChange = (sectionId, section_content) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, section_content } : section
          )
        }
      }
    }));
  };

  const handlePackagingSectionImageAdd = (sectionId, files) => {
    processImageFiles(files, (newImages) => {
      setReportData(prev => ({
        ...prev,
        cautions: {
          ...prev.cautions,
          packaging: {
            ...prev.cautions.packaging,
            sections: prev.cautions.packaging.sections.map(section =>
              section.ct_test_caution_id === sectionId
                ? { ...section, images: [...section.images, ...newImages] }
                : section
            )
          }
        }
      }));
    });
  };

  const handlePackagingSectionImageRemove = (sectionId, imageId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? {
                  ...section,
                  images: section.images.filter(img => {
                    if(img.ct_test_report_attachment_id === imageId) {
                      URL.revokeObjectURL(img.preview);
                    }
                    return img.ct_test_report_attachment_id !== imageId;
                  })
                }
              : section
          )
        }
      }
    }));
    setDeletedAttachmentIds(prev => [...prev, { ct_test_report_attachment_id: imageId }]); // 삭제할 첨부파일 ID 저장 (서버 전송용)
  };

  const handlePackagingSectionDragOver = (sectionId, e) => {
    e.preventDefault();
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: true } : section
          )
        }
      }
    }));
  };

  const handlePackagingSectionDragLeave = (sectionId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: false } : section
          )
        }
      }
    }));
  };

  const handlePackagingSectionDrop = (sectionId, e) => {
    e.preventDefault();
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: false } : section
          )
        }
      }
    }));
    handlePackagingSectionImageAdd(sectionId, e.dataTransfer.files);
  };

  const handlePackagingSectionMouseEnter = (sectionId, index) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? { ...section, hoveredImageIndex: index }
              : section
          )
        }
      }
    }));
  };

  const handlePackagingSectionMouseLeave = (sectionId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        packaging: {
          ...prev.cautions.packaging,
          sections: prev.cautions.packaging.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? { ...section, hoveredImageIndex: null }
              : section
          )
        }
      }
    }));
  };


  /**
   * ============================= 상용성 동적 섹션 관리 함수 =============================
   */
  const handleAddCompatibilitySection = () => {
    setReportData(prev => {
      const newSection = {
        ct_test_caution_id: compatibilitySectionIdCounter.current++,
        ct_test_report_id: reportId || "",
        caution_type: "compatibility",
        section_title: t.compatibility,
        section_content: "",
        sort_order: prev.cautions.compatibility.sections.length + 1,
        images: [],
        isDragging: false,
        hoveredImageIndex: null
      };
      return {
        ...prev,
        cautions: {
          ...prev.cautions,
          compatibility: {
            ...prev.cautions.compatibility,
            sections: [...prev.cautions.compatibility.sections, newSection]
          }
        }
      };
    });
  };

  const handleRemoveCompatibilitySection = (sectionId) => {
    if(confirm("이 섹션을 삭제하시겠습니까?")) {
      setReportData(prev => {
        const section = prev.cautions.compatibility.sections.find(s => s.ct_test_caution_id === sectionId);
        if(section) {
          section.images.forEach(img => URL.revokeObjectURL(img.file_url || img.preview));
        }
        return {
          ...prev,
          cautions: {
            ...prev.cautions,
            compatibility: {
              ...prev.cautions.compatibility,
              sections: prev.cautions.compatibility.sections.filter(s => s.ct_test_caution_id !== sectionId)
            }
          }
        };
      });
    }
  };

  const handleCompatibilitySectionLabelChange = (sectionId, section_title) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, section_title } : section
          )
        }
      }
    }));
  };

  const handleCompatibilitySectionTextChange = (sectionId, section_content) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, section_content } : section
          )
        }
      }
    }));
  };

  const handleCompatibilitySectionImageAdd = (sectionId, files) => {
    processImageFiles(files, (newImages) => {
      setReportData(prev => ({
        ...prev,
        cautions: {
          ...prev.cautions,
          compatibility: {
            ...prev.cautions.compatibility,
            sections: prev.cautions.compatibility.sections.map(section =>
              section.ct_test_caution_id === sectionId
                ? { ...section, images: [...section.images, ...newImages] }
                : section
            )
          }
        }
      }));
    });
  };

  const handleCompatibilitySectionImageRemove = (sectionId, imageId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? {
                  ...section,
                  images: section.images.filter(img => {
                    if(img.ct_test_report_attachment_id === imageId) {
                      URL.revokeObjectURL(img.preview);
                    }
                    return img.ct_test_report_attachment_id !== imageId;
                  })
                }
              : section
          )
        }
      }
    }));
    setDeletedAttachmentIds(prev => [...prev, { ct_test_report_attachment_id: imageId }]); // 삭제할 첨부파일 ID 저장 (서버 전송용)
  };

  const handleCompatibilitySectionDragOver = (sectionId, e) => {
    e.preventDefault();
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: true } : section
          )
        }
      }
    }));
  };

  const handleCompatibilitySectionDragLeave = (sectionId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: false } : section
          )
        }
      }
    }));
  };

  const handleCompatibilitySectionDrop = (sectionId, e) => {
    e.preventDefault();
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId ? { ...section, isDragging: false } : section
          )
        }
      }
    }));
    handleCompatibilitySectionImageAdd(sectionId, e.dataTransfer.files);
  };

  const handleCompatibilitySectionMouseEnter = (sectionId, index) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? { ...section, hoveredImageIndex: index }
              : section
          )
        }
      }
    }));
  };

  const handleCompatibilitySectionMouseLeave = (sectionId) => {
    setReportData(prev => ({
      ...prev,
      cautions: {
        ...prev.cautions,
        compatibility: {
          ...prev.cautions.compatibility,
          sections: prev.cautions.compatibility.sections.map(section =>
            section.ct_test_caution_id === sectionId
              ? { ...section, hoveredImageIndex: null }
              : section
          )
        }
      }
    }));
  };


  /**
   * saveReport : 성적서 저장 함수
   * --------------------------------------------------------------
   * - FormData를 사용하여 파일과 데이터를 함께 서버로 전송
   * - 모든 이미지 파일을 multipart/form-data로 전송
   */
  const saveReport = async () => {

    // 필수 입력 항목 검증
    // if (!reportData.basicInfo.ct_no) {
    //   alert("CT 번호를 입력해주세요.");
    //   return;
    // }
    // if (!reportData.basicInfo.sample_name) {
    //   alert("시료명을 입력해주세요.");
    //   return;
    // }
    // if (reportData.testItems.length === 0) {
    //   alert("시험항목을 최소 1개 이상 추가해주세요.");
    //   return;
    // }

    // // 저장 확인
    // if (!confirm("성적서를 저장하시겠습니까?")) {
    //   return;
    // }

    try {
      setLoading(true);

      // FormData 생성
      const formData = new FormData();

      // 기본 정보 추가
      const saveData = {
        basicInfo: {
          ...reportData.basicInfo,
          company_id: companyId,
          user_id: userId,
          ct_request_id: ctRequestId,
          ct_test_report_id: reportId
        },
        requestInfo: {
          ...reportData.requestInfo
        },
        testItems: reportData.testItems.map(item => ({
          ...item,
          // attachedImage는 파일로 따로 전송하므로 제거
          attachedImage: undefined
        })),
        cautions: {
          volume: {
            sections: reportData.cautions.volume.sections.map(section => ({
              ct_test_caution_id: section.ct_test_caution_id,
              section_title: section.section_title,
              section_content: section.section_content,
              sort_order: section.sort_order
              // images는 파일로 따로 전송
            }))
          },
          packaging: {
            sections: reportData.cautions.packaging.sections.map(section => ({
              ct_test_caution_id: section.ct_test_caution_id,
              section_title: section.section_title,
              section_content: section.section_content,
              sort_order: section.sort_order
            }))
          },
          compatibility: {
            sections: reportData.cautions.compatibility.sections.map(section => ({
              ct_test_caution_id: section.ct_test_caution_id,
              section_title: section.section_title,
              section_content: section.section_content,
              sort_order: section.sort_order
            }))
          }
        },
        judgment: {
          ...reportData.judgment
        },
        deletedAttachmentIds: deletedAttachmentIds
      };

      // JSON 데이터 추가
      Object.keys(saveData).forEach(key => {
        formData.append(key, JSON.stringify(saveData[key]));
      });

      // 의뢰 자재 이미지 파일 추가
      images.forEach((img, index) => {
        if (img.file) {
          formData.append(`material_${index}`, img.file);
        }
      });

      // 시험항목 이미지 파일 추가
      reportData.testItems.forEach((item, index) => {
        if (item.attachedImage && item.attachedImage instanceof File) {
          formData.append(`test_item_${index}`, item.attachedImage);
        }
      });

      // 주의사항 - 용량 이미지 파일 추가
      reportData.cautions.volume.sections.forEach((section, sectionIdx) => {
        section.images.forEach((img, imgIdx) => {
          if (img.file) {
            formData.append(
              `caution_${sectionIdx}_volume`,
              img.file
            );
          }
        });
      });

      // 주의사항 - 포장재 이미지 파일 추가
      reportData.cautions.packaging.sections.forEach((section, sectionIdx) => {
        section.images.forEach((img, imgIdx) => {
          if (img.file) {
            formData.append(
              `caution_${sectionIdx}_packaging`,
              img.file
            );
          }
        });
      });

      // 주의사항 - 상용성 이미지 파일 추가
      reportData.cautions.compatibility.sections.forEach((section, sectionIdx) => {
        section.images.forEach((img, imgIdx) => {
          if (img.file) {
            formData.append(
              `caution_${sectionIdx}_compatibility`,
              img.file
            );
          }
        });
      });

      let targetUrl = "";
      if(mode === "update") {
        targetUrl = "/api/ltms/ct/test-report/update";
      } else {
        targetUrl = "/api/ltms/ct/test-report/create";
      }

      // API 호출 (multipart/form-data)
      // axios가 FormData를 자동으로 감지하여 올바른 Content-Type(boundary 포함)을 설정
      const response = await axios.post(targetUrl, formData);

      alert("성적서가 저장되었습니다.");
      goToPage("/ct/testReport/read");

    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.message;
      alert("저장에 실패했습니다.\n" + (err.response?.data?.message || err.message));

    } finally {
      setLoading(false);
    }
  };


  /**
   * searchReport : 성적서 조회 함수
   * --------------------------------------------------------------
   * WHAT : reportId를 기반으로 API 호출하여 성적서 데이터 조회 조회된 데이터를 reportData 상태에 세팅
   * WHY : 성적서 수정 시 기존 데이터를 불러와서 수정할 수 있도록 하기 위함
   * HOW : API 호출 후 응답 데이터에서 필요한 정보만 추출하여 reportData 구조에 맞게 가공 후 상태 업데이트
   */
  const searchReport = async () => {

    if (mode !== "update") return;

    try {

      setLoading(true);

      const params = {
          company_id: companyId,
          user_id: userId,
          ct_request_id: ctRequestId,
          ct_test_report_id: reportId
      };

      const response = await axios.get("/api/ltms/ct/test-report/detail", { params });
      const data = response.data.data.result;

      setReportData(data);

      // 의뢰 자재 이미지 초기화 (서버에서 받은 파일 URL 사용)
      if (data.requestInfo && data.requestInfo.material_image) {
        const materialImages = data.requestInfo.material_image.map(img => ({
          ct_test_report_attachment_id: img.ct_test_report_attachment_id,
          file_url: img.file_url,
          file_name: img.file_name,
          file_size: img.file_size,
          preview: null, // 서버 이미지는 preview 없음
          file: null // 서버 이미지는 file 객체 없음
        }));
        setImages(materialImages);
      }

    } catch (err) {
      console.log(err);
      alert("성적서 조회에 실패했습니다.\n" + (err.response?.data?.message || err.message));
    } finally { 
      setLoading(false);
    }
  };


  /**
   * fetchJudgmentOptions : 판정 옵션 조회
   * ----------------------------------------------------
   * HOW : sessionStorage에 캐시된 데이터가 있으면 사용하고,
   *       없으면 API 호출 후 sessionStorage에 저장
   * WHY : 페이지 진입할 때마다 불필요한 API 호출을 방지하여 성능 최적화
   */
  const fetchJudgmentOptions = async () => {
    try {
      // sessionStorage에서 캐시된 데이터 확인
      const cachedData = sessionStorage.getItem('judgmentOptions');
      
      if (cachedData) {
        // 캐시된 데이터가 있으면 파싱해서 사용
        const parsedData = JSON.parse(cachedData);
        setJudgmentOptions(parsedData);
        setOptionsLoading(prev => ({ ...prev, judgment: false }));
        return;
      }

      // 캐시된 데이터가 없으면 API 호출
      const params = { company_id: companyId };
      const res = await axios.get("/api/ltms/setting/options/judgment", { params });
      const resultData = res.data.data.result;
      const options = [
        {
          judgment_id: "",
          judgment_code: "",
          judgment_name: "판정여부",
          is_active: "",
          sort_order: ""
        },
        ...resultData
      ];
      
      // state 업데이트
      setJudgmentOptions(options);
      // sessionStorage에 저장
      sessionStorage.setItem('judgmentOptions', JSON.stringify(options));
      setOptionsLoading(prev => ({ ...prev, judgment: false }));
      
    } catch (err) {
      console.error("판정 옵션 조회 실패:", err);
      setOptionsLoading(prev => ({ ...prev, judgment: false }));
    }
  };


  /**
   * useEffect : 컴포넌트 마운트 시 fetchJudgmentOptions 함수 호출하여 판정 옵션 데이터 조회
   * - 판정 옵션은 성적서 작성/수정 시 드롭다운에서 사용되므로 페이지 진입 시 반드시 조회해야 함
   */
  useEffect(() => {
    fetchJudgmentOptions();
  }, []);


  /**
   * useEffect : 컴포넌트 마운트 시 searchReport 함수 호출하여 성적서 데이터 조회
   * - mode가 "update"인 경우에만 조회 수행 (새 성적서 작성 시에는 조회할 데이터가 없음)
   */
  useEffect(() => {
    searchReport();
  }, []);


  /**
   * ============================= 종합 의견 모달 관련 함수 =============================
   */

  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <CT_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}

        <div className="container">

          {/* ↓ 화면 타이틀 ↓ */}
          <div>
            <h1 className="page-title tac">{t.pageTitle}
            <select id="report-type" 
                    value={language}
                    onChange={handleLanguageChange}
                    className=""
                    style={{
                      height:"30px",
                      margin:"0px 0px 5px 20px",
                      verticalAlign:"middle"
                    }}>
              <option value="KOR">국문</option>
              <option value="CPNP">CPNP</option>
              <option value="EN_EXCEL">영문(Excel)</option>
            </select>
            </h1>
          </div>
          {/* ↑ 화면 타이틀 ↑ */}

          {/* ↓ 상세보기 헤더 ↓ */}
          <div className="report-header">
            <div className="">
              <div className="report-title tal">
                {t.ctNo} {reportData.basicInfo.ct_no || "CT 번호 없음"}
              </div>
            </div>
            <div className="report-button">
              <button type="button" className="btn-primary" onClick={saveReport}>{t.save}</button>
              <button type="button" className="btn-info" onClick={handlePdfPreview}>{t.preview}</button>
              <button type="button" className="btn-primary">Excel</button>
              {/* <button type="button" onClick={handlePdfPreview}>PDF</button> */}
            </div>
          </div>
          {/* ↑ 상세보기 헤더 ↑ */}

          {/* ↓ 성적서 내용 폼 ↓ */}
          <div id="report-detail">
            <form id="detail-form">
              <div className="report-form">
                <table className="report-table">
                  <colgroup>
                    <col width="13%"/>
                    <col width="20%"/>
                    <col width="13%"/>
                    <col width="20%"/>
                    <col width="13%"/>
                    <col width="21%"/>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th>{t.ctNo}</th>
                      <td>
                        <input 
                          type="text" 
                          value={reportData.basicInfo.ct_no || ""}
                          onChange={(e) => handleBasicInfoChange('ct_no', e.target.value)}
                          placeholder={t.placeholders.ctNo}
                          readOnly
                        />
                      </td>
                      <th>{t.client}</th>
                      <td>
                        <input 
                          type="search" 
                          placeholder={t.placeholders.client}
                          value={reportData.basicInfo.client_name || ""}
                          onChange={(e) => {
                            handleBasicInfoChange('client_name', e.target.value);
                            findData_ERP(e, 'client');
                          }}
                          readOnly
                        />
                        <input 
                          type="hidden" 
                          value={reportData.basicInfo.client_id || ""}
                          onChange={(e) => handleBasicInfoChange('client_id', e.target.value)}
                        />
                      </td>
                      <th>{t.specific}</th>
                      <td>
                        <input 
                          type="text" 
                          value={reportData.basicInfo.specific || ""}
                          onChange={(e) => handleBasicInfoChange('specific', e.target.value)}
                          readOnly
                        />
                      </td>
                    </tr>
                    <tr>
                      <th rowSpan={2}>{t.productName}</th>
                      <td rowSpan={2}>
                        <input 
                          type="search" 
                          placeholder={t.placeholders.productName}
                          value={reportData.basicInfo.sample_name || ""}
                          onChange={(e) => {
                            handleBasicInfoChange('sample_name', e.target.value);
                            findData_ERP(e, 'sample');
                          }}
                          readOnly
                        />
                        <input 
                          type="hidden" 
                          value={reportData.basicInfo.sample_id || ""}
                          onChange={(e) => handleBasicInfoChange('sample_id', e.target.value)}
                        />
                      </td>
                      <th>{t.formulationManager}</th>
                      <td>
                        <input 
                          type="search" 
                          placeholder={t.placeholders.formulationManager}
                          value={reportData.basicInfo.formulation_manager || ""}
                          onChange={(e) => {
                            handleBasicInfoChange('formulation_manager', e.target.value);
                            findData_ERP(e, 'formulation_manager');
                          }}
                          readOnly
                        />
                        <input 
                          type="hidden" 
                          value={reportData.basicInfo.formulation_manager_id || ""}
                          onChange={(e) => handleBasicInfoChange('formulation_manager_id', e.target.value)}
                        />
                      </td>
                      <th>{t.viscosity}</th>
                      <td>
                        <input 
                          type="text" 
                          placeholder={t.placeholders.viscosity}
                          value={reportData.basicInfo.viscosity_hardness || ""}
                          onChange={(e) => {
                            handleBasicInfoChange('viscosity_hardness', e.target.value);
                          }}
                          readOnly
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>{t.desiredVolume}</th>
                      <td>
                        <input 
                          type="text" 
                          placeholder={t.placeholders.desiredVolume}
                          value={reportData.basicInfo.desired_volume || ""}
                          onChange={(e) => handleBasicInfoChange('desired_volume', e.target.value)}
                          readOnly
                        />
                      </td>
                      <th>{t.labNo}</th>
                      <td>
                        <input 
                          type="search" 
                          placeholder={t.placeholders.labNo}
                          value={reportData.basicInfo.lab_no || ""}
                          onChange={(e) => {
                            handleBasicInfoChange('lab_no', e.target.value);
                            findData_ERP(e, 'labNo');
                          }}
                          readOnly
                        />
                        <input 
                          type="hidden" 
                          value={reportData.basicInfo.lab_no_id || ""}
                          onChange={(e) => handleBasicInfoChange('lab_no_id', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>{t.testStartDate}</th>
                      <td>
                        <input 
                          type="date" 
                          style={{width:"90px"}} 
                          value={reportData.basicInfo.ct_receipt_date || ""}
                          onChange={(e) => handleBasicInfoChange('ct_receipt_date', e.target.value)}
                          readOnly
                        />
                      </td>
                      <th>{t.requestOrder}</th>
                      <td>
                        <input 
                          type="search" 
                          placeholder={t.placeholders.requestOrder}
                          value={reportData.basicInfo.ct_test_seq || ""}
                          onChange={(e) => {
                            handleBasicInfoChange('ct_test_seq', e.target.value);
                            findData_ERP(e, 'ct_test_seq');
                          }}
                          readOnly
                        />
                        <input 
                          type="hidden" 
                          value={reportData.basicInfo.ct_test_seq_id || ""}
                          onChange={(e) => handleBasicInfoChange('ct_test_seq_id', e.target.value)}
                        />
                      </td>
                      <th rowSpan={2}>{t.formulationNotes}</th>
                      <td rowSpan={2}>
                        <textarea 
                          id="sample_etc" 
                          ref={formulationNotesRef}
                          value={reportData.basicInfo.sample_etc || ""}
                          onChange={(e) => handleBasicInfoChange('sample_etc', e.target.value)}
                          readOnly
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>{t.testEndDate}</th>
                      <td>
                        <input 
                          type="date" 
                          style={{width:"90px"}} 
                          value={reportData.basicInfo.ct_due_date || ""}
                          onChange={(e) => handleBasicInfoChange('ct_due_date', e.target.value)}
                          readOnly
                        />
                      </td>
                      <th>{t.requestQuantity}</th>
                      <td>
                        <input 
                          type="text" 
                          placeholder={t.placeholders.requestQuantity}
                          value={reportData.basicInfo.sample_quantity || ""}
                          onChange={(e) => handleBasicInfoChange('sample_quantity', e.target.value)}
                          readOnly
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ====================== 의뢰 정보 영역 ====================== */}
              <div className="report-form">
                <table className="report-table">
                  <colgroup>
                    <col width="13%" />
                    <col width="20%" />
                    <col width="13%" />
                    <col width="54%" />
                  </colgroup>
                  <tbody>
                    {/* 첫 번째 행 */}
                    <tr>
                      <th>{t.materialSupplier}</th>
                      <td>
                        <input 
                          type="search" 
                          placeholder={t.placeholders.materialSupplier}
                          value={reportData.requestInfo.material_supplier_name || ""}
                          onChange={(e) => {
                            handleRequestInfoChange('material_supplier_name', e.target.value);
                            findData_ERP(e, 'material_supplier_name');
                          }}
                          readOnly
                        />
                        <input 
                          type="hidden" 
                          value={reportData.requestInfo.material_supplier_id || ""}
                          onChange={(e) => handleRequestInfoChange('material_supplier_id', e.target.value)}
                        />
                      </td>
                      <th rowSpan={2}>{t.materialImage}</th>
                      <td rowSpan={2} className="material-image-td" style={{ verticalAlign: "top", padding: "8px" }}>
                        <div>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageFileChange}
                            style={{ display: "none" }}
                          />
                        </div>

                        {/* 이미지 드래그 앤 드롭 영역 */}
                        <div
                          className={`material-image-drop-area ${isDraggingImage ? 'dragging' : ''}`}
                          onDragOver={handleImageDragOver}
                          onDragLeave={handleImageDragLeave}
                          onDrop={handleImageDrop}
                        >
                          {images.length === 0 ? (
                            <p className="material-image-drop-area-placeholder">
                              {t.placeholders.dragImage}
                            </p>
                          ) : (
                            <div className="material-image-grid">
                              {images.map((image, index) => (
                                <div
                                  key={index}
                                  className="material-image-item"
                                  onMouseEnter={() => setHoveredImageIndex(index)}
                                  onMouseLeave={() => setHoveredImageIndex(null)}
                                  onClick={() => handleImageClick(image)}
                                >
                                  <img
                                    src={image.file_url ? `${API_BASE_URL}/api${image.file_url}` : image.preview}
                                    alt={`preview-${index}`}
                                  />
                                  {hoveredImageIndex === index && (
                                    <div className="material-image-overlay">
                                      <button
                                        type="button"
                                        className="material-image-delete-btn"
                                        onClick={(e) => handleRemoveImage(image.ct_test_report_attachment_id, e)}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* 두 번째 행 */}
                    <tr>
                      <th>{t.materialInfo}</th>
                      <td style={{ verticalAlign: "top", minHeight: `${textareaMaxHeight}px` }}>
                        <textarea 
                          ref={materialDescriptionRef}
                          name="material_description"
                          value={reportData.requestInfo.material_description || ""}
                          onChange={(e) => handleRequestInfoChange('material_description', e.target.value)}
                          style={{ height: "70px", minHeight: "70px"}}
                          readOnly
                        />
                      </td>
                      {/* rowSpan으로 인해 여기는 3, 4번째 셀이 없음 */}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ====================== 버튼 영역 ====================== */}
              <div className="report-button jcl">
                <button type="button" className="btn-success" onClick={handleAddTestItem}>{t.addTest}</button>
                <button type="button" className="btn-danger" onClick={handleDeleteTestItem}>{t.deleteTest}</button>
                <button type="button" id="searchReportHistory" className="btn-info">{t.loadPreviousTest}</button>
                {/* <button type="button" className="btn-info">이전 차수 반영하기</button> */}
              </div>

              {/* ====================== 시험항목 테이블 ====================== */}
              <div className="report-form">
                <table className="report-table report-test-item-table">
                  <colgroup>
                    <col width="3%"/>{/* 체크박스 */}
                    <col width="8%"/>{/* 시험법 번호 */}
                    <col width="12%"/>{/* 시험 항목 */}
                    <col width="20%"/>{/* 시험 기준 */}
                    <col width="7%"/>{/* 시험 성적 */}
                    <col width="21%"/>{/* 시험 종합 의견 */}
                    <col width="10%"/>{/* 비고 */}
                    <col width="15%"/>{/* 첨부 이미지 */}
                    <col width="4%"/>{/* 사진 첨부 버튼 */}
                  </colgroup>
                  <thead>
                    <tr>
                      <th>
                        {/* 전체 선택/해제 체크박스 */}
                        <input 
                          type="checkbox" 
                          onChange={handleAllCheckbox}
                          checked={selectedRows.length === reportData.testItems.length && reportData.testItems.length > 0}
                        />
                      </th>
                      <th className="tac">{t.testNo}</th>
                      <th className="tac">{t.testName}</th>
                      <th className="tac">{t.testStandard}</th>
                      <th className="tac">{t.testResult}</th>
                      <th className="tac" id="testSummary">
                        {t.testSummary} 
                        <span role="img" aria-label="magnifying glass" 
                              onClick={(e) => handleOpenRemarkModal(e)}
                              style={{cursor:"pointer", marginLeft:"5px"}}>
                          🔍
                        </span>
                      </th>
                      <th className="tac">{t.remark}</th>
                      <th className="tac">{t.attachedImage}</th>
                      <th className="tac">{t.attach}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.testItems.map((item, index) => (
                      <tr key={index}>
                        {/* 개별 체크박스 */}
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.ct_test_item_id)} // selectedRows에 포함되면 체크
                            onChange={() => handleRowCheckbox(item.ct_test_item_id)}
                          />
                        </td>
                        
                        {/* 시험법 번호 */}
                        <td style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="tac"
                            value={item.test_standard_code || ""}
                            onChange={(e) => handleTestItemChange(item.ct_test_item_id, "test_standard_code", e.target.value)}
                            onClick={() => handleCopyTestItemField(item.ct_test_item_id, 'test_standard_code', item.test_standard_code)}
                            style={{ cursor: 'pointer' }}
                            title="클릭하여 복사"
                            readOnly
                          />
                          {copiedTestItemField?.itemId === item.ct_test_item_id && copiedTestItemField?.field === 'test_standard_code' && (
                            <span style={{ 
                              position: 'absolute',
                              right: '5px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#28a745', 
                              fontSize: '11px', 
                              fontWeight: 'bold',
                              pointerEvents: 'none'
                            }}>✓</span>
                          )}
                        </td>
                        
                        {/* 시험 항목 */}
                        <td>
                          <input
                            type="text" 
                            className="tac"
                            value={item.test_standard_name || ""}
                            onChange={(e) => handleTestItemChange(item.ct_test_item_id, "test_standard_name", e.target.value)}
                            readOnly
                          />
                        </td>
                        
                        {/* 시험 기준 */}
                        <td>
                          <input
                            type="text" 
                            value={item.test_guide || ""}
                            onChange={(e) => handleTestItemChange(item.ct_test_item_id, "test_guide", e.target.value)}
                            readOnly
                          />
                        </td>
                        
                        {/* 시험 성적 */}
                        <td>
                          <input
                            type="text"
                            className="tac"
                            value={item.test_result || ""}
                            onChange={(e) => handleTestItemChange(item.ct_test_item_id, "test_result", e.target.value)}
                          />
                        </td>
                        
                        {/* 시험 종합 의견 (클릭 시 모달 열림) */}
                        <td>
                          <textarea
                            id={`remark_${item.ct_test_item_id}`} // 모달 열기 이벤트에서 사용
                            ref={(el) => (testItemTextareaRefs.current[`remark_${item.ct_test_item_id}`] = el)}
                            value={item.remark || ""}
                            onChange={(e) => handleTestItemChange(item.ct_test_item_id, "remark", e.target.value)}
                          />
                        </td>
                        
                        {/* 비고 */}
                        <td>
                          <textarea
                            ref={(el) => (testItemTextareaRefs.current[`note_${item.ct_test_item_id}`] = el)}
                            value={item.note || ""}
                            onChange={(e) => handleTestItemChange(item.ct_test_item_id, "note", e.target.value)}
                          />
                        </td>
                        
                        {/* 첨부 이미지 표시 */}
                        <td style={{ padding: "2px 5px" }}>
                          {item.attachedImage ? (
                            <div className="test-item-image-container">
                              {/* 파일명 클릭 시 원본 보기 */}
                              <span 
                                className="test-item-image-filename"
                                onClick={() => handleImageClick(item.attachedImage)}
                                title={item.attachedImage.name}
                              >
                                {item.attachedImage.name}
                              </span>
                              {/* 이미지 삭제 버튼 */}
                              <button
                                type="button"
                                className="test-item-image-delete-btn"
                                onClick={() => handleTestItemImageRemove(item.ct_test_item_id)}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span className="test-item-image-placeholder">-</span>
                          )}
                        </td>
                        
                        {/* 사진 첨부 버튼 */}
                        <td className="tac">
                          {/* 숨겨진 파일 input */}
                          <input
                            type="file"
                            ref={(el) => (testItemImageInputRefs.current[item.ct_test_item_id] = el)}
                            accept="image/*"
                            onChange={(e) => handleTestItemImageAttach(item.ct_test_item_id, e)}
                            style={{ display: "none" }}
                          />
                          {/* 첨부 버튼 (클릭 시 파일 input 열기) */}
                          <button 
                            type="button"
                            className="test-item-attach-btn btn-success"
                            onClick={() => handleTestItemAttachClick(item.ct_test_item_id)}
                          >
                            {t.attach}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ====================== 주의 사항 ====================== */}
              <div className="report-form">
                <table className="report-table">
                  <colgroup>
                    <col width="13%"/>
                    <col width="87%"/>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th colSpan={4}>{t.caution}</th>
                    </tr>
                    <tr>
                      <th>
                        {t.volume}
                        <button type="button" onClick={handleAddVolumeSection} 
                                className="caution-section-header-btn"
                                title="행 추가">
                          ➕
                        </button>                        
                      </th>
                      <td>
                        <div id="dynamic-volume-section">
                        {/* 용량 동적 섹션 렌더링 */}
                        {reportData.cautions.volume.sections.map((section, index) => (
                        <div key={index} className="caution-dynamic-section">
                          <div className="caution-base-header">
                            <input 
                              type="text" 
                              className="tac" 
                              value={section.section_title || ""}
                              onChange={(e) => handleVolumeSectionLabelChange(section.ct_test_caution_id, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveVolumeSection(section.ct_test_caution_id)}
                              className="caution-section-delete-btn btn-none"
                            >
                              ❌
                            </button>
                          </div>
                          <textarea
                            ref={(el) => volumeSectionTextareaRefs.current[section.ct_test_caution_id] = el}
                            rows="3"
                            style={{ width: "100%" }}
                            value={section.section_content || ""}
                            onChange={(e) => handleVolumeSectionTextChange(section.ct_test_caution_id, e.target.value)}
                            placeholder={t.placeholders.volumeContent}
                          />
                          <div>
                            <div
                              className={`material-image-drop-area ${section.isDragging ? 'dragging' : ''}`}
                              onDragOver={(e) => handleVolumeSectionDragOver(section.ct_test_caution_id, e)}
                              onDragLeave={() => handleVolumeSectionDragLeave(section.ct_test_caution_id)}
                              onDrop={(e) => handleVolumeSectionDrop(section.ct_test_caution_id, e)}
                              style={{ minHeight: "40px" }}
                            >
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  if(e.target.files.length > 0) {
                                    handleVolumeSectionImageAdd(section.ct_test_caution_id, e.target.files);
                                    e.target.value = "";
                                  }
                                }}
                                style={{ display: "none" }}
                                id={`volume-section-input-${section.ct_test_caution_id}`}
                              />
                              {section.images.length === 0 ? (
                                <p className="material-image-drop-area-placeholder">{t.placeholders.dragImage}</p>
                              ) : (
                                <div className="material-image-grid">
                                  {section.images.map((image, index) => (
                                    <div
                                      key={index}
                                      className="material-image-item"
                                      onMouseEnter={() => handleVolumeSectionMouseEnter(section.ct_test_caution_id, index)}
                                      onMouseLeave={() => handleVolumeSectionMouseLeave(section.ct_test_caution_id)}
                                      onClick={() => handleImageClick(image)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <img
                                        src={image.file_url ? `${API_BASE_URL}/api${image.file_url}` : image.preview}
                                        alt={`volume-section-${section.ct_test_caution_id}-img-${index}`}
                                      />
                                      {section.hoveredImageIndex === index && (
                                        <div className="material-image-overlay">
                                          <button
                                            type="button"
                                            className="material-image-delete-btn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleVolumeSectionImageRemove(section.ct_test_caution_id, image.ct_test_report_attachment_id || image.id);
                                            }}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        ))}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        {t.packaging}
                        <button type="button" onClick={handleAddPackagingSection} 
                                className="caution-section-header-btn" title="행 추가">
                          ➕
                        </button>                        
                      </th>
                      <td>
                        <div id="dynamic-packaging-section">
                          {/* 포장재 동적 섹션 렌더링 */}
                          {reportData.cautions.packaging.sections.map((section, index) => (
                          <div key={index} className="caution-dynamic-section">
                            <div className="caution-base-header">
                              <input 
                                type="text" 
                                className="tac" 
                                value={section.section_title || ""}
                                onChange={(e) => handlePackagingSectionLabelChange(section.ct_test_caution_id, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePackagingSection(section.ct_test_caution_id)}
                                className="caution-section-delete-btn btn-none"
                              >
                                ❌
                              </button>
                            </div>
                            <textarea
                              ref={(el) => packagingSectionTextareaRefs.current[section.ct_test_caution_id] = el}
                              rows="3"
                              style={{ width: "100%" }}
                              value={section.section_content || ""}
                              onChange={(e) => handlePackagingSectionTextChange(section.ct_test_caution_id, e.target.value)}
                              placeholder={t.placeholders.packagingContent}
                            />
                            <div>
                              <div
                                className={`material-image-drop-area ${section.isDragging ? 'dragging' : ''}`}
                                onDragOver={(e) => handlePackagingSectionDragOver(section.ct_test_caution_id, e)}
                                onDragLeave={() => handlePackagingSectionDragLeave(section.ct_test_caution_id)}
                                onDrop={(e) => handlePackagingSectionDrop(section.ct_test_caution_id, e)}
                                style={{ minHeight: "40px" }}
                              >
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => {
                                    if(e.target.files.length > 0) {
                                      handlePackagingSectionImageAdd(section.ct_test_caution_id, e.target.files);
                                      e.target.value = "";
                                    }
                                  }}
                                  style={{ display: "none" }}
                                  id={`packaging-section-input-${section.ct_test_caution_id}`}
                                />
                                {section.images.length === 0 ? (
                                  <p className="material-image-drop-area-placeholder">{t.dragImagePlaceholder}</p>
                                ) : (
                                  <div className="material-image-grid">
                                    {section.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="material-image-item"
                                        onMouseEnter={() => handlePackagingSectionMouseEnter(section.ct_test_caution_id, index)}
                                        onMouseLeave={() => handlePackagingSectionMouseLeave(section.ct_test_caution_id)}
                                        onClick={() => handleImageClick(image)}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <img
                                          src={image.file_url ? `${API_BASE_URL}/api${image.file_url}` : image.preview}
                                          alt={`packaging-section-${section.ct_test_caution_id}-img-${index}`}
                                        />
                                        {section.hoveredImageIndex === index && (
                                          <div className="material-image-overlay">
                                            <button
                                              type="button"
                                              className="material-image-delete-btn"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handlePackagingSectionImageRemove(section.ct_test_caution_id, image.ct_test_report_attachment_id || image.id);
                                              }}
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        {t.compatibility}
                        <button type="button" onClick={handleAddCompatibilitySection} 
                                className="caution-section-header-btn" title="행 추가">
                          ➕
                        </button>
                      </th>
                      <td>
                        <div id="dynamic-compatibility-section">
                          {/* 상용성 동적 섹션 렌더링 */}
                          {reportData.cautions.compatibility.sections.map((section, index) => (
                          <div key={index} className="caution-dynamic-section">
                            <div className="caution-base-header">
                              <input 
                                type="text" 
                                className="tac" 
                                value={section.section_title || ""}
                                onChange={(e) => handleCompatibilitySectionLabelChange(section.ct_test_caution_id, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveCompatibilitySection(section.ct_test_caution_id)}
                                className="caution-section-delete-btn btn-none"
                              >
                                ❌
                              </button>
                            </div>
                            <textarea
                              ref={(el) => compatibilitySectionTextareaRefs.current[section.ct_test_caution_id] = el}
                              rows="3"
                              style={{ width: "100%" }}
                              value={section.section_content || ""}
                              onChange={(e) => handleCompatibilitySectionTextChange(section.ct_test_caution_id, e.target.value)}
                              placeholder={t.placeholders.compatibilityContent}
                            />
                            <div>
                              <div
                                className={`material-image-drop-area ${section.isDragging ? 'dragging' : ''}`}
                                onDragOver={(e) => handleCompatibilitySectionDragOver(section.ct_test_caution_id, e)}
                                onDragLeave={() => handleCompatibilitySectionDragLeave(section.ct_test_caution_id)}
                                onDrop={(e) => handleCompatibilitySectionDrop(section.ct_test_caution_id, e)}
                                style={{ minHeight: "40px" }}
                              >
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => {
                                    if(e.target.files.length > 0) {
                                      handleCompatibilitySectionImageAdd(section.ct_test_caution_id, e.target.files);
                                      e.target.value = "";
                                    }
                                  }}
                                  style={{ display: "none" }}
                                  id={`compatibility-section-input-${section.ct_test_caution_id}`}
                                />
                                {section.images.length === 0 ? (
                                  <p className="material-image-drop-area-placeholder">{t.dragImagePlaceholder}</p>
                                ) : (
                                  <div className="material-image-grid">
                                    {section.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="material-image-item"
                                        onMouseEnter={() => handleCompatibilitySectionMouseEnter(section.ct_test_caution_id, index)}
                                        onMouseLeave={() => handleCompatibilitySectionMouseLeave(section.ct_test_caution_id)}
                                        onClick={() => handleImageClick(image)}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <img
                                          src={image.file_url ? `${API_BASE_URL}/api${image.file_url}` : image.preview}
                                          alt={`compatibility-section-${section.ct_test_caution_id}-img-${index}`}
                                        />
                                        {section.hoveredImageIndex === index && (
                                          <div className="material-image-overlay">
                                            <button
                                              type="button"
                                              className="material-image-delete-btn"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompatibilitySectionImageRemove(section.ct_test_caution_id, image.ct_test_report_attachment_id || image.id);
                                              }}
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ====================== 하단 판정 및 서명 영역 ====================== */}
              <div className="report-form">
                <table className="report-table">
                  <colgroup>
                    <col width="10%" />
                    <col width="15%" />
                    <col width="10%" />
                    <col width="15%" />
                    <col width="10%" />
                    <col width="15%" />
                    <col width="10%" />
                    <col width="15%" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th rowSpan={2}>{t.judgmentDate}</th>
                      <td rowSpan={2} className="tac">
                        <input 
                          type="date" 
                          style={{width:"90px"}}
                          value={reportData.judgment.judgment_date || ""}
                          onChange={(e) => handleJudgmentChange('judgment_date', e.target.value)}
                        />
                      </td>
                      <th>{t.dailyJudgment}</th>
                      <td>
                        <select 
                          style={{width:"100%", border: "none"}}
                          value={reportData.judgment.daily_judgment_id || ""}
                          disabled={optionsLoading.judgment}
                          onChange={(e) => handleJudgmentChange('daily_judgment_id', e.target.value)}
                        >
                          {judgmentOptions.map((opt, idx) => (
                            <option key={idx} value={opt.judgment_id}>{opt.judgment_name}</option>
                          ))}
                        </select>
                      </td>
                      <th rowSpan={2}>{t.tester}</th>
                      <td rowSpan={2}>
                        <input 
                          type="search" 
                          className="tac" 
                          placeholder={t.placeholders.tester}
                          value={reportData.judgment.tester || ""}
                          onChange={(e) => {
                            handleJudgmentChange('tester', e.target.value);
                            findData_ERP(e, 'tester');
                          }}
                        />
                        <input 
                          type="hidden" 
                          value={reportData.judgment.tester_id || ""}
                          onChange={(e) => handleJudgmentChange('tester_id', e.target.value)}
                        />
                      </td>
                      <th rowSpan={2}>{t.approver}</th>
                      <td rowSpan={2}>
                        <input 
                          type="search" 
                          className="tac" 
                          placeholder={t.placeholders.approver}
                          value={reportData.judgment.approver || ""}
                          onChange={(e) => {
                            handleJudgmentChange('approver', e.target.value);
                            findData_ERP(e, 'approver');
                          }}
                        />
                        <input 
                          type="hidden" 
                          value={reportData.judgment.approver_id || ""}
                          onChange={(e) => handleJudgmentChange('approver_id', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>{t.finalJudgment}</th>
                      <td>
                        <select 
                          style={{width:"100%", border: "none"}}
                          value={reportData.judgment.final_judgment_id || ""}
                          onChange={(e) => handleJudgmentChange('final_judgment_id', e.target.value)}
                        >
                          {judgmentOptions.map((opt, idx) => (
                            <option key={idx} value={opt.judgment_id}>{opt.judgment_name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </form>
          </div>
          {/* ↑ 성적서 내용 폼 ↑ */}

        </div>

        {/* 원본 이미지 모달 (통합) */}
        {selectedImage && (
          <div 
            className="modal-overlay image-modal-overlay"
            onClick={handleCloseImageModal}
          >
            <div 
              className="modal-content image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="image-modal-image-container">
                <img
                  src={selectedImage.preview}
                  alt={selectedImage.name || "원본 이미지"}
                />
                <button
                  type="button"
                  className="image-modal-close-btn"
                  onClick={handleCloseImageModal}
                >
                  ✕
                </button>
                {/* 파일명 표시 (시험항목 이미지인 경우에만) */}
                {/* {selectedImage.isFile && (
                  <div className="image-modal-filename">
                    {selectedImage.name}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        )}

        {/* PDF 모달 */}
        <CT_TestReport_PDFModal 
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
        />

        {/* ↓ 특이사항 입력 모달 ↓ */}
        {isOpenModalSearchRemark && (
          <div className="modal-overlay">
            <div className="modal-content border" style={{width:"490px"}} ref={refModalSearchRemark}>

              {/* 종합 의견 조회 폼 */}
              <div className="modal-title tac">
                종합 의견 조회
              </div>

              <form id="searchRemarkForm">
                <table className="modal-table">
                  <colgroup>
                    <col width="20%"/>
                    <col width=""/>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="tac">조회기준</th>
                      <td>
                        <div className="radio-group">
                          <label htmlFor="searchRemarkForm_historySearchType_1">
                            <input type="radio" id="searchRemarkForm_historySearchType_1" name="remark_search_type" value={"REQ"}
                                    checked={searchRemarkForm.remark_search_type === "REQ" ? true : false}
                                    onChange={(e) => {{handleSearchRemarkInput(e)}}}/>의뢰일
                          </label>
                          <label htmlFor="searchRemarkForm_historySearchType_2">
                            <input type="radio" id="searchRemarkForm_historySearchType_2" name="remark_search_type" value={"REC"}
                                    checked={searchRemarkForm.remark_search_type === "REC" ? true : false}
                                    onChange={(e) => {{handleSearchRemarkInput(e)}}}/>접수일
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="tac">조회기간</th>
                      <td>
                        <div className="date-group">
                          <input type="date" id="searchRemarkForm_remarkSearchFrom" name="remark_search_from" ref={dateFromRmkRef}
                                  value={searchRemarkForm.remark_search_from ?? ""} onChange={(e) => {handleSearchRemarkInput(e)}}/>
                          ~
                          <input type="date" id="searchRemarkForm_remarkSearchTo" name="remark_search_to" ref={dateToRmkRef}
                                  value={searchRemarkForm.remark_search_to ?? ""} onChange={(e) => {handleSearchRemarkInput(e)}}/>
                          {!isValidated && (
                            Utils.noticeValidation("날짜가")
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="tac">자재유형</th>
                      <td><input type="search" id="searchRemarkForm_remarkMaterialType" name="remark_material_type" value={searchRemarkForm.remark_material_type || ""}
                                  onChange={(e) => {handleSearchRemarkInput(e)}} placeholder="자재유형 입력"/>
                      </td>
                    </tr>
                    <tr>
                      <th className="tac">검색어</th>
                      <td><input type="search" id="searchRemarkForm_remarkCtContent" name="remark_ct_content" value={searchRemarkForm.remark_ct_content || ""} 
                                  onChange={(e) => {handleSearchRemarkInput(e)}} placeholder="검색어 입력"/>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="modal-buttons">
                <button type="button" className="" onClick={(e) => {searchRemark(e)}}>검색</button>
              </div>

              {/* 조회 결과 목록 */}
              <div className="modal-list">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: "10%"}}>번호</th>
                      <th style={{width: "20%"}}>자재유형</th>
                      <th>내용 (클릭하여 복사)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRemarkList.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                          {remarkList.length === 0 
                            ? "검색 버튼을 클릭하여 종합 의견을 조회하세요." 
                            : "조회 결과가 없습니다."}
                        </td>
                      </tr>
                    ) : (
                      paginatedRemarkList.map((remark, index) => (
                        <tr key={index}>
                          <td className="tac">{(remarkCurrentPage - 1) * remarkPageSize + index + 1}</td>
                          <td>{remark.material_type || '-'}</td>
                          <td 
                            onClick={() => handleCopyRemarkContent(remark.ct_test_item_id, remark.remark)}
                            style={{ cursor: "pointer", position: "relative" }}
                          >
                            <span>{remark.remark}</span>
                            {copiedRemarkId === remark.ct_test_item_id && (
                              <span className="copiedMessage">복사됨</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* 페이징 바 */}
                {remarkTotalPages > 0 && (
                  <div className="pagination" style={{ marginTop: "15px" }}>
                    <button disabled={remarkCurrentPage === 1} onClick={moveRemarkFirst}>⏮</button>
                    <button disabled={remarkCurrentPage === 1} onClick={moveRemarkPrev}>◀</button>
                    {compactRemarkPages.map((p) => (
                      <button 
                        key={p} 
                        className={p === remarkCurrentPage ? "active" : ""}
                        onClick={() => moveRemarkPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button disabled={remarkCurrentPage === remarkTotalPages || remarkTotalPages === 0} onClick={moveRemarkNext}>▶</button>
                    <button disabled={remarkCurrentPage === remarkTotalPages || remarkTotalPages === 0} onClick={moveRemarkLast}>⏭</button>
                  </div>
                )}
              </div>

              {/* 닫기 버튼 */}
              <div className="modal-buttons">
                <button className="submit" onClick={handleCloseRemarkModal}>닫기</button>
              </div>
            </div>
          </div>
        )}
        {/* ↑ 특이사항 입력 모달 ↑ */}

        {/* ↓ 시험 기준 조회 모달 ↓ */}
        {isOpenModalSearchTestStandard && (
          <div className="modal-overlay">
            <div className="modal-content border" style={{width:"800px", maxWidth:"90%"}} ref={refModalSearchTestStandard}>

              {/* 시험 기준 조회 */}
              <div className="modal-title tac">
                시험 기준 조회
              </div>

              {/* 필터 입력창 */}
              <div className="approval-toolbar"
                    style={{ gridTemplateColumns: "1fr" }}
                    aria-label="필터 및 검색">
                <input 
                  type="search" 
                  value={testStandardQuery}
                  onChange={(e) => {
                    setTestStandardQuery(e.target.value);
                    setTestStandardCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
                  }} 
                  placeholder="시험법 코드, 자재유형, 시험항목명, 시험 기준으로 검색"
                  style={{ 
                    width: "100%", 
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                />
              </div>

              {/* 조회 결과 목록 */}
              <div className="modal-list">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: "8%"}}>번호</th>
                      <th style={{width: "15%"}}>시험법 코드</th>
                      <th style={{width: "15%"}}>자재유형</th>
                      <th style={{width: "20%"}}>시험항목명</th>
                      <th>시험 기준 (클릭하여 추가)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTestStandardList.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                          {testStandardList.length === 0 
                            ? "검색 버튼을 클릭하여 시험 기준을 조회하세요." 
                            : "조회 결과가 없습니다."}
                        </td>
                      </tr>
                    ) : (
                      paginatedTestStandardList.map((standard, index) => (
                        <tr 
                          key={index}
                          onClick={() => handleSelectTestStandard(standard)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="tac">{(testStandardCurrentPage - 1) * testStandardPageSize + index + 1}</td>
                          <td>{standard.test_standard_code}</td>
                          <td>{standard.material_large_category_name || '-'}</td>
                          <td>{standard.test_standard_name}</td>
                          <td>{standard.test_guide}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* 페이징 바 */}
                {testStandardTotalPages > 0 && (
                  <div className="pagination" style={{ marginTop: "15px" }}>
                    <button disabled={testStandardCurrentPage === 1} onClick={moveTestStandardFirst}>⏮</button>
                    <button disabled={testStandardCurrentPage === 1} onClick={moveTestStandardPrev}>◀</button>
                    {compactTestStandardPages.map((p) => (
                      <button 
                        key={p} 
                        className={p === testStandardCurrentPage ? "active" : ""}
                        onClick={() => moveTestStandardPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button disabled={testStandardCurrentPage === testStandardTotalPages || testStandardTotalPages === 0} onClick={moveTestStandardNext}>▶</button>
                    <button disabled={testStandardCurrentPage === testStandardTotalPages || testStandardTotalPages === 0} onClick={moveTestStandardLast}>⏭</button>
                  </div>
                )}
              </div>

              {/* 닫기 버튼 */}
              <div className="modal-buttons">
                <button className="btn-secondary" onClick={handleCloseTestStandardModal}>닫기</button>
              </div>
            </div>
          </div>
        )}
        {/* ↑ 시험 기준 조회 모달 ↑ */}

        {/* ↓ 이전 성적서 조회 모달 ↓ */}
        {isOpenModalSearchHistory.open && (
          <div className="modal-overlay">
            <div className="modal-content border" style={{width:"490px"}} ref={refModalSearchHistory}>

              {/* 이전 성적서 조회 폼 */}
              <div className="modal-title tac">
                이전 성적서 조회
              </div>

              {/* ↓ 이전 성적서 조회 폼 ↓ */}
              <form id="searchHistoryForm">
                <table className="modal-table">
                  <colgroup>
                    <col width="20%"/>
                    <col width=""/>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="tac">조회기준</th>
                      <td>
                        <div className="radio-group">
                          <label htmlFor="searchHistoryForm_historySearchType_1">
                            <input type="radio" id="searchHistoryForm_historySearchType_1" name="history_search_type" value={"REQ"}
                                    checked={searchHistoryForm.history_search_type === "REQ" ? true : false}
                                    onChange={(e) => {{handleSearchHistoryInput(e)}}}/>의뢰일
                          </label>
                          <label htmlFor="searchHistoryForm_historySearchType_2">
                            <input type="radio" id="searchHistoryForm_historySearchType_2" name="history_search_type" value={"REC"}
                                    checked={searchHistoryForm.history_search_type === "REC" ? true : false}
                                    onChange={(e) => {{handleSearchHistoryInput(e)}}}/>접수일
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="tac">조회기간</th>
                      <td>
                        <div className="date-group">
                          <input type="date" id="searchHistoryForm_searchFrom" name="history_search_from" ref={dateFromSrchRef}
                                  value={searchHistoryForm.history_search_from ?? ""} onChange={(e) => {handleSearchHistoryInput(e)}}/>
                          ~
                          <input type="date" id="searchHistoryForm_searchTo" name="history_search_to" ref={dateToSrchRef}
                                  value={searchHistoryForm.history_search_to ?? ""} onChange={(e) => {handleSearchHistoryInput(e)}}/>
                          {!isValidated && (
                            Utils.noticeValidation("날짜가")
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="tac">CT 번호</th>
                      <td><input type="search" id="searchHistoryForm_CtCode" name="history_ct_no" value={searchHistoryForm.history_ct_no || ""} 
                                  onChange={(e) => {handleSearchHistoryInput(e)}} placeholder="CT 번호 입력"/>
                      </td>
                    </tr>
                    <tr>
                      <th className="tac">검색어</th>
                      <td><input type="search" id="searchHistoryForm_ctContent" name="history_ct_content" value={searchHistoryForm.history_ct_content || ""} 
                                  onChange={(e) => {handleSearchHistoryInput(e)}} placeholder="검색어 입력"/>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="modal-buttons">
                <button type="button" className="btn-primary" onClick={(e) => {searchHistory(e)}}>검색</button>
              </div>
              {/* ↑ 이전 성적서 조회 폼 ↑ */}

              {/* ↓ 이전 성적 조회 결과 목록 ↓ */}
              <div className="modal-list">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: "5%"}}>선택</th>
                      <th style={{width: "20%"}}>CT 번호</th>
                      <th style={{width: "25%"}}>고객사명</th>
                      <th style={{width: "25%"}}>샘플명</th>
                      <th style={{width: "25%"}}>Lab No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistoryList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="tac" style={{ padding: "20px", color: "#999" }}>
                          {historyList.length === 0 
                            ? "검색 버튼을 클릭하여 성적서를 조회하세요." 
                            : "조회 결과가 없습니다."}
                        </td>
                      </tr>
                    ) : (
                      paginatedHistoryList.map((history, index) => (
                        <tr 
                          key={index}
                          onClick={() => handleSelectHistory(history.ct_test_report_id)}
                          style={{ 
                            cursor: "pointer",
                            backgroundColor: selectedHistoryId === history.ct_test_report_id ? '#e3f2fd' : 'transparent'
                          }}
                        >
                          <td className="tac">
                            <input 
                              type="radio" 
                              name="selectedHistory"
                              checked={selectedHistoryId === history.ct_test_report_id}
                              onChange={() => handleSelectHistory(history.ct_test_report_id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td>{history.ct_no || '-'}</td>
                          <td>{history.client_name || '-'}</td>
                          <td>{history.sample_name || '-'}</td>
                          <td>{history.lab_no || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* 페이징 바 */}
                {historyTotalPages > 0 && (
                  <div className="pagination" style={{ marginTop: "15px" }}>
                    <button disabled={historyCurrentPage === 1} onClick={moveHistoryFirst}>⏮</button>
                    <button disabled={historyCurrentPage === 1} onClick={moveHistoryPrev}>◀</button>
                    {compactHistoryPages.map((p) => (
                      <button 
                        key={p} 
                        className={p === historyCurrentPage ? "active" : ""}
                        onClick={() => moveHistoryPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button disabled={historyCurrentPage === historyTotalPages || historyTotalPages === 0} onClick={moveHistoryNext}>▶</button>
                    <button disabled={historyCurrentPage === historyTotalPages || historyTotalPages === 0} onClick={moveHistoryLast}>⏭</button>
                  </div>
                )}
              </div>
              {/* ↑ 이전 성적 조회 결과 목록 ↑ */}

              {/* ↓ 완료/닫기 버튼 ↓ */}
              <div className="modal-buttons">
                <button type="button" className="btn-success" onClick={handleLoadHistory}>완료</button>
                <button type="button" className="btn-secondary" onClick={handleCloseHistoryModal}>닫기</button>
              </div>
            </div>
          </div>
        )}
        {/* ↑ 이전 성적서 조회 모달 ↑ */}
    </>
  )
}