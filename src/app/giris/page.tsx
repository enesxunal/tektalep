import GirisFormu from "@/components/giris-formu";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function GirisSayfasi() {
  const oturum = await auth();
  if (oturum) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-100 px-4 py-16">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            TEK TAKİP
          </h1>
          <p className="text-sm text-zinc-500">
            Hesabınızla panele giriş yapın
          </p>
        </div>
        <GirisFormu />
        <p className="mt-6 text-center text-xs text-zinc-400">
          <Link href="/" className="underline-offset-4 hover:underline">
            Ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}
