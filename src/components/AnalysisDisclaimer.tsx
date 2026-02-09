import { Info, Clock, Cpu } from 'lucide-react';
import { AnalysisMetadata } from '@/types/security';

interface AnalysisDisclaimerProps {
  metadata?: AnalysisMetadata;
  showVersioning?: boolean;
}

export function AnalysisDisclaimer({ metadata, showVersioning = true }: AnalysisDisclaimerProps) {
  const formatTimestamp = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  };

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
      {/* Disclaimer */}
      <div className="flex items-start gap-3">
        <Info className="h-4 w-4 text-status-info mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This tool assists security review but <strong>does not replace a professional audit</strong>. 
          Results should be verified by a security professional before production deployment.
        </p>
      </div>

      {/* Versioning info */}
      {showVersioning && metadata && (
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Engine v{metadata.engineVersion}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimestamp(metadata.timestamp)}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {metadata.environment}
          </span>
        </div>
      )}
    </div>
  );
}
