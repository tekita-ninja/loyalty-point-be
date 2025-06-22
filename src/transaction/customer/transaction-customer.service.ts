import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EnumPointType } from 'src/common/enum/Point';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmTransactionCustomerDto } from './dto/transaction-customer.dto';
import { comparePassword } from 'src/common/password';
import { EnumTransactionLogAction } from 'src/common/enum/TransactionLog';
import { EnumTransactionStatus } from 'src/common/enum/Transaction';

@Injectable()
export class TransactionCustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCustomerTransactions(customerId: string) {
    return await this.prismaService.transaction.findMany({
      where: {
        userId: customerId,
      },
      include: {
        user: true,
        reward: true,
        location: true,
      },
    });
  }

  async confirmTransaction(
    userId: string,
    data: ConfirmTransactionCustomerDto,
  ) {
    const oldPointsAgg = await this.prismaService.customerPoint.aggregate({
      _sum: { point: true },
      where: { AND: [{ userId: userId }, { isCancel: 0 }, { isExpired: 0 }] },
    });

    const oldPoints = oldPointsAgg._sum.point ?? 0;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !(await comparePassword(data.password, user.password))) {
      throw new BadRequestException('Invalid PIN');
    }

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: data.transactionId,
        userId: userId,
      },
    });

    if (!transaction) {
      throw new BadRequestException(
        'Transaction not found or does not belong to user',
      );
    }

    if (transaction.expired < new Date()) {
      throw new BadRequestException('Transaction has expired');
    }

    if (oldPoints < transaction.cutPoint) {
      throw new BadRequestException('Insufficient points');
    }

    const customerPoint = await this.prismaService.customerPoint.findUnique({
      where: {
        userId: userId,
        transactionId: transaction.id,
      },
      select: {
        id: true,
      },
    });

    if (customerPoint) {
      throw new BadRequestException(
        'Customer point already exists for this transaction',
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const reward = await this.prismaService.reward.findUnique({
        where: {
          id: transaction.rewardId,
        },
        select: {
          stocks: true,
        },
      });

      if (!reward) {
        throw new BadRequestException('Reward not found');
      }

      if(reward.stocks < 1) {
        throw new BadRequestException('Reward is out of stock');
      }

      const updatedTransaction = await tx.transaction.update({
        where: {
          id: data.transactionId,
        },
        data: {
          status: EnumTransactionStatus.CONFIRMED,
        },
        select: {
          id: true,
          cutPoint: true,
          rewardId: true,
        },
      });


      await tx.reward.update({
        where: {
          id: updatedTransaction.rewardId,
        },
        data: {
          stocks: {
            decrement: 1,
          },
        },
      });

      const newCustomerPoint = await tx.customerPoint.create({
        data: {
          userId: userId,
          transactionId: transaction.id,
          point: -transaction.cutPoint,
          note: `${transaction.note}`,
          createdBy: transaction.userId,
          type: EnumPointType.TRANSACTION,
          isExpired: 0,
        } as Prisma.CustomerPointUncheckedCreateInput,
        include: {
          transaction: true,
        },
      });

      await tx.transactionLog.create({
        data: {
          customerPointId: newCustomerPoint.id,
          oldPoints,
          newPoints: oldPoints - updatedTransaction.cutPoint,
          pointDifference: -updatedTransaction.cutPoint,
          action: EnumTransactionLogAction.TRANSACTION,
        },
      });

      return newCustomerPoint;
    });
  }
}
