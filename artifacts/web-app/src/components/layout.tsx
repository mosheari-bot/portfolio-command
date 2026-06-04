import React from "react";
import { Link } from "wouter";
import { Terminal } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <header className="h-14 border-b border-border/50 px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10 relative">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Terminal className="w-5 h-5" />
          <span className="font-bold tracking-tight font-mono">CREATE_REPL</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/repls/new" 
            className="text-xs font-mono font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
          >
            + NEW_REPL
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
