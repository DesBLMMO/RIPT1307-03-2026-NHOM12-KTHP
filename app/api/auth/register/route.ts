
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra xem email đã được đăng ký chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email này đã tồn tại trên hệ thống" }, { status: 400 });
    }

    // Tiến hành mã hóa mật khẩu bảo mật
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới trong MongoDB
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        coins: 170, // Cấp số xu mặc định ban đầu
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Đăng ký tài khoản thành công!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}