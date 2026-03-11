import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "courses/videos"
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      url: result.secure_url,
      duration: Math.round(result.duration || 0)
    });

  } catch (error) {
    console.error("Video upload error:", error);

    return res.status(500).json({
      message: "Video upload failed",
      error: error.message
    });
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
