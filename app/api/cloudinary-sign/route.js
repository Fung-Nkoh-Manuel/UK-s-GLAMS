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
    // Create sign parameters (only parameters that need to be signed)
    const signParams = {
      timestamp,
      folder: `portfolio/${category.toLowerCase()}`,
      transformation: mediaType === "video" 
        ? "q_auto:best,f_mp4,br_8000k"
        : "q_auto:good,f_auto,w_1920,c_limit",
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      signParams,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: signParams.folder,
      resource_type: mediaType === "video" ? "video" : "image",
      transformation: signParams.transformation,
    });
  } catch (error) {
    console.error("❌ Sign Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
