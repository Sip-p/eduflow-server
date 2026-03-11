import { v2 as cloudinary } from 'cloudinary';
import fs from fs
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//xyz
// export const uploadOnCloud=async (localfilepath)=>{
 
//     try{
//       if(!localfilepath){
//         return null;
//       }
//       //upload the file on cloudinary--cloudinary uploader.upload
//       const res=await cloudinary.uploader.upload(localfilepath,{
//         resource_type:"auto"
//       })
// //file has been uploaded 
// console.log("File is uploaded on cloudinary",res.url)
// return res;
//     }
//    catch (error) {
//     fs.unlink(localfilepath)//remove the local saved temporary file as the upload got failed
//     return null;
  
// }
// }



export default cloudinary;
