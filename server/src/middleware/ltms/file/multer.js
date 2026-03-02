/**
 * 파일명 : multer.js
 * 용도 : 파일 업로드 설정 (multer)
 * 최초등록 : 2026-02-20 [박진영]
 * 수정일자 : 
 * 수정사항 : 
 */

import multer from 'multer';  // multer: 파일 업로드 미들웨어 (multipart/form-data 처리)
import path from 'path';      // path: 파일 경로 조작 모듈 (경로 결합, 확장자 추출 등)
import fs from 'fs';          // fs: 파일 시스템 모듈 (디렉토리 생성, 파일 삭제 등)
import { fileURLToPath } from 'url'; // fileURLToPath: ES 모듈에서 __dirname 대체


/**
 * ES 모듈에서는 __dirname과 __filename이 기본적으로 제공되지 않으므로,
 * fileURLToPath와 import.meta.url을 사용하여 현재 파일의 경로를 얻습니다.
 * 이를 통해 업로드 디렉토리의 절대 경로를 설정할 수 있습니다.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * 업로드 파일 저장 기본 경로 설정
 * - __dirname: 현재 파일의 디렉토리 경로
 * - '../../uploads': 프로젝트 루트 기준 uploads 폴더 (상위 2단계)
 */
// const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads');
const UPLOAD_BASE_DIR = path.join('/lims-server/src/uploads');

/**
 * 서버 시작 시 업로드 디렉토리 구조를 미리 생성
 * - material, test_item, caution 등 카테고리별 폴더 생성
 * - 최초 업로드 시 폴더가 없으면 자동 생성
 */
const initUploadDirectories = () => {
  const directories = [
    path.join(UPLOAD_BASE_DIR, 'ct', 'material'),
    path.join(UPLOAD_BASE_DIR, 'ct', 'test_item'),
    path.join(UPLOAD_BASE_DIR, 'ct', 'caution')
  ];
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ 업로드 디렉토리 생성: ${dir}`);
      } catch (err) {
        console.error(`❌ 디렉토리 생성 실패: ${dir}`, err);
      }
    }
  });
};

// 서버 구동 시 디렉토리 생성 함수 실행
initUploadDirectories();


/**
 * 업로드 시점에 디렉토리 존재 여부 확인 및 생성
 * - 업로드 경로가 없을 경우 자동 생성
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ 디렉토리 생성됨: ${dirPath}`);
    } catch (err) {
      console.error(`❌ 디렉토리 생성 실패: ${dirPath}`, err);
      throw err;
    }
  }
};


/**
 * multer.diskStorage: 파일 저장 방식 커스터마이즈
 * - destination: 업로드 경로 동적 결정 (fieldname 기반)
 * - filename: 파일명 중복 방지 및 안전한 이름 생성
 */
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    // fieldname에서 카테고리 추출 (material_0 -> material, test_item_123 -> test_item)
    const category = file.fieldname.split('_')[0] || 'general';
    const uploadDir = path.join(UPLOAD_BASE_DIR, 'ct', category);
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // 이미지 MIME 타입 목록
    const imageMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/bmp', 'image/svg+xml'
    ];
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    // 이미지 파일은 기존 방식대로 새 이름 생성
    if (imageMimeTypes.includes(file.mimetype)) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const safeBasename = basename.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 50);
      const newFilename = `${timestamp}_${random}_${safeBasename}${ext}`;
      console.log(`💾 저장될 이미지 파일명: ${newFilename}`);
      cb(null, newFilename);
    } else {
      // 문서 등은 원본 파일명 보존 (한글, 영문, 숫자, 공백, -, _, (, ), [, ], .만 허용, 연속 밑줄은 하나로)
      let safeBasename = basename
        .replace(/[^a-zA-Z0-9가-힣 _\-\(\)\[\]\.]/g, '_') // 허용 문자 외 _로 치환
        .replace(/_+/g, '_') // 연속 밑줄 하나로
        .replace(/^_+|_+$/g, '') // 앞뒤 밑줄 제거
        .substring(0, 50);
      // 공백이 모두 _로 바뀌는 게 싫으면 아래 라인 주석 해제
      // safeBasename = safeBasename.replace(/ /g, '');
      const originalFilename = `${safeBasename}${ext}`;
      console.log(`💾 저장될 문서 파일명(원본): ${originalFilename}`);
      cb(null, originalFilename);
    }
  }
});


/**
 * 파일 필터링 함수
 * - 허용된 MIME 타입만 업로드 허용
 * - 보안상 위험한 확장자(.exe 등) 업로드 차단
 */
const fileFilter = (req, file, cb) => {
  // 허용할 MIME 타입 목록
  const allowedMimeTypes = [
    // 이미지
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    // 문서
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // 텍스트
    'text/plain',
    'text/csv',
    // 압축파일
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed'
  ];
  // 차단할 확장자 (보안 위험)
  const blockedExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.msi', '.app'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (blockedExtensions.includes(fileExtension)) {
    cb(new Error(`보안상 ${fileExtension} 파일은 업로드할 수 없습니다.`), false);
    return;
  }
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다. (이미지, PDF, Office 문서, 압축파일만 허용)'), false);
  }
};


/**
 * multer 인스턴스 생성
 * - storage: 저장 방식
 * - fileFilter: 파일 필터링
 * - limits: 파일 크기/개수 제한
 *   - fileSize: 50MB
 *   - files: 최대 50개
 */
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한 (문서 파일 고려)
    files: 50 // 최대 50개 파일
  }
});


/**
 * 파일 삭제 유틸리티
 * - 지정 경로의 파일을 삭제
 * - 성공 시 true, 실패 시 false 반환
 */
export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (err) {
    console.error('파일 삭제 실패:', err);
    return false;
  }
};


/**
 * 여러 파일 삭제 유틸리티
 * - filePaths 배열을 받아 순차적으로 삭제
 * - 각 파일 삭제 결과를 배열로 반환
 */
export const deleteFiles = (filePaths) => {
  const results = [];
  for (const filePath of filePaths) {
    results.push(deleteFile(filePath));
  }
  return results;
};
