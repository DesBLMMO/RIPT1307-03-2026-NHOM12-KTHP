// File: lib/services/vocabWordService.ts

export type Word = {
  id: string;
  setId: string;
  word: string;
  phonetic: string;
  meaning: string;
  type: string;
  exampleEn: string;
  exampleVi: string;
  isLearned: boolean;
};

export const vocabWordService = {
  // Lấy tất cả từ vựng theo ID của Bộ từ
 //  getWordsBySet: async (setId: string | null): Promise<Word[]> => {
  //  if (!setId || setId === 'Tất cả') return []; 
  //  const res = await fetch(`/api/vocab-sets/${setId}/words`);
   // if (!res.ok) throw new Error('Lỗi lấy danh sách từ vựng');
    //return res.json();
  //},
  // Trong file chứa hàm getWordsBySet của bạn (thường là lib/services/vocabWordService.ts)

getWordsBySet: async (setId: string | null): Promise<Word[]> => {
  // 1. Xây dựng URL động: 
  // Nếu setId là 'Tất cả' hoặc null -> gọi API tổng
  // Nếu có setId cụ thể -> gọi API kèm query param
  const isAll = !setId || setId === 'Tất cả' || setId === 'null';
  const url = isAll ? '/api/words' : `/api/words?setId=${setId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Thêm cache control để tránh việc trình duyệt nhớ lại dữ liệu cũ
      'Cache-Control': 'no-cache'
    }
  });

  if (!res.ok) {
    throw new Error('Lỗi lấy danh sách từ vựng từ server');
  }

  return res.json();
},
  // Thêm 1 từ mới
  addWord: async (wordData: Omit<Word, 'id' | 'isLearned'>): Promise<Word> => {
    const res = await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wordData)
    });
    if (!res.ok) throw new Error('Lỗi thêm từ mới');
    const response = await res.json();
    return response.data;
  },

  // Thêm nhiều từ cùng lúc (Dành cho Excel / AI)
  addWordsBulk: async (wordsData: Omit<Word, 'id' | 'isLearned'>[]): Promise<Word[]> => {
    const res = await fetch('/api/words/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: wordsData })
    });
    if (!res.ok) throw new Error('Lỗi thêm danh sách từ');
    const response = await res.json();
    return response.data;
  },

  // Cập nhật nhiều từ cùng lúc
  updateWordsBulk: async (ids: string[], data: Partial<Word>): Promise<boolean> => {
    const res = await fetch('/api/words/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, data })
    });
    if (!res.ok) throw new Error('Lỗi cập nhật hàng loạt');
    return true;
  },

  // Xóa nhiều từ cùng lúc
  deleteWordsBulk: async (ids: string[]): Promise<boolean> => {
    const res = await fetch('/api/words/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Lỗi xóa hàng loạt');
    return true;
  },

  // Cập nhật 1 từ (Sửa lỗi chính tả, nghĩa...)
  updateWord: async (id: string, data: Partial<Word>): Promise<Word> => {
    const res = await fetch(`/api/words/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Lỗi cập nhật từ');
    const response = await res.json();
    return response.data;
  },

  // Xóa 1 từ
  deleteWord: async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/words/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Lỗi xóa từ');
    return true;
  },

  // API TẠO TỪ VỚI AI
  generateWordsWithAI: async (prompt: string): Promise<Partial<Word>[]> => {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Lỗi AI tạo từ');
    const response = await res.json();
    return response.words;
  }
};