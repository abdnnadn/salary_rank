"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { STATES, INDUSTRIES } from "@/lib/salary-data";

type Step = 1 | 2 | 3;

export default function SalaryForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [salary, setSalary] = useState("");
  const [state, setState] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredStates = STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const salaryNum = parseInt(salary.replace(/,/g, ""), 10);
  const isValidSalary = salaryNum >= 1000 && salaryNum <= 10000000;

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setSalary(raw);
  };

  const handleSubmit = () => {
    if (!isValidSalary || !state || !industry) return;
    setLoading(true);
    router.push(
      `/result?salary=${salaryNum}&state=${encodeURIComponent(state)}&industry=${industry}`
    );
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="flex items-center gap-2 justify-center mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <motion.div
            key={s}
            animate={{
              width: step === s ? 24 : 8,
              backgroundColor: step >= s ? "#FF9933" : "rgba(255,255,255,0.15)",
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Salary ─────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-saffron tracking-widest uppercase">
                Step 1 of 3
              </p>
              <h2 className="text-2xl font-bold text-white">
                What&apos;s your monthly salary?
              </h2>
              <p className="text-white/50 text-sm">
                Enter your take-home or CTC — we compare gross to gross
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-saffron/20 to-gold-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div
                className="relative flex items-center rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="pl-5 text-2xl font-bold text-white/40">₹</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={salary ? parseInt(salary).toLocaleString("en-IN") : ""}
                  onChange={handleSalaryChange}
                  placeholder="50,000"
                  autoFocus
                  className="flex-1 px-3 py-5 text-2xl font-bold bg-transparent text-white placeholder-white/15 outline-none"
                  onKeyDown={(e) => e.key === "Enter" && isValidSalary && setStep(2)}
                />
                <span className="pr-5 text-sm text-white/30 font-medium whitespace-nowrap">
                  / month
                </span>
              </div>
            </div>

            {salary && !isValidSalary && (
              <p className="text-center text-red-400 text-sm">
                Enter a salary between ₹1,000 and ₹1 crore
              </p>
            )}

            <motion.button
              onClick={() => setStep(2)}
              disabled={!isValidSalary}
              whileHover={isValidSalary ? { scale: 1.02 } : {}}
              whileTap={isValidSalary ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: isValidSalary
                  ? "linear-gradient(135deg, #FF9933, #F59E0B)"
                  : "rgba(255,255,255,0.08)",
                color: isValidSalary ? "#000" : "rgba(255,255,255,0.3)",
                boxShadow: isValidSalary ? "0 8px 32px rgba(255,153,51,0.3)" : "none",
              }}
            >
              Continue →
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 2: State ──────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-saffron tracking-widest uppercase">
                Step 2 of 3
              </p>
              <h2 className="text-2xl font-bold text-white">
                Which state do you work in?
              </h2>
              <p className="text-white/50 text-sm">
                We use state-level salary data from PLFS 2023-24
              </p>
            </div>

            {/* Search */}
            <div
              className="relative flex items-center rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg className="ml-4 w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="Search state..."
                autoFocus
                className="flex-1 px-3 py-4 bg-transparent text-white placeholder-white/20 outline-none"
              />
            </div>

            {/* State list */}
            <div
              className="rounded-2xl overflow-y-auto max-h-60 space-y-1 p-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {filteredStates.length === 0 && (
                <p className="text-center text-white/30 py-4 text-sm">No state found</p>
              )}
              {filteredStates.map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setState(s)}
                  whileHover={{ backgroundColor: "rgba(255,153,51,0.08)" }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: state === s ? "#FF9933" : "rgba(255,255,255,0.7)",
                    backgroundColor: state === s ? "rgba(255,153,51,0.12)" : "transparent",
                    border: state === s ? "1px solid rgba(255,153,51,0.25)" : "1px solid transparent",
                  }}
                >
                  {state === s && <span className="mr-2">✓</span>}
                  {s}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setStep(1)}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-4 rounded-2xl text-sm font-medium text-white/50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                ← Back
              </motion.button>
              <motion.button
                onClick={() => setStep(3)}
                disabled={!state}
                whileHover={state ? { scale: 1.02 } : {}}
                whileTap={state ? { scale: 0.98 } : {}}
                className="flex-1 py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: state
                    ? "linear-gradient(135deg, #FF9933, #F59E0B)"
                    : "rgba(255,255,255,0.08)",
                  color: state ? "#000" : "rgba(255,255,255,0.3)",
                  boxShadow: state ? "0 8px 32px rgba(255,153,51,0.3)" : "none",
                }}
              >
                Continue →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Industry ───────────────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-saffron tracking-widest uppercase">
                Step 3 of 3
              </p>
              <h2 className="text-2xl font-bold text-white">
                What industry do you work in?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {Object.entries(INDUSTRIES).map(([key, info]) => (
                <motion.button
                  key={key}
                  onClick={() => setIndustry(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl text-left text-sm font-medium transition-all"
                  style={{
                    background:
                      industry === key
                        ? "rgba(255,153,51,0.12)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      industry === key
                        ? "1px solid rgba(255,153,51,0.35)"
                        : "1px solid rgba(255,255,255,0.06)",
                    color: industry === key ? "#FF9933" : "rgba(255,255,255,0.65)",
                  }}
                >
                  <span className="text-xl shrink-0">{info.emoji}</span>
                  <span className="leading-tight">{info.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setStep(2)}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-4 rounded-2xl text-sm font-medium text-white/50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                ← Back
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={!industry || loading}
                whileHover={industry ? { scale: 1.02 } : {}}
                whileTap={industry ? { scale: 0.98 } : {}}
                className="flex-1 py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: industry
                    ? "linear-gradient(135deg, #FF9933, #F59E0B)"
                    : "rgba(255,255,255,0.08)",
                  color: industry ? "#000" : "rgba(255,255,255,0.3)",
                  boxShadow: industry ? "0 8px 32px rgba(255,153,51,0.3)" : "none",
                }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Calculating...
                  </>
                ) : (
                  "Reveal My Rank 🔥"
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
