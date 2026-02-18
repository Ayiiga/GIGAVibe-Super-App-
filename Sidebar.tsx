
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { SubscriptionTier } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tier: SubscriptionTier;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tier, searchQuery, setSearchQuery }) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-72 glass border-r border-white/5 flex flex-col z-50 shadow-2xl">
      {/* Logo & Search */}
      <div className="p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent-gold rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.35)] transition-transform hover:scale-110">
            <span className="text-black font-black text-2xl">G</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-outfit font-black text-2xl tracking-tight text-white leading-none">Giga3 AI</h1>
            <p className="text-[9px] text-accent-gold font-black uppercase tracking-[0.2em] mt-1">Intelligence Engine</p>
          </div>
        </div>

        <div className="hidden lg:block relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 text-slate-500 group-focus-within:text-accent-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-slate-900/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-gold/50 focus:bg-slate-900/60 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            data-tour={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id 
              ? 'bg-accent-gold text-black shadow-lg shadow-accent-gold/10' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-black/5' : 'bg-transparent group-hover:bg-white/5'}`}>
              <item.icon className={`size-5 ${activeTab === item.id ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
            </div>
            <span className="hidden lg:block font-bold text-sm tracking-wide">{item.label}</span>
            {activeTab === item.id && (
              <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-black/40"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-6 border-t border-white/5 space-y-6">
        <div className="hidden lg:block bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-3xl p-5 border border-white/5 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Plan</span>
            <span className="text-[9px] bg-accent-gold text-black px-2 py-0.5 rounded-full font-black uppercase shadow-[0_0_10px_rgba(251,191,36,0.2)]">{tier}</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-[1px]">
            <div className="bg-gradient-to-r from-accent-gold to-yellow-500 h-full w-2/5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center font-medium">40% of monthly tokens used</p>
        </div>
        
        <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-colors">
          <div className="relative">
             <img src="https://picsum.photos/40/40?seed=benard" alt="User" className="w-11 h-11 rounded-full border-2 border-slate-800 transition-transform group-hover:scale-105" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full shadow-lg"></div>
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold text-white truncate leading-tight">Benard Issaka</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">ayiiga3@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
