"use client"

import { useState } from "react"
import { X, Calendar, Mail, CalendarDays, Pencil, Globe, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [reminder, setReminder] = useState(false)
  const [language, setLanguage] = useState("en")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            Dũng Trần
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Goal Date */}
          <div className="border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Ngày thi mục tiêu</span>
              </div>
              <button className="flex items-center gap-2 text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50">
                nn/mm/yyyy
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Chọn ngày thi để hiển thị đồng hồ đếm ngược trên Header.
            </p>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
            <Mail className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-800">trandunghy020906@gmail.com</span>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">Ngày tham gia:</span>
            <span className="font-medium text-gray-800">20/01/2026</span>
          </div>

          {/* Change Name */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <Pencil className="w-4 h-4" />
            <span>Đổi tên hiển thị</span>
          </button>

          {/* Language Setting */}
          <div className="border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <Globe className="w-5 h-5" />
                <span className="font-medium">Ngôn ngữ phát âm</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <span className="flex items-center gap-2">
                      <span>🇬🇧</span> Tiếng Anh
                    </span>
                  </SelectItem>
                  <SelectItem value="us">
                    <span className="flex items-center gap-2">
                      <span>🇺🇸</span> Tiếng Mỹ
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Chọn ngôn ngữ để thay đổi giọng phát âm trong game và từ vựng.
            </p>
          </div>

          {/* Study Reminder */}
          <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Nhắc nhở học từ</span>
              </div>
              <Switch 
                checked={reminder} 
                onCheckedChange={setReminder}
              />
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Khi bật, hệ thống sẽ nhắc lúc 8h sáng với từ đến hạn và 15h chiều với từ đến hạn kèm 5 từ chưa thuộc.
              </p>
              <p>
                Danh sách 15h ưu tiên các từ chưa thuộc trong những bộ từ do bạn sở hữu.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
