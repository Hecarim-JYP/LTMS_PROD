/**
 * 파일명 : CT_TestReport_PDFContent.jsx
 * 용도 : CT 시험성적서 PDF 출력 콘텐츠 (모달/팝업용)
 * 최초등록 : 2026-01-09 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Common } from "/src/components/Common";
import { ctTranslations } from "/src/components/translations/ctReport";

export default function CT_TestReport_PDFContent({ reportData, language = 'KOR', onClose }) {
  if (!reportData) {
    return <div>데이터가 없습니다.</div>;
  }

  /* ============================== 페이지 변수 ============================== */
  const G_TODAY = Common.G_TODAY;
  const trLineHeight = 1.5; // tr 높이 조절 (내용 길 때)

  /* ============================== 다국어 지원 ============================== */
  // 현재 언어의 번역 객체
  const t = language === "KOR" ? ctTranslations.KOR : ctTranslations.EN;

  /* =============================== 상태 관리 =============================== */
  // 기본 정보
  const [basicInfo] = useState(reportData?.basicInfo || {});
  
  // 의뢰 정보
  const [requestInfo] = useState(reportData?.requestInfo || {});
  
  // 시험항목
  const [testItems] = useState(reportData?.testItems || []);
  
  // 주의사항
  const [cautions] = useState(reportData?.cautions || {});
  
  // 판정 및 서명
  const [judgment] = useState(reportData?.judgment || {});

  // 판정 옵션 (sessionStorage에서 가져오기)
  const [judgmentOptions, setJudgmentOptions] = useState([]);

  const reportDetailRef = useRef(null);

  // 판정 옵션 로드
  useEffect(() => {
    const cachedOptions = sessionStorage.getItem('judgmentOptions');
    if (cachedOptions) {
      try {
        const options = JSON.parse(cachedOptions);
        setJudgmentOptions(options);
      } catch (error) {
        console.error('판정 옵션 로드 실패:', error);
      }
    }
  }, []);

  // 판정 ID로 판정명 찾기
  const getJudgmentName = (judgmentId) => {
    if (!judgmentId || judgmentOptions.length == 0) return '-';
    const option = judgmentOptions.find(opt => opt.judgment_id == judgmentId);
    return option ? (language === 'KOR' ? option.judgment_name : option.judgment_name_en) : '-';
  };

  /**
   * 인쇄 함수
   * - reportDetailRef 영역만 인쇄되도록 처리
   * - 새 윈도우에서 콘텐츠 인쇄
   */
  const handlePrint = () => {
    const element = reportDetailRef.current;
    if (!element) {
      alert('인쇄할 영역을 찾을 수 없습니다.');
      return;
    }

    // 인쇄할 내용 복사
    const printContent = element.innerHTML;
    
    // 새 윈도우 열기
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    
    // 인쇄 페이지 HTML 생성
    const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!-- <title>자재 상용성 시험 성적서</title> -->
                <title>CT Test Report - ${G_TODAY}</title>
                <link rel="stylesheet" href="/src/css/PDFModal.css">
            </head>
            <body>
                <div class="pdf-content-wrapper">
                    <!-- 인쇄용 머리글 -->
                    <!--
                    <div class="print-header">
                        <div>자재 상용성 시험 성적서</div>
                        <div>CT 번호: ${reportData?.basicInfo?.ctNo || '-'}</div>
                    </div>
                    -->
                    
                    <div class="printable-area">
                        ${printContent}
                    </div>
                    
                    <!-- 인쇄용 바닥글 -->
                    <!--
                    <div class="print-footer">
                        <div style="line-height: 1.5;">
                            <div>※ 이 성적서는 의뢰자가 제시한 시료로 기재된 기간 동안 시험한 결과로서, 전체 제품에 대한 장기적인 품질이나 시료(재질, 사용, 내용물) 변경에 따른 품질은 보증하지 않음.</div>
                            <div>※ 한국 내 환경에 맞추어 시험한 결과이므로, 국외에서는 해당 환경 및 조건에 따라 시험 결과가 다를 수 있음.</div>
                        </div>
                    </div>
                    -->
                </div>
            </body>
        </html>
    `;
    
    // innerHTML을 사용하여 더 모던한 방식으로 처리
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // 로딩 완료 후 인쇄
    setTimeout(() => {
        printWindow.print();
        // printWindow.close();
    }, 250);
    
  };

  /**
   * PDF 생성 함수
   * - report-detail 영역을 html2canvas로 캡처하여 PDF로 변환
   * - 긴 내용은 자동으로 여러 페이지로 분할
   * - 파일 크기 최적화 (JPEG 포맷, 압축)
   * Print의 PDF 저장기능을 사용하도록 우회함
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
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    }
  };

  // 메인 렌더링

  return (
    <div className="pdf-content-wrapper">
      {/* ↓ 상단 버튼 영역 ↓ */}
      <div className="report-button-area">
        <button className="btn btn-print" onClick={handlePrint}>
          🖨️ {t.print}
        </button>
        {/* <button className="btn btn-pdf" onClick={generatePdf}>
          📄 PDF
        </button> */}
        <button className="btn btn-close" onClick={onClose}>
          ✕ {t.close}
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
          <h1 className="page-title tac">{t.pageTitle}</h1>
        </div>
        {/* ↑ 화면 타이틀 ↑ */}

        {/* ↓ 상세보기 헤더 ↓ */}
        <div className="report-header">
          <div className="report-title tal">{t.ctNo} {basicInfo?.ct_no || '-'}</div>
        </div>
        {/* ↑ 상세보기 헤더 ↑ */}

        {/* ↓ 성적서 내용 폼 ↓ */}
        <div className="report-detail">
          <form>
            {/* ====================== 기본 정보 ====================== */}
            <div id="basic-info-section" className="report-form">
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
                  <tr id="target-tr">
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.ctNo}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.ct_no || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.client}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.client_name || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.specific}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.specific || '-'}</td>
                  </tr>
                  <tr>
                    <th rowSpan={2} style={{ lineHeight: `${trLineHeight}` }}>{t.productName}</th>
                    <td rowSpan={2} style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.sample_name || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.formulationManager}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.formulation_manager || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.viscosity}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.viscosity_hardness || '-'}</td>
                  </tr>
                  <tr>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.desiredVolume}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.desired_volume || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.labNo}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{basicInfo?.lab_no || '-'}</td>
                  </tr>
                  <tr>
                    <th>{t.testStartDate}</th>
                    <td className="tac">{basicInfo?.ct_receipt_date || '-'}</td>
                    <th>{t.requestOrder}</th>
                    <td className="tac">{basicInfo?.ct_test_seq || '-'}</td>
                    <th rowSpan={2}>{t.formulationNotes}</th>
                    <td rowSpan={2}>
                      <div className="formulation-info-box" style={{border: "none", whiteSpace: "pre-wrap"}}>
                        {basicInfo?.sample_etc || '-'}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>{t.testEndDate}</th>
                    <td className="tac">{basicInfo?.ct_due_date || '-'}</td>
                    <th>{t.requestQuantity}</th>
                    <td className="tac">{basicInfo?.sample_quantity || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ====================== 의뢰 정보 영역 ====================== */}
            <div id="request-info-section" className="report-form">
              <table className="report-table">
                <colgroup>
                  <col width="13%" />
                  <col width="20%" />
                  <col width="13%" />
                  <col width="54%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th>{t.materialSupplier}</th>
                    <td className="tac">{requestInfo?.material_supplier_name || '-'}</td>
                    <th rowSpan={2}>{t.materialImage}</th>
                    <td rowSpan={2} className="material-image-td">
                      {requestInfo?.images && requestInfo.images.length > 0 ? (
                        <div className="material-image-grid">
                          {requestInfo.images.map((image, index) => {
                            // 홀수 개일 때 마지막 이미지는 중앙 정렬
                            const isLastOdd = requestInfo.images.length % 2 === 1 && index === requestInfo.images.length - 1;
                            return (
                              <div 
                                key={index}
                                style={isLastOdd ? { gridColumn: '1 / -1', justifySelf: 'center' } : {}}
                              >
                                <img src={image.preview} alt={`preview-${index}`} />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                  <tr>
                    <th>{t.materialInfo}</th>
                    <td>
                      <div className="material-info-box" style={{border: "none", whiteSpace: "pre-wrap"}}>
                        {requestInfo?.material_description || '-'}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ====================== 시험항목 테이블 ====================== */}
            <div id="test-items-section" className="report-form">
              <table className="report-table report-test-item-table">
                <colgroup>
                  <col width="11%" />
                  <col width="15%" />
                  <col width="20%" />
                  <col width="9%" />
                  <col width="32%" />
                  <col width="13%" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="tac" style={{ lineHeight: `${trLineHeight}` }}>{t.testNo}</th>
                    <th className="tac" style={{ lineHeight: `${trLineHeight}` }}>{t.testName}</th>
                    <th className="tac" style={{ lineHeight: `${trLineHeight}` }}>{t.testStandard}</th>
                    <th className="tac" style={{ lineHeight: `${trLineHeight}` }}>{t.testResult}</th>
                    <th className="tac" style={{ lineHeight: `${trLineHeight}` }}>{t.testSummary}</th>
                    <th className="tac" style={{ lineHeight: `${trLineHeight}` }}>{t.remark}</th>
                  </tr>
                </thead>
                <tbody>
                  {testItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td>
                          <div className="test-item-no tac">
                            {item.test_standard_code || '-'}
                          </div>
                        </td>
                        <td>
                          <div className="test-item-text tac">
                            {item.test_standard_name || '-'}
                          </div>
                        </td>
                        <td>
                          <div className="test-item-text">
                            {item.test_guide || '-'}
                          </div>
                        </td>
                        <td>
                          <div className="test-item-result tac">
                            {item.test_result || '-'}
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
                      </tr>
                      {/* 첨부 이미지가 있는 경우 별도 행으로 표시 */}
                      {item.attachedImage && item.attachedImage.preview && (
                        <tr>
                          <td colSpan={6} style={{ padding: '8px', textAlign: 'center' }}>
                            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                              <img 
                                src={item.attachedImage.preview} 
                                alt={item.attachedImage.name || 'test-item-image'} 
                                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                              />
                              {item.attachedImage.name && (
                                <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                                  {item.attachedImage.name}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ====================== 하단 판정 및 서명 영역 ====================== */}
            <div id="judgment-section" className="report-form">
              <table className="report-table" style={{ lineHeight: '1.0' }}>
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
                    <th style={{ lineHeight: `${trLineHeight}` }} rowSpan={2}>{t.judgmentDate}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} rowSpan={2} className="tac">{judgment?.judgment_date || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.dailyJudgment}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{getJudgmentName(judgment?.daily_judgment_id)}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }} rowSpan={2}>{t.tester}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} rowSpan={2} className="tac">{judgment?.tester || '-'}</td>
                    <th style={{ lineHeight: `${trLineHeight}` }} rowSpan={2}>{t.approver}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} rowSpan={2} className="tac">{judgment?.approver || '-'}</td>
                  </tr>
                  <tr>
                    <th style={{ lineHeight: `${trLineHeight}` }}>{t.finalJudgment}</th>
                    <td style={{ lineHeight: `${trLineHeight}` }} className="tac">{getJudgmentName(judgment?.final_judgment_id)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ↓ 하단 주의사항 ↓ */}
            <div className="report-form" style={{display:"flex", flexDirection:"column"}}>
              <span className="notice-message">
                {t.notices.qualityDisclaimer}
              </span>
              <span className="notice-message">
                {t.notices.environmentDisclaimer}
              </span>
            </div>
            {/* ↑ 하단 주의사항 ↑ */}

            {/* ====================== 주의 사항 ====================== */}
            {/* CPNP 양식일 경우 주의사항 섹션 제외 */}
            {language !== 'CPNP' && (
              <div id="cautions-section" className="report-form" style={{pageBreakBefore:"always"}}>
                <table className="report-table">
                  <colgroup>
                    <col width="13%" />
                    <col width="87%" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th colSpan={2}>{t.caution}</th>
                    </tr>

                    {/* 용량 관련 */}
                    <tr>
                      <th>{t.volume}</th>
                      <td>
                      {/* 용량 동적 섹션들 */}
                      {cautions?.volume?.sections && cautions.volume.sections.length > 0 ? (
                        cautions.volume.sections.map((section, index) => (
                          <div key={section.ct_test_caution_id} className="caution-section">
                            <div className="caution-section-label tac">{section.section_title || `용량 섹션 ${index + 1}`}</div>
                            <div className="warning-box">
                              {section.section_content || '-'}
                            </div>
                            {/* 동적 섹션 이미지 */}
                            {section.images && section.images.length > 0 && (
                              <div className="caution-images">
                                {section.images.map((image) => (
                                  <div key={image.id} className="caution-image-item">
                                    <img src={image.preview} alt={`volume-section-${section.ct_test_caution_id}-${image.id}`} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        null
                      )}
                    </td>
                  </tr>

                  {/* 포장재 관련 */}
                  <tr>
                    <th>{t.packaging}</th>
                    <td>
                      {/* 포장재 동적 섹션들 */}
                      {cautions?.packaging?.sections && cautions.packaging.sections.length > 0 ? (
                        cautions.packaging.sections.map((section, index) => (
                          <div key={section.ct_test_caution_id} className="caution-section">
                            <div className="caution-section-label tac">{section.section_title || `포장재 섹션 ${index + 1}`}</div>
                            <div className="warning-box">
                              {section.section_content || '-'}
                            </div>
                            {/* 동적 섹션 이미지 */}
                            {section.images && section.images.length > 0 && (
                              <div className="caution-images">
                                {section.images.map((image) => (
                                  <div key={image.id} className="caution-image-item">
                                    <img src={image.preview} alt={`packaging-section-${section.ct_test_caution_id}-${image.id}`} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        null
                      )}
                    </td>
                  </tr>

                  {/* 상용성 관련 */}
                  <tr>
                    <th>{t.compatibility}</th>
                    <td>
                      {/* 상용성 동적 섹션들 */}
                      {cautions?.compatibility?.sections && cautions.compatibility.sections.length > 0 ? (
                        cautions.compatibility.sections.map((section, index) => (
                          <div key={section.ct_test_caution_id} className="caution-section">
                            <div className="caution-section-label tac">{section.section_title || `상용성 섹션 ${index + 1}`}</div>
                            <div className="warning-box">
                              {section.section_content || '-'}
                            </div>
                            {/* 동적 섹션 이미지 */}
                            {section.images && section.images.length > 0 && (
                              <div className="caution-images">
                                {section.images.map((image) => (
                                  <div key={image.id} className="caution-image-item">
                                    <img src={image.preview} alt={`compatibility-section-${section.ct_test_caution_id}-${image.id}`} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        null
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            )}

          </form>
        </div>
        {/* ↑ 성적서 내용 폼 ↑ */}

      </div>
    </div>
  );
}