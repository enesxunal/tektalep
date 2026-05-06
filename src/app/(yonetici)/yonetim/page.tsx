import Link from "next/link";
import { format } from "date-fns";
import { endOfMonth, startOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { TalepDurumBadge } from "@/components/task-status-badge";
import { teslimGeciktiMi } from "@/lib/talep-durum";

export const dynamic = "force-dynamic";

export default async function YoneticiOzeti({
  searchParams,
}: {
  searchParams: Promise<{ yil?: string; ay?: string }>;
}) {
  const araParamlari = await searchParams;

  const sunnakda = new Date();
  const yilHam =
    araParamlari.yil ??
    String(sunnakda.getFullYear());
  const ayHam =
    araParamlari.ay ??
    String(sunnakda.getMonth() + 1);

  const yilSayi = Number(yilHam);
  const aySayi = Number(ayHam);
  const ayTarihi =
    Number.isFinite(yilSayi) && Number.isFinite(aySayi) && aySayi >= 1 && aySayi <= 12
      ? new Date(yilSayi, aySayi - 1, 1)
      : new Date(sunnakda.getFullYear(), sunnakda.getMonth(), 1);

  const bugunBaslangic = new Date();
  bugunBaslangic.setHours(0, 0, 0, 0);

  const [
    toplam,
    bekleyen,
    geciken,
    tamamlananSeciliAy,
    talepler,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({
      where: { NOT: { status: "TAMAMLANDI" } },
    }),
    prisma.task.count({
      where: {
        NOT: { status: "TAMAMLANDI" },
        dueDate: { lt: bugunBaslangic },
      },
    }),
    prisma.task.count({
      where: {
        status: "TAMAMLANDI",
        completedAt: {
          gte: startOfMonth(ayTarihi),
          lte: endOfMonth(ayTarihi),
        },
      },
    }),
    prisma.task.findMany({
      include: {
        customer: { select: { name: true, username: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const ayListe = [...Array.from({ length: 12 }).keys()].map((i) => ({
    kod: String(i + 1),
    ad: format(new Date(2000, i, 1), "MMMM", { locale: tr }),
  }));

  const yilListe = [yilSayi - 1, yilSayi, yilSayi + 1];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900">Özet paneli</h1>
        <p className="text-sm text-zinc-500">
          Görevler teslim tarihine göre; en yakın tarihler üst sıradadır.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 shadow-sm border-zinc-200">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Toplam talep
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{toplam}</p>
        </Card>
        <Card className="p-5 shadow-sm border-zinc-200">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Bekleyen
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{bekleyen}</p>
          <p className="mt-1 text-xs text-zinc-400">
            Henüz tamamlanmamış tüm talepler
          </p>
        </Card>
        <Card className="p-5 shadow-sm border-zinc-200">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Geciken
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-600">{geciken}</p>
          <p className="mt-1 text-xs text-zinc-400">
            Teslim zamanı gelmiş ancak tamamlanmamış
          </p>
        </Card>
        <Card className="p-5 shadow-sm border-zinc-200">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Tamamlanan (seçilen ay)
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">
            {tamamlananSeciliAy}
          </p>
          <form
            method="get"
            className="mt-3 flex flex-wrap items-end gap-2 text-sm"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="ay" className="text-xs text-zinc-500">
                Ay
              </label>
              <select
                id="ay"
                name="ay"
                defaultValue={String(ayTarihi.getMonth() + 1)}
                className="rounded-md border border-input bg-white px-2 py-1.5 text-sm"
              >
                {ayListe.map((ayKayit) => (
                  <option key={ayKayit.kod} value={ayKayit.kod}>
                    {ayKayit.ad}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="yil" className="text-xs text-zinc-500">
                Yıl
              </label>
              <select
                id="yil"
                name="yil"
                defaultValue={String(ayTarihi.getFullYear())}
                className="rounded-md border border-input bg-white px-2 py-1.5 text-sm"
              >
                {yilListe.map((y) => (
                  <option key={String(y)} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Uygula
            </button>
          </form>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900">
          Aktif talep listesi
        </h2>
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Müşteri</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Teslim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {talepler.map((talep) => {
                const satirRiskli =
                  teslimGeciktiMi(talep.dueDate, talep.status);

                return (
                  <TableRow
                    key={talep.id}
                    className={satirRiskli ? "bg-red-50" : undefined}
                  >
                    <TableCell className="whitespace-normal">
                      <div className="font-medium">{talep.customer.name}</div>
                      <div className="text-xs text-zinc-500">
                        @{talep.customer.username}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs font-medium">
                      {talep.title}
                    </TableCell>
                    <TableCell>
                      {format(talep.dueDate, "d MMM yyyy", { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <TalepDurumBadge
                        durum={talep.status}
                        teslimTarihi={talep.dueDate}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/yonetim/talep/${talep.id}`}
                        className="text-sm font-medium text-sky-700 hover:text-sky-900 underline-offset-4 hover:underline"
                      >
                        Düzenle
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {talepler.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-zinc-500">
              Henüz hiç talep yok.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
