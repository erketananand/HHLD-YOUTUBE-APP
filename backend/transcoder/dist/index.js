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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const hls_converter_controller_1 = require("./controllers/hls-converter.controller");
dotenv_1.default.config();
const port = process.env.PORT || 8002;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    allowedHeaders: ["*"],
    origin: "*"
}));
app.use(express_1.default.json());
app.post('/transcode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Transcoding request received:', req.body);
    yield hls_converter_controller_1.HlsConverterController.convertToHLS();
    res.json({ message: 'Transcoding request received' });
}));
app.get('/', (req, res) => {
    res.send('HHLD YouTube Transcoder Service');
});
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
// sendMessageToKafka();
//# sourceMappingURL=index.js.map