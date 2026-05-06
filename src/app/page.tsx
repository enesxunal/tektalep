import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnaSayfa() {
  const oturum = await auth();
  if (!oturum) {
    redirect("/giris");
  }
  if (oturum.user.role === "ADMIN") {
    redirect("/yonetim");
  }
  redirect("/panel");
}
