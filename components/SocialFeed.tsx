
import React, { useState, useRef, useEffect } from 'react';
import { Post, TabType } from '../types';
import { 
  Heart, MessageCircle, Share2, Plus, Sparkles, ShoppingBag, Zap, Camera, 
  Video, X, ChevronRight, Music, DollarSign, Wand2, Loader2, Send, Upload, 
  UserPlus, UserCheck, Copy, Twitter, Users, Globe, Search, Shield, Lock, 
  ImagePlus, MoreVertical, Facebook, Code, Music2, Briefcase, Shirt, 
  Gamepad2, RefreshCw, FlipHorizontal, UserCircle2, Settings, ShieldAlert, 
  BadgeCheck, Disc, Play, Pause, Search as SearchIcon, Radio, Share, 
  Link as LinkIcon, Instagram, MessageSquare, Mail, Download, CheckCircle2,
  UserRoundPlus, UserRoundCheck, Check, Smile, RefreshCcw, Tag, Rocket, TrendingUp
} from 'lucide-react';
import { gemini } from '../services/geminiService';
import LiveHost from './LiveHost';

interface SocialFeedProps {
  onRemix?: (context: { url: string; type: 'image' | 'video'; username: string }) => void;
  onShop?: () => void;
}

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface SocialPost extends Post {
  hasProduct?: boolean;
  isVideo?: boolean;
  mediaType?: 'image' | 'video' | 'audio';
  postType?: 'post' | 'short' | 'story';
  isLiked: boolean;
  isFollowing: boolean;
  isBoostedPost?: boolean;
  boost?: {
    perDay: number;
    days: number;
    total: number;
    until: string;
  };
  commentList: Comment[];
}

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😂', '💯', '✨', '🙌', '😮', '🚀', '😍', '✅'];

const INITIAL_POSTS: SocialPost[] = [
  {
    id: '1',
    username: '@tech_guru',
    avatar: 'https://picsum.photos/seed/user1/100',
    contentUrl: 'https://picsum.photos/seed/v1/400/800',
    caption: 'Building the future of GIGAVibe! 🚀 #superapp #GIGAVibe',
    likes: 12400,
    comments: 2,
    shares: 1200,
    hasProduct: true,
    isVideo: false,
    mediaType: 'image',
    postType: 'post',
    isLiked: false,
    isFollowing: false,
    isBoostedPost: true,
    commentList: [
      { id: 'c1', username: '@benard_a', avatar: 'https://picsum.photos/seed/user3/100', text: 'This looks incredible! Can\'t wait for the update. 🔥', timestamp: '2h ago', likes: 12 },
      { id: 'c2', username: '@future_dev', avatar: 'https://picsum.photos/seed/user4/100', text: 'GIGA taking over 🌍🚀', timestamp: '1h ago', likes: 5 }
    ]
  },
  {
    id: '2',
    username: '@fashion_daily',
    avatar: 'https://picsum.photos/seed/user2/100',
    contentUrl: 'https://picsum.photos/seed/v2/400/800',
    caption: 'Summer collection is live on GIGAMarket! 👗✨ #fashion #shopping',
    likes: 8900,
    comments: 1,
    shares: 300,
    hasProduct: true,
    isVideo: false,
    mediaType: 'image',
    postType: 'post',
    isLiked: true,
    isFollowing: true,
    commentList: [
      { id: 'c3', username: '@style_queen', avatar: 'https://picsum.photos/seed/user5/100', text: 'The quality of these fabrics is top tier! 😍', timestamp: '30m ago', likes: 24 }
    ]
  }
];

