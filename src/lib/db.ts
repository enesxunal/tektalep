import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient } from "@/generated/prisma/client";
import { PrismaClient as PrismaClientOlustur } from "@/generated/prisma/client";
import { Pool } from "pg";

const globalBaglam = globalThis as unknown as {
  prismaOmurgasi?: PrismaClient;
  veriHavuzu?: Pool;
};

function musteriOlustur(): PrismaClient {
  const baglanti = process.env.DATABASE_URL;

  if (!baglanti) {
    throw new Error(
      "DATABASE_URL eksik. Geliştirme ve yayın için bir PostgreSQL adresi gereklidir.",
    );
  }

  const havuz =
    globalBaglam.veriHavuzu ??
    new Pool({
      connectionString: baglanti,
    });

  globalBaglam.veriHavuzu = havuz;

  const uyumcu = new PrismaPg(havuz);
  return new PrismaClientOlustur({ adapter: uyumcu });
}

function prismaOrnegiAl(): PrismaClient {
  const mevcut = globalBaglam.prismaOmurgasi;
  if (mevcut) {
    return mevcut;
  }

  const ornek = musteriOlustur();
  globalBaglam.prismaOmurgasi = ornek;

  return ornek;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_hedef, ozellik, alici) {
    const ornek = prismaOrnegiAl();
    const deger = Reflect.get(
      ornek as unknown as object,
      ozellik,
      alici,
    );
    if (typeof deger === "function") {
      return deger.bind(ornek);
    }
    return deger;
  },
});
