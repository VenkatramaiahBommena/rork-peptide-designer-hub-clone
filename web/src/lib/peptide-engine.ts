/** PeptiForge — Peptide generation and docking score engine */

export interface AminoAcid {
  code: string;
  name: string;
  category: "hydrophobic" | "polar" | "charged" | "special" | "unnatural";
  mass: number;
  hydropathy: number;
}

export interface UnnaturalAA extends AminoAcid {
  syntheticType: "D-amino" | "beta" | "peptoid" | "stapled" | "cyclic";
}

export interface TherapeuticTarget {
  id: string;
  name: string;
  description: string;
  preferredResidues: string[];
  dockingTemplate: number[];
}

export interface ScoringParams {
  bindingAffinity: number;    // 0–100
  stability: number;          // 0–100
  specificity: number;        // 0–100
  solubility: number;         // 0–100
  membranePermeability: number; // 0–100
}

export interface GeneratedPeptide {
  id: string;
  sequence: string;
  length: number;
  dockingScore: number;
  bindingAffinity: number;
  stability: number;
  specificity: number;
  solubility: number;
  membranePermeability: number;
  unnaturalCount: number;
  targetId: string;
  createdAt: string;
}

export interface AlignmentResult {
  sequences: string[];
  alignment: string[];
  score: number;
  identity: number;
  gaps: number;
}

const STANDARD_AA: Record<string, AminoAcid> = {
  A: { code: "A", name: "Alanine", category: "hydrophobic", mass: 89.09, hydropathy: 1.8 },
  C: { code: "C", name: "Cysteine", category: "special", mass: 121.15, hydropathy: 2.5 },
  D: { code: "D", name: "Aspartate", category: "charged", mass: 133.10, hydropathy: -3.5 },
  E: { code: "E", name: "Glutamate", category: "charged", mass: 147.13, hydropathy: -3.5 },
  F: { code: "F", name: "Phenylalanine", category: "hydrophobic", mass: 165.19, hydropathy: 2.8 },
  G: { code: "G", name: "Glycine", category: "special", mass: 75.07, hydropathy: -0.4 },
  H: { code: "H", name: "Histidine", category: "charged", mass: 155.16, hydropathy: -3.2 },
  I: { code: "I", name: "Isoleucine", category: "hydrophobic", mass: 131.17, hydropathy: 4.5 },
  K: { code: "K", name: "Lysine", category: "charged", mass: 146.19, hydropathy: -3.9 },
  L: { code: "L", name: "Leucine", category: "hydrophobic", mass: 131.17, hydropathy: 3.8 },
  M: { code: "M", name: "Methionine", category: "hydrophobic", mass: 149.21, hydropathy: 1.9 },
  N: { code: "N", name: "Asparagine", category: "polar", mass: 132.12, hydropathy: -3.5 },
  P: { code: "P", name: "Proline", category: "special", mass: 115.13, hydropathy: -1.6 },
  Q: { code: "Q", name: "Glutamine", category: "polar", mass: 146.15, hydropathy: -3.5 },
  R: { code: "R", name: "Arginine", category: "charged", mass: 174.20, hydropathy: -4.5 },
  S: { code: "S", name: "Serine", category: "polar", mass: 105.09, hydropathy: -0.8 },
  T: { code: "T", name: "Threonine", category: "polar", mass: 119.12, hydropathy: -0.7 },
  V: { code: "V", name: "Valine", category: "hydrophobic", mass: 117.15, hydropathy: 4.2 },
  W: { code: "W", name: "Tryptophan", category: "hydrophobic", mass: 204.23, hydropathy: -0.9 },
  Y: { code: "Y", name: "Tyrosine", category: "polar", mass: 181.19, hydropathy: -1.3 },
};

