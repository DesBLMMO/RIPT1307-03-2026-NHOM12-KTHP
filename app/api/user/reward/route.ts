// File: app/api/user/reward/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { coins } = await req.json();

    if (!coins || isNaN(coins)) {
      return NextResponse.json({ error: "Số xu không hợp lệ" }, { status: 400 });
    }

    // Cộng xu trực tiếp vào Database của User
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        coins: { increment: Number(coins) }
      }
    });

    return NextResponse.json({ success: true, newBalance: updatedUser.coins });
  } catch (error: any) {
    console.error("Lỗi API cộng xu:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}