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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for Vercel free tier

export async function POST(request) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const category = formData.get("category");
    const file = formData.get("file");

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` 
        },
        { status: 400 }
      );
    }

    // ✅ Convert to buffer - NO /tmp file needed
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const mediaType = file.type?.startsWith("video/") ? "video" : "image";

    // ✅ Upload directly from buffer
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
              { width: 1920, crop: "limit" }
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

    const newPortfolioItem = await PortfolioItem.create({
      title,
      category,
      url: result.secure_url,
      mediaType,
      publicId: result.public_id,
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

export async function GET() {
  await dbConnect();

  try {
    const items = await PortfolioItem.find({}).sort({ createdAt: -1 });
    
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