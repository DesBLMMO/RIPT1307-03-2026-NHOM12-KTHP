import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    // Kiểm tra session để lấy ID người dùng nếu cần thiết
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const setId = searchParams.get("setId");

    let whereCondition: any = {};

    if (setId && setId !== 'Tất cả' && setId !== 'null' && setId !== 'undefined') {
      whereCondition.setId = setId;
    } else {
      // Vì VocabSet không có userId, nếu muốn lấy tất cả từ vựng,
      // chúng ta chỉ cần lấy tất cả từ mà không lọc qua VocabSet
      // Hoặc nếu bạn muốn lọc theo VocabSet, bạn cần thêm userId vào model VocabSet
      whereCondition = {}; 
    }

    const words = await prisma.word.findMany({
      where: whereCondition,
      include: {
        srsProgress: true // PHẢI CÓ DÒNG NÀY để biết từ đó đã được học chưa
    },
      orderBy: { word: 'asc' } 
    });

    return NextResponse.json(words);
  } catch (error: any) {
    console.error("Lỗi lấy danh sách từ vựng:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}