import {PrismaClient} from "@prisma/client"
import { Response, Request } from "express";

const prisma = new PrismaClient();

export class HomeController{
    public static async getAllVideos(req: Request, res: Response) {
        try {
            await prisma.$connect();
            const allData = await prisma.$queryRaw`SELECT * FROM "VideoData"`;
            console.log(allData);
            return res.status(200).send(allData);
          } catch (error) {
            console.log('Error fetching data:', error);
            return res.status(400).send();
          } finally {
            await prisma.$disconnect();
          }
    }
}