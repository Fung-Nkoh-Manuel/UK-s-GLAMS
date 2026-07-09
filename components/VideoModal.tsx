"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export function VideoModal({ isOpen, src, alt, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex items-center justify-center bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black/50 hover:bg-black/70"
          aria-label="Close video"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Video Player */}
        <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
          <video
            ref={videoRef}
            src={src}
            controls
            autoPlay
            className="w-full h-full object-contain"
            poster={src}
          />
        </div>

        {/* Caption */}
        {alt && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white text-center text-sm z-10">
            {alt}
          </div>
        )}
      </div>
    </div>
  );
}
