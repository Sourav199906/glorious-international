import { motion } from 'framer-motion';
import { Plane, Landmark, Globe2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import PackageCard from '../components/PackageCard.jsx';
import SEO from '../components/SEO.jsx';
export default function Home() {
  const [packages, setPackages] = useState([]);
  const [content, setContent] = useState({});
  useEffect(() => {
    api.get('/packages').then((r) => setPackages(r.data.slice(0, 3)));
    api.get('/content').then((r) => setContent(r.data));
  }, []);
  const hasCustomBg =
    content.heroBackgroundType &&
    content.heroBackgroundType !== 'default' &&
    content.heroBackgroundUrl;
  return (
    <>
      <SEO
        title="Glorious International | Flights, Hajj & Tour Packages"
        description="Book flights, Hajj packages and unforgettable tours with Glorious International."
      />
      <section className="relative overflow-hidden bg-[#F4F7F6] text-slate-900">
        {hasCustomBg ? (
          <>
            {content.heroBackgroundType === 'video' ? (
              <video
                src={content.heroBackgroundUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={content.heroBackgroundUrl}
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
              />
            )}
            {/* Keeps hero text readable regardless of what the admin uploads */}
            <div className="absolute inset-0 bg-[#F4F7F6]/75" />
          </>
        ) : (
          <div className="hero-bg-anim" aria-hidden="true">
            <span className="hero-blob hero-blob-1" />
            <span className="hero-blob hero-blob-2" />
            <span className="hero-blob hero-blob-3" />
          </div>
        )}
        <div className="container relative py-24 md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-teal-700 font-bold"
          >
            TRAVEL SMART • TRAVEL CONFIDENTLY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black max-w-4xl mt-3"
          >
            Your journey starts with Glorious International
          </motion.h1>
          <p className="text-slate-600 text-lg max-w-2xl mt-6">
            Committed to your travels, We offer flights, Hajj and unforgettable tours designed around your journey
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {[
              [Plane, 'Flights', '/flights'],
              [Landmark, 'Hajj Packages', '/hajj'],
              [Globe2, 'Tour Packages', '/packages'],
            ].map(([Icon, title, to]) => (
              <Link
                to={to}
                key={title}
                className="bg-white text-slate-900 border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center justify-between hover:scale-[1.02] transition"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-teal-700" />
                  <b>{title}</b>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-teal-700 font-bold">FEATURED</p>
            <h2 className="text-3xl font-black">Popular packages</h2>
          </div>
          <Link to="/packages" className="font-bold">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p) => (
            <PackageCard key={p._id} p={p} />
          ))}
        </div>
      </section>
    </>
  );
}
