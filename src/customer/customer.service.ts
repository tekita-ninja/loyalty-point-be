import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { checkDataById } from 'src/common/utils/checkDataById';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerUpdateProfileDto } from './dto/customer.dto';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';
import { PointService } from 'src/point/point.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pointService: PointService, // Assuming you have a PointService for handling points
  ) {}

  async findAll() {
    return await this.prismaService.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'CUSTOMER',
              code: 'CUST',
            },
          },
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        ranking: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            minSpendings: true,
            rulePoint: {
              select: {
                id: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        }
      },
    });
  }

  async findOne(id: string) {
    await this.pointService.isExpiredPoints(id); // Check and update expired points
    const result = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        ranking: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            minSpendings: true,
            rulePoint: {
              select: {
                id: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        customerPoints: {
          where: {
            AND: [{ isCancel: 0 }, { isExpired: 0 }],
          },
          select: {
            id: true,
            transactionId: true,
            rulePointId: true,
            point: true,
            price: true,
            type: true,
            isCancel: true,
            isExpired: true,
            rulePoint: {
              select: {
                id: true,
                isActive: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            transaction: {
              select: {
                id: true,
                note: true,
                status: true,
                cutPoint: true,
                reward: {
                  select: {
                    name: true,
                    price: true,
                    urlPicture: true,
                  },
                },
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
        },
      },
    });

    const totalPoint =
      result.customerPoints?.reduce((sum, cp) => sum + cp.point, 0) || 0;

    return {
      ...result,
      totalPoint,
    };
  }

  async search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });

    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };

    const filter: any[] = [
      {
        roles: {
          some: {
            role: {
              name: 'CUSTOMER',
              code: 'CUST',
            },
          },
        },
      },
    ];

    if (query.rankingId) {
      filter.push({ rankingId: query.rankingId });
    }

    if (query.search) {
      filter.push({
        OR: [
          { firstname: { contains: query.search, mode: 'insensitive' } },
          { lastname: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    const result = await paginate<User, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      {
        where: {
          AND: [...filter],
        },
        orderBy,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          ranking: {
            select: {
              id: true,
              name: true,
              minPoints: true,
              minSpendings: true,
              rulePoint: {
                select: {
                  id: true,
                  multiplier: true,
                  name: true,
                  startDate: true,
                  endDate: true,
                },
              },
              promotions: {
              where: {
                promotion: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                  isPush: 1,
                },
              },
              select: {
                promotion: {
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
                },
              },
            },
            },
          },
          customerPoints: {
            where: {
              AND: [{ isCancel: 0 }, { isExpired: 0 }],
            },
            select: {
              point: true,
            },
          },
        },
      },
    );

    const withTotalPoint = result.data.map((user: any) => {
      const totalPoint = user?.customerPoints.reduce(
        (sum, cp) => sum + cp.point,
        0,
      );
      return { ...user, totalPoint };
    });

    return {
      ...result,
      data: withTotalPoint,
    };
  }

  async findProfile(customerId: string) {
    await this.pointService.isExpiredPoints(customerId); // Check and update expired points

    await checkDataById(customerId, this.prismaService.user, 'customerId');
    const result = await this.prismaService.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
        ranking: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            minSpendings: true,
            rulePoint: {
              select: {
                id: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            promotions: {
              where: {
                promotion: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                  isPush: 1,
                },
              },
              select: {
                promotion: {
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
                },
              },
            },
          },
        },
        customerPoints: {
          where: {
            AND: [{ isCancel: 0 }, { isExpired: 0 }],
          },
          select: {
            id: true,
            transactionId: true,
            rulePointId: true,
            point: true,
            price: true,
            type: true,
            isCancel: true,
            isExpired: true,
          },
        },
      },
    });

    const resultWithTotalPoint = {
      ...result,
      totalPoint:
        result.customerPoints?.reduce((sum, cp) => sum + cp.point, 0) || 0,
    };

    const transformedResult = {
      ...resultWithTotalPoint,
      ranking: resultWithTotalPoint.ranking
        ? {
            ...resultWithTotalPoint.ranking,
            promotions: resultWithTotalPoint.ranking.promotions.map((promo) =>
              transformUrlPicture(promo.promotion),
            ),
          }
        : null,
    };

    return transformedResult;
  }

  async updateProfile(customerId: string, data: CustomerUpdateProfileDto) {
    await this.pointService.isExpiredPoints(customerId); // Check and update expired points
    await checkDataById(customerId, this.prismaService.user, 'customerId');

    const result = await this.prismaService.user.update({
      where: {
        id: customerId,
      },
      data,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
        ranking: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            minSpendings: true,
            rulePoint: {
              select: {
                id: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            promotions: {
              where: {
                promotion: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                  isPush: 1,
                },
              },
              select: {
                promotion: {
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
                },
              },
            },
          },
        },
        customerPoints: {
          where: {
            AND: [{ isCancel: 0 }, { isExpired: 0 }],
          },
          select: {
            id: true,
            transactionId: true,
            rulePointId: true,
            point: true,
            price: true,
            type: true,
            isCancel: true,
            isExpired: true,
          },
        },
      },
    });
    const resultWithTotalPoint = {
      ...result,
      totalPoint:
        result.customerPoints?.reduce((sum, cp) => sum + cp.point, 0) || 0,
    };

    const transformedResult = {
      ...resultWithTotalPoint,
      ranking: resultWithTotalPoint.ranking
        ? {
            ...resultWithTotalPoint.ranking,
            promotions: resultWithTotalPoint.ranking.promotions.map((promo) =>
              transformUrlPicture(promo.promotion),
            ),
          }
        : null,
    };

    return transformedResult;
  }
}
