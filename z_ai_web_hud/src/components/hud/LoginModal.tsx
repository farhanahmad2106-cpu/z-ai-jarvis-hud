"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-black/80 border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
        {/* HUD Scanning Line Effect */}
        <div className="absolute inset-0 pointer-events-none border-t border-emerald-500/50 opacity-20 animate-[scan_3s_ease-in-out_infinite]" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-bold text-emerald-400 font-jetbrains-mono tracking-widest uppercase">
            System Access
          </h2>
          <p className="text-emerald-500/60 text-sm mt-2 font-jetbrains-mono">
            Awaiting operator authentication...
          </p>
        </div>

        <form onSubmit={handleCredentialsLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs text-emerald-500/70 uppercase tracking-wider mb-1 font-jetbrains-mono">
              Operator ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-emerald-950/20 border border-emerald-500/30 rounded-lg px-4 py-2 text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 font-jetbrains-mono transition-all"
              placeholder="user@jarvis.local"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-emerald-500/70 uppercase tracking-wider mb-1 font-jetbrains-mono">
              Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-emerald-950/20 border border-emerald-500/30 rounded-lg px-4 py-2 text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 font-jetbrains-mono transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 hover:border-emerald-400 rounded-lg text-emerald-400 font-bold tracking-widest uppercase transition-all duration-300 font-jetbrains-mono"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between relative z-10">
          <div className="h-px bg-emerald-500/20 flex-1" />
          <span className="px-4 text-xs text-emerald-500/50 uppercase tracking-widest font-jetbrains-mono">
            Or Bypass
          </span>
          <div className="h-px bg-emerald-500/20 flex-1" />
        </div>

        <div className="mt-6 space-y-3 relative z-10">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full py-2.5 bg-black/50 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/5 rounded-lg text-emerald-300/80 hover:text-emerald-300 flex items-center justify-center gap-3 transition-all duration-300 font-jetbrains-mono text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Identity
          </button>
          
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full py-2.5 bg-black/50 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/5 rounded-lg text-emerald-300/80 hover:text-emerald-300 flex items-center justify-center gap-3 transition-all duration-300 font-jetbrains-mono text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            GitHub uplink
          </button>
        </div>
      </div>
    </div>
  );
}
