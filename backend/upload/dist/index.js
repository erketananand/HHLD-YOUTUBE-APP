"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const upload_route_1 = __importDefault(require("./routes/upload.route"));
const port = process.env.PORT || 8000;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    allowedHeaders: ["*"],
    origin: "*",
}));
app.use(express_1.default.json());
app.use('/upload', upload_route_1.default);
app.get('/', (req, res) => {
    res.send('Hello Upload Service!');
});
app.listen(port, () => {
    console.log(`Upload Service is running on port ${port}`);
});
