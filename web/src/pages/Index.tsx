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
  Mail,
  GraduationCap,
  Beaker,
  PackageCheck,
  Database,
  Search,
  Server,
  BookOpen,
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

const infraFeatures = [
  {
    icon: Database,
    title: "PostgreSQL Database",
    desc: "Scalable Supabase-powered storage with full-text search, version control, and RLS security for peptides, datasets, and projects.",
    color: "#22c55e",
  },
  {
    icon: Search,
    title: "Global Search",
    desc: "Instant search across CDMO services, peptide journals, external databases, and platform pages. Press ⌘K to search.",
    color: "#f59e0b",
  },
  {
    icon: BookOpen,
    title: "Resources & Databases",
    desc: "Curated references from DBAASP, APD, Prof. Raghava's bioinformatics portal, PDB, PubChem, and UniProt.",
    color: "#7c5ce7",
  },
  {
    icon: Server,
    title: "API & Integration",
    desc: "Cloudflare Workers backend with service tokens, REST API access, and multi-user project management.",
    color: "#00b8d9",
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

      {/* ── CDMO Services Section ── */}
      <section id="cdmo-services" className="py-20 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f59e0b]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 px-4 py-1.5 text-sm">
              <Beaker className="w-3.5 h-3.5 mr-1.5" />
              Peptide CDMO Services
            </Badge>
            <h2 className="text-3xl font-bold mb-3">
              Low-Cost Peptide{" "}
              <span className="text-gradient">Development & Delivery</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From computational design to physical molecules — we offer end-to-end peptide
              CDMO services at competitive pricing, bridging the gap between in silico and in vitro.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Service Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card h-full border-[#f59e0b]/10 hover:border-[#f59e0b]/30 transition-all group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Beaker className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <h3 className="font-semibold mb-2">Custom Peptide Synthesis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Milligram to gram-scale synthesis of natural and unnatural peptides with
                    rigorous QC — HPLC, MS, and amino acid analysis included.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card h-full border-[#f59e0b]/10 hover:border-[#f59e0b]/30 transition-all group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <PackageCheck className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <h3 className="font-semibold mb-2">Low-Cost Delivery</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Competitive pricing without compromising quality. Global shipping with
                    lyophilized peptide formats for maximum stability during transit.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Qualification Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card h-full border-[#7c5ce7]/10 hover:border-[#7c5ce7]/30 transition-all group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#7c5ce7]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5 text-[#7c5ce7]" />
                  </div>
                  <h3 className="font-semibold mb-2">Expert Leadership</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Led by Venkatramaiah Bommena — PhD in Peptide Chemistry from{" "}
                    <span className="font-medium text-foreground">BITS-Pilani, Hyderabad</span>.
                    Years of hands-on expertise in peptide design, synthesis, and characterization.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Card className="glass-card border-[#f59e0b]/20 glow-teal">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/20 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-[#f59e0b]" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    Get in Touch — Inquire About CDMO Services
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Have a peptide molecule development project? Let us deliver high-quality
                    peptide molecules at low cost with fast turnaround.
                  </p>
                  <a
                    href="mailto:bvenkatramaiah93@gmail.com"
                    className="inline-flex items-center gap-2 text-[#f59e0b] hover:text-[#f59e0b]/80 font-medium text-sm transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    bvenkatramaiah93@gmail.com
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                <a
                  href="mailto:bvenkatramaiah93@gmail.com"
                  className="shrink-0"
                >
                  <Button className="bg-gradient-to-r from-[#f59e0b] to-[#f59e0b]/80 text-[#0a0f1e] font-semibold hover:opacity-90">
                    Contact Venkatramaiah
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── Database & Search Features ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30 px-4 py-1.5 text-sm">
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Scalable Infrastructure
            </Badge>
            <h2 className="text-3xl font-bold mb-3">
              Built for <span className="text-gradient">Research at Scale</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Industry-grade PostgreSQL database with full-text search, version control, and API-ready architecture — everything you need for serious peptide research.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infraFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full hover:border-[#22c55e]/30 transition-all group">
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

          {/* Quick DB stat cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { label: "Tables & Relations", value: "8 Tables", sub: "RLS + Indexed" },
              { label: "Full-Text Search", value: "GIN Indexed", sub: "pg_trgm + tsvector" },
              { label: "Version Control", value: "Auto-Tracked", sub: "Change history" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-4 text-center border-[#22c55e]/10"
              >
                <p className="text-lg font-bold text-[#22c55e]">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/60">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            viewport={{ once: true }}
            className="mt-6 flex justify-center gap-3"
          >
            <Link to="/resources">
              <Button variant="outline" className="border-[#7c5ce7]/30 text-[#7c5ce7] hover:bg-[#7c5ce7]/10">
                <Database className="w-4 h-4 mr-2" />
                Explore Resources
              </Button>
            </Link>
          </motion.div>
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
      <footer className="border-t border-border/30 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-[#00d4aa]" />
              <span className="font-semibold text-foreground">PeptiForge</span>
              <span className="text-xs">v1.0</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#7c5ce7]" />
                <span>PhD in Peptide Chemistry — BITS-Pilani, Hyderabad</span>
              </div>
              <a
                href="mailto:bvenkatramaiah93@gmail.com"
                className="flex items-center gap-1.5 text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                bvenkatramaiah93@gmail.com
              </a>
            </div>
          </div>
          <div className="border-t border-border/20 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 PeptiForge — Owned & Operated by Venkatramaiah Bommena</p>
            <p>Low-Cost Peptide CDMO Services — Design, Synthesis & Global Delivery</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
