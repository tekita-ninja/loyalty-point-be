import { Injectable } from '@nestjs/common';
import { checkDataById } from 'src/common/utils/checkDataById';
import { CreateRewardDto, UpdateRewardDto } from './dto/reward.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, Prisma, Reward } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { FileService } from 'src/common/files/files.service';

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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.toRewardsResponse(rewards)
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

    return this.toRewardResponse(reward)
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

    return this.toRewardResponse(reward)
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
    }

    const reward = await this.prismaService.reward.update({
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

    return this.toRewardResponse(reward)
  }

  async delete(id: string) {
    await checkDataById<Reward>(id, this.prismaService.reward, 'reward');

    const reward = await this.prismaService.reward.delete({
      where: { id },
    });

    return this.toRewardResponse(reward)
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
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    );

    return this.toRewardsResponse(rewards)

  }

  toRewardResponse(reward: any) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      ...reward,
      urlPicture: `${baseUrl}/${reward.urlPicture}`, // full URL hasil gabungan
    };
  }

  toRewardsResponse(rewards: any) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    if (Array.isArray(rewards)) {
    return rewards.map(reward => ({
        ...reward,
        urlPicture: `${baseUrl}/${reward.urlPicture}`,
      }));
    }

    // Jika rewards adalah objek dengan properti data (pagination result)
    if (Array.isArray(rewards?.data)) {
      const modifiedData = rewards.data.map(reward => ({
        ...reward,
        urlPicture: `${baseUrl}/${reward.urlPicture}`,
      }));

      return {
        ...rewards,
        data: modifiedData,
      };
    }
  }

}
