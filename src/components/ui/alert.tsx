import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-900/90 text-slate-200 [&>svg]:text-slate-400",
        info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 [&>svg]:text-cyan-400",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 [&>svg]:text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-200 [&>svg]:text-amber-400",
        destructive: "border-rose-500/30 bg-rose-500/10 text-rose-200 [&>svg]:text-rose-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

function Alert({ className, variant = "default", title, children, ...props }: AlertProps) {
  const Icon = iconMap[variant || "default"];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="h-5 w-5" />
      <div>
        {title && <h5 className="mb-1 font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs sm:text-sm text-slate-300">{children}</div>
      </div>
    </div>
  );
}

export { Alert, alertVariants };
