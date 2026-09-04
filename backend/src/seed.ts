import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const brandUser = await prisma.user.create({
    data: {
      email: 'brand@example.com',
      passwordHash: hashedPassword,
      role: 'BRAND',
      brand: {
        create: {
          companyName: 'TechBrand Inc',
          industry: 'Technology',
          description: 'A leading tech company',
        },
      },
    },
    include: { brand: true },
  });

  const creatorUser = await prisma.user.create({
    data: {
      email: 'creator@example.com',
      passwordHash: hashedPassword,
      role: 'CREATOR',
      creator: {
        create: {
          bio: 'Tech reviewer and content creator',
          niche: 'Technology',
          followers: 50000,
          engagementRate: 4.5,
        },
      },
    },
    include: { creator: true },
  });

  const freelancerUser = await prisma.user.create({
    data: {
      email: 'freelancer@example.com',
      passwordHash: hashedPassword,
      role: 'FREELANCER',
      freelancer: {
        create: {
          skills: 'Video Editing, Graphic Design',
          hourlyRate: 50,
          availability: 'Available',
        },
      },
    },
    include: { freelancer: true },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      passwordHash: hashedPassword,
      role: 'TALENT_MANAGER',
      talentManager: {
        create: {},
      },
    },
    include: { talentManager: true },
  });

  const campaign = await prisma.campaign.create({
    data: {
      brandId: brandUser.brand!.id,
      name: 'Summer Tech Launch',
      description: 'Launch campaign for new tech products',
      budget: 50000,
      status: 'ACTIVE',
    },
  });

  const collabRequest = await prisma.collaborationRequest.create({
    data: {
      campaignId: campaign.id,
      brandId: brandUser.brand!.id,
      creatorId: creatorUser.creator!.id,
      status: 'PENDING',
    },
  });

  const contract = await prisma.contract.create({
    data: {
      collaborationRequestId: collabRequest.id,
      brandId: brandUser.brand!.id,
      creatorId: creatorUser.creator!.id,
      terms: 'Standard collaboration terms',
      status: 'DRAFT',
    },
  });

  await prisma.task.create({
    data: {
      contractId: contract.id,
      description: 'Create launch video',
      assigneeId: freelancerUser.freelancer!.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'TODO',
    },
  });

  await prisma.payment.create({
    data: {
      contractId: contract.id,
      amount: 5000,
      status: 'PENDING',
    },
  });

  await prisma.portfolio.create({
    data: {
      creatorId: creatorUser.creator!.id,
      title: 'Product Review - Smart Watch',
      description: 'Review of the latest smart watch',
      mediaUrl: 'https://example.com/watch-review.mp4',
    },
  });

  await prisma.review.create({
    data: {
      campaignId: campaign.id,
      creatorId: creatorUser.creator!.id,
      rating: 5,
      comment: 'Great collaboration experience',
    },
  });

  await prisma.message.create({
    data: {
      senderId: brandUser.id,
      receiverId: creatorUser.id,
      content: 'Hi, we would like to collaborate!',
    },
  });

  await prisma.notification.create({
    data: {
      userId: creatorUser.id,
      type: 'COLLABORATION_REQUEST',
      content: 'You have a new collaboration request',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      userId: creatorUser.id,
      campaignId: campaign.id,
      type: 'CREATOR_RECOMMENDATION',
      result: JSON.stringify({ score: 0.95, reason: 'High engagement rate' }),
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
