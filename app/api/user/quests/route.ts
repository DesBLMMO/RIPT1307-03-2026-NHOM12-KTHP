import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const QUEST_DEFINITIONS = [
  { questType: "LEARN_5",   target: 5,  rewardCoins: 10 },
  { questType: "LEARN_10",  target: 10, rewardCoins: 20 },
  { questType: "PLAY_GAME", target: 1,  rewardCoins: 15 },
  { questType: "STREAK",    target: 1,  rewardCoins: 5  },
];

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let quests = await prisma.dailyQuest.findMany({
      where: { userId: user.id, date: today }
    });

    if (quests.length === 0) {
      quests = await Promise.all(
        QUEST_DEFINITIONS.map(q =>
          prisma.dailyQuest.create({
            data: {
              userId: user.id,
              date: today,
              questType: q.questType,
              target: q.target,
              rewardCoins: q.rewardCoins,
              current: 0,
              isCompleted: false
            }
          })
        )
      );
    }

    return NextResponse.json({ success: true, quests });
  } catch (error: any) {
    console.error("❌ Lỗi GET quests:", error.message);
    return NextResponse.json({ error: "Lỗi Server", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const { questType, increment } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const quest = await prisma.dailyQuest.findFirst({
      where: { userId: user.id, date: today, questType, isCompleted: false }
    });

    if (!quest) return NextResponse.json({ success: false, message: "Quest không tồn tại" });

    const newCurrent = Math.min(quest.current + (increment || 1), quest.target);
    const isCompleted = newCurrent >= quest.target;

    await prisma.dailyQuest.update({
      where: { id: quest.id },
      data: { current: newCurrent, isCompleted }
    });

    if (isCompleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: { coins: { increment: quest.rewardCoins } }
      });
    }

    return NextResponse.json({ success: true, isCompleted, rewardCoins: isCompleted ? quest.rewardCoins : 0 });
  } catch (error: any) {
    console.error("❌ Lỗi PATCH quests:", error.message);
    return NextResponse.json({ error: "Lỗi Server", details: error.message }, { status: 500 });
  }
}