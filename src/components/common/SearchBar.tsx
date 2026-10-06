"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  onOpenFilter?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  onOpenFilter,
  placeholder = "Search locality, landmark, or PG name...",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 w-full glass-panel rounded-2xl p-2 border border-slate-800 ${className}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 border-none bg-transparent focus-visible:ring-0 text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {onOpenFilter && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenFilter}
          className="gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      )}

      <Button type="submit" size="sm" className="gap-1.5 shrink-0">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
