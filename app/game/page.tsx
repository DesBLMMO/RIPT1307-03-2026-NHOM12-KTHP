"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, SimpleGrid, Flex, Text, HStack, Button, Input, 
  VStack, Center, Grid, Spinner, Badge
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { 
  ChevronDown, Settings, Volume2, Flame, RefreshCw, Play, Calendar, 
  X, RotateCcw, ChevronLeft, ChevronRight, Check, Headphones, Heart, 
  Circle, Clock, CheckCircle2, Pause, Info, SortAsc
} from 'lucide-react';

import { gameModes } from '@/lib/data';
import { useVocabWords } from '@/hooks/useVocabWords';
import { useVocabSets } from '@/hooks/useVocabSets';

// ==========================================
// ANIMATIONS
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

const breakObstacle = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5) rotate(15deg); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
`;

const characterRun = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }
`;

// ==========================================
// TIỆN ÍCH: PHÁT ÂM VÀ ÂM THANH
// ==========================================
const playAudio = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

const playTingSound = () => {
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

// ==========================================
// COMPONENT: CUSTOM SWITCH
// ==========================================
const CustomSwitch = () => {
  const [isOn, setIsOn] = useState(true);
  return (
    <Flex w="36px" h="20px" bg={isOn ? "green.500" : "gray.300"} borderRadius="full" align="center" px="2px" cursor="pointer" onClick={() => setIsOn(!isOn)} transition="background-color 0.2s">
      <Box w="16px" h="16px" bg="white" borderRadius="full" shadow="sm" transform={isOn ? "translateX(16px)" : "translateX(0)"} transition="transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" />
    </Flex>
  );
};

// ==========================================
// COMPONENT: HEADER CHUNG
// ==========================================
const GameHeader = ({ title, progress, onExit }: { title: string, progress: number, onExit: () => void }) => (
  <Flex bg="white" border="2px solid" borderColor="gray.800" borderRadius="full" px={6} py={3} w="full" justify="space-between" align="center" shadow="sm">
    <HStack gap={4} flex={1}>
      <Flex bg="#fef3c7" color="#d97706" px={3} py={1} borderRadius="full" fontWeight="bold" fontSize="xs" align="center" gap={1}>
        <Text fontSize="10px" fontWeight="bold">$</Text> ~0 GAME
      </Flex>
      <Text fontWeight="extrabold" color="gray.700" fontSize="sm">{title}</Text>
      <Box flex={1} mx={4}>
        <Box h="2" bg="gray.100" borderRadius="full" w="full" overflow="hidden">
           <Box h="full" bg="green.500" w={`${progress}%`} borderRadius="full" transition="width 0.3s" />
        </Box>
      </Box>
    </HStack>
    <HStack gap={6}>
      <HStack gap={2}>
        <Text fontSize="xs" fontWeight="bold" color="gray.500">EN—VN</Text>
        <CustomSwitch />
      </HStack>
      <Button variant="ghost" size="sm" fontWeight="bold" color="cyan.500" _hover={{ bg: 'cyan.50' }} onClick={onExit}>Thoát</Button>
    </HStack>
  </Flex>
);

// ==========================================
// CHẾ ĐỘ 1: FLASHCARD
// ==========================================
const FlashcardGame = ({ words, onMarkLearned, onUpdateSrs, onFinish }: { words: any[], onMarkLearned: (id: any) => void, onUpdateSrs: (id: string, rem: boolean) => void, onFinish: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words[currentIndex];
  if (!currentWord) return null;

  const handleCardClick = () => {
    if (!isFlipped) playAudio(currentWord.word);
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < words.length - 1) setCurrentIndex(prev => prev + 1);
      else onFinish();
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  const handleForgot = () => {
    onUpdateSrs(currentWord.id, false);
    handleNext();
  };

  const handleLearned = () => {
    onMarkLearned(currentWord.id);
    onUpdateSrs(currentWord.id, true);
    handleNext();
  };

  return (
    <Box w="full" maxW="850px" mx="auto" pt={4}>
      <Text textAlign="center" fontWeight="black" color="gray.400" mb={4} fontSize="sm">THẺ {currentIndex + 1} / {words.length}</Text>
      <Box perspective="1000px" w="full" h="45vh" minH="350px" mb={10}>
        <Box w="full" h="full" position="relative" transition="transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)" style={{ transformStyle: 'preserve-3d' }} transform={isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} cursor="pointer" onClick={handleCardClick}>
          <Flex position="absolute" w="full" h="full" style={{ backfaceVisibility: 'hidden' }} bg="white" borderRadius="3xl" borderWidth="2px" borderColor="gray.200" boxShadow="0px 8px 0px #e2e8f0" direction="column" align="center" justify="center" p={8} _hover={{ transform: 'translateY(-2px)', boxShadow: '0px 10px 0px #e2e8f0' }} transition="all 0.2s">
            <Badge px={5} py={1.5} borderRadius="full" mb={6} colorScheme="blue">{currentWord.type}</Badge>
            <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" color="gray.800" letterSpacing="tight" textAlign="center">{currentWord.word}</Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.400" fontStyle="italic" mt={2}>{currentWord.phonetic}</Text>
            <Text mt="auto" fontSize="sm" fontWeight="bold" color="gray.400">👇 Nhấn vào thẻ để lật xem nghĩa</Text>
          </Flex>
          <Flex position="absolute" w="full" h="full" style={{ backfaceVisibility: 'hidden' }} transform="rotateY(180deg)" bg="#58cc02" color="white" borderRadius="3xl" borderWidth="2px" borderColor="#46a302" boxShadow="0px 8px 0px #46a302" direction="column" align="center" justify="center" p={8}>
            <Text fontSize="sm" fontWeight="black" opacity={0.8} mb={4} textTransform="uppercase" letterSpacing="widest">Nghĩa tiếng Việt</Text>
            <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black" letterSpacing="tight" textAlign="center" mb={6}>{currentWord.meaning}</Text>
            {currentWord.exampleEn && (
              <Box bg="blackAlpha.200" p={5} borderRadius="2xl" w="full" maxW="500px" textAlign="center">
                <Text fontWeight="bold" fontSize="lg">"{currentWord.exampleEn}"</Text>
                {currentWord.exampleVi && <Text fontSize="sm" opacity={0.9} mt={1}>{currentWord.exampleVi}</Text>}
              </Box>
            )}
            <Text mt="auto" fontSize="sm" fontWeight="bold" opacity={0.8}>👆 Nhấn để quay lại</Text>
          </Flex>
        </Box>
      </Box>
      <Flex justify="center" gap={4} align="center">
        <Button onClick={handlePrev} disabled={currentIndex === 0} w={14} h={14} borderRadius="2xl" bg="white" color="gray.400" borderWidth="2px" borderColor="gray.200" borderBottomWidth="4px" _hover={currentIndex > 0 ? { bg: 'gray.50', color: 'gray.600', borderColor: 'gray.300' } : {}} _active={currentIndex > 0 ? { transform: 'translateY(2px)', borderBottomWidth: '2px' } : {}}><ChevronLeft size={24} strokeWidth={3} /></Button>
        <Button onClick={() => playAudio(currentWord.word)} w={16} h={16} borderRadius="2xl" bg="#1cb0f6" color="white" borderBottomWidth="4px" borderColor="#1899d6" _hover={{ bg: '#149ede' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }}><Volume2 size={28} strokeWidth={2.5} /></Button>
        <Button onClick={handleForgot} w="130px" h={16} borderRadius="2xl" bg="#ef4444" color="white" borderBottomWidth="4px" borderColor="#dc2626" fontWeight="black" fontSize="md" gap={2} _hover={{ bg: '#e03a3a' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }}><X size={18} strokeWidth={3} /> QUÊN</Button>
        <Button onClick={handleLearned} w="130px" h={16} borderRadius="2xl" bg="#58cc02" color="white" borderBottomWidth="4px" borderColor="#46a302" fontWeight="black" fontSize="md" gap={2} _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }}><Check size={18} strokeWidth={3} /> THUỘC</Button>
        <Button onClick={handleNext} w={14} h={14} borderRadius="2xl" bg="white" color="gray.400" borderWidth="2px" borderColor="gray.200" borderBottomWidth="4px" _hover={{ bg: 'gray.50', color: 'gray.600', borderColor: 'gray.300' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }}><ChevronRight size={24} strokeWidth={3} /></Button>
      </Flex>
    </Box>
  );
};

