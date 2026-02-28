"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface PercentileRingProps {
  percentile: number;
  color: string;
  size?: number;
}

export default function PercentileRing({ percentile, color, size = 160 }: PercentileRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = isInView ? circumference * (percentile / 100) : 0;

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * percentile));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, percentile]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: circumference - strokeDash } : {}}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}88)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <motion.span
            className="text-4xl font-bold tabular-nums"
            style={{ color, fontVariantNumeric: "tabular-nums" }}
          >
            {displayed}
          </motion.span>
          <span className="text-xs text-white/40 font-medium tracking-widest uppercase">
            percentile
          </span>
        </div>
      </div>
    </div>
  );
}
