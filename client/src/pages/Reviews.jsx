import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function Reviews() {
  const [packages, setPackages] = useState([]),
    [reviews, setReviews] = useState({});
  useEffect(() => {
    api.get('/packages').then(async (r) => {
      setPackages(r.data);
      for (const p of r.data.slice(0, 6)) {
        const rr = await api.get(`/reviews/package/${p._id}`);
        setReviews((x) => ({ ...x, [p._id]: rr.data }));
      }
    });
  }, []);
  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">Traveler Reviews</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {packages.map((p) => (
          <div className="card p-6" key={p._id}>
            <h2 className="text-xl font-black">{p.title}</h2>
            <div className="text-amber-500 mt-2">
              {'★'.repeat(Math.round(p.rating || 0))}
              {'☆'.repeat(5 - Math.round(p.rating || 0))}
            </div>
            {(reviews[p._id] || []).slice(0, 3).map((r) => (
              <div className="border-t mt-4 pt-4" key={r._id}>
                <b>{r.user?.name}</b>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
