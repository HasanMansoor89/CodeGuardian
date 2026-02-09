import { useState, useMemo, useRef, useEffect } from 'react';
import { Github, Lock, Zap, FileSearch, ChevronDown, ChevronUp } from 'lucide-react';
import { CodeInput } from '@/components/CodeInput';
import { ExplanationToggle } from '@/components/ExplanationToggle';
import { SecuritySummary } from '@/components/SecuritySummary';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { LiveStats } from '@/components/LiveStats';
import { VulnerabilityFilters } from '@/components/VulnerabilityFilters';
import { AnalysisDisclaimer } from '@/components/AnalysisDisclaimer';
import { ExportReport } from '@/components/ExportReport';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Button } from '@/components/ui/button';
import { useSecurityAnalysis } from '@/hooks/useSecurityAnalysis';
import { ExplanationLevel, CodeFile, SeverityFilter, AnalysisMetadata } from '@/types/security';

const Index = () => {
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('beginner');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>({
    low: true, medium: true, high: true, critical: true
  });
  const [fileFilter, setFileFilter] = useState<string | null>(null);
  const [currentVulnIndex, setCurrentVulnIndex] = useState(0);
  const [analysisMetadata, setAnalysisMetadata] = useState<AnalysisMetadata | undefined>();
  const vulnListRef = useRef<HTMLDivElement>(null);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_token') || '');

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleGithubTokenChange = (token: string) => {
    setGithubToken(token);
    localStorage.setItem('github_token', token);
  };

  const { isAnalyzing, vulnerabilities, stats, overallRisk, analyzeCode, reset } = useSecurityAnalysis();

  // Filter vulnerabilities
  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter(v => {
      if (!severityFilter[v.severity]) return false;
      if (fileFilter && v.file !== fileFilter) return false;
      return true;
    });
  }, [vulnerabilities, severityFilter, fileFilter]);

  // Sort by severity (critical first)
  const sortedVulnerabilities = useMemo(() => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...filteredVulnerabilities].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [filteredVulnerabilities]);

  const handleAnalyze = (files: CodeFile[]) => {
    if (!apiKey) {
      alert("Please configure your Google Gemini API Key in Settings (gear icon) to proceed.");
      return;
    }

    setExpandedCards(new Set());
    setCurrentVulnIndex(0);
    setSeverityFilter({ low: true, medium: true, high: true, critical: true });
    setFileFilter(null);
    setAnalysisMetadata({
      engineVersion: '1.0.0',
      timestamp: Date.now(),
      environment: 'production',
    });
    analyzeCode(files, explanationLevel, apiKey);
  };

  const handleClear = () => {
    setExpandedCards(new Set());
    setCurrentVulnIndex(0);
    setAnalysisMetadata(undefined);
    reset();
  };

  // Auto-expand the first critical/high vulnerability
  const autoExpandedId = useMemo(() => {
    if (sortedVulnerabilities.length > 0 && expandedCards.size === 0 && !isAnalyzing) {
      const critical = sortedVulnerabilities.find(v => v.severity === 'critical');
      const high = sortedVulnerabilities.find(v => v.severity === 'high');
      return critical?.id || high?.id || sortedVulnerabilities[0]?.id;
    }
    return null;
  }, [sortedVulnerabilities, expandedCards.size, isAnalyzing]);

  const isCardExpanded = (id: string) => {
    return expandedCards.has(id) || id === autoExpandedId;
  };

  const toggleCard = (id: string, isOpen: boolean) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      if (autoExpandedId && !prev.has(autoExpandedId)) {
        if (isOpen && id !== autoExpandedId) {
          next.add(id);
        }
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCards(new Set(sortedVulnerabilities.map(v => v.id)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? Math.max(0, currentVulnIndex - 1)
      : Math.min(sortedVulnerabilities.length - 1, currentVulnIndex + 1);

    setCurrentVulnIndex(newIndex);

    // Expand the target card and scroll to it
    const targetVuln = sortedVulnerabilities[newIndex];
    if (targetVuln) {
      setExpandedCards(prev => new Set([...prev, targetVuln.id]));

      // Scroll to the card
      setTimeout(() => {
        const element = document.getElementById(`vuln-${targetVuln.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const allExpanded = sortedVulnerabilities.length > 0 && expandedCards.size === sortedVulnerabilities.length;
  const hasResults = stats.filesScanned > 0 || stats.vulnerabilitiesFound > 0 || isAnalyzing;

  return (
    <div className="min-h-screen gradient-security">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <img src="/logo.svg" alt="Code Guardian Logo" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SecureCode AI</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Security Review</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExplanationToggle level={explanationLevel} onToggle={setExplanationLevel} />
            <SettingsDialog
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
              githubToken={githubToken}
              onGithubTokenChange={handleGithubTokenChange}
            />
            {hasResults && !isAnalyzing && (
              <ExportReport
                vulnerabilities={vulnerabilities}
                stats={stats}
                metadata={analysisMetadata}
                disabled={isAnalyzing}
              />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Only show when no results */}
      {!hasResults && (
        <section className="container mx-auto px-6 py-16 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Lock className="h-4 w-4" />
              Production-Grade Security Analysis
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Find Security Vulnerabilities
              <span className="block text-primary">Before Attackers Do</span>
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              AI-powered code review that detects real security issues with line-by-line explanations.
              Built for developers who care about security.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                Hardcoded Secrets
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                SQL Injection
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Auth Flaws
              </div>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-primary" />
                Input Validation
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className={`grid gap-8 ${hasResults ? 'lg:grid-cols-3' : 'mx-auto max-w-3xl'}`}>
          {/* Left Column - Input */}
          <div className={hasResults ? 'lg:col-span-1' : ''}>
            <CodeInput
              onSubmit={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onClear={handleClear}
              githubToken={githubToken}
            />
          </div>

          {/* Right Columns - Results */}
          {hasResults && (
            <div className="space-y-6 lg:col-span-2">
              {/* Summary */}
              <SecuritySummary
                stats={stats}
                isAnalyzing={isAnalyzing}
                overallRisk={overallRisk}
              />

              {/* Disclaimer */}
              <AnalysisDisclaimer metadata={analysisMetadata} showVersioning={!isAnalyzing} />

              {/* Two column layout for findings and stats */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Findings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Vulnerability Findings
                      {sortedVulnerabilities.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({sortedVulnerabilities.length}{filteredVulnerabilities.length !== vulnerabilities.length ? ` of ${vulnerabilities.length}` : ''})
                        </span>
                      )}
                    </h3>
                    {sortedVulnerabilities.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={allExpanded ? collapseAll : expandAll}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {allExpanded ? (
                          <>
                            <ChevronUp className="mr-1 h-3 w-3" />
                            Collapse All
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-1 h-3 w-3" />
                            Expand All
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Filters */}
                  {vulnerabilities.length > 0 && (
                    <VulnerabilityFilters
                      vulnerabilities={vulnerabilities}
                      severityFilter={severityFilter}
                      onSeverityFilterChange={setSeverityFilter}
                      fileFilter={fileFilter}
                      onFileFilterChange={setFileFilter}
                      currentIndex={currentVulnIndex}
                      onNavigate={handleNavigate}
                      totalVisible={sortedVulnerabilities.length}
                    />
                  )}

                  {sortedVulnerabilities.length === 0 && isAnalyzing && (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileSearch className="h-6 w-6 animate-pulse text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Scanning for vulnerabilities...</p>
                    </div>
                  )}

                  {sortedVulnerabilities.length === 0 && !isAnalyzing && stats.filesScanned > 0 && (
                    <div className="rounded-lg border border-status-secure/30 bg-status-secure/10 p-8 text-center">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-status-secure/20">
                        <Lock className="h-6 w-6 text-status-secure" />
                      </div>
                      <p className="font-medium text-foreground">
                        {vulnerabilities.length === 0 ? 'No Vulnerabilities Detected' : 'No Matching Vulnerabilities'}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {vulnerabilities.length === 0
                          ? "No security vulnerabilities were identified based on the current analysis. This doesn't guarantee the code is secure—manual review is still recommended."
                          : 'Try adjusting your filters to see more results.'}
                      </p>
                    </div>
                  )}

                  <div ref={vulnListRef} className="max-h-[600px] space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                    {sortedVulnerabilities.map((vuln) => (
                      <div key={vuln.id} id={`vuln-${vuln.id}`}>
                        <VulnerabilityCard
                          vulnerability={vuln}
                          explanationLevel={explanationLevel}
                          isOpen={isCardExpanded(vuln.id)}
                          onToggle={(isOpen) => toggleCard(vuln.id, isOpen)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Stats */}
                <div>
                  <LiveStats vulnerabilities={sortedVulnerabilities} isAnalyzing={isAnalyzing} stats={stats} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>SecureCode AI — Professional security review for modern developers</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
