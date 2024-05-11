import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export class Db {
    static async addVideoDetailsToDB(title: string, description: string, author: string, url: string) {
        try {
            await prisma.$connect();
            const videoData = await prisma.videoData.create({
                data: { title, description, author, url }
            })
            console.log(videoData);
            return videoData;
        } finally {
            await prisma.$disconnect();
        }
    }
}