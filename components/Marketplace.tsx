
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { ShoppingCart, Heart, TrendingUp, Play, Zap, Star, BadgeCheck, Shield, CheckCircle, Plus, Image as ImageIcon, Sparkles, X, Wand2, Loader2, Flame } from 'lucide-react';
import { gemini } from '../services/geminiService';

const MOCK_PRODUCTS: (Product & { isVideo?: boolean })[] = [
  { 
    id: 'p1', 
    name: 'Pro Camera Drone', 
    price: 1299.99, 
    image: 'https://picsum.photos/seed/drone/400/400', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-drone-flying-over-a-mountain-valley-34533-large.mp4',
    isBoosted: true, 
    category: 'Electronics', 
    socialShares: 1240, 
    isVideo: true, 
    vendorVerified: true 
  },
  { 
    id: 'p2', 
    name: 'Classic Sneakers', 
    price: 89.00, 
    image: 'https://picsum.photos/seed/shoes/400/400', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-white-sneakers-spinning-on-a-yellow-background-42352-large.mp4',
    isBoosted: false, 
    category: 'Fashion', 
    socialShares: 450, 
    vendorVerified: true 
  },
  { 
    id: 'p3', 
    name: 'Smart Watch Series 7', 
    price: 349.50, 
    image: 'https://picsum.photos/seed/watch/400/400', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-wearing-a-smart-watch-close-up-34538-large.mp4',
    isBoosted: true, 
    category: 'Gadgets', 
    socialShares: 2850, 
    isVideo: true, 
    vendorVerified: false 
  },
  { 
    id: 'p4', 
    name: 'Designer Handbag', 
    price: 2100.00, 
    image: 'https://picsum.photos/seed/bag/400/400', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashionable-woman-holding-a-handbag-34539-large.mp4',
    isBoosted: false, 
    category: 'Luxury', 
    socialShares: 120, 
    isVideo: true,
    vendorVerified: true 
  },
];

