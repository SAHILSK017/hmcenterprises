import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] text-sm font-normal transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#06B6D4] text-white hover:opacity-95 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(15,118,110,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] active:translate-y-0 font-semibold",
        primary:
          "bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#06B6D4] text-white hover:opacity-95 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(15,118,110,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] active:translate-y-0 font-semibold",
        accent:
          "bg-gradient-to-r from-[#06B6D4] via-[#0891B2] to-[#0F766E] text-white hover:opacity-95 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(15,118,110,0.45)] active:translate-y-0 font-semibold",
        secondary:
          "bg-white text-[#0F766E] border border-[#0D9488] hover:bg-gradient-to-r hover:from-[#F0FDFA] hover:to-[#ECFEFF] hover:border-[#06B6D4] hover:text-[#0891B2] hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 font-semibold",
        outline:
          "border border-[#0D9488] bg-white text-[#0F766E] hover:bg-gradient-to-r hover:from-[#F0FDFA] hover:to-[#ECFEFF] hover:border-[#06B6D4] hover:text-[#0891B2] hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 font-semibold",
        ghost: "hover:bg-gradient-to-r hover:from-[#F0FDFA] hover:to-[#ECFEFF] text-foreground hover:text-[#0F766E] hover:-translate-y-0.5 active:translate-y-0",
        success:
          "bg-gradient-to-r from-[#0F766E] to-[#10B981] text-white hover:opacity-95 hover:-translate-y-0.5 font-semibold shadow-[0_4px_14px_rgba(15,118,110,0.3)] active:translate-y-0",
        warning:
          "bg-[#F97316] text-white hover:bg-[#EA580C] hover:-translate-y-0.5 font-semibold shadow-[0_2px_10px_rgba(249,115,22,0.25)] hover:shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:translate-y-0",
        danger:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] hover:-translate-y-0.5 font-semibold shadow-[0_2px_10px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_14px_rgba(239,68,68,0.35)] active:translate-y-0",
        link: "text-[#0F766E] hover:text-[#06B6D4] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-lg)] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
