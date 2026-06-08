import { useState } from 'react';
import { useTheme, btn, inp } from './theme.jsx';
import { REL, CONS, defParcel } from './data.js';

export default function ParcelsTab({ prop, updateProp }) {
  const { t } = useTheme();
  const parcels = prop.parcels || [];
  const [editId, setEditId] = useState(null);
  const [buf, setBuf] = useState({});

  function addParcel() {
    const np = defParcel(parcels.length);
    updateProp(prop.id, { parcels:[...parcels,np] });
    setEditId(np.id); setBuf({...np});
  }
  function save() {
    updateProp(prop.id, { parcels: parcels.map(p=>p.id===editId?{...buf}:p) });
    setEditId(null);
  }
  function del(id) {
    if (window.confirm('Remove this parcel?'))
      updateProp(prop.id, { parcels: parcels.filter(p=>p.id!==id) });
  }

  const needsCons = parcels.filter(p=>p.consolidationStatus==='recommended').length;
  const needsEase = parcels.filter(p=>p.consolidationStatus==='easement_recommended').length;
  const totalSF   = parcels.reduce((s,p)=>s+(parseFloat(String(p.sqft).replace(/\D/g,''))||0),0);

  const fld = (label, key, placeholder='') => (
    <div style={{ flex:1, minWidth:140 }}>
      <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>{label}</label>
      <input style={inp(t)} placeholder={placeholder} value={buf[key]||''} onChange={e=>setBuf({...buf,[key]:e.target.value})} />
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Parcels & Associated Lots</div>
          <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>All tax parcels and associated land in this property complex.</div>
        </div>
        <button style={btn(t,'gold')} onClick={addParcel}>+ Add Parcel</button>
      </div>

      {/* Summary */}
      {parcels.length > 0 && (
        <div style={{ display:'flex', gap:20, background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:6, padding:'12px 18px', marginBottom:16, flexWrap:'wrap' }}>
          <Stat val={parcels.length} label="Parcels" />
          {totalSF > 0 && <Stat val={totalSF.toLocaleString()+' SF'} label="Combined SF" />}
          {needsCons > 0 && <Stat val={needsCons} label="Consolidate" color={t.green} />}
          {needsEase > 0 && <Stat val={needsEase} label="Easement Needed" color={t.gold} />}
        </div>
      )}

      {/* Guidance */}
      {(needsCons > 0 || needsEase > 0) && (
        <div style={{ background:'#fffef5', border:`1px solid #e8d080`, borderRadius:6, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#333', lineHeight:1.7 }}>
          <strong>⚖️ NJ Lot Consolidation:</strong> Adjacent same-owner lots can be merged via the local planning board ("lot merger"). Takes 2–6 months. Strengthens financing and development permits.{' '}
          <strong>Across-street lots:</strong> Use a recorded parking easement or shared-use covenant — formal merger not possible across a public street. CRDA can facilitate in a priority corridor.
        </div>
      )}

      {parcels.length === 0 && <div style={{ color:t.textMuted, fontSize:14, textAlign:'center', padding:40 }}>No parcels added yet.</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {parcels.map(p => {
          const rel = REL[p.relationship]||REL.other;
          const con = CONS[p.consolidationStatus]||CONS.not_applicable;
          const isEdit = editId===p.id;
          return (
            <div key={p.id} style={{ background:t.bgHover, border:`1px solid ${t.border}`, borderRadius:6, padding:'13px 16px', borderLeft:`4px solid ${rel.color}` }}>
              {isEdit ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {fld('Label','label','Main Building')}
                    {fld('Address','address','')}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {fld('Block/Lot #','blockLot','Block 25, Lot 4')}
                    {fld('Zone','zone','')}
                    {fld('Sq Ft','sqft','')}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:140 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Relationship</label>
                      <select style={{ ...inp(t), padding:'7px 10px' }} value={buf.relationship||'adjacent'} onChange={e=>setBuf({...buf,relationship:e.target.value})}>
                        {Object.entries(REL).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div style={{ flex:1, minWidth:140 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Consolidation Status</label>
                      <select style={{ ...inp(t), padding:'7px 10px' }} value={buf.consolidationStatus||'not_applicable'} onChange={e=>setBuf({...buf,consolidationStatus:e.target.value})}>
                        {Object.entries(CONS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Use / Description</label>
                    <textarea style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'7px 10px', borderRadius:4, fontFamily:'inherit', fontSize:13, width:'100%', minHeight:50, resize:'vertical', boxSizing:'border-box' }} value={buf.use||''} onChange={e=>setBuf({...buf,use:e.target.value})} /></div>
                  <div><label style={{ fontSize:11, fontWeight:600, color:t.textSub, display:'block', marginBottom:3 }}>Notes</label>
                    <textarea style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'7px 10px', borderRadius:4, fontFamily:'inherit', fontSize:13, width:'100%', minHeight:50, resize:'vertical', boxSizing:'border-box' }} value={buf.notes||''} onChange={e=>setBuf({...buf,notes:e.target.value})} /></div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={btn(t,'green')} onClick={save}>Save Parcel</button>
                    <button style={btn(t)} onClick={()=>setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <span style={{ fontSize:11, fontWeight:700, color:rel.color, background:rel.bg, padding:'2px 8px', borderRadius:10, display:'inline-block', marginBottom:5 }}>{rel.label}</span>
                      <div style={{ fontSize:15, fontWeight:700, color:t.text }}>{p.label}</div>
                      {p.address && <div style={{ fontSize:13, color:t.textSub }}>{p.address}</div>}
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={{ ...btn(t), padding:'4px 10px', fontSize:12 }} onClick={()=>{setBuf({...p});setEditId(p.id);}}>✎ Edit</button>
                      <button style={{ ...btn(t), padding:'4px 10px', fontSize:12, color:t.red }} onClick={()=>del(p.id)}>🗑</button>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap', margin:'8px 0' }}>
                    {p.blockLot && <Detail label="Block/Lot" val={p.blockLot} />}
                    {p.zone     && <Detail label="Zone" val={p.zone} />}
                    {p.sqft     && <Detail label="Sq Ft" val={p.sqft} />}
                    <Detail label="Consolidation" val={con.label} color={con.color} />
                  </div>
                  {p.use   && <div style={{ fontSize:13, color:t.text, lineHeight:1.6 }}>{p.use}</div>}
                  {p.notes && <div style={{ fontSize:12, color:t.textMuted, fontStyle:'italic', marginTop:4 }}>📝 {p.notes}</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ val, label, color }) {
  const { t } = useTheme();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      <span style={{ fontSize:18, fontWeight:700, color:color||t.text }}>{val}</span>
      <span style={{ fontSize:10, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Courier New',monospace" }}>{label}</span>
    </div>
  );
}
function Detail({ label, val, color }) {
  const { t } = useTheme();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      <span style={{ fontSize:10, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:"'Courier New',monospace" }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:color||t.text }}>{val}</span>
    </div>
  );
}
