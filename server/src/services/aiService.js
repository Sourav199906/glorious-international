import OpenAI from 'openai';
import Package from '../models/Package.js';
import HajjPackage from '../models/HajjPackage.js';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15000 })
  : null;

export async function travelAssistant(message) {
  const [packages, hajj] = await Promise.all([
    Package.find({ published: true })
      .select(
        'title destination description durationDays durationNights price currency included excluded',
      )
      .limit(30)
      .lean(),
    HajjPackage.find({ published: true })
      .select('title season description durationDays price currency included')
      .limit(10)
      .lean(),
  ]);
  const context = JSON.stringify({ packages, hajj });
  if (!client)
    return `AI is not configured yet. I can still help you browse ${packages.length} tour packages. Ask about destinations, budgets, or durations.`;
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    max_output_tokens: 700,
    input: [
      {
        role: 'system',
        content: `You are Glorious International's travel assistant. Use only the supplied inventory for specific package claims. Never invent prices, availability, inclusions, visa rules, or live flight information. If inventory is insufficient, say so and suggest contacting Glorious International. Keep answers concise, practical, and friendly. Inventory: ${context}`,
      },
      { role: 'user', content: message },
    ],
  });
  return response.output_text || 'I could not generate a useful answer right now.';
}
