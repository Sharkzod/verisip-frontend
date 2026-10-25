"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ProductRecord, ProductStatus } from "@/lib/types";

const STATUS_LABEL: Record<ProductStatus, string> = {
  authentic: "Authentic",
  counterfeit: "Known fake",
  recalled: "Recalled",
};

/** Reads ProductRecords from MongoDB through the API (Milestone 1 exit criterion). */
export function ProductList() {
  const [products, setProducts] = useState<ProductRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProducts()
      .then((r) => setProducts(r.products))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <section className="card">
      <div className="card-head">
        <h2>Authenticity database</h2>
        <span className="muted">{products ? `${products.length} records` : ""}</span>
      </div>

      {error && <p className="hint">Could not load products: {error}</p>}
      {!error && !products && <p className="muted">Loading…</p>}
      {products && products.length === 0 && (
        <p className="hint">
          No records yet. Run <code>npm run seed</code> in the <code>backend</code> folder.
        </p>
      )}

      {products && products.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Pack</th>
                <th>GTIN</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.name}</strong>
                    <span className="sub">{p.manufacturer}</span>
                  </td>
                  <td>{p.packageSize ?? "—"}</td>
                  <td className="mono">{p.gtin ?? "—"}</td>
                  <td>
                    <span className={`badge badge-${p.status}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
