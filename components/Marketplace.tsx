
import React, { useState, useRef, useEffect } from 'react';
import { Product, BusinessRegistration, OrderTracking, TrackingEvent } from '../types';
import { ShoppingCart, Heart, TrendingUp, Play, Zap, Star, BadgeCheck, Shield, CheckCircle, Plus, Image as ImageIcon, Sparkles, X, Wand2, Loader2, Flame, MapPin, Upload, CreditCard, FileText, Building2, User, Phone, Mail, ChevronRight, Package, Truck, CheckCircle2, Clock, AlertCircle, Navigation, Camera, ArrowLeft, Store, ShieldCheck, XCircle, Milestone, Box } from 'lucide-react';
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

// Mock Order Tracking Data
const MOCK_ORDERS: OrderTracking[] = [
  {
    id: 'order1',
    orderId: 'GV-2024-001234',
    productId: 'p1',
    productName: 'Pro Camera Drone',
    productImage: 'https://picsum.photos/seed/drone/400/400',
    status: 'in_transit',
    estimatedDelivery: '2024-02-05',
    trackingNumber: 'GH1234567890',
    carrier: 'GIGAExpress',
    sellerName: 'TechHub Ghana',
    buyerAddress: '123 Main Street, Accra, Ghana',
    timeline: [
      { id: 't1', status: 'Order Placed', description: 'Your order has been confirmed', timestamp: '2024-01-28 10:30 AM', location: 'Accra' },
      { id: 't2', status: 'Processing', description: 'Seller is preparing your order', timestamp: '2024-01-28 02:15 PM', location: 'Accra' },
      { id: 't3', status: 'Shipped', description: 'Package handed to courier', timestamp: '2024-01-29 09:00 AM', location: 'Accra Sorting Center' },
      { id: 't4', status: 'In Transit', description: 'Package is on the way', timestamp: '2024-01-30 11:45 AM', location: 'Kumasi Hub' },
    ]
  },
  {
    id: 'order2',
    orderId: 'GV-2024-001189',
    productId: 'p2',
    productName: 'Classic Sneakers',
    productImage: 'https://picsum.photos/seed/shoes/400/400',
    status: 'delivered',
    estimatedDelivery: '2024-01-25',
    trackingNumber: 'GH0987654321',
    carrier: 'GIGAExpress',
    sellerName: 'Fashion World',
    buyerAddress: '456 Oxford Street, Kumasi, Ghana',
    timeline: [
      { id: 't5', status: 'Order Placed', description: 'Your order has been confirmed', timestamp: '2024-01-20 08:00 AM', location: 'Kumasi' },
      { id: 't6', status: 'Processing', description: 'Seller is preparing your order', timestamp: '2024-01-20 12:30 PM', location: 'Kumasi' },
      { id: 't7', status: 'Shipped', description: 'Package handed to courier', timestamp: '2024-01-21 10:00 AM', location: 'Kumasi Sorting Center' },
      { id: 't8', status: 'Delivered', description: 'Package delivered successfully', timestamp: '2024-01-25 03:20 PM', location: 'Kumasi' },
    ]
  }
];

