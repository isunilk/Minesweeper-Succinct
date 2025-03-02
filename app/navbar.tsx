// Updated: Increased logo size and improved navbar styling
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Info, Trophy } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/succinct-arcade-logo.svg" 
              alt="Succinct Arcade Logo" 
              width={64} 
              height={64} 
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Link href="/about">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>About</span>
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}