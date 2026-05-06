import { auth } from "@/auth";
import { MAX_UPLOAD_BOYUT } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { talepDosyasiKaydet } from "@/lib/uploads";
import { NextResponse } from "next/server";

export async function POST(istek: Request) {
  const oturum = await auth();
  if (!oturum || oturum.user.role !== "CUSTOMER") {
    return NextResponse.json({ hata: "Bu işlem için giriş gerekli." }, { status: 401 });
  }

  const form = await istek.formData();
  const baslik = String(form.get("baslik") ?? "").trim();
  const aciklama = String(form.get("aciklama") ?? "").trim();
  const teslim = String(form.get("teslim") ?? "").trim();
  const dosya = form.get("dosya");

  if (!baslik || !aciklama || !teslim) {
    return NextResponse.json(
      { hata: "Başlık, açıklama ve teslim tarihi zorunludur." },
      { status: 400 },
    );
  }

  const teslimTarihi = new Date(teslim);
  if (Number.isNaN(teslimTarihi.getTime())) {
    return NextResponse.json(
      { hata: "Teslim tarihi geçerli değil." },
      { status: 400 },
    );
  }

  const talep = await prisma.task.create({
    data: {
      customerId: oturum.user.id,
      title: baslik,
      description: aciklama,
      dueDate: teslimTarihi,
    },
  });

  if (dosya instanceof File && dosya.size > 0) {
    if (dosya.size > MAX_UPLOAD_BOYUT) {
      return NextResponse.json(
        { hata: "Dosya boyutu izin verilen sınırı aşıyor." },
        { status: 413 },
      );
    }
    const { url, createdAt } = await talepDosyasiKaydet(
      talep.id,
      "referans",
      dosya,
    );
    await prisma.task.update({
      where: { id: talep.id },
      data: { imageUrl: url, imageCreatedAt: createdAt },
    });
  }

  return NextResponse.json({ id: talep.id });
}
