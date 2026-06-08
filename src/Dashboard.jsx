import { useState } from 'react';
import { usePC } from './App.jsx';
import { useTheme, btn, card } from './theme.jsx';
import { parseDollar, fmt$, defProperty, defChecklist, defFinancials, uid } from './data.js';

export default function Dashboard({ onSelectProp }) {
  const { t } = useTheme();
  const { data, addProperty } = usePC();
  const props = data.properties || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ id:'', name:'', location:'', zone:'', strategy:'' });

  const allTasks = props.flatMap(p => (p.tasks||[]).map(tk => ({ ...tk, propId:p.id, propName:p.name })));
  const urgent = allTasks.filter(tk => tk.priority==='emergency' && tk.status!=='done');

  // Portfolio totals
  const totalVal  = props.reduce((s,p) => s+(parseDollar(p.financials?.currentValue)||0),0);
  const totalDebt = props.reduce((s,p) => s+(parseDollar(p.financials?.mortgageBalance)||0),0);
  const totalEq   = totalVal - totalDebt;
  const totalSavings = props.reduce((s,p) => s+(p.tasks||[]).filter(tk=>tk.status==='done').reduce((s2,tk)=>{
    const m=parseDollar(tk.marketRate),a=parseDollar(tk.actualCost);
    return s2+(m!==null&&a!==null?m-a:0);
  },0),0);

  function handleAdd() {
    if (!form.name.trim() || !form.id.trim()) return;
    addProperty({ ...defProperty(form.id.toUpperCase(), form.name, form.location),
                  zone:form.zone, strategy:form.strategy });
    setForm({id:'',name:'',location:'',zone:'',strategy:''});
    setShowAdd(false);
  }

  return (
    <div style={{ padding:24 }}>

      {/* PORTFOLIO KPI CARDS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
        <KPI icon="🏛" label="Properties" val={props.length} color={t.text} />
        {urgent.length > 0 && <KPI icon="🚨" label="Urgent Items" val={urgent.length} color={t.red} />}
        {totalVal > 0 && <KPI icon="💵" label="Portfolio Value" val={fmt$(String(totalVal))} color={t.green} />}
        {totalEq > 0 && <KPI icon="📈" label="Total Equity" val={fmt$(String(totalEq))} color={t.green} />}
        {totalSavings > 0 && <KPI icon="💰" label="Total Savings" val={fmt$(String(totalSavings))} color="#9a5500" />}
      </div>

      {/* URGENT BANNER */}
      {urgent.length > 0 && (
        <div style={{ background:t.redBg, border:`2px solid ${t.red}`, borderRadius:8, padding:'14px 18px', marginBottom:24 }}>
          <div style={{ color:t.red, fontWeight:700, fontSize:14, marginBottom:10, letterSpacing:'0.05em' }}>
            🚨 URGENT — NEEDS IMMEDIATE ATTENTION
          </div>
          {urgent.map(tk => (
            <div key={tk.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'7px 0', borderTop:`1px solid ${t.border}`, cursor:'pointer', flexWrap:'wrap' }}
              onClick={() => onSelectProp(tk.propId)}>
              <span style={{ color:t.gold, fontWeight:700, fontSize:13, minWidth:120 }}>{tk.propName}</span>
              <span style={{ color:t.text, fontSize:13, flex:1 }}>{tk.text}</span>
              {tk.cost && <span style={{ color:t.green, fontSize:12, fontWeight:600 }}>💰 {tk.cost}</span>}
            </div>
          ))}
        </div>
      )}

      {/* HEADER ROW */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Properties</div>
        <button style={btn(t,'dark')} onClick={() => setShowAdd(v=>!v)}>
          {showAdd ? '✕ Cancel' : '+ Add Property'}
        </button>
      </div>

      {/* ADD PROPERTY FORM */}
      {showAdd && (
        <div style={{ ...card(t), marginBottom:20, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:15, fontWeight:700, color:t.text }}>New Property</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div style={{ flex:2, minWidth:180 }}>
              <label style={{ fontSize:12, fontWeight:600, color:t.textSub, display:'block', marginBottom:4 }}>Property Name *</label>
              <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', boxSizing:'border-box' }}
                placeholder="e.g. Main Street Warehouse" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div style={{ flex:1, minWidth:100 }}>
              <label style={{ fontSize:12, fontWeight:600, color:t.textSub, display:'block', marginBottom:4 }}>Short ID *</label>
              <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', boxSizing:'border-box' }}
                placeholder="e.g. MSW" value={form.id} onChange={e=>setForm({...form,id:e.target.value.toUpperCase().slice(0,6)})} />
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, flex:2, minWidth:180 }}
              placeholder="Location / Address" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
            <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, flex:1, minWidth:100 }}
              placeholder="Zoning" value={form.zone} onChange={e=>setForm({...form,zone:e.target.value})} />
          </div>
          <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', boxSizing:'border-box' }}
            placeholder="Strategy / Status" value={form.strategy} onChange={e=>setForm({...form,strategy:e.target.value})} />
          <div style={{ display:'flex', gap:10 }}>
            <button style={btn(t,'green')} onClick={handleAdd}>Add to Portfolio</button>
            <button style={btn(t)} onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* PROPERTY GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
        {props.map(p => <PropertyCard key={p.id} prop={p} onClick={() => onSelectProp(p.id)} />)}
      </div>
    </div>
  );
}

