"use client";

import { useEffect, useState } from "react";
import { API_URL, api } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthResponse }
  | { kind: "error"; message: string };

/** Live backend + database status. Proves the front end can reach the API. */
export function HealthStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });

  async function check() {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ok", data: await api.health() });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  useEffect(() => {
    void check();
  }, []);

  const dot =
    state.kind === "loading" ? "pending" : state.kind === "ok" && state.data.status === "ok" ? "up" : "down";

  return (
    <section className="card">
      <div className="card-head">
        <h2>System status</h2>
        <button className="btn-ghost" onClick={() => void check()} disabled={state.kind === "loading"}>
          Re-check
        </button>
      </div>

      <dl className="status-grid">
        <dt>API</dt>
        <dd>
          <span className={`dot dot-${dot}`} aria-hidden />
          {state.kind === "loading" && "Checking…"}
          {state.kind === "ok" && `${state.data.status === "ok" ? "Online" : "Degraded"} · v${state.data.version}`}
          {state.kind === "error" && "Unreachable"}
        </dd>

        <dt>Database</dt>
        <dd>{state.kind === "ok" ? `MongoDB ${state.data.database}` : "—"}</dd>

        <dt>Image service</dt>
        <dd>{state.kind === "ok" ? state.data.config.imageService : "—"}</dd>

        <dt>Fusion weights</dt>
        <dd className="mono">
          {state.kind === "ok"
            ? `code ${state.data.config.trustWeights.code} · image ${state.data.config.trustWeights.image} · db ${state.data.config.trustWeights.database}`
            : "—"}
        </dd>
      </dl>

      {state.kind === "error" && (
        <p className="hint">
          Could not reach <code>{API_URL}/api/health</code> ({state.message}). Start the backend with{" "}
          <code>npm run dev</code> in the <code>backend</code> folder.
        </p>
      )}
    </section>
  );
}
