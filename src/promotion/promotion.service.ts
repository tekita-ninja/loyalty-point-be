import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { Prisma, Promotion } from '@prisma/client';
import { FileService } from 'src/common/files/files.service';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class PromotionService {
  constructor(
    private prismaService: PrismaService,
    private fileService: FileService,
  ) {}

  async findAll() {
    const promotion = await this.prismaService.promotion.findMany({
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        urlPicture: true,
        startDate: true,
        endDate: true,
        isPush: true,
      },
    });

    return transformUrlPicture(promotion);
  }

  async create(data: CreatePromotionDto) {
    if (!(await this.fileService.isFileExistsInUpload(data.urlPicture))) {
      data.urlPicture = await this.fileService.copyFileFromTemp(
        data.urlPicture,
      );
    } else {
      data.urlPicture = await this.fileService.getPathName(data.urlPicture);
    }

    data = { ...data, isPush: 0 };

    const reward = await this.prismaService.promotion.create({
      data,
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        urlPicture: true,
        startDate: true,
        endDate: true,
        isPush: true,
      },
    });

    return reward;
  }

  async findOne(id: string) {
    await checkDataById<Promotion>(
      id,
      this.prismaService.promotion,
      'promotion',
    );

    const reward = await this.prismaService.promotion.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        startDate: true,
        urlPicture: true,
        endDate: true,
        isPush: true,
        rankings: {
          select: {
            ranking: {
              select: {
                id: true,
                name: true,
                minPoints: true,
                minSpendings: true,
              },
            },
          },
        },
      },
    });

    return transformUrlPicture(reward);
  }

  async update(id: string, data: UpdatePromotionDto) {
    await checkDataById<Promotion>(
      id,
      this.prismaService.promotion,
      'promotion',
    );

    console.log(await this.fileService.isFileExistsInUpload(data.urlPicture));

    if (!(await this.fileService.isFileExistsInUpload(data.urlPicture))) {
      data.urlPicture = await this.fileService.copyFileFromTemp(
        data.urlPicture,
      );
    } else {
      data.urlPicture = await this.fileService.getPathName(data.urlPicture);
    }

    data = { ...data, isPush: 0 };

    const rewards = await this.prismaService.promotion.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        subtitle: true,
        urlPicture: true,
        description: true,
        startDate: true,
        endDate: true,
        isPush: true,
      },
    });

    return transformUrlPicture(rewards);
  }

  async delete(id: string) {
    await checkDataById<Promotion>(
      id,
      this.prismaService.promotion,
      'promotion',
    );

    const reward = await this.prismaService.promotion.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        urlPicture: true,
        description: true,
        startDate: true,
        endDate: true,
        isPush: true,
      },
    });

    return transformUrlPicture(reward);
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

    if (query.rankingId) {
      filter.push({
        rankings: {
          some: {
            rankingId: query.rankingId,
          },
        },
      });
    }

    if (query.search) {
      filter.push({
        title: {
          contains: query.search,
          mode: 'insensitive',
        },
      });
    }

    const whereStatement = filter.length > 0 ? { AND: filter } : {};

    const promotions = await paginate<Promotion, Prisma.PromotionFindManyArgs>(
      this.prismaService.promotion,
      {
        where: whereStatement,
        orderBy,
        select: {
          id: true,
          title: true,
          subtitle: true,
          urlPicture: true,
          description: true,
          startDate: true,
          endDate: true,
          isPush: true,
        },
      },
    );

    return transformUrlPicture(promotions);
  }
}
