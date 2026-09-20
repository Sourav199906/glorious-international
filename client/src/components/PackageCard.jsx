import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
export default function PackageCard({ p }) {
  return (
    <motion.div whileHover={{ y: -7 }} className="card overflow-hidden">
      <div className="h-48 bg-slate-200">
        {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
      </div>
      <div className="p-5">
        <div className="text-sm text-teal-700 font-bold">{p.destination}</div>
        <h3 className="text-xl font-black mt-1">{p.title}</h3>
        <p className="text-slate-500 mt-2 line-clamp-2">{p.description}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-2xl font-black">৳{Number(p.price || 0).toLocaleString()}</span>
            <span className="text-slate-500"> / person</span>
          </div>
          <Link className="btn btn-primary" to={`/packages/${p._id}`}>
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
