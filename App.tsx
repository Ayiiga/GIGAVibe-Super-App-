
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import StudioView from './components/StudioView';
import VoiceView from './components/VoiceView';
import PricingView from './components/PricingView';
import DashboardView from './components/DashboardView';
import AuthView from './components/AuthView';
import Onboarding from './components/Onboarding';
import { SubscriptionTier, UserState } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navWidth, setNavWidth] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userState, setUserState] = useState<UserState>({
    tier: SubscriptionTier.FREE,
    photosUsedToday: 0,
    isLoggedIn: false 
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Navigation Progress Simulation
  useEffect(() => {
    setIsNavigating(true);
    setNavWidth(30);
    const t1 = setTimeout(() => setNavWidth(70), 200);
    const t2 = setTimeout(() => {
      setNavWidth(100);
      setTimeout(() => {
        setIsNavigating(false);
        setNavWidth(0);
      }, 300);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTab]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('giga3_tutorial_seen');
    if (userState.isLoggedIn && !hasSeenTutorial) {
      setShowOnboarding(true);
    }
  }, [userState.isLoggedIn]);

  const handleLogin = () => {
    setUserState(prev => ({ ...prev, isLoggedIn: true }));
  };

  const handleLogout = () => {
    setUserState(prev => ({ ...prev, isLoggedIn: false }));
    localStorage.removeItem('giga3_tutorial_seen');
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    setUserState(prev => ({ ...prev, tier }));
    setActiveTab('chat');
    alert(`Success! You have been upgraded to the ${tier} plan immediately. Fulfillment triggered.`);
  };

  const handleGeneration = () => {
    if (userState.tier === SubscriptionTier.FREE) {
      setUserState(prev => ({ ...prev, photosUsedToday: prev.photosUsedToday + 1 }));
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('giga3_tutorial_seen', 'true');
  };

  // Pull to refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1500);
  };

  if (!userState.isLoggedIn) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Navigation Progress Bar */}
      {isNavigating && (
        <div 
          id="nav-progress" 
          style={{ width: `${navWidth}%`, opacity: navWidth === 100 ? 0 : 1 }}
        ></div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tier={userState.tier}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <main className="ml-20 lg:ml-72 h-screen flex flex-col relative transition-all duration-500">
        <header className="h-20 border-b border-white/5 glass px-8 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">System Online</span>
            </div>
            {isRefreshing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 animate-pulse">
                <div className="w-3 h-3 border-2 border-accent-gold border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">Re-Syncing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Engine Version:</span>
              <span className="text-xs font-black text-accent-gold tracking-wider">v2.5 ALPHA</span>
            </div>
            <div className="h-8 w-[1px] bg-white/5"></div>
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-all"
              title="Terminate Session"
            >
              <span className="hidden sm:inline-block">Sign Out</span>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden" ref={scrollContainerRef}>
          {/* Swipe Refresh Visual */}
          <div className="pull-indicator opacity-20 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 animate-bounce">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>

          {activeTab === 'dashboard' && <DashboardView onAction={setActiveTab} />}
          {activeTab === 'chat' && <ChatView searchQuery={searchQuery} />}
          {activeTab === 'studio' && (
            <StudioView 
              tier={userState.tier} 
              onGeneration={handleGeneration}
            />
          )}
          {activeTab === 'voice' && <VoiceView />}
          {activeTab === 'pricing' && (
            <PricingView onUpgrade={handleUpgrade} />
          )}
        </div>
      </main>

      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
    </div>
  );
};

export default App;
