"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function MusteriEkleFormu() {
  const yonlendirici = useRouter();
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  return (
    <form
      className="max-w-xl space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      onSubmit={async (olay) => {
        olay.preventDefault();
        setMesaj(null);
        setBekliyor(true);
        const form = new FormData(olay.currentTarget);

        try {
          const yanit = await fetch("/api/yonetim/musteri", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ad: form.get("ad"),
              kullaniciAdi: form.get("kullaniciAdi"),
              sifre: form.get("sifre"),
            }),
          });
          const govde = await yanit.json().catch(() => ({}));

          if (!yanit.ok) {
            setMesaj(
              typeof govde?.hata === "string"
                ? govde.hata
                : "Kayıt oluşturulamadı.",
            );
            setBekliyor(false);
            return;
          }

          toast.success("Müşteri oluşturuldu.");
          olay.currentTarget.reset();
          yonlendirici.refresh();
        } catch {
          setMesaj("Bağlantı hatası oluştu.");
          setBekliyor(false);
        }
      }}
    >
      <div className="space-y-1 pb-2">
        <h2 className="text-lg font-semibold text-zinc-900">
          Yeni müşteri oluştur
        </h2>
        <p className="text-xs text-zinc-500">
          Kullanıcı müşteri rolüyle oturum açabilecek. Şifre en az 6 karakter olmalıdır.
        </p>
      </div>

      {mesaj ? (
        <Alert variant="destructive">
          <AlertTitle>{mesaj}</AlertTitle>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="ad">Firma ya da görünür ad</Label>
        <Input id="ad" name="ad" required className="bg-white" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kullaniciAdi">Kullanıcı adı</Label>
        <Input
          id="kullaniciAdi"
          name="kullaniciAdi"
          autoComplete="off"
          required
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sifre">Geçici şifre</Label>
        <Input
          id="sifre"
          name="sifre"
          type="password"
          minLength={6}
          required
          className="bg-white"
        />
      </div>

      <Button type="submit" disabled={bekliyor}>
        {bekliyor ? "Kaydediliyor..." : "Müşteriyi kaydet"}
      </Button>
    </form>
  );
}
