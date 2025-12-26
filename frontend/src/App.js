import React, { useState, useEffect } from 'react';
import { Search, Clock, Loader2, TrendingUp, TrendingDown, Minus, Plus, Trash2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function App() {
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState({ news: [], prices: [] });
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem('stocks')) || ['AAPL', 'TSLA']);

  useEffect(() => {
    localStorage.setItem('stocks', JSON.stringify(watchlist));
  }, [watchlist]);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/data/${symbol}`);
      const json = await res.json();
      setData(json);
    } catch (e) { alert("Server error"); }
    setLoading(false);
  };

  const hurst = data.prices[0]?.hurst || 0.5;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: '-apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Watchlist</h2>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
          <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="Symbol" style={{ width: '120px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <button onClick={() => setWatchlist([...new Set([...watchlist, ticker])])} style={{ padding: '8px', cursor: 'pointer' }}><Plus size={16}/></button>
        </div>
        {watchlist.map(s => (
          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f1f5f9', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => fetchStockData(s)}>
            <span style={{ fontWeight: 'bold' }}>{s}</span>
            <Trash2 size={14} color="#ef4444" onClick={(e) => { e.stopPropagation(); setWatchlist(watchlist.filter(x => x !== s)); }} />
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Loader2 className="spin" size={48} /></div>
        ) : (
          <>
            {data.prices.length > 0 && (
              <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>Technical View: {data.news[0]?.ticker}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hurst Exponent</div>
                    <div style={{ fontWeight: 'bold', color: hurst > 0.5 ? '#10b981' : '#f59e0b' }}>{hurst} {hurst > 0.5 ? '(Trending)' : '(Mean Reverting)'}</div>
                  </div>
                </div>
                <div style={{ height: '300px', marginTop: '20px' }}>
                  <ResponsiveContainer>
                    <LineChart data={data.prices}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2} dot={false} name="Price" />
                      <Line type="monotone" dataKey="ema" stroke="#ec4899" strokeWidth={2} dot={false} name="12D EMA" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '15px' }}>
              {data.news.map((n, i) => (
                <div key={i} style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', background: n.sentiment === 'Positive' ? '#dcfce7' : '#fee2e2', color: n.sentiment === 'Positive' ? '#166534' : '#991b1b' }}>{n.sentiment}</span>
                    <small style={{ color: '#64748b' }}>{n.source} • {n.time}</small>
                  </div>
                  <h4 style={{ margin: 0 }}>{n.title}</h4>
                  <a href={n.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>Read Link →</a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default App;
