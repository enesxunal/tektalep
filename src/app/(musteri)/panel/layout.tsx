import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PanelGolgesi({
  children,
}: {
  children: React.ReactNode;
}) {
  const oturum = await auth();
  if (!oturum) {
    redirect("/giris");
  }
  if (oturum.user.role !== "CUSTOMER") {
    redirect("/yonetim");
  }

  const baslik = oturum.user.name ?? oturum.user.username ?? "Müşteri";

  return <AppShell baslik={baslik} rol="CUSTOMER">{children}</AppShell>;
}
