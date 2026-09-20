import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function Dashboard() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    load();
  }, []);
  async function load() {
    setItems((await api.get('/bookings/my')).data);
  }
  async function pay(id) {
    const r = await api.post(`/bookings/${id}/pay`);
    window.location.href = r.data.url;
  }
  async function download(id, name) {
    const r = await api.get(`/bookings/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="container py-12">
      <h1 className="text-4xl font-black">My bookings</h1>
      <div className="mt-8 space-y-4">
        {items.map((b) => (
          <div className="card p-5 flex flex-wrap justify-between gap-4" key={b._id}>
            <div>
              <b>{b.confirmationNumber}</b>
              <div>
                {b.package?.title ||
                  b.hajjPackage?.title ||
                  `${b.flight?.origin || ''} → ${b.flight?.destination || ''}`}
              </div>
              <div className="text-sm text-slate-500">
                Booking: {b.status} · Payment: {b.paymentStatus}
              </div>
            </div>
            <div className="flex gap-2">
              {b.status === 'PENDING' && b.paymentStatus !== 'PAID' && (
                <button className="btn btn-primary" onClick={() => pay(b._id)}>
                  Pay Now
                </button>
              )}
              {b.pdfPath && (
                <button className="btn" onClick={() => download(b._id, b.confirmationNumber)}>
                  Download PDF
                </button>
              )}
            </div>
          </div>
        ))}
        {!items.length && <div className="text-slate-500">No bookings yet.</div>}
      </div>
    </main>
  );
}
