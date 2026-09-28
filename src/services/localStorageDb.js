// Local Device Storage Database for SplitVerse
// Provides 100% offline, zero-server persistence directly in mobile phone storage.

const UID = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const KEYS = {
  MODE: 'splitverse_storage_mode', // 'local' | 'cloud'
  USER: 'splitverse_local_user',
  GROUPS: 'splitverse_local_groups',
  EXPENSES: 'splitverse_local_expenses',
  SETTLEMENTS: 'splitverse_local_settlements',
  UPIS: 'splitverse_local_upis',
  BILLS: 'splitverse_custom_bills',
  NOTIFICATIONS: 'splitverse_local_notifications',
  MAID_STAFF: 'splitverse_maid_staff_list',
};

// Safe JSON helpers
const getJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[LocalStorageDb] Failed to read ${key}:`, e);
    return fallback;
  }
};

const setJson = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.error(`[LocalStorageDb] Failed to write ${key}:`, e);
    return false;
  }
};

// Seed default initial data if device storage is totally empty
export const seedInitialLocalData = () => {
  if (!getJson(KEYS.USER, null)) {
    const defaultUser = {
      id: 'usr_me',
      name: 'Phone Owner',
      email: 'owner@splitverse.local',
      currency: 'INR',
      monthly_budget: 25000,
      photo_url: '',
      upi_id: 'myupi@okhdfcbank',
      created_at: new Date().toISOString()
    };
    setJson(KEYS.USER, defaultUser);
    localStorage.setItem('splitwise_token', 'local_offline_token');
  }

  if (!getJson(KEYS.UPIS, null)) {
    setJson(KEYS.UPIS, [
      { id: 'upi_1', upi_id: 'myupi@okhdfcbank', label: 'Primary GPay / HDFC', is_primary: 1 }
    ]);
  }

  if (!getJson(KEYS.GROUPS, null)) {
    const initialGroups = [
      {
        id: 'grp_home',
        name: 'Apartment & Flatmates',
        category: 'Home',
        description: 'Rent, WiFi, Groceries & Maid expenses',
        photo_url: '',
        invite_code: 'FLAT99',
        admin_id: 'usr_me',
        is_archived: 0,
        created_at: new Date().toISOString(),
        members: [
          { id: 'usr_me', name: 'Me (You)', email: 'owner@splitverse.local', role: 'admin', upi_id: 'myupi@okhdfcbank' },
          { id: 'usr_flatmate_1', name: 'Rahul (Roommate)', email: 'rahul@flat.local', role: 'member', upi_id: 'rahul@paytm' },
          { id: 'usr_flatmate_2', name: 'Priya (Roommate)', email: 'priya@flat.local', role: 'member', upi_id: 'priya@apl' }
        ]
      },
      {
        id: 'grp_trip',
        name: 'Goa Trip Squad',
        category: 'Trip',
        description: 'Travel, food, and stay splits',
        photo_url: '',
        invite_code: 'GOA2026',
        admin_id: 'usr_me',
        is_archived: 0,
        created_at: new Date().toISOString(),
        members: [
          { id: 'usr_me', name: 'Me (You)', email: 'owner@splitverse.local', role: 'admin', upi_id: 'myupi@okhdfcbank' },
          { id: 'usr_trip_1', name: 'Amit', email: 'amit@trip.local', role: 'member', upi_id: 'amit@oksbi' }
        ]
      }
    ];
    setJson(KEYS.GROUPS, initialGroups);
  }

  if (!getJson(KEYS.EXPENSES, null)) {
    const today = new Date().toISOString().split('T')[0];
    const initialExpenses = [
      {
        id: 'exp_1',
        group_id: 'grp_home',
        description: 'WiFi & High-Speed Broadband',
        amount: 1500,
        category: 'Services',
        date: today,
        split_type: 'equal',
        created_by: 'usr_me',
        creator_name: 'Me (You)',
        notes: 'Monthly broadband bill',
        payers: [{ user_id: 'usr_me', user_name: 'Me (You)', amount_paid: 1500 }],
        splits: [
          { user_id: 'usr_me', user_name: 'Me (You)', computed_amount: 500 },
          { user_id: 'usr_flatmate_1', user_name: 'Rahul (Roommate)', computed_amount: 500 },
          { user_id: 'usr_flatmate_2', user_name: 'Priya (Roommate)', computed_amount: 500 }
        ],
        comments: [],
        reactions: []
      },
      {
        id: 'exp_2',
        group_id: 'grp_home',
        description: 'Groceries, Milk & Snacks',
        amount: 900,
        category: 'Groceries',
        date: today,
        split_type: 'equal',
        created_by: 'usr_flatmate_1',
        creator_name: 'Rahul (Roommate)',
        notes: 'Supermarket supplies',
        payers: [{ user_id: 'usr_flatmate_1', user_name: 'Rahul (Roommate)', amount_paid: 900 }],
        splits: [
          { user_id: 'usr_me', user_name: 'Me (You)', computed_amount: 300 },
          { user_id: 'usr_flatmate_1', user_name: 'Rahul (Roommate)', computed_amount: 300 },
          { user_id: 'usr_flatmate_2', user_name: 'Priya (Roommate)', computed_amount: 300 }
        ],
        comments: [],
        reactions: []
      }
    ];
    setJson(KEYS.EXPENSES, initialExpenses);
  }
};

// Storage Mode Manager
export const getStorageMode = () => {
  const saved = localStorage.getItem(KEYS.MODE);
  if (saved) return saved;
  // Default to 'local' for zero-friction offline phone storage
  return 'local';
};

export const setStorageMode = (mode) => {
  localStorage.setItem(KEYS.MODE, mode === 'cloud' ? 'cloud' : 'local');
  if (mode === 'local') {
    seedInitialLocalData();
  }
};

// ----------------- LOCAL USER AUTH -----------------
export const localAuth = {
  getMe: () => {
    seedInitialLocalData();
    const user = getJson(KEYS.USER, null);
    return { success: true, user };
  },
  login: ({ email, password }) => {
    seedInitialLocalData();
    let user = getJson(KEYS.USER, null);
    if (!user) {
      user = {
        id: 'usr_me',
        name: email ? email.split('@')[0] : 'Mobile User',
        email: email || 'user@phone.local',
        currency: 'INR',
        monthly_budget: 25000,
        upi_id: 'user@upi'
      };
      setJson(KEYS.USER, user);
    }
    localStorage.setItem('splitwise_token', 'local_token_' + Date.now());
    return { success: true, token: 'local_token_' + Date.now(), user };
  },
  register: (payload) => {
    seedInitialLocalData();
    const user = {
      id: UID('usr'),
      name: payload.name || 'Mobile User',
      email: payload.email || 'user@phone.local',
      currency: payload.currency || 'INR',
      monthly_budget: Number(payload.monthly_budget) || 25000,
      photo_url: payload.photo_url || '',
      upi_id: payload.upi_id || ''
    };
    setJson(KEYS.USER, user);
    localStorage.setItem('splitwise_token', 'local_token_' + Date.now());
    return { success: true, token: 'local_token_' + Date.now(), user };
  },
  updateProfile: (payload) => {
    const user = getJson(KEYS.USER, { id: 'usr_me' });
    const updated = { ...user, ...payload };
    setJson(KEYS.USER, updated);
    return { success: true, user: updated };
  },
  changePassword: () => {
    return { success: true, message: 'Password updated in device storage.' };
  },
  deleteAccount: () => {
    localStorage.clear();
    return { success: true, message: 'Account and local phone data deleted.' };
  }
};

// ----------------- LOCAL GROUPS -----------------
export const localGroups = {
  getMyGroups: () => {
    seedInitialLocalData();
    const groups = getJson(KEYS.GROUPS, []);
    const expenses = getJson(KEYS.EXPENSES, []);
    const settlements = getJson(KEYS.SETTLEMENTS, []);
    const user = getJson(KEYS.USER, { id: 'usr_me' });

    const computed = groups.filter(g => !g.is_archived).map(grp => {
      const grpExpenses = expenses.filter(e => e.group_id === grp.id);
      const totalSpending = grpExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // Compute balance for current user in this group
      let myPaid = 0;
      let myShare = 0;
      grpExpenses.forEach(e => {
        const p = (e.payers || []).find(x => x.user_id === user.id);
        if (p) myPaid += Number(p.amount_paid || 0);

        const s = (e.splits || []).find(x => x.user_id === user.id);
        if (s) myShare += Number(s.computed_amount || 0);
      });

      // Settlements
      const grpSettlements = settlements.filter(s => s.group_id === grp.id && s.status === 'completed');
      let settledPaid = 0;
      let settledReceived = 0;
      grpSettlements.forEach(s => {
        if (s.payer_id === user.id) settledPaid += Number(s.amount || 0);
        if (s.payee_id === user.id) settledReceived += Number(s.amount || 0);
      });

      const myBalance = (myPaid + settledPaid) - (myShare + settledReceived);

      return {
        ...grp,
        member_count: (grp.members || []).length,
        total_spending: totalSpending,
        myBalance
      };
    });

    return { success: true, groups: computed };
  },

  getGroupById: (id) => {
    seedInitialLocalData();
    const groups = getJson(KEYS.GROUPS, []);
    const group = groups.find(g => g.id === id);
    if (!group) return { success: false, message: 'Group not found.' };

    const expenses = getJson(KEYS.EXPENSES, []).filter(e => e.group_id === id);
    const settlements = getJson(KEYS.SETTLEMENTS, []).filter(s => s.group_id === id);
    const user = getJson(KEYS.USER, { id: 'usr_me' });

    // Net balances per member
    const netBalances = {};
    (group.members || []).forEach(m => { netBalances[m.id] = 0; });

    expenses.forEach(e => {
      (e.payers || []).forEach(p => {
        if (netBalances[p.user_id] !== undefined) netBalances[p.user_id] += Number(p.amount_paid || 0);
      });
      (e.splits || []).forEach(s => {
        if (netBalances[s.user_id] !== undefined) netBalances[s.user_id] -= Number(s.computed_amount || 0);
      });
    });

    settlements.filter(s => s.status === 'completed').forEach(s => {
      if (netBalances[s.payer_id] !== undefined) netBalances[s.payer_id] += Number(s.amount || 0);
      if (netBalances[s.payee_id] !== undefined) netBalances[s.payee_id] -= Number(s.amount || 0);
    });

    return {
      success: true,
      group: {
        ...group,
        netBalances,
        totalExpenses: expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
      }
    };
  },

  createGroup: (payload) => {
    seedInitialLocalData();
    const groups = getJson(KEYS.GROUPS, []);
    const user = getJson(KEYS.USER, { id: 'usr_me', name: 'Me (You)' });

    const newGroup = {
      id: UID('grp'),
      name: payload.name.trim(),
      category: payload.category || 'Trip',
      description: payload.description || '',
      photo_url: payload.photo_url || '',
      invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      admin_id: user.id,
      is_archived: 0,
      created_at: new Date().toISOString(),
      members: [
        { id: user.id, name: user.name, email: user.email, role: 'admin', upi_id: user.upi_id || '' }
      ]
    };

    // If extra members were provided
    if (Array.isArray(payload.members)) {
      payload.members.forEach((m, idx) => {
        if (m && m.name) {
          newGroup.members.push({
            id: UID('mbr'),
            name: m.name,
            email: m.email || `member${idx}@splitverse.local`,
            role: 'member',
            upi_id: m.upi_id || ''
          });
        }
      });
    }

    groups.unshift(newGroup);
    setJson(KEYS.GROUPS, groups);
    return { success: true, message: 'Group created in phone storage.', group: newGroup };
  },

  updateGroup: (id, payload) => {
    const groups = getJson(KEYS.GROUPS, []);
    const idx = groups.findIndex(g => g.id === id);
    if (idx === -1) return { success: false, message: 'Group not found.' };

    groups[idx] = { ...groups[idx], ...payload };
    setJson(KEYS.GROUPS, groups);
    return { success: true, message: 'Group updated.', group: groups[idx] };
  },

  deleteOrArchiveGroup: (id, action = 'delete') => {
    let groups = getJson(KEYS.GROUPS, []);
    if (action === 'archive') {
      groups = groups.map(g => g.id === id ? { ...g, is_archived: 1 } : g);
    } else {
      groups = groups.filter(g => g.id !== id);
      // Clean up expenses
      const expenses = getJson(KEYS.EXPENSES, []).filter(e => e.group_id !== id);
      setJson(KEYS.EXPENSES, expenses);
    }
    setJson(KEYS.GROUPS, groups);
    return { success: true, message: `Group ${action}d.` };
  },

  addMember: (groupId, memberData) => {
    const groups = getJson(KEYS.GROUPS, []);
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return { success: false, message: 'Group not found.' };

    const email = typeof memberData === 'string' ? memberData : memberData.email;
    const name = memberData?.name || (email ? email.split('@')[0] : 'Squad Member');

    const newMember = {
      id: UID('mbr'),
      name,
      email: email || `${name.toLowerCase()}@local`,
      role: 'member',
      upi_id: memberData?.upi_id || ''
    };

    grp.members = grp.members || [];
    grp.members.push(newMember);
    setJson(KEYS.GROUPS, groups);
    return { success: true, message: 'Member added.', member: newMember };
  },

  removeMember: (groupId, memberId) => {
    const groups = getJson(KEYS.GROUPS, []);
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return { success: false, message: 'Group not found.' };

    grp.members = (grp.members || []).filter(m => m.id !== memberId);
    setJson(KEYS.GROUPS, groups);
    return { success: true, message: 'Member removed.' };
  }
};

// ----------------- LOCAL EXPENSES -----------------
export const localExpenses = {
  getAllExpenses: (params = {}) => {
    seedInitialLocalData();
    let expenses = getJson(KEYS.EXPENSES, []);
    const groups = getJson(KEYS.GROUPS, []);
    const user = getJson(KEYS.USER, { id: 'usr_me' });

    if (params.groupId) {
      expenses = expenses.filter(e => e.group_id === params.groupId);
    }
    if (params.category) {
      expenses = expenses.filter(e => e.category === params.category);
    }

    const enriched = expenses.map(e => {
      const grp = groups.find(g => g.id === e.group_id);
      const payer = (e.payers || []).find(p => p.user_id === user.id);
      const split = (e.splits || []).find(s => s.user_id === user.id);

      return {
        ...e,
        group_name: grp ? grp.name : 'Unknown Group',
        my_paid: payer ? Number(payer.amount_paid) : 0,
        my_share: split ? Number(split.computed_amount) : 0
      };
    });

    enriched.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    return { success: true, expenses: enriched };
  },

  getExpenseById: (id) => {
    seedInitialLocalData();
    const expenses = getJson(KEYS.EXPENSES, []);
    const exp = expenses.find(e => e.id === id);
    if (!exp) return { success: false, message: 'Expense not found.' };
    return { success: true, expense: exp };
  },

  createExpense: (payload) => {
    seedInitialLocalData();
    const expenses = getJson(KEYS.EXPENSES, []);
    const groups = getJson(KEYS.GROUPS, []);
    const user = getJson(KEYS.USER, { id: 'usr_me', name: 'Me (You)' });

    const grp = groups.find(g => g.id === payload.group_id) || groups[0];
    const totalAmount = Number(payload.amount);

    // Compute splits if not passed directly
    let splits = payload.splits;
    let payers = payload.payers;

    if (!payers || payers.length === 0) {
      payers = [{ user_id: user.id, user_name: user.name, amount_paid: totalAmount }];
    }

    if (!splits || splits.length === 0) {
      const members = grp ? grp.members : [user];
      const count = Math.max(members.length, 1);
      const perHead = Math.round((totalAmount / count) * 100) / 100;
      splits = members.map(m => ({
        user_id: m.id,
        user_name: m.name,
        computed_amount: perHead
      }));
    }

    const newExpense = {
      id: UID('exp'),
      group_id: payload.group_id || (grp ? grp.id : 'grp_home'),
      description: payload.description,
      amount: totalAmount,
      category: payload.category || 'General',
      date: payload.date || new Date().toISOString().split('T')[0],
      split_type: payload.split_type || 'equal',
      receipt_url: payload.receipt_url || '',
      notes: payload.notes || '',
      created_by: user.id,
      creator_name: user.name,
      created_at: new Date().toISOString(),
      payers,
      splits,
      comments: [],
      reactions: []
    };

    expenses.unshift(newExpense);
    setJson(KEYS.EXPENSES, expenses);
    return { success: true, message: 'Expense saved to mobile storage.', expense: newExpense };
  },

  updateExpense: (id, payload) => {
    const expenses = getJson(KEYS.EXPENSES, []);
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, message: 'Expense not found.' };

    expenses[idx] = { ...expenses[idx], ...payload };
    setJson(KEYS.EXPENSES, expenses);
    return { success: true, message: 'Expense updated.', expense: expenses[idx] };
  },

  deleteExpense: (id) => {
    const expenses = getJson(KEYS.EXPENSES, []).filter(e => e.id !== id);
    setJson(KEYS.EXPENSES, expenses);
    return { success: true, message: 'Expense deleted from phone storage.' };
  },

  addComment: (id, message) => {
    const expenses = getJson(KEYS.EXPENSES, []);
    const exp = expenses.find(e => e.id === id);
    if (!exp) return { success: false, message: 'Expense not found.' };

    const user = getJson(KEYS.USER, { id: 'usr_me', name: 'Me (You)' });
    exp.comments = exp.comments || [];
    exp.comments.push({
      id: UID('cmt'),
      user_id: user.id,
      user_name: user.name,
      message,
      created_at: new Date().toISOString()
    });
    setJson(KEYS.EXPENSES, expenses);
    return { success: true, comments: exp.comments };
  },

  toggleReaction: (id, emoji) => {
    const expenses = getJson(KEYS.EXPENSES, []);
    const exp = expenses.find(e => e.id === id);
    if (!exp) return { success: false, message: 'Expense not found.' };

    const user = getJson(KEYS.USER, { id: 'usr_me' });
    exp.reactions = exp.reactions || [];
    const existing = exp.reactions.findIndex(r => r.user_id === user.id && r.emoji === emoji);
    if (existing >= 0) {
      exp.reactions.splice(existing, 1);
    } else {
      exp.reactions.push({ user_id: user.id, emoji });
    }
    setJson(KEYS.EXPENSES, expenses);
    return { success: true, reactions: exp.reactions };
  }
};

// ----------------- LOCAL SETTLEMENTS & UPI -----------------
export const localSettlements = {
  createSettlement: (payload) => {
    seedInitialLocalData();
    const settlements = getJson(KEYS.SETTLEMENTS, []);
    const user = getJson(KEYS.USER, { id: 'usr_me', name: 'Me (You)' });

    const newSettlement = {
      id: UID('set'),
      group_id: payload.group_id,
      payer_id: payload.payer_id || user.id,
      payee_id: payload.payee_id,
      amount: Number(payload.amount),
      method: payload.method || 'upi',
      status: 'completed',
      created_at: new Date().toISOString()
    };

    settlements.unshift(newSettlement);
    setJson(KEYS.SETTLEMENTS, settlements);
    return { success: true, message: 'Settlement recorded in phone storage.', settlement: newSettlement };
  },

  getGroupSettlements: (groupId) => {
    const settlements = getJson(KEYS.SETTLEMENTS, []).filter(s => s.group_id === groupId);
    return { success: true, settlements };
  },

  getUserSettlements: () => {
    const settlements = getJson(KEYS.SETTLEMENTS, []);
    return { success: true, settlements };
  },

  cancelSettlement: (id) => {
    const settlements = getJson(KEYS.SETTLEMENTS, []).filter(s => s.id !== id);
    setJson(KEYS.SETTLEMENTS, settlements);
    return { success: true, message: 'Settlement cancelled.' };
  },

  getUpiDetails: (payeeId, amount, note, upiId = '') => {
    const user = getJson(KEYS.USER, { upi_id: 'myupi@okhdfcbank' });
    const targetUpi = upiId || user.upi_id || 'owner@upi';
    const upiUri = `upi://pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent('SplitVerse User')}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || 'Settlement')}`;
    return {
      success: true,
      upiId: targetUpi,
      amount,
      note,
      upiUri
    };
  }
};

