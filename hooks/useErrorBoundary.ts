// Created: Custom hook for error handling and debugging
"use client";

import { useState, useCallback } from 'react';

export function useErrorBoundary() {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, setError, clearError };
}