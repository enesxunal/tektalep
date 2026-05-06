import { auth } from "@/auth";
import { MAX_UPLOAD_BOYUT } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/enums";
import { TaskStatus as TaskStatusDegerleri } from "@/generated/prisma/enums";
import { talepDosyasiKaydet, saklananDosyayiSil } from "@/lib/uploads";
import { NextResponse } from "next/server";

const DURUMLAR = new Set<string>(
  Object.values(TaskStatusDegerleri),
);

export async function PATCH(
  istek: Request,
  baglam: { params: Promise<{ id: string }> },
) {
  const oturum = await auth();
  if (!oturum || oturum.user.role !== "ADMIN") {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await baglam.params;
  const form = await istek.formData();
  const durumHam = String(form.get("durum") ?? "").trim();
  const dosya = form.get("tamamlananDosya");

  if (!DURUMLAR.has(durumHam)) {
    return NextResponse.json({ hata: "Geçersiz durum." }, { status: 400 });
  }

  const durum = durumHam as TaskStatus;

  const mevcut = await prisma.task.findUnique({ where: { id } });
  if (!mevcut) {
    return NextResponse.json({ hata: "Talep bulunamadı." }, { status: 404 });
  }

  const tamamlandi = durum === "TAMAMLANDI";

  await prisma.task.update({
    where: { id },
    data: {
      status: durum,
      completedAt: tamamlandi ? new Date() : null,
    },
  });

  if (dosya instanceof File && dosya.size > 0) {
    if (dosya.size > MAX_UPLOAD_BOYUT) {
      return NextResponse.json(
        { hata: "Dosya boyutu izin verilen sınırı aşıyor." },
        { status: 413 },
      );
    }

    if (mevcut.completionImageUrl) {
      await saklananDosyayiSil(mevcut.completionImageUrl);
    }

    const { url, createdAt } = await talepDosyasiKaydet(
      id,
      "tamamlanan",
      dosya,
    );
    await prisma.task.update({
      where: { id },
      data: {
        completionImageUrl: url,
        completionImageCreatedAt: createdAt,
      },
    });
  }

  return NextResponse.json({ tamam: true });
}
