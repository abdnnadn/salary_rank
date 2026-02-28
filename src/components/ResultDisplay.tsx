"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  computeResult,
  INDUSTRIES,
  getPercentileLabel,
  getPercentileColor,
  formatINR,
} from "@/lib/salary-data";
import BellCurve from "./BellCurve";
import PercentileRing from "./PercentileRing";
import ShareButtons from "./ShareButtons";

interface ResultDisplayProps {
  salary: number;
  stateName: string;
  industryKey: string;
}

interface ParticleData {
  color: string;
  x: number;
  xEnd: number;
  rotation: number;
  duration: number;
  isCircle: boolean;
}

function Particle({ p }: { p: ParticleData }) {
  return (
    <motion.div
      initial={{ y: -10, x: `${p.x}vw`, opacity: 1, rotate: p.rotation }}
      animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotation + 720, x: `${p.xEnd}vw` }}
      transition={{ duration: p.duration, ease: "easeIn" }}
      className="fixed top-0 pointer-events-none z-50"
      style={{
        width: 8,
        height: 8,
        borderRadius: p.isCircle ? "50%" : "2px",
        backgroundColor: p.color,
      }}
    />
  );
}

function Confetti({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    if (!show) return;
    const colors = ["#FF9933", "#F59E0B", "#FBBF24", "#FCD34D", "#22C55E"];
    setParticles(
      Array.from({ length: 60 }, () => {
        const x = Math.random() * 100;
        return {
          color: colors[Math.floor(Math.random() * colors.length)],
          x,
          xEnd: x + (Math.random() - 0.5) * 20,
          rotation: Math.random() * 360,
          duration: 2.5 + Math.random() * 2,
          isCircle: Math.random() > 0.5,
        };
      })
    );
  }, [show]);

  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} p={p} />
      ))}
    </>
  );
}

interface StatCardProps {
  label: string;
  avg: string;
  multiplier: number;
  percentile: number;
  color: string;
  delay: number;
}

function StatCard({ label, avg, multiplier, percentile, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-2xl p-4 space-y-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-white">{avg}</p>
          <p className="text-xs text-white/40">avg/month</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums" style={{ color }}>
            {multiplier}×
          </p>
          <p className="text-xs text-white/40">your multiple</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color, maxWidth: "100%" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentile, 100)}%` }}
            transition={{ delay: delay + 0.3, duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>
          {percentile}th
        </span>
      </div>
    </motion.div>
  );
}

export default function ResultDisplay({ salary, stateName, industryKey }: ResultDisplayProps) {
  const result = computeResult(salary, stateName, industryKey);
  const industry = INDUSTRIES[industryKey] ?? INDUSTRIES.OTHER;
  const color = getPercentileColor(result.headlinePercentile);
  const label = getPercentileLabel(result.headlinePercentile);

  const showConfetti = result.headlinePercentile >= 75;

  const ordinal = (n: number) => {
    if (n >= 11 && n <= 13) return `${n}th`;
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  return (
    <>
      <Confetti show={showConfetti} />

      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* ── Headline card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Glow background */}
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${color}, transparent 70%)`,
            }}
          />

          <div className="relative p-6 sm:p-8 text-center space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                background: `${color}18`,
                border: `1px solid ${color}35`,
                color,
              }}
            >
              {label}
            </motion.div>

            {/* Ring + headline */}
            <div className="flex flex-col items-center gap-4">
              <PercentileRing percentile={result.headlinePercentile} color={color} size={160} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="space-y-1"
              >
                <p className="text-lg font-semibold text-white/80">
                  Better than{" "}
                  <span style={{ color }} className="font-bold">
                    {result.headlinePercentile}%
                  </span>{" "}
                  of salaried workers
                </p>
                <p className="text-white/40 text-sm">
                  in <span className="text-white/70 font-medium">{stateName}</span>
                  {" • "}
                  <span className="text-white/70 font-medium">{industry.label}</span>
                </p>
              </motion.div>
            </div>

            {/* Your salary chip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <div
                className="px-4 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-xs text-white/40 mb-0.5">Your salary</p>
                <p className="text-xl font-bold text-white">{formatINR(salary)}<span className="text-sm text-white/40">/mo</span></p>
              </div>
              <div className="text-white/30 text-xl">vs</div>
              <div
                className="px-4 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-xs text-white/40 mb-0.5">State average</p>
                <p className="text-xl font-bold text-white/80">{formatINR(result.stateAvg)}<span className="text-sm text-white/40">/mo</span></p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Bell curve ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-3xl p-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-xs text-white/40 font-medium uppercase tracking-widest mb-4">
            Wage distribution — where you sit
          </p>
          <BellCurve percentile={result.headlinePercentile} color={color} />
        </motion.div>

        {/* ── Comparison cards ─────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-widest font-medium pl-1">
            Three lenses
          </p>
          <StatCard
            label={`vs ${stateName} average`}
            avg={formatINR(result.stateAvg)}
            multiplier={result.stateMultiplier}
            percentile={result.statePercentile}
            color={getPercentileColor(result.statePercentile)}
            delay={0.6}
          />
          <StatCard
            label="vs All-India average"
            avg={formatINR(result.indiaAvg)}
            multiplier={result.indiaMultiplier}
            percentile={result.indiaPercentile}
            color={getPercentileColor(result.indiaPercentile)}
            delay={0.75}
          />
          <StatCard
            label={`vs ${industry.label} (national)`}
            avg={formatINR(result.industryAvg)}
            multiplier={result.industryMultiplier}
            percentile={result.industryPercentile}
            color={getPercentileColor(result.industryPercentile)}
            delay={0.9}
          />
        </div>

        {/* ── Share ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="rounded-3xl p-5"
          style={{
            background: "rgba(255,153,51,0.06)",
            border: "1px solid rgba(255,153,51,0.18)",
          }}
        >
          <ShareButtons
            salary={salary}
            stateName={stateName}
            industryKey={industryKey}
            percentile={result.headlinePercentile}
            industryLabel={industry.label}
          />
        </motion.div>

        {/* ── Data footnote ─────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center text-white/20 text-xs leading-relaxed pb-8"
        >
          Source: Periodic Labour Force Survey (PLFS) 2023-24, Ministry of Statistics & Programme Implementation (MoSPI), Govt. of India.
          Percentile estimated using log-normal distribution (σ=0.87, calibrated to India wage Gini ≈ 0.45).
          Industry averages from PLFS Annual Report industry tables.
        </motion.p>
      </div>
    </>
  );
}
