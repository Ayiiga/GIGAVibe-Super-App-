
import React from 'react';

interface DashboardViewProps {
  onAction: (tab: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onAction }) => {
  const stats = [
    { label: 'Creative Content', value: '142', unit: 'Generated', color: 'text-accent-gold' },
    { label: 'Academic Tokens', value: '12.4k', unit: 'Processed', color: 'text-blue-400' },
    { label: 'Cloud Storage', value: '84%', unit: 'Used', color: 'text-purple-400' },
  ];

  const quickActions = [
    { id: 'chat', title: 'Deep Research', desc: 'Author full books or papers', icon: '📚', color: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'studio', title: 'Viral Studio', desc: 'AI-powered high-engagement videos', icon: '🎬', color: 'bg-accent-gold/10 border-accent-gold/20' },
    { id: 'voice', title: 'Live Voice', desc: 'Real-time vocal intelligence', icon: '🎙️', color: 'bg-green-500/10 border-green-500/20' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto space-y-12 animate-in fade-in duration-700 custom-scrollbar">
      {/* Hero Welcome */}
      <section id="dashboard-hero" className="relative glass rounded-[40px] p-12 overflow-hidden border-white/5 shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-5xl md:text-6xl font-black font-outfit text-white leading-tight">
              Welcome back, <br /><span className="text-accent-gold font-black">Benard Issaka</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl font-medium">
              Giga3 AI Engine is primed and optimized. Your latest creative project "Futuristic Accra" has been successfully cached.
            </p>
            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => onAction('chat')}
                className="bg-accent-gold text-black px-10 py-5 rounded-[22px] font-black text-sm shadow-xl shadow-accent-gold/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
              >
                Begin Research
              </button>
              <button 
                onClick={() => onAction('studio')}
                className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-[22px] font-black text-sm hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Enter Studio
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-1 gap-4 w-72">
            {stats.map((stat, i) => (
              <div key={i} className="glass p-6 rounded-3xl border-white/5 shadow-xl hover:translate-x-2 transition-transform cursor-default bg-slate-900/40">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black font-outfit ${stat.color}`}>{stat.value}</span>
                  <span className="text-xs text-slate-400 font-bold">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter">Quick Access Units</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`group flex flex-col items-start p-8 rounded-[40px] border ${action.color} hover:bg-slate-900/40 transition-all text-left shadow-2xl shadow-black/40 hover:-translate-y-2 relative overflow-hidden`}
            >
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-accent-gold/10 transition-colors"></div>
              <span className="text-4xl mb-8 transform group-hover:scale-125 transition-transform duration-500">{action.icon}</span>
              <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{action.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors font-medium">{action.desc}</p>
              <div className="mt-10 flex items-center gap-2 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Activate Module
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Ecosystem Updates */}
      <section className="pb-20">
        <div className="glass rounded-[40px] p-10 border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 bg-accent-gold/10 rounded-[30px] flex items-center justify-center shrink-0 border border-accent-gold/20 shadow-inner">
             <span className="text-4xl">⚡</span>
           </div>
           <div className="flex-1 text-center md:text-left">
             <h4 className="text-2xl font-black font-outfit mb-2 uppercase tracking-tight">Giga3 AI Architecture v2.5</h4>
             <p className="text-slate-500 text-sm leading-relaxed font-medium">
               New ultra-low latency text modules have been deployed. Experience sub-5 second responses across all core knowledge domains.
             </p>
           </div>
           <button className="bg-slate-900/60 hover:bg-slate-800 px-10 py-4 rounded-[20px] font-black text-[11px] transition-all border border-white/5 shrink-0 uppercase tracking-widest text-slate-400 hover:text-white">
             View Metrics
           </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
