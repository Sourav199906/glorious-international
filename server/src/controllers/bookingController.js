import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import HajjPackage from '../models/HajjPackage.js';
import Flight from '../models/Flight.js';
import PassportDocument from '../models/PassportDocument.js';
import { bookingId } from '../utils/bookingId.js';
import { generateBookingPdf } from '../services/pdfService.js';
import { sendBookingConfirmation } from '../services/emailService.js';
import { encrypt } from '../utils/crypto.js';
import { initiatePayment, validatePayment } from '../services/paymentService.js';
import { env } from '../config/env.js';
import AuditLog from '../models/AuditLog.js';
function sanitize(b) {
  const o = b.toObject();
  o.travelers = o.travelers?.map((t) => ({
    ...t,
    passportNumber: '[protected]',
    passportFileId: undefined,
  }));
  return o;
}
export async function createBooking(req, res) {
  const {
    bookingType,
    packageId,
    hajjPackageId,
    flightId,
    travelers,
    travelDate,
    totalAmount,
    currency = 'BDT',
  } = req.body;
  if (!Array.isArray(travelers) || !travelers.length)
    return res.status(400).json({ message: 'At least one traveler is required' });
  if (travelers.some((t) => !t.passportFileId))
    return res.status(400).json({ message: 'A PDF passport copy is required for every traveler' });
  let source;
  if (bookingType === 'TOUR') source = await Package.findById(packageId);
  if (bookingType === 'HAJJ') source = await HajjPackage.findById(hajjPackageId);
  if (bookingType === 'FLIGHT') source = await Flight.findById(flightId);
  if (!source) return res.status(404).json({ message: 'Selected travel product not found' });
  const expected =
    bookingType === 'FLIGHT'
      ? Number(source.price || 0)
      : Number(source.price || 0) * travelers.length;
  if (Math.abs(Number(totalAmount) - expected) > 0.01)
    return res.status(400).json({ message: 'Invalid booking amount' });
  const ids = travelers.map((t) => t.passportFileId);
  if (new Set(ids.map(String)).size !== ids.length)
    return res.status(400).json({ message: 'Each traveler must have a unique passport upload' });
  const now = new Date();
  const docs = await PassportDocument.find({
    _id: { $in: ids },
    owner: req.user._id,
    status: 'TEMP',
    expiresAt: { $gt: now },
  });
  if (docs.length !== ids.length)
    return res.status(400).json({ message: 'One or more passport uploads are invalid or expired' });
  const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const reserved = await PassportDocument.updateMany(
    { _id: { $in: ids }, owner: req.user._id, status: 'TEMP', expiresAt: { $gt: new Date() } },
    { $set: { status: 'RESERVED', expiresAt: reservationExpiresAt } },
  );
  if (reserved.modifiedCount !== ids.length) {
    await PassportDocument.updateMany(
      {
        _id: { $in: ids },
        owner: req.user._id,
        status: 'RESERVED',
        expiresAt: reservationExpiresAt,
      },
      { $set: { status: 'TEMP', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
    );
    return res
      .status(409)
      .json({
        message: 'One or more passport uploads are already being used. Please upload again.',
      });
  }
  try {
    const safeTravelers = travelers.map((t) => ({
      ...t,
      passportNumber: encrypt(t.passportNumber),
    }));
    const b = await Booking.create({
      confirmationNumber: bookingId(),
      user: req.user._id,
      bookingType,
      package: packageId,
      hajjPackage: hajjPackageId,
      flight: flightId,
      travelers: safeTravelers,
      travelDate,
      totalAmount: expected,
      currency,
    });
    const claimed = await PassportDocument.updateMany(
      {
        _id: { $in: ids },
        owner: req.user._id,
        status: 'RESERVED',
        expiresAt: reservationExpiresAt,
      },
      { $set: { booking: b._id, status: 'CLAIMED', expiresAt: null } },
    );
    if (claimed.modifiedCount !== ids.length) {
      await PassportDocument.updateMany(
        { _id: { $in: ids }, owner: req.user._id, status: 'CLAIMED', booking: b._id },
        {
          $set: {
            status: 'TEMP',
            booking: null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      );
      await b.deleteOne();
      return res
        .status(409)
        .json({ message: 'Passport reservation could not be completed. Please try again.' });
    }
    res.status(201).json(sanitize(await b.populate('package hajjPackage flight')));
  } catch (e) {
    await PassportDocument.updateMany(
      {
        _id: { $in: ids },
        owner: req.user._id,
        status: 'RESERVED',
        expiresAt: reservationExpiresAt,
      },
      { $set: { status: 'TEMP', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
    );
    throw e;
  }
}

export async function myBookings(req, res) {
  const bs = await Booking.find({ user: req.user._id })
    .populate('package hajjPackage flight')
    .sort({ createdAt: -1 });
  res.json(bs.map(sanitize));
}
export async function allBookings(req, res) {
  const bs = await Booking.find()
    .populate('user package hajjPackage flight')
    .sort({ createdAt: -1 });
  res.json(bs.map(sanitize));
}
export async function getBooking(req, res) {
  const b = await Booking.findById(req.params.id).populate('user package hajjPackage flight');
  if (!b) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'USER' && String(b.user._id) !== String(req.user._id))
    return res.status(403).json({ message: 'Forbidden' });
  res.json(sanitize(b));
}
export async function startPayment(req, res) {
  const b = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  if (b.status !== 'PENDING') return res.status(400).json({ message: 'Booking is not payable' });
  const u = req.user;
  const base = env.clientUrl.replace(/\/$/, '');
  const data = await initiatePayment({
    booking: b,
    customer: u,
    successUrl: `${env.publicApiUrl}/api/payments/success`,
    failUrl: `${env.publicApiUrl}/api/payments/fail`,
    cancelUrl: `${env.publicApiUrl}/api/payments/cancel`,
    ipnUrl: `${env.publicApiUrl}/api/payments/ipn`,
  });
  b.paymentStatus = 'INITIATED';
  b.paymentSessionKey = data.sessionkey;
  await b.save();
  res.json({ url: data.GatewayPageURL, sessionKey: data.sessionkey });
}
export async function paymentIpn(req, res) {
  try {
    const { tran_id, val_id, status } = req.body;
    const b = await Booking.findOne({ confirmationNumber: tran_id });
    if (!b) return res.status(404).send('UNKNOWN_TRANSACTION');
    if (status && ['FAILED', 'CANCELLED', 'EXPIRED', 'UNATTEMPTED'].includes(status)) {
      b.paymentStatus = status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      await b.save();
      return res.send('OK');
    }
    if (status !== 'VALID' || !val_id) return res.status(400).send('INVALID');
    const validation = await validatePayment(val_id);
    if (
      !validation ||
      !['VALID', 'VALIDATED'].includes(validation.status) ||
      Number(validation.amount) !== Number(b.totalAmount) ||
      String(validation.currency) !== String(b.currency) ||
      String(validation.tran_id || tran_id) !== String(b.confirmationNumber)
    )
      return res.status(400).send('INVALID');
    b.paymentTransactionId = tran_id;
    b.paymentValidationId = val_id;
    b.paymentStatus = 'PAID';
    await b.save();
    res.send('OK');
  } catch (e) {
    res.status(500).send('ERROR');
  }
}

async function handleGatewayReturn(req, res, outcome) {
  try {
    const tranId = req.body?.tran_id || req.query?.tran_id;
    const valId = req.body?.val_id || req.query?.val_id;
    const b = tranId ? await Booking.findOne({ confirmationNumber: tranId }) : null;
    if (!b) return res.redirect(`${env.clientUrl}/payment/fail`);
    if (outcome === 'success' && valId) {
      const validation = await validatePayment(valId);
      if (
        validation &&
        ['VALID', 'VALIDATED'].includes(validation.status) &&
        Number(validation.amount) === Number(b.totalAmount) &&
        String(validation.currency) === String(b.currency)
      ) {
        b.paymentStatus = 'PAID';
        b.paymentTransactionId = tranId;
        b.paymentValidationId = valId;
        await b.save();
        return res.redirect(
          `${env.clientUrl}/payment/success?booking=${encodeURIComponent(b._id)}`,
        );
      }
    }
    if (outcome === 'fail') b.paymentStatus = 'FAILED';
    if (outcome === 'cancel') b.paymentStatus = 'CANCELLED';
    await b.save();
    return res.redirect(`${env.clientUrl}/payment/${outcome}?booking=${encodeURIComponent(b._id)}`);
  } catch {
    return res.redirect(`${env.clientUrl}/payment/fail`);
  }
}
export async function paymentSuccess(req, res) {
  return handleGatewayReturn(req, res, 'success');
}
export async function paymentFail(req, res) {
  return handleGatewayReturn(req, res, 'fail');
}
export async function paymentCancel(req, res) {
  return handleGatewayReturn(req, res, 'cancel');
}

export async function confirmBooking(req, res) {
  const b = await Booking.findById(req.params.id).populate('user package hajjPackage flight');
  if (!b) return res.status(404).json({ message: 'Not found' });
  if (b.paymentStatus !== 'PAID' && env.nodeEnv === 'production')
    return res.status(400).json({ message: 'Payment must be validated before confirmation' });
  b.status = 'CONFIRMED';
  b.confirmedAt = new Date();
  const file = await generateBookingPdf(b);
  b.pdfPath = file;
  await b.save();
  await AuditLog.create({
    actor: req.user._id,
    action: 'CONFIRM_BOOKING',
    entity: 'Booking',
    entityId: b._id.toString(),
    meta: { confirmationNumber: b.confirmationNumber },
  });
  await sendBookingConfirmation({ to: b.user.email, name: b.user.name, booking: b, pdfPath: file });
  res.json({ booking: sanitize(b), message: 'Booking confirmed and PDF/email workflow completed' });
}
export async function cancelBooking(req, res) {
  const existing = await Booking.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const b = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      paymentStatus: existing.paymentStatus === 'PAID' ? 'REFUNDED' : 'CANCELLED',
    },
    { new: true },
  );
  if (!b) return res.status(404).json({ message: 'Not found' });
  res.json(sanitize(b));
}
export async function downloadPdf(req, res) {
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  if (req.user.role === 'USER' && String(b.user) !== String(req.user._id))
    return res.status(403).json({ message: 'Forbidden' });
  let file = b.pdfPath;
  if (!file) {
    const populated = await Booking.findById(b._id).populate('user package hajjPackage flight');
    file = await generateBookingPdf(populated);
    b.pdfPath = file;
    await b.save();
  }
  return res.download(file, `${b.confirmationNumber}.pdf`);
}
