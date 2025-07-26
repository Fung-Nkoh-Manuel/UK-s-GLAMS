// components/ImageModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export function ImageModal({ src, alt, onClose, isOpen }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 cursor-zoom-out" // Reduced padding on mobile (p-2)
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-transparent rounded-lg overflow-hidden flex items-center justify-center" // Changed bg to transparent, centered items
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black/50 hover:bg-black/70" // Adjusted button position for smaller screens
          aria-label="Close image"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={src}
          alt={alt}
          // IMPORTANT: Ensure the image itself scales within the available space
          className="max-w-full max-h-[calc(100vh-60px)] object-contain mx-auto my-auto" // Dynamic height calculation, use my-auto for vertical centering
        />
        {alt && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-center text-sm opacity-90"> {/* Reduced padding, fixed opacity */}
            {alt}
          </div>
        )}
      </div>
    </div>
  );
}