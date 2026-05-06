import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TalepDurumBadge } from "@/components/task-status-badge";
import { dosyaSuresiDolduMu } from "@/lib/file-retention";

export const dynamic = "force-dynamic";

export default async function MusteriPaneli() {
  const oturum = await auth();
  const talepler = await prisma.task.findMany({
    where: { customerId: oturum!.user.id },
    orderBy: { dueDate: "asc" },
  });

  const bosDurum =
    talepler.length === 0 ? (
      <div className="rounded-lg border bg-white px-6 py-12 text-center text-sm text-zinc-500">
        Henüz talep oluşturmadınız. Yeni talep eklemek için aşağıdaki düğmeyi
        kullanın.
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Taleplerim
          </h1>
          <p className="text-sm text-zinc-500">
            Taleplerinizi ve teslim tarihlerini buradan izleyebilirsiniz.
          </p>
        </div>
        <Link
          href="/panel/yeni-talep"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Yeni talep
        </Link>
      </div>

      {bosDurum}

      {talepler.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>İstenen teslim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Dosyalar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {talepler.map((talep) => {
                const referansVar =
                  Boolean(talep.imageUrl && talep.imageCreatedAt);
                const referansSureli =
                  talep.imageCreatedAt &&
                  !dosyaSuresiDolduMu(talep.imageCreatedAt);
                const tamamlananVar =
                  talep.completionImageUrl && talep.completionImageCreatedAt;
                const tamamlananSureli =
                  talep.completionImageCreatedAt &&
                  !dosyaSuresiDolduMu(talep.completionImageCreatedAt);

                return (
                  <TableRow key={talep.id}>
                    <TableCell className="font-medium">{talep.title}</TableCell>
                    <TableCell>
                      {format(talep.dueDate, "d MMMM yyyy", { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <TalepDurumBadge
                        durum={talep.status}
                        teslimTarihi={talep.dueDate}
                      />
                    </TableCell>
                    <TableCell className="text-sm space-y-1">
                      {!referansVar ? (
                        <span className="text-zinc-400">Referans yok</span>
                      ) : !referansSureli ? (
                        <span className="text-zinc-400">
                          Referans süresi doldu
                        </span>
                      ) : (
                        <a
                          href={`/api/indir/${talep.id}/referans`}
                          className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
                        >
                          Referansı indir
                        </a>
                      )}
                      {talep.status === "TAMAMLANDI" ? (
                        <div className="pt-1">
                          {!tamamlananVar ? (
                            <span className="text-zinc-400">
                              Tamamlanan dosya yüklenmemiş
                            </span>
                          ) : !tamamlananSureli ? (
                            <span className="text-zinc-400">
                              Tamamlanan dosyanın süresi doldu
                            </span>
                          ) : (
                            <a
                              href={`/api/indir/${talep.id}/tamamlanan`}
                              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                            >
                              Çıktıyı indir
                            </a>
                          )}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
