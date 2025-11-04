"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { storage } from "@/lib/services/storage";
import { HardDrive } from "lucide-react";

export function StorageQuotaIndicator() {
  const [quota, setQuota] = useState({ used: 0, available: 0 });

  useEffect(() => {
    const updateQuota = () => {
      setQuota(storage.checkQuota());
    };
    updateQuota();
    // Update every 30 seconds
    const interval = setInterval(updateQuota, 30000);
    return () => clearInterval(interval);
  }, []);

  const usedMB = (quota.used / 1024 / 1024).toFixed(2);
  const availableMB = (quota.available / 1024 / 1024).toFixed(2);
  const percentUsed = (quota.used / quota.available) * 100;
  const isWarning = percentUsed > 70;

  return (
    <Card className={isWarning ? 'border-yellow-500/50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <HardDrive className={`h-5 w-5 ${isWarning ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Storage</span>
              <span className="text-muted-foreground">
                {usedMB} MB / {availableMB} MB
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isWarning ? 'bg-yellow-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
          </div>
        </div>
        {isWarning && (
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
            Storage is {percentUsed.toFixed(0)}% full. Consider deleting old prescriptions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
