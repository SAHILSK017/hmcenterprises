import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Bump when replacing public/images/hmc-logo.png so browsers don't serve a stale asset */
const LOGO_SRC = "/images/hmc-logo.png?v=9";

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
        isHeader
          ? "h-12 w-[63px] sm:h-14 sm:w-[73px] lg:h-16 lg:w-[84px]"
          : "h-16 w-[84px] sm:h-20 sm:w-[105px]",
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
        sizes={isHeader ? "(max-width: 640px) 63px, (max-width: 1024px) 73px, 84px" : "105px"}
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
