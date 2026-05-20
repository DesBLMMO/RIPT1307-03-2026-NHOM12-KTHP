import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const setId = params?.id;
    const body = await req.json();
    const { title, desc, emoji, emojiBg } = body;

    if (!setId) return NextResponse.json({ error: "Thiếu ID bộ từ" }, { status: 400 });

    const setModel = (prisma as any).vocabSet || (prisma as any).VocabSet || (prisma as any).set;

    const safeData: any = {
      title: title?.trim(),
      description: desc, // Lưu vào đúng cột description
    };

    try {
      // Thử cập nhật cả emoji
      const updatedSet = await setModel.update({
        where: { id: setId },
        data: { ...safeData, emoji, emojiBg }
      });
      return NextResponse.json({ success: true, data: updatedSet });
    } catch (e: any) {
      // Nếu lỗi do thiếu cột emoji, cập nhật thông tin cơ bản
      const fallbackSet = await setModel.update({
        where: { id: setId },
        data: safeData
      });
      return NextResponse.json({ success: true, data: fallbackSet });
    }
  } catch (error: any) {
    console.error("❌ Lỗi PATCH /api/vocab-sets/[id]:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const setId = params?.id;

    if (!setId) return NextResponse.json({ error: "Thiếu ID bộ từ" }, { status: 400 });

    const setModel = (prisma as any).vocabSet || (prisma as any).VocabSet || (prisma as any).set;
    await setModel.delete({ where: { id: setId } });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("❌ Lỗi DELETE /api/vocab-sets/[id]:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}