import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(istek: Request) {
  const oturum = await auth();
  if (!oturum || oturum.user.role !== "ADMIN") {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const govde = await istek.json().catch(() => null);
  const ad = String(govde?.ad ?? "").trim();
  const kullaniciAdi = String(govde?.kullaniciAdi ?? "").trim();
  const sifre = String(govde?.sifre ?? "");

  if (!ad || !kullaniciAdi || sifre.length < 6) {
    return NextResponse.json(
      {
        hata:
          "Ad, kullanıcı adı ve en az 6 karakterlik şifre gereklidir.",
      },
      { status: 400 },
    );
  }

  const mevcut = await prisma.user.findUnique({
    where: { username: kullaniciAdi },
  });
  if (mevcut) {
    return NextResponse.json(
      { hata: "Bu kullanıcı adı zaten kayıtlı." },
      { status: 409 },
    );
  }

  const sifreOzeti = await bcrypt.hash(sifre, 10);

  const musteri = await prisma.user.create({
    data: {
      name: ad,
      username: kullaniciAdi,
      password: sifreOzeti,
      role: "CUSTOMER",
    },
  });

  return NextResponse.json({ id: musteri.id });
}
