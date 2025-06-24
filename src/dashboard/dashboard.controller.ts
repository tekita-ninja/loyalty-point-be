import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('get-overview')
  async getOverview() {
    return await this.dashboardService.getOverview();
  }

  @Get('get-notification')
  async getNotification() {
    return await this.dashboardService.getNotification();
  }
}
