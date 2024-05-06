import express from "express"
import {watchVideo} from "../controllers/watch.controller";

const router = express.Router();

router.get('/', watchVideo);

export default router;
