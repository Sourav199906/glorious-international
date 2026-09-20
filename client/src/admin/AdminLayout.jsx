import { Link, Outlet } from 'react-router-dom';
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="hidden md:block w-64 min-h-screen bg-slate-950 text-white p-6 sticky top-0">
          <h2 className="font-black text-xl">GLORIOUS ADMIN</h2>
          <nav className="mt-8 space-y-2">
            {[
              ['/admin', 'Dashboard'],
              ['/admin/bookings', 'Bookings'],
              ['/admin/packages', 'Packages'],
              ['/admin/hajj', 'Hajj'],
              ['/admin/flights', 'Flights'],
              ['/admin/gallery', 'Gallery'],
              ['/admin/news', 'News'],
              ['/admin/content', 'Content'],
              ['/admin/reviews', 'Reviews'],
            ].map((x) => (
              <Link className="block p-3 rounded-xl hover:bg-white/10" to={x[0]} key={x[0]}>
                {x[1]}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
