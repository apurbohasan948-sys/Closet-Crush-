/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, LayoutDashboard, Store, Flame, Compass } from 'lucide-react';

interface NavbarProps {
  activeTab: 'store' | 'admin';
  setActiveTab: (tab: 'store' | 'admin') => void;
  cartCount: number;
  toggleCart: () => void;
  isAdminGatewayUnlocked: boolean;
}

export default function Navbar({ activeTab, setActiveTab, cartCount, toggleCart, isAdminGatewayUnlocked }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('store')}>
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-stone-900 shadow">
              <Flame className="w-5 h-5 text-stone-100" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                Closet Crush
              </span>
              <p className="text-[10px] text-stone-400 font-mono tracking-wider -mt-1 uppercase">Curated Fashion</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              id="nav-store-btn"
              onClick={() => setActiveTab('store')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'store'
                  ? 'bg-stone-800 text-amber-400'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
            {isAdminGatewayUnlocked && (
              <button
                id="nav-admin-btn"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-stone-800 text-amber-400'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin & Channels</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {isAdminGatewayUnlocked && (
              <button
                id="mobile-nav-toggle-btn"
                onClick={() => setActiveTab(activeTab === 'store' ? 'admin' : 'store')}
                className="md:hidden p-2 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                title="Toggle View"
              >
                {activeTab === 'store' ? (
                  <LayoutDashboard className="w-5 h-5 text-amber-400" />
                ) : (
                  <Store className="w-5 h-5 text-amber-400" />
                )}
              </button>
            )}

            <button
              id="nav-cart-btn"
              onClick={toggleCart}
              className="relative p-2 rounded-full text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-all focus:outline-none"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
