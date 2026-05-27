import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { BRAND } from "@/lib/brand";
import {
  Dna,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { user, isLoading, isSigningIn, error, signIn, register, signInWithGoogle, clearError } = useAuth();
  const { logEvent, isSubscribed } = useSubscription();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [gmail, setGmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  // Redirect if already logged in
  if (user && !isLoading) {
    navigate(isSubscribed(user.email) ? "/profile" : "/subscribe", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await signIn(email, password);
    } else {
      await register(email, password, name);
    }
    const token = localStorage.getItem("rork:access_token");
    if (token) {
      logEvent(mode === "login" ? "login" : "signup", `${mode === "login" ? "Signed in" : "Registered"} as ${email}`, email);
      navigate("/subscribe");
    }
  };

  const handleGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithGoogle(gmail, googleName);
      logEvent("login", `Google sign-in: ${gmail}`, gmail, { provider: "google" });
      navigate("/subscribe");
    } catch {
      logEvent("error", `Google sign-in failed for ${gmail}`, gmail);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    clearError();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00d4aa]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#7c5ce7]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#00b8d9] flex items-center justify-center">
              <Dna className="w-6 h-6 text-[#0a0f1e]" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login"
              ? "Sign in to access your peptide library"
              : "Start designing therapeutic peptides today"}
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground mb-3">{BRAND.company}</div>
        <Card className="glass-card">
          <CardContent className="p-6">
            {/* Google Sign-in */}
            {!showGoogle ? (
              <Button
                type="button"
                onClick={() => { setShowGoogle(true); clearError(); }}
                variant="outline"
                className="w-full h-11 bg-white hover:bg-white/90 text-[#1f1f1f] border-white/20 font-medium mb-4"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4C16.3 4 9.6 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5c-.5.4 6.9-5 6.9-15.2c0-1.3-.1-2.4-.4-3.5z"/>
                </svg>
                Continue with Google
              </Button>
            ) : (
              <form onSubmit={handleGoogle} className="space-y-3 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4C16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5c-.5.4 6.9-5 6.9-15.2c0-1.3-.1-2.4-.4-3.5z"/>
                  </svg>
                  <span className="text-sm font-medium">Sign in with your Google account</span>
                </div>
                <Input
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Full name (optional)"
                  className="bg-muted/30"
                />
                <Input
                  type="email"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="bg-muted/30"
                  required
                />
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowGoogle(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSigningIn} size="sm" className="flex-1 bg-[#4285F4] hover:bg-[#3b78e0] text-white">
                    {isSigningIn ? "Signing in..." : "Continue"}
                  </Button>
                </div>
              </form>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">or with email</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Venkatramaiah Bommena"
                      className="pl-10 bg-muted/30 border-border"
                      required={mode === "register"}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 bg-muted/30 border-border"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-muted/30 border-border"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSigningIn}
                className="w-full h-11 bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold hover:opacity-90"
              >
                {isSigningIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0f1e]/30 border-t-[#0a0f1e] rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login" ? (
                      <><LogIn className="w-4 h-4" /> Sign In</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Create Account</>
                    )}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={switchMode}
                className="text-sm text-muted-foreground hover:text-[#00d4aa] transition-colors"
              >
                {mode === "login"
                  ? "Don't have an account? Register"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
