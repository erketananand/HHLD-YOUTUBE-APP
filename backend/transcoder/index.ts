import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import { sendMessageToKafka } from "./controllers/kafka-consumer.controller";

dotenv.config();

const port = process.env.PORT || 8002;
const app = express();

app.use(cors({
   allowedHeaders: ["*"],
   origin: "*"
}));

app.use(express.json());


app.get('/', (req, res) => {
   res.send('HHLD YouTube Transcoder Service')
})

app.listen(port, () => {
   console.log(`Server is listening at http://localhost:${port}`);
})

sendMessageToKafka();