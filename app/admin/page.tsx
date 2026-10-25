"use client";

import { api } from "@/lib/api";
import { clearAdminKey, getAdminKey, setAdminKey } from "@/lib/adminKey";
import type { CodeRecord, ProductRecord, ReportRecord } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Tab = "products" | "codes" | "reports";

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("reports");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getAdminKey();
    if (stored) setKey(stored);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      await api.adminLogin(keyInput);
      setAdminKey(keyInput);
      setKey(keyInput);
    } catch {
      setLoginError("Invalid admin key");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    clearAdminKey();
    setKey(null);
    setKeyInput("");
    setProducts([]);
    setCodes([]);
    setReports([]);
  };

  const loadTab = useCallback(
    async (t: Tab) => {
      if (!key) return;
      setLoading(true);
      setError("");
      try {
        if (t === "products") {
          const res = await api.adminListProducts(key);
          setProducts(res.products);
        } else if (t === "codes") {
          const res = await api.adminListCodes(key);
          setCodes(res.codes);
        } else {
          const res = await api.adminListReports(key);
          setReports(res.reports);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  useEffect(() => {
    if (key) loadTab(tab);
  }, [key, tab, loadTab]);

  const handleReview = async (id: string, status: "reviewed" | "dismissed") => {
    if (!key) return;
    try {
      const updated = await api.adminReviewReport(key, id, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report");
    }
  };

  const handleRevoke = async (code: string) => {
    if (!key) return;
    try {
      await api.adminRevokeCode(key, code);
      setCodes((prev) => prev.map((c) => (c.code === code ? { ...c, revoked: true } : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke code");
    }
  };

  const handleProductStatus = async (id: string, status: string) => {
    if (!key) return;
    try {
      const updated = await api.adminUpdateProductStatus(key, id, { status });
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  // Login screen
  if (!key) {
    return (
      <main className="page">
        <header>
          <h1>Admin dashboard</h1>
          <p className="lead">Enter the admin key to manage products, codes, and reports.</p>
        </header>
        <form className="card report-form" onSubmit={handleLogin} style={{ maxWidth: 420 }}>
          <label className="form-field">
            <span className="form-label">Admin key</span>
            <input
              type="password"
              className="input"
              placeholder="Enter admin key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
          </label>
          {loginError && <p style={{ color: "var(--bad)", margin: 0 }}>{loginError}</p>}
          <button className="btn" type="submit" disabled={loggingIn || !keyInput}>
            {loggingIn ? "Checking…" : "Log in"}
          </button>
        </form>
      </main>
    );
  }

  // Dashboard
  return (
    <main className="page">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <h1>Admin dashboard</h1>
        <button className="btn-ghost" onClick={logout} type="button">
          Log out
        </button>
      </header>

      <div className="mode-tabs">
        {(["reports", "products", "codes"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`mode-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
            type="button"
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "var(--bad)" }}>{error}</p>}

      {loading ? (
        <p className="muted">Loading&hellip;</p>
      ) : (
        <>
          {/* Reports tab */}
          {tab === "reports" && (
            <section className="card">
              <div className="card-head">
                <h2>Reports ({reports.length})</h2>
              </div>
              {reports.length === 0 ? (
                <p className="muted">No reports yet.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Reporter</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={r._id}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {r.description.slice(0, 80)}
                            {r.description.length > 80 ? "…" : ""}
                            {r.code && (
                              <span className="sub">Code: {r.code}</span>
                            )}
                            {r.location && (
                              <span className="sub">Location: {r.location}</span>
                            )}
                          </td>
                          <td>
                            {r.reporterName || <span className="muted">Anonymous</span>}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === "reviewed"
                                  ? "badge-authentic"
                                  : r.status === "dismissed"
                                    ? "badge-counterfeit"
                                    : "badge-recalled"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>
                            {r.status === "pending" && (
                              <div style={{ display: "flex", gap: 4 }}>
                                <button
                                  className="btn-ghost"
                                  onClick={() => handleReview(r._id, "reviewed")}
                                  type="button"
                                >
                                  Review
                                </button>
                                <button
                                  className="btn-ghost"
                                  onClick={() => handleReview(r._id, "dismissed")}
                                  type="button"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                            {r.adminNotes && (
                              <span className="sub">{r.adminNotes}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Products tab */}
          {tab === "products" && (
            <section className="card">
              <div className="card-head">
                <h2>Products ({products.length})</h2>
              </div>
              {products.length === 0 ? (
                <p className="muted">No products registered.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id}>
                          <td>{p.name}</td>
                          <td>{p.brand}</td>
                          <td className="mono">{p.sku}</td>
                          <td>{p.category.replace(/_/g, " ")}</td>
                          <td>
                            <span
                              className={`badge ${
                                p.status === "authentic"
                                  ? "badge-authentic"
                                  : p.status === "recalled"
                                    ? "badge-recalled"
                                    : "badge-counterfeit"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={p.status}
                              onChange={(e) => handleProductStatus(p._id, e.target.value)}
                              className="input"
                              style={{ padding: "4px 8px", fontSize: "0.85rem", minWidth: "auto" }}
                            >
                              <option value="authentic">authentic</option>
                              <option value="counterfeit">counterfeit</option>
                              <option value="recalled">recalled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Codes tab */}
          {tab === "codes" && (
            <section className="card">
              <div className="card-head">
                <h2>Codes ({codes.length})</h2>
              </div>
              {codes.length === 0 ? (
                <p className="muted">No codes registered.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Product</th>
                        <th>Revoked</th>
                        <th>Scans</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((c) => (
                        <tr key={c._id}>
                          <td className="mono" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {c.code}
                          </td>
                          <td>{c.codeType}</td>
                          <td>
                            {typeof c.product === "object" ? (
                              <>
                                {c.product.name}
                                <span className="sub">{c.product.brand}</span>
                              </>
                            ) : (
                              <span className="muted">{c.product}</span>
                            )}
                          </td>
                          <td>
                            {c.revoked ? (
                              <span className="badge badge-counterfeit">Yes</span>
                            ) : (
                              <span className="badge badge-authentic">No</span>
                            )}
                          </td>
                          <td>{c.scanCount}</td>
                          <td>
                            {!c.revoked && (
                              <button
                                className="btn-ghost"
                                onClick={() => handleRevoke(c.code)}
                                type="button"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
