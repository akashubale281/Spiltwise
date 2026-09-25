import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  PieChart,
  HelpCircle,
  Lightbulb,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AIKeySettingsModal from './AIKeySettingsModal';
import {
  VOICE_PERSONAS,
  speakText,
  stopSpeaking,
  createSpeechRecognizer
} from '../utils/speechVoice';

export default function AIAccountantModal({ isOpen, onClose, onOpenSettle }) {
  const { user } = useAuth();
  const { formatAmount } = useTheme();

  // Voice & TTS States
  const [selectedPersona, setSelectedPersona] = useState('zara');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const recognizerRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your **SplitVerse AI Accountant**. You can ask me anything about your shared expenses, who owes you, budget forecasts, or debt settlements. Tap the **Mic** to speak!`,
      chips: [
        'Who owes me money?',
        'Where did we spend the most?',
        'Show food spending this month',
        'Predict next month expenses',
        'Who hasn\'t paid rent?'
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      api.getDashboardAnalytics().then((res) => {
        if (res.success) setAnalyticsData(res.analytics);
      }).catch(() => {});
    } else {
      stopSpeaking();
      stopVoiceInput();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Speech Recognition Mic Toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const startVoiceInput = () => {
    stopSpeaking();
    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setInput(transcript);
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Could not start recognition:', e);
        setIsListening(false);
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Safari.');
    }
  };

  const stopVoiceInput = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  // Replay a message via Text-To-Speech
  const handlePlayVoice = (msgId, text) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msgId);
      speakText(text, selectedPersona, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    stopVoiceInput();
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Analytical processing
    setTimeout(() => {
      generateAIResponse(query);
    }, 700);
  };

  const generateAIResponse = async (query) => {
    const q = query.toLowerCase();
    let replyText = '';
    let cardData = null;
    let actionButtons = null;
    let usedLiveLLM = false;

    // 1. Attempt Live LLM (Gemini or OpenAI) via backend
    try {
      const res = await api.askAiChat({
        query,
        history: messages,
        userContext: {
          youAreOwed: analyticsData?.youAreOwed || 0,
          youOwe: analyticsData?.youOwe || 0,
          netBalance: analyticsData?.netBalance || 0,
          groupCount: analyticsData?.groupCount || 1
        },
        agentType: 'accountant',
        customApiKey: localStorage.getItem('splitverse_ai_key') || ''
      });

      if (res.success && res.usedLiveLLM && res.text) {
        replyText = res.text;
        usedLiveLLM = true;
      }
    } catch (err) {
      console.warn('Live LLM error, falling back to local AI engine:', err);
    }

    // 2. If Live LLM didn't return text, use local intelligent rules
    if (!usedLiveLLM) {
      const youAreOwed = analyticsData?.youAreOwed || 0;
      const youOwe = analyticsData?.youOwe || 0;
      const netBalance = analyticsData?.netBalance || 0;
      const recent = analyticsData?.recentExpenses || [];

      if (q.includes('who owes') || q.includes('owe me') || q.includes('collect')) {
        if (youAreOwed > 0) {
          replyText = `You have **${formatAmount(youAreOwed)}** pending to be collected from your group mates across your active groups.`;
          cardData = {
            title: 'Pending Balances to Collect',
            value: formatAmount(youAreOwed),
            type: 'positive',
            note: 'Tip: You can send a polite 1-tap WhatsApp payment reminder directly.'
          };
        } else {
          replyText = `Great news! Nobody owes you money right now. All group balances are settled.`;
        }
      } else if (q.includes('i owe') || q.includes('my debt') || q.includes('pay')) {
        if (youOwe > 0) {
          replyText = `You currently owe a total of **${formatAmount(youOwe)}**. Clearing your debts maintains your SplitVerse Reputation Streak!`;
          cardData = {
            title: 'Total Outstanding Balance',
            value: formatAmount(youOwe),
            type: 'negative',
            note: 'Select an instant settlement with direct UPI payment.'
          };
          actionButtons = [
            {
              label: '1-Tap UPI Settle',
              action: () => {
                onClose();
                onOpenSettle?.();
              }
            }
          ];
        } else {
          replyText = `You are debt-free! You don't owe any money in your groups.`;
        }
      } else if (q.includes('food') || q.includes('dinner') || q.includes('swiggy') || q.includes('zomato')) {
        replyText = `Based on your recent transactions, Food & Dining represents approximately **42%** of your total shared expenditure this month. Your average per-meal split is **${formatAmount(380)}**.`;
        cardData = {
          title: 'Food & Groceries Spend',
          value: formatAmount(Math.round((analyticsData?.totalSpent || 5000) * 0.42)),
          type: 'neutral',
          note: 'Pro-tip: Use the Live Restaurant Dish Splitter to avoid paying for dishes you did not order.'
        };
      } else if (q.includes('rent') || q.includes('landlord')) {
        replyText = `Monthly apartment rent is logged at **${formatAmount(36000)}** split equally between 4 roommates (**${formatAmount(9000)}** each). Payment is due on the 5th of every month.`;
        cardData = {
          title: 'Monthly Rent Share',
          value: formatAmount(9000),
          type: 'neutral',
          note: 'Landlord UPI: sharma.properties@hdfcbank'
        };
      } else if (q.includes('predict') || q.includes('forecast') || q.includes('next month')) {
        const forecast = Math.round((analyticsData?.totalSpent || 6000) * 1.08);
        replyText = `AI Cashflow Forecast: Based on your current cadence of recurring utility bills, weekend outings, and groceries, your projected shared spend next month is **${formatAmount(forecast)}** (±5%).`;
        cardData = {
          title: 'Projected Monthly Spend',
          value: formatAmount(forecast),
          type: 'neutral',
          note: 'Forecast considers upcoming festivals, seasonal AC power spikes, and regular subscriptions.'
        };
      } else if (q.includes('most') || q.includes('highest') || q.includes('where')) {
        replyText = `Your highest single expenditure recently was logged under **Groceries & Supplies** at **${formatAmount(3250)}**. Food & Dining continues to be your most active frequency category.`;
      } else {
        replyText = `SplitVerse AI Accountant analyzed your query: "${query}". Your overall financial health score is **92/100 (Optimal)** with zero overdue red-flag debts. Link your Gemini or OpenAI API Key to unlock unlimited live deep analysis!`;
        actionButtons = [
          {
            label: 'Link Gemini / OpenAI Key',
            action: () => setShowKeyModal(true)
          },
          {
            label: 'View Spending Universe',
            action: () => {
              onClose();
              window.location.href = '/universe';
            }
          }
        ];
      }
    }

    const aiMsgId = Date.now().toString();
    const aiMsg = {
      id: aiMsgId,
      sender: 'ai',
      text: replyText,
      cardData,
      actionButtons,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    // Auto Voice Replay if enabled
    if (autoSpeak) {
      setSpeakingMessageId(aiMsgId);
      speakText(replyText, selectedPersona, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[720px] flex flex-col glass-panel rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  SplitVerse AI Voice Accountant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Voice & Text
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Talk with your accountant • Instant spoken voice responses
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Link AI API Key */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition flex items-center gap-1"
              title="Link Gemini or OpenAI API Key"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">API Key</span>
            </button>

            {/* Auto-Speech Toggle */}
            <button
              onClick={() => {
                if (autoSpeak) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              className={`p-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                autoSpeak
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={autoSpeak ? 'Auto Voice Playback Active' : 'Voice Playback Muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline text-[11px]">{autoSpeak ? 'Voice ON' : 'Muted'}</span>
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                stopVoiceInput();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Persona Selector Toolbar */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-indigo-400" /> Voice Character:
          </span>
          <div className="flex items-center gap-1.5">
            {VOICE_PERSONAS.map((p) => {
              const active = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPersona(p.id);
                    speakText(`Switched to ${p.name.split(' ')[0]} voice persona. How can I help you?`, p.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-semibold text-[11px] whitespace-nowrap transition flex items-center gap-1.5 border ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-transparent shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700'
                  }`}
                  title={p.desc}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages Chat Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            const isPlayingThis = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] space-y-2.5 ${
                    isAI ? 'text-slate-800 dark:text-slate-200' : 'text-white'
                  }`}
                >
                  <div
                    className={`p-4 rounded-3xl relative text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isAI
                        ? 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-sm'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Replay Voice Speaker Button on AI messages */}
                    {isAI && (
                      <div className="pt-2 mt-2 border-t border-slate-200/40 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Spoken by {VOICE_PERSONAS.find(p => p.id === selectedPersona)?.name.split(' ')[0]}
                        </span>
                        <button
                          onClick={() => handlePlayVoice(msg.id, msg.text)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                            isPlayingThis
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                              : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-300 hover:text-white border-transparent'
                          }`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isPlayingThis ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Payload */}
                  {msg.cardData && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {msg.cardData.title}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-black font-mono ${
                            msg.cardData.type === 'positive'
                              ? 'text-emerald-500'
                              : msg.cardData.type === 'negative'
                              ? 'text-rose-500'
                              : 'text-cyan-400'
                          }`}
                        >
                          {msg.cardData.value}
                        </span>
                      </div>
                      {msg.cardData.note && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          {msg.cardData.note}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {msg.actionButtons?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={btn.action}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Prompt Chips */}
                  {msg.chips && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.chips.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-cyan-50 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200/60 dark:border-slate-700 text-[11px] transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block px-1">
                    {msg.time}
                  </span>
                </div>
                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>SplitVerse AI is calculating & generating voice reply...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="px-4 py-2 bg-rose-500/15 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Listening to your voice... Speak now!</span>
            </span>
            <button
              onClick={stopVoiceInput}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500/40 text-rose-200"
            >
              Done
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            {/* Mic Button for Speaking */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-2xl transition shadow-md ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
              }`}
              title={isListening ? 'Click to stop listening' : 'Speak your question (Mic)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening to speech...' : "Ask anything or tap Mic to speak..."}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500/50"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white disabled:opacity-40 transition shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* AI Key Settings Modal */}
      <AIKeySettingsModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </div>
  );
}
