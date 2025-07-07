import { PrismaService } from 'src/prisma/prisma.service';

export async function checkRankingUser(
  userId: string,
  prismaService: PrismaService,
) {
  const user = await prismaService.user.findUnique({
    where: { id: userId },
    include: {
      customerPoints: {
        where: {
          isCancel: 0,
        },
      },
      ranking: {
        include: {
          rulePoint: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const totalSpending =
    user.customerPoints?.reduce((sum, cp) => sum + Number(cp.price), 0) || 0;

  const eligibleRanking = await prismaService.ranking.findFirst({
    where: {
      minSpendings: {
        lte: totalSpending,
      },
    },
    orderBy: {
      minSpendings: 'desc',
    },
  });

  if (eligibleRanking && user.ranking?.id !== eligibleRanking.id) {
    await prismaService.user.update({
      where: { id: userId },
      data: {
        rankingId: eligibleRanking.id,
      },
      select: {
        ranking: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return true;
  }

  return false;
}
