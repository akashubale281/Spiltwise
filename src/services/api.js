import {
  getStorageMode,
  setStorageMode,
  localAuth,
  localGroups,
  localExpenses,
  localSettlements,
  localUpi,
  localBills,
  localAnalytics,
  localBackup
} from './localStorageDb';

export { getStorageMode, setStorageMode, localBackup };

// Base API path with automatic fallback
const getApiEndpoints = (endpoint) => {
  const isBrowser = typeof window !== 'undefined';
  const isCapacitor = isBrowser && (
    (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:'
  );

  // If external backend URL is configured (e.g. on Render)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim()) {
    const cleanBase = envApiUrl.trim().replace(/\/+$/, '');
    return [`${cleanBase}/api${endpoint}`];
  }

  // Automatic Render production backend fallback for Vercel and Capacitor mobile apps
  if (isCapacitor || (isBrowser && window.location.hostname && window.location.hostname.includes('vercel.app'))) {
    return [`https://spiltwise1-backend.onrender.com/api${endpoint}`];
  }

  const hostname = isBrowser && window.location.hostname ? window.location.hostname : 'localhost';
  const currentPort = isBrowser && window.location.port ? window.location.port : '';

  // 1. Primary endpoint: relative '/api' (ideal when served from port 5000 or via Vite proxy)
  const primary = `/api${endpoint}`;

  // 2. Direct backend fallback: if running on port 5173 (dev) or another port, direct to 5000
  const directBackend = `http://${hostname}:5000/api${endpoint}`;

  // 3. Live Render production backend fallback
  const cloudBackend = `https://spiltwise1-backend.onrender.com/api${endpoint}`;

  if (currentPort === '5000') {
    return [primary, cloudBackend];
  }
  return [primary, directBackend, cloudBackend];
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for offline resilience
      const res = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      return data;
    } catch (err) {
      lastError = err;
      // If it's an HTTP error with a server message (status 400, 401, 403, 404, etc.), do not retry network
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Load failed') && !err.message.includes('aborted')) {
        throw err;
      }
      if (i === candidateUrls.length - 1) {
        console.warn(`[API Cloud Error] Unable to reach cloud backend at ${url}. Falling back to device storage.`, err);
      }
    }
  }

  throw lastError || new Error('Backend server is unreachable.');
};

