"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Copy, Layers } from "lucide-react";

interface CreationModeTabsProps {
  children: {
    single: React.ReactNode;
    variations: React.ReactNode;
    batch: React.ReactNode;
  };
}

export function CreationModeTabs({ children }: CreationModeTabsProps) {
  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="single" className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          <span className="hidden sm:inline">Single Video</span>
          <span className="sm:hidden">Single</span>
        </TabsTrigger>
        <TabsTrigger value="variations" className="flex items-center gap-2">
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Variations</span>
          <span className="sm:hidden">Vary</span>
        </TabsTrigger>
        <TabsTrigger value="batch" className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Batch Create</span>
          <span className="sm:hidden">Batch</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="space-y-6">
        {children.single}
      </TabsContent>

      <TabsContent value="variations" className="space-y-6">
        {children.variations}
      </TabsContent>

      <TabsContent value="batch" className="space-y-6">
        {children.batch}
      </TabsContent>
    </Tabs>
  );
}

