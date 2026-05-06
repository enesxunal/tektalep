import { prisma } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/enums";
import { TaskStatus as TaskStatusDegerleri } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";

const DURUMLAR = new Set<string>(Object.values(TaskStatusDegerleri));

export async function POST(istek: Request) {
  const gizli = process.env.TASK_WEBHOOK_SECRET;
  if (!gizli) {
    return NextResponse.json(
      { hata: "TASK_WEBHOOK_SECRET tanımlı değil." },
      { status: 500 },
    );
  }

  const govde = await istek.json().catch(() => null);
  const istemGizli = String(
    govde?.secret ?? govde?.gizli ?? "",
  );

  if (!govde || istemGizli !== gizli) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const talepId = String(govde.taskId ?? govde.talepId ?? "");
  const durumHam = String(govde.status ?? govde.durum ?? "");

  if (!talepId || !DURUMLAR.has(durumHam)) {
    return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  }

  const durum = durumHam as TaskStatus;
  const tamamlandi = durum === "TAMAMLANDI";

  await prisma.task.update({
    where: { id: talepId },
    data: {
      status: durum,
      completedAt: tamamlandi ? new Date() : null,
    },
  });

  return NextResponse.json({ tamam: true });
}
