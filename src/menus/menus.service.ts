import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Menu, Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        ...dto,
        roles: dto?.roleIds?.length
          ? {
              create: dto?.roleIds.map((roleId) => ({
                role: { connect: { id: roleId } },
              })),
            }
          : undefined,
      },
      include: {
        roles: { include: { role: true } },
        parent: true,
      },
    });
  }

  async findAll(query?: { withTree?: number }) {
    if (query.withTree == 1) {
      const menus = await this.prisma.menu.findMany({
        select: {
          id: true,
          title: true,
          order: true,
          icon: true,
          isGroup: true,
          path: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              title: true,
              isGroup: true,
              icon: true,
              path: true,
            },
          },
        },
      });
      return this.buildMenuTree(menus);
    } else {
      return this.prisma.menu.findMany({
        select: {
          id: true,
          title: true,
          order: true,
          icon: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              title: true,
              isGroup: true,
              icon: true,
              path: true,
            },
          },
          isGroup: true,
        },
      });
    }
  }

  async findMany(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'createdAt';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };
    const result = await paginate<Menu, Prisma.MenuFindManyArgs>(
      this.prisma.menu,
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
          icon: true,
          isGroup: true,
          order: true,
          path: true,
          parent: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    );

    return result;
  }

  findOne(id: string) {
    return this.prisma.menu.findFirst({
      where: { id: id },
      include: {
        roles: {
          select: {
            roleId: true,
            role: true,
          },
        },
        children: true,
      },
    });
  }

  update(id: string, dto: UpdateMenuDto) {
    return this.prisma.menu.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.menu.delete({
      where: {
        id,
      },
    });
  }
  async replaceRoleMenu(body: { menuId: string; roleIds: string[] }) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: body.menuId },
    });
    if (!menu) {
      throw new BadRequestException(`menuId ${body.menuId} undefined!`);
    }
    const data = body.roleIds.map((item) => {
      return {
        menuId: menu.id,
        roleId: item,
      };
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.roleMenu.deleteMany({
        where: {
          menuId: menu.id,
        },
      });
      const created = await tx.roleMenu.createMany({
        data,
        skipDuplicates: true,
      });

      return created;
    });
  }
  buildMenuTree(data) {
    const map = new Map();
    const roots: any[] = [];

    for (const item of data) {
      map.set(item.id, { ...item, children: [] });
    }

    for (const item of data) {
      const node = map.get(item.id);
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }
    // Step 3: Fungsi rekursif untuk sort children
    function sortTree(nodes) {
      nodes.sort((a, b) => a.order - b.order);
      for (const node of nodes) {
        if (node.children?.length) {
          sortTree(node.children);
        }
      }
    }

    // Step 4: Sort tree dari level paling atas
    sortTree(roots);

    return roots;
  }

  findRoleMenu(id: string) {
    return this.prisma.roleMenu.findMany({
      where: {
        roleId: id,
      },
      select: {
        menuId: true,
        roleId: true,
        menu: {
          select: {
            id: true,
            title: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }
}
