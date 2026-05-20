"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  Box, Flex, Text, HStack, Button, Input, 
  VStack, Center, Grid, SimpleGrid, Spinner, Badge, 
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { toast } from '@/hooks/use-toast';
import { 
  ChevronLeft, ChevronRight, X, Check, Volume2, 
  Heart, Clock, Pause, Play, Headphones, Sparkles,
  ArrowLeft, Search, Settings, BookOpen, Hash, Shuffle, 
  Layers, CheckSquare, Type, Grid3X3, Zap, CircleDollarSign,
  RefreshCw, Pencil, Target, Pin, Trophy, BrainCircuit, Folder
} from 'lucide-react';

// ==========================================
// 1. ANIMATIONS VÀ TIỆN ÍCH CHUNG
// ==========================================
const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;
const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(74, 222, 128, 0.5); }
  100% { transform: scale(1); }
`;
const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const playAudio = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

export const playTingSound = () => {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.error("Trình duyệt không hỗ trợ AudioContext");
  }
};

const CustomProgressWithDot = ({ value, color = "#22c55e", h = "4px", bg = "#e2e8f0" }: { value: number, color?: string, h?: string, bg?: string }) => {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <Box w="full" h={h} bg={bg} borderRadius="full" position="relative" display="flex" alignItems="center" mt={2}>
      <Box h="full" bg={color} w={`${safeValue}%`} transition="width 0.3s ease" borderRadius="full" />
      {safeValue > 0 && (
         <Box 
           position="absolute" left={`calc(${safeValue}% - 4px)`} 
           w="10px" h="10px" bg={color} borderRadius="full" border="2px solid white" shadow="sm"
           transition="left 0.3s ease" 
         />
      )}
    </Box>
  )
};

const CustomProgress = ({ value, color = "#58cc02", h = "12px", bg = "gray.200" }: { value: number, color?: string, h?: string, bg?: string }) => (
  <Box w="full" h={h} bg={bg} borderRadius="full" overflow="hidden">
    <Box h="full" bg={color} w={`${Math.min(100, Math.max(0, value))}%`} transition="width 0.3s ease" borderRadius="full" />
  </Box>
);

const CustomSwitch = () => {
  const [isOn, setIsOn] = useState(true);
  return (
    <Flex w="36px" h="20px" bg={isOn ? "#22c55e" : "gray.300"} borderRadius="full" align="center" px="2px" cursor="pointer" onClick={() => setIsOn(!isOn)} transition="background-color 0.2s">
      <Box w="16px" h="16px" bg="white" borderRadius="full" shadow="sm" transform={isOn ? "translateX(16px)" : "translateX(0)"} transition="transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" />
    </Flex>
  );
};

const learningModes = [
  { id: 'flashcard', name: 'Flashcard', desc: 'Lật thẻ để học từ vựng', coin: '+5', icon: Layers, bg: '#7c5ced' },
  { id: 'quiz', name: 'Quiz', desc: 'Trắc nghiệm chọn đáp án...', coin: '+10', icon: CheckSquare, bg: '#f98016' },
  { id: 'listening', name: 'Listening', desc: 'Nghe từ và gõ lại (30s)', coin: '+15', icon: Headphones, bg: '#0fa3e5' },
  { id: 'typing', name: 'Typing', desc: 'Xem nghĩa, gõ từ tiếng Anh..', coin: '+10', icon: Type, bg: '#6fc917' },
  { id: 'matching', name: 'Ghép cặp', desc: 'Nối từ với nghĩa', coin: '+10', icon: Grid3X3, bg: '#20a1f0' },
  { id: 'combo', name: 'Tổng hợp', desc: 'Kết hợp nhiều chế độ', coin: '+20', icon: Zap, bg: '#f46c9c', isHot: true, shadow: '0 0 25px rgba(244, 108, 156, 0.6)' },
];

// COMMON UI: Header + Result view used by minigames
function GameHeader({ title, progress, time, onExit, onReplay, showEnVn }: any) {
  return (
    <Box bg="white" borderRadius="3xl" p={5} shadow="sm" borderWidth="1px" borderColor="gray.200" mb={6} w="full" maxW="950px" mx="auto">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontWeight="black" color="gray.700" fontSize="lg">{title}</Text>
        <HStack gap={6}>
          {showEnVn && (
            <HStack gap={2}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700">EN—VN</Text>
              <CustomSwitch />
            </HStack>
          )}
          <Button variant="ghost" size="sm" color="blue.500" fontWeight="black" gap={2} _hover={{ bg: 'blue.50' }} onClick={onReplay}>
            <RefreshCw size={16} strokeWidth={3} /> Chơi lại
          </Button>
          <Button variant="ghost" size="sm" color="blue.500" fontWeight="black" _hover={{ bg: 'blue.50' }} onClick={onExit}>
            Thoát
          </Button>
        </HStack>
      </Flex>
      <Flex align="center" gap={4}>
        <Flex bg="#fef3c7" color="#d97706" px={3} py={1} borderRadius="full" fontWeight="black" fontSize="xs" align="center" gap={1} flexShrink={0}>
          <CircleDollarSign size={14} /> ~0 GAME
        </Flex>
        {time !== undefined && (
          <Text fontWeight="black" color="#58cc02" w="30px" flexShrink={0}>{time}s</Text>
        )}
        <CustomProgress value={progress} color="#58cc02" h="12px" />
      </Flex>
    </Box>
  );
}

function GameResultView({ score, total, router }: any) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const pass = score >= Math.ceil(total * 0.5);
  const handleReturn = () => {
    router.push(`${pathname}?type=hub`);
  };

  return (
    <Center p={4} h="80vh">
      <Box bg="white" p={8} borderRadius="3xl" maxW="450px" w="full" textAlign="center" borderWidth="2px" borderColor="gray.100" boxShadow="0 8px 0 0 #e2e8f0">
        <Center color={pass ? "#58cc02" : "orange.500"} mb={4}><Text fontSize="6xl">{pass ? '🎉' : '🙂'}</Text></Center>
        <Text fontSize="2xl" fontWeight="black" color="gray.800" mb={6}>{pass ? "Hoàn Thành" : "Kết thúc"}</Text>
        <Box bg="gray.50" p={4} borderRadius="2xl" mb={6} borderWidth="1px" borderColor="gray.200">
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="gray.500">Điểm số:</Text>
            <Text fontSize="sm" fontWeight="black" color="#58cc02">{score} / {total}</Text>
          </Flex>
          <CustomProgress value={total === 0 ? 0 : (score / total) * 100} color="#58cc02" h="6px" />
        </Box>
        <Button w="full" bg="#58cc02" color="white" size="lg" borderRadius="2xl" fontWeight="black" onClick={handleReturn}>Trở về Hub</Button>
      </Box>
    </Center>
  );
}

// ==========================================
// 2. COMPONENT MẸ (ĐIỀU PHỐI ALL-IN-ONE)
// ==========================================
// ==========================================
// 2. COMPONENT MẸ (ĐIỀU PHỐI ALL-IN-ONE)
// ==========================================
export default function AllInOneGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const id = params?.id as string;
  const part = searchParams?.get("part") || "0";
  const mode = searchParams?.get("mode") || "srs"; 
  const type = searchParams?.get("type") || "hub"; 

  const [setName, setSetName] = useState("");
  const [words, setWords] = useState<any[]>([]);
  const [totalSetWords, setTotalSetWords] = useState(0);
  const [totalSetLearned, setTotalSetLearned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const COIN_REWARDS: Record<string, number> = {
    flashcard: 5,
    quiz: 10,
    typing: 10,
    matching: 10,
    listening: 15,
    combo: 20
  };

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        const res = await fetch(`/api/game/${id}?part=${part}&mode=${mode}`);
        if (res.ok) {
          const data = await res.json();
          setSetName(data.setName);
          setWords(data.words);
          setTotalSetWords(data.totalSetWords || 0);
          setTotalSetLearned(data.totalSetLearned || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, part, mode, type]);

  // FIX CHUẨN: Tách biệt tính toán tổng số khỏi hàm set mảng để chống lỗi React Strict Mode (Xóa bỏ lỗi -80%)
  const handleToggleLearned = async (wordId: string, targetStatus: boolean) => {
    // 1. Lấy trạng thái hiện tại của từ vựng đó ngay trên state
    const oldStatus = words.find(w => w.id === wordId)?.isLearned || false;
    
    // 2. Nếu trạng thái thay đổi, tiến hành cộng/trừ 1 lần duy nhất và chặn số âm
    if (oldStatus !== targetStatus) {
      setTotalSetLearned(curr => Math.max(0, targetStatus ? curr + 1 : curr - 1));
    }

    // 3. Cập nhật mảng từ vựng hiển thị
    setWords(prev => prev.map(w => w.id === wordId ? { ...w, isLearned: targetStatus } : w));

    // 4. Đẩy API lưu xuống CSDL
    try {
      await fetch('/api/user/srs', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordId, isLearned: targetStatus })
      });
    } catch (err) {
      console.error("Lỗi đồng bộ trạng thái đơn lẻ:", err);
    }
  };

  // FIX CHUẨN: Tính toán độ chênh lệch trước rồi mới cập nhật state
  const handleFinishGame = async (results: { id: string, isRemembered: boolean }[]) => {
    if (results.length > 0) {
      // 1. Tính xem sau trò chơi, user thuộc thêm/quên đi bao nhiêu từ
      let learnedDiff = 0;
      words.forEach(w => {
        const match = results.find(r => r.id === w.id);
        if (match && w.isLearned !== match.isRemembered) {
          learnedDiff += match.isRemembered ? 1 : -1;
        }
      });

      // 2. Cập nhật tổng số từ đã thuộc an toàn
      if (learnedDiff !== 0) {
        setTotalSetLearned(curr => Math.max(0, curr + learnedDiff));
      }

      // 3. Cập nhật trạng thái từng từ trong mảng
      setWords(prev => prev.map(w => {
        const match = results.find(r => r.id === w.id);
        return match ? { ...w, isLearned: match.isRemembered } : w;
      }));

      // 4. Lưu toàn bộ kết quả xuống Database
      try {
        await Promise.all(results.map(res => 
          fetch('/api/user/srs', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordId: res.id, isLearned: res.isRemembered })
          })
        ));
      } catch (e) {
        console.error("Lỗi đồng bộ kết quả game tập trung:", e);
      }
    }
    const earnedCoins = COIN_REWARDS[type] || 5; 
    try {
      await fetch('/api/user/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: earnedCoins })
      });
    } catch (e) {
      console.error("Lỗi cộng xu:", e);
    }

    toast({
      title: "Tuyệt vời! 🎉",
      description: `Bạn vừa nhận được +${earnedCoins} xu thưởng!`,
      duration: 4000,
      variant: "default",
    });
    window.dispatchEvent(new Event('updateProfile'));
    // Điều hướng về Hub
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  };

  if (isLoading) {
    return (
      <Flex w="full" h="100vh" align="center" justify="center" bg="#f8f9fa">
        <Spinner size="xl" color="#58cc02" borderWidth="4px" />
      </Flex>
    );
  }

  if (type === "hub") {
    return <HubView words={words} setName={setName} mode={mode} onToggleLearned={handleToggleLearned} part={part} totalSetWords={totalSetWords} totalSetLearned={totalSetLearned} />;
  }

  return (
    <Box minH="100vh" bg="#f8f9fa" pt={8} pb={10}>
      {type === 'flashcard' && <FlashcardGame words={words} onUpdateSrs={(id: string, learned: boolean) => handleToggleLearned(id, learned)} onFinish={() => handleFinishGame([])} />}
      {type === 'matching' && <MatchGame words={words} onFinish={handleFinishGame} />}
      {type === 'typing' && <TypingGame words={words} onFinish={handleFinishGame} />}
      {type === 'listening' && <ListenGame words={words} onFinish={handleFinishGame} />}
      {type === 'quiz' && <QuizGame words={words} onFinish={handleFinishGame} />}
      {type === 'combo' && <ComboGame words={words} onFinish={handleFinishGame} />}
    </Box>
  );
}

// ==========================================
// 3. GIAO DIỆN HUB (TÍNH TOÁN THEO CHỈ SỐ TỔNG TOÀN BỘ)
// ==========================================
function HubView({ words, setName, mode, onToggleLearned, part, totalSetWords, totalSetLearned }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredWords = words.filter((w: any) => {
    const matchSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase()) || w.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === "learned") return matchSearch && w.isLearned;
    if (filterStatus === "unlearned") return matchSearch && !w.isLearned;
    return matchSearch;
  });

  const handleStartMode = (modeId: string) => {
    router.push(`${pathname}?part=${part}&mode=${mode}&type=${modeId}`);
  };

  // FIX CHUẨN: Tính % tiến độ dựa trên tổng số từ thực tế của bộ từ (ví dụ: chia cho 104) thay vì chia cho mảng slice con
  const progressPercent = totalSetWords === 0 ? 0 : Math.round((totalSetLearned / totalSetWords) * 100);

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto" minH="100vh" bg="#f8f9fa">
      
      <Box bg="white" p={6} borderRadius="3xl" shadow="sm" mb={6} borderWidth="1px" borderColor="gray.200">
        <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={4}>
          <Flex align="center" gap={4}>
            <Flex as="button" onClick={() => router.back()} w={10} h={10} bg="#f4f4f5" borderRadius="xl" align="center" justify="center" _hover={{ bg: "gray.200" }} transition="all 0.2s">
              <ArrowLeft size={18} color="#4a5568"/>
            </Flex>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="black" color="#111827" textTransform="uppercase">{setName}</Text>
          </Flex>

          <HStack gap={3} flexWrap="wrap">
            <Button size="sm" variant="outline" bg="white" borderColor="gray.200" borderRadius="full" gap={2} fontWeight="bold" color="gray.700" _hover={{ bg: "gray.50" }}>
              <Pin size={16} /> Ghim
            </Button>
            <Button size="sm" variant="outline" bg="white" borderColor="gray.200" borderRadius="full" gap={2} fontWeight="bold" color="gray.700" _hover={{ bg: "gray.50" }}>
              <Trophy size={16} /> BXH
            </Button>
            <Button size="sm" bg="#10b981" color="white" borderRadius="full" gap={2} fontWeight="bold" _hover={{ bg: "#059669" }} px={5}>
              <BrainCircuit size={16} /> Học ngắt quãng
            </Button>
          </HStack>
        </Flex>

        <HStack mb={2} gap={3}>
          <Box bg="#f1f5f9" color="gray.600" px={3} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">
            {totalSetWords} từ vựng
          </Box>
          <Box bg="#dcfce7" color="#16a34a" px={3} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">
            {totalSetLearned}/{totalSetWords} đã học ({progressPercent}%)
          </Box>
        </HStack>
        
        <CustomProgressWithDot value={progressPercent} color="#22c55e" h="6px" bg="#f1f5f9" />
      </Box>

      {/* TÙY CHỈNH */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" mb={6} borderWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={6}>
          <HStack color="gray.600">
            <Settings size={20} />
            <Text fontSize="lg" fontWeight="bold">Tùy chỉnh</Text>
          </HStack>
          <Box bg="#22c55e" color="white" px={4} py={1.5} borderRadius="full" fontSize="sm" fontWeight="bold">
            {words.length}/{totalSetWords} từ
          </Box>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2} letterSpacing="wide">Trạng thái</Text>
            <Flex align="center" bg="white" borderRadius="xl" px={4} h={12} borderWidth="1px" borderColor="gray.300">
              <BookOpen size={16} color="#64748b" />
              <select style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontWeight: 'bold', color: '#334155', cursor: 'pointer', marginLeft: '8px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="unlearned">Chưa thuộc</option>
                <option value="learned">Đã thuộc</option>
              </select>
            </Flex>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2} letterSpacing="wide">Số lượng</Text>
            <Flex align="center" bg="white" borderRadius="xl" px={4} h={12} borderWidth="1px" borderColor="gray.300">
              <Hash size={16} color="#64748b" />
              <select style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontWeight: 'bold', color: '#334155', cursor: 'pointer', marginLeft: '8px' }}>
                <option value="all">Tất cả</option>
                <option value="20">20 từ</option>
                <option value="50">50 từ</option>
              </select>
            </Flex>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2} letterSpacing="wide">Thứ tự</Text>
            <Flex align="center" bg="white" borderRadius="xl" px={4} h={12} borderWidth="1px" borderColor="gray.300">
              <Shuffle size={16} color="#64748b" />
              <select style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontWeight: 'bold', color: '#334155', cursor: 'pointer', marginLeft: '8px' }}>
                <option value="random">Ngẫu nhiên</option>
                <option value="ordered">Theo thứ tự</option>
              </select>
            </Flex>
          </Box>
        </Grid>
      </Box>

      {/* CHỌN CHẾ ĐỘ HỌC */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" mb={8} borderWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">Chọn chế độ học</Text>
          <Box color="#0ea5e9" cursor="pointer"><Settings size={20} /></Box>
        </Flex>
        
        <Flex gap={4} overflowX="auto" py={6} px={4} mx={-4} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
          {learningModes.map((m) => (
            <Flex 
              key={m.id} direction="column" align="center" justify="center" p={5} borderRadius="2xl" 
              background={m.bg} color="white" position="relative" cursor="pointer" 
              boxShadow={m.shadow || "0 6px 15px rgba(0,0,0,0.1)"} transition="all 0.3s ease" flexShrink={0}
              minW="180px" w="180px" overflow="hidden"
              _hover={{ transform: "translateY(-6px)", boxShadow: m.shadow || "0 15px 30px rgba(0,0,0,0.2)" }} 
              onClick={() => handleStartMode(m.id)}
            >
              {m.isHot && <Box position="absolute" top={3} right={3} bg="#ff4b4b" color="white" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="black">HOT 🔥</Box>}
              <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" bg="whiteAlpha.200" borderRadius="full" zIndex={0} />
              <Box position="absolute" bottom="-30px" left="-30px" w="120px" h="120px" bg="whiteAlpha.200" borderRadius="full" zIndex={0} />

              <Flex position="relative" zIndex={1} w={14} h={14} borderRadius="full" bg="whiteAlpha.300" align="center" justify="center" mb={3} backdropFilter="blur(4px)">
                <m.icon size={24} color="white" />
              </Flex>
              <Text position="relative" zIndex={1} fontWeight="bold" fontSize="md" mb={1}>{m.name}</Text>
              <Text position="relative" zIndex={1} fontSize="10px" fontWeight="medium" opacity={0.9} textAlign="center" mb={4} h="30px" w="full">{m.desc}</Text>
              
              <Flex position="relative" zIndex={1} bg="rgba(0,0,0,0.15)" px={3} py={1} borderRadius="full" align="center" gap={1.5} backdropFilter="blur(4px)">
                <Text fontSize="xs" fontWeight="black">{m.coin}</Text>
                <CircleDollarSign size={14} color="#fbbf24" fill="#fbbf24" />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* DANH SÁCH TỪ VỰNG */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">Danh sách từ vựng</Text>
          <Text fontSize="sm" fontWeight="medium" color="gray.500">{filteredWords.length} từ</Text>
        </Flex>

        <Flex gap={4} mb={6} direction={{ base: "column", md: "row" }}>
          <Flex flex={1} align="center" bg="white" borderRadius="full" px={4} h={10} borderWidth="1px" borderColor="gray.300">
            <Search size={18} color="#94a3b8" />
            <Input placeholder="Tìm kiếm từ vựng..." bg="transparent" border="none" _focus={{ outline: "none", boxShadow: "none" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} ml={2} w="full" px={0} fontWeight="medium" fontSize="sm"/>
          </Flex>
          <Flex align="center" bg="white" borderRadius="full" px={4} h={10} minW="150px" borderWidth="1px" borderColor="gray.300">
             <select style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontWeight: 'medium', fontSize: '14px', color: '#334155', cursor: 'pointer' }} value={filterStatus} onChange={(e: any) => setFilterStatus(e.target.value)}>
               <option value="all">Tất cả</option>
               <option value="learned">Đã thuộc</option>
               <option value="unlearned">Chưa thuộc</option>
             </select>
          </Flex>
        </Flex>

        <Box borderTopWidth="1px" borderColor="gray.200" overflowX="auto">
          <Flex bg="gray.50" px={4} py={3} borderBottomWidth="1px" borderColor="gray.200" minW="900px">
             <Text flex={2} fontSize="xs" fontWeight="black" color="gray.500">TỪ VỰNG</Text>
             <Text flex={2} fontSize="xs" fontWeight="black" color="gray.500">NGHĨA</Text>
             <Text flex={1} fontSize="xs" fontWeight="black" color="gray.500">LOẠI TỪ</Text>
             <Text flex={3} fontSize="xs" fontWeight="black" color="gray.500">VÍ DỤ</Text>
             <Text flex={1} fontSize="xs" fontWeight="black" color="gray.500" textAlign="center">THUỘC</Text>
          </Flex>

          {filteredWords.map((w: any, idx: number) => (
             <Flex key={w.id || idx} px={4} py={4} borderBottomWidth="1px" borderColor="gray.100" align="center" _hover={{ bg: "gray.50" }} minW="900px">
                <Flex flex={2} align="center" gap={3}>
                  <Box color="#1cb0f6" cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: "blue.500" }}><Volume2 size={20} /></Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontWeight="black" color="gray.800">{w.word}</Text>
                    {w.phonetic && <Text fontSize="xs" color="gray.400" fontFamily="monospace">{w.phonetic}</Text>}
                  </VStack>
                </Flex>

                <Text flex={2} fontWeight="bold" color="gray.700">{w.meaning}</Text>
                <Flex flex={1}>{w.type && <Box bg="blue.50" color="blue.600" px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="lowercase">{w.type}</Box>}</Flex>

                <Flex flex={3} direction="column" pr={4}>
                  {w.exampleEn ? (
                    <>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700" lineHeight="tight">"{w.exampleEn}"</Text>
                      <Text fontSize="xs" color="gray.500" mt={1} lineHeight="tight">{w.exampleVi}</Text>
                    </>
                  ) : (
                    <Text fontSize="xs" color="gray.400" fontStyle="italic">-</Text>
                  )}
                </Flex>

                {/* NÚT THUỘC ĐÃ SỬA: Đưa trực tiếp trạng thái phủ định đích vào hàm */}
                <Flex flex={1} justify="center" align="center">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onToggleLearned(w.id, !w.isLearned); }} style={{ width: '40px', height: '22px', backgroundColor: w.isLearned ? '#22c55e' : '#cbd5e1', borderRadius: '9999px', position: 'relative', cursor: 'pointer', border: 'none', outline: 'none', transition: 'all 0.2s ease', display: 'block' }}>
                    <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: w.isLearned ? '20px' : '2px', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', pointerEvents: 'none' }} />
                  </button>
                </Flex>
             </Flex>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ==========================================
// THÀNH PHẦN FLASHCARD CHUẨN ĐỒNG BỘ TIẾN ĐỘ
// ==========================================
export const FlashcardGame = ({ words, onUpdateSrs, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isFlipped && currentWord) playAudio(currentWord.word);
        setIsFlipped(prev => !prev);
      } else if (e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === 'arrowleft') { e.preventDefault(); handlePrev(); }
        else if (key === 'arrowright') { e.preventDefault(); handleNext(); }
        else if (key === 's') { e.preventDefault(); if (currentWord) playAudio(currentWord.word); }
        else if (key === '1' || key === 'x') { e.preventDefault(); handleForgot(); }
        else if (key === '2' || key === 'c') { e.preventDefault(); handleRemembered(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, currentWord]);

  if (!currentWord) return null;

  const handleCardClick = () => { if (!isFlipped) playAudio(currentWord.word); setIsFlipped(!isFlipped); };
  
  const handleNext = () => {
    setIsFlipped(false); setInputValue('');
    setTimeout(() => { if (currentIndex < words.length - 1) setCurrentIndex(prev => prev + 1); else onFinish(); }, 200);
  };
  
  const handlePrev = () => { if (currentIndex > 0) { setIsFlipped(false); setTimeout(() => setCurrentIndex(prev => prev - 1), 200); } };
  
  const handleForgot = () => { onUpdateSrs(currentWord.id, false); handleNext(); };
  const handleRemembered = () => { onUpdateSrs(currentWord.id, true); handleNext(); };

  const handleCheckInput = () => {
    if (!inputValue.trim()) return;
    const isMatch = inputValue.trim().toLowerCase() === currentWord.meaning.toLowerCase() || 
                    inputValue.trim().toLowerCase() === currentWord.word.toLowerCase();
    if (isMatch) { playTingSound(); handleRemembered(); } else { handleForgot(); }
  };

  const handleExit = () => {
    const part = searchParams?.get("part") || "0"; const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  }

  const progress = ((currentIndex) / words.length) * 100;

  return (
    <Box w="full" px={4}>
      <GameHeader title={`Flashcard \u00A0 ${currentIndex + 1} / ${words.length}`} progress={progress} onExit={handleExit} onReplay={() => setCurrentIndex(0)} showEnVn={true} />
      <Center flexDirection="column">
        <Box perspective="1000px" w="full" maxW="700px" h="50vh" minH="380px" mb={8}>
          <Box w="full" h="full" position="relative" transition="transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)" style={{ transformStyle: 'preserve-3d' }} transform={isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} cursor="pointer" onClick={handleCardClick}>
            <Flex position="absolute" w="full" h="full" style={{ backfaceVisibility: 'hidden' }} bg="linear-gradient(135deg, #6b46c1, #8b5cf6)" borderRadius="3xl" direction="column" align="center" justify="center" p={8} color="white" boxShadow="0 10px 25px rgba(107, 70, 193, 0.3)">
              <Text fontSize="sm" fontWeight="bold" opacity={0.8} mb="auto" textTransform="uppercase" letterSpacing="widest">Từ Tiếng Anh</Text>
              <Text fontSize={{ base: "5xl", md: "7xl" }} fontWeight="black" letterSpacing="tight" textAlign="center">{currentWord.word}</Text>
              {currentWord.type && <Box bg="whiteAlpha.300" color="white" px={4} py={1} borderRadius="full" mt={4} fontSize="sm" fontWeight="bold">{currentWord.type}</Box>}
              <Text fontSize="xl" fontWeight="medium" fontStyle="italic" mt={4}>{currentWord.phonetic}</Text>
              <Text mt="auto" fontSize="sm" fontWeight="bold" opacity={0.8}>👆 Nhấn Space hoặc click để lật</Text>
            </Flex>
            <Flex position="absolute" w="full" h="full" style={{ backfaceVisibility: 'hidden' }} transform="rotateY(180deg)" bg="#58cc02" color="white" borderRadius="3xl" direction="column" align="center" justify="center" p={8} boxShadow="0 10px 25px rgba(88, 204, 2, 0.3)">
              <Text fontSize="sm" fontWeight="bold" opacity={0.8} mb="auto" textTransform="uppercase" letterSpacing="widest">Nghĩa tiếng Việt</Text>
              <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black" letterSpacing="tight" textAlign="center">{currentWord.meaning}</Text>
              <Text mt="auto" fontSize="sm" fontWeight="bold" opacity={0.8}>👆 Nhấn Space hoặc click để quay lại</Text>
            </Flex>
          </Box>
        </Box>

        <Flex gap={4} w="full" maxW="600px" mb={10}>
          <Input flex={1} placeholder="Gõ từ tiếng Anh hoặc nghĩa tiếng Việt..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckInput()} borderRadius="full" bg="white" border="2px solid" borderColor="blue.300" h="14" px={6} fontSize="md" fontWeight="bold" _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3b82f6" }} />
          <Button onClick={handleCheckInput} bg="#58cc02" color="white" borderRadius="full" h="14" px={8} fontWeight="black" fontSize="lg" _hover={{ bg: "#46a302" }}>Check</Button>
        </Flex>

        <Flex justify="center" gap={{ base: 4, md: 8 }} align="center" flexWrap="wrap">
          <VStack gap={1} cursor="pointer" onClick={handlePrev} opacity={currentIndex === 0 ? 0.5 : 1} _hover={currentIndex > 0 ? { opacity: 0.8 } : {}}>
            <HStack color="blue.400" fontWeight="bold"><ChevronLeft size={20} /> <Text>Trước</Text></HStack>
            <Text fontSize="xs" color="gray.400">Ctrl + ←</Text>
          </VStack>
          <VStack gap={1}>
            <Flex as="button" onClick={() => playAudio(currentWord.word)} w={14} h={14} borderRadius="full" bg="#58cc02" color="white" align="center" justify="center" _hover={{ transform: 'scale(1.05)' }} transition="0.2s"><Volume2 size={24} /></Flex>
            <Text fontSize="xs" color="gray.400">Ctrl + S</Text>
          </VStack>
          <VStack gap={1}>
            <Button onClick={handleForgot} w="130px" h={12} borderRadius="full" bg="#f43f5e" color="white" fontWeight="black" gap={2} _hover={{ bg: '#e11d48' }}><X size={18} strokeWidth={3} /> Quên</Button>
            <Text fontSize="xs" color="gray.400">Ctrl + 1 / X</Text>
          </VStack>
          <VStack gap={1}>
            <Button onClick={handleRemembered} w="130px" h={12} borderRadius="full" bg="#58cc02" color="white" fontWeight="black" gap={2} _hover={{ bg: '#46a302' }}><Check size={18} strokeWidth={3} /> Thuộc</Button>
            <Text fontSize="xs" color="gray.400">Ctrl + 2 / C</Text>
          </VStack>
          <VStack gap={1} cursor="pointer" onClick={handleNext} _hover={{ opacity: 0.8 }}>
            <HStack color="blue.400" fontWeight="bold"><Text>Tiếp</Text> <ChevronRight size={20} /></HStack>
            <Text fontSize="xs" color="gray.400">Ctrl + →</Text>
          </VStack>
        </Flex>
      </Center>
    </Box>
  );
};

// ... Các mini-game khác (ListenGame, MatchGame, QuizGame, TypingGame, ComboGame) được tích hợp chạy ngầm và trả kết quả mảng về hàm `handleFinishGame` ...

export const ListenGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [results, setResults] = useState<any[]>([]);
  const [showExample, setShowExample] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => { 
    if (currentWord && !isGameFinished && !correctWordDetails) {
      setTimeout(() => playAudio(currentWord.word), 500); 
      setShowExample(false); setHintsUsed(0);
    }
  }, [currentIndex, currentWord, isGameFinished, correctWordDetails]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'e') { e.preventDefault(); setShowExample(prev => !prev); }
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); setHintsUsed(prev => prev < 3 ? prev + 1 : prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (correctWordDetails) { setBannerCountDown(p => { if (p <= 1) { closeBanner(); return 3; } return p - 1; }); } 
      else { setTimeLeft(p => { if (p <= 1) { handleLifeLost(); return 30; } return p - 1; }); }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, currentWord]);

  const handleLifeLost = () => {
    setStatus('error'); setGameOver(true); setResults(p => [...p, { id: currentWord.id, isRemembered: false }]);
  };

  const closeBanner = () => { setCorrectWordDetails(null); setInputValue(''); setStatus('idle'); setTimeLeft(30); setCurrentIndex(c => c + 1); };

  const handleCheck = () => {
    if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('success'); playTingSound(); setResults(p => [...p, { id: currentWord.id, isRemembered: true }]); setCorrectWordDetails(currentWord); setBannerCountDown(3);
    } else {
      setStatus('error'); setTimeout(() => setStatus('idle'), 600);
    }
  };

  const handleExit = () => {
    const part = searchParams?.get("part") || "0"; const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  }

  const getHintText = () => {
    if (hintsUsed === 0) return "Chưa có gợi ý";
    let hint = `Nghĩa: ${currentWord.meaning}`;
    if (hintsUsed >= 2) hint += ` | Ký tự đầu: ${currentWord.word.charAt(0)}`;
    if (hintsUsed >= 3) hint += ` | Nửa từ: ${currentWord.word.substring(0, Math.ceil(currentWord.word.length / 2))}...`;
    return hint;
  };

  if (!currentWord && !isGameFinished) return null;
  if (isGameFinished) return <GameResultView score={results.filter(r=>r.isRemembered).length} total={words.length} router={router} />;

  const progress = (currentIndex / words.length) * 100;

  return (
    <Box w="full" px={4}>
      <GameHeader title={`Câu ${currentIndex + 1} / ${words.length}`} progress={progress} time={timeLeft} onExit={handleExit} onReplay={() => setCurrentIndex(0)} />

      <Center flexDirection="column" bg="white" borderRadius="3xl" p={{ base: 6, md: 10 }} shadow="sm" borderWidth="1px" borderColor="gray.200" maxW="850px" mx="auto" position="relative" minH="450px">
        <Text position="absolute" top={6} right={8} fontSize="xs" fontWeight="bold" color="gray.400">Nghe: 1x | Ctrl+H</Text>

        <Box position="relative" mb={6}>
          <Flex as="button" w="100px" h="100px" bg="#58cc02" borderRadius="full" align="center" justify="center" shadow="md" _hover={{ transform: 'scale(1.05)' }} transition="0.2s" onClick={() => playAudio(currentWord.word)}>
            <Headphones size={40} color="white" />
          </Flex>
          <Box position="absolute" bottom="-10px" left="50%" transform="translateX(-50%)" bg="#1cb0f6" color="white" px={3} py={0.5} borderRadius="full" fontSize="10px" fontWeight="black" whiteSpace="nowrap">CTRL + X</Box>
        </Box>

        <Text fontSize="xl" fontWeight="black" color="gray.700" mb={3}>Nghe và gõ từ tiếng Anh</Text>
        <Box bg="purple.50" color="purple.600" px={3} py={1} borderRadius="full" fontWeight="bold" fontSize="xs" mb={2}>{currentWord.type || "N"}</Box>
        
        <Text fontSize="sm" color={hintsUsed > 0 ? "blue.500" : "gray.400"} fontWeight={hintsUsed > 0 ? "bold" : "medium"} fontStyle={hintsUsed > 0 ? "normal" : "italic"} mb={4} minH="20px" transition="all 0.3s">
          {getHintText()}
        </Text>

        {showExample && currentWord.exampleEn && (
          <Box bg="blue.50" px={6} py={3} borderRadius="xl" mb={4} textAlign="center" maxW="500px">
            <Text fontSize="sm" fontWeight="bold" color="blue.700">"{currentWord.exampleEn}"</Text>
            {currentWord.exampleVi && <Text fontSize="xs" color="blue.500" mt={1}>{currentWord.exampleVi}</Text>}
          </Box>
        )}
        
        <Input placeholder="Gõ từ bạn nghe được..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} borderRadius="full" bg="white" border="2px solid" borderColor={status === 'error' ? 'red.400' : status === 'success' ? 'green.400' : 'gray.200'} animation={status === 'error' ? `${shakeAnimation} 0.4s` : status === 'success' ? `${successPulse} 0.5s` : 'none'} h="14" w="full" maxW="500px" textAlign="center" fontSize="lg" fontWeight="bold" mb={10} color={status === 'error' ? 'red.600' : status === 'success' ? 'green.600' : 'gray.800'} disabled={!!correctWordDetails} _focus={{ borderColor: "blue.400", boxShadow: "none" }} />

        <Flex gap={4} justify="center" flexWrap="wrap">
           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color={showExample ? "blue.500" : "gray.700"} bg={showExample ? "blue.50" : "transparent"} fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }} onClick={() => setShowExample(!showExample)}> 
               <Pencil size={18}/> {showExample ? "Đóng ví dụ" : "Xem ví dụ"} 
             </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + E</Text>
           </VStack>

           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color={hintsUsed > 0 ? "blue.500" : "gray.700"} fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }} onClick={() => setHintsUsed(p => p < 3 ? p + 1 : p)} disabled={hintsUsed >= 3}> 
               <Target size={18}/> Gợi ý ({3 - hintsUsed}) 
             </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + Space</Text>
           </VStack>

           <VStack gap={1}>
             <Button bg="#58cc02" color="white" borderRadius="full" h={12} px={8} fontWeight="black" borderBottomWidth="4px" borderColor="#46a302" _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCheck} disabled={!!correctWordDetails}> 
               Kiểm tra 
             </Button>
             <Text fontSize="xs" color="gray.400">Enter</Text>
           </VStack>
        </Flex>
      </Center>

      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s`}>
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)}><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1} display={{ base: 'none', sm: 'flex' }}><Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text></Text></VStack>
          </HStack>
          <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner}>Tiếp tục ({bannerCountDown}s)</Button>
        </Flex>
      )}
    </Box>
  );
};

