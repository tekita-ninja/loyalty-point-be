import { PrismaClient } from ".prisma/client/default";

const benefitData = [
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Point Multipliers',
        description: '1x'
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Birthday Bonus',
        description: '500 Points',
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Point Multipliers',
        description: '1.5x'
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Birthday Bonus',
        description: '1.000 Points',
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Monthly Promo',
        description: 'Exclusive'
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Point Multipliers',
        description: '2x'
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Birthday Bonus',
        description: '2.000 Points',
    },
    {
        urlPicture: '/example.com/image1.jpg',
        title: 'Free welcome drink',
        description: '3x per month'
    }
]

const prisma = new PrismaClient();

export async function createBenefits() {
    const existingBenefits = await prisma.benefit.findMany();
    if (existingBenefits.length > 0) return existingBenefits;

    const benefits = benefitData.map(benefit => ({
        urlPicture: benefit.urlPicture,
        title: benefit.title,
        description: benefit.description,
    }));

    return prisma.benefit.createMany({
        data: benefits,
    });
}