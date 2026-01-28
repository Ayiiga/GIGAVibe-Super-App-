
import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import Navbar from './components/Navbar';
import SocialFeed from './components/SocialFeed';
import ChatInterface from './components/ChatInterface';
import Marketplace from './components/Marketplace';
import AILab from './components/AILab';
import Wallet from './components/Wallet';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import Auth from './components/Auth';
import NotificationSystem from './components/NotificationSystem';
import { Search, Bell, Smartphone, Radio, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.SOCIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gigavibe_auth') === 'true';
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('gigavibe_onboarded') === 'true';
  });

  // Remix State
  const [remixContext, setRemixContext] = useState<{ url: string; type: 'image' | 'video'; username: string } | null>(null);

  // Platform State
  const [isIframe, setIsIframe] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Detect Environment & Standalone Status
    if (window.self !== window.top) setIsIframe(true);
    
    const checkLiveStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsLive(!!standalone);
    };

    checkLiveStatus();

    // 2. Setup Install Prompt Capture
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPrompt = e;
    };
    
    const handleAppInstalled = () => {
      setIsLive(true);
      console.log('GIGAVibe: App Installed - Entering Live Production');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW Error:', e));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleAuthenticated = () => {
    localStorage.setItem('gigavibe_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleRemix = (context: { url: string; type: 'image' | 'video'; username: string }) => {
    setRemixContext(context);
    setActiveTab(TabType.AI_LAB);
  };

  const renderContent = () => {
    switch (activeTab) {
      case TabType.SOCIAL: return <SocialFeed onRemix={handleRemix} onShop={() => setActiveTab(TabType.MARKETPLACE)} />;
      case TabType.CHATS: return <ChatInterface />;
      case TabType.MARKETPLACE: return <Marketplace />;
      case TabType.AI_LAB: return <AILab remixSource={remixContext} onClearRemix={() => setRemixContext(null)} />;
      case TabType.WALLET: return <Wallet />;
      default: return <SocialFeed />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} installPrompt={installPrompt} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col max-w-lg mx-auto bg-black shadow-2xl overflow-hidden border-x border-white/5">
      <NotificationSystem setActiveTab={setActiveTab} />
      
      {showProfile && (
        <Profile 
          onClose={() => setShowProfile(false)} 
          onNavigate={setActiveTab} 
          installPrompt={installPrompt} 
        />
      )}

      <header className={`absolute top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center gap-3 pt-12`}>
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search GIGAVibe...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none"
          />
        </div>

        {isLive && (
          <div className="bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 animate-in zoom-in duration-500">
            <Radio size={12} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Prod Live</span>
          </div>
        )}

        <button 
          onClick={() => setShowProfile(true)}
          className="p-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full overflow-hidden shadow-lg border border-white/20 active:scale-90 transition-transform"
        >
          <img src="https://picsum.photos/seed/user1/200" className="w-8 h-8 rounded-full object-cover border border-black" alt="Profile" />
        </button>
      </header>

      <main className="flex-1 relative overflow-hidden bg-black">
        {renderContent()}
      </main>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
