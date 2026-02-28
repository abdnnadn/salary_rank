import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ResultDisplay from "@/components/ResultDisplay";
import { computeResult, INDUSTRIES, STATE_DATA, formatINR } from "@/lib/salary-data";

interface PageProps {
  searchParams: Promise<{ salary?: string; state?: string; industry?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const salary = parseInt(params.salary ?? "0", 10);
  const stateName = decodeURIComponent(params.state ?? "");
  const industryKey = params.industry ?? "OTHER";

  if (!salary || !stateName || !STATE_DATA[stateName]) {
    return { title: "India Salary Rank" };
  }

  const result = computeResult(salary, stateName, industryKey);
  const industry = INDUSTRIES[industryKey] ?? INDUSTRIES.OTHER;
  const percentile = result.headlinePercentile;

  const ordinal = (n: number) => {
    if (n >= 11 && n <= 13) return `${n}th`;
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  const title = `I'm in the ${ordinal(percentile)} percentile of earners in ${stateName}!`;
  const description = `${formatINR(salary)}/month puts me in the ${ordinal(percentile)} percentile among salaried employees in ${stateName} (${industry.label}). Based on official PLFS 2023-24 data. Find out where YOU stand!`;

  const ogUrl = `/api/og?salary=${salary}&state=${encodeURIComponent(stateName)}&industry=${industryKey}&percentile=${percentile}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function ResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const salary = parseInt(params.salary ?? "0", 10);
  const stateName = decodeURIComponent(params.state ?? "");
  const industryKey = params.industry ?? "OTHER";

  if (!salary || salary < 1000 || !stateName || !STATE_DATA[stateName]) {
    notFound();
  }

  return (
    <main className="min-h-screen grid-bg flex flex-col">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #FF9933, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #F59E0B, transparent)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🇮🇳</span>
            <span className="font-display font-bold text-white/60 group-hover:text-white/80 transition-colors text-sm tracking-wide">
              SalaryRank<span className="text-saffron">.in</span>
            </span>
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            ← Check yours
          </Link>
        </header>

        {/* Result */}
        <section className="px-4 pt-4 pb-12">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
              </div>
            }
          >
            <ResultDisplay
              salary={salary}
              stateName={stateName}
              industryKey={industryKey}
            />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
