import { Injectable } from '@nestjs/common';
import { checkDataById, checkDataByIds } from 'src/common/utils/checkDataById';
import {
  CreateRewardDto,
  ReplaceRewardLocationsDto,
  UpdateRewardDto,
} from './dto/reward.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, Prisma, Reward } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { FileService } from 'src/common/files/files.service';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';

@Injectable()
export class RewardService {
  constructor(
    private prismaService: PrismaService,
    private fileService: FileService,
  ) {}

  async findAll() {
    const rewards = await this.prismaService.reward.findMany({
      select: {
        id: true,
        name: true,
        urlPicture: true,
        price: true,
        startDate: true,
        endDate: true,
        isLimited: true,
        stocks: true,
        category: {
          select: {
            id: true,
            name: true,
          },
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
    });

    const rewardsWithLikeStatus = (rewards as any).map((reward) => ({
      ...reward,
      totalLikes: reward.likes.length,
      likes: undefined,
    }));

    return transformUrlPicture(rewardsWithLikeStatus);
  }

  async create(data: CreateRewardDto) {
    await checkDataById<Category>(
      data.categoryId,
      this.prismaService.category,
      'category',
    );

    if (!(await this.fileService.isFileExistsInUpload(data.urlPicture))) {
      data.urlPicture = await this.fileService.copyFileFromTemp(
        data.urlPicture,
      );
    } else {
      data.urlPicture = await this.fileService.getPathName(data.urlPicture);
    }

    const reward = await this.prismaService.reward.create({
      data: {
        name: data.name,
        urlPicture: data.urlPicture,
        price: data.price,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        startDate: data.startDate,
        endDate: data.endDate,
        stocks: data.stocks,
        isLimited: data.isLimited,
      },
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
      },
    });

    return transformUrlPicture(reward);
  }

  async findOne(id: string) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    const reward = await this.prismaService.reward.findUnique({
      where: { id },
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
    });

    const rewardsWithLikeStatus = {
      ...reward,
      totalLikes: reward.likes.length,
      likes: undefined,
    };

    return transformUrlPicture(rewardsWithLikeStatus);
  }

  async update(id: string, data: UpdateRewardDto) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    await checkDataById<Category>(
      data.categoryId,
      this.prismaService.category,
      'category',
    );

    if (!(await this.fileService.isFileExistsInUpload(data.urlPicture))) {
      data.urlPicture = await this.fileService.copyFileFromTemp(
        data.urlPicture,
      );
    } else {
      data.urlPicture = await this.fileService.getPathName(data.urlPicture);
    }

    const reward = await this.prismaService.reward.update({
      where: { id },
      data: {
        ...data,
        startDate: data.isLimited == 1 ? data.startDate : null,
        endDate: data.isLimited == 1 ? data.endDate : null,
      },
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
      },
    });

    return transformUrlPicture(reward);
  }

  async delete(id: string) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    const reward = await this.prismaService.reward.delete({
      where: { id },
    });

    return transformUrlPicture(reward);
  }

  async search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });

    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter = [] as any[];

    if (query.startDate) {
      filter.push({
        startDate: {
          gte: new Date(query.startDate),
        },
      });
    }

    if (query.endDate) {
      filter.push({
        endDate: {
          lte: new Date(query.endDate),
        },
      });
    }

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

    if (query.isLimited == '0'|| query.isLimited == '1') {
      filter.push({
        isLimited: Number(query.isLimited),
      });
    }

    if (query.isLowStock == '1') {
      filter.push({
        stocks: { lt: 10 },
      });
    }

    const whereStatement = filter.length > 0 ? { AND: filter } : {};

    const rewards = await paginate<Reward, Prisma.RewardFindManyArgs>(
      this.prismaService.reward,
      {
        where: whereStatement,
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

    const rewardsWithLikeStatus = (rewards.data as any).map((reward) => ({
      ...reward,
      totalLikes: reward.likes.length,
      likes: undefined,
    }));

    return transformUrlPicture(rewardsWithLikeStatus);
  }

  async replaceRewardLocations(data: ReplaceRewardLocationsDto) {
    await checkDataById(data.rewardId, this.prismaService.reward);

    await checkDataByIds(data.locationIds, this.prismaService.location);

    const pivotData = data.locationIds.map((item) => ({
      rewardId: data.rewardId,
      locationId: item,
    }));

    return await this.prismaService.$transaction(async (tx) => {
      await tx.rewardLocation.deleteMany({
        where: { rewardId: data.rewardId },
      });

      if (pivotData.length > 0) {
        return await tx.rewardLocation.createMany({
          data: pivotData,
          skipDuplicates: true,
        });
      }

      return {
        count: 0,
      };
    });
  }

  async likeReward(rewardId: string, userId: string) {
    await checkDataById<Reward>(rewardId, this.prismaService.reward, 'reward');
    await checkDataById(userId, this.prismaService.user, 'user');

    const existingLike = await this.prismaService.like.findFirst({
      where: {
        rewardId,
        userId,
      },
    });

    if (existingLike) {
      if (existingLike.unlikedAt) {
        await this.prismaService.like.update({
          where: {
            id: existingLike.id,
          },
          data: {
            unlikedAt: null,
            likedAt: new Date(),
          },
        });

        return { status: 'liked' };
      }

      await this.prismaService.like.update({
        where: {
          id: existingLike.id,
        },
        data: {
          unlikedAt: new Date(),
        },
      });

      return { status: 'unliked' };
    } else {
      await this.prismaService.like.create({
        data: {
          rewardId,
          userId,
          likedAt: new Date(),
        },
      });

      return { status: 'liked' };
    }
  }
}
