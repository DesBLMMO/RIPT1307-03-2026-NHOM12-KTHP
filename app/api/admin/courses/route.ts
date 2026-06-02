import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ success: false }, { status: 401 });

    const adminCheck = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!adminCheck || adminCheck.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

    const courses = await prisma.vocabSet.findMany({
      orderBy: { createdAt: "desc" },
      include: { words: true }
    });

    // Thêm wordCount để UI hiển thị số từ
    const data = courses.map((c: any) => ({
      ...c,
      wordCount: c.words?.length || 0,
      words: undefined
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("❌ Lỗi GET courses:", error.message);
    return NextResponse.json({ success: false, error: "Lỗi lấy dữ liệu lộ trình" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ success: false }, { status: 401 });

    const adminCheck = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!adminCheck || adminCheck.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

    const body = await req.json();
    const { title, category, difficulty, isPro, description } = body;

    if (!title || !category) {
      return NextResponse.json({ success: false, error: "Thiếu tên hoặc danh mục" }, { status: 400 });
    }

    const newCourse = await prisma.vocabSet.create({
      data: {
        title,
        category,
        difficulty: Number(difficulty) || 1,
        isPremium: Boolean(isPro),
        description: description || "",
      }
    });

    return NextResponse.json({ success: true, data: newCourse });
  } catch (error: any) {
    console.error("❌ Lỗi POST courses:", error.message);
    return NextResponse.json({ success: false, error: "Lỗi tạo lộ trình" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ success: false }, { status: 401 });

    const adminCheck = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!adminCheck || adminCheck.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

    const body = await req.json();
    const { id, title, category, difficulty, isPro, description } = body;

    if (!id) return NextResponse.json({ success: false, error: "Thiếu ID" }, { status: 400 });

    const updatedCourse = await prisma.vocabSet.update({
      where: { id },
      data: {
        title,
        category,
        difficulty: Number(difficulty) || 1,
        isPremium: Boolean(isPro),
        description: description || "",
      }
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (error: any) {
    console.error("❌ Lỗi PATCH courses:", error.message);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ success: false }, { status: 401 });

    const adminCheck = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!adminCheck || adminCheck.role !== "ADMIN") return NextResponse.json({ success: false }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    // Xóa words trước rồi mới xóa set (tránh lỗi relation)
    await prisma.word.deleteMany({ where: { setId: id } });
    await prisma.vocabSet.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa thành công" });
  } catch (error: any) {
    console.error("❌ Lỗi DELETE courses:", error.message);
    return NextResponse.json({ success: false, error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}
