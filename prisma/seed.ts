// import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
// import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { permissionData } from '../data/permissions';
import { createBenefits } from './seeder/ranking/benefit';
import { createPromotions } from './seeder/ranking/promotions';
import { createRulePoints } from './seeder/ranking/rule-point';
import { createRankings } from './seeder/ranking/ranking';
import { createRewards } from './seeder/reward/reward';
import { createLocations } from './seeder/reward/location';
import { createRoleMenus, dataMenus, insertMenuWithChildren } from './seeder/menu-seed';
import { createCustomers } from './seeder/customer/customer';
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

async function createAuthenticationAuthorization() {
  const role = await createRole();
  const user = await createUser();
  const userRole = await createUserRole(user.id, role.id);
  await createPermissions();
  const permissions = await getPermissions();
  const rolePermissionIds = permissions.map((item) => {
    return {
      roleId: role.id,
      permissionId: item.id,
    };
  });
  const rolePermissions = await createRolePermissions(rolePermissionIds);

  console.log({
    role,
    user,
    userRole,
    permissions,

    rolePermissions,
  });
}

async function main() {
  await createAuthenticationAuthorization();

  await insertMenuWithChildren(dataMenus, null);

  await createRoleMenus();

  await createBenefits();

  await createPromotions();

  await createRulePoints();

  await createRankings();

  await createCustomers();

  await createRewards();

  await createLocations();




  console.log('✅ Seeding complete.');
  
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
