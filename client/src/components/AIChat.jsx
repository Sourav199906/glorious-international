import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { api } from '../services/api.js';
export default function AIChat() {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(''),
    [items, setItems] = useState([
      {
        role: 'assistant',
        text: 'Hi! I can help you choose tours, Hajj packages and travel ideas.',
      },
    ]),
    [busy, setBusy] = useState(false);
  async function send() {
    if (!message.trim() || busy) return;
    const m = message;
    setMessage('');
    setItems((x) => [...x, { role: 'user', text: m }]);
    setBusy(true);
    try {
      const r = await api.post('/ai/chat', { message: m });
      setItems((x) => [...x, { role: 'assistant', text: r.data.reply }]);
    } catch {
      setItems((x) => [
        ...x,
        { role: 'assistant', text: 'Sorry, the assistant is temporarily unavailable.' },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-teal-700 text-white shadow-xl grid place-items-center"
      >
        <Bot />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(380px,calc(100vw-32px))] card overflow-hidden">
          <div className="bg-teal-700 text-white p-4 flex justify-between">
            <b>AI Travel Assistant</b>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {items.map((x, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl ${x.role === 'user' ? 'bg-teal-50 ml-8' : 'bg-slate-100 mr-8'}`}
              >
                {x.text}
              </div>
            ))}
            {busy && <div className="text-sm text-slate-500">Thinking...</div>}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-xl px-3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about a trip..."
            />
            <button className="btn btn-primary" onClick={send}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
