
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  X, Mic, MicOff, Heart, Users, Radio, Zap, Loader2, Send, 
  BrainCircuit, Pause, Play, Save, CheckCircle2, Gift, Star, 
  Crown, Rocket, Sparkles, Flame, Gem
} from 'lucide-react';

interface LiveHostProps {
  onClose: () => void;
}

const LIVE_GIFTS = [
  { id: 'heart', name: 'GIGA Heart', cost: 5, emoji: '❤️', icon: Heart, color: 'bg-pink-500' },
  { id: 'star', name: 'Arena Star', cost: 15, emoji: '⭐', icon: Star, color: 'bg-yellow-500' },
  { id: 'rocket', name: 'Arena Rocket', cost: 50, emoji: '🚀', icon: Rocket, color: 'bg-blue-600' },
  { id: 'crown', name: 'Creator Crown', cost: 500, emoji: '👑', icon: Crown, color: 'bg-purple-600' },
];

const LiveHost: React.FC<LiveHostProps> = ({ onClose }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<{ id: string, user: string, text: string, type?: 'chat' | 'gift' }[]>([
    { id: '1', user: 'GIGA_Fan', text: 'This vibe is insane! 🔥', type: 'chat' },
    { id: '2', user: 'Dev_Lagos', text: 'Watching from Accra! 🇬🇭', type: 'chat' },
  ]);
  const [input, setInput] = useState('');
  const [likes, setLikes] = useState(1240);
  const [viewers, setViewers] = useState(842);
  const [isMuted, setIsMuted] = useState(false);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [activeGiftEffect, setActiveGiftEffect] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const intervalRef = useRef<number | null>(null);

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  useEffect(() => {
    const startLive = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted || isPaused) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current!.destination);

              const ctx = canvasRef.current?.getContext('2d');
              intervalRef.current = window.setInterval(() => {
                if (videoRef.current && canvasRef.current && ctx && !isPaused) {
                  canvasRef.current.width = 320;
                  canvasRef.current.height = 240;
                  ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                  canvasRef.current.toBlob(async (blob) => {
                    if (blob) {
                      const base64 = await blobToBase64(blob);
                      sessionPromise.then(session => session.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                    }
                  }, 'image/jpeg', 0.5);
                }
              }, 1000);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (isPaused) return;
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }
              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onerror: (e) => console.error("Live Error:", e),
            onclose: () => console.log("Live Closed"),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: 'You are a viral AI creator guest on GIGAVibe live. Be energetic, interact with the host and the imaginary audience comments. Your name is GIGA-AI.'
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to connect live:", err);
        setIsConnecting(false);
      }
    };

    startLive();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sessionRef.current?.close();
      if (inputAudioContextRef.current) inputAudioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), user: 'You', text: input, type: 'chat' }]);
    setInput('');
  };

  const handleSendGift = (gift: typeof LIVE_GIFTS[0]) => {
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      user: 'You', 
      text: `Sent a ${gift.name}! ${gift.emoji}`,
      type: 'gift' 
    }]);
    
    setLikes(prev => prev + (gift.cost * 10));
    setActiveGiftEffect(gift.id);
    setShowGiftMenu(false);
    showFeedback(`${gift.name} Sent! 🎉`);

    // Reset effect after animation
    setTimeout(() => setActiveGiftEffect(null), 3000);
  };

  const handleSaveVibe = () => {
    showFeedback("Vibe Recording Saved!");
  };

  const handlePostVibe = () => {
    showFeedback("Vibe Posted to Feed!");
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* Gift Animations Layer */}
      {activeGiftEffect && (
        <div className="fixed inset-0 z-[3200] pointer-events-none flex items-center justify-center">
           <div className="animate-bounce-slow text-8xl drop-shadow-[0_0_50px_rgba(255,255,255,0.8)]">
              {LIVE_GIFTS.find(g => g.id === activeGiftEffect)?.emoji}
           </div>
           {/* Particles effect simulation */}
           <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute animate-ping opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: '24px'
                  }}
                >
                  ✨
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[3300] bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-in zoom-in duration-300">
          <CheckCircle2 size={18} className="text-green-600" />
          <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-12 left-0 right-0 p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-1 pr-4 rounded-full border border-white/10">
          <img src="https://picsum.photos/seed/user1/100" className="w-8 h-8 rounded-full border border-white/20" alt="host" />
          <div>
            <p className="text-[10px] font-black tracking-tight text-white">@ayiiga_benard</p>
            <p className="text-[8px] text-blue-400 font-bold flex items-center gap-1"><Zap size={8} fill="currentColor" /> {likes.toLocaleString()} Likes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
              <Users size={12} className="text-white/50" />
              <span className="text-[10px] font-black text-white">{viewers}</span>
           </div>
           <button onClick={onClose} className="p-2 bg-red-600 rounded-full border border-white/10 hover:bg-red-500 transition-colors shadow-lg">
              <X size={20} className="text-white" />
           </button>
        </div>
      </div>

      {/* Split Screen Video Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 relative bg-black overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity ${isPaused ? 'opacity-30' : 'opacity-100'}`} />
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Pause size={64} className="text-white opacity-50" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg">Host</div>
        </div>
        
        <div className="flex-1 relative bg-black overflow-hidden border-t-2 border-white/10">
          {isConnecting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
               <Loader2 size={32} className="animate-spin text-blue-500" />
               <p className="text-xs font-black uppercase tracking-widest animate-pulse text-gray-400">Connecting Guest Creator...</p>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-blue-900/20 to-black flex items-center justify-center">
               <div className="relative">
                  <div className={`w-32 h-32 rounded-full bg-blue-600/20 flex items-center justify-center absolute inset-0 ${!isPaused ? 'animate-ping' : ''}`} />
                  <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center bg-black relative z-10 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                     <BrainCircuit size={48} className="text-blue-500" />
                  </div>
               </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-purple-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg">Guest Creator (AI)</div>
          <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-lg">
             <Radio size={12} className="text-white" />
             <span className="text-[10px] font-black uppercase tracking-tighter text-white">Live</span>
          </div>
        </div>
      </div>

      {/* Live Control Panel Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-5">
         
         <div className="flex justify-center gap-6 mb-2">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`p-5 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center ${isPaused ? 'bg-green-600 text-white' : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'}`}
            >
              {isPaused ? <Play size={28} fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
            </button>
            <button 
              onClick={() => setShowGiftMenu(!showGiftMenu)}
              className={`p-5 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center ${showGiftMenu ? 'bg-pink-600 text-white' : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'}`}
            >
              <Gift size={28} />
            </button>
            <button 
              onClick={handleSaveVibe}
              className="p-5 rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/20 shadow-2xl transition-all active:scale-90"
            >
              <Save size={28} />
            </button>
            <button 
              onClick={handlePostVibe}
              className="p-5 rounded-full bg-blue-600 text-white shadow-2xl transition-all active:scale-95 flex items-center gap-3 px-8"
            >
              <Send size={24} />
              <span className="font-black text-sm uppercase tracking-widest">Post Vibe</span>
            </button>
         </div>

         {/* Gift Menu Overlay */}
         {showGiftMenu && (
           <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 mb-2 grid grid-cols-4 gap-4 animate-in slide-in-from-bottom-8">
              {LIVE_GIFTS.map(gift => (
                <button 
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="flex flex-col items-center gap-2 group p-2 hover:bg-white/5 rounded-2xl transition-colors"
                >
                   <div className={`w-12 h-12 rounded-full ${gift.color} flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-transform`}>
                      <gift.icon size={20} />
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-white">{gift.name}</p>
                      <p className="text-[8px] font-bold text-yellow-500">{gift.cost} coins</p>
                   </div>
                </button>
              ))}
           </div>
         )}

         <div className="max-h-36 overflow-y-auto no-scrollbar space-y-3 mb-2 px-2">
            {messages.map(m => (
              <div key={m.id} className="flex gap-2 animate-in slide-in-from-left duration-300">
                <span className={`text-[10px] font-black drop-shadow-md ${m.type === 'gift' ? 'text-yellow-400' : 'text-blue-400'}`}>{m.user}:</span>
                <span className={`text-[11px] font-medium backdrop-blur-md px-3 py-1 rounded-xl border text-gray-200 ${m.type === 'gift' ? 'bg-yellow-500/20 border-yellow-500/30 font-bold' : 'bg-black/40 border-white/10'}`}>
                  {m.text}
                </span>
              </div>
            ))}
         </div>

         <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
               <input 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Say something nice..." 
                 className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500 transition-all text-white" 
               />
               <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 transition-colors"><Send size={20}/></button>
            </div>
            <button onClick={() => setLikes(l => l + 1)} className="p-4 bg-pink-600 text-white rounded-2xl shadow-xl active:scale-90 transition-transform"><Heart size={24} fill="white" /></button>
            <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white border border-white/10'}`}>
               {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
         </div>
         
         <p className="text-center text-[9px] text-white/40 font-black uppercase tracking-[0.4em]">Secured by GIGA Escrow Node</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LiveHost;
