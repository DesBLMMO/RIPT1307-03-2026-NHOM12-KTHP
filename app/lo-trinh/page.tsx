"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Flex, Text, HStack, Button, Spinner, Center } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filters } from '@/lib/data';

// Định nghĩa kiểu dữ liệu chuẩn xác trả về từ MongoDB qua Prisma
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

export default function LoTrinhPage() {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  
  // States quản lý dữ liệu động từ Backend DB
  const [courses, setCourses] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. EFFECT FETCH DỮ LIỆU TỪ BACKEND PRISMA
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          console.error("Lỗi lấy dữ liệu từ API lộ trình");
        }
      } catch (error) {
        console.error("Lỗi kết nối mạng:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Hàm lấy màu sắc dựa trên độ khó (Level 1->5)
  const getDiffColor = (level: number) => {
    if (level <= 1) return '#22c55e'; // Xanh lá
    if (level === 2) return '#84cc16'; // Xanh nõn
    if (level === 3) return '#f59e0b'; // Vàng cam
    if (level === 4) return '#f97316'; // Cam
    return '#ef4444'; // Đỏ
  };

  // Màn hình chờ khi đang lấy dữ liệu từ MongoDB Atlas
  if (isLoading) {
    return (
      <Flex w="full" h="60vh" align="center" justify="center">
        <Spinner size="xl" color="green.500" />
      </Flex>
    );
  }

  // Trường hợp Database trống (Chưa chạy API seed)
  if (courses.length === 0) {
    return (
      <Center h="50vh" flexDirection="column" gap={4}>
        <Text color="gray.500" fontWeight="bold">Chưa có dữ liệu lộ trình học tập trong Database.</Text>
        <Text fontSize="sm" color="gray.400">💡 Bạn hãy truy cập đường dẫn /api/seed để nạp dữ liệu mẫu vào nhé!</Text>
      </Center>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto" minH="full" bg="#f8f9fa">
      <Text textAlign="center" fontSize="2xl" fontWeight="normal" color="gray.800" textTransform="uppercase" letterSpacing="widest" mb={8}>
        Lộ trình học
      </Text>

      {/* Nút Filters (Tất cả, THPT, IELTS...) */}
      <Flex flexWrap="wrap" justify="center" gap={3} mb={10}>
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            borderRadius="full"
            px={6}
            py={2}
            fontSize="sm"
            fontWeight="bold"
            bg={activeFilter === filter ? '#10b981' : 'white'}
            color={activeFilter === filter ? 'white' : 'gray.600'}
            borderWidth="1px"
            borderColor={activeFilter === filter ? '#10b981' : 'gray.200'}
            _hover={activeFilter !== filter ? { bg: 'white', borderColor: '#10b981', color: '#10b981' } : {}}
            shadow={activeFilter === filter ? 'md' : 'sm'}
            h="auto"
            transition="all 0.2s"
          >
            {filter}
          </Button>
        ))}
      </Flex>

      {/* Danh sách các danh mục Lộ trình */}
      <Box>
        {courses.map((category, categoryIndex) => {
          if (activeFilter !== 'Tất cả' && activeFilter !== category.category) return null;

          return (
            <Box key={categoryIndex} mb={10}>
              <Flex justify="space-between" align="center" mb={4}>
                <HStack gap={3}>
                  <Text fontSize="xl" fontWeight="extrabold" color="gray.800">
                    {category.category}
                  </Text>
                  <Flex bg="#f5f0eb" color="gray.500" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
                    {category.count}
                  </Flex>
                </HStack>
                {category.note && (
                  <Text color="gray.400" fontSize="sm" fontWeight="medium">
                    {category.note}
                  </Text>
                )}
              </Flex>

              {/* Slider cuộn ngang các khóa học */}
              <Box position="relative" role="group">
                <Flex
                  gap={4}
                  overflowX="auto"
                  pb={4}
                  pt={2} 
                  px={2} 
                  ml={-2} 
                  css={{
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                  }}
                >
                  {category.items.map((course, courseIndex) => {
                    const diffColor = getDiffColor(course.difficulty);
                    const diffPercent = (course.difficulty / 5) * 100;

                    return (
                      <Link key={course.id || courseIndex} href={`/lo-trinh/${course.id}`}>
                        <Flex
                          direction="column"
                          bg="white"
                          borderRadius="2xl"
                          minW="280px"
                          maxW="300px"
                          p={5}
                          flexShrink={0}
                          cursor="pointer"
                          borderWidth="2px"
                          borderColor="gray.100"
                          _hover={{ shadow: "md", borderColor: "gray.200", transform: "translateY(-4px)" }}
                          transition="all 0.2s"
                        >
                        {/* Tên lộ trình */}
                        <Text fontWeight="extrabold" color="gray.800" fontSize="sm" mb={4} h="40px" css={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.title}
                        </Text>

                        {/* Badge Số bộ từ */}
                        <Flex align="center" gap={2} bg="#f8fafc" w="fit-content" px={3} py={1.5} borderRadius="lg" mb={6}>
                          <Text fontSize="sm">📚</Text>
                          <Text fontSize="xs" fontWeight="bold" color="gray.600">{course.sets} bộ từ</Text>
                        </Flex>

                        {/* Thanh Độ Khó */}
                        <Box mt="auto">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                              Độ khó
                            </Text>
                            <Text fontSize="xs" fontWeight="black" color={diffColor}>
                              {course.difficulty}/5
                            </Text>
                          </Flex>
                          <Box w="full" h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                            <Box h="full" w={`${diffPercent}%`} bg={diffColor} borderRadius="full" transition="width 0.5s" />
                          </Box>
                        </Box>
                      </Flex>
                    </Link>
                    );
                  })}
                </Flex>

                {/* Nút điều hướng Slider */}
                <Flex
                  as="button" position="absolute" left="-4" top="40%" transform="translateY(-50%)"
                  w={10} h={10} borderRadius="full" bg="white" shadow="md" align="center" justify="center"
                  color="gray.600" opacity={0} _groupHover={{ opacity: 1 }} _hover={{ bg: "gray.50", shadow: 'lg' }} transition="all 0.2s"
                >
                  <ChevronLeft size={20} />
                </Flex>
                <Flex
                  as="button" position="absolute" right="-4" top="40%" transform="translateY(-50%)"
                  w={10} h={10} borderRadius="full" bg="white" shadow="md" align="center" justify="center"
                  color="gray.600" opacity={0} _groupHover={{ opacity: 1 }} _hover={{ bg: "gray.50", shadow: 'lg' }} transition="all 0.2s"
                >
                  <ChevronRight size={20} />
                </Flex>
              </Box>

              {/* Progress Indicator */}
              <Flex justify="center" mt={2} gap={1.5}>
                <Box w={8} h="4px" bg="green.500" borderRadius="full" />
                <Box w={8} h="4px" bg="gray.200" borderRadius="full" />
                <Box w={8} h="4px" bg="gray.200" borderRadius="full" />
              </Flex>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}