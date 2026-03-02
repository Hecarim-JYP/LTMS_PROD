/**
 * 파일명 : Internal_SheetTabs.jsx
 * 용도 : 내부성분분석 내 시트 페이지
 * 최초등록 : 2025-01-18 [최연웅]
 * 수정일자 : 
 * 수정사항 : 
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";

function SheetTabs({ tabs, activeId, onChange }) {
    return (
        <div className="internal-sheet-wrapper">
            <div className="internal-sheet-tab-row">
                {tabs.map((t) => {
                    const isActive = t.id === activeId;
                    return (
                        <button
                            key={t.id}
                            type={"button"}
                            onClick={() => onChange(t.id)}
                            className={`internal-sheet-tab ${t.id === activeId ? "active" : ""}`}

                            >
                                {t.label}
                            </button>
                    )
                })}
            </div>
        </div>
    )
}

function Sheet1({ 
    rows, 
    addRow,
    delRow,
    sheetData1, 
    setSheetData1, 
    onChange, 
    data,
    refs,
    errorField,
}) {
    // Row 데이터 State 저장
    // const [rows, setRows] = useState([{ "row": 1, "detail" : "", "target": "", "deathIn7" : "", "deathIn14" : "", "deathIn28": "" }]);
    // const addRows = (e) => {
    //     const newRow = {
    //         "row" : rows.length + 1,
    //         "detail" : "",
    //         "target" : "",
    //         "deathIn7" : "",
    //         "deathIn14" : "",
    //         "deathIn28" : ""
    //     }

    //     setRows(prev => [...prev, newRow] );
    // }

    /**
     *  @name : date 기능
     *  @description : 시험결과판정 + 날짜를 파라미터로 받아 계산 
     *  @param : date
     *  @author : 최연웅(231004)
     */
    const date = (date) => {
        const day = new Date();
        day.setDate(day.getDate() + date);

        const year = day.getFullYear();
        const month = day.getMonth() + 1;
        const dDay = day.getDate();

        return (year.toString() + month.toString().padStart(2, '0') + dDay.toString().padStart(2, '0'));
    };

    /**
     *  @name : setTimeout
     *  @description : 사용자 입력 완수 시간 제한
     *  @author : 최연웅(231004)
     */
    // const [inputValue, setInputValue] = useState({ "id": "", "name" : "",
    // "value": ""});
    // const [finalValue, setFinalValue] = useState({});

    const handleChange = (e) => {
        // setInputValue({ "row" : e.target.id, "name" : e.target.name, "value" : e.target.value });
        const row = e.target.id;
        const name = e.target.name;
        const value = e.target.value;

        // setSheetData1(prev => ({ ...prev, "row" : e.target.id, "name" : e.target.name, "value" : e.target.value }))
        setSheetData1(prev => {
            const next = [...prev];
            const idx = next.findIndex(
                v => v.row == row && v.name == name
            );

            if (idx >= 0){
                next[idx] = {
                    ...next[idx],
                    value,
                };
            } else {
                next.push({ row, name, value });
            }
            return next;
        });
    };

    /**
     * @name : parsing data
     * @description : sheetData state 데이터 return
     * @author : 최연웅(231004)
     */
    const parsingData = (data) => {
        console.log(data);
    }

    // const getCellValue = (data, row) => {
    //     // const found = data[0]?.find(v => v.row === row && v.name === name);
    //     if (data.row == row.row) {
    //         if (data.name == row.name){
    //             return data.value;

    //         }
    //         return "";
    //     } else {
    //         return "";
    //     }
    //     // return found?.value ?? "";
    // }

    return (
        <>
        <div className="internal-create-sheet-grid internal-create-grid-line">
            {/* <div className="field"> */}
                
                <div className="button-field">
                    {/* <button 
                        className="internal-create-add-button"
                        onClick={addRow}
                    >+</button> */}
                    <div></div>
                    <label className="">내부성분코드</label>
                    <label className="">내부성분명</label>
                    <label className="">함량(%)</label>
                    <div className=""></div>
                </div>
                <div className="field"></div>
        </div>
        {rows.map((row) => {
        return (
        <div className="internal-create-sheet-grid internal-create-grid-line">
            <div className="sheet-field">
                <button
                    className="internal-create-add-button"
                    onClick={addRow}
                >+</button>
                <input
                    type="text" 
                    id={row.id}
                    name={row.code}
                    onChange={(e) => onChange(
                        row.id,
                        "code",
                        e
                    )}
                    value={data?.[row.id]?.code ?? ""}
                    ref={refs.int_rm_0_code}
                    className={`${errorField == "int_rm_0_code" ? "error-background" : ""}`}
                />
                <input
                    type="text"
                    id={row.id}
                    name={row.name}
                    onChange={(e) => onChange(
                        row.id,
                        "name",
                        e
                    )}
                    value={data?.[row.id]?.name ?? ""}
                />
                <input
                    type="text"
                    id={row.id}
                    name={row.amount}
                    onChange={(e) => onChange(
                        row.id,
                        "value",
                        e
                    )}
                    className="rate-field"
                    value={data?.[row.id]?.value ?? ""}
                />
                <button
                    className="internal-create-del-button"
                    onClick={(e) => delRow(e, row.id)}
                >-</button>
            </div>
            <div className="field"></div>
        </div>
        )
        })}
        </>
    );
}

