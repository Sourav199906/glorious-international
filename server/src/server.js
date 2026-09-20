import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { cleanupExpiredPassports } from './controllers/passportController.js';
await connectDB();
const app = createApp();
app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
export default app;

setInterval(
  () => cleanupExpiredPassports().catch((e) => console.error('Passport cleanup error', e.message)),
  60 * 60 * 1000,
).unref();
