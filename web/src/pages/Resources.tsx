import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Database,
  BookOpen,
  Globe,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Search,
  ArrowRight,
  Dna,
  Beaker,
  FileText,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Resource data
// ---------------------------------------------------------------------------

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: "database" | "journal" | "tool" | "research";
  icon: typeof Database;
  color: string;
  stats?: { label: string; value: string }[];
  features?: string[];
}

const resources: Resource[] = [
  {
    id: "dbaasp",
    title: "DBAASP — Database of Antimicrobial Activity and Structure of Peptides",
    url: "https://dbaasp.org/home",
    description:
      "A manually curated, comprehensive resource for designing antimicrobial compounds with high therapeutic indices. Provides detailed structure-activity information for AMPs including ribosomal, non-ribosomal, and synthetic peptides. Features 3D conformations, synergy data, and ML-based prediction tools.",
    category: "database",
    icon: Database,
    color: "#00d4aa",
    features: [
      "Chemical structures & 3D conformations of peptides",
      "Antimicrobial & hemolytic activity data with experimental conditions",
      "Target-specific activity against particular microbial species",
      "Posttranslational modifications & chemical group data",
      "Synergy data with FICI values",
      "Machine learning-based AMP prediction tool",
      "SAR insights for high therapeutic index peptides",
    ],
  },
  {
    id: "apd",
    title: "APD6 — Antimicrobial Peptide Database",
    url: "https://aps.unmc.edu/",
    description:
      "The original and most comprehensive AMP database. APD6 catalogs 6,309 peptides spanning natural, synthetic, and AI-predicted AMPs. Features a powerful search engine, structural classification into 4 classes, and the AMP Information Pipeline (AMPIP) for advanced R&D queries.",
    category: "database",
    icon: Database,
    color: "#00b8d9",
    stats: [
      { label: "Natural AMPs", value: "3,379" },
      { label: "Synthetic AMPs", value: "2,290" },
      { label: "Predicted AMPs", value: "373" },
      { label: "3D Structures", value: "542" },
    ],
    features: [
      "Search by sequence, motif, length, charge, hydrophobic content",
      "Activity data against diverse targets (bacteria, fungi, viruses, cancer)",
      "Structural classification (α-helix, β-sheet, α/β, non-α/β)",
      "AMPIP pipeline for AI predictor development",
      "Resistance, stability, PK/toxicity, and clinical trial data",
      "Host-defense peptides from 6 life kingdoms",
    ],
  },
  {
    id: "raghavagps",
    title: "Prof. G.P.S. Raghava — Bioinformatics Resources Portal",
    url: "https://raghavagps.github.io/",
    description:
      "A centralized portal hosting 250+ web servers and 60+ databases for computer-aided drug and vaccine design. Developed by Prof. Raghava's group at IIIT-Delhi, these open-access resources cover peptide prediction, immunoinformatics, and therapeutic peptide design.",
    category: "tool",
    icon: Globe,
    color: "#7c5ce7",
    features: [
      "AntiBP2 — Antibacterial peptide prediction & design",
      "AntiCP/AntiCP2 — Anticancer peptide prediction",
      "Hemolytik/HemoPI — Hemolytic peptide databases & prediction",
      "CellPPD/CPPsite — Cell-penetrating peptide resources",
      "AHTPDB/AHTpin — Antihypertensive peptide database & design",
      "DrugMint — Peptide/drug interaction database",
      "CancerPPD — Anticancer peptide database",
      "Open-source, free for academic use",
    ],
  },
  {
    id: "scholargps",
    title: "Ralph Weissleder, MD, PhD — Research Profile",
    url: "https://scholargps.com/scholars/97025887812487/ralph-weissleder",
    description:
      "Thrall Professor of Radiology at Harvard Medical School and Director of the Center for Systems Biology at Massachusetts General Hospital. Pioneer in molecular imaging, nanotechnology-based diagnostics, and targeted peptide therapeutics.",
    category: "research",
    icon: GraduationCap,
    color: "#f59e0b",
    features: [
      "Molecular imaging and nanotechnology for early disease detection",
      "Peptide-based diagnostic probes and targeted therapeutics",
      "Point-of-care diagnostic platforms",
      "Chemical biology approaches for cancer detection",
      "Over 1,000 publications in biomedical imaging",
    ],
  },
  {
    id: "pdb",
    title: "RCSB Protein Data Bank",
    url: "https://www.rcsb.org/",
    description:
      "The worldwide repository for 3D structural data of biological macromolecules. Contains thousands of peptide and protein structures essential for molecular docking, structure-based drug design, and understanding peptide-receptor interactions at atomic resolution.",
    category: "database",
    icon: Database,
    color: "#ef4444",
    features: [
      "200,000+ experimentally determined 3D structures",
      "Peptide-protein complex structures for docking",
      "Sequence-structure visualization tools",
      "API access for programmatic queries",
      "Ligand interaction data for binding site analysis",
    ],
  },
  {
    id: "pubchem",
    title: "PubChem — BioAssay & Compound Database",
    url: "https://pubchem.ncbi.nlm.nih.gov/",
    description:
      "NIH-maintained open chemistry database with compound structures, biological activities, and peptide bioassay results. Integrates with ChEMBL for comprehensive drug-target interaction data valuable for peptide docking validation.",
    category: "database",
    icon: Database,
    color: "#00d4aa",
    features: [
      "Peptide compound records with SMILES/SDF formats",
      "BioAssay data for antimicrobial and anticancer peptides",
      "Structure similarity search for scaffold hopping",
      "Programmatic access via PUG REST API",
      "Integration with ChEMBL and DrugBank",
    ],
  },
  {
    id: "uniprot",
    title: "UniProt — Universal Protein Resource",
    url: "https://www.uniprot.org/",
    description:
      "Comprehensive resource for protein sequence and functional annotation. Contains detailed peptide-level information including domains, post-translational modifications, and functional sites critical for therapeutic peptide design.",
    category: "database",
    icon: Database,
    color: "#00b8d9",
    features: [
      "Reviewed (Swiss-Prot) and unreviewed (TrEMBL) entries",
      "Peptide domain and motif annotations",
      "PTM data for synthetic peptide design optimization",
      "Cross-references to structural databases",
      "BLAST and align tools for sequence comparison",
    ],
  },
];

