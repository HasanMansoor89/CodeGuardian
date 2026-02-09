import { CodeFile } from '@/types/security';

const SUPPORTED_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php',
    '.c', '.cpp', '.h', '.cs', '.swift', '.kt', '.rs', '.sql', '.vue', '.svelte'
];

interface GitHubFile {
    name: string;
    path: string;
    type: 'file' | 'dir';
    download_url: string | null;
    size: number;
}

function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string; path?: string } | null {
    try {
        const urlObj = new URL(url);
        if (!urlObj.hostname.includes('github.com')) return null;

        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length < 2) return null;

        const owner = parts[0];
        const repo = parts[1];
        let branch: string | undefined;
        let path: string | undefined;

        // Handle tree/blob URLs like github.com/user/repo/tree/main/src
        if (parts.length > 3 && (parts[2] === 'tree' || parts[2] === 'blob')) {
            branch = parts[3];
            if (parts.length > 4) {
                path = parts.slice(4).join('/');
            }
        }

        return { owner, repo, branch, path };
    } catch {
        return null;
    }
}

async function fetchContents(owner: string, repo: string, path: string = '', branch?: string, token?: string): Promise<GitHubFile[]> {
    let url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    if (branch) {
        url += `?ref=${branch}`;
    }

    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };

    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Repository not found or is private. Check URL or provide a token.');
        }
        if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please provide a GitHub Token.');
        }
        throw new Error(`Failed to fetch repository: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
}

async function fetchFileContent(downloadUrl: string): Promise<string> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch file content`);
    }
    return await response.text();
}

export async function fetchGithubRepo(
    url: string,
    token?: string,
    onProgress?: (msg: string) => void
): Promise<{ files: CodeFile[], summary: { totalFiles: number, repository: string } }> {

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
        throw new Error("Invalid GitHub URL");
    }

    const { owner, repo, branch, path } = parsed;
    const collectedFiles: CodeFile[] = [];
    const maxFiles = 100;
    const maxSizePerFile = 150 * 1024; // 150KB

    async function collectFilesRecursive(currentPath: string = '') {
        if (collectedFiles.length >= maxFiles) return;

        if (onProgress) onProgress(`Scanning ${currentPath || 'root'}...`);

        // Slight delay to avoid hammering API too hard if recursive
        await new Promise(r => setTimeout(r, 100));

        const contents = await fetchContents(owner, repo, currentPath, branch, token);

        for (const item of contents) {
            if (collectedFiles.length >= maxFiles) break;

            if (item.type === 'dir') {
                const skipDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.next', 'coverage'];
                if (skipDirs.includes(item.name)) continue;

                // Construct new path relative to the initial search path
                // Actually fetchContents takes the full path from root of repo
                await collectFilesRecursive(item.path);
            } else if (item.type === 'file' && item.download_url) {
                const ext = '.' + item.name.split('.').pop()?.toLowerCase();
                if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;
                if (item.size > maxSizePerFile) continue;

                try {
                    if (onProgress) onProgress(`Fetching ${item.name}...`);
                    const content = await fetchFileContent(item.download_url);
                    collectedFiles.push({ name: item.path, content });
                } catch (e) {
                    console.error(`Failed to fetch ${item.path}`, e);
                }
            }
        }
    }

    await collectFilesRecursive(path || '');

    if (collectedFiles.length === 0) {
        throw new Error("No supported code files found");
    }

    return {
        files: collectedFiles,
        summary: {
            totalFiles: collectedFiles.length,
            repository: `${owner}/${repo}`,
        }
    };
}
