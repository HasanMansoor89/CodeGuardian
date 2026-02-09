import { Shield, FileText, AlertTriangle, CheckCircle, Layers } from 'lucide-react';
import { AnalysisStats, Severity } from '@/types/security';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SecuritySummaryProps {
  stats: AnalysisStats;
  isAnalyzing: boolean;
  overallRisk?: Severity;
}

export function SecuritySummary({ stats, isAnalyzing, overallRisk }: SecuritySummaryProps) {
  const getRiskLevel = (): Severity => {
    if (overallRisk) return overallRisk;
    if (stats.severityBreakdown.critical > 0) return 'critical';
    if (stats.severityBreakdown.high > 0) return 'high';
    if (stats.severityBreakdown.medium > 0) return 'medium';
    return 'low';
  };

  const risk = getRiskLevel();
  const riskLabels: Record<Severity, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };

  const progressPercent = stats.totalFiles > 0 
    ? Math.round((stats.filesScanned / stats.totalFiles) * 100) 
    : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Security Summary</h2>
            <p className="text-sm text-muted-foreground">
              {isAnalyzing 
                ? stats.totalBatches > 1 
                  ? `Batch ${stats.currentBatch} of ${stats.totalBatches}` 
                  : 'Analysis in progress...'
                : 'Analysis complete'}
            </p>
          </div>
        </div>
        {stats.vulnerabilitiesFound > 0 && (
          <Badge variant={risk}>
            {riskLabels[risk]}
          </Badge>
        )}
        {stats.vulnerabilitiesFound === 0 && !isAnalyzing && stats.filesScanned > 0 && (
          <Badge variant="secure">
            <CheckCircle className="mr-1 h-3 w-3" />
            Secure
          </Badge>
        )}
      </div>

      {isAnalyzing && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Scanning {stats.totalFiles} files...
            </span>
            <span className="text-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.filesScanned} of {stats.totalFiles} files analyzed</span>
            {stats.vulnerabilitiesFound > 0 && (
              <span className="text-severity-medium">{stats.vulnerabilitiesFound} issues found so far</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total Files</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalFiles || stats.filesScanned}</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Scanned</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.filesScanned}</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Issues</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.vulnerabilitiesFound}</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wide">Lines</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.linesScanned.toLocaleString()}</p>
        </div>
      </div>

      {(stats.vulnerabilitiesFound > 0 || isAnalyzing) && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium text-foreground">Severity Breakdown</h3>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-severity-critical/30 bg-severity-critical/10 p-3 text-center">
              <p className="text-lg font-bold text-severity-critical">{stats.severityBreakdown.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="flex-1 rounded-lg border border-severity-high/30 bg-severity-high/10 p-3 text-center">
              <p className="text-lg font-bold text-severity-high">{stats.severityBreakdown.high}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
            <div className="flex-1 rounded-lg border border-severity-medium/30 bg-severity-medium/10 p-3 text-center">
              <p className="text-lg font-bold text-severity-medium">{stats.severityBreakdown.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="flex-1 rounded-lg border border-severity-low/30 bg-severity-low/10 p-3 text-center">
              <p className="text-lg font-bold text-severity-low">{stats.severityBreakdown.low}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
