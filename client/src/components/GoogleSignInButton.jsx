import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function GoogleSignInButton() {
  const ref = useRef(null);
  const { googleLogin } = useAuth();
  const [error, setError] = useState('');
  useEffect(() => {
    let timer;
    const render = () => {
      if (!window.google || !ref.current) return false;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError('Google Sign-In is not configured.');
        return true;
      }
      ref.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setError('');
            await googleLogin(response.credential);
            window.location.assign('/dashboard');
          } catch (e) {
            setError(e.response?.data?.message || 'Google Sign-In failed. Please try again.');
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 360,
      });
      return true;
    };
    if (!render())
      timer = setInterval(() => {
        if (render()) clearInterval(timer);
      }, 200);
    return () => timer && clearInterval(timer);
  }, [googleLogin]);
  return (
    <div className="mt-4">
      <div ref={ref} className="flex justify-center min-h-10" />
      {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}
    </div>
  );
}
