import { PrismaClient } from "@prisma/client";

export const dataMenus = [
    {
        name: 'DASHBOARD',
        path: '/dashboard',
        order: 0,
        isGroup: true,
        icon: null,
        childrens: [
            {
                title: 'Dashboard',
                icon: 'material-symbols:dashboard',
                path: '/',
                order: 0,
                isGroup: false,
            }
        ]
    },
    {
        name: 'SUPER',
        path: '/super',
        order: 1,
        icon: null,
        isGroup: true,
        childrens: [
            {
                title: 'Menu Management',
                icon: 'icon-park-outline:tree-list',
                order: 0,
                path: '/menus'
            },
            {
                title: 'Roles',
                icon: 'hugeicons:access',
                path: '/roles',
                order: 1,
                isGroup: true,
                childrens: [
                    {
                        title: 'Roles',
                        path: '/roles',
                        order: 0,
                        icon: null,

                        isGroup: false
                    },
                    {
                        title: 'Permissions',
                        path: '/roles/permissions',
                        order: 1,
                        icon: null,

                        isGroup: false
                    },
                    {
                        title: 'Users',
                        path: '/roles/users',
                        icon: null,

                        order: 2,
                        isGroup: false
                    }
                ]
            }
        ]
    },
    {
        name: 'MASTER',
        path: '/master',
        order: 2,
        icon: null,

        isGroup: true,
        childrens: [
            {
                title: 'Master Ranking',
                icon: 'eos-icons:master',
                order: 0,
                path: '/master/ranking',
                isGroup: true,
                childrens: [
                    {
                        name: 'Benefits',
                        path: '/master/ranking/benefits',
                        order: 0,
                        icon: null,
                        isGroup: false
                    },
                    {
                        name: 'Promotions',
                        path: '/master/ranking/promotions',
                        icon: null,
                        order: 1,
                        isGroup: false
                    },
                    {
                        name: 'Rule Point',
                        path: '/master/ranking/rule-point',
                        icon: null,
                        order: 2,
                        isGroup: false
                    },
                    {
                        name: 'Rankings',
                        path: '/master/ranking/rankings',
                        icon: null,
                        order: 2,
                        isGroup: false
                    },
                ]
            },
            {
                title: 'Master Reward',
                icon: 'fluent:reward-12-filled',
                order: 1,
                path: '/master/reward',
                isGroup: true,
                childrens: [
                    {
                        name: 'Category',
                        path: '/master/reward/category',
                        icon: null,
                        order: 0,
                        isGroup: false
                    },
                    {
                        name: 'Location',
                        path: '/master/reward/location',
                        icon: null,
                        order: 1,
                        isGroup: false
                    },
                    {
                        name: 'Reward',
                        path: '/master/reward/rewards',
                        icon: null,
                        order: 2,
                        isGroup: false
                    },

                ]
            },

        ]
    },
    {
        title: 'CUSTOMER',
        path: '/customer',
        icon: null,
        order: 3,
        isGroup: true,
        childrens: [
            {
                title: 'Customer',
                icon: 'ix:customer-filled',
                path: '/customer',
                order: 0,
                isGroup: false
            },
            {
                title: 'Points',
                icon: 'mingcute:copper-coin-fill',
                path: '/customer/points',
                order: 1,
                isGroup: false
            },
        ]
    },
    {
        title: 'TRANSACTION',
        path: '/transaction',
        order: 4,
        icon: null,
        isGroup: true,
        childrens: [
            {
                title: 'Transaction',
                icon: 'tdesign:undertake-transaction-filled',
                path: '/transaction',
                order: 0,
                isGroup: false
            },
        ]
    },
    {
        title: 'LOG',
        path: '/log',
        icon: null,
        order: 5,
        isGroup: true,
        childrens: [
            {
                title: 'Log',
                icon: 'octicon:log-16',
                path: '/log',
                order: 0,
                isGroup: false
            },
        ]
    }
]

const prisma = new PrismaClient();


export async function insertMenuWithChildren(menus: any[], parentId?: string) {
  for (const menu of menus) {
    const created = await prisma.menu.create({
      data: {
        title: menu.title || menu.name,
        icon: menu?.icon || null,
        path: menu.path,
        order: menu.order ?? 0,
        isGroup: menu.isGroup ?? false,
        parentId,
      },
    });

    if (menu.childrens?.length) {
      await insertMenuWithChildren(menu.childrens, created.id);
    }
  }
}

export async function createRoleMenus() {
    const superRole = await prisma.role.findFirst({
        where: {
            code: 'SUPER'
        }
    });

    if (!superRole) {
        console.warn("SUPER role not found, skipping menu creation.");
        return;
    }

    const existingMenus = await prisma.menu.findMany();


    const roleMenusId = existingMenus.map(menu => ({
        roleId: superRole.id,
        menuId: menu.id
    }));

    await prisma.roleMenu.createMany({
        data: roleMenusId,
        skipDuplicates: true
    });

    console.log("Role menus created successfully");

}

