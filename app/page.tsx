"use client";
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; 
import { useVocabWords } from '@/hooks/useVocabWords';
import { 
  Box, Flex, Grid, GridItem, Image as ChakraImage, SimpleGrid, Text, 
  HStack, VStack, Button, Spinner, Center
} from '@chakra-ui/react';
import { 
  Flame, ArrowRight, Plus, Zap, Medal, Users, 
  ChevronLeft, ChevronRight, X, CheckCircle2, Pencil, Film, ImageIcon, ShoppingBag
} from 'lucide-react';

import { quickAccess, storeItems } from '@/lib/data'; 

interface CourseItem {
  id: string;
  title: string;
  sets: number;
  difficulty: number;
}

interface CourseCategory {
  category: string;
  count: number;
  note?: string;
  items: CourseItem[];
}

function HomeContent()  {
  const router = useRouter(); 
  const { data: session, status } = useSession(); 

  const { words, isLoading: isLoadingWords } = useVocabWords();

  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [days, setDays] = useState<string[]>(['', '', '', '', '', '', '']);
  const [streakData, setStreakData] = useState({ count: 0, history: [] as number[] });
  const [learnedDays, setLearnedDays] = useState<boolean[]>(Array(7).fill(false));
  const [courses, setCourses] = useState<CourseCategory[]>([]); 
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800");
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  
  const [coverTab, setCoverTab] = useState<'animated' | 'static' | 'purchased'>('animated');
  const [purchasedCovers, setPurchasedCovers] = useState<any[]>([]);
  
  const [animatedCovers] = useState([
    { id: 'anim_1', url: 'https://i.pinimg.com/originals/31/82/13/3182138e6e5a40bb2a70b0cc82cb20d4.gif' }, 
    { id: 'anim_2', url: 'https://i.pinimg.com/originals/7a/7b/72/7a7b72db519b7c8a6b107e324c4e74ca.gif' }, 
    { id: 'anim_3', url: 'https://i.pinimg.com/originals/74/49/a0/7449a0d8ff4ab8a9e14ee7bc8cf243cd.gif' }, 
    { id: 'anim_4', url: 'https://i.pinimg.com/originals/30/16/e0/3016e0b73c4f0ff09761df6ce6debcad.gif' }, 
  ]);
  const [staticCovers] = useState([
    { id: 'static_1', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800' }, 
    { id: 'static_2', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80' }, 
    { id: 'static_3', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' }, 
  ]);

  const realStats = useMemo(() => {
    const total = words.length;
    const learned = words.filter(w => w.isLearned).length;
    const unlearned = total - learned;
    const progress = total === 0 ? '0%' : `${Math.round((learned / total) * 100)}%`;
    
    return [
      { val: total.toString(), label: 'Tổng từ', gradient: 'linear-gradient(to right, #22c55e, #84cc16)' },
      { val: learned.toString(), label: 'Đã thuộc', gradient: 'linear-gradient(to right, #f97316, #f59e0b)' },
      { val: progress, label: 'Tiến độ', gradient: 'linear-gradient(to right, #3b82f6, #0ea5e9)' },
      { val: unlearned.toString(), label: 'Chưa thuộc', gradient: 'linear-gradient(to right, #a855f7, #d946ef)' }
    ];
  }, [words]);

  
  const dynamicFilters = useMemo(() => {
    if (!courses || courses.length === 0) return ['Tất cả'];
    
    const fetchedCategories = courses.map(courseGroup => courseGroup.category);

    return Array.from(new Set(['Tất cả', ...fetchedCategories]));
  }, [courses]);

  // Hàm tái đồng bộ Ảnh bìa
  const refreshCoverImage = async () => {
    try {
      const [profileRes, storeRes] = await Promise.all([
        fetch('/api/user/profile', { cache: 'no-store' }),
        fetch('/api/user/store', { cache: 'no-store' })
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.coverImage) setCoverUrl(data.coverImage);
      }

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        if (storeData.success && storeData.purchasedItems) {
          const storeCovers = storeItems.filter((item: any) => {
            const isBought = storeData.purchasedItems.includes(String(item.id));
            const hasImage = !!item.image;
            const isNotAvatar = item.type !== 'avatar' && item.category !== 'avatar';
            const isNotUpload = item.type !== 'upload';
            return isBought && hasImage && isNotAvatar && isNotUpload;
          });

          
          const customCovers = storeData.purchasedItems
            .filter((id: string) => id.startsWith('data:image/'))
            .map((base64: string, idx: number) => ({
              id: `custom_${idx}`,
              image: base64,
              category: 'theme',
            }));

          setPurchasedCovers([...storeCovers, ...customCovers]);
        }
      }
    } catch (error) {
      console.error("Không thể cập nhật thông tin profile/store:", error);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    async function initHome() {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const recentNames = [];
        const recentTimestamps = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          recentNames.push(dayNames[d.getDay()]);
          recentTimestamps.push(d.getTime());
        }
        setDays(recentNames);

        const [profileRes, courseRes, storeRes] = await Promise.all([
          fetch('/api/user/profile', { cache: 'no-store' }),
          fetch('/api/courses'),
          fetch('/api/user/store', { cache: 'no-store' })
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourses(courseData);
        }

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          if (storeData.success && storeData.purchasedItems) {
            const storeCovers = storeItems.filter((item: any) => {
              const isBought = storeData.purchasedItems.includes(String(item.id));
              const hasImage = !!item.image;
              const isNotAvatar = item.type !== 'avatar' && item.category !== 'avatar';
              const isNotUpload = item.type !== 'upload';
              return isBought && hasImage && isNotAvatar && isNotUpload;
            });

            // Lọc ra các ảnh tự Upload
            const customCovers = storeData.purchasedItems
              .filter((id: string) => id.startsWith('data:image/'))
              .map((base64: string, idx: number) => ({
                id: `custom_${idx}`,
                image: base64,
                category: 'theme',
              }));

            setPurchasedCovers([...storeCovers, ...customCovers]);
          }
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.coverImage) setCoverUrl(profileData.coverImage);
          
          let currentCount = profileData.streakCount || 0;
          let currentHistory = profileData.streakHistory || [];
          const todayTime = today.getTime();

          if (!currentHistory.includes(todayTime)) {
            const yesterdayTime = recentTimestamps[5];
            if (currentHistory.includes(yesterdayTime)) currentCount += 1;
            else currentCount = 1;
            currentHistory.push(todayTime);

            await fetch('/api/user/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ streakCount: currentCount, streakHistory: currentHistory })
            });
          }

          setStreakData({ count: currentCount, history: currentHistory });
          setLearnedDays(recentTimestamps.map(time => currentHistory.includes(time)));
        }

      } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu trang chủ:", error);
      } finally {
        setIsLoadingHome(false);
      }
    }

    initHome();
  }, [status, session]);

  useEffect(() => {
    window.addEventListener('updateProfile', refreshCoverImage);
    return () => window.removeEventListener('updateProfile', refreshCoverImage);
  }, []);

  const handleSelectCover = async (url: string) => {
    setCoverUrl(url); 
    setIsCoverModalOpen(false); 
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: url })
      });
      window.dispatchEvent(new Event('updateProfile'));
    } catch (err) {
      console.error("Lỗi lưu ảnh bìa:", err);
    }
  };

  const darkerBgs: Record<string, string> = { 'Thêm từ': '#dbeafe', 'Luyện tập': '#f3e8ff', 'Xếp hạng': '#ffedd5', 'Cộng đồng': '#dcfce7' };
  
  const getQuickAccessRoute = (title: string) => {
    switch (title) {
      case 'Thêm từ': return '/tu-vung';
      case 'Luyện tập': return '/game';
      case 'Xếp hạng': return '/xep-hang';
      case 'Cộng đồng': return '/xep-hang';
      default: return '/';
    }
  };

  const getDiffColor = (level: number) => {
    if (level <= 1) return '#22c55e';
    if (level === 2) return '#84cc16';
    if (level === 3) return '#f59e0b';
    if (level === 4) return '#f97316';
    return '#ef4444';
  };

  if (status === 'loading' || (isLoadingHome && words.length === 0)) {
    return (
      <Flex w="full" h="100vh" align="center" justify="center">
        <Spinner size="xl" color="green.500" />
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} bg="#f8f9fa" minH="full" w="full" maxW="1400px" mx="auto" overflowX="hidden" position="relative">
      
      {/* POPUP CHỌN ẢNH BÌA */}
      {isCoverModalOpen && (
        <Flex 
          position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0, 0, 0, 0.5)" zIndex={9999} 
          align="center" justify="center" px={4} backdropFilter="blur(4px)"
          onClick={() => setIsCoverModalOpen(false)} 
        >
          <Box bg="white" w="full" maxW="600px" borderRadius="3xl" p={6} shadow="2xl" onClick={(e) => e.stopPropagation()} animation="scaleIn 0.2s ease-out">
            <Flex justify="space-between" align="center" mb={6}>
              <Text fontSize="xl" fontWeight="black" color="gray.800">Chọn ảnh nền nổi bật</Text>
              <Flex as="button" onClick={() => setIsCoverModalOpen(false)} w={8} h={8} align="center" justify="center" borderRadius="full" _hover={{ bg: "gray.100" }} color="gray.500"><X size={20} /></Flex>
            </Flex>

            {/* TAB MENU */}
            <HStack gap={3} mb={6} overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
              <Button h="10" px={5} borderRadius="full" fontSize="sm" fontWeight="bold" gap={2} bg={coverTab === 'animated' ? '#e0f2fe' : 'transparent'} color={coverTab === 'animated' ? '#0284c7' : 'gray.500'} onClick={() => setCoverTab('animated')}><Film size={16} /> Ảnh động</Button>
              <Button h="10" px={5} borderRadius="full" fontSize="sm" fontWeight="bold" gap={2} bg={coverTab === 'static' ? '#e0f2fe' : 'transparent'} color={coverTab === 'static' ? '#0284c7' : 'gray.500'} onClick={() => setCoverTab('static')}><ImageIcon size={16} /> Ảnh tĩnh</Button>
              <Button h="10" px={5} borderRadius="full" fontSize="sm" fontWeight="bold" gap={2} bg={coverTab === 'purchased' ? '#e0f2fe' : 'transparent'} color={coverTab === 'purchased' ? '#0284c7' : 'gray.500'} onClick={() => setCoverTab('purchased')}><ShoppingBag size={16} /> Đã mua</Button>
            </HStack>

            {/* HIỂN THỊ DANH SÁCH ẢNH DỰA VÀO TAB */}
            <Box maxH="400px" minH="200px" overflowY="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }} mb={4}>
              <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                
                {coverTab === 'animated' && animatedCovers.map((cover) => {
                  const isSelected = coverUrl === cover.url;
                  return (
                    <GridItem key={cover.id} position="relative" cursor="pointer" borderRadius="2xl" overflow="hidden" borderWidth="4px" borderColor={isSelected ? "#22c55e" : "transparent"} aspectRatio={4/3} bg="gray.100">
                      <Box as="button" onClick={() => handleSelectCover(cover.url)} w="full" h="full" position="absolute" top={0} left={0} zIndex={2} />
                      <ChakraImage src={cover.url} w="full" h="full" objectFit="cover" position="relative" zIndex={1} />
                      {isSelected && (
                        <Flex position="absolute" top={2} right={2} bg="white" borderRadius="full" color="#22c55e" shadow="sm" zIndex={3}><CheckCircle2 size={24} fill="currentColor" color="white" /></Flex>
                      )}
                    </GridItem>
                  )
                })}

                {coverTab === 'static' && staticCovers.map((cover) => {
                  const isSelected = coverUrl === cover.url;
                  return (
                    <GridItem key={cover.id} position="relative" cursor="pointer" borderRadius="2xl" overflow="hidden" borderWidth="4px" borderColor={isSelected ? "#22c55e" : "transparent"} aspectRatio={4/3} bg="gray.100">
                      <Box as="button" onClick={() => handleSelectCover(cover.url)} w="full" h="full" position="absolute" top={0} left={0} zIndex={2} />
                      <ChakraImage src={cover.url} w="full" h="full" objectFit="cover" position="relative" zIndex={1} />
                      {isSelected && (
                        <Flex position="absolute" top={2} right={2} bg="white" borderRadius="full" color="#22c55e" shadow="sm" zIndex={3}><CheckCircle2 size={24} fill="currentColor" color="white" /></Flex>
                      )}
                    </GridItem>
                  )
                })}

                {coverTab === 'purchased' && (
                  purchasedCovers.length > 0 ? (
                    purchasedCovers.map((item) => {
                      const isSelected = coverUrl === item.image;
                      return (
                        <GridItem key={item.id} position="relative" cursor="pointer" borderRadius="2xl" overflow="hidden" borderWidth="4px" borderColor={isSelected ? "#22c55e" : "transparent"} aspectRatio={4/3} bg="gray.100">
                          <Box as="button" onClick={() => handleSelectCover(item.image)} w="full" h="full" position="absolute" top={0} left={0} zIndex={2} />
                          <ChakraImage src={item.image} w="full" h="full" objectFit="cover" position="relative" zIndex={1} />
                          {isSelected && (
                            <Flex position="absolute" top={2} right={2} bg="white" borderRadius="full" color="#22c55e" shadow="sm" zIndex={3}><CheckCircle2 size={24} fill="currentColor" color="white" /></Flex>
                          )}
                        </GridItem>
                      )
                        })
                  ) : (
                    <GridItem colSpan={{ base: 2, md: 3 }}>
                      <Center py={10} flexDirection="column" gap={3}>
                        <ShoppingBag size={48} color="#e2e8f0" strokeWidth={1.5} />
                        <Text color="gray.400" fontWeight="bold" fontSize="sm">Bạn chưa sở hữu hình nền nào từ cửa hàng</Text>
                        <Button mt={2} size="sm" colorScheme="blue" variant="outline" borderRadius="full" onClick={() => router.push('/cua-hang')}>Đến Cửa hàng ngay</Button>
                      </Center>
                    </GridItem>
                  )
                )}

              </SimpleGrid>
            </Box>
          </Box>
        </Flex>
      )}

      {/* SECTION 1: KHỐI TOP */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={6} mb={10} w="full">
        <GridItem colSpan={{ base: 1, lg: 4 }} borderRadius="2xl" overflow="hidden" h="200px" position="relative" minW={0} bg="white" boxShadow="0 3px 5px rgba(0, 0, 0, 0.07), 0 5px 0 0 rgba(0, 0, 0, 0.07)" role="group">
          <Box as="button" w="full" h="full" onClick={() => setIsCoverModalOpen(true)} position="relative" cursor="pointer" overflow="hidden">
            <ChakraImage src={coverUrl} alt="Banner" w="full" h="full" objectFit="cover" transition="transform 0.4s" _groupHover={{ transform: "scale(1.05)" }} />
            <Flex position="absolute" top={0} left={0} w="full" h="full" bg="blackAlpha.400" opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s" align="center" justify="center" zIndex={2}>
              <Flex bg="white" color="gray.800" px={4} py={2} borderRadius="full" fontWeight="bold" fontSize="sm" align="center" gap={2} shadow="md"><Pencil size={16} /> Đổi ảnh</Flex>
            </Flex>
          </Box>
        </GridItem>
        
        {/* Stats Card */}
        <GridItem colSpan={{ base: 1, lg: 4 }} borderRadius="2xl" bg="white" p={6} h="200px" minW={0} boxShadow="0 3px 5px rgba(0, 0, 0, 0.07), 0 5px 0 0 rgba(0, 0, 0, 0.1)">
          <Flex h="full" align="center" justify="center">
            {isLoadingWords ? <Spinner color="green.500" /> : (
              <SimpleGrid columns={2} gap={3} w="full">
                {realStats.map((stat, i) => (
                  <Flex key={i} onClick={() => router.push('/tu-vung')} bg="gray.100" borderRadius="2xl" direction="column" align="center" justify="center" py={3} _hover={{ bg: "gray.200", transform: 'translateY(-4px)', shadow: 'md' }} transition="all 0.3s" cursor="pointer">
                    <Text fontSize="2xl" fontWeight="black" backgroundImage={stat.gradient} backgroundClip="text" color="transparent" mb={0} lineHeight="1">{stat.val}</Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textAlign="center" mt={1}>{stat.label}</Text>
                  </Flex>
                ))}
              </SimpleGrid>
            )}
          </Flex>
        </GridItem>

        {/* Streak Card */}
        <GridItem colSpan={{ base: 1, lg: 4 }} minW={0}>
          <Flex background="linear-gradient(to right, #ff7e00, #ff3b00)" borderRadius="2xl" p={6} color="white" h="200px" direction="column" justify="space-between" boxShadow="0 3px 5px rgba(0, 0, 0, 0.12), 0 5px 0 0 rgba(255, 59, 0, 0.4)" position="relative" overflow="hidden">
            <Box position="absolute" top="-40px" right="-40px" w="140px" h="140px" bg="rgba(255,255,255,0.15)" borderRadius="50%" pointerEvents="none" />
            <Box position="relative" zIndex={1}>
              <HStack color="orange.100" fontWeight="bold" fontSize="sm" mb={1}><Flame size={16} fill="currentColor" /><Text>CHUỖI NGÀY HỌC</Text></HStack>
              <Flex align="baseline" gap={1}>
                <Text fontSize="4xl" fontWeight="extrabold">{streakData.count}</Text>
                <Text fontSize="lg" fontWeight="medium" opacity={0.9}>ngày</Text>
              </Flex>
            </Box>
            <Flex justify="space-between" align="center" mt={4} position="relative" zIndex={1}>
              {days.map((day, idx) => {
                const isToday = idx === days.length - 1;
                const isLearned = learnedDays[idx];
                return (
                  <VStack key={idx} gap={2}>
                    <Flex w={8} h={8} borderRadius="full" align="center" justify="center" fontSize="xs" fontWeight="bold" bg={isLearned ? 'white' : 'whiteAlpha.300'} color={isLearned ? '#ff3b00' : 'whiteAlpha.800'} boxShadow={isToday ? "0 0 0 4px rgba(255,255,255,0.3)" : "none"}>
                      {isLearned ? <Flame size={16} fill="currentColor" /> : ''}
                    </Flex>
                    <Text fontSize="10px" fontWeight="medium" opacity={0.9}>{day}</Text>
                  </VStack>
                )
              })}
            </Flex>
          </Flex>
        </GridItem>
      </Grid>

          {/* SECTION 2: TRUY CẬP NHANH */}
      <Box mb={12} w="full">
        <Text textAlign="center" fontSize="lg" fontWeight="bold" color="gray.800" mb={6}>Truy cập nhanh</Text>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} w="full">
          {quickAccess.map((item, idx) => {
            const IconComponent = item.title === 'Thêm từ' ? Plus : item.title === 'Luyện tập' ? Zap : item.title === 'Xếp hạng' ? Medal : Users;
            return (
              <Flex key={idx} onClick={() => router.push(getQuickAccessRoute(item.title))} className="card-quick-access" w="full" bg="white" borderRadius="2xl" p={5} borderWidth="1px" borderColor="gray.200" shadow="sm" align="center" gap={4} cursor="pointer" _hover={{ shadow: 'md', borderColor: 'gray.300', transform: 'translateY(-4px)' }} transition="all 0.3s">
                <Flex className="icon-quick-access" w={12} h={12} borderRadius="2xl" align="center" justify="center" bg={darkerBgs[item.title] || item.bg} color={item.iconColor} flexShrink={0} transition="transform 0.4s">
                  <IconComponent size={24} strokeWidth={2.5} color="currentColor" />
                </Flex>
                <Box flex={1}>
                  <Text fontWeight="bold" color="gray.800">{item.title}</Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>{item.desc}</Text>
                </Box>
                <ArrowRight size={20} color="#e2e8f0" />
              </Flex>
            )
          })}
        </SimpleGrid>
      </Box>

      {/* SECTION 3: LỘ TRÌNH HỌC */}
      <Box id="lo-trinh" mb={12} w="full" minW={0}>
        <Text textAlign="center" fontSize="sm" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={6}>Lộ trình học</Text>
        
        <Flex justify="center" align="center" gap={3} mb={10} w="full" wrap="wrap">
          {dynamicFilters.map((filter) => (
            <Button key={filter} onClick={() => setActiveFilter(filter)} borderRadius="full" px={6} py={2} fontSize="sm" fontWeight="bold" bg={activeFilter === filter ? '#10b981' : 'white'} color={activeFilter === filter ? 'white' : 'gray.600'} borderWidth="1px" borderColor={activeFilter === filter ? '#10b981' : 'gray.200'} _hover={activeFilter !== filter ? { bg: 'white', borderColor: '#10b981', color: '#10b981' } : {}} shadow={activeFilter === filter ? 'md' : 'sm'} h="auto" transition="all 0.2s">
              {filter}
            </Button>
          ))}
        </Flex>
        
        <Box w="full" minW={0}>
          {courses.length === 0 ? (
            <Center py={10} flexDirection="column" gap={3} bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" p={6}>
              <Text fontWeight="bold" color="gray.500">Chưa tìm thấy dữ liệu lộ trình học nào trong Database MongoDB.</Text>
              <Text fontSize="sm" color="gray.400">👉 Bạn hãy mở tab trình duyệt mới và chạy: **http://localhost:3000/api/seed** để nạp dữ liệu thật vào nhé!</Text>
            </Center>
          ) : (
            courses.map((category, categoryIndex) => {
              if (activeFilter !== 'Tất cả' && activeFilter !== category.category) return null;
              return (
                <Box key={categoryIndex} mb={10} w="full" minW={0}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <HStack gap={3}>
                      <Text fontSize="xl" fontWeight="extrabold" color="gray.800">{category.category}</Text>
                      <Flex bg="#f5f0eb" color="gray.500" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">{category.count}</Flex>
                    </HStack>
                  </Flex>

                  <Box position="relative" role="group" w="full" minW={0}>
                    <Flex gap={4} overflowX="auto" pb={4} pt={2} px={2} ml={-2} css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
                      {category.items.map((course, courseIndex) => {
                        const diffColor = getDiffColor(course.difficulty);
                        const diffPercent = (course.difficulty / 5) * 100;
                        return (
                          <Flex 
                            key={course.id || courseIndex} 
                            direction="column" bg="white" borderRadius="2xl" minW="280px" w="280px" p={5} flexShrink={0} cursor="pointer" borderWidth="2px" borderColor="gray.100" 
                            onClick={() => router.push(`/lo-trinh/${course.id}`)}
                            _hover={{ shadow: "md", borderColor: "gray.200", transform: "translateY(-4px)" }} 
                            transition="all 0.2s"
                          >
                            <Text fontWeight="extrabold" color="gray.800" fontSize="sm" mb={4} h="40px" css={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</Text>
                            <Flex align="center" gap={2} bg="#f8fafc" w="fit-content" px={3} py={1.5} borderRadius="lg" mb={6}>
                              <Text fontSize="sm">📚</Text>
                              <Text fontSize="xs" fontWeight="bold" color="gray.600">{course.sets} bộ từ</Text>
                            </Flex>
                            <Box mt="auto">
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">Độ khó</Text>
                                <Text fontSize="xs" fontWeight="black" color={diffColor}>{course.difficulty}/5</Text>
                              </Flex>
                              <Box w="full" h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                                <Box h="full" w={`${diffPercent}%`} bg={diffColor} borderRadius="full" transition="width 0.5s" />
                              </Box>
                            </Box>
                          </Flex>
                        );
                      })}
                    </Flex>
                    <Flex as="button" position="absolute" left="-4" top="40%" transform="translateY(-50%)" w={10} h={10} borderRadius="full" bg="white" shadow="md" align="center" justify="center" color="gray.600" opacity={0} _groupHover={{ opacity: 1 }} _hover={{ bg: "gray.50", shadow: 'lg' }} transition="all 0.2s"><ChevronLeft size={20} /></Flex>
                    <Flex as="button" position="absolute" right="-4" top="40%" transform="translateY(-50%)" w={10} h={10} borderRadius="full" bg="white" shadow="md" align="center" justify="center" color="gray.600" opacity={0} _groupHover={{ opacity: 1 }} _hover={{ bg: "gray.50", shadow: 'lg' }} transition="all 0.2s"><ChevronRight size={20} /></Flex>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      <style dangerouslySetInnerHTML={{__html: `
        .card-quick-access:hover .icon-quick-access { transform: rotate(-20deg) scale(1.1); }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}} />
    </Box>
  );
}
export default function HomePage() {
  return (
    <Suspense 
      fallback={
        <Flex w="100vw" h="100vh" align="center" justify="center" bg="#f8f9fa">
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Flex>
      }
    >
      <HomeContent />
    </Suspense>
  );
}