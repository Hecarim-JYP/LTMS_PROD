/**
 * ======================================================================
 * 📁 middleware/authMiddleware.js
 * ======================================================================
 * 
 * 목적:
 *   - JWT 토큰 검증 미들웨어
 *   - 권한/역할 기반 접근 제어 미들웨어
 * 
 * 사용 방법:
 *   import { authenticateToken, requireRole, requirePermission } from './middleware/authMiddleware.js';
 * 
 *   // 인증 필요
 *   app.get('/protected', authenticateToken, (req, res) => { ... });
 * 
 *   // 특정 역할 필요
 *   app.get('/admin', authenticateToken, requireRole('admin'), (req, res) => { ... });
 * 
 *   // 특정 권한 필요
 *   app.post('/ct', authenticateToken, requirePermission('write'), (req, res) => { ... });
 * ======================================================================
 */

import jwt from 'jsonwebtoken';
import { getUserById } from '../../../repository/sql/ltms/auth/authQueries.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cosmeccaAPI3295';

/**
 * 🔐 JWT 토큰 인증 미들웨어
 * 
 * Authorization 헤더에서 토큰을 추출하여 검증
 * 검증 성공 시 req.user에 사용자 정보 저장
 * 
 * 사용 예시:
 *   router.get('/profile', authenticateToken, (req, res) => {
 *     res.json({ user: req.user });
 *   });
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 토큰 존재 여부 확인
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다',
      });
    }

    // 토큰 추출
    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);

    // 사용자 정보 조회 (DB에서 최신 상태 확인)
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 사용자입니다',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다',
      });
    }

    // req.user에 사용자 정보 저장
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (err) {
    console.error('❌ 토큰 검증 실패:', err.message);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다',
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '토큰이 만료되었습니다. 다시 로그인해주세요',
      });
    }

    res.status(500).json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다',
    });
  }
};

/**
 * 👑 역할(Role) 기반 접근 제어
 * 
 * 특정 역할을 가진 사용자만 접근 허용
 * 
 * @param {...string} allowedRoles - 허용할 역할 목록
 * @returns {Function} Express 미들웨어
 * 
 * 사용 예시:
 *   // 단일 역할
 *   router.delete('/users/:id', authenticateToken, requireRole('admin'), deleteUser);
 * 
 *   // 다중 역할
 *   router.get('/data', authenticateToken, requireRole('admin', 'manager'), getData);
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // authenticateToken 미들웨어가 먼저 실행되어야 함
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다',
      });
    }

    const userRole = req.user.role;

    // 사용자 역할이 허용 목록에 있는지 확인
    if (!allowedRoles.includes(userRole)) {
      console.log(`⛔ 접근 거부: ${req.user.username} (역할: ${userRole}, 필요: ${allowedRoles.join(', ')})`);
      return res.status(403).json({
        success: false,
        error: '이 작업을 수행할 권한이 없습니다',
        required: allowedRoles,
        current: userRole,
      });
    }

    console.log(`✅ 역할 검증 성공: ${req.user.username} (역할: ${userRole})`);
    next();
  };
};

/**
 * 🔑 권한(Permission) 기반 접근 제어
 * 
 * 특정 권한을 가진 사용자만 접근 허용
 * 
 * @param {...string} requiredPermissions - 필요한 권한 목록
 * @returns {Function} Express 미들웨어
 * 
 * 사용 예시:
 *   // 단일 권한
 *   router.post('/ct', authenticateToken, requirePermission('write'), createCtData);
 * 
 *   // 다중 권한 (모두 필요)
 *   router.delete('/ct/:id', authenticateToken, requirePermission('write', 'delete'), deleteCtData);
 */
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    // authenticateToken 미들웨어가 먼저 실행되어야 함
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다',
      });
    }

    const userPermissions = req.user.permissions || [];

    // 필요한 모든 권한을 가지고 있는지 확인
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        permission => !userPermissions.includes(permission)
      );

      console.log(`⛔ 권한 부족: ${req.user.username} (부족한 권한: ${missingPermissions.join(', ')})`);
      return res.status(403).json({
        success: false,
        error: '이 작업을 수행할 권한이 없습니다',
        required: requiredPermissions,
        missing: missingPermissions,
      });
    }

    console.log(`✅ 권한 검증 성공: ${req.user.username}`);
    next();
  };
};

/**
 * 🔓 선택적 인증 미들웨어
 * 
 * 토큰이 있으면 검증하지만, 없어도 계속 진행
 * 공개 API지만 인증 사용자에게 추가 정보를 제공할 때 유용
 * 
 * 사용 예시:
 *   router.get('/public', optionalAuth, (req, res) => {
 *     if (req.user) {
 *       // 인증된 사용자에게 추가 데이터 제공
 *     }
 *     // 모두에게 기본 데이터 제공
 *   });
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 토큰 없음 - 계속 진행
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await getUserById(decoded.userId);

    if (user && user.is_active) {
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };
    }

    next();
  } catch (err) {
    // 토큰 검증 실패 - 그냥 계속 진행 (req.user는 undefined)
    next();
  }
};
