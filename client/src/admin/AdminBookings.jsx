import { useEffect, useState } from 'react';
import { api, downloadPassport } from '../services/api.js';
export default function AdminBookings() {
  const [items, setItems] = useState([]),
    [busy, setBusy] = useState('');
  async function load() {
    setItems((await api.get('/bookings')).data);
  }
  useEffect(() => {
    load();
  }, []);
  async function confirm(id) {
    setBusy(id);
    try {
      await api.patch(`/bookings/${id}/confirm`);
      await load();
    } finally {
      setBusy('');
    }
  }
  async function viewPassport(id, index) {
    setBusy(`${id}-${index}`);
    try {
      const r = await downloadPassport(id, index);
      const url = URL.createObjectURL(r.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <h1 className="text-4xl font-black">Bookings</h1>
      <div className="mt-8 space-y-3">
        {items.map((b) => (
          <div className="card p-5" key={b._id}>
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <b>{b.confirmationNumber}</b>
                <div>
                  {b.user?.name} — {b.package?.title || b.hajjPackage?.title || b.bookingType}
                </div>
                <span className="text-sm text-slate-500">
                  {b.status} · {b.paymentStatus}
                </span>
              </div>
              {b.status === 'PENDING' && (
                <button
                  className="btn btn-primary"
                  disabled={busy === b._id}
                  onClick={() => confirm(b._id)}
                >
                  {busy === b._id ? 'Confirming…' : 'Confirm + Email PDF'}
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {b.travelers?.map((_, i) => (
                <button
                  key={i}
                  className="btn text-sm"
                  disabled={busy === `${b._id}-${i}`}
                  onClick={() => viewPassport(b._id, i)}
                >
                  View passport — Traveler {i + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
