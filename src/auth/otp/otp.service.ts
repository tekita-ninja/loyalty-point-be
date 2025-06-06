import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OtpService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async getOtp(){
    
    }
}