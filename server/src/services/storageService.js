import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
let ready = false;
if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  ready = true;
}
export async function uploadImage(file, folder = 'glorious-international') {
  if (!ready) throw Object.assign(new Error('Cloudinary is not configured'), { status: 503 });
  return new Promise((resolve, reject) => {
    const s = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, r) =>
      err
        ? reject(err)
        : resolve({ url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height }),
    );
    s.end(file.buffer);
  });
}
export async function deleteImage(publicId) {
  if (ready && publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

// Handles GIF and MP4/WebM uploads for the admin-configurable hero
// background animation. resource_type 'auto' lets Cloudinary pick video vs
// image correctly instead of us guessing from the mimetype.
export async function uploadMedia(file, folder = 'glorious-international/hero') {
  if (!ready) throw Object.assign(new Error('Cloudinary is not configured'), { status: 503 });
  const isVideo = /^video\//.test(file.mimetype);
  return new Promise((resolve, reject) => {
    const s = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (err, r) =>
      err
        ? reject(err)
        : resolve({
            url: r.secure_url,
            publicId: r.public_id,
            type: isVideo ? 'video' : 'gif',
          }),
    );
    s.end(file.buffer);
  });
}
export async function deleteMedia(publicId, type = 'image') {
  if (ready && publicId)
    await cloudinary.uploader.destroy(publicId, {
      resource_type: type === 'video' ? 'video' : 'image',
    });
}
