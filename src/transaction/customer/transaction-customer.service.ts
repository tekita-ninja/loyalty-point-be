import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EnumPointType } from 'src/common/enum/Point';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmTransactionCustomerDto } from './dto/transaction-customer.dto';
import { comparePassword } from 'src/common/password';
import { EnumTransactionLog } from 'src/common/enum/TransactionLog';

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
      where: { AND: [{ userId: userId }, { isCancel: 0 }] },
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
      const updatedTransaction = await tx.transaction.update({
        where: {
          id: data.transactionId,
        },
        data: {
          status: 1,
        },
        select: {
          id: true,
          cutPoint: true,
        },
      });

      const expiredDate = new Date();
      expiredDate.setMonth(expiredDate.getMonth() + 1);

      const newCustomerPoint = await tx.customerPoint.create({
        data: {
          userId: userId,
          transactionId: transaction.id,
          point: -transaction.cutPoint,
          note: `${transaction.note}`,
          createdBy: transaction.userId,
          type: EnumPointType.TRANSACTION,
          expired: expiredDate,
        } as Prisma.CustomerPointUncheckedCreateInput,
        include: {
          transaction: true,
        },
      });

      await tx.transactionLog.create({
        data: {
          customerPointId: newCustomerPoint.id,
          oldPoints,
          newPoints: oldPoints + updatedTransaction.cutPoint,
          pointDifference: updatedTransaction.cutPoint,
          action: EnumTransactionLog.TRANSACTION,
        },
      });

      return newCustomerPoint;
    });
  }
}
