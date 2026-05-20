import { Flame } from "lucide-react"

interface StreakCardProps {
  streak: number
}

const days = ["T5", "T6", "T7", "CN", "T2", "T3", "T4"]

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="bg-orange-500 rounded-2xl p-6 text-white min-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-white/20 p-1 rounded-full">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-sm uppercase tracking-wide">
          Chuỗi ngày học
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-6xl font-bold">{streak}</span>
        <span className="text-xl">ngày</span>
      </div>

      <div className="flex items-center justify-between">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index === days.length - 1
                  ? "bg-white"
                  : "bg-orange-400"
              }`}
            >
              {index === days.length - 1 && (
                <Flame className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <span className="text-xs opacity-80">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
