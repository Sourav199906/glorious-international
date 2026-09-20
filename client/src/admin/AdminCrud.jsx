import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
const configs = {
  packages: {
    fields: [
      ['title', 'Title', 'text'],
      ['slug', 'Slug', 'text'],
      ['destination', 'Destination', 'text'],
      ['description', 'Description', 'textarea'],
      ['price', 'Price', 'number'],
      ['currency', 'Currency', 'text'],
      ['durationDays', 'Days', 'number'],
      ['durationNights', 'Nights', 'number'],
      ['images', 'Image URLs (one per line)', 'lines'],
      ['included', 'Included (one per line)', 'lines'],
      ['excluded', 'Excluded (one per line)', 'lines'],
      ['featured', 'Featured', 'checkbox'],
      ['published', 'Published', 'checkbox'],
      ['itinerary', 'Itinerary (one per line: Day | Title | Description)', 'itinerary'],
    ],
  },
  hajj: {
    fields: [
      ['title', 'Title', 'text'],
      ['season', 'Season', 'text'],
      ['description', 'Description', 'textarea'],
      ['price', 'Price', 'number'],
      ['currency', 'Currency', 'text'],
      ['durationDays', 'Duration days', 'number'],
      ['images', 'Image URLs (one per line)', 'lines'],
      ['included', 'Included (one per line)', 'lines'],
      ['itinerary', 'Itinerary (one per line: Day | Title | Description)', 'itinerary'],
      ['published', 'Published', 'checkbox'],
    ],
  },
  flights: {
    fields: [
      ['airline', 'Airline', 'text'],
      ['flightNumber', 'Flight number', 'text'],
      ['origin', 'Origin', 'text'],
      ['destination', 'Destination', 'text'],
      ['departure', 'Departure', 'datetime-local'],
      ['arrival', 'Arrival', 'datetime-local'],
      ['cabin', 'Cabin', 'text'],
      ['price', 'Price', 'number'],
      ['currency', 'Currency', 'text'],
      ['seats', 'Seats', 'number'],
      ['published', 'Published', 'checkbox'],
    ],
  },
  gallery: {
    fields: [
      ['title', 'Title', 'text'],
      ['imageUrl', 'Image URL', 'text'],
      ['category', 'Category', 'text'],
      ['description', 'Description', 'textarea'],
      ['published', 'Published', 'checkbox'],
    ],
  },
  news: {
    fields: [
      ['title', 'Title', 'text'],
      ['slug', 'Slug', 'text'],
      ['imageUrl', 'Image URL', 'text'],
      ['body', 'Article', 'textarea'],
      ['publishedAt', 'Publish date', 'datetime-local'],
      ['published', 'Published', 'checkbox'],
    ],
  },
  accreditations: {
    fields: [
      ['organizationName', 'Organization', 'text'],
      ['certificateNumber', 'Certificate number', 'text'],
      ['logoUrl', 'Logo URL', 'text'],
      ['certificateImageUrl', 'Certificate image URL', 'text'],
      ['description', 'Description', 'textarea'],
      ['published', 'Published', 'checkbox'],
    ],
  },
};
function blank(type) {
  const o = {};
  for (const [k, , t] of configs[type].fields) o[k] = t === 'checkbox' ? true : '';
  return o;
}
function normalize(form) {
  const o = { ...form };
  for (const [k, , t] of configs.current || []) {
  }
  return o;
}
export default function AdminCrud({ type, title }) {
  const cfg = configs[type],
    [items, setItems] = useState([]),
    [form, setForm] = useState(blank(type)),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false);
  async function load() {
    setItems((await api.get(`/${type}/admin/all`)).data);
  }
  useEffect(() => {
    load();
  }, [type]);
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = { ...form };
      for (const [k, , t] of cfg.fields) {
        if (t === 'lines')
          data[k] = String(data[k] || '')
            .split('\n')
            .map((x) => x.trim())
            .filter(Boolean);
        if (t === 'itinerary')
          data[k] = String(data[k] || '')
            .split('\n')
            .map((x) => x.trim())
            .filter(Boolean)
            .map((line) => {
              const [day, title, ...rest] = line.split('|').map((x) => x.trim());
              return { day: Number(day), title, description: rest.join(' | ') };
            })
            .filter((x) => Number.isFinite(x.day) && x.title);
        if (t === 'number' && data[k] !== '') data[k] = Number(data[k]);
        if (t === 'datetime-local' && data[k]) data[k] = new Date(data[k]).toISOString();
      }
      if (editing) await api.put(`/${type}/${editing}`, data);
      else await api.post(`/${type}`, data);
      setForm(blank(type));
      setEditing(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  }
  function edit(x) {
    const f = { ...blank(type), ...x };
    for (const [k, , t] of cfg.fields) {
      if (t === 'lines') f[k] = (x[k] || []).join('\n');
      if (t === 'itinerary')
        f[k] = (x[k] || []).map((i) => `${i.day} | ${i.title} | ${i.description || ''}`).join('\n');
      if (t === 'datetime-local' && f[k]) f[k] = new Date(f[k]).toISOString().slice(0, 16);
    }
    if (f.published === undefined) f.published = true;
    setForm(f);
    setEditing(x._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function del(id) {
    if (confirm('Delete this item?')) {
      await api.delete(`/${type}/${id}`);
      load();
    }
  }
  async function upload(k, file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', type);
    const r = await api.post('/uploads/image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set(k, r.data.url);
  }
  async function uploadMany(k, files) {
    const urls = [];
    for (const file of Array.from(files || [])) {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', type);
      const r = await api.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      urls.push(r.data.url);
    }
    set(
      k,
      [
        ...(Array.isArray(form[k])
          ? form[k]
          : String(form[k] || '')
              .split('\n')
              .map((x) => x.trim())
              .filter(Boolean)),
        ...urls,
      ].join('\n'),
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black">{title}</h1>
        {editing && (
          <button
            className="btn"
            onClick={() => {
              setEditing(null);
              setForm(blank(type));
            }}
          >
            Cancel edit
          </button>
        )}
      </div>
      <form onSubmit={save} className="card p-6 mt-8 grid md:grid-cols-2 gap-5">
        {cfg.fields.map(([k, label, t]) => (
          <div
            className={
              t === 'textarea' || t === 'lines' || t === 'itinerary' ? 'md:col-span-2' : ''
            }
            key={k}
          >
            <label className="font-bold text-sm">{label}</label>
            {t === 'checkbox' ? (
              <input
                className="ml-3"
                type="checkbox"
                checked={!!form[k]}
                onChange={(e) => set(k, e.target.checked)}
              />
            ) : t === 'textarea' || t === 'lines' || t === 'itinerary' ? (
              <textarea
                className="input min-h-28"
                value={form[k] || ''}
                onChange={(e) => set(k, e.target.value)}
              />
            ) : (
              <input
                className="input"
                type={t}
                value={form[k] || ''}
                onChange={(e) => set(k, e.target.value)}
              />
            )}{' '}
            {['imageUrl', 'logoUrl', 'certificateImageUrl'].includes(k) && (
              <>
                <input
                  className="mt-2 text-sm"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => e.target.files[0] && upload(k, e.target.files[0])}
                />
              </>
            )}{' '}
            {k === 'images' && (
              <input
                className="mt-2 text-sm"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => uploadMany(k, e.target.files)}
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2">
          <button disabled={busy} className="btn btn-primary">
            {busy ? 'Saving…' : editing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
      <div className="mt-8 space-y-3">
        {items.map((x) => (
          <div className="card p-5 flex justify-between items-center gap-4" key={x._id}>
            <div>
              <b>{x.title || x.organizationName || x.airline || 'Item'}</b>
              <div className="text-sm text-slate-500">
                {x.destination || x.season || x.category || ''}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn" onClick={() => edit(x)}>
                Edit
              </button>
              <button className="btn text-red-600" onClick={() => del(x._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
