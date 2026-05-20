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
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi lấy dữ liệu lộ trình" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ success: false }, { status: 401 });

    const body = await req.json();
    const { title, category, difficulty, isPro } = body;

    const newCourse = await prisma.vocabSet.create({
      data: {
        title,
        category,
        difficulty: Number(difficulty),
        isPro: Boolean(isPro),
      }
    });

    return NextResponse.json({ success: true, data: newCourse });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi tạo lộ trình" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, category, difficulty, isPro } = body;

    const updatedCourse = await prisma.vocabSet.update({
      where: { id },
      data: {
        title,
        category,
        difficulty: Number(difficulty),
        isPro: Boolean(isPro),
      }
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    await prisma.vocabSet.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}