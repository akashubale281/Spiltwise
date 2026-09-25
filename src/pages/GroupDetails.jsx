import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  Share2,
  Plus,
  Trash2,
  Shield,
  LogOut,
  History,
  Zap,
  CreditCard,
  Receipt,
  UserPlus,
  Send,
  MoreVertical,
  ChevronDown,
  Edit,
  ArrowRight,
  Settings,
  Crown,
  X,
  Archive,
  QrCode
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ActivityLogModal from '../components/ActivityLogModal';
import PaymentReminderModal from '../components/PaymentReminderModal';
import ExpenseComments from '../components/ExpenseComments';

export default function GroupDetails({ onOpenExpenseModal, onOpenSettle }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [reminderModalData, setReminderModalData] = useState(null); // { debtor, amount }
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [actionError, setActionError] = useState('');

  // Group Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Trip');
  const [editDescription, setEditDescription] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getGroupById(id);
      if (res.success && res.group) {
        setGroup(res.group);
      }
    } catch (err) {
      console.error('Group fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  useEffect(() => {
    if (group) {
      setEditName(group.name || '');
      setEditCategory(group.category || 'Trip');
      setEditDescription(group.description || '');
    }
  }, [group]);

  const copyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyInviteLink = () => {
    if (group?.invite_code) {
      const link = `${window.location.origin}/join/${group.invite_code}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail.trim()) return;
    setActionError('');
    try {
      const res = await api.addMember(id, addMemberEmail.trim());
      if (res.success) {
        setAddMemberEmail('');
        setShowAddMemberInput(false);
        fetchGroup();
      } else {
        setActionError(res.message || 'Failed to add member');
      }
    } catch (err) {
      setActionError(err.message || 'User not found or error adding.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setActionError('');
    try {
      const res = await api.removeMember(id, memberId);
      if (res.success) {
        fetchGroup();
      } else {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to remove member.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setActionError('');
    try {
      const res = await api.leaveGroup(id);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to leave group.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await api.deleteExpense(expenseId);
      if (res.success) {
        fetchGroup();
      }
    } catch (err) {
      console.error('Delete expense error:', err);
    }
  };

  const handleTransferAdmin = async (newAdminId, memberName) => {
    if (!window.confirm(`Are you sure you want to transfer group admin ownership to ${memberName}? You will become a standard member.`)) return;
    setActionError('');
    try {
      const res = await api.transferAdmin(id, newAdminId);
      if (res.success) {
        fetchGroup();
      } else {
        setActionError(res.message || 'Failed to transfer admin.');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to transfer admin.');
    }
  };

  const handleUpdateGroupSettings = async (e) => {
    e.preventDefault();
    setActionError('');
    setSettingsLoading(true);
    try {
      const res = await api.updateGroup(id, {
        name: editName,
        category: editCategory,
        description: editDescription
      });
      if (res.success) {
        setIsSettingsOpen(false);
        fetchGroup();
      } else {
        setActionError(res.message || 'Failed to update group.');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update group.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleArchiveGroup = async () => {
    if (!window.confirm('Are you sure you want to archive this group? It will be hidden from your active list.')) return;
    try {
      const res = await api.deleteOrArchiveGroup(id, 'archive');
      if (res.success) {
        navigate('/dashboard');
      } else {
        setActionError(res.message || 'Failed to archive group.');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to archive group.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('WARNING: Are you sure you want to PERMANENTLY delete this group, its expenses, comments, and settlements? This CANNOT be undone!')) return;
    try {
      const res = await api.deleteOrArchiveGroup(id, 'delete');
      if (res.success) {
        navigate('/dashboard');
      } else {
        setActionError(res.message || 'Failed to delete group.');
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete group.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold">Group not found</h3>
      </div>
    );
  }

  const isAdmin = group.myRole === 'admin';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Group Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 shrink-0">
            {group.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {group.category}
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {group.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              {group.description || 'Manage expenses and settle up with group members.'}
            </p>
          </div>
        </div>

        {/* Group Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onOpenExpenseModal(group.id)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => onOpenSettle(group.id)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Settle Up</span>
          </button>

          <button
            onClick={() => setIsActivityLogOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Activity & Audit Log"
          >
            <History className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
              title="Group Settings & Admin"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleLeaveGroup}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition"
            title="Leave Group"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400">
          {actionError}
        </div>
      )}

      {/* Invite Code & Share Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-700 dark:text-slate-300">
            Invite code: <strong className="font-mono text-sm tracking-wider">{group.invite_code}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyInviteCode}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold shadow-xs flex items-center space-x-1.5"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            onClick={copyInviteLink}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* Splitwise Debt Minimization Recommendations */}
      {group.simplifiedTransactions?.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl shadow-indigo-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Optimal Debt Settlement Plan</h4>
                <p className="text-[11px] text-slate-400">
                  Transactions minimized using greedy debt simplification
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 font-semibold font-mono">
              {group.simplifiedTransactions.length} transaction(s) to settle all
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {group.simplifiedTransactions.map((tx, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-bold text-white truncate max-w-[90px]">{tx.from.name}</span>
                  <span className="text-slate-400">pays</span>
                  <span className="font-bold text-emerald-400 truncate max-w-[90px]">{tx.to.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-extrabold font-mono text-sm text-amber-300">
                    ₹{tx.amount}
                  </span>
                  {tx.from.id === user?.id && (
                    <button
                      onClick={() => onOpenSettle(group.id, tx.from.id, tx.to.id, tx.amount)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs"
                    >
                      Pay Now
                    </button>
                  )}
                  {tx.to.id === user?.id && (
                    <button
                      onClick={() =>
                        setReminderModalData({
                          debtor: tx.from,
                          amount: tx.amount,
                          groupName: group.name
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold shadow-xs"
                    >
                      Remind
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Members & Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Group Members ({group.members?.length || 0}/20)
              </h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddMemberInput(!showAddMemberInput)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          {showAddMemberInput && (
            <form onSubmit={handleAddMember} className="space-y-2 animate-fade-in">
              <input
                type="email"
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                placeholder="Member's registered email"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Add to Group
              </button>
            </form>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
            {group.members?.map((m) => {
              const userBal = group.balances?.find((b) => b.user.id === m.id)?.netBalance || 0;
              return (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] uppercase">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {m.name} {m.id === user?.id ? '(You)' : ''}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">{m.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-mono font-bold ${
                        userBal > 0
                          ? 'text-emerald-500'
                          : userBal < 0
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {userBal > 0 ? `+₹${userBal}` : userBal < 0 ? `-₹${Math.abs(userBal)}` : '₹0'}
                    </span>

                    {isAdmin && m.id !== user?.id && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTransferAdmin(m.id, m.name)}
                          className="text-slate-300 hover:text-amber-500 p-1 transition"
                          title={`Transfer Group Admin to ${m.name}`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-slate-300 hover:text-red-500 p-1 transition"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses Feed Column (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Group Expenses ({group.expenses?.length || 0})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Total Spent: ₹{group.totalSpending || 0}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {group.expenses?.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No expenses in this group yet. Add your first bill!
              </div>
            ) : (
              group.expenses?.map((exp) => {
                const isExpanded = expandedExpenseId === exp.id;
                return (
                  <div key={exp.id} className="py-3.5 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div
                      onClick={() => setExpandedExpenseId(isExpanded ? null : exp.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {exp.category?.slice(0, 2).toUpperCase() || 'EX'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {exp.description}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{exp.date}</span>
                            <span>•</span>
                            <span>Paid by {exp.creator_name}</span>
                            {exp.is_recurring ? (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 text-[10px]">
                                Recurring
                              </span>
                            ) : null}
                            {exp.upi_id && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                                <CreditCard className="w-3 h-3 shrink-0" />
                                <span>{exp.upi_id}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white block">
                            ₹{exp.amount}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {exp.splits?.length} members
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenExpenseModal(group.id, exp);
                            }}
                            className="text-slate-300 hover:text-blue-500 p-1 transition"
                            title="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExpense(exp.id);
                            }}
                            className="text-slate-300 hover:text-red-500 p-1 transition"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in space-y-3">
                        {/* Splits breakdown list */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
                          <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider block">
                            Split Breakdown ({exp.splits?.[0]?.split_type || 'equal'})
                          </span>
                          {exp.splits?.map((s) => (
                            <div key={s.id} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                              <span>{s.name}</span>
                              <span className="font-mono font-semibold">₹{s.computed_amount}</span>
                            </div>
                          ))}
                        </div>

                        {exp.receipt_url && (
                          <div className="text-xs">
                            <a
                              href={exp.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:underline flex items-center space-x-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>View Receipt Attachment</span>
                            </a>
                          </div>
                        )}

                        <ExpenseComments
                          expenseId={exp.id}
                          initialComments={exp.comments || []}
                          initialReactions={exp.reactions || []}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
        groupId={group.id}
        groupName={group.name}
      />

      {/* Payment Reminder Modal */}
      {reminderModalData && (
        <PaymentReminderModal
          isOpen={!!reminderModalData}
          onClose={() => setReminderModalData(null)}
          debtor={reminderModalData.debtor}
          amount={reminderModalData.amount}
          groupName={reminderModalData.groupName}
        />
      )}

      {/* Group Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Group Settings & Management
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGroupSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="Trip">Trip</option>
                    <option value="Home">Home / Flat</option>
                    <option value="Couple">Couple</option>
                    <option value="Project">Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={group.invite_code}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What is this group for?"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Danger Zone: Archive & Delete */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                Group Admin Actions
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleArchiveGroup}
                  className="w-full sm:flex-1 py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center justify-center space-x-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Group</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="w-full sm:flex-1 py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
