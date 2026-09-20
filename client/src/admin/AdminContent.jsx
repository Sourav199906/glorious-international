import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
export default function AdminContent() {
  const [c, setC] = useState({});
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    api.get('/content').then((r) => setC(r.data));
  }, []);
  async function save() {
    await api.put('/content', c);
    alert('Saved');
  }
  async function uploadBackground(file) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('media', file);
      const r = await api.post('/uploads/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const next = { ...c, heroBackgroundUrl: r.data.url, heroBackgroundType: r.data.type };
      setC(next);
      await api.put('/content', next);
      alert('Background animation updated');
    } catch (e) {
      alert(e.response?.data?.message || 'Could not upload the file');
    } finally {
      setUploading(false);
    }
  }
  async function resetBackground() {
    if (!confirm('Reset the hero to the default animation?')) return;
    const next = { ...c, heroBackgroundUrl: '', heroBackgroundType: 'default' };
    setC(next);
    await api.put('/content', next);
  }
  return (
    <>
      <h1 className="text-4xl font-black">Website Content</h1>

      <div className="card p-6 mt-8 space-y-4">
        <h2 className="font-bold text-lg">Homepage background animation</h2>
        <p className="text-sm text-slate-500">
          By default the homepage shows a subtle built-in animation. Upload a short looping video
          (MP4/WebM) or a GIF to replace it — max 20MB.
        </p>

        {c.heroBackgroundType && c.heroBackgroundType !== 'default' && c.heroBackgroundUrl && (
          <div className="rounded-xl overflow-hidden border max-w-sm">
            {c.heroBackgroundType === 'video' ? (
              <video src={c.heroBackgroundUrl} className="w-full" autoPlay muted loop playsInline />
            ) : (
              <img src={c.heroBackgroundUrl} className="w-full" alt="Current hero background" />
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="video/mp4,video/webm,image/gif"
            disabled={uploading}
            onChange={(e) => e.target.files[0] && uploadBackground(e.target.files[0])}
          />
          {uploading && <span className="text-sm text-slate-500">Uploading…</span>}
          {c.heroBackgroundType && c.heroBackgroundType !== 'default' && (
            <button type="button" className="btn" onClick={resetBackground}>
              Reset to default animation
            </button>
          )}
        </div>
      </div>

      <div className="card p-6 mt-8 space-y-4">
        {[
          'heroTitle',
          'heroSubtitle',
          'aboutUs',
          'contactPhone',
          'contactEmail',
          'address',
          'termsConditions',
          'refundPolicy',
          'footerText',
        ].map((k) => (
          <textarea
            key={k}
            className="w-full border rounded-xl p-3"
            rows={k.includes('about') || k.includes('terms') || k.includes('refund') ? 5 : 2}
            placeholder={k}
            value={c[k] || ''}
            onChange={(e) => setC({ ...c, [k]: e.target.value })}
          />
        ))}
        <button className="btn btn-primary" onClick={save}>
          Save changes
        </button>
      </div>
    </>
  );
}
