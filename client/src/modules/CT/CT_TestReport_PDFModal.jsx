/**
 * 파일명 : CT_TestReport_PDFModal.jsx
 * 용도 : CT 시험성적서 PDF 모달 컴포넌트
 * 최초등록 : 2026-01-09 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useEffect, useState } from "react";
import CT_TestReport_PDFContent from "/src/modules/CT/CT_TestReport_PDFContent";

import "/src/css/PDFModal.css"; // 모달 전용 스타일

export default function CT_TestReport_PDFModal({ isOpen, onClose }) {
  const [reportData, setReportData] = useState(null);
  const [language, setLanguage] = useState('KOR');

  useEffect(() => {
    if (!isOpen) return;

    // sessionStorage에서 데이터 추출
    const pdfModalData = sessionStorage.getItem('pdfModalData');
    if (pdfModalData) {
      try {
        const parsed = JSON.parse(pdfModalData);
        setReportData(parsed.reportData);
        setLanguage(parsed.language || 'KOR');
      } catch (error) {
        console.error('sessionStorage 데이터 파싱 실패:', error);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setReportData(null);
    sessionStorage.removeItem('pdfModalData');
    onClose();
  };

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-container">
        <CT_TestReport_PDFContent 
          reportData={reportData} 
          language={language}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
