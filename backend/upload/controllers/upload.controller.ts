import { S3 } from 'aws-sdk';
import fs from 'fs';
import { Request, Response } from 'express';

export const uploadFileToS3ViaPostman = async (req: Request, res: Response) => {
    const { path, filename } = req.body;
    // Check if the file exists
    if (!fs.existsSync(path)) {
        console.log('File does not exist: ', path);
        return;
    }

    const s3 = new S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const fileStream = fs.createReadStream(path);

    const uploadParams: any = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key: filename,
    };


    s3.upload(uploadParams, (err: any, data: any) => {
        if (err) {
            console.log('Error uploading file:', err);
            res.status(500).send('File could not be uploaded!');
        } else {
            console.log('File uploaded successfully. File location:', data.Location);
            res.status(200).send('File uploaded successfully');
        }
    });
};

export const uploadFileToS3ViaMulter = async (req: Request, res: Response) => {
    const { file } = req;
    if (!file) {
        console.log('No file received for upload');
        res.status(400).send('No file received for upload');
        return;
    }

    const s3 = new S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const uploadParams: any = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: file.buffer,
        Key: file.originalname,
    };


    s3.upload(uploadParams, (err: any, data: any) => {
        if (err) {
            console.log('Error uploading file:', err);
            res.status(500).send(err);
        } else {
            console.log('File uploaded successfully. File location:', data.Location);
            res.status(200).send(data);
        }
    });
};

export const uploadFileToS3InChunkViaMulter = async (req: Request, res: Response) => {
    const { chunk } = req.files as any;
    if (!chunk || !chunk.length) {
        console.log('No file received for upload');
        res.status(400).send('No file received for upload');
        return;
    }
    const file = chunk[0];
    const { filename, totalChunks, chunkIndex } = req.body;
    const s3 = new S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const uploadParams: any = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: file.buffer,
        Key: filename,
    };


    s3.upload(uploadParams, (err: any, data: any) => {
        if (err) {
            console.log('Error uploading file:', err);
            res.status(500).send(err);
        } else {
            console.log('File uploaded successfully. File location:', data.Location);
            res.status(200).send(data);
        }
    });
};

export const multipartUploadToS3ViaPostman = async (req: Request, res: Response) => {
    const { path, filename } = req.body;
    // Check if the file exists
    if (!fs.existsSync(path)) {
        console.log('File does not exist: ', path);
        return res.status(400).send('File does not exist');
    }

    const s3 = new S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const uploadParams: any = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        ACL: 'public-read',
        ContentType: 'video/mp4'
    };

    try {
        console.log('Initiating multipart upload');
        const data = await s3.createMultipartUpload(uploadParams).promise();
        console.log('Multipart upload initiated:', data.UploadId);
        const fileSize = fs.statSync(path).size;
        const chunkSize = 5 * 1024 * 1024; // 5 MB
        const numParts = Math.ceil(fileSize / chunkSize);
        const promises = [];
        const uploadedETags: any[] = []; // Store ETags for uploaded parts
        for (let i = 0; i < numParts; i++) {
            const start = i * chunkSize;
            const end = Math.min(fileSize, start + chunkSize);
            const partParams: any = {
                Body: fs.createReadStream(path, { start, end }),
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: filename,
                PartNumber: i + 1,
                ContentLength: end - start,
                UploadId: data.UploadId,
            };
            promises.push(s3.uploadPart(partParams).promise());
            console.log('Uploading part:', i + 1, 'Start:', start, 'End:', end);
        }
        const results = await Promise.all(promises);
        results.forEach((result: any, index: number) => {
            uploadedETags.push({ PartNumber: result.PartNumber || (index + 1), ETag: result.ETag });
        });
        console.log('Uploaded parts:', uploadedETags);
        const completeParams: any = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            UploadId: data.UploadId,
            MultipartUpload: { Parts: uploadedETags },
        };
        const completeData = await s3.completeMultipartUpload(completeParams).promise();
        console.log('Multipart upload completed:', completeData);
        res.status(200).send('Multipart upload completed');
    } catch (error) {
        console.log('Error uploading file:', error);
        res.status(500).send('File could not be uploaded!');
    }
};

// Initialize upload
export const initializeMultipartUpload = async (req: Request, res: Response) => {
    try {
        console.log('Initialising Upload');
        const {filename} = req.body;
        const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const bucketName = process.env.AWS_BUCKET_NAME;
 
        const createParams: any = {
            Bucket: bucketName,
            Key: filename,
            ContentType: 'video/mp4'
        };
 
        const multipartParams = await s3.createMultipartUpload(createParams).promise();
        console.log("multipartparams---- ", multipartParams, "upload id-----", multipartParams.UploadId);
        const uploadId = multipartParams.UploadId;
 
        res.status(200).json({ uploadId });
    } catch (err) {
        console.error('Error initializing upload:', err);
        res.status(500).send('Upload initialization failed');
    }
 };
 
 // Upload chunk
 export const multipartChunkUpload = async (req: Request, res: Response) => {
    try {
        console.log('Uploading Chunk');
        const { filename, chunkIndex, uploadId } = req.body;
        const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const bucketName = process.env.AWS_BUCKET_NAME;
        const {file} = req as any;
        const partParams: any = {
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
            PartNumber: parseInt(chunkIndex) + 1,
            Body: file.buffer,
        };
 
        const data = await s3.uploadPart(partParams).promise();
        console.log("data------- ", data);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error uploading chunk:', err);
        res.status(500).send('Chunk could not be uploaded');
    }
 };
 
 // Complete upload
 export const completeMultipartUpload = async (req: Request, res: Response) => {
    try {
        console.log('Completing Upload');
        const { filename, totalChunks, uploadId } = req.body;
        const uploadedParts = [];
 
        // Build uploadedParts array from request body
        for (let i = 0; i < totalChunks; i++) {
            uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
        }
 
        const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        const bucketName = process.env.AWS_BUCKET_NAME;
 
        const completeParams: any = {
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
        };
 
        // Listing parts using promise
        const data: any = await s3.listParts(completeParams).promise();
 
        const parts = data.Parts.map((part: any) => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
        }));
 
        completeParams.MultipartUpload = {
            Parts: parts
        };
 
        // Completing multipart upload using promise
        const uploadResult = await s3.completeMultipartUpload(completeParams).promise();
 
        console.log("data----- ", uploadResult);
        return res.status(200).json({ message: "Uploaded successfully!!!" });
 
    } catch (error) {
        console.log('Error completing upload :', error);
        return res.status(500).send('Upload completion failed');
    }
 };