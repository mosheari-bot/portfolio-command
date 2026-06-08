import { useState } from 'react';
import { useTheme } from './theme.jsx';
import { CHECKLIST_CATS, CHECKLIST_ITEMS } from './data.js';

export default function ChecklistTab({ prop, updateProp }) {
  const { t } = useTheme();
  const cl = prop.checklist || [];
  const done = cl.filter(c=>c.done).length;
  const pct  = cl.length ? Math.round((done/cl.length)*100) : 0;

  function upd(id, changes) {
    updateProp(prop.id, { checklist: cl.map(c => c.id===id ? {...c,...changes} : c) });
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Property Condition Checklist</div>
        <span style={{ fontSize:14, fontWeight:700, color:t.green }}>{pct}% Complete</span>
      </div>

      {/* Progress bar */}
      <div style={{ height:8, background:t.borderLight, borderRadius:4, marginBottom:20 }}>
        <div style={{ height:8, background:t.green, borderRadius:4, width:`${pct}%`, transition:'width 0.4s' }} />
      </div>

      {/* Categories */}
      {CHECKLIST_CATS.map(cat => {
        const items = cl.filter(c=>c.cat===cat);
        const catDone = items.filter(c=>c.done).length;
        return (
          <div key={cat} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:6, borderBottom:`2px solid ${t.border}`, marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:"'Courier New',monospace" }}>{cat}</span>
              <span style={{ fontSize:12, color:catDone===items.length?t.green:t.textMuted, fontWeight:600 }}>{catDone}/{items.length}</span>
            </div>
            {items.map(item => <CheckRow key={item.id} item={item} onUpdate={ch=>upd(item.id,ch)} />)}
          </div>
        );
      })}
    </div>
  );
}

function CheckRow({ item, onUpdate }) {
  const { t } = useTheme();
  const [showNote, setShowNote] = useState(false);
  const [noteBuf, setNoteBuf] = useState(item.note||'');

  return (
    <div style={{ background:item.done?t.greenBg:item.na?t.bgAlt:t.bgCard, borderRadius:5, marginBottom:4, padding:'9px 12px', border:`1px solid ${t.borderLight}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <input type="checkbox" checked={!!item.done} onChange={() => onUpdate({done:!item.done})}
          style={{ width:18, height:18, cursor:'pointer', accentColor:t.green, flexShrink:0 }} />
        <span style={{ fontSize:14, color:item.done?t.textMuted:item.na?t.textMuted:t.text, flex:1, textDecoration:item.done?'line-through':'none' }}>
          {item.label}
        </span>
        <div style={{ display:'flex', gap:6 }}>
          <button style={{ background:t.bgAlt, border:`1px solid ${t.border}`, color:item.na?t.red:t.textMuted, padding:'3px 8px', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontSize:11 }}
            onClick={() => onUpdate({na:!item.na})}>
            {item.na?'Restore':'N/A'}
          </button>
          <button style={{ background:t.bgAlt, border:`1px solid ${t.border}`, color:t.textMuted, padding:'3px 8px', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontSize:11 }}
            onClick={() => setShowNote(v=>!v)}>
            {showNote?'Close':item.note?'📝 Note':'+ Note'}
          </button>
        </div>
      </div>
      {showNote && (
        <div style={{ display:'flex', gap:8, marginTop:8, paddingLeft:28 }}>
          <input style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'6px 10px', borderRadius:4, fontFamily:'inherit', fontSize:13, flex:1 }}
            placeholder="Add note for this item…" value={noteBuf} onChange={e=>setNoteBuf(e.target.value)} />
          <button style={{ background:t.greenBg, border:`2px solid ${t.green}`, color:t.green, padding:'6px 12px', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:700 }}
            onClick={() => { onUpdate({note:noteBuf}); setShowNote(false); }}>Save</button>
        </div>
      )}
      {!showNote && item.note && <div style={{ paddingLeft:28, marginTop:4, fontSize:12, color:t.textMuted, fontStyle:'italic' }}>📝 {item.note}</div>}
    </div>
  );
}
