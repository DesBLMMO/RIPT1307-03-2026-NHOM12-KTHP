"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  Box, Flex, Text, HStack, Button, Input, 
  VStack, Center, Grid, SimpleGrid, Spinner
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { 
  ChevronLeft, ChevronRight, X, Check, Volume2, 
  Heart, Clock, Pause, Play, Headphones, Sparkles,
  ArrowLeft, Search, Settings, BookOpen, Hash, Shuffle, 
  Layers, CheckSquare, Type, Grid3X3, Zap, CircleDollarSign,
  RefreshCw, Pencil, Target,
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
const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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

// UI COMPONENT: Thanh Progress Bar chuẩn
const CustomProgress = ({ value, color = "#58cc02", h = "12px" }: { value: number, color?: string, h?: string }) => (
  <Box w="full" h={h} bg="gray.200" borderRadius="full" overflow="hidden">
    <Box h="full" bg={color} w={`${Math.min(100, Math.max(0, value))}%`} transition="width 0.3s ease" borderRadius="full" />
  </Box>
);

const CustomSwitch = () => {
  const [isOn, setIsOn] = useState(true);
  return (
    <Flex w="36px" h="20px" bg={isOn ? "gray.300" : "gray.200"} borderRadius="full" align="center" px="2px" cursor="pointer" onClick={() => setIsOn(!isOn)} transition="background-color 0.2s">
      <Box w="16px" h="16px" bg="white" borderRadius="full" shadow="sm" transform={isOn ? "translateX(16px)" : "translateX(0)"} transition="transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" />
    </Flex>
  );
};

// UI COMPONENT: Game Header chuẩn (Thiết kế dựa theo Screenshot)
const GameHeader = ({ title, progress, time, onExit, onReplay, showEnVn }: any) => (
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

const learningModes = [
  { id: 'flashcard', name: 'Flashcard', desc: 'Lật thẻ để học từ vựng', coin: 5, icon: Layers, bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { id: 'quiz', name: 'Quiz', desc: 'Trắc nghiệm chọn đáp án', coin: 10, icon: CheckSquare, bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { id: 'listening', name: 'Listening', desc: 'Nghe từ và gõ lại', coin: 15, icon: Headphones, bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  { id: 'typing', name: 'Typing', desc: 'Xem nghĩa, gõ từ tiếng Anh', coin: 10, icon: Type, bg: 'linear-gradient(135deg, #84cc16, #65a30d)' },
  { id: 'matching', name: 'Ghép cặp', desc: 'Nối từ với nghĩa', coin: 10, icon: Grid3X3, bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'combo', name: 'Tổng hợp', desc: 'Kết hợp nhiều chế độ', coin: 20, icon: Zap, bg: 'linear-gradient(135deg, #ec4899, #e11d48)', isHot: true },
];

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        const res = await fetch(`/api/game/${id}?part=${part}&mode=${mode}`);
        if (res.ok) {
          const data = await res.json();
          setSetName(data.setName);
          setWords(data.words);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, part, mode]);

  const handleToggleLearned = async (wordId: string, currentStatus: boolean) => {
    setWords(prev => prev.map(w => w.id === wordId ? { ...w, isLearned: !currentStatus } : w));
    if (mode === 'practice') return;
    try {
      const res = await fetch('/api/user/srs', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordId, isLearned: !currentStatus })
      });
      if (!res.ok) {
        setWords(prev => prev.map(w => w.id === wordId ? { ...w, isLearned: currentStatus } : w));
        alert("Lỗi đồng bộ dữ liệu!");
      }
    } catch (err) {
      setWords(prev => prev.map(w => w.id === wordId ? { ...w, isLearned: currentStatus } : w));
    }
  };

  const handleFinishGame = async (results: { id: string, isRemembered: boolean }[]) => {
    if (mode !== 'practice' && results.length > 0) {
      try {
        await Promise.all(results.map(res => 
          fetch('/api/user/srs', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordId: res.id, isLearned: res.isRemembered })
          })
        ));
      } catch (e) {
        console.error("Lỗi đồng bộ kết quả game", e);
      }
    }
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
    return <HubView words={words} setName={setName} mode={mode} onToggleLearned={handleToggleLearned} part={part} />;
  }

  return (
    <Box minH="100vh" bg="#f8f9fa" pt={8} pb={10}>
      {type === 'flashcard' && <FlashcardGame words={words} onMarkLearned={(id: any) => handleToggleLearned(id, false)} onToggleLearned={handleToggleLearned} onUpdateSrs={(id: string, learned: boolean) => handleToggleLearned(id, !learned)} onFinish={() => handleFinishGame([])} />}
      {type === 'matching' && <MatchGame words={words} onFinish={handleFinishGame} />}
      {type === 'typing' && <TypingGame words={words} onFinish={handleFinishGame} />}
      {type === 'listening' && <ListenGame words={words} onFinish={handleFinishGame} />}
      {type === 'quiz' && <QuizGame words={words} onFinish={handleFinishGame} />}
      {type === 'combo' && <ComboGame words={words} onFinish={handleFinishGame} />}
    </Box>
  );
}

