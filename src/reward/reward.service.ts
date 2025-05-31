import { Injectable } from '@nestjs/common';
import { checkDataById } from 'src/common/utils/checkDataById';
import { CreateRewardDto, UpdateRewardDto } from './dto/reward.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, Prisma, Reward } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class RewardService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.reward.findMany({
      select: {
        id: true,
        name: true,
        urlPicture: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: CreateRewardDto) {
    await checkDataById<Category>(
      data.category_id,
      this.prismaService.category,
      'category',
    );

    return this.prismaService.reward.create({
      data: {
        name: data.name,
        urlPicture: data.urlPicture,
        price: data.price,
        category: {
          connect: {
            id: data.category_id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        urlPicture: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    return this.prismaService.reward.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        urlPicture: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        locations: {
          select: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateRewardDto) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    return this.prismaService.reward.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        urlPicture: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    return this.prismaService.reward.delete({
      where: { id },
    });
  }

  async search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });

    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter = [];

    if (query.locationId) {
      filter.push({
        locations: {
          some: {
            locationId: query.locationId,
          },
        },
      });
    }

    if (query.categoryId) {
      filter.push({
        categoryId: query.categoryId,
      });
    }

    if (query.search) {
      filter.push({
        name: {
          contains: query.search,
          mode: 'insensitive',
        },
      });
    }

    const whereStatement = filter.length > 0 ? { AND: filter } : {};

    return await paginate<Reward, Prisma.RewardFindManyArgs>(
      this.prismaService.reward,
      {
        where: whereStatement,
        orderBy,
        select: {
          id: true,
          name: true,
          urlPicture: true,
          price: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );
  }
}
