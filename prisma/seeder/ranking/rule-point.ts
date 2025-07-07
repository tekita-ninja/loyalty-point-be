import { PrismaClient } from "@prisma/client";

const rulePointData = [
    {
        name: 'Silver Rule',
        multiplier: 1.0,
        isActive: 1,
        startDate: null,
        endDate: null,
    },
    {
        name: 'Gold Rule',
        multiplier: 1.5,
        isActive: 1,
        startDate: null,
        endDate: null,
    },
    {
        name: 'Platinum Rule',
        multiplier: 2.0,
        isActive: 1,
        startDate: null,
        endDate: null,
    },
    {
        name: 'E8 Birthday Rule',
        multiplier: 1.5,
        isActive: 1,
        startDate: new Date('2025-07-01T00:00:00Z'),
        endDate: new Date('2025-09-01T00:00:00Z'),
    }
]

const prisma = new PrismaClient();

export async function createRulePoints() {
    const existingRules = await prisma.rulePoint.findMany();
    if (existingRules.length > 0) return existingRules;

    return prisma.rulePoint.createMany({
        data: rulePointData
    });
}