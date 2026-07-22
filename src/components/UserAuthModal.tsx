/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: { name: string; emailOrPhone: string; authType: 'email' | 'phone' }) => void;
  initialMode?: 'register' | 'login';
}

export default function UserAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'register'
}: UserAuthModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !fullName.trim()) {
      setError('অনুগ্রহ করে আপনার নাম প্রদান করুন (Please enter your full name).');
      return;
    }

    if (!emailOrPhone.trim()) {
      setError(
        authMethod === 'email'
          ? 'অনুগ্রহ করে সঠিক জিমেইল/ইমেইল এড্রেস লিখুন (Please enter Gmail/Email).'
          : 'অনুগ্রহ করে সঠিক মোবাইল নাম্বার লিখুন (Please enter Phone Number).'
      );
      return;
    }

    if (authMethod === 'email' && !emailOrPhone.includes('@')) {
      setError('অনুগ্রহ করে একটি সঠিক ইমেইল/জিমেইল এড্রেস প্রদান করুন (e.g. example@gmail.com).');
      return;
    }

    if (authMethod === 'phone' && emailOrPhone.replace(/[^0-9]/g, '').length < 11) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের ফোন নাম্বার লিখুন (e.g. 01712345678).');
      return;
    }

    if (!password || password.length < 4) {
      setError('কমপক্ষে ৪ ডিজিটের পাসওয়ার্ড বা পিন দিন (Password must be at least 4 chars).');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(mode === 'register' ? 'একাউন্ট সফলভাবে তৈরি হয়েছে!' : 'সফলভাবে লগইন হয়েছে!');
      
      setTimeout(() => {
        onLoginSuccess({
          name: fullName.trim() || emailOrPhone.split('@')[0] || 'গ্রাহক',
          emailOrPhone: emailOrPhone.trim(),
          authType: authMethod
        });
        onClose();
      }, 800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-stone-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative font-sans my-auto"
      >
        {/* Header */}
        <div className="p-5 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-stone-50">
                {mode === 'register' ? 'কাস্টমার একাউন্ট খুলুন' : 'লগইন করুন'}
              </h3>
              <p className="text-[11px] text-stone-400">
                অর্ডার সম্পন্ন করতে জিমেইল বা ফোন দিয়ে একাউন্ট দরকার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Toggle Register vs Login */}
          <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              নতুন একাউন্ট খুলুন
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              পূর্বের একাউন্টে লগইন
            </button>
          </div>

          {/* Auth Method Selector (Email vs Phone) */}
          <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-xl text-xs">
            <span className="font-bold text-stone-700 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>একাউন্ট টাইপ সিলেক্ট করুন:</span>
            </span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(''); }}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 transition-colors ${
                  authMethod === 'email'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                <Mail className="w-3 h-3" />
                <span>Gmail / ইমেইল</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(''); }}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 transition-colors ${
                  authMethod === 'phone'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                <Phone className="w-3 h-3" />
                <span>ফোন নম্বর</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  আপনার পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রমিম হাসান"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {authMethod === 'email' ? 'Gmail / ইমেইল এড্রেস' : 'মোবাইল ফোন নম্বর'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                {authMethod === 'email' ? (
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                ) : (
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                )}
                <input
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  required
                  placeholder={
                    authMethod === 'email' ? 'e.g. customer@gmail.com' : 'e.g. 01712345678'
                  }
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                পাসওয়ার্ড বা সিকিউরিটি পিন (Password / PIN) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-2.5 px-4 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'register' ? 'একাউন্ট খুলুন ও কনফার্ম করুন' : 'সাইন ইন করুন'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-stone-400 text-center leading-relaxed">
            🛡️ আপনার তথ্য সম্পূর্ণ নিরাপদ। একাউন্ট খোলার পর আপনি সাথে সাথে অর্ডার সম্পন্ন করতে পারবেন।
          </p>
        </div>
      </motion.div>
    </div>
  );
}
