"use client";

import { api } from "@/lib/api";
import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ReportPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [reportId, setReportId] = useState("");

  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await api.submitReport({
        description,
        code: code || undefined,
        reporterName: reporterName || undefined,
        reporterContact: reporterContact || undefined,
        location: location || undefined,
      });
      setReportId(res.reportId);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setDescription("");
    setCode("");
    setReporterName("");
    setReporterContact("");
    setLocation("");
    setReportId("");
    setErrorMsg("");
  };

  if (status === "success") {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h2 style={{ color: "var(--ok)", margin: "0 0 8px" }}>Report submitted</h2>
          <p className="muted">
            Your report has been received and will be reviewed by our team.
          </p>
          <p className="mono muted" style={{ fontSize: "0.85rem" }}>
            Reference: {reportId}
          </p>
          <button className="btn" onClick={reset} type="button" style={{ marginTop: 16 }}>
            Submit another report
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header>
        <h1>Report a suspicious product</h1>
        <p className="lead">
          Spotted something that looks counterfeit or adulterated? Let us know so we can investigate.
        </p>
      </header>

      <form className="report-form card" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">
            Description <span style={{ color: "var(--bad)" }}>*</span>
          </span>
          <textarea
            className="input"
            rows={4}
            required
            minLength={5}
            maxLength={2000}
            placeholder="Describe what you observed — packaging issues, taste, where you bought it, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Product code (if available)</span>
          <input
            type="text"
            className="input"
            placeholder="Barcode or QR code value"
            maxLength={256}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Your name (optional)</span>
          <input
            type="text"
            className="input"
            placeholder="Name"
            maxLength={120}
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Contact info (optional)</span>
          <input
            type="text"
            className="input"
            placeholder="Email or phone number"
            maxLength={200}
            value={reporterContact}
            onChange={(e) => setReporterContact(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Location (optional)</span>
          <input
            type="text"
            className="input"
            placeholder="City, market or shop name"
            maxLength={200}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        {status === "error" && (
          <p style={{ color: "var(--bad)", margin: 0 }}>{errorMsg}</p>
        )}

        <button
          className="btn"
          type="submit"
          disabled={status === "submitting" || description.trim().length < 5}
        >
          {status === "submitting" ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </main>
  );
}
