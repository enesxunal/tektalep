import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { dosyaSuresiDolduMu } from "@/lib/file-retention";
import { mimeUzantisindan } from "@/lib/mime";
import { saklananDosyayiAyristir, yerelDosyayiOku } from "@/lib/uploads";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  baglam: { params: Promise<{ talepId: string }> },
) {
  const oturum = await auth();
  if (!oturum?.user?.id) {
    return NextResponse.json({ hata: "Giriş gerekli." }, { status: 401 });
  }

  const { talepId } = await baglam.params;
  const talep = await prisma.task.findUnique({ where: { id: talepId } });

  if (!talep?.imageUrl || !talep.imageCreatedAt) {
    return NextResponse.json({ hata: "Dosya yok." }, { status: 404 });
  }

  if (
    oturum.user.role !== "ADMIN" &&
    talep.customerId !== oturum.user.id
  ) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 403 });
  }

  if (dosyaSuresiDolduMu(talep.imageCreatedAt)) {
    return NextResponse.json(
      {
        hata:
          "Bu dosyanın süresi doldu. Yüklemeden sonra 7 gün içinde görüntülenebilirdi.",
      },
      { status: 410 },
    );
  }

  const konum = saklananDosyayiAyristir(talep.imageUrl);

  if (konum.tur === "yerel") {
    const uzanti =
      konum.dosya.split(".").pop() ?? "";
    const tampon = await yerelDosyayiOku(konum.talepId, konum.dosya);
    return new NextResponse(Buffer.from(tampon), {
      headers: {
        "Content-Type": mimeUzantisindan(uzanti),
        "Content-Disposition":
          `attachment; filename="${konum.dosya}"`,
      },
    });
  }

  const dis = await fetch(konum.url);
  if (!dis.ok || !dis.body) {
    return NextResponse.json(
      { hata: "Dosyaya erişilemedi." },
      { status: 502 },
    );
  }

  const tip =
    dis.headers.get("content-type") ?? mimeUzantisindan("png");

  return new NextResponse(dis.body, {
    headers: {
      "Content-Type": tip,
      "Content-Disposition": "attachment",
    },
  });
}
