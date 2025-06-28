import { Injectable, NotFoundException } from '@nestjs/common';
import { Permission, Prisma, Role } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, SetRoleMenuDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { checkDataById, checkDataByIds } from 'src/common/utils/checkDataById';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: dto,
    });
  }
  async findAll() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findMany(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };
    const result = await paginate<Role, Prisma.RoleFindManyArgs>(
      this.prisma.role,
      {
        where: {
          OR: query?.search
            ? [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        orderBy,
        include: {
          menus: {
            select: {
              menuId: true,
              menu: true,
            },
          },
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    );

    return result;
  }

  findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        menus: {
          select: {
            menuId: true,
            menu: true,
          },
        },
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, body: UpdateRoleDto) {
    await this.checkDataById(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async remove(id: string) {
    await this.checkDataById(id);
    return this.prisma.role.delete({
      where: {
        id,
      },
    });
  }

  async checkDataById(id: string) {
    const r = await this.prisma.role.findUnique({
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

  async setRole(dto: SetRoleMenuDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException('role not found!');
    }
    const data = dto.menuIds.map((item) => {
      return {
        menuId: item,
        roleId: role.id,
      };
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.roleMenu.deleteMany({
        where: {
          roleId: role.id,
        },
      });
      const created = await tx.roleMenu.createMany({
        data,
        skipDuplicates: true,
      });

      return created;
    });
  }

  async replaceRolePermission(body: {
    roleId: string;
    permissionIds: string[];
  }) {
    await checkDataById<Role>(body.roleId, this.prisma.role);

    await checkDataByIds<Permission>(
      body.permissionIds,
      this.prisma.permission,
    );

    const data = body.permissionIds.map((item) => ({
      roleId: body.roleId,
      permissionId: item,
    }));

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId: body.roleId,
        },
      });

      let result = { count: 0 };

      if (data.length > 0) {
        result = await tx.rolePermission.createMany({
          data,
          skipDuplicates: true,
        });
      }

      return result;
    });
  }
}
