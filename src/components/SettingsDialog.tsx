import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Key, Eye, EyeOff } from 'lucide-react';

interface SettingsDialogProps {
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    githubToken: string;
    onGithubTokenChange: (token: string) => void;
}

export function SettingsDialog({ apiKey, onApiKeyChange, githubToken, onGithubTokenChange }: SettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localGithubToken, setLocalGithubToken] = useState(githubToken);
    const [showKey, setShowKey] = useState(false);
    const [showToken, setShowToken] = useState(false);

    // Sync props to local state when dialog opens
    useEffect(() => {
        if (open) {
            setLocalApiKey(apiKey);
            setLocalGithubToken(githubToken);
        }
    }, [open, apiKey, githubToken]);

    const handleSave = () => {
        onApiKeyChange(localApiKey);
        onGithubTokenChange(localGithubToken);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Details</DialogTitle>
                    <DialogDescription>
                        Configure your API keys to run the analysis directly in your browser.
                        These keys are stored locally and never sent to our servers.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="apiKey" className="flex items-center gap-2">
                            Google Gemini API Key
                            <span className="text-xs text-red-500">*Required</span>
                        </Label>
                        <div className="relative">
                            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="apiKey"
                                type={showKey ? "text" : "password"}
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                className="pl-9 pr-10"
                                placeholder="AIzbSy..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="githubToken" className="flex items-center gap-2">
                            GitHub Token
                            <span className="text-xs text-muted-foreground">(Optional)</span>
                        </Label>
                        <div className="relative">
                            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="githubToken"
                                type={showToken ? "text" : "password"}
                                value={localGithubToken}
                                onChange={(e) => setLocalGithubToken(e.target.value)}
                                className="pl-9 pr-10"
                                placeholder="ghp_..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            >
                                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Required only for private repos or to increase rate limits.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Settings</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