// ==========================================
// 3. GIAO DIỆN HUB CHỌN CHẾ ĐỘ
// ==========================================
function HubView({ words, setName, mode, onToggleLearned, part }: any) {
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

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto" minH="100vh" bg="#f8f9fa">
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={4}>
          <Button bg="white" color="gray.600" borderWidth="1px" borderColor="gray.200" onClick={() => router.back()} size="sm" borderRadius="xl" px={4} fontWeight="bold">
            <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Quay lại lộ trình
          </Button>
          <Text fontSize="lg" fontWeight="black" color="gray.800">{setName}</Text>
        </HStack>
        {mode === "practice" && <Box bg="purple.100" color="purple.600" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">Luyện tập tự do</Box>}
      </Flex>

      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" mb={8} borderWidth="1px" borderColor="gray.100" overflow="hidden">
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">Chọn chế độ học</Text>
          <Box color="blue.400" cursor="pointer"><Settings size={20} /></Box>
        </Flex>
        <Flex gap={4} overflowX="auto" py={6} px={4} mx={-4} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
          {learningModes.map((m) => (
            <Flex key={m.id} direction="column" align="center" justify="center" p={6} borderRadius="2xl" minW="180px" w="180px" background={m.bg} color="white" position="relative" cursor="pointer" boxShadow="0 6px 15px rgba(0,0,0,0.1)" transition="all 0.3s" flexShrink={0} _hover={{ transform: "translateY(-8px)", boxShadow: "0 15px 30px rgba(0,0,0,0.2)" }} onClick={() => handleStartMode(m.id)}>
              {m.isHot && <Box position="absolute" top={3} right={3} bg="white" color="red.500" px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="black" shadow="sm">HOT 🔥</Box>}
              <Flex w={12} h={12} borderRadius="full" bg="whiteAlpha.300" align="center" justify="center" mb={4}><m.icon size={24} color="white" /></Flex>
              <Text fontWeight="black" fontSize="lg" mb={1}>{m.name}</Text>
              <Text fontSize="xs" fontWeight="medium" opacity={0.9} textAlign="center" mb={4} h="32px">{m.desc}</Text>
              <Flex bg="whiteAlpha.300" px={3} py={1} borderRadius="full" align="center" gap={1.5}>
                <Text fontSize="sm" fontWeight="bold">{m.coin}</Text>
                <CircleDollarSign size={14} color="#fbbf24" fill="#fef3c7" />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* BẢNG TỪ VỰNG XÂY DỰNG BẰNG FLEX BOX AN TOÀN */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">Danh sách từ vựng</Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.400">{filteredWords.length} từ</Text>
        </Flex>

        <Flex gap={4} mb={6} direction={{ base: "column", md: "row" }}>
          <Flex flex={1} align="center" bg="gray.50" borderRadius="xl" px={4} h={10} borderWidth="1px" borderColor="gray.100">
            <Search size={18} color="#a0aec0" />
            <Input placeholder="Tìm kiếm từ vựng..." bg="transparent" border="none" _focus={{ outline: "none", boxShadow: "none" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} ml={2} w="full" px={0} fontWeight="medium"/>
          </Flex>
          <Flex align="center" bg="gray.50" borderRadius="xl" px={4} h={10} minW="150px" borderWidth="1px" borderColor="gray.100">
             <select value={filterStatus} onChange={(e: any) => setFilterStatus(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#4a5568', fontWeight: 700, cursor: 'pointer' }}>
               <option value="all">Tất cả</option>
               <option value="learned">Đã thuộc</option>
               <option value="unlearned">Chưa thuộc</option>
             </select>
          </Flex>
        </Flex>

        <Box borderTopWidth="1px" borderColor="gray.200" overflowX="auto">
          <Flex bg="gray.50" px={4} py={3} borderBottomWidth="1px" borderColor="gray.200" minW="600px">
             <Text flex={2} fontSize="xs" fontWeight="black" color="gray.500">TỪ VỰNG</Text>
             <Text flex={2} fontSize="xs" fontWeight="black" color="gray.500">NGHĨA</Text>
             <Text flex={1} fontSize="xs" fontWeight="black" color="gray.500">LOẠI TỪ</Text>
             <Text flex={1} fontSize="xs" fontWeight="black" color="gray.500" textAlign="center">THUỘC</Text>
          </Flex>
          {filteredWords.map((w: any, idx: number) => (
             <Flex key={w.id || idx} px={4} py={4} borderBottomWidth="1px" borderColor="gray.100" align="center" _hover={{ bg: "gray.50" }} minW="600px">
                <Flex flex={2} align="center" gap={3}>
                  <Box color="blue.500" cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: "blue.600" }}><Volume2 size={20} /></Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontWeight="black" color="gray.800">{w.word}</Text>
                    {w.phonetic && <Text fontSize="xs" color="gray.400" fontFamily="monospace">{w.phonetic}</Text>}
                  </VStack>
                </Flex>
                <Text flex={2} fontWeight="bold" color="gray.700">{w.meaning}</Text>
                <Flex flex={1}>
                  {w.type && <Box bg="blue.50" color="blue.600" px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="lowercase">{w.type}</Box>}
                </Flex>
                <Flex flex={1} justify="center" align="center">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onToggleLearned(w.id, !!w.isLearned); }} style={{ width: '36px', height: '20px', backgroundColor: w.isLearned ? '#22c55e' : '#cbd5e1', borderRadius: '9999px', position: 'relative', cursor: 'pointer', border: 'none', outline: 'none', transition: 'all 0.2s ease', display: 'block' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: w.isLearned ? '18px' : '2px', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', pointerEvents: 'none' }} />
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
// MÀN HÌNH TỔNG KẾT CHUNG
// ==========================================
function GameResultView({ score, total, router }: any) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const passed = score >= Math.ceil(total * 0.5);

  const handleReturnHub = () => {
    const part = searchParams?.get("part") || "0";
    const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  };

  return (
    <Center p={4} h="80vh">
      <Box bg="white" p={8} borderRadius="3xl" maxW="450px" w="full" textAlign="center" borderWidth="2px" borderColor="gray.100" boxShadow="0 8px 0 0 #e2e8f0">
        <Center color={passed ? "#58cc02" : "orange.500"} mb={4}><Text fontSize="6xl">🎉</Text></Center>
        <Text fontSize="2xl" fontWeight="black" color="gray.800" mb={6}>{passed ? "Hoàn Thành Xuất Sắc!" : "Cố Gắng Lần Sau Nhé!"}</Text>
        <Box bg="gray.50" p={4} borderRadius="2xl" mb={6} borderWidth="1px" borderColor="gray.200">
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="gray.500">Điểm số:</Text>
            <Text fontSize="sm" fontWeight="black" color="#58cc02">{score} / {total}</Text>
          </Flex>
          <CustomProgress value={(score / total) * 100} color="#58cc02" h="6px" />
        </Box>
        <Button w="full" bg="#58cc02" color="white" size="lg" borderRadius="2xl" fontWeight="black" borderBottomWidth="4px" borderColor="#46a302" _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleReturnHub}>Trở về bảng chọn</Button>
      </Box>
    </Center>
  );
}

// ==========================================
// GAME 1: FLASHCARD (CHUẨN IMAGE 1)
// ==========================================
export const FlashcardGame = ({ words, onMarkLearned, onToggleLearned, onUpdateSrs, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];
  if (!currentWord) return null;

  const handleCardClick = () => { if (!isFlipped) playAudio(currentWord.word); setIsFlipped(!isFlipped); };
  const handleNext = () => {
    setIsFlipped(false); setInputValue('');
    setTimeout(() => { if (currentIndex < words.length - 1) setCurrentIndex(prev => prev + 1); else onFinish(); }, 200);
  };
  const handlePrev = () => { if (currentIndex > 0) { setIsFlipped(false); setTimeout(() => setCurrentIndex(prev => prev - 1), 200); } };
  const handleForgot = () => { onUpdateSrs(currentWord.id, false); handleNext(); };
  
  const isCurrentlyLearned = currentWord?.isLearned ?? false;
  const handleToggleLearnedClick = () => { onToggleLearned(currentWord.id, isCurrentlyLearned); };

  const handleExit = () => {
    const part = searchParams?.get("part") || "0";
    const mode = searchParams?.get("mode") || "srs";
    router.push(`${pathname}?part=${part}&mode=${mode}&type=hub`);
  }

  const progress = ((currentIndex) / words.length) * 100;

  return (
    <Box w="full" px={4}>
      <GameHeader title={`~0 GAME \u00A0 ${currentIndex + 1} / ${words.length}`} progress={progress} onExit={handleExit} onReplay={() => setCurrentIndex(0)} showEnVn={true} />

      <Center flexDirection="column">
        {/* THẺ TÍM */}
        <Box perspective="1000px" w="full" maxW="700px" h="50vh" minH="380px" mb={8}>
          <Box w="full" h="full" position="relative" transition="transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)" style={{ transformStyle: 'preserve-3d' }} transform={isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} cursor="pointer" onClick={handleCardClick}>
            
            {/* Mặt Trước */}
            <Flex position="absolute" w="full" h="full" style={{ backfaceVisibility: 'hidden' }} bg="linear-gradient(135deg, #6b46c1, #8b5cf6)" borderRadius="3xl" direction="column" align="center" justify="center" p={8} color="white" boxShadow="0 10px 25px rgba(107, 70, 193, 0.3)">
              <Text fontSize="sm" fontWeight="bold" opacity={0.8} mb="auto" textTransform="uppercase" letterSpacing="widest">Từ Tiếng Anh</Text>
              
              <Text fontSize={{ base: "5xl", md: "7xl" }} fontWeight="black" letterSpacing="tight" textAlign="center">{currentWord.word}</Text>
              {currentWord.type && <Box bg="whiteAlpha.300" color="white" px={4} py={1} borderRadius="full" mt={4} fontSize="sm" fontWeight="bold">{currentWord.type}</Box>}
              <Text fontSize="xl" fontWeight="medium" fontStyle="italic" mt={4}>{currentWord.phonetic}</Text>
              
              <Text mt="auto" fontSize="sm" fontWeight="bold" opacity={0.8}>👆 Nhấn Space hoặc click để lật</Text>
            </Flex>

            {/* Mặt Sau */}
            <Flex position="absolute" w="full" h="full" style={{ backfaceVisibility: 'hidden' }} transform="rotateY(180deg)" bg="#58cc02" color="white" borderRadius="3xl" direction="column" align="center" justify="center" p={8} boxShadow="0 10px 25px rgba(88, 204, 2, 0.3)">
              <Text fontSize="sm" fontWeight="bold" opacity={0.8} mb="auto" textTransform="uppercase" letterSpacing="widest">Nghĩa tiếng Việt</Text>
              <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black" letterSpacing="tight" textAlign="center">{currentWord.meaning}</Text>
              <Text mt="auto" fontSize="sm" fontWeight="bold" opacity={0.8}>👆 Nhấn Space hoặc click để quay lại</Text>
            </Flex>
          </Box>
        </Box>

        {/* Ô INPUT CHECK */}
        <Flex gap={4} w="full" maxW="600px" mb={10}>
          <Input flex={1} placeholder="Gõ nghĩa(Đánh dấu đã thuộc nếu thấy đúng)" value={inputValue} onChange={(e) => setInputValue(e.target.value)} borderRadius="full" bg="white" border="2px solid" borderColor="blue.300" h="14" px={6} fontSize="md" fontWeight="bold" _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3b82f6" }} />
          <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={8} fontWeight="black" fontSize="lg" _hover={{ bg: "#46a302" }}>Check</Button>
        </Flex>

        {/* CÁC NÚT ĐIỀU KHIỂN DƯỚI CÙNG */}
        <Flex justify="center" gap={{ base: 4, md: 8 }} align="center" flexWrap="wrap">
          <VStack gap={1} cursor="pointer" onClick={handlePrev} opacity={currentIndex === 0 ? 0.5 : 1} _hover={currentIndex > 0 ? { opacity: 0.8 } : {}}>
            <HStack color="blue.400" fontWeight="bold"><ChevronLeft size={20} /> <Text>Trước</Text></HStack>
            <Text fontSize="xs" color="gray.400">Ctrl+← khi nhập</Text>
          </VStack>

          <VStack gap={1}>
            <Flex as="button" onClick={() => playAudio(currentWord.word)} w={14} h={14} borderRadius="full" bg="#58cc02" color="white" align="center" justify="center" _hover={{ transform: 'scale(1.05)' }} transition="0.2s">
              <Volume2 size={24} />
            </Flex>
            <Text fontSize="xs" color="gray.400">Ctrl+S khi nhập</Text>
          </VStack>

          <VStack gap={1}>
            <Button onClick={handleForgot} w="130px" h={12} borderRadius="full" bg="#58cc02" color="white" fontWeight="black" gap={2} _hover={{ bg: '#46a302' }}>
              <X size={18} strokeWidth={3} /> Quên
            </Button>
            <Text fontSize="xs" color="gray.400">Ctrl+1/X khi nhập</Text>
          </VStack>

          <VStack gap={1}>
            <Button onClick={handleToggleLearnedClick} w="130px" h={12} borderRadius="full" bg="#58cc02" color="white" fontWeight="black" gap={2} _hover={{ bg: '#46a302' }}>
               <Check size={18} strokeWidth={3} /> Thuộc
            </Button>
            <Text fontSize="xs" color="gray.400">Ctrl+2/C khi nhập</Text>
          </VStack>

          <VStack gap={1} cursor="pointer" onClick={handleNext} _hover={{ opacity: 0.8 }}>
            <HStack color="blue.400" fontWeight="bold"><Text>Tiếp</Text> <ChevronRight size={20} /></HStack>
            <Text fontSize="xs" color="gray.400">Ctrl+→ khi nhập</Text>
          </VStack>
        </Flex>

      </Center>
    </Box>
  );
};


// ==========================================
// GAME 2: NGHE VIẾT (LISTENING - CHUẨN IMAGE 2)
// ==========================================
export const ListenGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => { if (currentWord && !isGameFinished && !correctWordDetails) setTimeout(() => playAudio(currentWord.word), 500); }, [currentIndex, currentWord, isGameFinished, correctWordDetails]);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (!correctWordDetails) setTimeLeft(p => { if (p <= 1) { handleLifeLost(); return 30; } return p - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, currentWord]);

  const handleLifeLost = () => {
    setStatus('error');
    setGameOver(true); setResults(p => [...p, { id: currentWord.id, isRemembered: false }]);
  };

  const handleCheck = () => {
    if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('success'); playTingSound(); setResults(p => [...p, { id: currentWord.id, isRemembered: true }]);
      setTimeout(() => { setCorrectWordDetails(null); setInputValue(''); setStatus('idle'); setTimeLeft(30); setCurrentIndex(c => c + 1); }, 1500);
    } else {
      setStatus('error'); setTimeout(() => setStatus('idle'), 600);
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

      <Center flexDirection="column" bg="white" borderRadius="3xl" p={{ base: 6, md: 10 }} shadow="sm" borderWidth="1px" borderColor="gray.200" maxW="850px" mx="auto" position="relative" minH="450px">
        
        <Text position="absolute" top={6} right={8} fontSize="xs" fontWeight="bold" color="gray.400">Nghe: 1x | Ctrl+H</Text>

        {/* BIỂU TƯỢNG TAI NGHE CHÍNH GIỮA */}
        <Box position="relative" mb={6}>
          <Flex as="button" w="100px" h="100px" bg="#58cc02" borderRadius="full" align="center" justify="center" shadow="md" _hover={{ transform: 'scale(1.05)' }} transition="0.2s" onClick={() => playAudio(currentWord.word)}>
            <Headphones size={40} color="white" />
          </Flex>
          <Box position="absolute" bottom="-10px" left="50%" transform="translateX(-50%)" bg="#1cb0f6" color="white" px={3} py={0.5} borderRadius="full" fontSize="10px" fontWeight="black" whiteSpace="nowrap">CTRL + X</Box>
        </Box>

        <Text fontSize="xl" fontWeight="black" color="gray.700" mb={3}>Nghe và gõ từ tiếng Anh</Text>
        <Box bg="purple.50" color="purple.600" px={3} py={1} borderRadius="full" fontWeight="bold" fontSize="xs" mb={6}>{currentWord.type || "N"}</Box>
        
        <Text fontSize="sm" color="gray.400" fontStyle="italic" mb={6}>Chưa có gợi ý</Text>
        
        <Input placeholder="Gõ từ bạn nghe được..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} borderRadius="full" bg="white" border="2px solid" borderColor={status === 'error' ? 'red.400' : status === 'success' ? 'green.400' : 'gray.200'} animation={status === 'error' ? `${shakeAnimation} 0.4s` : status === 'success' ? `${successPulse} 0.5s` : 'none'} h="14" w="full" maxW="500px" textAlign="center" fontSize="lg" fontWeight="bold" mb={10} color={status === 'error' ? 'red.600' : status === 'success' ? 'green.600' : 'gray.800'} disabled={!!correctWordDetails} _focus={{ borderColor: "blue.400", boxShadow: "none" }} />

        {/* BỘ 3 NÚT HÀNH ĐỘNG DƯỚI CÙNG */}
        <Flex gap={4} justify="center" flexWrap="wrap">
           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color="gray.700" fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }}> <Pencil size={18}/> Xem ví dụ </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + E</Text>
           </VStack>
           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color="gray.700" fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }}> <Target size={18}/> Gợi ý (3) </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + Space</Text>
           </VStack>
           <VStack gap={1}>
             <Button bg="#58cc02" color="white" borderRadius="full" h={12} px={8} fontWeight="black" _hover={{ bg: "#46a302" }} onClick={handleCheck}> Kiểm tra </Button>
             <Text fontSize="xs" color="gray.400">Enter</Text>
           </VStack>
        </Flex>

      </Center>
    </Box>
  );
};

// ==========================================
// GAME 3: GÕ TỪ (TYPING - CHUẨN IMAGE 3)
// ==========================================
export const TypingGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (!correctWordDetails) setTimeLeft(p => { if (p <= 1) { handleLifeLost(); return 30; } return p - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, currentWord]);

  const handleLifeLost = () => {
    setStatus('error');
    setGameOver(true); setResults(p => [...p, { id: currentWord.id, isRemembered: false }]);
  };

  const handleCheck = () => {
    if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('success'); playTingSound(); setResults(p => [...p, { id: currentWord.id, isRemembered: true }]);
      setTimeout(() => { setCorrectWordDetails(null); setInputValue(''); setStatus('idle'); setTimeLeft(30); setCurrentIndex(c => c + 1); }, 1500);
    } else {
      setStatus('error'); setTimeout(() => setStatus('idle'), 600);
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
      <GameHeader title={`Câu ${currentIndex + 1} / ${words.length}`} progress={progress} time={timeLeft} onExit={handleExit} onReplay={() => setCurrentIndex(0)} showEnVn={true} />

      <Center flexDirection="column" bg="white" borderRadius="3xl" p={{ base: 6, md: 10 }} shadow="sm" borderWidth="1px" borderColor="gray.200" maxW="850px" mx="auto" position="relative" minH="450px">
        
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="black" textAlign="center" mb={4}>{currentWord.meaning}</Text>
        
        <HStack gap={3} mb={6}>
          <Box as="button" color="#1cb0f6" _hover={{ color: 'blue.500' }} onClick={() => playAudio(currentWord.word)}><Volume2 size={24} /></Box>
          <Box bg="purple.50" color="purple.600" px={3} py={1} borderRadius="full" fontWeight="bold" fontSize="xs">{currentWord.type || "N"}</Box>
        </HStack>

        <Text fontSize="sm" color="gray.400" fontStyle="italic" mb={6}>Chưa có gợi ý</Text>
        
        <Input placeholder="Gõ từ tiếng Anh..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} borderRadius="full" bg="white" border="2px solid" borderColor={status === 'error' ? 'red.400' : status === 'success' ? 'green.400' : '#1cb0f6'} animation={status === 'error' ? `${shakeAnimation} 0.4s` : status === 'success' ? `${successPulse} 0.5s` : 'none'} h="14" w="full" maxW="500px" textAlign="center" fontSize="lg" fontWeight="bold" mb={10} color={status === 'error' ? 'red.600' : status === 'success' ? 'green.600' : 'gray.800'} disabled={!!correctWordDetails} _focus={{ borderColor: "#1cb0f6", boxShadow: "0 0 0 1px #1cb0f6" }} />

        <Flex gap={4} justify="center" flexWrap="wrap">
           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color="gray.700" fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }}> <Pencil size={18}/> Xem ví dụ </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + E</Text>
           </VStack>
           <VStack gap={1}>
             <Button variant="outline" borderRadius="full" h={12} px={6} borderColor="gray.200" color="gray.700" fontWeight="bold" gap={2} _hover={{ bg: "gray.50" }}> <Target size={18}/> Gợi ý (3) </Button>
             <Text fontSize="xs" color="gray.400">Ctrl + Space</Text>
           </VStack>
           <VStack gap={1}>
             <Button bg="#58cc02" color="white" borderRadius="full" h={12} px={8} fontWeight="black" _hover={{ bg: "#46a302" }} onClick={handleCheck}> Kiểm tra </Button>
             <Text fontSize="xs" color="gray.400">Enter</Text>
           </VStack>
        </Flex>

      </Center>
    </Box>
  );
};


