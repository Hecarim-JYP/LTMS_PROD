/**
 * 파일명 : Sidebar.jsx
 * 용도 : 사이드 바
 * 최초등록 : 2025-11-05 [박진영]
 * 수정일자 : 2025-11-12 [박진영]
 * 수정사항 : TreeItem을 Sidebar 내부 함수(useCallBack)로 변경
 */

import { useContext, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from "react";

import useUrlInfo from "/src/hooks/useUrlInfo";

import { Link } from "react-router-dom";
import { SidebarContext } from "/src/contexts/SidebarContext";
import { AuthContext } from "/src/contexts/AuthContext";

export default function Sidebar() {

  const url = useUrlInfo().path; // 현재 페이지 경로

  /****************************************************************************
   * Context (전역 상태 사용)
   * 
   * SidebarContext: 사이드바 UI 상태 관리
   * AuthContext: 사용자 인증 정보 (접근 가능한 메뉴 포함)
   ****************************************************************************/
  const {
    isSideBarOpen, setIsSideBarOpen,
    expandedKeys, setExpandedKeys
  } = useContext(SidebarContext);

  const { user } = useContext(AuthContext);


  /****************************************************************************
   * DOM 제어용 Ref
   * 
   * refSidebar
   * - 실제 사이드바 DOM을 제어하거나 이벤트 바인딩(예: focus) 등에 사용될 수 있음
   * - 실제 DOM element를 읽기 위해 사용
   * 
   * refTreeItemsMap
   * - 각 TreeItem의 DOM 참조를 저장하여 자동 스크롤에 사용
   ****************************************************************************/
  const refSidebar = useRef(null);
  const refTreeItemsMap = useRef(new Map());
  const refSidebarMain = useRef(null);

  const SCROLL_POSITION_KEY = 'ltms_sidebar_scroll_position';


  /****************************************************************************
   * 접근 가능한 메뉴 데이터
   * -------------------------------------------
   * HOW : AuthContext의 user.accessibleMenus 사용
   *       로그인 시 서버에서 계산된 접근 가능 메뉴 리스트 (OR 조건)
   * 
   * WHY : 별도 API 호출 불필요, 권한 체크 불필요 (이미 필터링됨)
   *       서버에서 role_permission과 menu_permission을 조인하여
   *       사용자의 단일 역할 기반으로 접근 가능한 메뉴만 제공
   * 
   * NOTE : 1depth 메뉴는 서버에서 자동 포함됨 (카테고리 헤더)
   ****************************************************************************/
  const menuList = user?.accessibleMenus || [];  
  
  /****************************************************************************
   * buildTreeRecursive : parent_menu_id 기반 재귀적 트리 구조 생성
   * -------------------------------------------
   * HOW : parent_menu_id를 기준으로 부모-자식 관계를 파악하여 트리 구조 생성
   *       depth 1~3까지 재귀적으로 처리
   * 
   * WHY : 새 메뉴 구조는 parent_menu_id로 계층 관계를 명확히 정의
   * 
   * NOTE : 새로운 메뉴 구조
   *   - depth 1: parent_menu_id = NULL (예: ct, internal, external)
   *   - depth 2: parent_menu_id = depth 1의 menu_id (예: ct_request_category)
   *   - depth 3: parent_menu_id = depth 2의 menu_id (예: ct_request_read)
   * 
   * PERMISSION:
   *   - 서버에서 이미 권한 체크 완료된 메뉴만 오므로 클라이언트 체크 불필요
   *   - depth 1 (카테고리): 서버에서 자동 포함
   *   - depth 2, 3: 서버에서 menu_permission 기반 필터링됨
   ****************************************************************************/
  const buildTreeRecursive = useCallback((menuList, parentMenuId) => {
    // 현재 부모의 자식 메뉴들 찾기 및 정렬
    const children = menuList
      .filter(menu => menu.parent_menu_id === parentMenuId)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    return children.map(menu => {
      // menu_code를 고유 키로 직접 사용 (충돌 방지)
      // 예: 'ct', 'ct_request_category', 'internal_request_category'
      const key = menu.menu_code;
      
      // first_category가 부모 키 (depth 2, 3의 경우)
      const parentKey = menu.first_category || null;
      
      // 재귀적으로 자식 메뉴 조회
      const childMenus = buildTreeRecursive(menuList, menu.menu_id);
      
      return {
        key: key,
        label: menu.menu_name,
        parent: parentKey,
        path: menu.menu_path || '',
        title: menu.menu_name,
        depth: menu.depth,
        menuId: menu.menu_id,
        menuCode: menu.menu_code,
        secondCategory: menu.second_category,
        children: childMenus,
      };
    })
    .filter(menu => {
      // depth 1 (카테고리): 하위 메뉴가 있는 경우만 표시
      if (menu.depth === 1) {
        return menu.children && menu.children.length > 0;
      }
      // depth 2 (서브카테고리): 하위 메뉴가 있는 경우만 표시
      if (menu.depth === 2 && menu.menuCode.endsWith('_category')) {
        return menu.children && menu.children.length > 0;
      }
      // depth 3 (실제 페이지): 모두 표시
      return true;
    });
  }, []);

  /****************************************************************************
   * navTree : 접근 가능한 메뉴를 트리 구조로 변환 (useMemo로 최적화)
   * -------------------------------------------
   * HOW : 로그인 시 서버에서 받은 flat한 메뉴 리스트를 parent_menu_id 기반으로
   *       재귀적으로 트리 구조로 변환 (depth 1~3)
   * 
   * WHY : navTree는 계산 비용이 비교적 높은 구조화 작업임
   *       사이드바는 리렌더링이 자주 발생할 수 있기 때문에
   *       매 렌더마다 map 연산을 하지 않도록 메모이제이션
   * 
   * NOTE : menuList는 user.accessibleMenus (이미 권한 필터링됨)
   *        parent_menu_id가 NULL인 메뉴(depth 1)부터 시작
   ****************************************************************************/
  const navTree = useMemo(() => {
    if (!menuList || menuList.length === 0) return [];
    
    // parent_menu_id가 NULL인 최상위 메뉴(depth 1)부터 시작하여 재귀적으로 트리 생성
    return buildTreeRecursive(menuList, null);
    
  }, [menuList, buildTreeRecursive]);


  /****************************************************************************
   * toggleExpand : 트리 펼침/접힘 상태 토글
   * -------------------------------------------
   * HOW : useCallback(toggleExpand, [])
   *       expandedKeys는 Set 자료구조로 관리되며
   *       특정 key가 포함되어 있는지 여부로 펼침/접힘 상태 관리
   *       prev(Set)을 복사 → 새로운 Set 생성(next)
   *       이미 있으면 제거, 없으면 추가
   *       새로운 Set을 반환하여 상태 업데이트
   * 
   * CAUTION : deps가 []이므로 toggleExpand는 최초 렌더링 때 만들어진 함수 그대로 유지
   *           setExpandedKeys는 React가 보장하는 stable function이므로 deps에 넣지 않아도 안전
   ****************************************************************************/
  const toggleExpand = useCallback((key, skipScroll = false) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      const willExpand = !next.has(key);
      
      next.has(key) ? next.delete(key) : next.add(key);
      
      // 펼칠 때 자동 스크롤 (skipScroll이 false일 때만)
      if (willExpand && !skipScroll) {
        setTimeout(() => {
          const element = refTreeItemsMap.current.get(key);
          if (element && refSidebarMain.current) {
            const elementRect = element.getBoundingClientRect();
            const sidebarRect = refSidebarMain.current.getBoundingClientRect();
            
            // 요소가 뷰포트 아래에 있으면 스크롤
            if (elementRect.bottom > sidebarRect.bottom) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              // 스크롤 후 새로운 위치 저장
              setTimeout(() => {
                if (refSidebarMain.current) {
                  sessionStorage.setItem(SCROLL_POSITION_KEY, refSidebarMain.current.scrollTop.toString());
                }
              }, 500); // smooth 스크롤 애니메이션 완료 후 저장
            }
          }
        }, 100);
      }
      
      return next;
    });
  }, []);

  /****************************************************************************
   * expandAll : 모든 메뉴 펼치기
   * -------------------------------------------
   ****************************************************************************/
  const expandAll = useCallback(() => {
    const allKeys = new Set();
    const collectKeys = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allKeys.add(node.key);
          collectKeys(node.children);
        }
      });
    };
    collectKeys(navTree);
    setExpandedKeys(allKeys);
  }, [navTree]);

  /****************************************************************************
   * collapseAll : 모든 메뉴 접기
   * -------------------------------------------
   ****************************************************************************/
  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set());
  }, []);


  // 스크롤 위치 저장 (sessionStorage 사용)
  useEffect(() => {
    const sidebarMain = refSidebarMain.current;
    if (!sidebarMain) return;

    // 스크롤 위치 저장 함수 (throttle 적용)
    let scrollTimeout = null;
    const handleScroll = () => {
      // 이전 타이머 취소
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // 스크롤이 멈춘 후 50ms 뒤에 저장 (성능 최적화)
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(SCROLL_POSITION_KEY, sidebarMain.scrollTop.toString());
      }, 50);
    };

    // 스크롤 이벤트 리스너 등록
    sidebarMain.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      sidebarMain.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // 스크롤 위치 복원 - 모든 렌더링 후 실행 (useLayoutEffect로 화면 깜빡임 방지)
  useLayoutEffect(() => {
    const sidebarMain = refSidebarMain.current;
    if (!sidebarMain) return;

    // 저장된 스크롤 위치 복원
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedScrollPosition) {
      const scrollPos = parseInt(savedScrollPosition, 10);
      // 현재 스크롤 위치와 다를 때만 복원
      if (Math.abs(sidebarMain.scrollTop - scrollPos) > 1) {
        sidebarMain.scrollTop = scrollPos;
      }
    }
  }); // 의존성 배열 없음 - 모든 렌더링 후 실행

  // URL 기반 자동 펼침 (스크롤 위치 유지)
  useEffect(() => {
    if (!url || !menuList || menuList.length === 0) return;

    // 현재 URL에 해당하는 메뉴 찾기
    const currentMenu = menuList.find(menu => menu.menu_path === url);
    if (!currentMenu) return;

    setExpandedKeys((prev) => {
      const next = new Set(prev);

      // depth 3 메뉴: 부모(depth 2 category)와 조부모(depth 1) 펼침
      if (currentMenu.depth === 3 && currentMenu.parent_menu_id) {
        const parentMenu = menuList.find(m => m.menu_id === currentMenu.parent_menu_id);
        if (parentMenu) {
          next.add(parentMenu.menu_code); // depth 2 펼침
          if (parentMenu.parent_menu_id) {
            const grandParentMenu = menuList.find(m => m.menu_id === parentMenu.parent_menu_id);
            if (grandParentMenu) {
              next.add(grandParentMenu.menu_code); // depth 1 펼침
            }
          }
        }
      }
      // depth 2 메뉴: 부모(depth 1) 펼침
      else if (currentMenu.depth === 2 && currentMenu.parent_menu_id) {
        const parentMenu = menuList.find(m => m.menu_id === currentMenu.parent_menu_id);
        if (parentMenu) {
          next.add(parentMenu.menu_code);
        }
      }

      return next;
    });
  }, [url, menuList]);


  /****************************************************************************
   * TreeItem : 재귀적으로 트리 출력하는 UI 컴포넌트
   * -------------------------------------------
   * HOW : props: { node, depth }
   *       node.children이 있으면 재귀적으로 TreeItem 호출
   *       expandedKeys Set에 현재 key가 있으면 펼침 상태로 렌더링
   *       사이드바가 닫혀 있으면 텍스트 숨김
   *       children이 있으면 toggleExpand 호출
   * 
   * WHY : 재귀 구조로 트리 메뉴를 렌더링한다.
   *       useCallback으로 묶어 불필요한 재생성을 방지
   ****************************************************************************/
  const TreeItem = useCallback(({node, depth}) => {
    const itemRef = useRef(null);
    
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.has(node.key);
    const isSelected = node.path !== "" && url.includes(node.path);

    // TreeItem이 렌더링될 때 ref를 맵에 저장
    useEffect(() => {
      if (itemRef.current) {
        refTreeItemsMap.current.set(node.key, itemRef.current);
      }
      return () => {
        refTreeItemsMap.current.delete(node.key);
      };
    }, [node.key]);

    // 클릭 이벤트 처리 (선택 + 펼침/접힘)
    const onClick = () => {
      toggleExpand(node.key);
    };

    // URL 생성: depth 3 메뉴는 menu_path를 그대로 사용
    // depth 1, 2 (category)는 자식이 있으므로 링크 없음
    let linkUrl;
    if (hasChildren) {
      linkUrl = undefined; // 자식이 있으면 링크 없음 (펼침/접힘만)
    } else {
      linkUrl = node.path; // depth 3 메뉴의 menu_path 사용
    }

    return (
      <>
        <li role="treeitem" 
          ref={itemRef}
          aria-expanded={isExpanded || undefined}
          aria-selected={isSelected || undefined}>
          {hasChildren ? (
            <button
              type="button"
              className={`tree-item-row ${isSelected ? "active" : ""}`}
              style={{ 
                paddingLeft: `${depth * 16 + 8}px`,
                marginBottom: "5px",
              }}
              onClick={onClick}
              title={!isSideBarOpen ? node.label : ""}>

              {/* 트리 구조 라인 표시 (depth > 0일 때만) */}
              {isSideBarOpen && depth > 0 && (
                <span className="tree-line" aria-hidden="true">┗</span>
              )}
              {/* 메뉴 텍스트 (사이드바 닫힘 상태면 숨김) */}
              {isSideBarOpen && (<span className="tree-text">{node.label}</span>)}
              <span className={`caret ${isExpanded ? "open" : ""}`} aria-hidden="true"/>
            </button>
          ) : (
            <Link 
                  to={linkUrl}
                  title={node.title}
                  className={`tree-item-row ${isSelected ? "active" : ""}`}
                  style={{ 
                    paddingLeft: `${depth * 16 + 8}px`,
                    textDecoration: "none",
                  }}>
              {/* 트리 구조 라인 표시 (depth > 0일 때만) */}
              {isSideBarOpen && depth > 0 && (
                <span className="tree-line" aria-hidden="true">┗</span>
              )}
              {isSideBarOpen && (<span className="tree-text">{node.label}</span>)}
              <span className="caret placeholder" aria-hidden="true" />
            </Link>
          )}

          {/* 자식 노드 (펼쳐진 경우에만 렌더링) */}
          {hasChildren && isExpanded && isSideBarOpen && (
            <ul role="group" className="tree-children">
              {node.children.map((child) => (
                <TreeItem 
                  key={child.key} 
                  node={child} 
                  depth={depth + 1}
                />
              ))}
            </ul>
          )}
        </li>
      </>
    );
  }, [expandedKeys, isSideBarOpen, url, toggleExpand]);
  

  /**************************** Sidebar 컴포넌트 return 문 ****************************/
  return (
      <>
        <div className="sidebar" 
             style={{display : isSideBarOpen ? "flex" : "none"}}
             ref={refSidebar} 
             tabIndex={0}>
            <div className="sidebar-main" ref={refSidebarMain}>
              <div className="sidebar-header">
                <div className="tree-controls">
                  <button 
                    className="tree-control-btn" 
                    onClick={expandAll}
                    title="메뉴 펼치기"
                    aria-label="메뉴 펼치기">
                    ▼ 메뉴 펼치기
                  </button>
                  <button 
                    className="tree-control-btn" 
                    onClick={collapseAll}
                    title="메뉴 접기"
                    aria-label="메뉴 접기">
                    ▲ 메뉴 접기
                  </button>
                </div>
              </div>
                <ul className="tree" role="tree">
                    {navTree.map((node) => (
                      <TreeItem 
                        key={node.key} 
                        node={node} 
                        depth={0}
                      />
                    ))}
                </ul>
            </div>
        </div>
        <div className="sidebar-toggle" tabIndex={1} onClick={(e) => {setIsSideBarOpen(prev => !prev)}}>
          {/* <button className="sidebar-toggle-button" aria-label="사이드 바 열기/닫기"></button> */}
        </div>
      </>
  );
}