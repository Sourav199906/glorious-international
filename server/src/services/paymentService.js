import axios from 'axios';
import { env } from '../config/env.js';
const base = env.sslcommerz.sandbox
  ? 'https://sandbox-gw.sslcommerz.com'
  : 'https://securepay.sslcommerz.com';
const validator = env.sslcommerz.sandbox
  ? 'https://sandbox.sslcommerz.com'
  : 'https://securepay.sslcommerz.com';
export const paymentConfigured = Boolean(env.sslcommerz.storeId && env.sslcommerz.storePassword);
export async function initiatePayment({
  booking,
  customer,
  successUrl,
  failUrl,
  cancelUrl,
  ipnUrl,
}) {
  if (!paymentConfigured)
    throw Object.assign(new Error('SSLCOMMERZ is not configured'), { status: 503 });
  const params = new URLSearchParams({
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: String(booking.totalAmount),
    currency: booking.currency || 'BDT',
    tran_id: booking.confirmationNumber,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
    ipn_url: ipnUrl,
    product_name: 'Glorious International Travel Booking',
    product_category: booking.bookingType,
    shipping_method: 'NO',
    cus_name: customer.name,
    cus_email: customer.email,
    cus_add1: customer.address || 'Bangladesh',
    cus_phone: customer.phone || '',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    product_profile: 'general',
  });
  const { data } = await axios.post(`${base}/gwprocess/v4/api.php`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (data.status !== 'SUCCESS')
    throw Object.assign(new Error(data.failedreason || 'Payment initialization failed'), {
      status: 502,
    });
  return data;
}
export async function validatePayment(valId) {
  if (!paymentConfigured)
    throw Object.assign(new Error('SSLCOMMERZ is not configured'), { status: 503 });
  const { data } = await axios.get(`${validator}/validator/api/validationserverAPI.php`, {
    params: {
      val_id: valId,
      store_id: env.sslcommerz.storeId,
      store_passwd: env.sslcommerz.storePassword,
      format: 'json',
    },
  });
  return data;
}
