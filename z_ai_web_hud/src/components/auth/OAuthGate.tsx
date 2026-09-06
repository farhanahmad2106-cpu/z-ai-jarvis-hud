"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, UserPlus, Mail, KeyRound, User, AlertTriangle, ArrowRight, Shield, ArrowLeft } from "lucide-react";

type AuthMode = "login" | "signup";

interface FlashMessage {
  text: string;
  type: "info" | "error" | "success";
}

export function OAuthGate() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // If already authenticated, redirect back to dashboard
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.push("/");
    }
  }, [sessionStatus, router]);

  // Boot log sequence
  useEffect(() => {
    const logs = [
      "> AUTH_SUBSYSTEM v3.2.1 ONLINE",
      "> LOADING PROVIDER MODULES...",
      "> GOOGLE_OAUTH: LINKED",
      "> GITHUB_OAUTH: LINKED",
      "> CREDENTIALS_ENGINE: ACTIVE",
      "> ENCRYPTION: AES-256-GCM",
      "> MULTI-FACTOR AUTH: ENABLED",
      "> AWAITING OPERATOR INPUT...",
    ];
    let i = 0;
    setBootLogs([]);
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLogs((prev) => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Clear flash after timeout
  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
  };

  const switchMode = (newMode: AuthMode, flashMsg?: FlashMessage) => {
    resetForm();
    setMode(newMode);
    if (flashMsg) setFlash(flashMsg);
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("ALL FIELDS REQUIRED");
      return;
    }

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      const errMsg = result.error;
      // NextAuth wraps the error — check for our custom codes
      if (errMsg.includes("NO_USER")) {
        switchMode("signup", {
          text: "OPERATOR NOT FOUND — REGISTRATION REQUIRED",
          type: "info",
        });
      } else if (errMsg.includes("OAUTH_ACCOUNT")) {
        setError("THIS ACCOUNT USES GOOGLE/GITHUB LOGIN");
      } else if (errMsg.includes("WRONG_PASSWORD")) {
        setError("INVALID ACCESS CREDENTIALS");
      } else {
        setError("AUTHENTICATION FAILED");
      }
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("ALL FIELDS REQUIRED");
      return;
    }
    if (password.length < 6) {
      setError("PASSWORD MUST BE ≥ 6 CHARACTERS");
      return;
    }
    if (password !== confirmPassword) {
      setError("PASSWORDS DO NOT MATCH");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "USER_EXISTS") {
          switchMode("login", {
            text: "OPERATOR ALREADY REGISTERED — USE LOGIN PROTOCOL",
            type: "info",
          });
          setLoading(false);
          return;
        }
        setError(data.message?.toUpperCase() || "REGISTRATION FAILED");
        setLoading(false);
        return;
      }

      // Auto-login after successful signup
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (loginResult?.error) {
        setError("ACCOUNT CREATED — MANUAL LOGIN REQUIRED");
        switchMode("login", {
          text: "REGISTRATION SUCCESSFUL — AUTHENTICATE NOW",
          type: "success",
        });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("SYSTEM ERROR — TRY AGAIN");
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setOauthLoading(provider);
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-background overflow-hidden">
      {/* HUD Grid Background */}
      <div className="absolute inset-0 hud-grid-bg opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.06)_0%,transparent_70%)]" />

      {/* Corner Brackets */}
      <div className="fixed top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-cyan/30 pointer-events-none" />
      <div className="fixed top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-cyan/30 pointer-events-none" />
      <div className="fixed bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-cyan/30 pointer-events-none" />
      <div className="fixed bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-cyan/30 pointer-events-none" />

      {/* Boot Log Terminal */}
      <div className="absolute top-8 left-8 w-72 font-mono text-[10px] text-cyan/40 tracking-widest leading-relaxed pointer-events-none text-left z-10 hidden md:flex flex-col gap-0.5">
        <AnimatePresence>
          {bootLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={log.includes("AWAITING") ? "text-cyan/70 font-bold" : ""}
            >
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* System Status (top-right) */}
      <div className="absolute top-8 right-8 text-right pointer-events-none hidden md:block">
        <p className="font-mono text-[10px] text-cyan/40 tracking-widest">AUTH_PROTOCOL: MULTI-FACTOR</p>
        <p className="font-mono text-[10px] text-cyan/40 tracking-widest">PROVIDER_STATUS: ONLINE</p>
        <p className="font-mono text-[10px] text-cyan/30 tracking-widest mt-1">SESSION: AWAITING</p>
      </div>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        {/* Back to Dashboard Link */}
        <div className="mb-3 flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-cyan/70 hover:text-cyan tracking-widest transition-all hover:translate-x-[-2px] group"
          >
            <ArrowLeft size={13} className="text-cyan group-hover:drop-shadow-[0_0_6px_rgba(0,242,255,1)]" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <span className="font-mono text-[9px] text-cyan/40 tracking-widest">[GUEST MODE]</span>
        </div>

        {/* Card Header with animated border */}
        <div className="oauth-card relative">
          {/* Animated top accent line */}
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, #00f2ff, #568dff, #00f2ff, transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="p-8 pt-10">
            {/* ZAYD Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield size={24} className="text-cyan drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
              <h1 className="font-sans font-black text-2xl tracking-[0.3em] text-cyan glow-cyan">
                ZAYD
              </h1>
            </div>
            <p className="text-center font-mono text-[10px] text-foreground/40 tracking-[0.25em] mb-8">
              SECURE_ACCESS_TERMINAL
            </p>

            {/* Mode Tabs */}
            <div className="flex mb-8 border border-outline/40 overflow-hidden chamfer-card-sm">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                  mode === "login"
                    ? "bg-cyan/15 text-cyan border-r border-cyan/30 shadow-[inset_0_0_20px_rgba(0,242,255,0.1)]"
                    : "bg-transparent text-foreground/40 border-r border-outline/30 hover:text-foreground/60 hover:bg-surface-container/50"
                }`}
              >
                <Lock size={12} />
                LOGIN
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                  mode === "signup"
                    ? "bg-cyan/15 text-cyan shadow-[inset_0_0_20px_rgba(0,242,255,0.1)]"
                    : "bg-transparent text-foreground/40 hover:text-foreground/60 hover:bg-surface-container/50"
                }`}
              >
                <UserPlus size={12} />
                SIGNUP
              </button>
            </div>

            {/* Flash Message */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={`mb-6 p-3 chamfer-card-sm font-mono text-[10px] tracking-widest text-center ${
                    flash.type === "info"
                      ? "bg-cyan/10 border border-cyan/30 text-cyan"
                      : flash.type === "success"
                      ? "bg-green-500/10 border border-green-500/30 text-green-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {flash.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-3 chamfer-card-sm bg-error/10 border border-error/40 flex items-center gap-2 font-mono text-[10px] tracking-widest text-error"
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={mode === "login" ? handleCredentialLogin : handleSignup}>
                  <div className="space-y-4">
                    {/* Name field (signup only) */}
                    {mode === "signup" && (
                      <div className="relative">
                        <label className="block font-mono text-[9px] text-foreground/40 tracking-[0.2em] uppercase mb-1.5">
                          OPERATOR_NAME
                        </label>
                        <div className="auth-input-wrapper">
                          <User size={14} className="auth-input-icon" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            placeholder="Enter name..."
                            className="auth-input"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div className="relative">
                      <label className="block font-mono text-[9px] text-foreground/40 tracking-[0.2em] uppercase mb-1.5">
                        EMAIL_ADDRESS
                      </label>
                      <div className="auth-input-wrapper">
                        <Mail size={14} className="auth-input-icon" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(""); }}
                          placeholder="operator@zayd.sys"
                          className="auth-input"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <label className="block font-mono text-[9px] text-foreground/40 tracking-[0.2em] uppercase mb-1.5">
                        ACCESS_KEY
                      </label>
                      <div className="auth-input-wrapper">
                        <KeyRound size={14} className="auth-input-icon" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(""); }}
                          placeholder="••••••••"
                          className="auth-input"
                        />
                      </div>
                    </div>

                    {/* Confirm Password (signup only) */}
                    {mode === "signup" && (
                      <div className="relative">
                        <label className="block font-mono text-[9px] text-foreground/40 tracking-[0.2em] uppercase mb-1.5">
                          CONFIRM_ACCESS_KEY
                        </label>
                        <div className="auth-input-wrapper">
                          <KeyRound size={14} className="auth-input-icon" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                            placeholder="••••••••"
                            className="auth-input"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 chamfer-btn light-pipe-cyan bg-cyan/10 font-mono text-[11px] text-cyan tracking-[0.2em] uppercase hover:bg-cyan/20 hover:shadow-[0_0_25px_rgba(0,242,255,0.3)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-cyan/30 border-t-cyan rounded-full"
                      />
                    ) : (
                      <>
                        {mode === "login" ? (
                          <>
                            <Lock size={13} />
                            AUTHENTICATE
                          </>
                        ) : (
                          <>
                            <UserPlus size={13} />
                            CREATE_OPERATOR
                          </>
                        )}
                        <ArrowRight size={13} className="ml-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="auth-divider my-6">
                  <span>OR</span>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  {/* Google */}
                  <button
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={!!oauthLoading}
                    className="oauth-btn-provider group w-full"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {oauthLoading === "google" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/60 rounded-full"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span className="font-mono text-[11px] tracking-[0.15em] text-foreground/70 group-hover:text-foreground/90 transition-colors">
                        CONTINUE WITH GOOGLE
                      </span>
                    </div>
                  </button>

                  {/* GitHub */}
                  <button
                    onClick={() => handleOAuthSignIn("github")}
                    disabled={!!oauthLoading}
                    className="oauth-btn-provider group w-full"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {oauthLoading === "github" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/60 rounded-full"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-foreground/70" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      <span className="font-mono text-[11px] tracking-[0.15em] text-foreground/70 group-hover:text-foreground/90 transition-colors">
                        CONTINUE WITH GITHUB
                      </span>
                    </div>
                  </button>
                </div>

                {/* Mode switch text */}
                <p className="text-center mt-6 font-mono text-[10px] text-foreground/30 tracking-widest">
                  {mode === "login" ? (
                    <>
                      NEW OPERATOR?{" "}
                      <button
                        onClick={() => switchMode("signup")}
                        className="text-cyan/60 hover:text-cyan transition-colors underline underline-offset-2"
                      >
                        CREATE_ACCOUNT
                      </button>
                    </>
                  ) : (
                    <>
                      EXISTING OPERATOR?{" "}
                      <button
                        onClick={() => switchMode("login")}
                        className="text-cyan/60 hover:text-cyan transition-colors underline underline-offset-2"
                      >
                        LOGIN_PROTOCOL
                      </button>
                    </>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 w-full px-8 h-10 flex justify-between items-center text-foreground/20 font-mono text-[9px] tracking-widest pointer-events-none">
        <span>MOD_AUTH: SEC_GATE_001</span>
        <span>ENCRYPTED_CHANNEL: ACTIVE</span>
      </div>
    </div>
  );
}
