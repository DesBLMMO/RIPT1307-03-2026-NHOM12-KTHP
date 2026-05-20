// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  // Những trang bắt buộc phải có thẻ (Session Token) mới được vào
  matcher: ["/bo-tu-vung", "/tu-vung", "/game", "/cua-hang", "/xep-hang"]
};