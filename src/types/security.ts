export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ExploitLikelihood = 'low' | 'medium' | 'high';
export type ExplanationLevel = 'beginner' | 'expert';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FileStatus = 'queued' | 'analyzing' | 'skipped' | 'completed';
export type EnvironmentType = 'development' | 'staging' | 'production';

export interface Vulnerability {
  id: string;
  type: 'vulnerability';
  file: string;
  function: string | null;
  line: number;
  severity: Severity;
  exploitLikelihood: ExploitLikelihood;
  title: string;
  description: string;
  beginnerExplanation: string;
  expertExplanation: string;
  codeSnippet: string;
  secureRefactoring: string;
  cweReference?: string;
  owaspCategory?: string;
  confidenceLevel?: ConfidenceLevel;
  contextLines?: string; // Surrounding code for context
  isFalsePositive?: boolean;
  riskScoreExplanation?: string;
}

export interface FileComplete {
  type: 'fileComplete';
  file: string;
  linesScanned: number;
}

export interface FileProgress {
  name: string;
  status: FileStatus;
  linesScanned?: number;
  skippedReason?: string;
}

export interface AnalysisComplete {
  type: 'complete';
  summary: {
    totalFiles: number;
    totalVulnerabilities: number;
    severityBreakdown?: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    overallRiskLevel: Severity;
    topRiskyFiles?: string[];
    message?: string;
  };
}

export interface CodeFile {
  name: string;
  content: string;
}

export interface AnalysisStats {
  filesScanned: number;
  linesScanned: number;
  vulnerabilitiesFound: number;
  totalFiles: number;
  currentBatch: number;
  totalBatches: number;
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  fileProgress?: FileProgress[];
  analysisStartTime?: number;
  analysisEndTime?: number;
}

export interface SeverityFilter {
  low: boolean;
  medium: boolean;
  high: boolean;
  critical: boolean;
}

export interface AnalysisMetadata {
  engineVersion: string;
  timestamp: number;
  environment: EnvironmentType;
}

export type AnalysisEvent = Vulnerability | FileComplete | AnalysisComplete;

// Supported languages for validation
export const SUPPORTED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', 
  '.php', '.c', '.cpp', '.h', '.cs', '.swift', '.kt', '.rs', '.sql'
];

export const LANGUAGE_NAMES: Record<string, string> = {
  '.js': 'JavaScript',
  '.jsx': 'React JSX',
  '.ts': 'TypeScript',
  '.tsx': 'React TSX',
  '.py': 'Python',
  '.java': 'Java',
  '.go': 'Go',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.c': 'C',
  '.cpp': 'C++',
  '.h': 'C/C++ Header',
  '.cs': 'C#',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.rs': 'Rust',
  '.sql': 'SQL',
};