// ==========================================
// CHẾ ĐỘ 2: NỐI TỪ
// ==========================================
const MatchGame = ({ words, onFinish }: { words: any[], onFinish: (res: any) => void }) => {
  const [matchWords, setMatchWords] = useState(() => [...words].sort(() => Math.random() - 0.5).slice(0, 6));
  const [shuffledMeanings, setShuffledMeanings] = useState(() => [...matchWords].sort(() => Math.random() - 0.5));
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [errorPair, setErrorPair] = useState<{w: string, m: string} | null>(null);

  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);

  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [isBannerPaused, setIsBannerPaused] = useState(false);

  const isGameFinished = gameOver || (matchedPairs.length === matchWords.length && matchWords.length > 0 && !correctWordDetails);

  useEffect(() => {
    if (isGameFinished) return;
    const timer = setInterval(() => {
      if (correctWordDetails) {
        if (!isBannerPaused) {
          setBannerCountDown(prev => {
            if (prev <= 1) { closeBanner(); return 3; }
            return prev - 1;
          });
        }
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) { handleLifeLost(); return 20; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, isBannerPaused]);

  const handleLifeLost = () => {
    setHearts(h => {
      const newHearts = h - 1;
      if (newHearts <= 0) setGameOver(true);
      return newHearts;
    });
  };

  const closeBanner = () => {
    setCorrectWordDetails(null);
    setTimeLeft(20); 
  };

  const checkMatch = (word: string | null, meaning: string | null) => {
    if (word && meaning) {
      const correctWordObj = matchWords.find(w => w.word === word);
      if (correctWordObj?.meaning === meaning) {
        setMatchedPairs(prev => [...prev, word]);
        setCorrectWordDetails(correctWordObj);
        setBannerCountDown(3);
        setIsBannerPaused(false);
        playTingSound();
      } else {
        setErrorPair({ w: word, m: meaning });
        handleLifeLost();
        setTimeLeft(20);
        setTimeout(() => setErrorPair(null), 600);
      }
      setSelectedWord(null);
      setSelectedMeaning(null);
    }
  };

  const handleSelectWord = (word: string) => {
    playAudio(word); 
    if (matchedPairs.includes(word) || correctWordDetails) return;
    setSelectedWord(word);
    checkMatch(word, selectedMeaning);
  };

  const handleSelectMeaning = (meaning: string) => {
    const wordObj = matchWords.find(w => w.meaning === meaning);
    if (!wordObj || matchedPairs.includes(wordObj.word) || correctWordDetails) return;
    setSelectedMeaning(meaning);
    checkMatch(selectedWord, meaning);
  };

  const handleRestart = () => {
    const newMatchWords = [...words].sort(() => Math.random() - 0.5).slice(0, 6);
    setMatchWords(newMatchWords);
    setShuffledMeanings([...newMatchWords].sort(() => Math.random() - 0.5));
    setHearts(5); setTimeLeft(20); setGameOver(false); setMatchedPairs([]);
    setErrorPair(null); setSelectedWord(null); setSelectedMeaning(null); setCorrectWordDetails(null);
  };

  const handleCompleteAndSave = () => {
    const results = matchWords.map(w => ({ id: w.id, isRemembered: matchedPairs.includes(w.word) }));
    onFinish(results);
  };

  if (isGameFinished) {
    return (
      <Box w="full" maxW="950px" mx="auto">
        <Box bg="white" borderRadius="3xl" p={8} shadow="xl" borderWidth="1px" borderColor="gray.100" minH="500px">
          <VStack gap={6} align="center">
            <Text fontSize="4xl" fontWeight="black" color={gameOver ? "red.500" : "green.500"}>
              {gameOver ? "HẾT MẠNG! 💔" : "HOÀN THÀNH XUẤT SẮC! 🎉"}
            </Text>
            <Box w="full" maxW="800px" borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden" shadow="sm">
              <Grid templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" bg="gray.100" p={3} borderBottomWidth="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">#</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">TỪ VỰNG</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">PHIÊN ÂM</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">NGHĨA</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">LOẠI TỪ</Text><Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">KẾT QUẢ</Text>
              </Grid>
              <Box maxH="280px" overflowY="auto" className="custom-scrollbar">
                {matchWords.map((w, idx) => {
                  const isMatched = matchedPairs.includes(w.word); 
                  return (
                    <Grid key={idx} templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" p={3} borderBottomWidth="1px" borderColor="gray.50" alignItems="center" bg={isMatched ? "green.50" : "red.50"} _hover={{ bg: isMatched ? "green.100" : "red.100" }} transition="0.2s">
                      <Text fontSize="sm" fontWeight="bold" color="gray.500">{idx + 1}</Text>
                      <HStack cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: 'blue.500' }}><Text fontWeight="black" fontSize="sm">{w.word}</Text><Volume2 size={14} /></HStack>
                      <Text fontSize="xs" color="gray.500">{w.phonetic}</Text><Text fontWeight="bold" fontSize="sm" color="gray.700">{w.meaning}</Text>
                      <Text fontSize="xs" fontWeight="bold" color={isMatched ? "green.600" : "red.600"}>{w.type}</Text>
                      <Flex justify="center">{isMatched ? <CheckCircle2 color="#16a34a" size={18} /> : <X color="#dc2626" size={18} />}</Flex>
                    </Grid>
                  );
                })}
              </Box>
            </Box>
            <HStack gap={4} mt={4}>
              <Button bg="gray.100" color="gray.600" borderRadius="full" h="14" px={10} fontWeight="bold" fontSize="lg" _hover={{ bg: 'gray.200' }} onClick={handleRestart}>
                CHƠI TIẾP
              </Button>
              <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={12} fontWeight="black" fontSize="lg" borderBottomWidth="4px" borderColor="#46a302" _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCompleteAndSave}>
                HOÀN TẤT & LƯU
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="full" maxW="950px" mx="auto" position="relative">
      <Box bg="white" borderRadius="3xl" p={8} shadow="xl" borderWidth="1px" borderColor="gray.100" h="70vh" minH="500px" display="flex" flexDirection="column">
        <Flex justify="space-between" mb={8} shrink={0}>
          <HStack gap={1}>{[1, 2, 3, 4, 5].map(i => <Heart key={i} size={28} fill={i <= hearts ? "#ff4d4d" : "transparent"} color={i <= hearts ? "#ff4d4d" : "#e2e8f0"} style={{ transition: 'all 0.3s' }} />)}</HStack>
          <Flex bg={timeLeft <= 5 ? "red.100" : "#dcfce7"} color={timeLeft <= 5 ? "red.600" : "#16a34a"} px={4} py={1.5} borderRadius="full" fontWeight="black" align="center" gap={2} transition="all 0.3s" animation={timeLeft <= 5 && !correctWordDetails ? `${shakeAnimation} 0.5s ease-in-out infinite` : 'none'}><Clock size={18} /> {timeLeft}S</Flex>
        </Flex>

        <Grid templateColumns="1fr 1.2fr" gap={10} flex={1}>
          <VStack align="stretch" gap={3} justify="center">
            <Text textAlign="center" fontWeight="black" color="gray.800" mb={2}>Tiếng Anh</Text>
            {matchWords.map((w, i) => {
              const isMatched = matchedPairs.includes(w.word); const isSelected = selectedWord === w.word; const isError = errorPair?.w === w.word;
              let bg = "white", borderColor = "gray.200", color = "gray.700", animation = "";
              if (isMatched) { bg = "green.100"; borderColor = "green.400"; color = "green.700"; }
              else if (isError) { bg = "red.50"; borderColor = "red.400"; color = "red.600"; animation = `${shakeAnimation} 0.4s ease-in-out`; }
              else if (isSelected) { bg = "blue.50"; borderColor = "blue.400"; color = "blue.600"; }
              return (
                <Button key={i} variant="outline" h="14" borderRadius="2xl" fontWeight="bold" bg={bg} borderColor={borderColor} color={color} animation={animation} opacity={isMatched ? 0.3 : 1} pointerEvents={isMatched ? 'none' : 'auto'} _hover={!isSelected && !isMatched ? { bg: 'blue.50', borderColor: 'blue.200' } : {}} onClick={() => handleSelectWord(w.word)} transition="all 0.2s">{w.word}</Button>
              );
            })}
          </VStack>

          <VStack align="stretch" gap={3} justify="center">
            <Text textAlign="center" fontWeight="black" color="gray.800" mb={2}>Tiếng Việt</Text>
            {shuffledMeanings.map((w, i) => {
              const originalWord = matchWords.find(mw => mw.meaning === w.meaning)?.word || '';
              const isMatched = matchedPairs.includes(originalWord); const isSelected = selectedMeaning === w.meaning; const isError = errorPair?.m === w.meaning;
              let bg = "white", borderColor = "gray.200", color = "gray.700", animation = "";
              if (isMatched) { bg = "green.100"; borderColor = "green.400"; color = "green.700"; }
              else if (isError) { bg = "red.50"; borderColor = "red.400"; color = "red.600"; animation = `${shakeAnimation} 0.4s ease-in-out`; }
              else if (isSelected) { bg = "blue.50"; borderColor = "blue.400"; color = "blue.600"; }
              return (
                <Button key={i} variant="outline" h="auto" minH="14" py={3} borderRadius="2xl" fontWeight="bold" bg={bg} borderColor={borderColor} color={color} animation={animation} opacity={isMatched ? 0.3 : 1} pointerEvents={isMatched ? 'none' : 'auto'} whiteSpace="normal" fontSize="sm" lineHeight="tight" _hover={!isSelected && !isMatched ? { bg: 'blue.50', borderColor: 'blue.200' } : {}} onClick={() => handleSelectMeaning(w.meaning)} transition="all 0.2s">{w.meaning}</Button>
              );
            })}
          </VStack>
        </Grid>
      </Box>

      {/* BOTTOM BANNER */}
      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)`} shadow="2xl">
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)} _hover={{ transform: 'scale(1.05)' }} transition="0.2s"><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1}>
              <Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text> <Text as="span" fontSize="sm">({correctWordDetails.type?.toLowerCase()})</Text></Text>
              <Text fontSize="md" fontStyle="italic">// {correctWordDetails.phonetic} //</Text>
              <Text fontSize="md"><Text as="span" fontWeight="bold">Nghĩa:</Text> {correctWordDetails.meaning}</Text>
              {correctWordDetails.exampleEn && (
                <HStack gap={2} cursor="pointer" onClick={() => playAudio(correctWordDetails.exampleEn)} _hover={{ color: 'green.100' }}>
                  <Volume2 size={16} /> <Text fontSize="sm"><Text as="span" fontWeight="bold">Ví dụ:</Text> {correctWordDetails.exampleEn}</Text>
                </HStack>
              )}
            </VStack>
          </HStack>
          
          <HStack gap={4}>
            <Flex as="button" w={12} h={12} borderRadius="full" border="2px solid white" align="center" justify="center" _hover={{ bg: 'whiteAlpha.300' }} onClick={() => setIsBannerPaused(!isBannerPaused)}>
              {isBannerPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
            </Flex>
            <Flex as="button" w={12} h={12} borderRadius="full" bg="white" color="red.500" align="center" justify="center" onClick={closeBanner} _hover={{ bg: 'gray.100' }}><X size={24} /></Flex>
            <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner} _hover={{ bg: 'gray.100' }}>Tiếp tục ({bannerCountDown}s)</Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

// ==========================================
// CHẾ ĐỘ 3: GÕ TỪ
// ==========================================
const TypingGame = ({ words, onFinish }: { words: any[], onFinish: (res: any) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  
  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  
  const [results, setResults] = useState<{wordObj: any, isMatched: boolean}[]>([]);

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => {
    if (currentWord && !isGameFinished && !correctWordDetails) {
      setTimeout(() => playAudio(currentWord.word), 500); 
    }
  }, [currentIndex, currentWord, isGameFinished, correctWordDetails]);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (correctWordDetails) {
        if (!isBannerPaused) {
          setBannerCountDown(prev => {
            if (prev <= 1) { closeBanner(); return 3; }
            return prev - 1;
          });
        }
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) { handleLifeLost(); return 20; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, isBannerPaused, currentWord]);

  const handleLifeLost = () => {
    setStatus('error');
    setHearts(h => {
      const newHearts = h - 1;
      if (newHearts <= 0) {
        setGameOver(true);
        setResults(prev => [...prev, { wordObj: currentWord, isMatched: false }]);
      }
      return newHearts;
    });
    setTimeout(() => setStatus('idle'), 600);
  };

  const closeBanner = () => {
    setCorrectWordDetails(null);
    setInputValue('');
    setStatus('idle');
    setTimeLeft(20);
    setCurrentIndex(c => c + 1);
  };

  const handleCheck = () => {
    if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('success');
      playTingSound(); 
      setResults(prev => [...prev, { wordObj: currentWord, isMatched: true }]);
      setCorrectWordDetails(currentWord);
      setBannerCountDown(3);
      setIsBannerPaused(false);
    } else {
      handleLifeLost(); 
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0); setInputValue(''); setStatus('idle');
    setHearts(5); setTimeLeft(20); setGameOver(false);
    setCorrectWordDetails(null); setResults([]);
  };

  const handleCompleteAndSave = () => {
    const formattedResults = results.map(r => ({ id: r.wordObj.id, isRemembered: r.isMatched }));
    onFinish(formattedResults);
  };

  if (!currentWord && !isGameFinished) return null;

  if (isGameFinished) {
    return (
      <Box w="full" maxW="950px" mx="auto">
        <Box bg="white" borderRadius="3xl" p={8} shadow="xl" borderWidth="1px" borderColor="gray.100" minH="500px">
          <VStack gap={6} align="center">
            <Text fontSize="4xl" fontWeight="black" color={gameOver ? "red.500" : "green.500"}>
              {gameOver ? "HẾT MẠNG! 💔" : "HOÀN THÀNH XUẤT SẮC! 🎉"}
            </Text>
            <Box w="full" maxW="800px" borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden" shadow="sm">
              <Grid templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" bg="gray.100" p={3} borderBottomWidth="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">#</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">TỪ VỰNG</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">PHIÊN ÂM</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">NGHĨA</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">LOẠI TỪ</Text><Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">KẾT QUẢ</Text>
              </Grid>
              <Box maxH="280px" overflowY="auto" className="custom-scrollbar">
                {results.map((r, idx) => {
                  const isMatched = r.isMatched; const w = r.wordObj;
                  return (
                    <Grid key={idx} templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" p={3} borderBottomWidth="1px" borderColor="gray.50" alignItems="center" bg={isMatched ? "green.50" : "red.50"} _hover={{ bg: isMatched ? "green.100" : "red.100" }} transition="0.2s">
                      <Text fontSize="sm" fontWeight="bold" color="gray.500">{idx + 1}</Text>
                      <HStack cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: 'blue.500' }}><Text fontWeight="black" fontSize="sm">{w.word}</Text><Volume2 size={14} /></HStack>
                      <Text fontSize="xs" color="gray.500">{w.phonetic}</Text><Text fontWeight="bold" fontSize="sm" color="gray.700">{w.meaning}</Text>
                      <Text fontSize="xs" fontWeight="bold" color={isMatched ? "green.600" : "red.600"}>{w.type}</Text>
                      <Flex justify="center">{isMatched ? <CheckCircle2 color="#16a34a" size={18} /> : <X color="#dc2626" size={18} />}</Flex>
                    </Grid>
                  );
                })}
              </Box>
            </Box>
            <HStack gap={4} mt={4}>
              <Button bg="gray.100" color="gray.600" borderRadius="full" h="14" px={10} fontWeight="bold" fontSize="lg" _hover={{ bg: 'gray.200' }} onClick={handleRestart}>
                CHƠI TIẾP
              </Button>
              <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={12} fontWeight="black" fontSize="lg" borderBottomWidth="4px" borderColor="#46a302" _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCompleteAndSave}>
                HOÀN TẤT & LƯU
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="full" maxW="750px" mx="auto" position="relative">
      <Center bg="white" borderRadius="3xl" p={12} pt={8} shadow="xl" borderWidth="1px" borderColor="gray.50" flexDirection="column" pos="relative" h="65vh" minH="450px">
        <Flex w="full" justify="space-between" mb={6} shrink={0}>
          <HStack gap={1}>
            {[1, 2, 3, 4, 5].map(i => (
              <Heart key={i} size={28} fill={i <= hearts ? "#ff4d4d" : "transparent"} color={i <= hearts ? "#ff4d4d" : "#e2e8f0"} style={{ transition: 'all 0.3s' }} />
            ))}
          </HStack>
          <Flex bg={timeLeft <= 5 ? "red.100" : "#dcfce7"} color={timeLeft <= 5 ? "red.600" : "#16a34a"} px={4} py={1.5} borderRadius="full" fontWeight="black" align="center" gap={2} transition="all 0.3s" animation={timeLeft <= 5 && !correctWordDetails ? `${shakeAnimation} 0.5s ease-in-out infinite` : 'none'}>
            <Clock size={18} /> {timeLeft}S
          </Flex>
        </Flex>

        <Text fontSize="3xl" fontWeight="black" color="gray.800" textAlign="center" mb={6}>{currentWord.meaning}</Text>
        <HStack gap={3} mb={6}>
          <Box as="button" color="blue.400" _hover={{ color: 'blue.600' }} onClick={() => playAudio(currentWord.word)}><Volume2 size={24} /></Box>
          <Box bg="purple.50" color="purple.600" px={4} py={1} borderRadius="md" fontWeight="black" fontSize="xs">{currentWord.type}</Box>
        </HStack>

        <Text fontSize="sm" color="gray.400" fontWeight="bold" fontStyle="italic" mb={12}>Gợi ý: Bắt đầu bằng chữ "{currentWord.word.charAt(0)}"</Text>
        
        <Input 
          placeholder="Nhập từ tiếng Anh..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          borderRadius="2xl" bg="gray.50" border="3px solid" borderColor={status === 'error' ? 'red.400' : status === 'success' ? 'green.400' : 'gray.200'} 
          animation={status === 'error' ? `${shakeAnimation} 0.4s` : status === 'success' ? `${successPulse} 0.5s` : 'none'}
          h="20" w="full" maxW="600px" textAlign="center" fontSize="3xl" fontWeight="black" mb={12} color={status === 'error' ? 'red.600' : status === 'success' ? 'green.600' : 'gray.800'}
          _focus={{ bg: "white", borderColor: status === 'idle' ? 'blue.400' : undefined, shadow: 'xl', transform: 'translateY(-2px)' }}
          _hover={{ bg: "white", borderColor: 'gray.300' }} transition="all 0.2s" disabled={!!correctWordDetails}
        />

        <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={16} fontWeight="black" borderBottomWidth="4px" borderColor="#46a302" _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCheck} disabled={!!correctWordDetails}>
          KIỂM TRA
        </Button>
      </Center>

      {/* BOTTOM BANNER KHI GÕ ĐÚNG TỪ */}
      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)`} shadow="2xl">
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)} _hover={{ transform: 'scale(1.05)' }} transition="0.2s"><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1}>
              <Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text> <Text as="span" fontSize="sm">({correctWordDetails.type?.toLowerCase()})</Text></Text>
              <Text fontSize="md" fontStyle="italic">// {correctWordDetails.phonetic} //</Text>
              <Text fontSize="md"><Text as="span" fontWeight="bold">Nghĩa:</Text> {correctWordDetails.meaning}</Text>
              {correctWordDetails.exampleEn && (
                <HStack gap={2} cursor="pointer" onClick={() => playAudio(correctWordDetails.exampleEn)} _hover={{ color: 'green.100' }}>
                  <Volume2 size={16} /> <Text fontSize="sm"><Text as="span" fontWeight="bold">Ví dụ:</Text> {correctWordDetails.exampleEn}</Text>
                </HStack>
              )}
            </VStack>
          </HStack>
          
          <HStack gap={4}>
            <Flex as="button" w={12} h={12} borderRadius="full" border="2px solid white" align="center" justify="center" _hover={{ bg: 'whiteAlpha.300' }} onClick={() => setIsBannerPaused(!isBannerPaused)}>
              {isBannerPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
            </Flex>
            <Flex as="button" w={12} h={12} borderRadius="full" bg="white" color="red.500" align="center" justify="center" onClick={closeBanner} _hover={{ bg: 'gray.100' }}><X size={24} /></Flex>
            <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner} _hover={{ bg: 'gray.100' }}>Tiếp tục ({bannerCountDown}s)</Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

