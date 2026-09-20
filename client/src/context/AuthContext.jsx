import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccess } from '../services/api.js';
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .post('/auth/refresh')
      .then((r) => {
        setAccess(r.data.accessToken);
        setUser(r.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  async function login(data) {
    const r = await api.post('/auth/login', data);
    setAccess(r.data.accessToken);
    setUser(r.data.user);
    return r.data;
  }
  async function googleLogin(credential) {
    const r = await api.post('/auth/google', { credential });
    setAccess(r.data.accessToken);
    setUser(r.data.user);
    return r.data;
  }
  async function register(data) {
    const r = await api.post('/auth/register', data);
    setAccess(r.data.accessToken);
    setUser(r.data.user);
    return r.data;
  }
  async function logout() {
    await api.post('/auth/logout');
    setAccess(null);
    setUser(null);
  }
  return (
    <C.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
