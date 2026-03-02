/**
 * 파일명 : index.js
 * 용도 : LTMS 백엔드 서버 진입점
 * 최초등록 : 2026-01-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// 데이터베이스 커넥션 풀 관리 함수 import
import { initializePool, closePool } from './repository/connection.js';

// 각 모듈의 컨트롤러 import (LTMS 모듈)
import ctController from './controller/ltms/ct/ctController.js';
import internalController from './controller/ltms/internal/internalController.js';
import externalController from './controller/ltms/external/externalController.js';
import preservativeController from './controller/ltms/preservative/preservativeController.js';
import settingController from './controller/ltms/setting/settingController.js';
import authController from './controller/ltms/auth/authController.js'; // jwt import 후 사용 예정
import approvalController from './controller/ltms/approval/approvalController.js';
import fileController from './controller/ltms/file/fileController.js';
import commonController from './controller/ltms/common/commonController.js';

// 기존 라우터 (ERP, PLM)
import erpData from './controller/erp/erp_controller.js';
//
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan("dev"));

// 정적 파일 서빙 (업로드된 파일)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get("/", (req, res) => {
  res.json({ message: "✅ Backend server is running", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// LTMS 모듈 라우팅
app.use("/ltms/ct", ctController);
app.use("/ltms/internal", internalController);
app.use("/ltms/external", externalController);
app.use("/ltms/preservative", preservativeController);
app.use("/ltms/setting", settingController);
app.use("/ltms/auth", authController);
app.use("/ltms/approval", approvalController);
app.use("/ltms/file", fileController);
app.use("/ltms/common", commonController);

// ERP/PLM 모듈
app.use("/erp", erpData);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "라우트를 찾을 수 없습니다", path: req.path });
});

app.use((err, req, res, next) => {
  console.error("❌ 서버 에러:", err);
  res.status(err.status || 500).json({ success: false, error: err.message || "서버 오류가 발생했습니다" });
});

const startServer = async () => {
  try {
    await initializePool();
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on port ${PORT}`);
      console.log(`📍 API Server: ${process.env.API_SERVER || 'Not configured'}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully (SIGINT)...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully (SIGTERM)...');
  await closePool();
  process.exit(0);
});

startServer();