import { Link, useLocation } from 'react-router-dom';
export default function PaymentResult() {
  const { pathname } = useLocation();
  const success = pathname.includes('success');
  return (
    <main className="container py-24 text-center">
      <div className="card p-10 max-w-xl mx-auto">
        <div className="text-5xl">{success ? '✓' : '!'}</div>
        <h1 className="text-3xl font-black mt-4">
          {success ? 'Payment submitted successfully' : 'Payment was not completed'}
        </h1>
        <p className="text-slate-500 mt-3">
          {success
            ? 'Your payment is being verified. You can check the booking status in your dashboard.'
            : 'You can return to your dashboard and try again.'}
        </p>
        <Link className="btn btn-primary mt-6" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
