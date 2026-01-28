
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  Sparkles, Loader2, Wand2, X, Zap, 
  RefreshCcw, BrainCircuit, RefreshCw, AudioLines, Square, Mic, Copy, Clapperboard
} from 'lucide-react';

interface AILabProps {
  remixSource?: { url: string; type: 'image' | 'video'; username: string } | null;
  onClearRemix?: () => void;
}

const AILab: React.FC<AILabProps> = ({ remixSource, onClearRemix }) => {
  const [activeTool, setActiveTool] = useState<'caption' | 'visual' | 'coach' | 'image_gen' | 'video_gen' | 'remix' | 'transcribe'>('caption');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Transcription State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const currentTranscriptRef = useRef('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcription
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveTranscript, transcriptionHistory]);

  // Handle incoming remix content
  useEffect(() => {
    if (remixSource) {
      setActiveTool('remix');
      setCapturedImage(remixSource.url);
      setInput(`Remix this masterpiece by ${remixSource.username} with a futuristic cyberpunk aesthetic.`);
    }
  }, [remixSource]);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startTranscription = async () => {
    try {
      setIsTranscribing(true);
      currentTranscriptRef.current = '';
      setLiveTranscript('');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Transcription session opened');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isTranscribing) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmData = new Uint8Array(int16.buffer);
              const base64 = encode(pcmData);

              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
                });
              }).catch(console.error);
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentTranscriptRef.current += text;
              setLiveTranscript(currentTranscriptRef.current);
            }
            if (message.serverContent?.turnComplete) {
              const finalLine = currentTranscriptRef.current.trim();
              if (finalLine) {
                setTranscriptionHistory(prev => [...prev, finalLine]);
              }
              currentTranscriptRef.current = '';
              setLiveTranscript('');
            }
          },
          onerror: (e) => {
            console.error("Transcription Error Callback:", e);
            stopTranscription();
          },
          onclose: () => {
            console.log('Transcription session closed');
            setIsTranscribing(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: 'You are an accurate live transcriber. Simply output the transcription of the user audio. Do not respond with audio unless absolutely necessary for clarification.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start transcription:", err);
      setIsTranscribing(false);
    }
  };

  const stopTranscription = () => {
    setIsTranscribing(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (currentTranscriptRef.current.trim()) {
      setTranscriptionHistory(prev => [...prev, currentTranscriptRef.current.trim()]);
    }
    currentTranscriptRef.current = '';
    setLiveTranscript('');
  };

  const handleGenerate = async () => {
    if (!input.trim() && !capturedImage) return;

    if (activeTool === 'video_gen') {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      } catch (err) {
        console.warn("Key selection utility unavailable");
      }
    }

    setLoading(true);
    setResult(null);
    try {
      if (activeTool === 'caption') {
        setResult(await gemini.generateViralCaption(input));
      } else if (activeTool === 'visual' || activeTool === 'remix') {
        setResult(await gemini.generateAdVisual(input, capturedImage || undefined));
      } else if (activeTool === 'image_gen') {
        setResult(await gemini.generateImage(input, capturedImage || undefined, aspectRatio));
      } else if (activeTool === 'video_gen') {
        setResult(await gemini.generateVideo(input, aspectRatio));
      }
    } catch (error) {
      setResult("AI Lab error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetTool = () => { 
    setInput(''); 
    setResult(null); 
    setCapturedImage(null); 
    setTranscriptionHistory([]);
    setLiveTranscript('');
    currentTranscriptRef.current = '';
    if (onClearRemix) onClearRemix();
  };

  return (
    <div className="h-full bg-black p-6 pt-24 overflow-y-auto pb-32 no-scrollbar">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-2 italic">
            <BrainCircuit className="text-blue-500" />
            GIGA AI Lab
          </h2>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-tighter">Creation Engine v3.0</p>
        </div>
        {(input || capturedImage || result || transcriptionHistory.length > 0) && (
          <button onClick={resetTool} className="p-2 bg-white/5 rounded-full text-gray-400 border border-white/10 hover:bg-white/10 transition-colors"><RefreshCcw size={20} /></button>
        )}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'remix', label: 'Remix', icon: RefreshCw, color: 'bg-indigo-600 ring-indigo-400 shadow-indigo-900/40' },
          { id: 'transcribe', label: 'Live Text', icon: AudioLines, color: 'bg-green-600 ring-green-400 shadow-green-900/40' },
          { id: 'caption', label: 'Caption', icon: Zap, color: 'bg-blue-600 ring-blue-400 shadow-blue-900/40' },
          { id: 'image_gen', label: 'Image Gen', icon: Sparkles, color: 'bg-pink-600 ring-pink-400 shadow-pink-900/40' },
          { id: 'video_gen', label: 'Video Gen', icon: Clapperboard, color: 'bg-red-600 ring-red-400 shadow-red-900/40' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id as any); setResult(null); }}
            className={`px-4 py-3 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap border border-white/10 ${
              activeTool === t.id ? `${t.color} ring-2 shadow-xl scale-105` : 'bg-white/5 opacity-50'
            }`}
          >
            <t.icon size={18} />
            <span className="font-bold text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTool === 'transcribe' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div 
               ref={scrollRef}
               className="w-full h-80 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar shadow-inner relative"
             >
                {transcriptionHistory.length === 0 && !liveTranscript && !isTranscribing && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50">
                      <Mic size={48} className="mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Awaiting Audio Input</p>
                   </div>
                )}
                <div className="space-y-4">
                   {transcriptionHistory.map((line, idx) => (
                      <p key={idx} className="text-gray-300 text-sm font-medium leading-relaxed animate-in slide-in-from-left duration-300">{line}</p>
                   ))}
                   {liveTranscript && (
                      <p className="text-blue-400 text-sm font-black leading-relaxed italic animate-pulse">
                         {liveTranscript}
                         <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-ping" />
                      </p>
                   )}
                </div>
             </div>

             <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isTranscribing ? stopTranscription : startTranscription}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${
                    isTranscribing ? 'bg-red-600 animate-pulse' : 'bg-green-600 active:scale-95'
                  }`}
                >
                   {isTranscribing ? (
                      <div className="relative">
                         <Square size={32} fill="white" />
                         <div className="absolute -inset-4 border-2 border-red-500 rounded-full animate-ping opacity-20" />
                      </div>
                   ) : (
                      <Mic size={32} fill="white" className="group-hover:scale-110 transition-transform" />
                   )}
                </button>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                   {isTranscribing ? 'Recording Live Audio...' : 'Tap to Start Transcription'}
                </p>

                {(transcriptionHistory.length > 0 || liveTranscript) && (
                   <div className="flex gap-3 mt-4 w-full">
                      <button 
                        onClick={() => {
                           const fullText = [...transcriptionHistory, liveTranscript].filter(Boolean).join('\n');
                           navigator.clipboard.writeText(fullText);
                           alert("Copied to clipboard!");
                        }}
                        className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/10 transition-colors"
                      >
                         <Copy size={16} /> Copy All
                      </button>
                      <button 
                        onClick={() => {
                           setInput([...transcriptionHistory, liveTranscript].filter(Boolean).join(' '));
                           setActiveTool('caption');
                        }}
                        className="flex-1 bg-blue-600 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-blue-500 transition-colors"
                      >
                         <RefreshCw size={16} /> Use as Caption
                      </button>
                   </div>
                )}
             </div>
          </div>
        ) : (
          <>
            {capturedImage && (
              <div className="relative group animate-in zoom-in duration-300">
                <img src={capturedImage} className="w-full aspect-square object-cover rounded-[2rem] border-2 border-blue-500 shadow-2xl" alt="Source" />
                {remixSource && activeTool === 'remix' && (
                  <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                     <RefreshCw size={14} className="text-blue-400 animate-spin-slow" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Remixing @{remixSource.username}</span>
                  </div>
                )}
                <button onClick={() => { setCapturedImage(null); if (onClearRemix) onClearRemix(); }} className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-black/80 transition-colors"><X size={20} /></button>
              </div>
            )}

            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTool === 'remix' ? "How should we remix this?" : "Describe your vision..."}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-5 text-base focus:outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || (!input && !capturedImage)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={24} />}
              {loading ? 'Processing...' : (activeTool === 'remix' ? 'Ignite Remix' : 'Generate')}
            </button>

            {result && (
              <div className="mt-8 animate-in slide-in-from-bottom-8">
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
                  {activeTool === 'caption' ? (
                    <p className="whitespace-pre-wrap text-lg font-semibold italic">{result}</p>
                  ) : (
                    <div className="rounded-[1.5rem] overflow-hidden shadow-2xl">
                       {activeTool === 'video_gen' ? (
                         <video src={result} className="w-full h-auto" controls autoPlay loop playsInline />
                       ) : (
                         <img src={result} className="w-full h-auto" alt="AI Result" />
                       )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AILab;
