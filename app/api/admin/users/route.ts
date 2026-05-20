import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// 1. API GET: Lấy danh sách học viên theo trang (Pagination) và từ khóa (Search)
export async function GET(req: Request) {
  try {
    // 🔒 KIỂM TRA BẢO MẬT PHÂN QUYỀN (PHẦN 1)
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Bạn chưa đăng nhập hệ thống" }, { status: 401 });
    }

    const adminCheck = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!adminCheck || adminCheck.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Trang này chỉ dành cho Quản trị viên" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5"); // Hiển thị 5 dòng/trang để dễ test phân trang
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } }
      ]
    } : {};

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          coins: true,
          streakCount: true,
          isPro: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit
      }
    });
  } catch (error) {
    console.error("❌ Lỗi Admin GET Users:", error);
    return NextResponse.json({ success: false, error: "Lỗi lấy dữ liệu hệ thống" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }
    const adminCheck = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    if (!adminCheck || adminCheck.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, amount } = body;

    if (!userId) return NextResponse.json({ success: false, error: "Thiếu ID" }, { status: 400 });

    if (action === "ADD_COINS") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } }
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "TOGGLE_PRO") {
      const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } });
      if (!currentUser) return NextResponse.json({ success: false, error: "Không tìm thấy user" }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isPro: !currentUser.isPro }
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi cập nhật dữ liệu" }, { status: 500 });
  }
}