const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS', 'access-control-allow-headers': 'Authorization,Content-Type' } });
const authToken = request => { const v = request.headers.get('Authorization') || ''; return v.startsWith('Bearer ') ? v.slice(7) : null; };
async function db(env, path, init = {}) { const key = env.SUPABASE_SERVICE_ROLE_KEY; if (!key) throw Error('SUPABASE_SERVICE_ROLE_KEY is not configured'); const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json', ...(init.headers||{}) } }); if (!r.ok) throw Error(await r.text()); return r; }
async function userFrom(request, env) { const token=authToken(request); if(!token) return null; const r=await fetch(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:env.SUPABASE_ANON_KEY||env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${token}`}}); return r.ok ? r.json() : null; }
async function admin(user,env){ if(!user)return false; const r=await db(env,`admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`); return (await r.json()).length===1; }
export default { async fetch(request,env){
  if(request.method==='OPTIONS') return json({ok:true}); const url=new URL(request.url);
  try {
    if(url.pathname==='/api/health') return json({ok:true,service:'ashi-polytechnic-api'});
    if(url.pathname==='/api/documents'&&request.method==='GET'){
      const user=await userFrom(request,env); const elevated=await admin(user,env); let filter='&visibility=eq.public'; if(user) filter=elevated?'': '&visibility=in.(public,authorized)';
      const category=url.searchParams.get('category'); if(category) filter+=`&category=eq.${encodeURIComponent(category)}`;
      const r=await db(env,`documents?select=id,title,description,category,file_name,mime_type,file_size,visibility,created_at&order=created_at.desc${filter}`); return json(await r.json());
    }
    if(url.pathname==='/api/documents/upload'&&request.method==='POST'){
      const user=await userFrom(request,env); if(!(await admin(user,env))) return json({error:'Admin access required'},403);
      const form=await request.formData(), file=form.get('file'); if(!(file instanceof File)) return json({error:'PDF file is required'},400); if(file.type!=='application/pdf') return json({error:'Only PDF files are allowed'},400); if(file.size>25*1024*1024)return json({error:'Maximum PDF size is 25 MB'},400);
      const category=String(form.get('category')||'other'); const allowed=['admission','handbook','fees','forms','timetable','other']; if(!allowed.includes(category)) return json({error:'Invalid category'},400);
      const visibility=String(form.get('visibility')||'authorized'); if(!['public','authorized','admin'].includes(visibility))return json({error:'Invalid visibility'},400);
      const title=String(form.get('title')||file.name.replace(/\.pdf$/i,'')).trim(), description=String(form.get('description')||'').trim(), safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-'); const key=`documents/${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${safe}`;
      await env.DOCUMENTS_BUCKET.put(key,file.stream(),{httpMetadata:{contentType:'application/pdf'}});
      try { const r=await db(env,'documents',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({title,description,category,file_name:file.name,r2_key:key,mime_type:file.type,file_size:file.size,visibility,uploaded_by:user.id})}); return json((await r.json())[0],201); } catch(e){ await env.DOCUMENTS_BUCKET.delete(key); throw e; }
    }
    const m=url.pathname.match(/^\/api\/documents\/([^/]+)\/download$/); if(m&&request.method==='GET'){
      const r=await db(env,`documents?select=id,title,file_name,r2_key,mime_type,visibility&id=eq.${encodeURIComponent(m[1])}&limit=1`), rows=await r.json(), doc=rows[0]; if(!doc)return json({error:'Document not found'},404);
      const user=await userFrom(request,env), elevated=await admin(user,env); if(doc.visibility==='admin'&&!elevated)return json({error:'Admin authorization required'},403); if(doc.visibility==='authorized'&&!user)return json({error:'Login required'},401);
      const object=await env.DOCUMENTS_BUCKET.get(doc.r2_key); if(!object)return json({error:'PDF not found in storage'},404); return new Response(object.body,{headers:{'content-type':doc.mime_type,'content-disposition':`inline; filename="${doc.file_name.replace(/"/g,'')}"`,'cache-control':'private, max-age=300'}});
    }
    return json({error:'Not found'},404);
  } catch(e){ return json({error:e.message||'Server error'},500); }
} };
