'use client';

export default function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 w-16 bg-white/10 rounded" />
        <div className="h-6 w-6 bg-white/10 rounded-full" />
      </div>
      <div className="flex justify-center my-4">
        <div className="w-28 h-28 bg-white/10 rounded-full" />
      </div>
      <div className="h-5 w-24 bg-white/10 rounded mx-auto mb-3" />
      <div className="flex gap-2 justify-center">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}
