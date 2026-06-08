import { useTheme, card } from './theme.jsx';
import { parseDollar, fmt$, fmtHrs } from './data.js';

export default function SavingsTab({ prop }) {
  const { t } = useTheme();
  const tasks = (prop.tasks || []).filter(tk =>
    tk.status === 'done' && (tk.marketRate || tk.actualCost || tk.proTime || tk.actualTime)
  );

  const totalMarket   = tasks.reduce((s,tk) => s+(parseDollar(tk.marketRate)||0),0);
  const totalActual   = tasks.reduce((s,tk) => s+(parseDollar(tk.actualCost)||0),0);
  const totalSavings  = totalMarket - totalActual;
  const totalProTime  = tasks.reduce((s,tk) => s+(parseFloat(tk.proTime||'')||0),0);
  const totalActTime  = tasks.reduce((s,tk) => s+(parseFloat(tk.actualTime||'')||0),0);
  const totalTimeSaved = totalProTime - totalActTime;

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:48, color:t.textMuted }}>
        <div style={{ fontSize:36, marginBottom:12 }}>💰</div>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>No savings recorded yet</div>
        <div style={{ fontSize:13 }}>
          Complete tasks and add Market Rate + Actual Cost to start tracking savings.
          <br/>This shows what you saved vs using licensed professionals.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:16 }}>
        💰 Savings vs Licensed Professional Rates
      </div>

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
        <KPI label="Market Rate Total"  val={fmt$(String(totalMarket))}  color={t.red}    bg={t.redBg} />
        <KPI label="Actual Cost Total"  val={fmt$(String(totalActual))}  color={t.textSub} bg={t.bgAlt} />
        <KPI label="Total $ Saved"      val={fmt$(String(totalSavings))} color='#9a5500'  bg={t.goldBg} big />
        {totalProTime > 0 && <KPI label="Pro Time Estimate" val={fmtHrs(String(totalProTime))} color={t.textSub} bg={t.bgAlt} />}
        {totalActTime > 0 && <KPI label="Actual Time Spent" val={fmtHrs(String(totalActTime))} color={t.textSub} bg={t.bgAlt} />}
        {totalTimeSaved > 0 && <KPI label="Time Saved"     val={totalTimeSaved.toFixed(1)+' hrs'} color={t.green} bg={t.greenBg} />}
      </div>

      {/* Savings pct badge */}
      {totalMarket > 0 && (
        <div style={{ background:t.greenBg, border:`1px solid ${t.green}40`, borderRadius:8, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:28, fontWeight:700, color:t.green }}>
            {Math.round((totalSavings/totalMarket)*100)}%
          </div>
          <div style={{ fontSize:13, color:t.textSub }}>
            saved vs hiring licensed professionals for these {tasks.length} completed {tasks.length===1?'job':'jobs'}
          </div>
        </div>
      )}

      {/* Job-by-job table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:t.bgAlt }}>
              {['Task','Assignee','Market Rate','Actual Cost','$ Saved','Pro Time','Actual Time','Time Saved'].map(h => (
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', color:t.textMuted, fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`2px solid ${t.border}`, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((tk, i) => {
              const m = parseDollar(tk.marketRate), a = parseDollar(tk.actualCost);
              const saved = m!==null&&a!==null ? m-a : null;
              const pt = parseFloat(tk.proTime||''), at2 = parseFloat(tk.actualTime||'');
              const ts = !isNaN(pt)&&!isNaN(at2) ? pt-at2 : null;
              return (
                <tr key={tk.id} style={{ background: i%2===0?t.bgCard:t.bgAlt }}>
                  <td style={{ padding:'9px 12px', color:t.text, borderBottom:`1px solid ${t.borderLight}` }}>{tk.text}</td>
                  <td style={{ padding:'9px 12px', color:t.textSub, borderBottom:`1px solid ${t.borderLight}` }}>{tk.assignee||'—'}</td>
                  <td style={{ padding:'9px 12px', color:t.red, borderBottom:`1px solid ${t.borderLight}`, fontWeight:600 }}>{m!==null?fmt$(String(m)):'—'}</td>
                  <td style={{ padding:'9px 12px', color:t.textSub, borderBottom:`1px solid ${t.borderLight}` }}>{a!==null?fmt$(String(a)):'—'}</td>
                  <td style={{ padding:'9px 12px', color:'#9a5500', borderBottom:`1px solid ${t.borderLight}`, fontWeight:700 }}>{saved!==null?fmt$(String(saved)):'—'}</td>
                  <td style={{ padding:'9px 12px', color:t.textSub, borderBottom:`1px solid ${t.borderLight}` }}>{!isNaN(pt)?pt+' hrs':'—'}</td>
                  <td style={{ padding:'9px 12px', color:t.textSub, borderBottom:`1px solid ${t.borderLight}` }}>{!isNaN(at2)?at2+' hrs':'—'}</td>
                  <td style={{ padding:'9px 12px', color:ts!==null&&ts>0?t.green:t.textMuted, borderBottom:`1px solid ${t.borderLight}`, fontWeight:ts!==null&&ts>0?700:400 }}>{ts!==null?ts.toFixed(1)+' hrs':'—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:t.goldBg }}>
              <td colSpan={2} style={{ padding:'10px 12px', fontWeight:700, color:t.gold, fontSize:13 }}>TOTAL</td>
              <td style={{ padding:'10px 12px', color:t.red, fontWeight:700 }}>{fmt$(String(totalMarket))}</td>
              <td style={{ padding:'10px 12px', color:t.textSub, fontWeight:700 }}>{fmt$(String(totalActual))}</td>
              <td style={{ padding:'10px 12px', color:'#9a5500', fontWeight:800, fontSize:15 }}>{fmt$(String(totalSavings))}</td>
              <td style={{ padding:'10px 12px', color:t.textSub }}>{totalProTime>0?totalProTime+' hrs':'—'}</td>
              <td style={{ padding:'10px 12px', color:t.textSub }}>{totalActTime>0?totalActTime+' hrs':'—'}</td>
              <td style={{ padding:'10px 12px', color:t.green, fontWeight:700 }}>{totalTimeSaved>0?totalTimeSaved.toFixed(1)+' hrs':'—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, val, color, bg, big }) {
  const { t } = useTheme();
  return (
    <div style={{ background:bg||t.bgAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:'12px 14px' }}>
      <div style={{ fontSize:10, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:"'Courier New',monospace", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:big?22:17, fontWeight:700, color }}>{val}</div>
    </div>
  );
}
