/**
 * 파일명 : CT_Option_CTType.jsx
 * 용도 : CT 유형 설정 화면
 * 최초등록 : 2025-12-24 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import { useState, useEffect, useRef } from "react";

export default function CT_Option_CTType() {


    /**
     * rows: 담당자 유형 목록 데이터
     * ----------------------------------------------------
     * WHY: 테이블에 표시할 각 행의 정보를 관리하기 위해 사용
     * HOW: 각 row는 id(고유값), name(항목명), useYn(사용여부), 
     *      isChecked(선택상태), sortOrder(정렬순서)를 포함
     */
    const [rows, setRows] = useState([
        { id: 1, name: "", useYn: true, isChecked: false, sortOrder: 1 }
    ]);


    /**
     * dragIndex: 현재 드래그 중인 행의 인덱스
     * ----------------------------------------------------
     * WHY: 어떤 행을 드래그하고 있는지 추적하여 드롭 시 정렬에 사용
     * HOW: 드래그 시작 시 설정되고, 드롭 완료 시 null로 초기화
     */
    const [dragIndex, setDragIndex] = useState(null);


    /**
     * hoverIndex: 마우스가 현재 위치한 행의 인덱스
     * ----------------------------------------------------
     * WHY: 드래그 중 어느 위치에 드롭될지 시각적 피드백을 제공
     * HOW: 드래그 오버 시 해당 행의 배경색을 변경하여 표시
     */
    const [hoverIndex, setHoverIndex] = useState(null);


    /**
     * isSavingSort: 정렬 저장 중 상태 표시
     * ----------------------------------------------------
     * WHY: 사용자에게 저장 작업이 진행 중임을 알리기 위해
     * HOW: API 호출 전 true로 설정하고, 완료/실패 후 false로 변경
     */
    const [isSavingSort, setIsSavingSort] = useState(false);


    /**
     * initialOrderRef: 저장 시점의 행 순서를 기록
     * ----------------------------------------------------
     * WHY: API 실패 시 이전 상태로 롤백하기 위해 사용
     * HOW: 정렬 저장 성공 시 현재 순서를 저장하고, 
     *      실패 시 이 값을 기준으로 복원
     */
    const initialOrderRef = useRef([]);


    /**
     * scrollRef: 테이블 스크롤 컨테이너에 대한 참조
     * ----------------------------------------------------
     * WHY: 드래그 중 자동 스크롤 기능 구현을 위해 필요
     * HOW: 마우스 위치에 따라 해당 요소의 scrollTop을 조작
     */
    const scrollRef = useRef(null);


    /**
     * SCROLL_THRESHOLD: 자동 스크롤이 시작되는 영역 크기
     * ----------------------------------------------------
     * WHY: 테이블 상하단 일정 영역에서만 스크롤이 작동하도록 제한
     * HOW: 마우스가 상단/하단 40px 이내에 위치할 때 스크롤 활성화
     */
    const SCROLL_THRESHOLD = 40;


    /**
     * SCROLL_SPEED: 자동 스크롤 속도
     * ----------------------------------------------------
     * WHY: 스크롤이 너무 빠르거나 느리지 않도록 조절
     * HOW: 각 이벤트마다 10px씩 스크롤 이동
     */
    const SCROLL_SPEED = 10;


    /**
     * 컴포넌트 마운트 시 초기 정렬 상태 저장
     * WHY: 정렬 변경 실패 시 원래 상태로 복구하기 위한 기준점 설정
     * HOW: 컴포넌트가 처음 렌더링될 때 rows의 id 배열을 저장
     * 주의: 빈 의존성 배열([])로 인해 최초 1회만 실행됨
     */
    useEffect(() => {
        initialOrderRef.current = rows.map(r => r.id);
    }, []);


    /**
     * handleAutoScroll: 드래그 중 자동 스크롤 처리
     * ----------------------------------------------------
     * WHY: 긴 목록에서 드래그할 때 화면 끝까지 자동으로 스크롤되도록 지원
     * HOW: 
     * 1. 스크롤 컨테이너의 위치(rect)를 가져옴
     * 2. 마우스 Y 좌표가 상단 임계값 내에 있으면 위로 스크롤
     * 3. 마우스 Y 좌표가 하단 임계값 내에 있으면 아래로 스크롤
     * 
     * @param {DragEvent} e : 드래그 이벤트 객체 (clientY 좌표 사용)
     */
    const handleAutoScroll = (e) => {
        const container = scrollRef.current;
        if (!container) return; // 컨테이너가 없으면 종료

        // 스크롤 컨테이너의 화면상 위치 정보 획득
        const rect = container.getBoundingClientRect();
        const mouseY = e.clientY; // 마우스의 Y 좌표

        if (mouseY < rect.top + SCROLL_THRESHOLD) { // 상단 영역에서 드래그 중이면 위로 스크롤
            container.scrollTop -= SCROLL_SPEED;
        } else if (mouseY > rect.bottom - SCROLL_THRESHOLD) { // 하단 영역에서 드래그 중이면 아래로 스크롤
            container.scrollTop += SCROLL_SPEED;
        }
    };


    /**
     * saveSortOrder: 정렬 변경사항을 서버에 자동 저장
     * ----------------------------------------------------
     * WHY: 사용자가 드래그로 순서를 변경하면 즉시 서버에 반영하기 위해
     * HOW:
     * 1. 로딩 상태를 true로 설정 (UI에 저장 중 표시)
     * 2. 새로운 정렬 순서를 기반으로 payload 생성 (sortOrder를 인덱스+1로 설정)
     * 3. API 호출 시도
     * 4. 성공 시: 기준 정렬(initialOrderRef) 갱신 및 state 업데이트
     * 5. 실패 시: 이전 정렬 상태로 롤백
     * 6. 완료 후: 로딩 상태를 false로 설정
     * 
     * 패턴: 낙관적 업데이트(Optimistic Update) + 롤백
     * 
     * @param {Array} newRows : 새로운 정렬 순서의 행 배열
     */
    const saveSortOrder = async (newRows) => {

        setIsSavingSort(true); // 저장 중 상태 활성화

        // API 전송용 payload 생성 - 인덱스 기반으로 sortOrder를 재설정하여 서버와 동기화
        const payload = newRows.map((r, idx) => ({
            id: r.id,
            name: r.name,
            useYn: r.useYn,
            isChecked: r.isChecked,
            sortOrder: idx + 1 // 1부터 시작하는 순서 번호
        }));

        try {
            console.log("정렬 저장 payload", payload);

            // 실제 API 호출 위치 - 서버에 변경된 정렬 순서를 저장
            await fakeApiCall();

            // 새로운 정렬을 기준점으로 저장 - 다음 정렬 변경 시 롤백 기준이 됨
            initialOrderRef.current = newRows.map(r => r.id);
            setRows(payload); // state 업데이트하여 UI 반영

        } catch (e) {
            // 실패 시: 사용자에게 알림
            alert("정렬 저장에 실패했습니다. 이전 상태로 복구합니다.");

            // 롤백 처리 - 서버 저장 실패 시 UI를 마지막 성공 상태로 복원
            // initialOrderRef에 저장된 id 순서대로 행을 재정렬
            const rollbackRows = initialOrderRef.current
                                                .map(id => newRows.find(r => r.id === id)) // id로 원본 행 찾기
                                                .filter(Boolean); // undefined 제거

            setRows(rollbackRows); // 복구된 상태로 업데이트

        } finally {
            setIsSavingSort(false); // 로딩 상태 해제
        }
    };

    /* 임시 API (실서버 연결 시 제거) */
    const fakeApiCall = () =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.2 ? resolve() : reject();
            }, 800);
        });
    

    /**
     * save: 전체 데이터 저장 (수동 저장 버튼)
     * ----------------------------------------------------
     * HOW:
     *   - 확인 시 현재 rows 데이터를 서버에 전송 (실제 API 연결 필요)
     * 
     * 참고: 정렬 변경은 자동 저장되므로, 이 함수는 주로
     *       name, useYn 등 다른 필드의 변경사항을 저장하는 용도
     */
    const save = () => {
        if (confirm("저장하시겠습니까?")) {
            console.log("전체 저장", rows);
            // TODO: 실제 API 호출 구현 필요
            // 예: await axios.post('/api/save', rows);
        }
    };


    /**
     * addRow: 새로운 행 추가
     * ----------------------------------------------------
     * HOW:
     * 1. 현재 rows 배열에서 가장 큰 id를 찾아 +1 (중복 방지)
     * 2. 기본값으로 빈 name, useYn=true, isChecked=false 설정
     * 3. sortOrder는 새로운 id와 동일하게 설정 (맨 끝에 추가)
     * 4. setRows로 state 업데이트하여 테이블에 새 행 표시
     */
    const addRow = () => {

        // 새로운 id 생성: 기존 최대 id + 1(고유한 id를 보장하여 key prop 충돌 방지)
        const newId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        
        // 배열 끝에 새 행 추가 (함수형 업데이트를 사용하여 최신 state 기반으로 업데이트)
        setRows(prev => [...prev, { 
            id: newId, 
            name: "", 
            useYn: true, 
            isChecked: false, 
            sortOrder: newId 
        }]);
    };


    /**
     * deleteRow: 선택된 행들을 삭제
     * ----------------------------------------------------
     * WHY: 사용자가 체크박스로 선택한 항목들을 일괄 삭제하기 위해
     * HOW:
     * 1. rows 배열을 filter하여 isChecked가 false인 행만 유지
     * 2. isChecked가 true인 행들은 제외됨
     * 
     */
    const deleteRow = () => {
        // isChecked가 false인 행들만 남김
        if(confirm("선택된 항목들을 삭제하시겠습니까?")){
            setRows(prev => prev.filter(r => !r.isChecked));
        }
    };


    /**
     * onDragStart: 드래그 시작 시 호출
     * ----------------------------------------------------
     * WHY: 어떤 행을 드래그하고 있는지 기록하기 위해
     * HOW: 드래그 시작한 행의 인덱스를 dragIndex state에 저장
     * 
     * @param {number} index : 드래그를 시작한 행의 인덱스
     */
    const onDragStart = (index) => {
        setDragIndex(index); // 드래그 중인 행 인덱스 기록
    };


    /**
     * onDragOver: 드래그 중 다른 행 위로 이동할 때 호출
     * WHY: 드롭 위치를 시각적으로 표시하고 자동 스크롤을 처리하기 위해
     * HOW:
     * 1. e.preventDefault()로 기본 동작 취소 (드롭 허용)
     * 2. 현재 호버 중인 행의 인덱스를 hoverIndex에 저장 (배경색 변경용)
     * 3. handleAutoScroll 호출하여 화면 끝에서 자동 스크롤
     * 
     * @param {DragEvent} e : 드래그 이벤트 객체
     * @param {number} index : 현재 마우스가 위치한 행의 인덱스
     */
    const onDragOver = (e, index) => {
        e.preventDefault(); // 기본 동작 취소 (필수)
        setHoverIndex(index); // 현재 호버 중인 행 표시
        handleAutoScroll(e); // 자동 스크롤 처리
    };


    /**
     * onDrop: 드롭(놓기) 시 호출 - 실제 정렬 변경 및 저장
     * ----------------------------------------------------
     * WHY: 드래그한 행을 새 위치로 이동시키고 서버에 저장하기 위해
     * HOW:
     * 1. dragIndex와 dropIndex가 같으면 종료 (위치 변경 없음)
     * 2. 배열 복사 후 splice로 행 이동 처리
     *    - splice(dragIndex, 1): 드래그한 행을 배열에서 제거 및 반환
     *    - splice(index, 0, moved): 드롭 위치에 행 삽입
     * 3. state 업데이트하여 UI에 즉시 반영
     * 4. saveSortOrder 호출하여 서버에 저장 (비동기)
     * 5. 드래그 관련 state 초기화
     * 
     * @param {number} index - 드롭한 위치의 인덱스
     */
    const onDrop = async (index) => {
        // 같은 위치에 드롭하거나 dragIndex가 없으면 무시
        if (dragIndex === null || dragIndex === index) return;

        // 배열 불변성 유지를 위해 복사
        const newRows = [...rows];
        
        // 1. 드래그한 행을 배열에서 제거하고 해당 요소 반환
        const [moved] = newRows.splice(dragIndex, 1);
        
        // 2. 드롭 위치에 제거한 행 삽입
        newRows.splice(index, 0, moved);

        // 3. UI에 즉시 반영
        setRows(newRows);
        
        // 4. 드래그 관련 state 초기화
        setDragIndex(null);
        setHoverIndex(null);

        // 5. 서버에 정렬 저장 (비동기) => 정렬 변경이 완료되면 즉시 서버에 저장하여 데이터 일관성 유지
        await saveSortOrder(newRows);
    };


    /**
     * toggleAll: 전체 체크박스 선택/해제
     * ----------------------------------------------------
     * WHY: 사용자가 모든 행을 한 번에 선택하거나 해제할 수 있도록 지원
     * HOW:
     * 1. 체크박스의 checked 상태를 가져옴
     * 2. 모든 행의 isChecked 속성을 동일한 값으로 업데이트
     * 
     * @param {ChangeEvent} e : 체크박스 change 이벤트
     */
    const toggleAll = (e) => {
        const checked = e.target.checked; // 전체 선택 체크박스 상태
        
        // 모든 행의 isChecked를 동일하게 설정 => 전체 선택 시 모든 행이 선택되고, 해제 시 모든 행이 해제됨
        setRows(prev => prev.map(row => ({ ...row, isChecked: checked })));
    };


    /**
     * CT_Option_Manager 컴포넌트 렌더링
     * 
     * 구조:
     * 1. setting-box: 전체 컨테이너
     * 2. setting-box-title: 페이지 제목
     * 3. form-buttons: 추가/삭제/저장 버튼 및 로딩 표시
     * 4. table-scroll: 스크롤 가능한 테이블 컨테이너 (ref로 참조)
     * 5. list-table: 실제 데이터 테이블
     */

    return (
        <>
            <div className="setting-box">

                <div className="setting-box-title">CT 유형 설정</div>

                <div className="form-buttons jcl" style={{ marginBottom: "10px" }}>
                    {/* <button onClick={addRow}>추가</button>
                    <button onClick={deleteRow}>삭제</button> */}
                    <button onClick={save}>저장</button>

                    {/* 🔄 로딩 표시 */}
                    {isSavingSort && <span className="setting-loading">🔄 정렬 저장 중...</span>}
                </div>

                <div className="setting-box-content">
                    <div className="table-scroll border" ref={scrollRef}>
                        <table className="list-table">
                            <colgroup>
                                <col style={{ width: "2%" }} />
                                <col style={{ width: "10%" }} />
                                <col style={{ width: "" }} />
                                <col style={{ width: "15%" }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" onChange={toggleAll} /></th>
                                    <th title="드래그하여 정렬 번경을 할 수 있습니다.">번호</th>
                                    <th>항목명</th>
                                    <th>사용여부</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.id} style={{background: hoverIndex === index ? "#e6f2ff" : "transparent"}}
                                        onDragOver={(e) => onDragOver(e, index)}
                                        onDrop={() => onDrop(index)}>
                                        <td>
                                            <input type="checkbox" checked={row.isChecked}
                                                    onChange={() => setRows(prev => prev.map(r =>
                                                                                                r.id === row.id
                                                                                                ? { ...r, isChecked: !r.isChecked }
                                                                                                : r))}/>
                                        </td>

                                        <td className="tac" draggable="true" onDragStart={() => onDragStart(index)} style={{cursor: "grab"}}>
                                            {row.sortOrder}
                                        </td>

                                        <td className="tac">
                                            <input type="text" value={row.name} style={{ width: "100%" }}
                                                    onChange={(e) => setRows(prev => prev.map(r => 
                                                                                            r.id === row.id
                                                                                            ? { ...r, name: e.target.value }
                                                                                            : r))}/>
                                        </td>

                                        <td className="tac">
                                            <input type="checkbox" checked={row.useYn}
                                                onChange={() => setRows(prev => prev.map(r => 
                                                                                            r.id === row.id
                                                                                            ? { ...r, useYn: !r.useYn }
                                                                                            : r))}/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
