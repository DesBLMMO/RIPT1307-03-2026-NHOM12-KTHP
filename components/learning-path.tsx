"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "Tất cả", active: true },
  { id: "thpt", label: "THPT", active: false },
  { id: "sach-ielts", label: "Sách IELTS", active: false },
  { id: "ielts", label: "IELTS", active: false },
  { id: "toeic", label: "TOEIC", active: false },
  { id: "nguoi-noi-tieng", label: "Người nổi tiếng khuyên dùng", active: false },
  { id: "theo-level", label: "Theo level", active: false },
  { id: "nguoi-di-lam", label: "Người đi làm & Chuyên ngành", active: false },
  { id: "thcs", label: "THCS", active: false },
]

export function LearningPath() {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <section>
      <h2 className="text-xl font-bold text-center text-gray-800 mb-6 uppercase tracking-wide">
        Lộ trình học
      </h2>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "px-5 py-2.5 rounded-full font-medium transition-all",
              activeCategory === category.id
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-500"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    </section>
  )
}
