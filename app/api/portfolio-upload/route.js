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

// ✅ POST upload item (Save metadata)
export async function POST(request) {
  await dbConnect();

  try {
    const { title, category, url, publicId, mediaType, thumbnailUrl, duration } = await request.json();

    // Validate inputs
    if (!title || !category || !url || !publicId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Save to database
    const newPortfolioItem = await PortfolioItem.create({
      title,
      category,
      url,
      mediaType,
      publicId,
      thumbnailUrl: thumbnailUrl || null,
      duration: duration || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Media successfully saved to portfolio.",
        item: newPortfolioItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Save Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred.",
      },
      { status: 500 }
    );
  }
}