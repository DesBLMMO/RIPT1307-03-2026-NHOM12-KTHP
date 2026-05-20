"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, Flex, SimpleGrid, Text, HStack, Input, Button, Grid, VStack, Spinner, Textarea
} from '@chakra-ui/react';
import { 
  Book, CheckCircle2, Clock, Percent, Search, Circle, Volume2, 
  ChevronDown, Zap, Layers, Trash2, X, Upload, HelpCircle, Plus 
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Hook và Service gọi API thật
import { useVocabWords } from '@/hooks/useVocabWords';
import { useVocabSets } from '@/hooks/useVocabSets';
import { vocabWordService } from '@/lib/services/vocabWordService';
import { vocabSetService } from '@/lib/services/vocabSetService';

export default function TuVungPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    words, isLoading, setId, 
    toggleLearned: hookToggleLearned, removeWord,
    addWordsBulk, updateLearnedBulk, removeWordsBulk 
  } = useVocabWords();
  
  const { sets } = useVocabSets();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // State quản lý Modal AI
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const MAX_AI_USES = 2;

  // State quản lý việc Chọn/Tạo bộ từ
  const [targetSetId, setTargetSetId] = useState<string>(setId || '');
  const [isCreatingNewSet, setIsCreatingNewSet] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  
  // State quản lý Modal Thêm nhiều từ
  const [isAddMultiModalOpen, setIsAddMultiModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false); 

  const [multiAddRows, setMultiAddRows] = useState([
    { id: '1', word: '', phonetic: '', meaning: '', type: '', example: '', note: '' }
  ]);

  const duoButtonStyle = {
    bg: "#58cc02", 
    color: "white", 
    borderRadius: "full", 
    fontWeight: "extrabold",
    borderBottomWidth: "4px", 
    borderColor: "#46a302",
    transition: "all 0.2s",
    _hover: { 
      bg: '#65d80f', 
      transform: 'translateY(-2px)', 
      boxShadow: '0 4px 12px rgba(88, 204, 2, 0.4)' 
    },
    _active: { 
      transform: 'translateY(2px)', 
      borderBottomWidth: '2px',
      boxShadow: 'none'
    }
  };

  useEffect(() => {
    if (isAiModalOpen) {
      const today = new Date().toDateString();
      const usageData = JSON.parse(localStorage.getItem('ai_usage') || '{"date": "", "count": 0}');
      if (usageData.date !== today) setAiUsageCount(0);
      else setAiUsageCount(usageData.count);
    }
  }, [isAiModalOpen]);

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); 
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; 
      utterance.rate = 0.9; 
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ tính năng phát âm.');
    }
  };

  const handleGenerateAI = async () => {
    if (!targetSetId && !isCreatingNewSet) return alert("Vui lòng chọn bộ từ vựng để lưu!");
    if (isCreatingNewSet && !newSetName.trim()) return alert("Vui lòng nhập tên cho bộ từ mới!");
    if (!aiInputText.trim()) return alert("Vui lòng nhập chủ đề hoặc đoạn văn bản!");
    if (aiUsageCount >= MAX_AI_USES) return alert("Bạn đã dùng hết lượt tạo AI hôm nay!");

    setIsAiLoading(true);
    
    try {
      const generatedWords = await vocabWordService.generateWordsWithAI(aiInputText);
      // FIX LỖI TS 1: Ép kiểu item sang any để tránh lỗi note không tồn tại
      const mappedRows = generatedWords.map((item: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        word: item.word || '', phonetic: item.phonetic || '',
        meaning: item.meaning || '', type: item.type || 'NOUN',
        example: item.exampleEn || '', note: item.note || ''
      }));

      const newCount = aiUsageCount + 1;
      setAiUsageCount(newCount);
      localStorage.setItem('ai_usage', JSON.stringify({ date: new Date().toDateString(), count: newCount }));

      setMultiAddRows(mappedRows);
      setIsAiModalOpen(false); 
      setAiInputText(''); 
      setIsAddMultiModalOpen(true); 
    } catch (error) {
      alert("Lỗi tạo từ bằng AI!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0]; 
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const newRows = data.map((item: any, index: number) => ({
          id: `file-${Date.now()}-${index}`,
          word: String(item.word || item['Từ vựng'] || ''),
          phonetic: String(item.phonetic || item['Phiên âm'] || ''),
          meaning: String(item.meaning || item['Nghĩa'] || ''),
          type: String(item.type || item['Loại từ'] || 'NOUN').toUpperCase(),
          example: String(item.example || item['Ví dụ'] || ''),
          note: String(item.note || item['Ghi chú'] || '')
        }));

        setMultiAddRows(newRows);
        setIsAddMultiModalOpen(true); 
      } catch (error) {
        alert("Lỗi đọc file Excel/CSV.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const filteredList = useMemo(() => {
    return words.filter(item => 
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [words, searchTerm]);

  const stats = useMemo(() => {
    
    const total = filteredList.length;
    const learned = filteredList.filter(w => w.isLearned).length;
    return { total, learned, unlearned: total - learned, progress: total === 0 ? '0%' : `${Math.round((learned / total) * 100)}%` };
  }, [filteredList]);


  const handleToggleLearned = async (id: string | number, currentStatus: boolean) => {
    await hookToggleLearned(id, currentStatus);
  };

  const handleActionLearnedBulk = async (status: boolean) => {
    await updateLearnedBulk(selectedIds, status);
    setSelectedIds([]);
  };

  const handleActionDeleteBulk = async () => {
    if (confirm(`Xóa ${selectedIds.length} từ đã chọn?`)) {
      await removeWordsBulk(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSaveMultiWords = async () => {
    const validRows = multiAddRows.filter(r => r.word.trim() !== '' && r.meaning.trim() !== '');
    if (validRows.length === 0) return alert("Vui lòng điền ít nhất 1 từ vựng hợp lệ!");

    if (!targetSetId && !isCreatingNewSet) return alert("Vui lòng chọn bộ từ vựng để lưu!");
    if (isCreatingNewSet && !newSetName.trim()) return alert("Vui lòng nhập tên cho bộ từ mới!");

    let finalSetId = targetSetId;

    try {
      if (isCreatingNewSet && newSetName.trim()) {
        const newSet = await vocabSetService.createSet({ 
          title: newSetName, 
          desc: 'Bộ từ tạo tự động', 
          emoji: '📁', 
          emojiBg: '#f1f5f9' 
        });
        finalSetId = newSet.id;
      }

      const bulkData = validRows.map(row => ({
        word: row.word, phonetic: row.phonetic, meaning: row.meaning,
        type: row.type || 'NOUN', exampleEn: row.example, exampleVi: row.note,
        setId: finalSetId
      }));

      await addWordsBulk(bulkData);

      setIsAddMultiModalOpen(false);
      setMultiAddRows([{ id: Date.now().toString(), word: '', phonetic: '', meaning: '', type: '', example: '', note: '' }]);
      setIsCreatingNewSet(false);
      setNewSetName('');
      
      router.push(`/tu-vung?setId=${finalSetId}`);
    } catch (error) {
      alert("Lỗi lưu dữ liệu lên hệ thống!");
    }
  };

  const handleSetChange = (val: string) => {
    if (val === 'Tất cả') router.push('/tu-vung');
    else router.push(`/tu-vung?setId=${val}`);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredList.length && filteredList.length > 0) setSelectedIds([]);
    else setSelectedIds(filteredList.map(w => String(w.id)));
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addRow = () => setMultiAddRows([...multiAddRows, { id: Date.now().toString(), word: '', phonetic: '', meaning: '', type: '', example: '', note: '' }]);
  const removeRow = (id: string) => multiAddRows.length > 1 && setMultiAddRows(multiAddRows.filter(r => r.id !== id));
  const updateRow = (id: string, field: string, value: string) => setMultiAddRows(multiAddRows.map(r => r.id === id ? { ...r, [field]: value } : r));

  const validWordCount = multiAddRows.filter(r => r.word.trim() !== '' && r.meaning.trim() !== '').length;

  // FIX LỖI TS 2: Sử dụng borderWidth thay vì thickness cho tương thích phiên bản Chakra v3
  if (isLoading) return <Flex w="full" h="80vh" align="center" justify="center"><Spinner size="xl" color="#58cc02" borderWidth="4px" /></Flex>;

  return (
    <Box p={8} maxW="1200px" mx="auto" minH="full" bg="#f8f9fa">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />

      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={6}>
        {[
          { label: 'Tổng', val: stats.total.toString(), icon: Book, color: '#38bdf8', shadowBorder: '#0ea5e9', shadowIcon: 'rgba(56, 189, 248, 0.4)' },
          { label: 'Thuộc', val: stats.learned.toString(), icon: CheckCircle2, color: '#84cc16', shadowBorder: '#65a30d', shadowIcon: 'rgba(132, 204, 22, 0.4)' },
          { label: 'Chưa', val: stats.unlearned.toString(), icon: Clock, color: '#f59e0b', shadowBorder: '#d97706', shadowIcon: 'rgba(245, 158, 11, 0.4)' },
          { label: '%', val: stats.progress, icon: Percent, color: '#c084fc', shadowBorder: '#a855f7', shadowIcon: 'rgba(192, 132, 252, 0.4)' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Flex key={i} bg="white" borderRadius="2xl" px={5} py={4} borderWidth="2px" borderColor="gray.800" boxShadow={`0px 4px 0px ${stat.shadowBorder}`} align="center" gap={4} transition="all 0.2s" _hover={{ transform: 'translateY(-2px)', boxShadow: `0px 6px 0px ${stat.shadowBorder}` }}>
              <Flex w={12} h={12} borderRadius="full" bg={stat.color} color="white" align="center" justify="center" flexShrink={0} boxShadow={`0 4px 10px ${stat.shadowIcon}`}><Icon size={22} strokeWidth={2.5} /></Flex>
              <Box><Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase">{stat.label}</Text><Text fontSize="2xl" fontWeight="black" color="gray.900" mt={1}>{stat.val}</Text></Box>
            </Flex>
          )
        })}
      </SimpleGrid>

      <Flex bg="white" borderWidth="2px" borderColor="gray.800" borderRadius={{ base: '2xl', md: 'full' }} p={3} px={4} direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" gap={4} mb={6} shadow="sm">
        <HStack w={{ base: 'full', md: 'auto' }} gap={3}>
          <Flex position="relative" w="240px" align="center">
            <Box position="absolute" left={4} pointerEvents="none"><Search size={18} color="#a0aec0" /></Box>
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} pl={10} placeholder="Tìm từ..." borderRadius="full" borderWidth="2px" fontSize="sm" _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
          </Flex>
          <Box position="relative">
            {/* FIX LỖI TS 3: Dùng ép kiểu props as any để lách luật cho Select Box */}
            <Box 
              as="select" 
              {...({ value: setId || 'Tất cả', onChange: (e: any) => handleSetChange(e.target.value) } as any)}
              borderRadius="full" borderWidth="2px" borderColor="gray.200" fontSize="sm" w="160px" py={2.5} pl={4} pr={8} bg="white" outline="none" appearance="none" cursor="pointer" _hover={{ borderColor: 'gray.400' }}
            >
              <option value="Tất cả">Tất cả bộ từ</option>
              {sets.map(set => <option key={set.id} value={set.id}>{set.title}</option>)}
            </Box>
            <Box position="absolute" right={3} top="50%" transform="translateY(-50%)" pointerEvents="none"><ChevronDown size={16} color="gray" /></Box>
          </Box>
        </HStack>
        <HStack w={{ base: 'full', md: 'auto' }} gap={3}>
          <Button onClick={() => setIsAiModalOpen(true)} {...duoButtonStyle} px={6} gap={2} fontSize="sm">
            <Zap size={18} fill="currentColor" /> Thêm từ với AI
          </Button>
          <Button onClick={() => setIsAddMultiModalOpen(true)} {...duoButtonStyle} px={6} gap={2} fontSize="sm">
            <Layers size={18} /> Thêm nhiều từ
          </Button>
        </HStack>
      </Flex>

      <Box bg="white" borderRadius="28px" borderWidth="2px" borderColor="gray.800" boxShadow="0px 4px 0px #65a30d" overflow="hidden">
        {selectedIds.length > 0 ? (
          <Flex bg="blue.50" px={6} py={3.5} borderBottomWidth="2px" borderColor="blue.100" align="center" justify="space-between">
            <HStack gap={3}>
              <Box w={6} color="blue.500" cursor="pointer" onClick={toggleSelectAll}><CheckCircle2 size={20} color="white" fill="#3b82f6" /></Box>
              <Text fontWeight="extrabold" color="blue.600" fontSize="sm">Đã chọn {selectedIds.length} từ</Text>
            </HStack>
            <HStack gap={3}>
              <Button onClick={() => handleActionLearnedBulk(true)} bg="#58cc02" color="white" borderRadius="xl" size="xs" borderBottomWidth="3px" borderColor="#46a302" _hover={{ bg: '#65d80f' }}>Đã thuộc</Button>
              <Button onClick={() => handleActionLearnedBulk(false)} bg="#f59e0b" color="white" borderRadius="xl" size="xs" borderBottomWidth="3px" borderColor="#d97706" _hover={{ bg: '#fbbf24' }}>Chưa thuộc</Button>
              <Button onClick={handleActionDeleteBulk} bg="#ef4444" color="white" borderRadius="xl" size="xs" borderBottomWidth="3px" borderColor="#dc2626" _hover={{ bg: '#f87171' }}>Xóa</Button>
            </HStack>
          </Flex>
        ) : (
          <Grid bg="gray.100" templateColumns="auto 2fr 2fr auto 3fr auto" gap={4} px={6} py={4} borderBottomWidth="2px" fontSize="11px" fontWeight="bold" color="gray.600" textTransform="uppercase">
            <Box w={6} cursor="pointer" onClick={toggleSelectAll}><Circle size={20} color="#cbd5e1" /></Box>
            <Text>TỪ VỰNG</Text><Text>NGHĨA</Text><Text w="20" textAlign="center">LOẠI TỪ</Text><Text>VÍ DỤ</Text><Text w="16" textAlign="center">THUỘC</Text>
          </Grid>
        )}
        <Box>
          {filteredList.length > 0 ? (
            filteredList.map((item) => {
              const isSelected = selectedIds.includes(String(item.id));
              return (
                <Grid key={item.id} templateColumns="auto 2fr 2fr auto 3fr auto" gap={4} alignItems="center" px={6} py={4} borderBottomWidth="2px" borderColor="gray.50" bg={isSelected ? 'blue.50' : 'white'} transition="all 0.2s" _hover={{ bg: isSelected ? 'blue.100' : 'blue.50', transform: 'scale(1.002)', boxShadow: 'sm' }}>
                  <Box w={6} color={isSelected ? 'blue.500' : '#e2e8f0'} cursor="pointer" onClick={() => toggleSelect(String(item.id))}>
                    {isSelected ? <CheckCircle2 size={20} color="white" fill="#3b82f6" /> : <Circle size={20} color="currentColor" />}
                  </Box>
                  <HStack align="flex-start" gap={3}>
                    <Box 
                      color="blue.400" mt={1} cursor="pointer" transition="all 0.2s" 
                      _hover={{ color: 'blue.600', transform: 'scale(1.1)' }} _active={{ transform: 'scale(0.9)' }} 
                      onClick={(e) => handlePlayAudio(e, item.word)}
                    >
                      <Volume2 size={16} />
                    </Box>
                    <Box><Text fontWeight="extrabold">{item.word}</Text><Text fontSize="sm" color="gray.400">{item.phonetic}</Text></Box>
                  </HStack>
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">{item.meaning}</Text>
                  <Flex w="20" justify="center">
                    {item.type && (
                      <Text fontSize="xs" fontWeight="bold" px={3} py={1} borderRadius="md" bg={item.type.toLowerCase() === 'verb' || item.type.toLowerCase() === 'v' ? 'red.100' : 'blue.100'} color={item.type.toLowerCase() === 'verb' || item.type.toLowerCase() === 'v' ? 'red.500' : 'blue.500'}>{item.type}</Text>
                    )}
                  </Flex>
                  <Box fontSize="sm"><Text color="gray.700" fontWeight="medium">{item.exampleEn || '-'}</Text><Text color="gray.500" fontSize="xs">{item.exampleVi}</Text></Box>
                  <Flex w="16" justify="center">
                    <Box w={11} h={6} bg={item.isLearned ? "green.400" : "gray.200"} borderRadius="full" pos="relative" cursor="pointer" onClick={() => handleToggleLearned(item.id, item.isLearned)} transition="all 0.3s">
                      <Box w={5} h={5} bg="white" borderRadius="full" pos="absolute" top="2px" left={item.isLearned ? "22px" : "2px"} transition="all 0.2s" />
                    </Box>
                  </Flex>
                </Grid>
              );
            })
          ) : (
            <Flex justify="center" align="center" py={12} color="gray.400" direction="column" gap={3}><Search size={48} strokeWidth={1.5} /><Text fontWeight="bold" fontSize="lg">Không có từ vựng nào</Text></Flex>
          )}
        </Box>
      </Box>

      {/* MODAL THÊM NHIỀU TỪ */}
      {isAddMultiModalOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} align="center" justify="center" p={4} bg="blackAlpha.400" backdropFilter="blur(3px)" onClick={() => setIsAddMultiModalOpen(false)}>
          <Flex direction="column" bg="white" borderRadius="2xl" w="full" maxW="1150px" maxH="90vh" p={6} onClick={(e) => e.stopPropagation()} shadow="xl">
            <Flex justify="space-between" align="flex-start" mb={4}>
              <VStack align="flex-start" gap={3}>
                <HStack gap={3}>
                  <Text fontWeight="bold" fontSize="md" color="gray.700">Thêm vào bộ từ <Text as="span" color="red.500">*</Text></Text>
                  <Box position="relative">
                    {/* FIX LỖI TS 4: Xử lý Select Box an toàn */}
                    <Box 
                      as="select" bg="white" borderRadius="full" borderWidth="1px" borderColor="gray.300" fontSize="sm" w="160px" p={1.5} pl={3} pr={8} outline="none" cursor="pointer"
                      {...({ 
                        value: isCreatingNewSet ? 'new' : targetSetId,
                        onChange: (e: any) => { 
                          if (e.target.value === 'new') setIsCreatingNewSet(true); 
                          else { setIsCreatingNewSet(false); setTargetSetId(e.target.value); } 
                        } 
                      } as any)}
                    >
                      <option value="">-- Chọn bộ từ --</option>
                      {sets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      <option value="new" style={{ fontWeight: 'bold', color: '#58cc02' }}>+ Tạo bộ từ mới</option>
                    </Box>
                    <Box position="absolute" right={3} top="50%" transform="translateY(-50%)" pointerEvents="none"><ChevronDown size={14} color="gray" /></Box>
                  </Box>
                  {isCreatingNewSet && <Input size="sm" borderRadius="full" placeholder="Nhập tên bộ từ mới..." w="200px" value={newSetName} onChange={(e) => setNewSetName(e.target.value)} />}
                </HStack>

                <HStack gap={2.5}>
                  <Button bg="#46a302" color="white" borderRadius="full" fontWeight="extrabold" gap={2} fontSize="sm" transition="all 0.2s" _hover={{ bg: '#3d8e02', transform: 'translateY(-2px)', shadow: 'md' }} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={18} /> Nhập file
                  </Button>
                  <Button bg="white" color="gray.600" borderRadius="full" borderWidth="1px" borderColor="gray.200" fontSize="sm" gap={1.5} transition="all 0.2s" _hover={{ bg: 'gray.50', transform: 'translateY(-2px)', shadow: 'md' }} onClick={() => setIsGuideOpen(true)}>
                    <HelpCircle size={16} /> Hướng dẫn
                  </Button>
                </HStack>
              </VStack>
              <Box cursor="pointer" p={1} transition="all 0.2s" _hover={{ bg: 'gray.100', borderRadius: 'full', transform: 'rotate(90deg)' }} onClick={() => setIsAddMultiModalOpen(false)}>
                <X size={20} color="gray" />
              </Box>
            </Flex>

            <Box flex={1} overflowY="auto" className="custom-scrollbar" borderRadius="2xl" borderWidth="1px" borderColor="gray.100" overflow="hidden" mt={2}>
              <Grid bg="gray.100" templateColumns="40px 1.5fr 1.2fr 1.5fr 1fr 1.5fr 1.5fr 40px" gap={3} px={4} py={3} borderBottomWidth="1px" fontSize="11px" fontWeight="bold" color="gray.600" textTransform="uppercase">
                <Text>#</Text><Text>TỪ VỰNG <Text as="span" color="red.500">*</Text></Text><Text>PHIÊN ÂM</Text><Text>NGHĨA <Text as="span" color="red.500">*</Text></Text><Text>LOẠI TỪ</Text><Text>VÍ DỤ</Text><Text>GHI CHÚ</Text><Text></Text>
              </Grid>

              <Box>
                {multiAddRows.map((row, idx) => (
                  <Grid key={row.id} templateColumns="40px 1.5fr 1.2fr 1.5fr 1fr 1.5fr 1.5fr 40px" gap={2} px={4} py={2} alignItems="center" borderBottomWidth="1px" borderColor="gray.50">
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">{idx + 1}</Text>
                    <Input size="sm" borderRadius="xl" placeholder="VD: Hello" value={row.word} onChange={(e) => updateRow(row.id, 'word', e.target.value)} _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
                    <Input size="sm" borderRadius="xl" placeholder="/hə'ləʊ/" value={row.phonetic} onChange={(e) => updateRow(row.id, 'phonetic', e.target.value)} _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
                    <Input size="sm" borderRadius="xl" placeholder="Xin chào" value={row.meaning} onChange={(e) => updateRow(row.id, 'meaning', e.target.value)} _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
                    <Input size="sm" borderRadius="xl" placeholder="noun" value={row.type} onChange={(e) => updateRow(row.id, 'type', e.target.value)} _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
                    <Input size="sm" borderRadius="xl" placeholder="Hello world" value={row.example} onChange={(e) => updateRow(row.id, 'example', e.target.value)} _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
                    <Input size="sm" borderRadius="xl" placeholder="Đồng/trái nghĩa..." value={row.note} onChange={(e) => updateRow(row.id, 'note', e.target.value)} _focus={{ borderColor: '#58cc02', boxShadow: 'none' }} />
                    <Box as="button" onClick={() => removeRow(row.id)} _hover={{ color: 'red.500', transform: 'scale(1.2)' }} transition="all 0.2s" ml={2}><Trash2 size={16} color="#94a3b8" /></Box>
                  </Grid>
                ))}
              </Box>

              <Flex align="center" justify="center" py={3} mt={4} mb={2} mx={4} borderWidth="1px" borderStyle="dashed" borderColor="gray.300" borderRadius="full" color="gray.500" fontWeight="bold" fontSize="sm" cursor="pointer" _hover={{ bg: 'gray.50', color: 'gray.700', borderColor: 'gray.400', transform: 'translateY(-2px)' }} transition="all 0.2s" onClick={addRow}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Thêm dòng
              </Flex>
            </Box>

            <Flex justify="flex-end" align="center" mt={4} gap={6} borderTopWidth="1px" borderColor="gray.100" pt={4}>
              <Text cursor="pointer" color="#0ea5e9" fontWeight="bold" fontSize="sm" _hover={{ textDecoration: 'underline' }} onClick={() => setIsAddMultiModalOpen(false)}>Hủy</Text>
              <Button bg="#58cc02" color="white" borderRadius="full" px={8} py={5} fontWeight="extrabold" fontSize="md" _hover={{ bg: '#46a302', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(88, 204, 2, 0.4)' }} _active={{ transform: 'translateY(2px)' }} transition="all 0.2s" onClick={handleSaveMultiWords}>
                Lưu {validWordCount} từ
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}

      {/* POP-UP HƯỚNG DẪN */}
      {isGuideOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={10000} align="center" justify="center" p={4} bg="blackAlpha.600" onClick={() => setIsGuideOpen(false)}>
          <Box bg="white" p={6} borderRadius="2xl" maxW="500px" w="full" onClick={(e) => e.stopPropagation()} shadow="2xl">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="black" fontSize="lg" color="gray.800">Hướng dẫn nhập file</Text>
              <Box cursor="pointer" p={1} transition="all 0.2s" _hover={{ bg: 'gray.100', borderRadius: 'full' }} onClick={() => setIsGuideOpen(false)}><X size={20} color="gray" /></Box>
            </Flex>
            <VStack align="start" gap={3} fontSize="sm" color="gray.700">
              <Text>Bạn có thể nhập danh sách từ vựng hàng loạt bằng file <b>Excel (.xlsx, .xls)</b> hoặc <b>CSV</b>.</Text>
              <Text fontWeight="bold" mt={2}>Cấu trúc file yêu cầu:</Text>
              <Text>Dòng đầu tiên (Tiêu đề cột) phải chứa các từ khóa sau (không phân biệt hoa/thường):</Text>
              <Box bg="gray.50" p={4} borderRadius="xl" w="full" borderWidth="1px" borderColor="gray.200">
                <Text mb={1}>👉 <b>Từ vựng</b> (hoặc word) <Text as="span" color="red.500" fontWeight="bold">*Bắt buộc</Text></Text>
                <Text mb={1}>👉 <b>Nghĩa</b> (hoặc meaning) <Text as="span" color="red.500" fontWeight="bold">*Bắt buộc</Text></Text>
                <Text mb={1}>👉 <b>Phiên âm</b> (hoặc phonetic)</Text>
                <Text mb={1}>👉 <b>Loại từ</b> (hoặc type) - VD: Noun, Verb...</Text>
                <Text mb={1}>👉 <b>Ví dụ</b> (hoặc example)</Text>
                <Text>👉 <b>Ghi chú</b> (hoặc note)</Text>
              </Box>
              <Text fontStyle="italic" color="gray.500" mt={2}>* Mẹo: Các cột không bắt buộc có thể để trống hoặc không cần tạo trong file.</Text>
            </VStack>
            <Button w="full" mt={6} py={5} bg="#58cc02" color="white" borderRadius="full" fontWeight="extrabold" _hover={{ bg: '#46a302' }} onClick={() => setIsGuideOpen(false)}>Đã hiểu</Button>
          </Box>
        </Flex>
      )}

      {/* MODAL AI */}
      {isAiModalOpen && (
        <Flex position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={9999} align="center" justify="center" p={4} bg="rgba(0,0,0,0.4)" backdropFilter="blur(3px)" onClick={() => setIsAiModalOpen(false)}>
          <Box bg="white" borderRadius="3xl" w="full" maxW="650px" p={8} onClick={(e) => e.stopPropagation()} shadow="2xl">
             <Flex justify="space-between" mb={6}><Text fontWeight="black" fontSize="2xl">Tạo từ vựng với AI</Text><X size={24} cursor="pointer" onClick={() => setIsAiModalOpen(false)} /></Flex>
             <VStack align="stretch" gap={4} mb={4}>
               <HStack gap={4}>
                  <Box flex={1} position="relative">
                    <Text fontSize="xs" fontWeight="black" color="gray.500" mb={2} textTransform="uppercase">Lưu vào bộ từ <Text as="span" color="red.500">*</Text></Text>
                    {/* FIX LỖI TS 5: Xử lý Select Box an toàn */}
                    <Box 
                        as="select" bg="gray.50" borderRadius="xl" borderWidth="2px" borderColor="gray.200" fontWeight="bold" 
                        w="full" p={3} outline="none" cursor="pointer" 
                        {...({ 
                          value: isCreatingNewSet ? 'new' : targetSetId,
                          onChange: (e: any) => { 
                            if (e.target.value === 'new') setIsCreatingNewSet(true); 
                            else { setIsCreatingNewSet(false); setTargetSetId(e.target.value); } 
                          } 
                        } as any)}
                      >
                      <option value="">-- Chọn bộ từ --</option>
                      {sets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      <option value="new" style={{ fontWeight: 'bold', color: '#58cc02' }}>+ Tạo bộ từ mới</option>
                    </Box>
                  </Box>
                  {isCreatingNewSet && (
                    <Box flex={1.5}>
                      <Text fontSize="xs" fontWeight="black" color="gray.500" mb={2} textTransform="uppercase">Tên bộ từ mới <Text as="span" color="red.500">*</Text></Text>
                      <Input bg="white" borderRadius="xl" borderWidth="2px" borderColor="gray.300" fontWeight="bold" p={3} h="auto" placeholder="Nhập tên bộ từ vựng mới..." value={newSetName} onChange={(e) => setNewSetName(e.target.value)} />
                    </Box>
                  )}
               </HStack>
               
               <Textarea 
                 value={aiInputText} onChange={(e) => setAiInputText(e.target.value)} 
                 w="full" h="180px" p={5} borderRadius="2xl" border="2px solid #e2e8f0" 
                 placeholder="Nhập chủ đề (VD: Trái cây) hoặc dán đoạn văn bản cần bóc tách từ vựng..." 
                 _focus={{ borderColor: '#58cc02', outline: 'none' }} fontSize="md" fontWeight="medium"
               />
             </VStack>
             <Text textAlign="center" fontSize="sm" color={aiUsageCount >= MAX_AI_USES ? "red.500" : "gray.500"} mb={4} fontWeight="medium">
               Bạn còn {Math.max(0, MAX_AI_USES - aiUsageCount)}/{MAX_AI_USES} lượt tạo AI hôm nay.
             </Text>
             {/* FIX LỖI TS 6: Sửa chữ isLoading thành loading (Chuẩn Chakra UI v3) */}
             <Button 
               {...duoButtonStyle} w="full" h="65px" fontSize="xl" 
               {...({ loading: isAiLoading, disabled: aiUsageCount >= MAX_AI_USES } as any)} 
               loadingText="ĐANG PHÂN TÍCH..." onClick={handleGenerateAI}
             >
               TẠO VỚI AI NGAY
             </Button>
          </Box>
        </Flex>
      )}
    </Box>
  );
}