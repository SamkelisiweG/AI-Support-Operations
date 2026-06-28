/* ============================================================
   digifyCX AI Support Operations Portal — Shared Utilities
   ============================================================ */

const AI_SYSTEM = `You are an AI support operations classifier for digifyCX, a CX agency. Analyse the request and return ONLY valid JSON with these exact fields:
{"category":"one of: Technical, Process, Communication, Data, Integration, Onboarding, Billing, Security","urgency":"one of: Low, Medium, High, Critical","summary":"2-sentence plain English summary","next_action":"specific next action the team should take","clarification_needed":true or false,"clarification_question":"question to ask if true, else null","estimated_effort":"one of: Quick (<1h), Half-day, Full-day, Multi-day, Week+","confidence":0-100}
Return ONLY the JSON object. No markdown. No explanation.`;

/* ── Storage ── */
function getRequests() {
  try { return JSON.parse(localStorage.getItem('dcx_requests') || '[]'); }
  catch { return []; }
}

function saveRequests(reqs) {
  localStorage.setItem('dcx_requests', JSON.stringify(reqs));
}

function getLog() {
  try { return JSON.parse(localStorage.getItem('dcx_log') || '[]'); }
  catch { return []; }
}

function saveLog(log) {
  localStorage.setItem('dcx_log', JSON.stringify(log));
}

function addLog(msg) {
  const log = getLog();
  log.unshift({ msg, time: ts() });
  if (log.length > 60) log.pop();
  saveLog(log);
}

/* ── Helpers ── */
let _counter = null;
function uid() {
  if (_counter === null) {
    const reqs = getRequests();
    _counter = reqs.length > 0
      ? Math.max(...reqs.map(r => parseInt(r.id.replace('TKT-', ''), 10))) 
      : 1000;
  }
  return 'TKT-' + (++_counter);
}

function ts() {
  return new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function dtStr() {
  return new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Badges ── */
function urgBadge(u) {
  const m = { Low: 'green', Medium: 'amber', High: 'red', Critical: 'red' };
  return `<span class="badge badge-${m[u] || 'gray'}">${u || '—'}</span>`;
}

function statusBadge(s) {
  const m = { Open: 'blue', 'In progress': 'amber', Resolved: 'green' };
  return `<span class="badge badge-${m[s] || 'gray'}">${s}</span>`;
}

/* ── Toast ── */
function toast(msg, ok = true) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.querySelector('i').className = ok ? 'ti ti-check' : 'ti ti-alert-circle';
  document.getElementById('toast-msg').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

/* ── AI call ── */
async function classifyWithAI(payload) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: AI_SYSTEM,
      messages: [{
        role: 'user',
        content: `TYPE: ${payload.type}\nPRIORITY: ${payload.priority}\nTITLE: ${payload.title}\nDESCRIPTION: ${payload.description}\nSYSTEM: ${payload.system || 'Not specified'}\nNOTES: ${payload.notes || 'None'}`
      }]
    })
  });
  const data = await r.json();
  const raw = data.content.map(c => c.text || '').join('');
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

/* ── Mark active nav link ── */
function markActiveNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const href = btn.getAttribute('href') || '';
    btn.classList.toggle('active', href === page || href.endsWith(page));
  });
}

document.addEventListener('DOMContentLoaded', markActiveNav);
