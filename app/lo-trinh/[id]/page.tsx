"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Flex, Text, Button, Spinner, SimpleGrid, Center, Badge, HStack, VStack } from '@chakra-ui/react';
import { ArrowLeft, Play, Lock, Pin, Trophy, BrainCircuit, Folder, Crown } from 'lucide-react';
import { toaster } from "@/components/ui/toaster"; // Import chuẩn thông báo Chakra v3

// UI COMPONENT: Thanh Progress Bar siêu mỏng
const CustomProgress = ({ value, color = "#22c55e", h = "6px", bg = "#f1f5f9" }: { value: number, color?: string, h?: string, bg?: string }) => {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <Box w="full" h={h} bg={bg} borderRadius="full" overflow="hidden">
      <Box h="full" bg={color} w={`${safeValue}%`} transition="width 0.3s ease" borderRadius="full" />
    </Box>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || id === "undefined" || id === "courses") {
      setIsLoading(false);
      return;
    }

    async function fetchCourseDetail() {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        } else {
          console.error("Không tìm thấy lộ trình, mã lỗi:", res.status);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết lộ trình:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCourseDetail();
  }, [id]);

  if (isLoading) {
    return (
      <Flex w="full" h="100vh" align="center" justify="center" bg="#f8f9fa">
        <Spinner size="xl" color="#22c55e" borderWidth="4px" />
      </Flex>
    );
  }

  if (!course) {
    return (
      <Center h="100vh" flexDir="column" bg="#f8f9fa">
        <Text fontSize="xl" fontWeight="black" color="gray.700" mb={4}>
          Không tìm thấy dữ liệu lộ trình học này.
        </Text>
        <Button onClick={() => router.back()} colorScheme="gray" borderRadius="full">
          Quay lại
        </Button>
      </Center>
    );
  }

  const vocabSets = course.vocabSets || course.sets || course.VocabSet || [];

  // Hàm xử lý chung khi người dùng click vào một chủ đề học
  const handleSetClick = (set: any) => {
    if (set.isLocked) {
      // Thông báo nhắc nhở click nút PRO trên Header để mở khóa nội dung
      toaster.create({
        title: "Nội dung cao cấp! 👑",
        description: "Vui lòng bấm vào nút 'NÂNG CẤP PRO' ở thanh Header để mở khóa bộ từ vựng này.",
        type: "warning"
      });
    } else {
      // Nếu không khóa thì chuyển hướng vào học như thường
      router.push(`/game/${set.id}?part=0&mode=practice&type=hub`);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1100px" mx="auto" minH="100vh" bg="#f8f9fa">
      
      {/* ====================================================== */}
      {/* KHỐI 1: HEADER THÔNG TIN CHUNG CỦA LỘ TRÌNH */}
      {/* ====================================================== */}
      <Box bg="white" p={8} borderRadius="3xl" shadow="sm" mb={10} borderWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={6} flexWrap={{ base: "wrap", md: "nowrap" }} gap={4}>
          <Flex align="center" gap={4}>
            <Button size="sm" variant="ghost" bg="gray.100" borderRadius="xl" onClick={() => router.back()} p={0} w={10} h={10} _hover={{ bg: "gray.200" }}>
              <ArrowLeft size={18} color="#4a5568" />
            </Button>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black" color="gray.800" lineHeight="tight" textTransform="uppercase">
              {course.title || "Chi tiết Lộ trình"}
            </Text>
          </Flex>

          <HStack gap={3} flexWrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
            <Button size="sm" variant="outline" bg="white" borderColor="gray.200" borderRadius="full" gap={2} fontWeight="bold" color="gray.700" _hover={{ bg: "gray.50" }}>
              <Pin size={16} /> Ghim
            </Button>
            <Button size="sm" variant="outline" bg="white" borderColor="gray.200" borderRadius="full" gap={2} fontWeight="bold" color="gray.700" _hover={{ bg: "gray.50" }}>
              <Trophy size={16} /> BXH
            </Button>
            <Button
              size="sm"
              bg="#10b981"
              color="white"
              borderRadius="full"
              gap={2}
              fontWeight="bold"
              _hover={{ bg: "#059669" }}
              px={5}
              onClick={() => {
                // Kiểm tra nếu có ít nhất một bộ không bị khóa thì cho học ngắt quãng
                const firstAvailableSet = vocabSets.find((s: any) => !s.isLocked);
                if (firstAvailableSet) {
                  router.push(`/game/${firstAvailableSet.id}?part=0&mode=srs&type=hub`);
                } else {
                  toaster.create({
                    title: "Bị khóa!",
                    description: "Bạn cần có ít nhất một bộ từ vựng được mở khóa để sử dụng chế độ này.",
                    type: "warning"
                  });
                }
              }}
            >
              <BrainCircuit size={16} /> Học ngắt quãng
            </Button>
          </HStack>
        </Flex>

        {/* Các Badge thống kê */}
        <HStack gap={3} mb={8}>
          <Badge bg="gray.100" color="gray.600" px={3} py={1.5} borderRadius="full" fontSize="xs" fontWeight="bold">
            {vocabSets.length} bộ từ
          </Badge>
          <Badge bg="#dcfce7" color="#16a34a" px={3} py={1.5} borderRadius="full" fontSize="xs" fontWeight="bold">
            {course.totalCourseWords || 0} từ vựng
          </Badge>
          <Badge bg="purple.100" color="purple.600" px={3} py={1.5} borderRadius="full" fontSize="xs" fontWeight="bold">
            {course.courseProgressPercent || 0}% hoàn thành
          </Badge>
        </HStack>

        {/* Thanh Tiến độ */}
        <Box pt={4} borderTopWidth="1px" borderColor="gray.100">
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2} letterSpacing="wider">
            TIẾN ĐỘ: {course.totalCourseLearned || 0} / {course.totalCourseWords || 0} từ
          </Text>
          <CustomProgress value={course.courseProgressPercent || 0} color="#22c55e" h="6px" />
        </Box>
      </Box>

      {/* ====================================================== */}
      {/* KHỐI 2: DANH SÁCH CÁC BỘ TỪ DỰA TRÊN LOGIC ĐỘNG TỪ API */}
      {/* ====================================================== */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="black" color="gray.800">Các bộ từ</Text>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {vocabSets.map((set: any, index: number) => {
          
          // --- FIX HOÀN THIỆN: Đọc isLocked trực tiếp từ dữ liệu API trả về ---
          const isLocked = set.isLocked; 

          if (!isLocked) {
            // GIAO DIỆN BỘ TỪ ĐƯỢC MỞ KHÓA (HỌC BÌNH THƯỜNG)
            return (
              <Flex 
                key={set.id || index} p={5} borderWidth="1px" borderColor="orange.200" borderRadius="2xl" bg="white" 
                shadow="md" align="center" gap={4} cursor="pointer" transition="all 0.2s" 
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                onClick={() => handleSetClick(set)}
              >
                <VStack gap={2} flexShrink={0}>
                  <Flex w={14} h={14} bg="orange.50" borderRadius="xl" align="center" justify="center">
                    <Folder size={28} color="#f59e0b" fill="#fcd34d" />
                  </Flex>
                  <Text fontSize="xs" fontWeight="black" color="gray.400">#{index + 1}</Text>
                </VStack>

                <Box flex={1} overflow="hidden">
                  <Text
                    fontWeight="black"
                    fontSize="sm"
                    mb={1}
                    color="gray.800"
                    textTransform="uppercase"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    Chủ đề {index + 1}: {set.title}
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                    {set.learnedWords || 0} / {set.totalWords || 0} từ
                  </Text>
                  <CustomProgress value={set.progressPercent || 0} color="#22c55e" h="4px" />
                </Box>

                <VStack gap={3} align="flex-end" flexShrink={0} justify="space-between" h="full" pt={1}>
                  <Text fontSize="xs" fontWeight="black" color="#22c55e">{set.progressPercent || 0}%</Text>
                  <Button size="sm" w={8} h={8} borderRadius="full" p={0} bg="gray.100" color="gray.500" _hover={{ bg: "gray.200" }}>
                    <Play size={14} fill="currentColor" />
                  </Button>
                </VStack>
              </Flex>
            );
          }

          // GIAO DIỆN BỘ TỪ BỊ KHÓA PRO (CHƯA ĐĂNG KÝ)
          return (
            <Flex 
              key={set.id || index} p={5} borderWidth="2px" borderStyle="dashed" borderColor="gray.200" 
              borderRadius="2xl" bg="gray.50" align="center" gap={4} opacity={0.8}
              cursor="pointer" _hover={{ bg: "gray.100", borderColor: "orange.300" }}
              onClick={() => handleSetClick(set)}
            >
              <Flex w={14} h={14} bg="gray.200" borderRadius="full" align="center" justify="center" flexShrink={0}>
                <Text fontWeight="black" color="gray.400" fontSize="xl">{index + 1}</Text>
              </Flex>

              <Box flex={1}>
                <HStack gap={1} mb={1} align="start">
                  <Lock size={14} color="#a1a1aa" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    color="gray.600"
                    textTransform="uppercase"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    Chủ đề {index + 1}: {set.title}
                  </Text>
                </HStack>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3}>{set.totalWords || 0} từ</Text>
                <HStack gap={1}>
                  <Lock size={12} color="#a1a1aa" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.400">Chưa mở khóa</Text>
                </HStack>
              </Box>

              <VStack align="flex-end" justify="flex-start" h="full" flexShrink={0}>
                 <Badge bg="orange.100" color="orange.500" fontSize="9px" px={2} py={0.5} borderRadius="sm" fontWeight="black">
                   PRO
                 </Badge>
              </VStack>
            </Flex>
          );
        })}
      </SimpleGrid>
      
      {vocabSets.length === 0 && (
        <Center p={10} bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
          <Text color="gray.400" fontWeight="bold">Lộ trình này hiện chưa có bộ từ nào.</Text>
        </Center>
      )}

    </Box>
  );
}