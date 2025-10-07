"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  apiConfig,
  getCurrentEnvironment,
  toggleEnvironment,
  type Environment,
} from "@/lib/api-config";
import { RefreshCw } from "lucide-react";

export function EnvironmentToggle() {
  const [environment, setEnvironment] = useState<Environment>("local");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEnvironment(getCurrentEnvironment());
  }, []);

  const handleToggle = () => {
    const newEnv = toggleEnvironment();
    setEnvironment(newEnv);
    // Force a small visual feedback
    window.location.reload();
  };

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  const isLocal = environment === "local";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="h-8 px-3 hover:bg-primary/10"
        title="Toggle API Environment"
      >
        <RefreshCw className="w-3 h-3 mr-2" />
        <span className="text-xs">API:</span>
      </Button>
      <Badge
        variant={isLocal ? "default" : "outline"}
        className={`cursor-pointer ${
          isLocal
            ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
            : "bg-primary/20 text-primary hover:bg-primary/30"
        }`}
        onClick={handleToggle}
      >
        {isLocal ? "🟢 Local" : "🌐 Production"}
      </Badge>
    </div>
  );
}
