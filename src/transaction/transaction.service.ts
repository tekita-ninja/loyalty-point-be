import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma, Transaction } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prismaService: PrismaService) {}

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
      throw new Error('Reward not found');
    }

    return await this.prismaService.transaction.create({
      data: {
        user: {
          connect: { id: data.userId },
        },
        reward: {
          connect: { id: data.rewardId },
        },
        location: {
          connect: { id: data.locationId },
        },
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
    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter: any[] = [];

    if (query.locationId) {
      await checkDataById(
        query.locationId,
        this.prismaService.location,
        'locationId',
      );
      filter.push({ locationId: query.locationId });
    }

    if (query.userId) {
      await checkDataById(query.userId, this.prismaService.user, 'userId');
      filter.push({ userId: query.userId });
    }

    if (query.rewardId) {
      await checkDataById(
        query.rewardId,
        this.prismaService.reward,
        'rewardId',
      );
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
        include: {
          customerPoint: true,
        },
      },
    );
  }
}
