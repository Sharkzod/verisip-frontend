import type { CodeRecord, DatabaseLookupResult, FullScanResponse, HealthResponse, ProductRecord, ReportRecord, ScanCodeResponse, ScanImageResponse } from "./types";

export const API_URL = "https://verisip-backend.onrender.com";

/** Thin fetch wrapper: JSON in, JSON out, readable errors. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return body as T;
}

function adminHeaders(key: string): HeadersInit {
  return { "x-admin-key": key };
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),
  listProducts: () => request<{ count: number; products: ProductRecord[] }>("/api/products"),
  getProduct: (idOrSku: string) => request<ProductRecord>(`/api/products/${encodeURIComponent(idOrSku)}`),
  scanCode: (code?: string) =>
    request<ScanCodeResponse>("/api/scan/code", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  lookup: (code: string) =>
    request<DatabaseLookupResult>(`/api/lookup?code=${encodeURIComponent(code)}`),
  scanImage: (imageBase64: string, mimeType = "image/jpeg") =>
    request<ScanImageResponse>("/api/scan/image", {
      method: "POST",
      body: JSON.stringify({ image: imageBase64, mimeType }),
    }),
  fullScan: (code?: string, image?: string, imageMimeType = "image/jpeg") =>
    request<FullScanResponse>("/api/scan", {
      method: "POST",
      body: JSON.stringify({ code, image, imageMimeType }),
    }),

  // Reports (public)
  submitReport: (data: {
    description: string;
    code?: string;
    productId?: string;
    reporterName?: string;
    reporterContact?: string;
    location?: string;
  }) =>
    request<{ reportId: string; status: string }>("/api/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin
  adminLogin: (key: string) =>
    request<{ ok: boolean }>("/api/admin/login", {
      method: "POST",
      headers: adminHeaders(key),
    }),
  adminListProducts: (key: string) =>
    request<{ count: number; products: ProductRecord[] }>("/api/admin/products", {
      headers: adminHeaders(key),
    }),
  adminListCodes: (key: string) =>
    request<{ count: number; codes: CodeRecord[] }>("/api/admin/codes", {
      headers: adminHeaders(key),
    }),
  adminListReports: (key: string, status?: string) =>
    request<{ count: number; reports: ReportRecord[] }>(
      `/api/admin/reports${status ? `?status=${status}` : ""}`,
      { headers: adminHeaders(key) },
    ),
  adminReviewReport: (key: string, id: string, data: { status: "reviewed" | "dismissed"; adminNotes?: string }) =>
    request<ReportRecord>(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: adminHeaders(key),
      body: JSON.stringify(data),
    }),
  adminUpdateProductStatus: (key: string, id: string, data: { status: string; statusNote?: string }) =>
    request<ProductRecord>(`/api/admin/products/${id}/status`, {
      method: "PATCH",
      headers: adminHeaders(key),
      body: JSON.stringify(data),
    }),
  adminRevokeCode: (key: string, code: string) =>
    request<CodeRecord>(`/api/admin/codes/${encodeURIComponent(code)}/revoke`, {
      method: "PATCH",
      headers: adminHeaders(key),
    }),
};
