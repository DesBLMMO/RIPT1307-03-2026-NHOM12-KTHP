"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname , useRouter } from 'next/navigation';
import { Flex, Box, Text, HStack, VStack, Image, Button, Input, Spinner } from '@chakra-ui/react';
import { 
  Home, LayoutGrid, BookOpen, PlayCircle, ShoppingBag, Award, 
  ChevronsLeft, Moon, User as UserIcon, X, Calendar, Mail, 
  Edit2, LogOut, Save, Volume2, Globe, Bell
} from 'lucide-react';
import { signOut } from 'next-auth/react'; 

const navItems = [
  { name: 'Trang chủ', href: '/', icon: Home, color: '#3b82f6', activeBg: '#bfdbfe', textColor: '#1d4ed8' },
  { name: 'Bộ từ vựng', href: '/bo-tu-vung', icon: LayoutGrid, color: '#a855f7', activeBg: '#e9d5ff', textColor: '#7e22ce' },
  { name: 'Từ vựng', href: '/tu-vung', icon: BookOpen, color: '#22c55e', activeBg: '#bbf7d0', textColor: '#15803d' },
  { name: 'Game phản xạ', href: '/game', icon: PlayCircle, color: '#f97316', activeBg: '#fed7aa', textColor: '#c2410c' },
  { name: 'Cửa hàng', href: '/cua-hang', icon: ShoppingBag, color: '#eab308', activeBg: '#fef08a', textColor: '#a16207' },
  { name: 'Xếp hạng', href: '/xep-hang', icon: Award, color: '#ef4444', activeBg: '#fecaca', textColor: '#b91c1c' },
];

