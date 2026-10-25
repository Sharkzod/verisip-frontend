"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scanHandled = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    scanHandled.current = false;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (!scanHandled.current) {
            scanHandled.current = true;
            onScan(decodedText);
            stopScanner();
          }
        },
        () => {
          // scan failure (no code in frame) — expected, ignore
        },
      );
      setScanning(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Camera access failed";
      setCameraError(message);
      onError?.(message);
    }
  }, [onScan, onError, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="scanner-wrap">
      <div id="barcode-reader" ref={containerRef} className="scanner-viewport" />

      {cameraError && (
        <p className="scanner-error">{cameraError}</p>
      )}

      <div className="scanner-controls">
        {!scanning ? (
          <button className="btn" onClick={startScanner} type="button">
            Open camera
          </button>
        ) : (
          <button className="btn btn-stop" onClick={stopScanner} type="button">
            Stop camera
          </button>
        )}
      </div>
    </div>
  );
}
