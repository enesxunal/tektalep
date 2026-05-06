import { prisma } from "@/lib/db";
import MusteriEkleFormu from "@/components/musteri-ekle-formu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function MusterilerSayfasi() {
  const musteriler = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { name: "asc" },
  });

  const sayac = await prisma.user.count({ where: { role: "CUSTOMER" } });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-900">Müşteri yönetimi</h1>
        <p className="text-sm text-zinc-500">
          Toplam {sayac} kayıtlı müşteri. Yeni hesap oluşturmak için formu kullanın.
        </p>
      </div>

      <MusteriEkleFormu />

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Kullanıcı adı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {musteriler.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-zinc-600">{m.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {musteriler.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            Henüz müşteri kaydı yok.
          </p>
        ) : null}
      </div>
    </div>
  );
}
