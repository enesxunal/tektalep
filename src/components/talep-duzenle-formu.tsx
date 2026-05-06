"use client";

import type { TaskStatus } from "@/generated/prisma/enums";
import { TaskStatus as TaskStatusDegerleri } from "@/generated/prisma/enums";
import { DURUM_ETIKETI } from "@/lib/talep-durum";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

type TalepOzet = {
  id: string;
  baslik: string;
  aciklama: string;
  durum: TaskStatus;
  musteriAdi: string;
  musteriKullanici: string;
  teslim: string;
  referansIndir: boolean;
  tamamlananIndir: boolean;
};

export default function TalepDuzenleFormu({ talep }: { talep: TalepOzet }) {
  const yonlendirici = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [durum, setDurum] = useState<TaskStatus>(talep.durum);

  const durumlar = Object.values(TaskStatusDegerleri);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Talep düzenleme
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900">{talep.baslik}</h1>
        <div className="text-sm text-zinc-600 space-y-1">
          <div>
            <span className="text-zinc-400">Müşteri:</span> {talep.musteriAdi}{" "}
            <span className="text-zinc-400">(@{talep.musteriKullanici})</span>
          </div>
          <div>
            <span className="text-zinc-400">İstenen teslim:</span>{" "}
            {format(new Date(talep.teslim), "d MMMM yyyy", { locale: tr })}
          </div>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-2">
        <h2 className="text-sm font-medium text-zinc-900">Talep içeriği</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {talep.aciklama}
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          {talep.referansIndir ? (
            <a
              href={`/api/indir/${talep.id}/referans`}
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
            >
              Referans görselini indir
            </a>
          ) : (
            <span className="text-zinc-400">Referans süresi doldu ya da yok</span>
          )}
          {talep.durum === "TAMAMLANDI" ? (
            talep.tamamlananIndir ? (
              <a
                href={`/api/indir/${talep.id}/tamamlanan`}
                className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
              >
                Tamamlanan çıktıyı indir
              </a>
            ) : (
              <span className="text-zinc-400">
                Tamamlanan dosyanın süresi doldu ya da yüklenmemiş
              </span>
            )
          ) : null}
        </div>
      </section>

      <form
        className="rounded-xl border bg-white p-6 shadow-sm space-y-5"
        onSubmit={async (olay) => {
          olay.preventDefault();
          setHata(null);
          setBekliyor(true);

          try {
            const form = new FormData(olay.currentTarget);

            const yanit = await fetch(`/api/talepler/${talep.id}`, {
              method: "PATCH",
              body: form,
            });

            const govde = await yanit.json().catch(() => ({}));

            if (!yanit.ok) {
              setHata(
                typeof govde?.hata === "string"
                  ? govde.hata
                  : "Güncelleme sırasında hata oluştu.",
              );
              setBekliyor(false);
              return;
            }

            toast.success("Talep güncellendi.");
            yonlendirici.push("/yonetim");
            yonlendirici.refresh();
          } catch {
            setHata("Bağlantı sırasında hata oluştu.");
            setBekliyor(false);
          }
        }}
      >
        {hata ? (
          <Alert variant="destructive">
            <AlertTitle>{hata}</AlertTitle>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="durum">Durumu güncelle</Label>
          <select
            id="durum"
            name="durum"
            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            value={durum}
            onChange={(etkinlik) =>
              setDurum(etkinlik.target.value as TaskStatus)
            }
          >
            {durumlar.map((durumOzeti) => (
              <option key={durumOzeti} value={durumOzeti}>
                {DURUM_ETIKETI[durumOzeti]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tamamlananDosya">Tamamlanan çıktı dosyası</Label>
          <input
            id="tamamlananDosya"
            name="tamamlananDosya"
            type="file"
            accept="image/*,.pdf"
            className="block w-full text-sm text-zinc-600"
          />
          <p className="text-xs text-zinc-400">
            Tamamlandı aşamasında müşteriyle paylaşılacak dosyayı yükleyin. En fazla 4 MB.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={bekliyor}>
            {bekliyor ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => yonlendirici.push("/yonetim")}
          >
            Listeye dön
          </Button>
        </div>
      </form>
    </div>
  );
}