// Nút gạt bật/tắt (Toggle) liên kết dữ liệu trực tiếp với Database
const CustomSwitch = ({ isChecked, onChange }: { isChecked: boolean, onChange: (val: boolean) => void }) => {
  return (
    <Flex w="44px" h="24px" bg={isChecked ? "#3b82f6" : "#e2e8f0"} borderRadius="full" align="center" px="2px" cursor="pointer" onClick={() => onChange(!isChecked)} transition="background-color 0.2s" mt={2}>
      <Box w="20px" h="20px" bg="white" borderRadius="full" shadow="sm" transform={isChecked ? "translateX(20px)" : "translateX(0)"} transition="transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" />
    </Flex>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Khởi tạo State đầy đủ các trường đồng bộ dữ liệu thật
  const [userData, setUserData] = useState({
    name: 'Đang tải...',
    email: '...',
    coins: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=d1fae5',
    targetExam: '',
    createdAt: '...',
    voice: 'auto',
    language: 'gb',
    reminder: true
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // States dành riêng cho chức năng chỉnh sửa Tên hiển thị tại chỗ
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      
      // Nếu thành công (Mã 200)
      if (res.ok) {
        const data = await res.json();
        const formattedDate = data.targetExam ? new Date(data.targetExam).toISOString().split('T')[0] : '';
        setUserData({
          name: data.name || 'Người dùng',
          email: data.email || 'Chưa cập nhật email',
          coins: data.coins || 0,
          avatar: data.coverImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=d1fae5',
          targetExam: formattedDate,
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : '--/--/----',
          voice: data.voice || 'auto',
          language: data.language || 'gb',
          reminder: data.reminder !== undefined ? data.reminder : true
        });
      } 
      // NẾU BỊ CHẶN (MÃ 401 CHƯA ĐĂNG NHẬP) -> ĐÁ VỀ TRANG LOGIN
      else if (res.status === 401) {
        router.push('/dang-nhap'); 
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  useEffect(() => {
    fetchUserProfile();
    const handleProfileUpdate = () => fetchUserProfile();
    window.addEventListener('updateProfile', handleProfileUpdate);
    return () => window.removeEventListener('updateProfile', handleProfileUpdate);
  }, []);

  const handleEditClick = () => {
    setEditName(userData.name);
    setIsEditing(true);
  };

  // Hàm xử lý lưu tên hiển thị mới
  const handleSaveProfile = async () => {
    if (!editName.trim()) return alert("Tên hiển thị không được bỏ trống!");
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      
      if (res.ok) {
        setUserData(prev => ({ ...prev, name: editName }));
        setIsEditing(false);
      } else {
        alert("Lưu thất bại! Vui lòng thử lại.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsSaving(false);
    }
  };

  // HÀM ĐA NĂNG: Tự động đồng bộ các tuỳ chỉnh chọn (Ngày thi, Giọng, Ngôn ngữ, Nhắc nhở) lên DB
  const handleUpdatePreference = async (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
    } catch (error) {
      console.error(`Lỗi cập nhật cấu hình trường ${field}:`, error);
    }
  };

  // Chức năng phát âm thử giọng nói AI thực tế dựa trên ngôn ngữ đã chọn
  const handleTestAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = userData.language === 'gb' ? "Welcome to luyentu.com! This is British English voice." : "Welcome to luyentu.com! This is American English voice.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = userData.language === 'gb' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ Web Speech API.");
    }
  };

  // Đăng xuất và đá link chuyển hướng tài khoản về trang login/register
  const handleLogout = () => {
    if(confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
       signOut({ callbackUrl: '/dang-nhap' });
    }
  };

  return (
    <>
      <Flex as="aside" w="280px" bg="white" borderRightWidth="1px" borderColor="gray.100" direction="column" h="full" flexShrink={0}>
        <Flex h="16" align="center" px={6}>
          <Text fontSize="2xl" fontWeight="bold" color="purple.700">chantude.com</Text>
        </Flex>

        <Flex flex={1} overflowY="auto" px={4} py={2} direction="column" gap={2} className="custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={item.name} style={{ textDecoration: 'none' }}>
                <HStack 
                  px={3} py={2.5} borderRadius="2xl" transition="all 0.2s ease-in-out" 
                  fontWeight="extrabold" fontSize="15px" 
                  bg={isActive ? item.activeBg : 'transparent'} 
                  color={isActive ? item.textColor : 'gray.500'} 
                  _hover={!isActive ? { bg: 'gray.50', color: 'gray.700' } : {}}
                  role="group" gap={3}
                >
                  <Flex w={10} h={10} borderRadius="xl" align="center" justify="center" bg={isActive ? item.color : 'transparent'} color={isActive ? 'white' : item.color} shadow={isActive ? `0 4px 10px ${item.color}40` : 'none'} transition="all 0.3s" _groupHover={!isActive ? { bg: item.activeBg, transform: 'scale(1.15)' } : {}} flexShrink={0}>
                    <item.icon size={22} strokeWidth={2.5} />
                  </Flex>
                  <Text transition="transform 0.2s" _groupHover={!isActive ? { transform: 'translateX(4px)' } : {}}>{item.name}</Text>
                </HStack>
              </Link>
            )
          })}
        </Flex>

        <Box p={4} borderTopWidth="1px" borderColor="gray.100">
          <Box onClick={() => { setIsProfileOpen(true); setIsEditing(false); }} cursor="pointer" display="block" role="group">
            <HStack mb={4} _hover={{ bg: 'gray.50' }} p={2} borderRadius="xl" transition="all 0.2s">
              <Flex w={10} h={10} borderRadius="full" bg="green.100" align="center" justify="center" overflow="hidden" flexShrink={0}>
                <Image src={userData.avatar} alt="Avatar" w="full" h="full" objectFit="cover" transition="transform 0.3s" _groupHover={{ transform: 'scale(1.1)' }} />
              </Flex>
              <Box flex={1} overflow="hidden">
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {isLoadingProfile ? <Spinner size="xs" /> : userData.name}
                </Text>
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">Nhấn để xem hồ sơ</Text>
              </Box>
              <UserIcon size={16} color="gray.400" />
            </HStack>
          </Box>

          <HStack gap={2}>
            <Flex flex={1} align="center" justify="center" gap={2} bg="#f0f9ff" color="blue.500" fontWeight="bold" py={2} borderRadius="xl" fontSize="sm" transition="all 0.3s">
              <Flex w={5} h={5} bg="yellow.400" borderRadius="full" color="white" align="center" justify="center" fontSize="10px">$</Flex>
              {isLoadingProfile ? <Spinner size="xs" color="blue.500" /> : userData.coins}
            </Flex>
            <Flex cursor="pointer" align="center" justify="center" gap={2} color="gray.600" fontWeight="medium" py={2} px={4} borderRadius="xl" _hover={{ bg: 'gray.50' }} borderWidth="1px" borderColor="gray.100" fontSize="sm" transition="all 0.2s">
              <Moon size={16} /> Tối
            </Flex>
          </HStack>
        </Box>
      </Flex>

      {/* POP-UP MODAL HỒ SƠ NGƯỜI DÙNG - ĐÃ HOÀN THIỆN TOÀN BỘ CHỨC NĂNG */}
      {isProfileOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} align="center" justify="center" p={4} bg="rgba(0,0,0,0.5)" backdropFilter="blur(4px)" onClick={() => setIsProfileOpen(false)}>
          <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" w="full" maxW="550px" shadow="2xl" position="relative" maxH="95vh" overflowY="auto" className="custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <Flex cursor="pointer" position="absolute" top={4} right={4} p={2} color="gray.400" _hover={{ color: 'gray.800', bg: 'gray.100' }} borderRadius="full" transition="all 0.2s" onClick={() => setIsProfileOpen(false)} zIndex={2}>
              <X size={24} />
            </Flex>

            {/* HEADER AVATAR & TÊN */}
            <Flex direction="column" align="center" gap={4} mb={8} mt={4}>
              <Box w="90px" h="90px" borderRadius="full" overflow="hidden" shadow="sm" bg="green.100">
                <Image src={userData.avatar} alt="Avatar" w="full" h="full" objectFit="cover" />
              </Box>
              {isEditing ? (
                <HStack w="full" px={4} justify="center">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} textAlign="center" fontWeight="black" fontSize="lg" borderRadius="full" borderColor="blue.400" bg="blue.50" maxW="200px" />
                  <Button bg="#58cc02" color="white" borderRadius="full" px={6} onClick={handleSaveProfile} {...({ loading: isSaving } as any)} _hover={{ bg: '#46a302' }}>Lưu</Button>
                </HStack>
              ) : (
                <Text fontSize="2xl" fontWeight="black" color="gray.800">{userData.name}</Text>
              )}
            </Flex>

            <VStack gap={5} align="stretch">
              
              {/* 1. NGÀY THI MỤC TIÊU (ĐÃ KẾT NỐI TỰ ĐỘNG ĐỒNG BỘ) */}
              <Box bg="white" p={4} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" shadow="sm">
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack gap={3}>
                    <Calendar size={22} color="#22c55e" />
                    <Text fontWeight="bold" fontSize="md" color="gray.700">Ngày thi mục tiêu</Text>
                  </HStack>
                  <Input 
                    type="date" 
                    value={userData.targetExam} 
                    onChange={(e) => handleUpdatePreference('targetExam', e.target.value)}
                    w="160px" 
                    borderRadius="xl" 
                    size="sm" 
                    bg="gray.50"
                    textAlign="center"
                    fontWeight="bold"
                    borderColor="gray.200"
                  />
                </Flex>
                <Text fontSize="xs" color="gray.400" ml={9}>
                  Chọn ngày thi để hiển thị đồng hồ đếm ngược trên Header.
                </Text>
              </Box>

              {/* 2. THÔNG TIN EMAIL VÀ NGÀY THAM GIA */}
              <Box bg="white" p={5} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" shadow="sm">
                <VStack align="stretch" gap={4}>
                  <HStack gap={3}>
                    <Mail size={18} color="gray.400" />
                    <Text fontSize="sm" color="gray.500" w="110px">Email:</Text>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">{userData.email}</Text>
                  </HStack>
                  <HStack gap={3}>
                    <Calendar size={18} color="gray.400" />
                    <Text fontSize="sm" color="gray.500" w="110px">Ngày tham gia:</Text>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">{userData.createdAt}</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* 3. GIỌNG PHÁT ÂM (KẾT NỐI STATE & NGHE THỬ) */}
              <Box bg="white" p={5} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" shadow="sm">
                <Flex justify="space-between" align="center" mb={4}>
                  <HStack gap={3}>
                    <Volume2 size={22} color="#22c55e" />
                    <Text fontWeight="bold" fontSize="md" color="gray.700">Giọng phát âm</Text>
                  </HStack>
                  <Button size="sm" variant="outline" borderRadius="full" px={4} fontWeight="bold" fontSize="xs" borderColor="gray.200" onClick={handleTestAudio}>
                    Nghe thử
                  </Button>
                </Flex>
                
                <Box position="relative" mb={4}>
                  <Box 
                    as="select" w="full" borderRadius="xl" bg="gray.50" fontSize="sm" fontWeight="bold" p={3} borderWidth="1px" borderColor="gray.200" outline="none" cursor="pointer" color="gray.700"
                    {...({
                      value: userData.voice,
                      onChange: (e: any) => handleUpdatePreference('voice', e.target.value)
                    } as any)}
                  >
                    <option value="auto">Tự động chọn giọng tốt nhất</option>
                    <option value="male">Giọng phát âm Nam (Male)</option>
                    <option value="female">Giọng phát âm Nữ (Female)</option>
                  </Box>
                </Box>

                <VStack align="start" gap={1} ml={1}>
                  <Text fontSize="11px" color="gray.400" lineHeight="tall">
                    Edge chỉ hiển thị các giọng mà trình duyệt hoặc thiết bị của bạn đang có.
                  </Text>
                  <Text fontSize="11px" color="gray.400" lineHeight="tall">
                    Nếu giọng đã chọn không còn khả dụng, hệ thống sẽ tự quay về chế độ tự động.
                  </Text>
                </VStack>
              </Box>

              {/* 4. NÚT ĐỔI TÊN HÀNH ĐỘNG NHANH */}
              {!isEditing && (
                <Button 
                  variant="outline" 
                  w="full" 
                  h="55px" 
                  borderRadius="2xl" 
                  fontWeight="bold"
                  fontSize="sm"
                  color="gray.700"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.50' }}
                  onClick={handleEditClick}
                  gap={2}
                >
                  <Edit2 size={18} /> Đổi tên hiển thị
                </Button>
              )}

              {/* 5. NGÔN NGỮ PHÁT ÂM (KẾT NỐI STATE ĐỒNG BỘ) */}
              <Box bg="white" p={5} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" shadow="sm">
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack gap={3}>
                    <Globe size={22} color="#3b82f6" />
                    <Text fontWeight="bold" fontSize="md" color="gray.700">Ngôn ngữ phát âm</Text>
                  </HStack>
                  <Box 
                    as="select" w="140px" borderRadius="xl" p={2} fontSize="sm" fontWeight="bold" bg="gray.50" borderWidth="1px" borderColor="gray.200" outline="none" cursor="pointer" color="gray.700"
                    {...({
                      value: userData.language,
                      onChange: (e: any) => handleUpdatePreference('language', e.target.value)
                    } as any)}
                  >
                    <option value="gb">GB Tiếng Anh</option>
                    <option value="us">US Tiếng Anh</option>
                  </Box>
                </Flex>
                <Text fontSize="xs" color="gray.400" ml={9}>
                  Chọn ngôn ngữ để thay đổi giọng phát âm trong game và từ vựng.
                </Text>
              </Box>

              {/* 6. NHẮC NHỞ HỌC TỪ (ĐỒNG BỘ STATE CHO SWITCH) */}
              <Box bg="white" p={5} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" shadow="sm">
                <Flex justify="space-between" align="start">
                  <HStack gap={3} align="start">
                    <Bell size={22} color="#f59e0b" />
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" fontSize="md" color="gray.700">Nhắc nhở học từ</Text>
                      <Text fontSize="xs" color="gray.500" lineHeight="tall" pr={4}>
                        Khi bật, hệ thống sẽ nhắc lúc 8h sáng với từ đến hạn và 15h chiều với từ đến hạn kèm 5 từ chưa thuộc.
                      </Text>
                    </VStack>
                  </HStack>
                  <CustomSwitch isChecked={userData.reminder} onChange={(val) => handleUpdatePreference('reminder', val)} />
                </Flex>
              </Box>

              {/* 7. NÚT ĐĂNG XUẤT CHUYỂN HƯỚNG TRANG */}
              <Button 
                variant="ghost" 
                w="full" 
                h="55px" 
                borderRadius="2xl" 
                color="red.500"
                fontWeight="bold"
                _hover={{ bg: 'red.50' }}
                mt={2}
                onClick={handleLogout}
                gap={2}
              >
                <LogOut size={20} /> Đăng xuất tài khoản
              </Button>

            </VStack>
          </Box>
        </Flex>
      )}
    </>
  );
}