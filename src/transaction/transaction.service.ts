import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma, Transaction } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prismaService: PrismaService) { }

  async create(data: CreateTransactionDto) {
    await checkDataById(data.userId, this.prismaService.user, 'userId');
    await checkDataById(
      data.locationId,
      this.prismaService.location,
      'locationId',
    );
    const reward = await this.prismaService.reward.findUnique({
      where: { id: data.rewardId },
    });

    if (!reward) {
      throw new BadRequestException('Reward not found');
    }

    if (reward.stocks < 1) {
      throw new BadRequestException('Reward is out of stock');
    }

    return await this.prismaService.transaction.create({
      data: {
        userId: data.userId,
        locationId: data.locationId,
        rewardId: data.rewardId,
        note: data.note,
        cutPoint: reward.price,
        expired: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  async Search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter: any[] = [];

    if (query.locationId) {
      filter.push({ locationId: query.locationId });
    }

    if (query.userId) {
      filter.push({ userId: query.userId });
    }

    if( query.createdBy) {
      filter.push({ createdBy: query.createdBy });
    }

    if (query.rewardId) {
      filter.push({ rewardId: query.rewardId });
    }

    if (query.status) {
      filter.push({ status: parseInt(query.status) });
    }

    if (query.expired == '0') {
      filter.push({ expired: { gt: new Date() } });
    } 

    if (query.expired == '1') {
      filter.push({ expired: { lt: new Date() } });
    }

    return await paginate<Transaction, Prisma.TransactionFindManyArgs>(
      this.prismaService.transaction,
      {
        where: {
          AND: [...filter],
        },
        orderBy,
        select: {
          id: true,
          cutPoint: true,
          note: true,
          expired: true,
          status: true,
          createdAt: true,
          rewardId: true,
          createdBy: true,
          date: true,
          createdByUser: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              gender: true,
              birthDate: true,
              status: true,
              createdAt: true,
            },
          },
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
            }
          },
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              gender: true,
              birthDate: true,
              status: true,
              exprPoints: true,
              createdAt: true,
            }
          },
          customerPoint: {
            select: {
              id: true,
              userId: true,
              note: true,
              price: true,
              point: true,
              isExpired: true,
              type: true,
              isCancel: true,
            },
          },
        }

      },
    );
  }
}
