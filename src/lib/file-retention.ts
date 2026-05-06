import { DOSYA_SAKLAMA_MS } from "@/lib/constants";

export function dosyaSuresiDolduMu(createdAt: Date | null): boolean {
  if (!createdAt) return false;
  return Date.now() - createdAt.getTime() > DOSYA_SAKLAMA_MS;
}
