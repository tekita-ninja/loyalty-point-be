import { Injectable } from "@nestjs/common";
import { checkDataById } from "src/common/utils/checkDataById";
import { CreateRewardDto } from "./dto/reward.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Category, Location } from "@prisma/client";

@Injectable()
export class RewardService {
    constructor(private prismaService: PrismaService){}

    async findAll() {
        return this.prismaService.reward.findMany({
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
                location: {
                   select: {
                        location: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                   }
                }
            }
        });
    }

    async create(data: CreateRewardDto) {
        await checkDataById<Category>(data.categoryId, this.prismaService.category, 'category')
        // await checkDataById<Location>(data.locationId, this.prismaService.location, 'location')

        return this.prismaService.reward.create({
            data: {
                name: data.name,
                urlPicture: data.urlPicture,
                price: data.price,
                category: {
                    connect: { 
                        id: data.categoryId
                     }
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
                        name: true
                    }
                },
            }
        })
    }
}