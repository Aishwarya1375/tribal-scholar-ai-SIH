import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, Shield, CornerDownLeft } from 'lucide-react';
import { api } from '../api/client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  modelUsed?: string;
  timestamp: string;
}

interface AIAssistantWidgetProps {
  currentApplicationId?: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ currentApplicationId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: 'Namaste! I am the MoTA AI Scheme Assistant. You can ask me about NFST and NOS scheme requirements, required documents, or inquire about your specific application status and deficiencies. (Responses are strictly grounded in configured scheme rules).',
      source: 'MoTA Scheme Baseline Configuration',
      modelUsed: 'Groq Llama-3.3-70b / Local Grounded Engine',
      timestamp: 'Just now'
    }
  ]);

  const quickPrompts = [
    'What are the eligibility criteria for NFST?',
    'What documents are required for NOS?',
    'Why is my application flagged or deficient?',
    'What is the age limit for fellowship?' // Triggers strict refusal compliance!
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.askAssistant(textToSend, currentApplicationId);
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        source: res.source,
        modelUsed: res.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: 'This information is not available in the configured scheme data. Please refer to the official scheme guidelines or contact the designated authority.',
        source: 'MoTA Policy Guardrail (Fallback Mode)',
        modelUsed: 'Deterministic Guardrail',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 p-3.5 bg-[#0B2447] text-white rounded-full shadow-2xl hover:bg-[#163866] transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer border-2 border-amber-400 group"
        title="Open MoTA Grounded AI Scheme Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-amber-300" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
        </div>
        <span className="hidden sm:inline font-semibold text-xs tracking-wide pr-1">MoTA AI Assistant</span>
      </button>

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[420px] max-h-[82vh] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#0B2447] text-white p-3.5 flex items-center justify-between border-b border-amber-400/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800/80 text-amber-300 border border-amber-400/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  MoTA Scheme Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-slate-300">Grounded strictly in official scheme configuration</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Banner */}
          <div className="bg-amber-50/90 px-3 py-1.5 border-b border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>AI provides guidance and explanations; human officers make final decisions.</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#0B2447] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {m.sender === 'assistant' && m.source && (
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 pl-1">
                    <span className="font-medium text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                      Source: {m.source}
                    </span>
                    {m.modelUsed && <span className="font-mono text-[9px] text-slate-400">{m.modelUsed}</span>}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 max-w-[70%] shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px]">Consulting scheme knowledge base...</span>
              </div>
            )}
          </div>

          {/* Quick Suggested Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-all shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about NFST/NOS rules, documents, or status..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447] focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="p-2 rounded-xl bg-[#0B2447] text-white hover:bg-[#163866] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
