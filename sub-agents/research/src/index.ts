import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'research' });
});

app.get('/research/brief', (req, res) => {
  const topic = String(req.query.topic || '');
  if (!topic) return res.status(400).json({ error: 'Missing topic' });
  res.json({
    topic: topic,
    summary: 'Research brief for ' + topic + ': Key market dynamics and Arc Testnet developments.',
    sources: ['coindesk.com', 'circle.com'],
    timestamp: new Date().toISOString(),
    settled_by: 'Arc Testnet Nanopayments'
  });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log('Research Agent on port ' + PORT));
