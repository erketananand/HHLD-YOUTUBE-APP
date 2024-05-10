"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const kafka_consumer_controller_1 = require("./controllers/kafka-consumer.controller");
dotenv_1.default.config();
const port = process.env.PORT || 8002;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    allowedHeaders: ["*"],
    origin: "*"
}));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('HHLD YouTube Transcoder Service');
});
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
(0, kafka_consumer_controller_1.sendMessageToKafka)();
//# sourceMappingURL=index.js.map