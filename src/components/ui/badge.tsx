import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
    const variants = {
      default: "border border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      destructive: "border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80"
    }
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
