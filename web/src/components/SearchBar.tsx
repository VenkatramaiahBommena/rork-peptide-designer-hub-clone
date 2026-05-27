import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Beaker,
  Dna,
  Database,
  BookOpen,
  FlaskConical,
  ExternalLink,
  X,
  ArrowRight,
  GraduationCap,
  Mail,
  PackageCheck,
  Globe,
  FileText,
} from "lucide-react";

// ---------------------------------------------------------------------------
// CDMO & Peptide knowledge base
// ---------------------------------------------------------------------------

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: "cdmo" | "journal" | "database" | "page" | "contact";
  action?: { label: string; href?: string; onClick?: () => void };
  icon: typeof Search;
}

const CDMO_KNOWLEDGE: SearchResult[] = [
  {
    id: "cdmo-custom-synthesis",
    title: "Custom Peptide Synthesis",
    description: "Milligram to gram-scale synthesis of natural and unnatural peptides with rigorous QC — HPLC, MS, and amino acid analysis included.",
    category: "cdmo",
    icon: Beaker,
    action: { label: "Learn More", href: "/#cdmo-services" },
  },
  {
    id: "cdmo-low-cost",
    title: "Low-Cost Peptide Delivery",
    description: "Competitive pricing without compromising quality. Global shipping with lyophilized peptide formats for maximum stability during transit.",
    category: "cdmo",
    icon: PackageCheck,
    action: { label: "Learn More", href: "/#cdmo-services" },
  },
  {
    id: "cdmo-contact",
    title: "Contact Venkatramaiah Bommena",
    description: "PhD in Peptide Chemistry, BITS-Pilani Hyderabad. Inquire about CDMO services and custom peptide development projects.",
    category: "contact",
    icon: Mail,
    action: { label: "Email", href: "mailto:bvenkatramaiah93@gmail.com" },
  },
  {
    id: "cdmo-qualification",
    title: "Expert Leadership — PhD Peptide Chemistry",
    description: "Venkatramaiah Bommena holds a PhD in Peptide Chemistry from BITS-Pilani, Hyderabad. Years of hands-on expertise in peptide design, synthesis, and characterization.",
    category: "cdmo",
    icon: GraduationCap,
    action: { label: "View Profile", href: "/#cdmo-services" },
  },
  {
    id: "cdmo-pricing",
    title: "CDMO Pricing & Turnaround",
    description: "Low-cost peptide molecule development with fast turnaround. Contact for custom quotes based on sequence complexity, quantity, and purity requirements.",
    category: "cdmo",
    icon: FileText,
    action: { label: "Inquire", href: "mailto:bvenkatramaiah93@gmail.com" },
  },
];

const JOURNAL_KNOWLEDGE: SearchResult[] = [
  {
    id: "journal-peptide-science",
    title: "Journal of Peptide Science",
    description: "Official journal of the European Peptide Society covering all aspects of peptide chemistry, biology, and therapeutics.",
    category: "journal",
    icon: BookOpen,
    action: { label: "Visit", href: "https://onlinelibrary.wiley.com/journal/10991387" },
  },
  {
    id: "journal-biopolymers",
    title: "Biopolymers — Peptide Science",
    description: "Research on peptide structure, function, design, and applications in drug discovery and materials science.",
    category: "journal",
    icon: BookOpen,
    action: { label: "Visit", href: "https://onlinelibrary.wiley.com/journal/10970282" },
  },
  {
    id: "journal-acs",
    title: "ACS Peptide & Protein Chemistry",
    description: "High-impact research across peptide synthesis, folding, interactions, and therapeutic development.",
    category: "journal",
    icon: BookOpen,
    action: { label: "Visit", href: "https://pubs.acs.org/topic/peptide-chemistry" },
  },
  {
    id: "journal-ejmc",
    title: "European Journal of Medicinal Chemistry",
    description: "Medicinal chemistry research including peptide-based drug design and SAR studies.",
    category: "journal",
    icon: BookOpen,
    action: { label: "Visit", href: "https://www.sciencedirect.com/journal/european-journal-of-medicinal-chemistry" },
  },
  {
    id: "journal-jbc",
    title: "Journal of Biological Chemistry",
    description: "Premier journal for protein/peptide structure-function studies and biochemical mechanisms.",
    category: "journal",
    icon: BookOpen,
    action: { label: "Visit", href: "https://www.jbc.org/" },
  },
  {
    id: "journal-nucleic-acids",
    title: "Nucleic Acids Research — Database Issue",
    description: "Annual database issue featuring curated biological databases including peptide resources.",
    category: "journal",
    icon: BookOpen,
    action: { label: "Visit", href: "https://academic.oup.com/nar/pages/database_issue" },
  },
];

