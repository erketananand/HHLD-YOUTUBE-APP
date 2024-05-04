import express from 'express';
import multer from 'multer';
import { uploadFileToS3ViaPostman, uploadFileToS3ViaMulter} from '../controllers/upload.controller';

const upload = multer();
const router = express.Router();
router.post('/directUploadFromPostman', uploadFileToS3ViaPostman); // Upload a file directly from Postman
router.post('/', upload.single('file'), uploadFileToS3ViaMulter); // Upload a file from a form UI using formData & multer

export default router;