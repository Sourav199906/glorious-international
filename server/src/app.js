import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import passportRoutes from './routes/passportRoutes.js';
import { crudRoutes } from './routes/crudRoutes.js';
import Package from './models/Package.js';
import HajjPackage from './models/HajjPackage.js';
import Flight from './models/Flight.js';
import Gallery from './models/Gallery.js';
import News from './models/News.js';
import Accreditation from './models/Accreditation.js';
import { notFound, errorHandler } from './middleware/error.js';
export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }),
  );
  app.get('/api/health', (req, res) =>
    res.json({ ok: true, service: 'glorious-international-api' }),
  );
  app.use('/api/auth', authRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/passports', passportRoutes);
  app.use(
    '/api/packages',
    crudRoutes(Package, {
      publicFilter: { published: true },
      fields: [
        'title',
        'slug',
        'destination',
        'description',
        'images',
        'durationDays',
        'durationNights',
        'price',
        'currency',
        'included',
        'excluded',
        'itinerary',
        'featured',
        'published',
      ],
    }),
  );
  app.use(
    '/api/hajj',
    crudRoutes(HajjPackage, {
      publicFilter: { published: true },
      fields: [
        'title',
        'season',
        'description',
        'images',
        'durationDays',
        'price',
        'currency',
        'included',
        'itinerary',
        'published',
      ],
    }),
  );
  app.use(
    '/api/flights',
    crudRoutes(Flight, {
      publicFilter: { published: true },
      fields: [
        'airline',
        'flightNumber',
        'origin',
        'destination',
        'departure',
        'arrival',
        'cabin',
        'price',
        'currency',
        'seats',
        'published',
      ],
    }),
  );
  app.use(
    '/api/gallery',
    crudRoutes(Gallery, {
      publicFilter: { published: true },
      fields: ['title', 'imageUrl', 'category', 'description', 'published'],
    }),
  );
  app.use(
    '/api/news',
    crudRoutes(News, {
      publicFilter: { published: true },
      fields: ['title', 'slug', 'imageUrl', 'body', 'published', 'publishedAt'],
    }),
  );
  app.use(
    '/api/accreditations',
    crudRoutes(Accreditation, {
      publicFilter: { published: true },
      fields: [
        'organizationName',
        'certificateNumber',
        'logoUrl',
        'certificateImageUrl',
        'description',
        'published',
      ],
    }),
  );
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
