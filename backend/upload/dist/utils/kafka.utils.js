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
const kafkajs_1 = require("kafkajs");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class KafkaConfig {
    constructor() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER],
            ssl: {
                ca: [fs_1.default.readFileSync(path_1.default.resolve("./ca.cer"), "utf-8")]
            },
            sasl: {
                username: process.env.KAFKA_USERNAME,
                password: process.env.KAFKA_PASSWORD,
                mechanism: "plain"
            }
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
    }
    produce(topic, messages) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.producer.connect();
                console.log("kafka connected... : ", result);
                yield this.producer.send({
                    topic: topic,
                    messages: messages
                });
            }
            catch (error) {
                console.log(error);
            }
            finally {
                yield this.producer.disconnect();
            }
        });
    }
    consume(topic, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.consumer.connect();
                yield this.consumer.subscribe({ topic: topic, fromBeginning: true });
                yield this.consumer.run({
                    eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                        const value = message.value.toString();
                        callback(value);
                    })
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.default = KafkaConfig;
//# sourceMappingURL=kafka.utils.js.map