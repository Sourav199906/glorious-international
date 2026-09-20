import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
export async function generateBookingPdf(booking) {
  const dir = path.resolve('storage/pdfs');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${booking.confirmationNumber}.pdf`);
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(file);
    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.pipe(stream);
    doc.fontSize(22).text('GLORIOUS INTERNATIONAL', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text('BOOKING CONFIRMATION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Confirmation: ${booking.confirmationNumber}`);
    doc.text(`Customer: ${booking.user?.name || ''}`);
    doc.text(`Email: ${booking.user?.email || ''}`);
    doc.text(`Booking type: ${booking.bookingType}`);
    doc.text(
      `Travel date: ${booking.travelDate ? new Date(booking.travelDate).toDateString() : 'Not specified'}`,
    );
    doc.text(`Travelers: ${booking.travelers?.length || 0}`);
    doc.text(`Total: ${booking.currency} ${booking.totalAmount || 0}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();
    doc.text('Thank you for choosing Glorious International.');
    doc.end();
  });
  return file;
}
