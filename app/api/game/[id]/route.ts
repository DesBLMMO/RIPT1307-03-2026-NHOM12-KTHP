// Đường dẫn chuẩn: app/api/game/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    let id = params?.id;
    
    // Fallback: Lấy ID từ URL nếu params bị lỗi
    if (!id) {
      const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
      id = urlParts[urlParts.length - 1];
    }

    if (!id || id === "undefined" || id === "game") {
      return NextResponse.json({ error: "Thiếu ID bộ từ" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const part = parseInt(searchParams.get("part") || "0", 10);
    const mode = searchParams.get("mode") || "srs";

    console.log("🔥 [API /game] Đang tải dữ liệu cho Bộ từ ID:", id);

    // =========================================================
    // LỚP BẢO VỆ 1: Tự động dò tìm bảng Bộ từ (VocabSet)
    // =========================================================
    const setModel = (prisma as any).vocabSet || (prisma as any).VocabSet || (prisma as any).set || (prisma as any).Topic;

    if (!setModel) {
      console.error("❌ Không tìm thấy bảng VocabSet trong Prisma.");
      return NextResponse.json({ error: "Lỗi cấu hình Database" }, { status: 500 });
    }

    // ... Đoạn code nhận diện setModel cũ giữ nguyên ...

const vocabSet = await setModel.findUnique({
  where: { id: id },
  include: { words: true }
});

if (!vocabSet) return NextResponse.json({ error: "Không tìm thấy bộ từ" }, { status: 404 });

const wordsArray = vocabSet.words || [];

// 1. Lấy toàn bộ tiến độ srs của user cho bộ từ này
const session = await getServerSession();
let progressList: any[] = [];

if (session?.user?.email && wordsArray.length > 0) {
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const progressModel = (prisma as any).srsProgress || (prisma as any).SrsProgress;
  
  if (user && progressModel) {
    progressList = await progressModel.findMany({
      where: { userId: user.id, wordId: { in: wordsArray.map((w: any) => w.id) } }
    });
  }
}

// 2. LỌC ĐẶC BIỆT CHO CHẾ ĐỘ HỌC NGẮT QUÃNG SRS
let filteredWords = wordsArray;
const now = new Date();

if (mode === "srs") {
  filteredWords = wordsArray.filter((word: any) => {
    const prog = progressList.find((p: any) => p.wordId === word.id);
    // Nếu từ chưa học bao giờ (prog undefined) -> Cho học từ mới luôn
    if (!prog) return true;
    // Nếu từ đã học, kiểm tra xem thời gian nextReviewAt đã nhỏ hơn hoặc bằng hiện tại chưa
    const reviewDate = prog.nextReviewAt ? new Date(prog.nextReviewAt) : new Date();
    return reviewDate <= now;
  });
}

// 3. Phân trang (Slice) danh sách từ đã lọc để giới hạn lượt học
const chunkSize = 20;
const startIdx = part * chunkSize;
const targetWords = filteredWords.slice(startIdx, startIdx + chunkSize);

const dynamicWords = targetWords.map((word: any) => {
  const prog = progressList.find((p: any) => p.wordId === word.id);
  return {
    ...word,
    isLearned: prog ? prog.isLearned : false,
    level: prog ? prog.level : 0,
    nextReviewAt: prog ? prog.nextReviewAt : null
  };
});

// Trả thông tin về Frontend
return NextResponse.json({
  setName: mode === "srs" ? `${vocabSet.title} (Học ngắt quãng)` : vocabSet.title,
  setId: vocabSet.id,
  part: part,
  mode: mode,
  words: dynamicWords,
  totalSetWords: filteredWords.length, // Trả số từ thực tế cần review của chế độ này
  totalSetLearned: progressList.filter((p: any) => p.isLearned).length
});
  } catch (error: any) {
    console.error("❌ Lỗi API Game:", error.message || error);
    return NextResponse.json({ error: "Lỗi Server Nội Bộ" }, { status: 500 });
  }
}