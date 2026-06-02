"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Flex, Text, HStack, VStack, SimpleGrid, Progress, IconButton, 
  Button, Input, Grid, Badge, Center, Spinner
} from '@chakra-ui/react';
import { 
  Users, Search, ShieldAlert, RefreshCw, 
  Crown, Plus, Download, BookOpen, Edit, Trash2, 
  Flame, Star, BarChart2, CheckCircle, XCircle, Coins, X
} from 'lucide-react';
import { toaster } from "@/components/ui/toaster";

const DIFF_COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'COURSES' | 'QUESTS'>('USERS');

  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterPro, setFilterPro] = useState<'ALL' | 'PRO' | 'FREE'>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'coins' | 'streakCount'>('createdAt');
  const limit = 8;
  // ===== QUEST MODAL STATE =====
const [selectedUser, setSelectedUser] = useState<any>(null);
const [userQuests, setUserQuests] = useState<any[]>([]);
const [userBadges, setUserBadges] = useState<any[]>([]);
const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const percent =
  (userQuests.filter(q => q.isCompleted).length /
    (userQuests.length || 1)) *
  100;
  const fetchUsersData = async (page: number, keyword: string) => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(keyword)}`, { cache: 'no-store' });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setUsers(result.data);
          setCurrentPage(result.pagination.currentPage);
          setTotalPages(result.pagination.totalPages);
          setTotalUsers(result.pagination.totalUsers);
        }
      } else if (res.status === 403 || res.status === 401) {
        toaster.create({ title: "Không có quyền Admin!", type: "error" });
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingUsers(false); }
  };

  useEffect(() => {
    if (activeTab !== 'USERS'&& activeTab !== 'QUESTS') return;
    const t = setTimeout(() => fetchUsersData(currentPage, searchTerm), 300);
    return () => clearTimeout(t);
  }, [currentPage, searchTerm, activeTab]);

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (filterPro === 'PRO') list = list.filter(u => u.isPro);
    if (filterPro === 'FREE') list = list.filter(u => !u.isPro);
    list.sort((a, b) => (b[sortBy] || 0) > (a[sortBy] || 0) ? 1 : -1);
    return list;
  }, [users, filterPro, sortBy]);

  const stats = useMemo(() => {
    const proCount = users.filter(u => u.isPro).length;
    const totalCoins = users.reduce((s, u) => s + (u.coins || 0), 0);
    const avgStreak = users.length ? Math.round(users.reduce((s, u) => s + (u.streakCount || 0), 0) / users.length) : 0;
    return [
      { label: "Tổng học viên", value: totalUsers.toString(), icon: Users, gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
      { label: "Hội viên PRO", value: proCount.toString(), icon: Crown, gradient: "linear-gradient(135deg,#f59e0b,#f97316)" },
      { label: "Xu lưu thông", value: totalCoins.toLocaleString(), icon: Coins, gradient: "linear-gradient(135deg,#10b981,#059669)" },
      { label: "Streak TB (ngày)", value: avgStreak.toString(), icon: Flame, gradient: "linear-gradient(135deg,#ef4444,#f97316)" },
    ];
  }, [users, totalUsers]);

  const handleTogglePro = async (id: string, name: string) => {
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, action: 'TOGGLE_PRO' }) });
    if (res.ok) { toaster.create({ title: `Đã cập nhật ${name}`, type: "success" }); fetchUsersData(currentPage, searchTerm); }
  };

  const handleAddCoins = async (id: string, name: string) => {
    const amount = window.prompt(`Thưởng xu cho ${name}:`);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, action: 'ADD_COINS', amount: Number(amount) }) });
    if (res.ok) { toaster.create({ title: `+${amount} xu cho ${name}`, type: "success" }); fetchUsersData(currentPage, searchTerm); }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/users?page=1&limit=10000&search=${encodeURIComponent(searchTerm)}`, { cache: 'no-store' });
      const result = await res.json();
      const data = result.data || users;
      const rows = [["ID","Tên","Email","Xu","Streak","Loại","Ngày đăng ký"].join(",")];
      data.forEach((u: any) => rows.push([u.id, `"${u.name||''}"`, `"${u.email}"`, u.coins||0, u.streakCount||0, u.isPro?"PRO":"Free", new Date(u.createdAt).toLocaleDateString("vi-VN")].join(",")));
      const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `HocVien_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toaster.create({ title: "Xuất CSV thành công!", type: "success" });
    } catch { toaster.create({ title: "Lỗi xuất file", type: "error" }); }
    finally { setIsExporting(false); }
  };

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: '', title: '', category: '', difficulty: 1, isPremium: false, description: '' });

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const res = await fetch('/api/admin/courses', { cache: 'no-store' });
      const result = await res.json();
      if (result.success) setCourses(result.data);
    } catch (e) { console.error(e); }
    finally { setIsLoadingCourses(false); }
  };
  const openQuestModal = async (user: any) => {
  setSelectedUser(user);
  setIsQuestModalOpen(true);
  setIsLoadingDetail(true);

  try {
    const res = await fetch(`/api/admin/quest?userId=${user.id}`);
    const result = await res.json();

    if (result.success) {
      setUserQuests(result.quests);
      setUserBadges(result.badges);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoadingDetail(false);
  }
};
  useEffect(() => { if (activeTab === 'COURSES') fetchCourses(); }, [activeTab]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch) return courses;
    return courses.filter(c => c.title?.toLowerCase().includes(courseSearch.toLowerCase()) || c.category?.toLowerCase().includes(courseSearch.toLowerCase()));
  }, [courses, courseSearch]);

  const courseStats = useMemo(() => {
    const proCount = courses.filter(c => c.isPremium).length;
    const categories = [...new Set(courses.map(c => c.category))].length;
    return { total: courses.length, pro: proCount, free: courses.length - proCount, categories };
  }, [courses]);

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.category) { toaster.create({ title: "Thiếu thông tin!", type: "error" }); return; }
    const res = await fetch('/api/admin/courses', { 
      method: isEditing ? 'PATCH' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ ...courseForm, isPro: courseForm.isPremium }) 
    });
    if (res.ok) { 
      toaster.create({ title: isEditing ? "Đã cập nhật" : "Tạo thành công", type: "success" }); 
      setIsCourseModalOpen(false); 
      fetchCourses(); 
    } else {
      toaster.create({ title: "Lỗi lưu dữ liệu", type: "error" });
    }
  };
  
  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Xóa "${title}"?`)) return;
    const res = await fetch(`/api/admin/courses?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toaster.create({ title: "Đã xóa", type: "success" }); fetchCourses(); }
  };

  const openCreateModal = () => {
    setCourseForm({ id: '', title: '', category: '', difficulty: 1, isPremium: false, description: '' });
    setIsEditing(false);
    setIsCourseModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setCourseForm({ 
      id: course.id, 
      title: course.title || '', 
      category: course.category || '', 
      difficulty: course.difficulty || 1, 
      isPremium: !!(course.isPremium), 
      description: course.description || '' 
    });
    setIsEditing(true);
    setIsCourseModalOpen(true);
  };

  const getInitials = (name: string) => (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const getAvatarColor = (email: string) => { const colors = ['#6366f1','#8b5cf6','#ec4899','#f97316','#10b981','#3b82f6','#14b8a6']; return colors[email?.charCodeAt(0) % colors.length] || '#6366f1'; };

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} w="100vw" h="100vh" bg="#f0f2f5" zIndex={9999} overflowY="auto">
      <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">

        {/* HEADER */}
        <Flex justify="space-between" align="center" mb={8} direction={{ base: 'column', sm: 'row' }} gap={4}>
          <HStack gap={4}>
            <Flex w={12} h={12} borderRadius="2xl" background="linear-gradient(135deg,#6366f1,#8b5cf6)" align="center" justify="center" shadow="lg">
              <BarChart2 size={24} color="white" />
            </Flex>
            <VStack align="start" gap={0}>
              <Text fontSize="2xl" fontWeight="black" color="gray.800">Admin Portal</Text>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Trung tâm điều khiển hệ thống Chantude</Text>
            </VStack>
          </HStack>
          <HStack gap={3}>
            <Button bg="white" color="gray.700" borderWidth="1px" borderColor="gray.200" borderRadius="xl" fontWeight="bold" fontSize="sm" gap={2} shadow="sm" _hover={{ shadow: 'md', bg: 'gray.50' }} onClick={handleExportCSV} {...({loading: isExporting} as any)}>
              <Download size={16} /> Xuất CSV
            </Button>
            <Button background="linear-gradient(135deg,#6366f1,#8b5cf6)" color="white" borderRadius="xl" fontWeight="bold" fontSize="sm" gap={2} shadow="md" _hover={{ opacity: 0.9 }} onClick={() => activeTab === 'USERS'|| activeTab === 'QUESTS' ? fetchUsersData(currentPage, searchTerm) : fetchCourses()}>
              <RefreshCw size={16} /> Làm mới
            </Button>
          </HStack>
        </Flex>

        {/* TABS */}
        <Flex gap={2} mb={8} bg="white" p={1.5} borderRadius="2xl" shadow="sm" w="fit-content">
          {[
            { key: 'USERS', label: 'Học viên', icon: Users },
            { key: 'COURSES', label: 'Lộ trình', icon: BookOpen },
            { key: 'QUESTS', label: 'Nhiệm vụ', icon: Flame },
          ].map(tab => (
            <Button key={tab.key}
              bg={activeTab === tab.key ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent"}
              color={activeTab === tab.key ? "white" : "gray.500"}
              borderRadius="xl" px={6} fontWeight="bold" gap={2} shadow={activeTab === tab.key ? "md" : "none"}
              _hover={{ bg: activeTab === tab.key ? undefined : "gray.100" }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <tab.icon size={18} /> {tab.label}
            </Button>
          ))}
        </Flex>

        {/* TAB USERS */}
        {activeTab === 'USERS' && (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
              {stats.map((s, i) => (
                <Flex key={i} bg="white" p={5} borderRadius="2xl" shadow="sm" align="center" gap={4} borderWidth="1px" borderColor="gray.100" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
                  <Flex w={14} h={14} borderRadius="2xl" background={s.gradient} align="center" justify="center" shadow="md" flexShrink={0}>
                    <s.icon size={24} color="white" />
                  </Flex>
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">{s.label}</Text>
                    <Text fontSize="2xl" fontWeight="black" color="gray.800">{s.value}</Text>
                  </VStack>
                </Flex>
              ))}
            </SimpleGrid>

            <Box bg="white" borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden" mb={6}>
              <Flex px={6} py={4} borderBottomWidth="1px" borderColor="gray.100" justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                <Text fontWeight="black" fontSize="lg" color="gray.800">Danh sách tài khoản <Text as="span" color="purple.500">({totalUsers})</Text></Text>
                <HStack gap={3} flexWrap="wrap">
                  <Flex align="center" bg="gray.50" borderRadius="xl" px={4} h={10} gap={2} borderWidth="1px" borderColor="gray.100" w="220px">
                    <Search size={16} color="#9ca3af" />
                    <Input placeholder="Tìm tên / email..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} border="none" bg="transparent" _focus={{ boxShadow: 'none' }} fontSize="sm" fontWeight="medium" p={0} />
                  </Flex>
                  <HStack bg="gray.50" borderRadius="xl" p={1} gap={1} borderWidth="1px" borderColor="gray.100">
                    {(['ALL','PRO','FREE'] as const).map(f => (
                      <Button key={f} size="xs" borderRadius="lg" bg={filterPro === f ? "white" : "transparent"} color={filterPro === f ? "purple.600" : "gray.500"} fontWeight="bold" shadow={filterPro === f ? "sm" : "none"} onClick={() => setFilterPro(f)} px={3}>{f}</Button>
                    ))}
                  </HStack>
                  <Box as="select" bg="gray.50" borderRadius="xl" px={3} h={10} fontSize="sm" fontWeight="bold" color="gray.600" borderWidth="1px" borderColor="gray.100" outline="none" cursor="pointer"
                    {...({ value: sortBy, onChange: (e: any) => setSortBy(e.target.value) } as any)}>
                    <option value="createdAt">Mới nhất</option>
                    <option value="coins">Nhiều xu nhất</option>
                    <option value="streakCount">Streak cao nhất</option>
                  </Box>
                </HStack>
              </Flex>

              {isLoadingUsers ? (
                <Center py={16}><Spinner size="xl" color="purple.500" /></Center>
              ) : (
                <Box overflowX="auto">
                  <Box minW="800px">
                    <Grid templateColumns="2.5fr 1fr 1fr 1.2fr 1.8fr" px={6} py={3} bg="gray.50" fontSize="11px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                      <Text>Học viên</Text><Text>Xu</Text><Text>Streak</Text><Text>Loại tài khoản</Text><Text textAlign="center">Thao tác</Text>
                    </Grid>
                    <VStack gap={0} align="stretch">
                      {filteredUsers.map((user) => (
                        <Grid key={user.id} templateColumns="2.5fr 1fr 1fr 1.2fr 1.8fr" px={6} py={4} alignItems="center" borderTopWidth="1px" borderColor="gray.50" _hover={{ bg: "#fafbff" }} transition="0.15s">
                          <HStack gap={3}>
                            <Flex w={10} h={10} borderRadius="full" bg={getAvatarColor(user.email)} align="center" justify="center" color="white" fontWeight="black" fontSize="sm" flexShrink={0} shadow="sm">
                              {getInitials(user.name)}
                            </Flex>
                            <VStack align="start" gap={0}>
                              <HStack gap={2}>
                                <Text fontWeight="bold" fontSize="sm" color="gray.800">{user.name || "Chưa đặt tên"}</Text>
                                {user.isPro && <Crown size={12} color="#f59e0b" fill="#f59e0b" />}
                              </HStack>
                              <Text fontSize="xs" color="gray.400">{user.email}</Text>
                            </VStack>
                          </HStack>
                          <HStack gap={1}>
                            <Text fontSize="xs">🪙</Text>
                            <Text fontWeight="bold" fontSize="sm" color="gray.700">{(user.coins||0).toLocaleString()}</Text>
                          </HStack>
                          <HStack gap={1}>
                            {(user.streakCount||0) > 0 ? <Flame size={14} color="#f97316" fill="#f97316" /> : null}
                            <Text fontWeight="bold" fontSize="sm" color={(user.streakCount||0) > 0 ? "orange.500" : "gray.300"}>{user.streakCount||0}</Text>
                          </HStack>
                          <Flex>
                            <Badge px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="black" bg={user.isPro ? "#fef3c7" : "#f3f4f6"} color={user.isPro ? "#d97706" : "#6b7280"}>
                              {user.isPro ? '👑 PRO' : 'Free'}
                            </Badge>
                          </Flex>
                          <HStack gap={2} justify="center">
                            <Button size="xs" bg="#fef3c7" color="#d97706" borderRadius="lg" fontWeight="bold" gap={1} _hover={{ bg: '#fde68a' }} onClick={() => handleAddCoins(user.id, user.name)}>
                              <Plus size={11} /> Thưởng xu
                            </Button>
                            <Button size="xs" bg={user.isPro ? "#f3f4f6" : "#ede9fe"} color={user.isPro ? "#6b7280" : "#7c3aed"} borderRadius="lg" fontWeight="bold" gap={1} _hover={{ opacity: 0.8 }} onClick={() => handleTogglePro(user.id, user.name)}>
                              {user.isPro ? <><XCircle size={11} /> Hủy PRO</> : <><Crown size={11} /> Cấp PRO</>}
                            </Button>
                          </HStack>
                        </Grid>
                      ))}
                      {filteredUsers.length === 0 && (
                        <Center py={16} flexDirection="column" gap={3}>
                          <ShieldAlert size={40} color="#d1d5db" />
                          <Text fontWeight="bold" color="gray.300">Không có học viên nào</Text>
                        </Center>
                      )}
                    </VStack>
                  </Box>
                </Box>
              )}

              <Flex px={6} py={4} borderTopWidth="1px" borderColor="gray.100" justify="space-between" align="center">
                <Text fontSize="xs" color="gray.400" fontWeight="medium">Trang {currentPage}/{totalPages} · {totalUsers} học viên</Text>
                <HStack gap={2}>
                  <Button size="sm" variant="outline" borderRadius="lg" borderColor="gray.200" fontWeight="bold" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p-1,1))}>← Trước</Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, currentPage - 2) + i;
                    if (p > totalPages) return null;
                    return (
                      <Button key={p} size="sm" borderRadius="lg" fontWeight="bold"
                        bg={p === currentPage ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "white"}
                        color={p === currentPage ? "white" : "gray.600"}
                        borderWidth="1px" borderColor={p === currentPage ? "transparent" : "gray.200"}
                        onClick={() => setCurrentPage(p)}>{p}</Button>
                    );
                  })}
                  <Button size="sm" variant="outline" borderRadius="lg" borderColor="gray.200" fontWeight="bold" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))}>Sau →</Button>
                </HStack>
              </Flex>
            </Box>
          </>
        )}

        {/* TAB COURSES */}
        {activeTab === 'COURSES' && (
          <>
            <SimpleGrid columns={{ base: 2, lg: 4 }} gap={5} mb={8}>
              {[
                { label: "Tổng lộ trình", value: courseStats.total, color: "#6366f1", bg: "#ede9fe", icon: BookOpen },
                { label: "Lộ trình PRO", value: courseStats.pro, color: "#f59e0b", bg: "#fef3c7", icon: Crown },
                { label: "Miễn phí", value: courseStats.free, color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
                { label: "Danh mục", value: courseStats.categories, color: "#3b82f6", bg: "#dbeafe", icon: Star },
              ].map((s, i) => (
                <Flex key={i} bg="white" p={5} borderRadius="2xl" shadow="sm" align="center" gap={4} borderWidth="1px" borderColor="gray.100">
                  <Flex w={12} h={12} borderRadius="xl" bg={s.bg} align="center" justify="center" flexShrink={0}>
                    <s.icon size={22} color={s.color} />
                  </Flex>
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400">{s.label}</Text>
                    <Text fontSize="2xl" fontWeight="black" color="gray.800">{s.value}</Text>
                  </VStack>
                </Flex>
              ))}
            </SimpleGrid>

            <Box bg="white" borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
              <Flex px={6} py={4} borderBottomWidth="1px" borderColor="gray.100" justify="space-between" align="center" gap={4}>
                <Text fontWeight="black" fontSize="lg" color="gray.800">Danh sách lộ trình <Text as="span" color="purple.500">({courses.length})</Text></Text>
                <HStack gap={3}>
                  <Flex align="center" bg="gray.50" borderRadius="xl" px={4} h={10} gap={2} borderWidth="1px" borderColor="gray.100" w="220px">
                    <Search size={16} color="#9ca3af" />
                    <Input placeholder="Tìm lộ trình..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)} border="none" bg="transparent" _focus={{ boxShadow: 'none' }} fontSize="sm" p={0} />
                  </Flex>
                  <Button background="linear-gradient(135deg,#6366f1,#8b5cf6)" color="white" borderRadius="xl" fontWeight="bold" gap={2} shadow="md" _hover={{ opacity: 0.9 }} onClick={openCreateModal}>
                    <Plus size={18} /> Tạo mới
                  </Button>
                </HStack>
              </Flex>

              {isLoadingCourses ? (
                <Center py={16}><Spinner size="xl" color="purple.500" /></Center>
              ) : (
                <Box overflowX="auto">
                  <Box minW="800px">
                    <Grid templateColumns="2.5fr 1.2fr 1fr 1fr 1.5fr" px={6} py={3} bg="gray.50" fontSize="11px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                      <Text>Tên lộ trình</Text><Text>Danh mục</Text><Text>Độ khó</Text><Text>Loại</Text><Text textAlign="center">Thao tác</Text>
                    </Grid>
                    <VStack gap={0} align="stretch">
                      {filteredCourses.map(course => (
                        <Grid key={course.id} templateColumns="2.5fr 1.2fr 1fr 1fr 1.5fr" px={6} py={4} alignItems="center" borderTopWidth="1px" borderColor="gray.50" _hover={{ bg: "#fafbff" }} transition="0.15s">
                          <VStack align="start" gap={0.5}>
                            <Text fontWeight="bold" fontSize="sm" color="gray.800">{course.title}</Text>
                            {course.description && (
                              <Text fontSize="xs" color="gray.400" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                {course.description}
                              </Text>
                            )}
                          </VStack>
                          <Badge bg="#ede9fe" color="#7c3aed" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold" w="fit-content">{course.category}</Badge>
                          <HStack gap={2}>
                            <Box w="60px" h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                              <Box h="full" w={`${(course.difficulty/5)*100}%`} bg={DIFF_COLORS[course.difficulty] || '#6366f1'} borderRadius="full" />
                            </Box>
                            <Text fontSize="xs" fontWeight="black" color={DIFF_COLORS[course.difficulty] || '#6366f1'}>{course.difficulty}/5</Text>
                          </HStack>
                          <Badge px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="black"
                            bg={course.isPremium ? "#fef3c7" : "#d1fae5"}
                            color={course.isPremium ? "#d97706" : "#059669"}>
                            {course.isPremium ? '👑 PRO' : '✓ Free'}
                          </Badge>
                          <HStack gap={2} justify="center">
                            <Button size="sm" bg="#ede9fe" color="#7c3aed" borderRadius="lg" px={3} fontWeight="bold" gap={1} _hover={{ bg: '#ddd6fe' }} onClick={() => openEditModal(course)}>
                              <Edit size={14} /> Sửa
                            </Button>
                            <Button size="sm" bg="#fee2e2" color="#dc2626" borderRadius="lg" px={3} fontWeight="bold" gap={1} _hover={{ bg: '#fecaca' }} onClick={() => handleDeleteCourse(course.id, course.title)}>
                              <Trash2 size={14} /> Xóa
                            </Button>
                          </HStack>
                        </Grid>
                      ))}
                      {filteredCourses.length === 0 && (
                        <Center py={16} flexDirection="column" gap={3}>
                          <BookOpen size={40} color="#d1d5db" />
                          <Text fontWeight="bold" color="gray.300">Chưa có lộ trình nào</Text>
                        </Center>
                      )}
                    </VStack>
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
        {activeTab === 'QUESTS' && (
          <Box
            bg="white"
            borderRadius="3xl"
            p={6}
            shadow="sm"
          >
            <Flex
              justify="space-between"
              align="center"
              mb={6}
            >
              <Box>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  🎯 Quest Dashboard
                </Text>

                <Text color="gray.500">
                  Theo dõi tiến độ người dùng
                </Text>
              
                <SimpleGrid columns={4} gap={4} mb={6}>
                  <Box bg="blue.50" p={4} borderRadius="xl">
                    <Text fontSize="xs" color="gray.500">
                      Người dùng
                    </Text>

                    <Text fontSize="2xl" fontWeight="bold">
                      {users.length}
                    </Text>
                  </Box>

                  <Box bg="green.50" p={4} borderRadius="xl">
                    <Text fontSize="xs" color="gray.500">
                      Quest đang hoạt động
                    </Text>

                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      4
                    </Text>
                  </Box>

                  <Box bg="orange.50" p={4} borderRadius="xl">
                    <Text fontSize="xs" color="gray.500">
                      Hệ thống
                    </Text>

                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      Daily
                    </Text>
                  </Box>

                  <Box bg="purple.50" p={4} borderRadius="xl">
                    <Text fontSize="xs" color="gray.500">
                      Trạng thái
                    </Text>

                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                      Online
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            
              <Badge
                colorPalette="purple"
                px={3}
                py={1}
                borderRadius="full"
              >
                {users.length} Users
              </Badge>
            </Flex>
            <Input
                  placeholder="🔍 Tìm kiếm theo tên người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  mb={4}
                  borderRadius="xl"
                />
            <VStack gap={4} align="stretch">            
              {users.filter((u) =>
                (u.name || "")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                (u.email || "")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              ).map((u) => (
                    
                <Flex
                  key={u.id}
                  justify="space-between"
                  align="center"
                  p={4}
                  borderRadius="xl"
                  bg="gray.50"
                  _hover={{
                    bg: "purple.50",
                    transform: "translateY(-2px)",
                  }}
                  transition="all .2s"
                >
                  <Box>
                    <Text fontWeight="bold">
                      {u.name || "No Name"}
                    </Text>

                    <Text
                      fontSize="sm"
                      color="gray.500"
                    >
                      {u.email}
                    </Text>
                  </Box>

                  <Button
                    colorPalette="purple"
                    onClick={() => openQuestModal(u)}
                  >
                    Xem Quest
                  </Button>
                </Flex>
              ))}
            </VStack>
          </Box>
          
        )}
        {/* QUEST MODAL */}
        {isQuestModalOpen && (
          <Flex
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            zIndex={10000}
            align="center"
            justify="center"
            bg="rgba(0,0,0,0.5)"
            backdropFilter="blur(4px)"
            onClick={() => setIsQuestModalOpen(false)}
          >
            <Box
              bg="white"
              borderRadius="2xl"
              w="full"
              maxW="650px"
              mx={4}
              shadow="2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <Box bg="linear-gradient(135deg,#6366f1,#8b5cf6)" px={6} py={5}>
                <Text fontSize="lg" fontWeight="black" color="white">
                  📊 Quest - {selectedUser?.name || selectedUser?.email}
                </Text>
              </Box>

              <Box p={6}>
                {isLoadingDetail ? (
                  <Center py={10}><Spinner /></Center>
                ) : (
                  <>
                    {/* STATS */}
                    <SimpleGrid columns={3} gap={4} mb={6}>
                      <Box
                        bg="blue.50"
                        p={4}
                        borderRadius="xl"
                        textAlign="center"
                      >
                        <Text fontSize="xs" color="gray.500">
                          Tổng Quest
                        </Text>

                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                        >
                          {userQuests.length}
                        </Text>
                      </Box>

                      <Box
                        bg="green.50"
                        p={4}
                        borderRadius="xl"
                        textAlign="center"
                      >
                        <Text fontSize="xs" color="gray.500">
                          Hoàn thành
                        </Text>

                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.500"
                        >
                          {userQuests.filter(q => q.isCompleted).length}
                        </Text>
                      </Box>

                      <Box
                        bg="orange.50"
                        p={4}
                        borderRadius="xl"
                        textAlign="center"
                      >
                        <Text fontSize="xs" color="gray.500">
                          Huy hiệu
                        </Text>

                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="orange.500"
                        >
                          {userBadges.length}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* PROGRESS */}
                    <Box mb={6}>
                      <Flex justify="space-between" mb={2}>
                        <Text fontWeight="bold">
                          Tiến độ hôm nay
                        </Text>

                        <Text
                          fontWeight="bold"
                          color="green.500"
                        >
                          {Math.round(
                            (userQuests.filter(q => q.isCompleted).length /
                              (userQuests.length || 1)) *
                              100
                          )}
                          %
                        </Text>
                      </Flex>

                      <Box bg="gray.100" h="12px" borderRadius="full">
                        <Box
                          h="100%"
                          bg="green.400"
                          borderRadius="full"
                          w={`${percent}%`}
                          transition="0.3s"
                        />
                      </Box>
                    </Box>

                    {/* QUESTS */}
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      mb={3}
                    >
                      🎯 Nhiệm vụ
                    </Text>

                    <VStack
                      gap={3}
                      align="stretch"
                      maxH="280px"
                      overflowY="auto"
                      mb={6}
                    >
                      {userQuests.map((q) => (
                        <Box
                          key={q.id}
                          p={4}
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor={
                            q.isCompleted
                              ? "green.200"
                              : "gray.200"
                          }
                          bg={
                            q.isCompleted
                              ? "green.50"
                              : "white"
                          }
                        >
                          <Flex justify="space-between">
                            <Box>
                              <Text fontWeight="bold">
                                {q.label || q.questType}
                              </Text>

                              <Text
                                fontSize="sm"
                                color="gray.500"
                              >
                                {q.current}/{q.target}
                              </Text>
                            </Box>

                            <Badge
                              colorScheme={
                                q.isCompleted
                                  ? "green"
                                  : "gray"
                              }
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {q.isCompleted
                                ? `+${q.rewardCoins} xu`
                                : "Đang làm"}
                            </Badge>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>

                    {/* BADGES */}
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      mb={3}
                    >
                      🏅 Huy hiệu
                    </Text>

                    <SimpleGrid columns={2} gap={3}>
                      {userBadges.map((b) => (
                        <Box
                          key={b.id}
                          p={3}
                          borderRadius="xl"
                          bg="orange.50"
                          borderWidth="1px"
                          borderColor="orange.100"
                        >
                          <Text fontWeight="bold">
                            {b.icon || "🏅"}{" "}
                            {b.label || b.badgeType}
                          </Text>

                          <Text
                            fontSize="xs"
                            color="gray.500"
                            mt={1}
                          >
                            {new Date(
                              b.earnedAt
                            ).toLocaleDateString("vi-VN")}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </>
                )}
              </Box>
            </Box>
          </Flex>
        )}

      {/* CUSTOM MODAL - không dùng DialogRoot để tránh bug */}
      {isCourseModalOpen && (
        <Flex 
          position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={10000} 
          align="center" justify="center" bg="rgba(0,0,0,0.5)" backdropFilter="blur(4px)" 
          onClick={() => setIsCourseModalOpen(false)}
        >
          <Box bg="white" borderRadius="2xl" w="full" maxW="500px" mx={4} overflow="hidden" shadow="2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <Box background="linear-gradient(135deg,#6366f1,#8b5cf6)" px={6} py={5} position="relative">
              <Text fontSize="xl" fontWeight="black" color="white">
                {isEditing ? "✏️ Chỉnh sửa lộ trình" : "✨ Tạo lộ trình mới"}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                {isEditing ? "Cập nhật thông tin lộ trình học" : "Thêm lộ trình mới vào hệ thống"}
              </Text>
              <Flex as="button" position="absolute" top={4} right={4} w={8} h={8} borderRadius="full" bg="whiteAlpha.300" align="center" justify="center" color="white" _hover={{ bg: "whiteAlpha.400" }} onClick={() => setIsCourseModalOpen(false)}>
                <X size={16} />
              </Flex>
            </Box>
            {/* Body */}
            <VStack gap={4} align="stretch" p={6}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Tên lộ trình <Text as="span" color="red.400">*</Text></Text>
                <Input placeholder="VD: 3000 Từ Vựng TOEIC" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} borderRadius="xl" h={10} _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #a78bfa' }} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Mô tả</Text>
                <Input placeholder="Mô tả ngắn về lộ trình..." value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} borderRadius="xl" h={10} _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #a78bfa' }} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Danh mục <Text as="span" color="red.400">*</Text></Text>
                <Input placeholder="VD: TOEIC, IELTS, THPT..." value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} borderRadius="xl" h={10} _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #a78bfa' }} />
              </Box>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Độ khó (1-5)</Text>
                  <HStack gap={2}>
                    {[1,2,3,4,5].map(n => (
                      <Flex key={n} as="button" w={9} h={9} borderRadius="xl" align="center" justify="center" fontWeight="black" fontSize="sm" transition="all 0.2s"
                        bg={courseForm.difficulty === n ? DIFF_COLORS[n] : "gray.100"}
                        color={courseForm.difficulty === n ? "white" : "gray.500"}
                        onClick={() => setCourseForm({...courseForm, difficulty: n})}>{n}</Flex>
                    ))}
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Quyền truy cập</Text>
                  <Flex as="button" w="full" h={10} borderRadius="xl" align="center" justify="center" gap={2} fontWeight="bold" fontSize="sm" transition="all 0.2s"
                    bg={courseForm.isPremium ? "#fef3c7" : "#d1fae5"} color={courseForm.isPremium ? "#d97706" : "#059669"}
                    borderWidth="2px" borderColor={courseForm.isPremium ? "#fcd34d" : "#6ee7b7"}
                    onClick={() => setCourseForm({...courseForm, isPremium: !courseForm.isPremium})}>
                    {courseForm.isPremium ? <><Crown size={16} /> Bắt buộc PRO</> : <><CheckCircle size={16} /> Miễn phí</>}
                  </Flex>
                </Box>
              </Grid>
              <Button w="full" background="linear-gradient(135deg,#6366f1,#8b5cf6)" color="white" borderRadius="xl" h={12} fontWeight="black" fontSize="md" _hover={{ opacity: 0.9 }} shadow="md" onClick={handleSaveCourse}>
                {isEditing ? "LƯU THAY ĐỔI" : "TẠO LỘ TRÌNH"}
              </Button>
            </VStack>
          </Box>
        </Flex>
      )}
    </Box>
  );
}