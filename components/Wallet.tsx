
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Wallet as WalletIcon, Zap, TrendingUp, ChevronRight, Info, Lock, Fingerprint, ShieldCheck, Loader2, Delete, Mail, Smartphone, ArrowLeft, KeyRound, User, Send, CheckCircle, X, Shield, Scan } from 'lucide-react';

const MOCK_DATA = [
  { name: 'Mon', earnings: 400 },
  { name: 'Tue', earnings: 700 },
  { name: 'Wed', earnings: 200 },
  { name: 'Thu', earnings: 1200 },
  { name: 'Fri', earnings: 800 },
  { name: 'Sat', earnings: 1500 },
  { name: 'Sun', earnings: 950 },
];

const Wallet: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(() => {
    return localStorage.getItem('gigavibe_wallet_pin');
  });
  const [pinSetupStep, setPinSetupStep] = useState<'create' | 'confirm'>('create');
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  useEffect(() => {
    if (storedPin) {
      localStorage.setItem('gigavibe_wallet_pin', storedPin);
    }
  }, [storedPin]);
  
  // Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<'amount' | 'fraud_check' | 'otp' | 'success'>('amount');

  // Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStep, setTransferStep] = useState<'recipient' | 'amount' | 'processing' | 'success'>('recipient');
  const [recipientId, setRecipientId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Forgot PIN State
  const [forgotPinStep, setForgotPinStep] = useState<'idle' | 'method' | 'otp' | 'new_pin'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [newPinEntry, setNewPinEntry] = useState('');

  const handlePinEnter = (num: string) => {
    if (!storedPin) return;
    if (pin.length < 4 && !isShaking) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === storedPin) {
            setIsLocked(false);
            setPin('');
          } else {
            setIsShaking(true);
            setTimeout(() => {
              setIsShaking(false);
              setPin('');
            }, 600);
          }
        }, 150);
      }
    }
  };

  const handleBiometricAuth = () => {
    setIsScanning(true);
    setScanStatus('scanning');
    
    // Simulate biometric processing
    setTimeout(() => {
      setScanStatus('success');
      setTimeout(() => {
        setIsLocked(false);
        setIsScanning(false);
        setScanStatus('idle');
      }, 800);
    }, 2000);
  };

  const startWithdrawal = () => {
    setShowWithdrawModal(true);
    setWithdrawStep('amount');
  };

  const processWithdrawal = () => {
    setWithdrawStep('fraud_check');
    setTimeout(() => {
      setWithdrawStep('otp');
    }, 2000);
  };

  const verifyOtp = () => {
    setWithdrawStep('success');
    setTimeout(() => {
      setShowWithdrawModal(false);
    }, 2000);
  };

  const startTransfer = () => {
    setShowTransferModal(true);
    setTransferStep('recipient');
    setRecipientId('');
    setTransferAmount('');
  };

  const nextTransferStep = () => {
    if (transferStep === 'recipient') {
      if (!recipientId.trim()) return alert("Enter a valid GIGA ID 🆔");
      setTransferStep('amount');
    } else if (transferStep === 'amount') {
      if (!transferAmount || parseFloat(transferAmount) <= 0) return alert("Enter a valid amount 💰");
      setTransferStep('processing');
      setTimeout(() => {
        setTransferStep('success');
      }, 2500);
    }
  };

  const closeTransfer = () => {
    setShowTransferModal(false);
  };

  const handleRequestOtp = (method: 'email' | 'sms') => {
    setTimeout(() => setForgotPinStep('otp'), 500);
  };

  const handleVerifyResetOtp = () => {
      if (otpCode.length === 4) {
        setForgotPinStep('new_pin');
      } else {
        alert("Please enter a 4-digit code (any code works for demo) 🔑");
      }
  };

  const handleResetComplete = () => {
      if (newPinEntry.length === 4) {
        alert("PIN Updated Successfully! ✅");
        setForgotPinStep('idle');
        setPin('');
        setNewPinEntry('');
        setOtpCode('');
        setStoredPin(newPinEntry);
        setIsLocked(false);
      } else {
        alert("Please enter a 4-digit PIN 🛡️");
      }
  };

  const handlePinSetupNext = () => {
    if (setupPin.length !== 4) {
      setSetupError('Please enter a 4-digit PIN.');
      return;
    }
    setSetupError(null);
    setPinSetupStep('confirm');
  };

  const handlePinSetupConfirm = () => {
    if (confirmPin.length !== 4) {
      setSetupError('Confirm your 4-digit PIN.');
      return;
    }
    if (confirmPin !== setupPin) {
      setSetupError('PINs do not match. Try again.');
      setConfirmPin('');
      return;
    }
    setSetupError(null);
    setStoredPin(confirmPin);
    setIsLocked(false);
    setSetupPin('');
    setConfirmPin('');
    setPinSetupStep('create');
  };

  if (isLocked) {
    if (!storedPin) {
      return (
        <div className="h-full bg-black flex flex-col items-center justify-center p-8 relative z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-8 p-6 bg-blue-600/20 rounded-full border-2 border-blue-500/50 shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            <Lock size={48} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">Create Your GIGAPIN 🔐</h2>
          <p className="text-gray-400 mb-8 text-center text-sm max-w-xs">
            New wallet users must set a personal PIN before accessing funds.
          </p>

          <div className="w-full max-w-xs space-y-4">
            {pinSetupStep === 'create' ? (
              <>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={setupPin}
                  onChange={(e) => {
                    setSetupPin(e.target.value);
                    setSetupError(null);
                  }}
                  placeholder="Create 4-digit PIN"
                  className="bg-white/5 border border-white/10 text-center text-3xl tracking-[0.5em] font-black rounded-2xl p-4 w-full focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                />
                <button onClick={handlePinSetupNext} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-colors">
                  Continue ➡️
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    setSetupError(null);
                  }}
                  placeholder="Confirm PIN"
                  className="bg-white/5 border border-white/10 text-center text-3xl tracking-[0.5em] font-black rounded-2xl p-4 w-full focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                />
                <button onClick={handlePinSetupConfirm} className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:bg-gray-200 transition-colors">
                  Set PIN ✅
                </button>
              </>
            )}
            {setupError && <p className="text-xs text-red-400 text-center">{setupError}</p>}
          </div>
        </div>
      );
    }

    if (forgotPinStep !== 'idle') {
      return (
        <div className="h-full bg-black flex flex-col items-center justify-center p-8 relative z-50 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setForgotPinStep('idle')} className="absolute top-8 left-8 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                <ArrowLeft size={24} />
            </button>
            
            {forgotPinStep === 'method' && (
                <>
                    <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <KeyRound size={40} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">Reset GIGAPIN 🔐</h2>
                    <p className="text-gray-400 mb-8 text-center text-sm max-w-xs">Select a secure verification method to reset your wallet PIN.</p>
                    
                    <div className="w-full space-y-4 max-w-xs">
                        <button onClick={() => handleRequestOtp('sms')} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-green-500/20 rounded-xl text-green-500"><Smartphone size={24} /></div>
                            <div className="text-left">
                                <h4 className="font-bold">Via SMS 📱</h4>
                                <p className="text-xs text-gray-400">Code to ••• ••• 889</p>
                            </div>
                            <ChevronRight className="ml-auto text-gray-500" size={16} />
                        </button>
                        <button onClick={() => handleRequestOtp('email')} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500"><Mail size={24} /></div>
                            <div className="text-left">
                                <h4 className="font-bold">Via Email ✉️</h4>
                                <p className="text-xs text-gray-400">Code to a•••@vibe.com</p>
                            </div>
                            <ChevronRight className="ml-auto text-gray-500" size={16} />
                        </button>
                    </div>
                </>
            )}

            {forgotPinStep === 'otp' && (
                <>
                    <h2 className="text-2xl font-black mb-2">Enter OTP 🔢</h2>
                    <p className="text-gray-400 mb-8 text-center text-sm">We sent a 4-digit code to your registered contact method.</p>
                    <input 
                        type="text" 
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="bg-white/5 border border-white/10 text-center text-3xl tracking-[0.5em] font-black rounded-2xl p-4 w-full max-w-xs mb-8 focus:border-blue-500 outline-none transition-colors"
                        autoFocus
                    />
                    <button onClick={handleVerifyResetOtp} className="w-full max-w-xs bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-colors">Verify Code ✅</button>
                </>
            )}
            
            {forgotPinStep === 'new_pin' && (
                <>
                    <h2 className="text-2xl font-black mb-2">New PIN 🛡️</h2>
                    <p className="text-gray-400 mb-8 text-center text-sm">Create a new 4-digit GIGAPIN to secure your wallet.</p>
                    <input 
                        type="password" 
                        maxLength={4}
                        value={newPinEntry}
                        onChange={(e) => setNewPinEntry(e.target.value)}
                        placeholder="••••"
                        className="bg-white/5 border border-white/10 text-center text-3xl tracking-[0.5em] font-black rounded-2xl p-4 w-full max-w-xs mb-8 focus:border-blue-500 outline-none transition-colors"
                        autoFocus
                    />
                    <button onClick={handleResetComplete} className="w-full max-w-xs bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-colors">Set New PIN 🚀</button>
                </>
            )}
        </div>
      );
    }

    return (
      <div className="h-full bg-black flex flex-col items-center justify-center p-8 relative z-50">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
          }
          @keyframes laser-scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
          .laser-line {
            animation: laser-scan 2s infinite ease-in-out;
          }
        `}} />
        
        {/* Biometric Overlay */}
        {isScanning && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
             <div className="relative mb-12">
                <div className={`w-32 h-32 rounded-3xl border-2 border-white/10 flex items-center justify-center bg-white/5 shadow-2xl overflow-hidden ${scanStatus === 'success' ? 'border-green-500/50' : 'border-blue-500/20'}`}>
                   {scanStatus === 'success' ? (
                     <CheckCircle size={64} className="text-green-500 animate-in zoom-in duration-300" />
                   ) : (
                     <Fingerprint size={64} className="text-blue-500 opacity-50 animate-pulse" />
                   )}
                   
                   {scanStatus === 'scanning' && (
                     <div className="absolute left-0 right-0 h-1 bg-blue-400 laser-line shadow-[0_0_15px_rgba(59,130,246,1)]" />
                   )}
                </div>
                <div className="absolute -inset-4 border border-white/5 rounded-[2.5rem] pointer-events-none" />
             </div>
             
             <h3 className={`text-2xl font-black tracking-tight mb-2 transition-colors ${scanStatus === 'success' ? 'text-green-500' : 'text-white'}`}>
                {scanStatus === 'scanning' ? 'Scanning GIGAVault...' : 'Identity Verified ✅'}
             </h3>
             <p className="text-gray-500 text-sm uppercase font-black tracking-widest">
                {scanStatus === 'scanning' ? 'Secure Biometric Node Active 🔍' : 'Access Granted by Escrow 🏦'}
             </p>
             
             {scanStatus === 'scanning' && (
               <button onClick={() => setIsScanning(false)} className="mt-12 text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
             )}
          </div>
        )}

        <div className="mb-8 p-6 bg-blue-600/20 rounded-full animate-pulse border-2 border-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
          <Lock size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">GIGAVault Locked 🔐</h2>
        <p className="text-gray-400 mb-10 text-center text-sm">Enter your GIGAPIN or use Biometrics to access your funds.</p>

        <div className={`flex gap-6 mb-12 transition-transform ${isShaking ? 'animate-shake' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 transform ${
                i < pin.length 
                  ? 'bg-blue-500 border-blue-400 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
                  : 'bg-white/10 border-white/20'
              } ${isShaking ? 'border-red-500 bg-red-500/20' : ''}`} 
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-xs mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button 
              key={n} 
              onClick={() => handlePinEnter(n.toString())}
              className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all"
            >
              {n}
            </button>
          ))}
          <button 
            onClick={handleBiometricAuth}
            className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-colors shadow-lg active:scale-90"
          >
            <Fingerprint size={28} className="text-blue-500" />
          </button>
          <button 
            onClick={() => handlePinEnter('0')} 
            className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all"
          >
            0
          </button>
          <button 
            onClick={() => setPin(prev => prev.slice(0, -1))} 
            className="flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors active:scale-90"
          >
            <Delete />
          </button>
        </div>

        <button 
          onClick={() => setForgotPinStep('method')} 
          className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors px-4 py-2 rounded-full hover:bg-blue-500/10"
        >
          <KeyRound size={16} />
          Forgot PIN? 🤔
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto p-6 pt-24 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
           <ShieldCheck size={24} className="text-green-500" />
           <h2 className="text-3xl font-black tracking-tighter">GIGACapital 🏦</h2>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-black text-yellow-500 tracking-tighter">GIGA SCORE: 842 ✨</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-8 border border-white/10">
        <div className="absolute -top-10 -right-10 opacity-10">
          <WalletIcon size={200} />
        </div>
        <p className="text-blue-100/70 text-xs font-black uppercase tracking-widest mb-2">Portfolio Balance 📊</p>
        <div className="flex items-baseline gap-2 mb-8">
          <h3 className="text-5xl font-black tracking-tighter">GH₵ 12,840.00</h3>
        </div>
        
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={startWithdrawal}
            className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-95 transition-transform shadow-xl"
          >
            <ArrowDownLeft size={20} /> Withdrawal 💸
          </button>
          <button 
            onClick={startTransfer}
            className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/20 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-95 transition-transform shadow-xl"
          >
            <DollarSign size={20} /> Transfer 📲
          </button>
        </div>
      </div>

      {/* Payout Transparency Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Earnings Breakdown 📝</h4>
          <Info size={16} className="text-gray-600" />
        </div>
        <div className="space-y-4">
          {[
            { label: 'Social Engagement 📱', value: 'GH₵ 4,200', pct: '60%', color: 'bg-blue-500' },
            { label: 'Market Sales 🛍️', value: 'GH₵ 2,100', pct: '30%', color: 'bg-purple-500' },
            { label: 'Community Tips 💎', value: 'GH₵ 700', pct: '10%', color: 'bg-green-500' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-white">{item.value}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`${item.color} h-full`} style={{ width: item.pct }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h4 className="text-lg font-bold">Growth Trends 📈</h4>
          <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-1 rounded">+12% vs LY</span>
        </div>
        <div className="h-64 w-full bg-white/5 border border-white/5 rounded-[2.5rem] p-6 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_DATA}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}
              />
              <Bar dataKey="earnings" radius={[8, 8, 8, 8]}>
                {MOCK_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.earnings > 1000 ? '#3b82f6' : '#1e3a8a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Withdrawal 💸</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-500"><X size={20}/></button>
            </div>

            {withdrawStep === 'amount' && (
              <>
                <p className="text-xs text-gray-500 mb-2 uppercase font-black">Enter Amount (GH₵) 💰</p>
                <input type="number" placeholder="0.00" className="w-full bg-white/5 p-4 rounded-xl mb-6 text-2xl font-mono border border-white/10 focus:border-blue-500 outline-none" defaultValue="500.00" />
                <button onClick={processWithdrawal} className="w-full bg-white text-black font-black py-4 rounded-xl shadow-lg hover:bg-gray-200 transition-colors">Continue ➡️</button>
              </>
            )}
            {withdrawStep === 'fraud_check' && (
              <div className="flex flex-col items-center py-8">
                <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                <p className="text-sm font-bold animate-pulse">Running AI Fraud Check... 🔍</p>
                <p className="text-xs text-gray-500 mt-2">Analyzing Risk Score... 🧠</p>
              </div>
            )}
            {withdrawStep === 'otp' && (
              <>
                <div className="flex items-center gap-2 mb-4 text-yellow-500">
                  <ShieldCheck size={24} />
                  <h3 className="text-lg font-bold">2FA Required 🔐</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">High-value transaction detected. Enter the OTP sent to +233 ** *** 889</p>
                <div className="flex gap-2 mb-6">
                  {[...Array(4)].map((_,i) => <div key={i} className="flex-1 h-12 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center font-mono text-white/50 tracking-tighter">0</div>)}
                </div>
                <button onClick={verifyOtp} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg">Verify & Withdraw ✅</button>
              </>
            )}
            {withdrawStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
                  <ShieldCheck size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1 tracking-tighter">Initiated! 🚀</h3>
                <p className="text-gray-400 text-sm">Funds are on the way to your MoMo. 📲</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic tracking-tighter">GIGA Transfer 📲</h3>
              <button onClick={closeTransfer} className="p-2 bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                <X size={20}/>
              </button>
            </div>

            {transferStep === 'recipient' && (
              <div className="space-y-6">
                <div>
                   <p className="text-[10px] text-gray-500 mb-2 uppercase font-black tracking-widest ml-1">Recipient GIGA ID 🆔</p>
                   <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="@username or phone" 
                        className="w-full bg-white/5 pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:border-blue-500 outline-none text-white font-bold" 
                      />
                   </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                   <Zap size={16} className="text-blue-400" />
                   <p className="text-[10px] text-blue-300 font-bold uppercase">Zero-fee internal transfers ✨</p>
                </div>
                <button 
                  onClick={nextTransferStep} 
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  Find Recipient 🔍 <ChevronRight size={18} />
                </button>
              </div>
            )}

            {transferStep === 'amount' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white">
                       {recipientId.charAt(1).toUpperCase() || 'U'}
                    </div>
                    <div>
                       <h4 className="font-bold text-white">{recipientId}</h4>
                       <p className="text-[10px] text-gray-500 uppercase font-black">Verified User ✅</p>
                    </div>
                 </div>

                 <div>
                   <p className="text-[10px] text-gray-500 mb-2 uppercase font-black tracking-widest ml-1">Send Amount (GH₵) 💰</p>
                   <div className="relative">
                      <DollarSign size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="number" 
                        autoFocus
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-white/5 pl-12 pr-4 py-6 rounded-2xl border border-white/10 focus:border-blue-500 outline-none text-3xl font-black text-white" 
                      />
                   </div>
                   <p className="text-[10px] text-gray-600 mt-2 ml-1">Daily limit: GH₵ 5,000</p>
                 </div>

                 <button 
                   onClick={nextTransferStep} 
                   className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                 >
                   Confirm Transfer 🚀 <Send size={18} />
                 </button>
              </div>
            )}

            {transferStep === 'processing' && (
              <div className="flex flex-col items-center py-12">
                <div className="relative mb-8">
                   <Loader2 size={64} className="animate-spin text-blue-500" strokeWidth={3} />
                   <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                </div>
                <h4 className="text-xl font-black animate-pulse">Processing GIGA-Link... 🔗</h4>
                <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">Encrypted ledger update in progress... 🔒<br/>Verifying recipient wallet integrity.</p>
              </div>
            )}

            {transferStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/40 border-4 border-white/10 animate-bounce">
                  <CheckCircle size={48} className="text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">Sent! 🎉</h3>
                <p className="text-gray-400 text-sm mb-8">GH₵ {parseFloat(transferAmount).toLocaleString()} delivered to <span className="text-white font-bold">{recipientId}</span></p>
                <button 
                  onClick={closeTransfer}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-colors border border-white/10"
                >
                  Back to Wallet ↩️
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
