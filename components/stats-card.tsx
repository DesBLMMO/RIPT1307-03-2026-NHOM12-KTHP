import { cn } from "@/lib/utils"

interface StatsCardProps {
  value: string
  label: string
  variant: "primary" | "secondary"
}

export function StatsCard({ value, label, variant }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div
        className={cn(
          "text-2xl font-bold text-center",
          variant === "primary" ? "text-blue-500" : "text-orange-500"
        )}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500 text-center">{label}</div>
    </div>
  )
}
