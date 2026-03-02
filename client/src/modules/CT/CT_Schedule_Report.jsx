/**
 * 파일명 : CT_Schedule_CT.jsx
 * 용도 : CT 접수 일정 현황
 * 최초등록 : 2025-11-11 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useState, useMemo, useEffect, useContext } from "react";

import { AuthContext } from "/src/contexts/AuthContext";

import CT_SubNav from "/src/modules/CT/CT_SubNav";
import * as Utils from "/src/components/Utils";

export default function CT_Schedule_CT() {

  /**
   * 사용자 정보 컨텍스트
   */
  const { user } = useContext(AuthContext);
  const companyId = user.company_id; // 회사 ID

  // 화면 글로벌 날짜 변수
  const G_TODAY = Utils.formatDateISO(new Date());

  const STATUS_LIST = [
    "전체",
    "완료",
    "미완료"
  ];
    
  const STATUS_COLORS = {
    "전체" : "#c1d7ee",
    "완료" : "#f28b82",
    "미완료" : "#8795a1"
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const [events, setEvents] = useState([]);
  const [viewType, setViewType] = useState("month"); // day | week | month
  const [selectedDate, setSelectedDate] = useState(Utils.formatDateISO(new Date()));
  const [statusFilter, setStatusFilter] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMemo, setModalMemo] = useState("");
  const [groupBy, setGroupBy] = useState("status"); // 'status' 또는 'author'

  // 더미 데이터
  useEffect(() => {
    setEvents([
      { id: "CT2025-0601", title: "CT2025-0601", author: "김민수", start: "2025-12-16", extendedProps: { status: "전체", memo: "초기 데이터 확인" } },
      { id: "CT2025-0602", title: "CT2025-0602", author: "이지은", start: "2025-12-16", extendedProps: { status: "전체", memo: "UI 테스트 완료" } },
      { id: "CT2025-0603", title: "CT2025-0603", author: "박진영", start: "2025-12-16", extendedProps: { status: "전체", memo: "기본 기능 점검" } },
      { id: "CT2025-0604", title: "CT2025-0604", author: "최현우", start: "2025-12-17", extendedProps: { status: "완료", memo: "테스트 완료 및 리뷰" } },
      { id: "CT2025-0605", title: "CT2025-0605", author: "김민수", start: "2025-12-17", extendedProps: { status: "미완료", memo: "API 응답 지연 확인" } },
      { id: "CT2025-0606", title: "CT2025-0606", author: "이지은", start: "2025-12-18", extendedProps: { status: "전체", memo: "추가 검증 필요" } },
      { id: "CT2025-0607", title: "CT2025-0607", author: "박진영", start: "2025-12-18", extendedProps: { status: "완료", memo: "2차 테스트 완료" } },
      { id: "CT2025-0608", title: "CT2025-0608", author: "최현우", start: "2025-12-19", extendedProps: { status: "미완료", memo: "버그 수정 대기" } },
      { id: "CT2025-0609", title: "CT2025-0609", author: "김민수", start: "2025-12-19", extendedProps: { status: "전체", memo: "기능 정상 동작 확인" } },
      { id: "CT2025-0610", title: "CT2025-0610", author: "이지은", start: "2025-12-20", extendedProps: { status: "완료", memo: "리뷰 완료 및 배포 준비" } },
      { id: "CT2025-0611", title: "CT2025-0611", author: "박진영", start: "2025-12-20", extendedProps: { status: "전체", memo: "테스트 케이스 추가" } },
      { id: "CT2025-0612", title: "CT2025-0612", author: "최현우", start: "2025-12-21", extendedProps: { status: "미완료", memo: "UI 개선 필요" } },
      { id: "CT2025-0613", title: "CT2025-0613", author: "김민수", start: "2025-12-21", extendedProps: { status: "전체", memo: "성능 테스트 진행" } },
      { id: "CT2025-0614", title: "CT2025-0614", author: "이지은", start: "2025-12-22", extendedProps: { status: "완료", memo: "최종 테스트 완료" } },
      { id: "CT2025-0615", title: "CT2025-0615", author: "박진영", start: "2025-12-22", extendedProps: { status: "전체", memo: "로그 분석 진행" } },
      { id: "CT2025-0616", title: "CT2025-0616", author: "최현우", start: "2025-12-23", extendedProps: { status: "미완료", memo: "API 인증 오류 확인" } },
      { id: "CT2025-0617", title: "CT2025-0617", author: "김민수", start: "2025-12-23", extendedProps: { status: "전체", memo: "코드 리뷰 대기" } },
      { id: "CT2025-0618", title: "CT2025-0618", author: "이지은", start: "2025-12-24", extendedProps: { status: "완료", memo: "검증 완료 및 배포" } },
      { id: "CT2025-0619", title: "CT2025-0619", author: "박진영", start: "2025-12-24", extendedProps: { status: "전체", memo: "테스트 자동화 적용" } },
      { id: "CT2025-0620", title: "CT2025-0620", author: "최현우", start: "2025-12-25", extendedProps: { status: "미완료", memo: "추가 확인 필요" } }
    ]);
  }, []);


  /* ============================= 날짜 범위 계산 ============================= */
  const dateRange = useMemo(() => {
    
    const base = new Date(selectedDate + "T00:00:00");
    const year = base.getFullYear();
    const month = base.getMonth();
    const days = daysInMonth(base);

    if (viewType === "day") return [Utils.formatDateISO(base)];

    if (viewType === "week") {
      const start = Utils.startOfWeek(base);
      return Array.from({ length: 7 }, (_, i) => Utils.addDayCalendar(start, i));
    }

    return Array.from({ length: days }, (_, i) => Utils.formatDateISO(new Date(year, month, i + 1)));

  }, [viewType, selectedDate]);


  /* ============================= 필터 적용 ============================= */
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchStatus = statusFilter === "전체" || e.extendedProps.status === statusFilter;
      const matchSearch = !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [events, statusFilter, searchTerm]);


  /* ============================= 상태/날짜 그룹 ============================= */
  const grouped = useMemo(() => {
    const g = {};
  
    // 그룹 키 목록: 상태 or 작성자
    const keyList =
      groupBy === "status"
        ? STATUS_LIST
        : [...new Set(filteredEvents.map((e) => e.author))];
  
    keyList.forEach((k) => (g[k] = {}));
  
    for (const ev of filteredEvents) {
      const key = groupBy === "status" ? ev.extendedProps.status : ev.author;
      const d = ev.start;
      if (!g[key][d]) g[key][d] = [];
      g[key][d].push(ev);
    }
  
    return g;
  }, [filteredEvents, groupBy]);  


  /* ============================= 드래그 & 드롭 ============================= */
  const onDragStart = (e, eventId) => e.dataTransfer.setData("text/plain", eventId);

  const onAllowDrop = (e) => e.preventDefault();

  const onDropToCell = (e) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    const targetDate = e.currentTarget.getAttribute("data-date");
    const targetStatus = e.currentTarget.getAttribute("data-status");
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
        ? {
            ...ev,
            start: targetDate || ev.start,
            extendedProps: { ...ev.extendedProps, status: targetStatus || ev.extendedProps.status },
            }
        : ev
      )
    );
  };


  /* ============================= 일정 클릭/모달 ============================= */
  const onClickBadge = (ev) => {
    setSelectedEvent(ev);
    setModalMemo(ev.extendedProps.memo || "");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveModalMemo = () => {
    if (!selectedEvent) return;

    setEvents((prev) =>
        prev.map((ev) => (ev.id === selectedEvent.id ? { ...ev, extendedProps: { ...ev.extendedProps, memo: modalMemo } } : ev))
    );

    setModalOpen(false);
  };


  /* ============================= 상태별 카운트 ============================= */
  const statusCounts = useMemo(() => {
    const map = {};
    const keyList =
      groupBy === "status"
        ? STATUS_LIST
        : [...new Set(filteredEvents.map((e) => e.author))];
  
    keyList.forEach((k) => (map[k] = 0));
  
    for (const d of dateRange) {
      for (const k of keyList) {
        const arr = grouped[k]?.[d] ?? [];
        map[k] += arr.length;
      }
    }
    return map;
  }, [grouped, dateRange, groupBy]);
  

  /* ============================= 날짜 이동 ============================= */
  const shiftDate = (dir) => {
      const d = new Date(selectedDate + "T00:00:00");
      if (viewType === "day") d.setDate(d.getDate() + dir);
      else if (viewType === "week") d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      setSelectedDate(Utils.formatDateISO(d));
  };


  /* ============================= 공통 UI 컨트롤 ============================= */
  const renderControls = () => (
    <>
      <div className="renderControllBox calendar-button">
        <div className="calendar-button">
          <button type="button" className={`${viewType == "day" ? "active" : ""}`} onClick={() => setViewType("day")}>일별</button>
          <button type="button" className={`${viewType == "week" ? "active" : ""}`} onClick={() => setViewType("week")}>주별</button>
          <button type="button" className={`${viewType == "month" ? "active" : ""}`} onClick={() => setViewType("month")}>월별</button>
        </div>
        <div className="calendar-button">
          <button type="button" onClick={() => shiftDate(-1)}>◀</button>
          <button type="button" onClick={() => shiftDate(1)}>▶</button>
          <button type="button" onClick={() => setSelectedDate(G_TODAY)}>오늘</button>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        <div style={{ marginLeft: "auto"}} className="calendar-button">
          {viewType !== "month" && (
          <button type="button" className="btn-info" onClick={() => setGroupBy((prev) => (prev === "status" ? "author" : "status"))}>
            {groupBy === "status" ? "작성자별 보기" : "상태별 보기"}
          </button>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_LIST.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input type="search" placeholder="CT번호 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
      </div>
    </>
  );


  /* ============================= 사이드 미니 캘린더 ============================= */
  const MiniCalendar = ({ selectedDate, onSelectDate }) => {
    const selected = new Date(selectedDate + "T00:00:00");
    const [displayMonth, setDisplayMonth] = useState(selected.getMonth());
    const [displayYear, setDisplayYear] = useState(selected.getFullYear());

    // 메인 달력에서 날짜가 바뀌면 미니 달력도 자동 반영
    useEffect(() => {
      const newDate = new Date(selectedDate + "T00:00:00");
      setDisplayMonth(newDate.getMonth());
      setDisplayYear(newDate.getFullYear());
    }, [selectedDate]);

    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    let day = 1 - firstDayOfWeek;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const d = new Date(displayYear, displayMonth, day);
        week.push(d);
        day++;
      }
      days.push(week);
    }

    const goMonth = (dir) => {
      const next = new Date(displayYear, displayMonth + dir, 1);
      setDisplayMonth(next.getMonth());
      setDisplayYear(next.getFullYear());
    };

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-header">
          <button type="button" onClick={() => goMonth(-1)}>◀</button>
          <span>
            {displayYear}년 {displayMonth + 1}월
          </span>
          <button type="button" onClick={() => goMonth(1)}>▶</button>
        </div>
        <table className="mini-calendar-table">
          <thead>
            <tr>
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <th key={d} className={d === "일" ? "sunday" : d === "토" ? "saturday" : ""}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((week, i) => (
              <tr key={i}>
                {week.map((d) => {
                  const isCurrentMonth = d.getMonth() === displayMonth;
                  const isSelected = Utils.formatDateISO(d) === selectedDate;
                  return (
                    <td key={d.toISOString()}
                      className={`mini-day ${
                        isCurrentMonth ? "current" : "other"
                      } ${isSelected ? "selected" : ""}`}
                      onClick={() => onSelectDate(Utils.formatDateISO(d))}>
                      {d.getDate()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }


  /* ============================= 일/주 보기 (테이블형) ============================= */
  const renderStatusTable = () => (
    <>
      <div className="table-wrap">
          <table className="calendar-table">
          <thead>
            <tr>
              <th style={{ width: 150 }}>접수현황</th>
              {dateRange.map((d) => (
                <th key={d}
                    style={{
                      color : 
                      new Date(d).getDay() == 0 ? "red"
                      : new Date(d).getDay() == 6 ? "blue" : ""
                    }}>
                  {d}
                  {new Date(d).getDay() == 0 ? " 일요일" : ""}
                  {new Date(d).getDay() == 1 ? " 월요일" : ""}
                  {new Date(d).getDay() == 2 ? " 화요일" : ""}
                  {new Date(d).getDay() == 3 ? " 수요일" : ""}
                  {new Date(d).getDay() == 4 ? " 목요일" : ""}
                  {new Date(d).getDay() == 5 ? " 금요일" : ""}
                  {new Date(d).getDay() == 6 ? " 토요일" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(grouped).map((key) => (
              <tr key={key}>
                <td className="status-cell">
                  {key} <span className="status-count">({statusCounts[key]}건)</span>
                </td>
                {dateRange.map((d) => {
                  const cellEvents = grouped[key]?.[d] ?? [];
                  return (
                    <td
                      className="calendar-cell"
                      key={d + key}
                      data-date={d}
                      data-status={groupBy === "status" ? key : ""}
                      onDragOver={onAllowDrop}
                      onDrop={onDropToCell}
                    >
                      {cellEvents.map((ev) => (
                        <div key={ev.id}
                              className={viewType === "day"
                                          ? "calendar-cell-day"
                                          : "calendar-cell-week"}
                              draggable
                              onDragStart={(e) => onDragStart(e, ev.id)}
                              onClick={() => onClickBadge(ev)}
                              style={{background: STATUS_COLORS[ev.extendedProps.status]}}>
                          {viewType === "week" ? (
                            <>
                              <div style={{justifyContent:"space-between", display:"flex"}}>
                                <div><b>[{ev.author}]</b></div>
                                <div><b>{ev.extendedProps.status}</b></div>
                              </div>
                              <div>{ev.title}</div>
                            </>
                          ) : (
                            <>
                              <div>{ev.title}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );


  /* ============================= 월별 보기 (달력형) ============================= */
  const renderMonthlyCalendar = () => {
    const base = new Date(selectedDate + "T00:00:00");
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    // const totalDays = lastDay.getDate();

    const cells = [];
    let day = 1 - firstDayOfWeek;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const current = new Date(year, month, day);
        const dateStr = Utils.formatDateISO(current);
        const isCurrentMonth = current.getMonth() === month;
        week.push({ dateStr, day: current.getDate(), isCurrentMonth });
        day++;
      }
      cells.push(week);
    }

    return (
      <>
        <div className="table-wrap">
          <table className="calendar-table">
            <thead>
              <tr>
                <th style={{color:"red"}}>일요일</th>
                <th>월요일</th>
                <th>화요일</th>
                <th>수요일</th>
                <th>목요일</th>
                <th>금요일</th>
                <th style={{color:"blue"}}>토요일</th>
              </tr>
            </thead>
            <tbody>
              {cells.map((week, i) => (
                <tr key={i}>
                  {week.map((cell) => {
                    const dayEvents = filteredEvents.filter((e) => e.start === cell.dateStr);
                    return (
                        <td className="calendar-cell-month"
                          key={cell.dateStr}
                          data-date={cell.dateStr}
                          onDragOver={onAllowDrop}
                          onDrop={onDropToCell}
                          style={{background: cell.isCurrentMonth ? "#fff" : "#f9f9f9",
                                    color: new Date(cell.dateStr).getDay() === 0 // 일요일이면
                                        ? "red"
                                        : new Date(cell.dateStr).getDay() === 6 // 토요일이면
                                        ? "blue"
                                        : cell.isCurrentMonth
                                        ? "#000"
                                        : "#bbb"}}>
                          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                            {cell.day}
                          </div>
                          {dayEvents.map((ev) => (
                            <div className="calendar-event"
                                  key={ev.id}
                                  draggable
                                  onDragStart={(e) => onDragStart(e, ev.id)}
                                  onClick={() => onClickBadge(ev)}
                                  style={{background: STATUS_COLORS[ev.extendedProps.status]}}>
                              <div style={{justifyContent:"space-between", display:"flex"}}>
                                <div><b>[{ev.author}]</b></div>
                                <div><b>{ev.extendedProps.status}</b></div>
                              </div>
                              <div>
                                {ev.title}
                              </div>
                            </div>
                          ))}
                        </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  
  /* ============================= 메인 렌더 ============================= */
  return (
    <>
      {/* ↓ 상단 네비게이션 바 ↓ */}
      <CT_SubNav/>
      {/* ↑ 상단 네비게이션 바 ↑ */}

      <div className="calendar-main">
        {/* 좌측 메모 패널 */}
        <div className="calendar-side-memo">

          <div className="side-calendar">
            <MiniCalendar selectedDate={selectedDate}
                          onSelectDate={(date) => setSelectedDate(date)}/>
            <div className="calendar-memo">
              <div className="calendar-memo-title">
                <b style={{fontSize:"17px"}}>메모 :</b>
                <b style={{fontSize:"17px"}}>{selectedEvent ? (selectedEvent.title) : ""}</b>
              </div>
              <textarea value={modalMemo} onChange={(e) => setModalMemo(e.target.value)} rows={10}/>
              <div className="calendar-button jcr" style={{borderTop:"1px solid #ccc", margin:"10px", paddingTop:"10px"}}>
                <button type="button" onClick={saveModalMemo}>저장</button>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 캘린더 */}
        <div className="calendar-main-view">
          {renderControls()}
          {viewType === "month" ? renderMonthlyCalendar() : renderStatusTable()}
        </div>

        {/* 모달 */}
        {/* {modalOpen && selectedEvent && (
          <>
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content-mini" onClick={(e) => e.stopPropagation()}>
                <p><b>CT번호:</b> {selectedEvent.title}</p>
                <p><b>상태:</b> {selectedEvent.extendedProps.status}</p>
                <p><b>날짜:</b> {selectedEvent.start}</p>
                <textarea value={modalMemo} onChange={(e) => setModalMemo(e.target.value)} rows={6} style={{ width: "100%" }} />
                <div style={{ textAlign: "right", marginTop: 10 }}>
                  <button onClick={saveModalMemo} style={{ marginRight: 8 }}>저장</button>
                  <button onClick={closeModal}>닫기</button>
                </div>
              </div>
            </div>
          </>
        )} */}
      </div>
    </>
  );
}