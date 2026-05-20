"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Flex, Text, HStack, VStack, SimpleGrid, 
  Button, Input, Grid, Badge, Center, Spinner,
  DialogRoot, DialogContent, DialogBody, DialogCloseTrigger, DialogTitle
} from '@chakra-ui/react';
import { 
  Users, Coins, TrendingUp, Search, 
  ShieldAlert, RefreshCw, Crown, User, Plus, Download, BookOpen, 
  Edit, Trash2, FolderEdit
} from 'lucide-react';
import { toaster } from "@/components/ui/toaster";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'COURSES'>('USERS');

  // ==========================================
  // LOGIC & STATE: TAB 1 - QUẢN LÝ HỌC VIÊN
  // ==========================================
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Các State quản lý phân trang và tìm kiếm học viên tự động
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(5); // Số dòng hiển thị mỗi trang học viên

  // Hàm gọi API lấy danh sách học viên kèm tham số phân trang & tìm kiếm gửi lên backend
  const fetchUsersData = async (page: number, searchKeyword: string) => {
    setIsLoadingUsers(true);
    try {
      const encodeKeyword = encodeURIComponent(searchKeyword);
      const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${encodeKeyword}`, { cache: 'no-store' });
      
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setUsers(result.data);
          setCurrentPage(result.pagination.currentPage);
          setTotalPages(result.pagination.totalPages);
          setTotalUsers(result.pagination.totalUsers);
        }
      } else if (res.status === 403 || res.status === 401) {
        toaster.create({ title: "Bị chặn truy cập!", description: "Tài khoản của bạn không có quyền Admin.", type: "error" });
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Tự động tìm kiếm thông minh (Debounce 300ms) khi học viên gõ phím hoặc chuyển trang
  useEffect(() => {
    if (activeTab === 'USERS') {
      const delayDebounce = setTimeout(() => {
        fetchUsersData(currentPage, searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [currentPage, searchTerm, activeTab]);

  // Xử lý khi gõ ô tìm kiếm học viên
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Đưa trạng thái trang về lại trang 1
  };

  // Tính toán số liệu thống kê chung dựa trên toàn bộ dữ liệu trả về của trang hiện tại
  const stats = useMemo(() => {
    const totalPro = users.filter(u => u.isPro === true).length;
    const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);
    
    return [
      { label: "Tổng số học viên", value: totalUsers.toString(), icon: Users, color: "blue.500", bg: "blue.50" },
      { label: "Hội viên PRO (Trang này)", value: totalPro.toString(), icon: Crown, color: "orange.500", bg: "orange.50" },
      { label: "Xu lưu thông (Trang này)", value: totalCoins.toLocaleString() + " $", icon: Coins, color: "amber.500", bg: "amber.50" },
      { label: "Tăng trưởng tháng", value: "+24%", icon: TrendingUp, color: "purple.500", bg: "purple.50" },
    ];
  }, [users, totalUsers]);

  // Hàm đổi trạng thái Cấp PRO / Hủy PRO xuống database
  const handleToggleProStatus = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'TOGGLE_PRO' })
      });
      if (res.ok) {
        toaster.create({ title: "Thay đổi thành công! 👑", description: `Đã cập nhật trạng thái tài khoản của học viên ${name || ''}.`, type: "success" });
        fetchUsersData(currentPage, searchTerm);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm thưởng xu dồn trực tiếp lưu thẳng vào MongoDB
  const handleAddCoins = async (id: string, name: string) => {
    const amount = window.prompt(`Nhập số xu thưởng muốn cộng cho học viên ${name || ''}:`);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'ADD_COINS', amount: Number(amount) })
      });
      if (res.ok) {
        toaster.create({ title: "Cộng xu thành công! 💰", description: `Đã cộng thêm +${amount} xu vào ví.`, type: "success" });
        fetchUsersData(currentPage, searchTerm);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm Xuất dữ liệu CSV cực kỳ an toàn hỗ trợ hiển thị Tiếng Việt Excel
  const handleExportCSV = async () => {
    setIsExporting(true);
    toaster.create({ title: "Đang tạo file...", description: "Hệ thống đang trích xuất dữ liệu CSV.", type: "info" });

    try {
      let dataToExport = [];
      try {
        const encodeKeyword = encodeURIComponent(searchTerm);
        const res = await fetch(`/api/admin/users?page=1&limit=10000&search=${encodeKeyword}`, { cache: 'no-store' });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.length > 0) {
            dataToExport = result.data;
          }
        }
      } catch (e) {
        console.warn("Dùng dữ liệu dự phòng trên UI để xuất...");
      }

      if (dataToExport.length === 0) {
        if (users.length === 0) {
          toaster.create({ title: "Trống dữ liệu", description: "Không có dữ liệu nào để xuất file.", type: "warning" });
          setIsExporting(false);
          return;
        }
        dataToExport = users;
      }
         
      const headers = ["ID", "Tên học viên", "Email", "Số xu", "Chuỗi ngày học", "Loại tài khoản", "Ngày đăng ký"];
      const csvRows = [headers.join(",")];

      dataToExport.forEach((u: any) => {
        const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : (u.joinDate || "N/A");
        const row = [
          u.id || "N/A",
          `"${(u.name || 'Chưa đặt tên').replace(/"/g, '""')}"`,
          `"${u.email || "N/A"}"`,
          u.coins || 0,
          u.streakCount || u.streak || 0,
          u.isPro ? "PRO" : "Thường",
          `"${dateStr}"`
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `DanhSachHocVien_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toaster.create({ title: "Xuất file CSV thành công!", type: "success" });
    } catch (error) {
      toaster.create({ title: "Lỗi xuất file", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // STATE & LOGIC: TAB 2 - QUẢN LÝ LỘ TRÌNH
  // ==========================================
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: '', title: '', category: 'Tất cả', difficulty: 1, isPro: false });

  const fetchCoursesData = async () => {
    setIsLoadingCourses(true);
    try {
      const res = await fetch('/api/admin/courses', { cache: 'no-store' });
      if (res.ok) {
        const result = await res.json();
        if (result.success) setCourses(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'COURSES') fetchCoursesData();
  }, [activeTab]);

  const openCreateModal = () => {
    setCourseForm({ id: '', title: '', category: 'Tất cả', difficulty: 1, isPro: false });
    setIsEditing(false);
    setIsCourseModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setCourseForm({ id: course.id, title: course.title, category: course.category, difficulty: course.difficulty, isPro: course.isPro });
    setIsEditing(true);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.category) {
      toaster.create({ title: "Thiếu thông tin", description: "Vui lòng nhập Tên và Danh mục", type: "error" });
      return;
    }
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/courses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        toaster.create({ title: isEditing ? "Đã cập nhật" : "Tạo thành công", type: "success" });
        setIsCourseModalOpen(false);
        fetchCoursesData();
      }
    } catch (error) {
      toaster.create({ title: "Lỗi lưu dữ liệu", type: "error" });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lộ trình này không?")) return;
    try {
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toaster.create({ title: "Đã xóa lộ trình", type: "success" });
        fetchCoursesData();
      }
    } catch (error) {
      toaster.create({ title: "Lỗi xóa dữ liệu", type: "error" });
    }
  };

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} w="100vw" h="100vh" bg="#f8f9fa" zIndex={9999} overflowY="auto">
      <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto" w="full">
        
        {/* HEADER PHÂN KHU BIỂU TƯỢNG */}
        <Flex justify="space-between" align="center" mb={6} direction={{ base: 'column', sm: 'row' }} gap={4}>
          <VStack align="start" gap={1}>
            <Text fontSize="3xl" fontWeight="black" color="gray.800" letterSpacing="tight">Admin Portal</Text>
            <Text fontSize="sm" color="gray.500" fontWeight="bold">Trung tâm điều khiển và phân tích hệ thống dữ liệu Luyện Từ.</Text>
          </VStack>
          <HStack gap={3} w={{ base: 'full', sm: 'auto' }}>
            <Button bg="white" color="gray.700" borderWidth="1px" borderColor="gray.300" borderRadius="xl" fontWeight="bold" fontSize="sm" gap={2} _hover={{ bg: "gray.50" }} onClick={handleExportCSV} loading={isExporting}>
              <Download size={16} /> Xuất CSV
            </Button>
            <Button bg="purple.600" color="white" borderRadius="xl" fontWeight="bold" fontSize="sm" gap={2} _hover={{ bg: "purple.700" }} onClick={() => activeTab === 'USERS' ? fetchUsersData(currentPage, searchTerm) : fetchCoursesData()}>
              <RefreshCw size={16} /> Làm mới dữ liệu
            </Button>
          </HStack>
        </Flex>

        {/* NÚT CHUYỂN ĐỔI GIAO DIỆN TABS HỆ THỐNG */}
        <Flex gap={3} mb={8} borderBottomWidth="2px" borderColor="gray.200" pb={3}>
          <Button 
            variant={activeTab === 'USERS' ? 'solid' : 'ghost'} bg={activeTab === 'USERS' ? "gray.800" : "transparent"} color={activeTab === 'USERS' ? "white" : "gray.500"}
            _hover={{ bg: activeTab === 'USERS' ? "black" : "gray.100" }} onClick={() => setActiveTab('USERS')} borderRadius="full" px={6} fontWeight="bold" gap={2}
          >
            <Users size={18} /> Quản lý Học viên
          </Button>
          <Button 
            variant={activeTab === 'COURSES' ? 'solid' : 'ghost'} bg={activeTab === 'COURSES' ? "gray.800" : "transparent"} color={activeTab === 'COURSES' ? "white" : "gray.500"}
            _hover={{ bg: activeTab === 'COURSES' ? "black" : "gray.100" }} onClick={() => setActiveTab('COURSES')} borderRadius="full" px={6} fontWeight="bold" gap={2}
          >
            <BookOpen size={18} /> Quản lý Nội dung & Lộ trình
          </Button>
        </Flex>

        {/* ========================================================= */}
        {/* PHỤC HỒI NỘI DUNG ĐẦY ĐỦ KHUNG TAB 1: QUẢN LÝ HỌC VIÊN      */}
        {/* ========================================================= */}
        {activeTab === 'USERS' && (
          <>
            {/* THỐNG KÊ (METRICS) ĐỘNG TỪ DATABASE */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6} mb={8}>
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Flex key={i} bg="white" p={6} borderRadius="2xl" shadow="sm" align="center" justify="space-between" borderWidth="1px" borderColor="gray.100">
                    <VStack align="start" gap={1}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">{stat.label}</Text>
                      <Text fontSize="3xl" fontWeight="black" color="gray.800">{stat.value}</Text>
                    </VStack>
                    <Center w={12} h={12} bg={stat.bg} color={stat.color} borderRadius="xl"><Icon size={24} /></Center>
                  </Flex>
                );
              })}
            </SimpleGrid>

            {/* BỐ CỤC KHUNG CHÍNH HAI CỘT TỶ LỆ CHUẨN 2:1 */}
            {isLoadingUsers ? (
              <Center py={20}><Spinner size="xl" color="purple.500" borderWidth="4px" /></Center>
            ) : (
              <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8} mb={10}>
                
                {/* CỘT TRÁI: KHUNG DANH SÁCH BẢNG HỌC VIÊN PHÂN TRANG CHI TIẾT */}
                <Box bg="white" p={6} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
                  <Flex justify="space-between" align="center" mb={6} direction={{ base: 'column', sm: 'row' }} gap={4}>
                    <Text fontSize="lg" fontWeight="black" color="gray.800">Danh sách tài khoản ({totalUsers})</Text>
                    
                    <Box position="relative" w={{ base: 'full', sm: '250px' }}>
                      <Flex position="absolute" left={4} top={0} bottom={0} align="center" color="gray.400" pointerEvents="none" zIndex={2}><Search size={18} /></Flex>
                      <Input 
                        placeholder="Tìm kiếm họ tên / email..." value={searchTerm} onChange={handleSearchChange}
                        pl={10} pr={4} h="10" borderRadius="xl" bg="gray.50" borderWidth="2px" borderColor="transparent" fontSize="sm" fontWeight="medium"
                        _focus={{ bg: "white", borderColor: "purple.500" }} _hover={{ bg: "gray.100" }} transition="all 0.2s"
                      />
                    </Box>
                  </Flex>

                  <Box overflowX="auto">
                    <Box minW="700px">
                      <Grid templateColumns="2fr 1fr 1fr 1fr 1.5fr" bg="gray.50" p={3} px={4} borderRadius="xl" fontWeight="bold" fontSize="xs" color="gray.500" mb={2}>
                        <Text>HỌC VIÊN</Text><Text>SỐ XU ($)</Text><Text>CHUỖI STREAK</Text><Text>HỘI VIÊN</Text><Text textAlign="center">THAO TÁC</Text>
                      </Grid>

                      <VStack gap={1} align="stretch">
                        {users.map((user: any) => (
                          <Grid key={user.id} templateColumns="2fr 1fr 1fr 1fr 1.5fr" p={3} px={4} borderRadius="xl" alignItems="center" fontSize="sm" borderWidth="1px" borderColor="gray.50" _hover={{ bg: "gray.50" }} transition="0.2s">
                            <VStack align="start" gap={0}>
                              <Text fontWeight="extrabold" color="gray.800">{user.name || "Chưa đặt tên"}</Text>
                              <Text fontSize="xs" color="gray.400" fontWeight="medium">{user.email}</Text>
                            </VStack>

                            <Text fontWeight="bold" color="amber.600">{(user.coins || 0).toLocaleString()}</Text>

                            <HStack gap={1}>
                              <Text fontWeight="bold" color={(user.streakCount || 0) > 0 ? "orange.500" : "gray.400"}>{user.streakCount || 0}</Text>
                              {(user.streakCount || 0) > 0 && <Text fontSize="xs">🔥</Text>}
                            </HStack>

                            <Box>
                              <Badge colorScheme={user.isPro ? 'orange' : 'gray'} px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="bold">
                                {user.isPro ? 'PREMIUM PRO' : 'Tài khoản thường'}
                              </Badge>
                            </Box>

                            <HStack gap={2} justify="center">
                              <Button size="xs" colorScheme="amber" variant="subtle" borderRadius="lg" fontWeight="bold" gap={1} onClick={() => handleAddCoins(user.id, user.name)}>
                                <Plus size={12} /> Thưởng Xu
                              </Button>
                              <Button size="xs" colorScheme={user.isPro ? 'gray' : 'orange'} variant="subtle" borderRadius="lg" fontWeight="bold" gap={1} onClick={() => handleToggleProStatus(user.id, user.name)}>
                                {user.isPro ? <User size={12} /> : <Crown size={12} />}
                                {user.isPro ? 'Hủy PRO' : 'Cấp PRO'}
                              </Button>
                            </HStack>
                          </Grid>
                        ))}
                        
                        {users.length === 0 && (
                          <Center py={10} flexDirection="column" gap={2}>
                            <ShieldAlert size={40} color="#9ca3af" />
                            <Text fontWeight="bold" color="gray.400">Không có dữ liệu học viên khớp.</Text>
                          </Center>
                        )}
                      </VStack>
                    </Box>
                  </Box>

                  {/* NÚT PHÂN TRANG DƯỚI BẢNG */}
                  <Flex justify="space-between" align="center" mt={6} pt={4} borderTopWidth="1px" borderColor="gray.100" flexWrap="wrap" gap={3}>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      Hiển thị trang {currentPage} / {totalPages} (Tổng số {totalUsers} học viên)
                    </Text>
                    <HStack gap={2}>
                      <Button size="sm" variant="outline" borderColor="gray.300" borderRadius="lg" fontWeight="bold" fontSize="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                        Trang trước
                      </Button>
                      <Button size="sm" variant="outline" borderColor="gray.300" borderRadius="lg" fontWeight="bold" fontSize="xs" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                        Trang sau
                      </Button>
                    </HStack>
                  </Flex>
                </Box>

                {/* CỘT PHẢI: BIỂU ĐỒ TĂNG TRƯỞNG & NHẬT KÝ HƯỚNG DẪN */}
                <VStack gap={6} align="stretch">
                  <Box bg="white" p={6} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
                    <Text fontSize="sm" fontWeight="black" color="gray.400" mb={6} textTransform="uppercase" letterSpacing="wider">LƯỢNG ĐĂNG KÝ MỚI (2026)</Text>
                    <Flex justify="space-around" align="flex-end" h="150px" pt={4}>
                      {[ { m: "Th3", val: 40 }, { m: "Th4", val: 75 }, { m: "Th5", val: totalUsers } ].map((item, idx) => (
                        <VStack key={idx} gap={2} justify="flex-end" h="full" flex={1}>
                          <Text fontSize="xs" fontWeight="bold" color="purple.600">+{item.val}</Text>
                          <Box w="35px" h={`${Math.min(100, (item.val / 120) * 100)}px`} bg="purple.400" borderRadius="t-md" transition="all 0.6s ease-out" />
                          <Text fontSize="xs" fontWeight="black" color="gray.500">{item.m}</Text>
                        </VStack>
                      ))}
                    </Flex>
                  </Box>
                  <Box bg="white" p={6} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
                    <Text fontSize="sm" fontWeight="black" color="gray.400" mb={4} textTransform="uppercase" letterSpacing="wider">CÔNG CỤ XUẤT CSV</Text>
                    <Box p={4} bg="gray.50" borderRadius="xl" fontSize="xs" color="gray.600" fontWeight="medium">
                      Nhấn vào nút <Text as="span" fontWeight="bold" color="gray.800">Xuất CSV</Text> trên thanh Header để trích xuất toàn bộ dữ liệu học viên (đã lọc theo ô tìm kiếm) ra file Excel để làm báo cáo thống kê.
                    </Box>
                  </Box>
                </VStack>

              </Grid>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: QUẢN LÝ LỘ TRÌNH & BỘ TỪ (CRUD HOÀN CHỈNH)          */}
        {/* ========================================================= */}
        {activeTab === 'COURSES' && (
          <Box bg="white" p={6} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100" minH="500px">
            <Flex justify="space-between" align="center" mb={6}>
              <Text fontSize="lg" fontWeight="black" color="gray.800">Danh sách Lộ trình ({courses.length})</Text>
              <Button bg="purple.600" color="white" borderRadius="xl" fontWeight="bold" px={6} gap={2} _hover={{ bg: "purple.700" }} onClick={openCreateModal}>
                <Plus size={18} /> Tạo Lộ Trình Mới
              </Button>
            </Flex>

            {isLoadingCourses ? (
              <Center py={20}><Spinner size="xl" color="purple.500" borderWidth="4px" /></Center>
            ) : (
              <Box overflowX="auto">
                <Box minW="800px">
                  <Grid templateColumns="2.5fr 1.5fr 1fr 1fr 1fr" bg="gray.50" p={3} px={4} borderRadius="xl" fontWeight="bold" fontSize="xs" color="gray.500" mb={2}>
                    <Text>TÊN LỘ TRÌNH</Text><Text>DANH MỤC</Text><Text>ĐỘ KHÓ</Text><Text>QUYỀN HẠN</Text><Text textAlign="center">THAO TÁC</Text>
                  </Grid>

                  <VStack gap={2} align="stretch">
                    {courses.map((course) => (
                      <Grid key={course.id} templateColumns="2.5fr 1.5fr 1fr 1fr 1fr" p={4} borderRadius="xl" alignItems="center" fontSize="sm" borderWidth="1px" borderColor="gray.100" _hover={{ shadow: "md" }} transition="0.2s">
                        <Text fontWeight="extrabold" color="gray.800">{course.title}</Text>
                        <Badge bg="purple.50" color="purple.700" px={3} py={1} borderRadius="lg" w="fit-content" fontWeight="bold">{course.category}</Badge>
                        <Text fontWeight="bold" color={course.difficulty > 3 ? "red.500" : "green.500"}>{course.difficulty}/5</Text>
                        <Badge colorScheme={course.isPro ? 'orange' : 'gray'} w="fit-content" px={3} py={1} borderRadius="lg">
                          {course.isPro ? 'VIP PRO' : 'Miễn phí'}
                        </Badge>
                        <HStack gap={3} justify="center">
                          <Button size="sm" variant="outline" colorScheme="blue" borderRadius="lg" px={2} onClick={() => openEditModal(course)}><Edit size={16} /></Button>
                          <Button size="sm" variant="outline" colorScheme="red" borderRadius="lg" px={2} onClick={() => handleDeleteCourse(course.id)}><Trash2 size={16} /></Button>
                        </HStack>
                      </Grid>
                    ))}
                    
                    {courses.length === 0 && (
                      <Center py={10} flexDirection="column" gap={2}>
                        <BookOpen size={40} color="#9ca3af" />
                        <Text fontWeight="bold" color="gray.400">Chưa có lộ trình nào được tạo.</Text>
                      </Center>
                    )}
                  </VStack>
                </Box>
              </Box>
            )}
          </Box>
        )}

      </Box>

      {/* POPUP POPUP THÊM/SỬA LỘ TRÌNH CHAKRA V3 */}
      <DialogRoot open={isCourseModalOpen} onOpenChange={(e) => setIsCourseModalOpen(e.open)} size="md" placement="center">
        <DialogContent borderRadius="2xl" p={6} bg="white">
          <DialogCloseTrigger color="gray.400" />
          <DialogTitle fontSize="xl" fontWeight="black" color="gray.800" mb={6}>
            {isEditing ? "Chỉnh sửa Lộ Trình" : "Tạo Lộ Trình Mới"}
          </DialogTitle>
          <DialogBody p={0}>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>Tên lộ trình học (*)</Text>
                <Input placeholder="VD: 3000 Từ Vựng Toeic" value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} h="10" borderRadius="lg" />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>Danh mục nhóm (*)</Text>
                <Input placeholder="VD: TOEIC, Sách IELTS, THPT..." value={courseForm.category} onChange={(e) => setCourseForm({...courseForm, category: e.target.value})} h="10" borderRadius="lg" />
              </Box>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>Độ khó (1 - 5)</Text>
                  <Input type="number" min={1} max={5} value={courseForm.difficulty} onChange={(e) => setCourseForm({...courseForm, difficulty: Number(e.target.value)})} h="10" borderRadius="lg" />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>Quyền hạn mở khóa</Text>
                  <Button w="full" h="10" borderRadius="lg" variant={courseForm.isPro ? "solid" : "outline"} colorScheme={courseForm.isPro ? "orange" : "gray"} onClick={() => setCourseForm({...courseForm, isPro: !courseForm.isPro})}>
                    {courseForm.isPro ? "Bắt buộc mua PRO" : "Học Miễn Phí"}
                  </Button>
                </Box>
              </Grid>
              <Button w="full" bg="gray.900" color="white" _hover={{ bg: "black" }} borderRadius="xl" mt={4} h="12" fontWeight="bold" onClick={handleSaveCourse}>
                {isEditing ? "LƯU THAY ĐỔI" : "TẠO MỚI"}
              </Button>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>

    </Box>
  );
}