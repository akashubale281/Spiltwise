import React, { useState } from 'react';
import { MessageSquare, Send, Smile } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_EMOJIS = ['👍', '❤️', '🔥', '👏', '😂', '💰'];

export default function ExpenseComments({ expenseId, initialComments = [], initialReactions = [] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [reactions, setReactions] = useState(initialReactions);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await api.addComment(expenseId, newComment.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReaction = async (emoji) => {
    try {
      const res = await api.toggleReaction(expenseId, emoji);
      if (res.success) {
        if (res.action === 'added') {
          setReactions((prev) => [...prev, { emoji, user_id: user?.id, name: user?.name }]);
        } else {
          setReactions((prev) =>
            prev.filter((r) => !(r.emoji === emoji && r.user_id === user?.id))
          );
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  // Group reactions by emoji
  const reactionCounts = {};
  reactions.forEach((r) => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      {/* Reactions Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {AVAILABLE_EMOJIS.map((emoji) => {
          const count = reactionCounts[emoji] || 0;
          const userReacted = reactions.some((r) => r.emoji === emoji && r.user_id === user?.id);
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => handleToggleReaction(emoji)}
              className={`px-2 py-1 text-xs rounded-xl flex items-center space-x-1 border transition ${
                userReacted
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="font-bold text-[10px]">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Comments List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">{c.user_name}</span>
              <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200">{c.message}</p>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSendComment} className="flex items-center space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
