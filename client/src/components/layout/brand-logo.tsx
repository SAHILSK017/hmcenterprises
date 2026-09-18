import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Bump when replacing public/images/hmc-logo.png so browsers don't serve a stale asset */
const LOGO_SRC = "/images/hmc-logo.png?v=7";

type BrandLogoProps = {
  className?: string;
  variant?: "header" | "footer";
  linked?: boolean;
};

export function BrandLogo({ className, variant = "header", linked = true }: BrandLogoProps) {
  const isHeader = variant === "header";

  const content = (
    <span
      className={cn(
        "relative block shrink-0 transition-transform duration-300 group-hover:scale-[1.03]",
        isHeader ? "h-10 w-[185px] sm:h-11 sm:w-[210px] lg:h-12 lg:w-[230px]" : "h-12 w-[230px]",
        className
      )}
    >
      <Image
        src={LOGO_SRC}
        alt="HMC Mobile"
        fill
        quality={100}
        unoptimized
        className={cn(
          "object-contain object-left transition-[filter,transform] duration-300",
          linked && "group-hover:brightness-105"
        )}
        sizes={isHeader ? "(max-width: 640px) 170px, (max-width: 1024px) 200px, 220px" : "220px"}
        priority={isHeader}
      />
    </span>
  );

  if (!linked) return content;

  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </Link>
  );
}
