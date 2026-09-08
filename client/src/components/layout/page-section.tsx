import { cn } from "@/lib/utils";

type PageSectionProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  centered?: boolean;
  as?: "section" | "div" | "footer";
};

export function PageSection({
  children,
  className,
  innerClassName,
  centered = true,
  as: Tag = "section",
}: PageSectionProps) {
  return (
    <Tag className={cn(centered ? "section-screen" : "section-page", "w-full", className)}>
      <div className={cn("container-page w-full", centered && "py-12 sm:py-16", innerClassName)}>
        {children}
      </div>
    </Tag>
  );
}
