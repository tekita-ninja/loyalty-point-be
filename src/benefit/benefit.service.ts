import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBenefitDto,
  ReplaceBenefitRankingsDto,
  UpdateBenefitDto,
} from './dto/benefit.dto';
import { Benefit, Prisma, Ranking } from '@prisma/client';
import { checkDataById, checkDataByIds } from 'src/common/utils/checkDataById';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class BenefitService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.benefit.findMany({
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  }

  async create(data: CreateBenefitDto) {
    return await this.prismaService.benefit.create({
      data,
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  }

  async findOne(id: string) {
    await checkDataById<Benefit>(id, this.prismaService.benefit, 'benefit');
    return await this.prismaService.benefit.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        rankings: {
          select: {
            ranking: {
              select: {
                name: true,
                minSpendings: true,
                minPoints: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateBenefitDto) {
    await checkDataById<Benefit>(id, this.prismaService.benefit, 'benefit');

    return await this.prismaService.benefit.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  }

  async delete(id: string) {
    await checkDataById<Benefit>(id, this.prismaService.benefit, 'benefit');
    return await this.prismaService.benefit.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
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
    return await paginate<Benefit, Prisma.BenefitFindManyArgs>(
      this.prismaService.benefit,
      {
        where: {
          OR: query?.search
            ? [{ title: { contains: query.search, mode: 'insensitive' } }]
            : undefined,
        },
        orderBy,
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    );
  }

  async replaceBenefitRankings(data: ReplaceBenefitRankingsDto) {
    await checkDataById<Benefit>(data.benefitId, this.prismaService.benefit);

    await checkDataByIds<Ranking>(data.rankingIds, this.prismaService.ranking);

    const pivotData = data.rankingIds.map((item) => ({
      benefitId: data.benefitId,
      rankingId: item,
    }));

    return await this.prismaService.$transaction(async (tx) => {
      await tx.rankingBenefit.deleteMany({
        where: { rankingId: data.benefitId },
      });

      let result = { count: 0 };
      if (pivotData.length > 0) {
        result = await tx.rankingBenefit.createMany({
          data: pivotData,
          skipDuplicates: true,
        });
      }

      return result;
    });
  }
}
