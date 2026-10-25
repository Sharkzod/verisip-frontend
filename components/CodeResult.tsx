"use client";

import type { CodeValidationResult } from "@/lib/types";

function scoreLabel(score: number): { text: string; className: string } {
  if (score >= 0.8) return { text: "High confidence", className: "badge badge-authentic" };
  if (score >= 0.5) return { text: "Uncertain", className: "badge badge-recalled" };
  return { text: "Low confidence", className: "badge badge-counterfeit" };
}

export function CodeResult({ result }: { result: CodeValidationResult }) {
  const pct = Math.round(result.codeScore * 100);
  const label = scoreLabel(result.codeScore);

  return (
    <div className="card code-result">
      <div className="card-head">
        <h2>Code scan result</h2>
        <span className={label.className}>{label.text}</span>
      </div>

      <div className="score-bar-wrap">
        <div className="score-bar">
          <div
            className="score-fill"
            style={{ width: `${pct}%` }}
            data-score={result.codeScore >= 0.8 ? "good" : result.codeScore >= 0.5 ? "mid" : "bad"}
          />
        </div>
        <span className="score-label mono">{pct}%</span>
      </div>

      <dl className="result-flags">
        <dt>Code present</dt>
        <dd>{result.codePresent ? "Yes" : "No"}</dd>
        <dt>Format valid</dt>
        <dd>{result.formatValid ? "Yes" : "N/A"}</dd>
        <dt>Database match</dt>
        <dd>{result.isMatch ? "Yes" : "No"}</dd>
        {result.isDuplicate && (
          <>
            <dt>Duplicate flag</dt>
            <dd>Yes</dd>
          </>
        )}
        {result.isExpired && (
          <>
            <dt>Expired</dt>
            <dd>Yes</dd>
          </>
        )}
      </dl>

      <ul className="result-reasons">
        {result.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
