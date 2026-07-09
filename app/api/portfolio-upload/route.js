// app/api/portfolio-upload/route.js

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/mongodb";
import PortfolioItem from "@/models/PortfolioItem";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Vercel free tier limit)

// ✅ GET all items
export async function GET() {
  await dbConnect();

  try {
    const items = await PortfolioItem.find({}).sort({ createdAt: -1 });
    
    // Transform items to include all needed fields
    const transformedItems = items.map(item => ({
      _id: item._id,
      title: item.title,
      category: item.category,
      url: item.url,
      mediaType: item.mediaType || 'image',
      thumbnailUrl: item.thumbnailUrl || item.url,
      duration: item.duration || null,
      publicId: item.publicId,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ success: true, items: transformedItems });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch portfolio items" },
      { status: 500 }
    );
  }
}

// ✅ POST upload item (no temp file needed)
export async function POST(request) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const category = formData.get("category");
    const file = formData.get("file");

    // Validate inputs
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid title is required." },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid category is required." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File is required." },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit. Please compress your file.` 
        },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const mediaType = file.type?.startsWith("video/") ? "video" : "image";

    // ✅ Upload directly from buffer (no temp file on Windows)
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: mediaType,
          folder: `portfolio/${category.toLowerCase()}`,
          public_id: `${category.toLowerCase()}-${Date.now()}`,
          ...(mediaType === "image" && {
            transformation: [
              { quality: "auto:good" },
              { fetch_format: "auto" },
              { width: 1920, crop: "limit" } // Limit max width
            ],
          }),
          ...(mediaType === "video" && {
            transformation: [
              { quality: "auto:best" },
              { format: "mp4" },
              { bit_rate: "8000k" },
              { width: 1920, crop: "limit" }
            ],
          }),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = await uploadPromise;

    // Save to database
    const newPortfolioItem = await PortfolioItem.create({
      title,
      category,
      url: result.secure_url,
      mediaType,
      publicId: result.public_id,
      // Store thumbnail for videos
      ...(mediaType === "video" && result.eager && result.eager[0] && {
        thumbnailUrl: result.eager[0].secure_url,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Media successfully uploaded and saved.",
        url: result.secure_url,
        item: newPortfolioItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred during upload.",
      },
      { status: 500 }
    );
  }
}