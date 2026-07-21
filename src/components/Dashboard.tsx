/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, ShoppingCart, MessageSquare, Send, CheckCircle2, 
  RefreshCw, Plus, Minus, Cpu, Settings, BadgeAlert, Sparkles, 
  Facebook, Laptop, Smartphone, HelpCircle, FileJson, AlertCircle, Trash2,
  Megaphone, Image, Layers, Check
} from 'lucide-react';
import { Product, Order, OrderStatus, OrderSource, TelegramConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateProductStock: (id: string, newStock: number) => void;
  onAddProduct: (productData: any) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onLogout?: () => void;
}

export default function Dashboard({
  products,
  orders,
  onUpdateProductStock,
  onAddProduct,
  onUpdateOrderStatus,
  onLogout
}: DashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'orders' | 'telegram' | 'facebook' | 'campaign'>('orders');
  
  // Inventory state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdStock, setNewProdStock] = useState('5');
  const [newProdCategory, setNewProdCategory] = useState('Ceramics');

  // Order filters
  const [orderFilter, setOrderFilter] = useState<'All' | OrderStatus>('All');

  // Telegram Config & Simulator
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [botUsername, setBotUsername] = useState('HandmadeStoreBot');
  const [isBotSaving, setIsBotSaving] = useState(false);
  const [teleConfig, setTeleConfig] = useState<TelegramConfig>({
    token: '',
    chatId: '',
    botUsername: 'HandmadeStoreBot',
    isActive: false
  });
  const [teleLogs, setTeleLogs] = useState<any[]>([]);
  const [simChatMessage, setSimChatMessage] = useState('');
  const teleLogsEndRef = useRef<HTMLDivElement>(null);

  // Facebook Simulation
  const [fbComment, setFbComment] = useState('');
  const [isFbParsing, setIsFbParsing] = useState(false);
  const [fbResult, setFbResult] = useState<any>(null);

  // Multi-Image Bulk Post Campaign State
  const [campaignTitle, setCampaignTitle] = useState('New Spring Elegance Handcrafts ✨');
  const [campaignDesc, setCampaignDesc] = useState('Embrace the minimalist aesthetics of our new organic stoneware collection. Carefully hand-glazed, lead-free, and designed to bring warmth to your home.');
  const [campaignImages, setCampaignImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80', // Clay Plate
    'https://images.unsplash.com/photo-1576016770956-debb63d900ef?auto=format&fit=crop&w=600&q=80', // Linen Napkins
    'https://images.unsplash.com/photo-1606722590583-6951b5ea92ce?auto=format&fit=crop&w=600&q=80'  // Stone Bowls
  ]);
  const [newCampaignImage, setNewCampaignImage] = useState('');
  const [isPublishingCampaign, setIsPublishingCampaign] = useState(false);
  const [campaignTargetChannels, setCampaignTargetChannels] = useState({
    telegram: true,
    facebook: true,
    storefront: true
  });
  const [publishedCampaigns, setPublishedCampaigns] = useState<any[]>([
    {
      id: 'CAMP-891',
      title: 'Artisan Cozy Evenings Pack ☕',
      description: 'Handmade scented candles paired with pure merino wool throws. Create your perfect retreat.',
      images: [
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1528938102132-4a9276b8e320?auto=format&fit=crop&w=600&q=80'
      ],
      channels: ['telegram', 'facebook', 'storefront'],
      publishedAt: '2026-07-20 18:45 PM',
      stats: { likes: 142, shares: 31, clicks: 88 }
    }
  ]);

  // Load Telegram Status on Mount & Poll
  const fetchTelegramStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setTeleConfig(data.config);
      setTeleLogs(data.logs);
      // Populate fields with current config if empty
      if (data.config.token && !botToken) setBotToken(data.config.token);
      if (data.config.chatId && !chatId) setChatId(data.config.chatId);
      if (data.config.botUsername) setBotUsername(data.config.botUsername);
    } catch (err) {
      console.error('Failed to load telegram status:', err);
    }
  };

  useEffect(() => {
    fetchTelegramStatus();
    // Poll Telegram status & logs every 4 seconds to get updates from real-time events
    const interval = setInterval(fetchTelegramStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll telegram logs phone view to bottom
  useEffect(() => {
    if (teleLogsEndRef.current) {
      teleLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [teleLogs]);

  // Handle Telegram Config Saving
  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBotSaving(true);
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: botToken,
          chatId,
          botUsername
        })
      });
      const data = await res.json();
      setTeleConfig(data.config);
      alert('Telegram Configuration saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save Telegram settings.');
    } finally {
      setIsBotSaving(false);
    }
  };

  // Simulate Telegram User command
  const handleSimulateTelegramChat = async (messageText: string) => {
    if (!messageText.trim()) return;
    try {
      const res = await fetch('/api/telegram/simulate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      setSimChatMessage('');
      fetchTelegramStatus();
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Facebook Comment ingestion (Gemini powered order extraction!)
  const handleSimulateFacebook = async (commentText: string) => {
    if (!commentText.trim()) return;
    setIsFbParsing(true);
    setFbResult(null);
    try {
      const res = await fetch('/api/facebook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText })
      });
      const data = await res.json();
      setFbResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFbParsing(false);
    }
  };

  // Facebook Live Chat Admin State
  const [fbChatMessages, setFbChatMessages] = useState<any[]>([]);
  const [isDirectAdminMode, setIsDirectAdminMode] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const fbChatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Facebook chat details
  const fetchFbChatStatus = async () => {
    try {
      const res = await fetch('/api/facebook/chat');
      const data = await res.json();
      if (data) {
        setFbChatMessages(data.messages);
        setIsDirectAdminMode(data.isDirectAdminMode);
      }
    } catch (err) {
      console.error('Failed to load facebook chat:', err);
    }
  };

  useEffect(() => {
    fetchFbChatStatus();
    
    // Connect SSE listener for real-time live chat updates
    const eventSource = new EventSource('/api/events');
    const handleUpdate = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.messages) {
          setFbChatMessages(data.messages);
          setIsDirectAdminMode(data.isDirectAdminMode);
        }
      } catch (err) {
        console.error('Failed to parse SSE facebook_chat_updated event:', err);
      }
    };
    eventSource.addEventListener('facebook_chat_updated', handleUpdate);

    return () => {
      eventSource.removeEventListener('facebook_chat_updated', handleUpdate);
      eventSource.close();
    };
  }, []);

  // Scroll to bottom of admin live chat window
  useEffect(() => {
    if (fbChatEndRef.current) {
      fbChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [fbChatMessages]);

  const handleSendAdminReply = async () => {
    if (!adminReplyText.trim()) return;
    const textToSend = adminReplyText;
    setAdminReplyText('');

    try {
      await fetch('/api/facebook/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', text: textToSend })
      });
    } catch (err) {
      console.error('Failed to send admin reply:', err);
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
      console.error('Failed to toggle facebook direct admin mode:', err);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    onAddProduct({
      name: newProdName,
      price: parseFloat(newProdPrice),
      description: newProdDesc,
      image: newProdImage || undefined,
      stock: parseInt(newProdStock),
      category: newProdCategory
    });
    // Reset Form
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImage('');
    setNewProdStock('5');
    setShowAddForm(false);
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'All') return true;
    return o.status === orderFilter;
  });

  // Preset Facebook order comments to easily test the extraction
  const fbPresetComments = [
    {
      title: "Vase & Blankets order",
      text: "Hello! This is Marcus Aurelius. I absolutely adore your Aura Ceramic Vase! Can I please buy 2 of them? And also 1 Nomad Merino Throw Blanket to keep warm? Please ship them to: Via dei Fori Imperiali 1, Rome, Italy."
    },
    {
      title: "Simple Sage Candle order",
      text: "Hi there Closet Crush, my name is Eleanor Vance, and I want to order 4 of your Forest Sage Soy Candles. Let me know when they can be dispatched to: 104 West Oak Road, Portland, OR 97201."
    },
    {
      title: "Leather Journal with minimal details",
      text: "Can I get 3 Heritage Leather Journals? My shipping address is: 456 Pine St, Austin, TX. Thanks, Jordan."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-5 mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">Admin & Integration Hub</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage your artisan inventory, track real-time orders, and manage automated sales channels.
          </p>
        </div>
        
        {/* Real-time Indicator banner & Logout */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-emerald-700 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-Time Sync Activated</span>
          </div>
          {onLogout && (
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-red-600 px-3 py-1 rounded-full border border-stone-200 text-xs font-semibold flex items-center transition-colors cursor-pointer"
              title="Logout Securely"
            >
              <span>লগআউট (Logout)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Tabs left, Content right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-1.5">
          <button
            id="subtab-orders-btn"
            onClick={() => setActiveSubTab('orders')}
            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all ${
              activeSubTab === 'orders'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/45'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <span>Orders Queue</span>
              {orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="bg-rose-500 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-full font-extrabold animate-bounce">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </div>
          </button>

          <button
            id="subtab-inventory-btn"
            onClick={() => setActiveSubTab('inventory')}
            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all ${
              activeSubTab === 'inventory'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/45'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Artisan Inventory</span>
          </button>

          <button
            id="subtab-telegram-btn"
            onClick={() => setActiveSubTab('telegram')}
            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all ${
              activeSubTab === 'telegram'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/45'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <span>Telegram Bot Control</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${teleConfig.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {teleConfig.isActive ? 'Active' : 'Sim'}
              </span>
            </div>
          </button>

          <button
            id="subtab-facebook-btn"
            onClick={() => setActiveSubTab('facebook')}
            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all ${
              activeSubTab === 'facebook'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/45'
            }`}
          >
            <Facebook className="w-4 h-4 shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <span>Facebook Page Capture</span>
              <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                AI Parser
              </span>
            </div>
          </button>

          <button
            id="subtab-campaign-btn"
            onClick={() => setActiveSubTab('campaign')}
            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all ${
              activeSubTab === 'campaign'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/45'
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0 text-amber-600 group-hover:text-amber-800" />
            <div className="flex-1 flex justify-between items-center">
              <span>Bulk Campaign Poster</span>
              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                Multi-Post
              </span>
            </div>
          </button>
        </div>

        {/* Content Panel Area */}
        <div className="lg:col-span-3 bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 overflow-hidden">
          
          {/* TAB 1: ORDERS QUEUE */}
          {activeSubTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
                <h2 className="font-display font-extrabold text-xl text-stone-900">Real-Time Orders Feed</h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200/55">
                  {(['All', 'Pending', 'Paid', 'Shipped', 'Cancelled'] as const).map(status => (
                    <button
                      key={status}
                      id={`order-filter-${status.toLowerCase()}`}
                      onClick={() => setOrderFilter(status)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        orderFilter === status
                          ? 'bg-white text-stone-900 shadow-sm font-bold'
                          : 'text-stone-500 hover:text-stone-950'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-xs font-mono font-semibold bg-stone-50/50">
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Source</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Handcrafted Items</th>
                      <th className="py-3.5 px-4 text-right">Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {filteredOrders.map(o => {
                      const sourceColors: Record<OrderSource, string> = {
                        Website: 'bg-blue-50 text-blue-700 border-blue-200',
                        Telegram: 'bg-purple-50 text-purple-700 border-purple-200',
                        Facebook: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      };

                      return (
                        <tr key={o.id} className="hover:bg-stone-50/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-stone-900">
                            {o.id}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${sourceColors[o.source]}`}>
                              {o.source}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-stone-800">{o.customerName}</div>
                            <div className="text-[10px] text-stone-400 font-sans max-w-[140px] truncate" title={o.shippingAddress}>
                              {o.shippingAddress}
                            </div>
                            {o.paymentDetails && (
                              <div className="mt-1 flex items-center flex-wrap gap-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                                  o.paymentDetails.cardBrand?.toLowerCase().includes('bkash') ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                  o.paymentDetails.cardBrand?.toLowerCase().includes('nagad') ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                  o.paymentDetails.cardBrand?.toLowerCase().includes('rocket') ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                  'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}>
                                  {o.paymentDetails.cardBrand}
                                </span>
                                <span className="text-[9px] text-stone-500 font-mono">
                                  {o.paymentDetails.last4 ? `(*${o.paymentDetails.last4})` : ''} Trx: <span className="font-bold text-stone-700 select-all">{o.paymentDetails.transactionId}</span>
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-0.5 text-stone-600 text-xs">
                              {o.items.map((i, idx) => (
                                <div key={idx}>
                                  <span className="font-mono font-semibold text-stone-800">{i.quantity}x</span> {i.productName}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-display font-extrabold text-stone-900">
                            ${o.total.toFixed(2)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              o.status === 'Cancelled' ? 'bg-stone-100 text-stone-600' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {o.status === 'Pending' && (
                                <button
                                  id={`order-pay-${o.id}`}
                                  onClick={() => onUpdateOrderStatus(o.id, 'Paid')}
                                  className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded text-xs transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}
                              {o.status === 'Paid' && (
                                <button
                                  id={`order-ship-${o.id}`}
                                  onClick={() => onUpdateOrderStatus(o.id, 'Shipped')}
                                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded text-xs transition-colors"
                                >
                                  Ship Goods
                                </button>
                              )}
                              {o.status !== 'Shipped' && o.status !== 'Cancelled' && (
                                <button
                                  id={`order-cancel-${o.id}`}
                                  onClick={() => onUpdateOrderStatus(o.id, 'Cancelled')}
                                  className="px-2 py-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded text-xs transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400">
                          No orders found matching this filter state.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ARTISAN INVENTORY */}
          {activeSubTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-display font-extrabold text-xl text-stone-900">Handmade Goods Inventory</h2>
                <button
                  id="add-new-product-btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-display font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Handcrafted Item</span>
                </button>
              </div>

              {/* Add Product Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form
                    key="add-product-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddProductSubmit}
                    className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4 overflow-hidden"
                  >
                    <h3 className="font-display font-bold text-sm text-stone-800">Register New Handmade Creation</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Creation Name</label>
                        <input
                          id="add-prod-name"
                          type="text"
                          required
                          placeholder="e.g. Amber Clay Goblet"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                        <select
                          id="add-prod-category"
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          <option value="Ceramics">Ceramics</option>
                          <option value="Textiles">Textiles</option>
                          <option value="Home Fragrance">Home Fragrance</option>
                          <option value="Stationery">Stationery</option>
                          <option value="Wooden Ware">Wooden Ware</option>
                          <option value="Decor">Decor</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Price ($ USD)</label>
                        <input
                          id="add-prod-price"
                          type="number"
                          step="0.01"
                          required
                          placeholder="45.00"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Initial Stock Level</label>
                        <input
                          id="add-prod-stock"
                          type="number"
                          required
                          placeholder="5"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Unsplash Photo URL</label>
                        <input
                          id="add-prod-image"
                          type="text"
                          placeholder="Optional. Leaves blank for default image"
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Creation Narrative / Description</label>
                      <textarea
                        id="add-prod-desc"
                        rows={2}
                        placeholder="Describe the artisan story, materials used, and handmade crafting journey..."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-600"
                      >
                        Cancel
                      </button>
                      <button
                        id="add-prod-submit-btn"
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs font-semibold"
                      >
                        Add to Store Inventory
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Inventory Table List */}
              <div className="grid grid-cols-1 gap-4">
                {products.map(p => (
                  <div key={p.id} className="flex items-center space-x-4 p-4 border border-stone-200 rounded-xl hover:border-amber-500/30 transition-all bg-stone-50/50">
                    <img
                      referrerPolicy="no-referrer"
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-sm text-stone-900 truncate">{p.name}</h4>
                      <p className="text-[10px] text-stone-400 font-mono tracking-wide uppercase mt-0.5">{p.category} | ${p.price.toFixed(2)}</p>
                      <p className="text-stone-500 text-xs line-clamp-1 mt-1 max-w-xl">{p.description}</p>
                    </div>

                    {/* Stock Adjustment Controls */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-semibold text-stone-500 uppercase">Stock:</span>
                      <div className="flex items-center border border-stone-200 rounded bg-white overflow-hidden shadow-inner">
                        <button
                          id={`inventory-stock-dec-${p.id}`}
                          onClick={() => onUpdateProductStock(p.id, Math.max(0, p.stock - 1))}
                          className="p-1 hover:bg-stone-50 text-stone-500 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`px-3 py-1 font-mono text-xs font-bold w-12 text-center ${p.stock <= 3 ? 'text-rose-600 bg-rose-50' : 'text-stone-800'}`}>
                          {p.stock}
                        </span>
                        <button
                          id={`inventory-stock-inc-${p.id}`}
                          onClick={() => onUpdateProductStock(p.id, p.stock + 1)}
                          className="p-1 hover:bg-stone-50 text-stone-500 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TELEGRAM BOT CONTROL */}
          {activeSubTab === 'telegram' && (
            <div className="space-y-8">
              <div className="border-b border-stone-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-stone-900">Telegram Bot Channel</h2>
                  <p className="text-stone-400 text-xs mt-1">
                    Connect your real Telegram Bot to receive order triggers, check stock, and notify chats instantly.
                  </p>
                </div>
                
                {/* Active connection pill */}
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border inline-flex items-center space-x-1.5 ${
                  teleConfig.isActive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${teleConfig.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{teleConfig.isActive ? '🟢 Active Long-Polling' : '🟡 Offline (Simulator Active)'}</span>
                </div>
              </div>

              {/* Bot Config Form & Mobile Phone Simulator Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Credentials Panel */}
                <form onSubmit={handleSaveTelegram} className="xl:col-span-5 bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-stone-800 font-display font-bold text-sm mb-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    <span>Bot Credentials</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Telegram Bot Token</label>
                    <input
                      id="tele-token-input"
                      type="password"
                      placeholder="e.g. 5839201:AAHsfhK93..."
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Target Chat ID or Group ID</label>
                    <input
                      id="tele-chat-input"
                      type="text"
                      placeholder="e.g. 193850293 or -10048293"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Bot Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">@</span>
                      <input
                        id="tele-username-input"
                        type="text"
                        placeholder="HandmadeStoreBot"
                        value={botUsername}
                        onChange={(e) => setBotUsername(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg pl-7 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="tele-save-btn"
                    type="submit"
                    disabled={isBotSaving}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    {isBotSaving ? 'Updating...' : 'Save Configuration'}
                  </button>

                  {/* Config Tutorial */}
                  <div className="pt-4 border-t border-stone-200 text-stone-500 text-xs space-y-2 leading-relaxed">
                    <span className="font-semibold block text-stone-700">How to establish a real Bot:</span>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Message <b className="text-stone-700">@BotFather</b> on Telegram to create a bot & acquire a <b className="text-stone-700">Token</b>.</li>
                      <li>Message <b className="text-stone-700">@userinfobot</b> to obtain your personal <b className="text-stone-700">Chat ID</b>.</li>
                      <li>Save both fields above. The Node back-end starts polling instantly!</li>
                    </ol>
                  </div>
                </form>

                {/* Mobile Phone Simulation Panel */}
                <div className="xl:col-span-7 flex flex-col items-center">
                  <div className="w-[300px] h-[580px] bg-stone-900 rounded-[36px] shadow-2xl border-8 border-stone-800 flex flex-col overflow-hidden relative">
                    
                    {/* Phone Top Notch Notch */}
                    <div className="absolute top-0 inset-x-0 h-6 bg-stone-800 flex justify-center items-center z-10">
                      <div className="w-16 h-3.5 bg-stone-900 rounded-full" />
                    </div>

                    {/* Phone Screen App Header */}
                    <div className="bg-stone-800 text-stone-100 pt-7 pb-2 px-4 border-b border-stone-900 flex items-center space-x-2 shrink-0">
                      <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold leading-tight">Telegram Mobile Log</h4>
                        <span className="text-[9px] text-stone-400">@{botUsername}</span>
                      </div>
                    </div>

                    {/* Chat Bubble Stream */}
                    <div className="flex-1 bg-stone-950 p-4 overflow-y-auto space-y-3 font-sans text-xs scrollbar-thin">
                      {teleLogs.map(log => {
                        if (log.direction === 'system') {
                          return (
                            <div key={log.id} className="text-center text-[10px] text-stone-500 font-mono py-1 px-2 border-y border-stone-900 bg-stone-900/30">
                              {log.message}
                            </div>
                          );
                        }

                        const isCustomer = log.direction === 'inbound';
                        return (
                          <div key={log.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-2.5 ${
                              isCustomer 
                                ? 'bg-indigo-600 text-stone-100 rounded-br-none' 
                                : 'bg-stone-800 text-stone-200 rounded-bl-none'
                            }`}>
                              <span className="text-[9px] text-stone-400 block mb-0.5 font-semibold font-mono">
                                {isCustomer ? log.sender : `@${botUsername}`}
                              </span>
                              <p className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
                                {log.message}
                              </p>
                              <span className="text-[8px] text-stone-500 text-right block mt-1">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={teleLogsEndRef} />
                    </div>

                    {/* Quick Simulated Command shortcuts panel */}
                    <div className="bg-stone-900 p-2.5 border-t border-stone-950 flex flex-wrap gap-1.5 justify-center shrink-0">
                      <button id="sim-tele-start" onClick={() => handleSimulateTelegramChat('/start')} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-mono border border-stone-700">/start</button>
                      <button id="sim-tele-products" onClick={() => handleSimulateTelegramChat('/products')} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-mono border border-stone-700">/products</button>
                      <button id="sim-tele-orders" onClick={() => handleSimulateTelegramChat('/orders')} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-mono border border-stone-700">/orders</button>
                      <button id="sim-tele-status" onClick={() => handleSimulateTelegramChat('/status ORD-1002')} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-mono border border-stone-700">/status ORD-1002</button>
                    </div>

                    {/* Phone Screen Message Input bar */}
                    <div className="bg-stone-800 p-2.5 border-t border-stone-900 flex items-center space-x-2 shrink-0">
                      <input
                        id="telegram-sim-input"
                        type="text"
                        placeholder="Send message as customer..."
                        value={simChatMessage}
                        onChange={(e) => setSimChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSimulateTelegramChat(simChatMessage)}
                        className="flex-1 bg-stone-900 border border-stone-750 text-white rounded-full px-3.5 py-1.5 text-xs focus:outline-none"
                      />
                      <button
                        id="telegram-sim-send-btn"
                        onClick={() => handleSimulateTelegramChat(simChatMessage)}
                        className="p-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FACEBOOK PAGE ORDER CAPTURE (GEMINI INTEGRATION!) */}
          {activeSubTab === 'facebook' && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-stone-900">Facebook Page Administration Panel</h2>
                    <p className="text-stone-400 text-xs mt-1">
                      Manage your real-time customer inbox, reply directly as Admin, and simulate automatic Gemini AI order parsing.
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-1 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 text-indigo-700 text-xs font-mono font-bold shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Gemini 3.5 Flash Model Enabled</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* LEFT PANEL: ADMIN LIVE CHAT CONSOLE (5 cols) */}
                <div className="xl:col-span-5 bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col h-[580px] shadow-sm">
                  {/* Header & Status Indicator */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
                    <div className="flex items-center space-x-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="font-display font-bold text-sm text-stone-800">Admin Page Inbox</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                      <span className={`w-1.5 h-1.5 rounded-full ${isDirectAdminMode ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                      <span className="text-stone-600">
                        {isDirectAdminMode ? 'Direct Chat Active' : 'AI Bot Handling'}
                      </span>
                    </div>
                  </div>

                  {/* Live Messages List */}
                  <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs">
                    {fbChatMessages.map((msg: any) => {
                      if (msg.sender === 'system') {
                        return (
                          <div key={msg.id} className="flex justify-center my-1">
                            <span className="bg-amber-100 text-amber-900 text-[9px] px-2.5 py-0.5 rounded-full border border-amber-200 font-bold text-center">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-xl p-2.5 shadow-xs leading-relaxed ${
                            isAdmin 
                              ? 'bg-amber-500 text-stone-950 rounded-tr-none font-bold' 
                              : msg.sender === 'bot'
                                ? 'bg-stone-200/80 text-stone-700 rounded-tl-none font-medium'
                                : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none font-medium'
                          }`}>
                            <span className="text-[8px] text-stone-400 block mb-0.5 font-mono">
                              {isAdmin ? 'Admin (You) 👤' : msg.sender === 'bot' ? 'AI Assistant 🤖' : 'Facebook Customer 💬'}
                            </span>
                            <p className="whitespace-pre-line text-[10.5px]">{msg.text}</p>
                            <span className="text-[8px] text-stone-400 block text-right mt-1">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {fbChatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center py-20">
                        <MessageSquare className="w-8 h-8 text-stone-300 mb-2 animate-bounce" />
                        <span>No messages in the Page chat history yet.</span>
                      </div>
                    )}
                    <div ref={fbChatEndRef} />
                  </div>

                  {/* Reply Area */}
                  <div className="border-t border-stone-200 pt-3 shrink-0">
                    <div className="flex items-center space-x-2">
                      <input
                        id="admin-fb-reply-input"
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendAdminReply()}
                        placeholder={isDirectAdminMode ? "Type reply as Admin..." : "Reply as Admin (starts Direct Chat)..."}
                        className="flex-1 bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-stone-800"
                      />
                      <button
                        id="admin-fb-send-btn"
                        onClick={handleSendAdminReply}
                        disabled={!adminReplyText.trim()}
                        className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-stone-950 font-bold text-xs transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2.5 text-[9px] text-stone-400">
                      <span>Admin reply automatically forces Direct Chat mode.</span>
                      <button 
                        onClick={handleToggleAdminMode}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        {isDirectAdminMode ? 'Switch back to AI Bot' : 'Take over Chat manually'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL: FACEBOOK COMMENT SIMULATION & EXTRACTION (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
                    <div className="flex items-center space-x-2 text-stone-800 font-display font-bold text-sm mb-4">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Simulate Incoming Comment on Facebook Page</span>
                    </div>

                    <div className="space-y-4">
                      {/* Presets Grid */}
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">Preset Templates</span>
                        <div className="grid grid-cols-1 gap-2">
                          {fbPresetComments.map((p, idx) => (
                            <button
                              key={idx}
                              id={`fb-preset-${idx}`}
                              onClick={() => setFbComment(p.text)}
                              className="w-full text-left bg-white hover:bg-amber-500/5 hover:border-amber-500/40 p-2.5 rounded-lg text-xs border border-stone-200 transition-all flex items-start space-x-2"
                            >
                              <div className="p-1 rounded bg-stone-100 border text-[10px] font-mono shrink-0">Comment #{idx+1}</div>
                              <div>
                                <span className="font-bold text-stone-700 block">{p.title}</span>
                                <p className="text-stone-400 line-clamp-1 mt-0.5">{p.text}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment textarea */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Raw Comment Message Body</label>
                        <textarea
                          id="facebook-sim-comment-textarea"
                          rows={4}
                          value={fbComment}
                          onChange={(e) => setFbComment(e.target.value)}
                          placeholder="Paste a raw customer comment here (e.g., I'd love to order 3 forest candles. Can you ship to Jordan, 12 Main St?)"
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <button
                        id="facebook-parse-btn"
                        onClick={() => handleSimulateFacebook(fbComment)}
                        disabled={isFbParsing || !fbComment.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-display font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2"
                      >
                        {isFbParsing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Gemini AI parsing Order Details...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Parse Order with Gemini AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* AI Structured Extraction Results Bottom Right */}
                  <div className="bg-stone-900 border border-stone-950 rounded-xl p-5 text-stone-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-stone-850 pb-3">
                        <div className="flex items-center space-x-1.5">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold font-mono">Gemini Extraction Schema</span>
                        </div>
                        <span className="text-[9px] font-mono bg-indigo-500/15 text-indigo-400 border border-indigo-500/35 px-1.5 py-0.5 rounded uppercase">
                          json
                        </span>
                      </div>

                      <AnimatePresence mode="wait">
                        {isFbParsing ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12 text-center text-stone-400 space-y-3"
                          >
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                            <p className="text-xs font-mono font-semibold">Generating LLM Grounding Context...</p>
                            <p className="text-[10px] text-stone-500 max-w-xs mx-auto">
                              Validating matching item names in in-memory artisan catalogs using zero-shot semantic matching...
                            </p>
                          </motion.div>
                        ) : fbResult ? (
                          <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            {fbResult.success ? (
                              <>
                                <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-lg flex items-start space-x-2 text-emerald-400">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div className="text-xs">
                                    <span className="font-bold">Extraction Successful!</span> Order created instantly in the real-time queue.
                                  </div>
                                </div>

                                {/* Structured data code block */}
                                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-[10px] text-indigo-300 overflow-x-auto">
                                  <pre>{JSON.stringify(fbResult.parsedData, null, 2)}</pre>
                                </div>

                                {/* order details list summary */}
                                <div className="space-y-2 border-t border-stone-850 pt-3 text-stone-300 text-xs font-sans">
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Extracted Buyer:</span>
                                    <span className="font-bold">{fbResult.parsedData?.customerName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Mapped Product:</span>
                                    <span className="font-bold">{fbResult.parsedData?.productName} (Qty: {fbResult.parsedData?.quantity})</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Shipping Address:</span>
                                    <span className="font-bold text-right max-w-[150px] truncate">{fbResult.parsedData?.shippingAddress}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-stone-850 pt-1.5 text-stone-100 font-bold">
                                    <span>Total price estimate:</span>
                                    <span>${fbResult.parsedData?.totalPriceEstimate?.toFixed(2)}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="bg-rose-500/10 border border-rose-500/25 p-3.5 rounded-lg flex items-start space-x-2 text-rose-400 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block">Parsing Failure:</span>
                                  {fbResult.error || 'Unable to parse matching product or verify stock levels.'}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-16 text-center text-stone-500 text-xs font-sans"
                          >
                            <HelpCircle className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                            <p>Submit a Facebook page comment simulation on the left. The Gemini AI extraction result will render here in real-time.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="text-[10px] text-stone-500 font-mono text-center pt-6 border-t border-stone-850 mt-6 uppercase tracking-wider">
                      Powered by @google/genai TypeScript SDK
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: MULTI-IMAGE CAMPAIGN POSTER */}
          {activeSubTab === 'campaign' && (
            <div className="space-y-8">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="font-display font-extrabold text-xl text-stone-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  <span>মাল্টি-পোস্ট ক্যাম্পেইন প্রডিউসার (Bulk Campaign Poster)</span>
                </h2>
                <p className="text-stone-500 text-sm mt-1">
                  একটি টাইটেল ও বর্ণনা দিয়ে একাধিক ইমেজের সমন্বয়ে পৃথক পৃথক পোস্ট তৈরি করে বিভিন্ন মার্কেটিং চ্যানেলে একসাথে শেয়ার করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* COMPOSER FORM */}
                <div className="xl:col-span-7 space-y-6">
                  <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 sm:p-6 space-y-5">
                    <h3 className="font-display font-bold text-sm text-stone-850 uppercase tracking-wider border-b border-stone-150 pb-2">
                      Campaign Details
                    </h3>

                    {/* Title */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-1.5">
                        Post Title (টাইটেল)
                      </label>
                      <input
                        id="campaign-title-input"
                        type="text"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        placeholder="e.g. Elegant Handcrafted Collection"
                        className="w-full bg-white border border-stone-250 text-stone-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-1.5">
                        Post Description (বর্ণনা)
                      </label>
                      <textarea
                        id="campaign-desc-input"
                        rows={4}
                        value={campaignDesc}
                        onChange={(e) => setCampaignDesc(e.target.value)}
                        placeholder="Write dynamic content here..."
                        className="w-full bg-white border border-stone-250 text-stone-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none"
                      />
                    </div>

                    {/* Managed Images Grid */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-1.5 flex justify-between">
                        <span>Campaign Images (একাধিক ছবিসমূহ)</span>
                        <span className="text-amber-600 font-bold">{campaignImages.length} Image(s)</span>
                      </label>

                      {/* Display image grid */}
                      {campaignImages.length === 0 ? (
                        <div className="border-2 border-dashed border-stone-250 rounded-2xl py-8 text-center text-stone-400 text-xs mb-3">
                          <Image className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
                          <p>No images added yet. Paste a URL or select a preset below.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                          {campaignImages.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                              <img src={img} alt={`Campaign ${idx}`} className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setCampaignImages(campaignImages.filter((_, i) => i !== idx))}
                                  className="p-1.5 bg-rose-500 hover:bg-rose-600 rounded-full text-white transition-colors cursor-pointer"
                                  title="Delete Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-stone-900/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                Post #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Image Input */}
                      <div className="flex gap-2">
                        <input
                          id="new-campaign-image-input"
                          type="text"
                          value={newCampaignImage}
                          onChange={(e) => setNewCampaignImage(e.target.value)}
                          placeholder="Paste Unsplash or static image URL here..."
                          className="flex-1 bg-white border border-stone-250 text-stone-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCampaignImage.trim()) {
                              setCampaignImages([...campaignImages, newCampaignImage.trim()]);
                              setNewCampaignImage('');
                            }
                          }}
                          className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                        >
                          Add URL
                        </button>
                      </div>

                      {/* Quick Presets Gallery */}
                      <div className="mt-4">
                        <span className="block text-[10px] text-stone-400 font-semibold mb-2 uppercase tracking-wide">
                          Quick Presets (ক্লিক করে ছবি যুক্ত করুন):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: 'Sage Candle 🕯️', url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Ceramic Mug ☕', url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Clay Plate 🍽️', url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Wool Blanket 🧣', url: 'https://images.unsplash.com/photo-1528938102132-4a9276b8e320?auto=format&fit=crop&w=600&q=80' },
                            { name: 'Stone Bowls 🥣', url: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ce?auto=format&fit=crop&w=600&q=80' }
                          ].map((preset, index) => {
                            const isAlreadyIn = campaignImages.includes(preset.url);
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  if (!isAlreadyIn) {
                                    setCampaignImages([...campaignImages, preset.url]);
                                  } else {
                                    setCampaignImages(campaignImages.filter(u => u !== preset.url));
                                  }
                                }}
                                className={`text-[10px] font-sans px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                  isAlreadyIn
                                    ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-950'
                                }`}
                              >
                                {isAlreadyIn ? <Check className="w-3 h-3 text-amber-600 shrink-0" /> : <Plus className="w-3 h-3 text-stone-400 shrink-0" />}
                                <span>{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Target Channels Selection */}
                    <div className="border-t border-stone-150 pt-4">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-2">
                        Target Marketing Channels (পোস্টের গন্তব্যসমূহ)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Telegram */}
                        <label className="flex items-center space-x-3 bg-white p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all">
                          <input
                            type="checkbox"
                            checked={campaignTargetChannels.telegram}
                            onChange={(e) => setCampaignTargetChannels({ ...campaignTargetChannels, telegram: e.target.checked })}
                            className="accent-amber-500 w-4 h-4 rounded"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-stone-850">Telegram Bot</span>
                            <span className="text-[9px] text-stone-400 font-mono">@{teleConfig.botUsername || 'StoreBot'}</span>
                          </div>
                        </label>

                        {/* Facebook */}
                        <label className="flex items-center space-x-3 bg-white p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all">
                          <input
                            type="checkbox"
                            checked={campaignTargetChannels.facebook}
                            onChange={(e) => setCampaignTargetChannels({ ...campaignTargetChannels, facebook: e.target.checked })}
                            className="accent-amber-500 w-4 h-4 rounded"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-stone-850">Facebook Page</span>
                            <span className="text-[9px] text-stone-400 font-mono">Artisanal Live Feed</span>
                          </div>
                        </label>

                        {/* Storefront Feed */}
                        <label className="flex items-center space-x-3 bg-white p-3 border border-stone-200 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all">
                          <input
                            type="checkbox"
                            checked={campaignTargetChannels.storefront}
                            onChange={(e) => setCampaignTargetChannels({ ...campaignTargetChannels, storefront: e.target.checked })}
                            className="accent-amber-500 w-4 h-4 rounded"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-stone-850">Announcement</span>
                            <span className="text-[9px] text-stone-400 font-mono">Active Store Banners</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Submit Publish Button */}
                    <button
                      id="publish-campaign-btn"
                      type="button"
                      disabled={isPublishingCampaign || campaignImages.length === 0 || !campaignTitle.trim()}
                      onClick={async () => {
                        setIsPublishingCampaign(true);
                        // Simulate delay
                        setTimeout(() => {
                          const activeChannels = Object.entries(campaignTargetChannels)
                            .filter(([_, enabled]) => enabled)
                            .map(([name]) => name);

                          const newCamp = {
                            id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
                            title: campaignTitle,
                            description: campaignDesc,
                            images: [...campaignImages],
                            channels: activeChannels,
                            publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
                            stats: { likes: 0, shares: 0, clicks: 0 }
                          };

                          setPublishedCampaigns([newCamp, ...publishedCampaigns]);

                          // Optional: Simulate Telegram notification/logs for the campaign!
                          if (campaignTargetChannels.telegram) {
                            const newTeleLogs = [
                              {
                                type: 'outbound',
                                text: `📣 CAMPAIGN BULK POST PUBLISHED: *${campaignTitle}*\n\nGenerated ${campaignImages.length} distinct posts containing promotional images.\n\nDescription: ${campaignDesc}`,
                                timestamp: new Date().toLocaleTimeString()
                              },
                              ...teleLogs
                            ];
                            // Push mock api logs if possible
                            fetch('/api/telegram/simulate-chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message: `System notice: Bulk campaign published to channel with ${campaignImages.length} items.` })
                            }).catch(() => {});
                          }

                          setIsPublishingCampaign(false);
                          alert(`সাফল্যের সাথে ${campaignImages.length}টি আলাদা পোস্ট তৈরি করে ক্যাম্পেইনটি পাবলিশ করা হয়েছে!`);
                        }, 1200);
                      }}
                      className="w-full bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl py-3 px-4 font-display font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
                    >
                      {isPublishingCampaign ? (
                        <>
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>মার্কেটিং চ্যানেলে পোস্টসমূহ পাবলিশ করা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Megaphone className="w-4 h-4 text-amber-400" />
                          <span>এক ক্লিকে {campaignImages.length}টি পোস্ট পাবলিশ করুন (Publish Bulk Posts)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* VISUAL LIVE PREVIEW & HISTORY */}
                <div className="xl:col-span-5 space-y-6">
                  {/* Real-time split preview */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-xs text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Generated Split Preview</span>
                      <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono text-[9px] lowercase">
                        one description &rarr; multiple posts
                      </span>
                    </h3>

                    {campaignImages.length === 0 ? (
                      <div className="py-12 text-center text-stone-400 text-xs">
                        <Layers className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
                        <p>আপনার টাইটেল ও ছবিসমূহ যুক্ত করলে এখানে পোস্টগুলোর লাইভ প্রিভিউ জেনারেট হবে।</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                        <div className="text-[10px] text-amber-750 bg-amber-50/75 border border-amber-200/50 p-2.5 rounded-xl font-sans leading-relaxed">
                          ⚙️ <strong>সিস্টেম মেকানিজম:</strong> এটি ১টি টাইটেল ও ডেসক্রিপশন ব্যবহার করে {campaignImages.length}টি সম্পূর্ণ ভিন্ন ভিন্ন পোস্ট পাবলিশ করবে। প্রতিটি ছবিতে আলাদাকরে একই ইনফরমেশন অ্যাটাচ থাকবে।
                        </div>

                        {campaignImages.map((img, idx) => (
                          <div key={idx} className="border border-stone-200 rounded-xl bg-stone-50 overflow-hidden shadow-xs transition-transform hover:scale-[1.01]">
                            {/* Card Image */}
                            <div className="aspect-video bg-stone-200 overflow-hidden relative">
                              <img src={img} alt="Post preview" className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                              <span className="absolute top-2 left-2 bg-stone-900/80 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                                Post Card #{idx + 1}
                              </span>
                            </div>
                            {/* Card Content */}
                            <div className="p-3 space-y-1">
                              <h4 className="font-sans font-bold text-xs text-stone-800 line-clamp-1">{campaignTitle || 'Untitled Post'}</h4>
                              <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">{campaignDesc || 'No description provided yet.'}</p>
                              <div className="pt-2 border-t border-stone-150/60 mt-2 flex items-center justify-between text-[8px] font-mono text-stone-400">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to Broadcast
                                </span>
                                <span>1 Image Bound</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Published Campaign Logs / History */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-xs text-stone-700 uppercase tracking-wider flex items-center justify-between">
                      <span>ক্যাম্পেইন হিস্ট্রি (Published Campaigns)</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold">
                        {publishedCampaigns.length} Campaigns
                      </span>
                    </h3>

                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {publishedCampaigns.map((camp) => (
                        <div key={camp.id} className="p-3.5 rounded-xl border border-stone-150 bg-stone-50/40 hover:bg-stone-50 transition-colors space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-stone-400">{camp.id}</span>
                              <h4 className="font-sans font-bold text-xs text-stone-800 line-clamp-1 mt-0.5">{camp.title}</h4>
                            </div>
                            <span className="text-[8px] text-stone-400 font-mono">{camp.publishedAt}</span>
                          </div>

                          {/* Images strip list */}
                          <div className="flex items-center space-x-1">
                            {camp.images.map((img: string, idx: number) => (
                              <div key={idx} className="w-8 h-8 rounded border border-stone-200 bg-stone-100 overflow-hidden shrink-0">
                                <img src={img} alt="Post snippet" className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                              </div>
                            ))}
                            <span className="text-[9px] text-stone-400 font-mono pl-1">({camp.images.length} posts generated)</span>
                          </div>

                          {/* Channels & Stats bar */}
                          <div className="pt-2 border-t border-stone-150 flex flex-wrap items-center justify-between gap-2">
                            {/* Channels badges */}
                            <div className="flex gap-1.5">
                              {camp.channels.map((chan: string) => (
                                <span key={chan} className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono bg-stone-150 text-stone-600">
                                  {chan}
                                </span>
                              ))}
                            </div>
                            {/* Mock engagement metrics */}
                            <div className="flex items-center gap-2.5 text-[9px] font-mono text-stone-500">
                              <span>views: <strong className="text-stone-700">{camp.stats.clicks || Math.floor(25 + Math.random() * 80)}</strong></span>
                              <span>likes: <strong className="text-stone-700">{camp.stats.likes || Math.floor(10 + Math.random() * 40)}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
