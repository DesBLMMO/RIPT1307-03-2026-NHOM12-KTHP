import { 
  List, CheckSquare, LayoutGrid, Type, Headphones, Shuffle, User, Image as ImageIcon, Star, Archive
} from 'lucide-react';

export const quickAccess = [
  { title: 'Thêm từ', desc: 'Tạo từ vựng cá nhân', iconColor: '#2563eb', bg: '#eff6ff' },
  { title: 'Luyện tập', desc: 'Flashcard & Games', iconColor: '#9333ea', bg: '#faf5ff' },
  { title: 'Xếp hạng', desc: 'Xem thành tích', iconColor: '#ea580c', bg: '#fff7ed' },
  { title: 'Cộng đồng', desc: 'Chọn Fb hoặc Zalo', iconColor: '#16a34a', bg: '#f0fdf4' },
];

export const filters = [
  'Tất cả', 'THPT', 'Sách IELTS', 'IELTS', 'TOEIC', 
  'Người nổi tiếng khuyên dùng', 'Theo level', 'Người đi làm & Chuyên ngành', 'THCS & Tiểu học'
];

export const courseCategories = [
  {
    category: 'THPT',
    count: '12 lộ trình',
    items: [
      { title: 'Luyện thi HSA - VACT', sets: 29, difficulty: 1 },
      { title: 'Từ vựng VIP 90 Cô MP (2026)', sets: 18, difficulty: 2 },
      { title: 'Collocation, cụm động từ, cấu trúc quan trọng thi THPTQG 2026 (cô Ma...', sets: 21, difficulty: 3 },
      { title: 'TỪ VỰNG C1-C2 THƯỜNG XUYÊN XUẤT HIỆN( Cô Mai Phương)', sets: 8, difficulty: 5 },
      { title: 'Anh 10 Global Success', sets: 10, difficulty: 1 }
    ]
  },
  {
    category: 'Sách IELTS',
    count: '8 lộ trình',
    note: 'Vocab in use ; Quyển CAM',
    items: [
      { title: 'Vocabulary In Use Elementary', sets: 50, difficulty: 1 },
      { title: 'Cambridge Practice Tests for IELTS (18-20)', sets: 30, difficulty: 2 },
      { title: 'Vocabulary in Use - Pre-intermediate & Intermediate', sets: 100, difficulty: 3 },
      { title: 'Vocabulary In Use - Upper-Intermediate', sets: 101, difficulty: 4 },
      { title: 'Vocabulary In Use - Advanced', sets: 102, difficulty: 5 }
    ]
  }
];

export const vocabularySets = [
  { id: 1, title: 'a', desc: 'Không có mô tả', words: 0, progress: null, emoji: '✏️', emojiBg: '#ffedd5' },
  { id: 2, title: 'Bộ từ vựng của tôi', desc: 'Bộ từ vựng đầu tiên của bạn', words: 10, progress: 0, emoji: '🗂️', emojiBg: '#f3e8ff' },
];

// CHỈ KHAI BÁO vocabStats 1 LẦN DUY NHẤT Ở ĐÂY
export const vocabStats = {
  total: 10,
  learned: 0,
  unlearned: 10,
  progress: '0%'
};

export const vocabList = [
  { word: 'hold', phonetic: '/hoʊld/', meaning: 'cầm, giữ', type: 'VERB', exampleEn: 'Please hold my bag for a moment.', exampleVi: '(Làm ơn cầm túi giúp tôi một...)' },
  { word: 'grasp', phonetic: '/ɡræsp/', meaning: 'nắm chặt, hiểu rõ', type: 'VERB', exampleEn: 'She grasped the rope tightly.', exampleVi: '(Cô ấy nắm chặt sợi dây thừng.)' },
  { word: 'clutch', phonetic: '/klʌtʃ/', meaning: 'nắm chặt (thường vì sợ hãi hoặc tuyệt vọng)', type: 'VERB', exampleEn: 'He clutched his ticket nervously.', exampleVi: '(Anh ấy nắm chặt vé của mình một...)' },
  { word: 'grip', phonetic: '/ɡrɪp/', meaning: 'sự nắm giữ, sức mạnh của việc nắm giữ', type: 'NOUN', exampleEn: 'The hammer has a comfortable grip.', exampleVi: '(Cái búa có phần tay cầm...)' },
  { word: 'take', phonetic: '/teɪk/', meaning: 'cầm lấy, nhận lấy', type: 'VERB', exampleEn: 'Take this book.', exampleVi: '(Cầm lấy cuốn sách này đi.)' },
];

