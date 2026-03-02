 /**  ##########################################################
  #        ______                __           __
  #       / ____/_______  ____ _/ /____  ____/ /
  #      / /   / ___/ _ \/ __ `/ __/ _ \/ __  / 
  #     / /___/ /  /  __/ /_/ / /_/  __/ /_/ /  
  #     \____/_/   \___/\__,_/\__/\___/\__,_/   
  # 
  #     @since : 2026. 02. 18.
  #     @author : Choi Yeon Woong (231004)
  #     @description : LTMS - Preservative File System Control Middleware
  #     @modified : 
  ########################################################## */
  
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads/");

console.log(`📌 UPLOAD_ROOT : ${UPLOAD_ROOT}`);

// uploads 폴더 없으면 생성
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const parts = req.baseUrl.split("/");
    const moduleName = parts[parts.length -1];

    const dir = path.join(UPLOAD_ROOT, moduleName);
    console.log(dir);
    
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileName = smartFixFilename(file.originalname);
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    const safeBase = base.replace(/[^\w\-]+/g, "_").slice(0, 60);
    const unique = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    cb(null, `${fileName}_${safeBase}_${unique}${ext}`);
    // cb(null, `${base}${unique}${ext}`);
  },
});

// 필요하면 확장자/mime 제한 가능
function fileFilter(req, file, cb) {
  // 예시) 모두 허용
  cb(null, true);
}

// 한글파일명 복구
function smartFixFilename(name) {
  const fixed = Buffer.from(name, "latin1").toString("utf8");
  console.log(`📌 한글파일명 변환 : ${fixed}`);

  // 휴리스틱: 변환 후에 유니코드 대체문자(�)가 많으면 실패로 보고 원본 유지
  const bad = (s) => (s.match(/\uFFFD/g) || []).length;

  // 변환이 “더 좋아졌을 때만” 적용
  if (bad(fixed) <= bad(name)) return fixed;
  return name;
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});
