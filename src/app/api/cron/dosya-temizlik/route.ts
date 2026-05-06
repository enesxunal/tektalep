import { suresiDolanDosyalariTemizle } from "@/lib/temizle-suresi-dolan-dosyalar";
import { NextResponse } from "next/server";

export async function GET(istek: Request) {
  const gizli = process.env.CRON_SECRET;
  if (!gizli) {
    return NextResponse.json(
      { hata: "CRON_SECRET tanımlı değil." },
      { status: 500 },
    );
  }

  const baslik = istek.headers.get("authorization");
  if (baslik !== `Bearer ${gizli}`) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const sonuc = await suresiDolanDosyalariTemizle();
  return NextResponse.json({ tamam: true, ...sonuc });
}
