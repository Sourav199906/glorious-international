import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const { register } = useAuth();
  const nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    try {
      await register(form);
      nav('/dashboard');
    } catch (e) {
      alert(e.response?.data?.message || 'Registration failed');
    }
  }
  return (
    <main className="min-h-[70vh] grid place-items-center p-6">
      <form onSubmit={submit} className="card p-8 w-full max-w-md">
        <h1 className="text-3xl font-black">Create account</h1>
        {Object.keys(form).map((k) => (
          <input
            key={k}
            type={k === 'password' ? 'password' : 'text'}
            className="w-full border rounded-xl p-3 mt-3"
            placeholder={k[0].toUpperCase() + k.slice(1)}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}
        <button className="btn btn-primary w-full mt-5">Register</button>
      </form>
    </main>
  );
}
