import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldAlert, Flame } from 'lucide-react';
import { supabase } from './supabase';
import { isImageSource } from './utils/formatters';

function LoginLogo({ logoPic, storeName }) {
  const [logoError, setLogoError] = useState(false);

  if (isImageSource(logoPic) && !logoError) {
    return (
      <img
        src={logoPic}
        alt={storeName || 'Logo Warung'}
        referrerPolicy="no-referrer"
        onError={() => setLogoError(true)}
        className="w-full h-full rounded-full object-cover bg-white dark:bg-zinc-900"
      />
    );
  }

  return (
    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-[var(--accent-text)]">
      <Flame size={32} />
    </div>
  );
}

export default function Login({ onLoginSuccess, storeName, logoPic }) {
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
      password,
    });

    if (error) {
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? 'Email atau Password salah!'
          : error.message
      );
      setLoading(false);
    } else {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-7 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full p-1 bg-[var(--accent)] shadow-lg mb-4 flex items-center justify-center">
            <LoginLogo key={logoPic} logoPic={logoPic} storeName={storeName} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            {storeName || 'Warung Cobek Geprek'}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Masuk ke Sistem Kasir &amp; Struk Otomatis
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
            <ShieldAlert size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
              Email Akun Warung
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@geprek.com"
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <LogIn size={16} />
            <span>{loading ? 'Memproses...' : 'Masuk Aplikasi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}