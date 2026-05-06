import type { TaskStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { DURUM_ETIKETI, teslimGeciktiMi } from "@/lib/talep-durum";

type Props = {
  durum: TaskStatus;
  teslimTarihi: Date;
};

function durumRengi(durum: TaskStatus): string {
  switch (durum) {
    case "TAMAMLANDI":
      return "border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90";
    case "HAZIRLANIYOR":
    case "SIRAYA_ALINDI":
      return "border-transparent bg-amber-600 text-white hover:bg-amber-600/90";
    case "KONTROL_EDILIYOR":
      return "border-transparent bg-sky-600 text-white hover:bg-sky-600/90";
    default:
      return "border-border bg-muted text-foreground";
  }
}

export function TalepDurumBadge({ durum, teslimTarihi }: Props) {
  const gecikti = teslimGeciktiMi(teslimTarihi, durum);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge
        variant="outline"
        className={`font-normal ${durumRengi(durum)}`}
      >
        {DURUM_ETIKETI[durum]}
      </Badge>
      {gecikti ? (
        <Badge variant="destructive" className="font-normal">
          Gecikmiş teslim
        </Badge>
      ) : null}
    </div>
  );
}
