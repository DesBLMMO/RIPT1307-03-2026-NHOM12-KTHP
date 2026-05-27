import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BADGE_DEFINITIONS: Record<string, { label: string; icon: string; desc: string }> = {
  STREAK_7:     { label: "Ngọn lửa nhỏ",  icon: "🔥", desc: "Duy trì 7 ngày liên tiếp" },
  STREAK_30:    { label: "Chiến binh",     icon: "⚔️", desc: "Duy trì 30 ngày liên tiếp" },
  WORDS_50:     { label: "Người học chăm", icon: "📚", desc: "Học được 50 từ vựng" },
  WORDS_100:    { label: "Từ điển sống",   icon: "🧠", desc: "Học được 100 từ vựng" },
  PERFECT_GAME: { label: "Hoàn hảo",       icon: "⭐", desc: "Hoàn thành game không sai" },
  FIRST_LOGIN:  { label: "Chào mừng!",     icon: "👋", desc: "Đăng nhập lần đầu tiên" },
};

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    const earned = await prisma.badge.findMany({ where: { userId: user.id } });
    const earnedTypes = earned.map((b) => b.badgeType);

    const allBadges = Object.entries(BADGE_DEFINITIONS).map(([type, info]) => ({
      type,
      ...info,
      isEarned: earnedTypes.includes(type),
      earnedAt: earned.find((b) => b.badgeType === type)?.earnedAt || null,
    }));

    return NextResponse.json({ success: true, badges: allBadges });
  } catch (error: any) {
    console.error("❌ Lỗi GET badges:", error.message);
    return NextResponse.json({ error: "Lỗi Server", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { badgeType } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    const existing = await prisma.badge.findFirst({
      where: { userId: user.id, badgeType }
    });
    if (existing) return NextResponse.json({ success: false, message: "Đã có badge này rồi" });

    await prisma.badge.create({
      data: { userId: user.id, badgeType }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Lỗi POST badges:", error.message);
    return NextResponse.json({ error: "Lỗi Server", details: error.message }, { status: 500 });
  }
}