"use client";

import { useState } from "react";
import {
  ChevronRight,
  Home,
  Video,
  FolderKanban,
  Settings,
  Bell,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentToggle } from "@/components/environment-toggle";
import HomePage from "./home/page";
import VideosPage from "./videos/page";
import ProjectsPage from "./projects/page";
import SettingsPage from "./settings/page";

export default function MimioApp() {
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-70"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${
          !sidebarCollapsed ? "md:block" : ""
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-primary font-bold text-lg tracking-wider">
                MIMIO
              </h1>
              <p className="text-muted-foreground text-xs">
                Your creative platform
              </p>
            </div>
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

          <nav className="space-y-2">
            {[
              { id: "home", icon: Home, label: "HOME" },
              { id: "projects", icon: FolderKanban, label: "PROJECTS" },
              { id: "videos", icon: Video, label: "VIDEOS" },
              { id: "settings", icon: Settings, label: "SETTINGS" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
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

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-card border border-border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs text-foreground font-semibold">
                  ONLINE
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <div>Videos: 24</div>
                <div>Storage: 2.4 GB</div>
                <div>Projects: 8</div>
              </div>
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
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
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

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-background">
          {activeSection === "home" && <HomePage />}
          {activeSection === "projects" && <ProjectsPage />}
          {activeSection === "videos" && <VideosPage />}
          {activeSection === "settings" && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}
