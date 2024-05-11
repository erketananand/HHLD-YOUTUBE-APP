import { Request, Response } from "express";
import { Db } from "../db/db";

export class DbController{
    static async uploadToDb(req: Request, res: Response) {
        console.log("Adding details to DB");
        try {
            const videoDetails = req.body;
            const response = await Db.addVideoDetailsToDB(videoDetails.title, videoDetails.description, videoDetails.author, videoDetails.url);    
            return res.status(200).send(response);
        } catch (error) {
            console.log("Error in adding to DB ", error);
            return res.status(400).send(error);
        }
     }

}
 