// app/api/portfolio-upload/[id]/route.js

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

// ✅ DELETE single item
export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;

    // Find the item
    const item = await PortfolioItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404 }
      );
    }

    // Delete from Cloudinary (best-effort, don't fail if it errors)
    if (item.publicId) {
      try {
        const result = await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.mediaType === "video" ? "video" : "image",
        });
        
        if (result.result === "ok") {
          console.log(`✅ Cloudinary: Deleted ${item.publicId}`);
        } else {
          console.warn(`⚠️ Cloudinary: ${result.result} for ${item.publicId}`);
        }
      } catch (cloudinaryError) {
        console.error("⚠️ Cloudinary delete failed:", cloudinaryError.message);
        // Continue with DB deletion
      }
    }

    // Delete from database
    await PortfolioItem.findByIdAndDelete(id);
    console.log(`✅ Database: Deleted item ${id} (${item.title})`);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully.",
    });

  } catch (error) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete item.",
      },
      { status: 500 }
    );
  }
}

// ✅ PUT update single item
export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const { title, category, url, publicId, mediaType, thumbnailUrl, duration } = await request.json();

    // Validate inputs
    if (!title || !category) {
      return NextResponse.json(
        { success: false, message: "Title and Category are required." },
        { status: 400 }
      );
    }

    // Find the item first
    const item = await PortfolioItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404 }
      );
    }

    // If a new publicId is provided, that means the media was updated/replaced.
    // We should delete the old asset from Cloudinary.
    if (publicId && item.publicId && publicId !== item.publicId) {
      try {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.mediaType === "video" ? "video" : "image",
        });
        console.log(`✅ Cloudinary: Replaced old media ${item.publicId} with ${publicId}`);
      } catch (cloudinaryError) {
        console.error("⚠️ Cloudinary delete failed on replace:", cloudinaryError.message);
      }
    }

    // Update item
    item.title = title;
    item.category = category;
    if (url) item.url = url;
    if (publicId) item.publicId = publicId;
    if (mediaType) item.mediaType = mediaType;
    if (thumbnailUrl !== undefined) item.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) item.duration = duration;

    await item.save();
    console.log(`✅ Database: Updated item ${id} (${title})`);

    return NextResponse.json({
      success: true,
      message: "Item updated successfully.",
      item,
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update item.",
      },
      { status: 500 }
    );
  }
}