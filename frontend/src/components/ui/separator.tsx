import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = SeparatorPrimitive.Root;

const SeparatorComponent = ({ className, orientation = "horizontal", ...props }: SeparatorPrimitive.SeparatorProps) => (
  <Separator
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    orientation={orientation}
    decorative
    {...props}
  />
);

export { SeparatorComponent as Separator };
