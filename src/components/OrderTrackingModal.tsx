/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, Clock, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, MapPin, Phone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus } from '../types.js';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export default function OrderTrackingModal({ isOpen, onClose, orders }: OrderTrackingModalProps) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter orders by search query (Order ID, phone in shippingAddress or customerName)
  const queryClean = searchQuery.trim().toLowerCase();
  const matchedOrders = orders.filter(o => {
    if (!queryClean) return true; // Show all if search is empty
    return (
      o.id.toLowerCase().includes(queryClean) ||
      o.customerName.toLowerCase().includes(queryClean) ||
      o.shippingAddress.toLowerCase().includes(queryClean) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(queryClean)) ||
      (o.paymentDetails && o.paymentDetails.transactionId?.toLowerCase().includes(queryClean))
    );
  });

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Paid': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const steps = [
    { label: 'অর্ডার গৃহীত', sub: 'Pending' },
    { label: 'পেমেন্ট ভেরিফাইড', sub: 'Paid' },
    { label: 'প্যাকেজিং প্রসেসিং', sub: 'Processing' },
    { label: 'কুরিয়ারে শিপড', sub: 'Shipped' },
    { label: 'ডেলিভারি সম্পন্ন', sub: 'Delivered' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col font-sans text-stone-800"
        >
          {/* Modal Header */}
          <div className="bg-stone-900 text-stone-100 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-stone-100 flex items-center gap-2">
                  <span>অর্ডার ট্র্যাকিং ও হিস্টোরি (Track Order)</span>
                </h2>
                <p className="text-[11px] text-stone-400">আপনার অর্ডার আইডি বা মোবাইল নম্বর দিয়ে স্ট্যাটাস দেখুন</p>
              </div>
            </div>
            <button
              id="close-tracking-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="tracking-search-input"
                type="text"
                placeholder="অর্ডার আইডি (যেমন: ORD-8421) অথবা মোবাইল নাম্বার বা TrxID দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Orders List Container */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {matchedOrders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-stone-500 font-medium text-xs">কোন অর্ডার পাওয়া যায়নি!</p>
                <p className="text-stone-400 text-[11px]">আপনার ইনপুট করা অর্ডার আইডি বা ফোন নম্বর চেক করুন</p>
              </div>
            ) : (
              matchedOrders.map(order => {
                const currentStepIdx = getStatusStepIndex(order.status);
                const isCancelled = order.status === 'Cancelled';

                return (
                  <div key={order.id} className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 space-y-4 shadow-sm hover:border-amber-400/50 transition-all">
                    {/* Top Row Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-stone-900 bg-stone-200/70 px-2.5 py-0.5 rounded-md">
                            #{order.id}
                          </span>
                          <button
                            onClick={() => handleCopy(order.id)}
                            className="text-stone-400 hover:text-amber-600 text-xs flex items-center space-x-1"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono block mt-1">
                          তারিখ: {new Date(order.createdAt).toLocaleString('bn-BD')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          order.status === 'Delivered' ? 'bg-emerald-600 text-white font-extrabold shadow-sm' :
                          order.status === 'Processing' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {order.status === 'Pending' && '🟡 পেন্ডিং ভেরিফিকেশন'}
                          {order.status === 'Paid' && '🟢 পেমেন্ট নিশ্চিত'}
                          {order.status === 'Processing' && '🟣 প্যাকিং প্রসেসিং'}
                          {order.status === 'Shipped' && '🔵 কুরিয়ারে শিপড'}
                          {order.status === 'Delivered' && '✅ ডেলিভারি সম্পন্ন'}
                          {order.status === 'Cancelled' && '🔴 অর্ডার বাতিল'}
                        </span>
                        <div className="font-display font-black text-sm text-stone-900 mt-1">
                          মোট: ৳{order.total.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Progress Bar */}
                    {!isCancelled ? (
                      <div className="py-2 px-1">
                        <div className="relative flex items-center justify-between">
                          {/* Background Line */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 rounded-full z-0" />
                          {/* Active Filled Line */}
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 rounded-full z-0 transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (currentStepIdx / (steps.length - 1)) * 100)}%`
                            }}
                          />

                          {steps.map((step, idx) => {
                            const isDone = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isDone
                                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 shadow-sm'
                                    : 'bg-stone-200 text-stone-500'
                                } ${isCurrent ? 'scale-110 ring-4 ring-amber-400/40' : ''}`}>
                                  {isDone ? <CheckCircle2 className="w-4 h-4 text-stone-950" /> : idx + 1}
                                </div>
                                <span className={`text-[9px] font-medium mt-1 text-center max-w-[65px] leading-tight ${
                                  isDone ? 'text-stone-900 font-bold' : 'text-stone-400'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-semibold flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>এই অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে এডমিনের সাথে যোগাযোগ করুন।</span>
                      </div>
                    )}

                    {/* Courier Tracking Section */}
                    {(order.trackingNumber || order.trackingUrl) && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span>কুরিয়ার ট্র্যাকিং নম্বর (Courier Tracking)</span>
                          </span>
                          <span className="font-mono font-black text-xs text-blue-950 bg-white px-2.5 py-0.5 rounded border border-blue-200">
                            {order.trackingNumber || 'STEADFAST-LIVE'}
                          </span>
                        </div>

                        {order.trackingUrl ? (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                          >
                            <span>লাইভ কুরিয়ার ওয়েবসাইট ট্র্যাকিং দেখুন</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <p className="text-[11px] text-blue-800">
                            কুরিয়ার ট্র্যাকিং আইডি: <strong>{order.trackingNumber}</strong> (Steadfast / Pathao Courier)
                          </p>
                        )}
                      </div>
                    )}

                    {!order.trackingNumber && !order.trackingUrl && order.status !== 'Cancelled' && (
                      <div className="bg-stone-100 border border-stone-200/80 rounded-xl p-2.5 text-[11px] text-stone-600 flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>এডমিন আপনার অর্ডার শিপিং (Shipped) করলে লাইভ কুরিয়ার ট্র্যাকিং লিঙ্ক এখানে দেখতে পাবেন।</span>
                      </div>
                    )}

                    {/* Order Items & Customer details */}
                    <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-2 text-xs">
                      <div className="font-bold text-stone-800 border-b border-stone-100 pb-1.5">
                        অর্ডারকৃত পণ্যসমূহ:
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-stone-700">
                            <span>
                              <span className="font-bold font-mono text-stone-900">{item.quantity}x</span> {item.productName}
                            </span>
                            <span className="font-mono font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 space-y-1">
                        <div><strong>গ্রাহক:</strong> {order.customerName}</div>
                        <div><strong>ঠিকানা:</strong> {order.shippingAddress}</div>
                        {order.paymentDetails && (
                          <div className="flex items-center space-x-2 text-emerald-700 font-mono">
                            <span><strong>পেমেন্ট মাধ্যম:</strong> {order.paymentDetails.cardBrand}</span>
                            <span>| <strong>TrxID:</strong> {order.paymentDetails.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-stone-100 border-t border-stone-200 shrink-0 text-center text-xs text-stone-500 flex justify-between items-center">
            <span>Closet Crush Instant Order Tracking System</span>
            <button
              onClick={onClose}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-4 py-1.5 rounded-lg font-bold"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