export const UNNATURAL_AA: Record<string, UnnaturalAA> = {
  dA: { code: "dA", name: "D-Alanine", category: "unnatural", mass: 89.09, hydropathy: 1.8, syntheticType: "D-amino" },
  dF: { code: "dF", name: "D-Phenylalanine", category: "unnatural", mass: 165.19, hydropathy: 2.8, syntheticType: "D-amino" },
  dK: { code: "dK", name: "D-Lysine", category: "unnatural", mass: 146.19, hydropathy: -3.9, syntheticType: "D-amino" },
  dR: { code: "dR", name: "D-Arginine", category: "unnatural", mass: 174.20, hydropathy: -4.5, syntheticType: "D-amino" },
  Aib: { code: "Aib", name: "Aminoisobutyric acid", category: "unnatural", mass: 103.12, hydropathy: 0.3, syntheticType: "beta" },
  bA: { code: "bA", name: "beta-Alanine", category: "unnatural", mass: 89.09, hydropathy: -0.1, syntheticType: "beta" },
  Nle: { code: "Nle", name: "Norleucine", category: "unnatural", mass: 131.17, hydropathy: 3.8, syntheticType: "stapled" },
  Orn: { code: "Orn", name: "Ornithine", category: "unnatural", mass: 132.16, hydropathy: -3.5, syntheticType: "cyclic" },
  Cit: { code: "Cit", name: "Citrulline", category: "unnatural", mass: 175.19, hydropathy: -3.2, syntheticType: "cyclic" },
  Sar: { code: "Sar", name: "Sarcosine", category: "unnatural", mass: 89.09, hydropathy: -0.2, syntheticType: "peptoid" },
  Sta: { code: "Sta", name: "Statine", category: "unnatural", mass: 175.23, hydropathy: -0.5, syntheticType: "stapled" },
  Hyp: { code: "Hyp", name: "Hydroxyproline", category: "unnatural", mass: 131.13, hydropathy: -1.6, syntheticType: "cyclic" },
};

