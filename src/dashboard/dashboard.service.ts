import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";


@Injectable()
export class DashboardService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async getOverview() {

        const amountUser  = await this.prismaService.user.count({
            where: {
                status: true,
                roles: {
                    some: {
                        role: {
                            name: 'Customer'
                        }
                    }
                }
            }
        })

        const topRewardsRaw = await this.prismaService.like.groupBy({
            by: ['rewardId'],
            where: {
                unlikedAt : null
            }, 
            _count: {
                rewardId: true,
            },
            orderBy: {
                _count: {
                    rewardId: 'desc'
                }
            },
            take: 5
        })

        const topRewardId = topRewardsRaw.map(item => item.rewardId)

        const topRewards = await this.prismaService.reward.findMany({
            where: {
                id: {
                    in: topRewardId
                }
            },
            select: {
                id: true,
                name: true,
                urlPicture: true,
                price: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
            }
        })

        const topRewardsWithLikeTotal = topRewards.map(item => {
            const likeCount = topRewardsRaw.find(like => like.rewardId === item.id)?._count.rewardId || 0;
            return {
                ...item,
                totalLikes: likeCount
            }
        })

        return {
            amountUser,
            topRewards: topRewardsWithLikeTotal,
        }

    }

    async getNotification() {
        const amountLowStockRewards = await this.prismaService.reward.count({
            where: {
                stocks: {
                    lte: 10
                },
            }
        });

        return {
           amountLowStockRewards: amountLowStockRewards
        }

    }
}