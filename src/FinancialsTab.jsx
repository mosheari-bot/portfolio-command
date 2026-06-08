import { useTheme } from './theme.js';
import { FIN_FIELDS, FIN_GROUPS, fmt$, parseDollar, calcNOI, calcEquity, calcRehabLeft } from './data.js';

export default function FinancialsTab({ prop, updateProp }) {
  const { t } = useTheme();
  const fin = prop.financials || {};

  function upd(k, v) {
    updateProp(prop.id, { financials: { ...fin, [k]: v } });
  }

  const eq  = calcEquity(fin);
  const n   = calcNOI(fin);
  const rem = calcRehabLeft(fin);
  const up  = parseDollar(fin.projectedValue) !== null && parseDollar(fin.currentValue) !== null
    ? parseDollar(fin.projectedValue) - parseDollar(fin.currentValue) : null;

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:16 }}>Financial Summary</div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
        <KPI label="Equity"           val={eq}  color={eq!==null?(eq>=0?t.green:t.red):'#aaa'}    sub="Value minus Debt" />
        <KPI label="Annual NOI"       val={n}   color={n!==null?(n>=0?t.green:t.red):'#aaa'}     sub="Income minus Expenses ×12" />
        <KPI label="Rehab Remaining"  val={rem} color={rem!==null?(rem>0?t.gold:t.green):'#aaa'}  sub="Budget minus Spent" />
        <KPI label="Upside"           val={up}  color="#1a3a6b" sub="Projected minus Current" />
      </div>

      {/* Input groups */}
      {FIN_GROUPS.map(grp => (
        <div key={grp} style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:"'Courier New',monospace", borderBottom:`1px solid ${t.border}`, paddingBottom:6, marginBottom:12 }}>
            {grp}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
            {FIN_FIELDS.filter(f=>f.group===grp).map(f => (
              <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <label style={{ fontSize:13, color:t.textSub, fontWeight:600 }}>{f.label}</label>
                <div style={{ display:'flex', alignItems:'center', border:`1px solid ${t.border}`, borderRadius:4, background:t.bgCard, overflow:'hidden' }}>
                  <span style={{ padding:'8px 10px', background:t.bgAlt, color:t.textMuted, fontSize:14, fontWeight:700, borderRight:`1px solid ${t.border}` }}>$</span>
                  <input type="text" placeholder="0"
                    style={{ border:'none', outline:'none', padding:'8px 10px', fontSize:14, color:t.text, flex:1, fontFamily:'inherit', background:'transparent' }}
                    value={fin[f.key]||''} onChange={e=>upd(f.key,e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Notes */}
      <div style={{ marginTop:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:"'Courier New',monospace", marginBottom:8 }}>
          Financial Notes
        </div>
        <textarea
          style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'10px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', minHeight:80, resize:'vertical', boxSizing:'border-box' }}
          placeholder="Financing terms, lender info, deal notes, assumptions…"
          value={fin.notes||''} onChange={e=>upd('notes',e.target.value)} />
      </div>
    </div>
  );
}

function KPI({ label, val, color, sub }) {
  const { t } = useTheme();
  return (
    <div style={{ background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:'13px 15px' }}>
      <div style={{ fontSize:10, color:t.textMuted, fontFamily:"'Courier New',monospace", textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:700, color, marginBottom:3 }}>
        {val !== null && val !== undefined ? fmt$(String(val)) : '—'}
      </div>
      <div style={{ fontSize:11, color:t.textMuted }}>{sub}</div>
    </div>
  );
}
