
import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Wallet, ShoppingBag, Settings, ChevronRight, Zap, 
  Lock, Sparkles, ChevronLeft, Bell, Moon, Globe, HelpCircle, LogOut, 
  User, Eye, Smartphone, Trash2, Camera, Download, CheckCircle, 
  RefreshCw, Radio, Loader2, UserPlus, UserCheck, Shield, Key, Sun, 
  EyeOff, Languages, HardDrive, Trash, Cpu, Share, MoreVertical, LayoutGrid,
  SquarePlus
} from 'lucide-react';
import { TabType } from '../types';

interface ProfileProps {
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
  installPrompt: any;
  onOpenBusinessVerification: () => void;
  onOpenCreatorStudio: () => void;
  role?: string | null;
}

const MOCK_FOLLOWERS = [
  { id: '1', name: 'Kwame Osei', username: '@kwame_dev', avatar: 'https://picsum.photos/seed/p1/100', isFollowing: true },
  { id: '2', name: 'Ama Boateng', username: '@ama_vibe', avatar: 'https://picsum.photos/seed/p2/100', isFollowing: false },
  { id: '3', name: 'Kofi Mensah', username: '@kofi_codes', avatar: 'https://picsum.photos/seed/p3/100', isFollowing: true },
  { id: '4', name: 'Esi Doe', username: '@esi_art', avatar: 'https://picsum.photos/seed/p4/100', isFollowing: false },
  { id: '5', name: 'Yaw Frimpong', username: '@yaw_tech', avatar: 'https://picsum.photos/seed/p5/100', isFollowing: false },
];

