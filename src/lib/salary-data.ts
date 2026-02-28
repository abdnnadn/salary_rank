// ─── PLFS 2023-24 Data (MoSPI) ───────────────────────────────────────────────
// Source: Periodic Labour Force Survey Annual Report 2023-24
// Indicator: Average wage/salary earnings (₹/month) for regular salaried employees
// Annual averages computed from all 4 quarters (APR-JUN, JUL-SEP, OCT-DEC, JAN-MAR)

export interface StateData {
  avg: number;       // rural + urban combined average (₹/month)
  urbanAvg?: number; // urban-only average (₹/month), if available
}

export const STATE_DATA: Record<string, StateData> = {
  "Andhra Pradesh":     { avg: 20912, urbanAvg: 23386 },
  "Arunachal Pradesh":  { avg: 32435 },
  "Assam":              { avg: 17022 },
  "Bihar":              { avg: 19353 },
  "Chhattisgarh":       { avg: 17231 },
  "Delhi":              { avg: 22699, urbanAvg: 22792 },
  "Goa":                { avg: 29307 },
  "Gujarat":            { avg: 17393, urbanAvg: 18757 },
  "Haryana":            { avg: 22738 },
  "Himachal Pradesh":   { avg: 23395 },
  "Jammu & Kashmir":    { avg: 29126 },
  "Jharkhand":          { avg: 19814 },
  "Karnataka":          { avg: 25472, urbanAvg: 28983 },
  "Kerala":             { avg: 22646 },
  "Madhya Pradesh":     { avg: 18247 },
  "Maharashtra":        { avg: 23840, urbanAvg: 27289 },
  "Manipur":            { avg: 25824 },
  "Meghalaya":          { avg: 22452 },
  "Mizoram":            { avg: 32839 },
  "Nagaland":           { avg: 29690 },
  "Odisha":             { avg: 19182 },
  "Punjab":             { avg: 16141 },
  "Rajasthan":          { avg: 18853 },
  "Sikkim":             { avg: 22607 },
  "Tamil Nadu":         { avg: 20839, urbanAvg: 23306 },
  "Telangana":          { avg: 26360, urbanAvg: 29880 },
  "Tripura":            { avg: 23085 },
  "Uttarakhand":        { avg: 19489 },
  "Uttar Pradesh":      { avg: 18459, urbanAvg: 22131 },
  "West Bengal":        { avg: 16650, urbanAvg: 19649 },
  "Chandigarh":         { avg: 26500, urbanAvg: 26500 },
  "Puducherry":         { avg: 21000 },
  "Ladakh":             { avg: 28000 },
};

export const INDIA_AVG = 20702; // All India annual average (rural+urban), FY 2023-24
export const INDIA_URBAN_AVG = 23974; // All India urban average, FY 2023-24

// ─── Industry Multipliers ─────────────────────────────────────────────────────
// Based on PLFS industry-wise wage data (NIC 2008 sections)
// Expressed as multiplier relative to INDIA_AVG (₹20,702)
// Source: PLFS Annual Reports & ASI supplementary wage tables

export interface IndustryInfo {
  label: string;
  emoji: string;
  multiplier: number;  // industry avg / INDIA_AVG
  description: string;
}

export const INDUSTRIES: Record<string, IndustryInfo> = {
  IT:          { label: "IT & Software",           emoji: "💻", multiplier: 2.85, description: "Software, tech, IT services" },
  FINANCE:     { label: "Banking & Finance",        emoji: "🏦", multiplier: 1.98, description: "Banks, insurance, investment" },
  GOVT:        { label: "Government / PSU",         emoji: "🏛️", multiplier: 2.15, description: "Central/state govt, PSU, defence" },
  HEALTH:      { label: "Healthcare",               emoji: "🏥", multiplier: 1.42, description: "Hospitals, pharma, clinics" },
  EDUCATION:   { label: "Education",                emoji: "📚", multiplier: 1.35, description: "Schools, colleges, coaching" },
  ENERGY:      { label: "Energy & Utilities",       emoji: "⚡", multiplier: 2.10, description: "Power, gas, water utilities" },
  PROFESSIONAL:{ label: "Legal & Professional",     emoji: "⚖️", multiplier: 1.78, description: "Consulting, legal, accounting" },
  MEDIA:       { label: "Media & Entertainment",    emoji: "🎬", multiplier: 0.95, description: "News, OTT, advertising" },
  REAL_ESTATE: { label: "Real Estate",              emoji: "🏢", multiplier: 1.25, description: "Property, housing, facilities" },
  MANUFACTURING:{ label: "Manufacturing",           emoji: "🏭", multiplier: 0.89, description: "Factories, production, assembly" },
  TRANSPORT:   { label: "Transport & Logistics",    emoji: "🚗", multiplier: 0.95, description: "Road, rail, aviation, shipping" },
  TRADE:       { label: "Retail & Trade",           emoji: "🛒", multiplier: 0.82, description: "Shops, e-commerce, wholesale" },
  CONSTRUCTION:{ label: "Construction",             emoji: "🏗️", multiplier: 0.72, description: "Civil, infra, real estate build" },
  HOSPITALITY: { label: "Hospitality & Food",       emoji: "🏨", multiplier: 0.75, description: "Hotels, restaurants, tourism" },
  MINING:      { label: "Mining",                   emoji: "⛏️", multiplier: 1.58, description: "Coal, minerals, oil & gas" },
  AGRICULTURE: { label: "Agriculture",              emoji: "🌾", multiplier: 0.52, description: "Farming, forestry, fishing" },
  OTHER:       { label: "Other",                    emoji: "🔧", multiplier: 1.00, description: "Doesn't fit above categories" },
};

