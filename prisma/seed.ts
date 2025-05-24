// import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
// import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { permissionData } from '../data/permissions';
const prisma = new PrismaClient();
async function createRole() {
  return await prisma.role.create({
    data: {
      name: 'SUPER',
      code: 'SUPER',
    },
  });
}
async function createUser() {
  return await prisma.user.create({
    data: {
      email: 'super@gmail.com',
      fullname: 'Super User',
      password: await bcrypt.hash('super@123', 10),
    },
  });
}
async function createUserRole(userId: string, roleId: string) {
  return prisma.userRole.create({
    data: {
      roleId: roleId,
      userId: userId,
    },
  });
}
async function createPermissions() {
  return prisma.permission.createMany({
    data: permissionData,
  });
}
async function getPermissions() {
  return prisma.permission.findMany();
}
async function createRoleHeaderMenu() {
  return prisma.menu.create({
    data: {
      title: 'Super',
      isGroup: true,
    },
  });
}

async function createMenuRole(headerMenu: string) {
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
  return prisma.rolePermission.createMany({
    data,
  });
}
// CREATE RoleMenus
async function createRoleMenu(data: { roleId: string; menuId: string }[]) {
  // console.log(data);
  return prisma.roleMenu.createMany({
    data,
    skipDuplicates: true,
  });
}
async function createMenuMenuManagement(roleId: string, parentId: string) {
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
