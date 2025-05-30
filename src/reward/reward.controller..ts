import { Body, Controller, Post } from "@nestjs/common";
import { RewardService } from "./reward.service";
import { CreateRewardDto } from "./dto/reward.dto";

@Controller('api/reward')
export class RewardController {
    constructor(
        private rewardService: RewardService
    ){}

    @Post()
    create(
        @Body() body: CreateRewardDto
    ){
        return this.rewardService.create(body);
    }
}