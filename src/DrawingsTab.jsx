import { useState } from 'react';
import { useTheme, btn, inp } from './theme.jsx';
import { DRAWING_TYPES, defDrawing } from './data.js';

export default function DrawingsTab({ prop, updateProp }) {
  const { t } = useTheme();
  const drawings = prop.drawings || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label:'', type:'Architectural Rendering', date:'', link:'', notes:'' });
  const [editId, setEditId] = useState(null);
  const [editBuf, setEditBuf] = useState({});

  const TYPE_ICONS = {
    'Architectural Rendering':'🏛', 'Blueprint / Floor Plan':'📐', 'Site Plan':'🗺',
    'Survey':'📏', 'Structural Drawing':'🏗', 'Electrical Plan':'⚡',
    'Plumbing Plan':'🔧', 'Permit Document':'📋', 'Other':'📄',
  };

  function add() {
    if (!form.label.trim()) return;
    updateProp(prop.id, { drawings:[...drawings,{...defDrawing(),...form}] });
    setForm({label:'',type:'Architectural Rendering',date:'',link:'',notes:''});
    setShowAdd(false);
  }
  function save() {
    updateProp(prop.id, { drawings:drawings.map(d=>d.id===editId?{...editBuf}:d) });
    setEditId(null);
  }
  function del(id) {
    if (window.confirm('Remove this drawing?'))
      updateProp(prop.id, { drawings:drawings.filter(d=>d.id!==id) });
  }

  const typeField = (isForm, obj, setObj) => (
    <div style={{ flex:1, minWidth:180 }}>
      <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Document Type</label>
      <select style={{ ...inp(t), padding:'7px 10px' }} value={obj.type||'Architectural Rendering'} onChange={e=>setObj({...obj,type:e.target.value})}>
        {DRAWING_TYPES.map(tp=><option key={tp} value={tp}>{tp}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Drawings & Plans</div>
          <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>Architectural renderings, blueprints, floor plans, surveys, and permits.</div>
        </div>
        <button style={btn(t,'gold')} onClick={()=>setShowAdd(v=>!v)}>{showAdd?'✕ Cancel':'+ Add Drawing'}</button>
      </div>

      {showAdd && (
        <div style={{ background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:'16px', marginBottom:20, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ flex:2, minWidth:180 }}>
              <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Document Name *</label>
              <input style={inp(t)} placeholder="e.g. NCA Ground Floor Plan v2" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} />
            </div>
            {typeField(true, form, setForm)}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ flex:2, minWidth:200 }}>
              <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Link / URL</label>
              <input style={inp(t)} placeholder="Google Drive link, Dropbox URL, etc." value={form.link} onChange={e=>setForm({...form,link:e.target.value})} />
            </div>
            <div style={{ flex:1, minWidth:130 }}>
              <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Date</label>
              <input type="date" style={{ ...inp(t), padding:'7px 10px' }} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Notes</label>
            <input style={inp(t)} placeholder="Version, architect name, status, etc." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={btn(t,'green')} onClick={add}>Save Drawing</button>
            <button style={btn(t)} onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {drawings.length===0&&!showAdd && (
        <div style={{ border:`2px dashed ${t.border}`, borderRadius:8, padding:48, textAlign:'center', color:t.textMuted }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📐</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>No drawings or plans yet</div>
          <div style={{ fontSize:13 }}>Add architectural renderings, blueprints, floor plans, surveys, and permit documents.</div>
        </div>
      )}

      {/* Group by type */}
      {DRAWING_TYPES.filter(tp=>drawings.some(d=>d.type===tp)).map(tp => (
        <div key={tp} style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Courier New',monospace", paddingBottom:6, borderBottom:`1px solid ${t.border}`, marginBottom:8 }}>
            {TYPE_ICONS[tp]||'📄'} {tp}
          </div>
          {drawings.filter(d=>d.type===tp).map(d => (
            <div key={d.id} style={{ background:t.bgHover, border:`1px solid ${t.border}`, borderRadius:6, padding:'12px 14px', marginBottom:8 }}>
              {editId===d.id ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <div style={{ flex:2, minWidth:180 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Name</label>
                      <input style={inp(t)} value={editBuf.label||''} onChange={e=>setEditBuf({...editBuf,label:e.target.value})} />
                    </div>
                    {typeField(false, editBuf, setEditBuf)}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <input style={{ ...inp(t), flex:2 }} placeholder="Link / URL" value={editBuf.link||''} onChange={e=>setEditBuf({...editBuf,link:e.target.value})} />
                    <input type="date" style={{ ...inp(t), flex:1, padding:'7px 10px' }} value={editBuf.date||''} onChange={e=>setEditBuf({...editBuf,date:e.target.value})} />
                  </div>
                  <input style={inp(t)} placeholder="Notes…" value={editBuf.notes||''} onChange={e=>setEditBuf({...editBuf,notes:e.target.value})} />
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={btn(t,'green')} onClick={save}>Save</button>
                    <button style={btn(t)} onClick={()=>setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {d.link
                        ? <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ fontSize:15, fontWeight:700, color:t.gold, textDecoration:'none' }}>
                            {TYPE_ICONS[d.type]||'📄'} {d.label} ↗
                          </a>
                        : <span style={{ fontSize:15, fontWeight:700, color:t.text }}>{TYPE_ICONS[d.type]||'📄'} {d.label}</span>
                      }
                    </div>
                    <div style={{ display:'flex', gap:12, marginTop:4, flexWrap:'wrap' }}>
                      {d.date && <span style={{ fontSize:12, color:t.textMuted }}>📅 {d.date}</span>}
                      {d.notes && <span style={{ fontSize:12, color:t.textMuted, fontStyle:'italic' }}>📝 {d.notes}</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={{ ...btn(t), padding:'4px 10px', fontSize:12 }} onClick={()=>{setEditBuf({...d});setEditId(d.id);}}>✎ Edit</button>
                    <button style={{ ...btn(t), padding:'4px 10px', fontSize:12, color:t.red }} onClick={()=>del(d.id)}>🗑</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
