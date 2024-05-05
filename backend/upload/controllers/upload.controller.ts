import { S3 } from 'aws-sdk';
import fs from 'fs';
import {Request, Response} from 'express';

export const uploadFileToS3ViaPostman = async (req:Request, res: Response) => {
    const {path, filename} = req.body;
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

export const uploadFileToS3ViaMulter = async (req:Request, res: Response) => {
    const {file} = req;
    if(!file) {
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

export const uploadFileToS3InChunkViaMulter = async (req:Request, res: Response) => {
    const {chunk} = req.files as any;
    if(!chunk || !chunk.length) {
        console.log('No file received for upload');
        res.status(400).send('No file received for upload');
        return;
    }
    const file = chunk[0];
    const {filename, totalChunks, chunkIndex} = req.body;
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