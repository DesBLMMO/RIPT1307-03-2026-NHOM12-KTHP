// app/layout.tsx
"use client";

import { usePathname } from 'next/navigation';
import { Providers } from './provider';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Flex, Box } from '@chakra-ui/react';
import { Inter } from 'next/font/google'; 
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], weight: ['400', '700'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/dang-nhap';

  return (
    <html lang="vi" className={inter.className}>
      <body>
        <Providers>
          <Flex h="100vh" w="100%" bg="#f8f9fa" overflow="hidden">
            {!isAuthPage && <Sidebar />}
            
            {/* FIX TẠI ĐÂY: Thêm minW={0} để ép khung này không bao giờ được phép bự hơn màn hình */}
            <Flex flex={1} direction="column" h="full" minW={0} bg={isAuthPage ? "transparent" : "white"}>
              {!isAuthPage && <Header />}
              
              {/* FIX TẠI ĐÂY: Thêm overflowX="hidden" để giấu đi mọi thứ chồi ra 2 bên */}
              <Box flex={1} overflowY="auto" overflowX="hidden" className="custom-scrollbar">
                {children}
              </Box>
            </Flex>

          </Flex>
        </Providers>
      </body>
    </html>
  );
}