"use client";
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, HStack, VStack, Image, Grid, Button, Spinner, Input } from '@chakra-ui/react';
import { 
  Flame, Globe, BookOpen, ExternalLink, CheckSquare, MessageCircle, 
  RefreshCw, Link2, Inbox, Send, Lock, Unlock, CheckCircle2, UserPlus 
} from 'lucide-react';
import { chatMessages } from '@/lib/data';
import { toaster } from "@/components/ui/toaster"; 

export default function XepHangPage() {
  // --- STATES ---
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game Giải khóa từ
  const [challengeWord, setChallengeWord] = useState<any>(null);
  const [userGuess, setUserGuess] = useState('');

  // Quản lý Tab Chuỗi chung
  const [sharedStreakTab, setSharedStreakTab] = useState<'chuoi_chung' | 'loi_moi' | 'da_gui'>('chuoi_chung');
  const [sharedData, setSharedData] = useState({ friends: [], receivedInvites: [], sentInvites: [] });
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // --- FETCH FUNCTIONS ---
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error("Lỗi tải bảng xếp hạng");
      const result = await res.json();
      if (result.success) setLeaderboard(result.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const fetchChallenge = async () => {
    try {
      const res = await fetch('/api/words');
      if (!res.ok) throw new Error("Lỗi tải từ vựng");
      const words = await res.json();
      if (words && words.length > 0) {
        const random = words[Math.floor(Math.random() * words.length)];
        setChallengeWord(random);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSharedData = async () => {
    try {
      const res = await fetch('/api/shared-streak');
      if (!res.ok) throw new Error("Lỗi tải dữ liệu chuỗi chung");
      const data = await res.json();
      if (data.success) setSharedData(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchLeaderboard();
    fetchChallenge();
    fetchSharedData();
  }, []);

  // --- HANDLERS ---
  // Xử lý mini game giải khóa từ
  const handleUnlockWord = async () => {
    if (!userGuess.trim() || !challengeWord) return;

    if (userGuess.toLowerCase().trim() === challengeWord.meaning.toLowerCase().trim()) {
      // Gọi đúng vào API reward sẵn có của bạn
      await fetch('/api/user/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: 10 })
      });
      
      toaster.create({
        title: "Chính xác!",
        description: "+10 xu vào tài khoản của bạn.",
        type: "success",
      });
      
      setUserGuess('');
      // Tải lại trang để đổi từ mới ngẫu nhiên và cập nhật lại số dư xu
      window.location.reload(); 
    } else {
      toaster.create({
        title: "Tiếc quá!",
        description: "Nghĩa chưa đúng, thử lại nhé.",
        type: "error",
      });
    }
  };

  // Xử lý gửi lời mời kết bạn/chuỗi học chung
  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/shared-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() })
      });
      const data = await res.json();
      if (data.success) {
        toaster.create({ title: "Thành công", description: "Đã gửi lời mời học chung!", type: "success" });
        setInviteEmail('');
        fetchSharedData(); // Reload dữ liệu để cập nhật tab Đã gửi
      } else {
        toaster.create({ title: "Thất bại", description: data.error || "Có lỗi xảy ra", type: "error" });
      }
    } catch (e) {
      toaster.create({ title: "Lỗi", description: "Không thể kết nối Server", type: "error" });
    } finally {
      setIsInviting(false);
    }
  };

  // Xử lý chấp nhận lời mời học chung
  const handleAcceptInvite = async (streakId: string) => {
    try {
      const res = await fetch('/api/shared-streak', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streakId })
      });
      const data = await res.json();
      if (data.success) {
        toaster.create({ title: "Tuyệt vời!", description: "Đã thiết lập chuỗi chung thành công!", type: "success" });
        fetchSharedData(); // Reload để chuyển lời mời sang danh sách bạn bè học chung
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getAvatarBg = (bgClass: string | null | undefined) => {
    if (!bgClass) return '#9ca3af';
    if (bgClass.includes('indigo')) return '#818cf8';
    if (bgClass.includes('orange')) return '#f97316';
    if (bgClass.includes('teal')) return '#14b8a6';
    if (bgClass.startsWith('#')) return bgClass;
    return '#9ca3af';
  };

  if (isLoading) return <Flex p={8} justify="center" align="center" minH="80vh"><Spinner size="xl" color="#f97316" /></Flex>;

  return (
    <Flex p={8} maxW="1400px" mx="auto" minH="full" bg="white" direction={{ base: 'column', lg: 'row' }} gap={6}>
      
      {/* ================= CỘT TRÁI (58%) ================= */}
      <Flex w={{ base: 'full', lg: '58%' }} direction="column" gap={6}>
        
        {/* Header Bảng xếp hạng */}
        <HStack gap={4}>
            <Flex w={14} h={14} bg="#f97316" borderRadius="2xl" align="center" justify="center" shadow="md">
                <Flame size={28} color="white" fill="white" />
            </Flex>
            <Box>
                <Text fontSize="2xl" fontWeight="black" color="gray.800">Bảng xếp hạng Streak</Text>
                <Text color="gray.500" fontWeight="medium">Thử thách duy trì chuỗi ngày học tập liên tục</Text>
            </Box>
        </HStack>

        {/* Bảng Leaderboard */}
        <Flex borderWidth="2px" borderColor="gray.800" borderRadius="24px" bg="white" direction="column" h="480px">
          <Grid templateColumns="80px 1fr 100px" px={6} py={4} borderBottomWidth="2px" borderColor="gray.100" fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="wider" flexShrink={0}>
            <Text textAlign="center">HẠNG</Text>
            <Text>NGƯỜI DÙNG</Text>
            <Text textAlign="right">STREAK</Text>
          </Grid>
          <Box overflowY="auto" flex={1} className="custom-scrollbar">
            {leaderboard.length > 0 ? (
                leaderboard.map((user, i) => {
                const avatarUrl = user.coverImage || user.avatar?.replace(/\[.*\]\((.*)\)/, '$1');
                
                return (
                    <Grid key={i} templateColumns="80px 1fr 100px" px={6} py={3.5} alignItems="center" _hover={{ bg: 'gray.50' }} borderBottomWidth="1px" borderColor="gray.50" transition="colors 0.2s">
                    <Flex justify="center" fontSize="lg">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <Flex w={6} h={6} bg="gray.100" borderRadius="full" align="center" justify="center" fontSize="13px" fontWeight="bold" color="gray.600">{i + 1}</Flex>}
                    </Flex>
                    <HStack gap={4}>
                        {avatarUrl ? (
                        <Image src={avatarUrl} alt={user.name} w={9} h={9} borderRadius="full" objectFit="cover" shadow="sm" />
                        ) : (
                        <Flex w={9} h={9} borderRadius="full" color="white" align="center" justify="center" fontWeight="bold" fontSize="sm" shadow="sm" bg={getAvatarBg(user.bg)}>
                            {user.initial || user.name?.charAt(0) || 'U'}
                        </Flex>
                        )}
                        <Text fontWeight="bold" fontSize="sm" color="gray.800">{user.name}</Text>
                    </HStack>
                    <HStack justify="flex-end" gap={1.5} fontWeight="bold" color="#f97316" fontSize="15px">
                        <Text>{user.streakCount ?? 0}</Text> 
                        <Flame size={16} color="#f97316" fill="#f97316" />
                    </HStack>
                    </Grid>
                );
                })
            ) : (
                <Flex justify="center" py={10} color="gray.400" fontWeight="bold">Chưa có dữ liệu xếp hạng</Flex>
            )}
          </Box>
        </Flex>

        {/* Khối SẢN PHẨM KHÁC */}
        <Box borderWidth="2px" borderColor="#58cc02" borderRadius="24px" bg="white" p={5} shadow="sm">
          <HStack mb={4} gap={2}><Globe size={20} color="#58cc02" /><Text fontWeight="extrabold" fontSize="13px" color="gray.600" textTransform="uppercase" letterSpacing="wide">SẢN PHẨM KHÁC</Text></HStack>
          <Flex align="center" justify="space-between" role="group" cursor="pointer">
            <HStack gap={4}>
              <Flex w={12} h={12} bg="blue.500" borderRadius="xl" align="center" justify="center" color="white" shadow="sm" flexShrink={0}><BookOpen size={24} /></Flex>
              <Box>
                <HStack gap={2}><Text fontWeight="extrabold" color="gray.800">Vocapy</Text><Text fontSize="xs" fontWeight="medium" color="gray.400">vocapy.com</Text></HStack>
                <Text fontSize="xs" color="gray.500" fontWeight="medium" mt={0.5}>Web học từ vựng Trung, Nhật, Hàn</Text>
              </Box>
            </HStack>
            <Box color="gray.300" _groupHover={{ color: 'blue.500' }} transition="colors 0.2s">
              <ExternalLink size={20} color="currentColor" />
            </Box>
          </Flex>
          <Box borderTopWidth="1px" borderColor="gray.100" my={4} />
          <HStack gap={4} opacity={0.5}>
            <Flex w={12} h={12} bg="#58cc02" borderRadius="xl" align="center" justify="center" color="white" flexShrink={0}><CheckSquare size={24} /></Flex>
            <Text fontWeight="extrabold" color="gray.800">Ngữ pháp Luyện Từ</Text>
          </HStack>
        </Box>
      </Flex>


      {/* ================= CỘT PHẢI (42%) ================= */}
      <Flex w={{ base: 'full', lg: '42%' }} direction="column" gap={6}>
        
        {/* Game Giải Khóa Từ (Thay thế Heatmap) */}
        <Flex direction="column" p={6} bg="white" borderRadius="24px" borderWidth="2px" borderColor="#58cc02" shadow="sm" minH="220px" justify="center">
            <HStack justify="space-between" mb={4}>
                <HStack><Unlock size={20} color="#58cc02" /><Text fontWeight="extrabold" fontSize="md" color="gray.700">Giải khóa từ (+10 xu)</Text></HStack>
                <Box color="orange.400" bg="orange.50" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">Mini Game</Box>
            </HStack>
            {challengeWord ? (
                <VStack align="stretch" gap={4}>
                    <Box p={4} bg="gray.50" borderRadius="xl" textAlign="center" borderWidth="1px" borderColor="gray.100">
                        <Text fontSize="2xl" fontWeight="black" color="gray.800">{challengeWord.word}</Text>
                        <Text fontSize="sm" color="gray.500" mt={1}>Nghĩa của từ này là gì?</Text>
                    </Box>
                    <HStack gap={2}>
                        <Input 
                            placeholder="Nhập nghĩa tiếng Việt..." 
                            value={userGuess} 
                            onChange={(e) => setUserGuess(e.target.value)} 
                            bg="white" borderRadius="xl"
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlockWord()}
                        />
                        <Button bg="#58cc02" color="white" px={6} borderRadius="xl" onClick={handleUnlockWord}>Gửi</Button>
                    </HStack>
                </VStack>
            ) : (
                <Flex justify="center" py={6}><Spinner color="#58cc02" /></Flex>
            )}
        </Flex>

        {/* Khối Chuỗi chung có 3 Tabs động */}
        <Flex borderWidth="2px" borderColor="gray.800" borderRadius="24px" bg="white" direction="column" overflow="hidden" shadow="sm">
          <Flex borderBottomWidth="4px" borderColor="#58cc02">
            <Flex flex={1} bg={sharedStreakTab === 'chuoi_chung' ? "#c084fc" : "white"} color={sharedStreakTab === 'chuoi_chung' ? "white" : "gray.500"} justify="center" align="center" py={3.5} fontWeight="extrabold" fontSize="13px" gap={2} cursor="pointer" onClick={() => setSharedStreakTab('chuoi_chung')} transition="all 0.2s">
              <Link2 size={16} /> Chuỗi chung
            </Flex>
            <Flex flex={1} bg={sharedStreakTab === 'loi_moi' ? "#c084fc" : "white"} color={sharedStreakTab === 'loi_moi' ? "white" : "gray.500"} justify="center" align="center" py={3.5} fontWeight="extrabold" fontSize="13px" gap={2} cursor="pointer" onClick={() => setSharedStreakTab('loi_moi')} transition="all 0.2s">
              <Inbox size={16} /> Lời mời {sharedData.receivedInvites.length > 0 && `(${sharedData.receivedInvites.length})`}
            </Flex>
            <Flex flex={1} bg={sharedStreakTab === 'da_gui' ? "#c084fc" : "white"} color={sharedStreakTab === 'da_gui' ? "white" : "gray.500"} justify="center" align="center" py={3.5} fontWeight="extrabold" fontSize="13px" gap={2} cursor="pointer" onClick={() => setSharedStreakTab('da_gui')} transition="all 0.2s">
              <Send size={16} /> Đã gửi
            </Flex>
          </Flex>
          
          <Box p={6} minH="220px">
            {/* TAB 1: DANH SÁCH CHUỖI CHUNG */}
            {sharedStreakTab === 'chuoi_chung' && (
                <VStack align="stretch" gap={4}>
                    <HStack gap={2}>
                        <Input size="sm" borderRadius="lg" placeholder="Nhập email bạn bè..." value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                        <Button size="sm" bg="#c084fc" color="white" onClick={handleSendInvite} loading={isInviting}>Mời</Button>
                    </HStack>
                    
                    {sharedData.friends.length === 0 ? (
                        <Text fontSize="xs" color="gray.400" textAlign="center" mt={4} fontWeight="bold">Bạn chưa có chuỗi học chung nào. Thử gõ email mời bạn bè nhé!</Text>
                    ) : (
                        sharedData.friends.map((item: any) => (
                            <Flex key={item.id} align="center" gap={3} p={3} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                                <Image src={item.friend.coverImage || '/default.png'} w={10} h={10} borderRadius="full" objectFit="cover" />
                                <Box flex={1}>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.800">{item.friend.name}</Text>
                                    <Text fontSize="xs" color="orange.500" fontWeight="bold">🔥 Chuỗi học chung: {item.streakCount} ngày</Text>
                                </Box>
                                <CheckCircle2 color="#58cc02" size={20} />
                            </Flex>
                        ))
                    )}
                </VStack>
            )}

            {/* TAB 2: LỜI MỜI NHẬN ĐƯỢC */}
            {sharedStreakTab === 'loi_moi' && (
                <VStack align="stretch" gap={3}>
                    {sharedData.receivedInvites.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" h="130px" opacity={0.6}>
                          <Inbox size={36} color="gray" style={{ marginBottom: '8px' }} />
                          <Text fontSize="xs" fontWeight="bold" color="gray.500">Không có lời mời học chung nào</Text>
                        </Flex>
                    ) : (
                        sharedData.receivedInvites.map((item: any) => (
                            <Flex key={item.id} align="center" gap={3} p={3} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                                <Image src={item.friend.coverImage || '/default.png'} w={10} h={10} borderRadius="full" objectFit="cover" />
                                <Text flex={1} fontWeight="bold" fontSize="sm" color="gray.800">{item.friend.name}</Text>
                                <Button size="xs" bg="#58cc02" color="white" onClick={() => handleAcceptInvite(item.id)}>Chấp nhận</Button>
                            </Flex>
                        ))
                    )}
                </VStack>
            )}

            {/* TAB 3: LỜI MỜI ĐÃ GỬI ĐI */}
            {sharedStreakTab === 'da_gui' && (
                <VStack align="stretch" gap={3}>
                    {sharedData.sentInvites.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" h="130px" opacity={0.6}>
                          <Send size={36} color="gray" style={{ marginBottom: '8px' }} />
                          <Text fontSize="xs" fontWeight="bold" color="gray.500">Bạn chưa gửi lời mời nào</Text>
                        </Flex>
                    ) : (
                        sharedData.sentInvites.map((item: any) => (
                            <Flex key={item.id} align="center" gap={3} p={3} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                                <Image src={item.friend.coverImage || '/default.png'} w={10} h={10} borderRadius="full" objectFit="cover" />
                                <Text flex={1} fontWeight="bold" fontSize="sm" color="gray.800">{item.friend.name}</Text>
                                <Box bg="gray.100" px={2.5} py={1} borderRadius="md" fontSize="11px" fontWeight="bold" color="gray.500">Đang chờ...</Box>
                            </Flex>
                        ))
                    )}
                </VStack>
            )}
          </Box>
        </Flex>

        {/* Khối Chat Cộng đồng */}
        <Flex borderWidth="2px" borderColor="gray.200" borderRadius="24px" bg="white" direction="column" flex={1} minH="200px" shadow="sm" overflow="hidden">
          <Flex align="center" justify="space-between" px={5} py={4} borderBottomWidth="1px" borderColor="gray.100" bg="gray.50">
            <HStack gap={2}><MessageCircle size={20} color="#64748b" /><Text fontWeight="extrabold" fontSize="sm" color="gray.800">Trò chuyện cộng đồng</Text></HStack>
            <Box cursor="pointer" color="blue.400" _hover={{ transform: 'rotate(180deg)' }} transition="transform 0.5s">
              <RefreshCw size={16} color="currentColor" />
            </Box>
          </Flex>
          <Flex flex={1} overflowY="auto" p={4} direction="column" gap={3}>
            {chatMessages && chatMessages.map((msg, idx) => {
              const adminAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces";
              return (
                <Flex key={idx} align="flex-start" gap={3} p={3} bg="#f8f9fa" borderRadius="2xl">
                  {msg.isAdmin ? (
                    <Flex w={8} h={8} borderRadius="full" bg="#047857" color="white" align="center" justify="center" fontWeight="bold" fontSize="xs" flexShrink={0} shadow="sm">X</Flex>
                  ) : (
                    <Image src={adminAvatar} alt="Avatar" w={8} h={8} borderRadius="full" objectFit="cover" flexShrink={0} shadow="sm" />
                  )}
                  <Box>
                    <HStack align="baseline" gap={2} mb={1}>
                      <Text fontWeight="bold" fontSize="13px" color={msg.isAdmin ? '#047857' : 'gray.800'}>{msg.sender}</Text>
                      <Text fontSize="11px" color="gray.400" fontWeight="medium">{msg.time}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" lineHeight="snug">{msg.text}</Text>
                  </Box>
                </Flex>
              )
            })}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}