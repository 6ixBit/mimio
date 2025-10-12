"use client";

import { Video, Sparkles, Wand2 } from "lucide-react";
import { OptionCard } from "@/components/option-card";
import { ProtectedRoute } from "@/components/protected-route";

export default function HomePage() {
  const options = [
    {
      id: "create-video",
      icon: Video,
      title: "Create Videos",
      description: "Generate single videos, variations, or batches with AI",
      href: "/app/create-video",
    },
    {
      id: "mimic-video",
      icon: Wand2,
      title: "Mimic Videos",
      description: "Upload viral videos and recreate them for your brand",
      href: "/app/analyze",
    },
    {
      id: "templates",
      icon: Sparkles,
      title: "Ad Templates",
      description: "Browse viral ad templates and recreate them",
      href: "/app/templates",
    },
  ];

  return (
    <ProtectedRoute>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
    </ProtectedRoute>
  );
}