const DATABASE_KNOWLEDGE: SearchResult[] = [
  {
    id: "db-dbaasp",
    title: "DBAASP — Antimicrobial Peptide Database",
    description: "Manually curated resource for designing antimicrobial compounds with high therapeutic indices. Contains detailed structure-activity data for AMPs.",
    category: "database",
    icon: Database,
    action: { label: "Visit DBAASP", href: "https://dbaasp.org/home" },
  },
  {
    id: "db-apd",
    title: "APD — Antimicrobial Peptide Database",
    description: "The original AMP database with 6,309 peptides. Natural, synthetic, and predicted AMPs with advanced search and 542 3D structures.",
    category: "database",
    icon: Database,
    action: { label: "Visit APD", href: "https://aps.unmc.edu/" },
  },
  {
    id: "db-raghavagps",
    title: "Prof. Raghava's Bioinformatics Resources",
    description: "250+ web servers and 60+ databases for computer-aided drug/vaccine design. Includes AntiBP, AntiCP, CellPPD, and many peptide-focused tools.",
    category: "database",
    icon: Database,
    action: { label: "Visit Portal", href: "https://raghavagps.github.io/" },
  },
  {
    id: "db-scholargps",
    title: "Ralph Weissleder — ScholarGPS Profile",
    description: "Research profile covering molecular imaging, nanotechnology, and diagnostic peptide development at Harvard/MGH.",
    category: "database",
    icon: Database,
    action: { label: "View Profile", href: "https://scholargps.com/scholars/97025887812487/ralph-weissleder" },
  },
  {
    id: "db-pdb",
    title: "RCSB Protein Data Bank",
    description: "Worldwide repository of 3D structural data for proteins, peptides, and nucleic acids. Essential for docking studies.",
    category: "database",
    icon: Database,
    action: { label: "Visit PDB", href: "https://www.rcsb.org/" },
  },
  {
    id: "db-uniprot",
    title: "UniProt — Universal Protein Resource",
    description: "Comprehensive protein sequence and functional information database with peptide-level annotations.",
    category: "database",
    icon: Database,
    action: { label: "Visit UniProt", href: "https://www.uniprot.org/" },
  },
  {
    id: "db-pubchem",
    title: "PubChem — BioAssay Database",
    description: "Chemical compound and bioactivity database including peptide structures and biological screening results.",
    category: "database",
    icon: Database,
    action: { label: "Visit PubChem", href: "https://pubchem.ncbi.nlm.nih.gov/" },
  },
];

const PAGE_KNOWLEDGE: SearchResult[] = [
  {
    id: "page-generator",
    title: "Peptide Generator",
    description: "AI-powered sequence design with unnatural amino acid compatibility. Configure scoring parameters and therapeutic targets.",
    category: "page",
    icon: FlaskConical,
    action: { label: "Open", href: "/generator" },
  },
  {
    id: "page-results",
    title: "Results Dashboard",
    description: "Sort, filter, search, and export generated peptide sequences with detailed scoring breakdowns.",
    category: "page",
    icon: Dna,
    action: { label: "Open", href: "/results" },
  },
  {
    id: "page-alignment",
    title: "Sequence Alignment",
    description: "Needleman-Wunsch pairwise and progressive multiple sequence alignment with interactive visualization.",
    category: "page",
    icon: Dna,
    action: { label: "Open", href: "/alignment" },
  },
  {
    id: "page-resources",
    title: "Peptide Resources & Databases",
    description: "Curated collection of peptide databases, journals, and bioinformatics tools from leading research groups.",
    category: "page",
    icon: Database,
    action: { label: "Open", href: "/resources" },
  },
  {
    id: "page-cdmo",
    title: "CDMO Services",
    description: "Low-cost peptide development and delivery services. Custom synthesis, global shipping, expert PhD leadership.",
    category: "page",
    icon: Beaker,
    action: { label: "Jump to", href: "/#cdmo-services" },
  },
];

const ALL_RESULTS = [
  ...CDMO_KNOWLEDGE,
  ...JOURNAL_KNOWLEDGE,
  ...DATABASE_KNOWLEDGE,
  ...PAGE_KNOWLEDGE,
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const categoryIcons: Record<string, typeof Search> = {
  cdmo: Beaker,
  journal: BookOpen,
  database: Database,
  page: FlaskConical,
  contact: Mail,
};

const categoryLabels: Record<string, string> = {
  cdmo: "CDMO Services",
  journal: "Peptide Journals",
  database: "Databases & Resources",
  page: "Platform Pages",
  contact: "Contact",
};

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? ALL_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()),
      )
    : ALL_RESULTS;

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleAction = (result: SearchResult) => {
    setIsOpen(false);
    if (result.action?.href) {
      if (result.action.href.startsWith("http") || result.action.href.startsWith("mailto")) {
        window.open(result.action.href, "_blank");
      } else {
        navigate(result.action.href);
      }
    }
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground bg-muted/40 hover:bg-muted/60 hover:text-foreground border border-border/40 transition-all min-w-[200px]"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Search CDMO, journals, databases...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === overlayRef.current) setIsOpen(false); }}
          >
            <div className="max-w-2xl mx-auto mt-[15vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.15 }}
                className="glass-card rounded-2xl overflow-hidden border-[#00d4aa]/20 glow-teal"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search CDMO services, peptide journals, databases..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto scrollbar-thin p-2">
                  {Object.entries(grouped).map(([category, items]) => {
                    const Icon = categoryIcons[category] || Search;
                    return (
                      <div key={category} className="mb-1">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <Icon className="w-3.5 h-3.5" />
                          {categoryLabels[category] || category}
                        </div>
                        {items.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleAction(result)}
                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                          >
                            <result.icon className="w-4 h-4 text-[#00d4aa] mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {result.title}
                                </span>
                                {result.action?.href?.startsWith("http") && (
                                  <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {result.description}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  {results.length === 0 && query.trim() && (
                    <div className="py-8 text-center">
                      <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono">↵</kbd>
                    <span>Open</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
