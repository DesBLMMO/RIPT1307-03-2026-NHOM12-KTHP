"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import hàm đăng nhập của NextAuth
import { 
  Box, Flex, Text, VStack, HStack, Button, Input, 
  Spinner, Image, Center, SimpleGrid, Container, Grid
} from '@chakra-ui/react';
import { 
  X, CheckCircle2, Heart, BookOpen, Headphones, Smartphone, ArrowRight, Users, Zap
} from 'lucide-react';

// ==========================================
// COMPONENT 1: MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ (POPUP)
// ==========================================
const AuthScreen = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dữ liệu Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGIC XỬ LÝ ĐĂNG NHẬP THẬT (NEXTAUTH) ---
        const result = await signIn('credentials', {
          redirect: false, // Ngăn tự động chuyển hướng để bắt lỗi trước
          email,
          password,
        });

        if (result?.error) {
          alert(result.error); // Hiển thị lỗi từ Backend (Sai mật khẩu, tài khoản không tồn tại...)
        } else {
          alert("Đăng nhập thành công!");
          // router.push('/'); // Đẩy vào trang chủ, hệ thống tự lưu Session Cookie
          window.location.href = '/';
          router.refresh();
        }
      } else {
        // --- LOGIC XỬ LÝ ĐĂNG KÝ THẬT (MONGODB) ---
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Đăng ký thất bại!");
        } else {
          alert("Đăng ký thành công! Đang tự động đăng nhập...");
          // Đăng ký xong tự động gọi signIn để đăng nhập luôn cho tiện
          await signIn('credentials', {
            redirect: false,
            email,
            password,
          });
          router.push('/');
          router.refresh();
        }
      }
    } catch (err) {
      alert("Đã xảy ra lỗi kết nối đến hệ thống!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={10000} bg="white" direction={{ base: 'column', lg: 'row' }} overflow="hidden" animation="fadeIn 0.3s ease-out">
      {/* Nửa Trái: Banner giới thiệu */}
      <Flex flex={1.2} bg="#58cc02" direction="column" align="center" justify="center" p={12} color="white" display={{ base: 'none', lg: 'flex' }} position="relative">
        <Box position="absolute" top="10%" left="10%" opacity={0.2} transform="rotate(-15deg)"><Heart size={80} fill="white" /></Box>
        <Box position="absolute" bottom="15%" right="15%" opacity={0.2} transform="rotate(20deg)"><BookOpen size={100} fill="white" /></Box>

        <VStack gap={8} maxW="500px" textAlign="center" zIndex={1}>
          <Box bg="white" p={4} borderRadius="3xl" shadow="2xl">
            <Flex w="100px" h="100px" bg="blue.500" borderRadius="2xl" align="center" justify="center" color="white" fontWeight="black" fontSize="4xl">L</Flex>
          </Box>
          <VStack gap={4}>
            <Text fontSize="5xl" fontWeight="black" lineHeight="1.1">Học ngoại ngữ vui vẻ và miễn phí.</Text>
            <Text fontSize="xl" fontWeight="bold" opacity={0.9}>Tham gia cùng hàng triệu học viên và chinh phục tiếng Anh thông qua các trò chơi tương tác hấp dẫn.</Text>
          </VStack>
        </VStack>
      </Flex>

      {/* Nửa Phải: Form Auth */}
      <Flex flex={1} direction="column" bg="white" position="relative">
        <Flex w="full" p={6} justify="flex-end" position="absolute" top={0} right={0}>
          <Button variant="ghost" color="gray.400" borderRadius="full" onClick={onClose} _hover={{ bg: "gray.100" }} w={12} h={12}>
            <X size={28} />
          </Button>
        </Flex>

        <Center flex={1} px={6} py={12}>
          <Box w="full" maxW="380px">
            <VStack gap={8} w="full">
              <VStack gap={2} textAlign="center">
                <Text fontSize="3xl" fontWeight="black" color="gray.700">
                  {isLogin ? 'Chào mừng trở lại!' : 'Tạo hồ sơ học tập'}
                </Text>
                <Text fontSize="md" color="gray.500" fontWeight="bold">
                  {isLogin ? 'Hãy đăng nhập để tiếp tục lộ trình.' : 'Bắt đầu hành trình chinh phục tiếng Anh.'}
                </Text>
              </VStack>

              <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                <VStack gap={4}>
                  {!isLogin && (
                    <Input placeholder="Tên của bạn" value={name} onChange={(e) => setName(e.target.value)} required h="14" borderRadius="2xl" bg="#f7f7f7" borderWidth="2px" borderColor="#e5e5e5" fontSize="md" fontWeight="bold" _focus={{ bg: "white", borderColor: "#1cb0f6", shadow: "none" }} />
                  )}
                  <Input placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} h="14" borderRadius="2xl" bg="#f7f7f7" borderWidth="2px" borderColor="#e5e5e5" fontSize="md" fontWeight="bold" _focus={{ bg: "white", borderColor: "#1cb0f6", shadow: "none" }} />
                  <Input placeholder="Mật khẩu" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} h="14" borderRadius="2xl" bg="#f7f7f7" borderWidth="2px" borderColor="#e5e5e5" fontSize="md" fontWeight="bold" _focus={{ bg: "white", borderColor: "#1cb0f6", shadow: "none" }} />
                  
                  <Button type="submit" w="full" h="14" borderRadius="2xl" bg="#1cb0f6" color="white" fontWeight="black" fontSize="md" textTransform="uppercase" letterSpacing="widest" mt={2} borderBottomWidth="4px" borderColor="#1899d6" _hover={{ bg: '#149ede' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
                  </Button>
                </VStack>
              </form>

              <HStack w="full">
                <Box flex={1} h="2px" bg="gray.100" />
                <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase" px={3}>Hoặc</Text>
                <Box flex={1} h="2px" bg="gray.100" />
              </HStack>

              <SimpleGrid columns={2} gap={4} w="full">
                <Button h="12" borderRadius="2xl" variant="outline" borderWidth="2px" borderBottomWidth="4px" borderColor="gray.200" fontSize="xs" fontWeight="black" textTransform="uppercase" gap={2} _hover={{ bg: 'gray.50' }}>
                  <Image src="https://www.svgrepo.com/show/475656/google-color.svg" w={4} alt="Google" /> Google
                </Button>
                <Button h="12" borderRadius="2xl" variant="outline" borderWidth="2px" borderBottomWidth="4px" borderColor="gray.200" fontSize="xs" fontWeight="black" textTransform="uppercase" gap={2} _hover={{ bg: 'gray.50' }} color="blue.600">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" w={4} alt="Facebook" /> Facebook
                </Button>
              </SimpleGrid>

              <Box pt={4}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                  <Box as="button" onClick={() => setIsLogin(!isLogin)} ml={2} color="#1cb0f6" fontWeight="black" textTransform="uppercase" _hover={{ color: "#1899d6" }}>
                    {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                  </Box>
                </Text>
              </Box>
            </VStack>
          </Box>
        </Center>
      </Flex>
    </Flex>
  );
};

// ==========================================
// COMPONENT 2: LANDING PAGE GIAO DIỆN CHÍNH
// ==========================================
export default function AuthPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <Box w="full" minH="100vh" bg="#f8fafc" position="relative">
      
      {showAuthModal && <AuthScreen onClose={() => setShowAuthModal(false)} />}

      <Box position="absolute" top={0} right={0} w="600px" h="600px" bg="blue.100" borderRadius="full" filter="blur(100px)" opacity={0.5} pointerEvents="none" zIndex={0} />

      <Box position="relative" zIndex={1}>
        {/* NAVBAR */}
        <Flex w="full" justify="space-between" align="center" px={{ base: 4, lg: 10 }} py={4} maxW="1400px" mx="auto">
          <HStack gap={3} cursor="pointer">
            <Flex w={8} h={8} bg="blue.600" borderRadius="xl" align="center" justify="center" color="white" fontWeight="black" fontSize="lg">L</Flex>
            <Text fontSize="xl" fontWeight="black" color="gray.800" letterSpacing="tight">Luyện Từ</Text>
          </HStack>

          <HStack gap={8} display={{ base: 'none', lg: 'flex' }}>
            <Text fontWeight="bold" fontSize="sm" color="gray.600" cursor="pointer" _hover={{ color: 'blue.600' }}>Tính năng</Text>
            <Text fontWeight="bold" fontSize="sm" color="gray.600" cursor="pointer" _hover={{ color: 'blue.600' }}>Cách học</Text>
            <Text fontWeight="bold" fontSize="sm" color="gray.600" cursor="pointer" _hover={{ color: 'blue.600' }}>Đánh giá</Text>
            <Text fontWeight="bold" fontSize="sm" color="gray.600" cursor="pointer" _hover={{ color: 'blue.600' }}>FAQ</Text>
          </HStack>

          <HStack gap={4}>
            <Text as="button" fontWeight="bold" fontSize="sm" color="gray.700" _hover={{ color: 'blue.600' }} display={{ base: 'none', sm: 'block' }} onClick={() => setShowAuthModal(true)}>
              Đăng nhập
            </Text>
            <Button bg="blue.600" color="white" borderRadius="full" px={6} fontSize="sm" fontWeight="bold" _hover={{ bg: 'blue.700' }} onClick={() => setShowAuthModal(true)}>
              Bắt đầu miễn phí <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </Button>
          </HStack>
        </Flex>

        <Container maxW="1200px" pt={{ base: 10, lg: 20 }}>
          
          {/* HERO SECTION */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            <VStack align="start" gap={6} maxW="600px">
              <Text fontSize={{ base: "5xl", lg: "6xl" }} fontWeight="black" color="gray.900" lineHeight="1.1" letterSpacing="tight">
                Học từ vựng có lộ trình, <br />
                <Text as="span" color="blue.600">nhớ lâu và quay lại đều hơn</Text>
              </Text>
              
              <Text fontSize="lg" color="gray.600" fontWeight="medium" lineHeight="tall">
                Thay vì mở 5 app khác nhau, bạn chỉ cần một chỗ: chọn bộ từ, học flashcard, luyện qua game, để SRS nhắc ôn đúng lúc. Có sẵn hơn 100.000 từ vựng từ SGK, Oxford 3000, Cambridge IELTS, Vocabulary in Use và nhiều nguồn khác.
              </Text>

              <Button bg="blue.600" color="white" borderRadius="full" h="14" px={8} fontSize="lg" fontWeight="bold" mt={4} _hover={{ bg: 'blue.700', transform: 'translateY(-2px)', shadow: 'lg' }} transition="all 0.2s" onClick={() => setShowAuthModal(true)}>
                Bắt đầu học miễn phí <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Button>
            </VStack>

            <Box position="relative" w="full" h={{ base: '300px', lg: '450px' }}>
              <Box w="full" h="full" bg="white" borderRadius="3xl" shadow="2xl" overflow="hidden" borderWidth="1px" borderColor="gray.100" position="relative">
                <Image src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" w="full" h="full" objectFit="cover" opacity={0.9} alt="mockup" />
                <Flex position="absolute" top={0} left={0} w="full" h="full" bg="blue.900" opacity={0.1} />
              </Box>

              <Flex position="absolute" top="-5%" left="-5%" bg="white" p={3} px={5} borderRadius="2xl" shadow="xl" align="center" gap={3} animation="bounce 3s infinite ease-in-out">
                <Flex w={10} h={10} bg="green.50" color="green.500" borderRadius="full" align="center" justify="center"><Users size={20} /></Flex>
                <Box>
                  <Text fontWeight="black" fontSize="md" color="gray.800">100.000+ <Text as="span" fontSize="xs" fontWeight="medium" color="gray.500">người học</Text></Text>
                  <Text fontSize="xs" color="gray.500">quay lại mỗi ngày</Text>
                </Box>
              </Flex>

              <Flex position="absolute" bottom="-5%" right="-5%" bg="white" p={3} px={5} borderRadius="2xl" shadow="xl" align="center" gap={3}>
                <Flex w={10} h={10} bg="purple.50" color="purple.500" borderRadius="full" align="center" justify="center"><Zap size={20} fill="currentColor" /></Flex>
                <Text fontWeight="black" fontSize="md" color="gray.800">SRS + roadmap <br/><Text as="span" fontSize="xs" fontWeight="medium" color="gray.500">không học rời rạc</Text></Text>
              </Flex>
            </Box>
          </Grid>

          {/* STATS SECTION */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6} mt={24}>
            {[
              { icon: Heart, iconColor: "red.500", iconBg: "red.50", title: "100.000+", sub: "người học đang hoạt động" },
              { icon: BookOpen, iconColor: "blue.500", iconBg: "blue.50", title: "100.000+", sub: "từ vựng từ SGK, Oxford 3000, Vocabulary in Use..." },
              { icon: Headphones, iconColor: "orange.500", iconBg: "orange.50", title: "6", sub: "chế độ luyện tập + ôn SRS" },
              { icon: Smartphone, iconColor: "green.500", iconBg: "green.50", title: "Web + Mobile", sub: "học liền mạch trên mọi thiết bị" }
            ].map((stat, idx) => (
              <Box key={idx} bg="white" p={6} borderRadius="3xl" shadow="sm" borderWidth="1px" borderColor="gray.100" _hover={{ shadow: 'md', transform: 'translateY(-4px)' }} transition="0.3s">
                <Flex w={12} h={12} bg={stat.iconBg} color={stat.iconColor} borderRadius="xl" align="center" justify="center" mb={4}>
                  <stat.icon size={24} />
                </Flex>
                <Text fontSize="3xl" fontWeight="black" color="gray.900">{stat.title}</Text>
                <Text fontSize="sm" color="gray.500" fontWeight="medium" mt={2} lineHeight="tall">{stat.sub}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* TÍNH NĂNG CHÍNH */}
          <Box mt={32} textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="widest" mb={4}>TÍNH NĂNG CHÍNH</Text>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="gray.900" maxW="800px" mx="auto" lineHeight="1.2">
              Tạo deck, học flashcard, luyện game, ôn SRS — tất cả trong một
            </Text>
            <Text fontSize="md" color="gray.500" mt={4} mb={16}>
              Dưới đây là những gì bạn thực sự dùng mỗi ngày khi học trên Luyện Từ.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} textAlign="left">
              {[
                { title: "Tạo bộ từ, gom chủ đề và học cùng cộng đồng", desc: "Quản lý bộ từ theo lộ trình, tag, chủ đề hoặc mục tiêu riêng. Bạn có thể tự tạo deck mới, chia sẻ công khai hoặc dùng thư viện cộng đồng có sẵn.", label: "DECKS & COMMUNITY" },
                { title: "Lộ trình rõ ràng cho TOEIC, IELTS và học theo level", desc: "Không phải đoán nên học gì tiếp theo. Lộ trình và thư viện deck được sắp xếp từ cơ bản đến nâng cao để bạn tự tin chinh phục mục tiêu.", label: "ROADMAP & LIBRARY" },
                { title: "Biến việc ôn từ thành game ngắn, nhanh và dễ quay lại", desc: "Bạn có thể chuyển cùng một bộ từ sang trắc nghiệm, nối nghĩa, gõ từ, nghe viết. SRS sẽ nhắc đúng lúc để kiến thức không rơi rụng.", label: "GAMES & SRS" },
                { title: "Dùng coin để mở khóa avatar, hình nền và vật phẩm", desc: "Học xong không chỉ là tick hoàn thành. Dùng coin kiếm được để mở khóa hình nền giúp hành trình học có cảm giác sở hữu hơn.", label: "STORE & PERSONALIZATION" }
              ].map((feat, idx) => (
                <Flex key={idx} direction="column" bg="white" borderRadius="3xl" overflow="hidden" shadow="sm" borderWidth="1px" borderColor="gray.100" _hover={{ shadow: 'xl' }} transition="all 0.3s">
                  <Box w="full" h="250px" bgGradient="linear(to-br, blue.50, purple.50)" p={6} position="relative">
                    <Box w="full" h="full" bg="white" borderRadius="xl" shadow="md" overflow="hidden" borderWidth="2px" borderColor="white">
                       <Image src={`https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=800&auto=format&fit=crop`} w="full" h="full" objectFit="cover" opacity={0.8} alt="feature mockup" />
                    </Box>
                  </Box>
                  <Box p={8}>
                    <Text fontSize="xs" fontWeight="black" color="blue.600" textTransform="uppercase" letterSpacing="widest" mb={3}>{feat.label}</Text>
                    <Text fontSize="2xl" fontWeight="black" color="gray.900" mb={3} lineHeight="tight">{feat.title}</Text>
                    <Text fontSize="sm" color="gray.500" lineHeight="tall">{feat.desc}</Text>
                  </Box>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>

          {/* SECTION: CALL TO ACTION CUỐI TRANG & FOOTER */}
          <Box mt={32} pb={10}>
            
            {/* Call To Action Box */}
            <Flex direction="column" align="center" justify="center" bg="blue.600" borderRadius="3xl" p={{ base: 10, md: 20 }} color="white" textAlign="center" position="relative" overflow="hidden">
              <Box position="absolute" top="-20%" left="-10%" w="300px" h="300px" bg="whiteAlpha.200" borderRadius="full" filter="blur(60px)" />
              <VStack gap={8} zIndex={1}>
                <Text fontSize={{ base: "3xl", md: "5xl" }} fontWeight="black" lineHeight="1.1">
                  Sẵn sàng chinh phục <br /> mục tiêu tiếng Anh của bạn?
                </Text>
                <Text fontSize="lg" fontWeight="bold" opacity={0.9} maxW="600px">
                  Đừng để từ vựng là rào cản. Tham gia ngay hôm nay để trải nghiệm lộ trình học thông minh nhất.
                </Text>
                <Button 
                  bg="white" color="blue.600" h="16" px={12} fontSize="xl" fontWeight="black" borderRadius="2xl" textTransform="uppercase" borderBottomWidth="6px" borderColor="gray.200"
                  _hover={{ transform: "translateY(-2px)", bg: "gray.50" }} _active={{ transform: "translateY(2px)", borderBottomWidth: "2px" }}
                  onClick={() => setShowAuthModal(true)}
                >
                  Bắt đầu miễn phí ngay
                </Button>
              </VStack>
            </Flex>

            {/* Footer Links */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={10} mt={20} px={4}>
              <VStack align="start" gap={4}>
                <Text fontWeight="black" color="gray.800" textTransform="uppercase" fontSize="sm">Sản phẩm</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Từ vựng SGK</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Luyện thi TOEIC</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Game trắc nghiệm</Text>
              </VStack>
              <VStack align="start" gap={4}>
                <Text fontWeight="black" color="gray.800" textTransform="uppercase" fontSize="sm">Công ty</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Về Luyện Từ</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Đội ngũ</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Tuyển dụng</Text>
              </VStack>
              <VStack align="start" gap={4}>
                <Text fontWeight="black" color="gray.800" textTransform="uppercase" fontSize="sm">Hỗ trợ</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Trung tâm trợ giúp</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Quy tắc cộng đồng</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>An toàn & Bảo mật</Text>
              </VStack>
              <VStack align="start" gap={4}>
                <Text fontWeight="black" color="gray.800" textTransform="uppercase" fontSize="sm">Pháp lý</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Điều khoản dịch vụ</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Chính sách bảo mật</Text>
                <Text color="gray.500" fontWeight="bold" cursor="pointer" _hover={{ color: "blue.500" }}>Chính sách Cookies</Text>
              </VStack>
            </SimpleGrid>

            {/* Copyright */}
            <Flex justify="center" mt={20} pt={10} borderTop="2px solid" borderColor="gray.100">
              <Text fontSize="sm" fontWeight="bold" color="gray.400">
                © 2026 Luyện Từ. All rights reserved.
              </Text>
            </Flex>

          </Box>
        </Container>
      </Box>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}} />
    </Box>
  );
}