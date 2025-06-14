import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddPointDto, CustomPointDto } from "./dto/point.dto";
import { checkDataById } from "src/common/utils/checkDataById";
import { EnumPointType } from "src/common/enum/Point";
import { EnumTransactionLog } from "src/common/enum/TransactionLog";
import { QueryParamDto } from "src/common/pagination/dto/pagination.dto";
import { createPaginator } from "prisma-pagination";
import { CustomerPoint, Prisma } from "@prisma/client";

@Injectable()

export class PointService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async addPoint(userId: string, data: AddPointDto) {

        await checkDataById(data.userId, this.prismaService.user, 'userId');

        return await this.prismaService.$transaction(async (tx) => {

            const oldPointsAgg = await this.prismaService.customerPoint.aggregate({
                _sum: { point: true },
                where:{ AND:
                    [
                        { userId: data.userId },
                        { isCancel: 0 }
                    ]
                }
            });

            const oldPoints = oldPointsAgg._sum.point ?? 0;

            const rulePoint = await this.prismaService.rulePoint.findUnique({
                where: { id: data.rulePointId },        
                select: { multiplier: true }
            });

            const calculatePoint = Math.ceil(data.price * Number(rulePoint.multiplier));
            
            const expiredDate = new Date();
            expiredDate.setMonth(expiredDate.getMonth() + 1);

            const customerPoint = await tx.customerPoint.create({
                data: {
                    userId: data.userId,
                    rulePointId: data.rulePointId,
                    note: data.note,
                    price: data.price,
                    point: calculatePoint,
                    expired: expiredDate, 
                    type: EnumPointType.ADD
                },
                select: {
                    id: true,
                    userId: true,
                    rulePointId: true,
                    note: true,
                    price: true,
                    point: true,
                    expired: true,
                    type: true,
                    createdAt: true,
                }
            })
            
            await tx.transactionLog.create({
                data: {
                    customerPointId: customerPoint.id,
                    oldPoints,
                    newPoints: oldPoints + calculatePoint,
                    pointDifference: calculatePoint,
                    action: EnumTransactionLog.ADD
                }
            })

            console.log('customerPoint', customerPoint);

            return customerPoint
        })
    }

    async customPoint(userId: string, data: CustomPointDto ) {
        await checkDataById(data.userId, this.prismaService.user, 'userId');

        return await this.prismaService.$transaction(async(tx) => {
            const oldPointsAgg = await this.prismaService.customerPoint.aggregate({
                _sum: { point: true },
                where:{ AND:
                    [
                        { userId: data.userId },
                        { isCancel: 0 }
                    ]
                }
            });

            const oldPoints = oldPointsAgg._sum.point ?? 0;

            const customerPoint = await tx.customerPoint.create({
                data: {
                    userId: data.userId,
                    note: data.note,
                    point: data.point,
                    expired: data.expDate,
                    type: EnumPointType.CUSTOM
                },
                select: {
                    id: true,
                    userId: true,
                    note: true,
                    point: true,
                    expired: true,
                    type: true,
                    createdAt: true,
                }
            });


            await tx.transactionLog.create({
                data: {
                    customerPointId: customerPoint.id,
                    oldPoints,
                    newPoints: oldPoints + data.point,
                    pointDifference: data.point,
                    action: EnumTransactionLog.CUSTOM
                }
            })

            return customerPoint;
            
        })        

    }

    async cancelPoint(customerPointId: string) {
      const getUserId = await this.prismaService.customerPoint.findUnique({
            where: { id: customerPointId },
            select: { userId: true }
        });

       return await this.prismaService.$transaction(async (tx) => {
            const oldPointsAgg = await tx.customerPoint.aggregate({
                _sum: { point: true },
                where: {
                    AND: [
                        { userId: getUserId.userId },
                        { isCancel: 0 }
                    ]
                }
            });

            const oldPoints = oldPointsAgg._sum.point ?? 0;

            const customerPoint = await tx.customerPoint.update({
                where: { id: customerPointId },
                data: {
                    isCancel: 1
                },
                select: {
                    id: true,
                    userId: true,
                    note: true,
                    point: true,
                    expired: true,
                    type: true,
                    isCancel: true,
                    createdAt: true,
                }
            });

            await tx.transactionLog.create({
                data: {
                    customerPointId: customerPoint.id,
                    oldPoints,
                    newPoints: oldPoints - customerPoint.point,
                    pointDifference: -customerPoint.point,
                    action: EnumTransactionLog.CANCEL
                }
            });

            return customerPoint
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

        const filter: any[] = [{ transaction: null }];

        if(query.isCancel) {
            filter.push({ isCancel: parseInt(query.isCancel) });
        }

        if (query.type) {
            filter.push({ type: parseInt(query.type) });
        }

        if(query.userId) {
            await checkDataById(query.userId, this.prismaService.user, 'userId');   
            filter.push({ userId: query.userId });
        }

        if(query.rulePointId) {
            await checkDataById(query.rulePointId, this.prismaService.rulePoint, 'rulePointId');    
            filter.push({ rulePointId: query.rulePointId });
        }

        if(query.createdBy)  {
            await checkDataById(query.createdBy, this.prismaService.user, 'createdBy');
            filter.push({ createdBy: query.createdBy });
        }

        return await paginate<CustomerPoint, Prisma.CustomerPointFindManyArgs>(
          this.prismaService.customerPoint,
          {
            where: {
              AND: [
                ...filter,
              ],
            },
            orderBy,
            
            select: {
                id: true,
                userId: true,
                rulePointId: true,
                note: true,
                price: true,
                point: true,
                expired: true,
                type: true,
                isCancel: true,
                createdAt: true,
                createdBy: true,
                rulePoint: {
                  select: {
                    id: true,
                    multiplier: true,
                  },
                },
            },
            
          },
        );
      }


}