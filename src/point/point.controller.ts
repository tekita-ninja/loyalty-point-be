import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AddPointDto, CustomPointDto } from "./dto/point.dto";
import { AuthGuard } from "@nestjs/passport";
import { PermissionGuard } from "src/auth/auth.guard";
import { PointService } from "./point.service";
import { QueryParamDto } from "src/common/pagination/dto/pagination.dto";

@Controller('api/point')
export class PointController {
    constructor(
        private readonly pointService: PointService
    ) {}

    @Post('add')
    @UseGuards(AuthGuard('jwt'), PermissionGuard)
    async addPoint(
        @Request() req: any,
        @Body() body: AddPointDto
    ) {
        return await this.pointService.addPoint(req.user.jwtUserId, body);
    }

    @Post('custom')
    @UseGuards(AuthGuard('jwt'), PermissionGuard)
    async customPoint(
        @Request() req: any,
        @Body() body: CustomPointDto
    ) {
        return await this.pointService.customPoint(req.user.jwtUserId, body);
    }

    @Post('cancel/:customerPointId')
    @UseGuards(AuthGuard('jwt'), PermissionGuard)
    async cancelPoint(
        @Param('customerPointId') customerPointId: string
    ) {
        return await this.pointService.cancelPoint(customerPointId);
    }

    @Get()
    async search(
        @Query() query: QueryParamDto
    ) {
        return await this.pointService.search(query);
    }

}