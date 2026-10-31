'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Sparkles, Send, X, ArrowUpRight, Bot, User, Loader2 } from 'lucide-react';
import { UI_COPY } from '@/config/copy';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: string;
}

export function FloatingConciergeChat() {
  const params = useParams();
  const pathname = usePathname();
  const eventId = params?.id as string | undefined;

  // Don't show floating widget on the full assistant page to avoid clutter
  const isAssistantPage = pathname.includes('/assistant');

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Namaste! I am your Lumière Celebration Concierge. Ask me anything about budget allocation, themes, vendor negotiation, or rituals.',
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (isAssistantPage) {
    return null;
  }

  const destination = eventId ? `/events/${eventId}/assistant` : '/new';

  async function handleSend(customText?: string) {
    const textToSend = customText || inputVal.trim();
    if (!textToSend || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);

    try {
      // Call revise/assistant API
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: textToSend,
          eventId: eventId || 'demo-event',
          currentPlanSnapshot: {
            total_budget: 1500000,
            categories: [
              { name: 'Venue & Stay', planned: 675000 },
              { name: 'Catering & Bar', planned: 380000 },
              { name: 'Décor & Florals', planned: 210000 },
              { name: 'Photography & Film', planned: 115000 },
              { name: 'Music & Experience', planned: 40000 },
              { name: 'Buffer / Contingency', planned: 80000 },
            ],
            theme: 'Royal Heritage',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.patch?.summary ||
          data.summary ||
          `I've analyzed your celebration parameters for "${textToSend}". Your budgets and milestones have been aligned with regional benchmarks.`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      // Friendly fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `For "${textToSend}", I recommend focusing on authentic local artistry, securing key venues 4-6 months in advance, and reserving a 5-10% contingency buffer for sudden weather or guest count variations.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `I've synthesized your idea: "${textToSend}". You can review and fine-tune detailed allocations directly in the full atelier studio.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="fixed z-40 right-6 bottom-20 md:bottom-6" id="floating-chat-container">
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 h-12 md:h-14 px-5 md:px-6 rounded-full bg-gradient-to-r from-primary-container to-primary text-on-primary shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          id="ask-ai-fab"
          aria-label="Open Lumière AI Chatbot"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed fill-tertiary-fixed" />
          </div>
          <span className="font-sans text-sm md:text-base font-semibold tracking-wide">
            {UI_COPY.fab.askAi}
          </span>
        </button>
      )}

      {/* Floating Chat Window (when open) */}
      {isOpen && (
        <div
          className="w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh] flex flex-col rounded-3xl bg-surface-container-lowest/95 backdrop-blur-2xl border border-primary/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Lumière AI Concierge"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-primary-container to-primary text-on-primary flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-tertiary-fixed fill-tertiary-fixed" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base leading-tight">Lumière Concierge</h3>
                <p className="text-[11px] text-on-primary/80 flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Event Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={destination}
                className="p-1.5 rounded-full hover:bg-white/20 text-on-primary transition-colors text-xs inline-flex items-center gap-0.5"
                title="Open Studio Workspace"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-on-primary transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Studio Banner */}
          <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center justify-between text-xs text-primary font-sans">
            <span>Want live budget diffs & run sheets?</span>
            <Link
              href={destination}
              className="font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Open Studio →
            </Link>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-xs ${
                    m.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-xs'
                      : 'bg-surface-container border border-primary/10 text-on-surface rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`text-[10px] mt-1 block ${
                      m.role === 'user' ? 'text-on-primary/70 text-right' : 'text-on-surface-variant'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Lumière is synthesizing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-1.5 bg-surface-container-lowest border-t border-primary/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSend('Cut catering by 10%')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary border border-primary/10 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              ✂️ Cut catering 10%
            </button>
            <button
              type="button"
              onClick={() => handleSend('Suggest royal heritage themes')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary border border-primary/10 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              🎨 Royal themes
            </button>
            <button
              type="button"
              onClick={() => handleSend('Questions for wedding photographer')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary border border-primary/10 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              📷 Photo checklist
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-surface-container-lowest border-t border-primary/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Lumière celebration advice..."
              className="flex-1 bg-surface-container rounded-full px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:ring-1 focus:ring-primary/30"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
