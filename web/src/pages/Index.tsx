import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dna,
  FlaskConical,
  AlignCenter,
  FileDown,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  THERAPEUTIC_TARGETS,
  generatePeptides,
  type ScoringParams,
  type GeneratedPeptide,
} from "@/lib/peptide-engine";

const defaultParams: ScoringParams = {
  bindingAffinity: 70,
  stability: 65,
  specificity: 60,
  solubility: 55,
  membranePermeability: 50,
};

const features = [
  {
    icon: Dna,
    title: "Peptide Generation",
    desc: "AI-powered sequence design with unnatural amino acid compatibility for targeted therapeutics.",
    color: "#00d4aa",
  },
  {
    icon: TrendingUp,
    title: "Docking Scores",
    desc: "Multi-parameter scoring model evaluating binding affinity, stability, and specificity.",
    color: "#00b8d9",
  },
  {
    icon: AlignCenter,
    title: "Sequence Alignment",
    desc: "Interactive Needleman-Wunsch pairwise and progressive multiple sequence alignment.",
    color: "#7c5ce7",
  },
  {
    icon: FileDown,
    title: "CSV Export",
    desc: "One-click export of sequences, scores, and alignment data for offline analysis.",
    color: "#f59e0b",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickResults, setQuickResults] = useState<GeneratedPeptide[] | null>(null);

  const handleQuickGenerate = async () => {
    if (!selectedTarget) return;
    setIsGenerating(true);
    // Simulate delay for animation
    await new Promise((r) => setTimeout(r, 800));
    const peptides = generatePeptides(selectedTarget, defaultParams, [], 3, 8, 14);
    setQuickResults(peptides);
    setIsGenerating(false);
  };

  const selectedTargetName = THERAPEUTIC_TARGETS.find((t) => t.id === selectedTarget)?.name;

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00d4aa]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#00b8d9]/10 rounded-full blur-3xl" />
          {/* Animated helix dots */}
          <div className="absolute top-1/3 left-[10%] w-2 h-2 rounded-full bg-[#00d4aa]/40 animate-pulse-glow" />
          <div className="absolute top-1/4 right-[15%] w-2 h-2 rounded-full bg-[#00b8d9]/40 animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/3 left-[20%] w-2 h-2 rounded-full bg-[#7c5ce7]/40 animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-[#00d4aa]/15 text-[#00d4aa] border-[#00d4aa]/30 px-4 py-1.5 text-sm">
              <Dna className="w-3.5 h-3.5 mr-1.5" />
              Peptide Engineering Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Design{" "}
            <span className="text-gradient">Therapeutic Peptides</span>
            <br />
            with Precision
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Generate optimized peptide sequences with unnatural amino acids,
            evaluate docking scores, and visualize sequence alignments — all in one platform.
          </motion.p>

          {/* Quick-start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <div className="glass-card rounded-2xl p-6 glow-teal">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Quick Start — Select a therapeutic target:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-5">
                {THERAPEUTIC_TARGETS.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTarget(target.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedTarget === target.id
                        ? "bg-[#00d4aa]/20 border-[#00d4aa] text-[#00d4aa]"
                        : "border-border hover:border-[#00d4aa]/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {target.name}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleQuickGenerate}
                disabled={!selectedTarget || isGenerating}
                className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold h-11 hover:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0f1e]/30 border-t-[#0a0f1e] rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Generate Peptides
                  </span>
                )}
              </Button>
            </div>

            {/* Quick results */}
            {quickResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-3"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Generated for {selectedTargetName}:
                </p>
                {quickResults.map((p) => (
                  <Card key={p.id} className="glass-card hover:glow-teal transition-all cursor-pointer" onClick={() => navigate("/results")}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm text-[#00d4aa] tracking-wider">
                          {p.sequence.length > 40 ? p.sequence.slice(0, 40) + "..." : p.sequence}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.length} residues · {p.unnaturalCount} unnatural
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#00b8d9]">{p.dockingScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Docking Score</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="ghost"
                  className="text-[#00d4aa] hover:text-[#00d4aa]/80"
                  onClick={() => navigate("/results")}
                >
                  View all results <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for{" "}
            <span className="text-gradient">Peptide Design</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full hover:border-[#00d4aa]/30 transition-all group">
                  <CardContent className="p-6">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-card rounded-2xl p-10 glow-tean">
            <FlaskConical className="w-10 h-10 text-[#00d4aa] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              Ready to Design Your Peptides?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start generating optimized peptide sequences with full scoring and alignment analysis.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/generator">
                <Button className="bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold">
                  Open Generator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/alignment">
                <Button variant="outline" className="border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10">
                  Try Alignment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-[#00d4aa]" />
            <span>PeptiForge v1.0</span>
          </div>
          <p>Built by Venkatramaiah Bommena93</p>
        </div>
      </footer>
    </div>
  );
}
