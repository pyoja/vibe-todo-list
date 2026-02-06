"use client";

import dynamic from "next/dynamic";
import { SidebarProps } from "./sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

const MobileSidebarComponent = dynamic(
  () => import("./sidebar").then((mod) => mod.MobileSidebar),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="w-5 h-5" />
      </Button>
    ),
  },
);

export function MobileSidebarClient(props: SidebarProps) {
  return <MobileSidebarComponent {...props} />;
}
