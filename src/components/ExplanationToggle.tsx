import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GraduationCap, Code2 } from 'lucide-react';
import { ExplanationLevel } from '@/types/security';

interface ExplanationToggleProps {
  level: ExplanationLevel;
  onToggle: (level: ExplanationLevel) => void;
}

export function ExplanationToggle({ level, onToggle }: ExplanationToggleProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <GraduationCap className={`h-4 w-4 ${level === 'beginner' ? 'text-primary' : 'text-muted-foreground'}`} />
        <Label htmlFor="explanation-level" className={`text-sm ${level === 'beginner' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          Beginner
        </Label>
      </div>
      <Switch
        id="explanation-level"
        checked={level === 'expert'}
        onCheckedChange={(checked) => onToggle(checked ? 'expert' : 'beginner')}
      />
      <div className="flex items-center gap-2">
        <Code2 className={`h-4 w-4 ${level === 'expert' ? 'text-primary' : 'text-muted-foreground'}`} />
        <Label htmlFor="explanation-level" className={`text-sm ${level === 'expert' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          Expert
        </Label>
      </div>
    </div>
  );
}
