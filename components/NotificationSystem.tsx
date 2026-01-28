
import React, { useState, useEffect, useCallback } from 'react';
import { TabType } from '../types';
import { Wallet, TrendingUp, MessageCircle, ShieldCheck, X, Zap, BellRing, UserPlus, Heart } from 'lucide-react';

interface NotificationAction {
  label: string;
  targetTab: TabType;
  primary?: boolean;
}

interface NotificationData {
  id: string;
  type: 'payout' | 'viral' | 'sale' | 'security' | 'follow' | 'like';
  title: string;
  body: string;
  icon: any;
  color: string;
  borderColor: string;
  actions: NotificationAction[];
  timestamp: number;
}

const TEMPLATES: Omit<NotificationData, 'id' | 'timestamp'>[] = [
  {
    type: 'payout',
    title: '💰 Payout Milestone',
    body: 'You just earned GH₵ 50.00 from your last video! Tap to see your GIGAWallet.',
    icon: Wallet,
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    actions: [{ label: 'View Wallet', targetTab: TabType.WALLET, primary: true }]
  },
  {
    type: 'viral',
    title: '🚀 Viral Alert',
    body: 'Your video is trending! Use AI Lab to create a Remix now.',
    icon: TrendingUp,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    actions: [{ label: 'Open AI Lab', targetTab: TabType.AI_LAB, primary: true }]
  },
  {
    type: 'follow',
    title: '👤 New Follower',
    body: '@digital_nomad started following you! Check out their profile.',
    icon: UserPlus,
    color: 'bg-indigo-600',
    borderColor: 'border-indigo-600',
    actions: [
      { label: 'Follow Back', targetTab: TabType.SOCIAL, primary: true }
    ]
  },
  {
    type: 'like',
    title: '❤️ Love Shared',
    body: 'Someone liked your recent post! Your GIGAScore is increasing.',
    icon: Heart,
    color: 'bg-red-500',
    borderColor: 'border-red-500',
    actions: [{ label: 'View Post', targetTab: TabType.SOCIAL, primary: true }]
  }
];

interface NotificationSystemProps {
  setActiveTab: (tab: TabType) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ setActiveTab }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((template?: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const data = template || TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const id = Math.random().toString(36).substr(2, 9);
    
    setNotifications(prev => {
      const updated = [
        { ...data, id, timestamp: Date.now() },
        ...prev
      ].slice(0, 3);
      return updated;
    });

    // Auto dismiss
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  useEffect(() => {
    const handleManualTrigger = () => addNotification();
    window.addEventListener('gigavibe-test-notif', handleManualTrigger);
    
    // Initial demo schedule
    const timers = [
      setTimeout(() => addNotification(TEMPLATES[0]), 3000), // Payout
      setTimeout(() => addNotification(TEMPLATES[2]), 12000), // New Follower
    ];

    return () => {
      window.removeEventListener('gigavibe-test-notif', handleManualTrigger);
      timers.forEach(clearTimeout);
    };
  }, [addNotification]);

  const handleAction = (tab: TabType, id: string) => {
    setActiveTab(tab);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-[100] px-4 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => {
        const Icon = notif.icon;
        return (
          <div 
            key={notif.id}
            className={`pointer-events-auto w-full max-w-sm mx-auto bg-black/80 backdrop-blur-xl border-l-4 ${notif.borderColor} rounded-r-2xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="p-4 flex gap-4">
              <div className={`mt-1 w-10 h-10 rounded-full ${notif.color} flex items-center justify-center shadow-lg shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400">now</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{notif.body}</p>
                
                <div className="flex gap-2">
                  {notif.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(action.targetTab, notif.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        action.primary 
                          ? 'bg-white text-black hover:bg-gray-200' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;
