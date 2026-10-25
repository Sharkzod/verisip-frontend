"use client";

import type { ImageClassificationResult } from "@/lib/types";

function scoreLabel(score: number): { text: string; className: string } {
  if (score >= 0.8) return { text: "Looks genuine", className: "badge badge-authentic" };
  if (score >= 0.5) return { text: "Uncertain", className: "badge badge-recalled" };
  return { text: "Looks suspicious", className: "badge badge-counterfeit" };
}

export function ImageResult({ result }: { result: ImageClassificationResult }) {
  const pct = Math.round(result.imageScore * 100);
  const label = scoreLabel(result.imageScore);

  return (
    <div className="card image-result">
      <div className="card-head">
        <h2>Image scan result</h2>
        <span className={label.className}>{label.text}</span>
      </div>

      <div className="score-bar-wrap">
        <div className="score-bar">
          <div
            className="score-fill"
            style={{ width: `${pct}%` }}
            data-score={result.imageScore >= 0.8 ? "good" : result.imageScore >= 0.5 ? "mid" : "bad"}
          />
        </div>
        <span className="score-label mono">{pct}%</span>
      </div>

      <dl className="result-flags">
        <dt>Classification</dt>
        <dd style={{ textTransform: "capitalize" }}>{result.label}</dd>
        {result.modelVersion && (
          <>
            <dt>Model version</dt>
            <dd className="mono">{result.modelVersion}</dd>
          </>
        )}
      </dl>

      {result.details && (
        <p className="result-details mono" style={{ fontSize: "0.85rem", opacity: 0.7 }}>
          {result.details}
        </p>
      )}
    </div>
  );
}
