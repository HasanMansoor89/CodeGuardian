import { FileCode, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { FileProgress, FileStatus } from '@/types/security';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FileStatusListProps {
  files: FileProgress[];
  maxHeight?: string;
}

const statusConfig: Record<FileStatus, { icon: typeof Clock; className: string; label: string }> = {
  queued: { icon: Clock, className: 'text-muted-foreground', label: 'Queued' },
  analyzing: { icon: Loader2, className: 'text-primary animate-spin', label: 'Analyzing' },
  skipped: { icon: AlertCircle, className: 'text-severity-medium', label: 'Skipped' },
  completed: { icon: CheckCircle, className: 'text-status-secure', label: 'Completed' },
};

export function FileStatusList({ files, maxHeight = '200px' }: FileStatusListProps) {
  if (files.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileCode className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-foreground">File Status</h4>
        <span className="text-xs text-muted-foreground ml-auto">
          {files.filter(f => f.status === 'completed').length}/{files.length} complete
        </span>
      </div>
      <ScrollArea style={{ maxHeight }} className="pr-2">
        <div className="space-y-1">
          {files.map((file) => {
            const { icon: Icon, className, label } = statusConfig[file.status];
            return (
              <div
                key={file.name}
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/30 transition-colors"
              >
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${className}`} />
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{label}</p>
                      {file.skippedReason && (
                        <p className="text-xs text-muted-foreground mt-1">{file.skippedReason}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="truncate font-mono text-xs text-foreground flex-1">
                  {file.name}
                </span>
                {file.linesScanned !== undefined && file.status === 'completed' && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {file.linesScanned} lines
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
