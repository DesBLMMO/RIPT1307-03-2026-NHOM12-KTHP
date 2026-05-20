import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAccessCardProps {
  icon: React.ReactNode
  title: string
  description: string
  iconBg: string
}

export function QuickAccessCard({ icon, title, description, iconBg }: QuickAccessCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl text-white", iconBg)}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </div>
  )
}
