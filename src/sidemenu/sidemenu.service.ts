import { Injectable } from '@nestjs/common';
import { Menu } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SidemenuService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
      },
      select: {
        role: { select: { name: true } },
      },
    });

    const roleNames = userRoles.map((item) => item.role.name);
    const roleMenus = await this.prisma.roleMenu.findMany({
      where: {
        role: { name: { in: roleNames } },
      },
      include: {
        menu: {
          include: {
            parent: true,
            children: true,
          },
        },
      },
    });
    // Ambil semua menu dan hilangkan duplikat berdasarkan menu.id
    const uniqueMenusMap = new Map<string, Menu>();
    for (const rm of roleMenus) {
      const menu = rm.menu;
      if (!uniqueMenusMap.has(menu.id)) {
        uniqueMenusMap.set(menu.id, menu);
      }
    }

    const uniqueMenus = Array.from(uniqueMenusMap.values());
    // console.log(uniqueMenus);
    // Bangun struktur pohon
    const buildTree = (
      menus: Menu[],
      parentId: string | null = null,
    ): any[] => {
      return menus
        .filter((m) => m.parentId === parentId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((m) => ({
          id: m.id,
          title: m.title,
          path: m.path,
          icon: m.icon,
          isGroup: m.isGroup,
          order: m.order,
          children: buildTree(menus, m.id),
        }));
    };

    return buildTree(uniqueMenus);
  }
}
