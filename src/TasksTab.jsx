import { useState } from 'react';
import { useTheme, btn, inp } from './theme.jsx';
import { PRIORITY, STATUS, uid, parseDollar, fmt$ } from './data.js';

export default function TasksTab({ prop, updateProp }) {
  const { t } = useTheme();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text:'', priority:'soon', assignee:'', note:'', cost:'', marketRate:'', actualCost:'', proTime:'', actualTime:'' });
  const [editId, setEditId] = useState(null);

  const tasks = prop.tasks || [];
  const filtered = tasks.filter(tk => filter==='all' || tk.status===filter);

  function addTask() {
    if (!form.text.trim()) return;
    updateProp(prop.id, { tasks: [...tasks, { id:uid(), ...form, status:'todo' }] });
    setForm({ text:'', priority:'soon', assignee:'', note:'', cost:'', marketRate:'', actualCost:'', proTime:'', actualTime:'' });
    setShowAdd(false);
  }
  function updateTask(id, changes) {
    updateProp(prop.id, { tasks: tasks.map(tk => tk.id===id ? {...tk,...changes} : tk) });
  }
  function deleteTask(id) {
    if (window.confirm('Remove this task?'))
      updateProp(prop.id, { tasks: tasks.filter(tk => tk.id!==id) });
  }

  const fi = (label, key, placeholder='') => (
    <div style={{ flex:1, minWidth:120 }}>
      <label style={{ fontSize:11, fontWeight:600, color:t.textMuted, display:'block', marginBottom:3 }}>{label}</label>
      <input style={{ ...inp(t), padding:'7px 10px', fontSize:13 }} placeholder={placeholder}
        value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
    </div>
  );

  return (
    <div>
      {/* Filter + Add row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all','todo','inprogress','done'].map(s => (
            <button key={s} style={{ ...btn(t, filter===s?'gold':'default'), padding:'5px 12px', fontSize:12 }}
              onClick={() => setFilter(s)}>
              {s==='all'?'All':STATUS[s]?.label}
            </button>
          ))}
        </div>
        <button style={btn(t,'dark')} onClick={() => setShowAdd(v=>!v)}>
          {showAdd?'✕ Cancel':'+ Add Task'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:'16px', marginBottom:16, display:'flex', flexDirection:'column', gap:10 }}>
          <input style={inp(t)} placeholder="Task description…" value={form.text} onChange={e=>setForm({...form,text:e.target.value})} />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:120 }}>
              <label style={{ fontSize:11, fontWeight:600, color:t.textMuted, display:'block', marginBottom:3 }}>Priority</label>
              <select style={{ ...inp(t), padding:'7px 10px' }} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            {fi('Assigned To','assignee','Jeffrey / Nicot / Moshe / Boss')}
            {fi('Cost','cost','$')}
          </div>
          {/* Savings fields */}
          <div style={{ background:t.greenBg, border:`1px solid ${t.green}20`, borderRadius:6, padding:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:t.green, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>💰 Savings Tracking (optional)</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {fi('Market Rate (Pro Cost)','marketRate','$0')}
              {fi('Actual Cost Paid','actualCost','$0')}
              {fi('Pro Time Estimate (hrs)','proTime','0')}
              {fi('Actual Time Spent (hrs)','actualTime','0')}
            </div>
          </div>
          <input style={inp(t)} placeholder="Notes (optional)…" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} />
          <div style={{ display:'flex', gap:8 }}>
            <button style={btn(t,'green')} onClick={addTask}>Save Task</button>
            <button style={btn(t)} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.length===0 && <div style={{ color:t.textMuted, fontSize:14, textAlign:'center', padding:32 }}>No tasks in this filter.</div>}
        {filtered.map(task => (
          <TaskRow key={task.id} task={task} editId={editId} setEditId={setEditId}
            updateTask={updateTask} deleteTask={deleteTask} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, editId, setEditId, updateTask, deleteTask }) {
  const { t } = useTheme();
  const isEdit = editId === task.id;
  const [buf, setBuf] = useState({});
  const p = PRIORITY[task.priority] || PRIORITY.soon;
  const s = STATUS[task.status] || STATUS.todo;
  const savings = parseDollar(task.marketRate) !== null && parseDollar(task.actualCost) !== null
    ? parseDollar(task.marketRate) - parseDollar(task.actualCost) : null;
  const timeSaved = parseFloat(task.proTime||'') - parseFloat(task.actualTime||'');

  return (
    <div style={{ background:t.bgHover, borderRadius:6, padding:'11px 14px',
                  borderLeft:`4px solid ${p.color}`, opacity:task.status==='done'?0.6:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <select style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:s.color,
                         padding:'4px 8px', borderRadius:4, fontFamily:'inherit', fontSize:12,
                         cursor:'pointer', fontWeight:700 }}
          value={task.status} onChange={e=>updateTask(task.id,{status:e.target.value})}>
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {isEdit
          ? <input style={{ ...inp(t), flex:1, fontSize:14 }} value={buf.text} onChange={e=>setBuf({...buf,text:e.target.value})} />
          : <span style={{ flex:1, fontSize:14, color:t.text, fontWeight:500, textDecoration:task.status==='done'?'line-through':'none' }}>{task.text}</span>
        }
        <span style={{ background:p.bg, color:p.color, border:`1px solid ${p.border}`,
                       padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
          {p.label}
        </span>
        {isEdit
          ? <button style={{ ...btn(t,'green'), padding:'3px 10px', fontSize:12 }}
              onClick={() => { updateTask(task.id,buf); setEditId(null); }}>✓ Save</button>
          : <button style={{ background:'none', border:'none', color:t.textMuted, cursor:'pointer', fontSize:15, padding:'0 3px' }}
              onClick={() => { setBuf({...task}); setEditId(task.id); }}>✎</button>
        }
        <button style={{ background:'none', border:'none', color:t.red, cursor:'pointer', fontSize:15, padding:'0 3px' }}
          onClick={() => deleteTask(task.id)}>🗑</button>
      </div>

      {/* Edit savings fields */}
      {isEdit && (
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:10 }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <input style={{ ...inp(t), fontSize:13 }} placeholder="Assigned to…" value={buf.assignee||''} onChange={e=>setBuf({...buf,assignee:e.target.value})} />
            <input style={{ ...inp(t), fontSize:13 }} placeholder="Cost estimate…" value={buf.cost||''} onChange={e=>setBuf({...buf,cost:e.target.value})} />
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', background:t.greenBg, borderRadius:6, padding:10 }}>
            <input style={{ ...inp(t), fontSize:12 }} placeholder="Market rate $…" value={buf.marketRate||''} onChange={e=>setBuf({...buf,marketRate:e.target.value})} />
            <input style={{ ...inp(t), fontSize:12 }} placeholder="Actual cost $…" value={buf.actualCost||''} onChange={e=>setBuf({...buf,actualCost:e.target.value})} />
            <input style={{ ...inp(t), fontSize:12 }} placeholder="Pro time hrs…" value={buf.proTime||''} onChange={e=>setBuf({...buf,proTime:e.target.value})} />
            <input style={{ ...inp(t), fontSize:12 }} placeholder="Actual time hrs…" value={buf.actualTime||''} onChange={e=>setBuf({...buf,actualTime:e.target.value})} />
          </div>
          <input style={{ ...inp(t), fontSize:13 }} placeholder="Notes…" value={buf.note||''} onChange={e=>setBuf({...buf,note:e.target.value})} />
        </div>
      )}

      {/* Display metadata */}
      {!isEdit && (
        <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap', alignItems:'center' }}>
          {task.assignee && <span style={{ fontSize:12, color:t.textSub, background:t.bgAlt, padding:'2px 8px', borderRadius:10 }}>👤 {task.assignee}</span>}
          {task.cost && <span style={{ fontSize:12, color:t.green, fontWeight:600 }}>💰 {task.cost}</span>}
          {savings !== null && <span style={{ fontSize:12, color:'#9a5500', fontWeight:700, background:t.goldBg, padding:'2px 8px', borderRadius:10 }}>💰 Saved: {fmt$(String(savings))}</span>}
          {!isNaN(timeSaved) && task.proTime && task.actualTime && <span style={{ fontSize:12, color:t.green, fontWeight:600 }}>⏱ {timeSaved.toFixed(1)} hrs saved</span>}
          {task.note && <span style={{ fontSize:12, color:t.textMuted, fontStyle:'italic' }}>📝 {task.note}</span>}
        </div>
      )}
    </div>
  );
}
