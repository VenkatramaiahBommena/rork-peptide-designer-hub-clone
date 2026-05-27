import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  FlaskConical,
  Zap,
  TrendingUp,
  ShieldCheck,
  Droplets,
  Activity,
  ChevronRight,
  Info,
  X,
  Check,
} from "lucide-react";
import {
  THERAPEUTIC_TARGETS,
  UNNATURAL_AA,
  generatePeptides,
  type ScoringParams,
  type GeneratedPeptide,
  type UnnaturalAA,
} from "@/lib/peptide-engine";
import { toast } from "sonner";

const scoringParams: { key: keyof ScoringParams; label: string; icon: typeof Zap; desc: string; color: string }[] = [
  { key: "bindingAffinity", label: "Binding Affinity", icon: TrendingUp, desc: "Strength of peptide-target interaction", color: "#00d4aa" },
  { key: "stability", label: "Stability", icon: ShieldCheck, desc: "Conformational and thermal stability", color: "#00b8d9" },
  { key: "specificity", label: "Specificity", icon: Activity, desc: "Selectivity for target over off-target binding", color: "#7c5ce7" },
  { key: "solubility", label: "Solubility", icon: Droplets, desc: "Aqueous solubility for formulation", color: "#f59e0b" },
  { key: "membranePermeability", label: "Membrane Permeability", icon: TrendingUp, desc: "Cell membrane penetration capability", color: "#ef4444" },
];

const unnaturalCategories: { label: string; type: UnnaturalAA["syntheticType"]; color: string }[] = [
  { label: "D-Amino Acids", type: "D-amino", color: "#ef4444" },
  { label: "Beta Amino Acids", type: "beta", color: "#f59e0b" },
  { label: "Peptoids", type: "peptoid", color: "#00b8d9" },
  { label: "Stapled", type: "stapled", color: "#7c5ce7" },
  { label: "Cyclic", type: "cyclic", color: "#00d4aa" },
];

export default function Generator() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<string>("diabetic");
  const [params, setParams] = useState<ScoringParams>({
    bindingAffinity: 70,
    stability: 65,
    specificity: 60,
    solubility: 55,
    membranePermeability: 50,
  });
  const [unnaturalSelections, setUnnaturalSelections] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [minLength, setMinLength] = useState(8);
  const [maxLength, setMaxLength] = useState(18);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedPeptide[] | null>(null);

  const targetInfo = THERAPEUTIC_TARGETS.find((t) => t.id === selectedTarget);

  const toggleUnnatural = useCallback((code: string) => {
    setUnnaturalSelections((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    const peptides = generatePeptides(selectedTarget, params, unnaturalSelections, count, minLength, maxLength);
    setResults(peptides);
    setIsGenerating(false);
    toast.success(`Generated ${peptides.length} peptides`);
  };

  const filteredUnnatural = useMemo(() => {
    return Object.entries(UNNATURAL_AA).map(([code, aa]) => ({ code, ...aa }));
  }, []);

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/15 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-[#00d4aa]" />
            </div>
            <h1 className="text-3xl font-bold">Peptide Generator</h1>
          </motion.div>
          <p className="text-muted-foreground ml-13">
            Configure parameters to generate optimized therapeutic peptide sequences.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel — Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Target Selection */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Therapeutic Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {THERAPEUTIC_TARGETS.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setSelectedTarget(target.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedTarget === target.id
                          ? "border-[#00d4aa] bg-[#00d4aa]/10"
                          : "border-border hover:border-[#00d4aa]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{target.name}</span>
                        {selectedTarget === target.id && (
                          <Check className="w-4 h-4 text-[#00d4aa]" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {target.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {target.preferredResidues.slice(0, 5).map((r) => (
                          <Badge key={r} variant="outline" className="text-[10px] px-1.5 py-0 border-[#00d4aa]/20 text-[#00d4aa]">
                            {r}
                          </Badge>
                        ))}
                        {target.preferredResidues.length > 5 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{target.preferredResidues.length - 5}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scoring Parameters */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Scoring Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {scoringParams.map((sp) => (
                  <div key={sp.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <sp.icon className="w-4 h-4" style={{ color: sp.color }} />
                        <Label className="text-sm font-medium">{sp.label}</Label>
                      </div>
                      <span className="text-sm font-mono text-[#00d4aa]">{params[sp.key]}</span>
                    </div>
                    <Slider
                      value={[params[sp.key]]}
                      onValueChange={([v]) => setParams((p) => ({ ...p, [sp.key]: v }))}
                      min={0}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:bg-[#00d4aa] [&_[role=slider]]:border-[#00d4aa]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{sp.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Unnatural Amino Acids */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Unnatural Amino Acids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unnaturalCategories.map((cat) => {
                    const catsAAs = filteredUnnatural.filter((aa) => aa.syntheticType === cat.type);
                    if (catsAAs.length === 0) return null;
                    return (
                      <div key={cat.type}>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {catsAAs.map((aa) => {
                            const isSelected = unnaturalSelections.includes(aa.code);
                            return (
                              <button
                                key={aa.code}
                                onClick={() => toggleUnnatural(aa.code)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-[#ef4444]/15 border-[#ef4444]/50 text-[#ef4444]"
                                    : "border-border text-muted-foreground hover:border-[#00d4aa]/40"
                                }`}
                              >
                                <span className="font-mono font-bold">{aa.code}</span>
                                <span className="opacity-70">{aa.name}</span>
                                {isSelected && <X className="w-3 h-3 ml-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel — Controls & Generate */}
          <div className="space-y-6">
            {/* Sequence Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Sequence Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Number of Peptides</Label>
                  <div className="flex gap-2 mt-2">
                    {[3, 5, 10, 15, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                          count === n
                            ? "border-[#00d4aa] bg-[#00d4aa]/15 text-[#00d4aa]"
                            : "border-border text-muted-foreground hover:border-[#00d4aa]/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Min Length: {minLength}</Label>
                  <Slider
                    value={[minLength]}
                    onValueChange={([v]) => setMinLength(v)}
                    min={4}
                    max={Math.min(maxLength - 2, 30)}
                    step={1}
                    className="mt-2 [&_[role=slider]]:bg-[#00b8d9]"
                  />
                </div>
                <div>
                  <Label className="text-sm">Max Length: {maxLength}</Label>
                  <Slider
                    value={[maxLength]}
                    onValueChange={([v]) => setMaxLength(v)}
                    min={Math.max(minLength + 2, 8)}
                    max={34}
                    step={1}
                    className="mt-2 [&_[role=slider]]:bg-[#00b8d9]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-14 bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.02]"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-[#0a0f1e]/30 border-t-[#0a0f1e] rounded-full animate-spin" />
                  Generating Sequences...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Generate {count} Peptides
                </span>
              )}
            </Button>

            {/* Results Summary */}
            <AnimatePresence>
              {results && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card border-[#00d4aa]/30 glow-teal">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Generated Results</span>
                        <Badge className="bg-[#00d4aa]/20 text-[#00d4aa] border-0">
                          {results.length} peptides
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {results.slice(0, 3).map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-[#00d4aa] truncate">
                              {p.sequence.slice(0, 30)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{p.length}aa</Badge>
                              {p.unnaturalCount > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#ef4444]/30 text-[#ef4444]">
                                  {p.unnaturalCount} uAA
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="font-bold text-[#00b8d9]">{p.dockingScore.toFixed(1)}</p>
                            <p className="text-[10px] text-muted-foreground">score</p>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10"
                        onClick={() => navigate("/results")}
                      >
                        View All Results <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
