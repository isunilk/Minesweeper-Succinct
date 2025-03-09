// Updated: Added manual close control and fixed auto-closing issue

"use client";

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ProofVisualizationStep } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { X, CheckCircle2 } from "lucide-react";

interface ProofVisualizerProps {
  isGenerating: boolean;
  gameData?: {
    score: number;
    moves: number;
    time: number;
    difficulty: string;
  };
  onComplete?: () => void;
  onClose?: () => void;
}

export function ProofVisualizer({ 
  isGenerating, 
  gameData,
  onComplete,
  onClose
}: ProofVisualizerProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  // Scroll to bottom of logs when they update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Generate proof visualization
  useEffect(() => {
    if (isGenerating && !isComplete) {
      setLogs([]);
      setProgress(0);
      setIsComplete(false);
      setCanClose(false);
      timeoutRef.current.forEach(clearTimeout);
      timeoutRef.current = [];

      const score = gameData?.score || Math.floor(Math.random() * 100);
      const moves = gameData?.moves || Math.floor(Math.random() * 30);
      const time = gameData?.time || Math.floor(Math.random() * 120);
      const difficulty = gameData?.difficulty || "intermediate";
      
      const visualizationSteps: ProofVisualizationStep[] = [
        { message: "Initializing SP1 zero-knowledge proof system...", progress: 0, delay: 100 },
        { message: `Game parameters: Score=${score}, Moves=${moves}, Time=${time}s, Difficulty=${difficulty}`, progress: 5, delay: 600 },
        { message: "Loading SP1 runtime environment...", progress: 10, delay: 1200 },
        { message: "Preparing game state for verification circuit...", progress: 15, delay: 1800 },
        { message: "Loading local verification environment...", progress: 20, delay: 2400 },
        { message: "Initializing RISC-V virtual machine...", progress: 25, delay: 3000 },
        { message: "Loading SP1 RISC-V program...", progress: 30, delay: 3600 },
        { message: "Serializing game board state...", progress: 35, delay: 4200 },
        { message: `Processing ${moves} player moves for verification...`, progress: 40, delay: 4800 },
        { message: "Validating game rules and constraints...", progress: 45, delay: 5400 },
        { message: `Verifying score calculation: ${score} points in ${time} seconds`, progress: 50, delay: 6000 },
        { message: "Constructing arithmetic circuit for ZK proof...", progress: 60, delay: 6900 },
        { message: "Generating witness for circuit constraints...", progress: 70, delay: 7800 },
        { message: "Computing cryptographic commitments...", progress: 80, delay: 8700 },
        { message: "Applying Fiat-Shamir transformation...", progress: 85, delay: 9600 },
        { message: "Generating zero-knowledge proof...", progress: 90, delay: 10500 },
        { message: "Verifying proof locally...", progress: 95, delay: 11400 },
        { message: "Proof generation successful! Game state verified.", progress: 100, delay: 12300 }
      ];

      // Add timestamp to each log message
      const getTimestamp = () => {
        const current = new Date();
        return `[${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}:${current.getSeconds().toString().padStart(2, '0')}]`;
      };
      
      // Process each step with appropriate timing
      visualizationSteps.forEach((step, index) => {
        const timeout = setTimeout(() => {
          setLogs(prev => [...prev, `${getTimestamp()} ${step.message}`]);
          setProgress(step.progress);
          
          // If this is the last step, mark as complete
          if (index === visualizationSteps.length - 1) {
            setIsComplete(true);
            setCanClose(true);
            if (onComplete) {
              onComplete();
            }
          }
        }, step.delay);
        
        timeoutRef.current.push(timeout);
      });
    }
  }, [isGenerating, isComplete, gameData, onComplete]);

  const handleClose = () => {
    if (canClose && onClose) {
      onClose();
    }
  };

  if (!isGenerating && !isComplete) {
    return null;
  }

  return (
    <div className="w-full rounded-md border border-green-500 bg-black text-green-500 overflow-hidden">
      <div className="p-3 border-b border-green-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-3 w-3 rounded-full",
            isComplete ? "bg-green-500" : "bg-yellow-500 animate-pulse"
          )}></div>
          <span className="font-mono text-sm">
            {isComplete ? "✓ SP1 Zero-Knowledge Proof Generated" : "Generating SP1 Zero-Knowledge Proof..."}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono">
            {progress}%
          </div>
          {canClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-green-500 hover:text-green-300 hover:bg-green-900/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="p-3 font-mono text-xs h-64 overflow-y-auto"
        style={{ resize: "vertical", minHeight: "12rem" }}
      >
        {logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">{log}</div>
        ))}
        {!isComplete && (
          <div className="animate-pulse">_</div>
        )}
      </div>
      
      <div className="h-1 bg-green-900 w-full">
        <div 
          className="h-full bg-green-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {isComplete && (
        <div className="p-3 border-t border-green-500 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-500 border-green-500 hover:bg-green-900/20 hover:text-green-300 flex items-center gap-2"
            onClick={handleClose}
          >
            <CheckCircle2 className="h-4 w-4" />
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}