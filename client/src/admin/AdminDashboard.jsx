import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
export default function AdminDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get('/analytics/overview').then((r) => setD(r.data));
  }, []);
  if (!d) return <div>Loading...</div>;
  return (
    <>
      <h1 className="text-4xl font-black">Analytics</h1>
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        {[
          ['Users', d.users],
          ['Bookings', d.bookings],
          ['Confirmed', d.confirmed],
          ['Revenue', `৳${Number(d.revenue).toLocaleString()}`],
        ].map((x) => (
          <div className="card p-5" key={x[0]}>
            <div className="text-slate-500">{x[0]}</div>
            <div className="text-3xl font-black mt-2">{x[1]}</div>
          </div>
        ))}
      </div>
      <div className="card p-6 mt-8 h-80">
        <h2 className="font-black mb-4">Popular packages</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={d.popular}>
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