export const TypingGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [results, setResults] = useState<any[]>([]);
  const [showExample, setShowExample] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => { 
    if (currentWord && !isGameFinished && !correctWordDetails) {
      setTimeout(() => playAudio(currentWord.word), 500); setShowExample(false); setHintsUsed(0);
    }
  }, [currentIndex, currentWord, isGameFinished, correctWordDetails]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'e') { e.preventDefault(); setShowExample(prev => !prev); }
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); setHintsUsed(prev => prev < 3 ? prev + 1 : prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (correctWordDetails) {
        setBannerCountDown(p => { if (p <= 1) { closeBanner(); return 3; } return p - 1; });
      } else {
        setTimeLeft(p => { if (p <= 1) { handleLifeLost(); return 30; } return p - 1; });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, currentWord]);

  const handleLifeLost = () => {
    setStatus('error'); setGameOver(true); setResults(p => [...p, { id: currentWord.id, isRemembered: false }]);
  };

  const closeBanner = () => { setCorrectWordDetails(null); setInputValue(''); setStatus('idle'); setTimeLeft(30); setCurrentIndex(c => c + 1); };

  const handleCheck = () => {
    if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('success'); playTingSound(); setResults(p => [...p, { id: currentWord.id, isRemembered: true }]);
      setCorrectWordDetails(currentWord); setBannerCountDown(3);
    } else {
      setStatus('error'); setTimeout(() => setStatus('idle'), 600);
    }
  };

  const handleExit = () => {
    const part = searchParams?.get("part") || "0"; const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  }

  const getHintText = () => {
    if (hintsUsed === 0) return "Chưa có gợi ý";
    let hint = `Độ dài: ${currentWord.word.length} ký tự`;
    if (hintsUsed >= 2) hint += ` | Ký tự đầu: ${currentWord.word.charAt(0)}`;
    if (hintsUsed >= 3) hint += ` | Nửa từ: ${currentWord.word.substring(0, Math.ceil(currentWord.word.length / 2))}...`;
    return hint;
  };

  if (!currentWord && !isGameFinished) return null;
  if (isGameFinished) return <GameResultView score={results.filter(r=>r.isRemembered).length} total={words.length} router={router} />;

  const progress = (currentIndex / words.length) * 100;

  return (
    <Box w="full" px={4}>
      <GameHeader title={`Câu ${currentIndex + 1} / ${words.length}`} progress={progress} time={timeLeft} onExit={handleExit} onReplay={() => setCurrentIndex(0)} showEnVn={true} />

      <Center flexDirection="column" bg="white" borderRadius="3xl" p={{ base: 6, md: 10 }} shadow="sm" borderWidth="1px" borderColor="gray.200" maxW="850px" mx="auto" position="relative" minH="450px">
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="black" textAlign="center" mb={4}>{currentWord.meaning}</Text>
        
        <HStack gap={3} mb={4}>
          <Box as="button" color="#1cb0f6" _hover={{ color: 'blue.500' }} onClick={() => playAudio(currentWord.word)}><Volume2 size={24} /></Box>
          <Box bg="purple.50" color="purple.600" px={3} py={1} borderRadius="full" fontWeight="bold" fontSize="xs">{currentWord.type || "N"}</Box>
        </HStack>

        <Text fontSize="sm" color={hintsUsed > 0 ? "blue.500" : "gray.400"} fontWeight={hintsUsed > 0 ? "bold" : "medium"} fontStyle={hintsUsed > 0 ? "normal" : "italic"} mb={4} minH="20px" transition="all 0.3s">
          {getHintText()}
        </Text>

        {showExample && currentWord.exampleEn && (
          <Box bg="blue.50" px={6} py={3} borderRadius="xl" mb={4} textAlign="center" maxW="500px">
            <Text fontSize="sm" fontWeight="bold" color="blue.700">"{currentWord.exampleEn}"</Text>
            {currentWord.exampleVi && <Text fontSize="xs" color="blue.500" mt={1}>{currentWord.exampleVi}</Text>}
          </Box>
        )}
        
        <Input placeholder="Gõ từ tiếng Anh..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} borderRadius="full" bg="white" border="2px solid" borderColor={status === 'error' ? 'red.400' : status === 'success' ? 'green.400' : '#1cb0f6'} animation={status === 'error' ? `${shakeAnimation} 0.4s` : status === 'success' ? `${successPulse} 0.5s` : 'none'} h="14" w="full" maxW="500px" textAlign="center" fontSize="lg" fontWeight="bold" mb={10} color={status === 'error' ? 'red.600' : status === 'success' ? 'green.600' : 'gray.800'} disabled={!!correctWordDetails} _focus={{ borderColor: "#1cb0f6", boxShadow: "0 0 0 1px #1cb0f6" }} />

        <Flex gap={4} justify="center" flexWrap="wrap">
           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color={showExample ? "blue.500" : "gray.700"} bg={showExample ? "blue.50" : "transparent"} fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }} onClick={() => setShowExample(!showExample)}> 
               <Pencil size={18}/> {showExample ? "Đóng ví dụ" : "Xem ví dụ"} 
             </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + E</Text>
           </VStack>

           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color={hintsUsed > 0 ? "blue.500" : "gray.700"} fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }} onClick={() => setHintsUsed(p => p < 3 ? p + 1 : p)} disabled={hintsUsed >= 3}> 
               <Target size={18}/> Gợi ý ({3 - hintsUsed}) 
             </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + Space</Text>
           </VStack>

           <VStack gap={1}>
             <Button bg="#58cc02" color="white" borderRadius="full" h={12} px={8} fontWeight="black" borderBottomWidth="4px" borderColor="#46a302" _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCheck} disabled={!!correctWordDetails}> 
               Kiểm tra 
             </Button>
             <Text fontSize="xs" color="gray.400">Enter</Text>
           </VStack>
        </Flex>
      </Center>

      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s`}>
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)}><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1} display={{ base: 'none', sm: 'flex' }}><Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text></Text></VStack>
          </HStack>
          <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner}>Tiếp tục ({bannerCountDown}s)</Button>
        </Flex>
      )}
    </Box>
  );
};

export const MatchGame = ({ words, onFinish }: any) => {
  const [matchWords] = useState(() => [...words].sort(() => Math.random() - 0.5).slice(0, 4)); 
  const [shuffledMeanings] = useState(() => [...matchWords].sort(() => Math.random() - 0.5));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  
  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isGameFinished = gameOver || (matchedPairs.length === matchWords.length && matchWords.length > 0);

  useEffect(() => {
    if (isGameFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { setGameOver(true); return 30; } return p - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished]);

  const checkMatch = (w: string | null, m: string | null) => {
    if (w && m) {
      const correctObj = matchWords.find(x => x.word === w);
      if (correctObj?.meaning === m) {
        setMatchedPairs(prev => [...prev, w]); playTingSound();
      } else {
        setHearts(h => { const nh = h - 1; if (nh <= 0) setGameOver(true); return nh; });
      }
      setSelectedWord(null); setSelectedMeaning(null);
    }
  };

  const handleExit = () => {
    const part = searchParams?.get("part") || "0"; const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  }

  if (isGameFinished) return <GameResultView score={matchedPairs.length} total={matchWords.length} router={router} />;

  const progress = (matchedPairs.length / matchWords.length) * 100;

  return (
    <Box w="full" px={4}>
      <GameHeader title={`Đã ghép ${matchedPairs.length} / ${matchWords.length}`} progress={progress} time={timeLeft} onExit={handleExit} onReplay={() => window.location.reload()} />

      <Box bg="white" borderRadius="3xl" p={{ base: 6, md: 8 }} shadow="sm" borderWidth="1px" borderColor="gray.200" maxW="950px" mx="auto" minH="500px" display="flex" flexDirection="column">
        
        <Flex justify="space-between" mb={8} shrink={0}>
          <HStack gap={1}>{[1, 2, 3, 4, 5].map(i => <Heart key={i} size={28} fill={i <= hearts ? "#ff4d4d" : "transparent"} color={i <= hearts ? "#ff4d4d" : "#e2e8f0"} />)}</HStack>
          <Flex bg="#dcfce7" color="#16a34a" px={4} py={1.5} borderRadius="full" fontWeight="black" align="center" gap={2}>
            <Clock size={18} /> {timeLeft}S
          </Flex>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap={{ base: 4, md: 8 }} flex={1}>
          <VStack align="stretch" gap={4}>
            <Text textAlign="center" fontWeight="black" color="gray.800" mb={2}>Tiếng Anh</Text>
            {matchWords.map((w, i) => (
               <Button key={i} variant="outline" h="14" borderRadius="full" fontWeight="bold" fontSize="sm" bg={matchedPairs.includes(w.word) ? "gray.100" : selectedWord === w.word ? "blue.50" : "white"} color={matchedPairs.includes(w.word) ? "gray.300" : "gray.700"} borderColor={selectedWord === w.word ? "blue.400" : "gray.200"} borderBottomWidth="4px" _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} opacity={matchedPairs.includes(w.word) ? 0.5 : 1} onClick={() => { setSelectedWord(w.word); checkMatch(w.word, selectedMeaning); }} _hover={{ bg: "gray.50" }}>{w.word}</Button>
            ))}
          </VStack>

          <VStack align="stretch" gap={4}>
            <Text textAlign="center" fontWeight="black" color="gray.800" mb={2}>Tiếng Việt</Text>
            {shuffledMeanings.map((w, i) => (
               <Button key={i} variant="outline" h="auto" minH="14" py={3} borderRadius="full" fontWeight="bold" fontSize="sm" bg={matchedPairs.includes(matchWords.find(x=>x.meaning===w.meaning)?.word||'') ? "gray.100" : selectedMeaning === w.meaning ? "blue.50" : "white"} color={matchedPairs.includes(matchWords.find(x=>x.meaning===w.meaning)?.word||'') ? "gray.300" : "gray.700"} borderColor={selectedMeaning === w.meaning ? "blue.400" : "gray.200"} borderBottomWidth="4px" _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} opacity={matchedPairs.includes(matchWords.find(x=>x.meaning===w.meaning)?.word||'') ? 0.5 : 1} whiteSpace="normal" onClick={() => { setSelectedMeaning(w.meaning); checkMatch(selectedWord, w.meaning); }} _hover={{ bg: "gray.50" }}>{w.meaning}</Button>
            ))}
          </VStack>
        </Grid>
        
        <Text textAlign="center" fontWeight="black" color="gray.800" mt={8}>Đã ghép: {matchedPairs.length} / {matchWords.length}</Text>
      </Box>
    </Box>
  );
};

export const QuizGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [results, setResults] = useState<any[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => {
    if (currentWord && !isGameFinished && !correctWordDetails) {
      setTimeout(() => playAudio(currentWord.word), 500); 
      const correctMeaning = currentWord.meaning;
      const otherMeanings = words.filter((w:any) => w.id !== currentWord.id).map((w:any) => w.meaning).sort(() => Math.random() - 0.5);
      let distractors = otherMeanings.slice(0, 3);
      let fallbackIndex = 1;
      while (distractors.length < 3) distractors.push(`Đáp án gây nhiễu ${fallbackIndex++}`);
      setOptions([correctMeaning, ...distractors].sort(() => Math.random() - 0.5));
      setSelectedOption(null);
    }
  }, [currentIndex, currentWord, isGameFinished, correctWordDetails, words]);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (correctWordDetails) { setBannerCountDown(p => { if (p <= 1) { closeBanner(); return 3; } return p - 1; }); } 
      else { setTimeLeft(p => { if (p <= 1) { handleLifeLost(); return 20; } return p - 1; }); }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, currentWord]);

  const handleLifeLost = () => {
    setHearts(h => { const nh = h - 1; if (nh <= 0) { setGameOver(true); setResults(p => [...p, { id: currentWord.id, isRemembered: false }]); } return nh; });
  };

  const closeBanner = () => { setCorrectWordDetails(null); setSelectedOption(null); setTimeLeft(20); setCurrentIndex(c => c + 1); };

  const handleSelectOption = (opt: string) => {
    if (correctWordDetails || selectedOption) return; 
    setSelectedOption(opt);
    if (opt === currentWord.meaning) {
      playTingSound(); setResults(p => [...p, { id: currentWord.id, isRemembered: true }]); setCorrectWordDetails(currentWord); setBannerCountDown(3);
    } else {
      handleLifeLost(); setTimeout(() => { if (!gameOver) { setTimeLeft(20); setCurrentIndex(c => c + 1); setResults(p => [...p, { id: currentWord.id, isRemembered: false }]); } }, 1000); 
    }
  };

  const handleExit = () => {
    const part = searchParams?.get("part") || "0"; const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  }

  if (!currentWord && !isGameFinished) return null;
  if (isGameFinished) return <GameResultView score={results.filter(r=>r.isRemembered).length} total={words.length} router={router} />;

  const progress = (currentIndex / words.length) * 100;

  return (
    <Box w="full" px={4}>
      <GameHeader title={`Câu ${currentIndex + 1} / ${words.length}`} progress={progress} time={timeLeft} onExit={handleExit} onReplay={() => setCurrentIndex(0)} />

      <Center bg="white" borderRadius="3xl" p={{ base: 6, md: 10 }} pt={8} shadow="sm" borderWidth="1px" borderColor="gray.200" flexDirection="column" position="relative" minH="550px" maxW="850px" mx="auto">
        <Flex w="full" justify="space-between" mb={8} shrink={0}>
          <HStack gap={1}>{[1, 2, 3, 4, 5].map(i => <Heart key={i} size={28} fill={i <= hearts ? "#ff4d4d" : "transparent"} color={i <= hearts ? "#ff4d4d" : "#e2e8f0"} />)}</HStack>
        </Flex>

        <VStack mb={12} gap={2}>
          <Text fontSize="sm" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="widest">Chọn nghĩa đúng nhất</Text>
          <Text fontSize={{ base: "5xl", md: "6xl" }} fontWeight="black" color="gray.800" textAlign="center" lineHeight="tight">{currentWord.word}</Text>
          <HStack gap={3} mt={2}>
            <Flex as="button" bg="blue.50" color="blue.500" w={10} h={10} borderRadius="full" align="center" justify="center" _hover={{ bg: 'blue.100', transform: 'scale(1.05)' }} transition="0.2s" onClick={() => playAudio(currentWord.word)}><Volume2 size={20} /></Flex>
            <Box bg="purple.100" color="purple.700" px={3} py={1.5} borderRadius="xl" fontSize="xs" fontWeight="bold">{currentWord.type}</Box>
          </HStack>
        </VStack>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full" maxW="750px">
          {options.map((opt, i) => {
            const isSelected = selectedOption === opt; const isCorrect = opt === currentWord.meaning; const hasAnswered = selectedOption !== null;
            let bg = "white", borderColor = "gray.200", bottomBorderWidth = "4px", textColor = "gray.700", numBg = "gray.100", numColor = "gray.500", animation = "none", opacity = 1;

            if (hasAnswered) {
              if (isSelected && isCorrect) { bg = "green.100"; borderColor = "green.500"; textColor = "green.700"; numBg = "white"; numColor = "green.600"; bottomBorderWidth = "2px"; }
              else if (isSelected && !isCorrect) { bg = "red.50"; borderColor = "red.500"; textColor = "red.600"; numBg = "white"; numColor = "red.500"; bottomBorderWidth = "2px"; animation = `${shakeAnimation} 0.4s`; }
              else if (!isSelected && isCorrect) { bg = "green.50"; borderColor = "green.300"; textColor = "green.600"; numBg = "white"; numColor = "green.500"; }
              else { opacity = 0.4; }
            }

            return (
              <Flex key={i} as="button" align="center" px={5} py={4} minH="70px" borderRadius="2xl" bg={bg} borderColor={borderColor} borderWidth="2px" borderBottomWidth={bottomBorderWidth} color={textColor} animation={animation} opacity={opacity} pointerEvents={hasAnswered ? "none" : "auto"} _active={!hasAnswered ? { transform: 'translateY(2px)', borderBottomWidth: '2px' } : {}} onClick={() => handleSelectOption(opt)} transition="all 0.2s" gap={4}>
                <Flex w={8} h={8} borderRadius="full" bg={numBg} color={numColor} align="center" justify="center" fontWeight="black" fontSize="sm" flexShrink={0}>{i + 1}</Flex>
                <Text fontWeight="bold" fontSize="lg" textAlign="left" lineHeight="tight">{opt}</Text>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Center>

      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s`}>
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)}><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1} display={{ base: 'none', sm: 'flex' }}><Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text></Text></VStack>
          </HStack>
          <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner}>Tiếp tục ({bannerCountDown}s)</Button>
        </Flex>
      )}
    </Box>
  );
};

