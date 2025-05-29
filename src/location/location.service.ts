import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateLocationDto, UpdateLocationDto } from "./dto/location.dto";
import { checkDataById } from "src/common/utils/checkDataById";
import { Location, Prisma } from "@prisma/client";
import { QueryParamDto } from "src/common/pagination/dto/pagination.dto";
import { createPaginator } from "prisma-pagination";

@Injectable()
export class LocationService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async findAll() {
        return this.prismaService.location.findMany({
            select: {
                id: true,
                name: true,
                address:  true,
                latitude: true,
                longitude: true,
            }
        });
    }

    async create(data: CreateLocationDto) {
        return this.prismaService.location.create({ 
            data,
            select: {
                id: true,
                name: true,
                address:  true,
                latitude: true,
                longitude: true,
            }
            
        });
    }

    async findOne(id: string) {
        await checkDataById<Location>(id, this.prismaService.location)
        return this.prismaService.location.findUnique({
            where: { id }, 
            select: {
                id: true,
                name: true,
                address:  true,
                latitude: true,
                longitude: true,
            }
        })

    }

    async update(id: string, data: UpdateLocationDto) {
        await checkDataById<Location>(id, this.prismaService.location)
        return this.prismaService.location.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                address:  true,
                latitude: true,
                longitude: true,
            }
        })
    }

    async delete(id: string) {
        await checkDataById<Location>(id, this.prismaService.location)
        return this.prismaService.location.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                address:  true,
                latitude: true,
                longitude: true,
            }
        })
    }

    async search(query: QueryParamDto) {
        const paginate = createPaginator({
            page: query.page,
            perPage: query.perPage
        })
        const orderField = query.sortBy || 'id'
        const orderType = query.sortType || 'desc'
        const orderBy = { [orderField]: orderType }

        return await paginate<Location, Prisma.LocationFindManyArgs>(
            this.prismaService.location,
            {
                where: {
                    OR: query?.search
                    ? [
                        { name: { contains: query.search, mode: 'insensitive'} }
                    ] 
                    : undefined,
                }, 
                orderBy,
                select: {
                    id: true,
                    name: true,
                    address:  true,
                    latitude: true,
                    longitude: true,
                }
            }
        )

    }

}