import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    let courseId = params?.id;
    
    // Đảm bảo luôn lấy được ID Lộ trình
    if (!courseId) {
      const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
      courseId = urlParts[urlParts.length - 1];
    }
    
    if (!courseId || courseId === "undefined" || courseId === "courses") {
        return NextResponse.json({ error: "ID khóa học không hợp lệ" }, { status: 400 });
    }

    console.log("🔥 Đang tải dữ liệu Khóa học ID:", courseId);

    // 1. Lấy thông tin bộ từ vựng kèm theo trường isPremium (nếu có trong schema)
    const set = await prisma.vocabSet.findUnique({
      where: { id: courseId },
      include: { words: true }
    });

    if (!set) {
        return NextResponse.json({ error: "Không tìm thấy lộ trình" }, { status: 404 });
    }

    // 2. Kiểm tra quyền PRO của người dùng hiện tại
    const session = await getServerSession();
    let isUserPro = false;
    let srsProgress: any[] = [];

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ 
        where: { email: session.user.email },
        select: { id: true, isPro: true } // Lấy thêm cột isPro để kiểm tra
      });
      
      if (user) {
        isUserPro = user.isPro || false; // Cập nhật trạng thái PRO thật của user
        
        // Lấy danh sách từ đã học
        const allWordIds = set.words.map((w: any) => w.id);
        if (allWordIds.length > 0) {
          srsProgress = await prisma.srsProgress.findMany({
            where: { userId: user.id, wordId: { in: allWordIds }, isLearned: true }
          });
        }
      }
    }

    // 3. LOGIC THẨM ĐỊNH QUYỀN TRUY CẬP: 
    // Nếu bộ từ vựng này yêu cầu Premium (set.isPremium === true) mà User CHƯA mua PRO
    const isLocked = (set as any).isPremium && !isUserPro;

    const course = {
      id: set.id,
      title: set.title,
      category: (set as any).category,
      difficulty: (set as any).difficulty,
      vocabSets: [set]
    };

    const allWordIds = course.vocabSets.flatMap((set: any) => set.words.map((w: any) => w.id));
    const totalCourseWords = allWordIds.length;
    const totalCourseLearned = srsProgress.length;

    const formattedSets = course.vocabSets.map((set: any) => {
      const setWordIds = set.words.map((w: any) => w.id);
      const learnedInSet = srsProgress.filter(p => setWordIds.includes(p.wordId)).length;
      
      // Tách words ra
      const { words, ...setWithoutWords } = set; 

      return {
        ...setWithoutWords,
        totalWords: setWordIds.length,
        learnedWords: learnedInSet,
        progressPercent: setWordIds.length > 0 ? Math.round((learnedInSet / setWordIds.length) * 100) : 0,
        // 👇 Gửi thêm 2 trường này về Frontend để UI biết đường hiển thị ổ khóa 🔒
        isPremium: set.isPremium || false,
        isLocked: isLocked,
        // Nếu bị khóa (chưa mua PRO), ta giấu mảng từ vựng đi để Frontend không render lén được
        words: isLocked ? [] : words 
      };
    });

    return NextResponse.json({
      ...course,
      vocabSets: formattedSets, 
      totalCourseWords: totalCourseWords,
      totalCourseLearned: totalCourseLearned,
      courseProgressPercent: totalCourseWords > 0 ? Math.round((totalCourseLearned / totalCourseWords) * 100) : 0,
    });

  } catch (error) {
    console.error("❌ Lỗi API Course:", error);
    return NextResponse.json({ error: "Lỗi Server Nội Bộ" }, { status: 500 });
  }
}