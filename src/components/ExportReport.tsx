import { useState } from 'react';
import { Download, FileText, FileCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Vulnerability, AnalysisStats, AnalysisMetadata } from '@/types/security';
import { toast } from 'sonner';

interface ExportReportProps {
  vulnerabilities: Vulnerability[];
  stats: AnalysisStats;
  metadata?: AnalysisMetadata;
  disabled?: boolean;
}

export function ExportReport({ vulnerabilities, stats, metadata, disabled }: ExportReportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateMarkdown = (): string => {
    const timestamp = metadata?.timestamp ? new Date(metadata.timestamp).toISOString() : new Date().toISOString();
    
    let md = `# Security Analysis Report\n\n`;
    md += `**Generated:** ${timestamp}\n`;
    md += `**Engine Version:** ${metadata?.engineVersion || '1.0.0'}\n`;
    md += `**Environment:** ${metadata?.environment || 'production'}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Files Scanned | ${stats.filesScanned} |\n`;
    md += `| Lines Analyzed | ${stats.linesScanned.toLocaleString()} |\n`;
    md += `| Total Issues | ${stats.vulnerabilitiesFound} |\n`;
    md += `| Critical | ${stats.severityBreakdown.critical} |\n`;
    md += `| High | ${stats.severityBreakdown.high} |\n`;
    md += `| Medium | ${stats.severityBreakdown.medium} |\n`;
    md += `| Low | ${stats.severityBreakdown.low} |\n\n`;

    if (vulnerabilities.length === 0) {
      md += `## Findings\n\n`;
      md += `✅ No security vulnerabilities detected.\n\n`;
    } else {
      md += `## Findings\n\n`;
      
      const sorted = [...vulnerabilities].sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
      });

      sorted.forEach((v, i) => {
        md += `### ${i + 1}. ${v.title}\n\n`;
        md += `- **Severity:** ${v.severity.toUpperCase()}\n`;
        md += `- **File:** \`${v.file}\`\n`;
        md += `- **Line:** ${v.line}\n`;
        if (v.function) md += `- **Function:** \`${v.function}\`\n`;
        if (v.cweReference) md += `- **CWE:** ${v.cweReference}\n`;
        if (v.owaspCategory) md += `- **OWASP:** ${v.owaspCategory}\n`;
        md += `\n**Description:** ${v.description}\n\n`;
        md += `**Vulnerable Code:**\n\`\`\`\n${v.codeSnippet}\n\`\`\`\n\n`;
        md += `**Secure Refactoring:**\n\`\`\`\n${v.secureRefactoring}\n\`\`\`\n\n`;
        md += `---\n\n`;
      });
    }

    md += `## Disclaimer\n\n`;
    md += `This automated analysis assists security review but does not replace a professional audit. `;
    md += `Results should be verified by a security professional before production deployment.\n`;

    return md;
  };

  const downloadMarkdown = () => {
    setIsExporting(true);
    try {
      const content = generateMarkdown();
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report exported as Markdown');
    } catch {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = () => {
    setIsExporting(true);
    try {
      const report = {
        metadata: {
          generated: new Date().toISOString(),
          engineVersion: metadata?.engineVersion || '1.0.0',
          environment: metadata?.environment || 'production',
        },
        summary: {
          filesScanned: stats.filesScanned,
          linesAnalyzed: stats.linesScanned,
          totalIssues: stats.vulnerabilitiesFound,
          severityBreakdown: stats.severityBreakdown,
        },
        findings: vulnerabilities.map(v => ({
          id: v.id,
          title: v.title,
          severity: v.severity,
          file: v.file,
          line: v.line,
          function: v.function,
          description: v.description,
          codeSnippet: v.codeSnippet,
          secureRefactoring: v.secureRefactoring,
          cweReference: v.cweReference,
          owaspCategory: v.owaspCategory,
          confidenceLevel: v.confidenceLevel,
        })),
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report exported as JSON');
    } catch {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadJSON}>
          <FileCode className="h-4 w-4 mr-2" />
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
