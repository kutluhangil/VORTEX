"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

const Glass = forwardRef<HTMLDivElement, GlassProps>(
  ({ className, as: Tag = "div", ...props }, ref) => (
    <Tag ref={ref} className={cn("glass", className)} {...props} />
  ),
);
Glass.displayName = "Glass";

export { Glass };
