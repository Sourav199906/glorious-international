import { travelAssistant } from '../services/aiService.js';
export async function chat(req, res) {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ message: 'Message required' });
  if (message.length > 1200)
    return res.status(400).json({ message: 'Message is too long. Maximum 1200 characters.' });
  res.json({ reply: await travelAssistant(message) });
}