// ==========================================
// CHẾ ĐỘ 4: NGHE VIẾT
// ==========================================
const ListenGame = ({ words, onFinish }: { words: any[], onFinish: (res: any) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');

  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  
  const [results, setResults] = useState<{wordObj: any, isMatched: boolean}[]>([]);

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  useEffect(() => {
    if (currentWord && !isGameFinished && !correctWordDetails) {
      setTimeout(() => playAudio(currentWord.word), 500); 
    }
  }, [currentIndex, currentWord, isGameFinished, correctWordDetails]);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (correctWordDetails) {
        if (!isBannerPaused) {
          setBannerCountDown(prev => {
            if (prev <= 1) { closeBanner(); return 3; }
            return prev - 1;
          });
        }
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) { handleLifeLost(); return 20; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, isBannerPaused, currentWord]);

  const handleLifeLost = () => {
    setStatus('error');
    setHearts(h => {
      const newHearts = h - 1;
      if (newHearts <= 0) {
        setGameOver(true);
        setResults(prev => [...prev, { wordObj: currentWord, isMatched: false }]);
      }
      return newHearts;
    });
    setTimeout(() => setStatus('idle'), 600);
  };

  const closeBanner = () => {
    setCorrectWordDetails(null);
    setInputValue('');
    setStatus('idle');
    setTimeLeft(20);
    setCurrentIndex(c => c + 1);
  };

  const handleCheck = () => {
    if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('success');
      playTingSound(); 
      setResults(prev => [...prev, { wordObj: currentWord, isMatched: true }]);
      setCorrectWordDetails(currentWord);
      setBannerCountDown(3);
      setIsBannerPaused(false);
    } else {
      handleLifeLost(); 
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0); setInputValue(''); setStatus('idle');
    setHearts(5); setTimeLeft(20); setGameOver(false);
    setCorrectWordDetails(null); setResults([]);
  };

  const handleCompleteAndSave = () => {
    const formattedResults = results.map(r => ({ id: r.wordObj.id, isRemembered: r.isMatched }));
    onFinish(formattedResults);
  };

  if (!currentWord && !isGameFinished) return null;

  if (isGameFinished) {
    return (
      <Box w="full" maxW="950px" mx="auto">
        <Box bg="white" borderRadius="3xl" p={8} shadow="xl" borderWidth="1px" borderColor="gray.100" minH="500px">
          <VStack gap={6} align="center">
            <Text fontSize="4xl" fontWeight="black" color={gameOver ? "red.500" : "green.500"}>
              {gameOver ? "HẾT MẠNG! 💔" : "HOÀN THÀNH XUẤT SẮC! 🎉"}
            </Text>
            <Box w="full" maxW="800px" borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden" shadow="sm">
              <Grid templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" bg="gray.100" p={3} borderBottomWidth="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">#</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">TỪ VỰNG</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">PHIÊN ÂM</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">NGHĨA</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">LOẠI TỪ</Text><Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">KẾT QUẢ</Text>
              </Grid>
              <Box maxH="280px" overflowY="auto" className="custom-scrollbar">
                {results.map((r, idx) => {
                  const isMatched = r.isMatched; const w = r.wordObj;
                  return (
                    <Grid key={idx} templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" p={3} borderBottomWidth="1px" borderColor="gray.50" alignItems="center" bg={isMatched ? "green.50" : "red.50"} _hover={{ bg: isMatched ? "green.100" : "red.100" }} transition="0.2s">
                      <Text fontSize="sm" fontWeight="bold" color="gray.500">{idx + 1}</Text>
                      <HStack cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: 'blue.500' }}><Text fontWeight="black" fontSize="sm">{w.word}</Text><Volume2 size={14} /></HStack>
                      <Text fontSize="xs" color="gray.500">{w.phonetic}</Text><Text fontWeight="bold" fontSize="sm" color="gray.700">{w.meaning}</Text>
                      <Text fontSize="xs" fontWeight="bold" color={isMatched ? "green.600" : "red.600"}>{w.type}</Text>
                      <Flex justify="center">{isMatched ? <CheckCircle2 color="#16a34a" size={18} /> : <X color="#dc2626" size={18} />}</Flex>
                    </Grid>
                  );
                })}
              </Box>
            </Box>
            <HStack gap={4} mt={4}>
              <Button bg="gray.100" color="gray.600" borderRadius="full" h="14" px={10} fontWeight="bold" fontSize="lg" _hover={{ bg: 'gray.200' }} onClick={handleRestart}>
                CHƠI TIẾP
              </Button>
              <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={12} fontWeight="black" fontSize="lg" borderBottomWidth="4px" borderColor="#46a302" _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCompleteAndSave}>
                HOÀN TẤT & LƯU
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="full" maxW="750px" mx="auto" position="relative">
      <Center bg="white" borderRadius="3xl" p={12} pt={8} shadow="xl" borderWidth="1px" borderColor="gray.50" flexDirection="column" pos="relative" h="65vh" minH="450px">
        <Flex w="full" justify="space-between" mb={6} shrink={0}>
          <HStack gap={1}>
            {[1, 2, 3, 4, 5].map(i => (
              <Heart key={i} size={28} fill={i <= hearts ? "#ff4d4d" : "transparent"} color={i <= hearts ? "#ff4d4d" : "#e2e8f0"} style={{ transition: 'all 0.3s' }} />
            ))}
          </HStack>
          <Flex bg={timeLeft <= 5 ? "red.100" : "#dcfce7"} color={timeLeft <= 5 ? "red.600" : "#16a34a"} px={4} py={1.5} borderRadius="full" fontWeight="black" align="center" gap={2} transition="all 0.3s" animation={timeLeft <= 5 && !correctWordDetails ? `${shakeAnimation} 0.5s ease-in-out infinite` : 'none'}>
            <Clock size={18} /> {timeLeft}S
          </Flex>
        </Flex>

        <Box pos="relative" mb={8}>
          <Flex 
            as="button" w="120px" h="120px" bg="#1cb0f6" borderRadius="full" align="center" justify="center" 
            shadow="lg" _hover={{ transform: 'scale(1.05)' }} transition="0.2s" borderBottomWidth="4px" borderColor="#1899d6"
            onClick={() => playAudio(currentWord.word)}
            _active={{ transform: 'translateY(2px)', borderBottomWidth: "0px" }}
          >
            <Headphones size={60} color="white" strokeWidth={2.5} />
          </Flex>
        </Box>

        <Text fontSize="2xl" fontWeight="black" color="gray.800" mb={2}>Nghe và gõ từ tiếng Anh</Text>
        <Box bg="purple.50" color="purple.600" px={4} py={1} borderRadius="md" fontWeight="black" fontSize="xs" mb={8}>{currentWord.type}</Box>
        
        <Input 
          placeholder="Nhập từ bạn nghe được..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          borderRadius="2xl" bg="gray.50" border="3px solid" borderColor={status === 'error' ? 'red.400' : status === 'success' ? 'green.400' : 'gray.200'} 
          animation={status === 'error' ? `${shakeAnimation} 0.4s` : status === 'success' ? `${successPulse} 0.5s` : 'none'}
          h="20" w="full" maxW="600px" textAlign="center" fontSize="3xl" fontWeight="black" mb={10} color={status === 'error' ? 'red.600' : status === 'success' ? 'green.600' : 'gray.800'}
          _focus={{ bg: "white", borderColor: status === 'idle' ? 'blue.400' : undefined, shadow: 'xl', transform: 'translateY(-2px)' }}
          _hover={{ bg: "white", borderColor: 'gray.300' }} transition="all 0.2s" disabled={!!correctWordDetails}
        />

        <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={16} fontWeight="black" borderBottomWidth="4px" borderColor="#46a302" _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCheck} disabled={!!correctWordDetails}>
          KIỂM TRA
        </Button>
      </Center>

      {/* BOTTOM BANNER KHI GÕ ĐÚNG TỪ */}
      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)`} shadow="2xl">
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)} _hover={{ transform: 'scale(1.05)' }} transition="0.2s"><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1}>
              <Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text> <Text as="span" fontSize="sm">({correctWordDetails.type?.toLowerCase()})</Text></Text>
              <Text fontSize="md" fontStyle="italic">// {correctWordDetails.phonetic} //</Text>
              <Text fontSize="md"><Text as="span" fontWeight="bold">Nghĩa:</Text> {correctWordDetails.meaning}</Text>
              {correctWordDetails.exampleEn && (
                <HStack gap={2} cursor="pointer" onClick={() => playAudio(correctWordDetails.exampleEn)} _hover={{ color: 'green.100' }}>
                  <Volume2 size={16} /> <Text fontSize="sm"><Text as="span" fontWeight="bold">Ví dụ:</Text> {correctWordDetails.exampleEn}</Text>
                </HStack>
              )}
            </VStack>
          </HStack>
          
          <HStack gap={4}>
            <Flex as="button" w={12} h={12} borderRadius="full" border="2px solid white" align="center" justify="center" _hover={{ bg: 'whiteAlpha.300' }} onClick={() => setIsBannerPaused(!isBannerPaused)}>
              {isBannerPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
            </Flex>
            <Flex as="button" w={12} h={12} borderRadius="full" bg="white" color="red.500" align="center" justify="center" onClick={closeBanner} _hover={{ bg: 'gray.100' }}><X size={24} /></Flex>
            <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner} _hover={{ bg: 'gray.100' }}>Tiếp tục ({bannerCountDown}s)</Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

// ==========================================
// CHẾ ĐỘ 5: TRẮC NGHIỆM (QUIZ) - ĐÃ LÀM ĐẸP UI
// ==========================================
const QuizGame = ({ words, onFinish }: { words: any[], onFinish: (res: any) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  
  const [correctWordDetails, setCorrectWordDetails] = useState<any | null>(null);
  const [bannerCountDown, setBannerCountDown] = useState(3);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  
  const [results, setResults] = useState<{wordObj: any, isMatched: boolean}[]>([]);

  const currentWord = words[currentIndex];
  const isGameFinished = gameOver || (currentIndex >= words.length && !correctWordDetails);

  // Sinh 4 đáp án
  useEffect(() => {
    if (currentWord && !isGameFinished && !correctWordDetails) {
      setTimeout(() => playAudio(currentWord.word), 500); 
      
      const correctMeaning = currentWord.meaning;
      const otherMeanings = words.filter(w => w.id !== currentWord.id).map(w => w.meaning);
      const shuffledOther = otherMeanings.sort(() => Math.random() - 0.5);
      
      let distractors = shuffledOther.slice(0, 3);
      let fallbackIndex = 1;
      while (distractors.length < 3) {
        distractors.push(`Đáp án gây nhiễu ${fallbackIndex++}`);
      }

      const finalOptions = [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);
      setOptions(finalOptions);
      setSelectedOption(null);
    }
  }, [currentIndex, currentWord, isGameFinished, correctWordDetails, words]);

  useEffect(() => {
    if (isGameFinished || !currentWord) return;
    const timer = setInterval(() => {
      if (correctWordDetails) {
        if (!isBannerPaused) {
          setBannerCountDown(prev => {
            if (prev <= 1) { closeBanner(); return 3; }
            return prev - 1;
          });
        }
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) { handleLifeLost(); return 20; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameFinished, correctWordDetails, isBannerPaused, currentWord]);

  const handleLifeLost = () => {
    setHearts(h => {
      const newHearts = h - 1;
      if (newHearts <= 0) {
        setGameOver(true);
        setResults(prev => [...prev, { wordObj: currentWord, isMatched: false }]);
      }
      return newHearts;
    });
  };

  const closeBanner = () => {
    setCorrectWordDetails(null);
    setSelectedOption(null);
    setTimeLeft(20);
    setCurrentIndex(c => c + 1);
  };

  const handleSelectOption = (opt: string) => {
    if (correctWordDetails || selectedOption) return; 
    setSelectedOption(opt);

    if (opt === currentWord.meaning) {
      playTingSound(); 
      setResults(prev => [...prev, { wordObj: currentWord, isMatched: true }]);
      setCorrectWordDetails(currentWord);
      setBannerCountDown(3);
      setIsBannerPaused(false);
    } else {
      handleLifeLost();
      setTimeout(() => {
        if (!gameOver) {
          setTimeLeft(20);
          setCurrentIndex(c => c + 1);
          setResults(prev => [...prev, { wordObj: currentWord, isMatched: false }]);
        }
      }, 1000); 
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0); setHearts(5); setTimeLeft(20); setGameOver(false);
    setCorrectWordDetails(null); setResults([]); setSelectedOption(null);
  };

  const handleCompleteAndSave = () => {
    const formattedResults = results.map(r => ({ id: r.wordObj.id, isRemembered: r.isMatched }));
    onFinish(formattedResults);
  };

  if (!currentWord && !isGameFinished) return null;

  if (isGameFinished) {
    return (
      <Box w="full" maxW="950px" mx="auto">
        <Box bg="white" borderRadius="3xl" p={8} shadow="xl" borderWidth="1px" borderColor="gray.100" minH="500px">
          <VStack gap={6} align="center">
            <Text fontSize="4xl" fontWeight="black" color={gameOver ? "red.500" : "green.500"}>
              {gameOver ? "HẾT MẠNG! 💔" : "HOÀN THÀNH XUẤT SẮC! 🎉"}
            </Text>
            <Box w="full" maxW="800px" borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden" shadow="sm">
              <Grid templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" bg="gray.100" p={3} borderBottomWidth="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">#</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">TỪ VỰNG</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">PHIÊN ÂM</Text><Text fontSize="xs" fontWeight="bold" color="gray.500">NGHĨA</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">LOẠI TỪ</Text><Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">KẾT QUẢ</Text>
              </Grid>
              <Box maxH="280px" overflowY="auto" className="custom-scrollbar">
                {results.map((r, idx) => {
                  const isMatched = r.isMatched; const w = r.wordObj;
                  return (
                    <Grid key={idx} templateColumns="40px 1.5fr 1fr 1.5fr 1fr 1fr" p={3} borderBottomWidth="1px" borderColor="gray.50" alignItems="center" bg={isMatched ? "green.50" : "red.50"} _hover={{ bg: isMatched ? "green.100" : "red.100" }} transition="0.2s">
                      <Text fontSize="sm" fontWeight="bold" color="gray.500">{idx + 1}</Text>
                      <HStack cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: 'blue.500' }}><Text fontWeight="black" fontSize="sm">{w.word}</Text><Volume2 size={14} /></HStack>
                      <Text fontSize="xs" color="gray.500">{w.phonetic}</Text><Text fontWeight="bold" fontSize="sm" color="gray.700">{w.meaning}</Text>
                      <Text fontSize="xs" fontWeight="bold" color={isMatched ? "green.600" : "red.600"}>{w.type}</Text>
                      <Flex justify="center">{isMatched ? <CheckCircle2 color="#16a34a" size={18} /> : <X color="#dc2626" size={18} />}</Flex>
                    </Grid>
                  );
                })}
              </Box>
            </Box>
            <HStack gap={4} mt={4}>
              <Button bg="gray.100" color="gray.600" borderRadius="full" h="14" px={10} fontWeight="bold" fontSize="lg" _hover={{ bg: 'gray.200' }} onClick={handleRestart}>
                CHƠI TIẾP
              </Button>
              <Button bg="#58cc02" color="white" borderRadius="full" h="14" px={12} fontWeight="black" fontSize="lg" borderBottomWidth="4px" borderColor="#46a302" _hover={{ bg: '#46a302' }} _active={{ transform: 'translateY(2px)', borderBottomWidth: '2px' }} onClick={handleCompleteAndSave}>
                HOÀN TẤT & LƯU
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  // ĐÃ LÀM LẠI UI PHẦN CHƠI TRẮC NGHIỆM ĐẸP NHƯ APP HỌC TẬP
  return (
    <Box w="full" maxW="850px" mx="auto" position="relative">
      <Center bg="white" borderRadius="3xl" p={{ base: 6, md: 10 }} pt={8} shadow="xl" borderWidth="2px" borderColor="gray.100" flexDirection="column" pos="relative" minH="550px">
        
        {/* THANH TRẠNG THÁI */}
        <Flex w="full" justify="space-between" mb={8} shrink={0}>
          <HStack gap={1}>
            {[1, 2, 3, 4, 5].map(i => (
              <Heart key={i} size={28} fill={i <= hearts ? "#ff4d4d" : "transparent"} color={i <= hearts ? "#ff4d4d" : "#e2e8f0"} style={{ transition: 'all 0.3s' }} />
            ))}
          </HStack>
          <Flex bg={timeLeft <= 5 ? "red.100" : "#dcfce7"} color={timeLeft <= 5 ? "red.600" : "#16a34a"} px={4} py={1.5} borderRadius="full" fontWeight="black" align="center" gap={2} transition="all 0.3s" animation={timeLeft <= 5 && !correctWordDetails ? `${shakeAnimation} 0.5s ease-in-out infinite` : 'none'}>
            <Clock size={18} /> {timeLeft}S
          </Flex>
        </Flex>

        {/* CÂU HỎI LỚN */}
        <VStack mb={12} gap={2}>
          <Text fontSize="sm" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="widest">
            Chọn nghĩa đúng nhất
          </Text>
          <Text fontSize={{ base: "5xl", md: "6xl" }} fontWeight="black" color="gray.800" textAlign="center" lineHeight="tight">
            {currentWord.word}
          </Text>
          <HStack gap={3} mt={2}>
            <Flex as="button" bg="blue.50" color="blue.500" w={10} h={10} borderRadius="full" align="center" justify="center" _hover={{ bg: 'blue.100', transform: 'scale(1.05)' }} transition="0.2s" onClick={() => playAudio(currentWord.word)}>
              <Volume2 size={20} />
            </Flex>
            <Badge colorScheme="purple" px={3} py={1.5} borderRadius="xl" fontSize="xs" fontWeight="bold">{currentWord.type}</Badge>
            <Text fontSize="md" fontWeight="bold" color="gray.500" fontStyle="italic">{currentWord.phonetic}</Text>
          </HStack>
        </VStack>
        
        {/* LƯỚI ĐÁP ÁN 3D */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full" maxW="750px">
          {options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentWord.meaning;
            const hasAnswered = selectedOption !== null;
            
            // Xử lý logic màu sắc
            let bg = "white";
            let borderColor = "gray.200";
            let bottomBorderWidth = "4px";
            let textColor = "gray.700";
            let numBg = "gray.100";
            let numColor = "gray.500";
            let animation = "none";
            let opacity = 1;

            if (hasAnswered) {
              if (isSelected && isCorrect) {
                bg = "green.100"; borderColor = "green.500"; textColor = "green.700"; numBg = "white"; numColor = "green.600"; bottomBorderWidth = "2px";
              } else if (isSelected && !isCorrect) {
                bg = "red.50"; borderColor = "red.500"; textColor = "red.600"; numBg = "white"; numColor = "red.500"; bottomBorderWidth = "2px";
                animation = `${shakeAnimation} 0.4s`;
              } else if (!isSelected && isCorrect) {
                // Highlight đáp án đúng khi lỡ chọn sai
                bg = "green.50"; borderColor = "green.300"; textColor = "green.600"; numBg = "white"; numColor = "green.500";
              } else {
                 opacity = 0.4;
              }
            }

            return (
              <Flex 
                key={i} as="button" align="center" px={5} py={4} minH="70px" borderRadius="2xl" 
                bg={bg} borderColor={borderColor} borderWidth="2px" borderBottomWidth={bottomBorderWidth} 
                color={textColor} animation={animation} opacity={opacity}
                pointerEvents={hasAnswered ? "none" : "auto"}
                _hover={!hasAnswered ? { bg: 'blue.50', borderColor: 'blue.200', color: 'blue.700' } : {}}
                _active={!hasAnswered ? { transform: 'translateY(2px)', borderBottomWidth: '2px' } : {}}
                onClick={() => handleSelectOption(opt)}
                transition="all 0.2s" gap={4}
              >
                <Flex w={8} h={8} borderRadius="full" bg={numBg} color={numColor} align="center" justify="center" fontWeight="black" fontSize="sm" flexShrink={0}>
                  {i + 1}
                </Flex>
                <Text fontWeight="bold" fontSize="lg" textAlign="left" lineHeight="tight">
                  {opt}
                </Text>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Center>

      {/* BOTTOM BANNER KHI TRẢ LỜI ĐÚNG */}
      {correctWordDetails && (
        <Flex position="fixed" bottom={0} left={0} w="full" bg="#22c55e" color="white" zIndex={10000} p={5} px={{ base: 6, md: 20 }} justify="space-between" align="center" animation={`${slideUp} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)`} shadow="2xl">
          <HStack gap={6}>
            <Flex as="button" w={16} h={16} bg="white" color="green.500" borderRadius="full" align="center" justify="center" onClick={() => playAudio(correctWordDetails.word)} _hover={{ transform: 'scale(1.05)' }} transition="0.2s"><Volume2 size={32} /></Flex>
            <VStack align="start" gap={1}>
              <Text fontSize="lg">Từ: <Text as="span" fontWeight="black" fontSize="2xl">{correctWordDetails.word}</Text> <Text as="span" fontSize="sm">({correctWordDetails.type?.toLowerCase()})</Text></Text>
              <Text fontSize="md" fontStyle="italic">// {correctWordDetails.phonetic} //</Text>
              <Text fontSize="md"><Text as="span" fontWeight="bold">Nghĩa:</Text> {correctWordDetails.meaning}</Text>
              {correctWordDetails.exampleEn && (
                <HStack gap={2} cursor="pointer" onClick={() => playAudio(correctWordDetails.exampleEn)} _hover={{ color: 'green.100' }}>
                  <Volume2 size={16} /> <Text fontSize="sm"><Text as="span" fontWeight="bold">Ví dụ:</Text> {correctWordDetails.exampleEn}</Text>
                </HStack>
              )}
            </VStack>
          </HStack>
          
          <HStack gap={4}>
            <Flex as="button" w={12} h={12} borderRadius="full" border="2px solid white" align="center" justify="center" _hover={{ bg: 'whiteAlpha.300' }} onClick={() => setIsBannerPaused(!isBannerPaused)}>
              {isBannerPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
            </Flex>
            <Flex as="button" w={12} h={12} borderRadius="full" bg="white" color="red.500" align="center" justify="center" onClick={closeBanner} _hover={{ bg: 'gray.100' }}><X size={24} /></Flex>
            <Button bg="white" color="green.600" borderRadius="full" h={12} px={8} fontWeight="black" onClick={closeBanner} _hover={{ bg: 'gray.100' }}>Tiếp tục ({bannerCountDown}s)</Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

// ==========================================
// COMPONENT CHÍNH: GAME PAGE VÀ MODAL SRS
// ==========================================
export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [customPlayWords, setCustomPlayWords] = useState<any[] | null>(null); 
  const [isSrsModalOpen, setIsSrsModalOpen] = useState(false);

  const { words, toggleLearned } = useVocabWords();
  const { sets, isLoading } = useVocabSets();

  const [selectedSetId, setSelectedSetId] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Chưa thuộc');
  const [selectedOrder, setSelectedOrder] = useState('Ngẫu nhiên');
  const [selectedQuantity, setSelectedQuantity] = useState(20);

  useEffect(() => {
    const setIdFromUrl = searchParams.get('setId') || '';
    setSelectedSetId(setIdFromUrl);
  }, [searchParams]);

  const filteredGameWords = useMemo(() => {
    let list = [...words];

    if (selectedFilter === 'Chưa thuộc') list = list.filter(w => !w.isLearned);
    else if (selectedFilter === 'Đã thuộc') list = list.filter(w => w.isLearned);

    if (selectedOrder === 'A → Z') {
      list.sort((a, b) => a.word.localeCompare(b.word));
    } else if (selectedOrder === 'Z → A') {
      list.sort((a, b) => b.word.localeCompare(a.word));
    } else {
      list.sort(() => Math.random() - 0.5);
    }

    return list.slice(0, selectedQuantity);
  }, [words, selectedFilter, selectedOrder, selectedQuantity]);

  const selectedSetLabel = selectedSetId ? (sets.find(s => String(s.id) === selectedSetId)?.title || 'Bộ từ đã chọn') : 'Tất cả bộ từ';

  const handleSelectSet = (setId: string) => {
    setSelectedSetId(setId);
    setCustomPlayWords(null);
    if (setId) router.replace(`/game?setId=${setId}`);
    else router.replace('/game');
  };

  // Load SRS Session từ URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'srs') {
      const sessionData = localStorage.getItem('srs_review_session');
      if (sessionData) {
        setCustomPlayWords(JSON.parse(sessionData));
        setActiveGame('flashcard');
        localStorage.removeItem('srs_review_session');
        router.replace('/game'); // Clean URL
      } else {
        setIsSrsModalOpen(true);
      }
    }
  }, [searchParams, router]);

  // LOGIC SRS: LƯU TRỮ VÀ TÍNH TOÁN NGẮT QUÃNG
  const [srsProgressData, setSrsProgressData] = useState<Record<string, { level: number, nextReview: number }>>({});
  
  useEffect(() => {
    const stored = localStorage.getItem('srs_progress_data');
    if (stored) setSrsProgressData(JSON.parse(stored));
  }, []);

  const handleUpdateSrs = (wordId: string, isRemembered: boolean) => {
    setSrsProgressData(prev => {
      const current = prev[wordId] || { level: 0, nextReview: 0 };
      let newLevel = isRemembered ? Math.min(current.level + 1, 5) : Math.max(current.level - 1, 1);
      if (!isRemembered && current.level === 0) newLevel = 1; 

      const intervals = [0, 1, 3, 7, 14, 30]; 
      const nextReview = Date.now() + (intervals[newLevel] * 24 * 60 * 60 * 1000);

      const updated = { ...prev, [wordId]: { level: newLevel, nextReview } };
      localStorage.setItem('srs_progress_data', JSON.stringify(updated));
      return updated;
    });
  };

  const srsDataList = useMemo(() => {
    const now = Date.now();
    return words.map(w => {
      const srs = srsProgressData[w.id] || { level: 0, nextReview: 0 };
      let status = 'TỪ MỚI';
      let reviewDateStr = '--';

      if (srs.level > 0) {
        if (srs.nextReview <= now) {
          status = 'ĐẾN HẠN';
          reviewDateStr = 'Hôm nay';
        } else {
          status = 'ĐÃ ÔN';
          const d = new Date(srs.nextReview);
          reviewDateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        }
      }
      return { ...w, level: srs.level, status, reviewDate: reviewDateStr };
    });
  }, [words, srsProgressData]);

  const unlearnedWords = useMemo(() => words.filter(w => !w.isLearned), [words]);
  const playWords = customPlayWords || filteredGameWords;

  const srsLevelCounts = [0, 1, 2, 3, 4, 5].map(lvl => srsDataList.filter(w => w.level === lvl).length);
  const maxSrsCount = Math.max(...srsLevelCounts, 1);
  const levelColors = ["#94a3b8", "#f97316", "#eab308", "#38bdf8", "#c084fc", "#22c55e"];

  const [srsSearchTerm, setSrsSearchTerm] = useState('');
  const [srsSetFilter, setSrsSetFilter] = useState('');
  const [srsLevelFilter, setSrsLevelFilter] = useState('');
  const [reviewLimit, setReviewLimit] = useState(20);
  const [reviewSort, setReviewSort] = useState('due_first'); 

  const filteredSrsList = useMemo(() => {
    return srsDataList.filter(w => {
      const matchSearch = w.word.toLowerCase().includes(srsSearchTerm.toLowerCase()) || w.meaning.toLowerCase().includes(srsSearchTerm.toLowerCase());
      const matchSet = srsSetFilter ? String(w.setId) === String(srsSetFilter) : true;
      const matchLevel = srsLevelFilter ? String(w.level) === String(srsLevelFilter) : true;
      return matchSearch && matchSet && matchLevel;
    });
  }, [srsDataList, srsSearchTerm, srsSetFilter, srsLevelFilter]);

  const handleFinishGame = (gameResults?: { id: string, isRemembered: boolean }[]) => {
    if (gameResults) {
      gameResults.forEach(r => handleUpdateSrs(r.id, r.isRemembered));
    }
    alert("Tuyệt vời! Bạn đã hoàn thành bài luyện tập!");
    setActiveGame(null);
    setCustomPlayWords(null); 
    if (searchParams.get('mode') === 'srs') router.replace('/game');
  };

  const handleStartSrsReview = () => {
    if (filteredSrsList.length === 0) return alert("Không có từ nào để ôn tập với bộ lọc hiện tại!");
    let listToReview = [...filteredSrsList];

    if (reviewSort === 'due_first') {
      const statusPriority: Record<string, number> = { 'ĐẾN HẠN': 1, 'TỪ MỚI': 2, 'ĐÃ ÔN': 3 };
      listToReview.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
    } else if (reviewSort === 'random') {
      listToReview.sort(() => Math.random() - 0.5);
    } else if (reviewSort === 'new_first') {
      const statusPriority: Record<string, number> = { 'TỪ MỚI': 1, 'ĐẾN HẠN': 2, 'ĐÃ ÔN': 3 };
      listToReview.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
    }

    const wordsToReview = listToReview.slice(0, Number(reviewLimit) || 20);
    setCustomPlayWords(wordsToReview);
    setIsSrsModalOpen(false);
    setActiveGame('flashcard'); 
  };

  if (activeGame) {
    if (playWords.length === 0) {
      return (
        <Flex w="100vw" h="100vh" align="center" justify="center" bg="#f8f9fa" direction="column" gap={4} pos="fixed" top={0} left={0} zIndex={9999}>
          <Text fontWeight="bold" fontSize="xl">Chưa có từ vựng nào trong kho!</Text>
          <Button onClick={() => setActiveGame(null)} colorScheme="blue" borderRadius="full">Quay lại</Button>
        </Flex>
      );
    }
    const progressPercentage = Math.round(15 + (85 / playWords.length) * 0);
    return (
      <Box position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} bg="#f8f9fa" display="flex" flexDirection="column" overflow="hidden">
        <Box w="full" maxW="1000px" mx="auto" p={6} pb={0}>
          <GameHeader title={customPlayWords ? `Ôn tập SRS (${playWords.length} từ)` : `Đang học ${playWords.length} từ`} progress={progressPercentage} onExit={() => { setActiveGame(null); setCustomPlayWords(null); }} />
        </Box>
        <Flex flex={1} justify="center" align="center" px={4} pb={10} w="full">
          {activeGame === 'flashcard' && <FlashcardGame words={playWords} onMarkLearned={(id) => toggleLearned(id, false)} onUpdateSrs={handleUpdateSrs} onFinish={handleFinishGame} />}
          {activeGame === 'match' && <MatchGame words={playWords} onFinish={handleFinishGame} />}
          {activeGame === 'typing' && <TypingGame words={playWords} onFinish={handleFinishGame} />}
          {activeGame === 'listen' && <ListenGame words={playWords} onFinish={handleFinishGame} />}
          {activeGame === 'quiz' && <QuizGame words={playWords} onFinish={handleFinishGame} />}
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto" minH="full" bg="#f8f9fa">
      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={8}>
        <Flex bg="white" borderWidth="2px" borderColor="gray.800" borderRadius="20px" p={4} direction="column" justify="space-between" transition="0.2s">
          <Text fontSize="11px" color="gray.500" fontWeight="bold" textTransform="uppercase">Bộ từ vựng</Text>
          <select
            style={{ width: '100%', padding: '10px 12px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
            value={selectedSetId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectSet(e.target.value)}
          >
            <option value="">Tất cả bộ từ</option>
            {sets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Flex>

        <Flex bg="white" borderWidth="2px" borderColor="gray.800" borderRadius="20px" p={4} direction="column" justify="space-between" transition="0.2s">
          <Text fontSize="11px" color="gray.500" fontWeight="bold" textTransform="uppercase">Bộ lọc</Text>
          <select
            style={{ width: '100%', padding: '10px 12px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
            value={selectedFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFilter(e.target.value)}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Chưa thuộc">Chưa thuộc</option>
            <option value="Đã thuộc">Đã thuộc</option>
          </select>
        </Flex>

        <Flex bg="white" borderWidth="2px" borderColor="gray.800" borderRadius="20px" p={4} direction="column" justify="space-between" transition="0.2s">
          <Text fontSize="11px" color="gray.500" fontWeight="bold" textTransform="uppercase">Thứ tự</Text>
          <select
            style={{ width: '100%', padding: '10px 12px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
            value={selectedOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOrder(e.target.value)}
          >
            <option value="Ngẫu nhiên">Ngẫu nhiên</option>
            <option value="A → Z">A → Z</option>
            <option value="Z → A">Z → A</option>
          </select>
        </Flex>

        <Flex bg="white" borderWidth="2px" borderColor="gray.800" borderRadius="20px" p={4} direction="column" justify="space-between" transition="0.2s">
          <Text fontSize="11px" color="gray.500" fontWeight="bold" textTransform="uppercase">Số lượng</Text>
          <select
            style={{ width: '100%', padding: '10px 12px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
            value={String(selectedQuantity)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedQuantity(Number(e.target.value))}
          >
            <option value="10">10 từ</option>
            <option value="20">20 từ</option>
            <option value="30">30 từ</option>
            <option value="50">50 từ</option>
          </select>
        </Flex>
      </SimpleGrid>

      <Flex align="center" justify="space-between" mb={6}>
        <HStack gap={2}>
          <Text fontSize="15px" fontWeight="bold" color="gray.800">Chọn game:</Text>
          <Settings size={20} color="cyan.400" cursor="pointer" />
        </HStack>
        <HStack gap={3}>
          <Flex bg="#dcfce7" color="#16a34a" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="black" letterSpacing="wider" shadow="sm" borderWidth="1px" borderColor="green.200">
            {filteredGameWords.length} TỪ SẴN SÀNG
          </Flex>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">{selectedSetLabel}</Text>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={4} mb={10}>
        {gameModes.map((game, idx) => {
          const Icon = game.icon;
          const gameId = idx === gameModes.length - 1 && game.id !== 'mixed' ? 'mixed' : game.id; 
          const gameTitle = idx === gameModes.length - 1 && game.id !== 'mixed' ? 'Tổng Hợp' : game.title;
          
          return (
            <Flex key={idx} onClick={() => setActiveGame(gameId)} className="game-card" bg={game.bg} boxShadow={game.glow || 'md'} borderRadius="3xl" p={5} color="white" direction="column" align="center" textAlign="center" cursor="pointer" _hover={{ transform: 'translateY(-4px)' }} transition="0.3s" h="200px" justify="space-between" pos="relative" overflow="hidden">
              <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" bg="whiteAlpha.200" borderRadius="full" />
              {game.isHot && <Flex pos="absolute" top="10px" right="10px" background="linear-gradient(to right, #ff4d4d, #f97316)" color="white" fontSize="10px" fontWeight="black" px={2.5} py={1} borderRadius="full" borderWidth="2px" borderColor="whiteAlpha.800" gap={1}>HOT <Flame size={12} fill="#ecc94b" color="#ecc94b" /></Flex>}
              <Flex className="game-icon-wrapper" w={14} h={14} bg="whiteAlpha.200" borderRadius="2xl" align="center" justify="center" mt={1} transition="0.4s"><Icon size={28} strokeWidth={2.5} /></Flex>
              <Box><Text fontWeight="bold" fontSize="15px" mb={1}>{gameTitle}</Text><Text fontSize="11px" color="whiteAlpha.900" lineClamp={2}>{game.desc}</Text></Box>
              <Flex mt="auto" bg="whiteAlpha.200" px={3.5} py={1.5} borderRadius="full" fontSize="11px" fontWeight="bold" align="center" gap={1.5}>+{game.coin} <Box w={3.5} h={3.5} bg="yellow.400" borderRadius="full" color="white" textAlign="center" fontSize="8px">$</Box></Flex>
            </Flex>
          )
        })}
      </SimpleGrid>

      {/* BANNER ÔN TẬP SRS */}
      <Flex background="linear-gradient(to right, #fc6cce, #c653e5, #9c43f3)" borderRadius="3xl" p={8} justify="space-between" align="center" color="white" mb={8} _hover={{ transform: 'translateY(-4px)' }} transition="0.3s" shadow="lg" position="relative" overflow="hidden">
        <Box position="absolute" top="-30px" right="-10px" w="180px" h="180px" bg="whiteAlpha.200" borderRadius="full" />
        <Box px={2} zIndex={1}>
          <HStack fontSize="xl" fontWeight="black" mb={1.5}><RefreshCw size={24} strokeWidth={2.5} /><Text>Ôn tập ngắt quãng (SRS)</Text></HStack>
          <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.900">Hệ thống tự động nhắc lại các từ vựng bạn sắp quên. Học ít, nhớ lâu!</Text>
        </Box>
        <Button bg="white" color="#d22b79" px={8} py={6} borderRadius="2xl" fontWeight="black" gap={2.5} zIndex={1} shadow="md" onClick={() => setIsSrsModalOpen(true)}>
          <Play size={20} fill="#d22b79" /> Bắt đầu ôn tập
        </Button>
      </Flex>

      {/* MODAL TỔNG QUAN SRS */}
      {isSrsModalOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={10000} align="center" justify="center" p={4} bg="blackAlpha.600" backdropFilter="blur(3px)" onClick={() => setIsSrsModalOpen(false)}>
          <Flex direction="column" bg="white" borderRadius="3xl" w="full" maxW="1000px" maxH="95vh" onClick={(e) => e.stopPropagation()} shadow="2xl" overflow="hidden">
            <Flex justify="space-between" align="center" p={5} px={8} borderBottomWidth="1px" borderColor="gray.100">
              <HStack gap={3}>
                <RefreshCw size={22} color="#ec4899" strokeWidth={2.5} />
                <Text fontWeight="black" fontSize="xl" color="gray.800">Tổng quan SRS</Text>
              </HStack>
              <X size={24} color="gray" cursor="pointer" onClick={() => setIsSrsModalOpen(false)} />
            </Flex>

            <Box p={8} overflowY="auto" flex={1}>
              <Box borderWidth="1.5px" borderColor="gray.200" borderRadius="2xl" p={6} mb={8} shadow="sm">
                <Text fontSize="sm" fontWeight="black" color="gray.500" mb={6} textTransform="uppercase" letterSpacing="wider">PHÂN BỐ TỪ VỰNG THEO CẤP ĐỘ</Text>
                <Flex justify="space-around" align="flex-end" h="100px" px={{ base: 2, md: 10 }}>
                  {[0, 1, 2, 3, 4, 5].map(lvl => {
                    const count = srsLevelCounts[lvl];
                    const barHeight = maxSrsCount > 0 ? (count / maxSrsCount) * 80 : 0;
                    return (
                      <VStack key={lvl} gap={2} justify="flex-end" h="full">
                        <Text fontSize="xs" fontWeight="bold" color="gray.600">{count}</Text>
                        <Box w="30px" h={`${Math.max(barHeight, 4)}px`} bg={levelColors[lvl]} borderRadius="md" transition="all 0.5s ease-out" />
                        <Text fontSize="xs" fontWeight="black" color="gray.500">Lvl {lvl}</Text>
                      </VStack>
                    )
                  })}
                </Flex>
              </Box>

              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="black" fontSize="lg" color="gray.800">Danh sách từ đang học ({filteredSrsList.length})</Text>
                <HStack gap={3}>
                  <Input 
                    placeholder="Tìm từ..." value={srsSearchTerm} onChange={(e) => setSrsSearchTerm(e.target.value)}
                    size="sm" borderRadius="full" w="180px" borderWidth="1.5px" borderColor="gray.200" _focus={{ borderColor: 'blue.400', shadow: 'none' }}
                  />
                  <select style={{ outline: "none", padding: "6px 12px", fontSize: "14px", borderRadius: "9999px", width: "150px", fontWeight: "500", borderWidth: "1.5px", borderColor: "#e5e7eb" }} value={srsSetFilter} onChange={(e: any) => setSrsSetFilter(e.target.value)}>
                    <option value="">Tất cả bộ từ</option>
                    {sets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                  <select style={{ outline: "none", padding: "6px 12px", fontSize: "14px", borderRadius: "9999px", width: "130px", fontWeight: "500", borderWidth: "1.5px", borderColor: "#e5e7eb" }} value={srsLevelFilter} onChange={(e: any) => setSrsLevelFilter(e.target.value)}>
                    <option value="">Tất cả level</option>
                    {[0,1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>Level {lvl}</option>)}
                  </select>
                </HStack>
              </Flex>

              <Box borderWidth="1.5px" borderColor="gray.200" borderRadius="xl" overflow="hidden" shadow="sm">
                <Grid templateColumns="1.5fr 2fr 1fr 1fr" bg="gray.50" p={3} px={6} borderBottomWidth="1.5px" borderColor="gray.200">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">TỪ VỰNG</Text>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">NGHĨA</Text>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">MỨC ĐỘ</Text>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" textAlign="center">ÔN TẬP</Text>
                </Grid>
                <Box maxH="220px" overflowY="auto" className="custom-scrollbar">
                  {filteredSrsList.map((w, idx) => (
                    <Grid key={idx} templateColumns="1.5fr 2fr 1fr 1fr" p={3} px={6} borderBottomWidth="1px" borderColor="gray.100" alignItems="center" _hover={{ bg: 'blue.50' }} transition="0.2s">
                      <HStack cursor="pointer" onClick={() => playAudio(w.word)} _hover={{ color: 'blue.500' }}>
                        <Text fontWeight="black" fontSize="sm">{w.word}</Text>
                        <Volume2 size={14} />
                      </HStack>
                      <Text fontWeight="medium" fontSize="sm" color="gray.700" lineClamp={1}>{w.meaning}</Text>
                      <select style={{ outline: "none", fontSize: "12px", padding: "4px", width: "70px", borderRadius: "6px", fontWeight: "bold", color: levelColors[w.level], borderColor: levelColors[w.level] }} value={w.level} onChange={() => {}}>
                        <option value={w.level}>Lv {w.level}</option>
                      </select>
                      <Flex justify="center">
                        <Badge px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="black" bg={w.status === 'TỪ MỚI' ? 'gray.100' : w.status === 'ĐẾN HẠN' ? 'green.100' : 'blue.100'} color={w.status === 'TỪ MỚI' ? 'gray.600' : w.status === 'ĐẾN HẠN' ? 'green.600' : 'blue.600'}>
                          {w.status === 'ĐÃ ÔN' ? w.reviewDate : w.status}
                        </Badge>
                      </Flex>
                    </Grid>
                  ))}
                  {filteredSrsList.length === 0 && (
                    <Center p={8} color="gray.400"><Text fontWeight="bold">Không có từ vựng nào phù hợp</Text></Center>
                  )}
                </Box>
              </Box>
            </Box>

            <Flex bg="gray.50" p={5} px={8} borderTopWidth="1px" borderColor="gray.200" justify="space-between" align="center">
              <VStack align="start" gap={3}>
                <HStack gap={3}>
                  <Badge px={3} py={1.5} borderRadius="md" bg="green.100" color="green.700" fontSize="xs" fontWeight="bold" display="flex" alignItems="center" gap={1.5}>
                    <CheckCircle2 size={14} /> HẾT TỪ ĐẾN HẠN
                  </Badge>
                  <Badge px={3} py={1.5} borderRadius="md" bg="blue.50" color="blue.600" fontSize="xs" fontWeight="bold" display="flex" alignItems="center" gap={1.5}>
                    <Box w={3} h={3} bg="blue.400" borderRadius="sm" /> TỪ MỚI: {srsLevelCounts[0]} TỪ
                  </Badge>
                </HStack>
                <HStack gap={4}>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">Ưu tiên:</Text>
                    <select style={{ outline: "none", padding: "6px 12px", fontSize: "14px", borderRadius: "9999px", width: "140px", background: "white", borderWidth: "1px", borderColor: "#d1d5db" }} value={reviewSort} onChange={(e: any) => setReviewSort(e.target.value)}>
                      <option value="due_first">Đến hạn trước</option>
                      <option value="new_first">Từ mới trước</option>
                      <option value="random">Ngẫu nhiên</option>
                    </select>
                  </HStack>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">Số từ:</Text>
                    <Input size="sm" borderRadius="full" w="70px" bg="white" type="number" borderWidth="1px" borderColor="gray.300" value={reviewLimit} onChange={(e) => setReviewLimit(Number(e.target.value) || 0)} textAlign="center" fontWeight="bold" min={1} max={filteredSrsList.length || 1} />
                  </HStack>
                </HStack>
              </VStack>

              <VStack align="end" gap={2}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">Tổng: {srsDataList.length - srsLevelCounts[0]} từ đã học</Text>
                <Button bg="#58cc02" color="white" borderRadius="full" h="12" px={10} fontWeight="black" fontSize="md" borderBottomWidth="4px" borderColor="#46a302" onClick={handleStartSrsReview} gap={2}>
                  <Play size={18} fill="white" /> Ôn tập ({Math.min(filteredSrsList.length, reviewLimit)} từ)
                </Button>
              </VStack>
            </Flex>
          </Flex>
        </Flex>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .game-card:hover .game-icon-wrapper {
          transform: rotate(-10deg) scale(1.15);
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
    </Box>
  );
}