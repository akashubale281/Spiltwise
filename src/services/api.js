// Base API path with automatic fallback
const getApiEndpoints = (endpoint) => {
  const isBrowser = typeof window !== 'undefined';

  // If external backend URL is configured (e.g. on Render)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim()) {
    const cleanBase = envApiUrl.trim().replace(/\/+$/, '');
    return [`${cleanBase}/api${endpoint}`];
  }

  // Automatic Render production backend fallback when hosted on Vercel
  if (isBrowser && window.location.hostname && window.location.hostname.includes('vercel.app')) {
    return [`https://spiltwise1-backend.onrender.com/api${endpoint}`];
  }

  const hostname = isBrowser && window.location.hostname ? window.location.hostname : 'localhost';
  const currentPort = isBrowser && window.location.port ? window.location.port : '';

  // 1. Primary endpoint: relative '/api' (ideal when served from port 5000 or via Vite proxy)
  const primary = `/api${endpoint}`;

  // 2. Direct backend fallback: if running on port 5173 (dev) or another port, direct to 5000
  const directBackend = `http://${hostname}:5000/api${endpoint}`;

  if (currentPort === '5000') {
    return [primary];
  }
  return [primary, directBackend];
};

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('splitwise_token');
  const headers = {
    ...(options.headers || {})
  };

  // Only set Content-Type to JSON if not uploading FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const candidateUrls = getApiEndpoints(endpoint);
  let lastError = null;

  for (let i = 0; i < candidateUrls.length; i++) {
    const url = candidateUrls[i];
    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      return data;
    } catch (err) {
      lastError = err;
      // If it's an HTTP error with a server message (status 400, 401, 403, 404, etc.), do not retry network
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Load failed')) {
        throw err;
      }
      // If this was the last candidate, throw actionable error
      if (i === candidateUrls.length - 1) {
        console.error(`[API Network Error] Could not connect to Splitwise backend on ${url}:`, err);
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        throw new Error(`Unable to connect to backend server at http://${host}:5000. Please start the server using start.bat.`);
      }
      // Otherwise, retry next candidate (direct backend)
      console.warn(`[API Retry] Request to ${url} failed, attempting direct backend connection...`);
    }
  }

  throw lastError || new Error('Backend server is unreachable.');
};

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  sendLoginOtp: (payload) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify(payload) }),
  verifyLoginOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),

  // Multi-UPI Management
  getMyUpiIds: () => request('/auth/upi-ids'),
  addUpiId: (payload) => request('/auth/upi-ids', { method: 'POST', body: JSON.stringify(payload) }),
  setPrimaryUpiId: (id) => request(`/auth/upi-ids/${id}/primary`, { method: 'PUT' }),
  deleteUpiId: (id) => request(`/auth/upi-ids/${id}`, { method: 'DELETE' }),

  // Groups
  createGroup: (payload) => request('/groups', { method: 'POST', body: JSON.stringify(payload) }),
  getMyGroups: () => request('/groups/my'),
  getGroupById: (id) => request(`/groups/${id}`),
  joinGroupByCode: (code) => request('/groups/join', { method: 'POST', body: JSON.stringify({ code }) }),
  addMember: (groupId, email) => request(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
  removeMember: (groupId, memberId) => request(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE' }),
  leaveGroup: (groupId) => request(`/groups/${groupId}/leave`, { method: 'POST' }),
  transferAdmin: (groupId, newAdminId) => request(`/groups/${groupId}/transfer-admin`, { method: 'PUT', body: JSON.stringify({ newAdminId }) }),
  updateGroup: (groupId, payload) => request(`/groups/${groupId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteOrArchiveGroup: (groupId, action = 'delete') => request(`/groups/${groupId}?action=${action}`, { method: 'DELETE' }),

  // Expenses
  createExpense: (payload) => request('/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  getAllExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/expenses${query ? `?${query}` : ''}`);
  },
  getExpenseById: (id) => request(`/expenses/${id}`),
  updateExpense: (id, payload) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  addComment: (id, message) => request(`/expenses/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) }),
  toggleReaction: (id, emoji) => request(`/expenses/${id}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) }),

  // Settlements
  createSettlement: (payload) => request('/settlements', { method: 'POST', body: JSON.stringify(payload) }),
  getGroupSettlements: (groupId) => request(`/settlements/group/${groupId}`),
  getUserSettlements: () => request('/settlements/user/history'),
  cancelSettlement: (id) => request(`/settlements/${id}/cancel`, { method: 'PUT' }),
  getUpiDetails: (payeeId, amount, note, upiId = '') => {
    let url = `/settlements/upi/details?payeeId=${payeeId}&amount=${amount}&note=${encodeURIComponent(note || '')}`;
    if (upiId) url += `&upiId=${encodeURIComponent(upiId)}`;
    return request(url);
  },
  getQuickQrCode: (upiId, amount = 0, note = '', payeeName = '') =>
    request(`/settlements/upi/qr?upiId=${encodeURIComponent(upiId)}&amount=${amount}&note=${encodeURIComponent(note)}&payeeName=${encodeURIComponent(payeeName)}`),

  // Bills & Receipts
  uploadReceipt: (formData) => request('/bills/upload', { method: 'POST', body: formData }),
  createManualBill: (payload) => request('/bills/manual', { method: 'POST', body: JSON.stringify(payload) }),
  getMyBills: () => request('/bills/my'),
  getBillById: (id) => request(`/bills/${id}`),

  // Reports & Analytics
  getDashboardAnalytics: () => request('/reports/dashboard'),
  backupUserData: () => request('/reports/backup'),
  restoreUserData: (backupData) => request('/reports/restore', { method: 'POST', body: JSON.stringify({ backupData }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  sendPaymentReminder: (payload) => request('/notifications/remind', { method: 'POST', body: JSON.stringify(payload) }),

  // Audit Logs
  getGroupAuditLogs: (groupId) => request(`/audit/group/${groupId}`),

  // AI Assistant & API Key Management
  getAiStatus: () => request('/ai/status'),
  saveAiKey: (apiKey, provider) => request('/ai/save-key', { method: 'POST', body: JSON.stringify({ apiKey, provider }) }),
  askAiChat: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),

  // Health check
  checkHealth: () => request('/health')
};

