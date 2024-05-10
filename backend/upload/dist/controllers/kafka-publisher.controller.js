"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToKafka = void 0;
const kafka_utils_1 = __importDefault(require("../utils/kafka.utils"));
const sendMessageToKafka = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("got here in upload service...");
    try {
        const message = req.body;
        console.log("body : ", message);
        const kafkaconfig = new kafka_utils_1.default();
        const msgs = [
            {
                key: "key1",
                value: JSON.stringify(message)
            }
        ];
        const result = yield kafkaconfig.produce(process.env.KAFKA_PRODUCER_TOPIC, msgs);
        console.log("result of produce : ", result);
        res.status(200).json("message uploaded successfully");
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendMessageToKafka = sendMessageToKafka;
//# sourceMappingURL=kafka-publisher.controller.js.map