const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isSelling, setIsSelling] = useState(false);
  const [viralBoost, setViralBoost] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // Selling State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Electronics');
  const [productDesc, setProductDesc] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [productMedia, setProductMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { name: 'All', emoji: '🌟' },
    { name: 'Electronics', emoji: '📱' },
    { name: 'Fashion', emoji: '👗' },
    { name: 'Gadgets', emoji: '⌚' },
    { name: 'Luxury', emoji: '💎' },
    { name: 'Home', emoji: '🏠' }
  ];

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAiDesc = async () => {
    if (!productName) {
      showFeedback('Add a product name first ✍️');
      return;
    }
    setIsGeneratingDesc(true);
    const desc = await gemini.generateProductDescription(productName, productCategory);
    setProductDesc(desc);
    setIsGeneratingDesc(false);
  };

  const handleSelectMedia = (file: File) => {
    const url = URL.createObjectURL(file);
    setProductMedia({ url, type: file.type.startsWith('video') ? 'video' : 'image' });
  };

  const handleListProduct = () => {
    if (!productName.trim()) return showFeedback('Add a product title 🏷️');
    if (!productPrice || parseFloat(productPrice) <= 0) return showFeedback('Enter a valid price 💰');

    const newProduct: Product & { isVideo?: boolean } = {
      id: Date.now().toString(),
      name: productName,
      price: parseFloat(productPrice),
      image: productMedia?.url || 'https://picsum.photos/seed/new-item/400/400',
      videoUrl: productMedia?.type === 'video' ? productMedia.url : undefined,
      isBoosted: viralBoost,
      category: productCategory,
      socialShares: viralBoost ? 1500 : 60,
      vendorVerified: true,
      isVideo: productMedia?.type === 'video'
    };

    setProducts(prev => [newProduct, ...prev]);
    setIsSelling(false);
    setProductName('');
    setProductPrice('');
    setProductCategory('Electronics');
    setProductDesc('');
    setViralBoost(false);
    setProductMedia(null);
    showFeedback('Product listed successfully 🎉');
  };

  return (
    <div className="h-full bg-black flex flex-col pt-24 relative">
      {toast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[3000] bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle size={18} className="text-green-600" />
          <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter">GIGAMarket</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-blue-600/20 px-2 py-0.5 rounded-full">
                <Star size={10} className="text-blue-400 fill-blue-400" />
                <span className="text-[10px] font-bold text-blue-300 uppercase">Elite Vendor</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsSelling(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-black text-sm hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
          >
            <span className="shrink-0"><Plus size={16} /></span> Sell
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                activeCategory === cat.name ? 'bg-white text-black scale-105 shadow-xl' : 'bg-white/5 text-gray-500'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Micro-video Loop Section */}
        <div className="mb-8 relative rounded-[2.5rem] overflow-hidden group border border-white/10 shadow-2xl">
          <video 
            src="https://assets.mixkit.co/videos/preview/mixkit-man-showing-a-smartphone-in-his-hand-34537-large.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-48 object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent flex flex-col justify-center p-8">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Trending Now 🔥</span>
            <h3 className="text-2xl font-black mb-4">GIGA Intelligence Series</h3>
            <button
              onClick={() => {
                const featured = products[0];
                if (featured) setBuyingProduct(featured);
                else showFeedback('No featured products yet.');
              }}
              className="w-fit bg-blue-600 text-white font-black px-6 py-2 rounded-full text-xs hover:scale-105 transition-transform shadow-lg shadow-blue-900/50"
            >
              WATCH & SHOP
            </button>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full"><Play size={16} fill="white" /></div>
        </div>

        <div className="grid grid-cols-2 gap-5 pb-8">
          {products.filter(p => activeCategory === 'All' || p.category === activeCategory).map((product) => {
            const isViral = (product.socialShares || 0) > 1000;
            return (
              <div key={product.id} className="group bg-white/5 rounded-[2rem] overflow-hidden relative border border-white/5 hover:border-blue-500/50 transition-all shadow-xl">
                {isViral && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-red-600 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg border border-white/20 animate-pulse">
                    <Flame size={10} fill="white" className="text-white" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Viral</span>
                  </div>
                )}
                
                <div className="aspect-[4/5] overflow-hidden relative bg-black">
                  {product.videoUrl ? (
                    <video 
                      src={product.videoUrl}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={product.image}
                    />
                  ) : (
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {product.isVideo && (
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-3 left-3 flex flex-col">
                    <span className="text-[8px] font-black uppercase text-blue-400 mb-0.5">
                      {(product.socialShares || 0) >= 1000 
                        ? `${((product.socialShares || 0)/1000).toFixed(1)}k shares` 
                        : `${product.socialShares || 0} shared`}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <h4 className="text-sm font-bold truncate max-w-[80%]">{product.name}</h4>
                    {product.vendorVerified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500/20" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-blue-400 font-black text-base">GH₵ {product.price.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setBuyingProduct(product)}
                      className="bg-white text-black p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-lg"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selling Modal */}
      {isSelling && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center animate-in slide-in-from-bottom duration-300">
          <div className="w-full flex justify-between items-center p-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <h2 className="text-lg font-black">New Product 📦</h2>
            <button onClick={() => { setIsSelling(false); setProductMedia(null); }} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={20} /></button>
          </div>

          <div className="w-full flex-1 overflow-y-auto p-6 space-y-6">
            {/* Media Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 gap-4 cursor-pointer hover:bg-white/10 transition-colors group relative overflow-hidden"
            >
              {productMedia ? (
                <>
                  {productMedia.type === 'video' ? (
                    <video src={productMedia.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
                  ) : (
                    <img src={productMedia.url} className="absolute inset-0 w-full h-full object-cover" alt="Product preview" />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <span className="relative z-10 text-xs font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full">
                    Tap to replace media
                  </span>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} />
                  </div>
                  <span className="text-sm font-bold text-center px-4">Add up to 5 photos or a short video loop 🎥</span>
                </>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Title 🏷️</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Nike Air Force 1" 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium" 
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Price (GH₵) 💰</label>
                  <input 
                    type="number" 
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-bold" 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Category 📂</label>
                  <select 
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none appearance-none text-gray-300 font-medium"
                  >
                    {categories.slice(1).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Description with AI Wand */}
              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Description 📝</label>
                <textarea 
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Describe your item..." 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none h-32 resize-none leading-relaxed" 
                />
                <button 
                  onClick={handleAiDesc}
                  disabled={isGeneratingDesc || !productName}
                  className="absolute bottom-4 right-4 bg-purple-600/20 text-purple-400 p-2 rounded-lg hover:bg-purple-600/40 transition-colors disabled:opacity-50"
                  title="AI Assist"
                >
                  {isGeneratingDesc ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                </button>
              </div>

              {/* Viral Boost Toggle */}
              <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-4 rounded-2xl border border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg"><Zap size={16} className="text-orange-500" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Viral Boost 🚀</h4>
                    <p className="text-[10px] text-gray-400">Push to Social Feed (GH₵ 5/day)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViralBoost(!viralBoost)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${viralBoost ? 'bg-orange-500' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${viralBoost ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 w-full bg-[#0a0a0a] border-t border-white/10">
            <button onClick={handleListProduct} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg">
              List Product 🚀
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSelectMedia(file);
            }}
          />
        </div>
      )}

      {/* Escrow Payment Modal */}
      {buyingProduct && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
             <button onClick={() => setBuyingProduct(null)} className="absolute top-4 right-4 text-gray-500"><Zap size={20} className="rotate-45" /></button>
             
             <div className="flex flex-col items-center mb-6">
               <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500">
                 <Shield size={32} className="text-blue-500" />
               </div>
               <h3 className="text-xl font-bold">Secure Purchase 🔒</h3>
               <p className="text-gray-400 text-xs mt-1">GIGAVibe Escrow Protection</p>
             </div>

             <div className="bg-white/5 rounded-2xl p-4 mb-6 flex gap-4">
               {buyingProduct.videoUrl ? (
                 <video src={buyingProduct.videoUrl} autoPlay loop muted playsInline className="w-16 h-16 rounded-xl object-cover" />
               ) : (
                 <img src={buyingProduct.image} className="w-16 h-16 rounded-xl object-cover" alt="prod" />
               )}
               <div>
                 <h4 className="font-bold">{buyingProduct.name}</h4>
                 <p className="text-blue-400 font-black">GH₵ {buyingProduct.price.toLocaleString()}</p>
                 {buyingProduct.vendorVerified && (
                   <p className="text-[10px] text-blue-300 flex items-center gap-1 mt-1">
                     <BadgeCheck size={10} /> Verified Vendor
                   </p>
                 )}
               </div>
             </div>

             <div className="space-y-4 mb-8">
               <div className="flex items-start gap-3 text-sm text-gray-300">
                 <CheckCircle size={16} className="text-green-500 mt-0.5" />
                 <p>Funds held in <span className="text-white font-bold">Escrow Vault 🏦</span> until you confirm delivery.</p>
               </div>
               <div className="flex items-start gap-3 text-sm text-gray-300">
                 <CheckCircle size={16} className="text-green-500 mt-0.5" />
                 <p>Seller only gets paid when you are happy! 😊</p>
               </div>
             </div>

             <button 
              onClick={() => { showFeedback("Payment sent to Escrow! ✅"); setBuyingProduct(null); }}
               className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
             >
               Pay Securely 💳
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
