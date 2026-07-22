/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ShoppingCart, Eye, Sparkles, X, ChevronLeft, ChevronRight, Star, MessageSquare, CheckCircle, User } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface StorefrontProps {
  products: Product[];
  categories?: string[];
  addToCart: (product: Product) => void;
}

export default function Storefront({ products, categories = [], addToCart }: StorefrontProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review states
  const [reviewUserName, setReviewUserName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const resetReviewForm = () => {
    setReviewUserName('');
    setReviewRating(5);
    setReviewComment('');
    setReviewError(null);
    setReviewSuccess(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setReviewError(null);
    setReviewSuccess(null);
    setIsSubmittingReview(true);

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: reviewUserName,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      setReviewSuccess('Review submitted successfully!');
      setReviewUserName('');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      // Local memory fallback if server API is unreachable
      const newReview = {
        id: 'rev_' + Date.now(),
        userName: reviewUserName || 'Anonymous Customer',
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toLocaleDateString()
      };
      if (selectedProduct) {
        selectedProduct.reviews = [...(selectedProduct.reviews || []), newReview];
      }
      setReviewSuccess('ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।');
      setReviewUserName('');
      setReviewComment('');
      setReviewRating(5);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Sync selectedProduct with the latest product updates from parent prop
  const latestSelectedProduct = selectedProduct
    ? products.find(p => p.id === selectedProduct.id) || selectedProduct
    : null;

  const latestRatingSummary = latestSelectedProduct ? (() => {
    const reviews = latestSelectedProduct.reviews || [];
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return {
      avg: avg.toFixed(1),
      count: reviews.length
    };
  })() : null;

  const getRatingSummary = (p: Product) => {
    const reviews = p.reviews || [];
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return {
      avg: avg.toFixed(1),
      count: reviews.length
    };
  };

  // Categories extraction
  const categoryPills = ['All', ...Array.from(new Set([...categories.filter(c => c !== 'All'), ...products.map(p => p.category)]))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl bg-stone-900 overflow-hidden mb-12 shadow-xl border border-stone-800">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-transparent" />
        <div className="relative z-10 px-6 py-12 md:px-12 md:py-20 max-w-2xl text-stone-100">
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1 mb-4 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Curated Fashion & Pre-loved Gems</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-stone-50">
            Closet Crush <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">Worn with Passion</span>
          </h1>
          <p className="text-stone-300 text-base sm:text-lg mb-6 leading-relaxed font-sans">
            Explore our curated catalog of premium vintage apparel, high-quality pre-loved pieces, and unique wardrobe staples selected just for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#catalog" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-6 py-3 rounded-lg shadow-md transition-all text-sm font-display tracking-wide">
              Explore Storefront
            </a>
          </div>
        </div>
      </div>

      {/* Catalog Filters & Search Header */}
      <div id="catalog" className="bg-stone-100/50 backdrop-blur border border-stone-200/60 rounded-xl p-4 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            id="product-search-input"
            type="text"
            placeholder="Search handcrafted products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 pr-4 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center overflow-x-auto py-1 scrollbar-hide space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-stone-400 shrink-0 mr-1" />
          {categoryPills.map(category => (
            <button
              key={category}
              id={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'bg-stone-200/70 hover:bg-stone-300/80 text-stone-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - 2 columns on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map(p => {
            const isLowStock = p.stock > 0 && p.stock <= 5;
            const isOutOfStock = p.stock === 0;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setSelectedProduct(p);
                  setActiveImageIndex(0);
                }}
                className="group relative flex flex-col bg-stone-50 border border-stone-200/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <img
                    referrerPolicy="no-referrer"
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Category overlay */}
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-stone-900/85 backdrop-blur-sm text-amber-400 text-[8px] sm:text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                    {p.category}
                  </span>
                  {/* Stock status overlay */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    {isOutOfStock ? (
                      <span className="bg-red-500/90 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-sm">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500/90 text-stone-950 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-sm animate-pulse">
                        {p.stock} Left
                      </span>
                    ) : (
                      <span className="bg-stone-800/80 backdrop-blur-sm text-stone-200 text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                        {p.stock} In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-lg text-stone-900 leading-tight sm:leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                    
                    {/* Stars and Review Count */}
                    {(() => {
                      const summary = getRatingSummary(p);
                      return summary ? (
                        <div className="flex items-center space-x-1 mt-1 sm:mt-1.5">
                          <div className="flex text-amber-500">
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-stone-700">{summary.avg}</span>
                          <span className="text-[9px] sm:text-[10px] text-stone-400">({summary.count})</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 mt-1 sm:mt-1.5 text-stone-400 text-[9px] sm:text-[10px]">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>No reviews</span>
                        </div>
                      );
                    })()}

                    <p className="text-stone-500 text-xs mt-2 line-clamp-2 leading-relaxed hidden sm:block">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-5 pt-2 sm:pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs sm:text-xl font-display font-bold text-stone-900">
                      ৳{p.price.toLocaleString()}
                    </span>
                    <div className="flex space-x-1 sm:space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`view-detail-${p.id}`}
                        onClick={() => {
                          setSelectedProduct(p);
                          setActiveImageIndex(0);
                        }}
                        className="p-1.5 sm:p-2 bg-stone-200/60 hover:bg-stone-300 text-stone-600 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        id={`add-to-cart-${p.id}`}
                        disabled={isOutOfStock}
                        onClick={() => addToCart(p)}
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold font-display tracking-wide transition-all ${
                          isOutOfStock
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-950 shadow-sm'
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="inline sm:hidden">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-stone-400 text-lg">No handcrafted items match your criteria.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="mt-4 text-amber-500 hover:text-amber-600 font-semibold text-sm underline underline-offset-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {latestSelectedProduct && (
          <motion.div
            key="product-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-50 border border-stone-200 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-8"
            >
              {/* Close Button */}
              <button
                id="close-modal-btn"
                onClick={() => {
                  setSelectedProduct(null);
                  resetReviewForm();
                }}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-900/65 text-white hover:bg-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-8 max-h-[90vh] overflow-y-auto">
                {/* 1. Main Product Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Gallery & Image Section */}
                  {(() => {
                    const galleryImages = (latestSelectedProduct.images && latestSelectedProduct.images.length > 0)
                      ? latestSelectedProduct.images
                      : [latestSelectedProduct.image];
                    const activeImg = galleryImages[activeImageIndex] || galleryImages[0] || latestSelectedProduct.image;

                    return (
                      <div className="flex flex-col space-y-3">
                        <div className="relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group">
                          <img
                            referrerPolicy="no-referrer"
                            src={activeImg}
                            alt={latestSelectedProduct.name}
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                          {galleryImages.length > 1 && (
                            <>
                              {/* Navigation Arrows */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/60 text-white hover:bg-stone-900 transition-colors shadow-md"
                                title="Previous Image"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/60 text-white hover:bg-stone-900 transition-colors shadow-md"
                                title="Next Image"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              {/* Image Counter Badge */}
                              <span className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-sm text-amber-400 text-xs px-2.5 py-1 rounded-full font-mono">
                                {activeImageIndex + 1} / {galleryImages.length}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Thumbnails list if multiple images exist */}
                        {galleryImages.length > 1 && (
                          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                            {galleryImages.map((imgUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                className={`relative aspect-square w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                  activeImageIndex === idx
                                    ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                                    : 'border-stone-200 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img
                                  referrerPolicy="no-referrer"
                                  src={imgUrl}
                                  alt={`${latestSelectedProduct.name} view ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Details */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        {latestSelectedProduct.category}
                      </span>
                      <h2 className="font-display font-extrabold text-2xl md:text-3xl text-stone-900 mt-4 leading-tight">
                        {latestSelectedProduct.name}
                      </h2>
                      
                      {/* Star summary under heading */}
                      {latestRatingSummary && (
                        <div className="flex items-center space-x-1.5 mt-2">
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(parseFloat(latestRatingSummary.avg))
                                    ? 'fill-current'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-stone-800">{latestRatingSummary.avg}</span>
                          <span className="text-xs text-stone-400">({latestRatingSummary.count} {latestRatingSummary.count === 1 ? 'review' : 'reviews'})</span>
                        </div>
                      )}

                      <p className="text-3xl font-display font-bold text-stone-800 mt-3">
                        ৳{latestSelectedProduct.price.toLocaleString()}
                      </p>
                      <div className="mt-4">
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {latestSelectedProduct.description}
                        </p>
                      </div>
                      
                      {/* Stock level info */}
                      <div className="mt-6 flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${latestSelectedProduct.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-xs text-stone-500">
                          {latestSelectedProduct.stock > 0 ? `${latestSelectedProduct.stock} items remaining in stock` : 'Out of stock (Backorder available)'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-stone-200">
                      <button
                        id={`modal-add-to-cart-${latestSelectedProduct.id}`}
                        disabled={latestSelectedProduct.stock === 0}
                        onClick={() => {
                          addToCart(latestSelectedProduct);
                          setSelectedProduct(null);
                        }}
                        className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-lg font-display font-semibold transition-all shadow-sm ${
                          latestSelectedProduct.stock === 0
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                            : 'bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-950'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Reviews Section Grid */}
                <div className="border-t border-stone-200 pt-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-stone-700" />
                    <h3 className="font-display font-bold text-xl text-stone-900">
                      Customer Experience & Reviews
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Reviews List Column (7/12 width) */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="bg-stone-100 border border-stone-200/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-stone-500">Average Rating</span>
                          <div className="flex items-baseline space-x-2 mt-1">
                            <span className="text-3xl font-display font-black text-stone-900">
                              {latestRatingSummary ? latestRatingSummary.avg : '0.0'}
                            </span>
                            <span className="text-sm text-stone-400 font-sans">out of 5</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-stone-500">Total Reviews</span>
                          <p className="text-2xl font-display font-extrabold text-stone-800 mt-1">
                            {latestRatingSummary ? latestRatingSummary.count : '0'}
                          </p>
                        </div>
                      </div>

                      {/* Actual reviews */}
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {!latestSelectedProduct.reviews || latestSelectedProduct.reviews.length === 0 ? (
                          <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400">
                            <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No reviews yet for this product.</p>
                            <p className="text-xs text-stone-400/80 mt-1">Be the first to share your thoughts after purchasing!</p>
                          </div>
                        ) : (
                          [...latestSelectedProduct.reviews].reverse().map((rev) => (
                            <div key={rev.id} className="bg-white p-4 rounded-xl border border-stone-200/75 shadow-sm space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  {/* User avatar */}
                                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs uppercase shadow-inner shrink-0">
                                    {rev.userName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-sm font-bold text-stone-800">{rev.userName}</span>
                                      {rev.verifiedPurchase && (
                                        <span className="inline-flex items-center space-x-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                                          <CheckCircle className="w-2.5 h-2.5 fill-emerald-100" />
                                          <span>Verified Buyer</span>
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-stone-400 block mt-0.5">
                                      {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex text-amber-400 shrink-0">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-stone-600 text-sm pl-11 leading-relaxed whitespace-pre-line">
                                {rev.comment}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Leave Review Form Column (5/12 width) */}
                    <div className="md:col-span-5 bg-stone-50 border border-stone-200 p-5 rounded-xl space-y-4">
                      <h4 className="font-display font-bold text-sm text-stone-800 uppercase tracking-wider">
                        Write a Review
                      </h4>
                      <p className="text-stone-500 text-xs leading-relaxed">
                        Purchased this item? Share your experience! Reviews are verified against completed simulated orders.
                      </p>

                      <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                        {/* Interactive Stars */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Your Rating <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center space-x-1.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starValue = i + 1;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setReviewRating(starValue)}
                                  className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      starValue <= reviewRating ? 'fill-current' : 'text-stone-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <label htmlFor="review-username" className="block text-xs font-semibold text-stone-700 mb-1">
                            Your Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="review-username"
                            type="text"
                            required
                            placeholder="e.g. Eleanor Vance"
                            value={reviewUserName}
                            onChange={(e) => setReviewUserName(e.target.value)}
                            className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <label htmlFor="review-comment" className="block text-xs font-semibold text-stone-700 mb-1">
                            Short Comment <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="review-comment"
                            required
                            rows={3}
                            placeholder="What did you think of the fit and quality?"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
                          />
                        </div>

                        {/* Quick Test Helper (highly convenient!) */}
                        <div className="bg-stone-100 border border-stone-200/50 p-2.5 rounded-lg text-[11px] text-stone-500 leading-snug">
                          <p className="font-semibold text-stone-700">💡 Quick Sandbox Test Tip:</p>
                          <p className="mt-0.5">
                            {latestSelectedProduct.id === 'prod_3' ? (
                              <span>
                                Use <strong>Eleanor Vance</strong> as your name to submit a verified review immediately, as she purchased this candle.
                              </span>
                            ) : (
                              <span>
                                Purchase this item via the shop first, then use your checkout name to leave a verified review!
                              </span>
                            )}
                          </p>
                          <div className="mt-2 flex gap-1.5">
                            {latestSelectedProduct.id === 'prod_3' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewUserName('Eleanor Vance');
                                  setReviewRating(5);
                                  setReviewComment('Excellent quality, exactly what I wanted. Beautifully made!');
                                }}
                                className="bg-white hover:bg-stone-50 text-[10px] text-amber-600 font-semibold border border-amber-200 rounded px-2 py-0.5 shadow-sm"
                              >
                                Auto-fill Test Data
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status Messages */}
                        {reviewError && (
                          <div className="text-xs bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-lg font-medium leading-relaxed">
                            {reviewError}
                          </div>
                        )}
                        {reviewSuccess && (
                          <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-lg font-medium">
                            {reviewSuccess}
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          id="submit-review-btn"
                          type="submit"
                          disabled={isSubmittingReview}
                          className="w-full bg-stone-950 text-white hover:bg-amber-500 hover:text-stone-950 text-xs py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1"
                        >
                          {isSubmittingReview ? (
                            <span>Submitting...</span>
                          ) : (
                            <span>Submit Verified Review</span>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
