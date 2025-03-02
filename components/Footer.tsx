// Updated: Centered footer text

"use client";

import Link from "next/link";
import { Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-center">
        <p className="text-center">
          Made with <span className="text-red-500">♥</span> by{" "}
          <Link 
            href="https://twitter.com/isunilx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-highlight inline-flex items-center gap-1 hover:underline"
          >
            @isunilx <Twitter className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </footer>
  );
}