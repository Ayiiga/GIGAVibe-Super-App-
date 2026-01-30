
import React, { useState, useRef, useEffect } from 'react';
import { Post, TabType, ContentType } from '../types';
import { 
  Heart, MessageCircle, Share2, Plus, Sparkles, ShoppingBag, Zap, Camera, 
  Video, X, ChevronRight, Music, DollarSign, Wand2, Loader2, Send, Upload, 
  UserPlus, UserCheck, Copy, Twitter, Users, Globe, Search, Shield, Lock, 
  ImagePlus, MoreVertical, Facebook, Code, Music2, Briefcase, Shirt, 
  Gamepad2, RefreshCw, FlipHorizontal, UserCircle2, Settings, ShieldAlert, 
  BadgeCheck, Disc, Play, Pause, Search as SearchIcon, Radio, Share, 
  Link as LinkIcon, Instagram, MessageSquare, Mail, Download, CheckCircle2,
  UserRoundPlus, UserRoundCheck, Check, Smile, RefreshCcw, Tag, Rocket, TrendingUp,
  Film, Image, Clock, Mic, Volume2, VolumeX, Headphones, FileVideo, FileImage, FileAudio
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
  isLiked: boolean;
  isFollowing: boolean;
  isBoostedPost?: boolean;
  commentList: Comment[];
  contentType?: ContentType;
  audioUrl?: string;
  duration?: number;
  isStory?: boolean;
  expiresAt?: string;
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
  const [previewMedia, setPreviewMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [caption, setCaption] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showBoostModal, setShowBoostModal] = useState<string | null>(null);
  const [boostBudget, setBoostBudget] = useState(25);
  const [boostDays, setBoostDays] = useState(3);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState<string | null>(null); 
  const [toast, setToast] = useState<string | null>(null);
  
  // Creator Content Upload States
  const [contentType, setContentType] = useState<ContentType>('photo');
  const [showContentPicker, setShowContentPicker] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isShort, setIsShort] = useState(false);
  const [isStory, setIsStory] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
        setPreviewMedia({ url: dataUrl, type: 'image' });
        setShowCamera(false);
        setShowUpload(true);
      }
    }
  };

  // Audio Recording Functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioDuration(recordingTime);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Audio recording failed:", err);
      showFeedback("Microphone access denied 🚫");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handlePostSubmit = () => {
    if (!previewMedia && !audioUrl) return;
    
    const newPost: SocialPost = {
      id: Date.now().toString(),
      username: '@ayiiga_benard',
      avatar: 'https://picsum.photos/seed/user1/200',
      contentUrl: previewMedia?.url || 'https://picsum.photos/seed/audio/400/400',
      caption: caption || `Check out my new ${contentType} on GIGAVibe! ✨`,
      likes: 0,
      comments: 0,
      shares: 0,
      isVideo: previewMedia?.type === 'video' || contentType === 'video' || contentType === 'short',
      isLiked: false,
      isFollowing: false,
      commentList: [],
      contentType: contentType,
      audioUrl: audioUrl || undefined,
      duration: audioDuration || undefined,
      isStory: isStory,
      expiresAt: isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
    };
    
    setPosts([newPost, ...posts]);
    setShowUpload(false);
    setShowContentPicker(false);
    setPreviewMedia(null);
    setAudioUrl(null);
    setCaption('');
    setContentType('photo');
    setIsShort(false);
    setIsStory(false);
    setAudioDuration(0);
    
    const typeLabel = isStory ? 'Story' : isShort ? 'Short' : contentType.charAt(0).toUpperCase() + contentType.slice(1);
    showFeedback(`${typeLabel} Posted Successfully! 🚀`);
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
    setPosts(prev => prev.map(p => p.id === showBoostModal ? { ...p, isBoostedPost: true } : p));
    const totalCost = boostBudget * boostDays;
    const estimatedReach = (boostBudget * 150 * boostDays).toLocaleString();
    showFeedback(`Boosted for $${totalCost}! Est. reach: ${estimatedReach} impressions over ${boostDays} days 🚀`);
    setShowBoostModal(null);
    setBoostBudget(25);
    setBoostDays(3);
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
              <img src={post.contentUrl} className="absolute inset-0 w-full h-full object-cover z-0" alt="content" />
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

                <button onClick={() => onRemix?.({ url: post.contentUrl, type: post.isVideo ? 'video' : 'image', username: post.username })} className="flex flex-col items-center gap-1 group">
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

      {/* Boost Post Modal - Enhanced with $1-$100 range and days */}
      {showBoostModal && (
        <div className="fixed inset-0 z-[2600] bg-black/80 backdrop-blur-md flex items-end animate-in fade-in duration-300" onClick={() => setShowBoostModal(null)}>
          <div className="w-full bg-[#0a0a0a] rounded-t-[3rem] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-6 shrink-0" />
            <div className="px-8 pb-12">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-500 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white">Boost Your Vibe 🚀</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Creator Growth Suite</p>
                  </div>
               </div>

               <div className="space-y-6 mb-8">
                  {/* Budget Selection - $1 to $100 */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-400">Boost Budget 💰</span>
                        <span className="text-3xl font-black text-green-400">${boostBudget}</span>
                     </div>
                     <p className="text-[10px] text-gray-500 mb-4">Choose how much to invest (starting from $1)</p>
                     <input 
                       type="range" 
                       min="1" 
                       max="100" 
                       step="1"
                       value={boostBudget}
                       onChange={(e) => setBoostBudget(parseInt(e.target.value))}
                       className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                     />
                     <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-bold">
                        <span>$1</span>
                        <span>$25</span>
                        <span>$50</span>
                        <span>$75</span>
                        <span>$100</span>
                     </div>
                  </div>

                  {/* Days Selection */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-400">Boost Duration ⏱️</span>
                        <span className="text-2xl font-black text-purple-400">{boostDays} Day{boostDays > 1 ? 's' : ''}</span>
                     </div>
                     <p className="text-[10px] text-gray-500 mb-4">How long should we promote your content?</p>
                     <div className="grid grid-cols-5 gap-2">
                        {[1, 3, 5, 7, 14].map(days => (
                          <button
                            key={days}
                            onClick={() => setBoostDays(days)}
                            className={`py-3 rounded-xl text-sm font-black transition-all ${
                              boostDays === days 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Estimated Results */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-5 rounded-2xl border border-white/10">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Estimated Results 📊</h4>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                           <p className="text-2xl font-black text-blue-400">{(boostBudget * 150 * boostDays).toLocaleString()}</p>
                           <p className="text-[8px] text-gray-500 uppercase font-black">Impressions</p>
                        </div>
                        <div className="text-center border-x border-white/10">
                           <p className="text-2xl font-black text-green-400">{Math.round(boostBudget * 12 * boostDays).toLocaleString()}</p>
                           <p className="text-[8px] text-gray-500 uppercase font-black">Profile Visits</p>
                        </div>
                        <div className="text-center">
                           <p className="text-2xl font-black text-purple-400">{Math.round(boostBudget * 5 * boostDays).toLocaleString()}</p>
                           <p className="text-[8px] text-gray-500 uppercase font-black">Engagements</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                     <TrendingUp className="text-yellow-400 shrink-0" size={18} />
                     <p className="text-xs text-yellow-100/70 leading-relaxed">Boosted content appears on the <span className="text-white font-bold">Discover Feed</span>, Stories, and targeted to users who engage with similar content.</p>
                  </div>

                  {/* Total Cost Summary */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                     <div>
                        <p className="text-sm font-bold text-white">Total Cost</p>
                        <p className="text-[10px] text-gray-500">${boostBudget} × {boostDays} day{boostDays > 1 ? 's' : ''}</p>
                     </div>
                     <p className="text-3xl font-black text-white">${boostBudget * boostDays}</p>
                  </div>
               </div>

               <button 
                onClick={handleBoostSubmit}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 group"
               >
                 <Zap size={20} className="group-hover:fill-current" /> BOOST FOR ${boostBudget * boostDays} 🚀
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation FAB - Moved up for better access */}
      <button 
        onClick={() => setShowContentPicker(!showContentPicker)}
        className={`absolute bottom-28 right-6 p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all active:scale-95 flex items-center justify-center z-[70] ${
          showContentPicker ? 'bg-white text-black rotate-45' : 'bg-blue-600 text-white'
        }`}
      >
        {showContentPicker ? <X size={28} /> : <Plus size={28} />}
      </button>

      {/* Creator Content Type Picker - Full screen overlay */}
      {showContentPicker && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="p-6 pt-12 flex justify-between items-center border-b border-white/10">
            <h2 className="text-2xl font-black italic tracking-tighter">Create Content ✨</h2>
            <button onClick={() => setShowContentPicker(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            <p className="text-gray-400 text-sm mb-6">Choose what type of content you want to create</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Photo */}
              <button 
                onClick={() => { setContentType('photo'); setShowCamera(true); setShowContentPicker(false); }}
                className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-3xl p-6 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <div className="p-4 bg-pink-500/20 rounded-2xl">
                  <Image size={32} className="text-pink-400" />
                </div>
                <span className="font-black text-white">Photo 📸</span>
                <span className="text-[10px] text-gray-400">Capture moments</span>
              </button>

              {/* Video */}
              <button 
                onClick={() => { setContentType('video'); fileInputRef.current?.setAttribute('accept', 'video/*'); fileInputRef.current?.click(); setShowContentPicker(false); }}
                className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-6 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <Video size={32} className="text-blue-400" />
                </div>
                <span className="font-black text-white">Video 🎬</span>
                <span className="text-[10px] text-gray-400">Share your story</span>
              </button>

              {/* Short */}
              <button 
                onClick={() => { setContentType('short'); setIsShort(true); fileInputRef.current?.setAttribute('accept', 'video/*'); fileInputRef.current?.click(); setShowContentPicker(false); }}
                className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-3xl p-6 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <div className="p-4 bg-red-500/20 rounded-2xl">
                  <Film size={32} className="text-red-400" />
                </div>
                <span className="font-black text-white">Short 🎥</span>
                <span className="text-[10px] text-gray-400">15-60 sec clips</span>
              </button>

              {/* Story */}
              <button 
                onClick={() => { setContentType('story'); setIsStory(true); setShowCamera(true); setShowContentPicker(false); }}
                className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 rounded-3xl p-6 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <div className="p-4 bg-yellow-500/20 rounded-2xl">
                  <Clock size={32} className="text-yellow-400" />
                </div>
                <span className="font-black text-white">Story ⏱️</span>
                <span className="text-[10px] text-gray-400">24hr visibility</span>
              </button>

              {/* Audio */}
              <button 
                onClick={() => { setContentType('audio'); setShowContentPicker(false); setShowUpload(true); }}
                className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-3xl p-6 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 col-span-2"
              >
                <div className="p-4 bg-green-500/20 rounded-2xl">
                  <Headphones size={32} className="text-green-400" />
                </div>
                <span className="font-black text-white">Audio 🎵</span>
                <span className="text-[10px] text-gray-400">Music, podcasts, voice notes</span>
              </button>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => { setIsLive(true); setShowContentPicker(false); }}
                  className="w-full bg-red-600/20 border border-red-500/30 rounded-2xl p-4 flex items-center gap-4 hover:bg-red-600/30 transition-colors"
                >
                  <div className="p-2 bg-red-500/30 rounded-xl">
                    <Radio size={20} className="text-red-400 animate-pulse" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-white block">Go Live 🔴</span>
                    <span className="text-[10px] text-gray-400">Stream in real-time</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-500" />
                </button>

                <button 
                  onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*,video/*'); fileInputRef.current?.click(); setShowContentPicker(false); }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <Upload size={20} className="text-purple-400" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-white block">Upload from Gallery 📁</span>
                    <span className="text-[10px] text-gray-400">Photos & videos from device</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
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
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={e => {
        const f = e.target.files?.[0];
        if (f) {
          const r = new FileReader();
          r.onloadend = () => {
            setPreviewMedia({ url: r.result as string, type: f.type.startsWith('video') ? 'video' : 'image' });
            setShowUpload(true);
          };
          r.readAsDataURL(f);
        }
      }} />

      {/* Post Upload Modal - Enhanced for all content types */}
      {showUpload && (
        <div className="fixed inset-0 z-[2000] bg-black animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="p-6 pt-12 flex justify-between items-center border-b border-white/10">
             <button onClick={() => { setShowUpload(false); setPreviewMedia(null); setAudioUrl(null); setContentType('photo'); }} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
             <h3 className="font-black italic tracking-tighter text-white">
               New {contentType === 'audio' ? 'Audio 🎵' : isStory ? 'Story ⏱️' : isShort ? 'Short 🎥' : 'GIGAVibe ✨'}
             </h3>
             <button 
               onClick={handlePostSubmit} 
               disabled={!previewMedia && !audioUrl}
               className="bg-blue-600 px-6 py-2 rounded-full font-black text-sm shadow-lg shadow-blue-900/40 text-white disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Post 🚀
             </button>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-32">
             {/* Audio Recording UI */}
             {contentType === 'audio' && (
               <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-[2.5rem] p-8 border border-green-500/30">
                 <div className="flex flex-col items-center">
                   {!audioUrl ? (
                     <>
                       <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all ${isRecording ? 'bg-red-500/30 animate-pulse' : 'bg-green-500/20'}`}>
                         {isRecording ? (
                           <div className="text-center">
                             <Mic size={48} className="text-red-400 mx-auto animate-pulse" />
                             <p className="text-2xl font-black text-white mt-2">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</p>
                           </div>
                         ) : (
                           <Mic size={48} className="text-green-400" />
                         )}
                       </div>
                       
                       {isRecording ? (
                         <button 
                           onClick={stopAudioRecording}
                           className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-red-900/50"
                         >
                           <VolumeX size={24} /> Stop Recording
                         </button>
                       ) : (
                         <button 
                           onClick={startAudioRecording}
                           className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-green-900/50"
                         >
                           <Mic size={24} /> Start Recording 🎙️
                         </button>
                       )}
                       
                       <p className="text-[10px] text-gray-400 mt-4 text-center">
                         Or upload an audio file from your device
                       </p>
                       <button 
                         onClick={() => audioInputRef.current?.click()}
                         className="mt-3 bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
                       >
                         <Upload size={16} /> Upload Audio 📁
                       </button>
                       <input 
                         ref={audioInputRef}
                         type="file" 
                         accept="audio/*" 
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             const url = URL.createObjectURL(file);
                             setAudioUrl(url);
                             // Get audio duration
                             const audio = new Audio(url);
                             audio.onloadedmetadata = () => {
                               setAudioDuration(Math.round(audio.duration));
                             };
                           }
                         }}
                       />
                     </>
                   ) : (
                     <>
                       <div className="w-full bg-white/5 rounded-2xl p-4 mb-4">
                         <div className="flex items-center gap-4">
                           <div className="p-3 bg-green-500/20 rounded-xl">
                             <Volume2 size={24} className="text-green-400" />
                           </div>
                           <div className="flex-1">
                             <p className="font-bold text-white">Audio Ready 🎵</p>
                             <p className="text-xs text-gray-400">Duration: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}</p>
                           </div>
                           <audio src={audioUrl} controls className="w-32 h-8" />
                         </div>
                       </div>
                       <button 
                         onClick={() => { setAudioUrl(null); setAudioDuration(0); }}
                         className="text-red-400 text-sm font-bold flex items-center gap-2"
                       >
                         <RefreshCcw size={14} /> Re-record
                       </button>
                     </>
                   )}
                 </div>

                 {/* Add cover image for audio */}
                 <div className="mt-6 pt-6 border-t border-white/10">
                   <p className="text-sm font-bold text-gray-400 mb-3">Add Cover Image (Optional) 🖼️</p>
                   <button 
                     onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); }}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                   >
                     {previewMedia ? (
                       <img src={previewMedia.url} className="w-16 h-16 rounded-xl object-cover" alt="Cover" />
                     ) : (
                       <>
                         <ImagePlus size={20} className="text-gray-400" />
                         <span className="text-sm text-gray-400">Add Cover Art</span>
                       </>
                     )}
                   </button>
                 </div>
               </div>
             )}

             {/* Image/Video Preview */}
             {contentType !== 'audio' && previewMedia && (
               <div className="relative rounded-[2.5rem] overflow-hidden aspect-[3/4] border border-white/10 shadow-2xl">
                  {previewMedia.type === 'video' ? (
                    <video src={previewMedia.url} className="w-full h-full object-cover" controls autoPlay loop muted playsInline />
                  ) : (
                    <img src={previewMedia.url} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  {isStory && (
                    <div className="absolute top-4 left-4 bg-yellow-500/90 px-3 py-1 rounded-full flex items-center gap-2">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase">24hr Story</span>
                    </div>
                  )}
                  {isShort && (
                    <div className="absolute top-4 left-4 bg-red-500/90 px-3 py-1 rounded-full flex items-center gap-2">
                      <Film size={12} />
                      <span className="text-[10px] font-black uppercase">Short</span>
                    </div>
                  )}
                  <button onClick={() => setShowCamera(true)} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full font-black text-xs flex items-center gap-2 text-white"><RefreshCcw size={14} /> Retake</button>
               </div>
             )}
             
             <textarea 
               value={caption}
               onChange={e => setCaption(e.target.value)}
               placeholder={contentType === 'audio' ? "Add a title or description... 🎵" : "Write a caption... #GIGAVibe ✍️"}
               className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 h-32 focus:outline-none focus:border-blue-500 outline-none text-sm resize-none text-white"
             />

             {/* Content Type Badge */}
             <div className="flex items-center gap-2 text-gray-400">
               <span className="text-[10px] font-black uppercase tracking-widest">Posting as:</span>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                 contentType === 'photo' ? 'bg-pink-500/20 text-pink-400' :
                 contentType === 'video' ? 'bg-blue-500/20 text-blue-400' :
                 contentType === 'short' ? 'bg-red-500/20 text-red-400' :
                 contentType === 'story' ? 'bg-yellow-500/20 text-yellow-400' :
                 'bg-green-500/20 text-green-400'
               }`}>
                 {isStory ? 'Story' : isShort ? 'Short' : contentType}
               </span>
             </div>
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
