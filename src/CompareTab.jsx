import { useState } from 'react';
import { useTheme, btn } from './theme.js';
import { COMPARE_ROWS, STATUS_BADGE, defStrategy, uid } from './data.js';

export default function CompareTab({ prop, updateProp }) {
  const { t } = useTheme();
  const strategies = (prop.strategies && prop.strategies.length) ? prop.strategies : [defStrategy('Option 1','exploring')];
  const [editCell, setEditCell] = useState(null);

  function updateStrat(idx, changes) {
    const updated = strategies.map((s,i) => i===idx ? {...s,...changes} : s);
    updateProp(prop.id, { strategies: updated });
  }
  function addStrat() {
    updateProp(prop.id, { strategies: [...strategies, defStrategy(`Option ${strategies.length+1}`,'exploring')] });
  }
  function removeStrat(idx) {
    if (window.confirm(`Remove "${strategies[idx].name}" strategy?`))
      updateProp(prop.id, { strategies: strategies.filter((_,i)=>i!==idx) });
  }

  const DOT_GOOD  = ['#b50000','#d04000','#9a5500','#4a9b6a','#1a6b3a'];
  const DOT_RISK  = ['#1a6b3a','#4a9b6a','#9a5500','#d04000','#b50000'];
  const RISK_KEYS = ['difficulty','permitRisk'];
  const DOT_LABEL = ['—','Low','Mod-Low','Moderate','Mod-High','High'];

  function dotColor(key, val) {
    if (!val) return t.border;
    return RISK_KEYS.includes(key) ? DOT_RISK[val-1] : DOT_GOOD[val-1];
  }

  function Cell({ row, strat, idx }) {
    const val = strat[row.key];
    const isEdit = editCell?.idx===idx && editCell?.key===row.key;

    if (row.type==='badge') {
      const b = STATUS_BADGE[val||'exploring'];
      return (
        <select value={val||'exploring'} onChange={e=>updateStrat(idx,{[row.key]:e.target.value})}
          style={{ border:`2px solid ${b?.border||t.border}`, borderRadius:5, padding:'5px 10px',
                   fontFamily:'inherit', fontSize:13, background:b?.bg||t.bgCard,
                   color:b?.color||t.text, fontWeight:700, cursor:'pointer' }}>
          {Object.entries(STATUS_BADGE).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      );
    }
    if (row.type==='rating') {
      return (
        <div style={{ display:'flex', gap:5, alignItems:'center', justifyContent:'center' }}>
          {[1,2,3,4,5].map(n => (
            <div key={n}
              onClick={() => updateStrat(idx,{[row.key]: (val||0)===n ? 0 : n})}
              style={{ width:16, height:16, borderRadius:'50%', cursor:'pointer',
                       border:`2px solid ${t.border}`,
                       background: n<=(val||0) ? dotColor(row.key,val||0) : t.bgAlt,
                       transition:'background 0.15s' }} />
          ))}
          <span style={{ fontSize:12, color: (val||0)>0?dotColor(row.key,val):t.textMuted, marginLeft:4, minWidth:60 }}>
            {DOT_LABEL[val||0]}
          </span>
        </div>
      );
    }
    if (isEdit) {
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <textarea
            style={{ width:'100%', border:`1px solid ${t.border}`, borderRadius:4, padding:'7px 10px',
                     fontFamily:'inherit', fontSize:13, color:t.text, background:t.bgCard,
                     resize:'vertical', minHeight:70, boxSizing:'border-box' }}
            value={val||''} autoFocus
            onChange={e => updateStrat(idx,{[row.key]:e.target.value})} />
          <button style={{ ...btn(t,'green'), padding:'4px 12px', fontSize:12, alignSelf:'flex-start' }}
            onClick={() => setEditCell(null)}>Done</button>
        </div>
      );
    }
    return (
      <div onClick={() => setEditCell({idx,key:row.key})}
        style={{ cursor:'pointer', minHeight:30, padding:'3px 4px', borderRadius:4 }}>
        {val
          ? (row.type==='list'
              ? val.split('\n').filter(Boolean).map((item,i) => (
                  <div key={i} style={{ fontSize:13, color:t.text, padding:'1px 0', lineHeight:1.5 }}>{item}</div>
                ))
              : <span style={{ fontSize:13, color:t.text, lineHeight:1.5 }}>{val}</span>)
          : <span style={{ color:t.textMuted, fontSize:12, fontStyle:'italic' }}>Click to add…</span>
        }
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Strategy Comparison</div>
          <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>Click any cell to edit · Click dots to rate · Edit strategy name in column header</div>
        </div>
        <button style={btn(t,'gold')} onClick={addStrat}>+ Add Strategy</button>
      </div>

      <div style={{ overflowX:'auto', borderRadius:8, border:`1px solid ${t.border}` }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
          <thead>
            <tr>
              <th style={{ background:t.navy, color:'#ffffff', fontSize:11, fontWeight:700, fontFamily:"'Courier New',monospace", textTransform:'uppercase', letterSpacing:'0.05em', padding:'12px 16px', textAlign:'left', borderRight:`2px solid ${t.border}`, minWidth:160, whiteSpace:'nowrap' }}>
                CRITERIA
              </th>
              {strategies.map((s,i) => {
                const b = STATUS_BADGE[s.status||'exploring'];
                return (
                  <th key={i} style={{ background:t.navy, borderBottom:`3px solid ${b?.border||t.gold}`, borderRight:`1px solid rgba(255,255,255,0.1)`, padding:'12px 14px', textAlign:'left', minWidth:220, verticalAlign:'top' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
                      <input value={s.name||''} onChange={e=>updateStrat(i,{name:e.target.value})}
                        style={{ border:'none', background:'transparent', fontWeight:700, fontSize:15,
                                 color:b?.color||'#f5c842', fontFamily:'inherit', width:'100%', cursor:'text' }} />
                      <button onClick={()=>removeStrat(i)}
                        style={{ background:'rgba(255,80,80,0.15)', border:'1px solid rgba(255,80,80,0.4)', color:'#ff6060', cursor:'pointer', fontSize:11, padding:'2px 8px', borderRadius:4, flexShrink:0, fontFamily:'inherit', fontWeight:700 }}>
                        🗑 Remove
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row, ri) => (
              <tr key={row.key} style={{ background: ri%2===0?t.bgCard:t.bgAlt }}>
                <td style={{ padding:'11px 14px', fontWeight:700, fontSize:12, color:t.textSub, fontFamily:"'Courier New',monospace", textTransform:'uppercase', letterSpacing:'0.04em', borderRight:`2px solid ${t.border}`, borderBottom:`1px solid ${t.borderLight}`, whiteSpace:'nowrap' }}>
                  {row.label}
                </td>
                {strategies.map((s,ci) => (
                  <td key={ci} style={{ padding:'11px 14px', verticalAlign:'top', borderRight:`1px solid ${t.borderLight}`, borderBottom:`1px solid ${t.borderLight}` }}>
                    <Cell row={row} strat={s} idx={ci} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize:12, color:t.textMuted, marginTop:8 }}>💡 Click any text cell to edit · Click dots to score 1–5 · Edit strategy name directly in the column header</div>
    </div>
  );
}
