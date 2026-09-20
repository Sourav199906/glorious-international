import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function Footer() {
  const [c, setC] = useState({});
  useEffect(() => {
    api
      .get('/content')
      .then((r) => setC(r.data))
      .catch(() => {});
  }, []);
  return (
    <footer className="mt-20 bg-white text-slate-600 border-t border-slate-200">
      <div className="container py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-slate-900 font-black text-xl">Glorious International</h3>
          <p className="mt-3">
            {c.footerText || 'Your trusted partner for flights, Hajj and global tours.'}
          </p>
        </div>
        <div>
          <h4 className="text-slate-900 font-bold">Contact</h4>
          <p className="mt-3">{c.address || 'Dewan Complex, Level-6, 60/E/1, Purana Paltan, Dhaka-1000., Dhaka, Bangladesh, 1000'}</p>
          <p>{c.contactPhone || '+880 1319-007620'}</p>
          <p>{c.contactEmail || 'gloriousinternational@gmail.com'}</p>
        </div>
        <div>
          <h4 className="text-slate-900 font-bold">Policies</h4>
          <a className="block mt-3" href="/terms">
            Terms & Conditions
          </a>
          <a className="block" href="/refund">
            Refund Policy
          </a>
        </div>
        <div>
          <h4 className="text-slate-900 font-bold">Explore</h4>
          <a className="block mt-3" href="/packages">
            Tour Packages
          </a>
          <a className="block" href="/hajj">
            Hajj Packages
          </a>
          <a className="block" href="/flights">
            Flights
          </a>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-sm">
        © {new Date().getFullYear()} Glorious International. All rights reserved.
      </div>
    </footer>
  );
}
