// Created: Custom hook for game timer functionality
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return { time, start, stop, reset, isRunning };
}