export const THERAPEUTIC_TARGETS: TherapeuticTarget[] = [
  {
    id: "diabetic",
    name: "Anti-Diabetic",
    description: "GLP-1 receptor agonists and DPP-4 inhibitors targeting glucose regulation pathways",
    preferredResidues: ["H", "A", "E", "G", "T", "F", "dA", "Aib"],
    dockingTemplate: [0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7],
  },
  {
    id: "pdc",
    name: "PDC (Protein-DNA Conjugate)",
    description: "Targeting DNA-binding proteins and transcription factor regulation",
    preferredResidues: ["K", "R", "S", "T", "Y", "W", "dK", "dR"],
    dockingTemplate: [0.7, 0.9, 0.6, 0.8, 0.5, 0.7, 0.6, 0.9, 0.8, 0.5],
  },
  {
    id: "antifungal",
    name: "Anti-Fungal",
    description: "Membrane-active peptides targeting ergosterol and fungal cell wall synthesis",
    preferredResidues: ["F", "W", "L", "I", "V", "K", "R", "dF", "Nle"],
    dockingTemplate: [0.9, 0.8, 0.7, 0.6, 0.9, 0.8, 0.7, 0.6, 0.9, 0.8],
  },
  {
    id: "anticancer",
    name: "Anti-Cancer",
    description: "Apoptosis-inducing peptides targeting Bcl-2 family and p53 pathways",
    preferredResidues: ["W", "F", "L", "K", "R", "E", "dF", "Sta", "Hyp"],
    dockingTemplate: [0.6, 0.8, 0.9, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.9],
  },
  {
    id: "antimicrobial",
    name: "Anti-Microbial",
    description: "Broad-spectrum AMPs targeting bacterial membrane disruption",
    preferredResidues: ["K", "R", "F", "W", "L", "I", "dK", "dR", "Orn"],
    dockingTemplate: [0.8, 0.9, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 0.9],
  },
  {
    id: "neuro",
    name: "Neuroprotective",
    description: "Blood-brain barrier penetrating peptides for neurodegenerative conditions",
    preferredResidues: ["G", "P", "S", "T", "Y", "F", "Hyp", "Sar", "bA"],
    dockingTemplate: [0.5, 0.7, 0.6, 0.8, 0.5, 0.7, 0.6, 0.8, 0.5, 0.7],
  },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Generate peptide sequences for a given therapeutic target and scoring parameters.
 * Uses a physico-chemical scoring model incorporating hydropathy, charge distribution,
 * and target-specific residue preferences.
 */
export function generatePeptides(
  targetId: string,
  params: ScoringParams,
  unnaturalSelections: string[],
  count = 5,
  minLength = 8,
  maxLength = 20,
): GeneratedPeptide[] {
  const target = THERAPEUTIC_TARGETS.find((t) => t.id === targetId);
  if (!target) return [];

  const seed = Date.now();
  const rand = seededRandom(seed);
  const peptides: GeneratedPeptide[] = [];

  const availableResidues = [
    ...target.preferredResidues.filter((r) => STANDARD_AA[r]),
    ...unnaturalSelections.filter((u) => UNNATURAL_AA[u]),
  ];

  const allResidues = [...availableResidues];
  if (allResidues.length < 4) {
    allResidues.push("A", "G", "L", "K", "F");
  }

  for (let i = 0; i < count; i++) {
    const length = minLength + Math.floor(rand() * (maxLength - minLength + 1));
    const sequence: string[] = [];
    let unnaturalCount = 0;

    // Ensure at least one preferred residue at key positions
    const keyPositions = [0, Math.floor(length / 3), Math.floor(length / 2), Math.floor(2 * length / 3), length - 1];

    for (let pos = 0; pos < length; pos++) {
      let residue: string;
      if (keyPositions.includes(pos) && rand() < 0.7) {
        residue = availableResidues[Math.floor(rand() * availableResidues.length)];
      } else {
        residue = allResidues[Math.floor(rand() * allResidues.length)];
      }

      if (UNNATURAL_AA[residue]) unnaturalCount++;
      sequence.push(residue);
    }

    // Compute docking score based on the physico-chemical model
    const scores = computeDockingScores(sequence, target, params, rand);
    const dockingScore = (
      scores.binding * 0.35 +
      scores.stability * 0.25 +
      scores.specificity * 0.20 +
      scores.solubility * 0.10 +
      scores.permeability * 0.10
    );

    peptides.push({
      id: `PEP-${Date.now()}-${i}`,
      sequence: sequence.join("-"),
      length,
      dockingScore: clamp(dockingScore * 100, 20, 99),
      bindingAffinity: clamp(scores.binding * 100, 10, 99),
      stability: clamp(scores.stability * 100, 10, 99),
      specificity: clamp(scores.specificity * 100, 10, 99),
      solubility: clamp(scores.solubility * 100, 10, 99),
      membranePermeability: clamp(scores.permeability * 100, 10, 99),
      unnaturalCount,
      targetId,
      createdAt: new Date().toISOString(),
    });
  }

  return peptides.sort((a, b) => b.dockingScore - a.dockingScore);
}

function computeDockingScores(
  sequence: string[],
  target: TherapeuticTarget,
  params: ScoringParams,
  rand: () => number,
): Record<string, number> {
  let totalHydropathy = 0;
  let positiveCharge = 0;
  let negativeCharge = 0;
  let preferredCount = 0;
  let unnaturalBonus = 0;

  for (const code of sequence) {
    const aa = STANDARD_AA[code] || UNNATURAL_AA[code];
    if (!aa) continue;

    totalHydropathy += aa.hydropathy;
    if (aa.category === "charged") {
      if (aa.code === "K" || aa.code === "R" || aa.code === "H" ||
          aa.code === "dK" || aa.code === "dR" || aa.code === "Orn") {
        positiveCharge++;
      } else {
        negativeCharge++;
      }
    }
    if (target.preferredResidues.includes(code)) preferredCount++;
    if (aa.category === "unnatural") unnaturalBonus += 0.05;
  }

  const avgHydropathy = totalHydropathy / sequence.length;
  const chargeBalance = 1 - Math.abs(positiveCharge - negativeCharge) / Math.max(sequence.length, 1);
  const preferredRatio = preferredCount / sequence.length;

  // Template matching
  let templateMatch = 0;
  for (let i = 0; i < Math.min(sequence.length, target.dockingTemplate.length); i++) {
    templateMatch += 1 - Math.abs((avgHydropathy / 5) - target.dockingTemplate[i]);
  }
  templateMatch /= Math.min(sequence.length, target.dockingTemplate.length);

  const noise = () => (rand() - 0.5) * 0.15;

  return {
    binding: clamp(sigmoid(
      preferredRatio * 3 + chargeBalance * 2 + unnaturalBonus * 5 + (params.bindingAffinity / 100) * 2 - 2
    ) + noise(), 0, 1),
    stability: clamp(sigmoid(
      chargeBalance * 2.5 + templateMatch * 2 + (params.stability / 100) * 2 - 1.5
    ) + noise(), 0, 1),
    specificity: clamp(sigmoid(
      preferredRatio * 4 + (params.specificity / 100) * 2.5 - 2
    ) + noise(), 0, 1),
    solubility: clamp(sigmoid(
      chargeBalance * 3 - Math.abs(avgHydropathy) * 0.5 + (params.solubility / 100) * 2 - 1
    ) + noise(), 0, 1),
    permeability: clamp(sigmoid(
      avgHydropathy * 1.5 + unnaturalBonus * 3 + (params.membranePermeability / 100) * 2 - 1.5
    ) + noise(), 0, 1),
  };
}

/**
 * Global pairwise sequence alignment using Needleman-Wunsch algorithm.
 */
export function alignSequences(seq1: string, seq2: string): AlignmentResult {
  const s1 = seq1.split("-");
  const s2 = seq2.split("-");
  const n = s1.length;
  const m = s2.length;

  const gapPenalty = -1;
  const matchScore = 2;
  const mismatchPenalty = -1;

  // Scoring matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i * gapPenalty;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gapPenalty;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = s1[i - 1] === s2[j - 1] ? matchScore : mismatchPenalty;
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + match,
        dp[i - 1][j] + gapPenalty,
        dp[i][j - 1] + gapPenalty,
      );
    }
  }

  // Traceback
  let i = n, j = m;
  const al1: string[] = [];
  const al2: string[] = [];
  let identity = 0;
  let gaps = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? matchScore : mismatchPenalty)) {
      al1.unshift(s1[i - 1]);
      al2.unshift(s2[j - 1]);
      if (s1[i - 1] === s2[j - 1]) identity++;
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + gapPenalty) {
      al1.unshift(s1[i - 1]);
      al2.unshift("-");
      gaps++;
      i--;
    } else {
      al1.unshift("-");
      al2.unshift(s2[j - 1]);
      gaps++;
      j--;
    }
  }

  return {
    sequences: [seq1, seq2],
    alignment: [al1.join(" "), al2.join(" ")],
    score: dp[n][m],
    identity: Math.round((identity / Math.max(n, m)) * 100),
    gaps,
  };
}

