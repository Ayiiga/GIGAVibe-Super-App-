
import React, { useState } from 'react';

interface AuthViewProps {
  onLogin: () => void;
}

type AuthMethod = 'email' | 'phone' | 'google';

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<AuthMethod>('email');
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  const handleSendOTP = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetEmailSent(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#020617] overflow-hidden">
      {/* Branding Side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 to-black p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent-gold/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-accent-gold rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-8">
            <span className="text-black font-black text-3xl">G</span>
          </div>
          <h1 className="font-outfit text-6xl font-black text-white leading-tight mb-6">
            Giga3 AI <br /><span className="text-accent-gold">Intelligence</span> Engine.
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            The pinnacle of Ghanaian-led AI innovation. Access premium multi-modal creative tools, academic research, and viral content generation.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Developed by</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden">
               <img src="https://picsum.photos/40/40?seed=benard" alt="CEO" />
            </div>
            <div>
              <p className="font-bold text-white">Ayiiga Benard Issaka</p>
              <p className="text-xs text-slate-500">CEO & Founder, Giga3 AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-accent-gold rounded-xl flex items-center justify-center text-black font-bold text-xl">G</div>
            </div>
            <h2 className="text-3xl font-black font-outfit text-white mb-2">
              {isForgotPassword ? 'Reset Password' : (isSignup ? 'Create your account' : 'Welcome back')}
            </h2>
            <p className="text-slate-500">
              {isForgotPassword ? "Enter your email to receive a reset link" : "Choose your preferred way to access Giga3 AI"}
            </p>
          </div>

          {!isForgotPassword && (
            <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
              {[
                { id: 'email', label: 'Email' },
                { id: 'phone', label: 'Phone' },
                { id: 'google', label: 'Google' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setMethod(t.id as AuthMethod);
                    setOtpSent(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    method === t.id ? 'bg-accent-gold text-black' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="glass rounded-[32px] p-8 border-slate-800 shadow-2xl relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {isForgotPassword ? (
              <div className="space-y-4">
                {!resetEmailSent ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="name@company.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 ring-accent-gold outline-none transition-all"
                      />
                    </div>
                    <button className="w-full bg-accent-gold hover:bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-accent-gold/10 transition-all mt-4">
                      Send Reset Link
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="w-full text-center text-xs text-slate-400 font-bold hover:text-slate-200 mt-2"
                    >
                      Back to Sign In
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-8 text-accent-gold">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-white mb-2">Check your inbox</h3>
                    <p className="text-xs text-slate-500 mb-6">We've sent a password reset link to your email address.</p>
                    <button 
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetEmailSent(false);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {method === 'email' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="name@company.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 ring-accent-gold outline-none transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        {!isSignup && (
                          <button 
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-[10px] font-bold text-accent-gold hover:text-yellow-500"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 ring-accent-gold outline-none transition-all"
                      />
                    </div>
                    <button className="w-full bg-accent-gold hover:bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-accent-gold/10 transition-all mt-6">
                      {isSignup ? 'Create Account' : 'Sign In'}
                    </button>
                  </form>
                )}

                {method === 'phone' && (
                  <div className="space-y-4">
                    {!otpSent ? (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                          <div className="flex gap-2">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-sm text-slate-400 flex items-center gap-2">
                              <span className="text-base">🇬🇭</span> +233
                            </div>
                            <input 
                              type="tel" 
                              placeholder="54 252 4252"
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 ring-accent-gold outline-none"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={handleSendOTP}
                          className="w-full bg-accent-gold hover:bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-accent-gold/10 transition-all"
                        >
                          Send Verification Code
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Verification Code</label>
                          <input 
                            type="text" 
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-xl font-bold tracking-[0.5em] focus:ring-1 ring-accent-gold outline-none"
                          />
                          <p className="text-center text-xs text-slate-500 mt-4">Didn't receive code? <button className="text-accent-gold font-bold">Resend</button></p>
                        </div>
                        <button 
                          onClick={handleSubmit as any}
                          className="w-full bg-accent-gold hover:bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-accent-gold/10 transition-all"
                        >
                          Verify & Continue
                        </button>
                      </>
                    )}
                  </div>
                )}

                {method === 'google' && (
                  <div className="text-center py-6">
                    <button 
                      onClick={handleSubmit as any}
                      className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>
                    <p className="text-xs text-slate-500 mt-8 leading-relaxed">
                      By continuing, you agree to Giga3 AI's <br />
                      <span className="text-slate-400 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 underline cursor-pointer">Privacy Policy</span>.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="text-center">
            <button 
              onClick={() => {
                setIsSignup(!isSignup);
                setIsForgotPassword(false);
              }}
              className="text-sm font-medium text-slate-400 hover:text-accent-gold transition-colors"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