export const ComboGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameSequence, setGameSequence] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const modes = ['quiz', 'typing', 'listening'];
    setGameSequence(words.map(() => modes[Math.floor(Math.random() * modes.length)]));
  }, [words]);

  if (currentIndex >= words.length) return <GameResultView score={results.filter(r=>r.isRemembered).length} total={words.length} router={router} />;
  
  const currentWord = words[currentIndex];
  const currentRoundType = gameSequence[currentIndex];

  const onRoundComplete = (isCorrect: boolean) => {
    setResults(prev => [...prev, { id: currentWord.id, isRemembered: isCorrect }]);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <Box w="full" maxW="850px" mx="auto">
      <Center mb={6}>
        <HStack gap={1} bg="red.50" color="red.500" px={4} py={2} borderRadius="full" fontSize="sm" fontWeight="black">
          <Sparkles size={16} fill="currentColor" />
          <Text>CHẾ ĐỘ TỔNG HỢP ({currentIndex + 1}/{words.length})</Text>
        </HStack>
      </Center>
      
      {currentRoundType === 'quiz' && <QuizGame words={[currentWord]} onFinish={(res: any) => onRoundComplete(res[0]?.isRemembered)} />}
      {currentRoundType === 'typing' && <TypingGame words={[currentWord]} onFinish={(res: any) => onRoundComplete(res[0]?.isRemembered)} />}
      {currentRoundType === 'listening' && <ListenGame words={[currentWord]} onFinish={(res: any) => onRoundComplete(res[0]?.isRemembered)} />}
    </Box>
  );
};