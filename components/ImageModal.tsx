// components/ImageModal.jsx
import React from 'react';
import { X } from 'lucide-react'; // Make sure lucide-react is installed: npm install lucide-react

export function ImageModal({ src, alt, onClose, isOpen }) {
  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div
      // Overlay for the modal: fixed, full screen, semi-transparent black background
      className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4 cursor-zoom-out"
      // Close the modal when clicking on the dark overlay
      onClick={onClose}
    >
      <div
        // Container for the image: limits its size, adds rounded corners, shadow
        className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        // Prevent clicks on the image itself from closing the modal
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button at the top right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black/50 hover:bg-black/70"
          aria-label="Close image"
        >
          <X className="w-6 h-6" /> {/* 'X' icon from lucide-react */}
        </button>
        {/* The enlarged image */}
        <img
          src={src}
          alt={alt}
          // Make image responsive within its container, keeping aspect ratio
          className="max-w-full max-h-[85vh] object-contain mx-auto"
        />
        {/* Optional: Display image title/alt text at the bottom */}
        {alt && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 text-white text-center text-sm">
            {alt}
          </div>
        )}
      </div>
    </div>
  );
}