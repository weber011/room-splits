export default function Loading() {
  return (
    <div className="min-h-[70vh] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-b-cyan-400 animate-spin opacity-70" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-200 tracking-wide">Loading RoomSplits...</p>
        <p className="text-xs text-slate-500">Fetching verified PG & co-living options</p>
      </div>
    </div>
  );
}
