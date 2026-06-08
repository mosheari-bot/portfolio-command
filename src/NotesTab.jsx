import { useState } from 'react';
import { useTheme, btn } from './theme.js';

export default function NotesTab({ prop, updateProp }) {
  const { t } = useTheme();
  const [editing, setEditing] = useState(false);
  const [buf, setBuf] = useState(prop.notes || '');

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Property Notes</div>
        <button style={{ ...btn(t), padding:'5px 12px', fontSize:12 }} onClick={() => { setEditing(v=>!v); setBuf(prop.notes||''); }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <textarea
            style={{ background:t.bgCard, border:`1px solid ${t.border}`, color:t.text, padding:'10px 12px', borderRadius:4, fontFamily:'inherit', fontSize:14, width:'100%', minHeight:200, resize:'vertical', lineHeight:1.8, boxSizing:'border-box' }}
            value={buf} onChange={e=>setBuf(e.target.value)} autoFocus />
          <button style={{ ...btn(t,'green'), alignSelf:'flex-start' }}
            onClick={() => { updateProp(prop.id,{notes:buf}); setEditing(false); }}>
            Save Notes
          </button>
        </div>
      ) : (
        <div style={{ fontSize:14, color:t.text, lineHeight:1.9, whiteSpace:'pre-wrap' }}>
          {prop.notes || <em style={{ color:t.textMuted }}>No notes yet. Click Edit to add.</em>}
        </div>
      )}
    </div>
  );
}
