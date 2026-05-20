import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Hàm helper tính toán ngày ôn tập tiếp theo dựa trên cấp độ (Level)
function calculateNextReview(level: number): Date {
  const now = new Date();
  let daysToAdd = 0;

  switch (level) {
    case 1: daysToAdd = 1; break;  // Cấp 1: Ôn lại sau 1 ngày
    case 2: daysToAdd = 3; break;  // Cấp 2: Ôn lại sau 3 ngày
    case 3: daysToAdd = 7; break;  // Cấp 3: Ôn lại sau 7 ngày
    case 4: daysToAdd = 14; break; // Cấp 4: Ôn lại sau 14 ngày
    case 5: daysToAdd = 30; break; // Cấp 5 (Thành thạo): Ôn lại sau 30 ngày
    default: daysToAdd = 0;        // Cấp 0: Ôn lại ngay lập tức
  }

  now.setDate(now.getDate() + daysToAdd);
  return now;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { wordId, isLearned } = await req.json();
    if (!wordId) return NextResponse.json({ error: "Thiếu ID từ vựng" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    const progressModel = (prisma as any).srsProgress || (prisma as any).SrsProgress;

    // 1. Tìm bản ghi tiến độ cũ của từ này
    const currentProgress = await progressModel.findUnique({
      where: { userId_wordId: { userId: user.id, wordId } }
    });

    let currentLevel = currentProgress?.level || 0;
    let newLevel = currentLevel;

    // 2. Tính toán cấp độ mới theo SRS
    if (isLearned) {
      // Nếu thuộc thì tăng cấp (Tối đa là cấp 5)
      newLevel = Math.min(5, currentLevel + 1);
    } else {
      // Nếu quên thì tụt cấp về lại cấp 1 để học lại
      newLevel = Math.max(1, currentLevel - 1);
    }

    const nextReviewDate = calculateNextReview(newLevel);

    // 3. Lưu cập nhật hoặc tạo mới vào cơ sở dữ liệu
    const updatedProgress = await progressModel.upsert({
      where: { userId_wordId: { userId: user.id, wordId } },
      update: {
        level: newLevel,
        isLearned: isLearned,
        nextReviewAt: nextReviewDate
      },
      create: {
        userId: user.id,
        wordId: wordId,
        level: newLevel,
        isLearned: isLearned,
        nextReviewAt: nextReviewDate
      }
    });

    return NextResponse.json({ success: true, progress: updatedProgress });
  } catch (error: any) {
    console.error("Lỗi API SRS Patch:", error);
    return NextResponse.json({ error: "Lỗi Server", details: error.message }, { status: 500 });
  }
}