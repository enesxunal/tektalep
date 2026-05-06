import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import TalepDuzenleFormu from "@/components/talep-duzenle-formu";
import { dosyaSuresiDolduMu } from "@/lib/file-retention";

export const dynamic = "force-dynamic";

export default async function TalepDuzenleSayfa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const talep = await prisma.task.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, username: true } },
    },
  });

  if (!talep) {
    notFound();
  }

  const referansIndir =
    Boolean(talep.imageUrl && talep.imageCreatedAt) &&
    !dosyaSuresiDolduMu(talep.imageCreatedAt);

  const tamamlananIndir =
    Boolean(talep.completionImageUrl && talep.completionImageCreatedAt) &&
    !dosyaSuresiDolduMu(talep.completionImageCreatedAt);

  return (
    <TalepDuzenleFormu
      talep={{
        id: talep.id,
        baslik: talep.title,
        aciklama: talep.description,
        durum: talep.status,
        musteriAdi: talep.customer.name,
        musteriKullanici: talep.customer.username,
        teslim: talep.dueDate.toISOString(),
        referansIndir,
        tamamlananIndir,
      }}
    />
  );
}