const SocialFeed: React.FC<SocialFeedProps> = ({ onRemix, onShop }) => {
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; mediaType: 'image' | 'video' | 'audio' } | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadPostType, setUploadPostType] = useState<'post' | 'short' | 'story'>('post');
  const [isLive, setIsLive] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showBoostModal, setShowBoostModal] = useState<string | null>(null);
  const [boostBudget, setBoostBudget] = useState(10);
  const [boostDays, setBoostDays] = useState(3);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState<string | null>(null); 
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const commentEndRef = useRef<HTMLDivElement>(null);

  // Manage Camera Stream
  useEffect(() => {
    if (showCamera) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 1280, height: 720 }, 
            audio: false 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          setShowCamera(false);
          showFeedback("Camera access denied 🚫");
        }
      };
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  // Load any externally-published posts (e.g. Creator Studio)
  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem('gigavibe_social_posts');
      if (!raw) return;
      try {
        const stored = JSON.parse(raw) as SocialPost[];
        if (!Array.isArray(stored) || stored.length === 0) return;
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const merged = [...stored.filter((p) => p && p.id && !seen.has(p.id)), ...prev];
          return merged;
        });
      } catch {
        // ignore malformed local state
      }
    };

    load();
    const onCustom = () => load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'gigavibe_social_posts') load();
    };
    window.addEventListener('gigavibe_posts_updated', onCustom as any);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('gigavibe_posts_updated', onCustom as any);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPreviewMedia({ url: dataUrl, mediaType: 'image' });
        setShowCamera(false);
        setShowUpload(true);
      }
    }
  };

  const handlePostSubmit = () => {
    if (!previewMedia) return;
    const newPost: SocialPost = {
      id: Date.now().toString(),
      username: '@ayiiga_benard',
      avatar: 'https://picsum.photos/seed/user1/200',
      contentUrl: previewMedia.url,
      caption: caption || 'Check out my new post on GIGAVibe! ✨',
      likes: 0,
      comments: 0,
      shares: 0,
      isVideo: previewMedia.mediaType === 'video',
      mediaType: previewMedia.mediaType,
      postType: uploadPostType,
      isLiked: false,
      isFollowing: false,
      commentList: []
    };
    setPosts([newPost, ...posts]);
    try {
      const existingRaw = localStorage.getItem('gigavibe_social_posts');
      const existing = existingRaw ? (JSON.parse(existingRaw) as SocialPost[]) : [];
      localStorage.setItem('gigavibe_social_posts', JSON.stringify([newPost, ...(Array.isArray(existing) ? existing : [])]));
      window.dispatchEvent(new CustomEvent('gigavibe_posts_updated'));
    } catch {
      // ignore
    }
    setShowUpload(false);
    setPreviewMedia(null);
    setCaption('');
    showFeedback("Vibe Posted Successfully! 🚀");
  };

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleFollow = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newState = !p.isFollowing;
        if (newState) showFeedback(`Following ${p.username} ✅`);
        return { ...p, isFollowing: newState };
      }
      return p;
    }));
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !activeCommentId) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      username: '@ayiiga_benard',
      avatar: 'https://picsum.photos/seed/user1/200',
      text: newCommentText,
      timestamp: 'Just now',
      likes: 0
    };
    setPosts(prev => prev.map(p => 
      p.id === activeCommentId 
        ? { ...p, comments: p.comments + 1, commentList: [...p.commentList, newComment] } 
        : p
    ));
    setNewCommentText('');
    setTimeout(() => commentEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const addEmoji = (emoji: string) => {
    setNewCommentText(prev => prev + emoji);
  };

  const handleBoostSubmit = () => {
    const total = boostBudget * boostDays;
    const until = new Date(Date.now() + boostDays * 24 * 60 * 60 * 1000).toISOString();
    setPosts(prev => prev.map(p => p.id === showBoostModal ? { ...p, isBoostedPost: true, boost: { perDay: boostBudget, days: boostDays, total, until } } : p));
    showFeedback(`Boost active! $${total} total • ${boostDays} day(s) 🚀`);
    setShowBoostModal(null);
  };

  const handleShareAction = (platform: string, postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'Link':
        navigator.clipboard.writeText(shareUrl);
        showFeedback("Link copied to clipboard! 📋");
        break;
      case 'Download':
        const link = document.createElement('a');
        link.href = post.contentUrl;
        link.download = `GIGAVibe_${post.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showFeedback("Saved to device gallery! 💾");
        break;
      default:
        showFeedback(`${platform} share coming soon! 🔜`);
    }
    setShowShareSheet(null);
  };

  if (isLive) {
    return <LiveHost onClose={() => setIsLive(false)} />;
  }

  const activePost = posts.find(p => p.id === activeCommentId);

  return (
    <div className="h-full w-full relative bg-black flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[3000] bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-green-600" />
          <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}

      {/* Feed Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
          {posts.map((post) => (
            <div key={post.id} className="h-full w-full snap-start relative flex flex-col justify-end">
              {((post.mediaType || (post.isVideo ? 'video' : 'image')) === 'video') && (
                <video
                  src={post.contentUrl}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              {((post.mediaType || (post.isVideo ? 'video' : 'image')) === 'image') && (
                <img src={post.contentUrl} className="absolute inset-0 w-full h-full object-cover z-0" alt="content" />
              )}
              {(post.mediaType === 'audio') && (
                <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-zinc-900 via-black to-blue-900">
                  <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(circle at 20% 20%, rgba(59,130,246,0.35), transparent 50%), radial-gradient(circle at 80% 60%, rgba(168,85,247,0.25), transparent 55%)` }} />
                </div>
              )}
              {/* Stronger gradient for visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10 z-10" />
              
              {/* Interaction Sidebar - Moved up slightly for navbar clearance */}
              <div className="absolute right-4 bottom-56 z-20 flex flex-col gap-5 items-center bg-black/40 backdrop-blur-2xl p-3.5 rounded-full border border-white/10 shadow-2xl">
                <button onClick={() => toggleLike(post.id)} className="flex flex-col items-center gap-1 group">
                  <Heart size={30} className={`${post.isLiked ? 'fill-red-500 text-red-500' : 'text-white'} transition-transform group-active:scale-125`} />
                  <span className="text-[10px] font-black tracking-tighter drop-shadow-md">{post.likes}</span>
                </button>
                
                <button onClick={() => setActiveCommentId(post.id)} className="flex flex-col items-center gap-1 group">
                  <MessageCircle size={30} className="text-white transition-transform group-active:scale-110" />
                  <span className="text-[10px] font-black tracking-tighter drop-shadow-md">{post.comments}</span>
                </button>
                
                <button onClick={() => setShowBoostModal(post.id)} className="flex flex-col items-center gap-1 group">
                  <div className="p-1.5 bg-yellow-600/40 rounded-full group-active:scale-90 transition-transform">
                    <Rocket size={24} className="text-yellow-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter drop-shadow-md">Boost</span>
                </button>

                <button
                  disabled={post.mediaType === 'audio'}
                  onClick={() => onRemix?.({ url: post.contentUrl, type: (post.mediaType === 'video' || post.isVideo) ? 'video' : 'image', username: post.username })}
                  className={`flex flex-col items-center gap-1 group ${post.mediaType === 'audio' ? 'opacity-40' : ''}`}
                >
                  <div className="p-1.5 bg-blue-600/40 rounded-full group-active:scale-90 transition-transform">
                    <RefreshCw size={24} className="text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter drop-shadow-md">Remix</span>
                </button>
                
                <button onClick={() => setShowShareSheet(post.id)} className="flex flex-col items-center gap-1 group">
                  <Share2 size={30} className="text-white drop-shadow-lg group-active:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-tighter drop-shadow-md">Share</span>
                </button>
              </div>

              {/* Bottom Content Info - Increased bottom margin to clear Navbar */}
              <div className="relative z-20 p-5 mb-28 pointer-events-none">
                <div className="max-w-[75%] pointer-events-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative group/avatar cursor-pointer" onClick={() => toggleFollow(post.id)}>
                      <img src={post.avatar} className="w-12 h-12 rounded-full border-2 border-white/40 p-0.5" alt="avatar" />
                      <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border border-black shadow-lg animate-in zoom-in duration-200 ${post.isFollowing ? 'bg-green-500' : 'bg-blue-500'}`}>
                        {post.isFollowing ? <Check size={10} strokeWidth={4} /> : <Plus size={10} strokeWidth={4} />}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white">
                        {post.username}
                        <BadgeCheck size={14} className="text-blue-400 fill-blue-400/20" />
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/70 font-black uppercase tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">GIGA Creator</span>
                        {post.postType && post.postType !== 'post' && (
                          <div className="flex items-center gap-1 bg-white/10 border border-white/15 px-2 py-0.5 rounded-full">
                            <span className="text-[8px] font-black uppercase text-white/80">{post.postType}</span>
                          </div>
                        )}
                        {post.isBoostedPost && (
                          <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5 rounded-full">
                            <Zap size={8} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[8px] font-black uppercase text-yellow-400">Promoted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-100 font-medium leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-3 mb-3">{post.caption}</p>

                  {post.mediaType === 'audio' && (
                    <div className="bg-white/10 border border-white/15 rounded-2xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Disc size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Audio</span>
                      </div>
                      <audio src={post.contentUrl} controls className="w-full" />
                    </div>
                  )}
                  
                  {/* Shop Product Tag */}
                  {post.hasProduct && (
                    <button 
                      onClick={onShop}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full transition-all group"
                    >
                      <Tag size={12} className="text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Shop Product 🛍️</span>
                      <ChevronRight size={12} className="text-white/50 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boost Post Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 z-[2600] bg-black/80 backdrop-blur-md flex items-end animate-in fade-in duration-300" onClick={() => setShowBoostModal(null)}>
          <div className="w-full bg-[#0a0a0a] rounded-t-[3rem] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-6" />
            <div className="px-8 pb-12">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-500 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white">Boost Vibe Reach 🚀</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Creator Growth Suite</p>
                  </div>
               </div>

               <div className="space-y-6 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-400">Budget / day ($)</span>
                        <span className="text-2xl font-black text-white">${boostBudget}</span>
                     </div>
                     <input 
                       type="range" 
                       min="1" 
                       max="100" 
                       step="1"
                       value={boostBudget}
                       onChange={(e) => setBoostBudget(parseInt(e.target.value))}
                       className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                     />
                     <div className="mt-6 flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-400">Days</span>
                        <span className="text-2xl font-black text-white">{boostDays}</span>
                     </div>
                     <input
                       type="range"
                       min="1"
                       max="30"
                       step="1"
                       value={boostDays}
                       onChange={(e) => setBoostDays(parseInt(e.target.value))}
                       className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                     />
                     <div className="flex justify-between mt-4">
                        <div className="text-center flex-1 border-r border-white/5">
                           <p className="text-xl font-black text-blue-400">{(boostBudget * boostDays * 125).toLocaleString()}</p>
                           <p className="text-[8px] text-gray-500 uppercase font-black">Est. Reach</p>
                        </div>
                        <div className="text-center flex-1">
                           <p className="text-xl font-black text-purple-400">${(boostBudget * boostDays).toLocaleString()}</p>
                           <p className="text-[8px] text-gray-500 uppercase font-black">Total Spend</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                     <TrendingUp className="text-blue-400 shrink-0" size={18} />
                     <p className="text-xs text-blue-100/70 leading-relaxed">Boosted vibes appear 4x more frequently in the <span className="text-white font-bold">Arena Discover</span> feed and target similar creators.</p>
                  </div>
               </div>

               <button 
                onClick={handleBoostSubmit}
                className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 group"
               >
                 <Zap size={20} className="group-hover:fill-current" /> CONFIRM GIGABOOST
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation FAB - Moved up for better access */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`absolute bottom-28 right-6 p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all active:scale-95 flex items-center justify-center z-[70] ${
          isMenuOpen ? 'bg-white text-black rotate-45' : 'bg-blue-600 text-white'
        }`}
      >
        {isMenuOpen ? <X size={28} /> : <Camera size={28} />}
      </button>

      {/* Expanded Menu - Higher positioning */}
      {isMenuOpen && (
        <div className="absolute bottom-48 right-6 flex flex-col items-end gap-5 z-[70] animate-in slide-in-from-bottom-8">
           <button onClick={() => { setIsLive(true); setIsMenuOpen(false); }} className="bg-red-600 text-white p-5 rounded-full shadow-[0_0_30_px_rgba(220,38,38,0.5)] flex items-center gap-3 active:scale-90 transition-transform border border-red-400/30">
              <span className="text-[11px] font-black uppercase tracking-widest mr-1">Start Live 🎥</span>
              <Radio size={24} className="animate-pulse" />
           </button>
           
           <button onClick={() => { setShowCamera(true); setIsMenuOpen(false); }} className="bg-white/10 backdrop-blur-2xl text-white p-5 rounded-full shadow-2xl flex items-center gap-3 active:scale-90 transition-transform border border-white/20">
              <span className="text-[11px] font-black uppercase tracking-widest mr-1">Camera 📸</span>
              <Video size={24}/>
           </button>
           
           <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} className="bg-purple-600 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 active:scale-90 transition-transform border border-purple-400/20">
              <span className="text-[11px] font-black uppercase tracking-widest mr-1">Gallery 📁</span>
              <Upload size={24}/>
           </button>
        </div>
      )}

      {/* Camera View Overlay - Improved visibility of bottom controls */}
      {showCamera && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col">
           <div className="p-6 pt-12 flex justify-between items-center z-20">
              <button onClick={() => setShowCamera(false)} className="p-3 bg-black/40 backdrop-blur-md rounded-full"><X size={24}/></button>
              <span className="text-xs font-black tracking-widest uppercase italic text-blue-500">GIGA Studio 🎥</span>
              <div className="w-10" />
           </div>
           <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-900">
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative w-64 h-64 border-2 border-white/30 rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] pointer-events-none" />
           </div>
           {/* Refined bottom capture area */}
           <div className="pb-24 pt-12 bg-black flex flex-col items-center gap-6">
              <button onClick={capturePhoto} className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                 <div className="w-20 h-20 rounded-full bg-white shadow-xl group-hover:scale-95 transition-transform" />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Tap to Capture Vibe 🌟</p>
           </div>
           <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*" onChange={e => {
        const f = e.target.files?.[0];
        if (f) {
          const r = new FileReader();
          r.onloadend = () => {
            const mediaType: 'image' | 'video' | 'audio' = f.type.startsWith('video') ? 'video' : (f.type.startsWith('audio') ? 'audio' : 'image');
            setPreviewMedia({ url: r.result as string, mediaType });
            setShowUpload(true);
          };
          r.readAsDataURL(f);
        }
      }} />

      {/* Post Upload Modal */}
      {showUpload && previewMedia && (
        <div className="fixed inset-0 z-[2000] bg-black animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="p-6 pt-12 flex justify-between items-center border-b border-white/10">
             <button onClick={() => { setShowUpload(false); setPreviewMedia(null); }} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
             <h3 className="font-black italic tracking-tighter text-white">New GIGAVibe ✨</h3>
             <button onClick={handlePostSubmit} className="bg-blue-600 px-6 py-2 rounded-full font-black text-sm shadow-lg shadow-blue-900/40 text-white">Post 🚀</button>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-32">
             <div className="relative rounded-[2.5rem] overflow-hidden aspect-[3/4] border border-white/10 shadow-2xl">
                {previewMedia.mediaType === 'image' && <img src={previewMedia.url} className="w-full h-full object-cover" alt="Preview" />}
                {previewMedia.mediaType === 'video' && <video src={previewMedia.url} className="w-full h-full object-cover" autoPlay loop muted playsInline controls />}
                {previewMedia.mediaType === 'audio' && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-blue-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Disc size={18} className="text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Audio</span>
                    </div>
                    <audio src={previewMedia.url} controls className="w-full" />
                  </div>
                )}
                {previewMedia.mediaType !== 'audio' && (
                  <button onClick={() => setShowCamera(true)} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full font-black text-xs flex items-center gap-2 text-white"><RefreshCcw size={14} /> Retake</button>
                )}
             </div>
             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Post type</span>
               <div className="flex gap-2">
                 {(['post', 'short', 'story'] as const).map((t) => (
                   <button
                     key={t}
                     onClick={() => setUploadPostType(t)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                       uploadPostType === t ? 'bg-white text-black' : 'bg-white/10 text-white'
                     }`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </div>
             <textarea 
               value={caption}
               onChange={e => setCaption(e.target.value)}
               placeholder="Write a caption... #GIGAVibe ✍️"
               className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 h-32 focus:outline-none focus:border-blue-500 outline-none text-sm resize-none text-white"
             />
          </div>
        </div>
      )}

      {/* Share Sheet Drawer */}
      {showShareSheet && (
        <div className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-md flex items-end animate-in fade-in duration-300" onClick={() => setShowShareSheet(null)}>
          <div className="w-full bg-[#0a0a0a] rounded-t-[3rem] p-8 border-t border-white/10 animate-in slide-in-from-bottom duration-500 pb-16" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
            <div className="grid grid-cols-4 gap-8 mb-10">
              {[{ icon: MessageSquare, label: 'WhatsApp', key: 'WhatsApp', color: 'bg-green-600' },
                { icon: Instagram, label: 'Stories', key: 'Instagram', color: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600' },
                { icon: LinkIcon, label: 'Link', key: 'Link', color: 'bg-white/10' },
                { icon: Download, label: 'Download', key: 'Download', color: 'bg-white/10' }].map((item, idx) => (
                <button key={idx} onClick={() => handleShareAction(item.key, showShareSheet)} className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl ${item.color} border border-white/10`}><item.icon size={26} /></div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowShareSheet(null)} className="w-full bg-white/5 border border-white/10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] text-white">Cancel ✖️</button>
          </div>
        </div>
      )}
      
      {/* Comments Drawer */}
      {activeCommentId && activePost && (
        <div className="fixed inset-0 z-[2500] bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-300" onClick={() => setActiveCommentId(null)}>
          <div className="w-full h-[75vh] bg-[#0a0a0a] rounded-t-[3rem] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-6" />
            <div className="px-6 flex justify-between items-center mb-4">
              <h3 className="font-black italic uppercase tracking-widest text-sm text-white">{activePost.comments} Comments 💬</h3>
              <button onClick={() => setActiveCommentId(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={18} className="text-white"/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar space-y-6">
              {activePost.commentList.map((comment) => (
                <div key={comment.id} className="flex gap-4 group">
                  <img src={comment.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="avatar" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-tighter">{comment.username}</h4>
                      <span className="text-[9px] text-gray-500 font-bold">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-snug">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <button className="flex items-center gap-1 text-[10px] text-gray-500 font-bold hover:text-red-500 transition-colors"><Heart size={12} /> {comment.likes}</button>
                       <button className="text-[10px] text-gray-500 font-bold hover:text-white transition-colors">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={commentEndRef} />
            </div>
            <div className="p-6 pb-20 bg-black/40 border-t border-white/10">
               {/* Quick Emoji Bar for Comments */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 px-2">
                  {QUICK_EMOJIS.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => addEmoji(emoji)}
                      className="text-lg bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
               </div>
               
               <div className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-full px-4 py-1">
                  <button className="p-2 text-gray-500"><Smile size={20} /></button>
                  <input value={newCommentText} onChange={e => setNewCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} placeholder="Add a vibe... ✨" className="flex-1 bg-transparent py-3 text-sm focus:outline-none text-white" />
                  <button onClick={handleAddComment} disabled={!newCommentText.trim()} className={`p-2 transition-all ${newCommentText.trim() ? 'text-blue-500' : 'text-gray-700'}`}><Send size={20} /></button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
