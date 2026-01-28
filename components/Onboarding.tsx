
import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, MessageCircle, ChevronRight, Zap, Download, Share, MoreVertical, PlusSquare, X, Monitor, HelpCircle, Star, CheckCircle, ShieldCheck, ArrowRight, Smartphone, Loader2, Radio } from 'lucide-react';

interface OnboardingProps {
  onComplete: (role: string) => void;
  installPrompt: any;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, installPrompt }) => {
  const [step, setStep] = useState(1); // 1 = Preview, 2 = Deploying, 3 = Role
  const [role, setRole] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const checkStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (standalone) {
        setIsInstalled(true);
        setStep(3);
      }
    };
    checkStatus();
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setStep(3);
    });

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setDeviceType('ios');
    else if (/android/.test(ua)) setDeviceType('android');
    else setDeviceType('desktop');
    
    return () => window.removeEventListener('appinstalled', () => setIsInstalled(true));
  }, []);

  const handleStartDeployment = () => {
    setStep(2);
    setTimeout(() => {
      handleInstallAction();
    }, 2500);
  };

  const handleInstallAction = async () => {
    const promptEvent = installPrompt || (window as any).deferredPrompt;
    
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setIsInstalled(true);
          setStep(3);
        } else {
          setStep(3); // Proceed anyway if they skip
        }
      } catch (err) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const roles = [
    { id: 'create', title: 'Create', icon: Sparkles, desc: 'Share videos and earn payouts', color: 'bg-blue-600' },
    { id: 'shop', title: 'Shop', icon: ShoppingBag, desc: 'Discover unique global products', color: 'bg-purple-600' },
    { id: 'chat', title: 'Chat', icon: MessageCircle, desc: 'Connect with your community', color: 'bg-green-600' },
  ];

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col p-8 pt-20 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center mb-12">
           <div className="w-32 h-32 rounded-[3rem] bg-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-8 border-4 border-white/10">
              <Zap size={64} fill="white" className="text-white" />
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter mb-2">GIGAVibe</h1>
           <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Production Environment 1.2.5</p>
           
           <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] w-full text-left space-y-4">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="text-green-500" size={24} />
                 <h3 className="font-black text-sm uppercase tracking-widest">Identity Secure</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                You are about to launch GIGAVibe. Deploying to your device home screen is recommended for full biometric integration.
              </p>
           </div>
        </div>

        <div className="flex-1" />

        <div className="space-y-4 pb-12">
           <button 
             onClick={handleStartDeployment}
             className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
           >
             LAUNCH TO DEVICE <ArrowRight size={20} />
           </button>
           <button onClick={() => setStep(3)} className="w-full py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Skip and enter preview</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
         <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
               <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
            <Radio size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
         </div>
         <h2 className="text-2xl font-black italic tracking-tighter mb-2">Initializing Live Node</h2>
         <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-12">Connecting to GIGA Intelligence Protocol...</p>
         
         <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-600 animate-[loading-bar_2.5s_ease-in-out_infinite]" />
         </div>
         <style>{`@keyframes loading-bar { 0% { width: 0%; } 100% { width: 100%; } }`}</style>

         {showInstructions && (
          <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
             <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm relative text-white">
               <button onClick={() => setStep(3)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"><X size={20} /></button>
               <h3 className="text-2xl font-black mb-8 italic">Manual Deployment Required</h3>
               
               <div className="space-y-8">
                  {deviceType === 'ios' ? (
                    <>
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-600/20 font-black">1</div>
                          <div className="text-left"><p className="font-black text-sm">Tap Share <Share size={14} className="inline ml-1" /></p><p className="text-gray-500 text-[10px] uppercase font-bold">Safari Bottom</p></div>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 font-black">2</div>
                          <div className="text-left"><p className="font-black text-sm">Add to Home Screen</p><p className="text-gray-500 text-[10px] uppercase font-bold">Scroll & Find</p></div>
                       </div>
                    </>
                  ) : (
                    <>
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-600/20 font-black">1</div>
                          <div className="text-left"><p className="font-black text-sm">Tap Menu <MoreVertical size={14} className="inline ml-1" /></p><p className="text-gray-500 text-[10px] uppercase font-bold">Top Right</p></div>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 font-black">2</div>
                          <div className="text-left"><p className="font-black text-sm">Install App</p><p className="text-gray-500 text-[10px] uppercase font-bold">Confirm Prompt</p></div>
                       </div>
                    </>
                  )}
               </div>

               <button onClick={() => setStep(3)} className="w-full mt-12 bg-white text-black font-black py-4 rounded-2xl">ENTER PREVIEW</button>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col p-8 pt-20 animate-in slide-in-from-right duration-300">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
           <ShieldCheck size={18} className="text-blue-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Identity Active</span>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter mb-2">Initialize.</h2>
        <p className="text-gray-500 font-bold">Select your primary node role in the GIGA Ecosystem.</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-8">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 text-left ${
              role === r.id ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'border-white/5 bg-white/5'
            }`}
          >
            <div className={`p-4 rounded-2xl ${r.color} shadow-lg shadow-black/40`}>
              <r.icon size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg">{r.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{r.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/5 p-4 rounded-3xl mb-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Radio size={14} className="text-red-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Node Sync Complete</p>
         </div>
         <span className="text-[10px] font-black text-blue-500">v1.2.5</span>
      </div>

      <button 
        disabled={!role}
        onClick={() => { localStorage.setItem('gigavibe_onboarded', 'true'); onComplete(role); }}
        className="w-full bg-blue-600 disabled:opacity-20 text-white font-black py-5 rounded-2xl mb-8 flex items-center justify-center gap-2 shadow-2xl shadow-blue-900/50 transition-all active:scale-95"
      >
        GO LIVE <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Onboarding;
