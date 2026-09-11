const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const payment = await prisma.payment.create({
    data: { contractId: Number(process.argv[2]), amount: 5000, status: 'PENDING' }
  });
  console.log(payment.id);
  await prisma.$disconnect();
})();
