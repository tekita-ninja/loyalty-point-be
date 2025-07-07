import { PrismaClient } from "@prisma/client";

const locations = [
    {
        name: 'Elite Eight Billiards Tanjung Duren',
        address: 'Jl. Tanjung Duren Raya No.76, Lt. 2',
        latitude: -6.175421162275649,
        longitude: 106.78336792522909,
        rewards: [
            {
                name: 'Crispy French Fries',
                urlPicture: '/example.com/french-fries.jpg',
                price: 20000,
                stocks: 10,
                isLimited: 0
            },
            {
                name: 'Potato with cheese',
                urlPicture: '/example.com/french-fries.jpg',
                price: 30000,
                stocks: 30,
                isLimited: 0

            },
            {
                name: 'Stuffed Mushroom',
                urlPicture: '/example.com/french-fries.jpg',
                price: 25000,
                stocks: 3,
                isLimited: 0
            },
            {
                name: 'Grilled Chicken',
                urlPicture: '/example.com/grilled-chicken.jpg',
                price: 80000,
                stocks: 5,
                isLimited: 0

            },
            {
                name: 'Beef Steak',
                urlPicture: '/example.com/beef-steak.jpg',
                price: 120000,
                stocks: 2,
                isLimited: 0
            },
            {
                name: 'Vegetable Stir Fry',
                urlPicture: '/example.com/vegetable-stir-fry.jpg',
                price: 60000,
                stocks: 8,
                isLimited: 1,
                startDate: new Date('2025-07-01T00:00:00Z'),
                endDate: new Date('2025-09-30T23:59:59Z'),
            },
            {
                name: 'Chocolate Cake',
                urlPicture: '/example.com/chocolate-cake.jpg',
                price: 25000,
                stocks: 15,
                isLimited: 0
            },
            {
                name: 'Fruit Salad',
                urlPicture: '/example.com/fruit-salad.jpg',
                price: 15000,
                stocks: 20,
                isLimited: 1,
                startDate: new Date('2025-07-01T00:00:00Z'),
                endDate: new Date('2025-07-07T23:59:59Z'),
            },
            {
                name: 'Ice Cream Sundae',
                urlPicture: '/example.com/ice-cream-sundae.jpg',
                price: 30000,
                stocks: 10,
                isLimited: 0
            },
        ]
    },
    {
        name: 'Elite Eight Billiards Tanjung Duren',
        address: 'Jl. Tanjung Duren Raya No.76, Lt. 2',
        latitude: -6.175421162275649,
        longitude: 106.78336792522909,
        rewards: [
            {
                name: 'Crispy French Fries',
                urlPicture: '/example.com/french-fries.jpg',
                price: 20000,
                stocks: 10,
                isLimited: 0
            },
            {
                name: 'Potato with cheese',
                urlPicture: '/example.com/french-fries.jpg',
                price: 30000,
                stocks: 30,
                isLimited: 0

            },
            {
                name: 'Grilled Chicken',
                urlPicture: '/example.com/grilled-chicken.jpg',
                price: 80000,
                stocks: 5,
                isLimited: 0

            },
            {
                name: 'Beef Steak',
                urlPicture: '/example.com/beef-steak.jpg',
                price: 120000,
                stocks: 2,
                isLimited: 0
            },
            {
                name: 'Chocolate Cake',
                urlPicture: '/example.com/chocolate-cake.jpg',
                price: 25000,
                stocks: 15,
                isLimited: 0
            },
            {
                name: 'Fruit Salad',
                urlPicture: '/example.com/fruit-salad.jpg',
                price: 15000,
                stocks: 20,
                isLimited: 1,
                startDate: new Date('2025-07-01T00:00:00Z'),
                endDate: new Date('2025-07-07T23:59:59Z'),
            },
        ]
    }
]

const prisma = new PrismaClient();


export async function createLocations() {
    const existingLocations = await prisma.location.findMany({
        include: {
            rewards: true,
        }
    });

    if (existingLocations.length > 0) return existingLocations;

    for (const location of locations) {
        const createdLocation = await prisma.location.create({
            data: {
                name: location.name,
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
            }
        })

        for (const reward of location.rewards) {
            const findReward = await prisma.reward.findFirst({
                where: {
                    name: reward.name,
                    urlPicture: reward.urlPicture,
                    price: reward.price,
                    stocks: reward.stocks,
                    isLimited: reward.isLimited
                }
            })

            if (findReward) {
                await prisma.rewardLocation.create({
                    data: {
                        locationId: createdLocation.id,
                        rewardId: findReward.id,
                    }
                })
            } else {
                console.warn(`Reward not found for: ${reward.name}`)
            }
        }
    }


}