import { uploadImage, uploadMedia } from '../services/storageService.js';
export async function image(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Image file is required' });
  const r = await uploadImage(req.file, `glorious-international/${req.body.folder || 'general'}`);
  res.status(201).json(r);
}
export async function media(req, res) {
  if (!req.file) return res.status(400).json({ message: 'A video or GIF file is required' });
  const r = await uploadMedia(req.file);
  res.status(201).json(r);
}
