import React from "react";
import { SidebarProvider } from "@repo/ui/sidebar";
import { AppSidebar } from "@/components/layouts/AppSideBar";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import AuthProvider from "@/components/providers/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full min-w-0">
          <div className="fixed inset-x-0  w-full z-10">
            <DashboardHeader />
          </div>
          <div className="pt-16 lg:pt-20">{children}</div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
