'use client';

import { useState, useRef, useCallback } from 'react';

interface UseAudioPlayerReturn {
  play: (url: string) => void;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const play = useCallback((url: string) => {
    stop();

    const audio = new Audio(url);
    audioRef.current = audio;
    setIsLoading(true);

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      setIsPlaying(true);
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    };

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.load();
  }, [stop]);

  return { play, stop, isPlaying, isLoading };
}
