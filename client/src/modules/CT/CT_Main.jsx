/**
 * 파일명 : CT_Main.jsx
 * 용도 : CT 메인
 * 최초등록 : 2025-11-03 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 * ============== 사용되지 않음 ==============
 */

import React, { useContext } from "react";

import CT_SubNav from "/src/modules/CT/CT_SubNav";

import CT_Request_Read from "/src/modules/CT/CT_Request_Read";
import CT_Request_Create from "/src/modules/CT/CT_Request_Create";
import CT_Request_Approve from "/src/modules/CT/CT_Request_Approve";

import CT_TestReport_Read from "/src/modules/CT/CT_TestReport_Read";
import CT_TestReport_Report from "/src/modules/CT/CT_TestReport_Report";
import CT_TestReport_Standard from "/src/modules/CT/CT_TestReport_Standard";

import CT_Schedule_CT from "/src/modules/CT/CT_Schedule_CT";
import CT_Schedule_Report from "/src/modules/CT/CT_Schedule_Report";

import { SidebarContext } from "/src/contexts/SidebarContext";

export default function CT_Main() {

    const {
        tab, action
    } = useContext(SidebarContext);

    const tabControll = () => {

        if(tab == "request") {
            if(action == "read") {
                return (
                    <>
                        <CT_Request_Read/>
                    </>
                )
            } else if(action == "create") {
                return (
                    <>
                        <CT_Request_Create/>
                    </>
                )
            } else if(action == "approve") {
                return (
                    <>
                        <CT_Request_Approve/>
                    </>
                )
            }
        } else if(tab == "testReport") {
            if(action == "read") {
                return (
                    <>
                        <CT_TestReport_Read/>
                    </>
                )
            } else if(action == "report") {
                return (
                    <>
                      <CT_TestReport_Report/>  
                    </>
                )
            } else if(action == "standard") {
                return (
                    <>
                        <CT_TestReport_Standard/>
                    </>
                )
            }
        } else if(tab == "schedule") {
            if(action == "ct") {
                return (
                    <>
                        <CT_Schedule_CT/>
                    </>
                )
            } else if(action == "report") {
                return (
                    <>
                        <CT_Schedule_Report/>
                    </>
                )
            }
        }
    }

    return (
      <>

        <CT_SubNav/>
        {tabControll()}
      </>
    );
  }