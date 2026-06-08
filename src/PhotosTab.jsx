import { useState } from 'react';
import { useTheme, btn, inp } from './theme.js';
import { uid, convertDriveUrl } from './data.js';

export default function PhotosTab({ prop, updateProp }) {
  const { t } = useTheme();
  const photos = prop.photos || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ url:'', caption:'' });
  const [lightbox, setLightbox] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [capBuf, setCapBuf] = useState('');
  const [errors, setErrors] = useState({});
  const [albumLink, setAlbumLink] = useState(prop.photoAlbumLink||'');
  const [editAlbum, setEditAlbum] = useState(false);

  function addPhoto() {
    if (!form.url.trim()) return;
    const url = convertDriveUrl(form.url.trim());
    updateProp(prop.id, { photos:[...photos,{id:uid(),url,rawUrl:form.url.trim(),caption:form.caption.trim()}] });
    setForm({url:'',caption:''}); setShowAdd(false);
  }
  function removePhoto(i) {
    if (window.confirm('Remove this photo?'))
      updateProp(prop.id, { photos:photos.filter((_,idx)=>idx!==i) });
  }
  function saveCaption(i) {
    updateProp(prop.id, { photos:photos.map((p,idx)=>idx===i?{...p,caption:capBuf}:p) });
    setEditIdx(null);
  }
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateProp(prop.id, { photos:[...photos,{id:uid(),url:ev.target.result,rawUrl:'[uploaded]',caption:file.name}] });
    };
    reader.readAsDataURL(file);
  }
  function saveAlbum() {
    updateProp(prop.id, { photoAlbumLink:albumLink });
    setEditAlbum(false);
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:t.text }}>Property Photos</div>
          <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>Upload from device, paste a Google Drive link, or link to a photo album.</div>
        </div>
        <button style={btn(t,'gold')} onClick={()=>setShowAdd(v=>!v)}>{showAdd?'✕ Cancel':'📷 Add Photo'}</button>
      </div>

      {/* Photo album link */}
      <div style={{ background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:'12px 16px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:editAlbum?10:0 }}>
          <span style={{ fontSize:13, fontWeight:600, color:t.text }}>📁 Photo Album / Folder Link</span>
          <button style={{ ...btn(t), padding:'3px 10px', fontSize:12 }} onClick={()=>setEditAlbum(v=>!v)}>
            {editAlbum?'Cancel':'Edit'}
          </button>
        </div>
        {editAlbum ? (
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input style={inp(t)} placeholder="Paste Google Drive folder or Google Photos album URL…" value={albumLink} onChange={e=>setAlbumLink(e.target.value)} />
            <button style={btn(t,'green')} onClick={saveAlbum}>Save</button>
          </div>
        ) : prop.photoAlbumLink ? (
          <a href={prop.photoAlbumLink} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:13, color:t.gold, textDecoration:'none', marginTop:6, display:'block' }}>
            🔗 Open Photo Album →
          </a>
        ) : (
          <div style={{ fontSize:12, color:t.textMuted, marginTop:4 }}>No album linked yet. Click Edit to add a Google Drive or Google Photos folder link.</div>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background:t.bgAlt, border:`1px solid ${t.border}`, borderRadius:8, padding:'16px', marginBottom:20, display:'flex', flexDirection:'column', gap:12 }}>
          {/* Upload from device */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:t.text, display:'block', marginBottom:6 }}>Upload from your device</label>
            <label style={{ ...btn(t,'dark'), display:'inline-block', cursor:'pointer', textAlign:'center' }}>
              📱 Choose Photo from Camera Roll
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display:'none' }} />
            </label>
          </div>

          <div style={{ textAlign:'center', color:t.textMuted, fontSize:13 }}>— or paste a URL —</div>

          <div>
            <label style={{ fontSize:13, fontWeight:600, color:t.text, display:'block', marginBottom:6 }}>Image URL or Google Drive Link</label>
            <input style={inp(t)} placeholder="Paste URL here…" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} />
            {form.url.includes('drive.google.com') && (
              <div style={{ fontSize:12, color:t.green, marginTop:5 }}>✓ Google Drive link detected — will auto-convert</div>
            )}
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:t.text, display:'block', marginBottom:6 }}>Caption (optional)</label>
            <input style={inp(t)} placeholder="e.g. Front exterior, Roof damage, Parking lot…" value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})} />
          </div>

          {/* Drive instructions */}
          <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:6, padding:'12px 14px' }}>
            <div style={{ fontWeight:600, fontSize:12, color:t.textSub, marginBottom:6 }}>📌 How to get links from Google Drive:</div>
            {['Open Google Drive and find the photo', 'Right-click → "Get link"', 'Set sharing to "Anyone with the link" (viewer)', 'Copy and paste above — converts automatically'].map((s,i)=>(
              <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:t.textSub, marginBottom:4 }}>
                <span style={{ background:t.gold, color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                {s}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={btn(t,'green')} onClick={addPhoto}>Add Photo</button>
            <button style={btn(t)} onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length===0 && !showAdd && (
        <div style={{ border:`2px dashed ${t.border}`, borderRadius:8, padding:48, textAlign:'center', color:t.textMuted }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📷</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>No photos yet</div>
          <div style={{ fontSize:13 }}>Upload from your device or add Google Drive links.</div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
          {photos.map((photo,i) => (
            <div key={photo.id||i} style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:8, overflow:'hidden', boxShadow:t.shadowSm }}>
              <div style={{ position:'relative', paddingBottom:'70%', background:t.bgAlt, cursor:'pointer' }} onClick={()=>!errors[i]&&setLightbox(i)}>
                {errors[i] ? (
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:t.textMuted, padding:10, textAlign:'center', fontSize:12 }}>
                    ⚠️<br/>Image couldn't load.<br/>Check URL or Drive sharing.
                  </div>
                ) : (
                  <img src={photo.url} alt={photo.caption||`Photo ${i+1}`}
                    style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }}
                    onError={()=>setErrors(prev=>({...prev,[i]:true}))} />
                )}
              </div>
              <div style={{ padding:'9px 12px' }}>
                {editIdx===i ? (
                  <div style={{ display:'flex', gap:6 }}>
                    <input style={{ ...inp(t), fontSize:12, padding:'5px 8px' }} value={capBuf} onChange={e=>setCapBuf(e.target.value)} autoFocus />
                    <button style={{ ...btn(t,'green'), padding:'4px 8px', fontSize:11 }} onClick={()=>saveCaption(i)}>✓</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13, color:photo.caption?t.text:t.textMuted, fontStyle:photo.caption?'normal':'italic', flex:1 }}>
                      {photo.caption||'No caption'}
                    </span>
                    <div style={{ display:'flex', gap:4 }}>
                      <button style={{ ...btn(t), padding:'3px 7px', fontSize:11 }} onClick={()=>{setEditIdx(i);setCapBuf(photo.caption||'');}}>✎</button>
                      <button style={{ ...btn(t), padding:'3px 7px', fontSize:11, color:t.red }} onClick={()=>removePhoto(i)}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox!==null && photos[lightbox] && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={()=>setLightbox(null)}>
          <div style={{ display:'flex', alignItems:'center', gap:16, maxWidth:'90vw', position:'relative' }} onClick={e=>e.stopPropagation()}>
            {lightbox>0&&<button onClick={()=>setLightbox(lightbox-1)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', fontSize:36, width:50, height:50, borderRadius:'50%', cursor:'pointer' }}>‹</button>}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <img src={photos[lightbox].url} alt={photos[lightbox].caption||''} style={{ maxWidth:'80vw', maxHeight:'75vh', objectFit:'contain', borderRadius:6 }} />
              {photos[lightbox].caption&&<div style={{ color:'#fff', fontSize:15, fontStyle:'italic' }}>{photos[lightbox].caption}</div>}
              <div style={{ color:'#888', fontSize:12 }}>{lightbox+1} of {photos.length}</div>
            </div>
            {lightbox<photos.length-1&&<button onClick={()=>setLightbox(lightbox+1)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', fontSize:36, width:50, height:50, borderRadius:'50%', cursor:'pointer' }}>›</button>}
            <button onClick={()=>setLightbox(null)} style={{ position:'absolute', top:-44, right:0, background:'none', border:'none', color:'#fff', fontSize:24, cursor:'pointer' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
