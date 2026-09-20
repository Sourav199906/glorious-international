import multer from 'multer';
export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Maximum allowed size is 10 MB.'
        : err.message;
    return res.status(400).json({ message });
  }
  if (
    err?.status === 400 ||
    err?.status === 401 ||
    err?.status === 403 ||
    err?.status === 404 ||
    err?.status === 409 ||
    err?.status === 422 ||
    err?.status === 502 ||
    err?.status === 503
  )
    return res.status(err.status).json({ message: err.message || 'Request failed' });
  res.status(500).json({ message: 'Server error' });
}
