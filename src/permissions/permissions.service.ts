import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { Permission, Prisma } from '@prisma/client';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { methodMap } from './enum/request.enum';
import { checkDataById } from 'src/common/utils/checkDataById';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: dto,
    });
  }

  getAllRoutes() {
    const controllers = this.discoveryService.getControllers();
    const routes = [];

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      if (!instance) continue;

      const controllerPath =
        this.reflector.get(PATH_METADATA, instance.constructor) || '';

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (methodName) => {
          const methodRef = instance[methodName];
          if (!methodRef) return;

          const methodPath = this.reflector.get(PATH_METADATA, methodRef) || '';
          const requestMethod = this.reflector.get(METHOD_METADATA, methodRef);

          if (requestMethod !== undefined) {
            const methodString = methodMap[requestMethod] || 'UNKNOWN';

            const fullPath = `/${controllerPath}/${methodPath}`
              .replace(/\/+/g, '/')
              .replace(/\/$/, '');

            const cleanedPath = fullPath.replace(/^\/api/, '');

            const codeName = `${methodString}_${cleanedPath}`.replace(
              /_\/(.+)/,
              '_$1',
            );

            routes.push({
              method: methodString,
              path: fullPath,
              code: codeName,
              name: codeName,
            });
          }
        },
      );
    }

    return routes;
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
  async syncPermissions() {
    const routes = this.getAllRoutes();
    console.log(routes);
    if (!routes) throw new Error('no routes');
    for (const route of routes) {
      await this.prisma.permission.upsert({
        where: { code: route.code },
        update: {},
        create: route,
      });
    }

    const role = await this.prisma.role.findFirst({
      where: {
        code: 'SUPER',
      },
    });
    const permissions = await this.prisma.permission.findMany();

    const rolePermissions = permissions.map((permission) => {
      return {
        roleId: role.id,
        permissionId: permission.id,
      };
    });

    for (const rolePermission of rolePermissions) {
      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: rolePermission.roleId,
            permissionId: rolePermission.permissionId,
          },
        },
        update: {},
        create: rolePermission,
      });
    }

    return { message: 'success', count: routes.length };
  }

  async setRole(body: { permissionId: string; roleIds: string[] }) {
    await checkDataById<Permission>(body.permissionId, this.prisma.permission);

    const data = body.roleIds.map((item) => ({
      permissionId: body.permissionId,
      roleId: item,
    }));

    return await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { permissionId: body.permissionId },
      });
      const created = await tx.rolePermission.createMany({
        data,
        skipDuplicates: true,
      });

      return created;
    });
  }
}
