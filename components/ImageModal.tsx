"use client"; // Important for client-side functionality

import React from 'react';
import { X, Download } from 'lucide-react';

export function ImageModal({ src, alt, onClose, isOpen }) {
  if (!isOpen) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Get filename from alt or use default
      const filename = alt ? `${alt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg` : "download.jpg";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image:", err);
      // Fallback: open in new tab
      window.open(src, "_blank");
    }
  };

  return (
    <div
      // Main modal overlay: fixed, full screen, dark background, flex for centering.
      // Crucially, `overflow-hidden` to prevent *any* child from causing scrollbars.
      className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      onClick={onClose} // Closes modal if clicked on the backdrop
    >
      <div
        // Inner container for the image and controls.
        // Needs to be relative for absolute positioning of children.
        // Flex for centering the image *if* it doesn't entirely fill the space.
        // `max-w-[100vw]` and `max-h-[100vh]` ensure it doesn't go beyond screen.
        className="relative w-full h-full max-w-[100vw] max-h-[100vh]
                   flex items-center justify-center
                   bg-transparent" // Keep transparent to focus on image.
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking on the content itself
      >
        {/* Actions Container */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center"
            aria-label="Download image"
          >
            <Download className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center"
            aria-label="Close image"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </div>

        {/* The Image */}
        <img
          src={src}
          alt={alt}
          // Absolute positioning, covering its parent entirely.
          // `object-cover` for filling the space (cropping if needed).
          // `inset-0` makes it stretch to all edges of its relative parent.
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Image Title/Alt Text Overlay */}
        {alt && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white text-center text-sm z-10"> {/* Slightly more opaque background */}
            {alt}
          </div>
        )}
      </div>
    </div>
  );
}