const journalResources: Resource[] = [
  {
    id: "jps",
    title: "Journal of Peptide Science",
    url: "https://onlinelibrary.wiley.com/journal/10991387",
    description:
      "Official journal of the European Peptide Society. Covers all aspects of peptide chemistry, biology, synthesis, and therapeutic applications with high-quality peer-reviewed research.",
    category: "journal",
    icon: BookOpen,
    color: "#7c5ce7",
    features: [
      "Peptide synthesis methods & strategies",
      "Peptide-based drug design & SAR studies",
      "Antimicrobial & therapeutic peptide research",
      "Peptide materials & nanotechnology",
    ],
  },
  {
    id: "acs",
    title: "ACS Publications — Peptide & Protein Chemistry",
    url: "https://pubs.acs.org/topic/peptide-chemistry",
    description:
      "American Chemical Society's peptide chemistry portal featuring high-impact research from journals including JACS, Biochemistry, Journal of Medicinal Chemistry, and ACS Chemical Biology.",
    category: "journal",
    icon: BookOpen,
    color: "#00b8d9",
    features: [
      "Peptide structure-function relationships",
      "Chemical biology of peptides & proteins",
      "Peptide engineering & design",
      "Therapeutic peptide discovery",
    ],
  },
  {
    id: "ejmc",
    title: "European Journal of Medicinal Chemistry",
    url: "https://www.sciencedirect.com/journal/european-journal-of-medicinal-chemistry",
    description:
      "Leading medicinal chemistry journal with extensive peptide-based drug design research. Features SAR and docking studies for peptide therapeutics across multiple disease areas.",
    category: "journal",
    icon: BookOpen,
    color: "#f59e0b",
    features: [
      "Peptide drug design & optimization",
      "Docking & computational studies",
      "PK/PD of peptide therapeutics",
      "Structure-guided peptide engineering",
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const categoryLabels: Record<string, string> = {
  database: "Peptide Databases",
  journal: "Journals & Publications",
  tool: "Bioinformatics Tools",
  research: "Research Profiles",
};

const categoryIcons: Record<string, typeof Database> = {
  database: Database,
  journal: BookOpen,
  tool: Globe,
  research: GraduationCap,
};

export default function Resources() {
  const [activeTab, setActiveTab] = useState<"all" | "database" | "journal" | "tool" | "research">("all");

  const allResources = [...resources, ...journalResources];
  const filtered =
    activeTab === "all"
      ? allResources
      : allResources.filter((r) => r.category === activeTab);

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#7c5ce7]/15 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#7c5ce7]" />
            </div>
            <h1 className="text-3xl font-bold">Peptide Resources & Databases</h1>
          </div>
          <p className="text-muted-foreground">
            Curated collection of the most important peptide science databases, journals,
            bioinformatics tools, and research groups worldwide.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", "database", "journal", "tool", "research"] as const).map((tab) => {
            const Icon = tab === "all" ? Globe : categoryIcons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
                  activeTab === tab
                    ? "bg-[#7c5ce7]/15 border-[#7c5ce7]/40 text-[#7c5ce7]"
                    : "border-border text-muted-foreground hover:border-[#7c5ce7]/30 hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {tab === "all" ? "All Resources" : categoryLabels[tab]}
              </button>
            );
          })}
        </div>

        {/* Resource cards */}
        <div className="space-y-6">
          {filtered.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card hover:border-[#7c5ce7]/30 transition-all group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* Icon + Title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${resource.color}15` }}
                        >
                          <resource.icon className="w-5 h-5" style={{ color: resource.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg leading-snug mb-1">
                            {resource.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{ borderColor: `${resource.color}40`, color: resource.color }}
                          >
                            {categoryLabels[resource.category] || resource.category}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {resource.description}
                      </p>

                      {/* Stats */}
                      {resource.stats && (
                        <div className="flex flex-wrap gap-3 mb-4">
                          {resource.stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="px-3 py-2 rounded-lg bg-muted/30 border border-border/30"
                            >
                              <p className="text-lg font-bold" style={{ color: resource.color }}>
                                {stat.value}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Features */}
                      {resource.features && resource.features.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                          {resource.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                style={{ backgroundColor: resource.color }}
                              />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Visit button */}
                    <div className="shrink-0 self-end lg:self-start">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#7c5ce7]/30 text-[#7c5ce7] hover:bg-[#7c5ce7]/10 hover:border-[#7c5ce7]/60 whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Visit Resource
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Getting Started guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="glass-card border-[#00d4aa]/20 glow-teal">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#00b8d9]/20 border border-[#00d4aa]/20 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-7 h-7 text-[#00d4aa]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">How to Use These Resources</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start with DBAASP or APD to find known antimicrobial peptides for your target.
                    Use bioinformatics tools from Prof. Raghava's portal for prediction and design.
                    Validate your peptide structures against the PDB, and reference journal literature
                    for SAR and experimental protocols. Then generate optimized sequences right here
                    on PeptiForge.
                  </p>
                </div>
                <Link to="/generator" className="shrink-0">
                  <Button className="bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold">
                    <Dna className="w-4 h-4 mr-2" />
                    Start Designing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CDMO CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-6"
        >
          <Card className="glass-card border-[#f59e0b]/20">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/20 flex items-center justify-center shrink-0">
                  <Beaker className="w-7 h-7 text-[#f59e0b]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Turn Computational Designs Into Real Peptides</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our CDMO services bridge the gap between bioinformatics and physical peptide
                    molecules. Get your designed sequences synthesized at low cost with fast turnaround.
                    Led by Venkatramaiah Bommena, PhD (Peptide Chemistry, BITS-Pilani Hyderabad).
                  </p>
                </div>
                <a href="mailto:bvenkatramaiah93@gmail.com" className="shrink-0">
                  <Button className="bg-gradient-to-r from-[#f59e0b] to-[#f59e0b]/80 text-[#0a0f1e] font-semibold">
                    <FileText className="w-4 h-4 mr-2" />
                    Inquire Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