// ----------------- LOCAL MULTI-UPI -----------------
export const localUpi = {
  getMyUpiIds: () => {
    seedInitialLocalData();
    const upis = getJson(KEYS.UPIS, []);
    return { success: true, upiIds: upis };
  },

  addUpiId: (payload) => {
    const upis = getJson(KEYS.UPIS, []);
    if (payload.is_primary) {
      upis.forEach(u => { u.is_primary = 0; });
    }
    const newUpi = {
      id: UID('upi'),
      upi_id: payload.upi_id.trim(),
      label: payload.label || 'Personal Account',
      is_primary: payload.is_primary ? 1 : 0
    };
    upis.push(newUpi);
    setJson(KEYS.UPIS, upis);
    return { success: true, upiId: newUpi };
  },

  setPrimaryUpiId: (id) => {
    const upis = getJson(KEYS.UPIS, []).map(u => ({
      ...u,
      is_primary: u.id === id ? 1 : 0
    }));
    setJson(KEYS.UPIS, upis);
    return { success: true, message: 'Primary UPI account updated.' };
  },

  deleteUpiId: (id) => {
    const upis = getJson(KEYS.UPIS, []).filter(u => u.id !== id);
    setJson(KEYS.UPIS, upis);
    return { success: true, message: 'UPI account unlinked.' };
  }
};

