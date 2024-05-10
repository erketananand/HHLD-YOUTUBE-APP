import { Request, Response } from "express"
import {Message} from "kafkajs"
import KafkaConfig from "../utils/kafka.utils"

export const sendMessageToKafka = async (req: Request, res: Response) => {
    try {
        const message = req.body
        console.log("body : ", message)
        const kafkaconfig = new KafkaConfig()
        const msgs: Message[] = [
            {
                key: "key1",
                value: JSON.stringify(message)
            }
        ]
        const result = await kafkaconfig.produce(process.env.KAFKA_PRODUCER_TOPIC as string, msgs)
        res.status(200).json("message uploaded successfully")
    } catch (error) {
        console.log(error)
    }
 }