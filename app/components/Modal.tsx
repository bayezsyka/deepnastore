"use client";

import type { ReactNode } from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur effect */}
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all"
        onClick={onClose}
        aria-label="Close"
      />
      
      {/* Modal content - responsive: portrait on mobile, landscape on desktop */}
      <div className="relative w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-2xl border border-white/20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex items-center justify-between gap-4">
          <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FD7979] to-[#FFCDC9]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-2 text-gray-400 hover:text-[#FD7979] hover:bg-[#FD7979]/10 transition-all duration-300 hover:scale-110"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-4 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
