import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyTraveler = () => ({
  name: '',
  passportNumber: '',
  dateOfBirth: '',
  nationality: '',
  passportFileId: '',
  passportFileName: '',
  uploading: false,
});

export default function PackageDetails() {
  const { id } = useParams(),
    nav = useNavigate(),
    { user } = useAuth();
  const [p, setP] = useState(null),
    [travelerCount, setTravelerCount] = useState(1),
    [form, setForm] = useState({ travelDate: '', travelers: [emptyTraveler()] }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    api
      .get(`/packages/${id}`)
      .then((r) => setP(r.data))
      .catch(() => setError('Could not load this package.'));
  }, [id]);
  const total = useMemo(
    () => Number(p?.price || 0) * form.travelers.length,
    [p, form.travelers.length],
  );
  if (!p) return <div className="container py-20">{error || 'Loading...'}</div>;

  function resizeTravelers(n) {
    setTravelerCount(n);
    setForm((f) => ({
      ...f,
      travelers: Array.from({ length: n }, (_, i) => f.travelers[i] || emptyTraveler()),
    }));
  }
  function updateTraveler(i, key, value) {
    setForm((f) => {
      const travelers = [...f.travelers];
      travelers[i] = { ...travelers[i], [key]: value };
      return { ...f, travelers };
    });
  }
  async function uploadPassport(i, file) {
    if (!file) return;
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf'))
      return setError(`Traveler ${i + 1}: passport copy must be a PDF.`);
    if (file.size > 10 * 1024 * 1024)
      return setError(`Traveler ${i + 1}: passport PDF must be 10 MB or smaller.`);
    setError('');
    updateTraveler(i, 'uploading', true);
    try {
      const fd = new FormData();
      fd.append('passport', file);
      const r = await api.post('/passports/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => {
        const travelers = [...f.travelers];
        travelers[i] = {
          ...travelers[i],
          passportFileId: r.data.fileId,
          passportFileName: r.data.originalName,
          uploading: false,
        };
        return { ...f, travelers };
      });
    } catch (e) {
      updateTraveler(i, 'uploading', false);
      setError(e.response?.data?.message || 'Passport upload failed. Please try again.');
    }
  }
  async function book() {
    if (!user) return nav('/login');
    if (!form.travelDate) return setError('Please choose a travel date.');
    for (let i = 0; i < form.travelers.length; i++) {
      const t = form.travelers[i];
      if (!t.name || !t.passportNumber || !t.nationality)
        return setError(`Please complete all required information for Traveler ${i + 1}.`);
      if (!t.passportFileId)
        return setError(`Please upload a PDF passport copy for Traveler ${i + 1}.`);
    }
    setBusy(true);
    setError('');
    try {
      const created = await api.post('/bookings', {
        bookingType: 'TOUR',
        packageId: p._id,
        travelDate: form.travelDate,
        travelers: form.travelers.map(
          ({ name, passportNumber, dateOfBirth, nationality, passportFileId }) => ({
            name,
            passportNumber,
            dateOfBirth,
            nationality,
            passportFileId,
          }),
        ),
        totalAmount: total,
        currency: p.currency,
      });
      const payment = await api.post(`/bookings/${created.data._id}/pay`);
      if (payment.data?.url) {
        window.location.assign(payment.data.url);
        return;
      }
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Booking could not be submitted.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container py-10">
      <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-8 items-start">
        <section>
          <div className="rounded-[28px] overflow-hidden bg-slate-200 h-[430px] shadow-sm">
            {p.images?.[0] && (
              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="mt-7">
            <p className="text-emerald-700 font-bold">{p.destination}</p>
            <h1 className="text-4xl font-black mt-2 tracking-tight">{p.title}</h1>
            <p className="mt-4 text-slate-600 leading-7">{p.description}</p>
            <div className="text-3xl font-black mt-6">
              ৳{Number(p.price).toLocaleString()}{' '}
              <span className="text-base font-medium text-slate-500">/ person</span>
            </div>
          </div>
          <section className="mt-12">
            <h2 className="text-2xl font-black">Itinerary</h2>
            <div className="mt-5 space-y-3">
              {p.itinerary?.map((i) => (
                <div className="card p-4" key={i.day}>
                  <b>
                    Day {i.day}: {i.title}
                  </b>
                  <p className="text-slate-600 mt-1">{i.description}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="card p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Book this tour</h2>
              <p className="text-sm text-slate-500 mt-1">
                Traveler information & passport verification
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold">
              Secure
            </span>
          </div>
          <div className="mt-6">
            <label className="font-bold">Travel date</label>
            <input
              type="date"
              className="input"
              value={form.travelDate}
              onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
            />
          </div>
          <div className="mt-5">
            <label className="font-bold">Number of travelers</label>
            <select
              className="input"
              value={travelerCount}
              onChange={(e) => resizeTravelers(Number(e.target.value))}
            >
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} {i === 0 ? 'traveler' : 'travelers'}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 space-y-5">
            {form.travelers.map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
                <div className="flex justify-between items-center">
                  <h3 className="font-black">Traveler {i + 1}</h3>
                  <span className="text-xs text-slate-500">Required</span>
                </div>
                <input
                  className="input"
                  placeholder="Full name *"
                  value={t.name}
                  onChange={(e) => updateTraveler(i, 'name', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Passport number *"
                  value={t.passportNumber}
                  onChange={(e) => updateTraveler(i, 'passportNumber', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="input"
                    value={t.dateOfBirth}
                    onChange={(e) => updateTraveler(i, 'dateOfBirth', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Nationality *"
                    value={t.nationality}
                    onChange={(e) => updateTraveler(i, 'nationality', e.target.value)}
                  />
                </div>
                <label className="mt-4 block rounded-xl border border-dashed border-slate-300 bg-white p-4 cursor-pointer hover:border-emerald-500 transition">
                  <div className="font-bold text-sm">Passport copy (PDF) *</div>
                  <div className="text-xs text-slate-500 mt-1">PDF only · maximum 10 MB</div>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="mt-3 block w-full text-sm"
                    onChange={(e) => uploadPassport(i, e.target.files?.[0])}
                  />
                  <div className="mt-2 text-xs font-semibold">
                    {t.uploading
                      ? 'Uploading securely…'
                      : t.passportFileName
                        ? `✓ ${t.passportFileName}`
                        : 'No passport uploaded yet'}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-rose-50 text-rose-700 p-3 text-sm font-semibold">
              {error}
            </div>
          )}
          <div className="mt-6 flex justify-between items-end border-t pt-5">
            <div>
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-2xl font-black">৳{total.toLocaleString()}</div>
            </div>
            <button
              disabled={busy || form.travelers.some((t) => t.uploading)}
              onClick={book}
              className="btn btn-primary"
            >
              {busy ? 'Submitting…' : 'Continue to payment'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-5">
            Passport copies are encrypted before storage and are accessible only to authorized
            booking staff. They are used for travel-document processing.
          </p>
        </aside>
      </div>
    </main>
  );
}
