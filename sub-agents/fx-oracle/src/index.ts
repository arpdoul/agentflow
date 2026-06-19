import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const FX: Record<string, number> = {
  'USDC/EURC': 0.921,
  'USDC/BRLA': 5.12,
  'USDC/MXNB': 17.43,
  'EURC/USDC': 1.086
};
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'fx-oracle' });
});
app.get('/fx/rate', (req, res) => {
  const pair = String(req.query.pair || '');
  if (!pair) return res.status(400).json({ error: 'Missing pair', available: Object.keys(FX) });
  const rate = FX[pair];
  if (!rate) return res.status(404).json({ error: 'Not found', available: Object.keys(FX) });
  res.json({ pair, rate, timestamp: new Date().toISOString(), settled_by: 'Arc Testnet Nanopayments' });
});
const PORT = Number(process.env.PORT) || 3003;
app.listen(PORT, () => console.log('FX Oracle on port ' + PORT));
