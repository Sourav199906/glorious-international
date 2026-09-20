import crypto from 'crypto';
import PassportDocument from '../models/PassportDocument.js';
import {
  savePassportPdf,
  readPassportPdf,
  deletePassportPdf,
} from '../services/passportStorageService.js';
import AuditLog from '../models/AuditLog.js';

export async function uploadPassport(req, res) {
  if (!req.file)
    return res.status(400).json({ message: 'Passport copy must be a PDF file (max 10 MB)' });
  if (!req.file.buffer.subarray(0, 5).toString().startsWith('%PDF-'))
    return res.status(400).json({ message: 'The uploaded file is not a valid PDF' });
  const storageKey = `passports/${req.user._id}/${crypto.randomUUID()}.pdf`;
  await savePassportPdf(req.file.buffer, storageKey);
  try {
    const doc = await PassportDocument.create({
      owner: req.user._id,
      storageKey,
      originalName: req.file.originalname,
      mimeType: 'application/pdf',
      size: req.file.size,
      status: 'TEMP',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.status(201).json({ fileId: doc._id, originalName: doc.originalName, size: doc.size });
  } catch (e) {
    await deletePassportPdf(storageKey).catch(() => {});
    throw e;
  }
}

export async function downloadPassport(req, res) {
  const b = req.booking;
  const i = Number(req.params.index);
  if (!Number.isInteger(i) || i < 0 || i >= b.travelers.length)
    return res.status(404).json({ message: 'Traveler not found' });
  const traveler = b.travelers[i];
  if (!traveler.passportFileId)
    return res.status(404).json({ message: 'Passport copy not available' });
  const doc = await PassportDocument.findOne({ _id: traveler.passportFileId, booking: b._id });
  if (!doc) return res.status(404).json({ message: 'Passport document not found' });
  const buffer = await readPassportPdf(doc.storageKey);
  await AuditLog.create({
    actor: req.user._id,
    action: 'VIEW_PASSPORT_COPY',
    entity: 'Booking',
    entityId: b._id.toString(),
    meta: { travelerIndex: i, documentId: doc._id.toString() },
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${doc.originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
  );
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
}

export async function cleanupExpiredPassports() {
  const docs = await PassportDocument.find({
    status: { $in: ['TEMP', 'RESERVED'] },
    expiresAt: { $lte: new Date() },
  }).limit(100);
  for (const d of docs) {
    try {
      await deletePassportPdf(d.storageKey);
      await d.deleteOne();
    } catch (e) {
      console.error('Passport cleanup failed', d._id, e.message);
    }
  }
  return docs.length;
}
export async function cleanupPassport(req, res) {
  res.json({ deleted: await cleanupExpiredPassports() });
}
