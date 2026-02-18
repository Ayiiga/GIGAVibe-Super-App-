
import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
  position: 'right' | 'left' | 'top' | 'bottom';
}

const STEPS: OnboardingStep[] = [
  {
    targetId: 'dashboard-hero',
    title: 'Welcome to Giga3 AI',
    description: 'This is your centralized command center for premium intelligence workflows.',
    position: 'bottom'
  },
  {
    targetId: 'nav-chat',
    title: 'Giga Chat',
    description: 'Engage with our most advanced multimodal models for text and vision analysis.',
    position: 'right'
  },
  {
    targetId: 'nav-studio',
    title: 'Creative Studio',
    description: 'Manifest stunning high-fidelity images and cinematic videos using Veo 3.1.',
    position: 'right'
  },
  {
    targetId: 'nav-voice',
    title: 'Voice Link',
    description: 'Direct neural-audio uplink for real-time conversation with zero lag.',
    position: 'right'
  },
  {
    targetId: 'nav-pricing',
    title: 'Premium Upgrade',
    description: 'Unlock unlimited 4K generations and priority rendering buffers.',
    position: 'right'
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    const step = STEPS[currentStep];
    const element = document.getElementById(step.targetId) || document.querySelector(`[data-tour="${step.targetId.split('-')[1]}"]`);
    
    if (element) {
      // Add highlight class
      element.classList.add('tour-highlight');
      
      const rect = element.getBoundingClientRect();
      const padding = 20;
      
      let style: React.CSSProperties = { position: 'fixed', zIndex: 1000, transition: 'all 0.5s ease' };
      
      if (step.position === 'right') {
        style.left = `${rect.right + padding}px`;
        style.top = `${rect.top + (rect.height / 2)}px`;
        style.transform = 'translateY(-50%)';
      } else if (step.position === 'bottom') {
        style.left = `${rect.left + (rect.width / 2)}px`;
        style.top = `${rect.bottom + padding}px`;
        style.transform = 'translateX(-50%)';
      }
      
      setTooltipStyle(style);
      
      return () => {
        element.classList.remove('tour-highlight');
      };
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => onComplete();

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={handleSkip}></div>
      
      <div 
        style={tooltipStyle}
        className="glass p-8 rounded-[32px] border-accent-gold/40 border w-80 shadow-[0_0_50px_rgba(251,191,36,0.2)] animate-in zoom-in-90 fade-in duration-300 pointer-events-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em]">Tutorial {currentStep + 1}/{STEPS.length}</span>
          <button onClick={handleSkip} className="text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <h3 className="font-outfit text-xl font-black text-white mb-2 uppercase tracking-tight">{STEPS[currentStep].title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{STEPS[currentStep].description}</p>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={handleSkip}
            className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
          >
            Skip Tour
          </button>
          <button 
            onClick={handleNext}
            className="bg-accent-gold hover:bg-yellow-500 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-accent-gold/20"
          >
            {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
