import { Router } from 'express';
import {
  paymentIpn,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from '../controllers/bookingController.js';
const r = Router();
r.post('/ipn', paymentIpn);
r.all('/success', paymentSuccess);
r.all('/fail', paymentFail);
r.all('/cancel', paymentCancel);
export default r;
