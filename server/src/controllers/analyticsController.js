import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
export async function overview(req, res) {
  const [users, bookings, confirmed, revenue, popular] = await Promise.all([
    User.countDocuments({ role: 'USER' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'CONFIRMED' }),
    Booking.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.aggregate([
      { $match: { package: { $ne: null } } },
      { $group: { _id: '$package', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } },
      { $unwind: '$package' },
      { $project: { count: 1, title: '$package.title' } },
    ]),
  ]);
  res.json({ users, bookings, confirmed, revenue: revenue[0]?.total || 0, popular });
}
