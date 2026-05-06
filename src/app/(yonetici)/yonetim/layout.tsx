import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function YonetimGolgesi({
  children,
}: {
  children: React.ReactNode;
}) {
  const oturum = await auth();
  if (!oturum) {
    redirect("/giris");
  }
  if (oturum.user.role !== "ADMIN") {
    redirect("/panel");
  }

  const baslik = oturum.user.name ?? oturum.user.username ?? "Yönetici";

  return <AppShell baslik={baslik} rol="ADMIN">{children}</AppShell>;
}
