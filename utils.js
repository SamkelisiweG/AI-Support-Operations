/* ============================================================
   digifyCX AI Support Operations Portal — Shared Utilities
   All data now flows through the Cloudflare Worker API.
   ============================================================ */

/* ── Session helpers (agent auth token) ── */
function getAgentToken() {
  return sessionStorage.getItem('dcx_agent_token');
}

function setAgentToken(token) {
  sessionStorage.setItem('dcx_agent_token', token);
}

function clearAgentSession() {
  sessionStorage.removeItem('dcx_agent_token');
}

function requireAgentAuth() {
  if (!getAgentToken()) {
    window.location.href = 'agent-login.html';
  }
}

function agentLogout() {
  clearAgentSession();
  window.location.href = 'login.html';
}

/* ── Generic API call wrapper ── */
async function apiCall(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAgentToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAgentSession();
    window.location.href = 'agent-login.html';
    throw new Error('Unauthorized');
  }

  return { ok: res.ok, status: res.status, data };
}

/* ── Ticket submission (public) ── */
async function submitTicket(payload) {
  return apiCall(ENDPOINTS.submit, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ── Requestor ticket lookup (public, scoped to id + email) ── */
async function lookupTicket(id, email) {
  return apiCall(ENDPOINTS.lookup, {
    method: 'POST',
    body: JSON.stringify({ id, email }),
  });
}

/* ── Agent login ── */
async function agentLogin(pin) {
  return apiCall(ENDPOINTS.agentLogin, {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

/* ── Agent: get all tickets ── */
async function fetchAllTickets() {
  return apiCall(ENDPOINTS.allTickets, { method: 'GET' });
}

/* ── Agent: update ticket status ── */
async function updateTicketStatus(id, status) {
  return apiCall(ENDPOINTS.updateStatus(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/* ── Formatting helpers ── */
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

/* ── Mark active nav link ── */
function markActiveNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const href = btn.getAttribute('href') || '';
    btn.classList.toggle('active', href === page || href.endsWith(page));
  });
}

document.addEventListener('DOMContentLoaded', markActiveNav);
