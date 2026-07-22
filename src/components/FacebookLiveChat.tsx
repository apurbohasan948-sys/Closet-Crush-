/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Sparkles, CheckCircle2, AlertCircle, HelpCircle, User, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, OrderStatus } from '../types.js';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  orderCreatedId?: string;
  parsedData?: any;
  paymentCompleted?: boolean;
}

interface FacebookLiveChatProps {
  products: Product[];
  onTriggerCheckout: (
    customerName: string,
    shippingAddress: string,
    productName: string,
    price: number,
    qty: number,
    onSuccessOverride: (paymentDetails: any) => Promise<void>
  ) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  whatsappNumber?: string;
}

export default function FacebookLiveChat({ 
  products, 
  onTriggerCheckout, 
  onUpdateOrderStatus,
  whatsappNumber = '8801712345678'
}: FacebookLiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDirectAdminMode, setIsDirectAdminMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages and admin mode on mount and setup EventSource
  useEffect(() => {
    const fetchInitialChat = async () => {
      try {
        const res = await fetch('/api/facebook/chat');
        const data = await res.json();
        if (data) {
          setMessages(data.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          setIsDirectAdminMode(data.isDirectAdminMode);
        }
      } catch (err) {
        console.error('Failed to fetch initial Facebook chat:', err);
      }
    };

    fetchInitialChat();

    // Event Source for real-time sync
    const eventSource = new EventSource('/api/events');
    eventSource.addEventListener('facebook_chat_updated', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.messages) {
          setMessages(data.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          setIsDirectAdminMode(data.isDirectAdminMode);
          // If the last message is from user, show typing for bot after short delay (if not in admin mode)
          const lastMsg = data.messages[data.messages.length - 1];
          if (lastMsg && lastMsg.sender === 'user' && !data.isDirectAdminMode) {
            setIsTyping(true);
          } else {
            setIsTyping(false);
          }
        }
      } catch (err) {
        console.error('Failed to parse real-time Facebook chat update:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setInputValue('');
    if (!isDirectAdminMode) {
      setIsTyping(true);
    }

    try {
      await fetch('/api/facebook/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', text: textToSend })
      });
    } catch (err) {
      console.error('Failed to send Facebook chat message:', err);
      setIsTyping(false);
    }
  };

  const handleToggleAdminMode = async () => {
    try {
      const res = await fetch('/api/facebook/chat/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isDirectAdminMode })
      });
      const data = await res.json();
      if (data) {
        setIsDirectAdminMode(data.isDirectAdminMode);
      }
    } catch (err) {
      console.error('Failed to toggle Facebook direct admin mode:', err);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch('/api/facebook/chat/clear', { method: 'POST' });
    } catch (err) {
      console.error('Failed to clear Facebook chat:', err);
    }
  };

  const handlePayDeliveryCharge = (msg: ChatMessage) => {
    if (!msg.parsedData || !msg.orderCreatedId) return;

    onTriggerCheckout(
      msg.parsedData.customerName,
      msg.parsedData.shippingAddress,
      msg.parsedData.productName,
      msg.parsedData.totalPriceEstimate / msg.parsedData.quantity,
      msg.parsedData.quantity,
      async (paymentDetails) => {
        try {
          // Update order status on server to paid
          const res = await fetch(`/api/orders/${msg.orderCreatedId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'Paid',
              paymentDetails: paymentDetails
            })
          });

          if (!res.ok) {
            alert('Order status synchronization failed.');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to sync payment with Facebook order status.');
        }
      }
    );
  };

  const presets = [
    {
      label: "Aura Ceramic Vase",
      text: "আমি ১টি Aura Ceramic Vase অর্ডার করতে চাই। আমার নাম মইনুল হোসেন, ঠিকানা: হাউজ ১২, রোড ৪, ধানমন্ডি, ঢাকা।"
    },
    {
      label: "Nomad Merino Blanket",
      text: "Please order 2 Nomad Merino Throw Blanket for Sharaf. Deliver to House 45, Banani, Dhaka."
    }
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="fb-live-chat-trigger"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-4 py-3 shadow-2xl border border-blue-500/30 font-display font-bold text-xs"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          </div>
          <span>ফেসবুক চ্যাট অর্ডার</span>
        </motion.button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="fb-live-chat-panel"
            key="fb-live-chat-panel"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] bg-stone-50 rounded-2xl border border-stone-200/80 shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <MessageSquare className="w-5 h-5 text-amber-300" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-indigo-600 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-display font-bold text-xs text-stone-100">Closet Crush Page</span>
                    <svg className="w-3.5 h-3.5 text-blue-400 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-blue-200">সাধারণত ১ মিনিটের মাঝে উত্তর দেয়</p>
                </div>
              </div>
              <button 
                id="fb-live-chat-close"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Mode Banner */}
            <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-200 flex items-center justify-between text-[10px] shrink-0 shadow-inner">
              <div className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${isDirectAdminMode ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                <span className="font-bold text-stone-700">
                  {isDirectAdminMode ? 'Direct Admin Mode' : 'AI Assistant Mode'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleToggleAdminMode}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border transition-all ${
                    isDirectAdminMode 
                      ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {isDirectAdminMode ? '🤖 Switch to AI' : '👤 Talk to Admin'}
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center space-x-0.5"
                  title="Direct WhatsApp Chat"
                >
                  <MessageCircle className="w-2.5 h-2.5" />
                  <span>WhatsApp</span>
                </a>
                <button 
                  onClick={handleClearChat}
                  className="text-stone-400 hover:text-rose-600 text-[9px] font-bold"
                  title="Clear conversation"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Message Streams */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/70">
              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-1.5">
                      <span className="bg-amber-100/70 border border-amber-200 text-stone-700 text-[9.5px] px-3.5 py-1 rounded-full text-center max-w-[90%] font-semibold leading-tight shadow-xs">
                        {msg.text}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] space-y-1.5">
                      <div className={`p-3 rounded-2xl text-[11.5px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-stone-100 rounded-tr-none'
                          : msg.sender === 'admin'
                            ? 'bg-amber-500 text-stone-950 rounded-tl-none font-bold border border-amber-400/40 shadow-sm'
                            : 'bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200/50'
                      } whitespace-pre-line`}>
                        {msg.text}
                      </div>

                      {/* Pay Button for bot messages containing active order details */}
                      {msg.sender === 'bot' && msg.orderCreatedId && msg.parsedData && (
                        <div className="mt-2 pl-1">
                          {msg.paymentCompleted ? (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>অগ্রিম পেমেন্ট সম্পন্ন</span>
                            </div>
                          ) : (
                            <button
                              id={`pay-fb-order-btn-${msg.orderCreatedId}`}
                              onClick={() => handlePayDeliveryCharge(msg)}
                              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-stone-950 font-display font-extrabold text-[10.5px] px-4 py-2 rounded-xl shadow-md flex items-center space-x-1.5 transition-colors border border-emerald-400/40"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse text-stone-900" />
                              <span>৳১২০ ডেলিভারি চার্জ দিন (Pay Delivery)</span>
                            </button>
                          )}
                        </div>
                      )}

                      <span className="text-[8px] text-stone-400 block px-1 text-right">
                        {msg.sender === 'user' ? 'You' : msg.sender === 'admin' ? 'Admin 👤' : 'AI Bot 🤖'} • {msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 border border-stone-200/50 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Preset shortcuts section */}
            <div className="bg-stone-50 border-t border-stone-100 p-2 text-center">
              <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block mb-1">সরাসরি অর্ডার করতে ট্যাপ করুন</span>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    id={`fb-chat-preset-btn-${i}`}
                    onClick={() => handleSendMessage(p.text)}
                    className="px-2.5 py-1 bg-white hover:bg-amber-500/5 hover:border-amber-500/30 border border-stone-200 rounded-full text-[9px] font-medium text-stone-600 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-stone-150 p-2.5 flex items-center space-x-2 shrink-0">
              <input
                id="fb-chat-msg-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 bg-stone-50 border border-stone-200 text-stone-800 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                id="fb-chat-send-btn"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-stone-200 disabled:text-stone-400 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
