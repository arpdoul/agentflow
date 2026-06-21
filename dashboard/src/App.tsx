import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const ORCH = import.meta.env.VITE_ORCHESTRATOR_URL as string;
interface Payment { timestamp: string; service: string; amount: string; status: string; }
export default function App() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  useEffect(() => {
    const poll = async () => { try { const r = await axios.get(ORCH+'/payments'); setPayments(r.data.payments); } catch {} };
    poll(); const id = setInterval(poll, 3000); return () => clearInterval(id);
  }, []);
  const runTask = async () => {
    if (!topic.trim()) return;
    setLoading(true); setResult('');
    try { const r = await axios.post(ORCH+'/task', { topic, pair:'USDC/EURC' }); setResult(JSON.stringify(r.data,null,2)); }
    catch { setResult('Task failed'); }
    setLoading(false);
  };
  const paid = payments.filter(p => p.status==='paid').length;
  const barData = ['Research Agent','Summarizer Agent','FX Oracle Agent'].map(name => ({
    name: name.replace(' Agent',''),
    calls: payments.filter(p => p.service===name && p.status==='paid').length
  }));
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'monospace', padding:'20px' }}>
      <h1 style={{ color:'#818cf8', fontSize:'22px', margin:'0 0 4px' }}>⚡ AgentFlow</h1>
      <p style={{ color:'#64748b', margin:'0 0 16px', fontSize:'11px' }}>Multi-Agent Mesh · Arc Testnet · Circle Nanopayments · Groq AI</p>
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        {([['Payments',String(paid)],['USDC Spent','$'+(paid*0.008).toFixed(4)],['Agents','3'],['Chain','Arc Testnet']] as [string,string][]).map(([l,v]) => (
          <div key={l} style={{ background:'#111827', border:'1px solid #1e293b', borderRadius:'8px', padding:'10px 16px' }}>
            <div style={{ fontSize:'18px', color:'#a5b4fc', fontWeight:700 }}>{v}</div>
            <div style={{ fontSize:'10px', color:'#64748b' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#111827', border:'1px solid #1e293b', borderRadius:'8px', padding:'12px', marginBottom:'12px' }}>
        <div style={{ display:'flex', gap:'8px' }}>
          <input value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runTask()}
            placeholder="Enter topic e.g. Circle Arc ecosystem"
            style={{ flex:1, background:'#0a0a0f', border:'1px solid #334155', borderRadius:'6px', padding:'9px', color:'#e2e8f0', fontSize:'12px' }} />
          <button onClick={runTask} disabled={loading}
            style={{ background:loading?'#334155':'#6366f1', color:'white', border:'none', borderRadius:'6px', padding:'9px 14px', cursor:loading?'not-allowed':'pointer', fontWeight:600, fontSize:'12px' }}>
            {loading?'Running...':'Run Task'}
          </button>
        </div>
      </div>
      {result && (
        <div style={{ background:'#111827', border:'1px solid #10b981', borderRadius:'8px', padding:'10px', marginBottom:'12px', maxHeight:'150px', overflowY:'auto' }}>
          <div style={{ color:'#10b981', fontSize:'10px', marginBottom:'4px' }}>✅ Task Complete</div>
          <pre style={{ fontSize:'9px', color:'#94a3b8', margin:0, whiteSpace:'pre-wrap' }}>{result}</pre>
        </div>
      )}
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'220px', background:'#111827', border:'1px solid #1e293b', borderRadius:'8px', padding:'12px' }}>
          <div style={{ fontSize:'11px', color:'#94a3b8', marginBottom:'8px' }}>Calls Per Agent</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:9 }} />
              <YAxis tick={{ fill:'#64748b', fontSize:9 }} />
              <Tooltip contentStyle={{ background:'#111827', border:'1px solid #334155', fontSize:'10px' }} />
              <Bar dataKey="calls" fill="#6366f1" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex:1, minWidth:'220px', background:'#111827', border:'1px solid #1e293b', borderRadius:'8px', padding:'12px', maxHeight:'200px', overflowY:'auto' }}>
          <div style={{ fontSize:'11px', color:'#94a3b8', marginBottom:'8px' }}>Live Payment Feed</div>
          {payments.length===0
            ? <div style={{ color:'#475569', fontSize:'11px' }}>No payments yet — run a task</div>
            : [...payments].reverse().map((p,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid #1e293b', fontSize:'10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:p.status==='paid'?'#10b981':'#ef4444' }} />
                  <span style={{ color:'#a5b4fc' }}>{p.service}</span>
                </div>
                <span style={{ color:'#fbbf24' }}>{p.amount}</span>
              </div>
            ))
          }
        </div>
      </div>
      <div style={{ textAlign:'center', color:'#334155', fontSize:'9px', marginTop:'14px' }}>AgentFlow · Arc Testnet · Encode Club Hackathon 2026</div>
    </div>
  );
}
