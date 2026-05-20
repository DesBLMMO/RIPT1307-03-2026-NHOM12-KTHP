// File: hooks/useVocabSets.ts
import { useState, useEffect, useCallback } from 'react';
import { vocabSetService, VocabSet } from '@/lib/services/vocabSetService';

export function useVocabSets() {
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vocabSetService.getSets();
      setSets(data);
    } catch (error) {
      console.error('Lỗi khi tải bộ từ vựng:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const addSet = async (newSet: Omit<VocabSet, 'id' | 'words' | 'progress'>) => {
    try {
      await vocabSetService.createSet(newSet);
      await fetchSets();
    } catch (error) {
      console.error('Lỗi thêm bộ từ vựng', error);
    }
  };

  const editSet = async (id: string | number, updatedData: Partial<VocabSet>) => {
    try {
      await vocabSetService.updateSet(String(id), updatedData);
      await fetchSets();
    } catch (error) {
      console.error('Lỗi cập nhật bộ từ vựng', error);
    }
  };

  const removeSet = async (id: string | number) => {
    try {
      await vocabSetService.deleteSet(String(id));
      await fetchSets();
    } catch (error) {
      console.error('Lỗi xóa bộ từ vựng', error);
    }
  };

  return { sets, isLoading, addSet, editSet, removeSet, refresh: fetchSets };
}