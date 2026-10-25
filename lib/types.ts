/**
 * Front-end copies of the backend domain types.
 * Keep in sync with backend/src/types/domain.ts and backend/src/models/*.
 */

export type VerdictCategory = "authentic" | "suspicious" | "likely_counterfeit";
export type ProductStatus = "authentic" | "counterfeit" | "recalled";
export type BeverageCategory =
  | "soft_drink"
  | "energy_drink"
  | "juice"
  | "water"
  | "malt"
  | "beer"
  | "wine"
  | "spirit"
  | "dairy"
  | "other";

export interface ProductRecord {
  _id: string;
  sku: string;
  name: string;
  brand: string;
  manufacturer: string;
  category: BeverageCategory;
  packageSize?: string;
  gtin?: string;
  nafdacNumber?: string;
  status: ProductStatus;
  statusNote?: string;
  referenceImageUrls: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CodeValidationResult {
  codePresent: boolean;
  formatValid: boolean;
  isMatch: boolean;
  isDuplicate: boolean;
  isExpired: boolean;
  matchedProductId?: string;
  codeScore: number;
  reasons: string[];
}

export interface ScanCodeResponse {
  scanId: string;
  codeResult: CodeValidationResult;
}

export type ImageLabel = "genuine" | "suspicious";

export interface ImageClassificationResult {
  label: ImageLabel;
  imageScore: number;
  modelVersion?: string;
  details?: string;
}

export interface ScanImageResponse {
  scanId: string;
  imageResult: ImageClassificationResult;
}

export type LookupCategory = "known_good" | "known_bad" | "recalled" | "unknown";

export interface DatabaseLookupResult {
  found: boolean;
  category: LookupCategory;
  productId?: string;
  databaseScore: number;
  reasons: string[];
}

export interface TrustVerdictResult {
  trustScore: number;
  category: VerdictCategory;
  confidence: number;
  layerScores: { code: number | null; image: number | null; database: number | null };
  weightsUsed: { code: number; image: number; database: number };
  explanation: string[];
}

export interface FullScanResponse {
  scanId: string;
  verdict: TrustVerdictResult;
  codeResult: CodeValidationResult;
  imageResult: ImageClassificationResult | null;
  databaseResult: DatabaseLookupResult;
}

export interface ReportRecord {
  _id: string;
  product?: { _id: string; name: string; brand: string; sku: string; status: ProductStatus } | string;
  code?: string;
  description: string;
  reporterName?: string;
  reporterContact?: string;
  location?: string;
  status: "pending" | "reviewed" | "dismissed";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeRecord {
  _id: string;
  code: string;
  codeType: string;
  product: { _id: string; name: string; brand: string; sku: string } | string;
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  serialised: boolean;
  revoked: boolean;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  version: string;
  environment: string;
  database: string;
  uptimeSeconds: number;
  timestamp: string;
  config: {
    imageService: "python" | "tfjs";
    trustWeights: { code: number; image: number; database: number };
    trustThresholds: { authentic: number; suspicious: number };
  };
}
