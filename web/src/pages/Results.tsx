import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dna,
  FileDown,
  Trash2,
  Heart,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  Star,
  TrendingUp,
  ShieldCheck,
  Activity,
  Droplets,
} from "lucide-react";
import {
  generatePeptides,
  THERAPEUTIC_TARGETS,
  peptidesToCSV,
  getAAColor,
  type GeneratedPeptide,
  type ScoringParams,
} from "@/lib/peptide-engine";
import { toast } from "sonner";

type SortKey = keyof GeneratedPeptide;
type SortDir = "asc" | "desc";

export default function Results() {
  const [peptides, setPeptides] = useState<GeneratedPeptide[]>(() => {
    // Try to load from session storage
    try {
      const stored = sessionStorage.getItem("peptiforge-results");
      if (stored) return JSON.parse(stored) as GeneratedPeptide[];
    } catch {}
    return [];
  });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("dockingScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [filterTarget, setFilterTarget] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generate demo data if empty
  const hasData = peptides.length > 0;

  const handleGenerateDemo = () => {
    const targets = THERAPEUTIC_TARGETS.map((t) => t.id);
    const allPeptides: GeneratedPeptide[] = [];
    const params: ScoringParams = {
      bindingAffinity: 70,
      stability: 65,
      specificity: 60,
      solubility: 55,
      membranePermeability: 50,
    };
    for (const targetId of targets) {
      const ps = generatePeptides(targetId, params, ["dA", "Aib", "Orn", "Sta"], 3, 8, 16);
      allPeptides.push(...ps);
    }
    setPeptides(allPeptides);
    sessionStorage.setItem("peptiforge-results", JSON.stringify(allPeptides));
    toast.success(`Loaded ${allPeptides.length} peptides from all targets`);
  };

  const filtered = useMemo(() => {
    let result = [...peptides];
    if (filterTarget !== "all") {
      result = result.filter((p) => p.targetId === filterTarget);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.sequence.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.targetId.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === "number" && typeof bVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [peptides, sortKey, sortDir, search, filterTarget]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleExportCSV = () => {
    const csv = peptidesToCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peptiforge-sequences-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const handleSave = (peptide: GeneratedPeptide) => {
    setSavedIds((prev) => new Set([...prev, peptide.id]));
    toast.success("Peptide saved to collection");
  };

  const handleDelete = (id: string) => {
    setPeptides((prev) => prev.filter((p) => p.id !== id));
    sessionStorage.setItem("peptiforge-results", JSON.stringify(peptides.filter((p) => p.id !== id)));
    toast.success("Peptide removed");
  };

  const targetName = (id: string) => THERAPEUTIC_TARGETS.find((t) => t.id === id)?.name || id;

  const ScoreBar = ({ value, color }: { value: number; color: string }) => (
    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden w-full">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/15 flex items-center justify-center">
                <Dna className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <h1 className="text-3xl font-bold">Results</h1>
            </div>
            <p className="text-muted-foreground">
              {filtered.length} peptide{filtered.length !== 1 ? "s" : ""} · Sort and analyze your generated sequences.
            </p>
          </div>
          <div className="flex gap-2">
            {!hasData && (
              <Button onClick={handleGenerateDemo} className="bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold">
                <Dna className="w-4 h-4 mr-2" />
                Load Demo Data
              </Button>
            )}
            {hasData && (
              <Button onClick={handleExportCSV} variant="outline" className="border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10">
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {!hasData ? (
          <Card className="glass-card p-12 text-center">
            <Dna className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Generate peptide sequences from the Generator page, or load demo data to explore the results view.
            </p>
            <Button onClick={handleGenerateDemo} className="bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e]">
              Load Demo Data
            </Button>
          </Card>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sequences..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/30 border-border"
                />
              </div>
              <Select value={filterTarget} onValueChange={setFilterTarget}>
                <SelectTrigger className="w-full sm:w-48 bg-muted/30 border-border">
                  <SelectValue placeholder="All targets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Targets</SelectItem>
                  {THERAPEUTIC_TARGETS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortKey} onValueChange={(v) => handleSort(v as SortKey)}>
                <SelectTrigger className="w-full sm:w-44 bg-muted/30 border-border">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dockingScore">Docking Score</SelectItem>
                  <SelectItem value="bindingAffinity">Binding Affinity</SelectItem>
                  <SelectItem value="stability">Stability</SelectItem>
                  <SelectItem value="length">Length</SelectItem>
                  <SelectItem value="unnaturalCount">Unnatural AA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Peptide Cards */}
            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((peptide, index) => (
                  <motion.div
                    key={peptide.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="glass-card hover:border-[#00d4aa]/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Sequence info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#00d4aa]/15 text-[#00d4aa] border-0 font-mono text-xs">
                                {peptide.id}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {targetName(peptide.targetId)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {peptide.length} aa
                              </Badge>
                              {peptide.unnaturalCount > 0 && (
                                <Badge variant="outline" className="text-xs border-[#ef4444]/30 text-[#ef4444]">
                                  {peptide.unnaturalCount} uAA
                                </Badge>
                              )}
                            </div>
                            <div className="font-mono text-sm tracking-wider leading-relaxed break-all">
                              {peptide.sequence.split("-").map((aa, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-0.5 rounded"
                                  style={{ color: getAAColor(aa) }}
                                  title={aa}
                                >
                                  {aa}
                                  {i < peptide.sequence.split("-").length - 1 && (
                                    <span className="text-muted-foreground/30">-</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Docking Score */}
                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[#00b8d9]">{peptide.dockingScore.toFixed(1)}</div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => setExpandedId(expandedId === peptide.id ? null : peptide.id)}
                                className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
                              >
                                {expandedId === peptide.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSave(peptide)}
                              className={savedIds.has(peptide.id) ? "text-[#f59e0b]" : "text-muted-foreground hover:text-[#f59e0b]"}
                            >
                              <Star className="w-4 h-4" fill={savedIds.has(peptide.id) ? "#f59e0b" : "none"} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(peptide.id)}
                              className="text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded score details */}
                        <AnimatePresence>
                          {expandedId === peptide.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                                {[
                                  { label: "Binding Affinity", value: peptide.bindingAffinity, color: "#00d4aa", icon: TrendingUp },
                                  { label: "Stability", value: peptide.stability, color: "#00b8d9", icon: ShieldCheck },
                                  { label: "Specificity", value: peptide.specificity, color: "#7c5ce7", icon: Activity },
                                  { label: "Solubility", value: peptide.solubility, color: "#f59e0b", icon: Droplets },
                                  { label: "Membrane Permeability", value: peptide.membranePermeability, color: "#ef4444", icon: TrendingUp },
                                ].map((s) => (
                                  <div key={s.label} className="flex items-center gap-3">
                                    <s.icon className="w-3.5 h-3.5 shrink-0" style={{ color: s.color }} />
                                    <span className="text-xs text-muted-foreground w-36">{s.label}</span>
                                    <div className="flex-1">
                                      <ScoreBar value={s.value} color={s.color} />
                                    </div>
                                    <span className="text-xs font-mono font-medium w-8 text-right">{s.value.toFixed(0)}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
