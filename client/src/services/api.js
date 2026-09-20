import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});
let accessToken = null;
let refreshing = null;
export function setAccess(t) {
  accessToken = t || null;
}
api.interceptors.request.use((c) => {
  if (accessToken) c.headers.Authorization = `Bearer ${accessToken}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  async (e) => {
    const original = e.config;
    if (
      e.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh');
        const r = await refreshing;
        refreshing = null;
        setAccess(r.data.accessToken);
        original.headers.Authorization = `Bearer ${r.data.accessToken}`;
        return api(original);
      } catch {
        refreshing = null;
        setAccess(null);
      }
    }
    throw e;
  },
);

export async function downloadPassport(bookingId, index) {
  return api.get(`/passports/booking/${bookingId}/${index}`, { responseType: 'blob' });
}
