import { useState } from 'react';
import { useTheme, btn, inp } from './theme.jsx';

export default function DocsTab({ prop, updateProp }) {
  const { t } = useTheme();
  const docs = prop.docs || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label:'', url:'' });
  const [editIdx, setEditIdx] = useState(null);
  const [editBuf, setEditBuf] = useState({ label:'', url:'' });

  function add() {
    if (!form.label.trim()) return;
    updateProp(prop.id, { docs:[...docs,{...form}] });
    setForm({label:'',url:''}); setShowAdd(false);
  }
  function del(i) {
    if (window.confirm(`Remove "${docs[i].label}"?`))
      updateProp(prop.id, { docs:docs.filter((_,idx)=>idx!==i) });
  }
  function saveEdit() {
    if (!editBuf.label.trim()) return;
    updateProp(prop.id, { docs:docs.map((d,i)=>i===editIdx?{...editBuf}:d) });
    setEditIdx(null);
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Documents & Links</div>
        <button style={{ ...btn(t), padding:'5px 12px', fontSize:12 }} onClick={()=>setShowAdd(v=>!v)}>
          {showAdd?'Cancel':'+ Add Doc'}
        </button>
      </div>

      {showAdd && (
        <div style={{ background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:6, padding:'14px 16px', marginBottom:14, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <input style={inp(t)} placeholder="Label (e.g. Phase I Report)" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} />
            <input style={inp(t)} placeholder="URL (optional)" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={btn(t,'green')} onClick={add}>Save Doc</button>
            <button style={btn(t)} onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {docs.length===0&&!showAdd && <div style={{ color:t.textMuted, fontSize:14, textAlign:'center', padding:28 }}>No documents linked yet.</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {docs.map((d,i) => (
          <div key={i} style={{ background:t.bgHover, border:`1px solid ${t.border}`, borderRadius:6, padding:'10px 14px' }}>
            {editIdx===i ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <input style={inp(t)} placeholder="Label" value={editBuf.label} onChange={e=>setEditBuf({...editBuf,label:e.target.value})} />
                  <input style={inp(t)} placeholder="URL (optional)" value={editBuf.url} onChange={e=>setEditBuf({...editBuf,url:e.target.value})} />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={btn(t,'green')} onClick={saveEdit}>Save</button>
                  <button style={btn(t)} onClick={()=>setEditIdx(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <span style={{ flex:1 }}>
                  {d.url
                    ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color:t.gold, textDecoration:'none', fontWeight:600, fontSize:14 }}>📄 {d.label} ↗</a>
                    : <span style={{ color:t.text, fontWeight:600, fontSize:14 }}>📄 {d.label}</span>
                  }
                  {d.url && <div style={{ fontSize:11, color:t.textMuted, marginTop:2, wordBreak:'break-all' }}>{d.url}</div>}
                </span>
                <div style={{ display:'flex', gap:6 }}>
                  <button style={{ ...btn(t), padding:'4px 10px', fontSize:12 }} onClick={()=>{setEditBuf({...d});setEditIdx(i);}}>✎ Edit</button>
                  <button style={{ ...btn(t), padding:'4px 10px', fontSize:12, color:t.red }} onClick={()=>del(i)}>🗑 Remove</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
