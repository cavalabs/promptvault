import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@cavalabs.tech";

export async function getDemoUser() {
  return prisma.user.upsert({
    where: {
      email: DEMO_EMAIL,
    },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "CavaLabs",
      image: "/globe.svg",
    },
  });
}
