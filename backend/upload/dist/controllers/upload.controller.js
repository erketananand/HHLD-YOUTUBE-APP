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
exports.uploadFileToS3ViaMulter = exports.uploadFileToS3ViaPostman = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const uploadFileToS3ViaPostman = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { path, filename } = req.body;
    // Check if the file exists
    if (!fs_1.default.existsSync(path)) {
        console.log('File does not exist: ', path);
        return;
    }
    const s3 = new aws_sdk_1.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const fileStream = fs_1.default.createReadStream(path);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key: filename,
    };
    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.log('Error uploading file:', err);
            res.status(500).send('File could not be uploaded!');
        }
        else {
            console.log('File uploaded successfully. File location:', data.Location);
            res.status(200).send('File uploaded successfully');
        }
    });
});
exports.uploadFileToS3ViaPostman = uploadFileToS3ViaPostman;
const uploadFileToS3ViaMulter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { file } = req;
    if (!file) {
        console.log('No file received for upload');
        res.status(400).send('No file received for upload');
        return;
    }
    const s3 = new aws_sdk_1.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: file.buffer,
        Key: file.originalname,
    };
    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.log('Error uploading file:', err);
            res.status(500).send(err);
        }
        else {
            console.log('File uploaded successfully. File location:', data.Location);
            res.status(200).send(data);
        }
    });
});
exports.uploadFileToS3ViaMulter = uploadFileToS3ViaMulter;