/**
 * Multiple sequence alignment (progressive, simplified).
 */
export function multipleAlign(sequences: string[]): AlignmentResult {
  if (sequences.length < 2) {
    return { sequences, alignment: sequences, score: 0, identity: 100, gaps: 0 };
  }

  let best = alignSequences(sequences[0], sequences[1]);
  for (let i = 2; i < sequences.length; i++) {
    const merged = best.alignment[0].replace(/\s/g, "-");
    const next = alignSequences(merged, sequences[i]);
    best = {
      sequences: [...best.sequences, sequences[i]],
      alignment: [...best.alignment, next.alignment[1]],
      score: Math.max(best.score, next.score),
      identity: Math.round((best.identity + next.identity) / 2),
      gaps: best.gaps + next.gaps,
    };
  }
  return best;
}

/**
 * Export peptides to CSV string.
 */
export function peptidesToCSV(peptides: GeneratedPeptide[]): string {
  const headers = [
    "ID", "Sequence", "Length", "Docking Score", "Binding Affinity",
    "Stability", "Specificity", "Solubility", "Membrane Permeability",
    "Unnatural AA Count", "Target", "Created At",
  ];
  const rows = peptides.map((p) => [
    p.id, `"${p.sequence}"`, p.length, p.dockingScore.toFixed(1),
    p.bindingAffinity.toFixed(1), p.stability.toFixed(1),
    p.specificity.toFixed(1), p.solubility.toFixed(1),
    p.membranePermeability.toFixed(1), p.unnaturalCount,
    p.targetId, p.createdAt,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/** Color map for amino acid categories in visualization */
export const AA_COLORS: Record<string, string> = {
  hydrophobic: "#00d4aa",
  polar: "#00b8d9",
  charged: "#7c5ce7",
  special: "#f59e0b",
  unnatural: "#ef4444",
};

export function getAAColor(code: string): string {
  const aa = STANDARD_AA[code] || UNNATURAL_AA[code];
  if (!aa) return "#6b7280";
  return AA_COLORS[aa.category] || "#6b7280";
}
