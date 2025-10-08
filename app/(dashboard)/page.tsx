"use client";

import { Video, Copy, Sparkles } from "lucide-react";
import { OptionCard } from "@/components/option-card";

export default function HomePage() {
  const options = [
    {
      id: "create-video",
      icon: Video,
      title: "Create a Video",
      description: "Generate a single video from your content",
      href: "/create-video",
    },
    {
      id: "create-multiple",
      icon: Copy,
      title: "Create Multiple Videos",
      description: "Generate multiple videos at once",
      href: "/create-multiple",
    },
    {
      id: "create-variations",
      icon: Sparkles,
      title: "Create Variations",
      description: "Create different variations of one video",
      href: "/create-variations",
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
          Choose how you want to create your videos
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
