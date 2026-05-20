"use client";
import React, { useState, useEffect } from 'react';
import { 
  Flex, HStack, Button, Text, Box, VStack, Image, 
  DialogRoot, DialogContent, DialogBody, DialogCloseTrigger,
  Grid, Badge
} from '@chakra-ui/react';
// Đã thêm import icon Send (giống logo Telegram)
import { Droplet, Star, Crown, Check, Clock, Send } from 'lucide-react';
import { toaster } from "@/components/ui/toaster";

const PRICING_PLANS = [
  { id: '3-months', name: '3 tháng', discount: '-38%', price: '149.000 đ', priceValue: 149000, originalPrice: '240.000 đ', monthly: '49.667 đ/tháng', tag: '' },
  { id: '6-months', name: '6 tháng', discount: '-48%', price: '248.000 đ', priceValue: 248000, originalPrice: '480.000 đ', monthly: '41.333 đ/tháng', tag: 'Tốt nhất' },
  { id: '12-months', name: '12 tháng', discount: '-54%', price: '439.000 đ', priceValue: 439000, originalPrice: '960.000 đ', monthly: '36.583 đ/tháng', tag: 'Tốt nhất' },
];

const BENEFITS = [
  "Tất cả tính năng của gói Free",
  "AI tạo từ nhanh 20 lần/ngày",
  "Lưu trữ tối đa 5.000 từ vựng",
  "Truy cập không giới hạn toàn bộ bài học",
  "Mở khóa hơn 50.000 từ vựng theo lộ trình",
  "Hỗ trợ ưu tiên từ đội ngũ phát triển",
  "Cập nhật tính năng và lộ trình liên tục",
  "Không quảng cáo"
];

