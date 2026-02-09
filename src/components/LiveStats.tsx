import { BarChart3, FileWarning, Zap, Activity, TrendingUp, Shield } from 'lucide-react';
import { Vulnerability, AnalysisStats, Severity } from '@/types/security';

interface LiveStatsProps {
  vulnerabilities: Vulnerability[];
  isAnalyzing: boolean;
  stats?: AnalysisStats;
}

// OWASP Top 10 category mapping
const owaspCategories: Record<string, string> = {
  'A01': 'Broken Access Control',
  'A02': 'Cryptographic Failures',
  'A03': 'Injection',
  'A04': 'Insecure Design',
  'A05': 'Security Misconfiguration',
  'A06': 'Vulnerable Components',
  'A07': 'Auth Failures',
  'A08': 'Data Integrity Failures',
  'A09': 'Security Logging Failures',
  'A10': 'SSRF',
};

export function LiveStats({ vulnerabilities, isAnalyzing, stats }: LiveStatsProps) {
  // Calculate most affected files
  const fileVulnCounts = vulnerabilities.reduce((acc, v) => {
    acc[v.file] = (acc[v.file] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedFiles = Object.entries(fileVulnCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get high-risk entry points (high/critical with high exploit likelihood)
  const highRiskEntries = vulnerabilities
    .filter(v => 
      (v.severity === 'high' || v.severity === 'critical') && 
      v.exploitLikelihood === 'high'
    )
    .slice(0, 5);

  // Calculate OWASP category distribution
  const owaspDistribution = vulnerabilities.reduce((acc, v) => {
    if (v.owaspCategory) {
      const category = v.owaspCategory.split(':')[0] || v.owaspCategory;
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedOwasp = Object.entries(owaspDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Confidence breakdown
  const confidenceBreakdown = vulnerabilities.reduce((acc, v) => {
    const level = v.confidenceLevel || 'medium';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live Statistics</h2>
          <p className="text-sm text-muted-foreground">
            {isAnalyzing ? 'Updating in real-time...' : 'Final analysis results'}
          </p>
        </div>
        {isAnalyzing && (
          <div className="ml-auto flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            <span className="text-xs text-primary">Live</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Analysis Activity */}
        {isAnalyzing && stats && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">Analysis Activity</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.filesScanned}</p>
                <p className="text-xs text-muted-foreground">Files Analyzed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-severity-medium">{stats.vulnerabilitiesFound}</p>
                <p className="text-xs text-muted-foreground">Issues Found</p>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Breakdown */}
        {vulnerabilities.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Confidence Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-status-secure/10 border border-status-secure/30 p-2">
                <p className="text-lg font-bold text-status-secure">{confidenceBreakdown.high || 0}</p>
                <p className="text-[10px] text-muted-foreground">High</p>
              </div>
              <div className="rounded-lg bg-severity-medium/10 border border-severity-medium/30 p-2">
                <p className="text-lg font-bold text-severity-medium">{confidenceBreakdown.medium || 0}</p>
                <p className="text-[10px] text-muted-foreground">Medium</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-2">
                <p className="text-lg font-bold text-muted-foreground">{confidenceBreakdown.low || 0}</p>
                <p className="text-[10px] text-muted-foreground">Needs Review</p>
              </div>
            </div>
          </div>
        )}

        {/* OWASP Categories */}
        {sortedOwasp.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-status-info" />
              OWASP Top 10 Categories
            </h3>
            <div className="space-y-2">
              {sortedOwasp.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between rounded-lg bg-status-info/5 border border-status-info/20 px-3 py-2">
                  <span className="text-xs text-foreground">
                    <span className="font-mono text-status-info">{category}</span>
                    <span className="text-muted-foreground ml-2">{owaspCategories[category] || category}</span>
                  </span>
                  <span className="text-xs font-medium text-status-info">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Affected Files */}
        {sortedFiles.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <FileWarning className="h-4 w-4 text-severity-medium" />
              Most Affected Files
            </h3>
            <div className="space-y-2">
              {sortedFiles.map(([file, count]) => (
                <div key={file} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="truncate font-mono text-sm text-foreground">{file}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-severity-medium/20 px-2 py-0.5 text-xs font-medium text-severity-medium">
                    {count} {count === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-Risk Entry Points */}
        {highRiskEntries.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Zap className="h-4 w-4 text-severity-high" />
              High-Risk Entry Points
            </h3>
            <div className="space-y-2">
              {highRiskEntries.map((v) => (
                <div key={v.id} className="rounded-lg border border-severity-high/20 bg-severity-high/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{v.title}</span>
                    <span className="text-xs text-severity-high">Line {v.line}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{v.file}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {vulnerabilities.length === 0 && isAnalyzing && !stats && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Analyzing code for vulnerabilities...</p>
          </div>
        )}

        {vulnerabilities.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">No vulnerabilities detected</p>
            <p className="text-xs mt-1">Manual review is still recommended</p>
          </div>
        )}
      </div>
    </div>
  );
}
