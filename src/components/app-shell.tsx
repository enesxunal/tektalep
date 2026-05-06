import type { ReactNode } from "react";
import Link from "next/link";
import { OturumCubugu } from "@/components/oturum-cubugu";

type Props = {
  baslik: string;
  rol: "ADMIN" | "CUSTOMER";
  children: ReactNode;
};

export function AppShell({ baslik, rol, children }: Props) {
  return (
    <div className="min-h-full flex flex-col bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-6">
            <Link
              href={rol === "ADMIN" ? "/yonetim" : "/panel"}
              className="text-sm font-semibold tracking-wide text-zinc-900"
            >
              TEK TAKİP
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-zinc-600 sm:flex">
              {rol === "ADMIN" ? (
                <>
                  <Link href="/yonetim" className="hover:text-zinc-900">
                    Özet
                  </Link>
                  <Link href="/yonetim/musteriler" className="hover:text-zinc-900">
                    Müşteriler
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/panel" className="hover:text-zinc-900">
                    Taleplerim
                  </Link>
                  <Link href="/panel/yeni-talep" className="hover:text-zinc-900">
                    Yeni Talep
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-sm text-zinc-500 md:inline md:max-w-[12rem]">
              {baslik}
            </span>
            <OturumCubugu />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
