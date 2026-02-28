"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

interface BellCurveProps {
  percentile: number;
  color: string;
}

const SIGMA = 0.87;

function logNormalPDF(x: number, mean: number): number {
  if (x <= 0) return 0;
  const muLn = Math.log(mean) - (SIGMA * SIGMA) / 2;
  const exponent = -((Math.log(x) - muLn) ** 2) / (2 * SIGMA * SIGMA);
  return (1 / (x * SIGMA * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

function normalCDF(z: number): number {
  const sign = z >= 0 ? 1 : -1;
  const x = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * x);
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const poly = t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  const p = 1 - d * poly;
  return sign === 1 ? p : 1 - p;
}

export default function BellCurve({ percentile, color }: BellCurveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  const W = 420;
  const H = 130;
  const PADDING = { left: 20, right: 20, top: 16, bottom: 8 };

  const mean = 1.0; // normalized
  const xMin = 0.05;
  const xMax = 5.0;
  const POINTS = 300;

  // Build PDF curve
  const points: [number, number][] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS;
    const x = xMin * Math.pow(xMax / xMin, t);
    const y = logNormalPDF(x, mean);
    points.push([x, y]);
  }
  const maxY = Math.max(...points.map(([, y]) => y));

  const toSVG = (x: number, y: number): [number, number] => {
    const sx =
      PADDING.left +
      ((Math.log(x) - Math.log(xMin)) / (Math.log(xMax) - Math.log(xMin))) *
        (W - PADDING.left - PADDING.right);
    const sy = PADDING.top + (1 - y / maxY) * (H - PADDING.top - PADDING.bottom);
    return [sx, sy];
  };

  const curvePath =
    "M " +
    points
      .map(([x, y]) => {
        const [sx, sy] = toSVG(x, y);
        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
      })
      .join(" L ");

  // User salary position
  const muLn = Math.log(mean) - (SIGMA * SIGMA) / 2;
  const userZ = (percentile / 100 - 0.5) / 0.3; // rough inverse CDF
  // More accurate: find x such that normalCDF((ln(x)-muLn)/SIGMA) = percentile/100
  // Use binary search
  let lo = xMin, hi = xMax;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const p = normalCDF((Math.log(mid) - muLn) / SIGMA) * 100;
    if (p < percentile) lo = mid;
    else hi = mid;
  }
  const userX = (lo + hi) / 2;
  const userY = logNormalPDF(userX, mean);
  const [userSX, userSY] = toSVG(userX, userY);

  // Filled area to the left of userX (percentile shading)
  const leftPoints = points.filter(([x]) => x <= userX);
  const fillPath =
    leftPoints.length > 1
      ? `M ${toSVG(leftPoints[0][0], 0)[0]},${H - PADDING.bottom} ` +
        leftPoints
          .map(([x, y]) => {
            const [sx, sy] = toSVG(x, y);
            return `L ${sx.toFixed(1)},${sy.toFixed(1)}`;
          })
          .join(" ") +
        ` L ${toSVG(leftPoints[leftPoints.length - 1][0], 0)[0]},${H - PADDING.bottom} Z`
      : "";

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="fillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
          <clipPath id="fillClip">
            <motion.rect
              x={PADDING.left}
              y={0}
              width={isInView ? userSX - PADDING.left : 0}
              height={H}
              initial={{ width: 0 }}
              animate={isInView ? { width: userSX - PADDING.left } : {}}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
            />
          </clipPath>
          <clipPath id="curveClip">
            <motion.rect
              x={0}
              y={0}
              height={H}
              width={W}
              initial={{ width: 0 }}
              animate={isInView ? { width: W } : {}}
              transition={{ duration: 1.6, delay: 0.1, ease: "easeOut" }}
            />
          </clipPath>
        </defs>

        {/* Baseline */}
        <line
          x1={PADDING.left}
          y1={H - PADDING.bottom}
          x2={W - PADDING.right}
          y2={H - PADDING.bottom}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Shaded area */}
        {fillPath && (
          <path
            d={fillPath}
            fill="url(#fillGrad)"
            clipPath="url(#fillClip)"
          />
        )}

        {/* Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
          clipPath="url(#curveClip)"
        />

        {/* User marker line */}
        <motion.line
          x1={userSX}
          y1={H - PADDING.bottom}
          x2={userSX}
          y2={userSY}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.5 }}
        />

        {/* User dot */}
        <motion.circle
          cx={userSX}
          cy={userSY}
          r="5"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.6, type: "spring" }}
        />
        <motion.circle
          cx={userSX}
          cy={userSY}
          r="9"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity="0.4"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.7 }}
        />

        {/* You label */}
        <motion.text
          x={userSX}
          y={userSY - 14}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={color}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.8 }}
        >
          YOU
        </motion.text>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-white/25 mt-1 px-4">
        <span>Low earners</span>
        <span>High earners</span>
      </div>
    </div>
  );
}
