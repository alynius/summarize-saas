"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Settings, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800/50 bg-gradient-to-b from-zinc-900/80 to-zinc-950 backdrop-blur-xl">
      {/* Logo/Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/50 px-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10">
          <Zap className="h-4 w-4 text-amber-400" />
        </div>
        <span className="text-lg font-semibold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
          DigestAI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-amber-500/15 to-amber-400/5 text-amber-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              {/* Active state left indicator */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
              )}
              <Icon className={cn("h-4 w-4", isActive && "text-amber-400")} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800/50 p-3">
        <p className="text-xs text-zinc-600 text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
