import React, { useState } from 'react';
import { Mail, MailOpen, X, Trash2, Check, Clock, Inbox, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SimulatedEmail {
  id: string;
  subject: string;
  recipient: string;
  sender: string;
  bodyHtml: string;
  sentAt: string;
  isRead: boolean;
}

interface SimulatedInboxProps {
  isOpen: boolean;
  onClose: () => void;
  emails: SimulatedEmail[];
  onMarkAsRead: (emailId: string) => void;
  onClearAll: () => void;
  onDeleteEmail: (emailId: string) => void;
}

export default function SimulatedInbox({
  isOpen,
  onClose,
  emails,
  onMarkAsRead,
  onClearAll,
  onDeleteEmail
}: SimulatedInboxProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  // Mark selected email as read when opened
  React.useEffect(() => {
    if (selectedEmailId) {
      onMarkAsRead(selectedEmailId);
    }
  }, [selectedEmailId]);

  // Handle setting default selected email if list changes
  React.useEffect(() => {
    if (emails.length > 0 && !emails.some(e => e.id === selectedEmailId)) {
      setSelectedEmailId(emails[0].id);
    }
  }, [emails, selectedEmailId]);

  if (!isOpen) return null;

  const unreadCount = emails.filter(e => !e.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
      {/* Backdrop click close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-stone-50 border-l border-stone-200 w-full max-w-4xl h-full shadow-2xl flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="relative bg-amber-500/10 p-2 rounded-xl border border-amber-500/25">
              <Mail className="w-5 h-5 text-amber-600 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-display font-extrabold text-stone-900 text-sm sm:text-base">
                Customer Email Simulator
              </h2>
              <p className="text-stone-400 text-[10px] font-mono leading-none mt-0.5">
                SMTP Sandbox &bull; ramimhasan920@gmail.com
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {emails.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-stone-500 hover:text-rose-600 p-1.5 rounded-lg text-xs font-semibold hover:bg-stone-100 flex items-center gap-1 transition-all"
                title="Empty Inbox"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Empty Inbox</span>
              </button>
            )}
            <button
              id="close-email-sim"
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body with split inbox list & viewer */}
        <div className="flex-1 flex overflow-hidden">
          {emails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-stone-50">
              <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4 shadow-inner">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-stone-850 text-base">Inbox is Empty</h3>
              <p className="text-stone-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                পণ্য কেনার পর একটি স্বয়ংক্রিয় অর্ডার কনফার্মেশন মেইল এই সিমুলেটেড ইনবক্সে চলে আসবে।
              </p>
            </div>
          ) : (
            <>
              {/* Left Sidebar: Email List */}
              <div className="w-full sm:w-80 md:w-96 border-r border-stone-200 bg-white flex flex-col overflow-y-auto shrink-0">
                <div className="p-3 bg-stone-50 border-b border-stone-150 flex items-center justify-between text-[11px] font-mono text-stone-400 uppercase tracking-wider font-bold">
                  <span>Received Messages</span>
                  <span>{emails.length} items</span>
                </div>
                <div className="divide-y divide-stone-150">
                  {emails.map((email) => {
                    const isSelected = selectedEmailId === email.id;
                    return (
                      <button
                        key={email.id}
                        type="button"
                        onClick={() => setSelectedEmailId(email.id)}
                        className={`w-full text-left p-4 transition-all block relative ${
                          isSelected
                            ? 'bg-amber-500/5 border-l-4 border-amber-500'
                            : 'hover:bg-stone-50 border-l-4 border-transparent'
                        }`}
                      >
                        {/* Unread indicator */}
                        {!email.isRead && (
                          <span className="absolute top-4.5 right-4 w-2 h-2 rounded-full bg-amber-500" />
                        )}

                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="text-[10px] font-bold text-stone-500 tracking-wide truncate max-w-[150px]">
                            {email.sender.split('@')[0].toUpperCase()} Concierge
                          </span>
                          <span className="text-[9px] font-mono text-stone-400 whitespace-nowrap">
                            {email.sentAt.split(', ')[1] || email.sentAt}
                          </span>
                        </div>

                        <h4 className={`text-xs text-stone-850 line-clamp-1 mb-1 ${!email.isRead ? 'font-extrabold text-stone-950' : 'font-medium'}`}>
                          {email.subject}
                        </h4>

                        <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                          Recipient: {email.recipient}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right panel: Email Reader */}
              <div className="hidden sm:flex flex-1 flex-col bg-stone-50 overflow-hidden">
                {selectedEmail ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Reader Header */}
                    <div className="p-4 bg-white border-b border-stone-200 space-y-3 shrink-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display font-extrabold text-stone-900 text-sm sm:text-base">
                          {selectedEmail.subject}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const prevIdx = emails.findIndex(e => e.id === selectedEmail.id);
                            onDeleteEmail(selectedEmail.id);
                            if (emails.length > 1) {
                              const nextIdx = prevIdx === 0 ? 1 : prevIdx - 1;
                              setSelectedEmailId(emails[nextIdx].id);
                            } else {
                              setSelectedEmailId(null);
                            }
                          }}
                          className="text-stone-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete Email"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-600">
                        <div className="space-y-0.5">
                          <div>
                            <span className="font-bold text-stone-800">From:</span> {selectedEmail.sender}
                          </div>
                          <div>
                            <span className="font-bold text-stone-800">To:</span> {selectedEmail.recipient}
                          </div>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono text-right">
                          <span className="block">{selectedEmail.sentAt}</span>
                          <span className="inline-flex items-center gap-0.5 mt-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase text-[8px] border border-emerald-200">
                            <Check className="w-2.5 h-2.5" /> SECURE SSL
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reader Body (HTML sandbox) */}
                    <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                      <div
                        className="w-full max-w-2xl bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400">
                    <MailOpen className="w-8 h-8 text-stone-300 mb-2" />
                    <p className="text-xs">Select an email from the left sidebar to view details.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Small screen overlay fallback when viewing email directly */}
        <AnimatePresence>
          {selectedEmail && (
            <div className="sm:hidden absolute inset-0 z-20 bg-stone-50 flex flex-col">
              <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedEmailId(null)}
                  className="text-stone-500 font-bold text-xs flex items-center gap-1"
                >
                  &larr; Back to List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEmail(selectedEmail.id);
                    setSelectedEmailId(null);
                  }}
                  className="text-rose-500 font-bold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex justify-center">
                <div
                  className="w-full max-w-md bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
