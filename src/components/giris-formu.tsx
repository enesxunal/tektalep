"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function GirisFormu() {
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (olay) => {
        olay.preventDefault();
        setHata(null);
        setBekliyor(true);
        const form = new FormData(olay.currentTarget);
        const kullaniciAdi = String(form.get("kullaniciAdi") ?? "");
        const sifre = String(form.get("sifre") ?? "");
        try {
          const sonuc = await signIn("credentials", {
            username: kullaniciAdi,
            password: sifre,
            redirect: false,
          });
          if (sonuc?.error) {
            setHata("Kullanıcı adı veya şifre hatalı.");
            setBekliyor(false);
            return;
          }
          window.location.href = "/";
        } catch {
          setHata("Giriş sırasında bir sorun oluştu.");
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
        <Label htmlFor="kullaniciAdi">Kullanıcı adı</Label>
        <Input
          id="kullaniciAdi"
          name="kullaniciAdi"
          autoComplete="username"
          required
          className="bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sifre">Şifre</Label>
        <Input
          id="sifre"
          name="sifre"
          type="password"
          autoComplete="current-password"
          required
          className="bg-white"
        />
      </div>
      <Button type="submit" className="w-full" disabled={bekliyor}>
        {bekliyor ? "Giriş yapılıyor..." : "Giriş yap"}
      </Button>
    </form>
  );
}
