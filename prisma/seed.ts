// import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
// import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { permissionData } from '../data/permissions';
const prisma = new PrismaClient();
async function createRole() {
  const existing = await prisma.role.findFirst({ where: { code: 'SUPER' } });
  if (existing) return existing;
  return await prisma.role.create({
    data: {
      name: 'SUPER',
      code: 'SUPER',
    },
  });
}
async function createUser() {
  const existing = await prisma.user.findUnique({ where: { email: 'super@gmail.com' } });
  if (existing) return existing;

  return await prisma.user.create({
    data: {
      firstname: 'Super',
      lastname: 'User',
      email: 'super@gmail.com',
      password: await bcrypt.hash('super@123', 10),
      phone: "1111111111",
      gender: "MALE",
      birthDate: new Date("1990-01-01"),
    },
  });
}
async function createUserRole(userId: string, roleId: string) {
  const existing = await prisma.userRole.findFirst({ where: { userId, roleId } });
  if (existing) return existing;

  return prisma.userRole.create({
    data: {
      roleId: roleId,
      userId: userId,
    },
  });
}
async function createPermissions() {
  const count = await prisma.permission.count();
  if (count > 0) return;

  return prisma.permission.createMany({
    data: permissionData,
  });
}
async function getPermissions() {
  return prisma.permission.findMany();
}
async function createRoleHeaderMenu() {
  const existing = await prisma.menu.findFirst({ where: { title: 'Super', isGroup: true } });
  if (existing) return existing;

  return prisma.menu.create({
    data: {
      title: 'Super',
      isGroup: true,
    },
  });
}

async function createMenuRole(headerMenu: string) {
  const existing = await prisma.menu.findFirst({
    where: { title: 'Roles', parentId: headerMenu },
  });
  if (existing) return existing;

  return prisma.menu.create({
    data: {
      title: 'Roles',
      isGroup: false,
      icon: 'hugeicons:access',
      path: 'roles',
      parentId: headerMenu,
    },
  });
}
async function createChildRoles(parentId: string) {
  const existing = await prisma.menu.findMany({ where: { parentId } });
  if (existing.length > 0) return existing;

  return prisma.menu.createMany({
    data: [
      {
        title: 'Roles',
        isGroup: false,
        path: '/roles',
        order: 0,
        parentId: parentId,
      },
      {
        title: 'Permissions',
        isGroup: false,
        path: '/roles/permissions',
        order: 1,
        parentId: parentId,
      },
      {
        title: 'Users',
        isGroup: false,
        path: '/roles/users',
        order: 2,
        parentId: parentId,
      },
    ],
  });
}


async function getChildRoles() {
  return prisma.menu.findMany();
}

// TRX
// CREATE RolePermissions
async function createRolePermissions(
  data: { roleId: string; permissionId: string }[],
) {
  const existing = await prisma.rolePermission.findMany({
    where: { roleId: data[0].roleId },
  });

  if (existing.length > 0) return existing;

  return prisma.rolePermission.createMany({
    data,
    skipDuplicates: true,
  });
}
// CREATE RoleMenus
async function createRoleMenu(data: { roleId: string; menuId: string }[]) {
  // console.log(data);

  const existing = await prisma.roleMenu.findMany({
    where: { roleId: data[0].roleId },
  });

  if (existing.length > 0) return existing;

  return prisma.roleMenu.createMany({
    data,
    skipDuplicates: true,
  });
}
async function createMenuMenuManagement(roleId: string, parentId: string) {
  const existing = await prisma.menu.findFirst({
    where: {
      title: 'Menu Management',
      parentId,
    },
  });
  if (existing) return existing;

  await prisma.menu.create({
    data: {
      title: 'Menu Management',
      icon: 'icon-park-outline:tree-list',
      parentId: parentId,
      isGroup: false,
      path: '/menus',
      roles: {
        create: [{ role: { connect: { id: roleId } } }],
      },
    },
  });
}
async function main() {
  const role = await createRole();
  const user = await createUser();
  const userRole = await createUserRole(user.id, role.id);
  await createPermissions();
  const permissions = await getPermissions();
  const headerMenu = await createRoleHeaderMenu();
  const parentMenu = await createMenuRole(headerMenu.id);
  await createChildRoles(parentMenu.id);
  const menus = await getChildRoles();
  const rolePermissionIds = permissions.map((item) => {
    return {
      roleId: role.id,
      permissionId: item.id,
    };
  });
  const rolePermissions = await createRolePermissions(rolePermissionIds);

  const menuIds = menus.map((i) => i.id);
  const allMenuIds = [...menuIds, headerMenu.id, parentMenu.id];
  const roleMenuIds = allMenuIds.map((i) => {
    return {
      roleId: role.id,
      menuId: i,
    };
  });
  const roleMenus = await createRoleMenu(roleMenuIds);
  await createMenuMenuManagement(role.id, headerMenu.id);
  console.log({
    role,
    user,
    userRole,
    permissions,
    headerMenu,
    parentMenu,
    menus,
    rolePermissions,
    roleMenus,
  });
  console.log('✅ Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
