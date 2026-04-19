import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  console.error("Uso: tsx prisma/reset-password.ts EMAIL SENHA");
  process.exit(1);
}

const hashed = await bcrypt.hash(PASSWORD, 10);

const user = await prisma.user.update({
  where: { email: EMAIL },
  data: { password: hashed },
});

console.log(`✅ Senha atualizada para: ${user.email}`);
await prisma.$disconnect();
