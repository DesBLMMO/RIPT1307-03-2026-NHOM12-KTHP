import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    let setId = params?.id;

    // Fallback: Tự bóc tách ID từ đường link nếu params của Next.js bị lỗi
    if (!setId) {
      const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
      setId = urlParts[urlParts.length - 2]; 
    }

    if (!setId || setId === "undefined") {
      return NextResponse.json({ error: "Thiếu ID bộ từ" }, { status: 400 });
    }

    // Tự động nhận diện bảng Word
    const wordModel = (prisma as any).word || (prisma as any).Word || (prisma as any).vocabWord;
    if (!wordModel) {
      return NextResponse.json({ error: "Không tìm thấy bảng Word trong CSDL" }, { status: 500 });
    }

    let words = [];

    try {
      // 1. Thử lấy danh sách và sắp xếp theo ngày tạo
      words = await wordModel.findMany({
        where: { setId: setId },
        orderBy: { createdAt: 'asc' } 
      });
    } catch (e) {
      console.warn("⚠️ Bảng Word thiếu cột createdAt, đang lấy danh sách không sắp xếp...");
      // 2. Fallback: Nếu thiếu cột createdAt thì lấy danh sách cơ bản
      words = await wordModel.findMany({
        where: { setId: setId }
      });
    }

    return NextResponse.json(words);
  } catch (error: any) {
    console.error("❌ Lỗi API lấy từ vựng của bộ từ:", error.message || error);
    return NextResponse.json({ error: "Lỗi Server Nội Bộ" }, { status: 500 });
  }
}