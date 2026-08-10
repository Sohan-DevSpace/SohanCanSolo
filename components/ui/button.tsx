import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-[15px] font-semibold whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#C87533]/50 hover:-translate-y-[1px] active:scale-[0.97] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#C87533] text-white shadow-[0_6px_20px_-4px_rgba(200,117,51,0.35)] hover:bg-[#A65E28] hover:shadow-[0_10px_25px_-4px_rgba(200,117,51,0.45)] border-transparent",
        primary: "bg-[#C87533] text-white shadow-[0_6px_20px_-4px_rgba(200,117,51,0.35)] hover:bg-[#A65E28] hover:shadow-[0_10px_25px_-4px_rgba(200,117,51,0.45)] border-transparent",
        outline: "border-2 border-[#1A1A1A] bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
        secondary: "border-2 border-[#1A1A1A] bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
        ghost: "bg-transparent text-[#C87533] hover:underline hover:text-[#A65E28] border-transparent shadow-none",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-[#C87533] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[48px] px-7 py-3.5 gap-2",
        lg: "min-h-[52px] px-8 py-4 gap-2.5 text-base",
        sm: "min-h-[38px] px-4 py-2 text-xs gap-1.5",
        xs: "min-h-[32px] px-3 py-1 text-xs gap-1",
        icon: "size-11 rounded-full p-0 min-w-[44px] min-h-[44px]",
        "icon-sm": "size-9 rounded-full p-0 min-w-[36px] min-h-[36px]",
        "icon-lg": "size-12 rounded-full p-0 min-w-[48px] min-h-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