const Profile: React.FC<ProfileProps> = ({ onClose, onNavigate, installPrompt, onOpenBusinessVerification, onOpenCreatorStudio, role }) => {
  const [currentView, setCurrentView] = useState<'main' | 'settings' | 'followers' | 'following'>('main');
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [connections, setConnections] = useState(MOCK_FOLLOWERS);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('giga_settings');
    return saved ? JSON.parse(saved) : {
      pushNotifications: true,
      activityAlerts: true,
      darkMode: true,
      privateProfile: false,
      biometricVault: true,
      incognitoMode: false,
      language: 'English (US)'
    };
  });

  useEffect(() => {
    localStorage.setItem('giga_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    const checkInstallStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsInstalled(!!standalone);
    };
    
    checkInstallStatus();
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setDeviceType('ios');
    else if (/android/.test(ua)) setDeviceType('android');
    else setDeviceType('desktop');

    return () => window.removeEventListener('appinstalled', () => setIsInstalled(true));
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = installPrompt || (window as any).deferredPrompt;
    setIsDeploying(true);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setIsInstalled(true);
        }
      } catch (e) {
        console.error('Prompt failed:', e);
        setShowInstallHelp(true);
      } finally {
        setIsDeploying(false);
      }
    } else {
      setTimeout(() => {
        setIsDeploying(false);
        setShowInstallHelp(true);
      }, 800);
    }
  };

  const handleClearData = () => {
    if (confirm("Delete all local data and session? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleToggleConnection = (id: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, isFollowing: !c.isFollowing } : c));
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${active ? 'bg-blue-600' : 'bg-white/10'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  const renderFollowList = (type: 'followers' | 'following') => (
    <div className="fixed inset-0 z-[120] bg-black animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl p-4 pt-12 flex items-center gap-4 border-b border-white/10">
        <button onClick={() => setCurrentView('main')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">{type}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {connections.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-[1.5rem] border border-white/10">
            <div className="flex items-center gap-4">
              <img src={user.avatar} className="w-12 h-12 rounded-full border border-white/10" alt={user.name} />
              <div>
                <h4 className="font-bold text-sm">{user.name}</h4>
                <p className="text-xs text-gray-500">{user.username}</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggleConnection(user.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                user.isFollowing ? 'bg-white/10 text-gray-400' : 'bg-blue-600 text-white'
              }`}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (currentView === 'settings') {
    return (
      <div className="fixed inset-0 z-[120] bg-black animate-in slide-in-from-right duration-300 overflow-y-auto pb-24">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl p-4 pt-12 flex items-center gap-4 border-b border-white/10">
          <button onClick={() => setCurrentView('main')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-black italic tracking-tighter">GIGA Settings</h2>
        </div>
        
        <div className="p-6 space-y-8">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">App Preferences</h3>
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 space-y-1">
                 <div className="flex items-center justify-between p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Bell size={18} /></div>
                       <span className="font-bold text-sm">Push Notifications</span>
                    </div>
                    <Toggle active={settings.pushNotifications} onToggle={() => setSettings((s: any) => ({...s, pushNotifications: !s.pushNotifications}))} />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">{settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}</div>
                       <span className="font-bold text-sm">Dark Mode</span>
                    </div>
                    <Toggle active={settings.darkMode} onToggle={() => setSettings((s: any) => ({...s, darkMode: !s.darkMode}))} />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Security & Privacy</h3>
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 space-y-1">
                 <div className="flex items-center justify-between p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><Shield size={18} /></div>
                       <span className="font-bold text-sm">Biometric Vault</span>
                    </div>
                    <Toggle active={settings.biometricVault} onToggle={() => setSettings((s: any) => ({...s, biometricVault: !s.biometricVault}))} />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><EyeOff size={18} /></div>
                       <span className="font-bold text-sm">Private Profile</span>
                    </div>
                    <Toggle active={settings.privateProfile} onToggle={() => setSettings((s: any) => ({...s, privateProfile: !s.privateProfile}))} />
                 </div>
              </div>
           </div>
           
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Storage & Data</h3>
              <div className="space-y-3">
                 <button onClick={handleClearData} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[2rem] active:scale-[0.98] transition-transform group">
                    <div className="flex items-center gap-4">
                       <Trash className="text-red-400 group-hover:animate-pulse" size={20} />
                       <span className="font-bold text-sm">Clear Application Cache</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                 </button>
                 <button onClick={() => setShowInstallHelp(true)} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[2rem] active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-4">
                       <HelpCircle className="text-blue-400" size={20} />
                       <span className="font-bold text-sm">Deployment Guide</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                 </button>
                 <button onClick={() => window.location.reload()} className="w-full p-5 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-[2rem] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    <LogOut size={18} /> Log Out Account
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (currentView === 'followers' || currentView === 'following') {
    return renderFollowList(currentView);
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black animate-in slide-in-from-left duration-300 overflow-y-auto pb-24">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl p-4 pt-12 flex justify-between items-center border-b border-white/10">
        <h2 className="text-xl font-black italic tracking-tighter">My GIGA Profile</h2>
        <div className="flex gap-2">
           <button onClick={() => setCurrentView('settings')} className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"><Settings size={20} /></button>
           <button onClick={onClose} className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"><X size={20} /></button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
           <div className="relative mb-4 group cursor-pointer" onClick={() => alert("Photo capture operational: Opening camera...")}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-1 shadow-[0_0_30px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
                 <img src="https://picsum.photos/seed/user1/200" className="w-full h-full rounded-full object-cover border-4 border-black" alt="P" />
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-black shadow-lg"><Camera size={12} className="text-white" /></div>
           </div>
           <h1 className="text-2xl font-black tracking-tight">Ayiiga Benard</h1>
           <p className="text-gray-500 text-sm mb-6 font-medium">@ayiiga_benard</p>

           <div className="flex gap-8 mb-8">
              <div className="text-center cursor-pointer">
                <p className="font-black text-lg">1,240</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">Posts</p>
              </div>
              <div className="text-center cursor-pointer" onClick={() => setCurrentView('followers')}>
                <p className="font-black text-lg">45.2k</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">Followers</p>
              </div>
              <div className="text-center cursor-pointer" onClick={() => setCurrentView('following')}>
                <p className="font-black text-lg">248</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">Following</p>
              </div>
           </div>

           <div className="w-full space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full transition-colors ${isInstalled ? 'bg-green-600/10' : 'bg-blue-600/5'}`} />
                 
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl transition-colors ${isInstalled ? 'bg-green-600/20 text-green-500' : 'bg-blue-600/20 text-blue-500'}`}>
                          {isInstalled ? <ShieldCheck size={20} /> : <Cpu size={20} />}
                       </div>
                       <h3 className="font-black text-sm uppercase tracking-widest">GIGA App Node</h3>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${isInstalled ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500 animate-pulse'}`}>
                       {isInstalled && <Radio size={10} className="animate-pulse" />}
                       {isInstalled ? 'Production Optimal' : 'Preview Mode'}
                    </div>
                 </div>
                 
                 {isInstalled ? (
                    <div className="space-y-4 animate-in fade-in duration-700">
                       <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <CheckCircle className="text-green-500" size={18} />
                          <p className="text-xs font-bold italic">Node Synced. GIGAVibe Super App is active.</p>
                       </div>
                       <button onClick={() => setShowInstallHelp(true)} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                          Node Diagnostic
                       </button>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <p className="text-xs text-gray-400 leading-relaxed font-medium">
                          Deploy GIGAVibe to your device for 100% performance integrity, biometrics, and live ecosystem sync.
                       </p>
                       <button 
                         onClick={handleInstallClick}
                         disabled={isDeploying}
                         className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-[2rem] flex items-center justify-between shadow-[0_15px_30px_rgba(37,99,235,0.3)] border border-blue-400/20 active:scale-[0.98] transition-all group overflow-hidden relative"
                       >
                         {isDeploying && <div className="absolute inset-0 bg-blue-600 flex items-center justify-center z-10"><Loader2 className="animate-spin" /></div>}
                         <div className="flex items-center gap-4">
                           <Download className="text-white" size={24} />
                           <div className="text-left">
                              <p className="font-black text-sm text-white">Install GIGAVibe Super App</p>
                              <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest">Direct Deployment • Node V1.2.5</p>
                           </div>
                         </div>
                         <ChevronRight size={20} className="text-white/50" />
                       </button>
                    </div>
                 )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div 
                  onClick={() => { onClose(); onNavigate(TabType.AI_LAB); }}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center shadow-lg group hover:bg-white/10 transition-colors cursor-pointer"
                 >
                    <Zap className="mx-auto mb-2 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={20} />
                    <p className="font-black text-lg">842</p>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">GIGAScore</p>
                 </div>
                 <div 
                  onClick={() => { onClose(); onNavigate(TabType.WALLET); }}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center shadow-lg group hover:bg-white/10 transition-colors cursor-pointer"
                 >
                    <Wallet className="mx-auto mb-2 text-green-500" size={20} />
                    <p className="font-black text-lg">12.8k</p>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Earnings</p>
                 </div>
              </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreatorStudio();
                    }}
                    className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-white/10 rounded-[2.5rem] p-6 text-left shadow-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Creator Studio</span>
                    </div>
                    <p className="font-black text-sm">Upload media</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Photos • Videos • Shorts • Stories • Audio</p>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenBusinessVerification();
                    }}
                    className="bg-gradient-to-br from-yellow-600/20 to-orange-600/10 border border-white/10 rounded-[2.5rem] p-6 text-left shadow-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                        <ShieldCheck size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business</span>
                    </div>
                    <p className="font-black text-sm">Verify to sell</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{role === 'business' ? 'Business node active' : 'Anti-fraud verification'}</p>
                  </button>
                </div>

              <button 
                onClick={() => { onClose(); onNavigate(TabType.MARKETPLACE); }}
                className="w-full p-5 bg-white text-black font-black rounded-[2rem] flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl"
              >
                <ShoppingBag size={20} /> GO TO MARKETPLACE
              </button>
           </div>
        </div>
      </div>

      {showInstallHelp && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="bg-[#111] border border-white/10 rounded-[3rem] p-8 w-full max-w-sm relative text-white text-center shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
              <button onClick={() => setShowInstallHelp(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={20} /></button>
              
              <div className="bg-blue-600/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                 <Smartphone size={32} />
              </div>
              
              <h3 className="text-2xl font-black mb-2 italic tracking-tighter">
                {isInstalled ? 'Production Link' : 'Deployment Protocol'}
              </h3>
              <p className="text-gray-400 text-[10px] mb-8 leading-relaxed font-bold uppercase tracking-[0.2em]">
                {isInstalled ? 'GIGAVibe is running in standalone mode' : 'Synchronize GIGA with your operating system'}
              </p>
              
              <div className="space-y-6 text-left mb-8">
                 {isInstalled ? (
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                          <span>Connection Type</span>
                          <span className="text-green-500">Standalone (PWA)</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                          <span>Service Worker</span>
                          <span className="text-blue-500">Active Node</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                          <span>Vault Status</span>
                          <span className="text-white">Encrypted</span>
                       </div>
                    </div>
                 ) : (
                    <>
                       {deviceType === 'ios' ? (
                          <>
                             <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black shrink-0 text-sm shadow-lg">1</div>
                                <p className="text-sm leading-snug">Tap the <Share size={18} className="inline-block mx-1 text-blue-400" /> <span className="font-black text-white">Share icon</span> in the Safari bottom toolbar.</p>
                             </div>
                             <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black shrink-0 text-sm border border-white/10">2</div>
                                <p className="text-sm leading-snug">Scroll down and select <span className="font-black text-white">"Add to Home Screen"</span> <SquarePlus size={16} className="inline-block mx-1" />.</p>
                             </div>
                          </>
                       ) : (
                          <>
                             <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black shrink-0 text-sm shadow-lg">1</div>
                                <p className="text-sm leading-snug">Open the browser menu <MoreVertical size={18} className="inline-block mx-1 text-blue-400" /> (usually top right).</p>
                             </div>
                             <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black shrink-0 text-sm border border-white/10">2</div>
                                <p className="text-sm leading-snug">Choose <span className="font-black text-white">"Install app"</span> or <span className="font-black text-white">"Add to Home Screen"</span>.</p>
                             </div>
                          </>
                       )}
                    </>
                 )}
              </div>

              <button 
                onClick={() => setShowInstallHelp(false)} 
                className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform"
              >
                {isInstalled ? 'BACK TO NODE' : 'ACKNOWLEDGE PROTOCOL'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