function KPI({ icon, label, val, color }) {
  const { t } = useTheme();
  return (
    <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:8, padding:'14px 16px', boxShadow:t.shadowSm }}>
      <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:700, color, marginBottom:2 }}>{val}</div>
      <div style={{ fontSize:11, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:"'Courier New',monospace" }}>{label}</div>
    </div>
  );
}

function PropertyCard({ prop, onClick }) {
  const { t } = useTheme();
  const urgent = (prop.tasks||[]).filter(tk=>tk.priority==='emergency'&&tk.status!=='done').length;
  const done   = (prop.tasks||[]).filter(tk=>tk.status==='done').length;
  const open   = (prop.tasks||[]).filter(tk=>tk.status!=='done').length;
  const total  = (prop.tasks||[]).length;
  const clDone = (prop.checklist||[]).filter(c=>c.done).length;
  const val    = parseDollar(prop.financials?.currentValue);
  const savings = (prop.tasks||[]).filter(tk=>tk.status==='done').reduce((s,tk)=>{
    const m=parseDollar(tk.marketRate),a=parseDollar(tk.actualCost);
    return s+(m!==null&&a!==null?m-a:0);
  },0);

  return (
    <div style={{ ...card(t), cursor:'pointer', borderTop:`3px solid ${urgent>0?t.red:t.borderLight}`,
                  transition:'box-shadow 0.15s' }}
      onClick={onClick}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow=t.shadow}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ color:t.textMuted, fontSize:11, fontWeight:700, letterSpacing:'0.12em', fontFamily:"'Courier New',monospace" }}>{prop.id}</span>
        {urgent>0 && <span style={{ color:t.red, fontWeight:700, fontSize:13 }}>{urgent} 🔴</span>}
      </div>
      <div style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:4 }}>{prop.name}</div>
      <div style={{ fontSize:12, color:t.textSub, marginBottom:4 }}>{prop.location}</div>
      <div style={{ fontSize:12, color:t.gold, fontStyle:'italic', marginBottom:10 }}>{prop.strategy}</div>
      {val && <div style={{ fontSize:12, color:t.text, marginBottom:4 }}>💵 {fmt$(prop.financials.currentValue)}</div>}
      {savings > 0 && <div style={{ fontSize:12, color:'#9a5500', marginBottom:8, fontWeight:600 }}>💰 Saved: {fmt$(String(savings))}</div>}
      <div style={{ display:'flex', gap:12, fontSize:12, marginBottom:8 }}>
        <span style={{ color:t.gold, fontWeight:600 }}>{open} open</span>
        <span style={{ color:t.green, fontWeight:600 }}>{done} done</span>
        <span style={{ color:t.textMuted }}>☑ {clDone}/{(prop.checklist||[]).length}</span>
      </div>
      <div style={{ height:4, background:t.borderLight, borderRadius:2 }}>
        <div style={{ height:4, background:t.green, borderRadius:2, width:total?`${(done/total)*100}%`:'0%', transition:'width 0.3s' }} />
      </div>
    </div>
  );
}
