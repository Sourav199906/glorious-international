import nodemailer from 'nodemailer';
const configured = process.env.SMTP_HOST && process.env.SMTP_USER;
const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;
export async function sendBookingConfirmation({ to, name, booking, pdfPath }) {
  if (!transporter) {
    console.warn('SMTP not configured; email skipped');
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Booking ${booking.confirmationNumber} confirmed`,
    text: `Hello ${name}, your booking ${booking.confirmationNumber} is confirmed. The PDF confirmation is attached.`,
    attachments: [{ filename: `${booking.confirmationNumber}.pdf`, path: pdfPath }],
  });
}
