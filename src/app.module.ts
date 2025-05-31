import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './menus/menus.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolePermissionsModule } from './role_permissions/role_permissions.module';
import { RolesModule } from './roles/roles.module';
import { SidemenuModule } from './sidemenu/sidemenu.module';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { LocationModule } from './location/location.module';
import { RewardModule } from './reward/reward.module';
import { FileModule } from './common/files/files.module';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleTasksModule } from './common/schedule/schedule.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    MenusModule,
    SidemenuModule,
    CategoryModule,
    LocationModule,
    RewardModule,
    CommonModule,
    ScheduleModule.forRoot(),
    ScheduleTasksModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
