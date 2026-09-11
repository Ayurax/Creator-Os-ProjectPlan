const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const user = await prisma.user.findUnique({ where: { email: process.argv[2] }, select: { id: true } });
  const fl = await prisma.freelancer.findUnique({ where: { userId: user.id }, select: { id: true } });
  console.log(fl ? fl.id : 'NOT_FOUND');
  await prisma.$disconnect();
})();
