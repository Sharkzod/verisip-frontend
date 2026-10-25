"use client";

import { BarcodeScanner } from "@/components/BarcodeScanner";
import { CodeResult } from "@/components/CodeResult";
import { ImageResult } from "@/components/ImageResult";
import { PhotoCapture } from "@/components/PhotoCapture";
import { VerdictResult } from "@/components/VerdictResult";
import { api } from "@/lib/api";
import type { FullScanResponse } from "@/lib/types";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

type CodeMode = "camera" | "manual";
type Step = "input" | "loading" | "result";

export default function ScanPage() {
  const [step, setStep] = useState<Step>("input");
  const [codeMode, setCodeMode] = useState<CodeMode>("camera");
  const [manualCode, setManualCode] = useState("");
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<{ base64: string; mime: string } | null>(null);
  const [result, setResult] = useState<FullScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<string | null>(null);

  const handleCameraScan = useCallback((decoded: string) => {
    setScannedCode(decoded);
    codeRef.current = decoded;
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) {
      setScannedCode(code);
      codeRef.current = code;
    }
  };

  const handlePhotoCapture = useCallback((base64: string, mimeType: string) => {
    setCapturedImage({ base64, mime: mimeType });
  }, []);

  const runFullScan = async () => {
    const code = codeRef.current ?? scannedCode ?? undefined;
    const image = capturedImage?.base64;

    if (!code && !image) return;

    setStep("loading");
    setError(null);
    try {
      const res = await api.fullScan(code, image, capturedImage?.mime);
      setResult(res);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setStep("input");
    }
  };

  const reset = () => {
    setStep("input");
    setResult(null);
    setScannedCode(null);
    setCapturedImage(null);
    setError(null);
    setManualCode("");
    codeRef.current = null;
  };

  const hasInput = scannedCode || capturedImage;

  return (
    <main className="page">
      <header className="scan-header">
        <Link href="/" className="back-link">
          &larr; Home
        </Link>
        <h1>Verify a product</h1>
        <p className="lead">
          Scan the code and/or photograph the packaging. VeriSip runs up to three checks and fuses
          them into one explained trust score.
        </p>
      </header>

      {step === "input" && (
        <>
          {/* Code input */}
          <section className="card scan-section">
            <h2>1. Scan or enter a code</h2>
            <div className="mode-tabs mode-tabs-secondary">
              <button
                className={`mode-tab ${codeMode === "camera" ? "active" : ""}`}
                onClick={() => setCodeMode("camera")}
                type="button"
              >
                Camera
              </button>
              <button
                className={`mode-tab ${codeMode === "manual" ? "active" : ""}`}
                onClick={() => setCodeMode("manual")}
                type="button"
              >
                Manual entry
              </button>
            </div>

            {codeMode === "camera" && <BarcodeScanner onScan={handleCameraScan} />}

            {codeMode === "manual" && (
              <form className="manual-form" onSubmit={handleManualSubmit}>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter barcode or QR code value"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  maxLength={256}
                />
                <button className="btn" type="submit" disabled={!manualCode.trim()}>
                  Set code
                </button>
              </form>
            )}

            {scannedCode && (
              <p className="scanned-value mono" style={{ marginTop: 12 }}>
                Code: <strong>{scannedCode}</strong>
              </p>
            )}
          </section>

          {/* Image input */}
          <section className="card scan-section">
            <h2>2. Photograph the packaging</h2>
            <PhotoCapture onCapture={handlePhotoCapture} />
            {capturedImage && (
              <p className="scanned-value" style={{ marginTop: 12 }}>
                Photo captured
              </p>
            )}
          </section>

          {/* Submit */}
          <button
            className="btn btn-verify"
            type="button"
            disabled={!hasInput}
            onClick={runFullScan}
          >
            Verify product
          </button>

          {!hasInput && (
            <p className="muted" style={{ textAlign: "center" }}>
              Provide at least a code or a photo to run the verification.
            </p>
          )}
        </>
      )}

      {step === "loading" && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p>Running verification&hellip;</p>
          <p className="muted">Checking code, analysing image, looking up database&hellip;</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: "var(--bad)" }}>
          <p style={{ color: "var(--bad)", margin: 0 }}>{error}</p>
        </div>
      )}

      {step === "result" && result && (
        <>
          <VerdictResult verdict={result.verdict} />

          <details className="layer-details">
            <summary>Layer details</summary>
            <div className="layer-details-grid">
              <CodeResult result={result.codeResult} />
              {result.imageResult && <ImageResult result={result.imageResult} />}
            </div>
          </details>

          <button className="btn" onClick={reset} type="button">
            Verify another product
          </button>
        </>
      )}

      <footer className="footer">
        America, Godstime &middot; U2021/5520027 &middot; Department of Computer Science, University
        of Port Harcourt
      </footer>
    </main>
  );
}
