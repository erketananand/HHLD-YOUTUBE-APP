import { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload.route';

const port = process.env.PORT || 8000;
dotenv.config();

const app = express();

app.use(cors({
    allowedHeaders: ["*"],
    origin: "*",
}));

app.use(express.json());
app.use('/upload', uploadRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Upload Service!');
});

app.listen(port, () => {
    console.log(`Upload Service is running on port ${port}`);
});
