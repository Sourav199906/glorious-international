import multer from 'multer';
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)),
});

// Larger, wider-format upload for background animations (hero video/GIF).
// Kept separate from `upload` above so ordinary image uploads (packages,
// gallery, etc.) keep their tight 5MB / static-image-only limits.
export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^(image\/gif|video\/(mp4|webm))$/.test(file.mimetype)),
});
