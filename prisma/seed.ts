import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function basla() {
  const baglanti = process.env.DATABASE_URL;
  if (!baglanti) {
    throw new Error("DATABASE_URL bulunamadı.");
  }

  const havuz = new Pool({ connectionString: baglanti });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(havuz),
  });

  const kullaniciAdi = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const sifre = process.env.SEED_ADMIN_PASSWORD ?? "Degistirin1!";

  const ozet = await bcrypt.hash(sifre, 10);

  await prisma.user.upsert({
    where: { username: kullaniciAdi },
    update: {},
    create: {
      name: "Sistem Yöneticisi",
      username: kullaniciAdi,
      password: ozet,
      role: "ADMIN",
    },
  });

  await prisma.$disconnect();
  await havuz.end();

  console.log(
    `Yönetici hazır → kullanıcı adı "${kullaniciAdi}", şifre ortamdan veya varsayılan SEED_ADMIN_PASSWORD.`,
  );
}

basla().catch((hata) => {
  console.error(hata);
  process.exit(1);
});
