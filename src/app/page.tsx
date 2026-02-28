import { Suspense } from "react";
import SalaryForm from "@/components/SalaryForm";

export default function HomePage() {
  return (
    <main className="min-h-screen grid-bg flex flex-col">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-48 -left-48 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #FF9933, transparent)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #F59E0B, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-5"
          style={{ background: "radial-gradient(circle, #FF9933, transparent)" }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <span className="font-display font-bold text-white/80 text-sm tracking-wide">
              SalaryRank<span className="text-saffron">.in</span>
            </span>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            PLFS 2023-24 data
          </div>
        </header>

        {/* Hero */}
        <section className="px-6 pt-8 pb-10 text-center space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-2"
            style={{
              background: "rgba(255,153,51,0.1)",
              border: "1px solid rgba(255,153,51,0.25)",
              color: "#FF9933",
            }}
          >
            ✦ Official Govt. of India Data
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight text-white">
            How do you rank in{" "}
            <span className="gradient-text">India&apos;s salary</span>{" "}
            <span className="gradient-text">ladder?</span>
          </h1>

          <p className="text-white/50 text-base sm:text-lg max-w-sm mx-auto">
            Enter your salary. Get your percentile. Share your result.
          </p>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-6 pt-2 flex-wrap">
            {[
              { value: "₹20,702", label: "India avg/month" },
              { value: "33 states", label: "covered" },
              { value: "17 sectors", label: "industries" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-white font-display">{value}</p>
                <p className="text-xs text-white/35">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form card */}
        <section className="flex-1 px-4 pb-12">
          <div
            className="max-w-lg mx-auto rounded-3xl p-6 sm:p-8 saffron-glow"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Suspense>
              <SalaryForm />
            </Suspense>
          </div>
        </section>

        {/* Trust footer */}
        <footer className="px-6 pb-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              "🔒 No data stored",
              "📊 Govt. data only",
              "⚡ Instant result",
            ].map((item) => (
              <span key={item} className="text-xs text-white/25 font-medium">
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/15">
            Data: Periodic Labour Force Survey 2023-24 · MoSPI, Govt. of India
          </p>
        </footer>
      </div>
    </main>
  );
}
