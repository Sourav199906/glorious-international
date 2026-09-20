import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import PackageCard from '../components/PackageCard.jsx';
export default function ListPage({ type = 'packages' }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    api.get(`/${type}`).then((r) => setItems(r.data));
  }, [type]);
  const filtered = items.filter(
    (x) =>
      (x.title || x.airline || '').toLowerCase().includes(q.toLowerCase()) ||
      (x.destination || '').toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">
        {type === 'hajj' ? 'Hajj Packages' : type === 'flights' ? 'Flights' : 'Tour Packages'}
      </h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        className="mt-6 w-full border rounded-xl p-3"
      />
      {type === 'packages' || type === 'hajj' ? (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {filtered.map((p) => (
            <PackageCard key={p._id} p={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((f) => (
            <div className="card p-5 flex flex-wrap justify-between gap-4" key={f._id}>
              <div>
                <b>
                  {f.airline} {f.flightNumber}
                </b>
                <div>
                  {f.origin} → {f.destination}
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(f.departure).toLocaleString()}
                </div>
              </div>
              <div className="font-black text-xl">৳{Number(f.price || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
