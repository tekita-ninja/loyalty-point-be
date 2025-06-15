import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { EnumPointType } from "src/common/enum/Point";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfirmTransactionCustomerDto } from "./dto/transaction-customer.dto";
import { comparePassword } from "src/common/password";

@Injectable()
export class TransactionCustomerService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async getCustomerTransactions(customerId: string) {
        return await this.prismaService.transaction.findMany({
            where: {
                userId: customerId,
            },
            include: {
                user: true,
                reward: true,
                location: true,
            },
        });
    }

    async confirmTransaction(userId: string, data: ConfirmTransactionCustomerDto) {

        const user = await this.prismaService.user.findUnique({
           where: { id: userId },
        });

        if (!user || !(await comparePassword(data.password, user.password))) {
            throw new BadRequestException('Invalid PIN');
        }

        const transaction = await this.prismaService.transaction.findUnique({
            where: {
                id: data.transactionId,
                userId: userId,
            },
        });


        if (!transaction) {
            throw new BadRequestException('Transaction not found or does not belong to user');
        }

        if(transaction.expired < new Date()) {
            throw new BadRequestException('Transaction has expired');
        }

        const customerPoint = await this.prismaService.customerPoint.findUnique({
            where: {
                userId: userId,
                transactionId: transaction.id
            },
        });

        console.log('customer', customerPoint);

        if(customerPoint) {
            throw new BadRequestException('Customer point already exists for this transaction');
        }

        return this.prismaService.$transaction(async (tx) => {
            await tx.transaction.update({
                where: {
                    id: data.transactionId,
                },
                data: {
                    status: 1,
                },
            });

            const newCustomerPoint = await tx.customerPoint.create({
                data: {
                    userId: userId,
                    transactionId: transaction.id,
                    point: transaction.cutPoint,
                    note: `${transaction.note}`,
                    createdBy: transaction.userId, 
                    type: EnumPointType.TRANSACTION
                }  as Prisma.CustomerPointUncheckedCreateInput,
                include: {
                    transaction: true,
                }
            })


            return newCustomerPoint;
        })

        
    }
    
}