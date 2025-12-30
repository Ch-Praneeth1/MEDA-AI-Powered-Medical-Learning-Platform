'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Activity } from 'lucide-react';

export default function LoginPage() {
  // const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-blue-800/10 animate-pulse" style={{animationDuration: '8s'}}></div>
      <div className="hidden lg:flex flex-1 flex-col justify-center items-start px-24 relative z-10">
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <Activity className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-cyan-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif ml-4 sm:ml-6">MEDA</h1>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-100 font-serif max-w-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">M</span>edical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">E</span>nlightened <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">D</span>igital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">A</span>ssistant
          </p>
          
          <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Your intelligent medical research companion, designed to streamline your workflow and enhance your healthcare practice.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 lg:p-8 py-2 sm:py-4 lg:py-8 overflow-y-auto min-h-0 max-h-screen relative z-10">
        <div className="lg:hidden w-full max-w-md mb-2 sm:mb-3 lg:mb-4 shrink-0">
          <div className="text-center mb-2 sm:mb-3">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Activity className="text-2xl sm:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-serif ml-2 sm:ml-3">MEDA</h1>
            </div>
            <p className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-serif">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">M</span>edical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">E</span>nlightened <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">D</span>igital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">A</span>ssistant
            </p>
          </div>
        </div>

        <div className="w-full max-w-md shrink-0">
          <div className="w-full max-w-lg p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-blue-500/30">
            <div className="text-center">
              <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4">
                <div className="relative">
                  <div className="relative">
                    <Activity className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-cyan-400" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 blur-xl opacity-50"></div>
                  </div>
                </div>
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">Welcome back</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-400">Sign in to your account</p>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 hover:border-blue-400/50"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 hover:border-blue-400/50"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 disabled:from-blue-600/50 disabled:to-blue-600/50 text-white rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-cyan-500/50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>

              <p className="text-center text-gray-400 text-xs sm:text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all font-medium">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
