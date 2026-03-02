/**
 * @name : Preservative_SheetTabs.jsx
 * @description : 방부력테스트 내 시트 페이지
 * @since : 2026-01-09
 * @author : 최연웅(231004)
 * 수정사항 : 
 */

import React, { useMemo, useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

function SheetTabs({ tabs, activeId, onChange }) {
    return (
        <div className="wrapper">
            <div className="tab-row">
                {tabs.map((t) => {
                    const isActive = t.id === activeId;
                    return (
                        <button
                            key={t.id}
                            type={"button"}
                            onClick={() => onChange(t.id)}
                            className={`sheet-tab ${t.id === activeId ? "active" : ""}`}

                            >
                                {t.label}
                            </button>
                    )
                })}
            </div>
        </div>
    )
}

function Sheet1({ rows, addRows, sheetData1, setSheetData1, onChange, data, testStartDate }) {
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

    console.log("DATA : ", data);
    /**
     *  @name : data parsing
     *  @description : 상단 컴포넌트(SheetPages) state data parsing
     *  @author : 최연웅(231004)
     */
    // const key = `${data?.[key]?.row ?? ""}|${data?.[key]?.name ?? ""}`;
    // console.log(data?.[key].value ?? "");
    // const cell = data?.[key] ?? {};
    // const isTntc = cell.mode == "TNTC";


    /**
     *  @name : date 기능
     *  @description : 시험결과판정 + 날짜를 파라미터로 받아 계산 
     *  @param : date
     *  @author : 최연웅(231004)
     */
    // const testStartDate = String(testStartDate);
    const date = (date) => {
        // console.log("[Preservative-sheet] test Start Date : ", testStartDate);
        let day = new Date(testStartDate.date);
        if (day=="Invalid Date") day = new Date();
        // const day = new Date(testStartDate.date);
        // console.log("[Preservative-sheet] D-DAY : ", day);
        // console.log("[Preservative-sheet] getDate() : ", day.getDate());
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

    const dataRows = [1, 2, 3, 4, 5];
    const columns = [
        ,"test_sheet_dateStart"
        ,"test_sheet_date7"
        ,"test_sheet_date14"
        ,"test_sheet_date28"
        ,"test_sheet_deathIn7"
        ,"test_sheet_deathIn14"
        ,"test_sheet_deathIn28"
    ];

    const details = [
        "Staphylococcus aureus"
        ,"Escherichia coli"
        ,"Pseudomonas aeruginosa"
        ,"Candida albicans"
        ,"Aspergillus brasiliensis"
    ]

    const target = [
        "Bacteria"
        ,"Bacteria"
        ,"Bacteria"
        ,"Yeast"
        ,"Mold"
    ]

    /**
     * @name : TNTC 활성화
     * @description : select 에서 TNTC 선택시 무제한 표기
     * @author : 최연웅(231004)
     */
    const [isLocked, setIsLocked] = useState(false);
    const [tntc, setTntc] = useState("");
    const [background, setBackground] = useState("");
    const setInfinite = (e) => {
        // console.log(e);
        const {id, name, value} = e.target;
        // const value = e.target.value;
        // console.log("name : ", name);
        // console.log("value : ", value);

        if (value == "true") 
            { 
                console.log("Infinity Beyond!");
                setTntc("TNTC");
                setIsLocked(true);
                setBackground("preservative-create-labNoClass");
            } else {
                setTntc("");
                setIsLocked(false);
                setBackground("");
            }
        
    }

    return (
        <>
        <div className="preservative-create-sheet-grid preservative-create-grid-line">
            <table>
                <tr>
                    <th style={{width:'200px'}}>세부</th>
                    <th style={{width:'100px'}}>대상</th>
                    <th>
                        <div>시작일</div>
                        <div>{date(0)}</div>
                    </th>
                    <th>
                        <div>7일</div>
                        <div>{date(12)}</div>
                    </th>
                    <th>
                        <div>14일</div>
                        <div>{date(19)}</div>
                    </th>
                    <th>
                        <div>28일</div>
                        <div>{date(33)}</div>
                    </th>
                    <th>7일사멸율(%)</th>
                    <th>14일사멸율(%)</th>
                    <th>28일사멸율(%)</th>
                </tr>
                {dataRows.map((row) => (
                    <tr key={row}>
                        <td>{details[row-1]}</td>
                        <td>{target[row-1]}</td>
                        {columns.map((col) => {
                            // const key = `${row}|${col}`;
                            const key = `${row}_${col}`;

                            return (
                                <td key={key}>
                                    <div className="test">
                                    <input
                                        // id={`${String(row)}_${col}`}
                                        id={key}
                                        disabled={!!data?.[key]?.disabled}
                                        className={data?.[key]?.background ?? ""}
                                        name={`pre_${key}`}
                                        type="text"
                                        min="0"
                                        max="100"
                                        // value={isTntc ? "TNTC" : (cell.value ?? "")}
                                        // disabled={isTntc}
                                        value={data?.[key]?.value ?? ""}
                                        onChange={(e) => {
                                            // if(isTntc) return;
                                            onChange({
                                                id: e.target.id
                                                ,name: e.target.name
                                                ,value: e.target.value
                                                ,mode : "NORMAL"
                                            })
                                        }}
                                    />
                                    <select 
                                        name={`pre_${key}_tntc`}
                                        onChange={(e) => {
                                            const selected = e.target.value;
                                            console.log(`selected : ${selected}`);
                                            if (selected == "true"){
                                                onChange({
                                                    // id: e.target.id
                                                    id: `${key}`
                                                    ,name: e.target.name
                                                    ,value: "∞"
                                                    ,mode: "TNTC"
                                                    ,disabled: true
                                                    ,background: "preservative-create-labNoClass"
                                                });
                                            } else {
                                                onChange({
                                                    // id: e.target.id
                                                    id: `${key}`
                                                    ,name: e.target.name
                                                    // ,value: data?.[key]?.value ?? ""
                                                    ,value: ""
                                                    ,mode : "NORMAL"
                                                    ,disabled: false
                                                    ,background: ""
                                                });
                                            }
                                        }}
                                        value={data?.[key]?.mode=="TNTC" ? "true" : "false"}
                                    >
                                        <option value="false"></option>
                                        <option value="true">TNTC</option>
                                    </select>
                                    </div>
                                </td>
                            )
                        })}

                    </tr>

                    )

                )}
            </table>
        </div>
        <div 
            className="preservative-create-grid preservative-create-grid-line"
            style={{paddingTop: '10px'}}
        >
            <div 
            className="empty-field" 
            style={{paddingLeft:'0px'}}>
            <div>📌 가이드라인 : <span style={{color: 'red'}}>ISO 11930</span> </div>
            <div>📌 판정기준</div>
            <div style={{paddingLeft:'20px'}}>
                <span style={{color:'red'}}>① Bacteria(박테리아): 99.9% 이상 사멸(7일차)</span>
            </div>
            <div style={{paddingLeft:'20px'}}>
                <span style={{color:'red'}}>② Yeast(효모): 90.0% 이상 사멸(7일차)</span>
            </div>
            <div style={{paddingLeft:'20px'}}>
                <span style={{color:'red'}}>③ Mold(곰팡이): 90.0% 이상 사멸(28일차)</span>
            </div>
            </div>
        </div>
        </>
    );
}

/**
 * @name : SHEET2
 * @author : 최연웅(231004)
 */
function Sheet2({ 
    rows, 
    addRows, 
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
                console.log("📌 file Sliced Check : ", sliced);

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
            console.log(e);
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
                    name="pre_file"
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
                                <div className="file-name">
                                    <a 
                                        href={`/api/ltms/preservative/request/read/files/${f.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                            {f.name}
                                    </a>
                                </div>
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

const SheetPages = forwardRef(function SheetPages({
        date
        ,mode
        ,sheetData
        ,updateSheetData
        ,files
        ,setFiles
    }
    ,ref
) {
// export default function SheetPages(date, ref) {
    // Row 데이터 State 저장
    const [rows, setRows] = useState([{ "row": 1, "id" : "", "name" : "" }]);
    const addRows = (e) => {
        const newRow = {
            "row" : rows.length + 1,
            "id" : e.target.id,
            // "value" : e.target.value,
            "name" : e.target.name
        }

        setRows(prev => [...prev, newRow] );
    }
    
    /**
     * ■ 방부력테스트 모드 선택 useEffect
     * @name : 
     */
    useEffect(() => {
    if(mode === "update") {console.log("📌 SheetPage Mode : ", mode);}
    else {console.log("일반모드")};
    }, []);
    
    // 기존 데이터 보관 State
    // const [sheetData1, setSheetData1] = useState([]);
    // const [sheetData2, setSheetData2] = useState({ "row": "", "name" : "", "value": "" });

    // const [sheetData, setSheetData] = useState({
        // ↓↓↓↓↓ sheetData state 예시 ↓↓↓↓↓
        // ["sheet1"] : {
        //     1|dateStart : {
        //         row: e.target.id
        //         ,name: e.target.name
        //         ,value: e.target.value
        //     },
        //     2|dateStart : {
        //         row: e.target.id
        //         ,name: e.target.name
        //         ,value: e.target.value
        //     }
        // },
        // ["sheet2"] : {
        //     1|dateStart : {
        //         row: e.target.id
        //         ,name: e.target.name
        //         ,value: e.target.value
        //     }
        // }
        // .
        // .
        // .
        // ↑↑↑↑↑ sheetData state 예시 ↑↑↑↑↑
    // })
    
    // 첨부파일 State 영역
    // const [files, setFiles] = useState([]);

    // const updateSheetData = (sheetId, partialData) => {
    //     // setSheetData(prev => ({
    //     //     ...prev,
    //     //     [sheetId] : {
    //     //         ...prev[sheetId],
    //     //         ...partialData
    //     //     }
    //     // }));

    //     const { row, id, name, value, mode } = partialData;
    //     // const key = `${row}|${name}`;
    //     const key = `${id}`;

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

    useImperativeHandle(ref, () => ({
        getSheetData: () => sheetData, 
        setSheetData: (data) => setSheetData(data), 
        getFiles: () => files
    }), [sheetData, files]);

    const tabs = useMemo(
        () => [
            // { id: "sheet1", label: "방부력결과등록", element: <Sheet1 value={sheetData1} changeData={setSheetData1}/>},
            {   id: "sheet1", 
                label: "방부력결과등록", 
                element: (
                    <Sheet1
                        rows={rows}
                        addRows={addRows}
                        data={sheetData.sheet1}
                        onChange={(data) => updateSheetData("sheet1", data)}
                        testStartDate={date}
                    />
                )},

            {   id: "sheet2", 
                label: "보고서파일첨부", 
                element: (
                    <Sheet2
                        data={sheetData.sheet2}
                        onChange={(data) => updateSheetData("sheet2", data)}
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
        <div className="page">
            {/* <h1>엑셀 시트 탭 UI</h1> */}
            <SheetTabs 
                tabs={tabs} 
                activeId={activeId} 
                onChange={setActiveId}
            />

            {/* <div className="content-card">{activeTab.element}</div> */}
            <div className="content-card">
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
);

export default SheetPages;