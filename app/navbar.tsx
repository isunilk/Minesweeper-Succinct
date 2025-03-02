// Updated: Changed logo from PNG file and removed theme toggle

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Info, Trophy } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-32 h-12">
              <Image 
                src="/succinct-arcade-logo.png" 
                alt="Succinct Arcade Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
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
          </nav>
        </div>
      </div>
    </header>
  );
}