"use client";

import type { TrustVerdictResult } from "@/lib/types";

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  authentic: { label: "Authentic", className: "verdict-authentic" },
  suspicious: { label: "Suspicious", className: "verdict-suspicious" },
  likely_counterfeit: { label: "Likely Counterfeit", className: "verdict-counterfeit" },
};

function layerName(key: string): string {
  if (key === "code") return "Code";
  if (key === "image") return "Image";
  return "Database";
}

export function VerdictResult({ verdict }: { verdict: TrustVerdictResult }) {
  const pct = Math.round(verdict.trustScore * 100);
  const style = CATEGORY_STYLES[verdict.category] ?? CATEGORY_STYLES.suspicious;

  return (
    <div className={`card verdict-card ${style.className}`}>
      <div className="verdict-header">
        <h2 className="verdict-label">{style.label}</h2>
        <div className="verdict-score mono">{pct}%</div>
      </div>

      <div className="verdict-confidence">
        Confidence: {Math.round(verdict.confidence)}%
      </div>

      <div className="score-bar-wrap">
        <div className="score-bar">
          <div
            className="score-fill"
            style={{ width: `${pct}%` }}
            data-score={pct >= 80 ? "good" : pct >= 50 ? "mid" : "bad"}
          />
        </div>
      </div>

      <div className="verdict-layers">
        <h3>Layer scores</h3>
        <div className="layer-bars">
          {(["code", "image", "database"] as const).map((key) => {
            const score = verdict.layerScores[key];
            const weight = verdict.weightsUsed[key];
            if (score === null) {
              return (
                <div key={key} className="layer-bar-row">
                  <span className="layer-bar-label">{layerName(key)}</span>
                  <span className="layer-bar-na muted">not provided</span>
                </div>
              );
            }
            const s = Math.round(score * 100);
            return (
              <div key={key} className="layer-bar-row">
                <span className="layer-bar-label">{layerName(key)}</span>
                <div className="score-bar" style={{ flex: 1 }}>
                  <div
                    className="score-fill"
                    style={{ width: `${s}%` }}
                    data-score={s >= 80 ? "good" : s >= 50 ? "mid" : "bad"}
                  />
                </div>
                <span className="layer-bar-value mono">
                  {s}% <span className="muted">({Math.round(weight * 100)}%w)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="verdict-explanation">
        <h3>Explanation</h3>
        <ul>
          {verdict.explanation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
