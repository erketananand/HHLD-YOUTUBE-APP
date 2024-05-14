import express, { Request, Response } from "express";
import dotenv from "dotenv"
import cors from "cors"
import { sendMessageToKafka } from "./controllers/kafka-consumer.controller";
import { HlsConverterController } from "./controllers/hls-converter.controller";

dotenv.config();

const port = process.env.PORT || 8002;
const app = express();

app.use(cors({
   allowedHeaders: ["*"],
   origin: "*"
}));

app.use(express.json());

app.post('/transcode', async (req: Request, res: Response) => {
   console.log('Transcoding request received:', req.body);
   await HlsConverterController.convertToHLS();
   res.json({ message: 'Transcoding request received' });
});

app.get('/', (req, res) => {
   res.send('HHLD YouTube Transcoder Service')
})

app.listen(port, () => {
   console.log(`Server is listening at http://localhost:${port}`);
})

// sendMessageToKafka();