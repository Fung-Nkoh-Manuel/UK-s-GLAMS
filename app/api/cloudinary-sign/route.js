// app/api/cloudinary-sign/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request) {
  try {
    const { category, mediaType } = await request.json();

    // Generate a signed upload timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create upload parameters
    const uploadParams = {
      timestamp,
      folder: `portfolio/${category.toLowerCase()}`,
      resource_type: mediaType === "video" ? "video" : "image",
      transformation: mediaType === "video" 
        ? [{ quality: "auto:best" }, { format: "mp4" }, { bit_rate: "8000k" }]
        : [{ quality: "auto:good" }, { fetch_format: "auto" }, { width: 1920, crop: "limit" }],
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: uploadParams.folder,
      ...uploadParams,
    });
  } catch (error) {
    console.error("❌ Sign Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
