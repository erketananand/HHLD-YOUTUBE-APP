"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const watch_route_1 = __importDefault(require("./routes/watch.route"));
dotenv_1.default.config();
const port = process.env.PORT || 8001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    allowedHeaders: ["*"],
    origin: "*"
}));
app.use(express_1.default.json());
app.use('/watch', watch_route_1.default);
app.get('/', (req, res) => {
    res.send('HHLD YouTube Watch Service');
});
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
