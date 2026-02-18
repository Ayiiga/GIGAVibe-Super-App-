
import React, { useState, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { SubscriptionTier } from '../types';

interface StudioViewProps {
  tier: SubscriptionTier;
  onGeneration: () => void;
}

const CINEMATIC_STYLES = [
  { label: 'Original', value: '' },
  { label: 'Cinematic Master', value: 'stunning cinematic style, 8k, photorealistic, anamorphic lens, high contrast' },
  { label: 'African Futurism', value: 'african futuristic aesthetic, vibrance, neon traditional patterns, high tech gold accents' },
  { label: 'Anime / Ghibli', value: 'studio ghibli hand-painted style, whimsical, soft atmospheric lighting' },
  { label: 'Cyberpunk 2077', value: 'cyberpunk neon city, night rain, sharp reflections, futuristic mood' },
  { label: 'IMAX Drone View', value: 'majestic aerial view, sweeping horizon, high-speed movement, grand scale' },
];

const LOADING_MESSAGES = [
  "Initializing Giga Cinematic Engine...",
  "Synthesizing neural video frames...",
  "Optimizing resolution and lighting...",
  "Applying cinematic color grading...",
  "This may take a few minutes for complex scenes...",
  "Finalizing production buffers...",
  "Giga AI: Optimizing for viral engagement...",
  "Preparing high-fidelity stream..."
];

const StudioView: React.FC<StudioViewProps> = ({ tier, onGeneration }) => {
  const [type, setType] = useState<'image' | 'video' | 'editor'>(() => (localStorage.getItem('giga_studio_type') as any) || 'image');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>(() => (localStorage.getItem('giga_studio_ratio') as any) || '1:1');
  const [resolution, setResolution] = useState<string>(() => localStorage.getItem('giga_studio_res') || '720p');
  const [prompt, setPrompt] = useState(() => localStorage.getItem('giga_studio_prompt') || '');
  const [style, setStyle] = useState(() => localStorage.getItem('giga_studio_style') || '');
  
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const isPremium = tier !== SubscriptionTier.FREE;

  useEffect(() => {
    localStorage.setItem('giga_studio_type', type);
    localStorage.setItem('giga_studio_ratio', aspectRatio);
    localStorage.setItem('giga_studio_res', resolution);
    localStorage.setItem('giga_studio_prompt', prompt);
    localStorage.setItem('giga_studio_style', style);
  }, [type, aspectRatio, resolution, prompt, style]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (type === 'editor' || !prompt.trim() || loading) return;
    
    setLoading(true);
    setResult(null);
    setError(null);
    setIsCopied(false);

    try {
      const enhancedPrompt = style ? `${prompt}. ${style}` : prompt;

      if (type === 'image') {
        const url = await gemini.generateImage(enhancedPrompt, aspectRatio, isPremium);
        setResult(url);
      } else if (type === 'video') {
        if (!isPremium) {
          setError("Giga Cinematic Engine is reserved for premium tiers. Please upgrade to unleash full potential.");
          setLoading(false);
          return;
        }
        const url = await gemini.generateVideo(enhancedPrompt, aspectRatio as any, resolution);
        setResult(url);
      }
      onGeneration();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Synthesizer offline. Check API connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const downloadMedia = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `giga-ai-${type}-${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-8 pb-20">
        {/* Controls */}
        <div className="w-full lg:w-[400px] space-y-6">
          <div className="glass rounded-[32px] p-6 border-white/5 shadow-2xl relative overflow-hidden group">
            <h2 className="font-outfit text-2xl font-black mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-accent-gold rounded-xl flex items-center justify-center text-black shadow-lg shadow-accent-gold/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" /></svg>
              </span>
              Creative Studio
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Workflow Unit</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
                  {['image', 'video', 'editor'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => { setType(t as any); setResult(null); }}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-accent-gold text-black shadow-lg shadow-accent-gold/10' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {type !== 'editor' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Manifestation Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={type === 'image' ? "A majestic lion standing in a futuristic Accra..." : "Cinematic 4K shot of a flying car over Cape Coast Castle..."}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl p-5 text-sm text-slate-200 h-32 focus:ring-1 ring-accent-gold outline-none resize-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Cinematic Preset</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-bold text-slate-300 focus:ring-1 ring-accent-gold outline-none appearance-none cursor-pointer"
                    >
                      {CINEMATIC_STYLES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Ratio</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['1:1', '16:9', '9:16'].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio as any)}
                            className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === ratio ? 'border-accent-gold text-accent-gold bg-accent-gold/10 shadow-lg shadow-accent-gold/5' : 'border-white/5 text-slate-600 hover:border-slate-700'}`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                    {type === 'video' && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Res</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['720p', '1080p'].map((res) => (
                            <button
                              key={res}
                              onClick={() => setResolution(res)}
                              className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${resolution === res ? 'border-accent-gold text-accent-gold bg-accent-gold/10 shadow-lg shadow-accent-gold/5' : 'border-white/5 text-slate-600 hover:border-slate-700'}`}
                            >
                              {res}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-accent-gold hover:bg-yellow-500 disabled:opacity-50 text-black font-black py-5 rounded-[22px] mt-4 flex items-center justify-center gap-3 shadow-xl shadow-accent-gold/20 transition-all active:scale-[0.98] uppercase text-[11px] tracking-[0.2em]"
                  >
                    {loading ? 'Processing Neural Buffers...' : `Generate ${type}`}
                  </button>
                </div>
              ) : (
                <div className="text-center py-20 opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                  <p className="text-[10px] font-black uppercase tracking-widest">Editor Module v2.5 Deployment Pending</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-top-4 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 shrink-0 opacity-80"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex-1 min-h-[600px] flex flex-col relative">
          <div className="flex-1 glass rounded-[48px] border-white/5 border-dashed border-2 flex items-center justify-center overflow-hidden relative shadow-2xl">
            {result ? (
              type === 'image' ? (
                <img src={result} alt="AI Production" className="w-full h-full object-contain p-8 animate-in fade-in zoom-in-95 duration-1000" />
              ) : (
                <video src={result} controls autoPlay loop className="w-full h-full object-contain p-8 animate-in fade-in duration-1000" />
              )
            ) : (
              <div className="text-center px-16 opacity-10 select-none">
                <div className="w-32 h-32 bg-slate-900/80 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-inner">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.6} stroke="currentColor" className="size-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h3 className="font-outfit text-4xl font-black uppercase tracking-tighter mb-4">Cinematic Master</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">Assets manifest here after neural rendering.</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center z-20 flex-col gap-10 text-center px-10 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-48 h-48 border-[10px] border-accent-gold/5 rounded-full"></div>
                  <div className="w-48 h-48 border-[10px] border-accent-gold border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_60px_rgba(251,191,36,0.4)]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-20 h-20 bg-accent-gold rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                      <span className="text-black font-black text-4xl">G</span>
                    </div>
                  </div>
                </div>
                <div className="max-w-md">
                  <h4 className="font-outfit text-3xl font-black text-white mb-4 uppercase tracking-tight">System Rendering</h4>
                  <p className="text-accent-gold text-[12px] font-black uppercase tracking-[0.5em] animate-pulse leading-loose">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center px-6 gap-8 animate-in slide-in-from-bottom-4 bg-slate-900/20 p-8 rounded-[40px] border border-white/5">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.5em] mb-2">Production Metadata</p>
                <p className="font-outfit font-black text-accent-gold text-2xl uppercase tracking-tighter">AI Asset Synthesized</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-widest py-5 px-10 rounded-[22px] transition-all border shadow-lg ${
                    isCopied ? 'bg-green-500/10 border-green-500/40 text-green-500' : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {isCopied ? 'Copied' : 'Copy URL'}
                </button>
                <button 
                  onClick={downloadMedia}
                  className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest bg-accent-gold hover:bg-yellow-500 text-black py-5 px-10 rounded-[22px] transition-all shadow-2xl active:scale-95"
                >
                  Download HD
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioView;
