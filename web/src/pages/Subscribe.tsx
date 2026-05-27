import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { BRAND } from "@/lib/brand";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Sparkles,
  Crown,
  Building2,
  AlertCircle,
} from "lucide-react";

type Step = "plan" | "card" | "otp" | "success";

export default function Subscribe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, activateSubscription, logEvent } = useSubscription();
  const [step, setStep] = useState<Step>("plan");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [txnId, setTxnId] = useState("");

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (isSubscribed(user.email) && step !== "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full glass-card">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You are already subscribed</h1>
            <p className="text-muted-foreground mb-6">
              Full access is unlocked for <span className="text-foreground">{user.email}</span>.
            </p>
            <Button onClick={() => navigate("/generator")} className="w-full">
              Go to Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const startCardPayment = () => {
    setStep("card");
    setError(null);
  };

  const submitCard = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const num = cardNumber.replace(/\s/g, "");
    if (cardName.trim().length < 3) {
      setError("Please enter the cardholder name");
      return;
    }
    if (num.length < 13 || num.length > 19) {
      setError("Card number must be 13–19 digits");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Expiry must be in MM/YY format");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError("CVV must be 3 or 4 digits");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setStep("otp");
      setProcessing(false);
      logEvent("payment_success", `OTP issued for ₹${BRAND.subscription.priceINR} payment`, user.email, {
        last4: num.slice(-4),
      });
    }, 900);
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp !== generatedOtp) {
      setError("Incorrect OTP. Please check the code shown above.");
      logEvent("payment_failed", `OTP mismatch for ${user.email}`, user.email);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const id = `DVKS-${Date.now().toString(36).toUpperCase()}`;
      setTxnId(id);
      activateSubscription(user.email, id);
      setStep("success");
      setProcessing(false);
    }, 1100);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-3">
            <Crown className="w-3.5 h-3.5" />
            {BRAND.company}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Unlock Full Access</h1>
          <p className="text-muted-foreground">
            One plan. Everything included. Pay securely with card + OTP.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["plan", "card", "otp", "success"] as Step[]).map((s, i) => {
            const labels = ["Plan", "Card", "OTP", "Done"];
            const order = ["plan", "card", "otp", "success"];
            const active = order.indexOf(step) >= i;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    active
                      ? "bg-[#00d4aa] text-[#0a0f1e]"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {labels[i]}
                </span>
                {i < 3 && <div className="w-6 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Card className="glass-card overflow-hidden">
                <div className="bg-gradient-to-br from-[#00d4aa]/20 via-[#7c5ce7]/10 to-transparent p-6 border-b border-border/40">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-[#00d4aa]" />
                        <span className="text-xs uppercase tracking-wider text-[#00d4aa] font-semibold">
                          Single Plan
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold">{BRAND.subscription.planName}</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Lifetime full access for {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold tracking-tight">₹2,000</div>
                      <div className="text-xs text-muted-foreground">one-time · INR</div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3 mb-6">
                    {[
                      "Unlimited peptide sequence generation",
                      "Full docking score engine with tunable parameters",
                      "Unnatural amino acid library",
                      "Multiple sequence alignment viewer",
                      "CSV export & persistent project storage",
                      "Priority CDMO consultation channel",
                      "Access to curated research databases & journals",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#00d4aa] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-xl bg-muted/30 border border-border/40 p-4 mb-6 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-foreground font-medium mb-1">
                      <Building2 className="w-3.5 h-3.5 text-[#00d4aa]" />
                      Payment Beneficiary
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-muted-foreground">
                      <span>Account Holder</span>
                      <span className="text-foreground">{BRAND.payment.accountHolder}</span>
                      <span>Account Number</span>
                      <span className="text-foreground font-mono">{BRAND.payment.accountNumber}</span>
                      <span>Bank</span>
                      <span className="text-foreground">{BRAND.payment.bank}</span>
                      <span>Branch</span>
                      <span className="text-foreground">{BRAND.payment.branch}</span>
                    </div>
                  </div>

                  <Button
                    onClick={startCardPayment}
                    className="w-full h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold hover:opacity-90"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹2,000 with Card
                  </Button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Secured by 256-bit TLS · OTP verified
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "card" && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#00d4aa]" />
                      Card Details
                    </h2>
                    <span className="text-sm font-semibold">₹{BRAND.subscription.priceINR}</span>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={submitCard} className="space-y-4">
                    <div>
                      <Label htmlFor="cardName" className="text-sm">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="As printed on card"
                        className="mt-1.5 bg-muted/30"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="mt-1.5 bg-muted/30 font-mono"
                        inputMode="numeric"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiry" className="text-sm">Expiry</Label>
                        <Input
                          id="expiry"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="mt-1.5 bg-muted/30 font-mono"
                          inputMode="numeric"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          className="mt-1.5 bg-muted/30 font-mono"
                          inputMode="numeric"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full h-11 bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold"
                    >
                      {processing ? "Authorizing..." : `Pay ₹${BRAND.subscription.priceINR} & Send OTP`}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Card details are not stored. Demo gateway routes funds to {BRAND.payment.bank}.
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#00d4aa]" />
                    OTP Verification
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    A 6-digit OTP has been sent to the mobile number registered with card ending{" "}
                    <span className="font-mono text-foreground">
                      {cardNumber.replace(/\s/g, "").slice(-4)}
                    </span>.
                  </p>

                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 mb-5 text-xs">
                    <div className="text-amber-300 font-semibold mb-1">Demo OTP (testing only)</div>
                    <div className="font-mono text-lg tracking-[0.4em] text-amber-200">{generatedOtp}</div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={submitOtp} className="space-y-4">
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="••••••"
                      className="bg-muted/30 font-mono text-center text-2xl tracking-[0.5em] h-14"
                      inputMode="numeric"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={processing || otp.length !== 6}
                      className="w-full h-11 bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e] font-semibold"
                    >
                      {processing ? "Verifying..." : "Confirm Payment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-emerald-500/15 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
                  <p className="text-muted-foreground mb-1">
                    ₹{BRAND.subscription.priceINR} credited to {BRAND.payment.accountHolder}
                  </p>
                  <p className="text-xs text-muted-foreground mb-5 font-mono">
                    Txn ID: {txnId}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate("/generator")} className="bg-gradient-to-r from-[#00d4aa] to-[#00b8d9] text-[#0a0f1e]">
                      Start Generating
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/profile")}>
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
