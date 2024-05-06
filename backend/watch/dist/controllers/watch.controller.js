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
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchVideo = void 0;
const aws_sdk_1 = require("aws-sdk");
function generateSignedUrl(videoKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: videoKey,
            Expires: 3600 // URL expires in 1 hour, adjust as needed
        };
        return new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', params, (err, url) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(url);
                }
            });
        });
    });
}
const watchVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videoKey = req.query.key; // Key of the video file in S3
        const signedUrl = yield generateSignedUrl(videoKey);
        res.json({ signedUrl });
    }
    catch (err) {
        console.error('Error generating pre-signed URL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.watchVideo = watchVideo;
