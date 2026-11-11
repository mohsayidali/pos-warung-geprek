import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';
import { supabase } from './supabase';

export default function Login({ onLoginSuccess, isDark, storeName, logoPic }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Email atau Password salah!' : error.message);
      setLoading(false);
    } else {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className={`w-full max-w-md p-8 rounded-[2rem] border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logoPic} alt="Logo" className="w-20 h-20 rounded-3xl object-cover border-4 border-orange-500 shadow-lg shadow-orange-500/30 mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
            {storeName || 'Warung Cobek Geprek'}
          </h1>
          <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-wider">Akses POS Kasir & Dapur Realtime</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Email Akun Warung</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 opacity-50 text-orange-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@geprek.com"
                className={`w-full pl-12 pr-4 py-3.5 text-sm font-bold rounded-2xl border outline-none transition-all ${isDark ? 'bg-zinc-950 border-zinc-800 focus:border-orange-500' : 'bg-slate-50 border-slate-300 focus:border-orange-500'}`}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 opacity-50 text-orange-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-12 pr-4 py-3.5 text-sm font-bold rounded-2xl border outline-none transition-all ${isDark ? 'bg-zinc-950 border-zinc-800 focus:border-orange-500' : 'bg-slate-50 border-slate-300 focus:border-orange-500'}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 rounded-2xl font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? 'Memproses...' : 'Masuk Aplikasi'}
          </button>
        </form>
      </div>
    </div>
  );
}