
import React, { useState, useEffect, useRef } from 'react';
// Fixed missing icon: Plus
import { Search, MoreVertical, Send, Users, User, ChevronLeft, Lock, Camera, Phone, Video, Banknote, X, MessageSquarePlus, Mic, MicOff, VideoOff, PhoneOff, Volume2, Trash2, Ban, UserPlus, QrCode, Paperclip, ChevronRight, Plus, Smile } from 'lucide-react';
import { ChatMessage } from '../types';

type Contact = {
  id: string;
  name: string;
  avatar: string;
  status: string;
};

const CONTACTS_INITIAL: Contact[] = [
  { id: 'c1', name: 'Kwame Mensah', avatar: 'K', status: 'Available' },
  { id: 'c2', name: 'Ama Osei', avatar: 'A', status: 'Busy' },
  { id: 'c3', name: 'Kofi Boateng', avatar: 'K', status: 'At the gym' },
  { id: 'c4', name: 'Esi Doe', avatar: 'E', status: 'Online' },
];

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏', '🙌', '👍', '✨', '🚀', '💯', '✅'];

const ChatInterface: React.FC = () => {
  const [mode, setMode] = useState<'private' | 'community'>('private');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  
  const [allContacts, setAllContacts] = useState(CONTACTS_INITIAL);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false);
  const [filePickerMode, setFilePickerMode] = useState<'camera' | 'media'>('media');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [privateChats, setPrivateChats] = useState([
    { id: '1', name: 'Ayiiga Benard', lastMsg: 'The SDK looks great. 🚀', time: '10:45 AM', online: true, avatar: 'A' },
    { id: '2', name: 'Sara Smith', lastMsg: 'Did you see the new ad? 🔥', time: 'Yesterday', online: false, avatar: 'S' },
  ]);

  const [communityChats] = useState([
    { id: 'g1', name: 'GIGAVibe Creators 🎨', lastMsg: 'New payout algorithm...', time: '2m ago', count: 12, avatar: 'G' },
    { id: 'g2', name: 'Lagos Marketplace 🛍️', lastMsg: 'Looking for a MacBook', time: '1h ago', count: 45, avatar: 'L' },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm0', sender: 'System', text: '🔒 Messages are end-to-end encrypted.', timestamp: '10:00 AM', isMe: false, type: 'system' },
    { id: 'm1', sender: 'Friend', text: 'Did you see the new GIGAScore metrics? 📈', timestamp: '10:45 AM', isMe: false, type: 'text' },
    { id: 'm2', sender: 'Me', text: 'Yeah! I just hit 800. 💯', timestamp: '10:46 AM', isMe: true, type: 'text' },
  ]);
  const [input, setInput] = useState('');

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeChatList = mode === 'private' ? privateChats : communityChats;
  
  const getActiveChatDetails = () => {
    if (!activeChatId) return null;
    return mode === 'private' ? privateChats.find(c => c.id === activeChatId) : communityChats.find(c => c.id === activeChatId);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'Me',
      text,
      timestamp,
      isMe: true,
      type: 'text'
    }]);
    setInput('');
    if (mode === 'private' && activeChatId) {
      setPrivateChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMsg: text, time: 'Now' } : c));
    }
  };

  const handleSendMedia = () => {
    if (!previewMedia) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'Me',
      text: previewMedia.url,
      timestamp,
      isMe: true,
      type: previewMedia.type === 'video' ? 'video' : 'image'
    }]);
    if (mode === 'private' && activeChatId) {
      setPrivateChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMsg: previewMedia.type === 'video' ? 'Sent a video' : 'Sent a photo', time: 'Now' } : c));
    }
    setPreviewMedia(null);
    showFeedback('Attachment sent ✅');
  };

  const openFilePicker = (mode: 'camera' | 'media') => {
    setFilePickerMode(mode);
    setShowAttachments(false);
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileSelected = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewMedia({ url, type: file.type.startsWith('video') ? 'video' : 'image' });
    showFeedback('Attachment ready to send');
  };

  const handleAddContact = () => {
    const name = newContactName.trim();
    if (!name) return showFeedback('Enter a contact name');
    const newContact = {
      id: Date.now().toString(),
      name,
      avatar: name.charAt(0).toUpperCase(),
      status: 'New connection'
    };
    setAllContacts(prev => [newContact, ...prev]);
    setNewContactName('');
    setIsAddingContact(false);
    showFeedback('Contact added ✅');
  };

  const startChatWithContact = (contact: Contact) => {
    setMode('private');
    const existing = privateChats.find(c => c.name === contact.name);
    if (existing) {
      setActiveChatId(existing.id);
      setShowContacts(false);
      return;
    }
    const newId = Date.now().toString();
    setPrivateChats(prev => [
      {
        id: newId,
        name: contact.name,
        lastMsg: 'Say hello 👋',
        time: 'Now',
        online: true,
        avatar: contact.avatar
      },
      ...prev
    ]);
    setActiveChatId(newId);
    setShowContacts(false);
  };

  const handleClearChat = () => {
    setMessages([{ id: 'm0', sender: 'System', text: '🔒 Messages are end-to-end encrypted.', timestamp: 'Just now', isMe: false, type: 'system' }]);
    setShowChatOptions(false);
    showFeedback('Chat cleared');
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const currentChat = getActiveChatDetails();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setCallState('dialing');
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(false);
    setIsVideoEnabled(true);
    showFeedback(type === 'video' ? 'Starting video call...' : 'Starting audio call...');
  };

  const endCall = () => {
    setCallState('idle');
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(false);
    setIsVideoEnabled(true);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    showFeedback('Call ended');
  };

  useEffect(() => {
    if (callState !== 'dialing') return;
    const timer = window.setTimeout(() => setCallState('connected'), 1500);
    return () => window.clearTimeout(timer);
  }, [callState]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = window.setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => window.clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    const needsVideo = callState === 'connected' && callType === 'video' && isVideoEnabled;
    if (!needsVideo) {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        showFeedback('Camera access blocked');
        setIsVideoEnabled(false);
      });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    };
  }, [callState, callType, isVideoEnabled]);

  if (activeChatId && currentChat) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] relative">
        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[3000] bg-white text-black px-6 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest">
            {toast}
          </div>
        )}

        {callState !== 'idle' && (
          <div className="fixed inset-0 z-[2500] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[2.5rem] p-6 text-center shadow-2xl">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">
                {callState === 'dialing' ? 'Connecting...' : 'Call Live'}
              </p>
              <h3 className="text-2xl font-black mb-2">{currentChat.name}</h3>
              <p className="text-xs text-gray-400 mb-6">
                {callState === 'dialing' ? 'Dialing…' : `Duration ${formatDuration(callDuration)}`}
              </p>

              <div className="w-full bg-black/60 rounded-3xl h-56 flex items-center justify-center mb-6 overflow-hidden border border-white/10">
                {callType === 'video' && isVideoEnabled ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <User size={40} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {callType === 'video' ? 'Video paused' : 'Audio call'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-2xl ${isMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white border border-white/10'}`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                {callType === 'video' && (
                  <button
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`p-4 rounded-2xl ${!isVideoEnabled ? 'bg-red-600 text-white' : 'bg-white/10 text-white border border-white/10'}`}
                  >
                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                )}
                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-4 rounded-2xl ${isSpeaker ? 'bg-blue-600 text-white' : 'bg-white/10 text-white border border-white/10'}`}
                >
                  <Volume2 size={20} />
                </button>
                <button onClick={endCall} className="p-4 rounded-2xl bg-red-600 text-white">
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 pt-12 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChatId(null)} className="p-1"><ChevronLeft size={24} /></button>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">{currentChat.avatar}</div>
            <div><h3 className="font-bold text-sm">{currentChat.name}</h3></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => startCall('audio')} className="p-2"><Phone size={20}/></button>
            <button onClick={() => startCall('video')} className="p-2"><Video size={20}/></button>
            <button onClick={() => setShowChatOptions(true)} className="p-2"><MoreVertical size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.isMe ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                {msg.type === 'image' || msg.type === 'video' ? (
                  msg.type === 'video' ? (
                    <video src={msg.text} className="w-full rounded-xl" controls />
                  ) : (
                    <img src={msg.text} className="w-full rounded-xl" alt="Attachment" />
                  )
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
                <span className="text-[10px] opacity-50 block text-right mt-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-black/80 border-t border-white/10 pb-12">
          {/* Quick Emoji Bar */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 px-1">
             {QUICK_EMOJIS.map(emoji => (
               <button 
                key={emoji} 
                onClick={() => addEmoji(emoji)}
                className="text-lg bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors active:scale-90"
               >
                 {emoji}
               </button>
             ))}
          </div>

          {previewMedia && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 mb-3">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <img src={previewMedia.url} className="w-20 h-20 rounded-xl object-cover" alt="Preview" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold">Ready to send</p>
                <p className="text-[10px] text-gray-500">{previewMedia.type === 'video' ? 'Video clip' : 'Image'} attached</p>
              </div>
              <button onClick={() => setPreviewMedia(null)} className="text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest">Discard</button>
              <button onClick={handleSendMedia} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Send</button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button onClick={() => setShowAttachments(true)} className="p-2 text-gray-500"><Plus size={20}/></button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message..." className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm" />
            <button onClick={handleSend} className="p-2 text-blue-500"><Send size={20}/></button>
          </div>
        </div>

        {showAttachments && (
          <div className="fixed inset-0 z-[2100] bg-black/80 backdrop-blur-md flex items-end" onClick={() => setShowAttachments(false)}>
            <div className="w-full bg-[#0a0a0a] rounded-t-[3rem] p-6 border-t border-white/10 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="grid grid-cols-4 gap-4">
                <button onClick={() => openFilePicker('camera')} className="flex flex-col items-center gap-2 text-xs font-bold">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400"><Camera size={20} /></div>
                  Camera
                </button>
                <button onClick={() => openFilePicker('media')} className="flex flex-col items-center gap-2 text-xs font-bold">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400"><Paperclip size={20} /></div>
                  Gallery
                </button>
                <button onClick={() => { showFeedback('Payment request sent 💸'); setShowAttachments(false); }} className="flex flex-col items-center gap-2 text-xs font-bold">
                  <div className="w-12 h-12 bg-green-600/20 rounded-2xl flex items-center justify-center text-green-400"><Banknote size={20} /></div>
                  Request
                </button>
                <button onClick={() => { showFeedback('Contact shared ✅'); setShowAttachments(false); }} className="flex flex-col items-center gap-2 text-xs font-bold">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-2xl flex items-center justify-center text-yellow-400"><QrCode size={20} /></div>
                  Share ID
                </button>
              </div>
            </div>
          </div>
        )}

        {showChatOptions && (
          <div className="fixed inset-0 z-[2200] bg-black/80 backdrop-blur-md flex items-end" onClick={() => setShowChatOptions(false)}>
            <div className="w-full bg-[#0a0a0a] rounded-t-[3rem] p-6 border-t border-white/10 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="space-y-3">
                <button onClick={() => { setViewingContact({ id: currentChat.id, name: currentChat.name, avatar: currentChat.avatar, status: 'Online' }); setShowChatOptions(false); }} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <User size={18} /> View Profile
                </button>
                <button onClick={() => { showFeedback('Chat muted 🔕'); setShowChatOptions(false); }} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <MicOff size={18} /> Mute Notifications
                </button>
                <button onClick={handleClearChat} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <Trash2 size={18} /> Clear Chat
                </button>
                <button onClick={() => { showFeedback('User blocked 🚫'); setShowChatOptions(false); }} className="w-full flex items-center gap-4 p-4 bg-red-600/10 text-red-400 rounded-2xl">
                  <Ban size={18} /> Block User
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={filePickerMode === 'camera' ? 'image/*' : 'image/*,video/*'}
          capture={filePickerMode === 'camera' ? 'user' : undefined}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
            if (e.target) e.target.value = '';
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[3000] bg-white text-black px-6 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest">
          {toast}
        </div>
      )}
      <div className="p-4 pt-16 border-b border-white/5 bg-black/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Messages 💬</h2>
          <button onClick={() => setShowContacts(true)} className="p-2 bg-blue-600 rounded-full"><MessageSquarePlus size={20}/></button>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button onClick={() => setMode('private')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${mode === 'private' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Private 👤</button>
          <button onClick={() => setMode('community')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${mode === 'community' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Groups 👥</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeChatList.map(chat => (
          <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white group-hover:scale-105 transition-transform">{chat.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center"><h4 className="font-bold truncate text-white">{chat.name}</h4><span className="text-[10px] text-gray-500">{chat.time}</span></div>
              <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
            </div>
          </div>
        ))}
      </div>

      {showContacts && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
          <div className="p-4 pt-12 flex items-center justify-between border-b border-white/10">
            <button onClick={() => { setShowContacts(false); setIsAddingContact(false); }} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
            <h3 className="text-lg font-black">Contacts</h3>
            <button onClick={() => setIsAddingContact(!isAddingContact)} className="p-2 bg-blue-600 rounded-full"><UserPlus size={18} /></button>
          </div>
          <div className="p-4">
            {isAddingContact && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-2 items-center">
                <input
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact name"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button onClick={handleAddContact} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Add</button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {allContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black">{contact.avatar}</div>
                  <div>
                    <p className="font-bold text-sm">{contact.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{contact.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startChatWithContact(contact)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Chat</button>
                  <button onClick={() => setViewingContact(contact)} className="p-2 bg-white/10 rounded-full"><ChevronRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingContact && (
        <div className="fixed inset-0 z-[2100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[2.5rem] p-6 text-center relative">
            <button onClick={() => setViewingContact(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full"><X size={16} /></button>
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto text-2xl font-black mb-4">
              {viewingContact.avatar}
            </div>
            <h3 className="text-2xl font-black">{viewingContact.name}</h3>
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-6">{viewingContact.status}</p>
            <div className="flex gap-3">
              <button onClick={() => startChatWithContact(viewingContact)} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest">Message</button>
              <button onClick={() => { showFeedback('Invite sent ✨'); setViewingContact(null); }} className="flex-1 bg-white/10 border border-white/10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