// ----------------- LOCAL BILLS -----------------
export const localBills = {
  getMyBills: () => {
    const bills = getJson(KEYS.BILLS, []);
    return { success: true, bills };
  },

  createManualBill: (payload) => {
    const bills = getJson(KEYS.BILLS, []);
    const newBill = {
      id: UID('bill'),
      merchant_name: payload.merchant_name || 'Custom Bill',
      total_amount: Number(payload.total_amount || 0),
      bill_date: payload.bill_date || new Date().toISOString().split('T')[0],
      items: payload.items || [],
      created_at: new Date().toISOString()
    };
    bills.unshift(newBill);
    setJson(KEYS.BILLS, bills);
    return { success: true, message: 'Bill created and saved in phone storage.', bill: newBill };
  },

  getBillById: (id) => {
    const bills = getJson(KEYS.BILLS, []);
    const bill = bills.find(b => b.id === id);
    if (!bill) return { success: false, message: 'Bill not found.' };
    return { success: true, bill };
  }
};

// ----------------- LOCAL DASHBOARD ANALYTICS -----------------
export const localAnalytics = {
  getDashboardAnalytics: () => {
    seedInitialLocalData();
    const user = getJson(KEYS.USER, { id: 'usr_me', monthly_budget: 25000, currency: 'INR' });
    const expenses = getJson(KEYS.EXPENSES, []);
    const settlements = getJson(KEYS.SETTLEMENTS, []);
    const groups = getJson(KEYS.GROUPS, []);

    let totalPaid = 0;
    let totalShare = 0;
    const catMap = {};
    const monthMap = {};

    expenses.forEach(e => {
      const p = (e.payers || []).find(x => x.user_id === user.id);
      if (p) totalPaid += Number(p.amount_paid || 0);

      const s = (e.splits || []).find(x => x.user_id === user.id);
      if (s) {
        const amt = Number(s.computed_amount || 0);
        totalShare += amt;

        // Category breakdown
        const cat = e.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + amt;

        // Monthly breakdown
        const m = (e.date || '').slice(0, 7) || new Date().toISOString().slice(0, 7);
        monthMap[m] = (monthMap[m] || 0) + amt;
      }
    });

    let totalSettledPaid = 0;
    let totalSettledReceived = 0;
    settlements.filter(s => s.status === 'completed').forEach(s => {
      if (s.payer_id === user.id) totalSettledPaid += Number(s.amount || 0);
      if (s.payee_id === user.id) totalSettledReceived += Number(s.amount || 0);
    });

    const netBalance = (totalPaid + totalSettledPaid) - (totalShare + totalSettledReceived);
    const youAreOwed = netBalance > 0 ? netBalance : 0;
    const youOwe = netBalance < 0 ? Math.abs(netBalance) : 0;

    const categorySpending = Object.keys(catMap).map(k => ({
      category: k,
      total_amount: catMap[k]
    })).sort((a, b) => b.total_amount - a.total_amount);

    const monthlySpending = Object.keys(monthMap).map(k => ({
      month: k,
      total_amount: monthMap[k]
    })).sort((a, b) => a.month.localeCompare(b.month));

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthSpending = monthMap[currentMonth] || 0;
    const budget = Number(user.monthly_budget) || 25000;
    const budgetUtilization = budget > 0 ? Math.round((currentMonthSpending / budget) * 100) : 0;

    const recentExpenses = expenses.slice(0, 6).map(e => {
      const grp = groups.find(g => g.id === e.group_id);
      const p = (e.payers || []).find(x => x.user_id === user.id);
      const s = (e.splits || []).find(x => x.user_id === user.id);
      return {
        ...e,
        group_name: grp ? grp.name : 'Squad Group',
        my_paid: p ? Number(p.amount_paid) : 0,
        my_share: s ? Number(s.computed_amount) : 0
      };
    });

    return {
      success: true,
      analytics: {
        totalPaid,
        totalShare,
        netBalance,
        youAreOwed,
        youOwe,
        categorySpending,
        monthlySpending,
        recentExpenses,
        monthlyBudget: budget,
        currentMonthSpending,
        budgetUtilization,
        currency: user.currency || 'INR'
      }
    };
  }
};

