import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcrypt';


import { Gender } from '@prisma/client';

const customers = [
    {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'test@123',
        phone: '0812345678910',
        gender: Gender.MALE,
        birthDate: new Date('1990-01-01'),
    },
    {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        password: 'test@123',
        phone: '0812345678911',
        gender: Gender.FEMALE,
        birthDate: new Date('1992-03-15'),
    },
    {
        firstname: 'Michael',
        lastname: 'Johnson',
        email: 'michael.johnson@example.com',
        password: 'test@123',
        phone: '0812345678912',
        gender: Gender.MALE,
        birthDate: new Date('1988-07-20'),
    },
    {
        firstname: 'Emily',
        lastname: 'Davis',
        email: 'emily.davis@example.com',
        password: 'test@123',
        phone: '0812345678913',
        gender: Gender.FEMALE,
        birthDate: new Date('1995-11-05'),
    },
    {
        firstname: 'Daniel',
        lastname: 'Brown',
        email: 'daniel.brown@example.com',
        password: 'test@123',
        phone: '0812345678914',
        gender: Gender.MALE,
        birthDate: new Date('1991-02-28'),
    },
    {
        firstname: 'Sophia',
        lastname: 'Wilson',
        email: 'sophia.wilson@example.com',
        password: 'test@123',
        phone: '0812345678915',
        gender: Gender.FEMALE,
        birthDate: new Date('1994-06-17'),
    },
    {
        firstname: 'William',
        lastname: 'Taylor',
        email: 'william.taylor@example.com',
        password: 'test@123',
        phone: '0812345678916',
        gender: Gender.MALE,
        birthDate: new Date('1987-12-10'),
    },
    {
        firstname: 'Olivia',
        lastname: 'Anderson',
        email: 'olivia.anderson@example.com',
        password: 'test@123',
        phone: '0812345678917',
        gender: Gender.FEMALE,
        birthDate: new Date('1996-04-08'),
    },
    {
        firstname: 'James',
        lastname: 'Thomas',
        email: 'james.thomas@example.com',
        password: 'test@123',
        phone: '0812345678918',
        gender: Gender.MALE,
        birthDate: new Date('1993-09-25'),
    },
    {
        firstname: 'Isabella',
        lastname: 'Jackson',
        email: 'isabella.jackson@example.com',
        password: 'test@123',
        phone: '0812345678919',
        gender: Gender.FEMALE,
        birthDate: new Date('1997-08-14'),
    },
];


const prisma = new PrismaClient()

export async function createCustomers() {
    const existingCustomers = await prisma.user.findMany({
        where: {
            roles: {
                some: {
                    role: {
                        code: 'CUST',
                    },
                },
            },
        },
    });
    if (existingCustomers.length > 0) return existingCustomers;


    const ranking = await prisma.ranking.findFirst({
        where: {
            name: 'Silver',
        },
    })

    const preparedCustomers = await Promise.all(
        customers.map(async (customer) => ({
            ...customer,
            password: await bcrypt.hash(customer.password, 10),
            rankingId: ranking?.id || null
        }))
    );

    await prisma.user.createMany({
        data: preparedCustomers,
    });

    const createdCustomers = await prisma.user.findMany({
        where: {
            email: {
                in: customers.map(customer => customer.email),
            },
        },
    });

    const createCustomerRoles = await prisma.role.create({
        data: {
            name: 'CUSTOMER',
            code: 'CUST',
        },
    });

    await prisma.userRole.createMany({
        data: createdCustomers.map(customer => ({
            userId: customer.id,
            roleId: createCustomerRoles.id,
        })),
    });

    console.log("Customers created successfully");

}
