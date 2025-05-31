import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignRewardDto,
  CreateLocationDto,
  UpdateLocationDto,
} from './dto/location.dto';
import { checkDataById, checkDataByIds } from 'src/common/utils/checkDataById';
import { Location, Prisma, Reward } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class LocationService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.location.findMany({
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
    return this.prismaService.location.create({
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
    await checkDataById<Location>(id, this.prismaService.location);
    return this.prismaService.location.findUnique({
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
  }

  async update(id: string, data: UpdateLocationDto) {
    await checkDataById<Location>(id, this.prismaService.location);
    return this.prismaService.location.update({
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
    await checkDataById<Location>(id, this.prismaService.location);
    return this.prismaService.location.delete({
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
    const orderField = query.sortBy || 'id';
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

  async assignRewards(data: AssignRewardDto) {
    await checkDataByIds<Reward>(
      data.reward_ids,
      this.prismaService.reward,
      'reward',
    );

    await checkDataById<Location>(
      data.location_id,
      this.prismaService.location,
      'location',
    );

    const pivotData = data.reward_ids.map((rewardId) => ({
      rewardId,
      locationId: data.location_id,
    }));

    return await this.prismaService.rewardLocation.createMany({
      data: pivotData,
      skipDuplicates: true,
    });
  }

  async findManyRewards(locationId: string, query: QueryParamDto) {
    await checkDataById<Location>(
      locationId,
      this.prismaService.location,
      'location',
    );

    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter = [
      {
        locations: {
          some: { locationId },
        },
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

    return await paginate<Reward, Prisma.RewardFindManyArgs>(
      this.prismaService.reward,
      {
        where: { AND: filter },
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
