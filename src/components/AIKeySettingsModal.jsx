import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';

export default function AIKeySettingsModal({ isOpen, onClose, onKeySaved }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState({ hasKey: false, provider: 'none', maskedKey: '' });
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isOpen) return;
    loadAiStatus();
  }, [isOpen]);

  const loadAiStatus = async () => {
    setStatusLoading(true);
    setFeedbackMsg({ type: '', text: '' });
    try {
      const res = await api.getAiStatus();
      if (res.success) {
        setAiStatus(res);
      }
    } catch (err) {
      console.warn('Could not fetch AI status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveKey = async (e) => {
    e?.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      setFeedbackMsg({ type: 'error', text: 'Please paste a valid API key.' });
      return;
    }

    setLoading(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const provider = key.startsWith('AIzaSy') ? 'gemini' : (key.startsWith('sk-') ? 'openai' : 'gemini');
      const res = await api.saveAiKey(key, provider);

      if (res.success) {
        // Also save to localStorage as quick client fallback
        localStorage.setItem('splitverse_ai_key', key);
        setFeedbackMsg({ type: 'success', text: '🎉 API Key successfully linked! Live AI is active.' });
        setApiKeyInput('');
        await loadAiStatus();
        onKeySaved?.(key);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Failed to save API key.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to link API key to server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    setLoading(true);
    try {
      await api.saveAiKey('', 'none');
      localStorage.removeItem('splitverse_ai_key');
      setFeedbackMsg({ type: 'info', text: 'API key unlinked. SplitVerse AI is now using the local offline engine.' });
      await loadAiStatus();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Could not remove key.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                <span>Link AI API Key</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h3>
              <p className="text-[11px] text-slate-400">Power SplitVerse with live Gemini or OpenAI models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Status Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Intelligence Mode
            </span>

            {statusLoading ? (
              <div className="flex items-center space-x-2 text-xs text-slate-400 py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking configuration...</span>
              </div>
            ) : aiStatus.hasKey ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Live {aiStatus.provider} Active</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                    Key: {aiStatus.maskedKey}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs flex items-center space-x-1"
                  title="Remove Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Unlink</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Built-in Offline Engine (Default)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Link your Gemini or OpenAI API key below for infinite smart conversational powers!
                </p>
              </div>
            )}
          </div>

          {/* Feedback message */}
          {feedbackMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200'
                  : feedbackMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSaveKey} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Paste Your API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (Gemini) or sk-... (OpenAI)"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !apiKeyInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Linking Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Link & Activate Live AI</span>
                </>
              )}
            </button>
          </form>

          {/* How to get a free key */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
            <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommended: Google Gemini API (Free)</span>
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Get a free API key in 30 seconds with your Google account from Google AI Studio.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
            >
              <span>Get Free Gemini Key on Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
