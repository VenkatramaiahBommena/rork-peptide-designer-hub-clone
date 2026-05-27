import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  TrendingUp,
  FlaskConical,
  Dna,
  Clock,
  Star,
  FileDown,
  Trash2,
  LogOut,
  Activity,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  THERAPEUTIC_TARGETS,
  peptidesToCSV,
  type GeneratedPeptide,
} from "@/lib/peptide-engine";

interface ActivityEntry {
  date: string;
  count: number;
  target: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [savedPeptides, setSavedPeptides] = useState<GeneratedPeptide[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Load simulated data
    const stored = sessionStorage.getItem("peptiforge-results");
    if (stored) {
      try {
        const all = JSON.parse(stored) as GeneratedPeptide[];
        setSavedPeptides(all.slice(0, 8));
      } catch {}
    }

    // Simulated activity
    const days = 14;
    const activityEntries: ActivityEntry[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      if (Math.random() > 0.4) {
        activityEntries.push({
          date,
          count: Math.floor(Math.random() * 15) + 1,
          target: THERAPEUTIC_TARGETS[Math.floor(Math.random() * THERAPEUTIC_TARGETS.length)].id,
        });
      }
    }
    setActivity(activityEntries.reverse());
  }, [user, navigate]);

  const stats = useMemo(() => {
    const totalGenerations = activity.reduce((s, e) => s + e.count, 0);
    const targetCounts: Record<string, number> = {};
    for (const e of activity) {
      targetCounts[e.target] = (targetCounts[e.target] || 0) + e.count;
    }
    let favoriteTarget = "none";
    let maxCount = 0;
    for (const [t, c] of Object.entries(targetCounts)) {
      if (c > maxCount) { maxCount = c; favoriteTarget = t; }
    }
    const favoriteName = THERAPEUTIC_TARGETS.find((t) => t.id === favoriteTarget)?.name || favoriteTarget;

    return {
      totalGenerations,
      totalSaved: savedPeptides.length,
      activeDays: activity.length,
      favoriteTarget: favoriteName,
      avgDockingScore: savedPeptides.length
        ? (savedPeptides.reduce((s, p) => s + p.dockingScore, 0) / savedPeptides.length).toFixed(1)
        : "—",
    };
  }, [activity, savedPeptides]);

  const handleExportSavedCSV = () => {
    if (savedPeptides.length === 0) return;
    const csv = peptidesToCSV(savedPeptides);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peptiforge-saved-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  const targetName = (id: string) => THERAPEUTIC_TARGETS.find((t) => t.id === id)?.name || id;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4aa] to-[#00b8d9] flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-[#0a0f1e]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold">{user.name || "Researcher"}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-[#00d4aa]/30 text-[#00d4aa] text-xs">
                    <FlaskConical className="w-3 h-3 mr-1" />
                    {stats.totalGenerations} Generations
                  </Badge>
                  <Badge variant="outline" className="border-[#00b8d9]/30 text-[#00b8d9] text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    {stats.totalSaved} Saved
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={signOut}
                className="border-red-400/30 text-red-400 hover:bg-red-400/10 shrink-0"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Generations", value: stats.totalGenerations, icon: FlaskConical, color: "#00d4aa" },
            { label: "Saved Peptides", value: stats.totalSaved, icon: Dna, color: "#00b8d9" },
            { label: "Active Days", value: stats.activeDays, icon: Clock, color: "#7c5ce7" },
            { label: "Avg Docking Score", value: stats.avgDockingScore, icon: TrendingUp, color: "#f59e0b" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Favorite target card */}
        <Card className="glass-card mb-8">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Favorite Target</p>
              <p className="font-semibold">{stats.favoriteTarget}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00d4aa]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="py-8 text-center">
                  <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No activity yet</p>
                  <Button
                    variant="link"
                    className="text-[#00d4aa] mt-2"
                    onClick={() => navigate("/generator")}
                  >
                    Go to Generator <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Max bar value */}
                  {(() => {
                    const maxCount = Math.max(...activity.map((a) => a.count), 1);
                    return activity.slice(-10).map((entry, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">
                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <div className="flex-1 h-6 relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(entry.count / maxCount) * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.03 }}
                            className="absolute inset-y-0 left-0 rounded-r-md bg-gradient-to-r from-[#00d4aa]/60 to-[#00d4aa]/30"
                          />
                          <span className="absolute inset-y-0 right-0 flex items-center text-xs font-mono text-muted-foreground pr-1">
                            {entry.count}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                          {targetName(entry.target)}
                        </Badge>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Peptides */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-[#00b8d9]" />
                  Saved Peptides
                </span>
                {savedPeptides.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={handleExportSavedCSV} className="text-muted-foreground hover:text-[#00d4aa]">
                    <FileDown className="w-4 h-4 mr-1.5" />
                    Export CSV
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedPeptides.length === 0 ? (
                <div className="py-8 text-center">
                  <Dna className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No saved peptides</p>
                  <Button
                    variant="link"
                    className="text-[#00d4aa] mt-2"
                    onClick={() => navigate("/results")}
                  >
                    View Results <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                  {savedPeptides.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-[#00d4aa] truncate max-w-[200px]">
                          {p.sequence.slice(0, 35)}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{p.length}aa</Badge>
                          <span className="text-xs text-muted-foreground">{targetName(p.targetId)}</span>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-[#00b8d9] shrink-0 ml-3">
                        {p.dockingScore.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
