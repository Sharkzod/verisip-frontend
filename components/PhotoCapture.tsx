"use client";

import { useCallback, useRef, useState } from "react";

interface PhotoCaptureProps {
  onCapture: (base64: string, mimeType: string) => void;
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert("Please select a JPEG, PNG or WebP image.");
        return;
      }
      if (file.size > 7.5 * 1024 * 1024) {
        alert("Image too large (max 7.5 MB).");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onCapture(dataUrl, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onCapture],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="photo-capture">
      {preview && (
        <div className="photo-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Captured packaging" />
        </div>
      )}

      <div className="photo-buttons">
        <button
          type="button"
          className="btn"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? "Retake photo" : "Take or choose photo"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {!preview && (
        <p className="photo-hint">
          Take a photo of the product packaging, or choose one from your gallery.
        </p>
      )}
    </div>
  );
}
