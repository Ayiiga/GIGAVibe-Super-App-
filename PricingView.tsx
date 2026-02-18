
import React from 'react';
import { SubscriptionTier } from '../types';

interface PricingViewProps {
  onUpgrade: (tier: SubscriptionTier) => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onUpgrade }) => {
  const plans = [
    {
      id: SubscriptionTier.FREE,
      name: 'Free Access',
      price: '0.00',
      features: ['Unlimited General Knowledge', 'Songwriting & Copywriting', '10 Photos / Day', 'Videos < 12 Seconds', 'Standard Processing'],
      accent: 'slate'
    },
    {
      id: SubscriptionTier.BASE,
      name: 'Base Tier',
      price: '55.00',
      features: ['Unlimited Photo Generation', 'Priority Processing', 'Up to 30s Videos', 'Full Book Authorship', 'Email Support'],
      accent: 'blue'
    },
    {
      id: SubscriptionTier.POPULAR,
      name: 'Popular Tier',
      price: '130.00',
      isPopular: true,
      features: ['Unlimited High-Res Photos', 'Unlimited Long Videos', 'Enterprise Data Logic', 'Priority Rendering', 'Custom AI Voiceovers'],
      accent: 'gold'
    },
    {
      id: SubscriptionTier.ENTERPRISE,
      name: 'Enterprise',
      price: '300.00',
      features: ['Full API Access', 'Team Collaboration', '24/7 Dedicated Support', 'White-Label Options', 'Immediate Fulfillment'],
      accent: 'purple'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="text-center mb-16">
        <h2 className="font-outfit text-5xl font-black mb-4">Elevate Your Intelligence</h2>
        <p className="text-slate-400 text-lg">Secure your spot at the forefront of Ghanaian AI innovation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`glass rounded-[32px] p-8 flex flex-col relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] border-slate-800 ${plan.isPopular ? 'border-accent-gold ring-1 ring-accent-gold/30' : ''}`}
          >
            {plan.isPopular && (
              <div className="absolute top-6 right-6 bg-accent-gold text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-accent-gold/20">
                Best Value
              </div>
            )}
            
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-slate-500 text-xl font-medium">GHC</span>
              <span className="text-5xl font-black font-outfit">{plan.price}</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-accent-gold shrink-0">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.74-5.24Z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onUpgrade(plan.id)}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.isPopular 
                ? 'bg-accent-gold text-black hover:bg-yellow-500' 
                : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-accent-gold">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-bold">Safe & Global Payments</h4>
            <p className="text-sm text-slate-500">Secure transactions via Google Pay or Direct Visa Integration.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 bg-white/5 border border-white/10 px-6 rounded-xl flex items-center grayscale opacity-50 font-bold text-sm">VISA</div>
          <div className="h-10 bg-white/5 border border-white/10 px-6 rounded-xl flex items-center grayscale opacity-50 font-bold text-sm">G PAY</div>
          <div className="h-10 bg-white/5 border border-white/10 px-6 rounded-xl flex items-center grayscale opacity-50 font-bold text-sm">MASTERCARD</div>
        </div>
      </div>
    </div>
  );
};

export default PricingView;
