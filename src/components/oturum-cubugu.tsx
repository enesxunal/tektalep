"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function OturumCubugu() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/giris" })}>
      Çıkış
    </Button>
  );
}
