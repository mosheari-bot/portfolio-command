import { useState } from 'react';
import { usePC } from './App.jsx';
import { useTheme, btn, card } from './theme.jsx';
import TasksTab    from './TasksTab.jsx';
import SavingsTab  from './SavingsTab.jsx';
import FinancialsTab from './FinancialsTab.jsx';
import CompareTab  from './CompareTab.jsx';
import ChecklistTab from './ChecklistTab.jsx';
import ParcelsTab  from './ParcelsTab.jsx';
import PhotosTab   from './PhotosTab.jsx';
import DrawingsTab from './DrawingsTab.jsx';
import DocsTab     from './DocsTab.jsx';
import NotesTab    from './NotesTab.jsx';

export default function PropertyDetail({ prop, onSelectProp }) {
  const { t } = useTheme();
  const { data, updateProp, deleteProperty, setView } = usePC();
  const [tab, setTab] = useState('tasks');
  const [editingHeader, setEditingHeader] = useState(false);
  const [hBuf, setHBuf] = useState({});

  const props = data.properties || [];
  const clDone = (prop.checklist||[]).filter(c=>c.done).length;
  const clTotal = (prop.checklist||[]).length;
  const savingsCount = (prop.tasks||[]).filter(tk=>tk.status==='done'&&(tk.marketRate||tk.actualCost)).length;

  const TABS = [
    { key:'tasks',      label:'✅ Tasks' },
    { key:'savings',    label:`💰 Savings${savingsCount>0?` (${savingsCount})`:''}` },
    { key:'compare',    label:'⚖️ Compare' },
    { key:'financials', label:'💵 Financials' },
    { key:'parcels',    label:`🗺 Parcels (${(prop.parcels||[]).length})` },
    { key:'checklist',  label:`☑ ${clDone}/${clTotal}` },
    { key:'photos',     label:`📷 Photos (${(prop.photos||[]).length})` },
    { key:'drawings',   label:`📐 Drawings (${(prop.drawings||[]).length})` },
    { key:'docs',       label:`📎 Docs (${(prop.docs||[]).length})` },
    { key:'notes',      label:'📋 Notes' },
  ];

  return (
    <div style={{ padding:20 }}>
      {/* Property selector tabs */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {props.map(p => {
          const hasUrgent = (p.tasks||[]).some(tk=>tk.priority==='emergency'&&tk.status!=='done');
          return (
            <button key={p.id}
              style={{ background:p.id===prop.id?t.goldBg:t.bgCard,
                       border:`${p.id===prop.id?'2px':'1px'} solid ${p.id===prop.id?t.gold:t.border}`,
                       color:p.id===prop.id?t.gold:t.textMuted,
                       padding:'6px 13px', borderRadius:5, cursor:'pointer',
                       fontFamily:"'Courier New',monospace", fontSize:11, fontWeight:600 }}
              onClick={() => onSelectProp(p.id)}>
              {hasUrgent && '🔴 '}{p.id}
            </button>
          );
        })}
      </div>

      {/* Property header */}
      <div style={{ ...card(t), marginBottom:16 }}>
        {editingHeader ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <div style={{ flex:2, minWidth:180 }}>
                <label style={{ fontSize:12, fontWeight:600, color:t.textSub, display:'block', marginBottom:4 }}>Property Name</label>
                <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', boxSizing:'border-box' }}
                  value={hBuf.name||''} onChange={e=>setHBuf({...hBuf,name:e.target.value})} />
              </div>
              <div style={{ flex:2, minWidth:180 }}>
                <label style={{ fontSize:12, fontWeight:600, color:t.textSub, display:'block', marginBottom:4 }}>Location</label>
                <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', boxSizing:'border-box' }}
                  value={hBuf.location||''} onChange={e=>setHBuf({...hBuf,location:e.target.value})} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, flex:1, minWidth:120 }}
                placeholder="Zone" value={hBuf.zone||''} onChange={e=>setHBuf({...hBuf,zone:e.target.value})} />
              <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'8px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, flex:2, minWidth:180 }}
                placeholder="Strategy" value={hBuf.strategy||''} onChange={e=>setHBuf({...hBuf,strategy:e.target.value})} />
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button style={btn(t,'green')} onClick={() => { updateProp(prop.id,hBuf); setEditingHeader(false); }}>Save Changes</button>
              <button style={btn(t)} onClick={() => setEditingHeader(false)}>Cancel</button>
              <button style={{ ...btn(t,'red'), marginLeft:'auto' }}
                onClick={() => { if(window.confirm('Remove this property?')) { deleteProperty(prop.id); setView('dashboard'); } }}>
                🗑 Remove Property
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:t.text, marginBottom:5 }}>{prop.name}</div>
              <div style={{ fontSize:13, color:t.textSub }}>
                {prop.location}{prop.zone && <span> · <strong>{prop.zone}</strong></span>}
              </div>
              {prop.strategy && <div style={{ fontSize:13, color:t.gold, fontStyle:'italic', marginTop:4 }}>{prop.strategy}</div>}
            </div>
            <button style={btn(t)} onClick={() => { setHBuf({name:prop.name,location:prop.location,zone:prop.zone,strategy:prop.strategy}); setEditingHeader(true); }}>
              ✎ Edit
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:`2px solid ${t.border}`, marginBottom:18, flexWrap:'wrap', overflowX:'auto' }}>
        {TABS.map(tb => (
          <button key={tb.key}
            style={{ background:'none', border:'none', borderBottom:`3px solid ${tab===tb.key?t.gold:'transparent'}`,
                     color: tab===tb.key?t.gold:t.textMuted, padding:'9px 14px', cursor:'pointer',
                     fontFamily:'inherit', fontSize:13, fontWeight:tab===tb.key?700:400,
                     marginBottom:-2, whiteSpace:'nowrap' }}
            onClick={() => setTab(tb.key)}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={card(t)}>
        {tab==='tasks'      && <TasksTab     prop={prop} updateProp={updateProp} />}
        {tab==='savings'    && <SavingsTab   prop={prop} />}
        {tab==='compare'    && <CompareTab   prop={prop} updateProp={updateProp} />}
        {tab==='financials' && <FinancialsTab prop={prop} updateProp={updateProp} />}
        {tab==='parcels'    && <ParcelsTab   prop={prop} updateProp={updateProp} />}
        {tab==='checklist'  && <ChecklistTab prop={prop} updateProp={updateProp} />}
        {tab==='photos'     && <PhotosTab    prop={prop} updateProp={updateProp} />}
        {tab==='drawings'   && <DrawingsTab  prop={prop} updateProp={updateProp} />}
        {tab==='docs'       && <DocsTab      prop={prop} updateProp={updateProp} />}
        {tab==='notes'      && <NotesTab     prop={prop} updateProp={updateProp} />}
      </div>
    </div>
  );
}
