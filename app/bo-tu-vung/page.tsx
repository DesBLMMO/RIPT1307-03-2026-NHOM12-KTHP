"use client";
import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flex, Box, Text, HStack, SimpleGrid, Button, Grid, Input, Spinner, Textarea, Center 
} from '@chakra-ui/react';
import { 
  Plus, Map as MapIcon, Folder, Globe, List, Play, Edit2, Trash2,
  Download, Share2, Pencil, ChevronDown, Volume2, X
} from 'lucide-react';
import { useVocabSets } from '@/hooks/useVocabSets';

const emojiOptions = [
  { icon: '📚', bg: '#f1f5f9' }, { icon: '📖', bg: '#eff6ff' }, 
  { icon: '📝', bg: '#f3e8ff' }, { icon: '✏️', bg: '#ffedd5' }, 
  { icon: '📕', bg: '#fce7f3' }, { icon: '⭐', bg: '#fef3c7' }, 
  { icon: '🎯', bg: '#fdf2f8' }, { icon: '💡', bg: '#fef9c3' }, 
  { icon: '🔥', bg: '#ffedd5' }, { icon: '💎', bg: '#ecfeff' }, 
  { icon: '🎓', bg: '#f1f5f9' }, { icon: '🌟', bg: '#fef3c7' }
];

export const playAudio = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

