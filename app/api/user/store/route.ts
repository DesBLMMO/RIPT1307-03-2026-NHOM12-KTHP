// file: app/api/user/store/route.ts
import { NextResponse } from 'next/server';
import { getServerAuthSession } from "@/lib/auth"; 
import { prisma } from '@/lib/prisma';
import { storeItems } from '@/lib/data'; 

const itemsList = storeItems as any[];

// 1. LẤY THÔNG TIN CỬA HÀNG
export async function GET(request: Request) {
  try {
    const session = await getServerAuthSession();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { items: true } 
    });

    if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

    const equippedItems: Record<string, string> = {};
    user.items.forEach(item => {
      if (item.isEquipped) {
        const found = itemsList.find((si: any) => String(si.id) === String(item.itemId));
        if (found && found.category) {
          equippedItems[found.category] = item.itemId;
        }
      }
    });

    return NextResponse.json({
      success: true,
      coins: user.coins,
      purchasedItems: user.items.map(item => item.itemId),
      equippedItems: equippedItems
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}

// 2. MUA & TỰ TẢI ẢNH LÊN
export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    const email = session?.user?.email;

    if (!email) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const { itemId, cost, isUploadAction, customImage } = await request.json();

    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user || user.coins < cost) {
      return NextResponse.json({ message: "Tài khoản không đủ số dư" }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { email: email },
        data: { coins: { decrement: cost } }
      });

      // 🔥 NẾU LÀ GÓI UPLOAD: Lưu ảnh vào DB
      if (isUploadAction && customImage) {
        // Tắt trang bị các hình nền cũ
        const themeItemIds = itemsList.filter((si: any) => ['theme', 'background', 'banner'].includes(si.category)).map(si => String(si.id));
        await tx.userItem.updateMany({
          where: { userId: u.id, itemId: { in: themeItemIds } },
          data: { isEquipped: false }
        });

        // Tắt các hình tự tải cũ
        const customItems = await tx.userItem.findMany({ where: { userId: u.id, itemId: { startsWith: 'data:image/' } } });
        if (customItems.length > 0) {
           await tx.userItem.updateMany({
              where: { id: { in: customItems.map(c => c.id) } },
              data: { isEquipped: false }
           });
        }

        // Tạo item mới bằng nội dung Base64 của ảnh
        await tx.userItem.create({
          data: { userId: u.id, itemId: customImage, isEquipped: true }
        });

        // Tự động đổi ảnh bìa User luôn
        await tx.user.update({
           where: { email: email },
           data: { coverImage: customImage }
        });
      } 
      // NẾU LÀ MUA VẬT PHẨM BÌNH THƯỜNG
      else if (!isUploadAction) {
        await tx.userItem.create({
          data: { userId: u.id, itemId: String(itemId), isEquipped: false }
        });
      }
      return u;
    });

    return NextResponse.json({ success: true, coins: updatedUser.coins });
  } catch (error: any) {
    return NextResponse.json({ message: "Giao dịch thất bại", error: error.message }, { status: 500 });
  }
}

// 3. NÚT TRANG BỊ
export async function PATCH(request: Request) {
  try {
    const session = await getServerAuthSession();
    const email = session?.user?.email;

    if (!email) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const { category, itemId } = await request.json();

    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

    const isCustom = String(itemId).startsWith('data:image/');
    const foundItem = itemsList.find((si: any) => String(si.id) === String(itemId));

    const itemIdsInCategory = itemsList.filter((si: any) => si.category === category).map((si: any) => String(si.id));

    await prisma.$transaction(async (tx) => {
      await tx.userItem.updateMany({
        where: { userId: user.id, itemId: { in: itemIdsInCategory } },
        data: { isEquipped: false }
      });

      await tx.userItem.updateMany({
        where: { userId: user.id, itemId: String(itemId) },
        data: { isEquipped: true }
      });

      // Nếu item đó thuộc nhóm hình nền, cập nhật coverImage
      if (isCustom) {
        await tx.user.update({ where: { email: email }, data: { coverImage: String(itemId) } });
      } else if (foundItem && ['theme', 'background', 'banner'].includes(category) && foundItem.image) {
        await tx.user.update({ where: { email: email }, data: { coverImage: foundItem.image } });
      }
    });

    const currentActiveItems = await prisma.userItem.findMany({
      where: { userId: user.id, isEquipped: true }
    });

    const newlyEquippedItems: Record<string, string> = {};
    currentActiveItems.forEach(item => {
      const found = itemsList.find((si: any) => String(si.id) === String(item.itemId));
      if (found && found.category) {
        newlyEquippedItems[found.category] = item.itemId;
      }
    });

    return NextResponse.json({ success: true, equippedItems: newlyEquippedItems });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi trang bị", error: error.message }, { status: 500 });
  }
}