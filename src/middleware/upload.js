import multer from 'multer'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import cloudinary from '../../config/cloudinary.js'

//Thumbnail storage//images
const thumbnailStorage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'thumbnails',
        allowed_formats:['jpg','jpeg','png'],
    }
})

//lession pdf storage
const pdfStorage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'pdfs',
        allowed_formats:['pdf'],
    }
})

//lession video storage
const videoStorage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'videos',
        allowed_formats:['mp4','mov','avi','mkv'],
        resource_type:'video',
    }
})
export const uploadThumbnail=multer({storage:thumbnailStorage})
export const uploadLessionpdf=multer({storage:pdfStorage})
export const uploadLessionvideo=multer({storage:videoStorage})