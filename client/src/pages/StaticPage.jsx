import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function StaticPage({ field, title }) {
  const [c, setC] = useState({});
  useEffect(() => {
    api.get('/content').then((r) => setC(r.data));
  }, []);
  return (
    <main className="container py-14 max-w-4xl">
      <h1 className="text-4xl font-black">{title}</h1>
      <div className="prose max-w-none mt-8 whitespace-pre-wrap text-slate-700">
        {c[field] || 'Content will be updated by Glorious International administration.'}
      </div>
    </main>
  );
}
