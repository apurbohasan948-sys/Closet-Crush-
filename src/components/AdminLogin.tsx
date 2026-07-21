/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Key, User, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate an international standard backend authentication latency (500ms)
    setTimeout(() => {
      // Standard hardcoded credentials for demonstration & sandbox
      if (username.trim() === 'admin' && password === 'admin123') {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        onLoginSuccess();
      } else {
        setError('ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন। (Invalid Credentials)');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 p-6 sm:p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xl font-sans">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-amber-500/20">
          <Lock className="w-6 h-6 text-amber-600 animate-pulse" />
        </div>
        <h2 className="font-display font-bold text-lg text-stone-900">অ্যাডমিন লগইন (Secure Admin Gateway)</h2>
        <p className="text-xs text-stone-500 mt-1">
          এটি একটি সংরক্ষিত এলাকা। এখানে প্রবেশ করতে সঠিক অ্যাডমিন ক্রেডেনশিয়াল ব্যবহার করুন।
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200/80 text-red-700 text-xs rounded-xl flex items-start space-x-2"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Input */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-1.5">
            Admin Username (ইউজারনেম)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <User className="w-4 h-4" />
            </span>
            <input
              id="admin-username-input"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-1.5">
            Secure Password (পাসওয়ার্ড)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Key className="w-4 h-4" />
            </span>
            <input
              id="admin-password-input"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              id="toggle-password-btn"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sandbox Instruction Helper Box */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] leading-relaxed text-stone-700">
          <div className="font-bold text-amber-900 mb-0.5">🔑 স্যান্ডবক্স ডেমো ক্রেডেনশিয়াল (Default Credentials):</div>
          <div className="flex justify-between font-mono text-[10px] text-stone-600">
            <span>Username: <strong className="text-stone-800 select-all">admin</strong></span>
            <span>Password: <strong className="text-stone-800 select-all">admin123</strong></span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="admin-login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl py-2.5 px-4 font-display font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-colors disabled:bg-stone-300"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>লগইন করুন (Verify & Access)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
