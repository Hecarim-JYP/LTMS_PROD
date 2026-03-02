/**
 * 파일명 : database.js
 * 용도 : MariaDB 데이터베이스 연결 설정
 * 최초등록 : 2026-01-28 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 * 목적:
 *   - MariaDB 데이터베이스 연결 설정을 중앙에서 관리
 *   - 환경변수를 통해 설정 관리
 * 
 * 환경변수 설정:
 *   DB_HOST=192.168.115.203      (호스트)
 *   DB_PORT=13306                (포트)
 *   DB_USER=ltms                 (사용자명)
 *   DB_PASSWORD=password          (비밀번호)
 *   DB_NAME=lims                 (데이터베이스명)
 */

const dbConfig = {
  // 기본 연결 정보
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // 커넥션 풀 설정
  connectionLimit: 10,
  acquireTimeout: 30000,
  waitForConnections: true,
  queueLimit: 0,
  
  // 연결 옵션
  connectTimeout: 10000,
  idleTimeout: 600000,
  
  // 문자셋 및 타임존
  timezone: 'Asia/Seoul',
  charset: 'utf8mb4',
  
  // 재연결 설정
  reconnect: true,
  multipleStatements: false,
  namedPlaceholders: true
};

export default dbConfig;