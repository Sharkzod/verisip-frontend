const STORAGE_KEY = "verisip_admin_key";

export function getAdminKey(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminKey(key: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch {
    // private browsing — key lives only in memory for this tab
  }
}

export function clearAdminKey(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
