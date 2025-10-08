"use client";

import { Video, Sparkles, Calendar, FolderOpen } from "lucide-react";
import { OptionCard } from "@/components/option-card";

export default function HomePage() {
  const options = [
    {
      id: "create-video",
      icon: Video,
      title: "Create Videos",
      description: "Generate single videos, variations, or batches with AI",
      href: "/create-video",
    },
    {
      id: "my-videos",
      icon: FolderOpen,
      title: "My Videos",
      description: "View and manage all your generated videos",
      href: "/videos",
    },
    {
      id: "templates",
      icon: Sparkles,
      title: "Ad Templates",
      description: "Browse viral ad templates and recreate them",
      href: "/templates",
    },
    {
      id: "projects",
      icon: Calendar,
      title: "Projects",
      description: "Organize your videos into projects",
      href: "/projects",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to Mimio
        </h1>
        <p className="text-muted-foreground">
          AI-powered video generation for your marketing campaigns
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            icon={option.icon}
            title={option.title}
            description={option.description}
            href={option.href}
          />
        ))}
      </div>
    </div>
  );
}
