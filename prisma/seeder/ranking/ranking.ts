import { PrismaClient } from "@prisma/client";

const Rankings = [
    {
        name: 'Silver',
        minPoints: 0,
        minSpendings: 0,
        rulePointName: 'Silver Rule',
        benefits: [
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
        ],
        promotions: [
            {
                urlPicture: '/example.com/image1.jpg',
                title: 'The Grand Opening',
                subtitle: 'Experience joy with friends',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in faucibus augue. Proin rutrum sem id tortor sagittis, eget placerat neque imperdiet. Nulla ultricies euismod ultrices. Vivamus et orci in massa semper condimentum ut a odio. Maecenas mattis mi ac quam vulputate, at congue libero interdum. Donec accumsan commodo cursus. Nulla convallis ut justo et mollis. Curabitur rhoncus mauris sit amet lacus condimentum ultrices. Nulla at tellus venenatis, blandit lacus vitae, commodo purus. Suspendisse condimentum odio ac orci hendrerit, a faucibus sem aliquet.',
                startDate: new Date('2024-07-08T00:00:00Z'),
                endDate: new Date('2026-10-01T00:00:00Z'),
                isPush: 0
            },
        ]
    },
    {
        name: 'Gold',
        minPoints: 0,
        minSpendings: 200001,
        benefits: [
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

        ],
        promotions: [
            {
                urlPicture: '/example.com/image1.jpg',
                title: 'The Grand Opening',
                subtitle: 'Experience joy with friends',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in faucibus augue. Proin rutrum sem id tortor sagittis, eget placerat neque imperdiet. Nulla ultricies euismod ultrices. Vivamus et orci in massa semper condimentum ut a odio. Maecenas mattis mi ac quam vulputate, at congue libero interdum. Donec accumsan commodo cursus. Nulla convallis ut justo et mollis. Curabitur rhoncus mauris sit amet lacus condimentum ultrices. Nulla at tellus venenatis, blandit lacus vitae, commodo purus. Suspendisse condimentum odio ac orci hendrerit, a faucibus sem aliquet.',
                startDate: new Date('2024-07-08T00:00:00Z'),
                endDate: new Date('2026-10-01T00:00:00Z'),
                isPush: 0
            },
            {
                urlPicture: '/example.com/image2.jpg',
                title: 'Valentine Time Spend',
                subtitle: 'Promo up to 50% off',
                startDate: new Date('2024-02-01T00:00:00Z'),
                endDate: new Date('2026-02-15T00:00:00Z'),
                isPush: 1,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in faucibus augue. Proin rutrum sem id tortor sagittis, eget placerat neque imperdiet. Nulla ultricies euismod ultrices. Vivamus et orci in massa semper condimentum ut a odio. Maecenas mattis mi ac quam vulputate, at congue libero interdum. Donec accumsan commodo cursus. Nulla convallis ut justo et mollis. Curabitur rhoncus mauris sit amet lacus condimentum ultrices. Nulla at tellus venenatis, blandit lacus vitae, commodo purus. Suspendisse condimentum odio ac orci hendrerit, a faucibus sem aliquet.'
            },
        ]
    },
    {
        name: 'Platinum',
        minPoints: 0,
        minSpendings: 500001,
        rulePointName: 'Platinum Rule',
        benefits: [
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
        ],
        promotions: [
            {
                urlPicture: '/example.com/image1.jpg',
                title: 'The Grand Opening',
                subtitle: 'Experience joy with friends',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in faucibus augue. Proin rutrum sem id tortor sagittis, eget placerat neque imperdiet. Nulla ultricies euismod ultrices. Vivamus et orci in massa semper condimentum ut a odio. Maecenas mattis mi ac quam vulputate, at congue libero interdum. Donec accumsan commodo cursus. Nulla convallis ut justo et mollis. Curabitur rhoncus mauris sit amet lacus condimentum ultrices. Nulla at tellus venenatis, blandit lacus vitae, commodo purus. Suspendisse condimentum odio ac orci hendrerit, a faucibus sem aliquet.',
                startDate: new Date('2024-07-08T00:00:00Z'),
                endDate: new Date('2026-10-01T00:00:00Z'),
                isPush: 0
            },
            {
                urlPicture: '/example.com/image2.jpg',
                title: 'Valentine Time Spend',
                subtitle: 'Promo up to 50% off',
                startDate: new Date('2024-02-01T00:00:00Z'),
                endDate: new Date('2026-02-15T00:00:00Z'),
                isPush: 1,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in faucibus augue. Proin rutrum sem id tortor sagittis, eget placerat neque imperdiet. Nulla ultricies euismod ultrices. Vivamus et orci in massa semper condimentum ut a odio. Maecenas mattis mi ac quam vulputate, at congue libero interdum. Donec accumsan commodo cursus. Nulla convallis ut justo et mollis. Curabitur rhoncus mauris sit amet lacus condimentum ultrices. Nulla at tellus venenatis, blandit lacus vitae, commodo purus. Suspendisse condimentum odio ac orci hendrerit, a faucibus sem aliquet.'
            },
            {
                urlPicture: '/example.com/image3.jpg',
                title: 'New Table New Year',
                subtitle: 'premium user enjoy the premium table',
                startDate: new Date('2024-02-01T00:00:00Z'),
                endDate: new Date('2026-02-15T00:00:00Z'),
                isPush: 1,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in faucibus augue. Proin rutrum sem id tortor sagittis, eget placerat neque imperdiet. Nulla ultricies euismod ultrices. Vivamus et orci in massa semper condimentum ut a odio. Maecenas mattis mi ac quam vulputate, at congue libero interdum. Donec accumsan commodo cursus. Nulla convallis ut justo et mollis. Curabitur rhoncus mauris sit amet lacus condimentum ultrices. Nulla at tellus venenatis, blandit lacus vitae, commodo purus. Suspendisse condimentum odio ac orci hendrerit, a faucibus sem aliquet.'
            }
        ]
    },
]

const prisma = new PrismaClient();

export async function createRankings() {
    const existingRankings = await prisma.ranking.findMany();
    if (existingRankings.length > 0) return existingRankings;

    for (const ranking of Rankings) {
        const rulePoint = await prisma.rulePoint.findFirst({
            where: { name: ranking.rulePointName }
        })

        const createdRanking = await prisma.ranking.create({
            data: {
                name: ranking.name,
                minPoints: ranking.minPoints,
                minSpendings: ranking.minSpendings,
                rulePointId: rulePoint?.id // pakai optional chaining jika tidak yakin pasti ada
            }
        })

        for (const benefit of ranking.benefits) {
            const existingBenefit = await prisma.benefit.findFirst({
                where: {
                    title: benefit.title,
                    description: benefit.description,
                    urlPicture: benefit.urlPicture
                }
            })

            if (existingBenefit) {
                await prisma.rankingBenefit.create({
                    data: {
                        rankingId: createdRanking.id,
                        benefitId: existingBenefit.id
                    }
                })
            }
        }

        for (const promotion of ranking.promotions) {
            const existingPromotion = await prisma.promotion.findFirst({
                where: {
                    title: promotion.title,
                    subtitle: promotion.subtitle,
                    description: promotion.description,
                    urlPicture: promotion.urlPicture,
                    startDate: promotion.startDate,
                    endDate: promotion.endDate,
                    isPush: promotion.isPush
                }
            })

            if (existingPromotion) {
                await prisma.promotionRanking.create({
                    data: {
                        rankingId: createdRanking.id,
                        promotionId: existingPromotion.id
                    }
                })
            }
        }
    }


    console.log("Rankings created successfully");

}
