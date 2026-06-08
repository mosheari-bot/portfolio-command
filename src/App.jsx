import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { ThemeProvider, useTheme, btn } from './theme.jsx';
import { onAuth, logout, saveData, subscribeToData } from './firebase.js';
import { seedData, uid } from './data.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import PropertyDetail from './PropertyDetail.jsx';

// ─── PORTFOLIO CONTEXT ──────────────────────────
export const PC = createContext(null);
export const usePC = () => useContext(PC);

function AppInner() {
  const { t } = useTheme();
  const [user, setUser] = useState(undefined); // undefined = loading
  const [data, setData] = useState(null);
  const [view, setView] = useState('dashboard');
  const [activeId, setActiveId] = useState('NCA');
  const [saving, setSaving] = useState(false);
  const justSaved = useRef(false);

  // Auth listener
  useEffect(() => onAuth(u => setUser(u)), []);

  // Data listener
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToData(
      snap => {
        if (justSaved.current) return;
        if (snap) setData(snap);
        else {
          const seed = seedData();
          setData(seed);
          saveData(seed);
        }
      },
      () => {
        const backup = localStorage.getItem('portfolio_backup');
        setData(backup ? JSON.parse(backup) : seedData());
      }
    );
    return unsub;
  }, [user]);

  const persist = useCallback(async updated => {
    setData(updated);
    setSaving(true);
    justSaved.current = true;
    await saveData(updated);
    setTimeout(() => { setSaving(false); justSaved.current = false; }, 1200);
  }, []);

  // Property updaters
  function updateProp(id, changes) {
    persist({ ...data, properties: data.properties.map(p => p.id === id ? { ...p, ...changes } : p) });
  }
  function addProperty(prop) {
    persist({ ...data, properties: [...data.properties, prop] });
  }
  function deleteProperty(id) {
    persist({ ...data, properties: data.properties.filter(p => p.id !== id) });
  }
  function updateWorker(wid, changes) {
    persist({ ...data, workers: (data.workers || []).map(w => w.id === wid ? { ...w, ...changes } : w) });
  }
  function addWorker(worker) {
    persist({ ...data, workers: [...(data.workers || []), worker] });
  }

  // Loading
  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:18, color: t.textMuted }}>
      Loading…
    </div>
  );

  if (!user) return <Login />;
  if (!data) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:18, color: t.textMuted }}>
      Loading portfolio…
    </div>
  );

  const active = (data.properties || []).find(p => p.id === activeId);

  return (
    <PC.Provider value={{ data, persist, updateProp, addProperty, deleteProperty, updateWorker, addWorker, saving,
                          view, setView, activeId, setActiveId, user }}>
      {/* HEADER */}
      <div style={{ background: t.navy, padding: '14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, letterSpacing:'0.12em', color:'#ffffff', fontFamily:"'Courier New',monospace" }}>
            PORTFOLIO COMMAND
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 }}>
            Boss Property Management System
            {saving && <span style={{ color: t.gold }}> · Saving…</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
          <HeaderStat />
          <button onClick={logout} style={{ ...btn(t), background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)', fontSize:12 }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: t.bgCard, borderBottom:`2px solid ${t.border}`, display:'flex' }}>
        {[
          { key:'dashboard', label:'⬛ Dashboard' },
          { key:'property',  label:'🏗 Properties' },
          { key:'workers',   label:'👷 Workers' },
        ].map(n => (
          <button key={n.key}
            style={{ background:'none', border:'none', borderBottom: view===n.key ? `3px solid ${t.gold}` : '3px solid transparent',
                     color: view===n.key ? t.text : t.textMuted, padding:'12px 20px', cursor:'pointer',
                     fontFamily:'inherit', fontSize:14, fontWeight: view===n.key ? 700 : 400 }}
            onClick={() => setView(n.key)}>
            {n.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ minHeight:'calc(100vh - 120px)' }}>
        {view === 'dashboard' && <Dashboard onSelectProp={id => { setActiveId(id); setView('property'); }} />}
        {view === 'property' && active && <PropertyDetail prop={active} onSelectProp={id => setActiveId(id)} />}
        {view === 'workers' && <WorkersPlaceholder />}
      </div>
    </PC.Provider>
  );
}

function HeaderStat() {
  const { t } = useTheme();
  const { data } = usePC();
  const props = data.properties || [];
  const allTasks = props.flatMap(p => (p.tasks || []).map(t2 => ({ ...t2, propId: p.id })));
  const urgent = allTasks.filter(t2 => t2.priority === 'emergency' && t2.status !== 'done').length;
  const totalVal = props.reduce((s, p) => s + (parseFloat(String(p.financials?.currentValue || '').replace(/[^0-9.]/g,'')) || 0), 0);

  // Total savings across all properties
  const totalSavings = props.reduce((sum, p) => {
    return sum + (p.tasks || []).filter(t2 => t2.status === 'done').reduce((s2, t2) => {
      const m = parseFloat(String(t2.marketRate||'').replace(/[^0-9.]/g,'')), a = parseFloat(String(t2.actualCost||'').replace(/[^0-9.]/g,''));
      return s2 + (!isNaN(m)&&!isNaN(a) ? m-a : 0);
    }, 0);
  }, 0);

  const S = v => ({ display:'flex', flexDirection:'column', alignItems:'center', gap:1 });
  const V = (val, color) => <span style={{ fontSize:18, fontWeight:700, color }}>{val}</span>;
  const L = lbl => <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', fontFamily:"'Courier New',monospace" }}>{lbl}</span>;

  return (
    <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
      {urgent > 0 && <div style={S()}>{V(urgent,'#ff5555')}{L('URGENT')}</div>}
      <div style={S()}>{V(props.length,'#ffffff')}{L('PROPERTIES')}</div>
      {totalVal > 0 && <div style={S()}>{V('$'+Math.round(totalVal/1000000)+'M','#4caf7d')}{L('PORTFOLIO VALUE')}</div>}
      {totalSavings > 0 && <div style={S()}>{V('$'+Math.round(totalSavings).toLocaleString(),'#f5c842')}{L('TOTAL SAVINGS')}</div>}
    </div>
  );
}

function WorkersPlaceholder() {
  const { t } = useTheme();
  return (
    <div style={{ padding:40, textAlign:'center', color: t.textMuted, fontSize:16 }}>
      👷 Workers tab — coming in next update
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
