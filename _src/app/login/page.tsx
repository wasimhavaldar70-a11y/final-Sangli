'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogIn, Loader2, Sparkles } from 'lucide-react';

function LoginConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  useEffect(() => {
    // Check if already logged in and redirect
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Double check admin role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push(redirectTo);
        }
      }
    };
    checkUser();
  }, [router, redirectTo, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Verify user role is admin
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          // Sign out since not an admin
          await supabase.auth.signOut();
          throw new Error('Access denied. Admin privileges required.');
        }

        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#09090b] px-4 overflow-hidden">
      {/* Decorative luxury gradient background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c5a880]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#a87c53]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#121214] border border-[#27272a] text-[#c5a880] mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Sangli Ceramica
          </h1>
          <p className="mt-2 text-sm text-[#a1a1aa]">
            Control Center & Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-8 border border-[#27272a]/50 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#c5a880] to-transparent" />
          
          <h2 className="text-xl font-medium text-white mb-6">Administrator Sign In</h2>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/45 border border-red-800/50 text-red-200 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] transition-colors text-sm"
                placeholder="admin@sangliceramica.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder-[#71717a] focus:outline-none focus:border-[#c5a880] transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#c5a880] to-[#b5956a] hover:from-[#d4b58b] hover:to-[#c5a880] text-black font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-sm shadow-lg shadow-[#c5a880]/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-[#a1a1aa] hover:text-[#c5a880] transition-colors">
            ← Return to Showroom Home Page
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#c5a880] animate-spin" />
      </div>
    }>
      <LoginConsole />
    </Suspense>
  );
}
