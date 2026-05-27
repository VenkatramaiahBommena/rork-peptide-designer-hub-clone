import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { BRAND } from "@/lib/brand";
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  LogIn,
  LogOut,
  CreditCard,
  Crown,
  Lock,
  Eye,
  Search,
  Trash2,
} from "lucide-react";

const ADMIN_KEY = "dvks:admin_session";

export default function Admin() {
  const { events, subscribedEmails, refreshEvents, logEvent } = useSubscription();
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) === "1") {
      setAuthed(true);
      refreshEvents();
    }
  }, [refreshEvents]);

  const stats = useMemo(() => {
    const errs = events.filter((e) => e.type === "error").length;
    const logins = events.filter((e) => e.type === "login").length;
    const payments = events.filter((e) => e.type === "payment_success" || e.type === "subscribe").length;
    return { errs, logins, payments, subs: subscribedEmails.length };
  }, [events, subscribedEmails]);

  const filtered = useMemo(() => {
    let list = events;
    if (filter !== "all") list = list.filter((e) => e.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          (e.email ?? "").toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q),
      );
    }
    return list;
  }, [events, filter, query]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.trim().toLowerCase() === BRAND.admin.username && password === BRAND.admin.password) {
      localStorage.setItem(ADMIN_KEY, "1");
      setAuthed(true);
      refreshEvents();
      logEvent("login", "Admin signed in", BRAND.admin.username);
    } else {
      setError("Invalid admin credentials");
      logEvent("error", `Failed admin login attempt for ${username}`, null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
    logEvent("logout", "Admin signed out", BRAND.admin.username);
  };

  const clearLogs = () => {
    if (!confirm("Clear all activity logs? This cannot be undone.")) return;
    localStorage.setItem("dvks:activity_events", "[]");
    refreshEvents();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-500/30 to-amber-500/20 border border-red-500/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-red-300" />
            </div>
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <p className="text-muted-foreground text-sm">{BRAND.company}</p>
          </div>

          <Card className="glass-card">
            <CardContent className="p-6">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="admin-user" className="text-sm">Admin Username</Label>
                  <Input
                    id="admin-user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={BRAND.admin.username}
                    className="mt-1.5 bg-muted/30"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admin-pass" className="text-sm">Password</Label>
                  <Input
                    id="admin-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 bg-muted/30"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-red-500 to-amber-500 text-white font-semibold">
                  <Lock className="w-4 h-4 mr-2" />
                  Authenticate
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  Default credentials → <span className="font-mono text-foreground">{BRAND.admin.username}</span> / <span className="font-mono text-foreground">{BRAND.admin.password}</span>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const typeIcon = (t: string) => {
    switch (t) {
      case "login": return <LogIn className="w-4 h-4 text-emerald-400" />;
      case "logout": return <LogOut className="w-4 h-4 text-amber-300" />;
      case "signup": return <Users className="w-4 h-4 text-sky-400" />;
      case "payment_success":
      case "subscribe": return <CreditCard className="w-4 h-4 text-[#00d4aa]" />;
      case "payment_failed":
      case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "page_view": return <Eye className="w-4 h-4 text-muted-foreground" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-300 mb-1">
              <Shield className="w-3.5 h-3.5" />
              ADMIN
            </div>
            <h1 className="text-3xl font-bold">{BRAND.company} — Owner Console</h1>
            <p className="text-muted-foreground text-sm">Activity, payments, logins & errors</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear Logs
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" /> Log Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Subscribers", value: stats.subs, icon: Crown, color: "#00d4aa" },
            { label: "Logins", value: stats.logins, icon: LogIn, color: "#22c55e" },
            { label: "Payments", value: stats.payments, icon: CreditCard, color: "#7c5ce7" },
            { label: "Errors", value: stats.errs, icon: AlertTriangle, color: "#ef4444" },
          ].map((s) => (
            <Card key={s.label} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-2xl font-bold mt-1">{s.value}</div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}20` }}
                  >
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <h2 className="font-bold flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#00d4aa]" />
                Subscribed Users ({subscribedEmails.length})
              </h2>
            </div>
            {subscribedEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscribers yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subscribedEmails.map((em) => (
                  <Badge key={em} className="bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/30">
                    {em}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00d4aa]" />
                Activity Log ({filtered.length})
              </h2>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-8 h-9 w-56 bg-muted/30"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-9 px-3 rounded-md bg-muted/30 border border-border text-sm"
                >
                  <option value="all">All</option>
                  <option value="login">Logins</option>
                  <option value="signup">Signups</option>
                  <option value="subscribe">Subscriptions</option>
                  <option value="payment_success">Payments</option>
                  <option value="payment_failed">Payment failures</option>
                  <option value="error">Errors</option>
                  <option value="page_view">Page views</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No matching events.</p>
              ) : (
                filtered.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <div className="mt-0.5">{typeIcon(e.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="text-sm font-medium">{e.message}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {new Date(e.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                          {e.type}
                        </Badge>
                        {e.email && <span className="font-mono">{e.email}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