// ==========================================
// GAME 4: NỐI TỪ (MATCHING - CHUẨN IMAGE 4)
// ==========================================
export const MatchGame = ({ words, onFinish }: any) => {
  const [matchWords] = useState(() => [...words].sort(() => Math.random() - 0.5).slice(0, 4)); // Chọn 4 từ tạo thành 8 ô
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
        
        {/* THANH TIM VÀ ĐỒNG HỒ TRONG THẺ */}
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
               <Button key={i} variant="outline" h="14" borderRadius="full" fontWeight="bold" fontSize="sm" bg={matchedPairs.includes(w.word) ? "gray.100" : selectedWord === w.word ? "blue.50" : "white"} color={matchedPairs.includes(w.word) ? "gray.300" : "gray.700"} borderColor={selectedWord === w.word ? "blue.400" : "gray.200"} opacity={matchedPairs.includes(w.word) ? 0.5 : 1} onClick={() => { setSelectedWord(w.word); checkMatch(w.word, selectedMeaning); }} _hover={{ bg: "gray.50" }}>{w.word}</Button>
            ))}
          </VStack>

          <VStack align="stretch" gap={4}>
            <Text textAlign="center" fontWeight="black" color="gray.800" mb={2}>Tiếng Việt</Text>
            {shuffledMeanings.map((w, i) => (
               <Button key={i} variant="outline" h="auto" minH="14" py={3} borderRadius="full" fontWeight="bold" fontSize="sm" bg={matchedPairs.includes(matchWords.find(x=>x.meaning===w.meaning)?.word||'') ? "gray.100" : selectedMeaning === w.meaning ? "blue.50" : "white"} color={matchedPairs.includes(matchWords.find(x=>x.meaning===w.meaning)?.word||'') ? "gray.300" : "gray.700"} borderColor={selectedMeaning === w.meaning ? "blue.400" : "gray.200"} opacity={matchedPairs.includes(matchWords.find(x=>x.meaning===w.meaning)?.word||'') ? 0.5 : 1} whiteSpace="normal" onClick={() => { setSelectedMeaning(w.meaning); checkMatch(selectedWord, w.meaning); }} _hover={{ bg: "gray.50" }}>{w.meaning}</Button>
            ))}
          </VStack>
        </Grid>
        
        <Text textAlign="center" fontWeight="black" color="gray.800" mt={8}>Đã ghép: {matchedPairs.length} / {matchWords.length}</Text>
      </Box>
    </Box>
  );
};


// ==========================================
// GAME 5: TRẮC NGHIỆM (QUIZ)
// ==========================================
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

// ==========================================
// GAME 6: TỔNG HỢP (COMBO)
// ==========================================
export const ComboGame = ({ words, onFinish }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameSequence, setGameSequence] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const modes = ['quiz', 'typing', 'listening'];
    setGameSequence(words.map(() => modes[Math.floor(Math.random() * modes.length)]));
  }, [words]);

  if (currentIndex >= words.length) return <GameResultView score={results.filter(r=>r.isRemembered).length} total={words.length} />;
  
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