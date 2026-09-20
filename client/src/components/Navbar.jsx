import { Link } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white">
            <Plane size={18} />
          </span>
          Glorious International
        </Link>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
        <nav
          className={`${open ? 'flex' : 'hidden'} md:flex absolute md:static top-16 left-0 right-0 bg-white md:bg-transparent flex-col md:flex-row gap-5 p-5 md:p-0 font-semibold`}
        >
          <Link to="/">Home</Link>
          <Link to="/packages">Packages</Link>
          <Link to="/flights">Flights</Link>
          <Link to="/hajj">Hajj</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About</Link>
          <Link to="/news">News</Link>
          <Link to="/reviews">Reviews</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {['ADMIN', 'STAFF'].includes(user.role) && <Link to="/admin">Admin</Link>}
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
