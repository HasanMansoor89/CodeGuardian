import { ShieldCheck, ShieldQuestion, ShieldAlert } from 'lucide-react';
import { ConfidenceLevel } from '@/types/security';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  showLabel?: boolean;
}

const confidenceConfig: Record<ConfidenceLevel, {
  icon: typeof ShieldCheck;
  className: string;
  label: string;
  description: string;
}> = {
  high: {
    icon: ShieldCheck,
    className: 'text-status-secure bg-status-secure/10 border-status-secure/30',
    label: 'High confidence',
    description: 'Strong evidence of this vulnerability pattern',
  },
  medium: {
    icon: ShieldQuestion,
    className: 'text-severity-medium bg-severity-medium/10 border-severity-medium/30',
    label: 'Medium confidence',
    description: 'Likely vulnerability, context-dependent',
  },
  low: {
    icon: ShieldAlert,
    className: 'text-muted-foreground bg-muted/50 border-border',
    label: 'Needs review',
    description: 'Potential issue requiring manual verification',
  },
};

export function ConfidenceBadge({ level, showLabel = false }: ConfidenceBadgeProps) {
  const { icon: Icon, className, label, description } = confidenceConfig[level];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${className}`}>
            <Icon className="h-3 w-3" />
            {showLabel && <span>{label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