/**
 * @name : SHEET2
 * @description : 파일 첨부를 위한 시트
 * @author : 최연웅(231004)
 */
function Sheet2({ 
    rows, 
    addRows, 
    delRows,
    sheetData1, 
    setSheetData1, 
    onFilesChange,
    files,
    setFiles,
    accept,
    maxFiles=20 }) {

    const [isDragging, setIsDragging] = useState(false);
    // const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    // 파일 중복 체크 및 제거
    function dedupeFiles(prev, next) {
        const map = new Map();
        [...prev, ...next].forEach((f) => {
            const key = `${f.name}_${f.size}_${f.lastModified}`;
            if (!map.has(key)) map.set(key, f);
        });

        return Array.from(map.values());
    }

    // 파일 업데이트
    const safeUpdateFiles = (
        (incomingFiles) => {
            const incoming = Array.from(incomingFiles || []);
            if (incoming.length === 0) return;

            setFiles((prev) => {
                const merged = dedupeFiles(prev, incoming);
                const sliced = merged.slice(0, maxFiles);

                // onFilesChange?.(sliced);
                // return sliced;
                return sliced;
            });
        }
    );

    // 파일 제거 및 초기화
    const clearFiles = () => {
        setFiles([]);

        if (fileInputRef.current) fileInputRef.current.value="";
    }

    const removeFileAt = useCallback(
        (idx) => {
            setFiles((prev) => {
                const next = prev.filter((_, i) => i !== idx);
                // onFilesChange?.(next);
                return next;
            })
        }, []
    );

    const openFilePicker = () => {
        fileInputRef.current?.click();
    }

    // input 태그 업데이트
    const onInputChange = useCallback(
        (e) => {
            safeUpdateFiles(e.target.files);
            e.target.value = "";
        }, [safeUpdateFiles]
    );


    const handleFileDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleFileDragLeave = (e) => {
        setIsDragging(false);
    }

    const handleFileDragDrop = useCallback(
        (e) => {
        e.preventDefault();
        setIsDragging(false);

        const dropped = e.dataTransfer?.files;
        safeUpdateFiles(dropped);
        }, [safeUpdateFiles]
    );

    const handleFileDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    return (
        <div className="sheet">
            <div 
                // onDragOver={}
                // onDragLeave={}
                // onDrop={}
                >
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    accept={accept}
                    // multiple={multiple}
                    onChange={onInputChange}
                />
                <button type="button" className="btn" onClick={openFilePicker}>
                    파일 첨부
                </button>
                <button 
                    type="button"
                    onClick={clearFiles}
                    disabled={files.length === 0}
                >
                        전체 삭제
                </button>
            </div>
            <div
                className={`dropzone ${isDragging ? "dragging" : ""}`}
                onDragEnter={handleFileDragEnter}
                onDragOver={handleFileDragOver}
                onDragLeave={handleFileDragLeave}
                onDrop={handleFileDragDrop}
            >
                <div className="dropzone-inner">
                    <div className="dropzone-title">
                        {isDragging ? "드래그 첨부 영역" : "파일을 드래그해서 놓거나, 버튼으로 첨부하세요"}
                    </div>
                    <div className="dropzone-sub">
                        {accept ? `허용 형식 : ${accept}` : "모든 파일 가능"} 최대 {maxFiles} 개
                    </div>
                </div>
            </div>
            {/* 첨부 파일 리스트 영역 */}
            {files.length > 0 && (
                <div className="file-list">
                    {files.map((f, idx) => (
                        <div className="file-item" key={`${f.name}_${f.size}_${f.lastModified}`}>
                            <div className="file-meta">
                                <div className="file-name">{f.name}</div>
                                <div className="file-size">{f.size}</div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeFileAt(idx)}>
                                    삭제
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    
    );
}

// function Sheet3() {
//     return (
//         <div className="sheet">
//             <h2 className="">3번 시트 화면</h2>
//             <p> 필요한 내용 작성 </p>
//         </div>
    
//     );
// }

export default function SheetPages({
    rows,
    setRows,
    addRow,
    delRow,
    rmForm,
    setRmForm,
    files,
    setFiles,
    refs,
    errorField,
    // sheetData,
    // setSheetData
}) {
    // Row 데이터 State 저장
    // const [rows, setRows] = useState([{ "row": 1, "id" : "", "name" : "" }]);
    // const addRows = (e) => {
    //     const newRow = {
    //         "row" : rows.length + 1,
    //         "id" : e.target.id,
    //         // "value" : e.target.value,
    //         "name" : e.target.name
    //     }

    //     setRows(prev => [...prev, newRow] );
    // }

    // 기존 데이터 보관 State
    const [sheetData1, setSheetData1] = useState([]);
    const [sheetData2, setSheetData2] = useState({ "row": "", "name" : "", "value": "" });

    console.log(`📌 ROWS : ${rows}`);
    console.log(`📌 ROWS(type) : ${typeof(rows)}`);
    console.log(`📌 ROWS(Array) : ${Array.isArray(rows)}`);

    // const updateSheetData = (sheetId, partialData) => {
    //     // setSheetData(prev => ({
    //     //     ...prev,
    //     //     [sheetId] : {
    //     //         ...prev[sheetId],
    //     //         ...partialData
    //     //     }
    //     // }));

    //     const { row, name, value } = partialData;
    //     const key = `${row}|${name}`;

    //     setSheetData(prev => ({
    //         ...prev,
    //         [sheetId] : {
    //             ...(prev[sheetId] ?? {}),
    //             [key] : {
    //                 ...(prev[sheetId]?.[key] ?? {}),
    //                 ...partialData
    //             }
    //         }
    //     }));
    // }

    const tabs = useMemo(
        () => [
            // { id: "sheet1", label: "방부력결과등록", element: <Sheet1 value={sheetData1} changeData={setSheetData1}/>},
            {   id: "sheet1", 
                label: "성분분석내부", 
                element: (
                    <Sheet1
                        rows={rows}
                        setRows={setRows}
                        addRow={addRow}
                        delRow={delRow}
                        data={rmForm}
                        onChange={setRmForm}
                        refs={refs}
                        errorField={errorField}
                        // onChange={(data) => updateSheetData("sheet1", data)}
                    />
                )},

            {   id: "sheet2", 
                label: "파일첨부", 
                element: (
                    <Sheet2
                        // data={sheetData.sheet2}
                        // onChange={(data) => updateSheetData("sheet2", data)}
                        files={files}
                        setFiles={setFiles}
                    />
                )},
            // { id: "sheet3", label: "Sheet3", element: <Sheet3 />},
        ]
    );

    const [activeId, setActiveId] = useState(tabs[0].id);
    const activeTab = tabs.find(t => t.id === activeId);
    const ActiveComponent = activeTab?.Component;

    // const activeTab = useMemo(
    //     () => tabs.find((t) => t.id === activeId) ?? tabs[0],
    //     [tabs, activeId]
    // );

    const onChange = useCallback((id) => setActiveId(id), []);

    // ↓↓↓↓↓ 단축키를 통한 시트 변경(필요시 활성화) ↓↓↓↓↓
    // useEffect(() => {
    //     const handler = (e) => {
    //         if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    //         const idx = tabs.findIndex((t) => t.id === activeId);
    //         if (idx < 0) return;

    //         if (e.key === "ArrowLeft") {
    //             const next = idx - 1 < 0 ? tabs.length - 1 : idx - 1;
    //             setActiveId(tabs[next].id);
    //         } else {
    //             const next = idx + 1 >= tabs.length ? 0 : idx + 1;
    //             setActiveId(tabs[next].id);
    //         }

    //     };

    //     window.addEventListener("keydown", handler);
    //     return () => window.removeEventListener("keydown", handler);
    // }, [tabs, activeId]);
    // ↑↑↑↑↑ 단축키를 통한 시트 변경(필요시 활성화) ↑↑↑↑↑

    // 이미지 State 영역
    const [images, setImages] = useState({
        key : ""
    });

    return (
        <div className="internal-sheet-page">
            {/* <h1>엑셀 시트 탭 UI</h1> */}
            <SheetTabs 
                tabs={tabs} 
                activeId={activeId} 
                onChange={setActiveId}
            />

            {/* <div className="content-card">{activeTab.element}</div> */}
            <div className="internal-sheet-content-card">
                {activeTab.element}
                {/* <ActiveComponent
                    rows={rows}
                    addRows={addRows}
                    sheetData1={sheetData1}
                    sheetData2={sheetData2}
                    setSheetData1={setSheetData1}
                    setSheetData2={setSheetData2} /> */}
            </div>
        </div>
    )
}