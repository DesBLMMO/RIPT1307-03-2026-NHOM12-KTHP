import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  }
);

export const config = {
  // Những trang bắt buộc phải có thẻ (Session Token) mới được vào
  matcher: ["/bo-tu-vung", "/tu-vung", "/game", "/cua-hang", "/xep-hang"]
};
