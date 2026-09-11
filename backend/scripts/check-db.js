const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const fl = await prisma.freelancer.findMany({ select: { id: true, userId: true } });
  console.log('FREELANCERS:', JSON.stringify(fl, null, 2));
  await prisma.$disconnect();
})();
