import multer from 'multer';
export const passportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    cb(null, file.mimetype === 'application/pdf' && /\.pdf$/i.test(file.originalname)),
});
