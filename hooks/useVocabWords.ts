"use client";
// File: hooks/useVocabWords.ts
import { useState, useEffect, useCallback } from 'react';
import { vocabWordService, Word } from '@/lib/services/vocabWordService';
import { useSearchParams } from 'next/navigation';

export function useVocabWords() {
  const searchParams = useSearchParams();
  const setId = searchParams.get('setId'); 
  
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vocabWordService.getWordsBySet(setId);
      setWords(data); 
    } catch (error) {
      console.error(error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }, [setId]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const addWord = async (data: Omit<Word, 'id' | 'isLearned' | 'setId'>) => {
    if (!setId) return;
    await vocabWordService.addWord({ ...data, setId });
    await fetchWords(); 
  };

  const removeWord = async (id: string | number) => {
    await vocabWordService.deleteWord(String(id));
    await fetchWords(); 
  };

  // KẾT NỐI HỆ THỐNG SRS (HỌC NGẮT QUÃNG)
  const toggleLearned = async (id: string | number, currentStatus: boolean) => {
    // 1. Optimistic UI: Nhảy giao diện trước cho mượt
    setWords(prev => prev.map(w => String(w.id) === String(id) ? { ...w, isLearned: !currentStatus } : w));
    
    // 2. Gửi thẳng vào hệ thống SRS để tính toán ngày ôn tập tiếp theo
    try {
      const res = await fetch('/api/user/srs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: String(id), isLearned: !currentStatus })
      });
      if (!res.ok) throw new Error("Lỗi lưu SRS");
    } catch (error) {
      // Rollback nếu API sập
      setWords(prev => prev.map(w => String(w.id) === String(id) ? { ...w, isLearned: currentStatus } : w));
    }
  };

  const updateLearnedBulk = async (ids: string[], newStatus: boolean) => {
    setWords(prev => prev.map(w => ids.includes(String(w.id)) ? { ...w, isLearned: newStatus } : w));
    try {
      await vocabWordService.updateWordsBulk(ids, { isLearned: newStatus });
    } catch (error) {
      await fetchWords(); 
    }
  };

  const addWordsBulk = async (dataArray: Omit<Word, 'id' | 'isLearned'>[]) => {
    await vocabWordService.addWordsBulk(dataArray);
    await fetchWords();
  };

  const removeWordsBulk = async (ids: string[]) => {
    await vocabWordService.deleteWordsBulk(ids);
    await fetchWords();
  };

  return { 
    words, isLoading, setId, 
    addWord, toggleLearned, removeWord, 
    addWordsBulk, updateLearnedBulk, removeWordsBulk, 
    refresh: fetchWords 
  };
}