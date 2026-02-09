import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Security severity variants
        low: "border-transparent bg-severity-low/20 text-severity-low",
        medium: "border-transparent bg-severity-medium/20 text-severity-medium",
        high: "border-transparent bg-severity-high/20 text-severity-high",
        critical: "border-transparent bg-severity-critical/20 text-severity-critical animate-pulse-subtle",
        // Status variants
        secure: "border-transparent bg-status-secure/20 text-status-secure",
        warning: "border-transparent bg-status-warning/20 text-status-warning",
        danger: "border-transparent bg-status-danger/20 text-status-danger",
        info: "border-transparent bg-status-info/20 text-status-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
