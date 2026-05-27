import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlignCenter,
  Plus,
  Trash2,
  ArrowRight,
  Download,
  Copy,
} from "lucide-react";
import {
  alignSequences,
  multipleAlign,
  AA_COLORS,
  type AlignmentResult,
  type GeneratedPeptide,
} from "@/lib/peptide-engine";
import { toast } from "sonner";

const sampleSequences = [
  "H-A-E-G-T-F-Aib-dA-K",
  "H-A-D-G-T-F-A-K-L",
  "K-R-S-T-Y-W-dK-V-I",
  "F-W-L-I-V-K-R-Nle-F",
];

export default function Alignment() {
  const [sequences, setSequences] = useState<string[]>([sampleSequences[0], sampleSequences[1]]);
  const [newSeq, setNewSeq] = useState("");
  const [result, setResult] = useState<AlignmentResult | null>(null);

  const handleAdd = () => {
    const trimmed = newSeq.trim();
    if (!trimmed) return;
    if (sequences.length >= 6) {
      toast.error("Maximum 6 sequences for alignment");
      return;
    }
    setSequences((prev) => [...prev, trimmed]);
    setNewSeq("");
  };

  const handleRemove = (index: number) => {
    if (sequences.length <= 2) return;
    setSequences((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleAlign = useCallback(() => {
    if (sequences.length < 2) return;
    const res = sequences.length === 2
      ? alignSequences(sequences[0], sequences[1])
      : multipleAlign(sequences);
    setResult(res);
    toast.success(`Alignment score: ${res.score}`);
  }, [sequences]);

  const handleExportAlignment = () => {
    if (!result) return;
    const text = result.alignment.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alignment-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Alignment exported");
  };

  const handleUseSample = (seq: string) => {
    if (sequences.includes(seq)) {
      toast.error("Sequence already added");
      return;
    }
    setSequences((prev) => [...prev, seq]);
    setResult(null);
  };

  const getColorForResidue = (code: string): string => {
    const cats: Record<string, string> = {
      hydrophobic: "#00d4aa",
      polar: "#00b8d9",
      charged: "#7c5ce7",
      special: "#f59e0b",
      unnatural: "#ef4444",
    };
    const standard: Record<string, string> = {
      A: "hydrophobic", C: "special", D: "charged", E: "charged",
      F: "hydrophobic", G: "special", H: "charged", I: "hydrophobic",
      K: "charged", L: "hydrophobic", M: "hydrophobic", N: "polar",
      P: "special", Q: "polar", R: "charged", S: "polar",
      T: "polar", V: "hydrophobic", W: "hydrophobic", Y: "polar",
    };
    if (standard[code]) return cats[standard[code]];
    // Check unnaturals
    if (["dA","dF","dK","dR","Aib","bA","Nle","Orn","Cit","Sar","Sta","Hyp"].includes(code)) {
      return cats.unnatural;
    }
    return "#6b7280";
  };

  const hasMatchAt = (col: number, row: number): boolean => {
    if (!result) return false;
    const cols = result.alignment.map((r) => r.split(/\s+/).filter(Boolean));
    const residue = row < cols.length ? cols[row]?.[col] : undefined;
    if (!residue || residue === "-") return false;
    // Check if any other row has the same residue at this column
    for (let r = 0; r < cols.length; r++) {
      if (r !== row && cols[r]?.[col] === residue) return true;
    }
    return false;
  };

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
            <div className="w-10 h-10 rounded-xl bg-[#7c5ce7]/15 flex items-center justify-center">
              <AlignCenter className="w-5 h-5 text-[#7c5ce7]" />
            </div>
            <h1 className="text-3xl font-bold">Sequence Alignment</h1>
          </motion.div>
          <p className="text-muted-foreground">
            Global pairwise and progressive multiple sequence alignment using Needleman-Wunsch.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-5">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Input Sequences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sequences.map((seq, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <Label className="text-xs text-muted-foreground">Sequence {i + 1}</Label>
                        {sequences.length > 2 && (
                          <button
                            onClick={() => handleRemove(i)}
                            className="text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        value={seq}
                        onChange={(e) => {
                          const newSeqs = [...sequences];
                          newSeqs[i] = e.target.value;
                          setSequences(newSeqs);
                          setResult(null);
                        }}
                        className="w-full font-mono text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#7c5ce7]/50"
                        placeholder="e.g. H-A-E-G-T-F"
                      />
                    </div>
                  </div>
                ))}

                {/* Add new sequence */}
                {sequences.length < 6 && (
                  <div className="flex gap-2">
                    <input
                      value={newSeq}
                      onChange={(e) => setNewSeq(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      placeholder="Add another sequence..."
                      className="flex-1 font-mono text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#7c5ce7]/50"
                    />
                    <Button
                      size="sm"
                      onClick={handleAdd}
                      className="bg-[#7c5ce7] hover:bg-[#7c5ce7]/90 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleAlign}
                  className="w-full bg-gradient-to-r from-[#7c5ce7] to-[#00b8d9] text-white font-semibold"
                >
                  <AlignCenter className="w-4 h-4 mr-2" />
                  Align Sequences
                </Button>
              </CardContent>
            </Card>

            {/* Sample sequences */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">Sample Sequences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sampleSequences.map((seq) => (
                    <button
                      key={seq}
                      onClick={() => handleUseSample(seq)}
                      className="font-mono text-xs px-2.5 py-1.5 rounded-lg border border-border hover:border-[#7c5ce7]/50 text-muted-foreground hover:text-foreground transition-all truncate max-w-full"
                    >
                      {seq.slice(0, 25)}...
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">Color Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {Object.entries(AA_COLORS).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground capitalize">{cat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!result ? (
              <Card className="glass-card p-12 text-center h-full flex items-center justify-center">
                <div className="max-w-sm">
                  <AlignCenter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Alignment Results</h2>
                  <p className="text-muted-foreground">
                    Enter two or more peptide sequences and click "Align Sequences" to see the result.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Stats bar */}
                <Card className="glass-card">
                  <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#7c5ce7]/15 text-[#7c5ce7] border-0 font-mono">
                        Score: {result.score}
                      </Badge>
                      <Badge className="bg-[#00d4aa]/15 text-[#00d4aa] border-0">
                        Identity: {result.identity}%
                      </Badge>
                      <Badge variant="outline">
                        Gaps: {result.gaps}
                      </Badge>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="ghost" onClick={handleExportAlignment} className="text-muted-foreground hover:text-[#00d4aa]">
                        <Download className="w-4 h-4 mr-1.5" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Alignment visualization */}
                <Card className="glass-card overflow-x-auto">
                  <CardContent className="p-4">
                    <div className="scrollbar-thin overflow-x-auto">
                      <div className="font-mono text-sm leading-relaxed min-w-max">
                        {result.alignment.map((aligned, rowIdx) => {
                          const residues = aligned.split(/\s+/).filter(Boolean);
                          return (
                            <div key={rowIdx} className="flex mb-1">
                              <span className="text-muted-foreground w-14 shrink-0 text-right pr-3 select-none">
                                Seq {rowIdx + 1}
                              </span>
                              <div className="flex">
                                {residues.map((aa, colIdx) => {
                                  const isGap = aa === "-";
                                  const isMatch = !isGap && hasMatchAt(colIdx, rowIdx);
                                  return (
                                    <span
                                      key={colIdx}
                                      className={`inline-block w-7 text-center ${
                                        isGap
                                          ? "text-muted-foreground/20"
                                          : isMatch
                                          ? "font-bold"
                                          : "opacity-80"
                                      }`}
                                      style={{
                                        color: isGap ? undefined : getColorForResidue(aa),
                                        backgroundColor: isMatch
                                          ? `${getColorForResidue(aa)}20`
                                          : isGap
                                          ? "transparent"
                                          : undefined,
                                        borderRadius: isMatch ? "2px" : undefined,
                                      }}
                                      title={aa}
                                    >
                                      {aa}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Consensus bar */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Consensus: </span>
                      <span className="font-mono">
                        {result.alignment[0].split(/\s+/).filter(Boolean).map((_, colIdx) => {
                          const cols = result.alignment.map((r) => r.split(/\s+/).filter(Boolean));
                          const residues = cols.map((c) => c[colIdx]).filter((r) => r !== "-");
                          if (residues.length === 0) return "-";
                          // Most common residue
                          const counts: Record<string, number> = {};
                          for (const r of residues) counts[r] = (counts[r] || 0) + 1;
                          const consensus = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                          const allSame = residues.every((r) => r === consensus[0]);
                          return (
                            <span
                              key={colIdx}
                              className={allSame ? "font-bold" : "opacity-60"}
                              style={{ color: getColorForResidue(consensus[0]) }}
                            >
                              {consensus[0]}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
