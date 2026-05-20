// Đường dẫn chuẩn: app/api/courses/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    console.log("🔥 Đang tải danh sách toàn bộ Lộ trình...");

    const vocabSets = await prisma.vocabSet.findMany({
      include: { words: true }
    });

    if (!vocabSets || vocabSets.length === 0) {
      console.log("⚠️ Database hiện tại chưa có lộ trình nào.");
      return NextResponse.json([]);
    }

    const session = await getServerSession();
    let userProgress: any[] = [];

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) {
        userProgress = await prisma.srsProgress.findMany({
          where: { userId: user.id, isLearned: true }
        });
      }
    }

    const grouped: Record<string, any> = {};

    vocabSets.forEach((set: any) => {
      const categoryName = set.category || 'Khác';
      if (!grouped[categoryName]) {
        grouped[categoryName] = { category: categoryName, count: 0, items: [] };
      }

      grouped[categoryName].items.push({
        id: set.id,
        title: set.title,
        sets: 1,
        difficulty: set.difficulty ?? 1
      });
      grouped[categoryName].count += 1;
    });

    const formattedCourses = Object.values(grouped);
    console.log("✅ Tải thành công danh sách Lộ trình!");
    return NextResponse.json(formattedCourses);

  } catch (error: any) {
    // In trực tiếp lỗi ra Terminal để nếu có hỏng thì bắt bệnh được ngay
    console.error("❌ Lỗi API lấy danh sách khóa học:", error.message || error);
    return NextResponse.json({ error: "Lỗi Server Nội Bộ", details: error.message }, { status: 500 });
  }
}