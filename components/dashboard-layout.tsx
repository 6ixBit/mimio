"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Video,
  FolderKanban,
  Settings,
  Bell,
  Sparkles,
  LogOut,
  User,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentToggle } from "@/components/environment-toggle";
import { useAuth } from "@/lib/auth-context";
import { CreditBalance } from "@/components/credit-balance";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  // Determine active section from pathname
  const getActiveSection = () => {
    if (pathname === "/app" || pathname === "/app/") return "home";
    if (pathname.startsWith("/app/videos")) return "videos";
    if (pathname.startsWith("/app/projects")) return "projects";
    if (pathname.startsWith("/app/templates")) return "templates";
    if (pathname.startsWith("/app/analyze")) return "analyze";
    if (pathname.startsWith("/app/settings")) return "settings";
    if (pathname.startsWith("/app/create-video")) return "home";
    return "home";
  };

  const activeSection = getActiveSection();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/app" || pathname === "/app/") return "Home";
    if (pathname === "/app/videos") return "Videos";
    if (pathname === "/app/projects") return "Projects";
    if (pathname === "/app/templates") return "Templates";
    if (pathname === "/app/analyze") return "Mimic Video";
    if (pathname === "/app/settings") return "Settings";
    if (pathname === "/app/create-video") return "Create Videos";
    return "Mimio";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-70"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${
          !sidebarCollapsed ? "md:block" : ""
        } flex flex-col`}
      >
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            {sidebarCollapsed ? (
              <img src="/mimio_logo.png" alt="Mimio" className="w-12 h-12" />
            ) : (
              <div className="flex items-center gap-2">
                <img src="/mimio_logo.png" alt="Mimio" className="w-12 h-12" />
                <div>
                  <h1 className="text-primary font-bold text-lg tracking-wider">
                    MIMIO
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    Your creative platform
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-sidebar-foreground hover:text-primary"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>

          <nav className="space-y-2 flex-1">
            {[
              { id: "home", icon: Home, label: "HOME", path: "/app" },
              {
                id: "templates",
                icon: Sparkles,
                label: "AD TEMPLATES",
                path: "/app/templates",
              },
              {
                id: "analyze",
                icon: Wand2,
                label: "MIMIC VIDEO",
                path: "/app/analyze",
              },
              {
                id: "videos",
                icon: Video,
                label: "MY VIDEOS",
                path: "/app/videos",
              },
              {
                id: "projects",
                icon: FolderKanban,
                label: "PROJECTS",
                path: "/app/projects",
              },
              {
                id: "settings",
                icon: Settings,
                label: "SETTINGS",
                path: "/app/settings",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* User Section at Bottom - Logged In */}
          {!sidebarCollapsed && user && (
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {/* Credit Balance & Subscription */}
              <CreditBalance compact={true} />

              {/* User Email */}
              <div className="flex items-center gap-2 px-3 py-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={signOut}
                variant="outline"
                className="w-full border-border hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Log Out</span>
              </Button>
            </div>
          )}

          {/* Login Button - Not Logged In */}
          {!sidebarCollapsed && !user && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Log In</span>
              </Button>
            </div>
          )}

          {/* Collapsed state - logged in */}
          {sidebarCollapsed && user && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={signOut}
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground hover:text-red-600"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Collapsed state - not logged in */}
          {sidebarCollapsed && !user && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                size="icon"
                className="w-full text-primary"
                title="Log In"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}
      >
        {/* Top Toolbar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">
                {getPageTitle()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <EnvironmentToggle />
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background">{children}</div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-6 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 Mimio. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
