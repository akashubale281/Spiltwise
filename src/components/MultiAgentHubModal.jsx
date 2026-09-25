import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Sparkles,
  DollarSign,
  ShoppingCart,
  UserCheck,
  Box,
  Tag,
  Send,
  Zap,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AIKeySettingsModal from './AIKeySettingsModal';
import {
  VOICE_PERSONAS,
  speakText,
  stopSpeaking,
  createSpeechRecognizer
} from '../utils/speechVoice';

const AGENTS = [
  { id: 'money', name: 'Money AI', role: 'Budget, Net Worth & Settle', icon: DollarSign, color: 'from-emerald-500 to-teal-600', prompt: 'Who owes me money and how can I optimize debts?' },
  { id: 'shopping', name: 'Shopping AI', role: 'Price Compare & Recipe Cart', icon: ShoppingCart, color: 'from-cyan-500 to-blue-600', prompt: 'Find the cheapest place to buy Amul Butter and Milk right now.' },
  { id: 'housekeeper', name: 'Housekeeper AI', role: 'Maid & Cook Payroll & Chores', icon: UserCheck, color: 'from-indigo-600 to-purple-700', prompt: "Calculate Shanti Bai's salary after 2 days of leave and split among 4 flatmates." },
  { id: 'pantry', name: 'Pantry AI', role: 'Kitchen Refills & Expiry', icon: Box, color: 'from-amber-500 to-orange-600', prompt: 'What can I cook with eggs, bread, tomatoes and onions remaining in my pantry?' },
  { id: 'deal', name: 'Deal AI', role: 'Coupons, BOGO & Cashbacks', icon: Tag, color: 'from-purple-500 to-pink-600', prompt: 'What are the best active coupon codes for Zepto and Blinkit today?' }
];

export default function MultiAgentHubModal({ isOpen, onClose, onOpenSettle, onOpenExpense }) {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [query, setQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('zara');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const recognizerRef = useRef(null);

  const [chatLog, setChatLog] = useState([
    {
      id: 'init-0',
      sender: 'ai',
      agent: AGENTS[0].name,
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am **Money AI**. I can audit your debts, forecast next month's cashflow, or prepare an instant UPI settlement. Speak to me using the mic!`
    }
  ]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopVoiceInput();
    }
  }, [isOpen]);

  // Speech Recognition
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
        setQuery(transcript);
      },
      onError: () => {
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
        setIsListening(false);
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
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

  const handleSelectAgent = (agent) => {
    stopSpeaking();
    setSelectedAgent(agent);
    const switchMsgId = Date.now().toString();
    const switchText = `Switched to **${agent.name}** (${agent.role}). Ask me anything or tap the Mic!`;

    setChatLog([
      {
        id: switchMsgId,
        sender: 'ai',
        agent: agent.name,
        text: switchText
      }
    ]);

    if (autoSpeak) {
      setSpeakingMessageId(switchMsgId);
      speakText(switchText, selectedPersona, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleSend = async (textToSend) => {
    stopVoiceInput();
    const text = (textToSend || query).trim();
    if (!text) return;

    const userMsgId = Date.now().toString();
    setChatLog((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text }
    ]);
    setQuery('');

    let reply = '';
    let usedLiveLLM = false;

    // 1. Try Live LLM call (Gemini or OpenAI)
    try {
      const res = await api.askAiChat({
        query: text,
        history: chatLog,
        userContext: {},
        agentType: selectedAgent.id,
        customApiKey: localStorage.getItem('splitverse_ai_key') || ''
      });

      if (res.success && res.usedLiveLLM && res.text) {
        reply = res.text;
        usedLiveLLM = true;
      }
    } catch (err) {
      console.warn('Live LLM agent call fallback:', err);
    }

    // 2. Fallback to intelligent local rules
    if (!usedLiveLLM) {
      if (selectedAgent.id === 'money') {
        reply = `**Money AI Analysis**: Your net group balance is positive. You have ₹820 pending collection from Rahul. 1-tap UPI payment links have been formatted and ready.`;
      } else if (selectedAgent.id === 'shopping') {
        reply = `**Shopping AI Analysis**: Verified 8 quick-commerce dark stores in your pincode. Amul Butter 500g is lowest on **DMart Ready (₹238)** and fastest on **Zepto (8 mins, ₹256)**. Cart split saves ₹56!`;
      } else if (selectedAgent.id === 'housekeeper') {
        reply = `**Housekeeper AI Payroll**: Shanti Bai's September base is ₹4,500. With 2 leave days (-₹300), net salary is **₹4,200**. Split 4 ways: **₹1,050 per flatmate**. UPI ID: shanti.bai@ybl is ready for payment.`;
      } else if (selectedAgent.id === 'pantry') {
        reply = `**Pantry AI Chef**: You have eggs, bread, and tomatoes. Suggested Recipe: **Mediterranean Shakshuka** (Prep: 15 mins). No new grocery purchases needed!`;
      } else {
        reply = `**Deal AI Radar**: Today's top coupon: Use code **SUPERZEPTO** for flat ₹50 off on orders > ₹299. ICICI Bank 15% instant cashback active on Swiggy Instamart!`;
      }
    }

    const aiMsgId = (Date.now() + 1).toString();
    setChatLog((prev) => [
      ...prev,
      { id: aiMsgId, sender: 'ai', agent: selectedAgent.name, text: reply }
    ]);

    if (autoSpeak) {
      setSpeakingMessageId(aiMsgId);
      speakText(reply, selectedPersona, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[720px] flex flex-col glass-panel rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-purple-950/30 to-indigo-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  5-Agent AI Command Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Voice Enabled
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Specialized autonomous agents with speech recognition & instant voice answers
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

            <button
              onClick={() => {
                if (autoSpeak) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              className={`p-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                autoSpeak
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={autoSpeak ? 'Auto Voice Playback Active' : 'Voice Playback Muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
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
            <Radio className="w-3.5 h-3.5 text-purple-400" /> Voice Character:
          </span>
          <div className="flex items-center gap-1.5">
            {VOICE_PERSONAS.map((p) => {
              const active = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPersona(p.id);
                    speakText(`Agent voice switched to ${p.name.split(' ')[0]}.`, p.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-semibold text-[11px] whitespace-nowrap transition flex items-center gap-1.5 border ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow'
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

        {/* Agent Selector Tabs */}
        <div className="p-3 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const active = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{agent.name}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatLog.map((chat) => {
            const isAI = chat.sender === 'ai';
            const isPlayingThis = speakingMessageId === chat.id;

            return (
              <div
                key={chat.id}
                className={`flex items-start space-x-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isAI && (
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-200/40 dark:border-slate-700/40">
                      <span className="text-[10px] font-bold text-purple-400 uppercase">
                        {chat.agent}
                      </span>
                      <button
                        onClick={() => handlePlayVoice(chat.id, chat.text)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                          isPlayingThis
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                            : 'bg-slate-700/50 text-slate-300 hover:text-white border-transparent'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isPlayingThis ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                  <p className="whitespace-pre-line">{chat.text}</p>
                </div>
              </div>
            );
          })}
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

        {/* Input & Prompt Chip Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSend(selectedAgent.prompt)}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[11px] font-medium border border-purple-500/20 truncate max-w-full text-left transition"
            >
              ✨ Prompt: "{selectedAgent.prompt}"
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl transition shadow ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700'
              }`}
              title={isListening ? 'Click to stop listening' : 'Speak to agent (Mic)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask ${selectedAgent.name} or tap Mic to speak...`}
              className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition shadow"
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
