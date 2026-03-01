import express from 'express';
import { uploadImage,uploadVideo ,uploadAssignment} from '../controllers/uploadController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-image', upload.single('file'), uploadImage);
// router.post('/upload-video', upload.single('file'), uploadVideo);
router.post('/upload-assignment',upload.single('file'),uploadAssignment)
export default router;