const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [isSelling, setIsSelling] = useState(false);
  const [viralBoost, setViralBoost] = useState(false);
  
  // Selling State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Electronics');
  const [productDesc, setProductDesc] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Business Registration State
  const [showBusinessReg, setShowBusinessReg] = useState(false);
  const [isVendorVerified, setIsVendorVerified] = useState<boolean>(() => {
    return localStorage.getItem('gigavibe_vendor_verified') === 'true';
  });
  const [regStep, setRegStep] = useState<'info' | 'location' | 'documents' | 'review' | 'processing' | 'success'>('info');
  const [businessData, setBusinessData] = useState<Partial<BusinessRegistration>>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Retail',
    location: { lat: 5.6037, lng: -0.1870, address: '' }
  });
  const [idCardFront, setIdCardFront] = useState<string | null>(null);
  const [idCardBack, setIdCardBack] = useState<string | null>(null);
  const [businessCert, setBusinessCert] = useState<string | null>(null);
  
  // Order Tracking State
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [orders, setOrders] = useState<OrderTracking[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null);

  // Map State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  // File input refs
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const categories = [
    { name: 'All', emoji: '🌟' },
    { name: 'Electronics', emoji: '📱' },
    { name: 'Fashion', emoji: '👗' },
    { name: 'Gadgets', emoji: '⌚' },
    { name: 'Luxury', emoji: '💎' },
    { name: 'Home', emoji: '🏠' }
  ];

  const handleAiDesc = async () => {
    if (!productName) return;
    setIsGeneratingDesc(true);
    const desc = await gemini.generateProductDescription(productName, productCategory);
    setProductDesc(desc);
    setIsGeneratingDesc(false);
  };

  // Handle starting to sell - check verification first
  const handleStartSelling = () => {
    if (isVendorVerified) {
      setIsSelling(true);
    } else {
      setShowBusinessReg(true);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setSearchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBusinessData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
            }
          }));
          setSearchingLocation(false);
        },
        (error) => {
          console.error("Location error:", error);
          setSearchingLocation(false);
          alert("Could not get location. Please enter manually.");
        }
      );
    }
  };

  // Handle file upload for documents
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'idFront' | 'idBack' | 'cert') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'idFront') setIdCardFront(result);
        else if (type === 'idBack') setIdCardBack(result);
        else setBusinessCert(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit business registration
  const submitBusinessRegistration = () => {
    setRegStep('processing');
    // Simulate verification process
    setTimeout(() => {
      setRegStep('success');
      localStorage.setItem('gigavibe_vendor_verified', 'true');
      setIsVendorVerified(true);
    }, 3000);
  };

  // Get order status color and icon
  const getStatusInfo = (status: OrderTracking['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-400 bg-yellow-500/20', icon: Clock, label: 'Pending' };
      case 'confirmed':
        return { color: 'text-blue-400 bg-blue-500/20', icon: CheckCircle, label: 'Confirmed' };
      case 'processing':
        return { color: 'text-purple-400 bg-purple-500/20', icon: Package, label: 'Processing' };
      case 'shipped':
        return { color: 'text-cyan-400 bg-cyan-500/20', icon: Box, label: 'Shipped' };
      case 'in_transit':
        return { color: 'text-orange-400 bg-orange-500/20', icon: Truck, label: 'In Transit' };
      case 'delivered':
        return { color: 'text-green-400 bg-green-500/20', icon: CheckCircle2, label: 'Delivered' };
      default:
        return { color: 'text-gray-400 bg-gray-500/20', icon: Package, label: 'Unknown' };
    }
  };

  return (
    <div className="h-full bg-black flex flex-col pt-24 relative">
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter">GIGAMarket</h2>
            <div className="flex items-center gap-2 mt-1">
              {isVendorVerified ? (
                <div className="flex items-center gap-1 bg-green-600/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={10} className="text-green-400" />
                  <span className="text-[10px] font-bold text-green-300 uppercase">Verified Seller</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-orange-600/20 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} className="text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-300 uppercase">Unverified</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowOrderTracking(true)}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-black text-sm hover:bg-white/20 transition-colors shadow-lg active:scale-95 border border-white/10"
            >
              <Package size={16} /> Track
            </button>
            <button 
              onClick={handleStartSelling}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-black text-sm hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
            >
              <Plus size={16} /> Sell
            </button>
          </div>
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
            <button className="w-fit bg-blue-600 text-white font-black px-6 py-2 rounded-full text-xs hover:scale-105 transition-transform shadow-lg shadow-blue-900/50">WATCH & SHOP</button>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full"><Play size={16} fill="white" /></div>
        </div>

        <div className="grid grid-cols-2 gap-5 pb-8">
          {MOCK_PRODUCTS.filter(p => activeCategory === 'All' || p.category === activeCategory).map((product) => {
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
            <button onClick={() => setIsSelling(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={20} /></button>
          </div>

          <div className="w-full flex-1 overflow-y-auto p-6 space-y-6">
            {/* Media Box */}
            <div className="w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 gap-4 cursor-pointer hover:bg-white/10 transition-colors group">
              <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                <ImageIcon size={32} />
              </div>
              <span className="text-sm font-bold text-center px-4">Add up to 5 photos or a short video loop 🎥</span>
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
            <button onClick={() => { setIsSelling(false); alert("Item listed successfully! 🎉"); }} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg">
              List Product 🚀
            </button>
          </div>
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
               onClick={() => { 
                 // Add to tracked orders
                 const newOrder: OrderTracking = {
                   id: `order${Date.now()}`,
                   orderId: `GV-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
                   productId: buyingProduct.id,
                   productName: buyingProduct.name,
                   productImage: buyingProduct.image,
                   status: 'pending',
                   estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                   trackingNumber: `GH${Math.floor(Math.random() * 9999999999)}`,
                   carrier: 'GIGAExpress',
                   sellerName: 'GIGA Verified Seller',
                   buyerAddress: 'Your registered address',
                   timeline: [
                     { id: `t${Date.now()}`, status: 'Order Placed', description: 'Your order has been confirmed', timestamp: new Date().toLocaleString(), location: 'Ghana' }
                   ]
                 };
                 setOrders(prev => [newOrder, ...prev]);
                 alert("Payment sent to Escrow! ✅ Track your order in the Track section.");
                 setBuyingProduct(null);
               }}
               className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
             >
               Pay Securely 💳
             </button>
           </div>
        </div>
      )}

      {/* Business Registration Modal */}
      {showBusinessReg && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="w-full flex justify-between items-center p-4 pt-12 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <button onClick={() => { setShowBusinessReg(false); setRegStep('info'); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-black">Business Registration 🏪</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {['Info', 'Location', 'Documents', 'Review'].map((step, idx) => {
                const stepKeys = ['info', 'location', 'documents', 'review'];
                const currentIdx = stepKeys.indexOf(regStep);
                const isActive = idx <= currentIdx;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-2 ${isActive ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500'}`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[9px] font-bold uppercase ${isActive ? 'text-white' : 'text-gray-500'}`}>{step}</span>
                    {idx < 3 && <div className={`absolute mt-4 w-[calc(25%-2rem)] h-0.5 ml-16 ${isActive && idx < currentIdx ? 'bg-blue-600' : 'bg-white/10'}`} />}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Business Info */}
            {regStep === 'info' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-2xl border border-blue-500/20 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-white mb-1">Why Register? 🤔</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">Verified sellers earn 3x more trust, get featured placement, and access to GIGA Escrow protection. We verify your identity to prevent fraud.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Business Name 🏪</label>
                  <input 
                    type="text" 
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="e.g. TechHub Ghana Ltd" 
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Owner Full Name 👤</label>
                  <input 
                    type="text" 
                    value={businessData.ownerName}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="As on your ID card" 
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Email 📧</label>
                    <input 
                      type="email" 
                      value={businessData.email}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com" 
                      className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Phone 📱</label>
                    <input 
                      type="tel" 
                      value={businessData.phone}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+233 XX XXX XXXX" 
                      className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Business Type 📂</label>
                  <select 
                    value={businessData.businessType}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium appearance-none"
                  >
                    <option value="Retail">Retail Store</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion & Clothing</option>
                    <option value="Food">Food & Beverages</option>
                    <option value="Services">Services</option>
                    <option value="Art">Art & Crafts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Location with Map */}
            {regStep === 'location' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  {/* Simple Map Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-900/30 to-green-900/30 relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-0.1870,5.6037,12,0/400x200?access_token=pk.placeholder")', backgroundSize: 'cover' }} />
                    <div className="relative text-center">
                      <MapPin size={48} className="text-blue-400 mx-auto mb-2" />
                      {businessData.location?.address ? (
                        <p className="text-sm font-bold text-white">{businessData.location.address}</p>
                      ) : (
                        <p className="text-sm text-gray-400">Set your business location</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <button 
                      onClick={getCurrentLocation}
                      disabled={searchingLocation}
                      className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {searchingLocation ? (
                        <><Loader2 size={20} className="animate-spin" /> Detecting Location...</>
                      ) : (
                        <><Navigation size={20} /> Use Current Location 📍</>
                      )}
                    </button>
                    
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={businessData.address}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value, location: { ...prev.location!, address: e.target.value } }))}
                        placeholder="Or enter address manually" 
                        className="w-full bg-white/5 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-100/70">Your business location will be shown to buyers to help them find you. Make sure it's accurate! 📍</p>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {regStep === 'documents' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                  <Shield size={20} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">Anti-Fraud Verification 🛡️</h4>
                    <p className="text-xs text-gray-400">Upload clear photos of your documents. This protects both you and buyers from fraud.</p>
                  </div>
                </div>

                {/* ID Card Front */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">ID Card (Front) 🪪</label>
                  <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'idFront')} />
                  <button 
                    onClick={() => idFrontRef.current?.click()}
                    className="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
                  >
                    {idCardFront ? (
                      <img src={idCardFront} className="w-full h-32 object-cover rounded-xl" alt="ID Front" />
                    ) : (
                      <>
                        <CreditCard size={32} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Tap to upload ID front</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ID Card Back */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">ID Card (Back) 🪪</label>
                  <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'idBack')} />
                  <button 
                    onClick={() => idBackRef.current?.click()}
                    className="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
                  >
                    {idCardBack ? (
                      <img src={idCardBack} className="w-full h-32 object-cover rounded-xl" alt="ID Back" />
                    ) : (
                      <>
                        <CreditCard size={32} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Tap to upload ID back</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Business Certificate */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1.5 block">Business Certificate (Optional) 📜</label>
                  <input ref={certRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'cert')} />
                  <button 
                    onClick={() => certRef.current?.click()}
                    className="w-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
                  >
                    {businessCert ? (
                      <div className="flex items-center gap-3">
                        <FileText size={32} className="text-green-400" />
                        <span className="text-sm text-green-400">Certificate uploaded ✅</span>
                      </div>
                    ) : (
                      <>
                        <FileText size={32} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Upload business registration certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {regStep === 'review' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase">Business Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Business Name</span>
                      <span className="text-white font-bold">{businessData.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner</span>
                      <span className="text-white font-bold">{businessData.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-bold">{businessData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone</span>
                      <span className="text-white font-bold">{businessData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white font-bold">{businessData.businessType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase mb-3">Documents</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {idCardFront && <img src={idCardFront} className="aspect-video object-cover rounded-lg border border-white/10" alt="ID Front" />}
                    {idCardBack && <img src={idCardBack} className="aspect-video object-cover rounded-lg border border-white/10" alt="ID Back" />}
                    {businessCert && <div className="aspect-video bg-green-500/20 rounded-lg border border-green-500/30 flex items-center justify-center"><FileText className="text-green-400" /></div>}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-100/70">By submitting, you confirm that all information is accurate and agree to GIGA's Seller Terms of Service.</p>
                </div>
              </div>
            )}

            {/* Processing State */}
            {regStep === 'processing' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <div className="relative mb-8">
                  <Loader2 size={64} className="animate-spin text-blue-500" />
                  <Shield size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                </div>
                <h3 className="text-xl font-black mb-2">Verifying Your Business... 🔍</h3>
                <p className="text-gray-400 text-sm text-center">This usually takes a few moments.<br/>We're checking your documents.</p>
              </div>
            )}

            {/* Success State */}
            {regStep === 'success' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-900/50 animate-bounce">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-green-400">Verified! 🎉</h3>
                <p className="text-gray-400 text-sm text-center mb-8">Your business is now verified.<br/>You can start selling on GIGAMarket!</p>
                <button 
                  onClick={() => { setShowBusinessReg(false); setRegStep('info'); setIsSelling(true); }}
                  className="bg-white text-black font-black px-8 py-4 rounded-2xl shadow-xl"
                >
                  Start Selling Now 🚀
                </button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {!['processing', 'success'].includes(regStep) && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-md border-t border-white/10">
              <div className="flex gap-4">
                {regStep !== 'info' && (
                  <button 
                    onClick={() => setRegStep(regStep === 'location' ? 'info' : regStep === 'documents' ? 'location' : 'documents')}
                    className="flex-1 bg-white/10 text-white font-bold py-4 rounded-2xl"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (regStep === 'info') setRegStep('location');
                    else if (regStep === 'location') setRegStep('documents');
                    else if (regStep === 'documents') setRegStep('review');
                    else if (regStep === 'review') submitBusinessRegistration();
                  }}
                  disabled={
                    (regStep === 'info' && (!businessData.businessName || !businessData.ownerName || !businessData.email || !businessData.phone)) ||
                    (regStep === 'location' && !businessData.address) ||
                    (regStep === 'documents' && (!idCardFront || !idCardBack))
                  }
                  className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regStep === 'review' ? 'Submit for Verification ✅' : 'Continue →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Tracking Modal */}
      {showOrderTracking && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-right duration-300">
          <div className="w-full flex justify-between items-center p-4 pt-12 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <button onClick={() => { setShowOrderTracking(false); setSelectedOrder(null); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-black">{selectedOrder ? 'Order Details 📦' : 'My Orders 📦'}</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32">
            {!selectedOrder ? (
              // Orders List
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20">
                    <Package size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 text-sm">Your purchases will appear here</p>
                  </div>
                ) : (
                  orders.map(order => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <button 
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors text-left"
                      >
                        <img src={order.productImage} className="w-16 h-16 rounded-xl object-cover" alt={order.productName} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white truncate">{order.productName}</h4>
                          <p className="text-xs text-gray-400 mb-2">Order: {order.orderId}</p>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-500 self-center" />
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              // Order Detail View with Tracking
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Product Info */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 flex gap-4">
                  <img src={selectedOrder.productImage} className="w-20 h-20 rounded-xl object-cover" alt={selectedOrder.productName} />
                  <div>
                    <h4 className="font-bold text-white">{selectedOrder.productName}</h4>
                    <p className="text-xs text-gray-400">Order: {selectedOrder.orderId}</p>
                    <p className="text-xs text-gray-400">Seller: {selectedOrder.sellerName}</p>
                  </div>
                </div>

                {/* Status Banner */}
                {(() => {
                  const statusInfo = getStatusInfo(selectedOrder.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`${statusInfo.color} rounded-2xl p-4 flex items-center gap-4`}>
                      <div className="p-3 bg-white/10 rounded-xl">
                        <StatusIcon size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{statusInfo.label}</h4>
                        <p className="text-xs opacity-70">Est. Delivery: {selectedOrder.estimatedDelivery}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Tracking Info */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase mb-2">Tracking Info 🔍</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tracking #</span>
                      <span className="text-white font-mono">{selectedOrder.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Carrier</span>
                      <span className="text-white font-bold">{selectedOrder.carrier}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase mb-4">Tracking Timeline 📍</h4>
                  <div className="space-y-0">
                    {selectedOrder.timeline.map((event, idx) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${idx === selectedOrder.timeline.length - 1 ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-green-500'}`} />
                          {idx < selectedOrder.timeline.length - 1 && <div className="w-0.5 h-16 bg-white/20" />}
                        </div>
                        <div className="pb-6">
                          <h5 className="font-bold text-white text-sm">{event.status}</h5>
                          <p className="text-xs text-gray-400">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                            <Clock size={10} />
                            <span>{event.timestamp}</span>
                            {event.location && (
                              <>
                                <MapPin size={10} />
                                <span>{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                  <h4 className="font-bold text-sm text-gray-400 uppercase mb-2">Delivery Address 🏠</h4>
                  <p className="text-white">{selectedOrder.buyerAddress}</p>
                </div>

                {/* Action Buttons */}
                {selectedOrder.status === 'delivered' && (
                  <button className="w-full bg-green-600 text-white font-black py-4 rounded-2xl">
                    Confirm Receipt & Release Payment ✅
                  </button>
                )}
                {selectedOrder.status !== 'delivered' && (
                  <button className="w-full bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10">
                    Contact Seller 💬
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
