'use client';

import { useState } from 'react';
import VoiceSearchButton from './VoiceSearchButton';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 glass rounded-xl px-4 py-3 transition-all duration-200 ${
        focused ? 'ring-2 ring-white/20' : ''
      }`}
    >
      {/* Search icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/40 flex-shrink-0"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search by name or number..."
        className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm"
        aria-label="Search Pokemon"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="text-white/30 hover:text-white/60 transition-colors"
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      <VoiceSearchButton onResult={onChange} />
    </div>
  );
}
