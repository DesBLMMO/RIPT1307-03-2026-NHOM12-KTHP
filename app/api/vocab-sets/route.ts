import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const setModel = (prisma as any).vocabSet || (prisma as any).VocabSet || (prisma as any).set;
    if (!setModel) return NextResponse.json({ error: "Lỗi cấu hình CSDL" }, { status: 500 });

    // Lấy danh sách an toàn, bao gồm cả mảng words để đếm số lượng
    const vocabSets = await setModel.findMany({
      include: { words: true } 
    });

    // Đảo ngược mảng để bộ từ mới tạo lên đầu (an toàn hơn dùng orderBy createdAt nếu DB thiếu cột)
    const reversedSets = vocabSets.reverse();

    const formattedSets = reversedSets.map((set: any) => ({
      id: set.id,
      title: set.title,
      // Map đúng tên cột description trong DB của bạn
      desc: set.description || set.desc || "Không có mô tả",
      emoji: set.emoji || "📚",
      emojiBg: set.emojiBg || "#f1f5f9",
      words: set.words ? set.words.length : 0,
      progress: 0 
    }));

    return NextResponse.json(formattedSets);
  } catch (error: any) {
    console.error("❌ Lỗi GET /api/vocab-sets:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, desc, emoji, emojiBg } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Tiêu đề không được để trống" }, { status: 400 });

    const setModel = (prisma as any).vocabSet || (prisma as any).VocabSet || (prisma as any).set;

    // Chuẩn bị dữ liệu an toàn (đổi desc thành description cho khớp DB)
    const safeData: any = {
      title: title.trim(),
      description: desc || "Không có mô tả", 
    };

    try {
      // Thử lưu đầy đủ cả emoji
      const newVocabSet = await setModel.create({
        data: { ...safeData, emoji: emoji || "📚", emojiBg: emojiBg || "#f1f5f9" }
      });
      return NextResponse.json({ success: true, data: newVocabSet });
    } catch (e: any) {
      // NẾU DATABASE CHƯA CÓ CỘT EMOJI -> LƯU THEO CÁCH CŨ CHỐNG SẬP
      console.warn("⚠️ DB thiếu cột emoji, đang lưu theo cấu trúc cũ...");
      const fallbackSet = await setModel.create({ data: safeData });
      return NextResponse.json({ success: true, data: fallbackSet });
    }

  } catch (error: any) {
    console.error("❌ Lỗi POST /api/vocab-sets:", error);
    return NextResponse.json({ error: "Lỗi Server", details: error.message }, { status: 500 });
  }
}