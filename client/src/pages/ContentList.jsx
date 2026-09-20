import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function ContentList({ type, title }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get(`/${type}`).then((r) => setItems(r.data));
  }, [type]);
  return (
    <main className="container py-14">
      <h1 className="text-4xl font-black">{title}</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {items.map((x) => (
          <div className="card p-5" key={x._id}>
            <h3 className="font-black text-xl">{x.title || x.organizationName}</h3>
            <p className="text-slate-600 mt-2">{x.body || x.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
