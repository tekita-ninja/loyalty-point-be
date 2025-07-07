import { PrismaClient } from "@prisma/client";
import { url } from "inspector";
import { start } from "repl";

const promotions = [
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

const prisma = new PrismaClient();

export async function createPromotions() {
    const existingPromotions = await prisma.promotion.findMany();
    if (existingPromotions.length > 0) return existingPromotions;

    return prisma.promotion.createMany({
        data: promotions
    });
}
