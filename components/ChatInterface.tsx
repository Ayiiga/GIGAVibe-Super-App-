
import React, { useState, useEffect, useRef } from 'react';
// Fixed missing icon: Plus
import { Search, MoreVertical, Send, Users, User, ChevronLeft, Lock, Camera, Phone, Video, Banknote, X, MessageSquarePlus, Mic, MicOff, VideoOff, PhoneOff, Volume2, Trash2, Ban, UserPlus, QrCode, Paperclip, ChevronRight, Plus, Smile } from 'lucide-react';
import { ChatMessage } from '../types';

const CONTACTS_INITIAL = [
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
  const [viewingContact, setViewingContact] = useState(false);
  
  const [allContacts, setAllContacts] = useState(CONTACTS_INITIAL);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);

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

  const activeChatList = mode === 'private' ? privateChats : communityChats;
  
  const getActiveChatDetails = () => {
    if (!activeChatId) return null;
    return mode === 'private' ? privateChats.find(c => c.id === activeChatId) : communityChats.find(c => c.id === activeChatId);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: 'Me',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text'
    }]);
    setInput('');
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const currentChat = getActiveChatDetails();

  if (activeChatId && currentChat) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a0a] relative">
        <div className="p-4 pt-12 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChatId(null)} className="p-1"><ChevronLeft size={24} /></button>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">{currentChat.avatar}</div>
            <div><h3 className="font-bold text-sm">{currentChat.name}</h3></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCallState('dialing')} className="p-2"><Phone size={20}/></button>
            <button onClick={() => setCallType('video')} className="p-2"><Video size={20}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.isMe ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                <p className="text-sm">{msg.text}</p>
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

          <div className="flex gap-2 items-center">
            <button className="p-2 text-gray-500"><Plus size={20}/></button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message..." className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm" />
            <button onClick={handleSend} className="p-2 text-blue-500"><Send size={20}/></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
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
    </div>
  );
};

export default ChatInterface;
