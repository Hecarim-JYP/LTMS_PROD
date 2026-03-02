/**
 * 파일명 : CT_TestReport_PDF.jsx
 * 용도 : CT 시험성적서 PDF 출력용 화면 (읽기 전용)
 * 최초등록 : 2026-01-08 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Common } from "/src/components/Common";
import * as Utils from "/src/components/Utils";

export default function CT_TestReport_PDF() {
  const location = useLocation();
  
  // React Router state에서 데이터 추출 (이전 방식 호환성)
  let reportData = location.state?.reportData || null;
  let isPrint = location.state?.isPrint || false;

  // sessionStorage에서 데이터 추출 (팝업 방식)
  if (!reportData) {
    const pdfPopupData = sessionStorage.getItem('pdfReportData');
    if (pdfPopupData) {
      try {
        const parsed = JSON.parse(pdfPopupData);
        reportData = parsed.reportData;
        isPrint = parsed.isPrint;
        // 사용 후 삭제
        sessionStorage.removeItem('pdfReportData');
      } catch (error) {
        console.error('sessionStorage 데이터 파싱 실패:', error);
      }
    }
  }

  console.log('reportData:', reportData);
  console.log('isPrint:', isPrint);

  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY;
  const G_STARTDAY = Common.G_STARTDAY;

  /* =============================== 상태 관리 =============================== */
  const [testItems] = useState(reportData?.testItems || []);
  const [images] = useState(reportData?.images || []);
  const [volumeText] = useState(reportData?.volumeText || "");
  const [packagingText] = useState(reportData?.packagingText || "");
  const [compatibilityText] = useState(reportData?.compatibilityText || "");
  const [materialInfo] = useState(reportData?.materialInfo || "");


  const reportDetailRef = useRef(null);

  /**
   * 페이지 마운트 시 자동으로 PDF 생성 또는 화면 표시
   */
  useEffect(() => {
    if (!reportData) {
      // alert('데이터가 없습니다. 이전 페이지로 돌아갑니다.');
      // window.history.back();
      return;
    }

    // 딜레이를 두어 DOM이 완전히 렌더링된 후 처리
    const timer = setTimeout(() => {
      if (isPrint) {
        // 미리보기 모드: 브라우저 프린트 대화창 열기
        window.print();
      } else {
        // PDF 다운로드 모드: 자동으로 PDF 생성
        generatePdf();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [reportData, isPrint]);


  /**
   * 인쇄 함수
   * - 브라우저 인쇄 대화창 열기
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * 팝업 닫기
   */
  const handleClosePopup = () => {
    window.close();
  };

  /**
   * PDF 생성 함수
   * - report-detail 영역을 html2canvas로 캡처하여 PDF로 변환
   * - 긴 내용은 자동으로 여러 페이지로 분할
   * - 파일 크기 최적화 (JPEG 포맷, 압축)
   */
  const generatePdf = async () => {
    try {
      const element = reportDetailRef.current;
      if (!element) {
        console.error('PDF로 내보낼 영역을 찾을 수 없습니다.');
        return;
      }

      // HTML을 Canvas로 변환 (파일 크기 최적화)
      const canvas = await html2canvas(element, {
        scale: 1.5, // 품질과 크기 균형
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight,
        windowWidth: element.scrollWidth
      });

      // Canvas를 JPEG로 변환 (PNG보다 70-80% 작음)
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // 품질 85%
      
      // PDF 생성 (A4, 세로) - 압축 활성화
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // PDF 페이지 크기
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 이미지 비율 유지하면서 PDF에 맞춤
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      // 첫 페이지 추가
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      // 여러 페이지 자동 분할
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      // PDF 다운로드
      pdf.save(`CT_TestReport_${new Date().getTime()}.pdf`);
      
      // 다운로드 후 이전 페이지로 돌아가기
      setTimeout(() => {
        //window.history.back();
      }, 500);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
      window.history.back();
    }
  };

  return (
    <div className="container">
      {/* ↓ 상단 버튼 영역 ↓ */}
      <div className="report-button-area">
        <button className="btn btn-print" onClick={handlePrint}>
          🖨️ 인쇄
        </button>
        <button className="btn btn-download" onClick={generatePdf}>
          📥 PDF 다운로드
        </button>
        <button className="btn btn-close" onClick={handleClosePopup}>
          ✕ 닫기
        </button>
      </div>
      {/* ↑ 상단 버튼 영역 ↑ */}

      {/* ↓ 성적서 내용 ↓ */}
      <div 
        className="printable-area" 
        id="report-detail" 
        ref={reportDetailRef}
      >
      {/* ↓ 화면 타이틀 ↓ */}
      <div>
        <h1 className="page-title tac">자재 상용성 시험 성적서</h1>
      </div>
      {/* ↑ 화면 타이틀 ↑ */}

      {/* ↓ 상세보기 헤더 ↓ */}
      <div className="report-header">
        <div className="report-title tal">CT 번호 : {reportData?.ctNo}</div>
      </div>
      {/* ↑ 상세보기 헤더 ↑ */}

      {/* ↓ 성적서 내용 폼 ↓ */}
      <div className="report-detail">
        <form>
          {/* ====================== 기본 정보 ====================== */}
          <div className="report-form">
            <table className="report-table">
              <colgroup>
                <col width="13.3%"/>
                <col width="22%"/>
                <col width="13.3%"/>
                <col width="22%"/>
                <col width="13.3%"/>
                <col width="22%"/>
              </colgroup>
              <tbody>
                <tr>
                  <th>CT 번호</th>
                  <td>{reportData?.ctNo}</td>
                  <th>시험 의뢰자</th>
                  <td>{reportData?.clientName}</td>
                  <th>비중</th>
                  <td>1.000</td>
                </tr>
                <tr>
                  <th rowSpan={2}>제품명</th>
                  <td rowSpan={2}>{reportData?.sampleName}</td>
                  <th>시험 담당자</th>
                  <td>박진영</td>
                  <th>제형 담당자</th>
                  <td>박제형</td>
                </tr>
                <tr>
                  <th>희망 용량</th>
                  <td>00g</td>
                  <th>랩넘버</th>
                  <td>LAB01-232323</td>
                </tr>
                <tr>
                  <th>시험 시작일</th>
                  <td>{G_TODAY}</td>
                  <th>의뢰 차수</th>
                  <td>3차</td>
                  <th rowSpan={2}>제형 특이사항</th>
                  <td rowSpan={2}>-</td>
                </tr>
                <tr>
                  <th>시험 종료일</th>
                  <td>{G_TODAY}</td>
                  <th>의뢰 수량</th>
                  <td>15ea</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ====================== 의뢰 정보 영역 ====================== */}
          <div className="report-form">
            <table className="report-table">
              <colgroup><col width="8%" /><col width="10%" /><col width="8%" /><col width="" /></colgroup>
              <tbody>
                <tr>
                  <th>자재 업체</th>
                  <td>{reportData?.supplier}</td>
                  <th rowSpan={2}>의뢰 자재 사진</th>
                  <td rowSpan={2} className="material-image-td">
                    {images && images.length > 0 ? (
                      <div className="material-image-grid">
                        {images.map((image, index) => (
                          <div key={index}>
                            <img src={image.preview} alt={`preview-${index}`} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </td>
                </tr>
                <tr>
                  <th>의뢰 자재 정보</th>
                  <td>
                    <div className="material-info-box">
                      {materialInfo || '-'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ====================== 시험항목 테이블 ====================== */}
          <div className="report-form">
            <table className="report-table report-test-item-table">
              <colgroup><col width="8%" /><col width="15%" /><col width="20%" /><col width="5%" /><col width="25%" /><col width="15%" /><col width="12%" /></colgroup>
              <thead>
                <tr>
                  <th className="tac">시험법 번호</th>
                  <th className="tac">시험 항목</th>
                  <th className="tac">시험 기준</th>
                  <th className="tac">시험 성적</th>
                  <th className="tac">시험 종합 의견</th>
                  <th className="tac">비고</th>
                  <th className="tac">첨부 이미지</th>
                </tr>
              </thead>
              <tbody>
                {testItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="test-item-no">
                        {item.testNo}
                      </div>
                    </td>
                    <td>
                      <div className="test-item-text">
                        {item.testName}
                      </div>
                    </td>
                    <td>
                      <div className="test-item-text">
                        {item.testStandard}
                      </div>
                    </td>
                    <td>
                      <div className="test-item-result">
                        {item.testResult}
                      </div>
                    </td>
                    <td>
                      <div className="test-item-opinion">
                        {item.remark || '-'}
                      </div>
                    </td>
                    <td>
                      <div className="test-item-opinion">
                        {item.note || '-'}
                      </div>
                    </td>
                    <td className="test-item-attachment">
                      {item.attachedImage ? (
                        <span className="attached">
                          {item.attachedImage.name || '첨부됨'}
                        </span>
                      ) : (
                        <span className="not-attached">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ====================== 주의 사항 ====================== */}
          <div className="report-form">
            <table className="report-table">
              <colgroup><col width="13.3%" /><col width="" /></colgroup>
              <tbody>
                <tr>
                  <th colSpan={2}>주의사항</th>
                </tr>
                <tr>
                  <th>용량 관련</th>
                  <td>
                    <div className="warning-box">
                      {volumeText || '-'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>포장재 관련</th>
                  <td>
                    <div className="warning-box">
                      {packagingText || '-'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>상용성 관련</th>
                  <td>
                    <div className="warning-box">
                      {compatibilityText || '-'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ====================== 하단 판정 및 서명 영역 ====================== */}
          <div className="report-form">
            <table className="report-table">
              <colgroup><col width="10%" /><col width="15%" /><col width="10%" /><col width="15%" /><col width="10%" /><col width="15%" /><col width="10%" /><col width="15%" /></colgroup>
              <tbody>
                <tr>
                  <th rowSpan={2}>판정일자</th>
                  <td rowSpan={2} className="tac">{G_TODAY}</td>
                  <th>당일판정</th>
                  <td>적합</td>
                  <th rowSpan={2}>시험자</th>
                  <td rowSpan={2}>박시험</td>
                  <th rowSpan={2}>승인자</th>
                  <td rowSpan={2}>김승인</td>
                </tr>
                <tr>
                  <th>최종판정</th>
                  <td>적합</td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </div>
      {/* ↑ 성적서 내용 폼 ↑ */}
      </div>
    </div>
  );
}
