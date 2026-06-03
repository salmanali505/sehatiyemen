// Secure access-token helpers (client-side, used inside the admin UI only)

export function generateSecureToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  // base64url
  let str = btoa(String.fromCharCode(...arr));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function buildAccessUrl(kind: "admin" | "provider" | "reception", token: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const path = kind === "admin" ? "/master" : kind === "provider" ? "/portal/provider" : "/portal/reception";
  return `${base}${path}/${token}`;
}
