"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Content Container */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 z-10 animate-in zoom-in-95 duration-200",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Close Dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <h3 className="text-xl font-bold text-white tracking-tight pr-8">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-400 mt-1 mb-4">{description}</p>
        )}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
