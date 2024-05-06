"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const watch_controller_1 = require("../controllers/watch.controller");
const router = express_1.default.Router();
router.get('/', watch_controller_1.watchVideo);
exports.default = router;
