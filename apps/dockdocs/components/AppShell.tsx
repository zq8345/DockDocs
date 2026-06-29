"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  // 内部控制台 + 工作台：全屏无壳——不显示站点页眉、页脚和语言切换，自成一页
  if (pathname.includes("/internal/") || pathname.startsWith("/workspace")) {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="min-w-0 flex-1">{children}</div>
      <Footer />
    </div>
  );
}
