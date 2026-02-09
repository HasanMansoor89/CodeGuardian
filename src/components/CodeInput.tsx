import { useState, useRef, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Link, Upload, Shield, Loader2, X } from 'lucide-react';
import { CodeFile } from '@/types/security';
import { toast } from 'sonner';

interface CodeInputProps {
  onSubmit: (files: CodeFile[]) => void;
  isAnalyzing: boolean;
  onClear?: () => void;
  githubToken?: string;
}

export function CodeInput({ onSubmit, isAnalyzing, onClear, githubToken }: CodeInputProps) {
  const [pastedCode, setPastedCode] = useState('');
  const [fileName, setFileName] = useState('main.js');
  const [githubUrl, setGitHubUrl] = useState('');
  const [isFetchingRepo, setIsFetchingRepo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handlePasteSubmit = useCallback(() => {
    if (!pastedCode.trim()) {
      toast.error('Please paste some code to analyze');
      return;
    }
    onSubmit([{ name: fileName || 'code.txt', content: pastedCode }]);
  }, [pastedCode, fileName, onSubmit]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isAnalyzing) {
        if (activeTab === 'paste' && pastedCode.trim()) {
          handlePasteSubmit();
        } else if (activeTab === 'github' && githubUrl.trim()) {
          handleGitHubSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, pastedCode, githubUrl, isAnalyzing, handlePasteSubmit]);

  const handleClear = () => {
    setPastedCode('');
    setFileName('main.js');
    setGitHubUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const handleGitHubSubmit = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter a GitHub URL');
      return;
    }

    setIsFetchingRepo(true);
    try {
      // Dynamic import to avoid issues if not used
      const { fetchGithubRepo } = await import('@/lib/github');

      const data = await fetchGithubRepo(githubUrl, githubToken, (msg) => {
        // Optional: could add a toast loading update here if we wanted
        console.log(msg);
      });

      toast.success(`Fetched ${data.files.length} files from ${data.summary.repository}`);
      onSubmit(data.files);
    } catch (error) {
      console.error('GitHub fetch error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch repository');
    } finally {
      setIsFetchingRepo(false);
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const files: CodeFile[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 1MB)`);
        continue;
      }

      try {
        const content = await file.text();
        files.push({ name: file.name, content });
      } catch {
        toast.error(`Failed to read ${file.name}`);
      }
    }

    if (files.length > 0) {
      toast.success(`Loaded ${files.length} file${files.length > 1 ? 's' : ''}`);
      onSubmit(files);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await processFiles(fileList);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const isLoading = isAnalyzing || isFetchingRepo;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Code Input</h2>
          <p className="text-sm text-muted-foreground">Upload or paste your code for security analysis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="paste" className="gap-2">
            <Code className="h-4 w-4" />
            Paste Code
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="github" className="gap-2">
            <Link className="h-4 w-4" />
            GitHub URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">File Name</label>
            <Input
              placeholder="main.js"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Source Code</label>
            <Textarea
              placeholder="Paste your code here..."
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              className="min-h-[300px] bg-code font-mono text-sm text-code-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePasteSubmit}
              disabled={isLoading || !pastedCode.trim()}
              className="flex-1"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Security'}
            </Button>
            {pastedCode.trim() && (
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">⌘</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Enter</kbd> to submit
          </p>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-all ${isDragging
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-border bg-muted/20 hover:border-primary/50'
              }`}
          >
            <Upload className={`mb-4 h-10 w-10 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="mb-2 text-sm font-medium text-foreground">
              {isDragging ? 'Drop files to analyze' : 'Drop files here or click to browse'}
            </p>
            <p className="mb-4 text-xs text-muted-foreground">Supports .js, .ts, .py, .java, .go, .rb, .php and more</p>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rb,.php,.c,.cpp,.h,.cs,.swift,.kt,.rs,.sql"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            <Button asChild variant="secondary" disabled={isLoading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="github" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Repository URL</label>
            <Input
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={(e) => setGitHubUrl(e.target.value)}
              className="bg-input"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Supports public repositories. You can also link to a specific folder, e.g., github.com/user/repo/tree/main/src
            </p>
          </div>
          <Button
            onClick={handleGitHubSubmit}
            disabled={isLoading || !githubUrl.trim()}
            className="w-full"
          >
            {isFetchingRepo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Repository...
              </>
            ) : isAnalyzing ? (
              'Analyzing...'
            ) : (
              'Fetch & Analyze'
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
