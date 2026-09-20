import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
export default function Login() {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    try {
      await login({ email, password });
      nav('/dashboard');
    } catch (e) {
      alert(e.response?.data?.message || 'Login failed');
    }
  }
  return (
    <main className="min-h-[70vh] grid place-items-center p-6">
      <form onSubmit={submit} className="card p-8 w-full max-w-md">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="text-slate-500 mt-2">Sign in to continue your journey.</p>
        <input
          className="input mt-6"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input mt-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-full mt-5">Sign in</button>
        <div className="flex items-center gap-3 my-5 text-sm text-slate-400">
          <span className="h-px bg-slate-200 flex-1" />
          or continue with
          <span className="h-px bg-slate-200 flex-1" />
        </div>
        <GoogleSignInButton />
        <p className="mt-5 text-center">
          New here?{' '}
          <Link className="text-teal-700 font-bold" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
