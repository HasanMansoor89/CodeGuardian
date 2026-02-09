import { AlertTriangle, Info, FileX, Clock } from 'lucide-react';
import { CodeFile, SUPPORTED_EXTENSIONS, LANGUAGE_NAMES } from '@/types/security';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PreAnalysisWarningsProps {
  files: CodeFile[];
}

interface ValidationResult {
  supportedFiles: CodeFile[];
  unsupportedFiles: { name: string; extension: string }[];
  largeFiles: { name: string; lines: number }[];
  estimatedTime: number;
}

function validateFiles(files: CodeFile[]): ValidationResult {
  const supportedFiles: CodeFile[] = [];
  const unsupportedFiles: { name: string; extension: string }[] = [];
  const largeFiles: { name: string; lines: number }[] = [];

  for (const file of files) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const lines = file.content.split('\n').length;

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      unsupportedFiles.push({ name: file.name, extension: ext });
    } else {
      supportedFiles.push(file);
      if (lines > 1000) {
        largeFiles.push({ name: file.name, lines });
      }
    }
  }

  // Rough estimate: ~2 seconds per 100 lines
  const totalLines = supportedFiles.reduce((sum, f) => sum + f.content.split('\n').length, 0);
  const estimatedTime = Math.ceil((totalLines / 100) * 2);

  return { supportedFiles, unsupportedFiles, largeFiles, estimatedTime };
}

export function PreAnalysisWarnings({ files }: PreAnalysisWarningsProps) {
  const validation = validateFiles(files);
  const hasWarnings = validation.unsupportedFiles.length > 0 || validation.largeFiles.length > 0;

  if (!hasWarnings && validation.estimatedTime < 30) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      {/* Unsupported files warning */}
      {validation.unsupportedFiles.length > 0 && (
        <Alert variant="default" className="border-severity-medium/30 bg-severity-medium/5">
          <FileX className="h-4 w-4 text-severity-medium" />
          <AlertTitle className="text-severity-medium">Unsupported Files Detected</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            <p className="mb-2">
              {validation.unsupportedFiles.length} file(s) will be skipped:
            </p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {validation.unsupportedFiles.slice(0, 5).map(f => (
                <li key={f.name}>
                  <span className="font-mono">{f.name}</span>
                  <span className="text-muted-foreground/70"> ({f.extension})</span>
                </li>
              ))}
              {validation.unsupportedFiles.length > 5 && (
                <li className="text-muted-foreground">...and {validation.unsupportedFiles.length - 5} more</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Large files warning */}
      {validation.largeFiles.length > 0 && (
        <Alert variant="default" className="border-status-info/30 bg-status-info/5">
          <Info className="h-4 w-4 text-status-info" />
          <AlertTitle className="text-status-info">Large Files Detected</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            <p className="mb-2">
              These files are large and may take longer to analyze:
            </p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {validation.largeFiles.map(f => (
                <li key={f.name}>
                  <span className="font-mono">{f.name}</span>
                  <span className="text-muted-foreground/70"> ({f.lines.toLocaleString()} lines)</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Time estimate for large repos */}
      {validation.estimatedTime >= 30 && (
        <Alert variant="default" className="border-border bg-muted/30">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <AlertTitle>Estimated Analysis Time</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            Analysis may take approximately {Math.ceil(validation.estimatedTime / 60)} minute(s) 
            for {validation.supportedFiles.length} files ({validation.supportedFiles.reduce((sum, f) => sum + f.content.split('\n').length, 0).toLocaleString()} lines).
          </AlertDescription>
        </Alert>
      )}

      {/* What will be analyzed */}
      <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
        <p className="font-medium mb-1">What will be analyzed:</p>
        <p>
          {validation.supportedFiles.length} file(s) in{' '}
          {[...new Set(validation.supportedFiles.map(f => {
            const ext = '.' + f.name.split('.').pop()?.toLowerCase();
            return LANGUAGE_NAMES[ext] || ext;
          }))].join(', ')}
        </p>
      </div>
    </div>
  );
}
