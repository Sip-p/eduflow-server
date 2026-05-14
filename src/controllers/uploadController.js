import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const result = await cloudinary.uploader.upload(req.file.path, { asset_folder: "courses/thumbnails" });

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

// export const uploadVideo = async (req, res) => {
//   try {
//     if (!req.file) throw new Error("No file uploaded");

//     const result = await cloudinary.uploader.upload_large(req.file.path, {
//       resource_type: "video",
//       asset_folder: "courses/videos",
//       chunk_size: 6000000 // 6MB chunks
//     });

//     fs.unlinkSync(req.file.path);

//     res.json({
//       url: result.secure_url,
//       duration: result.duration || 0
//     });

//   } catch (error) {
//     console.error("Video upload error:", error);
//     res.status(500).json({ 
//       message: "Video upload failed", 
//       error: error.message 
//     });
//   }
// };



// export const uploadAssignment = async (req, res) => {
//   try {
//     if (!req.file) throw new Error("No file uploaded");

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       resource_type: "raw",      // ⬅ Use "raw" for PDFs, not "auto"
//       folder: "assignments/files",
//       use_filename: true,
//       unique_filename: true,
//       access_mode: "public",     // ⬅ This makes it publicly accessible
//     });

//     fs.unlinkSync(req.file.path);

//     res.status(200).json({
//       url: result.secure_url,   // ⬅ This URL is publicly accessible
//       public_id: result.public_id,
//     });

//   } catch (error) {
//     console.error("Assignment upload error:", error);
//     res.status(500).json({ message: "Assignment upload failed", error: error.message });
//   }
// };
// ✨✨
// export const uploadVideo = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // Cloudinary relies on the file extension to determine how to process
//     // the uploaded video optimally (and compute its duration). Since Multer
//     // saves without an extension, we append the original extension here.
//     const originalExt = path.extname(req.file.originalname) || ".mp4";
//     const filePath = req.file.path + originalExt;

//     fs.renameSync(req.file.path, filePath);

//     const result = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_large(filePath, {
//         resource_type: "video",
//         folder: "courses/videos", // standard explicit folder mapping is safer
//         use_filename: true,       // use the filename we crafted with the extension
//         unique_filename: true,    // append random hash to prevent collisions
//         chunk_size: 6000000, // 6MB chunks to handle large video uploads
//         timeout: 120000 // 120 seconds timeout to prevent 499 errors during Cloudinary processing
//       }, (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       });
//     });

//     console.log("Cloudinary Upload Result:", result);

//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     return res.status(200).json({
//       url: result.secure_url,
//       duration: Math.round(result.duration || 0)
//     });

//   } catch (error) {
//     console.error("Video upload error:", error);

//     return res.status(500).json({
//       message: "Video upload failed",
//       error: error.message
//     });
//   }
// };


// export const uploadVideo = async (req, res) => {
//   let filePath = null;

//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const originalExt = path.extname(req.file.originalname) || ".mp4";
//     const newFilePath = req.file.path + originalExt;
//     filePath = newFilePath;

//     // Wait for file handle to be fully released before renaming
//     await new Promise((resolve, reject) => {
//       const stream = fs.createReadStream(req.file.path);
//       stream.on('error', reject);
//       stream.on('close', async () => {
//         try {
//           fs.renameSync(req.file.path, newFilePath);
//           resolve();
//         } catch (err) {
//           // If rename fails due to EBUSY, copy + delete instead
//           try {
//             fs.copyFileSync(req.file.path, newFilePath);
//             fs.unlinkSync(req.file.path);
//             resolve();
//           } catch (copyErr) {
//             reject(copyErr);
//           }
//         }
//       });
//       stream.resume(); // drain the stream to trigger 'close'
//     });

//     const result = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_large(newFilePath, {
//         resource_type: "video",
//         folder: "courses/videos",
//         use_filename: true,
//         unique_filename: true,
//         chunk_size: 6000000,
//         timeout: 600000, // 10 minutes — large videos need time
//         eager: [{ format: "mp4" }], // force Cloudinary to process & compute duration
//         eager_async: false,
//       }, (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       });
//     });

//     console.log("Cloudinary Upload Result:", result);

//     if (fs.existsSync(newFilePath)) {
//       fs.unlinkSync(newFilePath);
//     }

//     return res.status(200).json({
//       url: result.secure_url,
//       duration: Math.round(result.duration || 0)
//     });

//   } catch (error) {
//     console.error("Video upload error:", error);

//     // Cleanup on error
//     if (filePath && fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//     if (req.file?.path && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }

//     return res.status(500).json({
//       message: "Video upload failed",
//       error: error.message
//     });
//   }
// };

export const uploadVideo = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const originalExt = path.extname(req.file.originalname) || ".mp4";
    const newFilePath = req.file.path + originalExt;
    filePath = newFilePath;

    // Wait for file handle to be fully released before renaming
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(req.file.path);
      stream.on("error", reject);
      stream.on("close", async () => {
        try {
          fs.renameSync(req.file.path, newFilePath);
          resolve();
        } catch {
          try {
            fs.copyFileSync(req.file.path, newFilePath);
            fs.unlinkSync(req.file.path);
            resolve();
          } catch (copyErr) {
            reject(copyErr);
          }
        }
      });
      stream.resume();
    });

    const fileSizeBytes = fs.statSync(newFilePath).size;
    const FIVE_MB = 5 * 1024 * 1024;

    let result;

    if (fileSizeBytes < FIVE_MB) {
      // Small file — use regular upload (upload_large requires chunks > 5MB)
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(newFilePath, {
          resource_type: "video",
          folder: "courses/videos",
          use_filename: true,
          unique_filename: true,
          eager: [{ format: "mp4" }],
          eager_async: false,
          timeout: 120000,
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } else {
      // Large file — use chunked upload
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(newFilePath, {
          resource_type: "video",
          folder: "courses/videos",
          timeout: 120000,
          use_filename: true,
          unique_filename: true,
          chunk_size: 6 * 1024 * 1024,
          eager: [{ format: "mp4" }],
          eager_async: false,
          timeout: 600000,
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    }

    if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);

    return res.status(200).json({
      url: result.secure_url,
      duration: Math.round(result.duration || 0),
    });

  } catch (error) {
    console.error("Video upload error:", error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Video upload failed", error: error.message });
  }
};
export const uploadAssignment = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    // Check if file is PDF
    if (req.file.mimetype !== "application/pdf") {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      asset_folder: "assignments/files",
      use_filename: true,
      unique_filename: true,
    });

    fs.unlinkSync(req.file.path);

    // Use the secure_url directly - it's already public and accessible
    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      original_filename: req.file.originalname
    });

  } catch (error) {
    // console.error("Assignment upload error:", error);
    res.status(500).json({ message: "Assignment upload failed", error: error.message });
  }
};
