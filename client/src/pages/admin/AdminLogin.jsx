import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Mail, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { storeSettings } = useCart();
  
  const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(username, password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg(data.message);
        setView('reset');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp, newPassword }),
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg('Password reset successfully. You can now login.');
        setView('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to reset password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            {view === 'login' ? <Lock className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-black text-white">
            {view === 'login' ? 'Admin Management Portal' : view === 'forgot' ? 'Reset Password' : 'Enter OTP'}
          </h1>
          <p className="text-xs text-slate-400">
            {view === 'login' 
              ? `Secure access for ${storeSettings?.shopName || 'Public Store'}` 
              : view === 'forgot' 
              ? 'Enter your Email ID to receive an OTP'
              : 'Enter the OTP sent to your Email ID and your new password'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Email ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-300 font-semibold">Password</label>
                <button type="button" onClick={() => setView('forgot')} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Email ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center pt-2">
              <button type="button" onClick={() => setView('login')} className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Enter OTP</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center pt-2">
              <button type="button" onClick={() => setView('login')} className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {view === 'login' && (
          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
              ← Return to Customer Storefront
            </Link>
          </div>
        )}

        {/* Powered by ASMI TECH */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 font-medium">Powered by</span>
          <div className="inline-flex items-center bg-white px-2 py-0.5 rounded shadow-sm hover:opacity-95 transition-opacity" title="ASMI TECH - Ideas | Technology | Growth">
            <img src="/asmi-tech-logo.png" alt="ASMI TECH" className="h-4 w-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
