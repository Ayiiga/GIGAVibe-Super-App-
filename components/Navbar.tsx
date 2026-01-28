
import React from 'react';
import { TabType } from '../types';
import { Home, MessageCircle, ShoppingBag, Sparkles, Wallet } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { type: TabType.SOCIAL, icon: Home, label: 'Social' },
    { type: TabType.CHATS, icon: MessageCircle, label: 'Chats' },
    { type: TabType.MARKETPLACE, icon: ShoppingBag, label: 'Market' },
    { type: TabType.AI_LAB, icon: Sparkles, label: 'AI Lab' },
    { type: TabType.WALLET, icon: Wallet, label: 'Wallet' },
  ];

  return (
    <nav className="w-full bg-black/95 backdrop-blur-2xl border-t border-white/10 px-4 pb-10 pt-4 z-[1000] relative shrink-0">
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 p-2.5 rounded-2xl active:bg-white/10 cursor-pointer ${
                isActive ? 'text-blue-500 scale-110' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
