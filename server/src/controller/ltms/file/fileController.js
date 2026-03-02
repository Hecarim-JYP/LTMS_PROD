/**
 * 파일명 : fileController.js
 * 용도 : 파일 업로드 및 다운로드 컨트롤러
 * 최초등록 : 2026-02-23 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// ...existing code...

const router = express.Router();

// __dirname 구하기 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_BASE_DIR = path.join(__dirname, '../../../../uploads');


/**
 * 파일 미리보기(브라우저 렌더링)
 * GET /ltms/file/preview/:category/:subfolder/:filename
 * - 권한 체크, 접근 로그 등 추가 가능
 */
router.get('/preview/:category/:subfolder/:filename', (req, res) => {
	const { category, subfolder, filename } = req.params;
	const filePath = path.join(UPLOAD_BASE_DIR, category, subfolder, filename);

	// 예시: 사용자 인증/권한 체크 (실제 로직은 필요에 따라 구현)
	// if (!req.user || !req.user.canViewFiles) {
	//   return res.status(403).json({ success: false, message: '권한이 없습니다.' });
	// }

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ success: false, message: '파일을 찾을 수 없습니다.' });
	}

	// 접근 로그 기록 예시
	// console.log(`[파일 미리보기] 사용자: ${req.user?.id}, 파일: ${filePath}`);

	res.sendFile(filePath);
});

/**
 * 파일 다운로드 (다운로드 대화상자 표시, 파일명 변경 가능)
 * GET /ltms/file/download/:category/:subfolder/:filename
 * 쿼리: ?downloadName=원하는파일명
 */
router.get('/download/:category/:subfolder/:filename', (req, res) => {
	const { category, subfolder, filename } = req.params;
	const filePath = path.join(UPLOAD_BASE_DIR, category, subfolder, filename);
	const downloadName = req.query.downloadName || filename;

	// 권한 체크 예시
	// if (!req.user || !req.user.canDownloadFiles) {
	//   return res.status(403).json({ success: false, message: '다운로드 권한이 없습니다.' });
	// }

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ success: false, message: '파일을 찾을 수 없습니다.' });
	}

	// 다운로드 로그 기록 예시
	// console.log(`[파일 다운로드] 사용자: ${req.user?.id}, 파일: ${filePath}`);

	res.download(filePath, downloadName);
});


export default router;