// ----------------- EXPORT, IMPORT & BACKUP TOOLS -----------------
export const localBackup = {
  exportAllData: () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: getJson(KEYS.USER, null),
      groups: getJson(KEYS.GROUPS, []),
      expenses: getJson(KEYS.EXPENSES, []),
      settlements: getJson(KEYS.SETTLEMENTS, []),
      upis: getJson(KEYS.UPIS, []),
      bills: getJson(KEYS.BILLS, []),
      maidStaff: getJson(KEYS.MAID_STAFF, [])
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON format.');

      if (parsed.user) setJson(KEYS.USER, parsed.user);
      if (Array.isArray(parsed.groups)) setJson(KEYS.GROUPS, parsed.groups);
      if (Array.isArray(parsed.expenses)) setJson(KEYS.EXPENSES, parsed.expenses);
      if (Array.isArray(parsed.settlements)) setJson(KEYS.SETTLEMENTS, parsed.settlements);
      if (Array.isArray(parsed.upis)) setJson(KEYS.UPIS, parsed.upis);
      if (Array.isArray(parsed.bills)) setJson(KEYS.BILLS, parsed.bills);
      if (Array.isArray(parsed.maidStaff)) setJson(KEYS.MAID_STAFF, parsed.maidStaff);

      return { success: true, message: 'All backup data successfully imported to phone storage!' };
    } catch (e) {
      return { success: false, message: 'Failed to restore backup: ' + e.message };
    }
  },

  clearAllData: () => {
    [KEYS.USER, KEYS.GROUPS, KEYS.EXPENSES, KEYS.SETTLEMENTS, KEYS.UPIS, KEYS.BILLS, KEYS.MAID_STAFF].forEach(k => {
      localStorage.removeItem(k);
    });
    seedInitialLocalData();
    return { success: true, message: 'Local mobile storage reset to initial clean state.' };
  }
};
