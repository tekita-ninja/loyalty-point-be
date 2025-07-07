import { PrismaClient } from ".prisma/client/default";

const rewards = [
    {
        categoryName: 'Appetizer',
        rewards: [
            {
                name: 'Crispy French Fries',
                urlPicture: '/example.com/french-fries.jpg',
                price: 20000,
                stocks: 10,
                isLimited:0
            },
            {
                name: 'Potato with cheese',
                urlPicture: '/example.com/french-fries.jpg',
                price: 30000,
                stocks: 30,
                isLimited:0

            },
            {
                name: 'Stuffed Mushroom',
                urlPicture: '/example.com/french-fries.jpg',
                price: 25000,
                stocks: 3,
                isLimited:0
            },
        ]
    },
    {
        categoryName : 'Main',
        rewards: [
            {
                name: 'Grilled Chicken',
                urlPicture: '/example.com/grilled-chicken.jpg',
                price: 80000,
                stocks: 5,
                isLimited:0

            },
            {
                name: 'Beef Steak',
                urlPicture: '/example.com/beef-steak.jpg',
                price: 120000,
                stocks: 2,
                isLimited:0
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
        ]
    },
    {
        categoryName: 'Dessert',
        rewards: [
            {
                name: 'Chocolate Cake',
                urlPicture: '/example.com/chocolate-cake.jpg',
                price: 25000,
                stocks: 15,
                isLimited:0
            },
            {
                name: 'Fruit Salad',
                urlPicture: '/example.com/fruit-salad.jpg',
                price: 15000,
                stocks: 20,
                isLimited:1,
                startDate: new Date('2025-07-01T00:00:00Z'),
                endDate: new Date('2025-07-07T23:59:59Z'),
            },
            {
                name: 'Ice Cream Sundae',
                urlPicture: '/example.com/ice-cream-sundae.jpg',
                price: 30000,
                stocks: 10,
                isLimited:0
            },
        ]
    }

]

const prisma = new PrismaClient();

export async function createRewards() {
    const existingRewards = await prisma.reward.findMany();
    if (existingRewards.length > 0) return existingRewards;

    for (const category of rewards) {
        const createdCategory = await prisma.category.create({
            data: {
                name: category.categoryName,
            },
        });

        for (const reward of category.rewards) {
            await prisma.reward.create({
                data: {
                    name: reward.name,
                    urlPicture: reward.urlPicture,
                    price: reward.price,
                    stocks: reward.stocks,
                    isLimited: reward.isLimited,
                    startDate: reward.startDate || null,
                    endDate: reward.endDate || null,
                    categoryId: createdCategory.id,
                },
            });
        }
    }

    console.log("Rewards created successfully");
}