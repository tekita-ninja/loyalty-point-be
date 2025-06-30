import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateLocationDto,
  ReplaceLocationRewardsDto,
  UpdateLocationDto,
} from './dto/location.dto';
import { checkDataById, checkDataByIds } from 'src/common/utils/checkDataById';
import { Location, Prisma, Reward } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { RewardService } from 'src/reward/reward.service';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';

@Injectable()
export class LocationService {
  constructor(
    private prismaService: PrismaService,
    private rewardService: RewardService,
  ) {}

  async findAll() {
    return await this.prismaService.location.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  async create(data: CreateLocationDto) {
    return await this.prismaService.location.create({
      data,
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  async findOne(id: string) {
    await checkDataById<Location>(id, this.prismaService.location, 'location');
    const location = await this.prismaService.location.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        rewards: {
          select: {
            reward: {
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
          },
        },
      },
    });

    return transformUrlPicture(location)
  }

  async update(id: string, data: UpdateLocationDto) {
    await checkDataById<Location>(id, this.prismaService.location, 'location');
    return await this.prismaService.location.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  async delete(id: string) {
    await checkDataById<Location>(id, this.prismaService.location, 'location');
    return await this.prismaService.location.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
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

    return await paginate<Location, Prisma.LocationFindManyArgs>(
      this.prismaService.location,
      {
        where: {
          OR: query?.search
            ? [{ name: { contains: query.search, mode: 'insensitive' } }]
            : undefined,
        },
        orderBy,
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      },
    );
  }

  async replaceLocationRewards(data: ReplaceLocationRewardsDto) {
    await checkDataByIds<Reward>(
      data.rewardIds,
      this.prismaService.reward,
      'reward',
    );

    await checkDataById<Location>(
      data.locationId,
      this.prismaService.location,
      'location',
    );

    const pivotData = data.rewardIds.map((rewardId) => ({
      rewardId,
      locationId: data.locationId,
    }));

    return await this.prismaService.$transaction(async (tx) => {
      await tx.rewardLocation.deleteMany({
        where: { locationId: data.locationId },
      });

      let result = { count: 0 };

      if (pivotData.length > 0) {
        result = await tx.rewardLocation.createMany({
          data: pivotData,
          skipDuplicates: true,
        });
      }

      return result;
    });
  }

  async findManyRewards(
    userId: string,
    locationId: string,
    query: QueryParamDto,
  ) {
    await checkDataById<Location>(
      locationId,
      this.prismaService.location,
      'location',
    );

    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter = [
      {
        locations: {
          some: { locationId },
        },
      },
      {
        OR: [{ startDate: { lte: new Date() } }, { startDate: null }],
      },
      {
        OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
      },
    ] as any[];

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

    type RewardWithLikes = Reward & {
      likes: { id: string }[];
    };

    const rewards = await paginate<RewardWithLikes, Prisma.RewardFindManyArgs>(
      this.prismaService.reward,
      {
        where: { AND: filter },
        orderBy,
        select: {
          id: true,
          name: true,
          urlPicture: true,
          price: true,
          startDate: true,
          endDate: true,
          stocks: true,
          isLimited: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          locations: {
            where: { locationId },
          },
          likes: {
            where: {
              unlikedAt: null,
            },
            select: {
              id: true,
              userId: true,
              unlikedAt: true,
              likedAt: true,
            },
          },
        },
      },
    );

    const rewardsWithLikeStatus = rewards.data.map((reward) => ({
      ...reward,
      liked: (reward.likes as any).some(
        (like) =>
          like.userId === userId &&
          like.likedAt !== null &&
          like.unlikedAt === null,
      ),
      totalLikes: reward.likes.length,
      likes: undefined,
    }));

    return transformUrlPicture(rewardsWithLikeStatus);
  }
}