function BoTuVungContent() {
  const router = useRouter();
  
  const { sets, isLoading, addSet, editSet, removeSet } = useVocabSets();

  const [isViewOpen, setIsViewOpen] = useState(false); 
  const [isCreateOpen, setIsCreateOpen] = useState(false); 
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [viewingSet, setViewingSet] = useState<any>(null);

  const [viewWords, setViewWords] = useState<any[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  const [selectedEmoji, setSelectedEmoji] = useState('📚'); 
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingSetId, setEditingSetId] = useState<number | string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEmoji, setEditEmoji] = useState('📚');

  const handleCreateNewSet = async () => {
    if (!newTitle.trim()) return;

    const selectedEmojiObj = emojiOptions.find(e => e.icon === selectedEmoji);

    await addSet({
      title: newTitle,
      desc: newDesc || 'Không có mô tả',
      emoji: selectedEmoji,
      emojiBg: selectedEmojiObj ? selectedEmojiObj.bg : '#f1f5f9'
    });

    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    setSelectedEmoji('📚');
  };

  const handleDeleteSet = async (id: number | string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ từ vựng này không?')) {
      await removeSet(id);
    }
  };

  const handleOpenEdit = (set: any) => {
    setEditingSetId(set.id);
    setEditTitle(set.title);
    setEditDesc(set.desc === 'Không có mô tả' ? '' : set.desc);
    setEditEmoji(set.emoji);
    setIsEditOpen(true);
  };

  const handleUpdateSet = async () => {
    if (!editTitle.trim() || editingSetId === null) return;

    const selectedEmojiObj = emojiOptions.find(e => e.icon === editEmoji);

    await editSet(editingSetId, {
      title: editTitle,
      desc: editDesc || 'Không có mô tả',
      emoji: editEmoji,
      emojiBg: selectedEmojiObj ? selectedEmojiObj.bg : '#f1f5f9'
    });

    setIsEditOpen(false);
    setEditingSetId(null);
  };

  const handleOpenView = async (set: any) => {
    setViewingSet(set);
    setIsViewOpen(true);
    setIsLoadingWords(true);
    setViewWords([]); // Reset danh sách cũ chống lag
    try {
      const res = await fetch(`/api/vocab-sets/${set.id}/words`);
      if (res.ok) {
        const data = await res.json();
        setViewWords(data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách từ vựng thật:", error);
    } finally {
      setIsLoadingWords(false);
    }
  };

  if (isLoading) {
    return (
      <Flex w="full" h="80vh" align="center" justify="center">
        <Spinner size="xl" color="#58cc02" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box p={8} maxW="7xl" mx="auto">
      {/* Header Actions */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={6} mb={8}>
        <HStack flexWrap="wrap" gap={4}>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            bg="#58cc02" color="white" h="auto" px={6} py={3.5} borderRadius="2xl" fontWeight="bold" borderBottomWidth="4px" borderColor="#46a302" 
            _hover={{ bg: '#65d80f', borderColor: '#46a302', transform: 'translateY(-2px)', shadow: 'md' }} 
            _active={{ transform: 'translateY(4px)', borderBottomWidth: '0px', mb: '4px', shadow: 'none' }} 
            transition="all 0.2s" textTransform="uppercase" fontSize="sm" letterSpacing="wide" gap={2}
          >
            <Plus size={20} /> TẠO BỘ TỪ MỚI
          </Button>
          <Button 
            onClick={() => router.push('/lo-trinh')} 
            bg="#ffc800" color="gray.900" h="auto" px={6} py={3.5} borderRadius="2xl" fontWeight="bold" borderBottomWidth="4px" borderColor="#e5b400" 
            _hover={{ bg: '#ffd633', borderColor: '#e5b400', transform: 'translateY(-2px)', shadow: 'md' }} 
            _active={{ transform: 'translateY(4px)', borderBottomWidth: '0px', mb: '4px', shadow: 'none' }} 
            transition="all 0.2s" textTransform="uppercase" fontSize="sm" letterSpacing="wide" gap={2}
          >
            <MapIcon size={20} /> LỘ TRÌNH
          </Button>
        </HStack>
        
        <HStack gap={2}>
          <Button bg="#f3e8ff" color="purple.600" px={5} py={2.5} borderRadius="xl" fontWeight="bold" fontSize="sm" gap={2}>
            <Folder size={16} /> Bộ từ của tôi
          </Button>
          <Button variant="ghost" color="gray.500" _hover={{ bg: 'gray.50' }} px={5} py={2.5} borderRadius="xl" fontWeight="bold" fontSize="sm" gap={2}>
            <Globe size={16} /> Cộng đồng
          </Button>
        </HStack>
      </Flex>

      {/* Grid Danh sách bộ từ - Render từ State 'sets' */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} gap={4}>
        {sets.map((set) => (
          <Box 
            key={set.id} borderWidth="2px" borderColor="gray.200" borderRadius="2xl" p={3} pos="relative" bg="white" boxShadow="0px 4px 0px #cbd5e1"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '0px 8px 0px #cbd5e1', borderColor: 'purple.300' }} 
            transition="all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)" role="group"
          >
            <Box pos="absolute" top={2.5} right={2.5} w={4} h={4} borderRadius="sm" borderWidth="2px" borderColor="gray.200" cursor="pointer" _hover={{ borderColor: 'gray.400' }} />
            
            <HStack mb={1.5} gap={2}>
              <Flex w={7} h={7} borderRadius="md" bg={set.emojiBg} align="center" justify="center" fontSize="sm" flexShrink={0}>{set.emoji}</Flex>
              <Text fontWeight="extrabold" color="gray.800" fontSize="sm" pr={4} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{set.title}</Text>
            </HStack>
            
            <Text fontSize="xs" color="gray.500" mb={2} h="32px" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>{set.desc}</Text>
            
            <Box mb={2}>
              <HStack fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                <List size={14} /> <Text>{set.words} từ</Text>
              </HStack>
              {set.progress !== null && set.progress !== undefined && (
                <Box w="full">
                  <Box w="full" h="1.5" bg="gray.100" borderRadius="full" overflow="hidden">
                    <Box h="full" bg="purple.500" borderRadius="full" w={`${set.words > 0 ? (set.progress / set.words) * 100 : 0}%`} />
                  </Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400" mt={1} textTransform="uppercase" letterSpacing="wide">
                    {set.progress}/{set.words} Đã thuộc
                  </Text>
                </Box>
              )}
            </Box>
            
            <Box borderTopWidth="1px" borderColor="gray.100" my={2.5} mx={-3} w="calc(100% + 24px)" />
            
            <Flex align="center" justify="space-between">
              <Button 
                bg="#6366f1" color="white" px={3} py={1} borderRadius="lg" fontWeight="bold" fontSize="xs" h="auto" borderBottomWidth="3px" borderColor="#4338ca" 
                _hover={{ bg: '#4f46e5', borderColor: '#3730a3' }} _active={{ transform: 'translateY(3px)', borderBottomWidth: '0px', mb: '3px' }} transition="all 0.15s"
                onClick={() => handleOpenView(set)}
              >
                Xem
              </Button>
              <HStack gap={0.5}>
                {/* Nút Học -> Chuyển sang Game Hub */}
                <Flex as="button" onClick={() => router.push(`/game/${set.id}?part=0&mode=practice&type=hub`)} w={6} h={6} borderRadius="full" align="center" justify="center" color="gray.400" _hover={{ color: 'green.500', bg: 'green.50' }} transition="all 0.2s">
                  <Play size={12} />
                </Flex>
                <Flex as="button" onClick={() => handleOpenEdit(set)} w={6} h={6} borderRadius="full" align="center" justify="center" color="gray.400" _hover={{ color: 'blue.500', bg: 'blue.50' }} transition="all 0.2s">
                  <Edit2 size={12} />
                </Flex>
                <Flex as="button" onClick={() => handleDeleteSet(set.id)} w={6} h={6} borderRadius="full" align="center" justify="center" color="gray.400" _hover={{ color: 'red.500', bg: 'red.50' }} transition="all 0.2s">
                  <Trash2 size={12} />
                </Flex>
              </HStack>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* POP-UP MODAL: TẠO BỘ TỪ MỚI */}
      {isCreateOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} align="center" justify="center" p={4} bg="blackAlpha.400" backdropFilter="blur(2px)" onClick={() => setIsCreateOpen(false)}>
          <Flex direction="column" bg="white" borderRadius="3xl" w="full" maxW="450px" shadow="xl" position="relative" overflow="hidden" p={6} onClick={(e) => e.stopPropagation()}>
            <Flex as="button" position="absolute" top={4} right={4} p={2} color="gray.500" _hover={{ color: 'gray.800', bg: 'gray.100' }} borderRadius="full" transition="all 0.2s" onClick={() => setIsCreateOpen(false)}>
              <X size={20} />
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={6}>Tạo bộ từ mới</Text>
            <Box mb={4}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Tên bộ từ <Text as="span" color="red.500">*</Text></Text>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="VD: IELTS Speaking" borderRadius="xl" borderWidth="1px" borderColor="gray.200" px={4} py={2} _focus={{ borderColor: 'blue.400', boxShadow: 'none' }} />
            </Box>
            <Box mb={5}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Mô tả</Text>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} w="full" p={4} borderWidth="1px" borderColor="gray.200" borderRadius="xl" placeholder="Mô tả về bộ từ này..." h="100px" resize="none" _focus={{ borderColor: 'blue.400', outline: 'none' }} fontSize="sm" />
            </Box>
            <Box mb={8}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>Biểu tượng</Text>
              <SimpleGrid columns={6} gap={2.5}>
                {emojiOptions.map((item, idx) => (
                  <Flex key={idx} bg={selectedEmoji === item.icon ? 'gray.200' : item.bg} h={12} borderRadius="xl" align="center" justify="center" fontSize="lg" cursor="pointer" _hover={{ bg: selectedEmoji === item.icon ? 'gray.200' : 'gray.100' }} transition="all 0.2s" onClick={() => setSelectedEmoji(item.icon)} borderWidth={selectedEmoji === item.icon ? '2px' : '0px'} borderColor="gray.400">{item.icon}</Flex>
                ))}
              </SimpleGrid>
            </Box>
            <Flex justify="flex-end" gap={3} align="center">
              <Button variant="ghost" color="#0ea5e9" fontWeight="bold" px={4} _hover={{ bg: 'blue.50' }} onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button onClick={handleCreateNewSet} bg="#58cc02" color="white" borderRadius="full" px={6} py={2.5} fontWeight="bold" _hover={{ bg: '#46a302' }}>Tạo mới</Button>
            </Flex>
          </Flex>
        </Flex>
      )}

      {/* POP-UP MODAL: CHỈNH SỬA BỘ TỪ */}
      {isEditOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} align="center" justify="center" p={4} bg="blackAlpha.400" backdropFilter="blur(2px)" onClick={() => setIsEditOpen(false)}>
          <Flex direction="column" bg="white" borderRadius="3xl" w="full" maxW="450px" shadow="xl" position="relative" overflow="hidden" p={6} onClick={(e) => e.stopPropagation()}>
            <Flex as="button" position="absolute" top={4} right={4} p={2} color="gray.500" _hover={{ color: 'gray.800', bg: 'gray.100' }} borderRadius="full" transition="all 0.2s" onClick={() => setIsEditOpen(false)}>
              <X size={20} />
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={6}>Chỉnh sửa bộ từ</Text>
            <Box mb={4}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Tên bộ từ <Text as="span" color="red.500">*</Text></Text>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="VD: IELTS Speaking" borderRadius="xl" borderWidth="1px" borderColor="gray.200" px={4} py={2} _focus={{ borderColor: 'blue.400', boxShadow: 'none' }} />
            </Box>
            <Box mb={5}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Mô tả</Text>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} w="full" p={4} borderWidth="1px" borderColor="gray.200" borderRadius="xl" placeholder="Mô tả về bộ từ này..." h="100px" resize="none" _focus={{ borderColor: 'blue.400', outline: 'none' }} fontSize="sm" />
            </Box>
            <Box mb={8}>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>Biểu tượng</Text>
              <SimpleGrid columns={6} gap={2.5}>
                {emojiOptions.map((item, idx) => (
                  <Flex key={idx} bg={editEmoji === item.icon ? 'gray.200' : item.bg} h={12} borderRadius="xl" align="center" justify="center" fontSize="lg" cursor="pointer" _hover={{ bg: editEmoji === item.icon ? 'gray.200' : 'gray.100' }} transition="all 0.2s" onClick={() => setEditEmoji(item.icon)} borderWidth={editEmoji === item.icon ? '2px' : '0px'} borderColor="gray.400">{item.icon}</Flex>
                ))}
              </SimpleGrid>
            </Box>
            <Flex justify="flex-end" gap={3} align="center">
              <Button variant="ghost" color="#0ea5e9" fontWeight="bold" px={4} _hover={{ bg: 'blue.50' }} onClick={() => setIsEditOpen(false)}>Hủy</Button>
              <Button onClick={handleUpdateSet} bg="#58cc02" color="white" borderRadius="full" px={6} py={2.5} fontWeight="bold" _hover={{ bg: '#46a302' }}>Lưu thay đổi</Button>
            </Flex>
          </Flex>
        </Flex>
      )}

      {/* POP-UP MODAL: XEM CHI TIẾT DANH SÁCH TỪ VỰNG DÙNG DỮ LIỆU THẬT */}
      {isViewOpen && viewingSet && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} align="center" justify="center" p={4} bg="blackAlpha.400" backdropFilter="blur(2px)" onClick={() => { setIsViewOpen(false); setViewingSet(null); }}>
          <Flex direction="column" bg="white" borderRadius="3xl" w="full" maxW="1152px" maxH="90vh" shadow="xl" position="relative" overflow="hidden" onClick={(e) => e.stopPropagation()}>
            <Flex justify="space-between" align="center" p={6} pb={4}>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">{viewingSet.title}</Text>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{viewingSet.words} từ vựng</Text>
              </Box>

              <HStack gap={3} pr={10}>
                <Button title="Xuất file" variant="outline" borderRadius="full" size="sm" borderWidth="1px" borderColor="gray.300" fontWeight="bold" gap={2} _hover={{ bg: 'gray.50' }}>
                  <Download size={16} /> Xuất <ChevronDown size={14} />
                </Button>
                <Button variant="outline" borderRadius="full" size="sm" borderWidth="1px" borderColor="gray.300" fontWeight="bold" gap={2} _hover={{ bg: 'gray.50' }}>
                  <Share2 size={16} /> Chia sẻ
                </Button>
                <Button onClick={() => router.push(`/tu-vung?setId=${viewingSet.id}`)} bg="#58cc02" color="white" borderRadius="full" size="sm" fontWeight="bold" _hover={{ bg: '#46a302' }} gap={2}>
                  <Pencil size={16} /> Quản lý từ vựng
                </Button>
              </HStack>
            </Flex>
            
            <Flex as="button" position="absolute" top={6} right={6} p={2} color="gray.400" _hover={{ color: 'gray.800', bg: 'gray.100' }} borderRadius="full" transition="all 0.2s" onClick={() => { setIsViewOpen(false); setViewingSet(null); }}>
              <X size={20} />
            </Flex>

            <Box flex={1} overflowY="auto" px={6} pb={6} className="custom-scrollbar">
              <Grid templateColumns="40px 1.5fr 2fr 100px 3fr" gap={4} py={3} borderBottomWidth="1px" borderColor="gray.100" fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                <Text>#</Text><Text>TỪ VỰNG</Text><Text>NGHĨA</Text><Text textAlign="center">LOẠI TỪ</Text><Text>VÍ DỤ</Text>
              </Grid>

              {/* RENDER DỮ LIỆU THẬT */}
              <Box>
                {isLoadingWords ? (
                  <Center py={10} w="full"><Spinner color="#58cc02" size="lg" thickness="3px" /></Center>
                ) : viewWords.length > 0 ? (
                  viewWords.map((item: any, idx: number) => (
                    <Grid key={item.id || idx} templateColumns="40px 1.5fr 2fr 100px 3fr" gap={4} py={4} borderBottomWidth="1px" borderColor="gray.50" alignItems="start" fontSize="sm" _hover={{ bg: 'gray.50' }} transition="colors 0.2s">
                      <Text fontWeight="bold" color="gray.800" mt={1}>{idx + 1}</Text>
                      <HStack align="start" gap={2}>
                        <Box color="blue.400" cursor="pointer" mt={1} onClick={() => playAudio(item.word)} _hover={{ color: "blue.600" }}><Volume2 size={16} /></Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.800">{item.word}</Text>
                          {item.phonetic && <Text fontSize="xs" color="gray.400" fontStyle="italic">{item.phonetic}</Text>}
                        </Box>
                      </HStack>
                      <Text color="gray.700" fontWeight="medium">{item.meaning}</Text>
                      <Flex justify="center">
                        {item.type && (
                          <Text px={2.5} py={0.5} borderRadius="md" fontSize="10px" fontWeight="bold" bg={item.type?.toLowerCase() === 'verb' || item.type?.toLowerCase() === 'v' ? 'purple.100' : 'orange.100'} color={item.type?.toLowerCase() === 'verb' || item.type?.toLowerCase() === 'v' ? 'purple.600' : 'orange.600'} textTransform="uppercase">
                            {item.type}
                          </Text>
                        )}
                      </Flex>
                      <Box>
                        <Text color="gray.700" fontWeight="medium">{item.exampleEn || '-'}</Text>
                        {item.exampleVi && <Text color="gray.500" fontSize="xs" mt={1}>({item.exampleVi})</Text>}
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Center py={10}><Text color="gray.400" fontWeight="bold">Chưa có từ vựng nào trong chủ đề này.</Text></Center>
                )}
              </Box>
            </Box>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}


export default function BoTuVungPage() {
  return (
    <Suspense 
      fallback={
        <Flex w="100vw" h="100vh" align="center" justify="center" bg="#f8f9fa">
          <Spinner size="xl" color="#58cc02" thickness="4px" />
        </Flex>
      }
    >
      <BoTuVungContent />
    </Suspense>
  );
}