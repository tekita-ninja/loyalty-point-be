import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPointDto, CustomPointDto } from './dto/point.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { EnumPointType } from 'src/common/enum/Point';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { CustomerPoint, Prisma } from '@prisma/client';
import { EnumTransactionLogAction } from 'src/common/enum/TransactionLog';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';

@Injectable()
export class PointService {
  constructor(private prismaService: PrismaService) {}

  async addPoint(userId: string, data: AddPointDto) {
    await checkDataById(data.userId, this.prismaService.user, 'userId');

    await this.isExpiredPoints(data.userId);

    await checkDataById(
      data.rulePointId,
      this.prismaService.rulePoint,
      'rulePointId',
    );

    return await this.prismaService.$transaction(async (tx) => {
      const oldPointsAgg = await this.prismaService.customerPoint.aggregate({
        _sum: { point: true },
        where: {
          AND: [{ userId: data.userId }, { isCancel: 0 }, { isExpired: 0 }],
        },
      });

      const oldPoints = oldPointsAgg._sum.point ?? 0;

      const rulePoint = await this.prismaService.rulePoint.findUnique({
        where: { id: data.rulePointId },
        select: { multiplier: true },
      });

      const calculatePoint = Math.ceil(
        data.price * Number(rulePoint.multiplier),
      );

      const customerPoint = await tx.customerPoint.create({
        data: {
          userId: data.userId,
          rulePointId: data.rulePointId,
          note: data.note,
          price: data.price,
          point: calculatePoint,
          type: EnumPointType.ADD,
        },
        select: {
          id: true,
          userId: true,
          rulePointId: true,
          note: true,
          price: true,
          point: true,
          type: true,
          isExpired: true,
          createdAt: true,
        },
      });

      await tx.transactionLog.create({
        data: {
          customerPointId: customerPoint.id,
          oldPoints,
          newPoints: oldPoints + calculatePoint,
          pointDifference: calculatePoint,
          action: EnumTransactionLogAction.ADD,
        },
      });

      const expiredDate = new Date();
      expiredDate.setFullYear(expiredDate.getFullYear() + 1);

      await tx.user.update({
        where: { id: data.userId },
        data: {
          exprPoints: expiredDate,
        },
      });

      return customerPoint;
    });
  }

  async customPoint(userId: string, data: CustomPointDto) {
    await checkDataById(data.userId, this.prismaService.user, 'userId');

    await this.isExpiredPoints(data.userId);

    return await this.prismaService.$transaction(async (tx) => {
      const oldPointsAgg = await this.prismaService.customerPoint.aggregate({
        _sum: { point: true },
        where: {
          AND: [{ userId: data.userId }, { isCancel: 0 }, { isExpired: 0 }],
        },
      });

      const oldPoints = oldPointsAgg._sum.point ?? 0;

      const customerPoint = await tx.customerPoint.create({
        data: {
          userId: data.userId,
          note: data.note,
          point: data.point,
          type: EnumPointType.CUSTOM,
        },
        select: {
          id: true,
          userId: true,
          note: true,
          point: true,
          type: true,
          isExpired: true,
          createdAt: true,
        },
      });

      await tx.transactionLog.create({
        data: {
          customerPointId: customerPoint.id,
          oldPoints,
          newPoints: oldPoints + data.point,
          pointDifference: data.point,
          action: EnumTransactionLogAction.CUSTOM,
        },
      });

      const expiredDate = new Date();
      expiredDate.setFullYear(expiredDate.getFullYear() + 1);

      await tx.user.update({
        where: { id: data.userId },
        data: {
          exprPoints: expiredDate,
        },
      });

      return customerPoint;
    });
  }

  async cancelPoint(customerPointId: string) {
    const getUserId = await this.prismaService.customerPoint.findUnique({
      where: { id: customerPointId },
      select: { userId: true },
    });

    return await this.prismaService.$transaction(async (tx) => {
      const oldPointsAgg = await tx.customerPoint.aggregate({
        _sum: { point: true },
        where: {
          AND: [
            { userId: getUserId.userId },
            { isCancel: 0 },
            { isExpired: 0 },
          ],
        },
      });

      const oldPoints = oldPointsAgg._sum.point ?? 0;

      const customerPoint = await tx.customerPoint.update({
        where: { id: customerPointId },
        data: {
          isCancel: 1,
        },
        select: {
          id: true,
          userId: true,
          note: true,
          point: true,
          type: true,
          isCancel: true,
          createdAt: true,
        },
      });

      await tx.transactionLog.create({
        data: {
          customerPointId: customerPoint.id,
          oldPoints,
          newPoints: oldPoints - customerPoint.point,
          pointDifference: -customerPoint.point,
          action: EnumTransactionLogAction.CANCEL,
        },
      });

      return customerPoint;
    });
  }

  async search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter: any[] = [];

    if (query.isCancel) {
      filter.push({ isCancel: parseInt(query.isCancel) });
    }

    if (query.type) {
      filter.push({ type: parseInt(query.type) });
    }

    if (query.userId) {
      filter.push({ userId: query.userId });
    }

    if (query.rulePointId) {
      filter.push({ rulePointId: query.rulePointId });
    }

    if (query.createdBy) {
      filter.push({ createdBy: query.createdBy });
    }

    const points = await paginate<CustomerPoint, Prisma.CustomerPointFindManyArgs>(
      this.prismaService.customerPoint,
      {
        where: {
          AND: [...filter],
        },
        orderBy,
        select: {
          id: true,
          rulePointId: true,
          note: true,
          price: true,
          point: true,
          type: true,
          isCancel: true,
          isExpired: true,
          createdAt: true,
          createdBy: true,
          createdByUser: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
            },
          },
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              gender: true,
              phone: true,
            },
          },
          rulePoint: {
            select: {
              id: true,
              multiplier: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          },
          transaction: {
            select: {
              id: true,
              note: true,
              cutPoint: true,
              qty: true,
              reward: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  urlPicture: true,
                  stocks: true,
                  startDate: true,
                  endDate: true,
                  isLimited: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              location: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  latitude: true,
                  longitude: true,
                  createdAt: true,
                  createdBy: true,
                },
              },
            },
          },
        },
      },
    );

    return transformUrlPicture(points);
  }

  async getPointByUserId(userId: string) {
    await this.isExpiredPoints(userId);
    await checkDataById(userId, this.prismaService.user, 'userId');

    const points = await this.prismaService.customerPoint.aggregate({
      _sum: { point: true },
      where: {
        AND: [{ userId: userId }, { isCancel: 0 }, { isExpired: 0 }],
      },
    });

    return {
      points: points._sum.point ?? 0,
    };
  }

  async isExpiredPoints(userId: string) {
    return await this.prismaService.$transaction(async (tx) => {
      const expiredDateUser = await tx.user.findUnique({
        where: { id: userId },
        select: { exprPoints: true },
      });

      if (expiredDateUser.exprPoints < new Date()) {
        await tx.customerPoint.updateMany({
          where: {
            userId: userId,
          },
          data: {
            isExpired: 1,
          },
        });
        return true;
      }

      return false;
    });
  }
}
