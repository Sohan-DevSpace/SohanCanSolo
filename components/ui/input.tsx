import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 md:h-10 w-full min-w-0 rounded-lg border border-[#E8E2DB] bg-white px-3 md:px-4 py-2 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#B0AAA4] hover:border-[#D4CFC8] focus-visible:border-[#B8763C] focus-visible:ring-[3px] focus-visible:ring-[#B8763C]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F5F1EC]/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
