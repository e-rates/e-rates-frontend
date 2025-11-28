'use client';

import { useEffect, useState } from 'react';
import { syncService, SyncStatus } from '@/lib/db/sync';
import { RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: 0,
    progress: 0,
  });

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setStatus);
    syncService
      .getLastSync()
      .then((lastSync) => setStatus((prev) => ({ ...prev, lastSync })));
    return unsubscribe;
  }, []);

  const handleSync = () => {
    syncService.fullSync(true);
  };

  const getTimeAgo = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Database className="text-muted-foreground h-4 w-4" />

      {status.isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-blue-500">Syncing... {status.progress}%</span>
        </>
      ) : status.error ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Sync failed</span>
          <Button size="sm" variant="outline" onClick={handleSync}>
            Retry
          </Button>
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">
            {getTimeAgo(status.lastSync)}
          </span>
          <Button size="sm" variant="ghost" onClick={handleSync}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
