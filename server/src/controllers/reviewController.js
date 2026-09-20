import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
async function recalc(packageId) {
  const stats = await Review.aggregate([
    { $match: { package: packageId, published: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Package.findByIdAndUpdate(packageId, {
    rating: Number((stats[0]?.avg || 0).toFixed(1)),
    reviewCount: stats[0]?.count || 0,
  });
}
export async function listReviews(req, res) {
  res.json(
    await Review.find({ package: req.params.packageId, published: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 }),
  );
}
export async function createReview(req, res) {
  const { rating, comment, bookingId } = req.body;
  const booking = await Booking.findOne({
    user: req.user._id,
    _id: bookingId,
    package: req.params.packageId,
    status: 'COMPLETED',
  });
  if (!booking)
    return res
      .status(400)
      .json({ message: 'A completed booking is required to review this package' });
  if (await Review.exists({ booking: booking._id }))
    return res.status(409).json({ message: 'You already reviewed this booking' });
  const r = await Review.create({
    user: req.user._id,
    package: req.params.packageId,
    booking: booking._id,
    rating,
    comment,
  });
  await recalc(booking.package);
  res.status(201).json(await r.populate('user', 'name avatar'));
}
export async function adminReviews(req, res) {
  res.json(
    await Review.find()
      .populate('user', 'name email')
      .populate('package', 'title')
      .sort({ createdAt: -1 }),
  );
}
export async function moderateReview(req, res) {
  const r = await Review.findByIdAndUpdate(
    req.params.id,
    { published: req.body.published !== false },
    { new: true },
  );
  if (!r) return res.status(404).json({ message: 'Not found' });
  await recalc(r.package);
  res.json(r);
}
