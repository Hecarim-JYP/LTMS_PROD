/**
 * 파일명 : CT_Request_ApprovalDetail.jsx
 * 용도   : CT 결재 내역 상세보기 모달
 * 최초등록 : 2026-01-13
 * 수정일자 :
 * 수정사항 :
 */

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "/src/contexts/AuthContext";

export default function CT_Request_ApprovalDetail({ isOpen, onClose, approvalItem }) {

  /**
   * 사용자 정보 컨텍스트
   */
  const { user } = useContext(AuthContext);
  const companyId = user.company_id; // 회사 ID
  
  /**
   * 결재 상세 데이터
   */
  const [approvalDetail, setApprovalDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  /**
   * approvalItem이 변경될 때마다 데이터 처리
   * 1. 먼저 목록 데이터를 상세 화면에 매핑 (즉시 표시)
   * 2. 이후 API로 전체 상세 데이터 조회 (선택사항)
   */
  useEffect(() => {
    if (!isOpen || !approvalItem) {
      setApprovalDetail(null);
      return;
    }

    // 2단계: API로 전체 상세 데이터 조회 (선택사항)
    // 주석을 해제하여 API 연동 시 사용
    const fetchDetailData = async () => {
      setLoading(true);
      setError(null);

      try {
        
        const params = {
          companyId: companyId,
          ct_request_id: approvalItem.ct_request_id,
          approval_document_id: approvalItem.approval_document_id
        };

        const response = await axios.get("/api/ltms/ct/approval/detail", { params });
        
        if (response.data.success) {
          // API 응답 데이터로 업데이트
          setApprovalDetail(response.data.data);
        } else {
          setError(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('결재 상세 조회 실패:', err);
        setError(err.response?.data?.message || '데이터 조회 중 오류가 발생했습니다.');
        // 에러 발생 시에도 매핑된 데이터는 유지
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
    
  }, [isOpen, approvalItem]);


  /**
   * 모달 닫기 핸들러
   */
  const handleClose = () => {
    setApprovalDetail(null);
    setError(null);
    onClose();
  };


  /**
   * 결재 처리 함수
   */
  const handleApproval = async (status) => {
    if (!approvalDetail) return;

    try {
      // TODO: API 엔드포인트 수정 필요
      const response = await axios.post(`/api/ct/approval/${approvalDetail.ct_no}`, {
        status: status, // 'approved' or 'rejected'
        comment: '' // 필요시 코멘트 추가
      });

      if (response.data.success) {
        alert(status === 'approved' ? '승인되었습니다.' : '반려되었습니다.');
        handleClose();
      } else {
        alert('처리에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('결재 처리 실패:', err);
      const errMsg = err.response?.data?.message || "처리 중 오류가 발생했습니다.";
      alert('처리 중 오류가 발생했습니다.\n' + errMsg);
    }
  };


  if (!isOpen) return null;


  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content border approval-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== 헤더 ===================== */}
        <div className="approval-detail-header">
          <div className="approval-detail-header-row">
            <div>
              <h2 className="approval-detail-title">
                결재 내역 상세보기
              </h2>
              <div className="approval-detail-info">
                <span><strong>CT 번호:</strong> {approvalDetail?.ct_no || '-'}</span>
                <span><strong>제품명:</strong> {approvalDetail?.sample_name || '-'}</span>
                <span><strong>고객사:</strong> {approvalDetail?.client_name || '-'}</span>
                <span><strong>의뢰일:</strong> {approvalDetail?.ct_request_date || '-'}</span>
              </div>
            </div>
            <div className="approval-detail-actions">
              <span className={`approval-detail-status-badge ${
                approvalDetail?.approval_status === 'approved' ? 'approved' :
                approvalDetail?.approval_status === 'rejected' ? 'rejected' : 'pending'
              }`}>
                {approvalDetail?.approval_status === 'approved' ? '승인완료' :
                 approvalDetail?.approval_status === 'rejected' ? '반려됨' : '결재대기'}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="approval-detail-close-btn"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* ===================== 컨텐츠 영역 ===================== */}
        <div className="approval-detail-content">

        {/* 로딩 상태 */}
        {loading && (
          <div className="approval-detail-loading">
            데이터를 불러오는 중입니다...
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="approval-detail-error">
            {error}
          </div>
        )}

        {/* 데이터 표시 */}
        {!loading && !error && approvalDetail && (
          <>
            {/* ===================== 1. 결재선 ===================== */}
            <div className="report-form approval-detail-section first">
              <h3 className="approval-detail-section-title">결재선</h3>
              <table className="modal-table">
                <thead>
                  <tr>
                    <th className="tac approval-detail-th-w10">단계</th>
                    <th className="tac approval-detail-th-w15">역할</th>
                    <th className="tac approval-detail-th-w15">결재자</th>
                    <th className="tac approval-detail-th-w15">결재상태</th>
                    <th className="tac approval-detail-th-w20">결재일시</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalDetail.approval_line?.map((line) => (
                    <tr key={line.step}>
                      <td className="tac">{line.step}</td>
                      <td className="tac">{line.role}</td>
                      <td className="tac">{line.name}</td>
                      <td className="tac">
                        <span className={`approval-detail-approval-status ${
                          line.status === '완료' || line.status === '승인' ? 'complete' :
                          line.status === '반려' ? 'rejected' : 'pending'
                        }`}>
                          {line.status}
                        </span>
                      </td>
                      <td className="tac">{line.date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===================== 2. 의뢰등록정보 ===================== */}
            <div className="report-form approval-detail-section">
              <h3 className="approval-detail-section-title">의뢰등록정보</h3>
              
              {/* 의뢰 정보 */}
              <h4 className="approval-detail-subsection-title">◎ 의뢰 정보</h4>
              <table className="modal-table">
                <colgroup>
                  <col width="15%"/>
                  <col width="18%"/>
                  <col width="15%"/>
                  <col width="18%"/>
                  <col width="15%"/>
                  <col width="19%"/>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">의뢰일</th>
                    <td className="tac">{approvalDetail.ct_request_date || '-'}</td>
                    <th className="tac">CT 의뢰번호</th>
                    <td className="tac">{approvalDetail.ct_no || '-'}</td>
                    <th className="tac">차수</th>
                    <td className="tac">{approvalDetail.ct_test_seq || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">고객사</th>
                    <td className="tac">{approvalDetail.client_name || '-'}</td>
                    <th className="tac">샘플명</th>
                    <td className="tac">{approvalDetail.sample_name || '-'}</td>
                    <th className="tac">랩넘버</th>
                    <td className="tac">{approvalDetail.lab_no || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">영업담당자</th>
                    <td className="tac">{approvalDetail.sales_manager || '-'}</td>
                    <th className="tac">제형담당부서</th>
                    <td className="tac">{approvalDetail.labs_manage_department || '-'}</td>
                    <th className="tac">제형담당자</th>
                    <td className="tac">{approvalDetail.labs_manager || '-'}</td>
                  </tr>
                </tbody>
              </table>

              {/* 의뢰자 관리사항 */}
              <h4 className="approval-detail-subsection-title top">◎ 의뢰자 관리사항</h4>
              <table className="modal-table">
                <colgroup>
                  <col width="15%" />
                  <col width="35%" />
                  <col width="15%" />
                  <col width="35%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">CT 유형</th>
                    <td className="tac">{approvalDetail.ct_type || '-'}</td>
                    <th className="tac">자재업체명</th>
                    <td className="tac">{approvalDetail.material_supplier || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">자재유형</th>
                    <td className="tac">
                      {approvalDetail.material_large_category || '-'}
                      {approvalDetail.material_sub_category?.length > 0 && 
                        ` / ${approvalDetail.material_sub_category.join(', ')}`
                      }
                    </td>
                    <th className="tac">자재정보</th>
                    <td className="tac">{approvalDetail.material_description || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">자재수량</th>
                    <td className="tac">{approvalDetail.material_quantity || '-'}개</td>
                    <th className="tac">샘플수량</th>
                    <td className="tac">{approvalDetail.sample_quantity || '-'}개</td>
                  </tr>
                  <tr>
                    <th className="tac">희망용량</th>
                    <td className="tac">{approvalDetail.desired_volume || '-'} {approvalDetail.desired_volume_unit || 'ml'}</td>
                    <th className="tac">슬리브 길이</th>
                    <td className="tac">{approvalDetail.sleeve_length || '-'} mm</td>
                  </tr>
                  <tr>
                    <th className="tac">특이사항</th>
                    <td colSpan={3}>
                      {approvalDetail.is_emergency && <span className="approval-detail-emergency">긴급</span>}
                      {approvalDetail.is_cpnp && <span className="approval-detail-item">CPNP</span>}
                      {approvalDetail.is_eng && <span>영문(엑셀)</span>}
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">의뢰내용</th>
                    <td colSpan={3}>
                      <textarea 
                        readOnly 
                        value={approvalDetail.request_content || ''} 
                        className="approval-detail-textarea"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">비고</th>
                    <td colSpan={3}>
                      <textarea 
                        readOnly 
                        value={approvalDetail.request_remark || ''} 
                        className="approval-detail-textarea"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 제형담당연구소 관리사항 */}
              <h4 style={{ margin: "20px 0 10px 0", fontSize: "16px", fontWeight: "bold" }}>◎ 제형담당연구소 관리사항</h4>
              <table className="modal-table">
                <colgroup>
                  <col width="15%" />
                  <col width="35%" />
                  <col width="15%" />
                  <col width="35%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">자재 의뢰일자</th>
                    <td className="tac">{approvalDetail.material_request_date || '-'}</td>
                    <th className="tac">제형 유형</th>
                    <td className="tac">{approvalDetail.sample_type || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">필요 벌크량</th>
                    <td className="tac">{approvalDetail.required_bulk_volume || '-'} {approvalDetail.required_bulk_volume_unit || 'ml'}</td>
                    <th className="tac">의뢰 벌크량</th>
                    <td className="tac">{approvalDetail.request_bulk_volume || '-'} {approvalDetail.request_bulk_volume_unit || 'ml'}</td>
                  </tr>
                </tbody>
              </table>

              {/* 제형 정보 테이블 */}
              <table className="modal-table" style={{ marginTop: "10px" }}>
                <thead>
                  <tr>
                    <th className="tac" style={{ width: "15%" }}>랩넘버</th>
                    <th className="tac" style={{ width: "12%" }}>벌크량</th>
                    <th className="tac" style={{ width: "10%" }}>점도</th>
                    <th className="tac" style={{ width: "10%" }}>경도</th>
                    <th className="tac" style={{ width: "10%" }}>비중</th>
                    <th className="tac" style={{ width: "13%" }}>비율</th>
                    <th className="tac">특이사항</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalDetail.sample_rows?.map((row, idx) => (
                    <tr key={idx}>
                      <td className="tac">{row.lab_no || '-'}</td>
                      <td className="tac">{row.bulk_volume || '-'} {row.bulk_volume_unit || 'ml'}</td>
                      <td className="tac">{row.sample_viscosity || '-'}</td>
                      <td className="tac">{row.sample_hardness || '-'}</td>
                      <td className="tac">{row.sample_sg || '-'}</td>
                      <td className="tac">{row.sample_ratio || '-'} ({row.sample_ratio_type || '부피비'})</td>
                      <td className="tac">{row.sample_significant || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="modal-table approval-detail-table-top-margin">
                <colgroup>
                  <col width="15%" />
                  <col width="85%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">기타 특이사항</th>
                    <td>
                      <textarea 
                        readOnly 
                        value={approvalDetail.sample_etc || ''} 
                        className="approval-detail-textarea"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">비고</th>
                    <td>
                      <textarea 
                        readOnly 
                        value={approvalDetail.sample_remark || ''} 
                        className="approval-detail-textarea"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* CT 관리사항 */}
              <h4 className="approval-detail-subsection-title top">◎ CT 관리사항</h4>
              <table className="modal-table">
                <colgroup>
                  <col width="15%" />
                  <col width="35%" />
                  <col width="15%" />
                  <col width="35%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">CT 접수일자</th>
                    <td className="tac">{approvalDetail.ct_receipt_date || '-'}</td>
                    <th className="tac">완료 예정일</th>
                    <td className="tac">{approvalDetail.ct_complete_expected_date || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">CT 담당자</th>
                    <td className="tac">{approvalDetail.ct_manager || '-'}</td>
                    <th className="tac">보류</th>
                    <td className="tac">
                      {approvalDetail.is_ct_suspend ? (
                        <>
                          <span className="approval-detail-suspend">보류</span>
                          {approvalDetail.ct_suspend_reason && ` - ${approvalDetail.ct_suspend_reason}`}
                        </>
                      ) : '정상'}
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">기타 특이사항</th>
                    <td colSpan={3}>
                      <textarea 
                        readOnly 
                        value={approvalDetail.ct_manage_etc || ''} 
                        className="approval-detail-textarea"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">비고</th>
                    <td colSpan={3}>
                      <textarea 
                        readOnly 
                        value={approvalDetail.ct_manage_remark || ''} 
                        className="approval-detail-textarea"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===================== 3. 시험 성적서 정보 ===================== */}
            <div className="report-form approval-detail-section">
              <h3 className="approval-detail-section-title">시험 성적서</h3>
              
              {/* 기본 정보 */}
              <table className="modal-table">
                <colgroup>
                  <col width="13%" />
                  <col width="20%" />
                  <col width="13%" />
                  <col width="20%" />
                  <col width="13%" />
                  <col width="21%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">CT 번호</th>
                    <td className="tac">{approvalDetail.ct_no || '-'}</td>
                    <th className="tac">시험 의뢰자</th>
                    <td className="tac">{approvalDetail.client_name || '-'}</td>
                    <th className="tac">비중</th>
                    <td className="tac">{approvalDetail.specific_gravity || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac" rowSpan={2}>제품명</th>
                    <td className="tac" rowSpan={2}>{approvalDetail.sample_name || '-'}</td>
                    <th className="tac">시험 담당자</th>
                    <td className="tac">{approvalDetail.ct_manager || '-'}</td>
                    <th className="tac">제형 담당자</th>
                    <td className="tac">{approvalDetail.formulation_manager || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">희망 용량</th>
                    <td className="tac">{approvalDetail.desired_volume || '-'} {approvalDetail.desired_volume_unit || 'ml'}</td>
                    <th className="tac">랩넘버</th>
                    <td className="tac">{approvalDetail.lab_no || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">시험 시작일</th>
                    <td className="tac">{approvalDetail.test_start_date || '-'}</td>
                    <th className="tac">의뢰 차수</th>
                    <td className="tac">{approvalDetail.ct_test_seq || '-'}</td>
                    <th className="tac" rowSpan={2}>제형 특이사항</th>
                    <td rowSpan={2}>
                      <textarea 
                        readOnly 
                        value={approvalDetail.formulation_notes || ''} 
                        className="approval-detail-textarea short"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">시험 종료일</th>
                    <td className="tac">{approvalDetail.test_end_date || '-'}</td>
                    <th className="tac">의뢰 수량</th>
                    <td className="tac">{approvalDetail.sample_quantity || '-'}개</td>
                  </tr>
                </tbody>
              </table>

              {/* 의뢰 정보 */}
              <h4 className="approval-detail-subsection-title top">의뢰 정보</h4>
              <table className="modal-table">
                <colgroup>
                  <col width="13%" />
                  <col width="20%" />
                  <col width="13%" />
                  <col width="54%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">자재 업체</th>
                    <td className="tac">{approvalDetail.material_supplier || '-'}</td>
                    <th className="tac" rowSpan={2}>의뢰 자재 사진</th>
                    <td className="tac approval-detail-image-placeholder" rowSpan={2}>이미지 표시 영역</td>
                  </tr>
                  <tr>
                    <th className="tac">의뢰 자재 정보</th>
                    <td className="tac">
                      <textarea 
                        readOnly 
                        value={approvalDetail.material_info || ''} 
                        className="approval-detail-textarea tall"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 시험항목 */}
              <h4 className="approval-detail-subsection-title top">시험항목</h4>
              <table className="modal-table">
                <thead>
                  <tr>
                    <th className="tac approval-detail-th-w8">시험법 번호</th>
                    <th className="tac approval-detail-th-w12">시험 항목</th>
                    <th className="tac approval-detail-th-w20">시험 기준</th>
                    <th className="tac approval-detail-th-w10">시험 성적</th>
                    <th className="tac approval-detail-th-w25">시험 종합 의견</th>
                    <th className="tac approval-detail-th-w15">비고</th>
                    <th className="tac approval-detail-th-w10">첨부 이미지</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalDetail.test_items?.length > 0 ? (
                    approvalDetail.test_items.map((item) => (
                      <tr key={item.id}>
                        <td className="tac">{item.test_no || '-'}</td>
                        <td className="tac">{item.test_name || '-'}</td>
                        <td className="tac">{item.test_standard || '-'}</td>
                        <td className="tac">{item.test_result || '-'}</td>
                        <td className="tac">{item.remark || '-'}</td>
                        <td className="tac">{item.note || '-'}</td>
                        <td className="tac approval-detail-image-cell">-</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="approval-detail-no-data" colSpan="7">
                        시험 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 주의사항 */}
              <h4 className="approval-detail-subsection-title top">주의사항</h4>
              <table className="modal-table">
                <colgroup>
                  <col width="13%" />
                  <col width="87%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">용량</th>
                    <td>
                      <textarea 
                        readOnly 
                        value={approvalDetail.cautions?.volume || ''} 
                        className="approval-detail-textarea short"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">포장재</th>
                    <td>
                      <textarea 
                        readOnly 
                        value={approvalDetail.cautions?.packaging || ''} 
                        className="approval-detail-textarea short"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">상용성</th>
                    <td>
                      <textarea 
                        readOnly 
                        value={approvalDetail.cautions?.compatibility || ''} 
                        className="approval-detail-textarea short"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 판정 및 서명 */}
              <h4 className="approval-detail-subsection-title top">판정 및 서명</h4>
              <table className="modal-table">
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
                    <th className="tac" rowSpan={2}>판정일자</th>
                    <td className="tac" rowSpan={2}>{approvalDetail.judgment_date || '-'}</td>
                    <th className="tac">당일판정</th>
                    <td className="tac">{approvalDetail.daily_judgment || '-'}</td>
                    <th className="tac" rowSpan={2}>시험자</th>
                    <td className="tac" rowSpan={2}>{approvalDetail.tester || '-'}</td>
                    <th className="tac" rowSpan={2}>승인자</th>
                    <td className="tac" rowSpan={2}>{approvalDetail.approver || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">최종판정</th>
                    <td className="tac">{approvalDetail.final_judgment || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===================== 결재 의견 ===================== */}
            <div className="report-form approval-detail-section last">
              <h3 className="approval-detail-section-title">결재 의견</h3>
              <table className="modal-table">
                <colgroup>
                  <col width="15%" />
                  <col width="85%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="tac">결재상태</th>
                    <td>
                      <span className={`approval-detail-final-status ${
                        approvalDetail.approval_status === 'approved' ? 'approved' :
                        approvalDetail.approval_status === 'rejected' ? 'rejected' : 'pending'
                      }`}>
                        {approvalDetail.approval_status === 'approved' ? '승인' :
                         approvalDetail.approval_status === 'rejected' ? '반려' : '대기중'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="tac">결재요청일</th>
                    <td>{approvalDetail.approval_request_date || '-'}</td>
                  </tr>
                  <tr>
                    <th className="tac">결재의견</th>
                    <td>
                      <textarea 
                        readOnly
                        value={approvalDetail.approval_comment || ''}
                        className="approval-detail-textarea large"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </>
        )}
        </div>

        {/* ===================== 푸터 ===================== */}
        <div className="approval-detail-footer">
          {!loading && !error && approvalDetail?.approval_status === 'pending' && (
            <>
              <button 
                className="submit approval-detail-btn approval" 
                onClick={() => handleApproval('approved')}
              >
                승인
              </button>
              <button 
                type="button" 
                onClick={() => handleApproval('rejected')}
                className="approval-detail-btn reject"
              >
                반려
              </button>
            </>
          )}
          <button 
            type="button" 
            onClick={handleClose}
            className="approval-detail-btn close"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
