import express from "express"
import {watchVideo} from "../controllers/watch.controller";
import { HomeController } from "../controllers/home.controller";

const router = express.Router();

router.get('/', watchVideo);
router.get('/home', HomeController.getAllVideos);

export default router;
