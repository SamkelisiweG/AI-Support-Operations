/* ============================================================
   digifyCX Ops Portal — API Configuration
   Change ONLY this URL once your Worker is deployed.
   ============================================================ */

const API_BASE = 'https://your-worker.workers.dev';

const ENDPOINTS = {
  submit:      `${API_BASE}/submit`,
  lookup:      `${API_BASE}/ticket/lookup`,
  agentLogin:  `${API_BASE}/agent/login`,
  allTickets:  `${API_BASE}/tickets`,
  updateStatus: (id) => `${API_BASE}/ticket/${id}/status`,
};
