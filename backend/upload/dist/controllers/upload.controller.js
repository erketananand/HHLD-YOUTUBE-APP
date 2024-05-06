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
exports.completeMultipartUpload = exports.multipartChunkUpload = exports.initializeMultipartUpload = exports.multipartUploadToS3ViaPostman = exports.uploadFileToS3InChunkViaMulter = exports.uploadFileToS3ViaMulter = exports.uploadFileToS3ViaPostman = void 0;
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
const uploadFileToS3InChunkViaMulter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chunk } = req.files;
    if (!chunk || !chunk.length) {
        console.log('No file received for upload');
        res.status(400).send('No file received for upload');
        return;
    }
    const file = chunk[0];
    const { filename, totalChunks, chunkIndex } = req.body;
    const s3 = new aws_sdk_1.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: file.buffer,
        Key: filename,
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
exports.uploadFileToS3InChunkViaMulter = uploadFileToS3InChunkViaMulter;
const multipartUploadToS3ViaPostman = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { path, filename } = req.body;
    // Check if the file exists
    if (!fs_1.default.existsSync(path)) {
        console.log('File does not exist: ', path);
        return res.status(400).send('File does not exist');
    }
    const s3 = new aws_sdk_1.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        ACL: 'public-read',
        ContentType: 'video/mp4'
    };
    try {
        console.log('Initiating multipart upload');
        const data = yield s3.createMultipartUpload(uploadParams).promise();
        console.log('Multipart upload initiated:', data.UploadId);
        const fileSize = fs_1.default.statSync(path).size;
        const chunkSize = 5 * 1024 * 1024; // 5 MB
        const numParts = Math.ceil(fileSize / chunkSize);
        const promises = [];
        const uploadedETags = []; // Store ETags for uploaded parts
        for (let i = 0; i < numParts; i++) {
            const start = i * chunkSize;
            const end = Math.min(fileSize, start + chunkSize);
            const partParams = {
                Body: fs_1.default.createReadStream(path, { start, end }),
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: filename,
                PartNumber: i + 1,
                ContentLength: end - start,
                UploadId: data.UploadId,
            };
            promises.push(s3.uploadPart(partParams).promise());
            console.log('Uploading part:', i + 1, 'Start:', start, 'End:', end);
        }
        const results = yield Promise.all(promises);
        results.forEach((result, index) => {
            uploadedETags.push({ PartNumber: result.PartNumber || (index + 1), ETag: result.ETag });
        });
        console.log('Uploaded parts:', uploadedETags);
        const completeParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            UploadId: data.UploadId,
            MultipartUpload: { Parts: uploadedETags },
        };
        const completeData = yield s3.completeMultipartUpload(completeParams).promise();
        console.log('Multipart upload completed:', completeData);
        res.status(200).send('Multipart upload completed');
    }
    catch (error) {
        console.log('Error uploading file:', error);
        res.status(500).send('File could not be uploaded!');
    }
});
exports.multipartUploadToS3ViaPostman = multipartUploadToS3ViaPostman;
// Initialize upload
const initializeMultipartUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Initialising Upload');
        const { filename } = req.body;
        const s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const bucketName = process.env.AWS_BUCKET_NAME;
        const createParams = {
            Bucket: bucketName,
            Key: filename,
            ContentType: 'video/mp4'
        };
        const multipartParams = yield s3.createMultipartUpload(createParams).promise();
        console.log("multipartparams---- ", multipartParams, "upload id-----", multipartParams.UploadId);
        const uploadId = multipartParams.UploadId;
        res.status(200).json({ uploadId });
    }
    catch (err) {
        console.error('Error initializing upload:', err);
        res.status(500).send('Upload initialization failed');
    }
});
exports.initializeMultipartUpload = initializeMultipartUpload;
// Upload chunk
const multipartChunkUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Uploading Chunk');
        const { filename, chunkIndex, uploadId } = req.body;
        const s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const bucketName = process.env.AWS_BUCKET_NAME;
        const { file } = req;
        const partParams = {
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
            PartNumber: parseInt(chunkIndex) + 1,
            Body: file.buffer,
        };
        const data = yield s3.uploadPart(partParams).promise();
        console.log("data------- ", data);
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Error uploading chunk:', err);
        res.status(500).send('Chunk could not be uploaded');
    }
});
exports.multipartChunkUpload = multipartChunkUpload;
// Complete upload
const completeMultipartUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Completing Upload');
        const { filename, totalChunks, uploadId } = req.body;
        const uploadedParts = [];
        // Build uploadedParts array from request body
        for (let i = 0; i < totalChunks; i++) {
            uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
        }
        const s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const bucketName = process.env.AWS_BUCKET_NAME;
        const completeParams = {
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
        };
        // Listing parts using promise
        const data = yield s3.listParts(completeParams).promise();
        const parts = data.Parts.map((part) => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
        }));
        completeParams.MultipartUpload = {
            Parts: parts
        };
        // Completing multipart upload using promise
        const uploadResult = yield s3.completeMultipartUpload(completeParams).promise();
        console.log("data----- ", uploadResult);
        return res.status(200).json({ message: "Uploaded successfully!!!" });
    }
    catch (error) {
        console.log('Error completing upload :', error);
        return res.status(500).send('Upload completion failed');
    }
});
exports.completeMultipartUpload = completeMultipartUpload;