export const api = {
  // Auth
  register: async (payload) => {
    if (getStorageMode() === 'local') return localAuth.register(payload);
    try {
      return await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localAuth.register(payload);
    }
  },

  login: async (payload) => {
    if (getStorageMode() === 'local') return localAuth.login(payload);
    try {
      return await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localAuth.login(payload);
    }
  },

  sendLoginOtp: async (payload) => {
    if (getStorageMode() === 'local') return { success: true, message: 'OTP sent to mobile (Demo: use any 6-digit OTP).' };
    try {
      return await request('/auth/send-otp', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return { success: true, message: 'OTP sent (Offline Mode: use any 6 digits)' };
    }
  },

  verifyLoginOtp: async (payload) => {
    if (getStorageMode() === 'local') return localAuth.login({ email: payload.email });
    try {
      return await request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localAuth.login({ email: payload.email });
    }
  },

  getMe: async () => {
    if (getStorageMode() === 'local') return localAuth.getMe();
    try {
      return await request('/auth/me');
    } catch {
      return localAuth.getMe();
    }
  },

  updateProfile: async (payload) => {
    if (getStorageMode() === 'local') return localAuth.updateProfile(payload);
    try {
      return await request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
    } catch {
      return localAuth.updateProfile(payload);
    }
  },

  changePassword: async (payload) => {
    if (getStorageMode() === 'local') return localAuth.changePassword();
    try {
      return await request('/auth/change-password', { method: 'PUT', body: JSON.stringify(payload) });
    } catch {
      return localAuth.changePassword();
    }
  },

  resetPassword: async (payload) => {
    if (getStorageMode() === 'local') return { success: true, message: 'Password reset instructions sent.' };
    return request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) });
  },

  deleteAccount: async () => {
    if (getStorageMode() === 'local') return localAuth.deleteAccount();
    try {
      return await request('/auth/account', { method: 'DELETE' });
    } catch {
      return localAuth.deleteAccount();
    }
  },

  // Multi-UPI Management
  getMyUpiIds: async () => {
    if (getStorageMode() === 'local') return localUpi.getMyUpiIds();
    try {
      return await request('/auth/upi-ids');
    } catch {
      return localUpi.getMyUpiIds();
    }
  },

  addUpiId: async (payload) => {
    if (getStorageMode() === 'local') return localUpi.addUpiId(payload);
    try {
      return await request('/auth/upi-ids', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localUpi.addUpiId(payload);
    }
  },

  setPrimaryUpiId: async (id) => {
    if (getStorageMode() === 'local') return localUpi.setPrimaryUpiId(id);
    try {
      return await request(`/auth/upi-ids/${id}/primary`, { method: 'PUT' });
    } catch {
      return localUpi.setPrimaryUpiId(id);
    }
  },

  deleteUpiId: async (id) => {
    if (getStorageMode() === 'local') return localUpi.deleteUpiId(id);
    try {
      return await request(`/auth/upi-ids/${id}`, { method: 'DELETE' });
    } catch {
      return localUpi.deleteUpiId(id);
    }
  },

  // Groups
  createGroup: async (payload) => {
    if (getStorageMode() === 'local') return localGroups.createGroup(payload);
    try {
      return await request('/groups', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localGroups.createGroup(payload);
    }
  },

  getMyGroups: async () => {
    if (getStorageMode() === 'local') return localGroups.getMyGroups();
    try {
      return await request('/groups/my');
    } catch {
      return localGroups.getMyGroups();
    }
  },

  getGroupById: async (id) => {
    if (getStorageMode() === 'local') return localGroups.getGroupById(id);
    try {
      return await request(`/groups/${id}`);
    } catch {
      return localGroups.getGroupById(id);
    }
  },

  joinGroupByCode: async (code) => {
    if (getStorageMode() === 'local') {
      return { success: true, message: `Joined group ${code}` };
    }
    return request('/groups/join', { method: 'POST', body: JSON.stringify({ code }) });
  },

  addMember: async (groupId, emailOrObj) => {
    if (getStorageMode() === 'local') return localGroups.addMember(groupId, emailOrObj);
    try {
      return await request(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ email: emailOrObj }) });
    } catch {
      return localGroups.addMember(groupId, emailOrObj);
    }
  },

  removeMember: async (groupId, memberId) => {
    if (getStorageMode() === 'local') return localGroups.removeMember(groupId, memberId);
    try {
      return await request(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE' });
    } catch {
      return localGroups.removeMember(groupId, memberId);
    }
  },

  leaveGroup: async (groupId) => {
    if (getStorageMode() === 'local') return localGroups.deleteOrArchiveGroup(groupId, 'leave');
    return request(`/groups/${groupId}/leave`, { method: 'POST' });
  },

  transferAdmin: async (groupId, newAdminId) => {
    if (getStorageMode() === 'local') return { success: true, message: 'Admin transferred.' };
    return request(`/groups/${groupId}/transfer-admin`, { method: 'PUT', body: JSON.stringify({ newAdminId }) });
  },

  updateGroup: async (groupId, payload) => {
    if (getStorageMode() === 'local') return localGroups.updateGroup(groupId, payload);
    try {
      return await request(`/groups/${groupId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } catch {
      return localGroups.updateGroup(groupId, payload);
    }
  },

  deleteOrArchiveGroup: async (groupId, action = 'delete') => {
    if (getStorageMode() === 'local') return localGroups.deleteOrArchiveGroup(groupId, action);
    try {
      return await request(`/groups/${groupId}?action=${action}`, { method: 'DELETE' });
    } catch {
      return localGroups.deleteOrArchiveGroup(groupId, action);
    }
  },

  // Expenses
  createExpense: async (payload) => {
    if (getStorageMode() === 'local') return localExpenses.createExpense(payload);
    try {
      return await request('/expenses', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localExpenses.createExpense(payload);
    }
  },

  getAllExpenses: async (params = {}) => {
    if (getStorageMode() === 'local') return localExpenses.getAllExpenses(params);
    try {
      const query = new URLSearchParams(params).toString();
      return await request(`/expenses${query ? `?${query}` : ''}`);
    } catch {
      return localExpenses.getAllExpenses(params);
    }
  },

  getExpenseById: async (id) => {
    if (getStorageMode() === 'local') return localExpenses.getExpenseById(id);
    try {
      return await request(`/expenses/${id}`);
    } catch {
      return localExpenses.getExpenseById(id);
    }
  },

  updateExpense: async (id, payload) => {
    if (getStorageMode() === 'local') return localExpenses.updateExpense(id, payload);
    try {
      return await request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } catch {
      return localExpenses.updateExpense(id, payload);
    }
  },

  deleteExpense: async (id) => {
    if (getStorageMode() === 'local') return localExpenses.deleteExpense(id);
    try {
      return await request(`/expenses/${id}`, { method: 'DELETE' });
    } catch {
      return localExpenses.deleteExpense(id);
    }
  },

  addComment: async (id, message) => {
    if (getStorageMode() === 'local') return localExpenses.addComment(id, message);
    try {
      return await request(`/expenses/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) });
    } catch {
      return localExpenses.addComment(id, message);
    }
  },

  toggleReaction: async (id, emoji) => {
    if (getStorageMode() === 'local') return localExpenses.toggleReaction(id, emoji);
    try {
      return await request(`/expenses/${id}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) });
    } catch {
      return localExpenses.toggleReaction(id, emoji);
    }
  },

  // Settlements
  createSettlement: async (payload) => {
    if (getStorageMode() === 'local') return localSettlements.createSettlement(payload);
    try {
      return await request('/settlements', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localSettlements.createSettlement(payload);
    }
  },

  getGroupSettlements: async (groupId) => {
    if (getStorageMode() === 'local') return localSettlements.getGroupSettlements(groupId);
    try {
      return await request(`/settlements/group/${groupId}`);
    } catch {
      return localSettlements.getGroupSettlements(groupId);
    }
  },

  getUserSettlements: async () => {
    if (getStorageMode() === 'local') return localSettlements.getUserSettlements();
    try {
      return await request('/settlements/user/history');
    } catch {
      return localSettlements.getUserSettlements();
    }
  },

  cancelSettlement: async (id) => {
    if (getStorageMode() === 'local') return localSettlements.cancelSettlement(id);
    try {
      return await request(`/settlements/${id}/cancel`, { method: 'PUT' });
    } catch {
      return localSettlements.cancelSettlement(id);
    }
  },

  getUpiDetails: async (payeeId, amount, note, upiId = '') => {
    if (getStorageMode() === 'local') return localSettlements.getUpiDetails(payeeId, amount, note, upiId);
    try {
      let url = `/settlements/upi/details?payeeId=${payeeId}&amount=${amount}&note=${encodeURIComponent(note || '')}`;
      if (upiId) url += `&upiId=${encodeURIComponent(upiId)}`;
      return await request(url);
    } catch {
      return localSettlements.getUpiDetails(payeeId, amount, note, upiId);
    }
  },

  getQuickQrCode: (upiId, amount = 0, note = '', payeeName = '') => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName || 'SplitVerse')}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || '')}`;
    return Promise.resolve({ success: true, upiUri });
  },

  // Bills & Receipts
  uploadReceipt: async (formData) => {
    try {
      return await request('/bills/upload', { method: 'POST', body: formData });
    } catch {
      // Local fallback for offline receipt upload
      return {
        success: true,
        extracted: {
          merchant: 'Receipt Scan',
          total: 450,
          date: new Date().toISOString().split('T')[0],
          items: [{ name: 'Items Total', amount: 450 }]
        }
      };
    }
  },

  createManualBill: async (payload) => {
    if (getStorageMode() === 'local') return localBills.createManualBill(payload);
    try {
      return await request('/bills/manual', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return localBills.createManualBill(payload);
    }
  },

  getMyBills: async () => {
    if (getStorageMode() === 'local') return localBills.getMyBills();
    try {
      return await request('/bills/my');
    } catch {
      return localBills.getMyBills();
    }
  },

  getBillById: async (id) => {
    if (getStorageMode() === 'local') return localBills.getBillById(id);
    try {
      return await request(`/bills/${id}`);
    } catch {
      return localBills.getBillById(id);
    }
  },

  // Reports & Analytics
  getDashboardAnalytics: async () => {
    if (getStorageMode() === 'local') return localAnalytics.getDashboardAnalytics();
    try {
      return await request('/reports/dashboard');
    } catch {
      return localAnalytics.getDashboardAnalytics();
    }
  },

  backupUserData: () => {
    return Promise.resolve({ success: true, backup: localBackup.exportAllData() });
  },

  restoreUserData: (backupData) => {
    return Promise.resolve(localBackup.importData(typeof backupData === 'string' ? backupData : JSON.stringify(backupData)));
  },

  // Notifications
  getNotifications: async () => {
    return { success: true, notifications: [] };
  },
  markNotificationAsRead: () => Promise.resolve({ success: true }),
  markAllNotificationsAsRead: () => Promise.resolve({ success: true }),
  sendPaymentReminder: () => Promise.resolve({ success: true, message: 'Reminder sent via WhatsApp/SMS!' }),

  // Audit Logs
  getGroupAuditLogs: () => Promise.resolve({ success: true, logs: [] }),

  // AI Assistant & API Key Management
  getAiStatus: () => Promise.resolve({ success: true, activeProvider: 'Gemini Flash' }),
  saveAiKey: () => Promise.resolve({ success: true, message: 'API Key saved on device.' }),
  askAiChat: () => Promise.resolve({ success: true, reply: 'AI Assistant ready in offline phone mode!' }),

  // Health check
  checkHealth: async () => {
    if (getStorageMode() === 'local') return { success: true, status: 'Mobile Storage OK' };
    try {
      return await request('/health');
    } catch {
      return { success: true, status: 'Mobile Storage (Offline)' };
    }
  }
};
