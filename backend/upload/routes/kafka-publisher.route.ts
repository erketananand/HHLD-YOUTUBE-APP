import express from "express"
import { sendMessageToKafka } from "../controllers/kafka-publisher.controller";

const router = express.Router();
router.post('/', sendMessageToKafka);

export default router;