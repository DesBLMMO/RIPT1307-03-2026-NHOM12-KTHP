"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flex, Box, Text, HStack, VStack, Image, Button, Input } from '@chakra-ui/react';
import { Home, LayoutGrid, BookOpen, PlayCircle, ShoppingBag, Award, ChevronsLeft, Moon, Sun, User as UserIcon, X, Calendar, Mail, Volume2, Edit2, Globe, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Trang chủ', href: '/', icon: Home, color: '#3b82f6', activeBg: '#eff6ff', activeColor: '#2563eb' },
  { name: 'Bộ từ vựng', href: '/bo-tu-vung', icon: LayoutGrid, color: '#a855f7', activeBg: '#faf5ff', activeColor: '#9333ea' },
  { name: 'Từ vựng', href: '/tu-vung', icon: BookOpen, color: '#22c55e', activeBg: '#f0fdf4', activeColor: '#16a34a' },
  { name: 'Game phản xạ', href: '/game', icon: PlayCircle, color: '#f97316', activeBg: '#fff7ed', activeColor: '#ea580c' },
  { name: 'Cửa hàng', href: '/cua-hang', icon: ShoppingBag, color: '#eab308', activeBg: '#fefce8', activeColor: '#ca8a04' },
  { name: 'Xếp hạng', href: '/xep-hang', icon: Award, color: '#f87171', activeBg: '#fef2f2', activeColor: '#dc2626' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ==========================================
  // STATES: QUẢN LÝ DỮ LIỆU ĐỘNG
  // ==========================================
  const [userName, setUserName] = useState('Học viên');
  const [coins, setCoins] = useState(170);
  const [examDate, setExamDate] = useState('');
  const [language, setLanguage] = useState('us');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Lấy dữ liệu từ LocalStorage khi khởi tạo
  useEffect(() => {
    setUserName(localStorage.getItem('luyentu_user_name') || 'Dũng Trần');
    
    const savedCoins = localStorage.getItem('luyentu_coins');
    if (savedCoins) setCoins(Number(savedCoins));

    setExamDate(localStorage.getItem('luyentu_exam_date') || '');
    setLanguage(localStorage.getItem('luyentu_language') || 'us');
    setIsDarkMode(localStorage.getItem('luyentu_theme') === 'dark');
  }, [isProfileOpen]);

  // ==========================================
  // LOGIC CÁC CHỨC NĂNG
  // ==========================================
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem('luyentu_is_authenticated');
      localStorage.removeItem('luyentu_user_name');
      window.location.href = '/dang-nhap';
    }
  };

  const handleNameChange = () => {
    const newName = window.prompt("Nhập tên hiển thị mới của bạn:", userName);
    if (newName && newName.trim() !== '') {
      setUserName(newName.trim());
      localStorage.setItem('luyentu_user_name', newName.trim());
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setExamDate(val);
    localStorage.setItem('luyentu_exam_date', val);
  };

  const handleLanguageChange = (e: any) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('luyentu_language', val);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('luyentu_theme', newTheme ? 'dark' : 'light');
  };

  return (
    <>
      <Flex as="aside" w="280px" bg="white" borderRightWidth="1px" borderColor="gray.100" direction="column" h="full" flexShrink={0}>
        <Flex h="16" align="center" px={6}>
          <Text fontSize="2xl" fontWeight="bold" color="purple.700">luyentu.com</Text>
        </Flex>

        <Flex flex={1} overflowY="auto" px={4} py={2} direction="column" gap={1} className="custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={item.name} style={{ textDecoration: 'none' }}>
                <HStack 
                  role="group" // Quan trọng: Thêm role="group" để làm hiệu ứng hover cho Icon bên trong
                  px={4} py={3.5} 
                  borderRadius="2xl" 
                  transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" 
                  fontWeight="bold" 
                  bg={isActive ? item.activeBg : 'transparent'} 
                  color={isActive ? item.activeColor : 'gray.600'} 
                  _hover={!isActive ? { 
                    bg: item.activeBg, 
                    color: item.activeColor,
                    transform: 'translateX(6px)' // Trượt sang phải
                  } : {}}
                >
                  <Box 
                    color={isActive ? item.activeColor : item.color}
                    transition="all 0.3s"
                    _groupHover={{ transform: 'scale(1.15) rotate(-5deg)' }} // Nảy Icon
                  >
                    <item.icon size={22} strokeWidth={isActive ? 3 : 2.5} />
                  </Box>
                  <Text>{item.name}</Text>
                </HStack>
              </Link>
            )
          })}
          <Box mt={4} borderTopWidth="1px" borderColor="gray.100" pt={4} px={2}>
            <Flex cursor="pointer" w="full" justify="center" py={2} color="gray.500" _hover={{ bg: 'gray.50', color: 'gray.800', transform: 'translateX(-4px)' }} transition="all 0.2s" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
              <ChevronsLeft size={20} />
            </Flex>
          </Box>
        </Flex>

        {/* THÔNG TIN NGƯỜI DÙNG BÊN DƯỚI */}
        <Box p={4} borderTopWidth="1px" borderColor="gray.100">
          <Box onClick={() => setIsProfileOpen(true)} cursor="pointer" display="block" role="group">
            <HStack mb={4} _hover={{ bg: 'blue.50' }} p={2} borderRadius="xl" transition="all 0.2s">
              <Flex 
                w={10} h={10} borderRadius="full" bg="green.100" align="center" justify="center" 
                overflow="hidden" flexShrink={0} transition="all 0.3s" _groupHover={{ transform: 'scale(1.05)' }}
              >
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=d1fae5" alt="Avatar" w="full" h="full" objectFit="cover" />
              </Flex>
              <Box flex={1} overflow="hidden">
                <Text fontWeight="bold" fontSize="sm" color="gray.800" _groupHover={{ color: 'blue.600' }} transition="all 0.2s" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{userName}</Text>
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">Nhấn để xem hồ sơ</Text>
              </Box>
              <UserIcon size={16} color="gray.400" />
            </HStack>
          </Box>

          <HStack gap={2} mb={3}>
            <Flex flex={1} align="center" justify="center" gap={2} bg="#f0f9ff" color="blue.500" fontWeight="bold" py={2} borderRadius="xl" fontSize="sm">
              <Flex w={5} h={5} bg="yellow.400" borderRadius="full" color="white" align="center" justify="center" fontSize="10px">$</Flex>
              {coins.toLocaleString()}
            </Flex>
            <Flex onClick={toggleTheme} cursor="pointer" align="center" justify="center" gap={2} color="gray.600" fontWeight="medium" py={2} px={4} borderRadius="xl" _hover={{ bg: 'gray.100' }} transition="all 0.2s" borderWidth="1px" borderColor="gray.100" fontSize="sm">
              {isDarkMode ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} />} 
              {isDarkMode ? 'Sáng' : 'Tối'}
            </Flex>
          </HStack>

          {/* NÚT ĐĂNG XUẤT */}
          <Button 
            w="full" variant="ghost" color="red.500" fontWeight="bold" fontSize="sm" 
            h={10} borderRadius="xl" 
            transition="all 0.2s"
            _hover={{ bg: 'red.50', color: 'red.600', transform: 'translateY(-2px)' }} 
            onClick={handleLogout}
            justifyContent="center" gap={2}
          >
            <LogOut size={18} strokeWidth={2.5} />
            Đăng xuất
          </Button>
        </Box>
      </Flex>

      {/* POP-UP (MODAL) HỒ SƠ */}
      {isProfileOpen && (
        <Flex 
          position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} 
          align="center" justify="center" p={4} bg="rgba(0,0,0,0.4)" backdropFilter="blur(4px)"
          onClick={() => setIsProfileOpen(false)}
        >
          <Box 
            bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" w="full" maxW="500px" 
            shadow="xl" position="relative" maxH="90vh" overflowY="auto" className="custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex cursor="pointer" position="absolute" top={4} right={4} p={2} color="gray.400" _hover={{ color: 'gray.800', bg: 'gray.100' }} borderRadius="full" transition="all 0.2s" onClick={() => setIsProfileOpen(false)}>
              <X size={20} />
            </Flex>

            <VStack gap={5} align="stretch" mt={2}>
              <Flex direction="column" align="center" gap={3}>
                <Box w="80px" h="80px" borderRadius="full" overflow="hidden" shadow="sm" bg="green.100">
                  <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=d1fae5" alt="Avatar" w="full" h="full" objectFit="cover" />
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">{userName}</Text>
              </Flex>

              <Box bg="white" borderRadius="2xl" p={4} borderWidth="1px" borderColor="gray.200">
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack gap={2}>
                    <Calendar size={18} color="#22c55e" />
                    <Text fontWeight="bold" color="gray.800" fontSize="sm">Ngày thi mục tiêu</Text>
                  </HStack>
                  <Input type="date" value={examDate} onChange={handleDateChange} w="auto" borderRadius="full" size="sm" borderColor="gray.200" color="gray.600" _focus={{ borderColor: "blue.400", shadow: "none" }} />
                </Flex>
                <Text fontSize="xs" color="gray.500" mt={2}>Chọn ngày thi để hiển thị đồng hồ đếm ngược trên Header.</Text>
              </Box>

              <Box bg="gray.50" borderRadius="2xl" p={4}>
                <VStack align="stretch" gap={3}>
                  <HStack gap={2}>
                    <Mail size={16} color="#9ca3af" />
                    <Text color="gray.600" fontSize="sm">Email:</Text>
                    <Text fontWeight="bold" color="gray.800" fontSize="sm" wordBreak="break-word">
                      {userName.toLowerCase().replace(/\s+/g, '')}@gmail.com
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Calendar size={16} color="#9ca3af" />
                    <Text color="gray.600" fontSize="sm">Ngày tham gia:</Text>
                    <Text fontWeight="bold" color="gray.800" fontSize="sm">Hôm nay</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box bg="white" borderRadius="2xl" p={4} borderWidth="1px" borderColor="gray.200">
                <Flex justify="space-between" align="center" mb={4}>
                  <HStack gap={2}>
                    <Volume2 size={18} color="#22c55e" />
                    <Text fontWeight="bold" color="gray.800" fontSize="sm">Giọng phát âm</Text>
                  </HStack>
                  <Button size="sm" variant="outline" borderRadius="full" fontWeight="bold" fontSize="xs" borderColor="gray.200">Nghe thử</Button>
                </Flex>
                <Box as="select" mb={4} w="full" borderRadius="full" px={3} py={2} fontSize="sm" borderWidth="1px" borderColor="gray.200" color="gray.700" bg="white" outline="none" cursor="pointer" _focus={{ borderColor: "blue.400" }}>
                  <option>Tự động chọn giọng tốt nhất</option>
                  <option>Giọng Nam</option>
                  <option>Giọng Nữ</option>
                </Box>
                <VStack align="start" gap={2}>
                  <Text fontSize="xs" color="gray.500" lineHeight="tall">Hệ thống chỉ hiển thị các giọng mà trình duyệt hoặc thiết bị của bạn đang hỗ trợ.</Text>
                </VStack>
              </Box>

              <Button onClick={handleNameChange} variant="outline" w="full" borderRadius="full" py={5} gap={2} borderColor="gray.200" color="gray.700" _hover={{ bg: 'blue.50', color: 'blue.600', borderColor: 'blue.200' }} transition="all 0.2s" fontWeight="bold" fontSize="sm">
                <Edit2 size={16} /> Đổi tên hiển thị
              </Button>

              <Box bg="white" borderRadius="2xl" p={4} borderWidth="1px" borderColor="gray.200">
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack gap={2}>
                    <Globe size={18} color="#3b82f6" />
                    <Text fontWeight="bold" color="gray.800" fontSize="sm">Ngôn ngữ phát âm</Text>
                  </HStack>
                  <Box as="select" value={language} onChange={handleLanguageChange} w="auto" borderRadius="full" px={3} py={1.5} fontSize="sm" borderWidth="1px" borderColor="gray.200" color="gray.700" fontWeight="bold" bg="white" outline="none" cursor="pointer" _focus={{ borderColor: "blue.400" }}>
                    <option value="gb">GB Tiếng Anh</option>
                    <option value="us">US Tiếng Anh</option>
                  </Box>
                </Flex>
                <Text fontSize="xs" color="gray.500" mt={3}>Chọn ngôn ngữ để thay đổi kiểu phát âm chuẩn trong game và thẻ từ vựng.</Text>
              </Box>
            </VStack>
          </Box>
        </Flex>
      )}
    </>
  );
}