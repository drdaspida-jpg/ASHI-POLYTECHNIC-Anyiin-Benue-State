const API_BASE = window.ASHI_API_BASE || 'https://ashi-polytechnic-api.YOUR-SUBDOMAIN.workers.dev';
const state = { docs: [] };
const $ = (id) => document.getElementById(id);

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function formatSize(bytes) { if (!bytes) return ''; const units=['B','KB','MB']; let i=0,n=bytes; while(n>=1024&&i<units.length-1){n/=1024;i++;} return `${n.toFixed(i?1:0)} ${units[i]}`; }
function render() {
  const term = $('search').value.toLowerCase().trim();
  const cat = $('category').value;
  const docs = state.docs.filter(d => (!cat || d.category === cat) && (!term || `${d.title} ${d.description||''} ${d.category}`.toLowerCase().includes(term)));
  $('documents').innerHTML = docs.length ? docs.map(d => `<article class="card"><div class="pdf">PDF</div><div class="body"><span class="tag">${escapeHtml(d.category)}</span><h2>${escapeHtml(d.title)}</h2><p>${escapeHtml(d.description || 'Official Ashi Polytechnic document.')}</p><small>${formatSize(d.file_size)}${d.file_size?' · ':''}${new Date(d.created_at).toLocaleDateString()}</small><a class="btn" href="${API_BASE}/api/documents/${encodeURIComponent(d.id)}/download" target="_blank" rel="noopener">View / Download</a></div></article>`).join('') : '<div class="empty">No documents found.</div>';
}
async function load() {
  try {
    const r = await fetch(`${API_BASE}/api/documents`);
    if (!r.ok) throw new Error('Document service unavailable');
    state.docs = await r.json();
    $('status').textContent = `${state.docs.length} document${state.docs.length === 1 ? '' : 's'} available`;
    render();
  } catch (e) {
    $('status').textContent = 'Test mode: connect the Cloudflare Worker URL to load live documents.';
    $('documents').innerHTML = `<div class="empty"><strong>Backend not connected yet.</strong><br>Frontend is ready. Set <code>ASHI_API_BASE</code> to the deployed Worker URL after Cloudflare setup.</div>`;
  }
}
$('search').addEventListener('input', render); $('category').addEventListener('change', render); load();