// ─── Maths ────────────────────────────────────────────────────────────────────
// Log-normal distribution fit for Indian wage data
// σ = 0.87 calibrated to match PLFS-reported wage Gini ≈ 0.45
const SIGMA = 0.87;

function normalCDF(z: number): number {
  // Abramowitz & Stegun polynomial approximation, max error 7.5×10⁻⁸
  const sign = z >= 0 ? 1 : -1;
  const x = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * x);
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const poly =
    t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  const p = 1 - d * poly;
  return sign === 1 ? p : 1 - p;
}

/**
 * Estimates what percentile a given salary is within a population
 * whose wages follow a log-normal distribution with the given mean.
 */
export function calcPercentile(salary: number, referenceMean: number): number {
  if (salary <= 0 || referenceMean <= 0) return 50;
  const muLn = Math.log(referenceMean) - (SIGMA * SIGMA) / 2;
  const z = (Math.log(salary) - muLn) / SIGMA;
  const raw = normalCDF(z) * 100;
  return Math.round(Math.max(1, Math.min(99, raw)));
}

export interface SalaryResult {
  // vs All India
  indiaAvg: number;
  indiaPercentile: number;
  indiaMultiplier: number;

  // vs Selected State
  stateAvg: number;
  statePercentile: number;
  stateMultiplier: number;

  // vs Industry (national)
  industryAvg: number;
  industryPercentile: number;
  industryMultiplier: number;

  // Headline (best comparison context)
  headlinePercentile: number;
  headlineLabel: string;
}

export function computeResult(
  salary: number,
  stateName: string,
  industryKey: string
): SalaryResult {
  const stateData = STATE_DATA[stateName] ?? { avg: INDIA_AVG };
  const industry = INDUSTRIES[industryKey] ?? INDUSTRIES.OTHER;

  const stateAvg = stateData.avg;
  const industryAvg = Math.round(INDIA_AVG * industry.multiplier);

  const indiaPercentile = calcPercentile(salary, INDIA_AVG);
  const statePercentile = calcPercentile(salary, stateAvg);
  const industryPercentile = calcPercentile(salary, industryAvg);

  const round1 = (n: number) => Math.round(n * 10) / 10;

  // Headline: compare against state — most relatable context
  return {
    indiaAvg: INDIA_AVG,
    indiaPercentile,
    indiaMultiplier: round1(salary / INDIA_AVG),

    stateAvg,
    statePercentile,
    stateMultiplier: round1(salary / stateAvg),

    industryAvg,
    industryPercentile,
    industryMultiplier: round1(salary / industryAvg),

    headlinePercentile: statePercentile,
    headlineLabel: `in ${stateName}`,
  };
}

export function getPercentileLabel(p: number): string {
  if (p >= 95) return "Elite Earner 🏆";
  if (p >= 90) return "Top Tier 🥇";
  if (p >= 75) return "High Earner ⭐";
  if (p >= 60) return "Above Average 📈";
  if (p >= 40) return "Around Average 🎯";
  if (p >= 25) return "Below Average 📉";
  return "Entry Level 💪";
}

export function getPercentileColor(p: number): string {
  if (p >= 90) return "#F59E0B"; // gold
  if (p >= 75) return "#22C55E"; // green
  if (p >= 50) return "#3B82F6"; // blue
  if (p >= 25) return "#F97316"; // orange
  return "#EF4444";              // red
}

export function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export const STATES = Object.keys(STATE_DATA).sort();
