import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function AdminReviews() {
  const [items, setItems] = useState([]);
  async function load() {
    setItems((await api.get('/reviews/admin/all')).data);
  }
  useEffect(() => {
    load();
  }, []);
  async function moderate(id, published) {
    await api.patch(`/reviews/admin/${id}`, { published });
    load();
  }
  return (
    <div>
      <h1 className="text-4xl font-black">Reviews</h1>
      <div className="mt-8 space-y-4">
        {items.map((r) => (
          <div className="card p-5" key={r._id}>
            <div className="flex justify-between">
              <b>{r.user?.name}</b>
              <span>{'★'.repeat(r.rating)}</span>
            </div>
            <div className="text-sm text-slate-500">{r.package?.title}</div>
            <p className="mt-3">{r.comment}</p>
            <div className="mt-4 flex gap-2">
              {!r.published && (
                <button className="btn btn-primary" onClick={() => moderate(r._id, true)}>
                  Publish
                </button>
              )}{' '}
              {r.published && (
                <button className="btn text-red-600" onClick={() => moderate(r._id, false)}>
                  Hide
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
