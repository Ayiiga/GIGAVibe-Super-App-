
import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, ShieldCheck, Chrome, Apple, ArrowRight, Loader2, 
  MessageSquare, ChevronLeft, CheckCircle2, Zap, Globe, Lock, 
  Check, X, FileText, ShieldAlert
} from 'lucide-react';

interface AuthProps {
  onAuthenticated: () => void;
}

type AuthStep = 'choice' | 'input' | 'otp' | 'success';
type AuthMethod = 'email' | 'phone' | 'google' | 'apple';

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<AuthStep>('choice');
  const [method, setMethod] = useState<AuthMethod | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    let interval: number;
    if (step === 'otp' && timer > 0) {
      interval = window.setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSocialLogin = (type: AuthMethod) => {
    if (!agreedToTerms) return;
    setLoading(true);
    // Simulate OAuth handshake
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  const handleInputSubmit = () => {
    if (!inputValue || !agreedToTerms) return;
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(30);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Check if complete
    if (newOtp.every(digit => digit !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const verifyOtp = (code: string) => {
    setLoading(true);
    // Simulate backend verification
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  const renderPolicyContent = () => {
    if (showPolicyModal === 'terms') {
      return (
        <div className="space-y-4 text-xs text-gray-400 leading-relaxed overflow-y-auto max-h-[60vh] pr-2 no-scrollbar">
          <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4">Terms of Service</h4>
          <p>By using the GIGAVibe platform ("the Service"), you agree to be bound by these terms. GIGA is a decentralized-first ecosystem designed for secure communication and commerce.</p>
          <p><span className="text-blue-400 font-bold">1. User Conduct:</span> Users must not utilize the Service for illegal activities. GIGA maintains a zero-tolerance policy for harassment and fraud.</p>
          <p><span className="text-blue-400 font-bold">2. Digital Assets:</span> Earnings in your GIGAWallet are subject to regional financial regulations. GIGA is not a bank, but a facilitator of secure transactions.</p>
          <p><span className="text-blue-400 font-bold">3. Intellectual Property:</span> You retain rights to your content, but grant GIGA a license to distribute it within the ecosystem.</p>
          <p>4. We reserve the right to suspend any node (account) found in violation of these protocols to maintain ecosystem integrity.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-xs text-gray-400 leading-relaxed overflow-y-auto max-h-[60vh] pr-2 no-scrollbar">
        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4">Privacy Policy</h4>
        <p>Your privacy is protected by GIGA's end-to-end encryption and decentralized identity protocols. We adhere to GDPR and global privacy standards.</p>
        <p><span className="text-green-400 font-bold">1. Data Collection:</span> We only collect essential node data required for transaction processing and identity verification. Your private messages are encrypted and inaccessible to GIGA.</p>
        <p><span className="text-green-400 font-bold">2. Biometric Data:</span> Biometric information used for vault access is stored locally on your device's Secure Enclave and is never uploaded to our servers.</p>
        <p><span className="text-green-400 font-bold">3. Third Parties:</span> We do not sell your data. Transactional data is only shared with verified partners required to complete GIGAMarket orders.</p>
        <p>4. You have the right to request full deletion of your node data at any time via the GIGA Settings panel.</p>
      </div>
    );
  };

  const renderContent = () => {
    if (step === 'choice') {
      return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-8 border-4 border-white/10 relative">
              <Zap size={48} fill="white" className="text-white" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-full border-4 border-black">
                <ShieldCheck size={16} />
              </div>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">Welcome to GIGA</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">The Intelligent Global Arena</p>
            
            <div className="w-full space-y-4 max-w-xs mb-8">
              <button 
                onClick={() => handleSocialLogin('google')}
                disabled={!agreedToTerms}
                className="w-full bg-white text-black py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                <Chrome size={20} /> Continue with Google
              </button>
              
              <button 
                onClick={() => { setMethod('email'); setStep('input'); }}
                disabled={!agreedToTerms}
                className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-white/10 transition-colors disabled:opacity-30 disabled:grayscale"
              >
                <Mail size={20} className="text-blue-500" /> Use Email
              </button>

              <button 
                onClick={() => { setMethod('phone'); setStep('input'); }}
                disabled={!agreedToTerms}
                className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-white/10 transition-colors disabled:opacity-30 disabled:grayscale"
              >
                <Phone size={20} className="text-green-500" /> Use Phone Number
              </button>
            </div>

            {/* Global Compliance Agreement Box */}
            <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-[2rem] p-4 flex gap-4 items-start text-left group transition-all hover:bg-white/[0.08]">
               <button 
                 onClick={() => setAgreedToTerms(!agreedToTerms)}
                 className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}
               >
                 {agreedToTerms && <Check size={14} className="text-white" strokeWidth={4} />}
               </button>
               <div className="text-[10px] leading-tight text-gray-400 font-bold uppercase tracking-tight">
                 I agree to the <button onClick={() => setShowPolicyModal('terms')} className="text-blue-400 hover:underline">Terms of Service</button> and <button onClick={() => setShowPolicyModal('privacy')} className="text-blue-400 hover:underline">Privacy Policy</button>, including international data processing protocols.
               </div>
            </div>
          </div>

          <div className="p-8 text-center">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <ShieldAlert size={12} /> GDPR & CCPA COMPLIANT NODE
            </p>
          </div>
        </div>
      );
    }

    if (step === 'input') {
      return (
        <div className="flex flex-col h-full p-8 animate-in slide-in-from-right duration-300">
          <button onClick={() => setStep('choice')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-12">
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-3xl font-black italic tracking-tighter mb-2">
            {method === 'email' ? 'What\'s your email?' : 'What\'s your number?'}
          </h2>
          <p className="text-gray-500 text-sm font-medium mb-12">
            We'll send a 6-digit verification code to confirm it's you.
          </p>

          <div className="relative mb-8">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
              {method === 'email' ? <Mail size={20} /> : <Phone size={20} />}
            </div>
            <input 
              type={method === 'email' ? 'email' : 'tel'} 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={method === 'email' ? 'name@example.com' : '+233 XX XXX XXXX'}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-lg font-bold focus:border-blue-500 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <button 
            onClick={handleInputSubmit}
            disabled={!inputValue || loading}
            className="w-full bg-blue-600 disabled:opacity-30 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Send Code <ArrowRight size={20} /></>}
          </button>
        </div>
      );
    }

    if (step === 'otp') {
      return (
        <div className="flex flex-col h-full p-8 animate-in slide-in-from-right duration-300">
          <button onClick={() => setStep('input')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-12">
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-3xl font-black italic tracking-tighter mb-2">Verify Node</h2>
          <p className="text-gray-500 text-sm font-medium mb-12">
            Enter the 6-digit code sent to <span className="text-white font-bold">{inputValue}</span>
          </p>

          <div className="flex justify-between gap-2 mb-12">
            {otp.map((digit, i) => (
              <input 
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black focus:border-blue-500 focus:outline-none transition-all"
              />
            ))}
          </div>

          <div className="text-center space-y-4">
            {timer > 0 ? (
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Resend code in <span className="text-blue-500">{timer}s</span></p>
            ) : (
              <button onClick={handleInputSubmit} className="text-xs text-blue-500 font-black uppercase tracking-widest hover:underline">Resend Code</button>
            )}
            
            {loading && (
              <div className="flex items-center justify-center gap-2 text-blue-400 mt-8 animate-pulse">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Validating Integrity...</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (step === 'success') {
      return (
        <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter mb-2">Verified.</h2>
          <p className="text-gray-500 font-bold mb-12">Your node is now part of the Arena.</p>
          
          <div className="w-full max-w-xs space-y-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Environment</span>
              </div>
              <span className="text-[10px] font-black uppercase text-green-500">Production</span>
            </div>
            
            <button 
              onClick={onAuthenticated}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all"
            >
              ENTER ARENA
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black text-white">
      {renderContent()}

      {/* Global Compliance Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[3rem] p-8 relative shadow-2xl animate-in zoom-in duration-300">
              <button 
                onClick={() => setShowPolicyModal(null)} 
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
                    <FileText size={24} />
                 </div>
                 <h3 className="text-xl font-black italic tracking-tighter">GIGA Protocol</h3>
              </div>

              {renderPolicyContent()}

              <button 
                onClick={() => setShowPolicyModal(null)}
                className="w-full mt-8 bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform"
              >
                CLOSE POLICY
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
