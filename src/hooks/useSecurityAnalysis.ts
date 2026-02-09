import { useState, useCallback, useRef } from 'react';
import {
  CodeFile,
  Vulnerability,
  AnalysisStats,
  ExplanationLevel,
  AnalysisEvent,
  Severity
} from '@/types/security';
import { toast } from 'sonner';

const ANALYZE_URL = '/api/security-analyze';
const BATCH_SIZE = 10; // Process 10 files at a time for speed

export function useSecurityAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [overallRisk, setOverallRisk] = useState<Severity | undefined>();
  const [stats, setStats] = useState<AnalysisStats>({
    filesScanned: 0,
    linesScanned: 0,
    vulnerabilitiesFound: 0,
    totalFiles: 0,
    currentBatch: 0,
    totalBatches: 0,
    severityBreakdown: { low: 0, medium: 0, high: 0, critical: 0 },
  });
  const vulnIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAnalysisEvent = useCallback((event: AnalysisEvent) => {
    if (event.type === 'vulnerability') {
      const vuln: Vulnerability = {
        ...event,
        id: `vuln-${vulnIdRef.current++}-${Date.now()}`,
      };
      setVulnerabilities(prev => [...prev, vuln]);
      setStats(prev => ({
        ...prev,
        vulnerabilitiesFound: prev.vulnerabilitiesFound + 1,
        severityBreakdown: {
          ...prev.severityBreakdown,
          [vuln.severity]: prev.severityBreakdown[vuln.severity] + 1,
        },
      }));
    } else if (event.type === 'fileComplete') {
      setStats(prev => ({
        ...prev,
        filesScanned: prev.filesScanned + 1,
        linesScanned: prev.linesScanned + event.linesScanned,
      }));
    } else if (event.type === 'complete') {
      // Don't override total counts from batch processing
      if (event.summary.overallRiskLevel) {
        setOverallRisk(prev => {
          // Keep the highest risk level
          const levels: Severity[] = ['low', 'medium', 'high', 'critical'];
          const prevIndex = prev ? levels.indexOf(prev) : -1;
          const newIndex = levels.indexOf(event.summary.overallRiskLevel);
          return newIndex > prevIndex ? event.summary.overallRiskLevel : prev;
        });
      }
    }
  }, []);

  const tryParseJson = useCallback((text: string): AnalysisEvent | null => {
    try {
      return JSON.parse(text) as AnalysisEvent;
    } catch {
      return null;
    }
  }, []);

  const extractJsonObjects = useCallback((text: string): { events: AnalysisEvent[], remaining: string } => {
    const events: AnalysisEvent[] = [];
    let remaining = text;

    let depth = 0;
    let start = -1;

    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];
      if (char === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const jsonStr = remaining.slice(start, i + 1);
          const event = tryParseJson(jsonStr);
          if (event && event.type) {
            events.push(event);
          }
          remaining = remaining.slice(i + 1);
          i = -1;
          start = -1;
        }
      }
    }

    if (start !== -1) {
      remaining = remaining.slice(start);
    } else if (depth === 0) {
      remaining = '';
    }

    return { events, remaining };
  }, [tryParseJson]);

  const analyzeBatch = useCallback(async (
    files: CodeFile[],
    explanationLevel: ExplanationLevel,
    apiKey: string,
    signal: AbortSignal
  ): Promise<void> => {

    // Import dynamically to avoid loading if not used or to ensure clean scope
    const { analyzeCodeWithGemini } = await import('@/lib/gemini');

    let accumulatedContent = '';

    await analyzeCodeWithGemini(apiKey, files, explanationLevel, (chunkText) => {
      if (signal.aborted) return;

      accumulatedContent += chunkText;
      const { events, remaining } = extractJsonObjects(accumulatedContent);
      accumulatedContent = remaining;

      for (const event of events) {
        handleAnalysisEvent(event);
      }
    });

    // Process any remaining content (though extractJsonObjects handles partial JSONs, 
    // we might need to be careful if Gemini finishes but JSON is incomplete)
    // Generally stream ends with valid JSONs.
  }, [handleAnalysisEvent, extractJsonObjects]);

  const analyzeCode = useCallback(async (files: CodeFile[], explanationLevel: ExplanationLevel, apiKey: string) => {
    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAnalyzing(true);
    setVulnerabilities([]);
    setOverallRisk(undefined);
    vulnIdRef.current = 0;

    const totalBatches = Math.ceil(files.length / BATCH_SIZE);

    setStats({
      filesScanned: 0,
      linesScanned: 0,
      vulnerabilitiesFound: 0,
      totalFiles: files.length,
      currentBatch: 0,
      totalBatches,
      severityBreakdown: { low: 0, medium: 0, high: 0, critical: 0 },
    });

    try {
      // Process files in batches for faster results
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        if (abortControllerRef.current?.signal.aborted) break;

        const batch = files.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;

        setStats(prev => ({ ...prev, currentBatch: batchNum }));

        await analyzeBatch(batch, explanationLevel, apiKey, abortControllerRef.current.signal);
      }

      // Final summary
      setStats(prev => {
        const total = prev.vulnerabilitiesFound;
        if (total === 0) {
          toast.success('No critical vulnerabilities detected');
        } else {
          toast.warning(`Found ${total} security issues across ${files.length} files`);
        }
        return prev;
      });

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        toast.info('Analysis cancelled');
        return;
      }
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [analyzeBatch]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setVulnerabilities([]);
    setOverallRisk(undefined);
    setStats({
      filesScanned: 0,
      linesScanned: 0,
      vulnerabilitiesFound: 0,
      totalFiles: 0,
      currentBatch: 0,
      totalBatches: 0,
      severityBreakdown: { low: 0, medium: 0, high: 0, critical: 0 },
    });
  }, []);

  return {
    isAnalyzing,
    vulnerabilities,
    stats,
    overallRisk,
    analyzeCode,
    reset,
  };
}
