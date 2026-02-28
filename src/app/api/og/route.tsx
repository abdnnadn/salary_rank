import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { computeResult, INDUSTRIES, STATE_DATA, formatINR, getPercentileColor } from "@/lib/salary-data";

export const runtime = "edge";

const ordinal = (n: number) => {
  if (n >= 11 && n <= 13) return `${n}th`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const salary = parseInt(searchParams.get("salary") ?? "0", 10);
  const stateName = decodeURIComponent(searchParams.get("state") ?? "");
  const industryKey = searchParams.get("industry") ?? "OTHER";

  const validState = STATE_DATA[stateName];
  const industry = INDUSTRIES[industryKey] ?? INDUSTRIES.OTHER;

  let percentile = parseInt(searchParams.get("percentile") ?? "0", 10);
  let stateAvg = validState?.avg ?? 20702;
  let salaryMultiplier = "1.0";

  if (salary && validState) {
    const result = computeResult(salary, stateName, industryKey);
    percentile = result.headlinePercentile;
    stateAvg = result.stateAvg;
    salaryMultiplier = result.stateMultiplier.toString();
  }

  const color = getPercentileColor(percentile);

  // Bar chart data — rough percentile distribution
  const bars = [10, 25, 45, 35, 20, 15, 10, 8, 6, 5];
  const maxBar = Math.max(...bars);
  const userBarIndex = Math.min(Math.floor(percentile / 10), 9);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${color}25, transparent 70%)`,
          }}
        />

        {/* Left glow */}
        <div
          style={{
            position: "absolute",
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, #F59E0B15, transparent)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "48px 60px",
            height: "100%",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>🇮🇳</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                SalaryRank.in
              </span>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
              }}
            >
              PLFS 2023-24 · MoSPI
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 48,
              marginTop: 32,
            }}
          >
            {/* Left: Big number */}
            <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: color,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Salary Percentile
              </div>
              <div
                style={{
                  fontSize: 140,
                  fontWeight: 900,
                  color,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  textShadow: `0 0 60px ${color}60`,
                }}
              >
                {percentile}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.05em",
                }}
              >
                {ordinal(percentile)} percentile
              </div>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Better than{" "}
                  <span style={{ color, fontWeight: 700 }}>{percentile}%</span>{" "}
                  of earners in {stateName}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
                  {industry.emoji} {industry.label} · {validState ? formatINR(stateAvg) : "—"} state avg
                </div>
              </div>
            </div>

            {/* Right: Bar chart */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignSelf: "center",
              }}
            >
              {/* Chart */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: 200,
                  padding: "0 0 0 12px",
                }}
              >
                {bars.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${(h / maxBar) * 100}%`,
                      borderRadius: "6px 6px 0 0",
                      background:
                        i === userBarIndex
                          ? color
                          : i < userBarIndex
                          ? `${color}30`
                          : "rgba(255,255,255,0.07)",
                      boxShadow: i === userBarIndex ? `0 0 20px ${color}60` : "none",
                      position: "relative",
                    }}
                  >
                    {i === userBarIndex && (
                      <div
                        style={{
                          position: "absolute",
                          top: -28,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: 11,
                          fontWeight: 700,
                          color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        YOU
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 0 0 12px",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                <span>Low earners</span>
                <span>High earners</span>
              </div>

              {/* Your salary card */}
              <div
                style={{
                  marginTop: 16,
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${color}30`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                    Your salary
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>
                    {salary ? formatINR(salary) : "—"}
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                      /mo
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                    vs state average
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color }}>
                    {salaryMultiplier}×
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
              Source: PLFS 2023-24 · Ministry of Statistics &amp; Programme Implementation, Govt. of India
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#FF9933",
              }}
            >
              Find yours at SalaryRank.in →
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
