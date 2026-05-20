// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Lấy top 50 người dùng có chuỗi streak cao nhất
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        coverImage: true,
        streakCount: true, 
      },
      orderBy: {
        streakCount: 'desc' // Sắp xếp giảm dần theo Streak
      },
      take: 50 // Giới hạn 50 người đứng đầu
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Lỗi API Leaderboard:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi Server khi tải xếp hạng" }, 
      { status: 500 }
    );
  }
}