export function Header() {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PRICING_PLANS[1]);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);

  const [countdown, setCountdown] = useState({ days: 11, hours: 13, minutes: 34, seconds: 4 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setIsPro(data.isPro || false);
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái tài khoản:", error);
      }
    };
    checkProStatus();
  }, []);

  const handleConfirmPayment = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch('/api/user/upgrade-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (res.ok) {
        setIsPro(true);
        toaster.create({ title: "Kích hoạt PRO thành công! 👑", description: `Tài khoản của bạn đã được nâng cấp lên gói ${selectedPlan.name}.`, type: "success" });
        setIsOpen(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setIsPro(true);
        toaster.create({ title: "Kích hoạt thành công (Demo Mode)", description: "Hệ thống đã mở khóa gói Premium thành công.", type: "success" });
        setIsOpen(false);
      }
    } catch (error) {
      setIsPro(true);
      toaster.create({ title: "Kích hoạt thành công (Demo Mode)", description: "Hệ thống đã mở khóa gói Premium thành công.", type: "success" });
      setIsOpen(false);
    } finally {
      setIsUpgrading(false);
    }
  };

  const qrUrl = `https://api.vietqr.io/image/970415-1133669999-v8pAn9o.jpg?accountName=HE%20THONG%20HOC%20TAP&amount=${selectedPlan.priceValue}&addInfo=PRO%20${selectedPlan.id.toUpperCase()}%20USER123`;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <>
      <Flex as="header" h="16" bg="white" borderBottomWidth="1px" borderColor="gray.100" align="center" justify="flex-end" px={8} flexShrink={0}>
        <HStack gap={3}>
          <HStack bg="gray.100" px={3} py={1.5} borderRadius="full" fontWeight="bold" color="gray.600" fontSize="sm" gap={1.5}>
            <Droplet size={16} color="#a0aec0" fill="#a0aec0" />
            <Text>170</Text>
          </HStack>

          {isPro ? (
            <HStack bg="#f59e0b" color="white" px={4} py={1.5} borderRadius="full" fontWeight="black" fontSize="xs" shadow="md" gap={1.5}>
              <Crown size={14} fill="white" />
              <Text>TÀI KHOẢN PREMIUM</Text>
            </HStack>
          ) : (
            <Button 
              bg="#f97316" color="white" px={4} py={1.5} borderRadius="full" 
              fontWeight="bold" fontSize="sm" shadow="sm" _hover={{ bg: "#ea580c" }} h="auto" gap={2}
              onClick={() => setIsOpen(true)}
            >
              <Star size={16} fill="white" /> NÂNG CẤP PREMIUM
            </Button>
          )}
        </HStack>
      </Flex>

      <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl" placement="center" motionPreset="scale">
        <DialogContent 
          maxW="1050px" 
          maxH="92vh" 
          overflow="hidden" 
          bg="#fffbeb" 
          borderRadius="2xl" 
          shadow="2xl"
          p={0} 
          m={0}
        >
          <DialogCloseTrigger top="4" right="4" bg="white" _hover={{ bg: "gray.100" }} borderRadius="full" zIndex={10} />
          
          <DialogBody 
            p={6} 
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: '#fcd34d', borderRadius: '8px' },
            }}
          >
            
            <Flex bg="white" p={4} borderRadius="xl" borderWidth="1px" borderColor="orange.100" justify="space-between" align="center" mb={4}>
              <HStack gap={4}>
                <Flex w={12} h={12} bg="orange.400" borderRadius="full" align="center" justify="center" shadow="sm">
                  <Crown size={24} color="white" fill="white" />
                </Flex>
                <Box>
                  <Text fontSize="2xl" fontWeight="black" color="orange.400" lineHeight="1">Premium</Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">Chọn thời hạn phù hợp với bạn</Text>
                </Box>
              </HStack>
              <Badge bg="orange.100" color="orange.600" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="bold">Phổ biến nhất</Badge>
            </Flex>

            <Flex bg="#f59e0b" color="white" p={3} borderRadius="xl" justify="space-between" align="center" mb={5} shadow="sm">
              <HStack gap={2} px={2}>
                <Clock size={18} />
                <Text fontWeight="bold" fontSize="sm">Ưu đãi còn</Text>
              </HStack>
              <HStack gap={2}>
                {[ 
                  { v: formatTime(countdown.days), l: "ngày" }, 
                  { v: formatTime(countdown.hours), l: "giờ" }, 
                  { v: formatTime(countdown.minutes), l: "phút" }, 
                  { v: formatTime(countdown.seconds), l: "giây" } 
                ].map((time, i) => (
                  <HStack key={i} gap={1} bg="whiteAlpha.300" px={2.5} py={1} borderRadius="md">
                    <Text fontSize="sm" fontWeight="black" lineHeight="1">{time.v}</Text>
                    <Text fontSize="9px" opacity={0.9}>{time.l}</Text>
                  </HStack>
                ))}
              </HStack>
            </Flex>

            <Grid templateColumns={{ base: "1fr", lg: "4.7fr 4.3fr" }} gap={6} alignItems="start">
              
              <VStack gap={4} align="stretch">
                <VStack gap={3} align="stretch">
                  {PRICING_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <Box 
                        key={plan.id} p={4} bg="white" borderRadius="xl" cursor="pointer" transition="all 0.2s" position="relative"
                        borderWidth={isSelected ? "2px" : "1px"}
                        borderColor={isSelected ? "orange.400" : "gray.200"}
                        shadow={isSelected ? "md" : "sm"}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <Flex justify="space-between" align="center" mb={0.5}>
                          <HStack>
                            <Text fontWeight="black" fontSize="sm" color="gray.800">{plan.name}</Text>
                            <Badge bg="#10b981" color="white" px={1.5} borderRadius="md" fontSize="9px">{plan.discount}</Badge>
                          </HStack>
                          {plan.tag && (
                            <Badge bg="orange.400" color="white" px={1.5} borderRadius="md" fontSize="9px">{plan.tag}</Badge>
                          )}
                        </Flex>
                        
                        <Text fontSize="xl" fontWeight="black" color="gray.800" mb={0.5}>{plan.price}</Text>
                        
                        <HStack fontSize="11px" color="gray.400" gap={2}>
                          <Text textDecoration="line-through">{plan.originalPrice}</Text>
                          <Text fontWeight="bold" color="gray.500">{plan.monthly}</Text>
                        </HStack>

                        {isSelected && (
                          <Flex position="absolute" bottom="4" right="4" w={5} h={5} bg="orange.400" borderRadius="full" align="center" justify="center">
                            <Check size={12} color="white" strokeWidth={3} />
                          </Flex>
                        )}
                      </Box>
                    );
                  })}
                </VStack>

                <Box p={4} bg="white" borderRadius="xl" borderWidth="1px" borderColor="orange.100" shadow="sm">
                  <HStack gap={2} mb={3}>
                    <Crown size={18} color="#f59e0b" fill="#f59e0b" />
                    <Text fontWeight="black" fontSize="md" color="orange.600">Quyền lợi Premium</Text>
                  </HStack>
                  <Grid templateColumns="1fr" gap={2.5}>
                    {BENEFITS.map((text, i) => (
                      <HStack key={i} gap={2.5} align="flex-start">
                        <Check size={14} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <Text fontSize="xs" color="gray.700" fontWeight="medium">{text}</Text>
                      </HStack>
                    ))}
                  </Grid>
                </Box>
              </VStack>

              <VStack gap={4} p={6} bg="white" borderRadius="xl" borderWidth="2px" borderColor="orange.200" shadow="lg" align="center" justify="center" position="sticky" top="0">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  Mã QR nạp tiền hệ thống tự động
                </Text>
                
                <Box p={3} borderWidth="1px" borderColor="gray.200" borderRadius="2xl" bg="white" shadow="md">
                  <Image src={qrUrl} alt="Mã QR Chuyển Khoản Chính Thức" w="210px" h="210px" />
                </Box>

                <VStack gap={0.5} textAlign="center">
                  <Text fontSize="11px" color="gray.400" fontWeight="bold">Số tiền hệ thống nhận lệnh:</Text>
                  <Text fontSize="2xl" fontWeight="black" color="orange.500">{selectedPlan.price}</Text>
                </VStack>

                <Box bg="orange.50" px={4} py={2.5} borderRadius="xl" w="full" borderWidth="1px" borderColor="orange.100" textAlign="center">
                  <Text fontSize="10px" color="orange.600" fontWeight="bold">Nội dung chuyển khoản chuẩn:</Text>
                  <Text fontSize="md" fontWeight="black" color="orange.700" letterSpacing="wider">
                    PRO {selectedPlan.id.toUpperCase()} USER123
                  </Text>
                </Box>
                
                <Button 
                  w="full" bg="#a855f7" color="white" _hover={{ bg: "#9333ea" }} 
                  borderRadius="full" fontWeight="black" size="lg" h="12" shadow="md"
                  onClick={handleConfirmPayment} loading={isUpgrading}
                >
                  XÁC NHẬN MỞ KHÓA
                </Button>

                {/* THÊM PHẦN HỖ TRỢ TELEGRAM TẠI ĐÂY */}
                <HStack gap={1} mt={2} fontSize="11px" justify="center" w="full">
                  <Text color="gray.500">Gặp lỗi nạp tiền?</Text>
                  {/* Nhớ thay link t.me dưới đây bằng link hỗ trợ thật của bạn */}
                  <a href="https://t.me/Admin_Dung" target="_blank" rel="noopener noreferrer">
                    <HStack gap={1} color="#0088cc" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                      <Send size={12} />
                      <Text fontWeight="bold">Liên hệ Telegram</Text>
                    </HStack>
                  </a>
                </HStack>
              </VStack>

            </Grid>

          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
}