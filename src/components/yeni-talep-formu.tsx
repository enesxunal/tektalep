"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { DOSYA_SAKLAMA_GUN } from "@/lib/constants";

export default function YeniTalepFormu() {
  const yonlendirici = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  return (
    <form
      className="mx-auto max-w-xl space-y-6 rounded-xl border bg-white p-8 shadow-sm"
      onSubmit={async (olay) => {
        olay.preventDefault();
        setHata(null);
        setBekliyor(true);

        try {
          const form = new FormData(olay.currentTarget);
          const yanit = await fetch("/api/talepler", {
            method: "POST",
            body: form,
          });
          const govde = await yanit.json().catch(() => ({}));

          if (!yanit.ok) {
            setHata(
              typeof govde?.hata === "string"
                ? govde.hata
                : "Talep kaydedilirken sorun oluştu.",
            );
            setBekliyor(false);
            return;
          }

          yonlendirici.push("/panel");
          yonlendirici.refresh();
        } catch {
          setHata("Bağlantı hatası. Lütfen tekrar deneyin.");
          setBekliyor(false);
        }
      }}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">Yeni talep</h1>
        <p className="text-sm text-zinc-500">
          Gönderilen dosyalar yüklenme tarihinden itibaren yaklaşık{" "}
          {DOSYA_SAKLAMA_GUN} gün boyunca güvenli biçimde saklanır; sürenin sonunda otomatik
          olarak kapatılır.
        </p>
      </div>

      {hata ? (
        <Alert variant="destructive">
          <AlertTitle>{hata}</AlertTitle>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="baslik">Talep başlığı</Label>
        <Input id="baslik" name="baslik" required className="bg-white" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="aciklama">Detaylı açıklama</Label>
        <Textarea
          id="aciklama"
          name="aciklama"
          required
          rows={5}
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="teslim">İstenilen teslim tarihi</Label>
        <Input
          id="teslim"
          name="teslim"
          type="date"
          required
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosya">
          Örnek görsel / referans dosyası (isteğe bağlı)
        </Label>
        <Input
          id="dosya"
          name="dosya"
          type="file"
          accept="image/*,.pdf"
          className="bg-white"
        />
        <p className="text-xs text-zinc-400">
          Görsel veya PDF önerilir. En fazla 4 MB.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={bekliyor}>
          {bekliyor ? "Kaydediliyor..." : "Talebi gönder"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => yonlendirici.push("/panel")}
        >
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
