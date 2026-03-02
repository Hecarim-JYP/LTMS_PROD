/**
 * 파일명 : connection.js
 * 용도 : MariaDB 커넥션 풀 관리
 * 최초등록 : 2026-01-28 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 * 
 * 목적:
 *   - MariaDB 커넥션 풀(Connection Pool) 관리
 *   - 애플리케이션 전체에서 사용할 단일 풀 인스턴스 제공
 *   - 풀의 초기화, 획득, 해제 로직을 한곳에서 관리
 * 
 * 동작원리:
 *   1. 애플리케이션 시작 시 initializePool() 호출
 *   2. MariaDB 풀 생성 및 연결 테스트
 *   3. 필요할 때마다 getPool()으로 풀 획득
 *   4. 라우터/쿼리에서 pool.getConnection()으로 연결 가져감
 *   5. 작업 완료 후 connection.release()로 반환
 *   6. 서버 종료 시 closePool()으로 모든 연결 종료
 *   7. 풀 미초기화 시 getPool() 호출하면 에러 발생
 * 
 */

import mariadb from 'mariadb';
import dbConfig from '../config/database.js';

// 전역 풀 변수 - 모듈 로드 시 null로 초기화
// initializePool() 실행 후 MariaDB 풀 인스턴스가 저장됨
let ltmsPool = null;

/**
 * 💾 데이터베이스 커넥션 풀 초기화
 * 
 * 동작:
 *   1. config/database.js의 설정으로 MariaDB 풀 생성
 *   2. 연결 테스트를 위해 임시 커넥션 획득
 *   3. 성공하면 커넥션 해제 및 로그 출력
 *   4. 실패하면 프로세스 종료 (DB 없이는 서버 운영 불가)
 * 
 * 호출 위치: index.js의 startServer() 함수에서
 * 실행 시점: 애플리케이션 시작 초기
 */
export const initializePool = async () => {
  try {
    // MariaDB 풀 인스턴스 생성
    ltmsPool = mariadb.createPool(dbConfig);
    
    // 연결 테스트: 실제로 데이터베이스에 접속 가능한지 확인
    const connection = await ltmsPool.getConnection();
    console.log("✅ Database connection pool initialized");
    
    // 테스트 연결 반환
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    // DB 연결 실패 = 애플리케이션 운영 불가
    // 즉시 프로세스 종료
    process.exit(1);
  }
};

/**
 * 🔗 현재 커넥션 풀 반환
 * 
 * 동작:
 *   - ltmsPool이 null이면 에러 발생 (initializePool 미실행)
 *   - ltmsPool이 존재하면 그대로 반환
 * 
 * 호출 위치: db/queries/*.js의 각 함수에서
 * 사용 예시:
 *   const conn = await getPool().getConnection();
 *   try {
 *     // 쿼리 실행
 *   } finally {
 *     conn.release();
 *   }
 */
export const getPool = () => {
  if (!ltmsPool) {
    throw new Error("Database pool not initialized. Call initializePool() first.");
  }
  return ltmsPool;
};

/**
 * 🛑 커넥션 풀 종료
 * 
 * 동작:
 *   - 풀에서 관리하는 모든 데이터베이스 연결 종료
 *   - 서버 종료 시 "graceful shutdown" 구현
 * 
 * 호출 위치: index.js의 SIGINT/SIGTERM 핸들러에서
 * 중요성: 이 함수가 없으면 프로세스 종료 시 연결이 남아있어
 *         데이터베이스 리소스 낭비 및 문제 발생 가능
 */
export const closePool = async () => {
  if (ltmsPool) {
    await ltmsPool.end();
    console.log("✅ Database pool closed");
  }
};