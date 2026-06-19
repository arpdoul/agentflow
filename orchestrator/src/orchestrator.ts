import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const log: Array<{timestamp:string;service:string;amount:string;status:string;result?:unknown}> = [];
app.get('/health', (_req, res) => {
  res.json({ status:'ok', agent:'orchestrator', wallet:process.env.TASK_AGENT_WALLET_ADDRESS });
});
app.get('/payments', (_req, res) => {
  const paid = log.filter(p => p.status==='paid').length;
  res.json({ payments:log, total:log.length, total_paid:paid, total_usdc:'$'+(paid*0.008).toFixed(4) });
});
app.post('/task', async (req, res) => {
  const topic = String(req.body.topic || '');
  const pair = String(req.body.pair || 'USDC/EURC');
  if (!topic) return res.status(400).json({ error:'Missing topic' });
  const results: Record<string,unknown> = {};
  const errors: Record<string,string> = {};
  try {
    const r = await axios.get(process.env.RESEARCH_AGENT_URL+'/research/brief', { params:{topic}, timeout:10000 });
    results.research = r.data;
    log.push({ timestamp:new Date().toISOString(), service:'Research Agent', amount:'$0.002', status:'paid', result:r.data });
  } catch(e) {
    errors.research = String(e);
    log.push({ timestamp:new Date().toISOString(), service:'Research Agent', amount:'$0.002', status:'failed' });
  }
  try {
    const txt = results.research ? (results.research as {summary:string}).summary : topic;
    const s = await axios.post(process.env.SUMMARIZER_AGENT_URL+'/summarize', { text:txt }, { timeout:15000 });
    results.summary = s.data;
    log.push({ timestamp:new Date().toISOString(), service:'Summarizer Agent', amount:'$0.005', status:'paid', result:s.data });
  } catch(e) {
    errors.summarizer = String(e);
    log.push({ timestamp:new Date().toISOString(), service:'Summarizer Agent', amount:'$0.005', status:'failed' });
  }
  try {
    const f = await axios.get(process.env.FX_AGENT_URL+'/fx/rate', { params:{pair}, timeout:10000 });
    results.fx_rate = f.data;
    log.push({ timestamp:new Date().toISOString(), service:'FX Oracle Agent', amount:'$0.001', status:'paid', result:f.data });
  } catch(e) {
    errors.fx = String(e);
    log.push({ timestamp:new Date().toISOString(), service:'FX Oracle Agent', amount:'$0.001', status:'failed' });
  }
  res.json({ task:topic, total_spent_usdc:'$0.008', wallet:process.env.TASK_AGENT_WALLET_ADDRESS, settlement:'Arc Testnet via Circle Gateway Nanopayments', results, errors:Object.keys(errors).length?errors:undefined });
});
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log('Orchestrator on port '+PORT));
