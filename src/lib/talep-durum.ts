import type { TaskStatus } from "@/generated/prisma/enums";

export const DURUM_ETIKETI: Record<TaskStatus, string> = {
  GONDERILDI: "Gönderildi",
  KONTROL_EDILIYOR: "Kontrol Ediliyor",
  SIRAYA_ALINDI: "Sıraya Alındı",
  HAZIRLANIYOR: "Hazırlanıyor",
  TAMAMLANDI: "Tamamlandı",
};

export function teslimGeciktiMi(
  teslim: Date,
  durum: TaskStatus,
): boolean {
  if (durum === "TAMAMLANDI") return false;
  const son = new Date(teslim);
  son.setHours(23, 59, 59, 999);
  return Date.now() > son.getTime();
}
