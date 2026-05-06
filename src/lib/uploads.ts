import { mkdir, unlink, readFile, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";

const UPLOAD_KOK = path.join(process.cwd(), "uploads");

export type YuklemeSonuc = { url: string; createdAt: Date };

function uzantiAl(dosyaAdi: string): string {
  const son = dosyaAdi.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  return son.toLowerCase().slice(0, 8);
}

export async function talepDosyasiKaydet(
  talepId: string,
  tur: "referans" | "tamamlanan",
  dosya: File,
): Promise<YuklemeSonuc> {
  const olusturma = new Date();
  const ext = uzantiAl(dosya.name);
  const zaman = olusturma.getTime();
  const anahtar = `tasks/${talepId}/${tur}-${zaman}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(anahtar, dosya, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, createdAt: olusturma };
  }

  const dizin = path.join(UPLOAD_KOK, talepId);
  await mkdir(dizin, { recursive: true });
  const dosyaAdiDisk = `${tur}-${zaman}.${ext}`;
  const tamYol = path.join(dizin, dosyaAdiDisk);
  const tampon = Buffer.from(await dosya.arrayBuffer());
  await writeFile(tamYol, tampon);

  return {
    url: `local://${talepId}/${dosyaAdiDisk}`,
    createdAt: olusturma,
  };
}

export type SaklananKonum =
  | { tur: "yerel"; talepId: string; dosya: string }
  | { tur: "blob"; url: string };

export function saklananDosyayiAyristir(kayitli: string): SaklananKonum {
  if (kayitli.startsWith("local://")) {
    const parca = kayitli.slice("local://".length).split("/");
    const [talepId, ...geri] = parca;
    return { tur: "yerel", talepId, dosya: geri.join("/") };
  }
  return { tur: "blob", url: kayitli };
}

export async function saklananDosyayiSil(kayitliUrl: string): Promise<void> {
  const ayristir = saklananDosyayiAyristir(kayitliUrl);
  if (ayristir.tur === "yerel") {
    const tamYol = path.join(UPLOAD_KOK, ayristir.talepId, ayristir.dosya);
    try {
      await unlink(tamYol);
    } catch {
      //
    }
    return;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(ayristir.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      //
    }
  }
}

export async function yerelDosyayiOku(
  talepId: string,
  dosyaAdi: string,
): Promise<Buffer> {
  const tamYol = path.join(UPLOAD_KOK, talepId, dosyaAdi);
  return readFile(tamYol);
}
