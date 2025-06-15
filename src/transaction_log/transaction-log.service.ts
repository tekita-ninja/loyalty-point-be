import { Injectable } from '@nestjs/common';
import { Prisma, TransactionLog } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionLogService {
  constructor(private prismaService: PrismaService) {}

  async search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });

    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy: Prisma.TransactionLogOrderByWithRelationInput = {
      [orderField]: orderType,
    };

    const filter: any[] = [];

    if (query.action) {
      filter.push({ action: query.action });
    }

    if (query.type) {
      filter.push({
        customerPoint: {
          type: parseInt(query.type),
        },
      });
    }

    if (query.userId) {
      await checkDataById(query.userId, this.prismaService.user, 'userId');
      filter.push({
        customerPoint: {
          userId: query.userId,
        },
      });
    }

    return await paginate<TransactionLog, Prisma.TransactionLogFindManyArgs>(
      this.prismaService.transactionLog,
      {
        where: {
          AND: [...filter],
        },
        orderBy,
        select: {
          id: true,
          oldPoints: true,
          newPoints: true,
          pointDifference: true,
          action: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          deletedAt: true,
          deletedBy: true,
          createdUser: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
            },
          },
          updatedUser: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
            },
          },
          deletedUser: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
            },
          },
          customerPoint: {
            select: {
              id: true,
              rulePointId: true,
              transactionId: true,
              point: true,
              price: true,
              type: true,
              note: true,
              isCancel: true,
              expired: true,
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  phone: true,
                },
              },
              transaction: {
                select: {
                  id: true,
                  userId: true,
                  locationId: true,
                  rewardId: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              rulePoint: {
                select: {
                  id: true,
                  multiplier: true,
                },
              },
            },
          },
        },
      },
    );
  }
}
