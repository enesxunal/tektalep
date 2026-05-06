import { prisma } from "@/lib/db";
import { dosyaSuresiDolduMu } from "@/lib/file-retention";
import { saklananDosyayiSil } from "@/lib/uploads";

export async function suresiDolanDosyalariTemizle(): Promise<{
  temizlenenKayit: number;
}> {
  const talepler = await prisma.task.findMany({
    select: {
      id: true,
      imageUrl: true,
      imageCreatedAt: true,
      completionImageUrl: true,
      completionImageCreatedAt: true,
    },
  });

  let temizlenenKayit = 0;

  for (const talep of talepler) {
    if (
      talep.imageUrl &&
      talep.imageCreatedAt &&
      dosyaSuresiDolduMu(talep.imageCreatedAt)
    ) {
      await saklananDosyayiSil(talep.imageUrl);
      await prisma.task.update({
        where: { id: talep.id },
        data: { imageUrl: null, imageCreatedAt: null },
      });
      temizlenenKayit += 1;
    }

    if (
      talep.completionImageUrl &&
      talep.completionImageCreatedAt &&
      dosyaSuresiDolduMu(talep.completionImageCreatedAt)
    ) {
      await saklananDosyayiSil(talep.completionImageUrl);
      await prisma.task.update({
        where: { id: talep.id },
        data: {
          completionImageUrl: null,
          completionImageCreatedAt: null,
        },
      });
      temizlenenKayit += 1;
    }
  }

  return { temizlenenKayit };
}
