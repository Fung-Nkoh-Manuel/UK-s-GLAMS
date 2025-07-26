// components/ImageModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export function ImageModal({ src, alt, onClose, isOpen }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 cursor-zoom-out overflow-hidden" // Added overflow-hidden to the main overlay
      onClick={onClose}
    >
      <div
        // This container needs to manage its own width strictly
        className="relative w-full max-w-full h-full max-h-[100vh] bg-transparent flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black/50 hover:bg-black/70"
          aria-label="Close image"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={src}
          alt={alt}
          // The image itself should fill its *constrained* parent
          className="w-full h-full object-cover" // Ensure it covers the full width/height of its parent
        />

        {alt && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-center text-sm opacity-90">
            {alt}
          </div>
        )}
      </div>
    </div>
  );
}