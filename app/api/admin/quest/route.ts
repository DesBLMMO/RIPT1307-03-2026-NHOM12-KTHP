import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// Kiểm tra quyền admin
async function checkAdmin() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return user?.role === "ADMIN" ? true : null;
}

// GET: Lấy danh sách quest của tất cả user
export async function GET(req: Request) {
  try {
    if (!await checkAdmin()) return NextResponse.json({ success: false }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Lấy quest + badge của 1 user cụ thể
      const [quests, badges] = await Promise.all([
        prisma.dailyQuest.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 20 }),
        prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: "desc" } })
      ]);
      return NextResponse.json({ success: true, quests, badges });
    }

    // Lấy thống kê tổng quan quest hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalQuests, completedQuests, totalBadges] = await Promise.all([
      prisma.dailyQuest.count({ where: { date: today } }),
      prisma.dailyQuest.count({ where: { date: today, isCompleted: true } }),
      prisma.badge.count()
    ]);

    // Top 10 user có nhiều badge nhất
    const topBadgeUsers = await prisma.badge.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    });

    const userIds = topBadgeUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    const topUsers = topBadgeUsers.map(u => ({
      ...users.find(usr => usr.id === u.userId),
      badgeCount: u._count.userId
    }));

    return NextResponse.json({ success: true, stats: { totalQuests, completedQuests, totalBadges }, topUsers });
  } catch (error: any) {
    console.error("❌ Lỗi GET admin quests:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Reset quest hoặc badge của user
export async function DELETE(req: Request) {
  try {
    if (!await checkAdmin()) return NextResponse.json({ success: false }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // "quests" | "badges" | "all"

    if (!userId) return NextResponse.json({ success: false, error: "Thiếu userId" }, { status: 400 });

    if (type === "quests" || type === "all") {
      await prisma.dailyQuest.deleteMany({ where: { userId } });
    }
    if (type === "badges" || type === "all") {
      await prisma.badge.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ success: true, message: `Đã reset ${type} của user` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}