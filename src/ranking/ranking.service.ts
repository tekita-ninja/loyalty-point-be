import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRankingDto, UpdateRankingDto } from './dto/ranking.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { Prisma, Promotion, Ranking } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { FileService } from 'src/common/files/files.service';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';

@Injectable()
export class RankingService {
  constructor(
    private prismaService: PrismaService,
    private fileService: FileService,
  ) {}

  async findAll() {
    return await this.prismaService.ranking.findMany({
      select: {
        id: true,
        name: true,
        minSpendings: true,
        minPoints: true,
        urlPicture: true,
      },
    });
  }

  async create(data: CreateRankingDto) {
    if (!(await this.fileService.isFileExistsInUpload(data.urlPicture))) {
      data.urlPicture = await this.fileService.copyFileFromTemp(
        data.urlPicture,
      );
    } else {
      data.urlPicture = await this.fileService.getPathName(data.urlPicture);
    }
    const reward = await this.prismaService.ranking.create({
      data,
      select: {
        id: true,
        name: true,
        minSpendings: true,
        minPoints: true,
        urlPicture: true,
      },
    });

    return transformUrlPicture(reward);
  }

  async findOne(id: string) {
    await checkDataById<Ranking>(id, this.prismaService.ranking, 'ranking');

    const reward = await this.prismaService.ranking.findUnique({
      where: { id },
      select: {
        name: true,
        minSpendings: true,
        minPoints: true,
        urlPicture: true,
        benefits: {
          select: {
            benefit: {
              select: {
                title: true,
                description: true,
              },
            },
          },
        },
        promotions: {
          select: {
            promotion: {
              select: {
                id: true,
                title: true,
                subtitle: true,
                description: true,
                startDate: true,
                endDate: true,
                isPush: true,
              },
            },
          },
        },
      },
    });

    return transformUrlPicture(reward);
  }

  async update(id: string, data: UpdateRankingDto) {
    await checkDataById<Ranking>(id, this.prismaService.ranking, 'ranking');

    if (!(await this.fileService.isFileExistsInUpload(data.urlPicture))) {
      data.urlPicture = await this.fileService.copyFileFromTemp(
        data.urlPicture,
      );
    } else {
      data.urlPicture = await this.fileService.getPathName(data.urlPicture);
    }

    const reward = await this.prismaService.ranking.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        minSpendings: true,
        minPoints: true,
        urlPicture: true,
      },
    });

    return transformUrlPicture(reward);
  }

  async delete(id: string) {
    await checkDataById<Ranking>(id, this.prismaService.ranking, 'ranking');

    const reward = await this.prismaService.ranking.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        minSpendings: true,
        minPoints: true,
        urlPicture: true,
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
    const rewards = await paginate<Ranking, Prisma.RankingFindManyArgs>(
      this.prismaService.ranking,
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
          minSpendings: true,
          minPoints: true,
          urlPicture: true,
        },
      },
    );

    return transformUrlPicture(rewards);
  }

  async findManyPromotions(rankingId: string, query: QueryParamDto) {
    await checkDataById<Ranking>(
      rankingId,
      this.prismaService.ranking,
      'ranking',
    );

    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const promotions = await paginate<Promotion, Prisma.PromotionFindManyArgs>(
      this.prismaService.promotion,
      {
        where: {
          rankings: {
            some: { rankingId },
          },
        },
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
