// app/api/user/upgrade-pro/route.ts
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth"; // Đảm bảo đúng file auth của bạn
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    // Cập nhật trạng thái người dùng thành PRO trực tiếp trong DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { isPro: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Nâng cấp PRO thành công!",
      isPro: updatedUser.isPro 
    });
  } catch (error) {
    console.error("Lỗi API Nâng cấp PRO:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}