export const gameFilterOptions = [
  { label: 'Bộ từ vựng', value: 'Tất cả bộ từ' },
  { label: 'Bộ lọc', value: 'Chưa thuộc' },
  { label: 'Thứ tự', value: 'Ngẫu nhiên' },
  { label: 'Số lượng', value: '20 từ' },
];

export const gameModes = [
  { id: 'flashcard', title: 'Flashcard', desc: 'Lật thẻ học từ vựng', coin: 5, icon: List, bg: '#7e57c2' },
  { id: 'quiz', title: 'Trắc nghiệm', desc: 'Chọn đáp án đúng', coin: 10, icon: CheckSquare, bg: '#ff9800' },
  { id: 'match', title: 'Nối từ với nghĩa', desc: 'Ghép đôi từ vựng và nghĩa', coin: 10, icon: LayoutGrid, bg: '#29b6f6' },
  { id: 'typing', title: 'Gõ từ vựng', desc: 'Nhìn nghĩa và gõ từ tiến...', coin: 10, icon: Type, bg: '#66bb6a' },
  { id: 'listen', title: 'Nghe viết', desc: 'Nghe phát âm và viết từ', coin: 15, icon: Headphones, bg: '#00bcd4' },
  { id: 'mixed', title: 'Tổng hợp', desc: 'Hỗn hợp + Flappy Bird', coin: 20, icon: Shuffle, bg: '#ff4081', isHot: true, glow: '0 0 20px rgba(255,64,129,0.4)' },
];

export const leaderboardData = [
  { name: 'Huỳnh Việt Quang', score: 138, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Nguyễn Thị Hải Linh', score: 48, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Lilcwinters', score: 37, avatar: null, initial: 'N', bg: '#818cf8' },
  { name: 'nthanh 12a1', score: 37, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Hiếu Chanel', score: 34, avatar: null, initial: 'H', bg: '#f97316' },
  { name: 'TH', score: 33, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Nhi Uyên', score: 29, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { name: 'taylorngos undefined', score: 27, avatar: null, initial: 't', bg: '#818cf8' },
  { name: 'Nhi Phùng Yến', score: 27, avatar: null, initial: 'N', bg: '#14b8a6' },
];

export const chatMessages = [
  { sender: 'Xuân Đức admin Trưởng', time: 'Vừa xong', text: 'mình mới sửa lun r nhaa', isAdmin: true },
  { sender: 'le ut', time: 'Vừa xong', text: 'admin ơii em nhắn fb rùi ạ', isAdmin: false },
];

export const storeTabs = [
  { id: 'avatar', label: 'Ảnh đại diện', icon: User },
  { id: 'background', label: 'Hình nền', icon: ImageIcon },
  { id: 'special', label: 'Đặc biệt', icon: Star },
  { id: 'inventory', label: 'Kho (0)', icon: Archive },
];

export const storeItems = [
  { id: 1, type: 'upload', title: 'Ảnh đại diện tự upload', desc: 'Mua ô upload cá nhân với 20,000 xu.', price: 20000, buttonText: 'Mua & upload' },
  { id: 2, type: 'image', title: 'HNUE chờ tôi nhé', desc: '', price: 1000, image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop', buttonText: 'Mua' },
  { id: 3, type: 'image', title: 'NEU chờ tôi nhé', desc: '', price: 1000, image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop', buttonText: 'Mua' },
  { id: 4, type: 'image', title: 'HUST chờ tôi nợ môn nhé', desc: '', price: 1000, image: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=200&fit=crop', buttonText: 'Mua' },
  { id: 5, type: 'image', title: 'FTU chờ tôi nhé', desc: '', price: 1000, image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop', buttonText: 'Mua' },
  { id: 6, type: 'image', title: 'TMU chờ tôi nhé', desc: '', price: 1000, image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400&h=200&fit=crop', buttonText: 'Mua' },
];