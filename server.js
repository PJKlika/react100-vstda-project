import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is missing. Add it to a .env file in the project root.');
  console.error('Get a free key at: https://console.groq.com/');
  process.exit(1);
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Parse NL → structured todo (using Groq - FREE!)
app.post('/api/ai/parse-todo', async (req, res) => {
  try {
    const { text } = req.body;

    const instructions = `
You are a parser. Read one casual task description and return ONLY a JSON object with these fields:

{
  "title": "string (short, actionable)",
  "notes": "string",
  "priority": 1|2|3,
  "dueDate": "YYYY-MM-DD or empty string",
  "dueTime": "HH:MM or empty string",
  "estimateMinutes": number or null,
  "tags": ["lowercase", "words"]
}

Rules:
- Priority mapping (default 2):
  p1 OR high/urgent/asap/today -> 1
  p2 OR medium/normal         -> 2
  p3 OR low/someday           -> 3
- If date/time not found, use empty string "".
- If estimate not found, use null.
- Output must be raw JSON ONLY. No backticks, no explanation.
- Strip leading '#' from tags.
- Example output:
{"title":"Email Amir","notes":"","priority":1,"dueDate":"2025-10-25","dueTime":"15:00","estimateMinutes":25,"tags":["work"]}
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // Free, fast, and smart
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: `Parse this task: ${text}` }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    // Parse model output safely
    let out;
    try {
      const content = completion.choices[0].message.content;
      out = JSON.parse(content);
    } catch {
      const content = completion.choices[0].message.content || '';
      const m = content.match(/\{[\s\S]*\}/);
      out = m ? JSON.parse(m[0]) : null;
    }

    if (!out || typeof out !== 'object') {
      return res.status(502).json({ error: 'AI returned an unexpected response.' });
    }

    // Normalize/validate
    out.title = (out.title || '').toString().slice(0, 200);
    const pr = Number(out.priority);
    out.priority = pr === 1 || pr === 3 ? pr : 2;
    out.dueDate = typeof out.dueDate === 'string' ? out.dueDate : '';
    out.dueTime = typeof out.dueTime === 'string' ? out.dueTime : '';
    out.estimateMinutes = Number.isFinite(out.estimateMinutes) ? out.estimateMinutes : null;
    out.tags = Array.isArray(out.tags)
      ? out.tags.map(t => String(t).toLowerCase().replace(/^#/, '')).slice(0, 6)
      : [];
    out.notes = typeof out.notes === 'string' ? out.notes : '';

    res.json(out);
  } catch (e) {
    console.error('[AI] ERROR:', e);
    res.status(500).json({ error: e.message || 'AI error' });
  }
});

app.listen(3001, () => console.log('✨ AI server (Groq) on http://localhost:3001'));