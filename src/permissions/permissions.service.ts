import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { Permission, Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: dto,
    });
  }
  async findMany(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'path';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };
    const result = await paginate<Permission, Prisma.PermissionFindManyArgs>(
      this.prisma.permission,
      {
        where: {
          OR: query?.search
            ? [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
                { method: { contains: query.search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        orderBy,
        select: {
          id: true,
          name: true,
          code: true,
          path: true,
          method: true,
        },
      },
    );

    return result;
  }

  findAll() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        path: true,
        method: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async update(id: string, body: UpdatePermissionDto) {
    await this.checkDataById(id);
    return this.prisma.permission.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        path: body.code,
      },
      select: {
        id: true,
      },
    });
  }

  async remove(id: string) {
    await this.checkDataById(id);
    return this.prisma.permission.delete({
      where: {
        id,
      },
    });
  }

  async checkDataById(id: string) {
    const r = await this.prisma.permission.findUnique({
      where: {
        id: id,
      },
      select: { id: true },
    });
    if (!r) {
      throw new NotFoundException();
    }
    return r;
  }
  async syncPermissions(routes: CreatePermissionDto[]) {
    for (const route of routes) {
      await this.prisma.permission.upsert({
        where: { code: route.code },
        update: {},
        create: route,
      });
    }
    return { message: 'success', count: routes.length };
  }
}
