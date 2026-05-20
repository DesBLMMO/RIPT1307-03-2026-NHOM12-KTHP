import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    
    // Kiểm tra kỹ email để tránh lỗi type null của TypeScript
    const userEmail = session?.user?.email;
    if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Lấy tất cả các quan hệ liên quan đến user này
    const streaks = await prisma.sharedStreak.findMany({
      where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
      include: {
        sender: { select: { id: true, name: true, coverImage: true, email: true } },
        receiver: { select: { id: true, name: true, coverImage: true, email: true } }
      }
    });

    // Ép kiểu tường minh bằng "as any[]" để triệt tiêu hoàn toàn lỗi 7034 và 7005
    const friends = [] as any[];
    const receivedInvites = [] as any[];
    const sentInvites = [] as any[];

    // Khai báo rõ kiểu (s: any) cho tham số để sửa lỗi 7006
    streaks.forEach((s: any) => {
      const isSender = s.senderId === user.id;
      const friendData = isSender ? s.receiver : s.sender;
      
      if (s.status === 'ACCEPTED') {
        friends.push({ id: s.id, friend: friendData, streakCount: s.streakCount });
      } else if (s.status === 'PENDING') {
        if (isSender) {
          sentInvites.push({ id: s.id, friend: friendData });
        } else {
          receivedInvites.push({ id: s.id, friend: friendData });
        }
      }
    });

    return NextResponse.json({ success: true, friends, receivedInvites, sentInvites });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    const senderEmail = session?.user?.email;
    if (!senderEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await req.json();
    
    const sender = await prisma.user.findUnique({ where: { email: senderEmail } });
    const receiver = await prisma.user.findUnique({ where: { email: email } });

    if (!sender) return NextResponse.json({ error: "Không tìm thấy người gửi" }, { status: 404 });
    if (!receiver) return NextResponse.json({ error: "Không tìm thấy người dùng này" }, { status: 404 });
    if (sender.id === receiver.id) return NextResponse.json({ error: "Không thể tự kết bạn" }, { status: 400 });

    const exist = await prisma.sharedStreak.findFirst({
      where: { OR: [ { senderId: sender.id, receiverId: receiver.id }, { senderId: receiver.id, receiverId: sender.id } ] }
    });

    if (exist) return NextResponse.json({ error: "Đã gửi lời mời hoặc đã là bạn bè" }, { status: 400 });

    await prisma.sharedStreak.create({
      data: { senderId: sender.id, receiverId: receiver.id }
    });

    return NextResponse.json({ success: true, message: "Đã gửi lời mời!" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { streakId } = await req.json();
    await prisma.sharedStreak.update({
      where: { id: streakId },
      data: { status: 'ACCEPTED' }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}