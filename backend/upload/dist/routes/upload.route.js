"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.post('/directUploadFromPostman', upload_controller_1.uploadFileToS3ViaPostman); // Upload a file directly from Postman
router.post('/singleFileUploadFromUi', upload.single('file'), upload_controller_1.uploadFileToS3ViaMulter); // Upload a file from a form UI using formData & multer
router.post('/', upload.fields([{ name: 'chunk' }, { name: 'totalChunks' }, { name: 'chunkIndex' }, { name: 'filename' }]), upload_controller_1.uploadFileToS3InChunkViaMulter);
exports.default = router;
