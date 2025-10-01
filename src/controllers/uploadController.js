import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const result = await cloudinary.uploader.upload(req.file.path, { folder: "courses/thumbnails" });

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const result = await cloudinary.uploader.upload(req.file.path, { 
      resource_type: "video",
      folder: "courses/videos"
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,
      duration: result.duration || 0
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ message: "Video upload failed", error: error.message });
  }
};
