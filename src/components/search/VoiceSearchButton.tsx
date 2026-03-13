'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
}

export default function VoiceSearchButton({ onResult }: VoiceSearchButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceSearch();

  useEffect(() => {
    if (transcript) {
      onResult(transcript);
    }
  }, [transcript, onResult]);

  if (!isSupported) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={isListening ? stopListening : startListening}
      className={`flex-shrink-0 p-1.5 rounded-lg transition-colors cursor-pointer ${
        isListening
          ? 'bg-red-500/20 text-red-400'
          : 'text-white/30 hover:text-white/60 hover:bg-white/5'
      }`}
      aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
      title="Voice search"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-red-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
