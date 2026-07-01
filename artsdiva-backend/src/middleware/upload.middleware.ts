import multer from "multer";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Memory storage: files are buffered in memory then handed to
// upload.service.ts, never written to local disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
