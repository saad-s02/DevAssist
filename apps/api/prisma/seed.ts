import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("devassist", 10);

  await prisma.user.upsert({
    where: { email: "admin@devassist.local" },
    update: {},
    create: {
      email: "admin@devassist.local",
      name: "DevAssist Admin",
      passwordHash,
      role: "ADMIN"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
