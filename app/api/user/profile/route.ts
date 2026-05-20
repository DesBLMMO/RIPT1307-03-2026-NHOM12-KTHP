// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // ĐÃ SỬA: Lấy toàn bộ thông tin cần thiết thay vì chỉ lấy 3 cột như cũ
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        coverImage: true,
        coins: true,           // Mở khóa để lấy Xu
        targetExam: true,      // Mở khóa để lấy Ngày thi
        createdAt: true,       // Mở khóa ngày tham gia
        voice: true,           // Mở khóa cài đặt giọng
        language: true,        // Mở khóa ngôn ngữ
        reminder: true,        // Mở khóa thông báo
        streakCount: true,
        streakHistory: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Lỗi lấy thông tin profile:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    
    // Gom cả dữ liệu cũ (coverImage, streak) và dữ liệu mới (name, targetExam...)
    const { 
      coverImage, streakCount, streakHistory,
      name, targetExam, voice, language, reminder
    } = body;

    const updateData: any = {};
    
    // Dữ liệu cũ
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (streakCount !== undefined) updateData.streakCount = streakCount;
    if (streakHistory !== undefined) updateData.streakHistory = streakHistory;

    // Dữ liệu mới của phần Profile
    if (name !== undefined) updateData.name = name.trim();
    if (targetExam !== undefined) {
      updateData.targetExam = targetExam ? new Date(targetExam) : null;
    }
    if (voice !== undefined) updateData.voice = voice;
    if (language !== undefined) updateData.language = language;
    if (reminder !== undefined) updateData.reminder = reminder;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      coverImage: updatedUser.coverImage,
      user: updatedUser 
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return NextResponse.json({ error: "Lỗi cập nhật dữ liệu" }, { status: 500 });
  }
}