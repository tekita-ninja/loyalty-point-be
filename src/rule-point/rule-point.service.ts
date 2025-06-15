import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRulePointDto, UpdateRulePointDto } from './dto/rule-point.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { Prisma, RulePoint } from '@prisma/client';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class RulePointService {
  constructor(private prismaService: PrismaService) {}
  async findAll() {
    return await this.prismaService.rulePoint.findMany({
      select: {
        id: true,
        isActive: true,
        multiplier: true,
      },
    });
  }

  async create(data: CreateRulePointDto) {
    return await this.prismaService.rulePoint.create({
      data,
    });
  }

  async findOne(id: string) {
    await checkDataById<RulePoint>(
      id,
      this.prismaService.rulePoint,
      'rule point',
    );

    return await this.prismaService.rulePoint.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        multiplier: true,
      },
    });
  }
  async update(id: string, data: UpdateRulePointDto) {
    await checkDataById<RulePoint>(
      id,
      this.prismaService.rulePoint,
      'rule point',
    );

    return await this.prismaService.rulePoint.update({
      where: { id },
      data,
      select: {
        id: true,
        isActive: true,
        multiplier: true,
      },
    });
  }

  async delete(id: string) {
    await checkDataById<RulePoint>(
      id,
      this.prismaService.rulePoint,
      'rule point',
    );

    return await this.prismaService.rulePoint.delete({
      where: { id },
      select: {
        id: true,
        isActive: true,
        multiplier: true,
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

    return await paginate<RulePoint, Prisma.RulePointFindManyArgs>(
      this.prismaService.rulePoint,
      {
        where: query?.isActive ? { isActive: query.isActive } : undefined,
        orderBy,
        select: {
          id: true,
          isActive: true,
          multiplier: true,
        },
      },
    );
  }

  async assignRanking(rankingId: string, rulePointId: string) {
    await checkDataById<RulePoint>(
      rulePointId,
      this.prismaService.rulePoint,
      'rule point',
    );
    await checkDataById(rankingId, this.prismaService.ranking, 'ranking');

    return await this.prismaService.ranking.update({
      where: { id: rankingId },
      data: {
        rulePointId,
      },
      include: {
        rulePoint: true,
      },
    });
  }
}
