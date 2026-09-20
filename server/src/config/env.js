import 'dotenv/config';
const required = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'TRAVELER_ENCRYPTION_KEY',
  'PASSPORT_FILE_ENCRYPTION_KEY',
  'CLIENT_URL',
  'PUBLIC_API_URL',
];
if (process.env.NODE_ENV === 'production') {
  for (const k of required)
    if (!process.env[k]) throw new Error(`Missing environment variable: ${k}`);
  for (const k of ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'])
    if (!process.env[k])
      throw new Error(`Missing production private-document storage variable: ${k}`);
  if (Buffer.byteLength(process.env.TRAVELER_ENCRYPTION_KEY, 'utf8') !== 32)
    throw new Error('TRAVELER_ENCRYPTION_KEY must be exactly 32 bytes in production');
  if (Buffer.byteLength(process.env.PASSPORT_FILE_ENCRYPTION_KEY, 'utf8') !== 32)
    throw new Error('PASSPORT_FILE_ENCRYPTION_KEY must be exactly 32 bytes in production');
}
export const env = {
  port: Number(process.env.PORT || 5000),
  publicApiUrl: process.env.PUBLIC_API_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glorious_international',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-change-me',
  accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  cookieName: 'gi_refresh',
  nodeEnv: process.env.NODE_ENV || 'development',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  travelerKey: process.env.TRAVELER_ENCRYPTION_KEY || '01234567890123456789012345678901',
  passportFileKey: Buffer.from(
    process.env.PASSPORT_FILE_ENCRYPTION_KEY || '01234567890123456789012345678901',
  ).subarray(0, 32),
  privateFileDir: process.env.PRIVATE_FILE_DIR || './private-data',
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD,
    sandbox: process.env.SSLCOMMERZ_SANDBOX !== 'false',
  },
};
