import ContactMessage from '../models/ContactMessage.js';
export async function sendMessage(req, res) {
  res.status(201).json(await ContactMessage.create(req.body));
}
export async function messages(req, res) {
  res.json(await ContactMessage.find().sort({ createdAt: -1 }));
}
