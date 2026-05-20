// File: lib/services/vocabSetService.ts

export type VocabSet = {
  id: string; // Chuyển sang string vì MongoDB dùng ObjectID dạng string
  title: string;
  desc: string;
  words: number;
  progress: number | null;
  emoji: string;
  emojiBg: string;
};

export const vocabSetService = {
  // Lấy danh sách bộ từ
  getSets: async (): Promise<VocabSet[]> => {
    const res = await fetch('/api/vocab-sets');
    if (!res.ok) throw new Error('Lỗi tải danh sách bộ từ');
    return res.json();
  },

  // Tạo bộ từ mới
  createSet: async (newSet: Omit<VocabSet, 'id' | 'words' | 'progress'>): Promise<VocabSet> => {
    const res = await fetch('/api/vocab-sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSet)
    });
    if (!res.ok) throw new Error('Lỗi tạo bộ từ mới');
    const response = await res.json();
    return response.data;
  },

  // Cập nhật bộ từ
  updateSet: async (id: string, updatedData: Partial<VocabSet>): Promise<VocabSet> => {
    const res = await fetch(`/api/vocab-sets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('Lỗi cập nhật bộ từ');
    const response = await res.json();
    return response.data;
  },

  // Xóa bộ từ
  deleteSet: async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/vocab-sets/${id}`, { 
      method: 'DELETE' 
    });
    if (!res.ok) throw new Error('Lỗi xóa bộ từ');
    return true;
  }
};