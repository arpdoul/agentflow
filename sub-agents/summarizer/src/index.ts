import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'summarizer' });
});

app.post('/summarize', async (req, res) => {
  const text = String(req.body.text || '');
  if (!text) return res.status(400).json({ error: 'Missing text' });
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      messages: [{ role: 'user', content: 'Summarize in 3 bullet points:\n\n' + text }]
    });
    res.json({
      summary: response.choices[0]?.message?.content ?? '',
      model: 'llama-3.1-8b-instant',
      timestamp: new Date().toISOString(),
      settled_by: 'Arc Testnet Nanopayments'
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = Number(process.env.PORT) || 3002;
app.listen(PORT, () => console.log('Summarizer Agent on port ' + PORT));
