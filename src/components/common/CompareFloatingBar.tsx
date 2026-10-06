"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, X, ArrowRight } from "lucide-react";
import { Property } from "@/types";

export interface CompareFloatingBarProps {
  comparedProperties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function CompareFloatingBar({
  comparedProperties,
  onRemove,
  onClear,
}: CompareFloatingBarProps) {
  if (comparedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="glass-panel rounded-2xl p-4 border border-emerald-500/40 shadow-2xl bg-slate-900/95 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Comparing {comparedProperties.length} Properties
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {comparedProperties.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded-md border border-slate-700"
                >
                  <span className="truncate max-w-[90px]">{p.title}</span>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-slate-200 hidden sm:inline"
          >
            Clear
          </button>
          <Link href="/compare">
            <Button size="sm" className="gap-1.5">
              <span>Compare</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
